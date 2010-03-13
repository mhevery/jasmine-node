require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

process.mixin(global, jasmine);

jasmine.executeSpecsInFolder('spec', function(tests){
  process.exit(tests.failed);
});
