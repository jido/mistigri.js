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

mistigri.prrcess("({{test}})", {test: "xyz"}, {}, test("(xyz)"));
mistigri.prrcess("({{tests}})", {test: "xyz"}, {}, test("(N/A)"));
mistigri.prrcess("({{test}})", {test: -103}, {}, test("(-103)"));
mistigri.prrcess("({{test yes='T'}})", {test: true}, {}, test("(T)"));
mistigri.prrcess("({{test no='F'}})", {test: false}, {}, test("(F)"));
mistigri.prrcess("({{test}})", {test: {toString: function() {return this.x}, x: "O"}}, {}, test("(O)"));
mistigri.prrcess("({{test.x}})", {test: {x: "O"}}, {}, test("(O)"));
mistigri.prrcess("({{test.z}})", {test: {x: "O"}}, {}, test("(N/A)"));
mistigri.prrcess("({{#test}}{{x}}{{/test}})", {test: {x: "O"}}, {}, test("(O)"));

mistigri.prrcess("({{ \ntest}})", {test: "xyz"}, {}, test("(xyz)"));
mistigri.prrcess("({{  test\t \n}})", {test: "xyz"}, {}, test("(xyz)"));
mistigri.prrcess("({{test{{x}}}})", {test: "xyz"}, {}, test("(xyzN/A}})"));
mistigri.prrcess("({{test{{x}})", {test: "xyz"}, {}, test("(xyzN/A)"));
mistigri.prrcess("({{x{{test}})", {test: "xyz"}, {}, test("(N/Axyz)"));
mistigri.prrcess("(,testm)", {test: "xyz"}, {openBrace: ",", closeBrace: "m"}, test("(xyz)"));
mistigri.prrcess("(,tests)", {test: "xyz"}, {openBrace: ",", closeBrace: "s"}, test("(N/Ats)"));
mistigri.prrcess("({{test 103}})", {test: "xyz"}, {}, test("(xyz)"));
mistigri.prrcess("({{test x=103}})", {test: "xyz"}, {}, test("(xyz)"));
mistigri.prrcess("({{test x=103=15}})", {test: "xyz"}, {}, test("(xyz)"));
mistigri.prrcess("(*{{test}}|+{{test}})", {test: "xyz"}, {}, test("(*xyz|+xyz)"));

mistigri.prrcess("({{test x=103}})", {test: function(o) {return o.x + 1}}, {}, test("(104)"));
mistigri.prrcess("({{test x=+1.0e2}})", {test: function(o) {return o.x + 1}}, {}, test("(101)"));
mistigri.prrcess("({{test x=103 y =1}})", {test: function(o) {return o.x + o.y}}, {}, test("(104)"));
mistigri.prrcess("({{test \\x=103}})", {test: function(o) {return o["\\1"]}}, {}, test("(103)"));
mistigri.prrcess("({{test x=1\\03}})", {test: function(o) {return o.x}}, {}, test("(1)"));

mistigri.prrcess("({{#test}}*{{.}}+{{/test}})", {test: "xyz"}, {}, test("(*xyz+)"));
mistigri.prrcess("({{^test}}*{{.}}+{{/test}})", {test: ""}, {}, test("(*N/A+)"));
try {
    mistigri.prrcess("({{test.toExponential}})", {test: 103.9}, {}, test("Should fail"));
} catch (e) {test("Type error")(e.message)}
mistigri.prrcess("({{test.toExponential}})", {test: 103.9}, {methodCall: true}, test("(1e+2)"));
mistigri.prrcess("({{test.trim}})", {test: " xyz "}, {methodCall: true}, test("(xyz)"));

mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return "z"}}, {}, test("(xy`z)"));
mistigri.prrcess("({{test1}}`{{test2}})", {test2: "xy", test1: function(o) {return "z"}}, {}, test("(z`xy)"));
mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return true}}, {}, test("(xy`true)"));

mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return function(p) {return "z"}}}, {}, test("(xy`z)"));

mistigri.prrcess("{{>start}}{{test}}{{>end}}", {test: "xyz"}, {reader: 
    mistigri.feed({start: "(", end: ")"})}, test("(xyz)"));
mistigri.prrcess("({{>middle test='xyz'}})", {}, {reader: 
    mistigri.feed({middle: "{{test}}"})}, test("(xyz)"));
mistigri.prrcess("({{>middle}})", {test: "xyz"}, {reader: 
    mistigri.feed({middle: "{{test}}"})}, test("(N/A)"));
mistigri.prrcess("({{>middle test='xyz'}},{{>middle test='abc'}})", {}, {reader: 
    mistigri.feed({middle: "{{test}}"})}, test("(xyz,abc)"));
mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test='abc'}}{{/test}})", {test: 103}, {reader: 
    mistigri.feed({middle: "{{test}}"})}, test("(xyz,abc)"));
mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test=$item}}{{/test}})", {test: 103}, {reader: 
    mistigri.feed({middle: "{{test}}"})}, test("(xyz,103)"));

mistigri.prrcess("({{#let a=103}}{{a}}{{/let}})", {let: function(args) {return args}}, {}, test("(103)"));
mistigri.prrcess("({{#inject}}{{>middle model=model}}{{/inject}})", {inject: function(o) {return {model: o.$model}}, test: 103}, {reader:
    mistigri.feed({middle: "{{model.test}}"})}, test("(103)"));

mistigri.prrcess("({{>first}})", {}, {reader: 
    mistigri.feed({first: "+{{>second}}*{{>second}}", second: "xyz"})}, test("(+xyz*xyz)"));
mistigri.prrcess("({{>second render='no'}}{{>first}})", {}, {reader: 
    mistigri.feed({first: "+{{>second}}*{{>second}}", second: "xyz"})}, test("(+xyz*xyz)"));
