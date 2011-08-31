var jasmine = require('./index');
var sys = require('sys'),
    Path= require('path');


var specFolder = null;

for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;
var extentions = "js";
var match = '.'

var args = process.argv.slice(2);

while(args.length) {
  var arg = args.shift();

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
    case '-m':
    case '--match':
      match = args.shift();
      break;
    case '-i':
    case '--include':
      var dir = args.shift();

      if(!Path.existsSync(dir))
        throw new Error("Include path '" + dir + "' doesn't exist!");

      require.paths.unshift(dir);
      break;
    default:
      if (arg.match(/^--/)) help();
      specFolder = Path.join(process.cwd(), arg);
      break;
  }
}

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
}, isVerbose, showColors, new RegExp(match + "spec\\.(" + extentions + ")$", 'i'));

function help(){
  sys.print([
    'USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory'
  , ''
  , 'Options:'
  , '  --color            - use color coding for output'
  , '  --noColor          - do not use color coding for output'
  , '  -m, --match REGEXP - load only specs containing "REGEXPspec"'
  , '  -i, --include DIR  - add given directory to node include paths'
  , '  --verbose          - print extra information per each test run'
  , '  --coffee           - load coffee-script which allows execution .coffee files'
  , ''
  ].join("\n"));

  process.exit(1);
}
