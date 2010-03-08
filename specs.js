require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

process.mixin(global, jasmine);

jasmine.executeSpecsInFolder('spec', function(){
  sys.puts('DONE');
  process.exit(0);
});
