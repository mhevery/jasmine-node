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

function noop(){}

jasmine.executeSpecsInFolder = function(folder, done, isVerbose){
  var log = [];
  var columnCounter = 0;
  var start = 0;
  var elapsed = 0;
  var verbose = isVerbose || false;
  var specs = jasmine.getAllSpecFiles(folder);

  for (var i = 0, len = specs.length; i < len; ++i){
    var filename = specs[i];
    process.compile(fs.readFileSync(filename), filename);
  }

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.reporter = {
    log: function(str){
    },
    reportRunnerStarting: function(runner) {
      sys.puts('Started');
      start = Number(new Date);
    },
    reportSuiteResults: function(suite) {
      var specResults = suite.results();

      if (verbose)
        log.push('Spec ' + suite.description);

      specResults.items_.forEach(function(spec){
        if (spec.failedCount > 0 && spec.description) {
          if (!verbose)
              log.push(suite.description);
          log.push('  it ' + spec.description);
          spec.items_.forEach(function(result){
            log.push('  ' + result.trace.stack + '\n');
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
      elapsed = (Number(new Date) - start) / 1000;
      sys.puts('\n');
      log.forEach(function(log){
        sys.puts(log);
      });
      sys.puts('Finished in ' + elapsed + ' seconds');
      sys.puts(jasmine.printRunnerResults(runner));
      (done||noop)(runner, log);
    }
  };
  jasmineEnv.execute();
};

jasmine.getAllSpecFiles = function(dir){
  var files = fs.readdirSync(dir);
  var specs = [];

  for (var i = 0, len = files.length; i < len; ++i){
    var filename = dir + '/' + files[i];
    if (fs.statSync(filename).isFile()){
      specs.push(filename);
    }else if (fs.statSync(filename).isDirectory()){
      var subfiles = this.getAllSpecFiles(filename);
      subfiles.forEach(function(result){
        specs.push(result);
      });
    }
  }
  return specs;
};

jasmine.printRunnerResults = function(runner){
  var results = runner.results();
  var suites = runner.suites();
  var msg = '';
  msg += suites.length + ' test' + ((suites.length === 1) ? '' : 's') + ', ';
  msg += results.totalCount + ' assertion' + ((results.totalCount === 1) ? '' : 's') + ', ';
  msg += results.failedCount + ' failure' + ((results.failedCount === 1) ? '' : 's') + '\n';
  return msg;
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
