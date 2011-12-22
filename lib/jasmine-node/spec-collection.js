  var fs = require('fs'),
      createSpecObj = function(path, root) {
        return {
          path: function() { return path; },
          relativePath: function() { return path.replace(root, '').replace(/^[\/\\]/, ''); },
          directory: function() { return path.replace(/[\/\\][\s\w\.-]*$/, ""); },
          relativeDirectory: function() { return relativePath().replace(/[\/\\][\s\w\.-]*$/, ""); },
          filename: function() { return path.replace(/^.*[\\\/]/, ''); }
        };
      },
      getFiles = function(dir) {
        if(isDir(dir)){
          try {
            return fs.readdirSync(dir);
          } catch (err) {
            if(err.code === 'ENOENT') {
              return [];
            } else {
              throw err;
            }
          }
        } else {
          return [];
        }
      },
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
      getAllSpecFiles = function(path, matcher, root) {
        var specs = [];

        if (isFile(path) && path.match(matcher)) {
          specs.push(createSpecObj(path, root));
        } else if(isDir(path)) {
          var files = getFiles(path);

          for (var i = 0, len = files.length; i < len; i++) {
            var filename = path + '/' + files[i];

            if(isFile(filename) && filename.match(matcher)) {
              specs.push(createSpecObj(filename, root));
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
      specs = [];

exports.load = function(path, matcher) {
  var root;

  if (isDir(path)) {
    root = path;
  } else {
    root = path.replace(/[\/\\][\s\w\.-]*$/, "");
  }

  getAllSpecFiles(path, matcher, root).forEach(function(s){
    specs.push(s);
  });
};

exports.getSpecs = function() {
  return specs;
};
