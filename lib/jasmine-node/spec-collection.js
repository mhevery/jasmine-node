var collection = (function() {
    var findit = require('findit');
    var path = require('path');
    var fs = require('fs');
    var root;
    var specs = [];
    var relativeSpecs = [];
    var publicExposure = {
        load: function(loadpath, matcher) {
            var wannaBeSpecs = findit.sync(loadpath)

            for (var i = 0; i < wannaBeSpecs.length; i++) {
                var file = wannaBeSpecs[i];
                if (fs.statSync(file).isFile()) {
                    if (matcher.test(path.basename(file))) {
                        specs.push(file);
                    }
                }
            }

            if (fs.statSync(loadpath).isDirectory()) {
                root = loadpath;
            } else {
                root = loadpath.replace(/[\/\\][\s\w\.-]*$/, "");
            }

            for (var i = 0, len = specs.length; i < len; i++) {
                relativeSpecs.push(specs[i].replace(root, '').replace(/^[\/\\]/, ''));
            }
        },
        getRootPath: function() {
            return root;
        },
        getRelativeSpecPaths: function() {
            return relativeSpecs;
        },
        getSpecPaths: function() {
            return specs;
        }
    };

    return publicExposure;
})();

for (var key in collection) {
  exports[key] = collection[key];
}
