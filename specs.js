require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

//process.mixin(global, jasmine);

for(var key in jasmine) {
  global[key] = jasmine[key];
}

jasmine.executeSpecsInFolder('spec', function(runner, log){
  process.exit(runner.results().failedCount);
}, true);
