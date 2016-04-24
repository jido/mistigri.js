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
var DEFAULT_PLACEHOLDER = "N/A";
var DEFAULT_METHOD_CALL = false;
var DEFAULT_ESCAPE_FUNCTION = function escapeHtml(html) {
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}
var DEFAULT_READER = function ajaxReader(url, success, error) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = function(event) {
        if (this.readyState === 4)
        {
            if (this.status === 200)
            {
                success(this.responseText);
            }
            else
            {
                var miError = new Error("Mistigri ajaxReader error reading: " + url);
                miError.ajaxState = this.readyState;
                miError.httpStatus = this.status;
                miError.httpResponse = this.statusText;
                error(miError);
            }
        }
    }
    request.send();
}

var main = function prrcess(template, model, config, finish) {
    open_brace = getOption('openBrace', DEFAULT_OPEN_BRACE, config);
    var includes = {work: [], offset: 0, cache: {}};
    var rendered = render(template.split(open_brace), model, config, includes);
    handleAllIncludes(includes, config, rendered, rendered.length, finish);
    return rendered;
}

var feed = function feed(templates) {
    return function readFromObject(path, success, error) {
        if (path in templates)
        {
            success(templates[path]);
        }
        else
        {
            error(new Error("Mistigri was not fed template: " + path));
        }
    }
}

var render = function render(parts, model, config, includes) {
    var open_brace_len = getOption('openBrace', DEFAULT_OPEN_BRACE, config).length;
    var close_brace = getOption('closeBrace', DEFAULT_CLOSE_BRACE, config);
    var default_text = getOption('placeholder', DEFAULT_PLACEHOLDER, config);
    var default_escape = getOption('escapeFunction', DEFAULT_ESCAPE_FUNCTION, config);
    var bind = getOption('methodCall', DEFAULT_METHOD_CALL, config);
    var rendered = parts[0];
    var position = rendered.length;
    var offset = includes.offset;
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
        var text = (mitext.length > 1) ? mitext[1] : "";
        if (!in_block)
        {
            args = {$position: position, $template: parts, $model: model, $placeholder: default_text}; 
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
                args.$prelude = rendered;
                start = partnum;
                start_text = text;
                break;
            case "/":
                --in_block;
                if (in_block > 0) break;
                if (in_block < 0 || mistigri.substr(1).trim() !== action)
                {
                    rendered += mistigri;       // invalid close tag
                    break;
                }
                args.$ending = text;
                includes.offset = offset + rendered.length;
                rendered += handleBlock(action, args, start_text, parts.slice(start, partnum), config, includes);
                break;
            case ">":
                if (in_block > 0) break;
                action = parseAction(mistigri.substr(1), args, bind);
                includes.offset = offset + rendered.length;
                rendered += handleInclude(action, args, config, includes);
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
            rendered += text;
        }
        position += open_brace_len + part.length;
    }
    return rendered;
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
        return ('default' in args) ? args.default : args.$placeholder;
    }
    return result;
}

var handleBlock = function handleBlock(action, args, content, parts, config, includes) {
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
    var is_empty_array = Array.isArray(value) && value.length === 0;
    var is_empty = !value || is_empty_array;
    if ((is_empty && invert) || (!is_empty && !invert))
    {
        var suffix = ('suffix' in args) ? args.suffix : "";
        var middle = ""; 
        if ('tag' in args)
        {
            var left = args.$prelude.toLowerCase().lastIndexOf("<" + args.tag.toLowerCase());
            var right = args.$ending.toLowerCase().indexOf("</" + args.tag.toLowerCase());
            if (left !== -1 && right !== -1)
            {
                right = args.$ending.indexOf(">", right) + 1;
                middle = args.$ending.substr(0, right) + args.$prelude.substr(left);
            }
        }

        var list = value;
        if (is_empty || !Array.isArray(value))
        {
            list = [is_empty_array? null : value];      // special handling for empty array
        }
        var offset = includes.offset;
        var total = invert ? 0 : list.length;
        var count = 0;
        for (var index in list)
        {
            count += 1;
            var item = list[index];
            var submodel = args.$model;
            submodel.$item = item;
            submodel.$count = count;
            submodel.$total = total;
            if (suffix.length > 0)
            {
                submodel["$item" + suffix] = item;
                submodel["$count" + suffix] = count;
                submodel["$total" + suffix] = total;
            }
            if (typeof item === 'object' && item !== null)
            {
                submodel = Object.create(submodel);
                for (var key in item)
                {
                    submodel[key + suffix] = item[key];
                }
            }
            if (count > 1)
            {
                result += middle;
            }
            includes.offset = offset + result.length;
            result += render(parts, submodel, config, includes);
        }
    }
    return result;
}

var handleInclude = function handleInclude(action, args, config, includes) {
    var path = valueFor(action, args, false);
    delete args.$template;
    delete args.$model;
    delete args.$position;
    delete args.$placeholder;
    if (path === null)
    {
        path = action;
    }
    if (path in includes.cache)
    {
        return render(includes.cache[path], args, config, includes);
    }
    var preload = ('render' in args && args.render === "no");
    includes.work.push({path: path, at: includes.offset, model: args, render: !preload});
    return "";  // Rendered output will be inserted later
}

var handleAllIncludes = function handleAllIncludes(includes, config, rendered, size, finish) {
    if (includes.work.length === 0)
    {
        if (finish !== undefined) finish(rendered);
        return;
    }
    if (finish === undefined)
    {
        console.warn("Mistigri needs a callback - ignoring all includes");
        return;
    }
    var open_brace = getOption('openBrace', DEFAULT_OPEN_BRACE, config);
    var reader = getOption('reader', DEFAULT_READER, config);
    var include = includes.work.shift();
    var position = include.at + rendered.length - size;   // position from end

    reader(include.path, function(content) {
        var template = content.split(open_brace);
        includes.cache[include.path] = template;

        var new_includes = {work: [], offset: position, cache: includes.cache};
        if (include.render)
        {
            var inserted = render(template, include.model, config, new_includes);
            rendered = rendered.substr(0, position) + inserted + rendered.substr(position);
        }
        handleAllIncludes(new_includes, config, rendered, rendered.length, function(new_rendered) {
            handleAllIncludes(includes, config, new_rendered, size, finish);
        });
    },
    function(error) {
        console.error(error);
        handleAllIncludes(includes, config, rendered, size, finish);
    });
}

var parseAction = function parseAction(tag, args, bind) {
    var parts = /^\s*(\S+)\s*([^]*)/.exec(tag);
    if (parts === null) return "";
    var action = parts[1];
    if (parts[2].length > 0)
    {
        getArgs(parts[2], args, bind);
    }
    return action;
}

var getArgs = function getArgs(text, args, bind) {
    var backslashes = /\\([^])/g;
    var cleaned = text.replace(backslashes, "\\1");
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
            args[name] += " " + text.substring(start, end - shift).replace(backslashes, unbackslash);
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
                else if (/^'[^]*'$/.test(value) || /^"[^]*"$/.test(value))
                {
                    arg = text.substring(start + 1, end - 1).replace(backslashes, unbackslash);
                }
                else if (value.lastIndexOf("'", 0) === 0)
                {
                    arg = text.substring(start + 1, end).replace(backslashes, unbackslash);
                    single_quoted = true;
                }
                else if (value.lastIndexOf('"', 0) === 0)
                {
                    arg = text.substring(start + 1, end).replace(backslashes, unbackslash);
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

var valueFor = function valueFor(name, model, bind) {
    var path = name.split(".");
    if (path[0].length === 0)
    {
        return (path.length === 2 && path[1].length === 0) ? model.$item : null;
    }
    var value = model;
    for (var child in path)
    {
        var next = value[path[child]];
        if (next === undefined || next === null)
        {
            return null;
        }
        if (bind && child > 0 && typeof next === 'function')
        {
            var saved = value;
            next = next.bind(saved);
        }
        value = next;
    }
    return value;
}

var unbackslash = function(_, char) {
    if (char === "n")
    {
        return "\n";
    }
    else if (char === "t")
    {
        return "\t";
    }
    else
    {
        return char;
    }
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

var getOption = function getOption(name, defaultValue, config) {
    return (config && name in config) ? config[name] : defaultValue;
}

return {prrcess: main, process:main, feed: feed}; // note: prrcess gives cooler results, I swear. 
})();
