require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

process.mixin(global, jasmine);

jasmine.executeSpecsInFolder('spec', function(runner, log){
  process.exit(runner.results().failedCount);
}, true);
