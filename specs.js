require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

process.mixin(global, jasmine);

jasmine.executeSpecsInFolder('spec', function(runner, log){
//  sys.puts('DONE');
  var results = runner.results();
  if(results.failedCount === 0)
        process.exit(0);
    else
        process.exit(1);
});
