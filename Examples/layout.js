var mistigri = require("../mistigri.js");
var fs = require("fs");

var includes = {reader: mistigri.feed({
    header: "Mistigri pages",
    footer: "(º) Meow designs",
    navigation: 
        "{{#homeTab}}||Home||{{/homeTab}}{{^homeTab}}Home{{/homeTab}} " +
        "{{#bioTab}}||Biography||{{/bioTab}}{{^bioTab}}Biography{{/bioTab}} " +
        "{{#contactTab}}||Contact||{{/contactTab}}{{^contactTab}}Contact{{/contactTab}}",
    home: "Welcome to my cozy basket!",
    bio: "I was born first from a litter of four. I learnt\nfrom an early age that it pays to share...",
    contact: "https://github.com/jido/mistigri.js"
})};

function readFile(name) {
    return new Promise(function fsReadFile(fulfill, reject) {
        var fsCallback = function fsCallback(error, data) {
            if (error) reject(error);
            fulfill(data);
        }
        fs.readFile(name, "utf8", fsCallback);
    })
}
        
readFile("layout.mi").then(function(template) {
    return mistigri.prrcess(template, {homeTab: true, body: "home"}, includes)}).then(console.log);
readFile("layout.mi").then(function(template) {
    return mistigri.prrcess(template, {bioTab: true, body: "bio"}, includes)}).then(console.log);
readFile("layout.mi").then(function(template) {
    return mistigri.prrcess(template, {contactTab: true, body: "contact"}, includes)}).then(console.log);
