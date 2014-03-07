_              = require 'underscore'
fs             = require 'fs'
growlReporter  = require 'jasmine-growl-reporter'
mkdirp         = require 'mkdirp'
path           = require 'path'
util           = require 'util'
vm             = require 'vm'

fileFinder     = require './file-finder'
booter         = require './jasmine/boot'
nodeReporters  = require './reporter'

# Begin real code
isWindowDefined = global.window?
unless isWindowDefined
    global.window =
        setTimeout    : setTimeout
        clearTimeout  : clearTimeout
        setInterval   : setInterval
        clearInterval : clearInterval

jasminejs  = __dirname + '/jasmine/jasmine-2.0.0.js';
jasmineSrc = fs.readFileSync(jasminejs);

# Put jasmine in the global context, this is somewhat like running in a
# browser where every file will have access to `jasmine`
vm.runInThisContext jasmineSrc, jasminejs
jasmineEnv = booter.boot global.window.jasmineRequire
# Load the jasmine variable into the scope so that you can do things like:
#   jasmine.any(Function)
jasmineEnv['jasmine'] = jasmineEnv

delete global.window unless isWindowDefined

jasmineEnv.TerminalReporter = nodeReporters.TerminalReporter
jasmineEnv.GrowlReporter = growlReporter

# Define helper functions
jasmineEnv.loadHelpersInFolder = (folder, matcher) ->
    # Check to see if the folder is actually a file, if so, back up to the
    # parent directory and find some helpers
    folderStats = fs.statSync folder
    folder = path.dirname(folder) if folderStats.isFile()

    matchedHelpers = fileFinder.find [folder], matcher
    helpers = fileFinder.sortFiles matchedHelpers

    for helper in helpers
        file = helper.path()

        try
            helper = require file.replace(/\.*$/, "")
        catch e
            console.log "Exception loading helper: #{file}"
            console.log e
            # If any of the helpers fail to load, fail everything
            throw e

        for key, help of helper
            global[key] = help

    return

removeJasmineFrames = (text) ->
    return unless text?

    lines = []
    for line in text.split /\n/
        continue if line.indexOf(jasminejs) >= 0
        lines.push line

    return lines.join "\n"

jasmineEnv.executeSpecsInFolder = (options) ->
    defaults =
        regExpSpec: new RegExp ".(js)$", "i"
        stackFilter: removeJasmineFrames

    reporterOptions = _.defaults options, defaults
    jasmine        = jasmineEnv.getEnv()

    # Bind all of the rest of the functions
    global[funcName] = jasFunc for funcName, jasFunc of jasmine

    matchedSpecs = fileFinder.find options.specFolders, options.regExpSpec

    jasmine.addReporter new jasmineEnv.TerminalReporter reporterOptions

    if options.growl
        jasmine.addReporter new jasmineEnv.GrowlReporter options.growl

    specsList = fileFinder.sortFiles matchedSpecs

    if _.isEmpty specsList
        console.error "\nNo Specs Matching #{options.regExpSpec} Found"
        console.error "Consider using --matchAll or --match REGEXP"

    for spec in specsList
        delete require.cache[spec.path()]
        # Catch exceptions in loading the spec
        try
            require spec.path().replace(/\.\w+$/, "")
        catch error
            console.log "Exception loading: #{spec.path()}"
            console.log error
            throw error

    jasmine.execute()
    return

print = (str) ->
  process.stdout.write util.format(str)

exports[key] = value for key, value of jasmineEnv
exports['setTimeout'] = jasmineEnv.getGlobal().setTimeout
exports['setInterval'] = jasmineEnv.getGlobal().setInterval
