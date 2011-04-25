var jasmine = require('jasmine-node');
var sys = require('sys'),
    Path= require('path');


var specFolder = null;

for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;
var extentions = "js";

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
      extentions = "js|coffee";
      break;
    default:
      if (arg.match(/^--/)) help();
      specFolder = Path.join(process.cwd(), arg);
      break;
  }
});

if (!specFolder) {
  help();
}

jasmine.loadHelpersInFolder(specFolder, new RegExp("[-_]helper\\.(" + extentions + ")$"));
jasmine.executeSpecsInFolder(specFolder, function(runner, log){
  sys.print('\n');
  if (runner.results().failedCount == 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, isVerbose, showColors, new RegExp(".spec\\.(" + extentions + ")$", 'i'));

function help(){
  sys.print('USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory\n');
  sys.print('\n');
  sys.print('Options:\n');
  sys.print('  --color      - use color coding for output\n');
  sys.print('  --noColor    - do not use color coding for output\n');
  sys.print('  --verbose    - print extra information per each test run\n');
  sys.print('  --coffee     - load coffee-script which allows execution .coffee files\n');
  
  process.exit(1);
}
