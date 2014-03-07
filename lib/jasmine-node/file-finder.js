(function() {
  var createSpecObj, find, fs, path, sortFiles, walkdir;

  walkdir = require('walkdir');

  path = require('path');

  fs = require('fs');

  createSpecObj = function(path, root) {
    return {
      path: function() {
        return path;
      },
      relativePath: function() {
        return path.replace(root, '').replace(/^[\/\\]/, '').replace(/\\/g, '/');
      },
      directory: function() {
        return path.replace(/[\/\\][\s\w\.-]*$/, "").replace(/\\/g, '/');
      },
      relativeDirectory: function() {
        return relativePath().replace(/[\/\\][\s\w\.-]*$/, "").replace(/\\/g, '/');
      },
      filename: function() {
        return path.replace(/^.*[\\\/]/, '');
      }
    };
  };

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
            _results.push(specs.push(createSpecObj(wannaBeSpec)));
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
      return a.path().localeCompare(b.path());
    });
    return specs;
  };

  module.exports = {
    find: find,
    sortFiles: sortFiles
  };

}).call(this);
