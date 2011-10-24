exports.executeJsRunner = function(specCollection, done, jasmineEnv) {
  var specs,
      specLoader = require('./requirejs-spec-loader'),
      requirejs = require('requirejs'),
      fs = require('fs');

  specs = specCollection.getRelativeSpecPaths();

  process.chdir(specCollection.getRootPath());

  requirejs.config({
    baseUrl: './',
    nodeRequire: require
  });

  specLoader.defineLoader(requirejs);

  for (var i = 0, len = specs.length; i < len; i++) {
    requirejs(specs[i]);
  }

  specLoader.executeWhenAllSpecsAreComplete(jasmineEnv);
};
