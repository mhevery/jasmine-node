_             = require 'underscore'
child_process = require 'child_process'
fs            = require 'fs'
gaze          = require 'gaze'
path          = require 'path'
walkdir       = require 'walkdir'


# Remove the `--autoTest` arg from the arglist
baseArgv = _.without process.argv, "--autoTest"

# Start in a dirty state
lastRunSuccessful = false

runExternal = (command, args, callback) ->
    child = child_process.spawn command, args
    child.stdout.on 'data', (data) ->
        process.stdout.write data

    child.stderr.on 'data', (data) ->
        process.stderr.write data

    if _.isFunction callback
        child.on 'exit', callback

    return

runEverything = ->
    # run the suite when it starts
    argv = [].concat baseArgv
    runExternal argv.shift(), argv, (code) ->
        lastRunSuccessful = code is 0
        return
    return

start = (loadPaths, watchFolders, patterns) ->
    watchPatterns = null

    loadPathFunc = (loadPath) ->
        # If loadPath is just a single file, we should just watch that file
        stats = fs.statSync loadPath
        if stats.isFile()
            watchPatterns = loadPath
        else
            watchPatterns = patterns.map (p) ->
                return path.join loadPath, p

        changedFunc = (event, file) ->
            console.log "#{file} was changed"

            match = path.basename(file, path.extname(file)) + ".*"
            match = match.replace new RegExp("spec", "i"), ""

            argv = [].concat baseArgv, ["--match", match]
            runExternal argv.shift(), argv, (code) ->
                # run everything if we fixed some bugs
                if code is 0
                    runEverything() unless lastRunSuccessful
                else
                    lastRunSuccessful = false

                return

        # Vim seems to change a file multiple times, with non-scientific testing
        # the only time we didn't duplicate the call to onChanged was at 2.5s
        # Passing true to have onChanged run on the leading edge of the timeout
        onChanged = _.debounce changedFunc, 2500, true

        gaze watchPatterns, (err, watcher) ->
            # Get all watched files
            console.log("Watching for changes in " + loadPath)

            # On file changed
            @on('all', onChanged)
            return


    loadPathFunc(loadPath) for loadPath in loadPaths


    watchFolders.forEach (watchPath) ->
        # If watchPath is just a single file, we should just watch that file
        stats = fs.statSync watchPath
        if stats.isFile()
            watchPatterns = watchPath
        else
            watchPatterns = patterns.map (p) ->
                return path.join watchPath, p

        # We debounce runEverything here due to the Vim issue described above.
        onChanged = _.debounce runEverything, 2500, true


        gaze watchPatterns, (err, watcher) ->
            console.log "Watching for changes in #{watchPath}"

            @on 'all', onChanged
            return

    runEverything()

module.exports = {start}
