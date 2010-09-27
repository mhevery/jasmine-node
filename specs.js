require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

for(var key in jasmine) {
  global[key] = jasmine[key];
}

jasmine.isVerbose = false;
jasmine.showColors = true;
process.argv.forEach(function(arg){
  switch(arg) {
  case '--color': jasmine.showColors = true; break;
  case '--noColor': jasmine.showColors = false; break;
  case '--verbose': jasmine.isVerbose = true; break;
  }
});

jasmine.requireAllSpecFiles(__dirname + "/spec")