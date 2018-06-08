// A Promise-ready version of fs.readFile to use as reader for Mistigri

var fs = require("fs");

function readFile(name, options) {
    return new Promise(function fsReadFile(fulfill, reject) {
        var fsCallback = function fsCallback(error, data) {
            if (error) reject(error);
            else fulfill(data);
        }
        fs.readFile(name, (options === undefined) ? "utf8" : options, fsCallback);
    });
}

if (typeof module !== 'undefined') module.exports = {read: readFile};