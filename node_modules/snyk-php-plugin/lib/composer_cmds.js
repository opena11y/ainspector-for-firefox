var childProcess = require('child_process');
var path = require('path');

function cmdReturnsOk(cmd) {
  return cmd && childProcess.spawnSync(cmd, {shell:true}).status === 0;
}

// run a cmd in a specific folder and it's result should be there
function execWithResult(cmd, basePath) {
  return childProcess.execSync(cmd, {cwd: basePath}).toString();
}


module.exports = {
  pharCmd: 'php ' + path.resolve(path.resolve() + '/composer.phar') +
    ' show -p --format=json',
  composerCmd: 'composer --version',
  composerShowCmd: 'composer show -p',
  execWithResult: execWithResult,
  cmdReturnsOk: cmdReturnsOk,
};
