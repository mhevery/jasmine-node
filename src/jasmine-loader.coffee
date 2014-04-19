_              = require 'underscore'
fs             = require 'fs'
mkdirp         = require 'mkdirp'
path           = require 'path'
util           = require 'util'
vm             = require 'vm'
reporters      = require 'jasmine-reporters'

fileFinder     = require './file-finder'
booter         = require './jasmine/boot'
jasminejs      = __dirname + '/jasmine/jasmine-2.0.0.js'

# Begin real code
contextObj = {
    window: {
        setTimeout
        clearTimeout
        setInterval
        clearInterval
    }
    String
    Number
    Function
    Object
    Boolean
    setTimeout
    setInterval
    clearTimeout
    console
}

loadJasmine = ->
    jasmineSrc = fs.readFileSync jasminejs

    # Put jasmine in the global context, this is somewhat like running in a
    # browser where every file will have access to `jasmine`
    context = vm.createContext contextObj
    vm.runInContext jasmineSrc, context, jasminejs
    # Save off so that we can manually reset in case someone didn't call
    #   `uninstall`
    global.savedFunctions = {
        setTimeout
        setInterval
        clearInterval
        clearTimeout
    }

    # Because jasmine is in the vm context, it doesn't have access to our
    #   setTimeout and setInterval, let's make a bridge
    clockCallback = (installing, clock) ->
        # Let's wrap the callback and set it like it would do inside of jasmine
        if installing
            global.setTimeout = (callback, millis) ->
                return clock.setTimeout(callback, millis)
            global.setInterval = (callback, millis) ->
                return clock.setInterval(callback, millis)
            global.clearInterval = (id) ->
                return clock.clearInterval(id)
            global.clearTimeout = (id) ->
                return clock.clearTimeout(id)
        # Let's undo all that dirty work and re-install the original functions
        else
            global[key] = func for key, func of global.savedFunctions

        return

    jasmineEnv = booter.boot contextObj.window.jasmineRequire, clockCallback
    return jasmineEnv

# Define helper functions
loadHelpersInFolder = (folder, matcher) ->
    # Check to see if the folder is actually a file, if so, back up to the
    # parent directory and find some helpers
    folderStats = fs.statSync folder
    folder = path.dirname(folder) if folderStats.isFile()

    helpers = fileFinder.find [folder], matcher
    fileFinder.sortFiles helpers

    helperNames = []

    for helper in helpers
        file = helper

        try
            helperItem = require file.replace(/\.*$/, "")
        catch e
            console.log "Exception loading helper: #{file}"
            console.log e
            # If any of the helpers fail to load, fail everything
            throw e

        for key, help of helperItem
            global[key] = help
            helperNames.push key

    return global.loadedHelpers = helperNames

removeJasmineFrames = (text) ->
    return unless text?

    lines = []
    for line in text.split /\n/
        continue if line.indexOf(jasminejs) >= 0
        lines.push line

    return lines.join "\n"

executeSpecsInFolder = (options) ->
    jasmineEnv = loadJasmine()
    defaults =
        regExpSpec: new RegExp ".(js)$", "i"
        stackFilter: removeJasmineFrames

    _.defaults options, defaults
    jasmine = jasmineEnv.getEnv()

    specsList = fileFinder.find options.specFolders, options.regExpSpec

    if options.junit
        options.reporterConfigOpts ?= {}
        junit = new reporters.JUnitXmlReporter options.reporterConfigOpts
        jasmine.addReporter junit

    if options.nunit
        options.reporterConfigOpts ?= {}
        nunit = new reporters.NUnitXmlReporter options.reporterConfigOpts
        jasmine.addReporter nunit

    # If not using junit and not using nunit, Terminal Reporter!
    unless options.junit or options.nunit
        jasmine.addReporter new jasmineEnv.TerminalReporter options

    if options.growl
        jasmine.addReporter new jasmineEnv.GrowlReporter options.growl

    fileFinder.sortFiles specsList

    if _.isEmpty specsList
        console.error "\nNo Specs Matching #{options.regExpSpec} Found"
        console.error "Consider using --matchAll or --match REGEXP"

    for spec in specsList
        delete require.cache[spec]
        # Catch exceptions in loading the spec
        if options.debug
            console.log "Loading: #{spec}"
        try
            require spec
        catch error
            console.log "Exception loading: #{spec}"
            console.log error
            throw error

    jasmine.execute()
    return

module.exports = { executeSpecsInFolder, loadHelpersInFolder}
