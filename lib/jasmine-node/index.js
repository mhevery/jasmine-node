
var fs = require('fs');
var sys = require('sys');
var path = require('path');

var filename = __dirname + '/jasmine-1.0.1.js';
global.window = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval
};

var src = fs.readFileSync(filename);
var jasmine;
var minorVersion = process.version.match(/\d\.(\d)\.\d/)[1];
switch (minorVersion) {
  case "1":
  case "2":
    jasmine = process.compile(src + '\njasmine;', filename);
    break;
  default:
    jasmine = require('vm').runInThisContext(src + "\njasmine;", filename);
}

delete global.window;

function noop(){}

jasmine.loadHelpersInFolder=function(folder, matcher)
{
  var helpers = jasmine.getAllSpecFiles(folder, matcher);

  for (var i = 0, len = helpers.length; i < len; ++i)
  {
    var filename = helpers[i];
    var helper= require(filename.replace(/\.*$/, ""));
    for (var key in helper)
      global[key]= helper[key];
  }
};

jasmine.NodeStdOutReporter = function(config) {
  this.isVerbose_  = config.verbose    || false;
  this.onComplete_ = config.onComplete || noop;
  this.color_      = config.color?
    jasmine.NodeStdOutReporter.ANSIColors:
    jasmine.NodeStdOutReporter.NoColors;

  this.columnCounter_ = 0;
  this.log_           = [];
  this.start_         = 0;
};

jasmine.NodeStdOutReporter.ANSIColors = {
  pass:    function() { return '\033[32m'; }, // Green
  fail:    function() { return '\033[31m'; }, // Red
  neutral: function() { return '\033[0m';  }  // Normal
};

jasmine.NodeStdOutReporter.NoColors = {
  pass:    function() { return ''; },
  fail:    function() { return ''; },
  neutral: function() { return ''; }
};

jasmine.NodeStdOutReporter.prototype.stringWithColor_ = function(str, color) {
  return (color || this.color_.neutral()) + str + this.color_.neutral();
};

jasmine.NodeStdOutReporter.prototype.log = noop;

jasmine.NodeStdOutReporter.prototype.reportSpecStarting = noop;

jasmine.NodeStdOutReporter.prototype.reportRunnerStarting = function(runner) {
  sys.puts('Started');
  this.start_ = Number(new Date);
};

jasmine.NodeStdOutReporter.prototype.reportSuiteResults = function(suite) {
  var specResults = suite.results();
  var path = [];
  while(suite) {
    path.unshift(suite.description);
    suite = suite.parentSuite;
  }
  var description = path.join(' ');

  if (this.isVerbose_)
    this.log_.push('Spec ' + description);

  outerThis = this;
  specResults.items_.forEach(function(spec){
    if (spec.failedCount > 0 && spec.description) {
      if (!outerThis.isVerbose_)
        outerThis.log_.push(description);
      outerThis.log_.push('  it ' + spec.description);
      spec.items_.forEach(function(result){
        outerThis.log_.push('  ' + result.trace.stack + '\n');
      });
    } else {
      if (outerThis.isVerbose_)
        outerThis.log_.push('  it ' + spec.description);
    }
  });
};

jasmine.NodeStdOutReporter.prototype.reportSpecResults = function(spec) {
  var result = spec.results();
  var msg = '';
  if (result.passed()) {
    msg = this.stringWithColor_('.', this.color_.pass());
    //      } else if (result.skipped) {  TODO: Research why "result.skipped" returns false when "xit" is called on a spec?
    //        msg = (colors) ? (ansi.yellow + '*' + ansi.none) : '*';
  } else {
    msg = this.stringWithColor_('F', this.color_.fail());
  }
  sys.print(msg);
  if (this.columnCounter_++ < 50) return;
  this.columnCounter_ = 0;
  sys.print('\n');
};

jasmine.NodeStdOutReporter.prototype.reportRunnerResults = function(runner) {
  elapsed = (Number(new Date) - this.start_) / 1000;
  sys.puts('\n');
  this.log_.forEach(function(entry) {
    sys.puts(entry);
  });
  sys.puts('Finished in ' + elapsed + ' seconds');

  var summary = jasmine.printRunnerResults(runner);
  if(runner.results().failedCount === 0 ) {
    sys.puts(this.stringWithColor_(summary, this.color_.pass()));
  }
  else {
    sys.puts(this.stringWithColor_(summary, this.color_.fail()));
  }

  this.onComplete_(runner, this.log_);
};

jasmine.executeSpecsInFolder = function(folder, done, isVerbose, showColors, matcher) {
  var fileMatcher = matcher || new RegExp(".(js)$", "i");
  var specs = jasmine.getAllSpecFiles(folder, fileMatcher);

  for (var i = 0, len = specs.length; i < len; ++i){
    var filename = specs[i];
    require(filename.replace(/\.\w+$/, ""));
  }

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.reporter = new jasmine.NodeStdOutReporter({verbose:    isVerbose,
                                                        color:      showColors,
                                                        onComplete: done});
  jasmineEnv.execute();
};

jasmine.getAllSpecFiles = function(dir, matcher){
  var specs = [];
  if (fs.statSync(dir).isFile() && dir.match(matcher)) {
    specs.push(dir);
  } else {
    var files = fs.readdirSync(dir);
    for (var i = 0, len = files.length; i < len; ++i){
      var filename = dir + '/' + files[i];
        // fs.fstatSync will pass ENOENT from stat(2) up
        // the stack. That's not particularly useful right now,
        // so try and continue...
        try{
          isFile = fs.statSync(filename).isFile();
        }catch (err){
          if(err.code === 'ENOENT'){
            isFile = false;
          }else{
              throw err;
          }
        }
        if (filename.match(matcher) && isFile){
          specs.push(filename);
        }else{
          try{
            isDir = fs.statSync(filename).isDirectory();
          } catch (err) {
            if(err.code === 'ENOENT'){
              isDir = false;
            }else{
              throw err;
            }
          }
          if (isDir){
            var subfiles = this.getAllSpecFiles(filename, matcher);
            subfiles.forEach(function(result){
                specs.push(result);
            });
          }
        }

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

for ( var key in jasmine) {
  exports[key] = jasmine[key];
}
