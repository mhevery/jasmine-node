(function() {
  var bootSrc, bootjs, fs, helperCollection, isWindowDefined, jasmine, jasmineSrc, jasminejs, key, mkdirp, nodeReporters, path, print, removeJasmineFrames, specs, util, value, vm, _;

  _ = require('underscore');

  fs = require('fs');

  mkdirp = require('mkdirp');

  path = require('path');

  util = require('util');

  vm = require('vm');

  nodeReporters = require('./reporter');

  specs = require('./spec-collection');

  helperCollection = require('./spec-collection');

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

  bootjs = __dirname + '/jasmine/boot.js';

  jasmineSrc = fs.readFileSync(jasminejs);

  bootSrc = fs.readFileSync(bootjs);

  vm.runInThisContext(jasmineSrc, jasminejs);

  jasmine = vm.runInThisContext("" + bootSrc + "\njasmine = window.jasmine;", bootjs);

  if (!isWindowDefined) {
    delete global.window;
  }

  jasmine.TerminalReporter = nodeReporters.TerminalReporter;

  jasmine.loadHelpersInFolder = function(folder, matcher) {
    var e, file, folderStats, help, helper, helpers, key, _i, _len;
    folderStats = fs.statSync(folder);
    if (folderStats.isFile()) {
      folder = path.dirname(folder);
    }
    helperCollection.load([folder], matcher);
    helpers = helperCollection.getSpecs();
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

  jasmine.executeSpecsInFolder = function(options) {
    var defaults, error, funcName, jasFunc, jasmineEnv, reporterOptions, spec, specsList, _i, _len;
    defaults = {
      regExpSpec: new RegExp(".(js)$", "i"),
      showColors: false,
      stackFilter: removeJasmineFrames
    };
    reporterOptions = _.defaults(options, defaults);
    jasmineEnv = jasmine.getEnv();
    for (funcName in jasmineEnv) {
      jasFunc = jasmineEnv[funcName];
      global[funcName] = jasFunc;
    }
    specs.load(options.specFolders, options.regExpSpec);
    jasmineEnv.addReporter(new jasmine.TerminalReporter(reporterOptions));
    specsList = specs.getSpecs();
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
    return jasmineEnv.execute();
  };

  print = function(str) {
    return process.stdout.write(util.format(str));
  };

  for (key in jasmine) {
    value = jasmine[key];
    exports[key] = value;
  }

}).call(this);
