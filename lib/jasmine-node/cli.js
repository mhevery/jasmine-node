var jasmine = require('jasmine-node');
var sys = require('sys'),
    Path = require('path');

var SPEC_FOLDER = Path.join(process.cwd(), 'spec'),
    SPEC_MATCHER_REGEX = "^.+[-_]spec\.(js|coffee)$",
    HELPER_MATCHER_REGEX = "^.+[-_]helper\.(js|coffee)$";

for (var key in jasmine)
  global[key] = jasmine[key];

var isVerbose = false;
var showColors = true;
var specRegex = void(0);

function escapeRegex(text)
{
  return text.replace(escapeRegex._escapeRegex, '\\$1');
}

/** The special characters in a string that need escaping for regular expressions. */
escapeRegex.specialCharacters = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

/** A regular expression that will match any special characters that need to be
    escaped to create a valid regular expression. */
escapeRegex._escapeRegex = new RegExp('(\\' + escapeRegex.specialCharacters.join("|\\") + ')', 'g');

process.argv.slice(2).forEach(function(arg, index){
  switch (arg)
  {
    case '--color':
      showColors = true;
      break;
      
    case '--noColor':
      showColors = false;
      break;
      
    case '--verbose':
      isVerbose = true;
      break;

    default:
      if (index > 1)
        specRegex = "^.*/" + escapeRegex(arg) + "\.(js|coffee)$";
      break;
  }
});

//TODO: implement this
//jasmine.loadHelpersInFolder(SPEC_FOLDER, HELPER_MATCHER_REGEX);
jasmine.executeSpecsInFolder(SPEC_FOLDER, function(runner, log){
  if (runner.results().failedCount == 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, isVerbose, showColors, specRegex);
