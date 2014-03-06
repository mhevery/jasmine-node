util             = require 'util'
path             = require 'path'
fs               = require 'fs'
minimist         = require 'minimist'
coffee           = require 'coffee-script/register'
_                = require 'underscore'

jasmine          = require './jasmine-loader'
helperCollection = require './spec-collection'

# hositing not found?
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
  --coffee           - load coffee-script which allows execution .coffee files
  --forceExit        - force exit once tests complete.
  --captureExceptions- listen to global exceptions, report them and exit (interferes with Domains)
  --noStackTrace     - suppress the stack trace generated from a test failure
  --version          - show the current version
  -h, --help         - display this help and exit
"""

#  --testDir          - the absolute root directory path where tests are located
#  --config NAME VALUE- set a global variable in process.env
#  --growl            - display test run summary in a growl notification (in addition to other outputs)
  process.exit -1

printVersion = ->
  console.log "1.13.1"
  process.exit 0

# The following line keeps the jasmine setTimeout in the proper scope
jasmine.setTimeout  = jasmine.getGlobal().setTimeout
jasmine.setInterval = jasmine.getGlobal().setInterval

global[key] = value for key, value of jasmine

exitCode          = 0
# growl = false

minimistOpts =
    boolean: [
        "autoTest"
        "captureExceptions"
        "coffee"
        "forceExit"
        "matchAll"
        "noColor"
        "noStackTrace"
        "verbose"
    ]

    alias:
        m: "match"

    default:
        autoTest          : false
        captureExceptions : false
        coffee            : false
        forceExit         : false
        matchAll          : false
        noColor           : false
        noStackTrace      : false
        verbose           : false

args = minimist process.argv.slice(2), minimistOpts

options =
    extensions        : "js"
    match             : '.'
    specFolders       : []
    watchFolders      : []

options = _.defaults options, args


if args.version?
    printVersion()

if args.coffee
    options.extensions += "|coffee|litcoffee"

if args.m? or args.match?
    options.match = args.m ? args.match

if args.testDir?
    unless fs.existsSync args.testDir
        throw new Error "Test root path '#{dir}' doesn't exist!"

    # NOTE: Does not look from current working directory.
    options.specFolders.push args.testDir

if args.watch?
    for dir in args.watch
        unless fs.existsSync nextWatchDir
            throw new Error "Watch path '#{dir}' doesn't exist!"
        options.watchFolders.push dir
if args.forceexit
    options.forceExit = true

# if args.growl
#     options.growl = true

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
    if options.matchall
        matcher = "#{options.match}(#{options.extensions})$"
    else
        matcher = "#{options.match}spec\\.(#{options.extensions})$"

    options.regExpSpec = new RegExp matcher, "i"
    #(match + (matchall ? "" : "spec\\.") + "(" + extensions + ")$", 'i')
catch error
    console.error "Failed to build spec-matching regex: #{error}"
    process.exit 2

jasmine.executeSpecsInFolder options
