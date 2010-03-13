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

function noop(){};
function now(){ return new Date().getTime(); }

jasmine.executeSpecsInFolder = function(folder, done){
  var tests = {
    start: now(),
    count: 0,
    failed: 0,
    passed: 0
  };
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
      if (specResults.failedCount) {
        var path = [];
        while(suite) {
          path.unshift(suite.description);
          suite = suite.parentSuite;
        }
        log.push('Describe ' + path.join(' '));
        specResults.items_.forEach(function(spec){
          if (spec.failedCount > 0 && spec.description) {
            log.push('  it ' + spec.description);
            spec.items_.forEach(function(result){
              log.push('    ' + result.message);
            });
          }
        });
      }
    },
    reportSpecResults: function(spec) {
      tests.count ++;
      if (spec.results().failedCount) {
        sys.print("F");
        tests.failed++;
      } else {
        sys.print(".");
        tests.passed++;
      }
      if (columnCounter++ < 50) return;
      columnCounter = 0;
      sys.print('\n');
    },
    reportRunnerResults: function(runner) {
      tests.finished = now();
      tests.duration = tests.finished - tests.start;
      tests.durationPerTest = tests.duration / tests.count;
      sys.puts('\n----------');
      log.forEach(function(log){
        sys.puts(log);
      });
      tests.description =
        "Passed " + tests.passed + " of " + tests.count +
        (tests.failed ? " (Failed " + tests.failed + " of " + tests.count + ")": "") +
        " in " + tests.duration +
        " ms (" + Math.round(tests.durationPerTest)  + " ms per test).";
      sys.puts(tests.description);
      (done||noop)(tests);
    }
  };
  jasmineEnv.execute();
};

function now(){
  return new Date().getTime();
}

jasmine.asyncSpecWait = function(){
  var wait = jasmine.asyncSpecWait;
  wait.start = now();
  wait.done = false;
  (function innerWait(){
    waits(10);
    runs(function() {
      if (wait.start + wait.timeout < now()) {
        expect('timeout waiting for spec').toBeNull();
      } else if (wait.done) {
        wait.done = false;
      } else {
        innerWait();
      }
    });
  })();
};
jasmine.asyncSpecWait.timeout = 4 * 1000;
jasmine.asyncSpecDone = function(){
  jasmine.asyncSpecWait.done = true;
};


process.mixin(exports, jasmine);
