var jasmine = require('jasmine-node');
var sys = require('sys'),
    Path= require('path');

var SPEC_FOLDER= Path.join(process.cwd(), 'spec'),
    SPEC_MATCHER_REGEX= "^.+[-_]spec\.(js|coffee)$",
    HELPER_MATCHER_REGEX= "^.+[-_]helper\.(js|coffee)$";

for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;

process.argv.forEach(function(arg){
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
    
  }
});

jasmine.loadHelpersInFolder(SPEC_FOLDER, HELPER_MATCHER_REGEX);
jasmine.executeSpecsInFolder(SPEC_FOLDER, function(runner, log){
  process.exit(runner.results().failedCount);
}, isVerbose, showColors, SPEC_MATCHER_REGEX);
