var fs = require('fs');
var path = require('path');
var toml = require('toml');
var graphlib = require('graphlib');
var tmp = require('tmp');

var subProcess = require('./sub-process');

module.exports = {
  inspect: inspect,
};

var VIRTUAL_ROOT_NODE_ID = '.';

function inspect(root, targetFile) {


  return Promise.all([
    getMetaData(root, targetFile),
    getDependencies(root, targetFile),
  ])
    .then(function (result) {
      return {
        plugin: result[0],
        package: result[1],
      };
    });
}

function getMetaData(root, targetFile) {
  return subProcess.execute('go', ['version'], {cwd: root})
    .then(function (output) {
      var runtime;
      var versionMatch = /(go\d+\.?\d+?\.?\d*)/.exec(output);
      if (versionMatch) {
        runtime = versionMatch[0];
      }

      return {
        name: 'snyk-go-plugin',
        runtime: runtime,
        targetFile: pathToPosix(targetFile),
      };
    });
}

// Hack:
// We're using Zeit assets feature in order to support Python and Go testing
// within a binary release. By doing "path.join(__dirname, 'PATH'), Zeit adds
// PATH file auto to the assets. Sadly, Zeit doesn't support (as far as I
// understand) adding a full folder as an asset, and this is why we're adding
// the required files this way. In addition, Zeit doesn't support
// path.resolve(), and this is why I'm using path.join()
function createAssets(){
  var assets = [];
  assets.push(path.join(__dirname, '../gosrc/resolve-deps.go'));
  assets.push(path.join(__dirname, '../gosrc/resolver/pkg.go'));
  assets.push(path.join(__dirname, '../gosrc/resolver/resolver.go'));
  assets.push(path.join(__dirname, '../gosrc/resolver/dirwalk/dirwalk.go'));
  assets.push(path.join(__dirname, '../gosrc/resolver/graph/graph.go'));

  return assets;
}

function writeFile(writeFilePath, contents) {
  var dirPath = path.dirname(writeFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  fs.writeFileSync(writeFilePath, contents);
}

function getFilePathRelativeToDumpDir(filePath) {
  var pathParts = filePath.split('\\gosrc\\');

  // Windows
  if (pathParts.length > 1) {
    return pathParts[1];
  }

  // Unix
  pathParts = filePath.split('/gosrc/');
  return pathParts[1];
}

function dumpAllResolveDepsFilesInTempDir(tempDirName) {
  createAssets().forEach(function(currentReadFilePath) {
    if (!fs.existsSync(currentReadFilePath)) {
      throw new Error('The file `' + currentReadFilePath + '` is missing');
    }

    var relFilePathToDumpDir =
      getFilePathRelativeToDumpDir(currentReadFilePath);

    var writeFilePath = path.join(tempDirName, relFilePathToDumpDir);

    var contents = fs.readFileSync(currentReadFilePath);
    writeFile(writeFilePath, contents);
  });
}

function getDependencies(root, targetFile) {
  var config;
  var tempDirObj;
  return new Promise(function (resolve) {
    config = parseConfig(root, targetFile);
    resolve(config);
  }).then(function () {
    tempDirObj = tmp.dirSync({
      unsafeCleanup: true,
    });

    dumpAllResolveDepsFilesInTempDir(tempDirObj.name);

    var goResolveTool =
      path.join(tempDirObj.name, 'resolve-deps.go');
    var ignorePkgsParam;
    if (config.ignoredPkgs && config.ignoredPkgs.length > 0) {
      ignorePkgsParam = '-ignoredPkgs=' + config.ignoredPkgs.join(',');
    }
    return subProcess.execute(
      'go',
      ['run', goResolveTool, ignorePkgsParam],
      {cwd: root}
    );
  }).then(function (graph) {
    tempDirObj.removeCallback();
    graph = JSON.parse(graph);
    graph = graphlib.json.read(graph);

    if (!graphlib.alg.isAcyclic(graph)) {
      throw new Error(
        'Go import cycle detected (not allowed by the Go compiler)');
    }

    // A project can contain several "entry points",
    // i.e. pkgs with no local dependants.
    // To create a tree, we add edges from a "virutal root",
    // to these source nodes.
    var VIRTUAL_ROOT_NODE_ID = '.';
    var root = graph.node(VIRTUAL_ROOT_NODE_ID);
    if (!root) {
      throw new Error('Failed parsing dependency graph');
    }

    graph.sources().forEach(function (nodeId) {
      if (nodeId !== VIRTUAL_ROOT_NODE_ID) {
        graph.setEdge(VIRTUAL_ROOT_NODE_ID, nodeId);
      }
    });

    var projectRootPath = getProjectRootFromTargetFile(targetFile);

    var pkgsTree = recursivelyBuildPkgTree(
      graph, root, config.lockedVersions, projectRootPath, {});
    delete pkgsTree._counts;

    pkgsTree.packageFormatVersion = 'golang:0.0.1';

    return pkgsTree;
  }).catch(function (error) {
    tempDirObj.removeCallback();
    if (typeof error === 'string') {
      var unresolvedOffset = error.indexOf('Unresolved packages:');
      if (unresolvedOffset !== -1) {
        throw new Error(
          error.slice(unresolvedOffset) + '\n' +
          'Unresolved imports found, please run `' +
          syncCmdForTarget(targetFile) + '`');
      }
      throw new Error(error);
    }
    throw error;
  });
}

var PACKAGE_MANAGER_BY_TARGET = {
  'Gopkg.lock': 'dep',
  'vendor.json': 'govendor',
};

var VENDOR_SYNC_CMD_BY_PKG_MANAGER = {
  dep: 'dep ensure',
  govendor: 'govendor sync',
};

function pkgManagerByTarget(targetFile) {
  var fname = path.basename(targetFile);
  return PACKAGE_MANAGER_BY_TARGET[fname];
}

function syncCmdForTarget(targetFile) {
  return VENDOR_SYNC_CMD_BY_PKG_MANAGER[
    pkgManagerByTarget(targetFile)];
}

function getProjectRootFromTargetFile(targetFile) {
  var resolved = path.resolve(targetFile);
  var parts = resolved.split(path.sep);

  if (parts[parts.length - 1] === 'Gopkg.lock') {
    return path.dirname(resolved);
  }

  if (
    parts[parts.length - 1] === 'vendor.json' &&
    parts[parts.length - 2] === 'vendor') {
    return path.dirname(path.dirname(resolved));
  }

  throw new Error('Unsupported file: ' + targetFile);
}

function recursivelyBuildPkgTree(
  graph,
  node,
  lockedVersions,
  projectRootPath,
  counts
) {

  var isRoot = (node.Name === VIRTUAL_ROOT_NODE_ID);

  var isProjSubpkg = isProjSubpackage(node.Dir, projectRootPath);

  var pkg = {
    name: (isRoot ? node.FullImportPath : node.Name),
    dependencies: {},
  };
  if (!isRoot && isProjSubpkg) {
    pkg._isProjSubpkg = true;
  }

  if (isRoot || isProjSubpkg) {
    pkg.version = '';
  } else if (!lockedVersions[pkg.name]) {
    pkg.version = '';
    // TODO: warn or set to "?" ?
  } else {
    pkg.version = lockedVersions[pkg.name].version;
  }

  pkg._counts = {};

  var children = graph.successors(node.Name).sort();
  children.forEach(function (depName) {

    // We drop branches of overly common pkgs:
    // this looses some paths, but avoids explosion in result size
    if ((counts[depName] || 0) + (pkg._counts[depName] || 0)  > 10) {
      return;
    }

    var dep = graph.node(depName);

    var child = recursivelyBuildPkgTree(
      graph,
      dep,
      lockedVersions,
      projectRootPath,
      sumCounts(counts, pkg._counts)
    );

    pkg._counts = sumCounts(pkg._counts, child._counts);
    delete child._counts;

    if (child._isProjSubpkg) {
      Object.keys(child.dependencies).forEach(function (grandChildName) {
        // don't merge grandchild if already a child,
        // because it was traversed with higher counts and may be more partial
        if (!pkg.dependencies[grandChildName]) {
          pkg.dependencies[grandChildName] = child.dependencies[grandChildName];
        }
      });
    } else {
      // in case was already added via a grandchild
      if (!pkg.dependencies[child.name]) {
        pkg.dependencies[child.name] = child;
        pkg._counts[child.name] = (pkg._counts[child.name] || 0) + 1;
      }
    }
  });

  return pkg;
}

function sumCounts(a, b) {
  var sum = shallowCopyMap(a);

  for (var k in b) {
    sum[k] = (sum[k] || 0) + b[k];
  }

  return sum;
}

function shallowCopyMap(m) {
  var copy = {};

  for (var k in m) {
    copy[k] = m[k];
  }

  return copy;
}

function isProjSubpackage(pkgPath, projectRootPath) {
  if (pkgPath === projectRootPath) {
    return true;
  }

  var root = projectRootPath;
  root =
   (root[root.length - 1] === path.sep) ? root : (root + path.sep);

  if (pkgPath.indexOf(root) !== 0) {
    return false;
  }

  var pkgRelativePath = pkgPath.slice(root.length);
  if (pkgRelativePath.split(path.sep).indexOf('vendor') !== -1) {
    return false;
  }

  return true;
}

function parseConfig(root, targetFile) {
  var pkgManager = pkgManagerByTarget(targetFile);
  var config = {};
  switch (pkgManager) {
    case 'dep': {
      config = {
        ignoredPkgs: [],
        lockedVersions: {},
      };
      config.lockedVersions = parseDepLock(root, targetFile);
      var manifest = parseDepManifest(root, targetFile);
      config.ignoredPkgs = manifest.ignored;
      break;
    }
    case 'govendor': {
      config = parseGovendorJson(root, targetFile);
      break;
    }
    default: {
      throw new Error('Unsupported file: ' + targetFile);
    }
  }

  return config;
}

function parseDepLock(root, targetFile) {
  try {
    var lock = fs.readFileSync(path.join(root, targetFile));

    var lockJson = toml.parse(String(lock));

    var deps = {};
    lockJson.projects && lockJson.projects.forEach(function (proj) {
      var version = proj.version || ('#' + proj.revision);

      proj.packages.forEach(function (subpackageName) {
        var name =
          (subpackageName === '.' ?
            proj.name :
            proj.name + '/' + subpackageName);

        var dep = {
          name: name,
          version: version,
        };

        deps[dep.name] = dep;
      });
    });

    return deps;
  } catch (e) {
    throw (new Error('failed parsing ' + targetFile + ': ' + e.message));
  }
}

function parseDepManifest(root, targetFile) {
  var manifestDir = path.dirname(path.join(root, targetFile));
  var manifestPath = path.resolve(path.join(manifestDir, 'Gopkg.toml'));

  try {
    var manifestToml = fs.readFileSync(manifestPath);

    var manifestJson = toml.parse(String(manifestToml)) || {};

    manifestJson.ignored = manifestJson.ignored || [];

    return manifestJson;
  } catch (e) {
    throw (new Error('failed parsing Gopkg.toml: ' + e.message));
  }
}

// TODO: branch, old Version can be a tag too?
function parseGovendorJson(root, targetFile) {
  var config = {
    ignoredPkgs: [],
    lockedVersions: {},
  };
  try {
    var jsonStr = fs.readFileSync(path.join(root, targetFile));
    var gvJson = JSON.parse(jsonStr);

    var packages = gvJson.package || gvJson.Package;
    packages && packages.forEach(function (pkg) {
      var revision = pkg.revision || pkg.Revision || pkg.version || pkg.Version;

      var version = pkg.versionExact || ('#' + revision);

      var dep = {
        name: pkg.path,
        version: version,
      };

      config.lockedVersions[dep.name] = dep;
    });

    var ignores = gvJson.ignore || '';
    ignores.split(/\s/).filter(function (s) {
      // otherwise it's a build-tag rather than a pacakge
      return s.indexOf('/') !== -1;
    }).forEach(function (pkgName) {
      pkgName = pkgName.replace(/\/+$/, ''); // remove trailing /
      config.ignoredPkgs.push(pkgName);
      config.ignoredPkgs.push(pkgName + '/*');
    });

    return config;
  } catch (e) {
    throw (new Error('failed parsing ' + targetFile + ': ' + e.message));
  }
}

function pathToPosix(fpath) {
  var parts = fpath.split(path.sep);
  return parts.join(path.posix.sep);
}
