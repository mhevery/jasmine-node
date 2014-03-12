(function() {
  var find, fs, path, sortFiles, walkdir;

  fs = require('fs');

  path = require('path');

  walkdir = require('walkdir');

  find = function(loadpaths, matcher) {
    var specs, wannaBeSpecs;
    wannaBeSpecs = [];
    specs = [];
    loadpaths.forEach(function(loadpath) {
      var basename, isInNodeModules, relative, wannaBeSpec, _i, _len, _results;
      wannaBeSpecs = walkdir.sync(loadpath, {
        follow_symlinks: true
      });
      _results = [];
      for (_i = 0, _len = wannaBeSpecs.length; _i < _len; _i++) {
        wannaBeSpec = wannaBeSpecs[_i];
        try {
          if (!fs.statSync(wannaBeSpec).isFile()) {
            continue;
          }
          relative = path.relative(loadpath, wannaBeSpec);
          basename = path.basename(wannaBeSpec);
          isInNodeModules = /.*node_modules.*/.test(relative);
          if (matcher.test(basename) && !isInNodeModules) {
            _results.push(specs.push(wannaBeSpec));
          } else {
            _results.push(void 0);
          }
        } catch (_error) {}
      }
      return _results;
    });
    return specs;
  };

  sortFiles = function(specs) {
    specs.sort(function(a, b) {
      return a.localeCompare(b);
    });
    return specs;
  };

  module.exports = {
    find: find,
    sortFiles: sortFiles
  };

}).call(this);
