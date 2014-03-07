(function() {
  var autoTest, coffee, exitCode, fs, help, jasmine, key, minimist, minimistOpts, onExit, parseArgs, path, printVersion, runSpecs, util, value, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  path = require('path');

  fs = require('fs');

  minimist = require('minimist');

  coffee = require('coffee-script/register');

  _ = require('underscore');

  jasmine = require('./jasmine-loader');

  autoTest = require('./auto-test');

  for (key in jasmine) {
    value = jasmine[key];
    global[key] = value;
  }

  minimistOpts = {
    boolean: ["autoTest", "captureExceptions", "coffee", "forceExit", "growl", "h", "help", "matchAll", "noColor", "noStackTrace", "verbose", "version"],
    string: ["m", "match", "watchFolders"],
    alias: {
      match: "m",
      help: "h"
    },
    "default": {
      autoTest: false,
      captureExceptions: false,
      coffee: false,
      forceExit: false,
      growl: false,
      match: '.',
      matchAll: false,
      noColor: false,
      noStackTrace: false,
      verbose: false,
      watchFolders: [],
      specFolders: [],
      extensions: "js"
    }
  };

  exitCode = 0;

  printVersion = function() {
    console.log("2.0.0");
    process.exit(0);
  };

  help = function() {
    process.stdout.write("USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory\n\nOptions:\n  --autoTest         - rerun automatically the specs when a file changes\n  --watch PATH       - when used with --autoTest, watches the given path(s) and runs all tests if a change is detected\n  --noColor          - do not use color coding for output\n  -m, --match REGEXP - load only specs containing \"REGEXPspec\"\n  --matchAll         - relax requirement of \"spec\" in spec file names\n  --verbose          - print extra information per each test run\n  --growl            - display test run summary in a growl notification (in addition to other outputs)\n  --coffee           - load coffee-script which allows execution .coffee files\n  --forceExit        - force exit once tests complete.\n  --captureExceptions- listen to global exceptions, report them and exit (interferes with Domains)\n  --noStackTrace     - suppress the stack trace generated from a test failure\n  --version          - show the current version\n  -h, --help         - display this help and exit");
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
    var allowed, options, spec, _i, _len, _ref;
    options = minimist(process.argv.slice(2), minimistOpts);
    for (key in options) {
      allowed = __indexOf.call(minimistOpts.boolean, key) >= 0;
      allowed = __indexOf.call(minimistOpts.string, key) >= 0 || allowed;
      allowed = (key === '_' || key === 'specFolders' || key === 'extensions') || allowed;
      if (!allowed) {
        console.warn("" + key + " was not a valid option");
        help();
      }
    }
    if (!process.stdout.isTTY) {
      options.noColor = true;
    }
    if (options.version) {
      printVersion();
    }
    if (options.coffee) {
      options.extensions += "|coffee|litcoffee";
    }
    if (options.testDir != null) {
      if (!fs.existsSync(options.testDir)) {
        throw new Error("Test root path '" + dir + "' doesn't exist!");
      }
      options.specFolders.push(options.testDir);
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
    if (_.isEmpty(options.specFolders)) {
      help();
    }
    return options;
  };

  runSpecs = function(options) {
    var dir, error, matcher, spec, specFolder, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    _ref = options.watchFolders;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dir = _ref[_i];
      if (fs.existsSync(dir)) {
        continue;
      }
      console.error("Watch path '" + dir + "' doesn't exist!");
      return;
    }
    _ref1 = options.specFolders;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      spec = _ref1[_j];
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
        var _ref2;
        console.error((_ref2 = error.stack) != null ? _ref2 : error);
        exitCode = 1;
        process.exit(exitCode);
      });
    }
    process.on("exit", onExit);
    _ref2 = options.specFolders;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      specFolder = _ref2[_k];
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
