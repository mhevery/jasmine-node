(function() {
  var autoTest, coffee, exitCode, fs, help, jasmine, minimist, minimistOpts, onExit, parseArgs, path, printVersion, runSpecs, util, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  path = require('path');

  fs = require('fs');

  minimist = require('minimist');

  coffee = require('coffee-script/register');

  _ = require('underscore');

  jasmine = require('./jasmine-loader');

  autoTest = require('./auto-test');

  minimistOpts = {
    boolean: ["autoTest", "captureExceptions", "coffee", "debug", "forceColor", "growl", "h", "help", "junit", "nunit", "matchAll", "noColor", "noStackTrace", "verbose", "version"],
    string: ["reporterConfig", "m", "match", "watchFolders"],
    alias: {
      match: "m",
      help: "h"
    },
    "default": {
      autoTest: false,
      captureExceptions: false,
      coffee: false,
      debug: false,
      extensions: "js",
      forceColor: false,
      growl: false,
      junit: false,
      match: '.',
      matchAll: false,
      noColor: false,
      noStackTrace: false,
      nunit: false,
      onComplete: function() {},
      reporterConfig: '',
      specFolders: [],
      verbose: false,
      watchFolders: []
    }
  };

  exitCode = 0;

  printVersion = function() {
    console.log("2.0.0-beta4");
    process.exit(0);
  };

  help = function() {
    process.stdout.write("USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory\n\nOptions:\n  --autoTest               -  rerun automatically the specs when a file changes\n  --captureExceptions      -  listen to global exceptions, report them and exit (interferes with Domains)\n  --coffee                 -  load coffee-script which allows execution .coffee files\n  --growl                  -  display test run summary in a growl notification (in addition to other outputs)\n  --help, -h               -  display this help and exit\n  --junit                  -  use the junit reporter\n  --match, -m REGEXP       -  load only specs containing \"REGEXPspec\"\n  --matchAll               -  relax requirement of \"spec\" in spec file names\n  --noColor                -  do not use color coding for output\n  --noStackTrace           -  suppress the stack trace generated from a test failure\n  --nunit                  -  use the nunit reporter\n  --reporterConfig <file>  -  configuration json file to use with jasmine-reporters [nunit, junit]\n  --verbose                -  print extra information per each test run\n  --version                -  show the current version\n  --watch PATH             -  when used with --autoTest, watches the given path(s) and runs all tests if a change is detected");
    process.exit(-1);
  };

  onExit = function() {
    var _ref;
    process.removeListener("exit", onExit);
    if ((_ref = global.jasmineResult) != null ? _ref.fail : void 0) {
      exitCode = 1;
    }
    process.exit(exitCode);
  };

  parseArgs = function() {
    var allowed, config, key, options, secretOptions, spec, _i, _len, _ref;
    options = minimist(process.argv.slice(2), minimistOpts);
    for (key in options) {
      allowed = __indexOf.call(minimistOpts.boolean, key) >= 0;
      allowed = __indexOf.call(minimistOpts.string, key) >= 0 || allowed;
      secretOptions = ['_', 'specFolders', 'extensions', 'onComplete'];
      allowed = __indexOf.call(secretOptions, key) >= 0 || allowed;
      if (!allowed) {
        console.warn("" + key + " was not a valid option");
        help();
      }
    }
    if (!(process.stdout.isTTY || options.forceColor)) {
      options.noColor = true;
    }
    if (options.version) {
      printVersion();
    }
    if (options.coffee) {
      options.extensions += "|coffee|litcoffee";
    }
    if (options.watchFolders != null) {
      if (!_.isArray(options.watchFolders)) {
        options.watchFolders = [options.watchFolders];
      }
    }
    if (options.h) {
      help();
    }
    _ref = options._;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      spec = _ref[_i];
      if (spec.match(/^\/.*/)) {
        options.specFolders.push(spec);
      } else {
        options.specFolders.push(path.join(process.cwd(), spec));
      }
    }
    if (options.reporterConfig !== '') {
      if (!fs.existsSync(options.reporterConfig)) {
        console.error("Reporter Config File Doesn't Exist");
        help();
      }
      config = fs.readFileSync(options.reporterConfig, 'utf8');
      options.reporterConfigOpts = JSON.parse(config);
    }
    if (_.isEmpty(options.specFolders)) {
      help();
    }
    return options;
  };

  runSpecs = function(config) {
    var dir, error, func, helper, key, matcher, options, spec, specFolder, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;
    options = _.clone(config);
    if (options.debug) {
      console.log(options);
    }
    _.defaults(options, minimistOpts["default"]);
    if (_.isArray(global.loadedHelpers)) {
      _ref = global.loadedHelpers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        helper = _ref[_i];
        delete global[helper];
      }
      delete global['loadedHelpers'];
    }
    if (_.isObject(global.savedFunctions)) {
      _ref1 = global.savedFunctions;
      for (key in _ref1) {
        func = _ref1[key];
        global[key] = func;
      }
      delete global['savedFunctions'];
    }
    _ref2 = options.watchFolders;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      dir = _ref2[_j];
      if (fs.existsSync(dir)) {
        continue;
      }
      console.error("Watch path '" + dir + "' doesn't exist!");
      return;
    }
    _ref3 = options.specFolders;
    for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
      spec = _ref3[_k];
      if (fs.existsSync(spec)) {
        continue;
      }
      console.error("File: " + spec + " is missing.");
      return;
    }
    if (options.autoTest) {
      options.patterns = ['**/*.js'];
      if (options.extensions.indexOf("coffee") !== -1) {
        options.patterns.push('**/*.coffee');
        options.patterns.push('**/*.litcoffee');
      }
      autoTest.start(options.specFolders, options.watchFolders, options.patterns);
      return;
    }
    if (options.captureExceptions) {
      process.on('uncaughtException', function(error) {
        var _ref4;
        console.error((_ref4 = error.stack) != null ? _ref4 : error);
        exitCode = 1;
        process.exit(exitCode);
      });
    }
    process.on("exit", onExit);
    _ref4 = options.specFolders;
    for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
      specFolder = _ref4[_l];
      jasmine.loadHelpersInFolder(specFolder, new RegExp("helpers?\\.(" + options.extensions + ")$", 'i'));
    }
    try {
      matcher = "";
      if (options.match !== minimistOpts["default"].match) {
        matcher = options.match;
      } else if (options.matchAll) {
        matcher = "" + options.match + "(" + options.extensions + ")$";
      } else {
        matcher = "" + options.match + "spec\\.(" + options.extensions + ")$";
      }
      options.regExpSpec = new RegExp(matcher, "i");
    } catch (_error) {
      error = _error;
      console.error("Failed to build spec-matching regex: " + error);
      process.exit(2);
    }
    jasmine.executeSpecsInFolder(options);
  };

  module.exports = {
    defaults: minimistOpts["default"],
    runSpecs: runSpecs,
    parseArgs: parseArgs
  };

}).call(this);
