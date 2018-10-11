function scanForDependencies(obj, deps) {
  deps = deps || {};
  if (typeof obj !== 'object') {
    return deps;
  }
  Object.keys(obj).forEach(function (key) {
    if (key === 'dependencies') {
      var dependencies = obj.dependencies;
      Object.keys(dependencies).forEach(function (key) {
        var depName = key;
        var version = dependencies[key];
        if (typeof version === 'object') {
          version = version.version;
        }
        if (typeof version === 'undefined') {
          version = 'unknown';
        } else {
          version = version.toString();
        }
        deps[depName] = version;
      });
    } else {
      scanForDependencies(obj[key], deps);
    }
  });
  return deps;
}

module.exports = {
  parse: function parseJsonManifest(fileContent) {
    var rawContent = JSON.parse(fileContent);
    var result = {};
    result.dependencies = scanForDependencies(rawContent, {});
    if (typeof rawContent.project === 'object') {
      var pData = rawContent.project;
      var name = (pData.restore && pData.restore.projectName);
      result.project = {
        version: pData.version || '0.0.0',
      };
      if (name) {
        result.project.name = name;
      }
    }
    return result;
  },
};
