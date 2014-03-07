(function() {
  var baseArgv, child_process, fs, gaze, lastRunSuccessful, path, runEverything, runExternal, start, walkdir, _;

  _ = require('underscore');

  child_process = require('child_process');

  fs = require('fs');

  gaze = require('gaze');

  path = require('path');

  walkdir = require('walkdir');

  baseArgv = _.without(process.argv, "--autoTest");

  lastRunSuccessful = false;

  runExternal = function(command, args, callback) {
    var child;
    child = child_process.spawn(command, args);
    child.stdout.on('data', function(data) {
      return process.stdout.write(data);
    });
    child.stderr.on('data', function(data) {
      return process.stderr.write(data);
    });
    if (_.isFunction(callback)) {
      child.on('exit', callback);
    }
  };

  runEverything = function() {
    var argv;
    argv = [].concat(baseArgv);
    runExternal(argv.shift(), argv, function(code) {
      lastRunSuccessful = code === 0;
    });
  };

  start = function(loadPaths, watchFolders, patterns) {
    var loadPath, loadPathFunc, watchPatterns, _i, _len;
    watchPatterns = null;
    loadPathFunc = function(loadPath) {
      var changedFunc, onChanged, stats;
      stats = fs.statSync(loadPath);
      if (stats.isFile()) {
        watchPatterns = loadPath;
      } else {
        watchPatterns = patterns.map(function(p) {
          return path.join(loadPath, p);
        });
      }
      changedFunc = function(event, file) {
        var argv, match;
        console.log("" + file + " was changed");
        match = path.basename(file, path.extname(file)) + ".*";
        match = match.replace(new RegExp("spec", "i"), "");
        argv = [].concat(baseArgv, ["--match", match]);
        return runExternal(argv.shift(), argv, function(code) {
          if (code === 0) {
            if (!lastRunSuccessful) {
              runEverything();
            }
          } else {
            lastRunSuccessful = false;
          }
        });
      };
      onChanged = _.debounce(changedFunc, 2500, true);
      return gaze(watchPatterns, function(err, watcher) {
        console.log("Watching for changes in " + loadPath);
        this.on('all', onChanged);
      });
    };
    for (_i = 0, _len = loadPaths.length; _i < _len; _i++) {
      loadPath = loadPaths[_i];
      loadPathFunc(loadPath);
    }
    watchFolders.forEach(function(watchPath) {
      var onChanged, stats;
      stats = fs.statSync(watchPath);
      if (stats.isFile()) {
        watchPatterns = watchPath;
      } else {
        watchPatterns = patterns.map(function(p) {
          return path.join(watchPath, p);
        });
      }
      onChanged = _.debounce(runEverything, 2500, true);
      return gaze(watchPatterns, function(err, watcher) {
        console.log("Watching for changes in " + watchPath);
        this.on('all', onChanged);
      });
    });
    return runEverything();
  };

  module.exports = {
    start: start
  };

}).call(this);
