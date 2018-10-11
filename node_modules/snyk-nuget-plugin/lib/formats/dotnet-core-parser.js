'use strict';
var Dependency = require('../dependency');
var debug = require('debug')('snyk');
var _ = require('lodash');

// TODO: any convention for global vars? (gFreqDeps)
let freqDeps = {};

function initFreqDepsDict() {
  freqDeps['Microsoft.NETCore.Platforms'] = false;
  freqDeps['Microsoft.NETCore.Targets'] = false;
  freqDeps['System.Runtime'] = false;
  freqDeps['System.IO'] = false;
  freqDeps['System.Text.Encoding'] = false;
  freqDeps['System.Threading.Tasks'] = false;
  freqDeps['System.Reflection'] = false;
  freqDeps['System.Globalization'] = false;
  freqDeps.dependencies = new Dependency('freqSystemDependencies', 0);
}

function convertFromPathSyntax(path) {
  let name = path.split('/').join('@'); // posix
  name = name.split('\\').join('@'); // windows
  return name;
}

function collectFlatList(targetObj) {
  const names = Object.keys(targetObj);
  return names.map(function (name) {
    name = convertFromPathSyntax(name);
    return name;
  });
}

function buildTreeRecursive(targetDeps, depName, parent, treeDepth) {
  const MAX_TREE_DEPTH = 40;
  if (treeDepth > MAX_TREE_DEPTH) {
    throw new Error('The depth of the tree is too big.');
  }

  let depResolvedName = '';
  let originalDepKey = '';

  debug(`${treeDepth}: Looking for '${depName}'`);
  const depNameLowerCase = depName.toLowerCase();
  const exists = Object.keys(targetDeps).some(function (currentDep) {
    let currentResolvedName = convertFromPathSyntax(currentDep);
    if (currentResolvedName.split('@')[0].toLowerCase() === depNameLowerCase) {
      depResolvedName = currentResolvedName;
      originalDepKey = currentDep;
      debug(`${treeDepth}: Found '${currentDep}'`);
      return true;
    }
  });

  if (!exists) {
    debug(`Failed to find '${depName}'`);
    return;
  }

  const depVersion = depResolvedName.split('@')[1];

  parent.dependencies[depName] =
    parent.dependencies[depName] || new Dependency(depName, depVersion);

  Object.keys(targetDeps[originalDepKey].dependencies || {}).forEach(
    function (currentDep) {
      if (currentDep in freqDeps) {
        if (freqDeps[currentDep]) {
          return;
        }

        buildTreeRecursive(targetDeps,
          currentDep,
          freqDeps.dependencies,
          0);
        freqDeps[currentDep] = true;
      } else {
        buildTreeRecursive(targetDeps,
          currentDep,
          parent.dependencies[depName],
          treeDepth + 1);
      }
    });
}


function getFrameworkObjToRun(manifest) {
  const frameworks = _.get(manifest, 'project.frameworks');
  if (!frameworks) {
    throw new Error('No frameworks were found in project.assets.json');
  }

  if (_.isEmpty(frameworks)) {
    throw new Error('0 frameworks were found in project.assets.json');
  }

  debug(`Available frameworks: '${Object.keys(frameworks)}'`);

  // not yet supporting multiple frameworks in the same assets file ->
  // taking only the first 1
  const selectedFrameworkKey = Object.keys(frameworks)[0];
  debug(`Selected framework: '${selectedFrameworkKey}'`);
  return frameworks[selectedFrameworkKey];
}


function getTargetObjToRun(manifest) {
  if (!manifest.targets) {
    throw new Error('No targets were found in project.assets.json');
  }

  if (_.isEmpty(manifest.targets)) {
    throw new Error('0 targets were found in project.assets.json');
  }

  debug(`Available targets: '${Object.keys(manifest.targets)}'`);

  let selectedTargetKey = Object.keys(manifest.targets)[0];
  debug(`Selected target: '${selectedTargetKey}'`);
  // not yet supporting multiple targets in the same assets file ->
  // taking only the first 1
  return manifest.targets[selectedTargetKey];
}


function parse(fileContent, packageTree) {
  const manifest = JSON.parse(fileContent);

  if (!manifest.project) {
    throw new Error('Project field was not found in project.assets.json');
  }

  if (manifest.project.version) {
    packageTree.version = manifest.project.version;
  }

  const selectedFrameworkObj = getFrameworkObjToRun(manifest);
  const selectedTargetObj = getTargetObjToRun(manifest);

  initFreqDepsDict();

  const directDependencies = collectFlatList(selectedFrameworkObj.dependencies);
  debug(`directDependencies: '${directDependencies}'`);

  directDependencies.forEach(function (directDep) {
    debug(`First order dep: '${directDep}'`);
    buildTreeRecursive(selectedTargetObj, directDep, packageTree, 0);
  });

  if (!_.isEmpty(freqDeps.dependencies.dependencies)) {
    packageTree.dependencies['freqSystemDependencies'] = freqDeps.dependencies;
  }
  // to disconnect the object references inside the tree
  // JSON parse/stringify is used
  let pathedTree = JSON.parse(JSON.stringify(packageTree.dependencies));
  packageTree.dependencies = pathedTree;
}

module.exports = parse;
