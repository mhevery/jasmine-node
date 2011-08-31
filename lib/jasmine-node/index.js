
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

jasmine.TerminalReporter = require('./reporter').TerminalReporter;

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

jasmine.executeSpecsInFolder = function(folder, done, isVerbose, showColors, matcher) {
  var fileMatcher = matcher || new RegExp(".(js)$", "i");
  var specs = jasmine.getAllSpecFiles(folder, fileMatcher);

  for (var i = 0, len = specs.length; i < len; ++i){
    var filename = specs[i];
    require(filename.replace(/\.\w+$/, ""));
  }

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.reporter = new jasmine.TerminalReporter({print:      sys.print,
                                                      verbose:    isVerbose,
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
