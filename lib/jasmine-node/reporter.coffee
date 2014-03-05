_ = require 'underscore'
util = null

try
    util = require 'util'
catch
    util = require 'sys'

noOp = -> return

class TerminalReporter
    ANSIColors:
        pass        : (str) -> return str.green
        pass        : -> return '\x1B[32m' # Green
        fail        : -> return '\x1B[31m' # Red
        specTiming  : -> return '\x1B[34m' # Blue
        suiteTiming : -> return '\x1B[33m' # Yelow
        ignore      : -> return '\x1B[37m' # Light Gray
        neutral     : -> return '\x1B[0m'  # Normal
    NoColors:
        pass        : -> return ''
        fail        : -> return ''
        specTiming  : -> return ''
        suiteTiming : -> return ''
        ignore      : -> return ''
        neutral     : -> return ''

    constructor: (@config={}) ->
        defaults =
            callback: noOp
            includeStackTrace: false
            print: (str) ->
                process.stdout.write util.format(str)
                return
            stackFilter: (t) ->
                return t

        @config = _.defaults @config, defaults
        @config.color = if @config.color then @ANSIColors else @NoColors

        @specResults = ''
        @counts =
            tests: 0
            assertions: 0
            failures: 0
            skipped: 0
        @suites = {}
        @allSpecs = {}

        return

    # Callback for when Jasmine starts running
    # Example Packet:
    #   {
    #       "totalSpecsDefined": 3
    #   }
    jasmineStarted: (runner) =>
        @startedAt = +new Date
        return

    # Callback for when Jasmine is finished running
    jasmineDone: =>
        now = +new Date
        elapsed = now - @startedAt

        @printFailures()

        @config.print "\n\nFinished in #{elapsed/1000} seconds\n"
        results = [
            "#{@counts.tests} Tests"
            "#{null} Assertions"
            "#{@counts.failures} Failures"
            "#{@counts.skipped} Skipped\n\n"
        ]
        if @counts.failures > 0
            color = @config.color.fail()
        else
            color = @config.color.pass()

        @config.print @stringWithColor results.join(', '), color
        return

    # Callback for when a suite starts running
    # Example Packet:
    #   {
    #       "description": "jasmine-node-flat",
    #       "fullName": "jasmine-node-flat",
    #       "id": "suite1",
    #       "status": ""
    #   }
    suiteStarted: (suite) =>
        @suites[suite.id] = suite
        @currentSuite = suite
        return

    # Callback for when a suite is finished running
    # Note: nested suites will finish before their parents, maybe this will be
    #   useful information?
    # Example Packet:
    #   {
    #       "description": "jasmine-node-flat",
    #       "fullName": "jasmine-node-flat",
    #       "id": "suite1",
    #       "status": ""
    #   }
    suiteDone: (suite) =>
        return

    # Example Packet:
    #   {
    #       "description": "should pass",
    #       "failedExpectations": [],
    #       "fullName": "jasmine-node-flat should pass",
    #       "id": "spec1"
    #   }
    specStarted: (spec) =>
        @counts.tests++
        return

    # Print out failed specs
    printFailures: ->
        return unless @counts.failures > 0
        @config.print "\n\nFailures:"
        indent = "  "
        count = 1
        for suite, specs of @allSpecs
            for spec in specs
                for failure in spec.failedExpectations
                    @config.print """
\n
#{indent}#{count}) #{spec.fullName}
#{indent}#{indent}Message:
#{indent}#{indent}#{indent}#{@stringWithColor(failure.message,@config.color.fail())}
                    """
                    if @config.includeStackTrace
                        @config.print """
\n
#{indent}#{indent}Stacktrace:
#{indent}#{indent}#{indent}#{failure.stack}
                        """

        return

    stringWithColor: (string, color=@config.color.neutral()) ->
        return "#{color}#{string}#{@config.color.neutral()}"

    # Prints out the status for the completed spec
    # Example Failure:
    #   {
    #       "description": "should pass",
    #       "failedExpectations": [
    #           {
    #               "actual": 3,
    #               "expected": 4,
    #               "matcherName": "toEqual",
    #               "message": "Expected 3 to equal 4.",
    #               "passed": false,
    #               "stack": "Error: Expected 3 to equal 4.\n at stack (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:1293:17)\n at buildExpectationResult (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:1270:14)\n at Spec.Env.expectationResultFactory (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:484:18)\n at Spec.addExpectationResult (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:260:46)\n at Expectation.addExpectationResult (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:442:21)\n at Expectation.toEqual (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:1209:12)\n at Object.<anonymous> (/Users/cmoultrie/Git/jasmine-node/spec/TestSpec.js:8:17)\n at attemptSync (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:1510:12)\n at QueueRunner.run (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:1498:9)\n at QueueRunner.execute (/Users/cmoultrie/Git/jasmine-node/lib/jasmine-node/jasmine-2.0.0.js:1485:10)"
    #           }
    #       ],
    #       "fullName": "jasmine-node-flat should pass",
    #       "id": "spec1",
    #       "status": "failed"
    #   }
    # Example Success:
    #   {
    #       "description": "should pass",
    #       "failedExpectations": [],
    #       "fullName": "jasmine-node-flat should pass",
    #       "id": "spec0",
    #       "status": "passed"
    #   }
    specDone: (spec) ->
        (@allSpecs[@currentSuite.id] ?= []).push spec
        msg = ''
        switch spec.status
            when 'skipped'
                @counts.skipped++
                msg = @stringWithColor '-', @config.color.ignore()
            when 'passed'
                msg = @stringWithColor '.', @config.color.pass()
            when 'failed'
                @counts.failures++
                msg = @stringWithColor 'F', @config.color.fail()
            else
                msg = @stringWithColor 'U', @config.color.fail()
        @specResults += msg
        @config.print msg
        return

exports.terminalReporters = {TerminalReporter, TerminalVerboseReporter:TerminalReporter}
