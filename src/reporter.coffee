_    = require 'underscore'
util = require 'util'

noOp = -> return

class TerminalReporter
    ANSIColors:
        pass        : '\x1B[32m' # Green
        fail        : '\x1B[31m' # Red
        specTiming  : '\x1B[34m' # Blue
        suiteTiming : '\x1B[33m' # Yelow
        ignore      : '\x1B[37m' # Light Gray
        neutral     : '\x1B[0m'  # Normal
    NoColors:
        pass        : ''
        fail        : ''
        specTiming  : ''
        suiteTiming : ''
        ignore      : ''
        neutral     : ''

    constructor: (options={}) ->
        defaults =
            noStackTrace: true
            print: (str) ->
                process.stdout.write util.format(str)
                return
            stackFilter: (t) ->
                return t
            verbose: false

        if options.noColor
            @setColorFuncs @NoColors
        else
            @setColorFuncs @ANSIColors

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
        @jasmineIsDone = false
        @times =
            suiteStart: {}
            suiteDone: {}
            specStart: {}
            specDone: {}
            jasmineStarted: 0
            jasmineIsDone: 0
        @doneErrorNames = []

        return

    setColorFuncs: (colorSet) ->
        @[color] = func for color, func of colorSet
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
            @config.print @colorString msg, @pass

        @times.jasmineStarted = +new Date
        return

    # Callback for when Jasmine is finished running
    jasmineDone: =>
        if @config.debug
            @config.print "\nJasmine Reports Complete\n"
            if @jasmineIsDone
                @config.print "\nAlready seen done before\n"

        if @jasmineIsDone
            @printDoneFailures()
            return

        @jasmineIsDone = true
        @times.jasmineIsDone = (+new Date) - @times.jasmineStarted

        @printFailures()
        @printDoneFailures()

        @config.print "\n\nFinished in #{@times.jasmineIsDone/1000} seconds\n"
        results = [
            "#{@counts.testsFinished} Tests"
            "#{@counts.failures} Failures"
            "#{@counts.skipped} Skipped\n\n"
        ]
        if @counts.failures > 0 or @counts.testsStarted isnt @counts.testsFinished
            color = @fail
        else
            color = @pass

        @reportUnfinished()

        global.jasmineResult = fail: @counts.failures > 0

        @config.print @colorString results.join(', '), color
        @config.onComplete?()
        return

    reportUnfinished: ->
        return if @counts.testsStarted is @counts.testsFinished
        msg = """
Started #{@counts.testsStarted} tests, but only had #{@counts.testsFinished} complete\n
            """
        @config.print @colorString msg, @fail

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
            if @times.suiteStart[suite.id]?
                @config.print "\nSuite already seen before\n"

        if @times.suiteStart[suite.id]?
            @counts.doneErrors++
            return
        @times.suiteStart[suite.id] = +new Date
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
        msg += @colorString "#{suite.description} Start\n", @ignore
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
            unless @times.suiteStart[suite.id]?
                @config.print JSON.stringify suite
                @config.print "\nSuite start wasn't reported\n"

        # Suite done gets called multiple times, just take the first one
        if @times.suiteDone[suite.id]? or not @times.suiteStart[suite.id]?
            @counts.doneErrors++
            return
        @suiteNestLevel--
        @times.suiteDone[suite.id] = (+new Date) - @times.suiteStart[suite.id]
        if @config.verbose
            @printVerboseSuiteDone suite
        @currentSuite = @currentSuite.parent ? null
        return

    # Prints the suite name + time
    printVerboseSuiteDone: (suite) ->
        msg = ''
        for i in [0..@suiteNestLevel]
            msg += "  "
        msg += @colorString "#{suite.description} Finish", @ignore
        msg += @colorString " - #{@times.suiteDone[suite.id]} ms\n\n", @suiteTiming
        @config.print msg

    # Example Packet:
    #   {
    #       "description": "should pass",
    #       "failedExpectations": [],
    #       "fullName": "jasmine-node-flat should pass",
    #       "id": "spec1"
    #   }
    specStarted: (spec) =>
        if @times.specStart[spec.id]?
            @counts.doneErrors++
            @doneErrorNames.push spec.fullName
            return
        @times.specStart[spec.id] = +new Date
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
        if @times.specDone[spec.id]? or not @times.specStart[spec.id]?
            @counts.doneErrors++
            @doneErrorNames.push spec.fullName
            return
        @times.specDone[spec.id] = (+new Date) - @times.specStart[spec.id]

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
                msg = @colorString '-', @ignore
            when 'passed'
                msg = @colorString '.', @pass
            when 'failed'
                @counts.failures++
                msg = @colorString 'F', @fail
            else
                msg = @colorString 'U', @fail
        return msg

    makeVerbose: (spec) ->
        elapsed = @times.specDone[spec.id]
        msg = ''
        for i in [0..@suiteNestLevel]
            msg += "  "
        switch spec.status
            when 'pending'
                @counts.skipped++
                msg += @colorString "#{spec.description}", @ignore
            when 'passed'
                msg += @colorString "#{spec.description}", @pass
            when 'failed'
                @counts.failures++
                msg += @colorString "#{spec.description}", @fail
            else
                msg += @colorString "#{spec.description}", @fail

        msg += @colorString " - #{elapsed} ms\n", @specTiming

        return msg

    # Print Done Failures
    printDoneFailures: ->
        return unless @counts.doneErrors > 0
        @doneErrorNames = _.uniq @doneErrorNames
        @config.print "\n\nSpec Misconfiguration: \n"
        indent = "    "
        msg = """
#{indent}Saw #{@counts.doneErrors} misfires on #{@doneErrorNames.length} spec/suite completions
#{indent}This is likely because you executed more code after a `done` was called
\n
            """
        @config.print @colorString msg, @fail
        msg = "#{indent} Misconfigured Spec Names:\n"
        @config.print @colorString msg, @fail
        for name in @doneErrorNames
            msg = "#{indent}#{indent}#{@colorString name}\n"
            @config.print @colorString msg, @neutral

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
#{indent}#{indent}#{indent}#{@colorString(failure.message,@fail)}\n
                    """
                    unless @config.noStackTrace
                        stack = @config.stackFilter failure.stack
                        @config.print """
\n
#{indent}#{indent}Stacktrace:
#{indent}#{indent}#{indent}#{stack}\n
                        """

        return

    colorString: (string, color=@neutral) ->
        return "#{color}#{string}#{@neutral}"

module.exports = {TerminalReporter}
