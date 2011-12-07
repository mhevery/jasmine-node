var reporter = require(__dirname + "/../lib/jasmine-node/reporter");

describe('reporter', function(){
  it('initializes print_ from config', function(){
    config = { print: true };
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.print_).toBeTruthy();
  });

  it('initializes isVerbose_ from config', function(){
    config = { verbose: true }
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.isVerbose_).toBeTruthy();
  });

  it('initializes onComplete_ from config', function(){
    onCompleteFn = function() {};
    config = { onComplete: onCompleteFn }
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.onComplete_).toEqual(onCompleteFn);
  });

  it('initializes color_ from config', function(){
    config = { color: true }
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.color_).toEqual(ANSIColors);
  });

  it('initializes stackFilter from config', function(){
    stackFilterFn = function() {};
    config = { stackFilter: stackFilterFn }
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.stackFilter).toEqual(stackFilterFn);
  });

  it('initializes columnCounter_ to 0', function(){
    config = {}
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.columnCounter_).toEqual(0);
  });

  it('initializes log_ to be an empty array', function(){
    config = {}
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.log_.length).toEqual(0);
  });

  it('initializes start_ to 0', function(){
    config = {}
    var _reporter = new reporter.TerminalReporter(config);
    expect(_reporter.start_).toEqual(0);
  });
});
