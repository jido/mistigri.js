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

// Define an include file function

function include(args) {
	if (!'file' in args)
	{
		return args.$placeholder;
	}
	var includeFile = function includeFile(template) {
		// Remove the cruft from args
		delete args.$template;
		delete args.$model;
		delete args.$action;
		delete args.$position;
		delete args.$placeholder;
		delete args.$invertBlock;
		delete args.$prelude;
		delete args.$ending;
		// Use args as the model (like {{>path}})
		return mistigri.prrcess(template, args);
	}
	var badFile = function badFile(error) {
		console.err(error.stack);
		return args.$placeholder;
	}
	return readFile(args.file).then(includeFile, badFile);
}

// Render the template using the include function

var model = {include: include, source: "included.mi"};

readFile("include.mi").then(function(template) {
    return mistigri.prrcess(template, model);
}).then(console.log);
