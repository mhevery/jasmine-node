jasmine-node
======

This node.js module makes the wonderful Pivotal Lab's jasmine (http://github.com/pivotal/jasmine) spec framework available in node.js.

usage
------

Write the specifications for your code in *.js and *.coffee files in the spec/ directory. You can use sub-directories to better organise your specs.

Run the specifications using:

    nodejs specs.js

You can supply the following arguments:

  * <pre>--color</pre>, indicates spec output should uses color to indicates passing (green) or failing (red) specs
  * <pre>--noColor</pre>, do not use color in the output
  * <pre>--verbose</pre>, verbose output as the specs are run

Checkout specs.js in the root directory and spec/SampleSpecs.js to see how to use it.
