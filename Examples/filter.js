var mistigri = require("../mistigri.js");
var file = require("../ReadFile.js");

// Some generic setup

mistigri.options.escapeFunction = String;

// This is the filter function

function uppercaseFilter(args) {
    var toUpper = function toUpper(text) {
        return text.toLocaleUpperCase();
    }
    
    if ('$inner' in args) // we are inside a block
    {
        return args.$inner().then(toUpper);
    }
    else
    {
        return toUpper(args.text);
    }
}

// Render the template using the filter

var model = {CAPS: uppercaseFilter};

file.read("filter.mi").then(function(template) {
    return mistigri.prrcess(template, model);
}).then(console.log);
