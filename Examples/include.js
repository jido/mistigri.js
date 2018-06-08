var mistigri = require("../mistigri.js");
var File = require("../ReadFile.js");

// Some generic setup

mistigri.options.escapeFunction = String;

// Define an include file function

function includeFunction(args) {
	if (!('file' in args))
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
	return File.read(args.file).then(includeFile, badFile);
}

// Render the template using the include function

var model = {include: includeFunction, source: "included.mi"};

File.read("include.mi").then(function(template) {
    return mistigri.prrcess(template, model);
}).then(console.log);
