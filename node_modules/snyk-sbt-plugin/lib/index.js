var path = require('path');
var subProcess = require('./sub-process');
var parser = require('./parse-sbt');
var packageFormatVersion = 'mvn:0.0.1';

module.exports = {
  inspect: inspect,
};

module.exports.__tests = {
  buildArgs: buildArgs,
};

function inspect(root, targetFile, options) {
  if (!options) {
    options = {dev: false};
  }
  var sbtArgs = buildArgs(root, targetFile, options.args);
  return subProcess.execute('sbt', sbtArgs, {cwd: root})
    .then(function (result) {
      var packageName = path.basename(root);
      var packageVersion = '0.0.0';
      var depTree = parser.parse(result, packageName, packageVersion);
      depTree.packageFormatVersion = packageFormatVersion;

      return {
        plugin: {
          name: 'bundled:sbt',
          runtime: 'unknown',
        },
        package: depTree,
      };
    })
    .catch(function (error) {
      error.message = error.message + '\n\n' +
        'Please make sure that the `sbt-dependency-graph` plugin ' +
        '(https://github.com/jrudolph/sbt-dependency-graph) is installed ' +
        'globally or on the current project, and that ' +
        '`sbt ' + sbtArgs.join(' ') + '` executes successfully ' +
        'on this project.\n\n' +
        'If the problem persists, collect the output of ' +
        '`sbt ' + sbtArgs.join(' ') + '` and contact support@snyk.io\n';
      throw error;
    });
}

function buildArgs(root, targetFile, sbtArgs) {
  var args = ['-Dsbt.log.noformat=true']; // force plain output
  if (sbtArgs) {
    args = args.concat(sbtArgs);
  }
  args.push('dependencyTree');
  return args;
}
