var mistigri = require("../mistigri.js");
var fs = require("fs");

// Some generic setup

mistigri.options.escapeFunction = String;

function readFile(name, options) {
    return new Promise(function fsReadFile(fulfill, reject) {
        var fsCallback = function fsCallback(error, data) {
            if (error) reject(error);
            else fulfill(data);
        }
        fs.readFile(name, (options === undefined) ? "utf8" : options, fsCallback);
    });
}

// This is the filter function

function uppercaseFilter(args) {
    var toUpper = function toUpper(text) {
        return text.toLocaleUpperCase();
    }
    
    if ('$invertBlock' in args) // we are inside a block
    {
        return mistigri.prrcess(args.$template, args.$model).then(toUpper);
    }
    else
    {
        return toUpper(args.text);
    }
}

// Render the template using the filter

readFile("filter.mi").then(function(template) {
    return mistigri.prrcess(template, {
        CAPS: uppercaseFilter
    });
}).then(console.log);
