var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function loadJsonFile(basePath, fileName) {
  var resolvedPath = path.join(basePath, fileName);
  var loadedFile = fs.readFileSync(resolvedPath).toString();
  return JSON.parse(loadedFile);
}

function getVersion(applicationDataObj) {
  // check for `version` property. may not exist
  var versionFound = _.get(applicationDataObj, 'version', '');
  // even if found, may be an alias, so check
  var availableAliases = _.get(applicationDataObj,
    'extra[\'branch-alias\']', []);
  // if the version matches the alias (either as is, or without 'dev-'),
  //   use the aliases version.
  // otherwise, use the version as is, and if not, the first found alias
  var firstAvailableAlias = _.findKey(_.invert(availableAliases), '0');
  return _.get(availableAliases, versionFound) ||
    _.get(_.invert(availableAliases),
      versionFound.replace('dev-', '')) && versionFound.replace('dev-', '') ||
        versionFound || firstAvailableAlias;
}

function alreadyAddedDep(arrayOfFroms, packageName) {
  return arrayOfFroms.filter( function(dep) {
    return dep.split('@').shift() === packageName;
  }).length > 0;
}

// recursive function to build dependencies
function buildDependencies(
  composerJsonObj, composerLockObjPackages, depObj, fromArr, systemVersions) {
  var requires = _.get(depObj, 'require');
  if (typeof requires === 'undefined') {
    return {};
  }
  var requiresKeys = Object.keys(requires);
  var baseObject = {};
  requiresKeys.forEach (function (depName) {
    var clonedFromArr = _.clone(fromArr);

    var depFoundVersion;
    // lets find if this dependency has an object in composer.lock
    var applicationData = _.find(composerLockObjPackages, {name: depName});
    if (applicationData) {
      depFoundVersion = getVersion(applicationData);
    } else {
      // here we use the version from the requires - not a locked version
      var composerJsonRequires = _.get(composerJsonObj, 'require');
      depFoundVersion =_.get(systemVersions, depName);
      depFoundVersion = depFoundVersion || _.get(composerJsonRequires, depName);
      depFoundVersion = depFoundVersion || _.get(requires, depName);
    }

    depFoundVersion = depFoundVersion.replace(/^v(\d)/, '$1');

    baseObject[depName] = {
      name: depName,
      version: depFoundVersion,
      dependencies: {},
    };

    if (!alreadyAddedDep(clonedFromArr, depName)) {
      clonedFromArr.push(depName + '@' + depFoundVersion);
      baseObject[depName].dependencies =
        buildDependencies(composerJsonObj, composerLockObjPackages,
          _.find(composerLockObjPackages, {name: depName}),
          clonedFromArr, systemVersions);
    }
  });
  return baseObject;
}

function generateJsonReport(
  basePath, fileName, composerJsonObj, composerLockObj, systemVersions) {
  var composerLockObjPackages = composerLockObj.packages;
  var applicationName = composerJsonObj.name || getDefaultProjectName(
    path.join(basePath, fileName)
  );
  var applicationVersion = getVersion(composerJsonObj) ||
    '0.0.0';

  var data = {
    plugin: {
      name: 'snyk-php-plugin',
      targetFile: fileName,
    },
    package: {
      name: applicationName,
      version: applicationVersion,
      packageFormatVersion: 'composer:0.0.1',
      dependencies: {},
    },
  };
  var fromArr = [applicationName + '@' + applicationVersion];
  data.package.dependencies = buildDependencies(composerJsonObj,
    composerLockObjPackages, composerJsonObj, fromArr, systemVersions);
  return data;
}

function getDefaultProjectName(manifestPath) {
  return path.dirname(
    path.resolve(manifestPath))
    .split(path.sep)
    .pop();
}

module.exports = {
  loadJsonFile: loadJsonFile,
  generateJsonReport: generateJsonReport,
};
