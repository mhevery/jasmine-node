(function() {
  var allowed, args, coffee, dir, error, exitCode, fs, growl, help, jasmine, key, matcher, minimist, minimistOpts, onExit, options, path, printVersion, spec, specFolder, util, value, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  path = require('path');

  fs = require('fs');

  minimist = require('minimist');

  coffee = require('coffee-script/register');

  _ = require('underscore');

  jasmine = require('./jasmine-loader');

  help = function() {
    process.stdout.write("USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory\n\nOptions:\n  --autoTest         - rerun automatically the specs when a file changes\n  --watch PATH       - when used with --autoTest, watches the given path(s) and runs all tests if a change is detected\n  --noColor          - do not use color coding for output\n  -m, --match REGEXP - load only specs containing \"REGEXPspec\"\n  --matchAll         - relax requirement of \"spec\" in spec file names\n  --verbose          - print extra information per each test run\n  --growl            - display test run summary in a growl notification (in addition to other outputs)\n  --coffee           - load coffee-script which allows execution .coffee files\n  --forceExit        - force exit once tests complete.\n  --captureExceptions- listen to global exceptions, report them and exit (interferes with Domains)\n  --noStackTrace     - suppress the stack trace generated from a test failure\n  --version          - show the current version\n  -h, --help         - display this help and exit");
    return process.exit(-1);
  };

  printVersion = function() {
    console.log("1.13.1");
    return process.exit(0);
  };

  jasmine.setTimeout = jasmine.getGlobal().setTimeout;

  jasmine.setInterval = jasmine.getGlobal().setInterval;

  for (key in jasmine) {
    value = jasmine[key];
    global[key] = value;
  }

  exitCode = 0;

  growl = false;

  minimistOpts = {
    boolean: ["autoTest", "captureExceptions", "coffee", "forceExit", "growl", "h", "help", "matchAll", "noColor", "noStackTrace", "verbose"],
    string: ["m", "match", "watch"],
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
      verbose: false
    }
  };

  args = minimist(process.argv.slice(2), minimistOpts);

  for (key in args) {
    allowed = __indexOf.call(minimistOpts.boolean, key) >= 0;
    allowed = __indexOf.call(minimistOpts.string, key) >= 0 || allowed;
    allowed = key === '_' || allowed;
    if (!allowed) {
      console.warn("" + key + " was not a valid option");
      help();
    }
  }

  options = {
    specFolders: [],
    watchFolders: [],
    extensions: "js"
  };

  options = _.defaults(options, args);

  if (!process.stdout.isTTY) {
    options.noColor = true;
  }

  if (args.version != null) {
    printVersion();
  }

  if (args.coffee) {
    options.extensions += "|coffee|litcoffee";
  }

  if (args.testDir != null) {
    if (!fs.existsSync(args.testDir)) {
      throw new Error("Test root path '" + dir + "' doesn't exist!");
    }
    options.specFolders.push(args.testDir);
  }

  if (args.watch != null) {
    if (!_.isArray(args.watch)) {
      args.watch = [args.watch];
    }
    _ref = args.watch;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dir = _ref[_i];
      if (!fs.existsSync(dir)) {
        throw new Error("Watch path '" + dir + "' doesn't exist!");
      }
      options.watchFolders.push(dir);
    }
  }

  if (args.h) {
    help();
  }

  _ref1 = args._;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    spec = _ref1[_j];
    if (spec.match(/^\/.*/)) {
      options.specFolders.push(spec);
    } else {
      options.specFolders.push(path.join(process.cwd(), spec));
    }
  }

  if (_.isEmpty(options.specFolders)) {
    help();
  }

  _ref2 = options.specFolders;
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    spec = _ref2[_k];
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
    }
    require('./autotest').start(options.specFolders, options.watchFolders, options.patterns);
    return;
  }

  if (options.captureExceptions) {
    process.on('uncaughtException', function(error) {
      var _ref3;
      console.error((_ref3 = error.stack) != null ? _ref3 : error);
      exitCode = 1;
      process.exit(exitCode);
    });
  }

  onExit = function() {
    process.removeListener("exit", onExit);
    process.exit(exitCode);
  };

  process.on("exit", onExit);

  options.onComplete = function(runner, log) {
    process.stdout.write("\n");
    if (runner.results().failedCount === 0) {
      exitCode = 0;
    } else {
      exitCode = 1;
    }
    if (options.forceExit) {
      return process.exit(exitCode);
    }
  };

  _ref3 = options.specFolders;
  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
    specFolder = _ref3[_l];
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

}).call(this);
