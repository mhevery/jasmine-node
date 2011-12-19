//
// Imports
//
var util;
try {
  util = require('util')
} catch(e) {
  util = require('sys')
}

//
// Helpers
//
function noop() {}

ANSIColors = {
  pass:    function() { return '\033[32m'; }, // Green
  fail:    function() { return '\033[31m'; }, // Red
  neutral: function() { return '\033[0m';  }  // Normal
};

NoColors = {
  pass:    function() { return ''; },
  fail:    function() { return ''; },
  neutral: function() { return ''; }
};

TerminalReporter = function(config) {
  this.print_ = config.print || util.print;
  this.color_ = config.color ? ANSIColors : NoColors;

  this.started_ = false;
  this.finished_ = false;

  this.suites_ = [];
  this.specResults_ = {};
  this.failures_ = [];
}

TerminalReporter.prototype.reportRunnerStarting = function(runner) {
  this.started_ = true;
  this.startedAt = new Date();
  var suites = runner.topLevelSuites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    this.suites_.push(this.summarize_(suite));
  }
};

TerminalReporter.prototype.summarize_ = function(suiteOrSpec) {
  var isSuite = suiteOrSpec instanceof jasmine.Suite;

  var summary = {
    id: suiteOrSpec.id,
    name: suiteOrSpec.description,
    type: isSuite? 'suite' : 'spec',
    children: []
  };

  if (isSuite) {
    var children = suiteOrSpec.children();
    for (var i = 0; i < children.length; i++) {
      summary.children.push(this.summarize_(children[i]));
    }
  }

  return summary;
};

// This is heavily influenced by Jasmine's Html/Trivial Reporter
TerminalReporter.prototype.reportRunnerResults = function(runner) {
  this.reportFailures_();

  var results = runner.results();
  var resultColor = (results.failedCount > 0) ? this.color_.fail() : this.color_.pass();

  var specs = runner.specs();
  var specCount = specs.length;

  var message = "\n\nFinished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + " seconds";
  this.printLine_(message);

  // This is what jasmine-html.js has
  //message = "" + specCount + " spec" + ( specCount === 1 ? "" : "s" ) + ", " + results.failedCount + " failure" + ((results.failedCount === 1) ? "" : "s");

  this.printLine_(this.stringWithColor_(this.printRunnerResults_(runner), resultColor));

  this.finished_ = true;
};

TerminalReporter.prototype.reportFailures_ = function() {
  if (this.failures_.length > 0) {
    var indent = '  ',
        failure = undefined;
    this.printLine_('\n');

    this.print_("Failures:");

    for (var i = 0; i < this.failures_.length; i++) {
      failure = this.failures_[i];
      this.printLine_('\n');
      this.printLine_('  ' + (i + 1) + ') ' + failure.spec);
      this.printLine_('   Message:');
      this.printLine_('     ' + this.stringWithColor_(failure.message, this.color_.fail()));
      this.printLine_('   Stacktrace:');
      this.print_('     ' + failure.stackTrace);
    }
  }
}

TerminalReporter.prototype.reportSuiteResults = function(suite) {
  // Not used in this context
};

TerminalReporter.prototype.reportSpecResults = function(spec) {
  var result = spec.results();
  var msg = '';
  if (result.passed()) {
    msg = this.stringWithColor_('.', this.color_.pass());
    //      } else if (result.skipped) {  TODO: Research why "result.skipped" returns false when "xit" is called on a spec?
    //        msg = (colors) ? (ansi.yellow + '*' + ansi.none) : '*';
  } else {
    msg = this.stringWithColor_('F', this.color_.fail());
    this.addFailureToFailures_(spec);
  }
  this.spec_results += msg;
  this.print_(msg);
};

TerminalReporter.prototype.addFailureToFailures_ = function(spec) {
  var result = spec.results();
  var failureItem = null;

  for (var i = 0; i < result.items_.length; i++) {
    if (result.items_[i].passed_ == false) {
      failureItem = result.items_[i];
      var failure = {
        spec: spec.description,
        message: failureItem.message,
        stackTrace: failureItem.trace.stack
      }

      this.failures_.push(failure);
    }
  }
};

TerminalReporter.prototype.printRunnerResults_ = function(runner){
  var results = runner.results();
  var specs = runner.specs();
  var msg = '';
  msg += specs.length + ' test' + ((specs.length === 1) ? '' : 's') + ', ';
  msg += results.totalCount + ' assertion' + ((results.totalCount === 1) ? '' : 's') + ', ';
  msg += results.failedCount + ' failure' + ((results.failedCount === 1) ? '' : 's') + '\n';
  return msg;
};


  // Helper Methods //
TerminalReporter.prototype.stringWithColor_ = function(stringValue, color) {
  return (color || this.color_.neutral()) + stringValue + this.color_.neutral();
};

TerminalReporter.prototype.printLine_ = function(stringValue) {
  this.print_(stringValue);
  this.print_('\n');
};

// The TerminalVerboseReporter is processed when the --verbose argument is passed in
TerminalVerboseReporter = function(config) {
  this.print_ = config.print || util.print;
  this.color_ = config.color ? ANSIColors : NoColors;

  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.specResults_ = {};
  this.failures_ = [];
  this.indent_ = 0;
};

// Inherit from TerminalReporter
TerminalVerboseReporter.prototype.__proto__ = TerminalReporter.prototype;

TerminalVerboseReporter.prototype.reportSpecResults = function(spec) {
  if (spec.results().failedCount > 0) {
    this.addFailureToFailures_(spec);
  }

  this.specResults_[spec.id] = {
    messages: spec.results().getItems(),
    result: spec.results().failedCount > 0 ? 'failed' : 'passed'
  };
};

TerminalVerboseReporter.prototype.reportRunnerResults = function(runner) {
  var messages = new Array();
  this.constructMessagesFromResult_(messages, this.suites_);

  for (var i=0; i<messages.length; i++) {
    this.printLine_(messages[i]);
  }

  // Call the super class' method
  TerminalReporter.prototype.reportRunnerResults.call(this, runner);
}

TerminalVerboseReporter.prototype.constructMessagesFromResult_ = function(messages, result) {
  var element = undefined,
      specResult = undefined,
      msg = '';

  for (var i = 0; i < result.length; i++) {
    element = result[i];

    if (element.type === 'spec') {
      //this.indent_ += 2;
      specResult = this.specResults_[element.id.toString()];

      if (specResult.result === 'passed') {
        msg = this.stringWithColor_(this.indentMessage_(element.name), this.color_.pass());
      } else {
        msg = this.stringWithColor_(this.indentMessage_(element.name), this.color_.fail());
      }

      messages.push(msg);
    } else {
      messages.push('');
      messages.push(this.indentMessage_(element.name));
    }
    this.constructMessagesFromResult_(messages, element.children);

  }
};

TerminalVerboseReporter.prototype.indentMessage_ = function(message) {
  var _indent = '';
  for (var i = 0; i < this.indent_; i++) {
    _indent += ' ';
  }
  return (_indent + message);
};

//
// Exports
//
exports.TerminalReporter = TerminalReporter;
