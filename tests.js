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

mistigri.prrcess("{{>start}}{{test}}{{>end}}", {test: "xyz"}, {reader: mistigri.feed({start: "(", end: ")"})}, test("(xyz)"));
mistigri.prrcess("({{>middle test='xyz'}})", {}, {reader: mistigri.feed({middle: "{{test}}"})}, test("(xyz)"));
mistigri.prrcess("({{>middle}})", {test: "xyz"}, {reader: mistigri.feed({middle: "{{test}}"})}, test("(N/A)"));
mistigri.prrcess("({{>middle test='xyz'}},{{>middle test='abc'}})", {}, {reader: mistigri.feed({middle: "{{test}}"})}, test("(xyz,abc)"));
mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test='abc'}}{{/test}})", {test: 103}, {reader: mistigri.feed({middle: "{{test}}"})}, test("(xyz,abc)"));
mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test=$item}}{{/test}})", {test: 103}, {reader: mistigri.feed({middle: "{{test}}"})}, test("(xyz,103)"));
