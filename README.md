jasmine-node
======

[![Build Status](https://travis-ci.org/tebriel/jasmine-node.png?branch=Jasmine2.0)](https://travis-ci.org/tebriel/jasmine-node)
![Dependencies](https://david-dm.org/tebriel/jasmine-node.png)

This node.js module makes the wonderful [Pivotal Lab's jasmine](http://github.com/pivotal/jasmine)
spec framework available in node.js.

jasmine
-------

Version `2.0.0` of Jasmine is currently included with node-jasmine.

requirements
------------

Requires version `10.x` of Node.js, please upgrade if you're on `0.8`, that's
just painful.

what's new
----------
*  90% Refactor, Convert to Coffee-Script
*  Isolate jasmine.js into a vm with a separate context for clean re-execution
     of specs
*  Now using Jasmine 2.0.0
*  Removed Support for RequireJS as it was buggy, confusing, and I'm pretty
     sure no one was using it.
*  Removed Support for Custom Helpers (have to be inside a beforeEach, this is
     a jasmine change, check out their docs on how to write one)
*  Removed Custom Timeout (jasmine has added a done function and
     `jasmine.DEfAULT_TIMEOUT_INTERVAL`, just use that instead of expecting a
     test to take no longer than `x` milliseconds)
*  Removed TeamCity Reporter (no support for Jasmine 2.0) will be re-added when
     support is available
*  Removed JUnit Reporter (no support for Jasmine 2.0) will be re-added when
     support is available

install
------

To install the latest official version, use NPM:

```sh
npm install -g jasmine-node
```

usage
------

Write the specifications for your code in `*Spec.js` and `*Spec.coffee` files in the `spec/` directory.
You can use sub-directories to better organise your specs. In the specs use `describe()`, `it()` etc. exactly
as you would in client-side jasmine specs.

**Note**: your specification files must be named as `*spec.js`, `*spec.coffee` or `*spec.litcoffee`,
which matches the regular expression `/spec\.(js|coffee|litcoffee)$/i`;
otherwise jasmine-node won't find them!
For example, `sampleSpecs.js` is wrong, `sampleSpec.js` is right.
You can work around this by using either `--matchAll` or `-m REGEXP`

If you have installed the npm package, you can run it with:

```sh
jasmine-node spec/
```

If you aren't using npm, you should add `pwd`/lib to the `$NODE_PATH`
environment variable, then run:

```sh
node bin/jasmine-node
```

You can also require jasmine-node as a node module

```javascript
jn = require('jasmine-node');
jn.run({specFolders:['./spec']});
```

The jasmine-node object returned contains a defaults object so that you can see
what the expected args are. Pass only the options you need (the rest will be
filled in by the defaults) to the `.run(<options>)` command and away you go!



You can supply the following arguments:
  *  `--autoTest`               -  rerun automatically the specs when a file changes
  *  `--coffee`                 -  load coffee-script which allows execution .coffee files
  *  `--help, -h`               -  display this help and exit
  *  `--junit`                  -  use the junit xml reporter
  *  `--match, -m REGEXP`       -  load only specs containing "REGEXPspec"
  *  `--matchAll`               -  relax requirement of "spec" in spec file names
  *  `--noColor`                -  do not use color coding for output
  *  `--noStackTrace`           -  suppress the stack trace generated from a test failure
  *  `--nunit`                  -  use the nunit xml reporter
  *  `--reporterConfig <file>`  -  configuration json file to use with jasmine-reporters
  *  `--verbose`                -  print extra information per each test run
  *  `--version`                -  show the current version
  *  `--watchFolders PATH`      -  when used with --autoTest, watches the given path(s) and runs all tests if a change is detected

Individual files to test can be added as bare arguments to the end of the args.

Example:

```bash
jasmine-node --coffee spec/AsyncSpec.coffee spec/CoffeeSpec.coffee spec/SampleSpec.js
```

jasmine-reporters options
-----------------

To use default options, just specify `--junit` or `--nunit`

If you want to configure, also use `--reporterConfig path/to/config.json`

### Example JSON File with known options ###

Please checkout the
[jasmine-reporters](https://github.com/larrymyers/jasmine-reporters) repo for
more configuration information and documentation

```json
{
    "savePath": "./junit-reports/",
    "consolidateAll": true,
    "consolidate": true,
    "useDotNotation": false,
    "filePrefix": ""
}
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

*  _2.0.1_ Update dependencies to resolve `npm audit` issues
*  _2.0.0_ Upgrade to Jasmine 2.0.0, remove support for legacy/unused items
*  _1.14.3_ Added 'onComplete' callback to TeamCityReporter (thanks to [JoergFiedler](https://github.com/JoergFiedler))
*  _1.14.2_ Uhhh...not sure what happened here.
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
