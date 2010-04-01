require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

for(var key in jasmine) {
  global[key] = jasmine[key];
}

jasmine.executeSpecsInFolder('spec', function(runner, log){
  process.exit(runner.results().failedCount);
}, false);
