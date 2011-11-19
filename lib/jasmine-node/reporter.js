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

printRunnerResults = function(runner){
  var results = runner.results();
  var specs = runner.specs();
  var msg = '';
  msg += specs.length + ' test' + ((specs.length === 1) ? '' : 's') + ', ';
  msg += results.totalCount + ' assertion' + ((results.totalCount === 1) ? '' : 's') + ', ';
  msg += results.failedCount + ' failure' + ((results.failedCount === 1) ? '' : 's') + '\n';
  return msg;
};

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


//
// Reporter implementation
//
TerminalReporter = function(config) {
  this.print_      = config.print      || util.print;
  this.isVerbose_  = config.verbose    || false;
  this.onComplete_ = config.onComplete || noop;
  this.color_      = config.color? ANSIColors: NoColors;
  this.stackFilter = config.stackFilter || function(t) { return t; }

  this.columnCounter_ = 0;
  this.log_           = [];
  this.start_         = 0;
};

TerminalReporter.prototype = {
  // Public Methods //
  log: noop,

  reportSpecStarting: noop,

  reportRunnerStarting: function(runner) {
    this.printLine_('Started');
    this.start_ = Number(new Date);
		this.spec_results = '';
  },

  reportSuiteResults: function(suite) {
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
      if (spec.description && spec.failedCount > 0) {
        if (!outerThis.isVerbose_)
          outerThis.log_.push(description);
        outerThis.log_.push('  it ' + spec.description);
        spec.items_.forEach(function(result){
        if (!result.passed_) {
    			var errorMessage = result.trace.stack || result.message;
            if(outerThis.teamcity_) {
              outerThis.log_.push("##teamcity[testFailed name='" +  escapeTeamcityString(spec.description) + "' message='[FAILED]' details='" + escapeTeamcityString(outerThis.stackFilter(outerThis.stackFilter(errorMessage))) + "']");
            } else {
              outerThis.log_.push(result.message.indexOf('timeout:') == 0 ?
                                  '  TIMEOUT:' + result.message.substr(8) :
                                  '  ' +  outerThis.stackFilter(errorMessage) + '\n');
            }
          }
        });
      } else {
        if (outerThis.isVerbose_) {
          outerThis.log_.push('  it ' + spec.description);
        }
      }
    });
		if(this.isVerbose_)
			this.log_.push('\0');
  },

  reportSpecResults: function(spec) {
    var result = spec.results();
    var msg = '';
    if (result.passed()) {
      msg = this.stringWithColor_('.', this.color_.pass());
      //      } else if (result.skipped) {  TODO: Research why "result.skipped" returns false when "xit" is called on a spec?
      //        msg = (colors) ? (ansi.yellow + '*' + ansi.none) : '*';
    } else {
      msg = this.stringWithColor_('F', this.color_.fail());
    }
		this.spec_results += msg;
    this.print_(msg);
    if (this.columnCounter_++ < 50) return;
    this.columnCounter_ = 0;
    this.print_('\n');
  },

  reportRunnerResults: function(runner) {
    var elapsed = (Number(new Date) - this.start_) / 1000;
    var owner   = this;

    this.printLine_('\n');
    this.log_.forEach(function(entry) {
      owner.printLine_(entry);
    });
		if(this.isVerbose_)
			this.printLine_(this.spec_results);
    this.printLine_('Finished in ' + elapsed + ' seconds');

    var summary = printRunnerResults(runner);
    if(runner.results().failedCount === 0 ) {
      this.printLine_(this.stringWithColor_(summary, this.color_.pass()));
    }
    else {
      this.printLine_(this.stringWithColor_(summary, this.color_.fail()));
    }

    this.onComplete_(runner, this.log_);
  },

  // Helper Methods //
  stringWithColor_: function(str, color) {
    return (color || this.color_.neutral()) + str + this.color_.neutral();
  },

  printLine_: function(str) {
    this.print_(str);
    this.print_('\n');
  }

};


//
// Exports
//
exports.TerminalReporter = TerminalReporter;
