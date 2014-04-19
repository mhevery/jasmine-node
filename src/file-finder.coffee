fs      = require 'fs'
path    = require 'path'
walkdir = require 'walkdir'

find = (loadpaths, matcher) ->
    wannaBeSpecs = []
    specs = []
    walkOpts =
        follow_symlinks: true
        no_return:true
    fileTester = (filePath, stat) ->
        try
            return unless fs.statSync(filePath).isFile()
        catch
            console.error "Couldn't stat file: #{filePath}"
            return

        basename = path.basename(filePath)
        isInNodeModules = /.*node_modules.*/.test(filePath)
        if matcher.test(basename) and not isInNodeModules
            specs.push filePath
        return

    for loadpath in loadpaths
        walkdir.sync loadpath, walkOpts, fileTester

    return specs

sortFiles = (specs) ->
  # Sorts spec paths in ascending alphabetical order to be able to
  #   run tests in a deterministic order.
  specs.sort (a, b) ->
    return a.localeCompare b
  return specs

module.exports = {find, sortFiles}
