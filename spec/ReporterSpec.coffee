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
      expect(@reporter.config.color).toEqual jasmineNode.TerminalReporter::ANSIColors
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

  describe "when the report runner starts", ->
    beforeEach ->
      @spy = spyOn(@reporter.config, "print")
      runner = totalSpecsDefined: 3
      @reporter.jasmineStarted runner
      return

    it "sets the startedAt field", ->
      # instanceof does not work cross-context (such as when run with requirejs)
      expect(+@reporter.startedAt).toBe +new Date()
      return

    it "buildes the suites collection", ->
      suite =
        description: "jasmine-node-flat"
        fullName: "jasmine-node-flat"
        id: "suite1"
        status: ""

      @reporter.suiteStarted suite
      expect(+@reporter.suiteTimes["suite1"]).toEqual jasmine.any(Number)
      return

    return

  return

