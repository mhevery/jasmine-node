_ = require 'underscore'
util = null

try
    util = require 'util'
catch
    util = require 'sys'

noOp = -> return

class TerminalReporter
    ANSIColors:
        pass        : -> return '\x33[32m' # Green
        fail        : -> return '\x33[31m' # Red
        specTiming  : -> return '\x33[34m' # Blue
        suiteTiming : -> return '\x33[33m' # Yelow
        ignore      : -> return '\x33[37m' # Light Gray
        neutral     : -> return '\x33[0m'  # Normal
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

        return

    jasmineStarted: (runner) =>
        @startedAt = +new Date
        return

    jasmineDone: (runner) =>
        now = +new Date
        elapsed = now - @startedAt
        console.log "Completed in #{elapsed}ms"
        return

    suiteStarted: (suite) =>
        return

    suiteDone: (suite) =>
        return

    specStarted: (spec) =>
        return

    specDone: (spec) =>
        return

exports.terminalReporters = {TerminalReporter, TerminalVerboseReporter:TerminalReporter}
