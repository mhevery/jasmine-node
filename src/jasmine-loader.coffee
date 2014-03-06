_                = require 'underscore'
fs               = require 'fs'
#growlReporter    = require 'jasmine-growl-reporter'
mkdirp           = require 'mkdirp'
path             = require 'path'
util             = require 'util'
vm               = require 'vm'
nodeReporters    = require './reporter'
# TODO: Make this library only need to be required once
specs            = require './spec-collection'
helperCollection = require './spec-collection'

# Begin real code
isWindowDefined = global.window?
unless isWindowDefined
    global.window =
        setTimeout    : setTimeout
        clearTimeout  : clearTimeout
        setInterval   : setInterval
        clearInterval : clearInterval

jasminejs  = __dirname + '/jasmine/jasmine-2.0.0.js';
bootjs     = __dirname + '/jasmine/boot.js';
jasmineSrc = fs.readFileSync(jasminejs);
bootSrc    = fs.readFileSync(bootjs);

# Put jasmine in the global context, this is somewhat like running in a
# browser where every file will have access to `jasmine`
vm.runInThisContext jasmineSrc, jasminejs
jasmine = vm.runInThisContext "#{bootSrc}\njasmine = window.jasmine;", bootjs

delete global.window unless isWindowDefined

jasmine.TerminalReporter = nodeReporters.TerminalReporter
# jasmine.GrowlReporter = growlReporter

# Define helper functions
jasmine.loadHelpersInFolder = (folder, matcher) ->
    # Check to see if the folder is actually a file, if so, back up to the
    # parent directory and find some helpers
    folderStats = fs.statSync folder
    folder = path.dirname(folder) if folderStats.isFile()

    helperCollection.load [folder], matcher
    helpers = helperCollection.getSpecs()

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

jasmine.executeSpecsInFolder = (options) ->
    defaults =
        regExpSpec: new RegExp ".(js)$", "i"
        stackFilter: removeJasmineFrames

    reporterOptions = _.defaults options, defaults
    jasmineEnv        = jasmine.getEnv()

    # Bind all of the rest of the functions
    global[funcName] = jasFunc for funcName, jasFunc of jasmineEnv

    specs.load options.specFolders, options.regExpSpec

    jasmineEnv.addReporter new jasmine.TerminalReporter reporterOptions

    # if options.growl?
    #   jasmineEnv.addReporter new jasmine.GrowlReporter()

    specsList = specs.getSpecs()

    for spec in specsList
        delete require.cache[spec.path()]
        # Catch exceptions in loading the spec
        try
            require spec.path().replace(/\.\w+$/, "")
        catch error
            console.log "Exception loading: #{spec.path()}"
            console.log error
            throw error

    jasmineEnv.execute()

print = (str) ->
  process.stdout.write util.format(str)

exports[key] = value for key, value of jasmine
