# mistigri.js
JavaScript template engine inspired by Mustache

Supported features
-------

~~~
{{name}}
~~~

  Inserts the value associated with name in the model.
  
  When the value is null or undefined the default value is inserted. 
  If none is specified then a generic placeholder text is inserted.
  
  Nested values are allowed, for example "person.name".
  
  If the name is associated with a function then this function is
  called to provide a value. See also Configuration Options.
  
~~~
{{name argument = value}}
~~~

  Provides an argument with a value.
  
  The "default" argument is used when the value associated with name
  is null or undefined.
  
  For boolean values the arguments "yes" and "no" provide the text to 
  insert.
  
  For function values the arguments are passed as an object.
  
  The value provided for the argument can be a number, a string within
  quotes or a name in the model.
  
~~~
{{&name}}
~~~

  Same as ``{{name}}`` except the value is not escaped.
  
  The default escape function is designed to safely insert text in an
  HTML document.
  
~~~
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
  
  The "tag" argument can be used to specify a HTML tag to repeat when
  there are two or more items in the array. Mistigri looks for the
  tag in the text that comes immediately before the block, stopping
  at the first Mistigri tag. It does the same for the close tag in
  the text that follows the block. For example, to insert a new table
  row for each person use:
  
~~~
<table>
   <tr>
      <td>{{#person tag="TR"}}{{first_name}}</td>
      <td>{{last_name}}{{/person}}</td>
   </tr>
</table>
~~~

  If name is associated with a function returning a string, the
  return value of this function is inserted as text. If it returns 
  anything else, the returned value is used to decide how many times 
  to insert the text between tags.
  
  If the array item or the value associated with name is an object
  then its members are added to the model. A "suffix" argument can be
  provided to rename these members.
  
~~~
{{^name}}...{{/name}}
~~~

  Inverts the condition:
  
  * the text is inserted zero times if the value is not empty
  * the text is inserted once if the value is empty

When the value is a function the special argument $invertBlock is
  set in the arguments object to indicate whether the block is inverted 
  or not.
  
~~~
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
  
  __placeholderText__ : _string_
  
  The text to insert as placeholder when there is no appropriate 
  value to insert. The default is "N/A".
  
  __escapeFunction__ : _function(string) &#x2192; string_
  
  The escape function to use when the tag does not start with 
  ``&``. The default is to escape HTML characters (requires DOM).
  
  __methodCall__ : _boolean_
  
  Controls the binding of "this" in function calls, which allows 
  object methods to work as expected.
  
  For security reasons the default is _false_.

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

  __$position__ : _number_
  
  Indicates the position of the Mistigri tag in the template.
  
  __$template__ : _array of string_
  
  The template being currently processed. The template is split on
  openBrace, it can be recombined using join("{{") to recover the
  original text.
  
  __$model__ : _object_
  
  The model available in the current template.
  
Special arguments passed to a block opening function
---

  __$invertBlock__ : _boolean_
  
  True if the current block is inverted.

  __$template__ : _array of string_
  
  The template within the block.

  __$prelude__ : _string_
  
  The text between previous Mistigri tag and the current block.
  
  __$ending__ : _string_
  
  The text between the current block and next Mistigri tag.
