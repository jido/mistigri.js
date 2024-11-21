# Mistigri.js
JavaScript template engine inspired by Mustache.

It could be called an antinome of Handlebars, extending Mustache 
without the addition of new keywords.
The main new concept is that of arguments.

[Examples](https://github.com/jido/mistigri.js/tree/master/Examples)

Supported features
-------

~~~clean
{{name}}
~~~

  Inserts the value associated with name in the model.
  
  When the value is null or undefined the default value is inserted. 
  If none is specified then a generic placeholder text is inserted.
  
  Nested values are allowed, for example "person\.name".
  
  If the name is associated with a function then this function is
  called to provide a value. See also Configuration Options.
  
~~~clean
{{name argument = value}}
~~~

  Provides an argument with a value.
  The value provided for the argument can be a number, a string within
  quotes or a name in the model.
  
  The "default" argument is used when the value associated with name
  is null or undefined.
  
  For boolean values the arguments "yes" and "no" provide the text to 
  insert.
  
  For function values the arguments are passed as an object.
  There is a convenience function that converts the arguments object into arguments to a function.
  
  Example of use:

```javascript
haveameal: mistigri.useParams("food, purr", haveMeal)
```

  When ``haveameal`` is used in the template, the Javascript function ``haveMeal()`` is called with the two named arguments in order.
  
~~~clean
{{&name}}
~~~

  Same as ``{{name}}`` except the value is not escaped.
  
  The default escape function is designed to safely insert text in an
  HTML document.
  
~~~clean
{{#name}}...{{/name}}
~~~

  Inserts the text between the tags depending on the value associated
  with name:
  
  * once if the value is not empty and is not an array
  * zero times if the value is empty. The values 0, false, null and
  undefined count as empty.
  * as many times as there are elements in the array if the value is
  an array

  The ``{{.}}`` name represents the value or the current item in the
  array.

  The "separator" argument is used to provide a text to insert between
  the elements of a list.
  
  The "tag" argument can be used to specify a HTML tag to repeat when
  there are two or more items in the array. Mistigri looks for the
  tag in the text that comes immediately before the block, stopping at
  the next enclosing block. It stops at the first Mistigri tag for the 
  close tag. This argument overrides "separator".
  For example, to insert a new table row for each person use:
  
~~~html
<table>
   <tr>
      <td>{{#person tag="TR"}}{{first_name}}</td>
      <td>{{last_name}}{{/person}}</td>
   </tr>
</table>
~~~

  Sample result:
  
~~~html
<table>
  <tr>
    <td>Simone</td>
    <td>Hamao</td>
  </tr>
  <tr>
    <td>Arturio</td>
    <td>Ganj</td>
  </tr>
</table>
~~~

  If name is associated with a function returning a string, the
  return value of this function is inserted as text. If it returns a promise then the text is inserted in place at the end of the rendering. If it returns 
  anything else, the returned value is used to decide how many times 
  to insert the text between tags.
  
  If the array item or the value associated with name is an object
  then its members are added to the model. A "suffix" argument can be
  provided to rename these members.

~~~clean
{{#name}}...{{/^name}}...{{/name}}
~~~

  Same as above with the addition of an else tag noted ``{{/^name}}``.
  If the value associated with name is empty, the text after the else
  tag is inserted; otherwise, the text before the else tag is inserted.
  
  Both ``{{/^name}}`` and ``{{^/name}}`` are recognised as an else tag.

~~~clean
{{^name}}...{{/name}}
~~~

  Inverts the condition:
  
  * the text is inserted zero times if the value is not empty
  * the text is inserted once if the value is empty

When the value is a function the special argument $invertBlock is
  set in the arguments object to indicate whether the block is inverted 
  or not.

~~~clean
{{>path}}
~~~

  Includes another template at the specified location.
  
  The path cannot contain spaces. But it can refer to an argument which is
  allowed to contain spaces, for example:

~~~clean
{{>file file = "C:\\Program Files\\MyApplication\\template.mi"}}
~~~

  All the arguments make up the model of the included template.

   This feature relies on promises to defer the output until all the data is ready. However, the returned promise can be immediately converted to text if you want to see the result before the insertion of other templates. 

  Templates are cached so they don't need to be loaded again and again,
  and the argument ``render="no"`` indicates that the template should
  only be preloaded and not rendered out.
  
~~~clean
{{! comment }}
~~~

  Does not insert anything.
  
  The comment cannot contain ``{{`` or ``}}``.

Configuration options
---

  __openBrace__ : _string_
  
  The characters that open a Mistigri tag. The default is ``{{``.
  
  __closeBrace__ : _string_
  
  The characters that close a Mistigri tag. The default is ``}}``.
  
  __placeholder__ : _string_
  
  The text to insert as placeholder when there is no appropriate 
  value to insert. The default is "N/A".
  
  __escapeFunction__ : _function(string) &#x2192; string_
  
  The escape function to use when the tag does not start with 
  ``&``. The default is to escape ``<`` and ``&``. Uses DOM if ``document`` is defined.

  Note, the default escape function is not suitable for use in HTML attributes since quotes are not escaped.
  
  __methodCall__ : _boolean_
  
  Controls the binding of "this" in function calls, which allows 
  object methods to work as expected.
  
  For security reasons the default is _false_.

  __reader__ : _function(string) &#x2192; Promise of string_
  
  A function that reads a template and returns it wrapped in a
  promise.
  
  The default is a function that fetches a template when provided
  an URI (uses the fetch API).
  
  There is also a reader generator for testing purposes which
  returns a reader when fed an object containing templates. This is
  an example of use:

~~~javascript
mistigri.process(
  "Mistigri {{>include}}",
  {},
  {
    reader: mistigri.feed({
      include: "catface &#931;:{"
    })
  }
);
~~~

  The output is:
  
~~~
Mistigri catface Σ:{
~~~

Special names added to the model
---

  __$item__
  
  The value or the current item in the array inside a block.
  
  Always refers to the current block.
  
  __$item*suffix*__
  
  If a "suffix" argument is specified, refers to $item in the 
  corresponding block.
  
  __$count__
  
  The count of the item in the array. Starts with ``1`` and increases
  by one for each additional item. If the value is not an array or the 
  block is inverted then $count is always ``1``.
  
  Always refers to the current block.
  
  __$count*suffix*__
  
  If a "suffix" argument is specified, refers to $count in the
  corresponding block.
  
  __$total__
  
  The total number of items in the array. Its value is ``1`` if the value 
  is not an array.
  
  If the block is inverted, $total takes the value ``0``.
  
  __$total*suffix*__
  
  If a "suffix" argument is specified, refers to $total in the
  corresponding block.
  
Special arguments passed to all functions
---

  __$action__ : _string_
  
  The name of the function as written in the template.

  __$position__ : _number_
  
  Indicates the position of the Mistigri tag in the template.
  
  __$template__ : _array of string_
  
  The template being currently processed. The template is split on
  openBrace, it can be recombined using ``join("{{")`` to recover the
  original text.
  
  __$model__ : _object_
  
  The model available in the current template.
  
  __$placeholder__ : _string_
  
  The configured placeholder text.
  
Special arguments passed to a block opening function
---

  Note: the $template and $model passed to a block opening function
  refer to the template and model within the block. However $position 
  refers to the position in the enclosing template.

  __$invertBlock__ : _boolean_
  
  True if the current block is inverted.

  __$inner__ : _function( ) &#x2192; Promise of string_
  
  A function that returns the processed contents of the block
  wrapped in a promise.

  __$prelude__ : _string_
  
  The rendered text between the start of the enclosing block and the 
  current block.
  
  __$ending__ : _string_
  
  The text between the current block and next Mistigri tag.
