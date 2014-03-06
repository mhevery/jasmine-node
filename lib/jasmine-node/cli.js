var util,
    Path= require('path'),
    fs  = require('fs');

var jasmine = require('./jasmine-loader');


try {
  util = require('util')
} catch(e) {
  util = require('sys')
}

var helperCollection = require('./spec-collection');

var specFolders = [];
var watchFolders = [];

// The following line keeps the jasmine setTimeout in the proper scope
jasmine.setTimeout = jasmine.getGlobal().setTimeout;
jasmine.setInterval = jasmine.getGlobal().setInterval;
for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;
var useRequireJs = false;
var extensions = "js";
var match = '.';
var matchall = false;
var autotest = false;
var forceExit = false;
var captureExceptions = false;
var includeStackTrace = true;
var growl = false;

var args = process.argv.slice(2);
var existsSync = fs.existsSync || Path.existsSync;

while(args.length) {
  var arg = args.shift();

  switch(arg)
  {
    case '--version':
      printVersion();
    case '--color':
      showColors = true;
      break;
    case '--noColor':
    case '--nocolor':
      showColors = false;
      break;
    case '--verbose':
      isVerbose = true;
      break;
    case '--coffee':
      try {
        require('coffee-script/register'); // support CoffeeScript >=1.7.0
      } catch ( e ) {
        require('coffee-script'); // support CoffeeScript <=1.6.3
      }
      extensions = "js|coffee|litcoffee";
      break;
    case '-m':
    case '--match':
      match = args.shift();
      break;
    case '--matchall':
      matchall = true;
      break;
    case '--test-dir':
        var dir = args.shift();

        if(!existsSync(dir))
          throw new Error("Test root path '" + dir + "' doesn't exist!");

        specFolders.push(dir); // NOTE: Does not look from current working directory.
        break;
    case '--autotest':
        autotest = true;
        break;
    case '--watch':
        var nextWatchDir;

        // Add the following arguments, until we see another argument starting with '-'
        while (args[0] && args[0][0] !== '-') {
          nextWatchDir = args.shift();
          watchFolders.push(nextWatchDir);

          if (!existsSync(nextWatchDir))
            throw new Error("Watch path '" + nextWatchDir + "' doesn't exist!");
        }
        break;

    case '--forceexit':
        forceExit = true;
        break;
    case '--captureExceptions':
        captureExceptions = true;
        break;
    case '--noStack':
        includeStackTrace = false;
        break;
    case '--growl':
        growl = true;
        break;
    case '--config':
        var configKey = args.shift();
        var configValue = args.shift();
        process.env[configKey]=configValue;
        break;
    case '-h':
        help();
    default:
      if (arg.match(/^--params=.*/)) {
        break;
      }
      if (arg.match(/^--/)) help();
      if (arg.match(/^\/.*/)) {
        specFolders.push(arg);
      } else {
        specFolders.push(Path.join(process.cwd(), arg));
      }
      break;
  }
}

if (specFolders.length === 0) {
  help();
} else {
  // Check to see if all our files exist
  for (var idx = 0; idx < specFolders.length; idx++) {
    if (!existsSync(specFolders[idx])) {
        console.log("File: " + specFolders[idx] + " is missing.");
        return;
    }
  }
}

if (autotest) {

  var patterns = ['**/*.js'];

  if (extensions.indexOf("coffee") !== -1) {
    patterns.push('**/*.coffee');
  }

  require('./autotest').start(specFolders, watchFolders, patterns);

  return;
}

var exitCode = 0;

if (captureExceptions) {
  process.on('uncaughtException', function(e) {
    console.error(e.stack || e);
    exitCode = 1;
    process.exit(exitCode);
  });
}

process.on("exit", onExit);

function onExit() {
  process.removeListener("exit", onExit);
  process.exit(exitCode);
}

var onComplete = function(runner, log) {
  process.stdout.write('\n');
  if (runner.results().failedCount == 0) {
    exitCode = 0;
  } else {
    exitCode = 1;
  }
  if (forceExit) {
    process.exit(exitCode);
  }
};

specFolders.forEach(function(path){
   jasmine.loadHelpersInFolder(path,
                               new RegExp("helpers?\\.(" + extensions + ")$", 'i'));

});

try {
  var regExpSpec = new RegExp(match + (matchall ? "" : "spec\\.") + "(" + extensions + ")$", 'i')
} catch (error) {
  console.error("Failed to build spec-matching regex: " + error);
  process.exit(2);
}


var options = {
  specFolders:   specFolders,
  onComplete:   onComplete,
  isVerbose:    isVerbose,
  showColors:   showColors,
  useRequireJs: useRequireJs,
  regExpSpec:   regExpSpec,
  includeStackTrace: includeStackTrace,
  growl:        growl
}

jasmine.executeSpecsInFolder(options);


function help(){
  process.stdout.write([
    'USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory'
  , ''
  , 'Options:'
  , '  --autotest         - rerun automatically the specs when a file changes'
  , '  --watch PATH       - when used with --autotest, watches the given path(s) and runs all tests if a change is detected'
  , '  --color            - use color coding for output'
  , '  --noColor          - do not use color coding for output'
  , '  -m, --match REGEXP - load only specs containing "REGEXPspec"'
  , '  --matchall         - relax requirement of "spec" in spec file names'
  , '  --verbose          - print extra information per each test run'
  , '  --coffee           - load coffee-script which allows execution .coffee files'
  , '  --growl            - display test run summary in a growl notification (in addition to other outputs)'
  , '  --test-dir         - the absolute root directory path where tests are located'
  , '  --forceexit        - force exit once tests complete.'
  , '  --captureExceptions- listen to global exceptions, report them and exit (interferes with Domains)'
  , '  --config NAME VALUE- set a global variable in process.env'
  , '  --noStack          - suppress the stack trace generated from a test failure'
  , '  --version          - show the current version'
  , '  -h, --help         - display this help and exit'
  , ''
  ].join("\n"));

  process.exit(-1);
}

function printVersion(){
  console.log("1.13.1");
  process.exit(0);
}
