fs      = require 'fs'
path    = require 'path'
walkdir = require 'walkdir'

find = (loadpaths, matcher) ->
    wannaBeSpecs = []
    specs = []
    loadpaths.forEach (loadpath) ->
        wannaBeSpecs = walkdir.sync loadpath, follow_symlinks: true
        for wannaBeSpec in wannaBeSpecs
            try
                continue unless fs.statSync(wannaBeSpec).isFile()
                relative = path.relative(loadpath, wannaBeSpec)
                basename = path.basename(wannaBeSpec)
                isInNodeModules = /.*node_modules.*/.test(relative)
                if matcher.test(basename) and not isInNodeModules
                    specs.push wannaBeSpec

    return specs

sortFiles = (specs) ->
  # Sorts spec paths in ascending alphabetical order to be able to
  #   run tests in a deterministic order.
  specs.sort (a, b) ->
    return a.localeCompare b
  return specs

module.exports = {find, sortFiles}
