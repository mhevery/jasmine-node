(function() {
  var find, fs, path, sortFiles, walkdir;

  fs = require('fs');

  path = require('path');

  walkdir = require('walkdir');

  find = function(loadpaths, matcher) {
    var fileTester, loadpath, specs, walkOpts, wannaBeSpecs, _i, _len;
    wannaBeSpecs = [];
    specs = [];
    walkOpts = {
      follow_symlinks: true,
      no_return: true
    };
    fileTester = function(filePath, stat) {
      var basename, isInNodeModules;
      try {
        if (!fs.statSync(filePath).isFile()) {
          return;
        }
      } catch (_error) {
        console.error("Couldn't stat file: " + filePath);
        return;
      }
      basename = path.basename(filePath);
      isInNodeModules = /.*node_modules.*/.test(filePath);
      if (matcher.test(basename) && !isInNodeModules) {
        specs.push(filePath);
      }
    };
    for (_i = 0, _len = loadpaths.length; _i < _len; _i++) {
      loadpath = loadpaths[_i];
      walkdir.sync(loadpath, walkOpts, fileTester);
    }
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
