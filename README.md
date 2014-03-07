NOTE
====

This branch is in-development. Not recommended for use

jasmine-node
======

[![Build Status](https://secure.travis-ci.org/spaghetticode/jasmine-node.png)](http://travis-ci.org/spaghetticode/jasmine-node)

This node.js module makes the wonderful [Pivotal Lab's jasmine](http://github.com/pivotal/jasmine)
spec framework available in node.js.

jasmine
-------

Version `2.0.0` of Jasmine is currently included with node-jasmine.

what's new
----------
*  Now using Jasmine 2.0.0
*  Removed Support for RequireJS
*  Removed Support for Custom Helpers (have to be inside a beforeEach)
*  Removed Custom Timeout
*  Rewrote Terminal Reporter
*  Removed TeamCity Reporter (no support for Jasmine 2.0)
*  Removed JUnit Reporter (no support for Jasmine 2.0)

install
------

To install the latest official version, use NPM:

```sh
npm install jasmine-node -g
```

To install the latest _bleeding edge_ version, clone this repository and check
out the `beta` branch.

usage
------

Write the specifications for your code in `*.js` and `*.coffee` files in the `spec/` directory.
You can use sub-directories to better organise your specs. In the specs use `describe()`, `it()` etc. exactly
as you would in client-side jasmine specs.

**Note**: your specification files must be named as `*spec.js`, `*spec.coffee` or `*spec.litcoffee`,
which matches the regular expression `/spec\.(js|coffee|litcoffee)$/i`;
otherwise jasmine-node won't find them!
For example, `sampleSpecs.js` is wrong, `sampleSpec.js` is right.

If you have installed the npm package, you can run it with:

```sh
jasmine-node spec/
```

If you aren't using npm, you should add `pwd`/lib to the `$NODE_PATH`
environment variable, then run:

```sh
node lib/jasmine-node/cli.js
```


You can supply the following arguments:
  * `--autoTest`         - rerun automatically the specs when a file changes
  * `--watchFolders PATH`- when used with --autoTest, watches the given path(s) and runs all tests if a change is detected
  * `--noColor`          - do not use color coding for output
  * `-m, --match REGEXP` - load only specs containing "REGEXPspec"
  * `--matchAll`         - relax requirement of "spec" in spec file names
  * `--verbose`          - print extra information per each test run
  * `--coffee`           - load coffee-script which allows execution .coffee files
  * `--forceExit`        - force exit once tests complete.
  * `--captureExceptions`- listen to global exceptions, report them and exit (interferes with Domains)
  * `--noStackTrace`     - suppress the stack trace generated from a test failure
  * `--version`          - show the current version
  * `-h, --help`         - display this help and exit

Individual files to test can be added as bare arguments to the end of the args.

Example:

```bash
jasmine-node --coffee spec/AsyncSpec.coffee spec/CoffeeSpec.coffee spec/SampleSpec.js
```

async tests
-----------

jasmine-node includes an alternate syntax for writing asynchronous tests. Accepting
a done callback in the specification will trigger jasmine-node to run the test
asynchronously waiting until the `done()` callback is called.

```javascript
var request = require('request');

it("should respond with hello world", function(done) {
  request("http://localhost:3000/hello", function(error, response, body){
    expect(body).toEqual("hello world");
    done();
  });
});
```

An asynchronous test will fail after `5000` ms if `done()` is not called. This timeout
can be changed by setting `jasmine.getEnv().defaultTimeoutInterval` or by passing a timeout
interval in the specification.

```javascript
var request = require('request');

it("should respond with hello world", function(done) {
  request("http://localhost:3000/hello", function(error, response, body){
    done();
  });
}, 250); // timeout after 250 ms
```

or

```javascript
var request = require('request');

jasmine.getEnv().defaultTimeoutInterval = 500;

it("should respond with hello world", function(done) {
  request("http://localhost:3000/hello", function(error, response, body){
    done();
  });  // timeout after 500 ms
});
```

Checkout [`spec/SampleSpecs.js`](https://github.com/mhevery/jasmine-node/blob/master/spec/SampleSpecs.js) to see how to use it.


exceptions
----------

Often you'll want to capture an uncaught exception and log it to the console,
this is accomplished by using the `--captureExceptions` flag. Exceptions will
be reported to the console, but jasmine-node will attempt to recover and
continue. It was decided to not change the current functionality until `2.0`. So,
until then, jasmine-node will still return `0` and continue on without this flag.

### Scenario ###

You require a module, but it doesn't exist, ie `require('Q')` instead of
`require('q')`. Jasmine-Node reports the error to the console, but carries on
and returns `0`. This messes up Travis-CI because you need it to return a
non-zero status while doing CI tests.

### Mitigation ###

Before `--captureExceptions`

```sh
> jasmine-node --coffee spec
> echo $status
0
```

Run jasmine node with the `--captureExceptions` flag.

```sh
> jasmine-node --coffee --captureExceptions spec
> echo $status
1
```


growl notifications
-------------------

Jasmine node can display [Growl](http://growl.info) notifications of test
run summaries in addition to other reports.
Growl must be installed separately, see [node-growl](https://github.com/visionmedia/node-growl)
for platform-specific instructions. Pass the `--growl` flag to enable the notifications.


development
-----------

Install the dependent packages by running:

```sh
npm install
```

Run the specs before you send your pull request and ensure all pass:

```sh
specs.sh
```

changelog
---------

*  _2.0.0_ Upgrade to Jasmine 2.0.0, remove support for legacy/unused items
*  _1.14.1_ Default to noColors if not in a TTY
*  _1.14.0_ Add support for `iit`, `ddescribe` (thanks to [mgcrea](https://github.com/mgcrea))
*  _1.13.1_ Add coffee-script support for 1.7.x (thanks to [nathancarter](https://github.com/nathancarter))
*  _1.13.0_ Added timing to the verbose reporter (thanks to [rick-kilgore](https://github.com/rick-kilgore))
*  _1.12.1_ Fixed an issue where an undefined variable caused an unhelpful
   exception in --watch Resolves #278
*  _1.12.0_
  *  Changed `util.print` to `stdout.write` (thanks to [nrstott](https://github.com/nrstott))
  *  Don’t affect line numbers with --requireJsSetup (thanks to [daviddaurelio](https://github.com/davidaurelio))
  *  Catch errors when loading helpers (thanks to [pimterry](https://github.com/pimterry))
  *  Keep autotesting until all tests have passed (thanks to [notclive](https://github.com/notclive))
*  _1.11.0 - Added Growl notification option `--growl` (thanks to
   [AlphaHydrae](https://github.com/AlphaHydrae))_
*  _1.10.2 - Restored stack filter which was accidentally removed (thanks to
   [kevinsawicki](https://github.com/kevinsawicki))_
*  _1.10.1 - `beforeEach` and `afterEach` now properly handle the async-timeout function_
*  _1.10.0 - Skipped tests now show in the terminal reporter's output (thanks
   to [kevinsawicki](https://github.com/kevinsawicki))_
*  _1.9.1 - Timeout now consistent between Async and Non-Async Calls (thanks to
   [codemnky](https://github.com/codemnky))_
*  _1.9.0 - Now re-throwing the file-not-found error, added info to README.md,
   printing version with `--version`_
*  _1.8.1 - Fixed silent failure due to invalid REGEX (thanks to
   [pimterry](https://github.com/pimterry))_
*  _1.8.0 - Fixed bug in autotest with multiple paths and added `--watch` feature
    (thanks to [davegb3](https://github.com/davegb3))_
*  _1.7.1 - Removed unneeded fs dependency (thanks to
   [kevinsawicki](https://github.com/kevinsawicki)) Fixed broken fs call in
   node `0.6` (thanks to [abe33](https://github.com/abe33))_
*  _1.7.0 - Literate Coffee-Script now testable (thanks to [magicmoose](https://github.com/magicmoose))_
*  _1.6.0 - Teamcity Reporter Reinstated (thanks to [bhcleek](https://github.com/bhcleek))_
*  _1.5.1 - Missing files and require exceptions will now report instead of failing silently_
*  _1.5.0 - Now takes multiple files for execution. (thanks to [abe33](https://github.com/abe33))_
*  _1.4.0 - Optional flag to suppress stack trace on test failure (thanks to [Lastalas](https://github.com/Lastalas))_
*  _1.3.1 - Fixed context for async tests (thanks to [omryn](https://github.com/omryn))_
*  _1.3.0 - Added `--config` flag for changeable testing environments_
*  _1.2.3 - Fixed #179, #184, #198, #199. Fixes autotest, afterEach in requirejs, terminal reporter is in jasmine object, done function missing in async tests_
*  _1.2.2 - Revert Exception Capturing to avoid Breaking Domain Tests_
*  _1.2.1 - Emergency fix for path reference missing_
*  _1.2.0 - Fixed #149, #152, #171, #181, #195. `--autotest` now works as expected, jasmine clock now responds to the fake ticking as requested, and removed the path.exists warning_
*  _1.1.1 - Fixed #173, #169 (Blocks were not indented in verbose properly, added more documentation to address #180_
*  _1.1.0 - Updated Jasmine to `1.3.1`, fixed fs missing, catching uncaught exceptions, other fixes_
