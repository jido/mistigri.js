var mistigri = require("./mistigri.js");
mistigri.options.escapeFunction = String;

var id = 1;
function test(run, expected) {
    var end_test = function end_test(id) {
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
        }
    }
	var unexpected_error = function unexpected_error(id) {
		return function(err) {
			console.error(id + " - " + err.name + ": " + err.message + ": FAIL" +
				"\nExpected - " + expected + "\nCaught an error instead.")
		}
	}
    run.then(end_test(id), unexpected_error(id));
    ++id;
}

test(mistigri.prrcess("({{test}})", {test: "xyz"}), "(xyz)");
test(mistigri.prrcess("({{tests}})", {test: "xyz"}), "(N/A)");
test(mistigri.prrcess("({{test}})", {test: -103}), "(-103)");
test(mistigri.prrcess("({{test yes='T'}})", {test: true}), "(T)");
test(mistigri.prrcess("({{test no='F'}})", {test: false}), "(F)");
test(mistigri.prrcess("({{test}})", {test: {toString: function() {return this.x}, x: "O"}}), "(O)");
test(mistigri.prrcess("({{test.x}})", {test: {x: "O"}}), "(O)");
test(mistigri.prrcess("({{test.z}})", {test: {x: "O"}}), "(N/A)");
test(mistigri.prrcess("({{#test}}{{x}}{{/test}})", {test: {x: "O"}}), "(O)");
test(mistigri.prrcess("({{#test}}{{x}}{{/^test}}empty{{/test}})", {test: {x: "O"}}), "(O)");
test(mistigri.prrcess("({{#test}}{{x}}{{/^test}}empty{{/test}})", {test: []}), "(empty)");
test(mistigri.prrcess("({{#test}}{{x}}{{^/test}}empty{{/test}})", {test: {x: "O"}}), "(O)");
test(mistigri.prrcess("({{#test}}{{x}}{{^/test}}empty{{/test}})", {test: []}), "(empty)");

test(mistigri.prrcess("({{ \ntest}})", {test: "xyz"}), "(xyz)");
test(mistigri.prrcess("({{  test\t \n}})", {test: "xyz"}), "(xyz)");
test(mistigri.prrcess("({{test{{x}}}})", {test: "xyz"}), "(xyzN/A}})");
test(mistigri.prrcess("({{test{{x}})", {test: "xyz"}), "(xyzN/A)");
test(mistigri.prrcess("({{x{{test}})", {test: "xyz"}), "(N/Axyz)");
test(mistigri.prrcess("(,&testm)", {test: "xyz"}, {openBrace: ",", closeBrace: "m"}), "(xyz)");
test(mistigri.prrcess("(,&tests)", {test: "xyz"}, {openBrace: ",", closeBrace: "s"}), "(N/Ats)");
test(mistigri.prrcess("({{test 103}})", {test: "xyz"}), "(xyz)");
test(mistigri.prrcess("({{test x=103}})", {test: "xyz"}), "(xyz)");
test(mistigri.prrcess("({{test x=103=15}})", {test: "xyz"}), "(xyz)");
test(mistigri.prrcess("(*{{test}}|+{{test}})", {test: "xyz"}), "(*xyz|+xyz)");

test(mistigri.prrcess("({{test x=103}})", {test: function(o) {return o.x + 1}}), "(104)");
test(mistigri.prrcess("({{test x=+1.0e2}})", {test: function(o) {return o.x + 1}}), "(101)");
test(mistigri.prrcess("({{test x=103 y =1}})", {test: function(o) {return o.x + o.y}}), "(104)");
test(mistigri.prrcess("({{test \\x=103}})", {test: function(o) {return o["\\1"]}}), "(103)");
test(mistigri.prrcess("({{test x=1\\03}})", {test: function(o) {return o.x}}), "(1)");

test(mistigri.prrcess("({{# test}}*{{.}}+{{/ test}})", {test: "xyz"}), "(*xyz+)");
test(mistigri.prrcess("({{^test}}*{{.}}+{{/test}})", {test: []}), "(*N/A+)");
test(mistigri.prrcess("({{&test.toExponential}})", {test: 103.9}), "(N/A)");
test(mistigri.prrcess("({{&test.toExponential}})", {test: 103.9}, {methodCall: true}), "(1e+2)");
test(mistigri.prrcess("({{&test.trim}})", {test: " xyz "}, {methodCall: true}), "(xyz)");

test(mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return "z"}}), "(xy`z)");
test(mistigri.prrcess("({{test1}}`{{test2}})", {test2: "xy", test1: function(o) {return "z"}}), "(z`xy)");
test(mistigri.prrcess("({{test1}}`{{test2}})", {test1: "xy", test2: function(o) {return true}}), "(xy`true)");

test(mistigri.prrcess("(xy`{{test}})", {test: function(o) {return function(p) {return "z"}}}), "(xy`z)");

test(mistigri.prrcess("{{>start}}{{&test}}{{>end}}", {test: "xyz"}, {reader: 
    mistigri.feed({start: "(", end: ")"})}), "(xyz)");
test(mistigri.prrcess("({{>middle test='xyz'}})", {}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}), "(xyz)");
test(mistigri.prrcess("({{>middle}})", {test: "xyz"}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}), "(N/A)");
test(mistigri.prrcess("({{>middle test='xyz'}},{{>middle test='abc'}})", {}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}), "(xyz,abc)");
test(mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test='abc'}}{{/test}})", {test: 103}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}), "(xyz,abc)");
test(mistigri.prrcess("({{>middle test='xyz'}}{{#test}},{{>middle test=$item}}{{/test}})", {test: 103}, {reader: 
    mistigri.feed({middle: "{{&test}}"})}), "(xyz,103)");

test(mistigri.prrcess("({{#let a=103}}{{a}}{{/let}})", {let: function(args) {return args}}), "(103)");
test(mistigri.prrcess("({{#inject}}{{>middle model=model}}{{/inject}})", {inject: function(o) {return {model: o.$model}}, test: 103}, {reader:
    mistigri.feed({middle: "{{&model.test}}"})}), "(103)");

test(mistigri.prrcess("({{>first}})", {}, {reader: 
    mistigri.feed({first: "+{{>second}}*{{>second}}", second: "xyz"})}), "(+xyz*xyz)");
test(mistigri.prrcess("({{>second render='no'}}{{>first}})", {}, {reader: 
    mistigri.feed({first: "+{{>second}}*{{>second}}", second: "xyz"})}), "(+xyz*xyz)");

test(mistigri.prrcess("({{test.shift}}{{test.shift}}{{test.shift}})", {test: ["x", "y", "z"]}, {methodCall: true}), "(xyz)");
test(mistigri.prrcess("({{>rec test=test}})", {test: ["x", "y", "z"]}, {methodCall: true, reader:
    mistigri.feed({rec: "{{test.shift}}{{#test}}/{{>rec test= test}}{{/test}}"})}), "(x/y/z)");
test(mistigri.prrcess("({{> all }})", {}, {reader:
    mistigri.feed({all: "{{>first}}, {{>second}}", first: "-{{>third}}-", second: "*{{>third}}*", third: "y"})}), "(-y-, *y*)");
test(mistigri.process("{{here}}, {{here}}{{#here}}---{{here}}|{{.}}{{/here}}", {here: function(o) {return o.$position}}), "0, 10---3|18");
test(mistigri.prrcess("({{#pr}}{{test}},{{/pr}})", {pr: function(o) 
    {return mistigri.prrcess(o.$template, {test: "xyz"})}}), "(xyz,)");

test(mistigri.prrcess("{{#outer suffix='_1'}}{{$item}}({{#inner separator=', '}}{{.}} @{{$item_1}}{{/inner}}){{/outer}}", {outer:["A", "B"], inner:[1, 2, 3]}),
    "A(1 @A, 2 @A, 3 @A)B(1 @B, 2 @B, 3 @B)");
test(mistigri.prrcess("<nl><li>\n<i>{{#test tag='li'}}{{.}}{{/test}}</i> letter</li>\n</nl>", {test: ["x", "y", "z"]}),
    "<nl><li>\n<i>x</i> letter</li><li>\n<i>y</i> letter</li><li>\n<i>z</i> letter</li>\n</nl>");
test(mistigri.prrcess("({{f $invertBlock= true}}!)", {f: function(args) {return '$invertBlock' in args ? args.$template.join("Oops{{") : "xyz"}}), "(xyz!)");
test(mistigri.prrcess("({{#test separator=','}}xyz{{#test suffix='_1'}}{{.}}{{/test}} {{$item}} {{$count_1}}{{/test}})", {test: [10, 3]}), "(xyz103 10 N/A,xyz103 3 N/A)");
test(mistigri.prrcess("({{#x}}-{{^x}}103{{/^x}}abc{{/x}}*{{/x}})", {x: {x: 0}}), "(-103/^xabc*)");

test(mistigri.prrcess("{{#block}}x{{/wrong}}-abcdef{{/block}}@{{>here lad = block}}}", {block: 123}, {reader: 
    mistigri.feed({here: "hi {{lad}}!"})}), "x/wrong-abcdef@hi 123!}");
