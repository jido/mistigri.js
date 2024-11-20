var mistigri = require("../mistigri.js");
var file = require("../ReadFile.js");

mistigri.options.reader = mistigri.feed({
    header: "Mistigri pages",
    footer: "(º) Meow designs",
    navigation: 
        "{{#homeTab}}||Home||  Biography  Contact{{/homeTab}}" +
        "{{#bioTab}}Home  ||Biography||  Contact{{/bioTab}}" +
        "{{#contactTab}}Home  Biography  ||Contact||{{/contactTab}}",
    home: "Welcome to my cozy basket!",
    bio: "I was born first from a litter of four. I learnt\nfrom an early age that the fittest gets fattest\nbut it pays to share...",
    contact: "https://github.com/jido/mistigri.js"
});

// Render three different pages using the same layout

file.read("layout.mi").then(function(template) {
    return mistigri.prrcess(template, {homeTab: true, body: "home"})}).then(console.log);
file.read("layout.mi").then(function(template) {
    return mistigri.prrcess(template, {bioTab: true, body: "bio"})}).then(console.log);
file.read("layout.mi").then(function(template) {
    return mistigri.prrcess(template, {contactTab: true, body: "contact"})}).then(console.log);

