(function() {
  var TerminalReporter, noOp, util, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  util = require('util');

  noOp = function() {};

  TerminalReporter = (function() {
    TerminalReporter.prototype.ANSIColors = {
      pass: '\x1B[32m',
      fail: '\x1B[31m',
      specTiming: '\x1B[34m',
      suiteTiming: '\x1B[33m',
      ignore: '\x1B[37m',
      neutral: '\x1B[0m'
    };

    TerminalReporter.prototype.NoColors = {
      pass: '',
      fail: '',
      specTiming: '',
      suiteTiming: '',
      ignore: '',
      neutral: ''
    };

    function TerminalReporter(options) {
      var defaults;
      if (options == null) {
        options = {};
      }
      this.specDone = __bind(this.specDone, this);
      this.specStarted = __bind(this.specStarted, this);
      this.suiteDone = __bind(this.suiteDone, this);
      this.suiteStarted = __bind(this.suiteStarted, this);
      this.jasmineDone = __bind(this.jasmineDone, this);
      this.jasmineStarted = __bind(this.jasmineStarted, this);
      defaults = {
        noStackTrace: true,
        print: function(str) {
          process.stdout.write(util.format(str));
        },
        stackFilter: function(t) {
          return t;
        },
        verbose: false
      };
      if (options.noColor) {
        this.setColorFuncs(this.NoColors);
      } else {
        this.setColorFuncs(this.ANSIColors);
      }
      this.config = _.clone(options);
      _.defaults(this.config, defaults);
      this.counts = {
        testsStarted: 0,
        testsFinished: 0,
        failures: 0,
        skipped: 0,
        doneErrors: 0
      };
      this.allSpecs = {};
      this.suiteNestLevel = 0;
      this.jasmineIsDone = false;
      this.times = {
        suiteStart: {},
        suiteDone: {},
        specStart: {},
        specDone: {},
        jasmineStarted: 0,
        jasmineIsDone: 0
      };
      this.doneErrorNames = [];
      return;
    }

    TerminalReporter.prototype.setColorFuncs = function(colorSet) {
      var color, func;
      for (color in colorSet) {
        func = colorSet[color];
        this[color] = func;
      }
    };

    TerminalReporter.prototype.jasmineStarted = function(runner) {
      var msg;
      if (this.config.debug) {
        this.config.print("\nJasmine Starting with " + runner.totalSpecsDefined + " Specs\n");
      }
      if (this.config.verbose) {
        msg = "\nJasmine Started with " + runner.totalSpecsDefined + " Specs\n";
        this.config.print(this.colorString(msg, this.pass));
      }
      this.times.jasmineStarted = +(new Date);
    };

    TerminalReporter.prototype.jasmineDone = function() {
      var color, results, _base;
      if (this.config.debug) {
        this.config.print("\nJasmine Reports Complete\n");
        if (this.jasmineIsDone) {
          this.config.print("\nAlready seen done before\n");
        }
      }
      if (this.jasmineIsDone) {
        this.printDoneFailures();
        return;
      }
      this.jasmineIsDone = true;
      this.times.jasmineIsDone = (+(new Date)) - this.times.jasmineStarted;
      this.printFailures();
      this.printDoneFailures();
      this.config.print("\n\nFinished in " + (this.times.jasmineIsDone / 1000) + " seconds\n");
      results = ["" + this.counts.testsFinished + " Tests", "" + this.counts.failures + " Failures", "" + this.counts.skipped + " Skipped\n\n"];
      if (this.counts.failures > 0 || this.counts.testsStarted !== this.counts.testsFinished) {
        color = this.fail;
      } else {
        color = this.pass;
      }
      this.reportUnfinished();
      global.jasmineResult = {
        fail: this.counts.failures > 0
      };
      this.config.print(this.colorString(results.join(', '), color));
      if (typeof (_base = this.config).onComplete === "function") {
        _base.onComplete();
      }
    };

    TerminalReporter.prototype.reportUnfinished = function() {
      var msg;
      if (this.counts.testsStarted === this.counts.testsFinished) {
        return;
      }
      msg = "Started " + this.counts.testsStarted + " tests, but only had " + this.counts.testsFinished + " complete\n";
      return this.config.print(this.colorString(msg, this.fail));
    };

    TerminalReporter.prototype.suiteStarted = function(suite) {
      if (this.config.debug) {
        this.config.print("\nSuite " + suite.description + " Started\n");
        if (this.times.suiteStart[suite.id] != null) {
          this.config.print("\nSuite already seen before\n");
        }
      }
      if (this.times.suiteStart[suite.id] != null) {
        this.counts.doneErrors++;
        return;
      }
      this.times.suiteStart[suite.id] = +(new Date);
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
      msg += this.colorString("" + suite.description + " Start\n", this.ignore);
      return this.config.print(msg);
    };

    TerminalReporter.prototype.suiteDone = function(suite) {
      var _ref;
      if (this.config.debug) {
        this.config.print("\nSuite " + suite.description + " done\n");
        if (this.times.suiteStart[suite.id] == null) {
          this.config.print(JSON.stringify(suite));
          this.config.print("\nSuite start wasn't reported\n");
        }
      }
      if ((this.times.suiteDone[suite.id] != null) || (this.times.suiteStart[suite.id] == null)) {
        this.counts.doneErrors++;
        return;
      }
      this.suiteNestLevel--;
      this.times.suiteDone[suite.id] = (+(new Date)) - this.times.suiteStart[suite.id];
      if (this.config.verbose) {
        this.printVerboseSuiteDone(suite);
      }
      this.currentSuite = (_ref = this.currentSuite.parent) != null ? _ref : null;
    };

    TerminalReporter.prototype.printVerboseSuiteDone = function(suite) {
      var i, msg, _i, _ref;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      msg += this.colorString("" + suite.description + " Finish", this.ignore);
      msg += this.colorString(" - " + this.times.suiteDone[suite.id] + " ms\n\n", this.suiteTiming);
      return this.config.print(msg);
    };

    TerminalReporter.prototype.specStarted = function(spec) {
      if (this.times.specStart[spec.id] != null) {
        this.counts.doneErrors++;
        this.doneErrorNames.push(spec.fullName);
        return;
      }
      this.times.specStart[spec.id] = +(new Date);
      this.counts.testsStarted++;
    };

    TerminalReporter.prototype.specDone = function(spec) {
      var msg, _base, _name;
      if ((this.times.specDone[spec.id] != null) || (this.times.specStart[spec.id] == null)) {
        this.counts.doneErrors++;
        this.doneErrorNames.push(spec.fullName);
        return;
      }
      this.times.specDone[spec.id] = (+(new Date)) - this.times.specStart[spec.id];
      ((_base = this.allSpecs)[_name = this.currentSuite.id] != null ? _base[_name] : _base[_name] = []).push(spec);
      this.counts.testsFinished++;
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
          msg = this.colorString('-', this.ignore);
          break;
        case 'passed':
          msg = this.colorString('.', this.pass);
          break;
        case 'failed':
          this.counts.failures++;
          msg = this.colorString('F', this.fail);
          break;
        default:
          msg = this.colorString('U', this.fail);
      }
      return msg;
    };

    TerminalReporter.prototype.makeVerbose = function(spec) {
      var elapsed, i, msg, _i, _ref;
      elapsed = this.times.specDone[spec.id];
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      switch (spec.status) {
        case 'pending':
          this.counts.skipped++;
          msg += this.colorString("" + spec.description, this.ignore);
          break;
        case 'passed':
          msg += this.colorString("" + spec.description, this.pass);
          break;
        case 'failed':
          this.counts.failures++;
          msg += this.colorString("" + spec.description, this.fail);
          break;
        default:
          msg += this.colorString("" + spec.description, this.fail);
      }
      msg += this.colorString(" - " + elapsed + " ms\n", this.specTiming);
      return msg;
    };

    TerminalReporter.prototype.printDoneFailures = function() {
      var indent, msg, name, _i, _len, _ref;
      if (!(this.counts.doneErrors > 0)) {
        return;
      }
      this.doneErrorNames = _.uniq(this.doneErrorNames);
      this.config.print("\n\nSpec Misconfiguration: \n");
      indent = "    ";
      msg = "" + indent + "Saw " + this.counts.doneErrors + " misfires on " + this.doneErrorNames.length + " spec/suite completions\n" + indent + "This is likely because you executed more code after a `done` was called\n\n";
      this.config.print(this.colorString(msg, this.fail));
      msg = "" + indent + " Misconfigured Spec Names:\n";
      this.config.print(this.colorString(msg, this.fail));
      _ref = this.doneErrorNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        msg = "" + indent + indent + (this.colorString(name)) + "\n";
        this.config.print(this.colorString(msg, this.neutral));
      }
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
            this.config.print("\n\n" + indent + count + ") " + spec.fullName + "\n" + indent + indent + "Message:\n" + indent + indent + indent + (this.colorString(failure.message, this.fail)) + "\n");
            if (!this.config.noStackTrace) {
              stack = this.config.stackFilter(failure.stack);
              this.config.print("\n\n" + indent + indent + "Stacktrace:\n" + indent + indent + indent + stack + "\n");
            }
          }
        }
      }
    };

    TerminalReporter.prototype.colorString = function(string, color) {
      if (color == null) {
        color = this.neutral;
      }
      return "" + color + string + this.neutral;
    };

    return TerminalReporter;

  })();

  module.exports = {
    TerminalReporter: TerminalReporter
  };

}).call(this);
