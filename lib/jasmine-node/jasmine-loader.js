(function() {
  var booter, fileFinder, fs, growlReporter, isWindowDefined, jasmineEnv, jasmineSrc, jasminejs, key, mkdirp, nodeReporters, path, print, removeJasmineFrames, util, value, vm, _;

  _ = require('underscore');

  fs = require('fs');

  growlReporter = require('jasmine-growl-reporter');

  mkdirp = require('mkdirp');

  path = require('path');

  util = require('util');

  vm = require('vm');

  fileFinder = require('./file-finder');

  booter = require('./jasmine/boot');

  nodeReporters = require('./reporter');

  isWindowDefined = global.window != null;

  if (!isWindowDefined) {
    global.window = {
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval
    };
  }

  jasminejs = __dirname + '/jasmine/jasmine-2.0.0.js';

  jasmineSrc = fs.readFileSync(jasminejs);

  vm.runInThisContext(jasmineSrc, jasminejs);

  jasmineEnv = booter.boot(global.window.jasmineRequire);

  jasmineEnv['jasmine'] = jasmineEnv;

  if (!isWindowDefined) {
    delete global.window;
  }

  jasmineEnv.TerminalReporter = nodeReporters.TerminalReporter;

  jasmineEnv.GrowlReporter = growlReporter;

  jasmineEnv.loadHelpersInFolder = function(folder, matcher) {
    var e, file, folderStats, help, helper, helpers, key, matchedHelpers, _i, _len;
    folderStats = fs.statSync(folder);
    if (folderStats.isFile()) {
      folder = path.dirname(folder);
    }
    matchedHelpers = fileFinder.find([folder], matcher);
    helpers = fileFinder.sortFiles(matchedHelpers);
    for (_i = 0, _len = helpers.length; _i < _len; _i++) {
      helper = helpers[_i];
      file = helper.path();
      try {
        helper = require(file.replace(/\.*$/, ""));
      } catch (_error) {
        e = _error;
        console.log("Exception loading helper: " + file);
        console.log(e);
        throw e;
      }
      for (key in helper) {
        help = helper[key];
        global[key] = help;
      }
    }
  };

  removeJasmineFrames = function(text) {
    var line, lines, _i, _len, _ref;
    if (text == null) {
      return;
    }
    lines = [];
    _ref = text.split(/\n/);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      if (line.indexOf(jasminejs) >= 0) {
        continue;
      }
      lines.push(line);
    }
    return lines.join("\n");
  };

  jasmineEnv.executeSpecsInFolder = function(options) {
    var defaults, error, funcName, jasFunc, jasmine, matchedSpecs, reporterOptions, spec, specsList, _i, _len;
    defaults = {
      regExpSpec: new RegExp(".(js)$", "i"),
      stackFilter: removeJasmineFrames
    };
    reporterOptions = _.defaults(options, defaults);
    jasmine = jasmineEnv.getEnv();
    for (funcName in jasmine) {
      jasFunc = jasmine[funcName];
      global[funcName] = jasFunc;
    }
    matchedSpecs = fileFinder.find(options.specFolders, options.regExpSpec);
    jasmine.addReporter(new jasmineEnv.TerminalReporter(reporterOptions));
    if (options.growl) {
      jasmine.addReporter(new jasmineEnv.GrowlReporter(options.growl));
    }
    specsList = fileFinder.sortFiles(matchedSpecs);
    if (_.isEmpty(specsList)) {
      console.error("\nNo Specs Matching " + options.regExpSpec + " Found");
      console.error("Consider using --matchAll or --match REGEXP");
    }
    for (_i = 0, _len = specsList.length; _i < _len; _i++) {
      spec = specsList[_i];
      delete require.cache[spec.path()];
      try {
        require(spec.path().replace(/\.\w+$/, ""));
      } catch (_error) {
        error = _error;
        console.log("Exception loading: " + (spec.path()));
        console.log(error);
        throw error;
      }
    }
    jasmine.execute();
  };

  print = function(str) {
    return process.stdout.write(util.format(str));
  };

  for (key in jasmineEnv) {
    value = jasmineEnv[key];
    exports[key] = value;
  }

  exports['setTimeout'] = jasmineEnv.getGlobal().setTimeout;

  exports['setInterval'] = jasmineEnv.getGlobal().setInterval;

}).call(this);
