util             = require 'util'
path             = require 'path'
fs               = require 'fs'
minimist         = require 'minimist'
coffee           = require 'coffee-script/register'
_                = require 'underscore'

jasmine          = require './jasmine-loader'

# hositing not found? Don't know why it's not hoisting these
help = ->
  process.stdout.write """
USAGE: jasmine-node [--color|--noColor] [--verbose] [--coffee] directory

Options:
  --autoTest         - rerun automatically the specs when a file changes
  --watch PATH       - when used with --autoTest, watches the given path(s) and runs all tests if a change is detected
  --noColor          - do not use color coding for output
  -m, --match REGEXP - load only specs containing "REGEXPspec"
  --matchAll         - relax requirement of "spec" in spec file names
  --verbose          - print extra information per each test run
  --growl            - display test run summary in a growl notification (in addition to other outputs)
  --coffee           - load coffee-script which allows execution .coffee files
  --forceExit        - force exit once tests complete.
  --captureExceptions- listen to global exceptions, report them and exit (interferes with Domains)
  --noStackTrace     - suppress the stack trace generated from a test failure
  --version          - show the current version
  -h, --help         - display this help and exit
"""

#  --testDir          - the absolute root directory path where tests are located
#  --config NAME VALUE- set a global variable in process.env
  process.exit -1

printVersion = ->
  console.log "1.13.1"
  process.exit 0

# The following line keeps the jasmine setTimeout in the proper scope
jasmine.setTimeout  = jasmine.getGlobal().setTimeout
jasmine.setInterval = jasmine.getGlobal().setInterval

global[key] = value for key, value of jasmine

exitCode = 0
growl = false

minimistOpts =
    boolean: [
        "autoTest"
        "captureExceptions"
        "coffee"
        "forceExit"
        "growl"
        "h"
        "help"
        "matchAll"
        "noColor"
        "noStackTrace"
        "verbose"
    ]
    string: [
        "m"
        "match"
        "watch"
    ]

    alias:
        match: "m"
        help: "h"

    default:
        autoTest          : false
        captureExceptions : false
        coffee            : false
        forceExit         : false
        growl             : false
        match             : '.'
        matchAll          : false
        noColor           : false
        noStackTrace      : false
        verbose           : false

args = minimist process.argv.slice(2), minimistOpts

# Verify that our commands are valid
for key of args
    allowed = key in minimistOpts.boolean
    allowed = key in minimistOpts.string or allowed
    allowed = key is '_' or allowed
    unless allowed
        console.warn "#{key} was not a valid option"
        help()

options =
    specFolders       : []
    watchFolders      : []
    extensions        : "js"

options = _.defaults options, args

# If it's not a TTY, no color for you!
unless process.stdout.isTTY
    options.noColor = true

if args.version?
    printVersion()

if args.coffee
    options.extensions += "|coffee|litcoffee"

if args.testDir?
    unless fs.existsSync args.testDir
        throw new Error "Test root path '#{dir}' doesn't exist!"

    # NOTE: Does not look from current working directory.
    options.specFolders.push args.testDir

if args.watch?
    unless _.isArray args.watch
        args.watch = [args.watch]
    for dir in args.watch
        unless fs.existsSync dir
            throw new Error "Watch path '#{dir}' doesn't exist!"
        options.watchFolders.push dir

if args.h
    help()

for spec in args._
    if spec.match(/^\/.*/)
        options.specFolders.push spec
    else
        options.specFolders.push path.join(process.cwd(), spec)

help() if _.isEmpty options.specFolders


## Done Parsing Args...jeeeeze

# Check to see if all our files exist
for spec in options.specFolders
    continue if fs.existsSync spec
    # Uh-oh!
    console.error "File: #{spec} is missing."
    return

if options.autoTest
    options.patterns = ['**/*.js']
    if options.extensions.indexOf("coffee") isnt -1
        options.patterns.push '**/*.coffee'

    require('./autotest').start(options.specFolders, options.watchFolders, options.patterns)

    return

if options.captureExceptions
    process.on 'uncaughtException', (error) ->
        console.error error.stack ? error
        exitCode = 1
        process.exit exitCode
        return

onExit = ->
    process.removeListener "exit", onExit
    process.exit exitCode
    return

process.on "exit", onExit

options.onComplete = (runner, log) ->
    process.stdout.write "\n"
    if runner.results().failedCount is 0
        exitCode = 0
    else
        exitCode = 1

    if options.forceExit
        process.exit exitCode

for specFolder in options.specFolders
   jasmine.loadHelpersInFolder specFolder,
                               new RegExp("helpers?\\.(#{options.extensions})$", 'i')

try
    matcher = ""
    if options.match isnt minimistOpts.default.match
        matcher = options.match
    else if options.matchAll
        matcher = "#{options.match}(#{options.extensions})$"
    else
        matcher = "#{options.match}spec\\.(#{options.extensions})$"

    options.regExpSpec = new RegExp matcher, "i"
catch error
    console.error "Failed to build spec-matching regex: #{error}"
    process.exit 2

jasmine.executeSpecsInFolder options
