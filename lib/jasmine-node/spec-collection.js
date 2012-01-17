var findit = require('findit');
var path = require('path');
var fs = require('fs');
var specs = [];

var createSpecObj = function(path, root) {
    return {
        path: function() { return path; },
        relativePath: function() { return path.replace(root, '').replace(/^[\/\\]/, ''); },
        directory: function() { return path.replace(/[\/\\][\s\w\.-]*$/, ""); },
        relativeDirectory: function() { return relativePath().replace(/[\/\\][\s\w\.-]*$/, ""); },
        filename: function() { return path.replace(/^.*[\\\/]/, ''); }
    };
};

exports.load = function(loadpath, matcher) {

    var wannaBeSpecs = findit.sync(loadpath)

    for (var i = 0; i < wannaBeSpecs.length; i++) {
        var file = wannaBeSpecs[i];
        if (fs.statSync(file).isFile()) {
            if (matcher.test(path.basename(file))) {
                specs.push(createSpecObj(file));
            }
        }
    }
};

exports.getSpecs = function() {
  return specs;
};
