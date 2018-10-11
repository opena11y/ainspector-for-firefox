var _ = require('lodash');
var cmds = require('./composer_cmds.js');

function isSet(variable) {
  return typeof variable !== 'undefined';
}

function systemDeps(basePath, options) {
  var composerOk = isSet(options.composerIsFine) ?
    options.composerIsFine : cmds.cmdReturnsOk(cmds.composerCmd);
  var composerPharOk = isSet(options.composerPharIsFine) ?
    options.composerPharIsFine : cmds.cmdReturnsOk(cmds.pharCmd);

  var finalVersionsObj = {};

  if (options.systemVersions &&
    (Object.keys(options.systemVersions).length > 0)) {
    // give first preference to a stub
    finalVersionsObj = options.systemVersions;
  } else if (composerOk) {
    var lines = cmds.execWithResult(cmds.composerShowCmd, basePath).split('\n');
    lines.forEach(function(line) {
      var parts = line.split(/\s+/);
      if (parts.length > 1) {
        finalVersionsObj[parts[0]] = parts[1];
      }
    });
  } else if (composerPharOk) {
    var output = cmds.execWithResult(cmds.pharCmd, basePath);
    var versionsObj = JSON.parse(output).platform;
    _.forEach(versionsObj, function(value) {
      finalVersionsObj[value.name] = value.version;
    });
  } else {
    // TODO: we want to tell the user we are not reporting accurately system
    // versions, so some version information may not be exact
  }
  return finalVersionsObj;
}

module.exports = {
  systemDeps: systemDeps,
};
