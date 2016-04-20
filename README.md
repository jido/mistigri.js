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
  called to provide a value. By default "this" is not bound. For
  methods to work as expected, {methodCall: true} should be set in the
  configuration.
  
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

---

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

---  

  When the value is a function special argument "$invertBlock" is
  set in the object to indicate whether the block is inverted or not.
  
~~~
{{! comment }}
~~~

  Does not insert anything.
  
  The comment cannot contain "{{" or "}}".
