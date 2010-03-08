require.paths.push("./lib");
var jasmine = require('jasmine');

process.mixin(global, jasmine);

jasmine.executeSpecsInFolder('spec');
