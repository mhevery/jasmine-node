_    = require 'underscore'
util = require 'util'

noOp = -> return

class TerminalReporter
    ANSIColors:
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

    constructor: (options={}) ->
        defaults =
            color: if options.noColor then @NoColors else @ANSIColors
            noStackTrace: true
            print: (str) ->
                process.stdout.write util.format(str)
                return
            stackFilter: (t) ->
                return t
            verbose: false

        @config = _.clone options
        _.defaults @config, defaults

        @counts =
            testsStarted: 0
            testsFinished: 0
            failures: 0
            skipped: 0
            doneErrors: 0
        @allSpecs = {}
        @suiteNestLevel = 0
        @done = false
        @suiteTimeStart = {}
        @suiteTimeDone = {}
        @specTimeStart = {}
        @specTimeDone = {}
        @doneErrorNames = []

        return

    # Callback for when Jasmine starts running
    # Example Packet:
    #   {
    #       "totalSpecsDefined": 3
    #   }
    jasmineStarted: (runner) =>
        if @config.debug
            @config.print """
\nJasmine Starting with #{runner.totalSpecsDefined} Specs\n
                """
        if @config.verbose
            msg = "\nJasmine Started with #{runner.totalSpecsDefined} Specs\n"
            @config.print @stringWithColor msg, @config.color.pass()

        @startedAt = +new Date
        return

    # Callback for when Jasmine is finished running
    jasmineDone: =>
        if @config.debug
            @config.print "\nJasmine Reports Complete\n"
            if @done
                @config.print "\nAlready seen done before\n"

        if @done
            @printDoneFailures()
            return

        @done = true
        now = +new Date
        elapsed = now - @startedAt

        @printFailures()
        @printDoneFailures()

        @config.print "\n\nFinished in #{elapsed/1000} seconds\n"
        results = [
            "#{@counts.testsFinished} Tests"
            "#{@counts.failures} Failures"
            "#{@counts.skipped} Skipped\n\n"
        ]
        if @counts.failures > 0 or @counts.testsStarted isnt @counts.testsFinished
            color = @config.color.fail()
        else
            color = @config.color.pass()

        @reportUnfinished()

        global.jasmineResult = fail: @counts.failures > 0

        @config.print @stringWithColor results.join(', '), color
        @config.onComplete?()
        return

    reportUnfinished: ->
        return if @counts.testsStarted is @counts.testsFinished
        msg = """
Started #{@counts.testsStarted} tests, but only had #{@counts.testsFinished} complete\n
            """
        @config.print @stringWithColor msg, @config.color.fail()

    # Callback for when a suite starts running
    # Example Packet:
    #   {
    #       "description": "jasmine-node-flat",
    #       "fullName": "jasmine-node-flat",
    #       "id": "suite1",
    #       "status": ""
    #   }
    suiteStarted: (suite) =>
        if @config.debug
            @config.print "\nSuite #{suite.description} Started\n"
            if @suiteTimeStart[suite.id]?
                @config.print "\nSuite already seen before\n"

        if @suiteTimeStart[suite.id]?
            @counts.doneErrors++
            return
        @suiteTimeStart[suite.id] = +new Date
        @printVerboseSuiteStart(suite) if @config.verbose
        @suiteNestLevel++
        suite.parent = @currentSuite
        @currentSuite = suite
        return

    # Prints the suite name
    printVerboseSuiteStart: (suite) ->
        msg = ''
        for i in [0..@suiteNestLevel]
            msg += "  "
        msg += @stringWithColor "#{suite.description} Start\n", @config.color.ignore()
        @config.print msg

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
        if @config.debug
            @config.print "\nSuite #{suite.description} done\n"
            unless @suiteTimeStart[suite.id]?
                @config.print JSON.stringify suite
                @config.print "\nSuite start wasn't reported\n"

        # Suite done gets called multiple times, just take the first one
        if @suiteTimeDone[suite.id]? or not @suiteTimeStart[suite.id]?
            @counts.doneErrors++
            return
        @suiteNestLevel--
        @suiteTimeDone[suite.id] = (+new Date) - @suiteTimeStart[suite.id]
        if @config.verbose
            @printVerboseSuiteDone suite
        @currentSuite = @currentSuite.parent ? null
        return

    # Prints the suite name + time
    printVerboseSuiteDone: (suite) ->
        msg = ''
        for i in [0..@suiteNestLevel]
            msg += "  "
        msg += @stringWithColor "#{suite.description} Finish", @config.color.ignore()
        msg += @stringWithColor " - #{@suiteTimeDone[suite.id]} ms\n\n", @config.color.suiteTiming()
        @config.print msg

    # Example Packet:
    #   {
    #       "description": "should pass",
    #       "failedExpectations": [],
    #       "fullName": "jasmine-node-flat should pass",
    #       "id": "spec1"
    #   }
    specStarted: (spec) =>
        if @specTimeStart[spec.id]?
            @counts.doneErrors++
            @doneErrorNames.push spec.fullName
            return
        @specTimeStart[spec.id] = +new Date
        @counts.testsStarted++
        return

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
    specDone: (spec) =>
        if @specTimeDone[spec.id]? or not @specTimeStart[spec.id]?
            @counts.doneErrors++
            @doneErrorNames.push spec.fullName
            return
        @specTimeDone[spec.id] = (+new Date) - @specTimeStart[spec.id]

        (@allSpecs[@currentSuite.id] ?= []).push spec
        @counts.testsFinished++
        if @config.verbose
            msg = @makeVerbose spec
        else
            msg = @makeSimple spec

        @config.print msg
        return

    # Make a simple printing line
    makeSimple: (spec) ->
        msg = ''
        switch spec.status
            when 'pending'
                @counts.skipped++
                msg = @stringWithColor '-', @config.color.ignore()
            when 'passed'
                msg = @stringWithColor '.', @config.color.pass()
            when 'failed'
                @counts.failures++
                msg = @stringWithColor 'F', @config.color.fail()
            else
                msg = @stringWithColor 'U', @config.color.fail()
        return msg

    makeVerbose: (spec) ->
        elapsed = @specTimeDone[spec.id]
        msg = ''
        for i in [0..@suiteNestLevel]
            msg += "  "
        switch spec.status
            when 'pending'
                @counts.skipped++
                msg += @stringWithColor "#{spec.description}", @config.color.ignore()
            when 'passed'
                msg += @stringWithColor "#{spec.description}", @config.color.pass()
            when 'failed'
                @counts.failures++
                msg += @stringWithColor "#{spec.description}", @config.color.fail()
            else
                msg += @stringWithColor "#{spec.description}", @config.color.fail()

        msg += @stringWithColor " - #{elapsed} ms\n", @config.color.specTiming()

        return msg

    # Print Done Failures
    printDoneFailures: ->
        return unless @counts.doneErrors > 0
        @doneErrorNames = _.uniq @doneErrorNames
        @config.print "\n\nSpec Misconfiguration: \n"
        indent = "    "
        msg = """
#{indent}Saw #{@counts.doneErrors} misfires on #{@doneErrorNames.length} spec/suite completions
#{indent}This is likely because you executed more code after a `done()` was called
\n
            """
        @config.print @stringWithColor msg, @config.color.fail()
        msg = "#{indent} Misconfigured Spec Names:\n"
        @config.print @stringWithColor msg, @config.color.fail()
        for name in @doneErrorNames
            msg = "#{indent}#{indent}#{@stringWithColor name}\n"
            @config.print msg, @config.color.fail()

        return

    # Print out failed specs
    printFailures: ->
        return unless @counts.failures > 0
        @config.print "\n\nFailures:"
        indent = "  "
        count = 0
        for suite, specs of @allSpecs
            for spec in specs
                for failure in spec.failedExpectations
                    count++
                    @config.print """
\n
#{indent}#{count}) #{spec.fullName}
#{indent}#{indent}Message:
#{indent}#{indent}#{indent}#{@stringWithColor(failure.message,@config.color.fail())}\n
                    """
                    unless @config.noStackTrace
                        stack = @config.stackFilter failure.stack
                        @config.print """
\n
#{indent}#{indent}Stacktrace:
#{indent}#{indent}#{indent}#{stack}\n
                        """

        return

    stringWithColor: (string, color=@config.color.neutral()) ->
        return "#{color}#{string}#{@config.color.neutral()}"

module.exports = {TerminalReporter}
