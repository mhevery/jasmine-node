jasmineNode = require(__dirname + "/../lib/jasmine-node/reporter")

describe "TerminalReporter", ->
    beforeEach ->
        @reporter = new jasmineNode.TerminalReporter {}
        return

    describe "initialize", ->
        it "initializes print from config", ->
            config = print: true
            @reporter = new jasmineNode.TerminalReporter(config)
            expect(@reporter.config.print).toBeTruthy()
            return

        it "initializes color from config", ->
            config = noColor: false
            @reporter = new jasmineNode.TerminalReporter(config)
            expect(@reporter.pass).toEqual jasmineNode.TerminalReporter::ANSIColors.pass
            return

        it "initializes noStackTrace from config", ->
            config = {}
            @reporter = new jasmineNode.TerminalReporter(config)
            expect(@reporter.config.noStackTrace).toBeTruthy()
            return

        it "initializes the specCounts to an Object", ->
            config = {}
            @reporter = new jasmineNode.TerminalReporter(config)
            expect(@reporter.counts).toBeDefined()
            return

        it "sets the callback property to callback if supplied", ->
            foo = ->

            config = onComplete: foo
            @reporter = new jasmineNode.TerminalReporter(config)
            expect(@reporter.config.onComplete).toBe foo
            return

        return

    describe "Attempting to break reporter", ->
        it "Is an imaginary test", ->
            expect(true).toEqual true
        it "Uses done to hopefully die a horrible death", (done) ->
            expect(true).toBe true
            cb = ->
                expect(true).toBe(true)
                done()
            setTimeout(cb, 1000)
            expect(true).toBe true

    describe "General Tests", ->
        it "Sets the Jasmine Started At DateTime", ->
            runner =
                totalSpecsDefined: 10

            @reporter.jasmineStarted runner
            expect(@reporter.times.jasmineStarted).toBeGreaterThan 0



    describe "when the report runner starts", ->
        beforeEach ->
            @spy = spyOn(@reporter.config, "print")
            runner = totalSpecsDefined: 3
            @reporter.jasmineStarted runner
            return

        it "sets the startedAt field", ->
            # instanceof does not work cross-context (such as when run with requirejs)
            expect(+@reporter.times.jasmineStarted).toBe +new Date()
            return

        it "buildes the suites collection", ->
            suite =
                description: "jasmine-node-flat"
                fullName: "jasmine-node-flat"
                id: "suite1"
                status: ""

            @reporter.suiteStarted suite
            expect(+@reporter.times.suiteStart["suite1"]).toEqual jasmine.any(Number)
            return

        return

    return

