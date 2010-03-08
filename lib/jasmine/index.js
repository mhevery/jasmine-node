var fs = require('fs');
var sys = require('sys');

var filename = __dirname + '/jasmine-0.10.1.js';
global.window = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
};
var src = fs.readFileSync(filename);
var jasmine = process.compile(src + '\njasmine;', filename);
delete global.window;

jasmine.executeSpecsInFolder = function(folder){
  var specs = fs.readdirSync('spec');
  for ( var i = 0; i < specs.length; i++) {
    var filename = folder + '/' + specs[i];
    process.compile(fs.readFileSync(filename), filename);
  }

  var log = [];
  var columnCounter = 0;
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.reporter = {
    log: function(str){
    },
    reportRunnerStarting: function(runner) {
    },
    reportSuiteResults: function(suite) {
      var specResults = suite.results();
      log.push('Spec ' + suite.description);
      specResults.items_.forEach(function(spec){
        if (spec.failedCount > 0 && spec.description) {
          log.push('  it ' + spec.description);
          spec.items_.forEach(function(result){
            log.push('    ' + result.message);
          });
        }
      });
    },
    reportSpecResults: function(spec) {
      sys.print(spec.results().failedCount ? "F" : ".");
      if (columnCounter++ < 50) return;
      columnCounter = 0;
      sys.print('\n');
    },
    reportRunnerResults: function(runner) {
      sys.puts('\n----------');
      log.forEach(function(log){
        sys.puts(log);
      });
      process.exit(0);
    }
  };
  jasmineEnv.execute();
};

function now(){
  return new Date().getTime();
}

jasmine.asyncIt = function(name, specFn){
  jasmine.getEnv().it(name, function(){
    specFn();
    jasmine.asyncIt.wait.done = false;
    jasmine.asyncIt.wait();
  });
};

jasmine.asyncIt.wait = function wait(){
  wait.start = wait.start || now();
  waits(1);
  runs(function() {
    if (wait.start + wait.timeout < now()) {
      expect('timeout waiting for spec').toBeNull();
    } else if (!wait.done) {
      wait();
    }
  });
};
jasmine.asyncIt.wait.timeout = 2 * 1000;
jasmine.asyncSpecDone = function(){
  jasmine.asyncIt.wait.done = true;
};


jasmine.xasyncIt = function(name, specFn){
  jasmine.getEnv().xit(name, specFn);
};

process.mixin(exports, jasmine);
