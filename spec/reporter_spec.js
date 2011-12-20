var reporter = require(__dirname + "/../lib/jasmine-node/reporter");

describe('TerminalReporter', function() {
  beforeEach(function() {
    var config = {}
    this.reporter = new reporter.TerminalReporter(config);
  });

  describe("initialize", function() {
    it('initializes print_ from config', function() {
      var config = { print: true };
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.print_).toBeTruthy();
    });

    it('initializes color_ from config', function() {
      var config = { color: true }
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.color_).toEqual(ANSIColors);
    });

    it('sets the started_ flag to false', function() {
      var config = {}
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.started_).toBeFalsy();
    });

    it('sets the finished_ flag to false', function() {
      var config = {}
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.finished_).toBeFalsy();
    });

    it('initializes the suites_ array', function() {
      var config = {}
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.suites_.length).toEqual(0);
    });

    it('initializes the specResults_ to an Object', function() {
      var config = {}
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.specResults_).toBeDefined();
    });

    it('initializes the failures_ array', function() {
      var config = {}
      this.reporter = new reporter.TerminalReporter(config);
      expect(this.reporter.failures_.length).toEqual(0);
    });
  });

  describe('when the report runner starts', function() {
    beforeEach(function() {
      this.spy = spyOn(this.reporter, 'printLine_');

      var runner = {
        topLevelSuites: function() {
          var suites = [];
          suite = { id: 25 };
          suites.push(suite);
          return suites;
        }
      };
      this.reporter.reportRunnerStarting(runner);
    });

    it('sets the started_ field to true', function() {
      expect(this.reporter.started_).toBeTruthy();
    });

    it('sets the startedAt field', function() {
      expect(this.reporter.startedAt instanceof Date).toBeTruthy();
    });

    it('buildes the suites_ collection', function() {
      expect(this.reporter.suites_.length).toEqual(1);
      expect(this.reporter.suites_[0].id).toEqual(25);
    });
  });

  describe('the summarize_ creates suite and spec tree', function() {
    beforeEach(function() {
      this.spec = {
        id: 1,
        description: 'the spec',
        isSuite: false
      }
    });

    it('creates a summary object from spec', function() {
      var result = this.reporter.summarize_(this.spec);

      expect(result.id).toEqual(1);
      expect(result.name).toEqual('the spec');
      expect(result.type).toEqual('spec');
      expect(result.children.length).toEqual(0);
    });

    it('creates a summary object from suite with 1 spec', function() {
      var env = { nextSuiteId: false }
      var suite = new jasmine.Suite(env, 'suite name', undefined, undefined);
      suite.description = 'the suite';
      suite.children_.push(this.spec);

      var result = this.reporter.summarize_(suite);
      expect(result.name).toEqual('the suite');
      expect(result.type).toEqual('suite');
      expect(result.children.length).toEqual(1);

      var suiteChildSpec = result.children[0];
      expect(suiteChildSpec.id).toEqual(1);
    });
  });

  describe('reportRunnerResults', function() {
    beforeEach(function() {
      this.printLineSpy = spyOn(this.reporter, 'printLine_');
    });

    it('generates the report', function() {
      var failuresSpy = spyOn(this.reporter, 'reportFailures_');
      var printRunnerResultsSpy = spyOn(this.reporter, 'printRunnerResults_').
                          andReturn('this is the runner result');

      var runner = {
        results: function() {
          var result = { failedCount: 0 };
          return result;
        },
        specs: function() { return []; }
      };
      this.reporter.startedAt = new Date();

      this.reporter.reportRunnerResults(runner);

      expect(failuresSpy).toHaveBeenCalled();
      expect(this.printLineSpy).toHaveBeenCalled();
    });
  });

  describe('reportSpecResults', function() {
    beforeEach(function() {
      this.printSpy = spyOn(this.reporter, 'print_');
      this.spec = {
        id: 1,
        description: 'the spec',
        isSuite: false,
        results: function() {
          var result = {
            passed: function() { return true; }
          }
          return result;
        }
      }
    });

    it('prints a \'.\' for pass', function() {
      this.reporter.reportSpecResults(this.spec);
      expect(this.printSpy).toHaveBeenCalledWith('.');
    });

    it('prints an \'F\' for failure', function() {
      var addFailureToFailuresSpy = spyOn(this.reporter, 'addFailureToFailures_');
      var results = function() {
        var result = {
          passed: function() { return false; }
        }
        return result;
      }
      this.spec.results = results;

      this.reporter.reportSpecResults(this.spec);

      expect(this.printSpy).toHaveBeenCalledWith('F');
      expect(addFailureToFailuresSpy).toHaveBeenCalled();
    });
  });

  describe('addFailureToFailures', function() {
    it('adds message and stackTrace to failures_', function() {
      var spec = {
        description: 'the spec',
        results: function() {
          var result = {
            items_: function() {
              var theItems = new Array();
              var item = {
                passed_: false,
                message: 'the message',
                trace: {
                  stack: 'the stack'
                }
              }
              theItems.push(item);
              return theItems;
            }.call()
          };
          return result;
        }
      };

      this.reporter.addFailureToFailures_(spec);

      var failures = this.reporter.failures_;
      expect(failures.length).toEqual(1);
      var failure = failures[0];
      expect(failure.spec).toEqual('the spec');
      expect(failure.message).toEqual('the message');
      expect(failure.stackTrace).toEqual('the stack');
    });
  });

  describe('prints the runner results', function() {
    beforeEach(function() {
      this.runner = {
        results: function() {
          var _results = {
            totalCount: 23,
            failedCount: 52
          };
          return _results;
        },
        specs: function() {
          var _specs = new Array();
          _specs.push(1);
          return _specs;
        }
      };
    });

    it('uses the specs\'s length, totalCount and failedCount', function() {
      var message = this.reporter.printRunnerResults_(this.runner);
      expect(message).toEqual('1 test, 23 assertions, 52 failures\n');
    });
  });
});
