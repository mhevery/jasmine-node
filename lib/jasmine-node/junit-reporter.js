(function() {
  var JUnitReporter, noOp, util, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  util = require('util');

  noOp = function() {};

  JUnitReporter = (function() {
    function JUnitReporter(options) {
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
        stackFilter: function(t) {
          return t;
        },
        verbose: false,
        print: console.log
      };
      this.config = _.clone(options);
      _.defaults(this.config, defaults);
      this.counts = {
        testsStarted: 0,
        testsFinished: 0,
        failures: 0,
        skipped: 0
      };
      this.allSpecs = {};
      this.suiteNestLevel = 0;
      this.done = false;
      this.suiteTimes = {};
      this.specStrings = [];
      return;
    }

    JUnitReporter.prototype.jasmineStarted = function(runner) {
      this.startedAt = +(new Date);
    };

    JUnitReporter.prototype.jasmineDone = function() {
      var elapsed, now, _base;
      if (this.done) {
        return;
      }
      this.done = true;
      now = +(new Date);
      elapsed = now - this.startedAt;
      console.log("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<testsuites disabled=\"" + this.counts.skipped + "\" failures=\"" + this.counts.failures + "\" name=\"\" tests=\"" + this.counts.testsFinished + "\" time=\"" + elapsed + "\">\n</testsuites>");
      global.jasmineResult = {
        fail: this.counts.failures > 0
      };
      if (typeof (_base = this.config).onComplete === "function") {
        _base.onComplete();
      }
    };

    JUnitReporter.prototype.reportUnfinished = function() {
      var msg;
      if (this.counts.testsStarted === this.counts.testsFinished) {
        return;
      }
      return msg = "Started " + this.counts.testsStarted + " tests, but only had " + this.counts.testsFinished + " complete\n";
    };

    JUnitReporter.prototype.suiteStarted = function(suite) {
      this.suiteTimes[suite.id] = +(new Date);
      if (this.config.verbose) {
        this.printVerboseSuiteStart(suite);
      }
      this.suiteNestLevel++;
      suite.parent = this.currentSuite;
      this.currentSuite = suite;
      this.currentSuite.specStrings = [];
    };

    JUnitReporter.prototype.printVerboseSuiteStart = function(suite) {
      var i, msg, _i, _ref;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      return this.config.print(msg);
    };

    JUnitReporter.prototype.suiteDone = function(suite) {
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

    JUnitReporter.prototype.printVerboseSuiteDone = function(suite) {
      var i, msg, _i, _ref;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      return this.config.print(msg);
    };

    JUnitReporter.prototype.specStarted = function(spec) {
      this.specStart = +(new Date);
      this.counts.testsStarted++;
    };

    JUnitReporter.prototype.specDone = function(spec) {
      var msg, _base, _name;
      ((_base = this.allSpecs)[_name = this.currentSuite.id] != null ? _base[_name] : _base[_name] = []).push(spec);
      this.counts.testsFinished++;
      if (this.config.verbose) {
        msg = this.makeVerbose(spec);
      } else {
        msg = this.makeSimple(spec);
      }
      this.config.print(msg);
    };

    JUnitReporter.prototype.makeSimple = function(spec) {
      var msg;
      msg = '';
      switch (spec.status) {
        case 'pending':
          this.counts.skipped++;
          break;
        case 'passed':
          msg = '';
          break;
        case 'failed':
          this.counts.failures++;
          break;
      }
      return msg;
    };

    JUnitReporter.prototype.makeVerbose = function(spec) {
      var elapsed, i, msg, _i, _ref;
      elapsed = (+(new Date)) - this.specStart;
      msg = '';
      for (i = _i = 0, _ref = this.suiteNestLevel; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        msg += "  ";
      }
      switch (spec.status) {
        case 'pending':
          this.counts.skipped++;
          break;
        case 'passed':
          msg = '';
          break;
        case 'failed':
          this.counts.failures++;
          break;
      }
      return msg;
    };

    JUnitReporter.prototype.printFailures = function() {
      var count, failure, indent, spec, specs, stack, suite, _i, _j, _len, _len1, _ref, _ref1;
      return;
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

    JUnitReporter.prototype.stringWithColor = function(string, color) {
      if (color == null) {
        color = this.config.color.neutral();
      }
      return "" + color + string + (this.config.color.neutral());
    };

    return JUnitReporter;

  })();

  module.exports = {
    JUnitReporter: JUnitReporter
  };

}).call(this);
