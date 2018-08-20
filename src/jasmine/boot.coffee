growlReporter  = require 'jasmine-growl-reporter'
nodeReporters  = require '../reporter'
junitReporter  = require '../junit-reporter'

# Node Translation of the Jasmine boot.js file. Seems to work quite well
boot = (jasmineRequire, clockCallback) ->
    jasmine = jasmineRequire.core jasmineRequire
    ###
    Helper function for readability above.
    ###
    extend = (destination, source) ->
        for name, property of source
            destination[name] = property
        return destination

    ###
    Create the Jasmine environment. This is used to run all specs in a project.
    ###
    env = jasmine.getEnv()

    # Attach our reporters
    jasmine.TerminalReporter = nodeReporters.TerminalReporter
    jasmine.JUnitReporter    = junitReporter.JUnitReporter
    jasmine.GrowlReporter    = growlReporter

    # Focussed spec and suite holders
    focusedSuites = []
    focusedSpecs = []
    insideFocusedSuite = false

    focuseSpec = (env, description, body) ->
        spec = env.it description, body
        focusedSpecs.push spec.id
        spec

    focuseSuite = (env, description, body) ->
        return env.describe(description, body) if insideFocusedSuite
        insideFocusedSuite = true
        suite = env.describe(description, body)
        insideFocusedSuite = false
        focusedSuites.push suite.id
        suite

    wrapSpecFunc = (func) ->
        spec =
            done: false
            doneFunc: -> return
            returned: false
        wrappedFunc = func
        wrappedDone = ->
            spec.done = true
            if spec.returned
                return spec.doneFunc()
            return

        if func?.length
            wrappedFunc = (done) ->
                spec.doneFunc = done
                func.call(@, wrappedDone)
                spec.returned = true
                if spec.done
                    return spec.doneFunc()
                return

        wrappedFunc

    ###
    ## The Global Interface
    *
    Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
    ###
    jasmineInterface =
        describe: (description, specDefinitions) ->
            return env.describe description, specDefinitions

        ddescribe: (description, specDefinitions) ->
            return focuseSuite env, description, specDefinitions

        xdescribe: (description, specDefinitions) ->
            return env.xdescribe description, specDefinitions

        it: (desc, func) ->
            return env.it desc, wrapSpecFunc(func)

        iit: (desc, func) ->
            return focuseSpec env, desc, wrapSpecFunc(func)

        xit: (desc, func) ->
            return env.xit desc, func

        beforeEach: (beforeEachFunction) ->
            return env.beforeEach(beforeEachFunction)

        afterEach: (afterEachFunction) ->
            return env.afterEach(afterEachFunction)

        expect: (actual) ->
            return env.expect(actual)

        pending: ->
            return env.pending()

        spyOn: (obj, methodName) ->
            return env.spyOn(obj, methodName)

        # setTimeout: (callback, millis) ->
        #     return env.clock.setTimeout(callback, millis)

        # setInterval: (callback, millis) ->
        #     return env.clock.setInterval(callback, millis)

    ###
    Add all of the Jasmine global/public interface to the proper global, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
    ###
    extend global, jasmineInterface
    global.jasmine = jasmine

    env.executeFiltered = ->
        if focusedSpecs.length
          env.execute focusedSpecs
        else if focusedSuites.length
          env.execute focusedSuites
        else
          env.execute()

    clockInstaller = jasmine.currentEnv_.clock.install
    clockUninstaller = jasmine.currentEnv_.clock.uninstall
    jasmine.currentEnv_.clock.install = ->
        clockCallback(true, env.clock)
        return clockInstaller()
    jasmine.currentEnv_.clock.uninstall = ->
        clockCallback(false, env.clock)
        return clockUninstaller()

    ###
    Expose the interface for adding custom equality testers.
    ###
    jasmine.addCustomEqualityTester = (tester) ->
        env.addCustomEqualityTester tester

    ###
    Expose the interface for adding custom expectation matchers
    ###
    jasmine.addMatchers = (matchers) ->
        return env.addMatchers matchers

    ###
    Expose the mock interface for the JavaScript timeout functions
    ###
    jasmine.clock = ->
        return env.clock

    return jasmine

module.exports = {boot}
