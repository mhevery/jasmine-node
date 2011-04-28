var jasmine = require('jasmine-node');
var sys = require('sys'),
    Path= require('path');


var specFolder = 'spec';

var HELPER_MATCHER_REGEX= "^.+[-_]helper\.(js|coffee)$";

for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;

var usage = [
   'USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] [path]'
 , ''
 , 'Options:'
 , '  --color      - use color coding for output'
 , '  --noColor    - do not use color coding for output'
 , '  --verbose    - print extra information per each test run'
 , '  --coffee     - load coffee-script which allows execution .coffee files'
].join("\n");

if(process.argv.length > 2 && process.argv[process.argv.length-1].indexOf('--') == -1) {
	specFolder = process.argv.pop();
}

process.argv.slice(2).forEach(function(arg){
  switch(arg)
  {
    case '--color':
      showColors = true;
      break;
    case '--noColor':
      showColors = false;
      break;
    case '--verbose':
      isVerbose = true;
      break;
    case '--coffee':
      require('coffee-script');
      break;
    case '--help':
      sys.puts(usage);
      process.exit(1);
      break;
    default:
      sys.puts("unknown option: " + arg);
      process.exit(1);
      break;
  }
});

var SPEC_FOLDER= Path.join(process.cwd(), specFolder);


jasmine.loadHelpersInFolder(SPEC_FOLDER, HELPER_MATCHER_REGEX);
jasmine.executeSpecsInFolder(SPEC_FOLDER, function(runner, log){
  if (runner.results().failedCount == 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, isVerbose, showColors);
