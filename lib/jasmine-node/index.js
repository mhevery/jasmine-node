var fs = require('fs');
var mkdirp = require('mkdirp');
var vm = require('vm');
var _ = require('underscore');
var util;
try {
  util = require('util')
} catch(e) {
  util = require('sys')
}

var path = require('path');

var jasminejs = __dirname + '/jasmine-2.0.0.js';
var bootjs    = __dirname + '/boot.js';
var consolejs = __dirname + '/console.js';

var isWindowUndefined = typeof global.window === 'undefined';
if (isWindowUndefined != null) {
  global.window = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
  };
}

var jasmineSrc = fs.readFileSync(jasminejs);
var bootSrc    = fs.readFileSync(bootjs);
var consoleSrc = fs.readFileSync(consolejs);
// Put jasmine in the global context, this is somewhat like running in a
// browser where every file will have access to `jasmine`
var jasmine = vm.runInThisContext(jasmineSrc, jasminejs);
jasmine = vm.runInThisContext(bootSrc + "\njasmine = window.jasmine;", bootjs);
vm.runInThisContext(consoleSrc, consolejs);

if (isWindowUndefined) {
  delete global.window;
}
require("./async-callback");
require("jasmine-reporters");
var nodeReporters = require('./reporter').terminalReporters;
jasmine.TerminalVerboseReporter = nodeReporters.TerminalVerboseReporter;
jasmine.TerminalReporter = nodeReporters.TerminalReporter;
jasmine.GrowlReporter = require('jasmine-growl-reporter');

jasmine.loadHelpersInFolder = function(folder, matcher) {
  // Check to see if the folder is actually a file, if so, back up to the
  // parent directory and find some helpers
  folderStats = fs.statSync(folder);
  if (folderStats.isFile()) {
    folder = path.dirname(folder);
  }

  var helpers = [],
      helperCollection = require('./spec-collection');

  helperCollection.load([folder], matcher);
  helpers = helperCollection.getSpecs();

  for (var i = 0, len = helpers.length; i < len; ++i) {
    var file = helpers[i].path();

    try {
      var helper = require(file.replace(/\.*$/, ""));
    } catch (e) {
      console.log("Exception loading helper: " + file)
      console.log(e);
      throw e; // If any of the helpers fail to load, fail everything
    }

    for (var key in helper) {
      global[key] = helper[key];
    }
  }
};

function removeJasmineFrames(text) {
  if (!text) {
    return text;
  }

  var lines = [];
  text.split(/\n/).forEach(function(line){
    if (line.indexOf(jasminejs) == -1) {
      lines.push(line);
    }
  });
  return lines.join('\n');
}

jasmine.executeSpecsInFolder = function(options){
  var folders           = options['specFolders'];
  var done              = options['onComplete'];
  var isVerbose         = options['isVerbose'];
  var showColors        = options['showColors'];
  var teamcity          = options['teamcity'];
  var matcher           = options['regExpSpec'];
  var junitreport       = options['junitreport'];
  var includeStackTrace = options['includeStackTrace'];
  var growl             = options['growl'];

  var fileMatcher = matcher || new RegExp(".(js)$", "i"),
      colors = showColors || false,
      specs = require('./spec-collection'),
      jasmineEnv = jasmine.getEnv();

  // Bind all of the rest of the functions
  var jasFuncs = _.keys(jasmineEnv);
  for (var i=0; i<jasFuncs.length; i++) {
      jasFunc = jasFuncs[i];
      global[jasFunc] = jasmineEnv[jasFunc];
  }

  specs.load(folders, fileMatcher);

  if(junitreport && junitreport.report) {
    var existsSync = fs.existsSync || path.existsSync;
    if(!existsSync(junitreport.savePath)) {
      util.puts('creating junit xml report save path: ' + junitreport.savePath);
      mkdirp.sync(junitreport.savePath, "0755");
    }
    jasmineEnv.addReporter(new jasmine.JUnitXmlReporter(junitreport.savePath,
                                                        junitreport.consolidate,
                                                        junitreport.useDotNotation));
  }

  if(teamcity){
    jasmineEnv.addReporter(new jasmine.TeamcityReporter());

  } else {
    jasmineEnv.addReporter(new jasmine.TerminalReporter({print: print,
                                               color: showColors,
                                               includeStackTrace: includeStackTrace,
                                               verbose: isVerbose,
                                               callback:  done,
                                               stackFilter: removeJasmineFrames}));
  }

  if (growl) {
    jasmineEnv.addReporter(new jasmine.GrowlReporter());
  }

  var specsList = specs.getSpecs();

  for (var i = 0, len = specsList.length; i < len; ++i) {
      var filename = specsList[i];
      delete require.cache[filename.path()];
      // Catch exceptions in loading the spec
      try {
      require(filename.path().replace(/\.\w+$/, ""));
      } catch (e) {
      console.log("Exception loading: " + filename.path());
      console.log(e);
      throw e;
      }
  }

  jasmineEnv.execute();
};

function print(str) {
  process.stdout.write(util.format(str));
}

for ( var key in jasmine) {
  exports[key] = jasmine[key];
}
