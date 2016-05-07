var mistigri = require("../mistigri.js");
var fs = require("fs");

mistigri.options.escapeFunction = String;

// A filter function which converts to uppercase

function uppercaseFilter(args) {
    var toUpper = function toUpper(text) {
        return text.toLocaleUpperCase();
    }
    
    if ('$invertBlock' in args) // we are inside a block
    {
        return toUpper(mistigri.prrcess(args.$template, args.$model).toString());
        // The above assumes no includes.
        // If there were includes the function would use promises instead:
        // return mistigri.prrcess(args.$template, args.$model).then(toUpper);
    }
    else
    {
        return toUpper(args.text);
    }
}

// Render the template using the filter

fs.readFile("filter.mi", "utf8", function(error, template) {
    if (error) throw error;
    console.log("" + mistigri.prrcess(template, {
        CAPS: uppercaseFilter
    }));
});
