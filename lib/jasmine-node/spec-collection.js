var collection = (function() {
  var fs = require('fs'),
      isFile = function(path) {
        var isFile = false;

        // fs.fstatSync will pass ENOENT from stat(2) up
        // the stack. That's not particularly useful right now,
        // so try and continue...
        try {
          isFile = fs.statSync(path).isFile();
        } catch (err) {
          if (err.code === 'ENOENT') {
            isFile = false;
          } else {
            throw err;
          }
        }

        return isFile;
      },
      isDir = function(path) {
        var isDir = false;

        // fs.fstatSync will pass ENOENT from stat(2) up
        // the stack. That's not particularly useful right now,
        // so try and continue...
        try {
          isDir = fs.statSync(path).isDirectory();
        } catch (err) {
          if (err.code === 'ENOENT') {
            isDir = false;
          } else {
            throw err;
          }
        }

        return isDir;
      },
      getAllSpecFiles = function(path, matcher) {
        var specs = [];

        if (fs.statSync(path).isFile() && path.match(matcher)) {
          specs.push(path);
        } else {
          var files = fs.readdirSync(path);

          for (var i = 0, len = files.length; i < len; i++) {
            var filename = path + '/' + files[i];

            if(isFile(filename) && filename.match(matcher)) {
              specs.push(filename);
            } else if (isDir(filename)) {
              var subFiles = getAllSpecFiles(filename, matcher);

              subFiles.forEach(function(result) {
                specs.push(result);
              });
            }
          }
        }

        return specs;
      },
      specs = [],
      relativeSpecs = [],
      root,
      publicExposure = {
        load: function(path, matcher) {
          specs = getAllSpecFiles(path, matcher);

          if (fs.statSync(path).isDirectory()) {
            root = path;
          } else {
            root = path.replace(/[\/\\][\s\w\.-]*$/, "");
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
