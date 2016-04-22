// Mistigri /// Σ:{
// Mustache-inspired JavaScript template engine

/*
Sample use
----------
var template = "{{&type}} template; {{#person}}\n{{name default ='Madam'}} loves Σ:{ " +
    '{{love yes="much" no="not"}}{{/person}}';
var model = {
    type: "Test",
    love: false,
    person: [{name: "jido", love: true}, {name: "Mrs Nock", love: false}, {}]};
alert(mistigri.prrcess(template, model));
*/

var mistigri = (function(){

var DEFAULT_OPEN_BRACE = "{{";
var DEFAULT_CLOSE_BRACE = "}}";
var DEFAULT_PLACEHOLDER_TEXT = "N/A";
var DEFAULT_METHOD_CALL = false;
var DEFAULT_ESCAPE_FUNCTION = function escapeHtml(html) {
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

var main = function prrcess(template, model, config) {
    open_brace = (config && 'openBrace' in config) ? config.openBrace : DEFAULT_OPEN_BRACE;
    return render(template.split(open_brace), model, config);
}

var render = function render(parts, model, config) {
    var open_brace_len = (config && 'openBrace' in config) ? config.openBrace.length : DEFAULT_OPEN_BRACE.length;
    var close_brace = (config && 'closeBrace' in config) ? config.closeBrace : DEFAULT_CLOSE_BRACE;
    var default_text = (config && 'placeholderText' in config) ? config.placeholderText : DEFAULT_PLACEHOLDER_TEXT;
    var default_escape = (config && 'escapeFunction' in config) ? config.escapeFunction : DEFAULT_ESCAPE_FUNCTION;
    var bind = (config && 'methodCall' in config) ? config.methodCall : DEFAULT_METHOD_CALL;
    var text = parts[0];
    var rendered = text;
    var position = rendered.length;
    var in_block = 0;
    var start;
    var start_text;
    var action;
    var args;
    for (var partnum = 1; partnum < parts.length; ++partnum) 
    {
        var part = parts[partnum];
        var mitext = splitAt(close_brace, part);
        var mistigri = mitext[0];
        if (!in_block)
        {
            args = {$position: position, $template: parts, $model: model, $placeholderText: default_text}; 
        }
        switch (part.substr(0, 1)) 
        {
            case "#":
            case "^":
                if (in_block > 0)
                {
                    ++in_block;
                    break;      // break out of switch case
                }
                in_block = 1;
                action = parseAction(mistigri.substr(1), args, bind);
                args.$prelude = text;
                start = partnum;
                start_text = mitext[1];
                break;
            case "/":
                --in_block;
                if (in_block > 0) break;
                if (in_block < 0 || mistigri.replace(/^\/\s*/, "") !== action)
                {
                    rendered += mistigri;       // invalid close tag
                    break;
                }
                args.$ending = mitext[1];
                rendered += handleBlock(action, args, start_text, parts.slice(start, partnum), config);
                break;
            case ">":
                if (in_block > 0) break;
                console.log("Include: " + mistigri);
                break;
            case "!":
                break;  // just a comment
            case "&":
                if (in_block > 0) break;
                action = parseAction(mistigri.substr(1), args, bind);
                rendered += handleValue(action, args, bind);
                break;
            default:
                if (in_block > 0) break;
                action = parseAction(mistigri, args, bind);
                rendered += default_escape(handleValue(action, args, bind));
        }
        if (in_block <= 0)
        {
            text = mitext[1];
            rendered += text;
        }
        position += part.length + open_brace_len;
    }
    return rendered;
}

var splitAt = function splitAt(pattern, text) {
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

var parseAction = function parseAction(tag, args, bind) {
    var parts = /^\s*(\S+)\s*(.*)/.exec(tag);
    if (parts === null) return "";
    var action = parts[1];
    if (parts[2].length > 0)
    {
        getArgs(parts[2], args, bind);
    }
    return action;
}

var unbackslash = function(_, char) {
    switch (char)
    {
        case "n":
            return "\n";
        case "t":
            return "\t";
        default:
            return char;
    }
}

var getArgs = function getArgs(text, args, bind) {
    var cleaned = text.replace(/\\./, "\\1");
    var name = "";
    var seen_sign = false;
    var single_quoted = false;
    var double_quoted = false;
    var end = -1;
    var find_space = /\s+/g;
    var space;
    for (var start = 0; space !== null; start = find_space.lastIndex) 
    {
        space = find_space.exec(cleaned);
        end = (space === null) ? cleaned.length : space.index;
        var value = cleaned.substring(start, end);
        if (single_quoted || double_quoted)
        {
            single_quoted = (single_quoted && value.indexOf("'", -1) === -1);
            double_quoted = (double_quoted && value.indexOf('"', -1) === -1);
            var shift = (single_quoted || double_quoted) ? 0 : 1; // closing quote
            args[name] += " " + text.substring(start, end - shift).replace(/\\(.)/, unbackslash);
        }
        else
        {
            if (!seen_sign)
            {
                var argval = splitAt("=", value);
                if (argval[0].length > 0)
                {
                    name = argval[0];
                    start += name.length;
                }
                value = argval[1];
                seen_sign = (argval.length === 2);
                start += seen_sign ? 1 : 0;
            }
            if (seen_sign && name.length === 0) 
            {
                break;    // What, no arg name?
            }
            if (seen_sign && value.length > 0)
            {
                var arg;
                if (/^[-+0-9]/.test(value))
                {
                    arg = parseFloat(value);
                }
                else if (/^'.*'$/.test(value) || /^".*"$/.test(value))
                {
                    arg = text.substring(start + 1, end - 1).replace(/\\(.)/, unbackslash);
                }
                else if (value.lastIndexOf("'", 0) === 0)
                {
                    arg = text.substring(start + 1, end).replace(/\\(.)/, unbackslash);
                    single_quoted = true;
                }
                else if (value.lastIndexOf('"', 0) === 0)
                {
                    arg = text.substring(start + 1, end).replace(/\\(.)/, unbackslash);
                    double_quoted = true;
                }
                else
                {
                    arg = valueFor(value, args.$model, bind);
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

var handleValue = function handleValue(action, args, bind) {
    var value = valueFor(action, args.$model, bind);
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
            while (typeof result === 'function')
            {
                result = result(args);
            }
            break;
        default:
            // Not sure what to do
            return value;
    }
    if (result === undefined || result === null)
    {
        return ('default' in args) ? args.default : args.$placeholderText;
    }
    return result;
}

var handleBlock = function handleBlock(action, args, content, parts, config) {
    var result = "";
    var invert = (parts[0].lastIndexOf("^", 0) === 0);
    parts[0] = content;
    args.$invertBlock = invert;
    args.$template = parts;
    var bind = (config && 'methodCall' in config) ? config.methodCall : DEFAULT_METHOD_CALL;
    var value = valueFor(action, args.$model, bind);
    while (typeof value === 'function')
    {
        value = value(args);
        if (typeof value === 'string')
        {
            return value; // add to output
        }
    }
    var suffix = ('suffix' in args) ? args.suffix : "";
    var is_empty = !value;
    var is_array = !is_empty && Array.isArray(value);
    var list = value;
    if (!is_array)
    {
        list = [value];
    }
    if ((is_empty && invert) || (!is_empty && !invert))
    {
        for (var index in list)
        {
            var item = list[index];
            var submodel = args.$model;
            if (typeof item === 'object' && item !== null)
            {
                submodel = Object.create(submodel);
                for (var key in item)
                {
                    submodel[key + suffix] = item[key];
                }
            }
            result += render(parts, submodel, config);
        }
    }
    return result;
}

var valueFor = function valueFor(name, model, bind) {
    var path = name.split(".");
    var value = model[path.shift()];
    for (var child in path)
    {
        if (value === undefined || value === null)
        {
            break;
        }
        var next = value[path[child]];
        if (bind && typeof next === 'function')
        {
            var saved = value;
            next = next.bind(saved);
        }
        value = next;
    }
    return value;
}

return {prrcess: main};
})();
