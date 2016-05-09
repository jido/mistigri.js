var mistigri = require("../mistigri.js");
var fs = require("fs");

// A filter function which does not process the template

function rawFilter(args) {
    if ('$invertBlock' in args) // we are inside a block
    {
        return args.$template.join(mistigri.options.openBrace);
        // As per documentation the above recreates the text
    }
    else
    {
        return args.text;
    }
}

// A filter function which ignores its contents

function commentFilter(_) {
    return "";
}

// Render the template using the filter

var model = {raw: rawFilter, comment: commentFilter};

fs.readFile("rawtext.mi", "utf8", function(error, template) {
    if (error) throw error;
    console.log("" + mistigri.prrcess(template, model));
});
