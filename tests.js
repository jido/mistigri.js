var mistigri = require("./mistigri.js");
var options = {escapeFunction: String};

var id = 1;
function test(expected) {
    return function(out) {
        if (out === expected)
        {
            console.log(id + " - " + out + ": PASS");
        }
        else if (!out && expected !== "")
        {
            console.warn(id + " - " + out + ": NO OUTPUT\nExpected - " + expected);
        }
        else
        {
            console.error(id + " - " + out + ": FAIL\nExpected - " + expected);
        }
        ++id;
    }
}

mistigri.prrcess("({{test}})", {test: "xyz"}, options).then(test("(xyz)"));
mistigri.prrcess("({{tests}})", {test: "xyz"}, options).then(test("(N/A)"));
mistigri.prrcess("({{test}})", {test: -103}, options).then(test("(-103)"));
mistigri.prrcess("({{test yes='T'}})", {test: true}, options).then(test("(T)"));
mistigri.prrcess("({{test no='F'}})", {test: false}, options).then(test("(F)"));
mistigri.prrcess("({{test}})", {test: {toString: function() {return this.x}, x: "O"}}, options).then(test("(O)"));
mistigri.prrcess("({{test.x}})", {test: {x: "O"}}, options).then(test("(O)"));
mistigri.prrcess("({{test.z}})", {test: {x: "O"}}, options).then(test("(N/A)"));
mistigri.prrcess("({{#test}}{{x}}{{/test}})", {test: {x: "O"}}, options).then(test("(O)"));

mistigri.prrcess("({{ \ntest}})", {test: "xyz"}, options).then(test("(xyz)"));
mistigri.prrcess("({{  test\t \n}})", {test: "xyz"}, options).then(test("(xyz)"));
mistigri.prrcess("({{test{{x}}}})", {test: "xyz"}, options).then(test("(xyzN/A}})"));
mistigri.prrcess("({{test{{x}})", {test: "xyz"}, options).then(test("(xyzN/A)"));
mistigri.prrcess("({{x{{test}})", {test: "xyz"}, options).then(test("(N/Axyz)"));
mistigri.prrcess("(,&testm)", {test: "xyz"}, {openBrace: ",", closeBrace: "m"}).then(test("(xyz)"));
mistigri.prrcess("(,&tests)", {test: "xyz"}, {openBrace: ",", closeBrace: "s"}).then(test("(N/Ats)"));
mistigri.prrcess("({{test 103}})", {test: "xyz"}, options).then(test("(xyz)"));
mistigri.prrcess("({{test x=103}})", {test: "xyz"}, options).then(test("(xyz)"));
mistigri.prrcess("({{test x=103=15}})", {test: "xyz"}, options).then(test("(xyz)"));
mistigri.prrcess("(*{{test}}|+{{test}})", {test: "xyz"}, options).then(test("(*xyz|+xyz)"));

mistigri.prrcess("({{test x=103}})", {test: function(o) {return o.x + 1}}, options).then(test("(104)"));
mistigri.prrcess("({{test x=+1.0e2}})", {test: function(o) {return o.x + 1}}, options).then(test("(101)"));
mistigri.prrcess("({{test x=103 y =1}})", {test: function(o) {return o.x + o.y}}, options).then(test("(104)"));
mistigri.prrcess("({{test \\x=103}})", {test: function(o) {return o["\\1"]}}, options).then(test("(103)"));
mistigri.prrcess("({{test x=1\\03}})", {test: function(o) {return o.x}}, options).then(test("(1)"));

mistigri.prrcess("({{#test}}*{{.}}+{{/test}})", {test: "xyz"}, options).then(test("(*xyz+)"));
mistigri.prrcess("({{^test}}*{{.}}+{{/test}})", {test: []}, options).then(test("(*N/A+)"));
try {
    mistigri.prrcess("({{&test.toExponential}})", {test: 103.9}, options).then(test("Should fail"));
} catch (e) {test("Method Number.prototype.toExponential called on incompatible receiver undefined")(e.message)}
mistigri.prrcess("({{&test.toExponential}})", {test: 103.9}, {methodCall: true}).then(test("(1e+2)"));
mistigri.prrcess("({{&test.trim}})", {test: " xyz "}, {methodCall: true}).then(test("(xyz)"));

mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return "z"}}, options).then(test("(xy`z)"));
mistigri.prrcess("({{test1}}`{{test2}})", {test2: "xy", test1: function(o) {return "z"}}, options).then(test("(z`xy)"));
mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return true}}, options).then(test("(xy`true)"));

mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return function(p) {return "z"}}}, options).then(test("(xy`z)"));

mistigri.prrcess("{{>start}}{{&test}}{{>end}}", {test: "xyz"}, {reader: 
    mistigri.feed({start: "(", end: ")"})}).then(test("(xyz)"));
mistigri.prrcess("({{>middle test='xyz'}})", {}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}).then(test("(xyz)"));
mistigri.prrcess("({{>middle}})", {test: "xyz"}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}).then(test("(N/A)"));
mistigri.prrcess("({{>middle test='xyz'}},{{>middle test='abc'}})", options, {reader: 
    mistigri.feed({middle: "{{&test}}"})}).then(test("(xyz,abc)"));
mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test='abc'}}{{/test}})", {test: 103}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}).then(test("(xyz,abc)"));
mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test=$item}}{{/test}})", {test: 103}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}).then(test("(xyz,103)"));

mistigri.prrcess("({{#let a=103}}{{a}}{{/let}})", {let: function(args) {return args}}, options).then(test("(103)"));
mistigri.prrcess("({{#inject}}{{>middle model=model}}{{/inject}})", {inject: function(o) {return {model: o.$model}}, test: 103}, {reader:
    mistigri.feed({middle: "{{&model.test}}"})}).then(test("(103)"));

mistigri.prrcess("({{>first}})", {}, {reader: 
    mistigri.feed({first: "+{{>second}}*{{>second}}", second: "xyz"})}).then(test("(+xyz*xyz)"));
mistigri.prrcess("({{>second render='no'}}{{>first}})", {}, {reader: 
    mistigri.feed({first: "+{{>second}}*{{>second}}", second: "xyz"})}).then(test("(+xyz*xyz)"));

mistigri.prrcess("({{&test.shift}}{{&test.shift}}{{&test.shift}})", {test: ["x", "y", "z"]}, {methodCall: true}).then(test("(xyz)"));
mistigri.prrcess("({{>rec test=test}})", {test: ["x", "y", "z"]}, {methodCall: true, reader:
    mistigri.feed({rec: "{{&test.shift}}{{#test}}/{{>rec test= test}}{{/test}}"})}).then(test("(x/y/z)"));
mistigri.prrcess("({{> all }})", {}, {reader:
    mistigri.feed({all: "{{>first}}, {{>second}}", first: "-{{>third}}-", second: "*{{>third}}*", third: "y"})}).then(test("(-y-, *y*)"))
mistigri.process("{{here}}, {{here}}{{#here}}---{{here}}|{{.}}{{/here}}", {here: function(o) {return o.$position}}, options).then(test("0, 10---3|18"));
