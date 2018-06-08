var mistigri = require("../mistigri.js");
var file = require("../ReadFile.js");

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

file.read("rawtext.mi").then(function(template) {
    return mistigri.prrcess(template, model);
}).then(console.log);
