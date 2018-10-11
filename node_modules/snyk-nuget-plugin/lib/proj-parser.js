const fs = require('fs');
const path = require('path');
const parseXML = require('xml2js').parseString;
const debug = require('debug')('snyk');
const _ = require('lodash');

function determineDotnetVersions(rootDir) {
  debug('Looking for your .csproj file in ' + rootDir);
  const csprojPath = findFile(rootDir, /.*\.csproj$/);
  if (!csprojPath) {
    throw new Error('.csproj file not found in ' + rootDir + '. ' +
      'Make sure project was built before running `snyk test`');
  }
  debug('Checking .net framework version in .csproj file ' + csprojPath);

  const csprojContents = fs.readFileSync(csprojPath);

  var frameworks = [];
  parseXML(csprojContents, function (err, parsedCsprojContents) {
    if (err) {
      throw err;
    }
    const versionLoc = _.get(parsedCsprojContents, 'Project.PropertyGroup[0]');
    const versions = _.compact(_.concat([],
      _.get(versionLoc, 'TargetFrameworkVersion[0]') ||
      _.get(versionLoc, 'TargetFramework[0]') ||
      _.get(versionLoc, 'TargetFrameworks[0]', '').split(';')));

    if (versions.length < 1) {
      throw new Error('Could not find TargetFrameworkVersion/TargetFramework' +
        '/TargetFrameworks defined in the Project.PropertyGroup field of ' +
        'your .csproj file');
    }
    frameworks = _.compact(_.map(versions, toReadableVersion));
  });
  if (frameworks.length < 1) {
    throw new Error('Could not find valid/supported .NET version');
  }
  return frameworks;
}

function toReadableVersion(version) {
  const typeMapping = {
    v: '.NETFramework',
    net: '.NETFramework',
    netstandard: '.NETStandard',
    netcoreapp: '.NETCore',
  };

  for (var type in typeMapping) {
    if (new RegExp(type + /\d.?\d(.?\d)?$/.source).test(version)) {
      return {
        framework: typeMapping[type],
        version: version.split(type)[1],
      };
    }
  }
}

function findFile(rootDir, filter) {
  if (!fs.existsSync(rootDir)) {
    throw new Error('No such path: ' + rootDir);
  }
  const files = fs.readdirSync(rootDir);
  for (var i = 0; i < files.length; i++) {
    var filename = path.resolve(rootDir, files[i]);

    if (filter.test(filename)) {
      return filename;
    }
  }
}

module.exports = determineDotnetVersions;
