﻿// Mistigri /// Σ:{
// Mustache-inspired JavaScript template engine

var template = "Test template; {{&person.name default ='Madam'}} loves Σ:{ " +
    '{{love yes="much" no="not"}}';
var model = {
    person: {name: "jido"},
    love: true
};
alert(render(template.split("{{"), model));

function render(parts, model, close_brace) {
    close_brace = (close_brace) ? close_brace : "}}";
    if (!('placeholderText' in model))
    {
        model.placeholderText = "N/A";
    }
    var rendered = parts[0];
    var position = rendered.length + close_brace.length;
    for (var partnum = 1; partnum < parts.length; ++partnum) 
    {
        var part = parts[partnum];
        var tagtext = splitAt(close_brace, part);
        var tag = tagtext[0];
        var args = {$position: position, $template: parts, $model: model};
        var action;
        switch (part.substr(0, 1)) 
        {
            case "#":
                console.log("Conditional: " + tag);
                break;
            case "^":
                console.log("Anti-conditional: " + tag);
                break;
            case "/":
                console.log("Block end: " + tag);
                break;
            case ">":
                console.log("Include: " + tag);
                break;
            case "! ":
                break; // just a comment
            case "&":
                action = parseAction(tag, args);
                rendered += handleValue(action.substr(1), args);
                break;
            default:
                action = parseAction(tag, args);
                rendered += escapeHtml(handleValue(action, args));
        }
        rendered += tagtext[1];
        position += part.length + close_brace.length;
  }
  return rendered;
}

function splitAt(pattern, text) {
    var found = text.indexOf(pattern);
    if (found === -1)
    {
        return [text];
    }
    else
    {
        return [text.substr(0, found), text.substr(found + pattern.length)];
    }
}

function parseAction(tag, args) {
    var parts = tag.split(/\s+/);
    var action = parts.shift();
    if (action.length === 0)
    {
        action = parts.shift();
    }
    getArgs(parts, args);
    return action;
}

function getArgs(parts, args)
{
    var name = "";
    var seen_sign = false;
    var single_quoted = false;
    var double_quoted = false;
    for (var partnum in parts) 
    {
        var value = parts[partnum];
        if (single_quoted || double_quoted)
        {
            single_quoted = (single_quoted && value.indexOf("'", value.length - 1) === -1);
            double_quoted = (double_quoted && value.indexOf('"', value.length - 1) === -1);
            if (!single_quoted && !double_quoted)
            {
                value = value.substr(0, value.length - 1);     // closed quote
            }
            args[name] += " " + value;
        }
        else
        {
            if (!seen_sign)
            {
                var argval = splitAt("=", value);
                name = (name.length === 0) ? argval[0] : name;
                value = argval[1];
                seen_sign = seen_sign || argval.length === 2;
            }
            if (seen_sign && name.length === 0) 
            {
                break;    // What, no arg name?
            }
            if (seen_sign && value.length > 0)
            {
                var arg;
                if (value.match(/^[-+0-9]/))
                {
                    arg = parseFloat(value);
                }
                else if (value.match(/^'.*'$/) || value.match(/^".*"$/))
                {
                    arg = value.substr(1, value.length - 2);
                }
                else if (value.lastIndexOf("'", 0) === 0)
                {
                    arg = value.substr(1);
                    single_quoted = true;
                }
                else if (value.lastIndexOf('"', 0) === 0)
                {
                    arg = value.substr(1);
                    double_quoted = true;
                }
                else
                {
                    arg = valueFor(value, args.$model);
                }
                args[name] = arg;
            }
        }
        if (seen_sign && value.length > 0 && !single_quoted && !double_quoted)
        {
            name = "";
            seen_sign = false;
        }
    }
    return !seen_sign;
}

function escapeHtml(html) {
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

function handleValue(action, args) {
    var value = valueFor(action, args.$model);
    var result;
    switch (typeof value) 
    {
        case 'number':
            return value;
        case 'string':
            return value;
        case 'undefined':
        case 'object':
            result = value;
            break;
        case 'boolean':
            result = value ? args.yes : args.no;
            break;
        case 'function':
            result = value(args);
            break;
        default:
            alert(typeof value);
            return value;
    }
    if (result === undefined || result === null)
    {
        return ('default' in args) ? args.default : args.$model.placeholderText;
    }
    return result;
}

function valueFor(name, model) {
    var path = name.split(".");
    var value = model[path.shift()];
    for (var child in path)
    {
        if (value === undefined || value === null)
        {
            break;
        }
        value = value[path[child]];
    }
    return value;
}
