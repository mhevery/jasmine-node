jasmine-node
======

[![Build Status](https://secure.travis-ci.org/spaghetticode/jasmine-node.png)](http://travis-ci.org/spaghetticode/jasmine-node)

This node.js module makes the wonderful Pivotal Lab's jasmine
(http://github.com/pivotal/jasmine) spec framework available in
node.js.

jasmine
-------

Version 1.3.1 of Jasmine is currently included with node-jasmine.

what's new
----------
*  Teamcity Reporter reinstated.
*  Ability to specify multiple files to test via list in command line
*  Ability to suppress stack trace with <code>--noStack</code>
*  Async tests now run in the expected context instead of the global one
*  --config flag that allows you to assign variables to process.env
*  Terminal Reporters are now available in the Jasmine Object #184
*  Done is now available in all timeout specs #199
*  <code>afterEach</code> is available in requirejs #179
*  Editors that replace instead of changing files should work with autotest #198
*  Jasmine Mock Clock now works!
*  Autotest now works!
*  Using the latest Jasmine!
*  Verbose mode tabs <code>describe</code> blocks much more accurately!
*  --coffee now allows specs written in Literate CoffeeScript (.litcoffee)

install
------

To install the latest official version, use NPM:

    npm install jasmine-node -g

To install the latest _bleeding edge_ version, clone this repository and check
out the `beta` branch.

usage
------

Write the specifications for your code in \*.js and \*.coffee files in the
spec/ directory (note: your specification files must end with either
.spec.js, .spec.coffee or .spec.litcoffee; otherwise jasmine-node won't find them!). You can use sub-directories to better organise your specs.

If you have installed the npm package, you can run it with:

    jasmine-node spec/

If you aren't using npm, you should add `pwd`/lib to the $NODE_PATH
environment variable, then run:

    node lib/jasmine-node/cli.js


You can supply the following arguments:

  * <code>--autotest</code>, provides automatic execution of specs after each change
  * <code>--coffee</code>, allow execution of .coffee and .litcoffee specs
  * <code>--color</code>, indicates spec output should uses color to
indicates passing (green) or failing (red) specs
  * <code>--noColor</code>, do not use color in the output
  * <code>-m, --match REGEXP</code>, match only specs comtaining "REGEXPspec"
  * <code>--matchall</code>, relax requirement of "spec" in spec file names
  * <code>--verbose</code>, verbose output as the specs are run
  * <code>--junitreport</code>, export tests results as junitreport xml format
  * <code>--output FOLDER</code>, defines the output folder for junitreport files
  * <code>--teamcity</code>, converts all console output to teamcity custom test runner commands. (Normally auto detected.)
  * <code>--runWithRequireJs</code>, loads all specs using requirejs instead of node's native require method
  * <code>--requireJsSetup</code>, file run before specs to include and configure RequireJS
  * <code>--test-dir</code>, the absolute root directory path where tests are located
  * <code>--nohelpers</code>, does not load helpers
  * <code>--forceexit</code>, force exit once tests complete
  * <code>--captureExceptions</code>, listen to global exceptions, report them and exit (interferes with Domains in NodeJs, so do not use if using Domains as well
  * <code>--config NAME VALUE</code>, set a global variable in process.env
  * <code>--noStack</code>, suppress the stack trace generated from a test failure

Individual files to test can be added as bare arguments to the end of the args.

Example:

`jasmine-node --coffee spec/AsyncSpec.coffee spec/CoffeeSpec.coffee spec/SampleSpecs.js`

async tests
-----------

jasmine-node includes an alternate syntax for writing asynchronous tests. Accepting
a done callback in the specification will trigger jasmine-node to run the test
asynchronously waiting until the done() callback is called.

```javascript
    it("should respond with hello world", function(done) {
      request("http://localhost:3000/hello", function(error, response, body){
        expect(body).toEqual("hello world");
        done();
      });
    });
```

An asynchronous test will fail after 5000 ms if done() is not called. This timeout
can be changed by setting jasmine.DEFAULT_TIMEOUT_INTERVAL or by passing a timeout
interval in the specification.

    it("should respond with hello world", function(done) {
      request("http://localhost:3000/hello", function(error, response, body){
        done();
      }, 250);  // timeout after 250 ms
    });

Checkout spec/SampleSpecs.js to see how to use it.

requirejs
---------

There is a sample project in `/spec-requirejs`. It is comprised of:

1.  `requirejs-setup.js`, this pulls in our wrapper template (next)
1.  `requirejs-wrapper-template`, this builds up requirejs settings
1.  `requirejs.sut.js`, this is a __SU__bject To __T__est, something required by requirejs
1.  `requirejs.spec.js`, the actual jasmine spec for testing

development
-----------

Install the dependent packages by running:

    npm install

Run the specs before you send your pull request:

    specs.sh

__Note:__ Some tests are designed to fail in the specs.sh. After each of the
individual runs completes, there is a line that lists what the expected
Pass/Assert/Fail count should be. If you add/remove/edit tests, please be sure
to update this with your PR.


changelog
---------

*  _1.6.0 - Teamcity Reporter Reinstated (thanks to [bhcleek](https://github.com/bhcleek))_
*  _1.5.1 - Missing files and require exceptions will now report instead of failing silently_
*  _1.5.0 - Now takes multiple files for execution. (thanks to [abe33](https://github.com/abe33))_
*  _1.4.0 - Optional flag to suppress stack trace on test failure (thanks to [Lastalas](https://github.com/Lastalas))_
*  _1.3.1 - Fixed context for async tests (thanks to [omryn](https://github.com/omryn))_
*  _1.3.0 - Added --config flag for changeable testing environments_
*  _1.2.3 - Fixed #179, #184, #198, #199. Fixes autotest, afterEach in requirejs, terminal reporter is in jasmine object, done function missing in async tests_
*  _1.2.2 - Revert Exception Capturing to avoid Breaking Domain Tests_
*  _1.2.1 - Emergency fix for path reference missing_
*  _1.2.0 - Fixed #149, #152, #171, #181, #195. --autotest now works as expected, jasmine clock now responds to the fake ticking as requested, and removed the path.exists warning_
*  _1.1.1 - Fixed #173, #169 (Blocks were not indented in verbose properly, added more documentation to address #180_
*  _1.1.0 - Updated Jasmine to 1.3.1, fixed fs missing, catching uncaught exceptions, other fixes_
