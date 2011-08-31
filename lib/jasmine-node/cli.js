var jasmine = require('jasmine-node');
var sys = require('sys'),
    Path= require('path');


var specFolder = null;

for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;
var extentions = "js";
var match = '.'
var junit = false

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
    
    case '--junit':
      junit = true      
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

//console.log(jasmine.getEnv());

jasmine.loadHelpersInFolder(specFolder, new RegExp("[-_]helper\\.(" + extentions + ")$"));
jasmine.executeSpecsInFolder(specFolder, function(runner, log){  
  sys.print('\n');
  // if (runner.results().failedCount == 0) {
  //   process.exit(0);
  // } else {
  //   process.exit(1);
  // }
}, isVerbose, showColors, new RegExp(match + "spec\\.(" + extentions + ")$", 'i'), junit);

function help(){
  sys.print([ 
    'USAGE: jasmine-node [--color|--noColor] [--verbose] [--junit] [--coffee] directory'
  , ''
  , 'Options:'
  , '  --color            - use color coding for output'
  , '  --noColor          - do not use color coding for output'
  , '  -m, --match REGEXP - load only specs containing "REGEXPspec"'
  , '  -i, --include DIR  - add given directory to node include paths'
  , '  --verbose          - print extra information per each test run'
  , '  --junit            - create a junit report'
  , '  --coffee           - load coffee-script which allows execution .coffee files'
  , ''
  ].join("\n"));
  
  process.exit(1);
}
