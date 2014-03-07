walkdir = require 'walkdir'
path    = require 'path'
fs      = require 'fs'

createSpecObj = (path, root) ->
    return {
        path: ->
            return path
        relativePath: ->
            return path.replace(root, '').replace(/^[\/\\]/, '').replace(/\\/g, '/')
        directory: ->
            return path.replace(/[\/\\][\s\w\.-]*$/, "").replace(/\\/g, '/')
        relativeDirectory: ->
            return relativePath().replace(/[\/\\][\s\w\.-]*$/, "").replace(/\\/g, '/')
        filename: ->
            return path.replace(/^.*[\\\/]/, '')
    }

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
                    specs.push createSpecObj(wannaBeSpec)

    return specs

sortFiles = (specs) ->
  # Sorts spec paths in ascending alphabetical order to be able to
  #   run tests in a deterministic order.
  specs.sort (a, b) ->
    return a.path().localeCompare b.path()
  return specs

module.exports = {find, sortFiles}
