(function() {
  var TerminalReporter, noOp, util, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  util = null;

  try {
    util = require('util');
  } catch (_error) {
    util = require('sys');
  }

  noOp = function() {};

  TerminalReporter = (function() {
    TerminalReporter.prototype.ANSIColors = {
      pass: function() {
        return '\x1B[32m';
      },
      fail: function() {
        return '\x1B[31m';
      },
      specTiming: function() {
        return '\x1B[34m';
      },
      suiteTiming: function() {
        return '\x1B[33m';
      },
      ignore: function() {
        return '\x1B[37m';
      },
      neutral: function() {
        return '\x1B[0m';
      }
    };

    TerminalReporter.prototype.NoColors = {
      pass: function() {
        return '';
      },
      fail: function() {
        return '';
      },
      specTiming: function() {
        return '';
      },
      suiteTiming: function() {
        return '';
      },
      ignore: function() {
        return '';
      },
      neutral: function() {
        return '';
      }
    };

    function TerminalReporter(config) {
      var defaults;
      this.config = config != null ? config : {};
      this.specDone = __bind(this.specDone, this);
      this.specStarted = __bind(this.specStarted, this);
      this.suiteDone = __bind(this.suiteDone, this);
      this.suiteStarted = __bind(this.suiteStarted, this);
      this.jasmineDone = __bind(this.jasmineDone, this);
      this.jasmineStarted = __bind(this.jasmineStarted, this);
      defaults = {
        onComplete: noOp,
        noStackTrace: true,
        verbose: false,
        print: function(str) {
          process.stdout.write(util.format(str));
        },
        stackFilter: function(t) {
          return t;
        }
      };
      this.config = _.defaults(this.config, defaults);
      this.config.color = this.config.noColor ? this.NoColors : this.ANSIColors;
      this.counts = {
        tests: 0,
        failures: 0,
        skipped: 0
      };
      this.allSpecs = {};
      this.suiteNestLevel = 0;
      this.done = false;
      this.suiteTimes = {};
      return;
    }

    TerminalReporter.prototype.jasmineStarted = function(runner) {
      this.startedAt = +(new Date);
    };

    TerminalReporter.prototype.jasmineDone = function() {
      var color, elapsed, now, results, _base;
      if (this.done) {
        return;
      }
      this.done = true;
      now = +(new Date);
      elapsed = now - this.startedAt;
      this.printFailures();
      this.config.print("\n\nFinished in " + (elapsed / 1000) + " seconds\n");
      results = ["" + this.counts.tests + " Tests", "" + this.counts.failures + " Failures", "" + this.counts.skipped + " Skipped\n\n"];
      if (this.counts.failures > 0) {
        color = this.config.color.fail();
      } else {
        color = this.config.color.pass();
      }
      global.jasmineResult = {
        fail: this.counts.failures > 0
      };
      this.config.print(this.stringWithColor(results.join(', '), color));
      if (typeof (_base = this.config).onComplete === "function") {
        _base.onComplete();
      }
    };

    TerminalReporter.prototype.suiteStarted = function(suite) {
      this.suiteTimes[suite.id] = +(new Date);
      if (this.config.verbose) {
        this.printVerboseSuiteStart(suite);
      }
      this.suiteNestLevel++;
      suite.parent = this.currentSuite;
      this.currentSuite = suite;
    };

    TerminalReporter.prototype.printVerboseSuiteStart = function(suite) {
      var i, msg, _i, _ref;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      msg += this.stringWithColor("" + suite.description + " Start\n", this.config.color.ignore());
      return this.config.print(msg);
    };

    TerminalReporter.prototype.suiteDone = function(suite) {
      var _ref;
      if (!this.suiteTimes[suite.id]) {
        return;
      }
      this.suiteNestLevel--;
      this.suiteTimes[suite.id] = (+(new Date)) - this.suiteTimes[suite.id];
      if (this.config.verbose) {
        this.printVerboseSuiteDone(suite);
      }
      delete this.suiteTimes[suite.id];
      this.currentSuite = (_ref = this.currentSuite.parent) != null ? _ref : null;
    };

    TerminalReporter.prototype.printVerboseSuiteDone = function(suite) {
      var i, msg, _i, _ref;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      msg += this.stringWithColor("" + suite.description + " Finish", this.config.color.ignore());
      msg += this.stringWithColor(" - " + this.suiteTimes[suite.id] + " ms\n\n", this.config.color.suiteTiming());
      return this.config.print(msg);
    };

    TerminalReporter.prototype.specStarted = function(spec) {
      this.specStart = +(new Date);
      this.counts.tests++;
    };

    TerminalReporter.prototype.specDone = function(spec) {
      var msg, _base, _name;
      ((_base = this.allSpecs)[_name = this.currentSuite.id] != null ? _base[_name] : _base[_name] = []).push(spec);
      if (this.config.verbose) {
        msg = this.makeVerbose(spec);
      } else {
        msg = this.makeSimple(spec);
      }
      this.config.print(msg);
    };

    TerminalReporter.prototype.makeSimple = function(spec) {
      var msg;
      msg = '';
      switch (spec.status) {
        case 'pending':
          this.counts.skipped++;
          msg = this.stringWithColor('-', this.config.color.ignore());
          break;
        case 'passed':
          msg = this.stringWithColor('.', this.config.color.pass());
          break;
        case 'failed':
          this.counts.failures++;
          msg = this.stringWithColor('F', this.config.color.fail());
          break;
        default:
          msg = this.stringWithColor('U', this.config.color.fail());
      }
      return msg;
    };

    TerminalReporter.prototype.makeVerbose = function(spec) {
      var elapsed, i, msg, _i, _ref;
      elapsed = (+(new Date)) - this.specStart;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      switch (spec.status) {
        case 'pending':
          this.counts.skipped++;
          msg += this.stringWithColor("" + spec.description, this.config.color.ignore());
          break;
        case 'passed':
          msg += this.stringWithColor("" + spec.description, this.config.color.pass());
          break;
        case 'failed':
          this.counts.failures++;
          msg += this.stringWithColor("" + spec.description, this.config.color.fail());
          break;
        default:
          msg += this.stringWithColor("" + spec.description, this.config.color.fail());
      }
      msg += this.stringWithColor(" - " + elapsed + " ms\n", this.config.color.specTiming());
      return msg;
    };

    TerminalReporter.prototype.printFailures = function() {
      var count, failure, indent, spec, specs, stack, suite, _i, _j, _len, _len1, _ref, _ref1;
      if (!(this.counts.failures > 0)) {
        return;
      }
      this.config.print("\n\nFailures:");
      indent = "  ";
      count = 0;
      _ref = this.allSpecs;
      for (suite in _ref) {
        specs = _ref[suite];
        for (_i = 0, _len = specs.length; _i < _len; _i++) {
          spec = specs[_i];
          _ref1 = spec.failedExpectations;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            failure = _ref1[_j];
            count++;
            this.config.print("\n\n" + indent + count + ") " + spec.fullName + "\n" + indent + indent + "Message:\n" + indent + indent + indent + (this.stringWithColor(failure.message, this.config.color.fail())));
            if (!this.config.noStackTrace) {
              stack = this.config.stackFilter(failure.stack);
              this.config.print("\n\n" + indent + indent + "Stacktrace:\n" + indent + indent + indent + stack);
            }
          }
        }
      }
    };

    TerminalReporter.prototype.stringWithColor = function(string, color) {
      if (color == null) {
        color = this.config.color.neutral();
      }
      return "" + color + string + (this.config.color.neutral());
    };

    return TerminalReporter;

  })();

  module.exports = {
    TerminalReporter: TerminalReporter
  };

}).call(this);
