var path = require('path');
var fs = require('fs');

function findFolder(dir) {
  var parts = dir.split(path.sep);
  var testPath;
  while (parts.length > 0) {
    testPath = path.join(parts.join(path.sep), 'packages');
    if (fs.existsSync(testPath)) {
      return testPath;
    }
    return false;
  }
}

module.exports = findFolder;
