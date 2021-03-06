/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
// qTip - CSS Tool Tips - by Craig Erskine
// http://qrayg.com
//
// Multi-tag support by James Crooke
// http://www.cj-design.com
//
// Inspired by code from Travis Beckham
// http://www.squidfingers.com | http://www.podlob.com
//
// Copyright (c) 2006 Craig Erskine
// Permission is granted to copy, distribute and/or modify this document
// under the terms of the GNU Free Documentation License, Version 1.3
// or any later version published by the Free Software Foundation;
// with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts.
// A copy of the license is included in the section entitled "GNU
// Free Documentation License".

var qTipTag = "a,label,input,v"; //Which tag do you want to qTip-ize? Keep it lowercase!//
var qTipX = 0; //This is qTip's X offset//
var qTipY = 15; //This is qTip's Y offset//

//There's No need to edit anything below this line//
tooltip = {
  name : "qTip",
  offsetX : qTipX,
  offsetY : qTipY,
  tip : null
}

tooltip.init = function () {
	var tipNameSpaceURI = "http://www.w3.org/1999/xhtml";
	if(!tipContainerID){ var tipContainerID = "qTip";}
	var tipContainer = document.getElementById(tipContainerID);

	if(!tipContainer) {
	  tipContainer = document.createElementNS ? document.createElementNS(tipNameSpaceURI, "div") : document.createElement("div");
		tipContainer.setAttribute("id", tipContainerID);
	  document.getElementsByTagName("body").item(0).appendChild(tipContainer);
	}

	if (!document.getElementById) return;
	this.tip = document.getElementById (this.name);
	if (this.tip) document.onmousemove = function (evt) {tooltip.move (evt)};

	var a, sTitle, elements;
	
	var elementList = qTipTag.split(",");
	for(var j = 0; j < elementList.length; j++)
	{	
		elements = document.getElementsByTagName(elementList[j]);
		if(elements)
		{
			for (var i = 0; i < elements.length; i ++)
			{
				a = elements[i];
				sTitle = a.getAttribute("title");				
				if(sTitle)
				{
					a.setAttribute("tiptitle", sTitle);
					a.removeAttribute("title");
					a.removeAttribute("alt");
					a.onmouseover = function() {tooltip.show(this.getAttribute('tiptitle'))};
					a.onmouseout = function() {tooltip.hide()};
				}
			}
		}
	}
}

tooltip.move = function (evt) {
	var x=0, y=0;
	if (document.all) {//IE
		x = (document.documentElement && document.documentElement.scrollLeft) ? document.documentElement.scrollLeft : document.body.scrollLeft;
		y = (document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop : document.body.scrollTop;
		x += window.event.clientX;
		y += window.event.clientY;
		
	} else {//Good Browsers
		x = evt.pageX;
		y = evt.pageY;
	}
	this.tip.style.left = (x + this.offsetX) + "px";
	this.tip.style.top = (y + this.offsetY) + "px";
}

tooltip.show = function (text) {
	if (!this.tip) return;
	this.tip.innerHTML = text;
	this.tip.style.display = "block";
}

tooltip.hide = function () {
	if (!this.tip) return;
	this.tip.innerHTML = "";
	this.tip.style.display = "none";
}

window.onload = function () {
	tooltip.init ();
}
// fba9dc2
var a;if(!Array.prototype.map)Array.prototype.map=function(b,c){for(var d=this.length,f=new Array(d),g=0;g<d;g++)if(g in this)f[g]=b.call(c,this[g],g,this);return f};if(!Array.prototype.filter)Array.prototype.filter=function(b,c){for(var d=this.length,f=[],g=0;g<d;g++)if(g in this){var h=this[g];b.call(c,h,g,this)&&f.push(h)}return f};if(!Array.prototype.forEach)Array.prototype.forEach=function(b,c){for(var d=this.length>>>0,f=0;f<d;f++)f in this&&b.call(c,this[f],f,this)};
if(!Array.prototype.reduce)Array.prototype.reduce=function(b,c){var d=this.length;if(!d&&arguments.length==1)throw new Error("reduce: empty array, no initial value");var f=0;if(arguments.length<2)for(;;){if(f in this){c=this[f++];break}if(++f>=d)throw new Error("reduce: no values, no initial value");}for(;f<d;f++)if(f in this)c=b(c,this[f],f,this);return c};var pv={};pv.version={major:3,minor:2};pv.identity=function(b){return b};pv.index=function(){return this.index};pv.child=function(){return this.childIndex};
pv.parent=function(){return this.parent.index};pv.extend=function(b){function c(){}c.prototype=b.prototype||b;return new c};
try{eval("pv.parse = function(x) x;")}catch(e){pv.parse=function(b){for(var c=new RegExp("function\\s*(\\b\\w+)?\\s*\\([^)]*\\)\\s*","mg"),d,f,g=0,h="";d=c.exec(b);){d=d.index+d[0].length;if(b.charAt(d)!="{"){h+=b.substring(g,d)+"{return ";g=d;for(var i=0;i>=0&&d<b.length;d++){var j=b.charAt(d);switch(j){case '"':case "'":for(;++d<b.length&&(f=b.charAt(d))!=j;)f=="\\"&&d++;break;case "[":case "(":i++;break;case "]":case ")":i--;break;case ";":case ",":i==0&&i--;break}}h+=pv.parse(b.substring(g,--d))+
";}";g=d}c.lastIndex=d}h+=b.substring(g);return h}}pv.css=function(b,c){return window.getComputedStyle?window.getComputedStyle(b,null).getPropertyValue(c):b.currentStyle[c]};pv.error=function(b){typeof console=="undefined"?alert(b):console.error(b)};pv.listen=function(b,c,d){d=pv.listener(d);return b.addEventListener?b.addEventListener(c,d,false):b.attachEvent("on"+c,d)};pv.listener=function(b){return b.$listener||(b.$listener=function(c){try{pv.event=c;return b.call(this,c)}finally{delete pv.event}})};
pv.ancestor=function(b,c){for(;c;){if(c==b)return true;c=c.parentNode}return false};pv.id=function(){var b=1;return function(){return b++}}();pv.functor=function(b){return typeof b=="function"?b:function(){return b}};pv.listen(window,"load",function(){for(pv.$={i:0,x:document.getElementsByTagName("script")};pv.$.i<pv.$.x.length;pv.$.i++){pv.$.s=pv.$.x[pv.$.i];if(pv.$.s.type=="text/javascript+protovis")try{window.eval(pv.parse(pv.$.s.text))}catch(b){pv.error(b)}}delete pv.$});pv.Format={};
pv.Format.re=function(b){return b.replace(/[\\\^\$\*\+\?\[\]\(\)\.\{\}]/g,"\\$&")};pv.Format.pad=function(b,c,d){c=c-String(d).length;return c<1?d:(new Array(c+1)).join(b)+d};
pv.Format.date=function(b){function c(f){return b.replace(/%[a-zA-Z0-9]/g,function(g){switch(g){case "%a":return["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][f.getDay()];case "%A":return["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][f.getDay()];case "%h":case "%b":return["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][f.getMonth()];case "%B":return["January","February","March","April","May","June","July","August","September","October","November","December"][f.getMonth()];
case "%c":return f.toLocaleString();case "%C":return d("0",2,Math.floor(f.getFullYear()/100)%100);case "%d":return d("0",2,f.getDate());case "%x":case "%D":return d("0",2,f.getMonth()+1)+"/"+d("0",2,f.getDate())+"/"+d("0",2,f.getFullYear()%100);case "%e":return d(" ",2,f.getDate());case "%H":return d("0",2,f.getHours());case "%I":return(g=f.getHours()%12)?d("0",2,g):12;case "%m":return d("0",2,f.getMonth()+1);case "%M":return d("0",2,f.getMinutes());case "%n":return"\n";case "%p":return f.getHours()<
12?"AM":"PM";case "%T":case "%X":case "%r":g=f.getHours()%12;return(g?d("0",2,g):12)+":"+d("0",2,f.getMinutes())+":"+d("0",2,f.getSeconds())+" "+(f.getHours()<12?"AM":"PM");case "%R":return d("0",2,f.getHours())+":"+d("0",2,f.getMinutes());case "%S":return d("0",2,f.getSeconds());case "%Q":return d("0",3,f.getMilliseconds());case "%t":return"\t";case "%u":return(g=f.getDay())?g:1;case "%w":return f.getDay();case "%y":return d("0",2,f.getFullYear()%100);case "%Y":return f.getFullYear();case "%%":return"%"}return g})}
var d=pv.Format.pad;c.format=c;c.parse=function(f){var g=1970,h=0,i=1,j=0,l=0,k=0,q=[function(){}],o=pv.Format.re(b).replace(/%[a-zA-Z0-9]/g,function(n){switch(n){case "%b":q.push(function(m){h={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}[m]});return"([A-Za-z]+)";case "%h":case "%B":q.push(function(m){h={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11}[m]});return"([A-Za-z]+)";case "%e":case "%d":q.push(function(m){i=
m});return"([0-9]+)";case "%I":case "%H":q.push(function(m){j=m});return"([0-9]+)";case "%m":q.push(function(m){h=m-1});return"([0-9]+)";case "%M":q.push(function(m){l=m});return"([0-9]+)";case "%p":q.push(function(m){if(j==12){if(m=="am")j=0}else if(m=="pm")j=Number(j)+12});return"(am|pm)";case "%S":q.push(function(m){k=m});return"([0-9]+)";case "%y":q.push(function(m){m=Number(m);g=m+(0<=m&&m<69?2E3:m>=69&&m<100?1900:0)});return"([0-9]+)";case "%Y":q.push(function(m){g=m});return"([0-9]+)";case "%%":q.push(function(){});
return"%"}return n});(f=f.match(o))&&f.forEach(function(n,m){q[m](n)});return new Date(g,h,i,j,l,k)};return c};
pv.Format.time=function(b){function c(f){f=Number(f);switch(b){case "short":if(f>=31536E6)return(f/31536E6).toFixed(1)+" years";else if(f>=6048E5)return(f/6048E5).toFixed(1)+" weeks";else if(f>=864E5)return(f/864E5).toFixed(1)+" days";else if(f>=36E5)return(f/36E5).toFixed(1)+" hours";else if(f>=6E4)return(f/6E4).toFixed(1)+" minutes";return(f/1E3).toFixed(1)+" seconds";case "long":var g=[],h=f%36E5/6E4>>0;g.push(d("0",2,f%6E4/1E3>>0));if(f>=36E5){var i=f%864E5/36E5>>0;g.push(d("0",2,h));if(f>=864E5){g.push(d("0",
2,i));g.push(Math.floor(f/864E5).toFixed())}else g.push(i.toFixed())}else g.push(h.toFixed());return g.reverse().join(":")}}var d=pv.Format.pad;c.format=c;c.parse=function(f){switch(b){case "short":for(var g=/([0-9,.]+)\s*([a-z]+)/g,h,i=0;h=g.exec(f);){var j=parseFloat(h[0].replace(",","")),l=0;switch(h[2].toLowerCase()){case "year":case "years":l=31536E6;break;case "week":case "weeks":l=6048E5;break;case "day":case "days":l=864E5;break;case "hour":case "hours":l=36E5;break;case "minute":case "minutes":l=
6E4;break;case "second":case "seconds":l=1E3;break}i+=j*l}return i;case "long":h=f.replace(",","").split(":").reverse();i=0;if(h.length)i+=parseFloat(h[0])*1E3;if(h.length>1)i+=parseFloat(h[1])*6E4;if(h.length>2)i+=parseFloat(h[2])*36E5;if(h.length>3)i+=parseFloat(h[3])*864E5;return i}};return c};
pv.Format.number=function(){function b(n){if(Infinity>h)n=Math.round(n*i)/i;var m=String(Math.abs(n)).split("."),r=m[0];n=n<0?"-":"";if(r.length>d)r=r.substring(r.length-d);if(k&&r.length<c)r=n+(new Array(c-r.length+1)).join(j)+r;if(r.length>3)r=r.replace(/\B(?=(?:\d{3})+(?!\d))/g,o);if(!k&&r.length<f)r=(new Array(f-r.length+1)).join(j)+n+r;m[0]=r;r=m[1]||"";if(r.length<g)m[1]=r+(new Array(g-r.length+1)).join(l);return m.join(q)}var c=0,d=Infinity,f=0,g=0,h=0,i=1,j="0",l="0",k=true,q=".",o=",";b.format=
b;b.parse=function(n){var m=pv.Format.re;n=String(n).replace(new RegExp("^("+m(j)+")*"),"").replace(new RegExp("("+m(l)+")*$"),"").split(q);m=n[0].replace(new RegExp(m(o),"g"),"");if(m.length>d)m=m.substring(m.length-d);n=n[1]?Number("0."+n[1]):0;if(Infinity>h)n=Math.round(n*i)/i;return Math.round(m)+n};b.integerDigits=function(n,m){if(arguments.length){c=Number(n);d=arguments.length>1?Number(m):c;f=c+Math.floor(c/3)*o.length;return this}return[c,d]};b.fractionDigits=function(n,m){if(arguments.length){g=
Number(n);h=arguments.length>1?Number(m):g;i=Math.pow(10,h);return this}return[g,h]};b.integerPad=function(n){if(arguments.length){j=String(n);k=/\d/.test(j);return this}return j};b.fractionPad=function(n){if(arguments.length){l=String(n);return this}return l};b.decimal=function(n){if(arguments.length){q=String(n);return this}return q};b.group=function(n){if(arguments.length){o=n?String(n):"";f=c+Math.floor(c/3)*o.length;return this}return o};return b};
pv.map=function(b,c){var d={};return c?b.map(function(f,g){d.index=g;return c.call(d,f)}):b.slice()};pv.repeat=function(b,c){if(arguments.length==1)c=2;return pv.blend(pv.range(c).map(function(){return b}))};pv.cross=function(b,c){for(var d=[],f=0,g=b.length,h=c.length;f<g;f++)for(var i=0,j=b[f];i<h;i++)d.push([j,c[i]]);return d};pv.blend=function(b){return Array.prototype.concat.apply([],b)};
pv.transpose=function(b){var c=b.length,d=pv.max(b,function(i){return i.length});if(d>c){b.length=d;for(var f=c;f<d;f++)b[f]=new Array(c);for(f=0;f<c;f++)for(var g=f+1;g<d;g++){var h=b[f][g];b[f][g]=b[g][f];b[g][f]=h}}else{for(f=0;f<d;f++)b[f].length=c;for(f=0;f<c;f++)for(g=0;g<f;g++){h=b[f][g];b[f][g]=b[g][f];b[g][f]=h}}b.length=d;for(f=0;f<d;f++)b[f].length=c;return b};pv.normalize=function(b,c){b=pv.map(b,c);c=pv.sum(b);for(var d=0;d<b.length;d++)b[d]/=c;return b};
pv.permute=function(b,c,d){if(!d)d=pv.identity;var f=new Array(c.length),g={};c.forEach(function(h,i){g.index=h;f[i]=d.call(g,b[h])});return f};pv.numerate=function(b,c){if(!c)c=pv.identity;var d={},f={};b.forEach(function(g,h){f.index=h;d[c.call(f,g)]=h});return d};pv.uniq=function(b,c){if(!c)c=pv.identity;var d={},f=[],g={},h;b.forEach(function(i,j){g.index=j;h=c.call(g,i);h in d||(d[h]=f.push(h))});return f};pv.naturalOrder=function(b,c){return b<c?-1:b>c?1:0};
pv.reverseOrder=function(b,c){return c<b?-1:c>b?1:0};pv.search=function(b,c,d){if(!d)d=pv.identity;for(var f=0,g=b.length-1;f<=g;){var h=f+g>>1,i=d(b[h]);if(i<c)f=h+1;else if(i>c)g=h-1;else return h}return-f-1};pv.search.index=function(b,c,d){b=pv.search(b,c,d);return b<0?-b-1:b};
pv.range=function(b,c,d){if(arguments.length==1){c=b;b=0}if(d==undefined)d=1;if((c-b)/d==Infinity)throw new Error("range must be finite");var f=[],g=0,h;if(d<0)for(;(h=b+d*g++)>c;)f.push(h);else for(;(h=b+d*g++)<c;)f.push(h);return f};pv.random=function(b,c,d){if(arguments.length==1){c=b;b=0}if(d==undefined)d=1;return d?Math.floor(Math.random()*(c-b)/d)*d+b:Math.random()*(c-b)+b};
pv.sum=function(b,c){var d={};return b.reduce(c?function(f,g,h){d.index=h;return f+c.call(d,g)}:function(f,g){return f+g},0)};pv.max=function(b,c){if(c==pv.index)return b.length-1;return Math.max.apply(null,c?pv.map(b,c):b)};pv.max.index=function(b,c){if(!b.length)return-1;if(c==pv.index)return b.length-1;if(!c)c=pv.identity;for(var d=0,f=-Infinity,g={},h=0;h<b.length;h++){g.index=h;var i=c.call(g,b[h]);if(i>f){f=i;d=h}}return d};
pv.min=function(b,c){if(c==pv.index)return 0;return Math.min.apply(null,c?pv.map(b,c):b)};pv.min.index=function(b,c){if(!b.length)return-1;if(c==pv.index)return 0;if(!c)c=pv.identity;for(var d=0,f=Infinity,g={},h=0;h<b.length;h++){g.index=h;var i=c.call(g,b[h]);if(i<f){f=i;d=h}}return d};pv.mean=function(b,c){return pv.sum(b,c)/b.length};
pv.median=function(b,c){if(c==pv.index)return(b.length-1)/2;b=pv.map(b,c).sort(pv.naturalOrder);if(b.length%2)return b[Math.floor(b.length/2)];c=b.length/2;return(b[c-1]+b[c])/2};pv.variance=function(b,c){if(b.length<1)return NaN;if(b.length==1)return 0;var d=pv.mean(b,c),f=0,g={};if(!c)c=pv.identity;for(var h=0;h<b.length;h++){g.index=h;var i=c.call(g,b[h])-d;f+=i*i}return f};pv.deviation=function(b,c){return Math.sqrt(pv.variance(b,c)/(b.length-1))};pv.log=function(b,c){return Math.log(b)/Math.log(c)};
pv.logSymmetric=function(b,c){return b==0?0:b<0?-pv.log(-b,c):pv.log(b,c)};pv.logAdjusted=function(b,c){if(!isFinite(b))return b;var d=b<0;if(b<c)b+=(c-b)/c;return d?-pv.log(b,c):pv.log(b,c)};pv.logFloor=function(b,c){return b>0?Math.pow(c,Math.floor(pv.log(b,c))):-Math.pow(c,-Math.floor(-pv.log(-b,c)))};pv.logCeil=function(b,c){return b>0?Math.pow(c,Math.ceil(pv.log(b,c))):-Math.pow(c,-Math.ceil(-pv.log(-b,c)))};
(function(){var b=Math.PI/180,c=180/Math.PI;pv.radians=function(d){return b*d};pv.degrees=function(d){return c*d}})();pv.keys=function(b){var c=[];for(var d in b)c.push(d);return c};pv.entries=function(b){var c=[];for(var d in b)c.push({key:d,value:b[d]});return c};pv.values=function(b){var c=[];for(var d in b)c.push(b[d]);return c};pv.dict=function(b,c){for(var d={},f={},g=0;g<b.length;g++)if(g in b){var h=b[g];f.index=g;d[h]=c.call(f,h)}return d};pv.dom=function(b){return new pv.Dom(b)};
pv.Dom=function(b){this.$map=b};pv.Dom.prototype.$leaf=function(b){return typeof b!="object"};pv.Dom.prototype.leaf=function(b){if(arguments.length){this.$leaf=b;return this}return this.$leaf};pv.Dom.prototype.root=function(b){function c(g){var h=new pv.Dom.Node;for(var i in g){var j=g[i];h.appendChild(d(j)?new pv.Dom.Node(j):c(j)).nodeName=i}return h}var d=this.$leaf,f=c(this.$map);f.nodeName=b;return f};pv.Dom.prototype.nodes=function(){return this.root().nodes()};
pv.Dom.Node=function(b){this.nodeValue=b;this.childNodes=[]};a=pv.Dom.Node.prototype;a.parentNode=null;a.firstChild=null;a.lastChild=null;a.previousSibling=null;a.nextSibling=null;
a.removeChild=function(b){var c=this.childNodes.indexOf(b);if(c==-1)throw new Error("child not found");this.childNodes.splice(c,1);if(b.previousSibling)b.previousSibling.nextSibling=b.nextSibling;else this.firstChild=b.nextSibling;if(b.nextSibling)b.nextSibling.previousSibling=b.previousSibling;else this.lastChild=b.previousSibling;delete b.nextSibling;delete b.previousSibling;delete b.parentNode;return b};
a.appendChild=function(b){b.parentNode&&b.parentNode.removeChild(b);b.parentNode=this;if(b.previousSibling=this.lastChild)this.lastChild.nextSibling=b;else this.firstChild=b;this.lastChild=b;this.childNodes.push(b);return b};
a.insertBefore=function(b,c){if(!c)return this.appendChild(b);var d=this.childNodes.indexOf(c);if(d==-1)throw new Error("child not found");b.parentNode&&b.parentNode.removeChild(b);b.parentNode=this;b.nextSibling=c;if(b.previousSibling=c.previousSibling)c.previousSibling.nextSibling=b;else{if(c==this.lastChild)this.lastChild=b;this.firstChild=b}this.childNodes.splice(d,0,b);return b};
a.replaceChild=function(b,c){var d=this.childNodes.indexOf(c);if(d==-1)throw new Error("child not found");b.parentNode&&b.parentNode.removeChild(b);b.parentNode=this;b.nextSibling=c.nextSibling;if(b.previousSibling=c.previousSibling)c.previousSibling.nextSibling=b;else this.firstChild=b;if(c.nextSibling)c.nextSibling.previousSibling=b;else this.lastChild=b;this.childNodes[d]=b;return c};a.visitBefore=function(b){function c(d,f){b(d,f);for(d=d.firstChild;d;d=d.nextSibling)c(d,f+1)}c(this,0)};
a.visitAfter=function(b){function c(d,f){for(var g=d.firstChild;g;g=g.nextSibling)c(g,f+1);b(d,f)}c(this,0)};a.sort=function(b){if(this.firstChild){this.childNodes.sort(b);var c=this.firstChild=this.childNodes[0],d;delete c.previousSibling;for(var f=1;f<this.childNodes.length;f++){c.sort(b);d=this.childNodes[f];d.previousSibling=c;c=c.nextSibling=d}this.lastChild=c;delete c.nextSibling;c.sort(b)}return this};
a.reverse=function(){var b=[];this.visitAfter(function(c){for(;c.lastChild;)b.push(c.removeChild(c.lastChild));for(var d;d=b.pop();)c.insertBefore(d,c.firstChild)});return this};a.nodes=function(){function b(d){c.push(d);d.childNodes.forEach(b)}var c=[];b(this,c);return c};
a.toggle=function(b){if(b)return this.toggled?this.visitBefore(function(d){d.toggled&&d.toggle()}):this.visitAfter(function(d){d.toggled||d.toggle()});b=this;if(b.toggled){for(var c;c=b.toggled.pop();)b.appendChild(c);delete b.toggled}else if(b.lastChild)for(b.toggled=[];b.lastChild;)b.toggled.push(b.removeChild(b.lastChild))};pv.nodes=function(b){for(var c=new pv.Dom.Node,d=0;d<b.length;d++)c.appendChild(new pv.Dom.Node(b[d]));return c.nodes()};pv.tree=function(b){return new pv.Tree(b)};
pv.Tree=function(b){this.array=b};pv.Tree.prototype.keys=function(b){this.k=b;return this};pv.Tree.prototype.value=function(b){this.v=b;return this};pv.Tree.prototype.map=function(){for(var b={},c={},d=0;d<this.array.length;d++){c.index=d;for(var f=this.array[d],g=this.k.call(c,f),h=b,i=0;i<g.length-1;i++)h=h[g[i]]||(h[g[i]]={});h[g[i]]=this.v?this.v.call(c,f):f}return b};pv.nest=function(b){return new pv.Nest(b)};pv.Nest=function(b){this.array=b;this.keys=[]};a=pv.Nest.prototype;
a.key=function(b){this.keys.push(b);return this};a.sortKeys=function(b){this.keys[this.keys.length-1].order=b||pv.naturalOrder;return this};a.sortValues=function(b){this.order=b||pv.naturalOrder;return this};a.map=function(){for(var b={},c=[],d,f=0;f<this.array.length;f++){var g=this.array[f],h=b;for(d=0;d<this.keys.length-1;d++){var i=this.keys[d](g);h[i]||(h[i]={});h=h[i]}i=this.keys[d](g);if(!h[i]){d=[];c.push(d);h[i]=d}h[i].push(g)}if(this.order)for(d=0;d<c.length;d++)c[d].sort(this.order);return b};
a.entries=function(){function b(d){var f=[];for(var g in d){var h=d[g];f.push({key:g,values:h instanceof Array?h:b(h)})}return f}function c(d,f){var g=this.keys[f].order;g&&d.sort(function(i,j){return g(i.key,j.key)});if(++f<this.keys.length)for(var h=0;h<d.length;h++)c.call(this,d[h].values,f);return d}return c.call(this,b(this.map()),0)};a.rollup=function(b){function c(d){for(var f in d){var g=d[f];if(g instanceof Array)d[f]=b(g);else c(g)}return d}return c(this.map())};pv.flatten=function(b){return new pv.Flatten(b)};
pv.Flatten=function(b){this.map=b;this.keys=[]};pv.Flatten.prototype.key=function(b,c){this.keys.push({name:b,value:c});delete this.$leaf;return this};pv.Flatten.prototype.leaf=function(b){this.keys.length=0;this.$leaf=b;return this};
pv.Flatten.prototype.array=function(){function b(i,j){if(j<f.length-1)for(var l in i){d.push(l);b(i[l],j+1);d.pop()}else c.push(d.concat(i))}var c=[],d=[],f=this.keys,g=this.$leaf;if(g){function h(i,j){if(g(i))c.push({keys:d.slice(),value:i});else for(var l in i){d.push(l);h(i[l],j+1);d.pop()}}h(this.map,0);return c}b(this.map,0);return c.map(function(i){for(var j={},l=0;l<f.length;l++){var k=f[l],q=i[l];j[k.name]=k.value?k.value.call(null,q):q}return j})};
pv.vector=function(b,c){return new pv.Vector(b,c)};pv.Vector=function(b,c){this.x=b;this.y=c};a=pv.Vector.prototype;a.perp=function(){return new pv.Vector(-this.y,this.x)};a.norm=function(){var b=this.length();return this.times(b?1/b:1)};a.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};a.times=function(b){return new pv.Vector(this.x*b,this.y*b)};a.plus=function(b,c){return arguments.length==1?new pv.Vector(this.x+b.x,this.y+b.y):new pv.Vector(this.x+b,this.y+c)};
a.minus=function(b,c){return arguments.length==1?new pv.Vector(this.x-b.x,this.y-b.y):new pv.Vector(this.x-b,this.y-c)};a.dot=function(b,c){return arguments.length==1?this.x*b.x+this.y*b.y:this.x*b+this.y*c};pv.Transform=function(){};pv.Transform.prototype={k:1,x:0,y:0};pv.Transform.identity=new pv.Transform;pv.Transform.prototype.translate=function(b,c){var d=new pv.Transform;d.k=this.k;d.x=this.k*b+this.x;d.y=this.k*c+this.y;return d};
pv.Transform.prototype.scale=function(b){var c=new pv.Transform;c.k=this.k*b;c.x=this.x;c.y=this.y;return c};pv.Transform.prototype.invert=function(){var b=new pv.Transform,c=1/this.k;b.k=c;b.x=-this.x*c;b.y=-this.y*c;return b};pv.Transform.prototype.times=function(b){var c=new pv.Transform;c.k=this.k*b.k;c.x=this.k*b.x+this.x;c.y=this.k*b.y+this.y;return c};pv.Scale=function(){};
pv.Scale.interpolator=function(b,c){if(typeof b=="number")return function(d){return d*(c-b)+b};b=pv.color(b).rgb();c=pv.color(c).rgb();return function(d){var f=b.a*(1-d)+c.a*d;if(f<1.0E-5)f=0;return b.a==0?pv.rgb(c.r,c.g,c.b,f):c.a==0?pv.rgb(b.r,b.g,b.b,f):pv.rgb(Math.round(b.r*(1-d)+c.r*d),Math.round(b.g*(1-d)+c.g*d),Math.round(b.b*(1-d)+c.b*d),f)}};
pv.Scale.quantitative=function(){function b(o){return new Date(o)}function c(o){var n=pv.search(d,o);if(n<0)n=-n-2;n=Math.max(0,Math.min(h.length-1,n));return h[n]((l(o)-f[n])/(f[n+1]-f[n]))}var d=[0,1],f=[0,1],g=[0,1],h=[pv.identity],i=Number,j=false,l=pv.identity,k=pv.identity,q=String;c.transform=function(o,n){l=function(m){return j?-o(-m):o(m)};k=function(m){return j?-n(-m):n(m)};f=d.map(l);return this};c.domain=function(o,n,m){if(arguments.length){var r;if(o instanceof Array){if(arguments.length<
2)n=pv.identity;if(arguments.length<3)m=n;r=o.length&&n(o[0]);d=o.length?[pv.min(o,n),pv.max(o,m)]:[]}else{r=o;d=Array.prototype.slice.call(arguments).map(Number)}if(d.length){if(d.length==1)d=[d[0],d[0]]}else d=[-Infinity,Infinity];j=(d[0]||d[d.length-1])<0;f=d.map(l);i=r instanceof Date?b:Number;return this}return d.map(i)};c.range=function(){if(arguments.length){g=Array.prototype.slice.call(arguments);if(g.length){if(g.length==1)g=[g[0],g[0]]}else g=[-Infinity,Infinity];h=[];for(var o=0;o<g.length-
1;o++)h.push(pv.Scale.interpolator(g[o],g[o+1]));return this}return g};c.invert=function(o){var n=pv.search(g,o);if(n<0)n=-n-2;n=Math.max(0,Math.min(h.length-1,n));return i(k(f[n]+(o-g[n])/(g[n+1]-g[n])*(f[n+1]-f[n])))};c.ticks=function(o){var n=d[0],m=d[d.length-1],r=m<n,s=r?m:n;m=r?n:m;var u=m-s;if(!u||!isFinite(u)){if(i==b)q=pv.Format.date("%x");return[i(s)]}if(i==b){function x(w,y){switch(y){case 31536E6:w.setMonth(0);case 2592E6:w.setDate(1);case 6048E5:y==6048E5&&w.setDate(w.getDate()-w.getDay());
case 864E5:w.setHours(0);case 36E5:w.setMinutes(0);case 6E4:w.setSeconds(0);case 1E3:w.setMilliseconds(0)}}var t,p,v=1;if(u>=94608E6){n=31536E6;t="%Y";p=function(w){w.setFullYear(w.getFullYear()+v)}}else if(u>=7776E6){n=2592E6;t="%m/%Y";p=function(w){w.setMonth(w.getMonth()+v)}}else if(u>=18144E5){n=6048E5;t="%m/%d";p=function(w){w.setDate(w.getDate()+7*v)}}else if(u>=2592E5){n=864E5;t="%m/%d";p=function(w){w.setDate(w.getDate()+v)}}else if(u>=108E5){n=36E5;t="%I:%M %p";p=function(w){w.setHours(w.getHours()+
v)}}else if(u>=18E4){n=6E4;t="%I:%M %p";p=function(w){w.setMinutes(w.getMinutes()+v)}}else if(u>=3E3){n=1E3;t="%I:%M:%S";p=function(w){w.setSeconds(w.getSeconds()+v)}}else{n=1;t="%S.%Qs";p=function(w){w.setTime(w.getTime()+v)}}q=pv.Format.date(t);s=new Date(s);t=[];x(s,n);u=u/n;if(u>10)switch(n){case 36E5:v=u>20?6:3;s.setHours(Math.floor(s.getHours()/v)*v);break;case 2592E6:v=3;s.setMonth(Math.floor(s.getMonth()/v)*v);break;case 6E4:v=u>30?15:u>15?10:5;s.setMinutes(Math.floor(s.getMinutes()/v)*v);
break;case 1E3:v=u>90?15:u>60?10:5;s.setSeconds(Math.floor(s.getSeconds()/v)*v);break;case 1:v=u>1E3?250:u>200?100:u>100?50:u>50?25:5;s.setMilliseconds(Math.floor(s.getMilliseconds()/v)*v);break;default:v=pv.logCeil(u/15,10);if(u/v<2)v/=5;else if(u/v<5)v/=2;s.setFullYear(Math.floor(s.getFullYear()/v)*v);break}for(;;){p(s);if(s>m)break;t.push(new Date(s))}return r?t.reverse():t}arguments.length||(o=10);v=pv.logFloor(u/o,10);n=o/(u/v);if(n<=0.15)v*=10;else if(n<=0.35)v*=5;else if(n<=0.75)v*=2;n=Math.ceil(s/
v)*v;m=Math.floor(m/v)*v;q=pv.Format.number().fractionDigits(Math.max(0,-Math.floor(pv.log(v,10)+0.01)));m=pv.range(n,m+v,v);return r?m.reverse():m};c.tickFormat=function(o){return q(o)};c.nice=function(){if(d.length!=2)return this;var o=d[0],n=d[d.length-1],m=n<o,r=m?n:o;o=m?o:n;n=o-r;if(!n||!isFinite(n))return this;n=Math.pow(10,Math.round(Math.log(n)/Math.log(10))-1);d=[Math.floor(r/n)*n,Math.ceil(o/n)*n];m&&d.reverse();f=d.map(l);return this};c.by=function(o){function n(){return c(o.apply(this,
arguments))}for(var m in c)n[m]=c[m];return n};c.domain.apply(c,arguments);return c};pv.Scale.linear=function(){var b=pv.Scale.quantitative();b.domain.apply(b,arguments);return b};
pv.Scale.log=function(){var b=pv.Scale.quantitative(1,10),c,d,f=function(h){return Math.log(h)/d},g=function(h){return Math.pow(c,h)};b.ticks=function(){var h=b.domain(),i=h[0]<0,j=Math.floor(i?-f(-h[0]):f(h[0])),l=Math.ceil(i?-f(-h[1]):f(h[1])),k=[];if(i)for(k.push(-g(-j));j++<l;)for(i=c-1;i>0;i--)k.push(-g(-j)*i);else{for(;j<l;j++)for(i=1;i<c;i++)k.push(g(j)*i);k.push(g(j))}for(j=0;k[j]<h[0];j++);for(l=k.length;k[l-1]>h[1];l--);return k.slice(j,l)};b.tickFormat=function(h){return h.toPrecision(1)};
b.nice=function(){var h=b.domain();return b.domain(pv.logFloor(h[0],c),pv.logCeil(h[1],c))};b.base=function(h){if(arguments.length){c=Number(h);d=Math.log(c);b.transform(f,g);return this}return c};b.domain.apply(b,arguments);return b.base(10)};pv.Scale.root=function(){var b=pv.Scale.quantitative();b.power=function(c){if(arguments.length){var d=Number(c),f=1/d;b.transform(function(g){return Math.pow(g,f)},function(g){return Math.pow(g,d)});return this}return d};b.domain.apply(b,arguments);return b.power(2)};
pv.Scale.ordinal=function(){function b(g){g in d||(d[g]=c.push(g)-1);return f[d[g]%f.length]}var c=[],d={},f=[];b.domain=function(g,h){if(arguments.length){g=g instanceof Array?arguments.length>1?pv.map(g,h):g:Array.prototype.slice.call(arguments);c=[];for(var i={},j=0;j<g.length;j++){var l=g[j];if(!(l in i)){i[l]=true;c.push(l)}}d=pv.numerate(c);return this}return c};b.range=function(g,h){if(arguments.length){f=g instanceof Array?arguments.length>1?pv.map(g,h):g:Array.prototype.slice.call(arguments);
if(typeof f[0]=="string")f=f.map(pv.color);return this}return f};b.split=function(g,h){var i=(h-g)/this.domain().length;f=pv.range(g+i/2,h,i);return this};b.splitFlush=function(g,h){var i=this.domain().length,j=(h-g)/(i-1);f=i==1?[(g+h)/2]:pv.range(g,h+j/2,j);return this};b.splitBanded=function(g,h,i){if(arguments.length<3)i=1;if(i<0){var j=this.domain().length;j=(h-g- -i*j)/(j+1);f=pv.range(g+j,h,j-i);f.band=-i}else{j=(h-g)/(this.domain().length+(1-i));f=pv.range(g+j*(1-i),h,j);f.band=j*i}return this};
b.by=function(g){function h(){return b(g.apply(this,arguments))}for(var i in b)h[i]=b[i];return h};b.domain.apply(b,arguments);return b};
pv.Scale.quantile=function(){function b(i){return h(Math.max(0,Math.min(d,pv.search.index(f,i)-1))/d)}var c=-1,d=-1,f=[],g=[],h=pv.Scale.linear();b.quantiles=function(i){if(arguments.length){c=Number(i);if(c<0){f=[g[0]].concat(g);d=g.length-1}else{f=[];f[0]=g[0];for(var j=1;j<=c;j++)f[j]=g[~~(j*(g.length-1)/c)];d=c-1}return this}return f};b.domain=function(i,j){if(arguments.length){g=i instanceof Array?pv.map(i,j):Array.prototype.slice.call(arguments);g.sort(pv.naturalOrder);b.quantiles(c);return this}return g};
b.range=function(){if(arguments.length){h.range.apply(h,arguments);return this}return h.range()};b.by=function(i){function j(){return b(i.apply(this,arguments))}for(var l in b)j[l]=b[l];return j};b.domain.apply(b,arguments);return b};
pv.histogram=function(b,c){var d=true;return{bins:function(f){var g=pv.map(b,c),h=[];arguments.length||(f=pv.Scale.linear(g).ticks());for(var i=0;i<f.length-1;i++){var j=h[i]=[];j.x=f[i];j.dx=f[i+1]-f[i];j.y=0}for(i=0;i<g.length;i++){j=pv.search.index(f,g[i])-1;j=h[Math.max(0,Math.min(h.length-1,j))];j.y++;j.push(b[i])}if(!d)for(i=0;i<h.length;i++)h[i].y/=g.length;return h},frequency:function(f){if(arguments.length){d=Boolean(f);return this}return d}}};
pv.color=function(b){if(b.rgb)return b.rgb();var c=/([a-z]+)\((.*)\)/i.exec(b);if(c){var d=c[2].split(","),f=1;switch(c[1]){case "hsla":case "rgba":f=parseFloat(d[3]);if(!f)return pv.Color.transparent;break}switch(c[1]){case "hsla":case "hsl":b=parseFloat(d[0]);var g=parseFloat(d[1])/100;d=parseFloat(d[2])/100;return(new pv.Color.Hsl(b,g,d,f)).rgb();case "rgba":case "rgb":function h(l){var k=parseFloat(l);return l[l.length-1]=="%"?Math.round(k*2.55):k}g=h(d[0]);var i=h(d[1]),j=h(d[2]);return pv.rgb(g,
i,j,f)}}if(f=pv.Color.names[b])return f;if(b.charAt(0)=="#"){if(b.length==4){g=b.charAt(1);g+=g;i=b.charAt(2);i+=i;j=b.charAt(3);j+=j}else if(b.length==7){g=b.substring(1,3);i=b.substring(3,5);j=b.substring(5,7)}return pv.rgb(parseInt(g,16),parseInt(i,16),parseInt(j,16),1)}return new pv.Color(b,1)};pv.Color=function(b,c){this.color=b;this.opacity=c};pv.Color.prototype.brighter=function(b){return this.rgb().brighter(b)};pv.Color.prototype.darker=function(b){return this.rgb().darker(b)};
pv.rgb=function(b,c,d,f){return new pv.Color.Rgb(b,c,d,arguments.length==4?f:1)};pv.Color.Rgb=function(b,c,d,f){pv.Color.call(this,f?"rgb("+b+","+c+","+d+")":"none",f);this.r=b;this.g=c;this.b=d;this.a=f};pv.Color.Rgb.prototype=pv.extend(pv.Color);a=pv.Color.Rgb.prototype;a.red=function(b){return pv.rgb(b,this.g,this.b,this.a)};a.green=function(b){return pv.rgb(this.r,b,this.b,this.a)};a.blue=function(b){return pv.rgb(this.r,this.g,b,this.a)};
a.alpha=function(b){return pv.rgb(this.r,this.g,this.b,b)};a.rgb=function(){return this};a.brighter=function(b){b=Math.pow(0.7,arguments.length?b:1);var c=this.r,d=this.g,f=this.b;if(!c&&!d&&!f)return pv.rgb(30,30,30,this.a);if(c&&c<30)c=30;if(d&&d<30)d=30;if(f&&f<30)f=30;return pv.rgb(Math.min(255,Math.floor(c/b)),Math.min(255,Math.floor(d/b)),Math.min(255,Math.floor(f/b)),this.a)};
a.darker=function(b){b=Math.pow(0.7,arguments.length?b:1);return pv.rgb(Math.max(0,Math.floor(b*this.r)),Math.max(0,Math.floor(b*this.g)),Math.max(0,Math.floor(b*this.b)),this.a)};pv.hsl=function(b,c,d,f){return new pv.Color.Hsl(b,c,d,arguments.length==4?f:1)};pv.Color.Hsl=function(b,c,d,f){pv.Color.call(this,"hsl("+b+","+c*100+"%,"+d*100+"%)",f);this.h=b;this.s=c;this.l=d;this.a=f};pv.Color.Hsl.prototype=pv.extend(pv.Color);a=pv.Color.Hsl.prototype;
a.hue=function(b){return pv.hsl(b,this.s,this.l,this.a)};a.saturation=function(b){return pv.hsl(this.h,b,this.l,this.a)};a.lightness=function(b){return pv.hsl(this.h,this.s,b,this.a)};a.alpha=function(b){return pv.hsl(this.h,this.s,this.l,b)};
a.rgb=function(){function b(j){if(j>360)j-=360;else if(j<0)j+=360;if(j<60)return i+(h-i)*j/60;if(j<180)return h;if(j<240)return i+(h-i)*(240-j)/60;return i}function c(j){return Math.round(b(j)*255)}var d=this.h,f=this.s,g=this.l;d%=360;if(d<0)d+=360;f=Math.max(0,Math.min(f,1));g=Math.max(0,Math.min(g,1));var h=g<=0.5?g*(1+f):g+f-g*f,i=2*g-h;return pv.rgb(c(d+120),c(d),c(d-120),this.a)};
pv.Color.names={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",
darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",
ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",
lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",
moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",
seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32",transparent:pv.Color.transparent=pv.rgb(0,0,0,0)};(function(){var b=pv.Color.names;for(var c in b)b[c]=pv.color(b[c])})();
pv.colors=function(){var b=pv.Scale.ordinal();b.range.apply(b,arguments);return b};pv.Colors={};pv.Colors.category10=function(){var b=pv.colors("#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf");b.domain.apply(b,arguments);return b};
pv.Colors.category20=function(){var b=pv.colors("#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5");b.domain.apply(b,arguments);return b};
pv.Colors.category19=function(){var b=pv.colors("#9c9ede","#7375b5","#4a5584","#cedb9c","#b5cf6b","#8ca252","#637939","#e7cb94","#e7ba52","#bd9e39","#8c6d31","#e7969c","#d6616b","#ad494a","#843c39","#de9ed6","#ce6dbd","#a55194","#7b4173");b.domain.apply(b,arguments);return b};pv.ramp=function(){var b=pv.Scale.linear();b.range.apply(b,arguments);return b};
pv.Scene=pv.SvgScene={svg:"http://www.w3.org/2000/svg",xmlns:"http://www.w3.org/2000/xmlns",xlink:"http://www.w3.org/1999/xlink",xhtml:"http://www.w3.org/1999/xhtml",scale:1,events:["DOMMouseScroll","mousewheel","mousedown","mouseup","mouseover","mouseout","mousemove","click","dblclick"],implicit:{svg:{"shape-rendering":"auto","pointer-events":"painted",x:0,y:0,dy:0,"text-anchor":"start",transform:"translate(0,0)",fill:"none","fill-opacity":1,stroke:"none","stroke-opacity":1,"stroke-width":1.5,"stroke-linejoin":"miter"},
css:{font:"10px sans-serif"}}};pv.SvgScene.updateAll=function(b){if(b.length&&b[0].reverse&&b.type!="line"&&b.type!="area"){for(var c=pv.extend(b),d=0,f=b.length-1;f>=0;d++,f--)c[d]=b[f];b=c}this.removeSiblings(this[b.type](b))};pv.SvgScene.create=function(b){return document.createElementNS(this.svg,b)};
pv.SvgScene.expect=function(b,c,d,f){if(b){if(b.tagName=="a")b=b.firstChild;if(b.tagName!=c){c=this.create(c);b.parentNode.replaceChild(c,b);b=c}}else b=this.create(c);for(var g in d){c=d[g];if(c==this.implicit.svg[g])c=null;c==null?b.removeAttribute(g):b.setAttribute(g,c)}for(g in f){c=f[g];if(c==this.implicit.css[g])c=null;if(c==null)b.style.removeProperty(g);else b.style[g]=c}return b};
pv.SvgScene.append=function(b,c,d){b.$scene={scenes:c,index:d};b=this.title(b,c[d]);b.parentNode||c.$g.appendChild(b);return b.nextSibling};pv.SvgScene.title=function(b,c){var d=b.parentNode;if(d&&d.tagName!="a")d=null;if(c.title){if(!d){d=this.create("a");b.parentNode&&b.parentNode.replaceChild(d,b);d.appendChild(b)}d.setAttributeNS(this.xlink,"title",c.title);return d}d&&d.parentNode.replaceChild(b,d);return b};
pv.SvgScene.dispatch=pv.listener(function(b){var c=b.target.$scene;if(c){var d=b.type;switch(d){case "DOMMouseScroll":d="mousewheel";b.wheel=-480*b.detail;break;case "mousewheel":b.wheel=(window.opera?12:1)*b.wheelDelta;break}pv.Mark.dispatch(d,c.scenes,c.index)&&b.preventDefault()}});pv.SvgScene.removeSiblings=function(b){for(;b;){var c=b.nextSibling;b.parentNode.removeChild(b);b=c}};pv.SvgScene.undefined=function(){};
pv.SvgScene.pathBasis=function(){function b(f,g,h,i,j){return{x:f[0]*g.left+f[1]*h.left+f[2]*i.left+f[3]*j.left,y:f[0]*g.top+f[1]*h.top+f[2]*i.top+f[3]*j.top}}var c=[[1/6,2/3,1/6,0],[0,2/3,1/3,0],[0,1/3,2/3,0],[0,1/6,2/3,1/6]],d=function(f,g,h,i){var j=b(c[1],f,g,h,i),l=b(c[2],f,g,h,i);f=b(c[3],f,g,h,i);return"C"+j.x+","+j.y+","+l.x+","+l.y+","+f.x+","+f.y};d.segment=function(f,g,h,i){var j=b(c[0],f,g,h,i),l=b(c[1],f,g,h,i),k=b(c[2],f,g,h,i);f=b(c[3],f,g,h,i);return"M"+j.x+","+j.y+"C"+l.x+","+l.y+
","+k.x+","+k.y+","+f.x+","+f.y};return d}();pv.SvgScene.curveBasis=function(b){if(b.length<=2)return"";var c="",d=b[0],f=d,g=d,h=b[1];c+=this.pathBasis(d,f,g,h);for(var i=2;i<b.length;i++){d=f;f=g;g=h;h=b[i];c+=this.pathBasis(d,f,g,h)}c+=this.pathBasis(f,g,h,h);c+=this.pathBasis(g,h,h,h);return c};
pv.SvgScene.curveBasisSegments=function(b){if(b.length<=2)return"";var c=[],d=b[0],f=d,g=d,h=b[1],i=this.pathBasis.segment(d,f,g,h);d=f;f=g;g=h;h=b[2];c.push(i+this.pathBasis(d,f,g,h));for(i=3;i<b.length;i++){d=f;f=g;g=h;h=b[i];c.push(this.pathBasis.segment(d,f,g,h))}c.push(this.pathBasis.segment(f,g,h,h)+this.pathBasis(g,h,h,h));return c};
pv.SvgScene.curveHermite=function(b,c){if(c.length<1||b.length!=c.length&&b.length!=c.length+2)return"";var d=b.length!=c.length,f="",g=b[0],h=b[1],i=c[0],j=i,l=1;if(d){f+="Q"+(h.left-i.x*2/3)+","+(h.top-i.y*2/3)+","+h.left+","+h.top;g=b[1];l=2}if(c.length>1){j=c[1];h=b[l];l++;f+="C"+(g.left+i.x)+","+(g.top+i.y)+","+(h.left-j.x)+","+(h.top-j.y)+","+h.left+","+h.top;for(g=2;g<c.length;g++,l++){h=b[l];j=c[g];f+="S"+(h.left-j.x)+","+(h.top-j.y)+","+h.left+","+h.top}}if(d){b=b[l];f+="Q"+(h.left+j.x*2/
3)+","+(h.top+j.y*2/3)+","+b.left+","+b.top}return f};
pv.SvgScene.curveHermiteSegments=function(b,c){if(c.length<1||b.length!=c.length&&b.length!=c.length+2)return[];var d=b.length!=c.length,f=[],g=b[0],h=g,i=c[0],j=i,l=1;if(d){h=b[1];f.push("M"+g.left+","+g.top+"Q"+(h.left-j.x*2/3)+","+(h.top-j.y*2/3)+","+h.left+","+h.top);l=2}for(var k=1;k<c.length;k++,l++){g=h;i=j;h=b[l];j=c[k];f.push("M"+g.left+","+g.top+"C"+(g.left+i.x)+","+(g.top+i.y)+","+(h.left-j.x)+","+(h.top-j.y)+","+h.left+","+h.top)}if(d){b=b[l];f.push("M"+h.left+","+h.top+"Q"+(h.left+j.x*
2/3)+","+(h.top+j.y*2/3)+","+b.left+","+b.top)}return f};pv.SvgScene.cardinalTangents=function(b,c){var d=[];c=(1-c)/2;for(var f=b[0],g=b[1],h=b[2],i=3;i<b.length;i++){d.push({x:c*(h.left-f.left),y:c*(h.top-f.top)});f=g;g=h;h=b[i]}d.push({x:c*(h.left-f.left),y:c*(h.top-f.top)});return d};pv.SvgScene.curveCardinal=function(b,c){if(b.length<=2)return"";return this.curveHermite(b,this.cardinalTangents(b,c))};
pv.SvgScene.curveCardinalSegments=function(b,c){if(b.length<=2)return"";return this.curveHermiteSegments(b,this.cardinalTangents(b,c))};
pv.SvgScene.monotoneTangents=function(b){var c=[],d=[],f=[],g=[],h=0;for(h=0;h<b.length-1;h++)d[h]=(b[h+1].top-b[h].top)/(b[h+1].left-b[h].left);f[0]=d[0];g[0]=b[1].left-b[0].left;for(h=1;h<b.length-1;h++){f[h]=(d[h-1]+d[h])/2;g[h]=(b[h+1].left-b[h-1].left)/2}f[h]=d[h-1];g[h]=b[h].left-b[h-1].left;for(h=0;h<b.length-1;h++)if(d[h]==0){f[h]=0;f[h+1]=0}for(h=0;h<b.length-1;h++)if(!(Math.abs(f[h])<1.0E-5||Math.abs(f[h+1])<1.0E-5)){var i=f[h]/d[h],j=f[h+1]/d[h],l=i*i+j*j;if(l>9){l=3/Math.sqrt(l);f[h]=
l*i*d[h];f[h+1]=l*j*d[h]}}for(h=0;h<b.length;h++){d=1+f[h]*f[h];c.push({x:g[h]/3/d,y:f[h]*g[h]/3/d})}return c};pv.SvgScene.curveMonotone=function(b){if(b.length<=2)return"";return this.curveHermite(b,this.monotoneTangents(b))};pv.SvgScene.curveMonotoneSegments=function(b){if(b.length<=2)return"";return this.curveHermiteSegments(b,this.monotoneTangents(b))};
pv.SvgScene.area=function(b){function c(o,n){for(var m=[],r=[],s=n;o<=s;o++,n--){var u=b[o],x=b[n];u=u.left+","+u.top;x=x.left+x.width+","+(x.top+x.height);if(o<s){var t=b[o+1],p=b[n-1];switch(g.interpolate){case "step-before":u+="V"+t.top;x+="H"+(p.left+p.width);break;case "step-after":u+="H"+t.left;x+="V"+(p.top+p.height);break}}m.push(u);r.push(x)}return m.concat(r).join("L")}function d(o,n){for(var m=[],r=[],s=n;o<=s;o++,n--){var u=b[n];m.push(b[o]);r.push({left:u.left+u.width,top:u.top+u.height})}if(g.interpolate==
"basis"){o=pv.SvgScene.curveBasis(m);n=pv.SvgScene.curveBasis(r)}else if(g.interpolate=="cardinal"){o=pv.SvgScene.curveCardinal(m,g.tension);n=pv.SvgScene.curveCardinal(r,g.tension)}else{o=pv.SvgScene.curveMonotone(m);n=pv.SvgScene.curveMonotone(r)}return m[0].left+","+m[0].top+o+"L"+r[0].left+","+r[0].top+n}var f=b.$g.firstChild;if(!b.length)return f;var g=b[0];if(g.segmented)return this.areaSegment(b);if(!g.visible)return f;var h=g.fillStyle,i=g.strokeStyle;if(!h.opacity&&!i.opacity)return f;for(var j=
[],l,k=0;k<b.length;k++){l=b[k];if(l.width||l.height){for(var q=k+1;q<b.length;q++){l=b[q];if(!l.width&&!l.height)break}k&&g.interpolate!="step-after"&&k--;q<b.length&&g.interpolate!="step-before"&&q++;j.push((q-k>2&&(g.interpolate=="basis"||g.interpolate=="cardinal"||g.interpolate=="monotone")?d:c)(k,q-1));k=q-1}}if(!j.length)return f;f=this.expect(f,"path",{"shape-rendering":g.antialias?null:"crispEdges","pointer-events":g.events,cursor:g.cursor,d:"M"+j.join("ZM")+"Z",fill:h.color,"fill-opacity":h.opacity||
null,stroke:i.color,"stroke-opacity":i.opacity||null,"stroke-width":i.opacity?g.lineWidth/this.scale:null});return this.append(f,b,0)};
pv.SvgScene.areaSegment=function(b){var c=b.$g.firstChild,d=b[0],f,g;if(d.interpolate=="basis"||d.interpolate=="cardinal"||d.interpolate=="monotone"){f=[];g=[];for(var h=0,i=b.length;h<i;h++){var j=b[i-h-1];f.push(b[h]);g.push({left:j.left+j.width,top:j.top+j.height})}if(d.interpolate=="basis"){f=this.curveBasisSegments(f);g=this.curveBasisSegments(g)}else if(d.interpolate=="cardinal"){f=this.curveCardinalSegments(f,d.tension);g=this.curveCardinalSegments(g,d.tension)}else{f=this.curveMonotoneSegments(f);
g=this.curveMonotoneSegments(g)}}h=0;for(i=b.length-1;h<i;h++){d=b[h];var l=b[h+1];if(d.visible&&l.visible){var k=d.fillStyle,q=d.strokeStyle;if(k.opacity||q.opacity){if(f){j=f[h];l="L"+g[i-h-1].substr(1);j=j+l+"Z"}else{var o=d;j=l;switch(d.interpolate){case "step-before":o=l;break;case "step-after":j=d;break}j="M"+d.left+","+o.top+"L"+l.left+","+j.top+"L"+(l.left+l.width)+","+(j.top+j.height)+"L"+(d.left+d.width)+","+(o.top+o.height)+"Z"}c=this.expect(c,"path",{"shape-rendering":d.antialias?null:
"crispEdges","pointer-events":d.events,cursor:d.cursor,d:j,fill:k.color,"fill-opacity":k.opacity||null,stroke:q.color,"stroke-opacity":q.opacity||null,"stroke-width":q.opacity?d.lineWidth/this.scale:null});c=this.append(c,b,h)}}}return c};
pv.SvgScene.bar=function(b){for(var c=b.$g.firstChild,d=0;d<b.length;d++){var f=b[d];if(f.visible){var g=f.fillStyle,h=f.strokeStyle;if(g.opacity||h.opacity){c=this.expect(c,"rect",{"shape-rendering":f.antialias?null:"crispEdges","pointer-events":f.events,cursor:f.cursor,x:f.left,y:f.top,width:Math.max(1.0E-10,f.width),height:Math.max(1.0E-10,f.height),fill:g.color,"fill-opacity":g.opacity||null,stroke:h.color,"stroke-opacity":h.opacity||null,"stroke-width":h.opacity?f.lineWidth/this.scale:null});
c=this.append(c,b,d)}}}return c};
pv.SvgScene.dot=function(b){for(var c=b.$g.firstChild,d=0;d<b.length;d++){var f=b[d];if(f.visible){var g=f.fillStyle,h=f.strokeStyle;if(g.opacity||h.opacity){var i=f.radius,j=null;switch(f.shape){case "cross":j="M"+-i+","+-i+"L"+i+","+i+"M"+i+","+-i+"L"+-i+","+i;break;case "triangle":j=i;var l=i*1.1547;j="M0,"+j+"L"+l+","+-j+" "+-l+","+-j+"Z";break;case "diamond":i*=Math.SQRT2;j="M0,"+-i+"L"+i+",0 0,"+i+" "+-i+",0Z";break;case "square":j="M"+-i+","+-i+"L"+i+","+-i+" "+i+","+i+" "+-i+","+i+"Z";break;
case "tick":j="M0,0L0,"+-f.size;break;case "bar":j="M0,"+f.size/2+"L0,"+-(f.size/2);break}g={"shape-rendering":f.antialias?null:"crispEdges","pointer-events":f.events,cursor:f.cursor,fill:g.color,"fill-opacity":g.opacity||null,stroke:h.color,"stroke-opacity":h.opacity||null,"stroke-width":h.opacity?f.lineWidth/this.scale:null};if(j){g.transform="translate("+f.left+","+f.top+")";if(f.angle)g.transform+=" rotate("+180*f.angle/Math.PI+")";g.d=j;c=this.expect(c,"path",g)}else{g.cx=f.left;g.cy=f.top;g.r=
i;c=this.expect(c,"circle",g)}c=this.append(c,b,d)}}}return c};
pv.SvgScene.image=function(b){for(var c=b.$g.firstChild,d=0;d<b.length;d++){var f=b[d];if(f.visible){c=this.fill(c,b,d);if(f.image){c=this.expect(c,"foreignObject",{cursor:f.cursor,x:f.left,y:f.top,width:f.width,height:f.height});var g=c.firstChild||c.appendChild(document.createElementNS(this.xhtml,"canvas"));g.$scene={scenes:b,index:d};g.style.width=f.width;g.style.height=f.height;g.width=f.imageWidth;g.height=f.imageHeight;g.getContext("2d").putImageData(f.image,0,0)}else{c=this.expect(c,"image",
{preserveAspectRatio:"none",cursor:f.cursor,x:f.left,y:f.top,width:f.width,height:f.height});c.setAttributeNS(this.xlink,"href",f.url)}c=this.append(c,b,d);c=this.stroke(c,b,d)}}return c};
pv.SvgScene.label=function(b){for(var c=b.$g.firstChild,d=0;d<b.length;d++){var f=b[d];if(f.visible){var g=f.textStyle;if(g.opacity&&f.text){var h=0,i=0,j=0,l="start";switch(f.textBaseline){case "middle":j=".35em";break;case "top":j=".71em";i=f.textMargin;break;case "bottom":i="-"+f.textMargin;break}switch(f.textAlign){case "right":l="end";h="-"+f.textMargin;break;case "center":l="middle";break;case "left":h=f.textMargin;break}c=this.expect(c,"text",{"pointer-events":f.events,cursor:f.cursor,x:h,
y:i,dy:j,transform:"translate("+f.left+","+f.top+")"+(f.textAngle?" rotate("+180*f.textAngle/Math.PI+")":"")+(this.scale!=1?" scale("+1/this.scale+")":""),fill:g.color,"fill-opacity":g.opacity||null,"text-anchor":l},{font:f.font,"text-shadow":f.textShadow,"text-decoration":f.textDecoration});if(c.firstChild)c.firstChild.nodeValue=f.text;else c.appendChild(document.createTextNode(f.text));c=this.append(c,b,d)}}}return c};
pv.SvgScene.line=function(b){var c=b.$g.firstChild;if(b.length<2)return c;var d=b[0];if(d.segmented)return this.lineSegment(b);if(!d.visible)return c;var f=d.fillStyle,g=d.strokeStyle;if(!f.opacity&&!g.opacity)return c;var h="M"+d.left+","+d.top;if(b.length>2&&(d.interpolate=="basis"||d.interpolate=="cardinal"||d.interpolate=="monotone"))switch(d.interpolate){case "basis":h+=this.curveBasis(b);break;case "cardinal":h+=this.curveCardinal(b,d.tension);break;case "monotone":h+=this.curveMonotone(b);
break}else for(var i=1;i<b.length;i++)h+=this.pathSegment(b[i-1],b[i]);c=this.expect(c,"path",{"shape-rendering":d.antialias?null:"crispEdges","pointer-events":d.events,cursor:d.cursor,d:h,fill:f.color,"fill-opacity":f.opacity||null,stroke:g.color,"stroke-opacity":g.opacity||null,"stroke-width":g.opacity?d.lineWidth/this.scale:null,"stroke-linejoin":d.lineJoin});return this.append(c,b,0)};
pv.SvgScene.lineSegment=function(b){var c=b.$g.firstChild,d=b[0],f;switch(d.interpolate){case "basis":f=this.curveBasisSegments(b);break;case "cardinal":f=this.curveCardinalSegments(b,d.tension);break;case "monotone":f=this.curveMonotoneSegments(b);break}d=0;for(var g=b.length-1;d<g;d++){var h=b[d],i=b[d+1];if(h.visible&&i.visible){var j=h.strokeStyle,l=pv.Color.transparent;if(j.opacity){if(h.interpolate=="linear"&&h.lineJoin=="miter"){l=j;j=pv.Color.transparent;i=this.pathJoin(b[d-1],h,i,b[d+2])}else i=
f?f[d]:"M"+h.left+","+h.top+this.pathSegment(h,i);c=this.expect(c,"path",{"shape-rendering":h.antialias?null:"crispEdges","pointer-events":h.events,cursor:h.cursor,d:i,fill:l.color,"fill-opacity":l.opacity||null,stroke:j.color,"stroke-opacity":j.opacity||null,"stroke-width":j.opacity?h.lineWidth/this.scale:null,"stroke-linejoin":h.lineJoin});c=this.append(c,b,d)}}}return c};
pv.SvgScene.pathSegment=function(b,c){var d=1;switch(b.interpolate){case "polar-reverse":d=0;case "polar":var f=c.left-b.left,g=c.top-b.top;b=1-b.eccentricity;f=Math.sqrt(f*f+g*g)/(2*b);if(b<=0||b>1)break;return"A"+f+","+f+" 0 0,"+d+" "+c.left+","+c.top;case "step-before":return"V"+c.top+"H"+c.left;case "step-after":return"H"+c.left+"V"+c.top}return"L"+c.left+","+c.top};pv.SvgScene.lineIntersect=function(b,c,d,f){return b.plus(c.times(d.minus(b).dot(f.perp())/c.dot(f.perp())))};
pv.SvgScene.pathJoin=function(b,c,d,f){var g=pv.vector(c.left,c.top);d=pv.vector(d.left,d.top);var h=d.minus(g),i=h.perp().norm(),j=i.times(c.lineWidth/(2*this.scale));c=g.plus(j);var l=d.plus(j),k=d.minus(j);j=g.minus(j);if(b&&b.visible){b=g.minus(b.left,b.top).perp().norm().plus(i);j=this.lineIntersect(g,b,j,h);c=this.lineIntersect(g,b,c,h)}if(f&&f.visible){f=pv.vector(f.left,f.top).minus(d).perp().norm().plus(i);k=this.lineIntersect(d,f,k,h);l=this.lineIntersect(d,f,l,h)}return"M"+c.x+","+c.y+
"L"+l.x+","+l.y+" "+k.x+","+k.y+" "+j.x+","+j.y};
pv.SvgScene.panel=function(b){for(var c=b.$g,d=c&&c.firstChild,f=0;f<b.length;f++){var g=b[f];if(g.visible){if(!b.parent){g.canvas.style.display="inline-block";if(c&&c.parentNode!=g.canvas)d=(c=g.canvas.firstChild)&&c.firstChild;if(!c){c=g.canvas.appendChild(this.create("svg"));c.setAttribute("font-size","10px");c.setAttribute("font-family","sans-serif");c.setAttribute("fill","none");c.setAttribute("stroke","none");c.setAttribute("stroke-width",1.5);for(var h=0;h<this.events.length;h++)c.addEventListener(this.events[h],
this.dispatch,false);d=c.firstChild}b.$g=c;c.setAttribute("width",g.width+g.left+g.right);c.setAttribute("height",g.height+g.top+g.bottom)}if(g.overflow=="hidden"){h=pv.id().toString(36);var i=this.expect(d,"g",{"clip-path":"url(#"+h+")"});i.parentNode||c.appendChild(i);b.$g=c=i;d=i.firstChild;d=this.expect(d,"clipPath",{id:h});h=d.firstChild||d.appendChild(this.create("rect"));h.setAttribute("x",g.left);h.setAttribute("y",g.top);h.setAttribute("width",g.width);h.setAttribute("height",g.height);d.parentNode||
c.appendChild(d);d=d.nextSibling}d=this.fill(d,b,f);var j=this.scale,l=g.transform,k=g.left+l.x,q=g.top+l.y;this.scale*=l.k;for(h=0;h<g.children.length;h++){g.children[h].$g=d=this.expect(d,"g",{transform:"translate("+k+","+q+")"+(l.k!=1?" scale("+l.k+")":"")});this.updateAll(g.children[h]);d.parentNode||c.appendChild(d);d=d.nextSibling}this.scale=j;d=this.stroke(d,b,f);if(g.overflow=="hidden"){b.$g=c=i.parentNode;d=i.nextSibling}}}return d};
pv.SvgScene.fill=function(b,c,d){var f=c[d],g=f.fillStyle;if(g.opacity||f.events=="all"){b=this.expect(b,"rect",{"shape-rendering":f.antialias?null:"crispEdges","pointer-events":f.events,cursor:f.cursor,x:f.left,y:f.top,width:f.width,height:f.height,fill:g.color,"fill-opacity":g.opacity,stroke:null});b=this.append(b,c,d)}return b};
pv.SvgScene.stroke=function(b,c,d){var f=c[d],g=f.strokeStyle;if(g.opacity||f.events=="all"){b=this.expect(b,"rect",{"shape-rendering":f.antialias?null:"crispEdges","pointer-events":f.events=="all"?"stroke":f.events,cursor:f.cursor,x:f.left,y:f.top,width:Math.max(1.0E-10,f.width),height:Math.max(1.0E-10,f.height),fill:null,stroke:g.color,"stroke-opacity":g.opacity,"stroke-width":f.lineWidth/this.scale});b=this.append(b,c,d)}return b};
pv.SvgScene.rule=function(b){for(var c=b.$g.firstChild,d=0;d<b.length;d++){var f=b[d];if(f.visible){var g=f.strokeStyle;if(g.opacity){c=this.expect(c,"line",{"shape-rendering":f.antialias?null:"crispEdges","pointer-events":f.events,cursor:f.cursor,x1:f.left,y1:f.top,x2:f.left+f.width,y2:f.top+f.height,stroke:g.color,"stroke-opacity":g.opacity,"stroke-width":f.lineWidth/this.scale});c=this.append(c,b,d)}}}return c};
pv.SvgScene.wedge=function(b){for(var c=b.$g.firstChild,d=0;d<b.length;d++){var f=b[d];if(f.visible){var g=f.fillStyle,h=f.strokeStyle;if(g.opacity||h.opacity){var i=f.innerRadius,j=f.outerRadius,l=Math.abs(f.angle);if(l>=2*Math.PI)i=i?"M0,"+j+"A"+j+","+j+" 0 1,1 0,"+-j+"A"+j+","+j+" 0 1,1 0,"+j+"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"Z":"M0,"+j+"A"+j+","+j+" 0 1,1 0,"+-j+"A"+j+","+j+" 0 1,1 0,"+j+"Z";else{var k=Math.min(f.startAngle,f.endAngle),q=Math.max(f.startAngle,f.endAngle),
o=Math.cos(k),n=Math.cos(q);k=Math.sin(k);q=Math.sin(q);i=i?"M"+j*o+","+j*k+"A"+j+","+j+" 0 "+(l<Math.PI?"0":"1")+",1 "+j*n+","+j*q+"L"+i*n+","+i*q+"A"+i+","+i+" 0 "+(l<Math.PI?"0":"1")+",0 "+i*o+","+i*k+"Z":"M"+j*o+","+j*k+"A"+j+","+j+" 0 "+(l<Math.PI?"0":"1")+",1 "+j*n+","+j*q+"L0,0Z"}c=this.expect(c,"path",{"shape-rendering":f.antialias?null:"crispEdges","pointer-events":f.events,cursor:f.cursor,transform:"translate("+f.left+","+f.top+")",d:i,fill:g.color,"fill-rule":"evenodd","fill-opacity":g.opacity||
null,stroke:h.color,"stroke-opacity":h.opacity||null,"stroke-width":h.opacity?f.lineWidth/this.scale:null});c=this.append(c,b,d)}}}return c};pv.Mark=function(){this.$properties=[];this.$handlers={}};pv.Mark.prototype.properties={};pv.Mark.cast={};pv.Mark.prototype.property=function(b,c){if(!this.hasOwnProperty("properties"))this.properties=pv.extend(this.properties);this.properties[b]=true;pv.Mark.prototype.propertyMethod(b,false,pv.Mark.cast[b]=c);return this};
pv.Mark.prototype.propertyMethod=function(b,c,d){d||(d=pv.Mark.cast[b]);this[b]=function(f){if(c&&this.scene){var g=this.scene.defs;if(arguments.length){g[b]={id:f==null?0:pv.id(),value:f!=null&&d?d(f):f};return this}return g[b]?g[b].value:null}if(arguments.length){g=!c<<1|typeof f=="function";this.propertyValue(b,g&1&&d?function(){var h=f.apply(this,arguments);return h!=null?d(h):null}:f!=null&&d?d(f):f).type=g;return this}return this.instance()[b]}};
pv.Mark.prototype.propertyValue=function(b,c){var d=this.$properties;c={name:b,id:pv.id(),value:c};for(var f=0;f<d.length;f++)if(d[f].name==b){d.splice(f,1);break}d.push(c);return c};pv.Mark.prototype.property("data").property("visible",Boolean).property("left",Number).property("right",Number).property("top",Number).property("bottom",Number).property("cursor",String).property("title",String).property("reverse",Boolean).property("antialias",Boolean).property("events",String);a=pv.Mark.prototype;
a.childIndex=-1;a.index=-1;a.scale=1;a.defaults=(new pv.Mark).data(function(b){return[b]}).visible(true).antialias(true).events("painted");a.extend=function(b){this.proto=b;return this};a.add=function(b){return this.parent.add(b).extend(this)};a.def=function(b,c){this.propertyMethod(b,true);return this[b](arguments.length>1?c:null)};
a.anchor=function(b){function c(g){for(var h=d,i=[];!(f=h.scene);){g=g.parent;i.push({index:g.index,childIndex:h.childIndex});h=h.parent}for(;i.length;){g=i.pop();f=f[g.index].children[g.childIndex]}if(d.hasOwnProperty("index")){i=pv.extend(f[d.index]);i.right=i.top=i.left=i.bottom=0;return[i]}return f}var d=this,f;b||(b="center");return(new pv.Anchor(this)).name(b).def("$mark.anchor",function(){f=this.scene.target=c(this)}).data(function(){return f.map(function(g){return g.data})}).visible(function(){return f[this.index].visible}).left(function(){var g=
f[this.index],h=g.width||0;switch(this.name()){case "bottom":case "top":case "center":return g.left+h/2;case "left":return null}return g.left+h}).top(function(){var g=f[this.index],h=g.height||0;switch(this.name()){case "left":case "right":case "center":return g.top+h/2;case "top":return null}return g.top+h}).right(function(){var g=f[this.index];return this.name()=="left"?g.right+(g.width||0):null}).bottom(function(){var g=f[this.index];return this.name()=="top"?g.bottom+(g.height||0):null}).textAlign(function(){switch(this.name()){case "bottom":case "top":case "center":return"center";
case "right":return"right"}return"left"}).textBaseline(function(){switch(this.name()){case "right":case "left":case "center":return"middle";case "top":return"top"}return"bottom"})};a.anchorTarget=function(){return this.proto.anchorTarget()};a.margin=function(b){return this.left(b).right(b).top(b).bottom(b)};a.instance=function(b){var c=this.scene||this.parent.instance(-1).children[this.childIndex],d=!arguments.length||this.hasOwnProperty("index")?this.index:b;return c[d<0?c.length-1:d]};a.first=function(){return this.scene[0]};
a.last=function(){return this.scene[this.scene.length-1]};a.sibling=function(){return this.index==0?null:this.scene[this.index-1]};a.cousin=function(){var b=this.parent;return(b=b&&b.sibling())&&b.children?b.children[this.childIndex][this.index]:null};
a.render=function(){function b(i,j,l){i.scale=l;if(j<g.length){f.unshift(null);if(i.hasOwnProperty("index"))c(i,j,l);else{for(var k=0,q=i.scene.length;k<q;k++){i.index=k;c(i,j,l)}delete i.index}f.shift()}else{i.build();pv.Scene.scale=l;pv.Scene.updateAll(i.scene)}delete i.scale}function c(i,j,l){var k=i.scene[i.index],q;if(k.visible){var o=g[j],n=i.children[o];for(q=0;q<o;q++)i.children[q].scene=k.children[q];f[0]=k.data;if(n.scene)b(n,j+1,l*k.transform.k);else{n.scene=k.children[o];b(n,j+1,l*k.transform.k);
delete n.scene}for(q=0;q<o;q++)delete i.children[q].scene}}var d=this.parent,f=pv.Mark.stack;if(d&&!this.root.scene)this.root.render();else{for(var g=[],h=this;h.parent;h=h.parent)g.unshift(h.childIndex);for(this.bind();d&&!d.hasOwnProperty("index");)d=d.parent;this.context(d?d.scene:undefined,d?d.index:-1,function(){b(this.root,0,1)})}};pv.Mark.stack=[];a=pv.Mark.prototype;
a.bind=function(){function b(j){do for(var l=j.$properties,k=l.length-1;k>=0;k--){var q=l[k];if(!(q.name in c)){c[q.name]=q;switch(q.name){case "data":f=q;break;case "visible":g=q;break;default:d[q.type].push(q);break}}}while(j=j.proto)}var c={},d=[[],[],[],[]],f,g;b(this);b(this.defaults);d[1].reverse();d[3].reverse();var h=this;do for(var i in h.properties)i in c||d[2].push(c[i]={name:i,type:2,value:null});while(h=h.proto);h=d[0].concat(d[1]);for(i=0;i<h.length;i++)this.propertyMethod(h[i].name,
true);this.binds={properties:c,data:f,defs:h,required:[g],optional:pv.blend(d)}};
a.build=function(){var b=this.scene,c=pv.Mark.stack;if(!b){b=this.scene=[];b.mark=this;b.type=this.type;b.childIndex=this.childIndex;if(this.parent){b.parent=this.parent.scene;b.parentIndex=this.parent.index}}if(this.binds.defs.length){var d=b.defs;if(!d)b.defs=d={};for(var f=0;f<this.binds.defs.length;f++){var g=this.binds.defs[f],h=d[g.name];if(!h||g.id>h.id)d[g.name]={id:0,value:g.type&1?g.value.apply(this,c):g.value}}}d=this.binds.data;d=d.type&1?d.value.apply(this,c):d.value;c.unshift(null);
b.length=d.length;for(f=0;f<d.length;f++){pv.Mark.prototype.index=this.index=f;(g=b[f])||(b[f]=g={});g.data=c[0]=d[f];this.buildInstance(g)}pv.Mark.prototype.index=-1;delete this.index;c.shift();return this};a.buildProperties=function(b,c){for(var d=0,f=c.length;d<f;d++){var g=c[d],h=g.value;switch(g.type){case 0:case 1:h=this.scene.defs[g.name].value;break;case 3:h=h.apply(this,pv.Mark.stack);break}b[g.name]=h}};
a.buildInstance=function(b){this.buildProperties(b,this.binds.required);if(b.visible){this.buildProperties(b,this.binds.optional);this.buildImplied(b)}};
a.buildImplied=function(b){var c=b.left,d=b.right,f=b.top,g=b.bottom,h=this.properties,i=h.width?b.width:0,j=h.height?b.height:0,l=this.parent?this.parent.width():i+c+d;if(i==null)i=l-(d=d||0)-(c=c||0);else if(d==null)d=l-i-(c=c||0);else if(c==null)c=l-i-(d=d||0);l=this.parent?this.parent.height():j+f+g;if(j==null)j=l-(f=f||0)-(g=g||0);else if(g==null)g=l-j-(f=f||0);else if(f==null)f=l-j-(g=g||0);b.left=c;b.right=d;b.top=f;b.bottom=g;if(h.width)b.width=i;if(h.height)b.height=j;if(h.textStyle&&!b.textStyle)b.textStyle=
pv.Color.transparent;if(h.fillStyle&&!b.fillStyle)b.fillStyle=pv.Color.transparent;if(h.strokeStyle&&!b.strokeStyle)b.strokeStyle=pv.Color.transparent};
a.mouse=function(){var b=pv.event.pageX||0,c=pv.event.pageY||0,d=this.root.canvas();do{b-=d.offsetLeft;c-=d.offsetTop}while(d=d.offsetParent);d=pv.Transform.identity;var f=this.properties.transform?this:this.parent,g=[];do g.push(f);while(f=f.parent);for(;f=g.pop();)d=d.translate(f.left(),f.top()).times(f.transform());d=d.invert();return pv.vector(b*d.k+d.x,c*d.k+d.y)};a.event=function(b,c){this.$handlers[b]=pv.functor(c);return this};
a.context=function(b,c,d){function f(k,q){pv.Mark.scene=k;h.index=q;if(k){var o=k.mark,n=o,m=[];do{m.push(n);i.push(k[q].data);n.index=q;n.scene=k;q=k.parentIndex;k=k.parent}while(n=n.parent);k=m.length-1;for(q=1;k>0;k--){n=m[k];n.scale=q;q*=n.scene[n.index].transform.k}if(o.children){k=0;for(m=o.children.length;k<m;k++){n=o.children[k];n.scene=o.scene[o.index].children[k];n.scale=q}}}}function g(k){if(k){k=k.mark;var q;if(k.children)for(var o=0,n=k.children.length;o<n;o++){q=k.children[o];delete q.scene;
delete q.scale}q=k;do{i.pop();if(q.parent){delete q.scene;delete q.scale}delete q.index}while(q=q.parent)}}var h=pv.Mark.prototype,i=pv.Mark.stack,j=pv.Mark.scene,l=h.index;g(j,l);f(b,c);try{d.apply(this,i)}finally{g(b,c);f(j,l)}};pv.Mark.dispatch=function(b,c,d){var f=c.mark,g=c.parent,h=f.$handlers[b];if(!h)return g&&pv.Mark.dispatch(b,g,c.parentIndex);f.context(c,d,function(){(f=h.apply(f,pv.Mark.stack))&&f.render&&f.render()});return true};
pv.Anchor=function(b){pv.Mark.call(this);this.target=b;this.parent=b.parent};pv.Anchor.prototype=pv.extend(pv.Mark).property("name",String);pv.Anchor.prototype.anchorTarget=function(){return this.target};pv.Area=function(){pv.Mark.call(this)};
pv.Area.prototype=pv.extend(pv.Mark).property("width",Number).property("height",Number).property("lineWidth",Number).property("strokeStyle",pv.color).property("fillStyle",pv.color).property("segmented",Boolean).property("interpolate",String).property("tension",Number);pv.Area.prototype.type="area";pv.Area.prototype.defaults=(new pv.Area).extend(pv.Mark.prototype.defaults).lineWidth(1.5).fillStyle(pv.Colors.category20().by(pv.parent)).interpolate("linear").tension(0.7);
pv.Area.prototype.buildImplied=function(b){if(b.height==null)b.height=0;if(b.width==null)b.width=0;pv.Mark.prototype.buildImplied.call(this,b)};pv.Area.fixed={lineWidth:1,lineJoin:1,strokeStyle:1,fillStyle:1,segmented:1,interpolate:1,tension:1};
pv.Area.prototype.bind=function(){pv.Mark.prototype.bind.call(this);var b=this.binds,c=b.required;b=b.optional;for(var d=0,f=b.length;d<f;d++){var g=b[d];g.fixed=g.name in pv.Area.fixed;if(g.name=="segmented"){c.push(g);b.splice(d,1);d--;f--}}this.binds.$required=c;this.binds.$optional=b};
pv.Area.prototype.buildInstance=function(b){var c=this.binds;if(this.index){var d=c.fixed;if(!d){d=c.fixed=[];function f(i){return!i.fixed||(d.push(i),false)}c.required=c.required.filter(f);if(!this.scene[0].segmented)c.optional=c.optional.filter(f)}c=0;for(var g=d.length;c<g;c++){var h=d[c].name;b[h]=this.scene[0][h]}}else{c.required=c.$required;c.optional=c.$optional;c.fixed=null}pv.Mark.prototype.buildInstance.call(this,b)};
pv.Area.prototype.anchor=function(b){var c;return pv.Mark.prototype.anchor.call(this,b).def("$area.anchor",function(){c=this.scene.target}).interpolate(function(){return c[this.index].interpolate}).eccentricity(function(){return c[this.index].eccentricity}).tension(function(){return c[this.index].tension})};pv.Bar=function(){pv.Mark.call(this)};
pv.Bar.prototype=pv.extend(pv.Mark).property("width",Number).property("height",Number).property("lineWidth",Number).property("strokeStyle",pv.color).property("fillStyle",pv.color);pv.Bar.prototype.type="bar";pv.Bar.prototype.defaults=(new pv.Bar).extend(pv.Mark.prototype.defaults).lineWidth(1.5).fillStyle(pv.Colors.category20().by(pv.parent));pv.Dot=function(){pv.Mark.call(this)};
pv.Dot.prototype=pv.extend(pv.Mark).property("size",Number).property("radius",Number).property("shape",String).property("angle",Number).property("lineWidth",Number).property("strokeStyle",pv.color).property("fillStyle",pv.color);pv.Dot.prototype.type="dot";pv.Dot.prototype.defaults=(new pv.Dot).extend(pv.Mark.prototype.defaults).size(20).shape("circle").lineWidth(1.5).strokeStyle(pv.Colors.category10().by(pv.parent));
pv.Dot.prototype.anchor=function(b){var c;return pv.Mark.prototype.anchor.call(this,b).def("$wedge.anchor",function(){c=this.scene.target}).left(function(){var d=c[this.index];switch(this.name()){case "bottom":case "top":case "center":return d.left;case "left":return null}return d.left+d.radius}).right(function(){var d=c[this.index];return this.name()=="left"?d.right+d.radius:null}).top(function(){var d=c[this.index];switch(this.name()){case "left":case "right":case "center":return d.top;case "top":return null}return d.top+
d.radius}).bottom(function(){var d=c[this.index];return this.name()=="top"?d.bottom+d.radius:null}).textAlign(function(){switch(this.name()){case "left":return"right";case "bottom":case "top":case "center":return"center"}return"left"}).textBaseline(function(){switch(this.name()){case "right":case "left":case "center":return"middle";case "bottom":return"top"}return"bottom"})};
pv.Dot.prototype.buildImplied=function(b){if(b.radius==null)b.radius=Math.sqrt(b.size);else if(b.size==null)b.size=b.radius*b.radius;pv.Mark.prototype.buildImplied.call(this,b)};pv.Label=function(){pv.Mark.call(this)};
pv.Label.prototype=pv.extend(pv.Mark).property("text",String).property("font",String).property("textAngle",Number).property("textStyle",pv.color).property("textAlign",String).property("textBaseline",String).property("textMargin",Number).property("textDecoration",String).property("textShadow",String);pv.Label.prototype.type="label";pv.Label.prototype.defaults=(new pv.Label).extend(pv.Mark.prototype.defaults).events("none").text(pv.identity).font("10px sans-serif").textAngle(0).textStyle("black").textAlign("left").textBaseline("bottom").textMargin(3);
pv.Line=function(){pv.Mark.call(this)};pv.Line.prototype=pv.extend(pv.Mark).property("lineWidth",Number).property("lineJoin",String).property("strokeStyle",pv.color).property("fillStyle",pv.color).property("segmented",Boolean).property("interpolate",String).property("eccentricity",Number).property("tension",Number);a=pv.Line.prototype;a.type="line";a.defaults=(new pv.Line).extend(pv.Mark.prototype.defaults).lineJoin("miter").lineWidth(1.5).strokeStyle(pv.Colors.category10().by(pv.parent)).interpolate("linear").eccentricity(0).tension(0.7);
a.bind=pv.Area.prototype.bind;a.buildInstance=pv.Area.prototype.buildInstance;a.anchor=function(b){return pv.Area.prototype.anchor.call(this,b).textAlign(function(){switch(this.name()){case "left":return"right";case "bottom":case "top":case "center":return"center";case "right":return"left"}}).textBaseline(function(){switch(this.name()){case "right":case "left":case "center":return"middle";case "top":return"bottom";case "bottom":return"top"}})};pv.Rule=function(){pv.Mark.call(this)};
pv.Rule.prototype=pv.extend(pv.Mark).property("width",Number).property("height",Number).property("lineWidth",Number).property("strokeStyle",pv.color);pv.Rule.prototype.type="rule";pv.Rule.prototype.defaults=(new pv.Rule).extend(pv.Mark.prototype.defaults).lineWidth(1).strokeStyle("black").antialias(false);pv.Rule.prototype.anchor=pv.Line.prototype.anchor;
pv.Rule.prototype.buildImplied=function(b){var c=b.left,d=b.right;if(b.width!=null||c==null&&d==null||d!=null&&c!=null)b.height=0;else b.width=0;pv.Mark.prototype.buildImplied.call(this,b)};pv.Panel=function(){pv.Bar.call(this);this.children=[];this.root=this;this.$dom=pv.$&&pv.$.s};pv.Panel.prototype=pv.extend(pv.Bar).property("transform").property("overflow",String).property("canvas",function(b){return typeof b=="string"?document.getElementById(b):b});a=pv.Panel.prototype;a.type="panel";
a.defaults=(new pv.Panel).extend(pv.Bar.prototype.defaults).fillStyle(null).overflow("visible");a.anchor=function(b){b=pv.Bar.prototype.anchor.call(this,b);b.parent=this;return b};a.add=function(b){b=new b;b.parent=this;b.root=this.root;b.childIndex=this.children.length;this.children.push(b);return b};a.bind=function(){pv.Mark.prototype.bind.call(this);for(var b=0;b<this.children.length;b++)this.children[b].bind()};
a.buildInstance=function(b){pv.Bar.prototype.buildInstance.call(this,b);if(b.visible){if(!b.children)b.children=[];var c=this.scale*b.transform.k,d,f=this.children.length;pv.Mark.prototype.index=-1;for(var g=0;g<f;g++){d=this.children[g];d.scene=b.children[g];d.scale=c;d.build()}for(g=0;g<f;g++){d=this.children[g];b.children[g]=d.scene;delete d.scene;delete d.scale}b.children.length=f}};
a.buildImplied=function(b){if(!this.parent){var c=b.canvas;if(c){if(c.$panel!=this)for(c.$panel=this;c.lastChild;)c.removeChild(c.lastChild);var d;if(b.width==null){d=parseFloat(pv.css(c,"width"));b.width=d-b.left-b.right}if(b.height==null){d=parseFloat(pv.css(c,"height"));b.height=d-b.top-b.bottom}}else{d=this.$canvas||(this.$canvas=[]);if(!(c=d[this.index])){c=d[this.index]=document.createElement("span");if(this.$dom)this.$dom.parentNode.insertBefore(c,this.$dom);else{for(d=document.body;d.lastChild&&
d.lastChild.tagName;)d=d.lastChild;if(d!=document.body)d=d.parentNode;d.appendChild(c)}}}b.canvas=c}if(!b.transform)b.transform=pv.Transform.identity;pv.Mark.prototype.buildImplied.call(this,b)};pv.Image=function(){pv.Bar.call(this)};pv.Image.prototype=pv.extend(pv.Bar).property("url",String).property("imageWidth",Number).property("imageHeight",Number);a=pv.Image.prototype;a.type="image";a.defaults=(new pv.Image).extend(pv.Bar.prototype.defaults).fillStyle(null);
a.image=function(b){this.$image=function(){var c=b.apply(this,arguments);return c==null?pv.Color.transparent:typeof c=="string"?pv.color(c):c};return this};a.bind=function(){pv.Bar.prototype.bind.call(this);var b=this.binds,c=this;do b.image=c.$image;while(!b.image&&(c=c.proto))};
a.buildImplied=function(b){pv.Bar.prototype.buildImplied.call(this,b);if(b.visible){if(b.imageWidth==null)b.imageWidth=b.width;if(b.imageHeight==null)b.imageHeight=b.height;if(b.url==null&&this.binds.image){var c=this.$canvas||(this.$canvas=document.createElement("canvas")),d=c.getContext("2d"),f=b.imageWidth,g=b.imageHeight,h=pv.Mark.stack;c.width=f;c.height=g;b=(b.image=d.createImageData(f,g)).data;h.unshift(null,null);for(d=c=0;c<g;c++){h[1]=c;for(var i=0;i<f;i++){h[0]=i;var j=this.binds.image.apply(this,
h);b[d++]=j.r;b[d++]=j.g;b[d++]=j.b;b[d++]=255*j.a}}h.splice(0,2)}}};pv.Wedge=function(){pv.Mark.call(this)};pv.Wedge.prototype=pv.extend(pv.Mark).property("startAngle",Number).property("endAngle",Number).property("angle",Number).property("innerRadius",Number).property("outerRadius",Number).property("lineWidth",Number).property("strokeStyle",pv.color).property("fillStyle",pv.color);a=pv.Wedge.prototype;a.type="wedge";
a.defaults=(new pv.Wedge).extend(pv.Mark.prototype.defaults).startAngle(function(){var b=this.sibling();return b?b.endAngle:-Math.PI/2}).innerRadius(0).lineWidth(1.5).strokeStyle(null).fillStyle(pv.Colors.category20().by(pv.index));a.midRadius=function(){return(this.innerRadius()+this.outerRadius())/2};a.midAngle=function(){return(this.startAngle()+this.endAngle())/2};
a.anchor=function(b){function c(h){return h.innerRadius||h.angle<2*Math.PI}function d(h){return(h.innerRadius+h.outerRadius)/2}function f(h){return(h.startAngle+h.endAngle)/2}var g;return pv.Mark.prototype.anchor.call(this,b).def("$wedge.anchor",function(){g=this.scene.target}).left(function(){var h=g[this.index];if(c(h))switch(this.name()){case "outer":return h.left+h.outerRadius*Math.cos(f(h));case "inner":return h.left+h.innerRadius*Math.cos(f(h));case "start":return h.left+d(h)*Math.cos(h.startAngle);
case "center":return h.left+d(h)*Math.cos(f(h));case "end":return h.left+d(h)*Math.cos(h.endAngle)}return h.left}).top(function(){var h=g[this.index];if(c(h))switch(this.name()){case "outer":return h.top+h.outerRadius*Math.sin(f(h));case "inner":return h.top+h.innerRadius*Math.sin(f(h));case "start":return h.top+d(h)*Math.sin(h.startAngle);case "center":return h.top+d(h)*Math.sin(f(h));case "end":return h.top+d(h)*Math.sin(h.endAngle)}return h.top}).textAlign(function(){var h=g[this.index];if(c(h))switch(this.name()){case "outer":return pv.Wedge.upright(f(h))?
"right":"left";case "inner":return pv.Wedge.upright(f(h))?"left":"right"}return"center"}).textBaseline(function(){var h=g[this.index];if(c(h))switch(this.name()){case "start":return pv.Wedge.upright(h.startAngle)?"top":"bottom";case "end":return pv.Wedge.upright(h.endAngle)?"bottom":"top"}return"middle"}).textAngle(function(){var h=g[this.index],i=0;if(c(h))switch(this.name()){case "center":case "inner":case "outer":i=f(h);break;case "start":i=h.startAngle;break;case "end":i=h.endAngle;break}return pv.Wedge.upright(i)?
i:i+Math.PI})};pv.Wedge.upright=function(b){b%=2*Math.PI;b=b<0?2*Math.PI+b:b;return b<Math.PI/2||b>=3*Math.PI/2};pv.Wedge.prototype.buildImplied=function(b){if(b.angle==null)b.angle=b.endAngle-b.startAngle;else if(b.endAngle==null)b.endAngle=b.startAngle+b.angle;pv.Mark.prototype.buildImplied.call(this,b)};pv.simulation=function(b){return new pv.Simulation(b)};pv.Simulation=function(b){for(var c=0;c<b.length;c++)this.particle(b[c])};a=pv.Simulation.prototype;
a.particle=function(b){b.next=this.particles;if(isNaN(b.px))b.px=b.x;if(isNaN(b.py))b.py=b.y;if(isNaN(b.fx))b.fx=0;if(isNaN(b.fy))b.fy=0;this.particles=b;return this};a.force=function(b){b.next=this.forces;this.forces=b;return this};a.constraint=function(b){b.next=this.constraints;this.constraints=b;return this};
a.stabilize=function(b){var c;arguments.length||(b=3);for(var d=0;d<b;d++){var f=new pv.Quadtree(this.particles);for(c=this.constraints;c;c=c.next)c.apply(this.particles,f)}for(c=this.particles;c;c=c.next){c.px=c.x;c.py=c.y}return this};
a.step=function(){var b;for(b=this.particles;b;b=b.next){var c=b.px,d=b.py;b.px=b.x;b.py=b.y;b.x+=b.vx=b.x-c+b.fx;b.y+=b.vy=b.y-d+b.fy}c=new pv.Quadtree(this.particles);for(b=this.constraints;b;b=b.next)b.apply(this.particles,c);for(b=this.particles;b;b=b.next)b.fx=b.fy=0;for(b=this.forces;b;b=b.next)b.apply(this.particles,c)};
pv.Quadtree=function(b){function c(k,q,o,n,m,r){if(!(isNaN(q.x)||isNaN(q.y)))if(k.leaf)if(k.p){if(!(Math.abs(k.p.x-q.x)+Math.abs(k.p.y-q.y)<0.01)){var s=k.p;k.p=null;d(k,s,o,n,m,r)}d(k,q,o,n,m,r)}else k.p=q;else d(k,q,o,n,m,r)}function d(k,q,o,n,m,r){var s=(o+m)*0.5,u=(n+r)*0.5,x=q.x>=s,t=q.y>=u;k.leaf=false;switch((t<<1)+x){case 0:k=k.c1||(k.c1=new pv.Quadtree.Node);break;case 1:k=k.c2||(k.c2=new pv.Quadtree.Node);break;case 2:k=k.c3||(k.c3=new pv.Quadtree.Node);break;case 3:k=k.c4||(k.c4=new pv.Quadtree.Node);
break}if(x)o=s;else m=s;if(t)n=u;else r=u;c(k,q,o,n,m,r)}var f,g=Number.POSITIVE_INFINITY,h=g,i=Number.NEGATIVE_INFINITY,j=i;for(f=b;f;f=f.next){if(f.x<g)g=f.x;if(f.y<h)h=f.y;if(f.x>i)i=f.x;if(f.y>j)j=f.y}f=i-g;var l=j-h;if(f>l)j=h+f;else i=g+l;this.xMin=g;this.yMin=h;this.xMax=i;this.yMax=j;this.root=new pv.Quadtree.Node;for(f=b;f;f=f.next)c(this.root,f,g,h,i,j)};pv.Quadtree.Node=function(){this.leaf=true;this.p=this.c4=this.c3=this.c2=this.c1=null};pv.Force={};
pv.Force.charge=function(b){function c(k){function q(m){c(m);k.cn+=m.cn;o+=m.cn*m.cx;n+=m.cn*m.cy}var o=0,n=0;k.cn=0;if(!k.leaf){k.c1&&q(k.c1);k.c2&&q(k.c2);k.c3&&q(k.c3);k.c4&&q(k.c4)}if(k.p){k.cn+=b;o+=b*k.p.x;n+=b*k.p.y}k.cx=o/k.cn;k.cy=n/k.cn}function d(k,q,o,n,m,r){var s=k.cx-q.x,u=k.cy-q.y,x=1/Math.sqrt(s*s+u*u);if(k.leaf&&k.p!=q||(m-o)*x<j){if(!(x<i)){if(x>g)x=g;k=k.cn*x*x*x;s=s*k;u=u*k;q.fx+=s;q.fy+=u}}else if(!k.leaf){var t=(o+m)*0.5,p=(n+r)*0.5;k.c1&&d(k.c1,q,o,n,t,p);k.c2&&d(k.c2,q,t,n,
m,p);k.c3&&d(k.c3,q,o,p,t,r);k.c4&&d(k.c4,q,t,p,m,r);if(!(x<i)){if(x>g)x=g;if(k.p&&k.p!=q){k=b*x*x*x;s=s*k;u=u*k;q.fx+=s;q.fy+=u}}}}var f=2,g=1/f,h=500,i=1/h,j=0.9,l={};arguments.length||(b=-40);l.constant=function(k){if(arguments.length){b=Number(k);return l}return b};l.domain=function(k,q){if(arguments.length){f=Number(k);g=1/f;h=Number(q);i=1/h;return l}return[f,h]};l.theta=function(k){if(arguments.length){j=Number(k);return l}return j};l.apply=function(k,q){c(q.root);for(k=k;k;k=k.next)d(q.root,
k,q.xMin,q.yMin,q.xMax,q.yMax)};return l};pv.Force.drag=function(b){var c={};arguments.length||(b=0.1);c.constant=function(d){if(arguments.length){b=d;return c}return b};c.apply=function(d){if(b)for(d=d;d;d=d.next){d.fx-=b*d.vx;d.fy-=b*d.vy}};return c};
pv.Force.spring=function(b){var c=0.1,d=20,f,g,h={};arguments.length||(b=0.1);h.links=function(i){if(arguments.length){f=i;g=i.map(function(j){return 1/Math.sqrt(Math.max(j.sourceNode.linkDegree,j.targetNode.linkDegree))});return h}return f};h.constant=function(i){if(arguments.length){b=Number(i);return h}return b};h.damping=function(i){if(arguments.length){c=Number(i);return h}return c};h.length=function(i){if(arguments.length){d=Number(i);return h}return d};h.apply=function(){for(var i=0;i<f.length;i++){var j=
f[i].sourceNode,l=f[i].targetNode,k=j.x-l.x,q=j.y-l.y,o=Math.sqrt(k*k+q*q),n=o?1/o:1;n=(b*g[i]*(o-d)+c*g[i]*(k*(j.vx-l.vx)+q*(j.vy-l.vy))*n)*n;k=-n*(o?k:0.01*(0.5-Math.random()));q=-n*(o?q:0.01*(0.5-Math.random()));j.fx+=k;j.fy+=q;l.fx-=k;l.fy-=q}};return h};pv.Constraint={};
pv.Constraint.collision=function(b){function c(k,q,o,n,m,r){if(!k.leaf){var s=(o+m)*0.5,u=(n+r)*0.5,x=u<j,t=s>g,p=s<i;if(u>h){k.c1&&t&&c(k.c1,q,o,n,s,u);k.c2&&p&&c(k.c2,q,s,n,m,u)}if(x){k.c3&&t&&c(k.c3,q,o,u,s,r);k.c4&&p&&c(k.c4,q,s,u,m,r)}}if(k.p&&k.p!=q){o=q.x-k.p.x;n=q.y-k.p.y;m=Math.sqrt(o*o+n*n);r=f+b(k.p);if(m<r){m=(m-r)/m*0.5;o*=m;n*=m;q.x-=o;q.y-=n;k.p.x+=o;k.p.y+=n}}}var d=1,f,g,h,i,j,l={};arguments.length||(f=10);l.repeat=function(k){if(arguments.length){d=Number(k);return l}return d};l.apply=
function(k,q){var o,n,m=-Infinity;for(o=k;o;o=o.next){n=b(o);if(n>m)m=n}for(var r=0;r<d;r++)for(o=k;o;o=o.next){n=(f=b(o))+m;g=o.x-n;i=o.x+n;h=o.y-n;j=o.y+n;c(q.root,o,q.xMin,q.yMin,q.xMax,q.yMax)}};return l};pv.Constraint.position=function(b){var c=1,d={};arguments.length||(b=function(f){return f.fix});d.alpha=function(f){if(arguments.length){c=Number(f);return d}return c};d.apply=function(f){for(f=f;f;f=f.next){var g=b(f);if(g){f.x+=(g.x-f.x)*c;f.y+=(g.y-f.y)*c;f.fx=f.fy=f.vx=f.vy=0}}};return d};
pv.Constraint.bound=function(){var b={},c,d;b.x=function(f,g){if(arguments.length){c={min:Math.min(f,g),max:Math.max(f,g)};return this}return c};b.y=function(f,g){if(arguments.length){d={min:Math.min(f,g),max:Math.max(f,g)};return this}return d};b.apply=function(f){if(c)for(var g=f;g;g=g.next)g.x=g.x<c.min?c.min:g.x>c.max?c.max:g.x;if(d)for(g=f;g;g=g.next)g.y=g.y<d.min?d.min:g.y>d.max?d.max:g.y};return b};pv.Layout=function(){pv.Panel.call(this)};pv.Layout.prototype=pv.extend(pv.Panel);
pv.Layout.prototype.property=function(b,c){if(!this.hasOwnProperty("properties"))this.properties=pv.extend(this.properties);this.properties[b]=true;this.propertyMethod(b,false,pv.Mark.cast[b]=c);return this};
pv.Layout.Network=function(){pv.Layout.call(this);var b=this;this.$id=pv.id();(this.node=(new pv.Mark).data(function(){return b.nodes()}).strokeStyle("#1f77b4").fillStyle("#fff").left(function(c){return c.x}).top(function(c){return c.y})).parent=this;this.link=(new pv.Mark).extend(this.node).data(function(c){return[c.sourceNode,c.targetNode]}).fillStyle(null).lineWidth(function(c,d){return d.linkValue*1.5}).strokeStyle("rgba(0,0,0,.2)");this.link.add=function(c){return b.add(pv.Panel).data(function(){return b.links()}).add(c).extend(this)};
(this.label=(new pv.Mark).extend(this.node).textMargin(7).textBaseline("middle").text(function(c){return c.nodeName||c.nodeValue}).textAngle(function(c){c=c.midAngle;return pv.Wedge.upright(c)?c:c+Math.PI}).textAlign(function(c){return pv.Wedge.upright(c.midAngle)?"left":"right"})).parent=this};
pv.Layout.Network.prototype=pv.extend(pv.Layout).property("nodes",function(b){return b.map(function(c,d){if(typeof c!="object")c={nodeValue:c};c.index=d;c.linkDegree=0;return c})}).property("links",function(b){return b.map(function(c){if(isNaN(c.linkValue))c.linkValue=isNaN(c.value)?1:c.value;return c})});pv.Layout.Network.prototype.reset=function(){this.$id=pv.id();return this};
pv.Layout.Network.prototype.buildProperties=function(b,c){if((b.$id||0)<this.$id)pv.Layout.prototype.buildProperties.call(this,b,c)};pv.Layout.Network.prototype.buildImplied=function(b){pv.Layout.prototype.buildImplied.call(this,b);if(b.$id>=this.$id)return true;b.$id=this.$id;b.links.forEach(function(c){var d=c.linkValue;(c.sourceNode||(c.sourceNode=b.nodes[c.source])).linkDegree+=d;(c.targetNode||(c.targetNode=b.nodes[c.target])).linkDegree+=d})};
pv.Layout.Hierarchy=function(){pv.Layout.Network.call(this);this.link.strokeStyle("#ccc")};pv.Layout.Hierarchy.prototype=pv.extend(pv.Layout.Network);pv.Layout.Hierarchy.prototype.buildImplied=function(b){if(!b.links)b.links=pv.Layout.Hierarchy.links.call(this);pv.Layout.Network.prototype.buildImplied.call(this,b)};pv.Layout.Hierarchy.links=function(){return this.nodes().filter(function(b){return b.parentNode}).map(function(b){return{sourceNode:b,targetNode:b.parentNode,linkValue:1}})};
pv.Layout.Hierarchy.NodeLink={buildImplied:function(b){function c(m){return m.parentNode?m.depth*(o-q)+q:0}function d(m){return m.parentNode?(m.breadth-0.25)*2*Math.PI:0}function f(m){switch(i){case "left":return m.depth*l;case "right":return l-m.depth*l;case "top":return m.breadth*l;case "bottom":return l-m.breadth*l;case "radial":return l/2+c(m)*Math.cos(m.midAngle)}}function g(m){switch(i){case "left":return m.breadth*k;case "right":return k-m.breadth*k;case "top":return m.depth*k;case "bottom":return k-
m.depth*k;case "radial":return k/2+c(m)*Math.sin(m.midAngle)}}var h=b.nodes,i=b.orient,j=/^(top|bottom)$/.test(i),l=b.width,k=b.height;if(i=="radial"){var q=b.innerRadius,o=b.outerRadius;if(q==null)q=0;if(o==null)o=Math.min(l,k)/2}for(b=0;b<h.length;b++){var n=h[b];n.midAngle=i=="radial"?d(n):j?Math.PI/2:0;n.x=f(n);n.y=g(n);if(n.firstChild)n.midAngle+=Math.PI}}};
pv.Layout.Hierarchy.Fill={constructor:function(){this.node.strokeStyle("#fff").fillStyle("#ccc").width(function(b){return b.dx}).height(function(b){return b.dy}).innerRadius(function(b){return b.innerRadius}).outerRadius(function(b){return b.outerRadius}).startAngle(function(b){return b.startAngle}).angle(function(b){return b.angle});this.label.textAlign("center").left(function(b){return b.x+b.dx/2}).top(function(b){return b.y+b.dy/2});delete this.link},buildImplied:function(b){function c(p,v){return(p+
v)/(1+v)}function d(p){switch(o){case "left":return c(p.minDepth,s)*m;case "right":return(1-c(p.maxDepth,s))*m;case "top":return p.minBreadth*m;case "bottom":return(1-p.maxBreadth)*m;case "radial":return m/2}}function f(p){switch(o){case "left":return p.minBreadth*r;case "right":return(1-p.maxBreadth)*r;case "top":return c(p.minDepth,s)*r;case "bottom":return(1-c(p.maxDepth,s))*r;case "radial":return r/2}}function g(p){switch(o){case "left":case "right":return(p.maxDepth-p.minDepth)/(1+s)*m;case "top":case "bottom":return(p.maxBreadth-
p.minBreadth)*m;case "radial":return p.parentNode?(p.innerRadius+p.outerRadius)*Math.cos(p.midAngle):0}}function h(p){switch(o){case "left":case "right":return(p.maxBreadth-p.minBreadth)*r;case "top":case "bottom":return(p.maxDepth-p.minDepth)/(1+s)*r;case "radial":return p.parentNode?(p.innerRadius+p.outerRadius)*Math.sin(p.midAngle):0}}function i(p){return Math.max(0,c(p.minDepth,s/2))*(x-u)+u}function j(p){return c(p.maxDepth,s/2)*(x-u)+u}function l(p){return(p.parentNode?p.minBreadth-0.25:0)*
2*Math.PI}function k(p){return(p.parentNode?p.maxBreadth-p.minBreadth:1)*2*Math.PI}var q=b.nodes,o=b.orient,n=/^(top|bottom)$/.test(o),m=b.width,r=b.height,s=-q[0].minDepth;if(o=="radial"){var u=b.innerRadius,x=b.outerRadius;if(u==null)u=0;if(u)s*=2;if(x==null)x=Math.min(m,r)/2}for(b=0;b<q.length;b++){var t=q[b];t.x=d(t);t.y=f(t);if(o=="radial"){t.innerRadius=i(t);t.outerRadius=j(t);t.startAngle=l(t);t.angle=k(t);t.midAngle=t.startAngle+t.angle/2}else t.midAngle=n?-Math.PI/2:0;t.dx=g(t);t.dy=h(t)}}};
pv.Layout.Grid=function(){pv.Layout.call(this);var b=this;(this.cell=(new pv.Mark).data(function(){return b.scene[b.index].$grid}).width(function(){return b.width()/b.cols()}).height(function(){return b.height()/b.rows()}).left(function(){return this.width()*(this.index%b.cols())}).top(function(){return this.height()*Math.floor(this.index/b.cols())})).parent=this};pv.Layout.Grid.prototype=pv.extend(pv.Layout).property("rows").property("cols");pv.Layout.Grid.prototype.defaults=(new pv.Layout.Grid).extend(pv.Layout.prototype.defaults).rows(1).cols(1);
pv.Layout.Grid.prototype.buildImplied=function(b){pv.Layout.prototype.buildImplied.call(this,b);var c=b.rows,d=b.cols;if(typeof d=="object")c=pv.transpose(d);if(typeof c=="object"){b.$grid=pv.blend(c);b.rows=c.length;b.cols=c[0]?c[0].length:0}else b.$grid=pv.repeat([b.data],c*d)};
pv.Layout.Stack=function(){function b(i){return function(){return f[i](this.parent.index,this.index)}}pv.Layout.call(this);var c=this,d=function(){return null},f={t:d,l:d,r:d,b:d,w:d,h:d},g,h=c.buildImplied;this.buildImplied=function(i){h.call(this,i);var j=i.layers,l=j.length,k,q=i.orient,o=/^(top|bottom)\b/.test(q),n=this.parent[o?"height":"width"](),m=[],r=[],s=[],u=pv.Mark.stack,x={parent:{parent:this}};u.unshift(null);g=[];for(var t=0;t<l;t++){s[t]=[];r[t]=[];x.parent.index=t;u[0]=j[t];g[t]=
this.$values.apply(x.parent,u);if(!t)k=g[t].length;u.unshift(null);for(var p=0;p<k;p++){u[0]=g[t][p];x.index=p;t||(m[p]=this.$x.apply(x,u));s[t][p]=this.$y.apply(x,u)}u.shift()}u.shift();switch(i.order){case "inside-out":var v=s.map(function(A){return pv.max.index(A)});x=pv.range(l).sort(function(A,D){return v[A]-v[D]});j=s.map(function(A){return pv.sum(A)});var w=u=0,y=[],z=[];for(t=0;t<l;t++){p=x[t];if(u<w){u+=j[p];y.push(p)}else{w+=j[p];z.push(p)}}j=z.reverse().concat(y);break;case "reverse":j=
pv.range(l-1,-1,-1);break;default:j=pv.range(l);break}switch(i.offset){case "silohouette":for(p=0;p<k;p++){for(t=x=0;t<l;t++)x+=s[t][p];r[j[0]][p]=(n-x)/2}break;case "wiggle":for(t=x=0;t<l;t++)x+=s[t][0];r[j[0]][0]=x=(n-x)/2;for(p=1;p<k;p++){u=n=0;w=m[p]-m[p-1];for(t=0;t<l;t++)n+=s[t][p];for(t=0;t<l;t++){y=(s[j[t]][p]-s[j[t]][p-1])/(2*w);for(i=0;i<t;i++)y+=(s[j[i]][p]-s[j[i]][p-1])/w;u+=y*s[j[t]][p]}r[j[0]][p]=x-=n?u/n*w:0}break;case "expand":for(p=0;p<k;p++){for(t=i=r[j[0]][p]=0;t<l;t++)i+=s[t][p];
if(i){i=n/i;for(t=0;t<l;t++)s[t][p]*=i}else{i=n/l;for(t=0;t<l;t++)s[t][p]=i}}break;default:for(p=0;p<k;p++)r[j[0]][p]=0;break}for(p=0;p<k;p++){x=r[j[0]][p];for(t=1;t<l;t++){x+=s[j[t-1]][p];r[j[t]][p]=x}}t=q.indexOf("-");l=o?"h":"w";o=t<0?o?"l":"b":q.charAt(t+1);q=q.charAt(0);for(var C in f)f[C]=d;f[o]=function(A,D){return m[D]};f[q]=function(A,D){return r[A][D]};f[l]=function(A,D){return s[A][D]}};this.layer=(new pv.Mark).data(function(){return g[this.parent.index]}).top(b("t")).left(b("l")).right(b("r")).bottom(b("b")).width(b("w")).height(b("h"));
this.layer.add=function(i){return c.add(pv.Panel).data(function(){return c.layers()}).add(i).extend(this)}};pv.Layout.Stack.prototype=pv.extend(pv.Layout).property("orient",String).property("offset",String).property("order",String).property("layers");a=pv.Layout.Stack.prototype;a.defaults=(new pv.Layout.Stack).extend(pv.Layout.prototype.defaults).orient("bottom-left").offset("zero").layers([[]]);a.$x=pv.Layout.Stack.prototype.$y=function(){return 0};a.x=function(b){this.$x=pv.functor(b);return this};
a.y=function(b){this.$y=pv.functor(b);return this};a.$values=pv.identity;a.values=function(b){this.$values=pv.functor(b);return this};
pv.Layout.Treemap=function(){pv.Layout.Hierarchy.call(this);this.node.strokeStyle("#fff").fillStyle("rgba(31, 119, 180, .25)").width(function(b){return b.dx}).height(function(b){return b.dy});this.label.visible(function(b){return!b.firstChild}).left(function(b){return b.x+b.dx/2}).top(function(b){return b.y+b.dy/2}).textAlign("center").textAngle(function(b){return b.dx>b.dy?0:-Math.PI/2});(this.leaf=(new pv.Mark).extend(this.node).fillStyle(null).strokeStyle(null).visible(function(b){return!b.firstChild})).parent=
this;delete this.link};pv.Layout.Treemap.prototype=pv.extend(pv.Layout.Hierarchy).property("round",Boolean).property("paddingLeft",Number).property("paddingRight",Number).property("paddingTop",Number).property("paddingBottom",Number).property("mode",String).property("order",String);a=pv.Layout.Treemap.prototype;a.defaults=(new pv.Layout.Treemap).extend(pv.Layout.Hierarchy.prototype.defaults).mode("squarify").order("ascending");a.padding=function(b){return this.paddingLeft(b).paddingRight(b).paddingTop(b).paddingBottom(b)};
a.$size=function(b){return Number(b.nodeValue)};a.size=function(b){this.$size=pv.functor(b);return this};
a.buildImplied=function(b){function c(r,s,u,x,t,p,v){for(var w=0,y=0;w<r.length;w++){var z=r[w];if(u){z.x=x+y;z.y=t;y+=z.dx=n(p*z.size/s);z.dy=v}else{z.x=x;z.y=t+y;z.dx=p;y+=z.dy=n(v*z.size/s)}}if(z)if(u)z.dx+=p-y;else z.dy+=v-y}function d(r,s){for(var u=-Infinity,x=Infinity,t=0,p=0;p<r.length;p++){var v=r[p].size;if(v<x)x=v;if(v>u)u=v;t+=v}t*=t;s*=s;return Math.max(s*u/t,t/(s*x))}function f(r,s){function u(A){var D=p==y,G=pv.sum(A,o),E=y?n(G/y):0;c(A,G,D,x,t,D?p:E,D?E:v);if(D){t+=E;v-=E}else{x+=
E;p-=E}y=Math.min(p,v);return D}var x=r.x+j,t=r.y+k,p=r.dx-j-l,v=r.dy-k-q;if(m!="squarify")c(r.childNodes,r.size,m=="slice"?true:m=="dice"?false:s&1,x,t,p,v);else{var w=[];s=Infinity;var y=Math.min(p,v),z=p*v/r.size;if(!(r.size<=0)){r.visitBefore(function(A){A.size*=z});for(r=r.childNodes.slice();r.length;){var C=r[r.length-1];if(C.size){w.push(C);z=d(w,y);if(z<=s){r.pop();s=z}else{w.pop();u(w);w.length=0;s=Infinity}}else r.pop()}if(u(w))for(s=0;s<w.length;s++)w[s].dy+=v;else for(s=0;s<w.length;s++)w[s].dx+=
p}}}if(!pv.Layout.Hierarchy.prototype.buildImplied.call(this,b)){var g=this,h=b.nodes[0],i=pv.Mark.stack,j=b.paddingLeft,l=b.paddingRight,k=b.paddingTop,q=b.paddingBottom,o=function(r){return r.size},n=b.round?Math.round:Number,m=b.mode;i.unshift(null);h.visitAfter(function(r,s){r.depth=s;r.x=r.y=r.dx=r.dy=0;r.size=r.firstChild?pv.sum(r.childNodes,function(u){return u.size}):g.$size.apply(g,(i[0]=r,i))});i.shift();switch(b.order){case "ascending":h.sort(function(r,s){return r.size-s.size});break;
case "descending":h.sort(function(r,s){return s.size-r.size});break;case "reverse":h.reverse();break}h.x=0;h.y=0;h.dx=b.width;h.dy=b.height;h.visitBefore(f)}};pv.Layout.Tree=function(){pv.Layout.Hierarchy.call(this)};pv.Layout.Tree.prototype=pv.extend(pv.Layout.Hierarchy).property("group",Number).property("breadth",Number).property("depth",Number).property("orient",String);pv.Layout.Tree.prototype.defaults=(new pv.Layout.Tree).extend(pv.Layout.Hierarchy.prototype.defaults).group(1).breadth(15).depth(60).orient("top");
pv.Layout.Tree.prototype.buildImplied=function(b){function c(p){var v,w,y;if(p.firstChild){v=p.firstChild;w=p.lastChild;for(var z=y=v;z;z=z.nextSibling){c(z);y=f(z,y)}j(p);w=0.5*(v.prelim+w.prelim);if(v=p.previousSibling){p.prelim=v.prelim+k(p.depth,true);p.mod=p.prelim-w}else p.prelim=w}else if(v=p.previousSibling)p.prelim=v.prelim+k(p.depth,true)}function d(p,v,w){p.breadth=p.prelim+v;v+=p.mod;for(p=p.firstChild;p;p=p.nextSibling)d(p,v,w)}function f(p,v){var w=p.previousSibling;if(w){var y=p,z=
p,C=w;w=p.parentNode.firstChild;var A=y.mod,D=z.mod,G=C.mod,E=w.mod;C=h(C);for(y=g(y);C&&y;){C=C;y=y;w=g(w);z=h(z);z.ancestor=p;var B=C.prelim+G-(y.prelim+A)+k(C.depth,false);if(B>0){i(l(C,p,v),p,B);A+=B;D+=B}G+=C.mod;A+=y.mod;E+=w.mod;D+=z.mod;C=h(C);y=g(y)}if(C&&!h(z)){z.thread=C;z.mod+=G-D}if(y&&!g(w)){w.thread=y;w.mod+=A-E;v=p}}return v}function g(p){return p.firstChild||p.thread}function h(p){return p.lastChild||p.thread}function i(p,v,w){var y=v.number-p.number;v.change-=w/y;v.shift+=w;p.change+=
w/y;v.prelim+=w;v.mod+=w}function j(p){var v=0,w=0;for(p=p.lastChild;p;p=p.previousSibling){p.prelim+=v;p.mod+=v;w+=p.change;v+=p.shift+w}}function l(p,v,w){return p.ancestor.parentNode==v.parentNode?p.ancestor:w}function k(p,v){return(v?1:u+1)/(m=="radial"?p:1)}function q(p){return m=="radial"?p.breadth/r:0}function o(p){switch(m){case "left":return p.depth;case "right":return x-p.depth;case "top":case "bottom":return p.breadth+x/2;case "radial":return x/2+p.depth*Math.cos(q(p))}}function n(p){switch(m){case "left":case "right":return p.breadth+
t/2;case "top":return p.depth;case "bottom":return t-p.depth;case "radial":return t/2+p.depth*Math.sin(q(p))}}if(!pv.Layout.Hierarchy.prototype.buildImplied.call(this,b)){var m=b.orient,r=b.depth,s=b.breadth,u=b.group,x=b.width,t=b.height;b=b.nodes[0];b.visitAfter(function(p,v){p.ancestor=p;p.prelim=0;p.mod=0;p.change=0;p.shift=0;p.number=p.previousSibling?p.previousSibling.number+1:0;p.depth=v});c(b);d(b,-b.prelim,0);b.visitAfter(function(p){p.breadth*=s;p.depth*=r;p.midAngle=q(p);p.x=o(p);p.y=n(p);
if(p.firstChild)p.midAngle+=Math.PI;delete p.breadth;delete p.depth;delete p.ancestor;delete p.prelim;delete p.mod;delete p.change;delete p.shift;delete p.number;delete p.thread})}};pv.Layout.Indent=function(){pv.Layout.Hierarchy.call(this);this.link.interpolate("step-after")};pv.Layout.Indent.prototype=pv.extend(pv.Layout.Hierarchy).property("depth",Number).property("breadth",Number);pv.Layout.Indent.prototype.defaults=(new pv.Layout.Indent).extend(pv.Layout.Hierarchy.prototype.defaults).depth(15).breadth(15);
pv.Layout.Indent.prototype.buildImplied=function(b){function c(i,j,l){i.x=g+l++*f;i.y=h+j++*d;i.midAngle=0;for(i=i.firstChild;i;i=i.nextSibling)j=c(i,j,l);return j}if(!pv.Layout.Hierarchy.prototype.buildImplied.call(this,b)){var d=b.breadth,f=b.depth,g=0,h=0;c(b.nodes[0],1,1)}};pv.Layout.Pack=function(){pv.Layout.Hierarchy.call(this);this.node.radius(function(b){return b.radius}).strokeStyle("rgb(31, 119, 180)").fillStyle("rgba(31, 119, 180, .25)");this.label.textAlign("center");delete this.link};
pv.Layout.Pack.prototype=pv.extend(pv.Layout.Hierarchy).property("spacing",Number).property("order",String);pv.Layout.Pack.prototype.defaults=(new pv.Layout.Pack).extend(pv.Layout.Hierarchy.prototype.defaults).spacing(1).order("ascending");pv.Layout.Pack.prototype.$radius=function(){return 1};pv.Layout.Pack.prototype.size=function(b){this.$radius=typeof b=="function"?function(){return Math.sqrt(b.apply(this,arguments))}:(b=Math.sqrt(b),function(){return b});return this};
pv.Layout.Pack.prototype.buildImplied=function(b){function c(o){var n=pv.Mark.stack;n.unshift(null);for(var m=0,r=o.length;m<r;m++){var s=o[m];if(!s.firstChild)s.radius=i.$radius.apply(i,(n[0]=s,n))}n.shift()}function d(o){var n=[];for(o=o.firstChild;o;o=o.nextSibling){if(o.firstChild)o.radius=d(o);o.n=o.p=o;n.push(o)}switch(b.order){case "ascending":n.sort(function(m,r){return m.radius-r.radius});break;case "descending":n.sort(function(m,r){return r.radius-m.radius});break;case "reverse":n.reverse();
break}return f(n)}function f(o){function n(B){u=Math.min(B.x-B.radius,u);x=Math.max(B.x+B.radius,x);t=Math.min(B.y-B.radius,t);p=Math.max(B.y+B.radius,p)}function m(B,F){var H=B.n;B.n=F;F.p=B;F.n=H;H.p=F}function r(B,F){B.n=F;F.p=B}function s(B,F){var H=F.x-B.x,I=F.y-B.y;B=B.radius+F.radius;return B*B-H*H-I*I>0.0010}var u=Infinity,x=-Infinity,t=Infinity,p=-Infinity,v,w,y,z,C;v=o[0];v.x=-v.radius;v.y=0;n(v);if(o.length>1){w=o[1];w.x=w.radius;w.y=0;n(w);if(o.length>2){y=o[2];g(v,w,y);n(y);m(v,y);v.p=
y;m(y,w);w=v.n;for(var A=3;A<o.length;A++){g(v,w,y=o[A]);var D=0,G=1,E=1;for(z=w.n;z!=w;z=z.n,G++)if(s(z,y)){D=1;break}if(D==1)for(C=v.p;C!=z.p;C=C.p,E++)if(s(C,y)){if(E<G){D=-1;z=C}break}if(D==0){m(v,y);w=y;n(y)}else if(D>0){r(v,z);w=z;A--}else if(D<0){r(z,w);v=z;A--}}}}v=(u+x)/2;w=(t+p)/2;for(A=y=0;A<o.length;A++){z=o[A];z.x-=v;z.y-=w;y=Math.max(y,z.radius+Math.sqrt(z.x*z.x+z.y*z.y))}return y+b.spacing}function g(o,n,m){var r=n.radius+m.radius,s=o.radius+m.radius,u=n.x-o.x;n=n.y-o.y;var x=Math.sqrt(u*
u+n*n),t=(s*s+x*x-r*r)/(2*s*x);r=Math.acos(t);t=t*s;s=Math.sin(r)*s;u/=x;n/=x;m.x=o.x+t*u+s*n;m.y=o.y+t*n-s*u}function h(o,n,m,r){for(var s=o.firstChild;s;s=s.nextSibling){s.x+=o.x;s.y+=o.y;h(s,n,m,r)}o.x=n+r*o.x;o.y=m+r*o.y;o.radius*=r}if(!pv.Layout.Hierarchy.prototype.buildImplied.call(this,b)){var i=this,j=b.nodes,l=j[0];c(j);l.x=0;l.y=0;l.radius=d(l);j=this.width();var k=this.height(),q=1/Math.max(2*l.radius/j,2*l.radius/k);h(l,j/2,k/2,q)}};
pv.Layout.Force=function(){pv.Layout.Network.call(this);this.link.lineWidth(function(b,c){return Math.sqrt(c.linkValue)*1.5});this.label.textAlign("center")};
pv.Layout.Force.prototype=pv.extend(pv.Layout.Network).property("bound",Boolean).property("iterations",Number).property("dragConstant",Number).property("chargeConstant",Number).property("chargeMinDistance",Number).property("chargeMaxDistance",Number).property("chargeTheta",Number).property("springConstant",Number).property("springDamping",Number).property("springLength",Number);pv.Layout.Force.prototype.defaults=(new pv.Layout.Force).extend(pv.Layout.Network.prototype.defaults).dragConstant(0.1).chargeConstant(-40).chargeMinDistance(2).chargeMaxDistance(500).chargeTheta(0.9).springConstant(0.1).springDamping(0.3).springLength(20);
pv.Layout.Force.prototype.buildImplied=function(b){function c(q){return q.fix?1:q.vx*q.vx+q.vy*q.vy}if(pv.Layout.Network.prototype.buildImplied.call(this,b)){if(b=b.$force){b.next=this.binds.$force;this.binds.$force=b}}else{for(var d=this,f=b.nodes,g=b.links,h=b.iterations,i=b.width,j=b.height,l=0,k;l<f.length;l++){k=f[l];if(isNaN(k.x))k.x=i/2+40*Math.random()-20;if(isNaN(k.y))k.y=j/2+40*Math.random()-20}k=pv.simulation(f);k.force(pv.Force.drag(b.dragConstant));k.force(pv.Force.charge(b.chargeConstant).domain(b.chargeMinDistance,
b.chargeMaxDistance).theta(b.chargeTheta));k.force(pv.Force.spring(b.springConstant).damping(b.springDamping).length(b.springLength).links(g));k.constraint(pv.Constraint.position());b.bound&&k.constraint(pv.Constraint.bound().x(6,i-6).y(6,j-6));if(h==null){k.step();k.step();b.$force=this.binds.$force={next:this.binds.$force,nodes:f,min:1.0E-4*(g.length+1),sim:k};if(!this.$timer)this.$timer=setInterval(function(){for(var q=false,o=d.binds.$force;o;o=o.next)if(pv.max(o.nodes,c)>o.min){o.sim.step();
q=true}q&&d.render()},42)}else for(l=0;l<h;l++)k.step()}};pv.Layout.Cluster=function(){pv.Layout.Hierarchy.call(this);var b,c=this.buildImplied;this.buildImplied=function(d){c.call(this,d);b=/^(top|bottom)$/.test(d.orient)?"step-before":/^(left|right)$/.test(d.orient)?"step-after":"linear"};this.link.interpolate(function(){return b})};
pv.Layout.Cluster.prototype=pv.extend(pv.Layout.Hierarchy).property("group",Number).property("orient",String).property("innerRadius",Number).property("outerRadius",Number);pv.Layout.Cluster.prototype.defaults=(new pv.Layout.Cluster).extend(pv.Layout.Hierarchy.prototype.defaults).group(0).orient("top");
pv.Layout.Cluster.prototype.buildImplied=function(b){if(!pv.Layout.Hierarchy.prototype.buildImplied.call(this,b)){var c=b.nodes[0],d=b.group,f,g,h=0,i=0.5-d/2,j=undefined;c.visitAfter(function(l){if(l.firstChild)l.depth=1+pv.max(l.childNodes,function(k){return k.depth});else{if(d&&j!=l.parentNode){j=l.parentNode;h+=d}h++;l.depth=0}});f=1/h;g=1/c.depth;j=undefined;c.visitAfter(function(l){if(l.firstChild)l.breadth=pv.mean(l.childNodes,function(k){return k.breadth});else{if(d&&j!=l.parentNode){j=l.parentNode;
i+=d}l.breadth=f*i++}l.depth=1-l.depth*g});c.visitAfter(function(l){l.minBreadth=l.firstChild?l.firstChild.minBreadth:l.breadth-f/2;l.maxBreadth=l.firstChild?l.lastChild.maxBreadth:l.breadth+f/2});c.visitBefore(function(l){l.minDepth=l.parentNode?l.parentNode.maxDepth:0;l.maxDepth=l.parentNode?l.depth+c.depth:l.minDepth+2*c.depth});c.minDepth=-g;pv.Layout.Hierarchy.NodeLink.buildImplied.call(this,b)}};pv.Layout.Cluster.Fill=function(){pv.Layout.Cluster.call(this);pv.Layout.Hierarchy.Fill.constructor.call(this)};
pv.Layout.Cluster.Fill.prototype=pv.extend(pv.Layout.Cluster);pv.Layout.Cluster.Fill.prototype.buildImplied=function(b){pv.Layout.Cluster.prototype.buildImplied.call(this,b)||pv.Layout.Hierarchy.Fill.buildImplied.call(this,b)};pv.Layout.Partition=function(){pv.Layout.Hierarchy.call(this)};pv.Layout.Partition.prototype=pv.extend(pv.Layout.Hierarchy).property("order",String).property("orient",String).property("innerRadius",Number).property("outerRadius",Number);
pv.Layout.Partition.prototype.defaults=(new pv.Layout.Partition).extend(pv.Layout.Hierarchy.prototype.defaults).orient("top");pv.Layout.Partition.prototype.$size=function(){return 1};pv.Layout.Partition.prototype.size=function(b){this.$size=b;return this};
pv.Layout.Partition.prototype.buildImplied=function(b){if(!pv.Layout.Hierarchy.prototype.buildImplied.call(this,b)){var c=this,d=b.nodes[0],f=pv.Mark.stack,g=0;f.unshift(null);d.visitAfter(function(i,j){if(j>g)g=j;i.size=i.firstChild?pv.sum(i.childNodes,function(l){return l.size}):c.$size.apply(c,(f[0]=i,f))});f.shift();switch(b.order){case "ascending":d.sort(function(i,j){return i.size-j.size});break;case "descending":d.sort(function(i,j){return j.size-i.size});break}var h=1/g;d.minBreadth=0;d.breadth=
0.5;d.maxBreadth=1;d.visitBefore(function(i){for(var j=i.minBreadth,l=i.maxBreadth-j,k=i.firstChild;k;k=k.nextSibling){k.minBreadth=j;k.maxBreadth=j+=k.size/i.size*l;k.breadth=(j+k.minBreadth)/2}});d.visitAfter(function(i,j){i.minDepth=(j-1)*h;i.maxDepth=i.depth=j*h});pv.Layout.Hierarchy.NodeLink.buildImplied.call(this,b)}};pv.Layout.Partition.Fill=function(){pv.Layout.Partition.call(this);pv.Layout.Hierarchy.Fill.constructor.call(this)};pv.Layout.Partition.Fill.prototype=pv.extend(pv.Layout.Partition);
pv.Layout.Partition.Fill.prototype.buildImplied=function(b){pv.Layout.Partition.prototype.buildImplied.call(this,b)||pv.Layout.Hierarchy.Fill.buildImplied.call(this,b)};pv.Layout.Arc=function(){pv.Layout.Network.call(this);var b,c,d,f=this.buildImplied;this.buildImplied=function(g){f.call(this,g);c=g.directed;b=g.orient=="radial"?"linear":"polar";d=g.orient=="right"||g.orient=="top"};this.link.data(function(g){var h=g.sourceNode;g=g.targetNode;return d!=(c||h.breadth<g.breadth)?[h,g]:[g,h]}).interpolate(function(){return b})};
pv.Layout.Arc.prototype=pv.extend(pv.Layout.Network).property("orient",String).property("directed",Boolean);pv.Layout.Arc.prototype.defaults=(new pv.Layout.Arc).extend(pv.Layout.Network.prototype.defaults).orient("bottom");pv.Layout.Arc.prototype.sort=function(b){this.$sort=b;return this};
pv.Layout.Arc.prototype.buildImplied=function(b){function c(m){switch(h){case "top":return-Math.PI/2;case "bottom":return Math.PI/2;case "left":return Math.PI;case "right":return 0;case "radial":return(m-0.25)*2*Math.PI}}function d(m){switch(h){case "top":case "bottom":return m*l;case "left":return 0;case "right":return l;case "radial":return l/2+q*Math.cos(c(m))}}function f(m){switch(h){case "top":return 0;case "bottom":return k;case "left":case "right":return m*k;case "radial":return k/2+q*Math.sin(c(m))}}
if(!pv.Layout.Network.prototype.buildImplied.call(this,b)){var g=b.nodes,h=b.orient,i=this.$sort,j=pv.range(g.length),l=b.width,k=b.height,q=Math.min(l,k)/2;i&&j.sort(function(m,r){return i(g[m],g[r])});for(b=0;b<g.length;b++){var o=g[j[b]],n=o.breadth=(b+0.5)/g.length;o.x=d(n);o.y=f(n);o.midAngle=c(n)}}};
pv.Layout.Horizon=function(){pv.Layout.call(this);var b=this,c,d,f,g,h,i,j=this.buildImplied;this.buildImplied=function(l){j.call(this,l);c=l.bands;d=l.mode;f=Math.round((d=="color"?0.5:1)*l.height);g=l.backgroundStyle;h=pv.ramp(g,l.negativeStyle).domain(0,c);i=pv.ramp(g,l.positiveStyle).domain(0,c)};c=(new pv.Panel).data(function(){return pv.range(c*2)}).overflow("hidden").height(function(){return f}).top(function(l){return d=="color"?(l&1)*f:0}).fillStyle(function(l){return l?null:g});this.band=
(new pv.Mark).top(function(l,k){return d=="mirror"&&k&1?(k+1>>1)*f:null}).bottom(function(l,k){return d=="mirror"?k&1?null:(k+1>>1)*-f:(k&1||-1)*(k+1>>1)*f}).fillStyle(function(l,k){return(k&1?h:i)((k>>1)+1)});this.band.add=function(l){return b.add(pv.Panel).extend(c).add(l).extend(this)}};pv.Layout.Horizon.prototype=pv.extend(pv.Layout).property("bands",Number).property("mode",String).property("backgroundStyle",pv.color).property("positiveStyle",pv.color).property("negativeStyle",pv.color);
pv.Layout.Horizon.prototype.defaults=(new pv.Layout.Horizon).extend(pv.Layout.prototype.defaults).bands(2).mode("offset").backgroundStyle("white").positiveStyle("#1f77b4").negativeStyle("#d62728");
pv.Layout.Rollup=function(){pv.Layout.Network.call(this);var b=this,c,d,f=b.buildImplied;this.buildImplied=function(g){f.call(this,g);c=g.$rollup.nodes;d=g.$rollup.links};this.node.data(function(){return c}).size(function(g){return g.nodes.length*20});this.link.interpolate("polar").eccentricity(0.8);this.link.add=function(g){return b.add(pv.Panel).data(function(){return d}).add(g).extend(this)}};pv.Layout.Rollup.prototype=pv.extend(pv.Layout.Network).property("directed",Boolean);
pv.Layout.Rollup.prototype.x=function(b){this.$x=pv.functor(b);return this};pv.Layout.Rollup.prototype.y=function(b){this.$y=pv.functor(b);return this};
pv.Layout.Rollup.prototype.buildImplied=function(b){function c(r){return i[r]+","+j[r]}if(!pv.Layout.Network.prototype.buildImplied.call(this,b)){var d=b.nodes,f=b.links,g=b.directed,h=d.length,i=[],j=[],l=0,k={},q={},o=pv.Mark.stack,n={parent:this};o.unshift(null);for(var m=0;m<h;m++){n.index=m;o[0]=d[m];i[m]=this.$x.apply(n,o);j[m]=this.$y.apply(n,o)}o.shift();for(m=0;m<d.length;m++){h=c(m);o=k[h];if(!o){o=k[h]=pv.extend(d[m]);o.index=l++;o.x=i[m];o.y=j[m];o.nodes=[]}o.nodes.push(d[m])}for(m=0;m<
f.length;m++){l=f[m].targetNode;d=k[c(f[m].sourceNode.index)];l=k[c(l.index)];h=!g&&d.index>l.index?l.index+","+d.index:d.index+","+l.index;(o=q[h])||(o=q[h]={sourceNode:d,targetNode:l,linkValue:0,links:[]});o.links.push(f[m]);o.linkValue+=f[m].linkValue}b.$rollup={nodes:pv.values(k),links:pv.values(q)}}};
pv.Layout.Matrix=function(){pv.Layout.Network.call(this);var b,c,d,f,g,h=this.buildImplied;this.buildImplied=function(i){h.call(this,i);b=i.nodes.length;c=i.width/b;d=i.height/b;f=i.$matrix.labels;g=i.$matrix.pairs};this.link.data(function(){return g}).left(function(){return c*(this.index%b)}).top(function(){return d*Math.floor(this.index/b)}).width(function(){return c}).height(function(){return d}).lineWidth(1.5).strokeStyle("#fff").fillStyle(function(i){return i.linkValue?"#555":"#eee"}).parent=
this;delete this.link.add;this.label.data(function(){return f}).left(function(){return this.index&1?c*((this.index>>1)+0.5):null}).top(function(){return this.index&1?null:d*((this.index>>1)+0.5)}).textMargin(4).textAlign(function(){return this.index&1?"left":"right"}).textAngle(function(){return this.index&1?-Math.PI/2:0});delete this.node};pv.Layout.Matrix.prototype=pv.extend(pv.Layout.Network).property("directed",Boolean);pv.Layout.Matrix.prototype.sort=function(b){this.$sort=b;return this};
pv.Layout.Matrix.prototype.buildImplied=function(b){if(!pv.Layout.Network.prototype.buildImplied.call(this,b)){var c=b.nodes,d=b.links,f=this.$sort,g=c.length,h=pv.range(g),i=[],j=[],l={};b.$matrix={labels:i,pairs:j};f&&h.sort(function(m,r){return f(c[m],c[r])});for(var k=0;k<g;k++)for(var q=0;q<g;q++){var o=h[k],n=h[q];j.push(l[o+"."+n]={row:k,col:q,sourceNode:c[o],targetNode:c[n],linkValue:0})}for(k=0;k<g;k++){o=h[k];i.push(c[o],c[o])}for(k=0;k<d.length;k++){i=d[k];g=i.sourceNode.index;h=i.targetNode.index;
i=i.linkValue;l[g+"."+h].linkValue+=i;b.directed||(l[h+"."+g].linkValue+=i)}}};
pv.Layout.Bullet=function(){pv.Layout.call(this);var b=this,c=b.buildImplied,d=b.x=pv.Scale.linear(),f,g,h,i,j;this.buildImplied=function(l){c.call(this,j=l);f=l.orient;g=/^left|right$/.test(f);h=pv.ramp("#bbb","#eee").domain(0,Math.max(1,j.ranges.length-1));i=pv.ramp("steelblue","lightsteelblue").domain(0,Math.max(1,j.measures.length-1))};(this.range=new pv.Mark).data(function(){return j.ranges}).reverse(true).left(function(){return f=="left"?0:null}).top(function(){return f=="top"?0:null}).right(function(){return f==
"right"?0:null}).bottom(function(){return f=="bottom"?0:null}).width(function(l){return g?d(l):null}).height(function(l){return g?null:d(l)}).fillStyle(function(){return h(this.index)}).antialias(false).parent=b;(this.measure=new pv.Mark).extend(this.range).data(function(){return j.measures}).left(function(){return f=="left"?0:g?null:this.parent.width()/3.25}).top(function(){return f=="top"?0:g?this.parent.height()/3.25:null}).right(function(){return f=="right"?0:g?null:this.parent.width()/3.25}).bottom(function(){return f==
"bottom"?0:g?this.parent.height()/3.25:null}).fillStyle(function(){return i(this.index)}).parent=b;(this.marker=new pv.Mark).data(function(){return j.markers}).left(function(l){return f=="left"?d(l):g?null:this.parent.width()/2}).top(function(l){return f=="top"?d(l):g?this.parent.height()/2:null}).right(function(l){return f=="right"?d(l):null}).bottom(function(l){return f=="bottom"?d(l):null}).strokeStyle("black").shape("bar").angle(function(){return g?0:Math.PI/2}).parent=b;(this.tick=new pv.Mark).data(function(){return d.ticks(7)}).left(function(l){return f==
"left"?d(l):null}).top(function(l){return f=="top"?d(l):null}).right(function(l){return f=="right"?d(l):g?null:-6}).bottom(function(l){return f=="bottom"?d(l):g?-8:null}).height(function(){return g?6:null}).width(function(){return g?null:6}).parent=b};pv.Layout.Bullet.prototype=pv.extend(pv.Layout).property("orient",String).property("ranges").property("markers").property("measures").property("maximum",Number);pv.Layout.Bullet.prototype.defaults=(new pv.Layout.Bullet).extend(pv.Layout.prototype.defaults).orient("left").ranges([]).markers([]).measures([]);
pv.Layout.Bullet.prototype.buildImplied=function(b){pv.Layout.prototype.buildImplied.call(this,b);var c=this.parent[/^left|right$/.test(b.orient)?"width":"height"]();b.maximum=b.maximum||pv.max([].concat(b.ranges,b.markers,b.measures));this.x.domain(0,b.maximum).range(0,c)};pv.Behavior={};
pv.Behavior.drag=function(){function b(l){g=this.index;f=this.scene;var k=this.mouse();i=((h=l).fix=pv.vector(l.x,l.y)).minus(k);j={x:this.parent.width()-(l.dx||0),y:this.parent.height()-(l.dy||0)};f.mark.context(f,g,function(){this.render()});pv.Mark.dispatch("dragstart",f,g)}function c(){if(f){f.mark.context(f,g,function(){var l=this.mouse();h.x=h.fix.x=Math.max(0,Math.min(i.x+l.x,j.x));h.y=h.fix.y=Math.max(0,Math.min(i.y+l.y,j.y));this.render()});pv.Mark.dispatch("drag",f,g)}}function d(){if(f){h.fix=
null;f.mark.context(f,g,function(){this.render()});pv.Mark.dispatch("dragend",f,g);f=null}}var f,g,h,i,j;pv.listen(window,"mousemove",c);pv.listen(window,"mouseup",d);return b};
pv.Behavior.point=function(b){function c(k,q){k=k[q];q={cost:Infinity};for(var o=0,n=k.visible&&k.children.length;o<n;o++){var m=k.children[o],r=m.mark,s;if(r.type=="panel"){r.scene=m;for(var u=0,x=m.length;u<x;u++){r.index=u;s=c(m,u);if(s.cost<q.cost)q=s}delete r.scene;delete r.index}else if(r.$handlers.point){r=r.mouse();u=0;for(x=m.length;u<x;u++){var t=m[u];s=r.x-t.left-(t.width||0)/2;t=r.y-t.top-(t.height||0)/2;var p=i*s*s+j*t*t;if(p<q.cost){q.distance=s*s+t*t;q.cost=p;q.scene=m;q.index=u}}}}return q}
function d(){var k=c(this.scene,this.index);if(k.cost==Infinity||k.distance>l)k=null;if(g){if(k&&g.scene==k.scene&&g.index==k.index)return;pv.Mark.dispatch("unpoint",g.scene,g.index)}if(g=k){pv.Mark.dispatch("point",k.scene,k.index);pv.listen(this.root.canvas(),"mouseout",f)}}function f(k){if(g&&!pv.ancestor(this,k.relatedTarget)){pv.Mark.dispatch("unpoint",g.scene,g.index);g=null}}var g,h=null,i=1,j=1,l=arguments.length?b*b:900;d.collapse=function(k){if(arguments.length){h=String(k);switch(h){case "y":i=
1;j=0;break;case "x":i=0;j=1;break;default:j=i=1;break}return d}return h};return d};
pv.Behavior.select=function(){function b(j){g=this.index;f=this.scene;i=this.mouse();h=j;h.x=i.x;h.y=i.y;h.dx=h.dy=0;pv.Mark.dispatch("selectstart",f,g)}function c(){if(f){f.mark.context(f,g,function(){var j=this.mouse();h.x=Math.max(0,Math.min(i.x,j.x));h.y=Math.max(0,Math.min(i.y,j.y));h.dx=Math.min(this.width(),Math.max(j.x,i.x))-h.x;h.dy=Math.min(this.height(),Math.max(j.y,i.y))-h.y;this.render()});pv.Mark.dispatch("select",f,g)}}function d(){if(f){pv.Mark.dispatch("selectend",f,g);f=null}}var f,
g,h,i;pv.listen(window,"mousemove",c);pv.listen(window,"mouseup",d);return b};
pv.Behavior.resize=function(b){function c(l){h=this.index;g=this.scene;j=this.mouse();i=l;switch(b){case "left":j.x=i.x+i.dx;break;case "right":j.x=i.x;break;case "top":j.y=i.y+i.dy;break;case "bottom":j.y=i.y;break}pv.Mark.dispatch("resizestart",g,h)}function d(){if(g){g.mark.context(g,h,function(){var l=this.mouse();i.x=Math.max(0,Math.min(j.x,l.x));i.y=Math.max(0,Math.min(j.y,l.y));i.dx=Math.min(this.parent.width(),Math.max(l.x,j.x))-i.x;i.dy=Math.min(this.parent.height(),Math.max(l.y,j.y))-i.y;
this.render()});pv.Mark.dispatch("resize",g,h)}}function f(){if(g){pv.Mark.dispatch("resizeend",g,h);g=null}}var g,h,i,j;pv.listen(window,"mousemove",d);pv.listen(window,"mouseup",f);return c};
pv.Behavior.pan=function(){function b(){g=this.index;f=this.scene;i=pv.vector(pv.event.pageX,pv.event.pageY);h=this.transform();j=1/(h.k*this.scale);if(l)l={x:(1-h.k)*this.width(),y:(1-h.k)*this.height()}}function c(){if(f){f.mark.context(f,g,function(){var k=h.translate((pv.event.pageX-i.x)*j,(pv.event.pageY-i.y)*j);if(l){k.x=Math.max(l.x,Math.min(0,k.x));k.y=Math.max(l.y,Math.min(0,k.y))}this.transform(k).render()});pv.Mark.dispatch("pan",f,g)}}function d(){f=null}var f,g,h,i,j,l;b.bound=function(k){if(arguments.length){l=
Boolean(k);return this}return Boolean(l)};pv.listen(window,"mousemove",c);pv.listen(window,"mouseup",d);return b};
pv.Behavior.zoom=function(b){function c(){var f=this.mouse(),g=pv.event.wheel*b;f=this.transform().translate(f.x,f.y).scale(g<0?1E3/(1E3-g):(1E3+g)/1E3).translate(-f.x,-f.y);if(d){f.k=Math.max(1,f.k);f.x=Math.max((1-f.k)*this.width(),Math.min(0,f.x));f.y=Math.max((1-f.k)*this.height(),Math.min(0,f.y))}this.transform(f).render();pv.Mark.dispatch("zoom",this.scene,this.index)}var d;arguments.length||(b=1/48);c.bound=function(f){if(arguments.length){d=Boolean(f);return this}return Boolean(d)};return c};
pv.Geo=function(){};
pv.Geo.projections={mercator:{project:function(b){return{x:b.lng/180,y:b.lat>85?1:b.lat<-85?-1:Math.log(Math.tan(Math.PI/4+pv.radians(b.lat)/2))/Math.PI}},invert:function(b){return{lng:b.x*180,lat:pv.degrees(2*Math.atan(Math.exp(b.y*Math.PI))-Math.PI/2)}}},"gall-peters":{project:function(b){return{x:b.lng/180,y:Math.sin(pv.radians(b.lat))}},invert:function(b){return{lng:b.x*180,lat:pv.degrees(Math.asin(b.y))}}},sinusoidal:{project:function(b){return{x:pv.radians(b.lng)*Math.cos(pv.radians(b.lat))/Math.PI,
y:b.lat/90}},invert:function(b){return{lng:pv.degrees(b.x*Math.PI/Math.cos(b.y*Math.PI/2)),lat:b.y*90}}},aitoff:{project:function(b){var c=pv.radians(b.lng);b=pv.radians(b.lat);var d=Math.acos(Math.cos(b)*Math.cos(c/2));return{x:2*(d?Math.cos(b)*Math.sin(c/2)*d/Math.sin(d):0)/Math.PI,y:2*(d?Math.sin(b)*d/Math.sin(d):0)/Math.PI}},invert:function(b){var c=b.y*Math.PI/2;return{lng:pv.degrees(b.x*Math.PI/2/Math.cos(c)),lat:pv.degrees(c)}}},hammer:{project:function(b){var c=pv.radians(b.lng);b=pv.radians(b.lat);
var d=Math.sqrt(1+Math.cos(b)*Math.cos(c/2));return{x:2*Math.SQRT2*Math.cos(b)*Math.sin(c/2)/d/3,y:Math.SQRT2*Math.sin(b)/d/1.5}},invert:function(b){var c=b.x*3;b=b.y*1.5;var d=Math.sqrt(1-c*c/16-b*b/4);return{lng:pv.degrees(2*Math.atan2(d*c,2*(2*d*d-1))),lat:pv.degrees(Math.asin(d*b))}}},identity:{project:function(b){return{x:b.lng/180,y:b.lat/90}},invert:function(b){return{lng:b.x*180,lat:b.y*90}}}};
pv.Geo.scale=function(b){function c(m){if(!o||m.lng!=o.lng||m.lat!=o.lat){o=m;m=d(m);n={x:l(m.x),y:k(m.y)}}return n}function d(m){return j.project({lng:m.lng-q.lng,lat:m.lat})}function f(m){m=j.invert(m);m.lng+=q.lng;return m}var g={x:0,y:0},h={x:1,y:1},i=[],j=pv.Geo.projections.identity,l=pv.Scale.linear(-1,1).range(0,1),k=pv.Scale.linear(-1,1).range(1,0),q={lng:0,lat:0},o,n;c.x=function(m){return c(m).x};c.y=function(m){return c(m).y};c.ticks={lng:function(m){var r;if(i.length>1){var s=pv.Scale.linear();
if(m==undefined)m=10;r=s.domain(i,function(u){return u.lat}).ticks(m);m=s.domain(i,function(u){return u.lng}).ticks(m)}else{r=pv.range(-80,81,10);m=pv.range(-180,181,10)}return m.map(function(u){return r.map(function(x){return{lat:x,lng:u}})})},lat:function(m){return pv.transpose(c.ticks.lng(m))}};c.invert=function(m){return f({x:l.invert(m.x),y:k.invert(m.y)})};c.domain=function(m,r){if(arguments.length){i=m instanceof Array?arguments.length>1?pv.map(m,r):m:Array.prototype.slice.call(arguments);
if(i.length>1){var s=i.map(function(x){return x.lng}),u=i.map(function(x){return x.lat});q={lng:(pv.max(s)+pv.min(s))/2,lat:(pv.max(u)+pv.min(u))/2};s=i.map(d);l.domain(s,function(x){return x.x});k.domain(s,function(x){return x.y})}else{q={lng:0,lat:0};l.domain(-1,1);k.domain(-1,1)}o=null;return this}return i};c.range=function(m,r){if(arguments.length){if(typeof m=="object"){g={x:Number(m.x),y:Number(m.y)};h={x:Number(r.x),y:Number(r.y)}}else{g={x:0,y:0};h={x:Number(m),y:Number(r)}}l.range(g.x,h.x);
k.range(h.y,g.y);o=null;return this}return[g,h]};c.projection=function(m){if(arguments.length){j=typeof m=="string"?pv.Geo.projections[m]||pv.Geo.projections.identity:m;return this.domain(i)}return m};c.by=function(m){function r(){return c(m.apply(this,arguments))}for(var s in c)r[s]=c[s];return r};arguments.length&&c.projection(b);return c};
/*!
 * jQuery JavaScript Library v1.4.1
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Jan 25 19:43:33 2010 -0500
 */
(function(z,v){function la(){if(!c.isReady){try{r.documentElement.doScroll("left")}catch(a){setTimeout(la,1);return}c.ready()}}function Ma(a,b){b.src?c.ajax({url:b.src,async:false,dataType:"script"}):c.globalEval(b.text||b.textContent||b.innerHTML||"");b.parentNode&&b.parentNode.removeChild(b)}function X(a,b,d,f,e,i){var j=a.length;if(typeof b==="object"){for(var n in b)X(a,n,b[n],f,e,d);return a}if(d!==v){f=!i&&f&&c.isFunction(d);for(n=0;n<j;n++)e(a[n],b,f?d.call(a[n],n,e(a[n],b)):d,i);return a}return j?
e(a[0],b):null}function J(){return(new Date).getTime()}function Y(){return false}function Z(){return true}function ma(a,b,d){d[0].type=a;return c.event.handle.apply(b,d)}function na(a){var b,d=[],f=[],e=arguments,i,j,n,o,m,s,x=c.extend({},c.data(this,"events").live);if(!(a.button&&a.type==="click")){for(o in x){j=x[o];if(j.live===a.type||j.altLive&&c.inArray(a.type,j.altLive)>-1){i=j.data;i.beforeFilter&&i.beforeFilter[a.type]&&!i.beforeFilter[a.type](a)||f.push(j.selector)}else delete x[o]}i=c(a.target).closest(f,
a.currentTarget);m=0;for(s=i.length;m<s;m++)for(o in x){j=x[o];n=i[m].elem;f=null;if(i[m].selector===j.selector){if(j.live==="mouseenter"||j.live==="mouseleave")f=c(a.relatedTarget).closest(j.selector)[0];if(!f||f!==n)d.push({elem:n,fn:j})}}m=0;for(s=d.length;m<s;m++){i=d[m];a.currentTarget=i.elem;a.data=i.fn.data;if(i.fn.apply(i.elem,e)===false){b=false;break}}return b}}function oa(a,b){return"live."+(a?a+".":"")+b.replace(/\./g,"`").replace(/ /g,"&")}function pa(a){return!a||!a.parentNode||a.parentNode.nodeType===
11}function qa(a,b){var d=0;b.each(function(){if(this.nodeName===(a[d]&&a[d].nodeName)){var f=c.data(a[d++]),e=c.data(this,f);if(f=f&&f.events){delete e.handle;e.events={};for(var i in f)for(var j in f[i])c.event.add(this,i,f[i][j],f[i][j].data)}}})}function ra(a,b,d){var f,e,i;if(a.length===1&&typeof a[0]==="string"&&a[0].length<512&&a[0].indexOf("<option")<0&&(c.support.checkClone||!sa.test(a[0]))){e=true;if(i=c.fragments[a[0]])if(i!==1)f=i}if(!f){b=b&&b[0]?b[0].ownerDocument||b[0]:r;f=b.createDocumentFragment();
c.clean(a,b,f,d)}if(e)c.fragments[a[0]]=i?f:1;return{fragment:f,cacheable:e}}function K(a,b){var d={};c.each(ta.concat.apply([],ta.slice(0,b)),function(){d[this]=a});return d}function ua(a){return"scrollTo"in a&&a.document?a:a.nodeType===9?a.defaultView||a.parentWindow:false}var c=function(a,b){return new c.fn.init(a,b)},Na=z.jQuery,Oa=z.$,r=z.document,S,Pa=/^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,Qa=/^.[^:#\[\.,]*$/,Ra=/\S/,Sa=/^(\s|\u00A0)+|(\s|\u00A0)+$/g,Ta=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,O=navigator.userAgent,
va=false,P=[],L,$=Object.prototype.toString,aa=Object.prototype.hasOwnProperty,ba=Array.prototype.push,Q=Array.prototype.slice,wa=Array.prototype.indexOf;c.fn=c.prototype={init:function(a,b){var d,f;if(!a)return this;if(a.nodeType){this.context=this[0]=a;this.length=1;return this}if(typeof a==="string")if((d=Pa.exec(a))&&(d[1]||!b))if(d[1]){f=b?b.ownerDocument||b:r;if(a=Ta.exec(a))if(c.isPlainObject(b)){a=[r.createElement(a[1])];c.fn.attr.call(a,b,true)}else a=[f.createElement(a[1])];else{a=ra([d[1]],
[f]);a=(a.cacheable?a.fragment.cloneNode(true):a.fragment).childNodes}}else{if(b=r.getElementById(d[2])){if(b.id!==d[2])return S.find(a);this.length=1;this[0]=b}this.context=r;this.selector=a;return this}else if(!b&&/^\w+$/.test(a)){this.selector=a;this.context=r;a=r.getElementsByTagName(a)}else return!b||b.jquery?(b||S).find(a):c(b).find(a);else if(c.isFunction(a))return S.ready(a);if(a.selector!==v){this.selector=a.selector;this.context=a.context}return c.isArray(a)?this.setArray(a):c.makeArray(a,
this)},selector:"",jquery:"1.4.1",length:0,size:function(){return this.length},toArray:function(){return Q.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this.slice(a)[0]:this[a]},pushStack:function(a,b,d){a=c(a||null);a.prevObject=this;a.context=this.context;if(b==="find")a.selector=this.selector+(this.selector?" ":"")+d;else if(b)a.selector=this.selector+"."+b+"("+d+")";return a},setArray:function(a){this.length=0;ba.apply(this,a);return this},each:function(a,b){return c.each(this,
a,b)},ready:function(a){c.bindReady();if(c.isReady)a.call(r,c);else P&&P.push(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(Q.apply(this,arguments),"slice",Q.call(arguments).join(","))},map:function(a){return this.pushStack(c.map(this,function(b,d){return a.call(b,d,b)}))},end:function(){return this.prevObject||c(null)},push:ba,sort:[].sort,splice:[].splice};
c.fn.init.prototype=c.fn;c.extend=c.fn.extend=function(){var a=arguments[0]||{},b=1,d=arguments.length,f=false,e,i,j,n;if(typeof a==="boolean"){f=a;a=arguments[1]||{};b=2}if(typeof a!=="object"&&!c.isFunction(a))a={};if(d===b){a=this;--b}for(;b<d;b++)if((e=arguments[b])!=null)for(i in e){j=a[i];n=e[i];if(a!==n)if(f&&n&&(c.isPlainObject(n)||c.isArray(n))){j=j&&(c.isPlainObject(j)||c.isArray(j))?j:c.isArray(n)?[]:{};a[i]=c.extend(f,j,n)}else if(n!==v)a[i]=n}return a};c.extend({noConflict:function(a){z.$=
Oa;if(a)z.jQuery=Na;return c},isReady:false,ready:function(){if(!c.isReady){if(!r.body)return setTimeout(c.ready,13);c.isReady=true;if(P){for(var a,b=0;a=P[b++];)a.call(r,c);P=null}c.fn.triggerHandler&&c(r).triggerHandler("ready")}},bindReady:function(){if(!va){va=true;if(r.readyState==="complete")return c.ready();if(r.addEventListener){r.addEventListener("DOMContentLoaded",L,false);z.addEventListener("load",c.ready,false)}else if(r.attachEvent){r.attachEvent("onreadystatechange",L);z.attachEvent("onload",
c.ready);var a=false;try{a=z.frameElement==null}catch(b){}r.documentElement.doScroll&&a&&la()}}},isFunction:function(a){return $.call(a)==="[object Function]"},isArray:function(a){return $.call(a)==="[object Array]"},isPlainObject:function(a){if(!a||$.call(a)!=="[object Object]"||a.nodeType||a.setInterval)return false;if(a.constructor&&!aa.call(a,"constructor")&&!aa.call(a.constructor.prototype,"isPrototypeOf"))return false;var b;for(b in a);return b===v||aa.call(a,b)},isEmptyObject:function(a){for(var b in a)return false;
return true},error:function(a){throw a;},parseJSON:function(a){if(typeof a!=="string"||!a)return null;if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return z.JSON&&z.JSON.parse?z.JSON.parse(a):(new Function("return "+a))();else c.error("Invalid JSON: "+a)},noop:function(){},globalEval:function(a){if(a&&Ra.test(a)){var b=r.getElementsByTagName("head")[0]||
r.documentElement,d=r.createElement("script");d.type="text/javascript";if(c.support.scriptEval)d.appendChild(r.createTextNode(a));else d.text=a;b.insertBefore(d,b.firstChild);b.removeChild(d)}},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,b,d){var f,e=0,i=a.length,j=i===v||c.isFunction(a);if(d)if(j)for(f in a){if(b.apply(a[f],d)===false)break}else for(;e<i;){if(b.apply(a[e++],d)===false)break}else if(j)for(f in a){if(b.call(a[f],f,a[f])===false)break}else for(d=
a[0];e<i&&b.call(d,e,d)!==false;d=a[++e]);return a},trim:function(a){return(a||"").replace(Sa,"")},makeArray:function(a,b){b=b||[];if(a!=null)a.length==null||typeof a==="string"||c.isFunction(a)||typeof a!=="function"&&a.setInterval?ba.call(b,a):c.merge(b,a);return b},inArray:function(a,b){if(b.indexOf)return b.indexOf(a);for(var d=0,f=b.length;d<f;d++)if(b[d]===a)return d;return-1},merge:function(a,b){var d=a.length,f=0;if(typeof b.length==="number")for(var e=b.length;f<e;f++)a[d++]=b[f];else for(;b[f]!==
v;)a[d++]=b[f++];a.length=d;return a},grep:function(a,b,d){for(var f=[],e=0,i=a.length;e<i;e++)!d!==!b(a[e],e)&&f.push(a[e]);return f},map:function(a,b,d){for(var f=[],e,i=0,j=a.length;i<j;i++){e=b(a[i],i,d);if(e!=null)f[f.length]=e}return f.concat.apply([],f)},guid:1,proxy:function(a,b,d){if(arguments.length===2)if(typeof b==="string"){d=a;a=d[b];b=v}else if(b&&!c.isFunction(b)){d=b;b=v}if(!b&&a)b=function(){return a.apply(d||this,arguments)};if(a)b.guid=a.guid=a.guid||b.guid||c.guid++;return b},
uaMatch:function(a){a=a.toLowerCase();a=/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||!/compatible/.test(a)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(a)||[];return{browser:a[1]||"",version:a[2]||"0"}},browser:{}});O=c.uaMatch(O);if(O.browser){c.browser[O.browser]=true;c.browser.version=O.version}if(c.browser.webkit)c.browser.safari=true;if(wa)c.inArray=function(a,b){return wa.call(b,a)};S=c(r);if(r.addEventListener)L=function(){r.removeEventListener("DOMContentLoaded",
L,false);c.ready()};else if(r.attachEvent)L=function(){if(r.readyState==="complete"){r.detachEvent("onreadystatechange",L);c.ready()}};(function(){c.support={};var a=r.documentElement,b=r.createElement("script"),d=r.createElement("div"),f="script"+J();d.style.display="none";d.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";var e=d.getElementsByTagName("*"),i=d.getElementsByTagName("a")[0];if(!(!e||!e.length||!i)){c.support=
{leadingWhitespace:d.firstChild.nodeType===3,tbody:!d.getElementsByTagName("tbody").length,htmlSerialize:!!d.getElementsByTagName("link").length,style:/red/.test(i.getAttribute("style")),hrefNormalized:i.getAttribute("href")==="/a",opacity:/^0.55$/.test(i.style.opacity),cssFloat:!!i.style.cssFloat,checkOn:d.getElementsByTagName("input")[0].value==="on",optSelected:r.createElement("select").appendChild(r.createElement("option")).selected,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null};
b.type="text/javascript";try{b.appendChild(r.createTextNode("window."+f+"=1;"))}catch(j){}a.insertBefore(b,a.firstChild);if(z[f]){c.support.scriptEval=true;delete z[f]}a.removeChild(b);if(d.attachEvent&&d.fireEvent){d.attachEvent("onclick",function n(){c.support.noCloneEvent=false;d.detachEvent("onclick",n)});d.cloneNode(true).fireEvent("onclick")}d=r.createElement("div");d.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";a=r.createDocumentFragment();a.appendChild(d.firstChild);
c.support.checkClone=a.cloneNode(true).cloneNode(true).lastChild.checked;c(function(){var n=r.createElement("div");n.style.width=n.style.paddingLeft="1px";r.body.appendChild(n);c.boxModel=c.support.boxModel=n.offsetWidth===2;r.body.removeChild(n).style.display="none"});a=function(n){var o=r.createElement("div");n="on"+n;var m=n in o;if(!m){o.setAttribute(n,"return;");m=typeof o[n]==="function"}return m};c.support.submitBubbles=a("submit");c.support.changeBubbles=a("change");a=b=d=e=i=null}})();c.props=
{"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};var G="jQuery"+J(),Ua=0,xa={},Va={};c.extend({cache:{},expando:G,noData:{embed:true,object:true,applet:true},data:function(a,b,d){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==z?xa:a;var f=a[G],e=c.cache;if(!b&&!f)return null;f||(f=++Ua);if(typeof b==="object"){a[G]=f;e=e[f]=c.extend(true,
{},b)}else e=e[f]?e[f]:typeof d==="undefined"?Va:(e[f]={});if(d!==v){a[G]=f;e[b]=d}return typeof b==="string"?e[b]:e}},removeData:function(a,b){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==z?xa:a;var d=a[G],f=c.cache,e=f[d];if(b){if(e){delete e[b];c.isEmptyObject(e)&&c.removeData(a)}}else{try{delete a[G]}catch(i){a.removeAttribute&&a.removeAttribute(G)}delete f[d]}}}});c.fn.extend({data:function(a,b){if(typeof a==="undefined"&&this.length)return c.data(this[0]);else if(typeof a==="object")return this.each(function(){c.data(this,
a)});var d=a.split(".");d[1]=d[1]?"."+d[1]:"";if(b===v){var f=this.triggerHandler("getData"+d[1]+"!",[d[0]]);if(f===v&&this.length)f=c.data(this[0],a);return f===v&&d[1]?this.data(d[0]):f}else return this.trigger("setData"+d[1]+"!",[d[0],b]).each(function(){c.data(this,a,b)})},removeData:function(a){return this.each(function(){c.removeData(this,a)})}});c.extend({queue:function(a,b,d){if(a){b=(b||"fx")+"queue";var f=c.data(a,b);if(!d)return f||[];if(!f||c.isArray(d))f=c.data(a,b,c.makeArray(d));else f.push(d);
return f}},dequeue:function(a,b){b=b||"fx";var d=c.queue(a,b),f=d.shift();if(f==="inprogress")f=d.shift();if(f){b==="fx"&&d.unshift("inprogress");f.call(a,function(){c.dequeue(a,b)})}}});c.fn.extend({queue:function(a,b){if(typeof a!=="string"){b=a;a="fx"}if(b===v)return c.queue(this[0],a);return this.each(function(){var d=c.queue(this,a,b);a==="fx"&&d[0]!=="inprogress"&&c.dequeue(this,a)})},dequeue:function(a){return this.each(function(){c.dequeue(this,a)})},delay:function(a,b){a=c.fx?c.fx.speeds[a]||
a:a;b=b||"fx";return this.queue(b,function(){var d=this;setTimeout(function(){c.dequeue(d,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])}});var ya=/[\n\t]/g,ca=/\s+/,Wa=/\r/g,Xa=/href|src|style/,Ya=/(button|input)/i,Za=/(button|input|object|select|textarea)/i,$a=/^(a|area)$/i,za=/radio|checkbox/;c.fn.extend({attr:function(a,b){return X(this,a,b,true,c.attr)},removeAttr:function(a){return this.each(function(){c.attr(this,a,"");this.nodeType===1&&this.removeAttribute(a)})},addClass:function(a){if(c.isFunction(a))return this.each(function(o){var m=
c(this);m.addClass(a.call(this,o,m.attr("class")))});if(a&&typeof a==="string")for(var b=(a||"").split(ca),d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1)if(e.className)for(var i=" "+e.className+" ",j=0,n=b.length;j<n;j++){if(i.indexOf(" "+b[j]+" ")<0)e.className+=" "+b[j]}else e.className=a}return this},removeClass:function(a){if(c.isFunction(a))return this.each(function(o){var m=c(this);m.removeClass(a.call(this,o,m.attr("class")))});if(a&&typeof a==="string"||a===v)for(var b=(a||"").split(ca),
d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1&&e.className)if(a){for(var i=(" "+e.className+" ").replace(ya," "),j=0,n=b.length;j<n;j++)i=i.replace(" "+b[j]+" "," ");e.className=i.substring(1,i.length-1)}else e.className=""}return this},toggleClass:function(a,b){var d=typeof a,f=typeof b==="boolean";if(c.isFunction(a))return this.each(function(e){var i=c(this);i.toggleClass(a.call(this,e,i.attr("class"),b),b)});return this.each(function(){if(d==="string")for(var e,i=0,j=c(this),n=b,o=
a.split(ca);e=o[i++];){n=f?n:!j.hasClass(e);j[n?"addClass":"removeClass"](e)}else if(d==="undefined"||d==="boolean"){this.className&&c.data(this,"__className__",this.className);this.className=this.className||a===false?"":c.data(this,"__className__")||""}})},hasClass:function(a){a=" "+a+" ";for(var b=0,d=this.length;b<d;b++)if((" "+this[b].className+" ").replace(ya," ").indexOf(a)>-1)return true;return false},val:function(a){if(a===v){var b=this[0];if(b){if(c.nodeName(b,"option"))return(b.attributes.value||
{}).specified?b.value:b.text;if(c.nodeName(b,"select")){var d=b.selectedIndex,f=[],e=b.options;b=b.type==="select-one";if(d<0)return null;var i=b?d:0;for(d=b?d+1:e.length;i<d;i++){var j=e[i];if(j.selected){a=c(j).val();if(b)return a;f.push(a)}}return f}if(za.test(b.type)&&!c.support.checkOn)return b.getAttribute("value")===null?"on":b.value;return(b.value||"").replace(Wa,"")}return v}var n=c.isFunction(a);return this.each(function(o){var m=c(this),s=a;if(this.nodeType===1){if(n)s=a.call(this,o,m.val());
if(typeof s==="number")s+="";if(c.isArray(s)&&za.test(this.type))this.checked=c.inArray(m.val(),s)>=0;else if(c.nodeName(this,"select")){var x=c.makeArray(s);c("option",this).each(function(){this.selected=c.inArray(c(this).val(),x)>=0});if(!x.length)this.selectedIndex=-1}else this.value=s}})}});c.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(a,b,d,f){if(!a||a.nodeType===3||a.nodeType===8)return v;if(f&&b in c.attrFn)return c(a)[b](d);
f=a.nodeType!==1||!c.isXMLDoc(a);var e=d!==v;b=f&&c.props[b]||b;if(a.nodeType===1){var i=Xa.test(b);if(b in a&&f&&!i){if(e){b==="type"&&Ya.test(a.nodeName)&&a.parentNode&&c.error("type property can't be changed");a[b]=d}if(c.nodeName(a,"form")&&a.getAttributeNode(b))return a.getAttributeNode(b).nodeValue;if(b==="tabIndex")return(b=a.getAttributeNode("tabIndex"))&&b.specified?b.value:Za.test(a.nodeName)||$a.test(a.nodeName)&&a.href?0:v;return a[b]}if(!c.support.style&&f&&b==="style"){if(e)a.style.cssText=
""+d;return a.style.cssText}e&&a.setAttribute(b,""+d);a=!c.support.hrefNormalized&&f&&i?a.getAttribute(b,2):a.getAttribute(b);return a===null?v:a}return c.style(a,b,d)}});var ab=function(a){return a.replace(/[^\w\s\.\|`]/g,function(b){return"\\"+b})};c.event={add:function(a,b,d,f){if(!(a.nodeType===3||a.nodeType===8)){if(a.setInterval&&a!==z&&!a.frameElement)a=z;if(!d.guid)d.guid=c.guid++;if(f!==v){d=c.proxy(d);d.data=f}var e=c.data(a,"events")||c.data(a,"events",{}),i=c.data(a,"handle"),j;if(!i){j=
function(){return typeof c!=="undefined"&&!c.event.triggered?c.event.handle.apply(j.elem,arguments):v};i=c.data(a,"handle",j)}if(i){i.elem=a;b=b.split(/\s+/);for(var n,o=0;n=b[o++];){var m=n.split(".");n=m.shift();if(o>1){d=c.proxy(d);if(f!==v)d.data=f}d.type=m.slice(0).sort().join(".");var s=e[n],x=this.special[n]||{};if(!s){s=e[n]={};if(!x.setup||x.setup.call(a,f,m,d)===false)if(a.addEventListener)a.addEventListener(n,i,false);else a.attachEvent&&a.attachEvent("on"+n,i)}if(x.add)if((m=x.add.call(a,
d,f,m,s))&&c.isFunction(m)){m.guid=m.guid||d.guid;m.data=m.data||d.data;m.type=m.type||d.type;d=m}s[d.guid]=d;this.global[n]=true}a=null}}},global:{},remove:function(a,b,d){if(!(a.nodeType===3||a.nodeType===8)){var f=c.data(a,"events"),e,i,j;if(f){if(b===v||typeof b==="string"&&b.charAt(0)===".")for(i in f)this.remove(a,i+(b||""));else{if(b.type){d=b.handler;b=b.type}b=b.split(/\s+/);for(var n=0;i=b[n++];){var o=i.split(".");i=o.shift();var m=!o.length,s=c.map(o.slice(0).sort(),ab);s=new RegExp("(^|\\.)"+
s.join("\\.(?:.*\\.)?")+"(\\.|$)");var x=this.special[i]||{};if(f[i]){if(d){j=f[i][d.guid];delete f[i][d.guid]}else for(var A in f[i])if(m||s.test(f[i][A].type))delete f[i][A];x.remove&&x.remove.call(a,o,j);for(e in f[i])break;if(!e){if(!x.teardown||x.teardown.call(a,o)===false)if(a.removeEventListener)a.removeEventListener(i,c.data(a,"handle"),false);else a.detachEvent&&a.detachEvent("on"+i,c.data(a,"handle"));e=null;delete f[i]}}}}for(e in f)break;if(!e){if(A=c.data(a,"handle"))A.elem=null;c.removeData(a,
"events");c.removeData(a,"handle")}}}},trigger:function(a,b,d,f){var e=a.type||a;if(!f){a=typeof a==="object"?a[G]?a:c.extend(c.Event(e),a):c.Event(e);if(e.indexOf("!")>=0){a.type=e=e.slice(0,-1);a.exclusive=true}if(!d){a.stopPropagation();this.global[e]&&c.each(c.cache,function(){this.events&&this.events[e]&&c.event.trigger(a,b,this.handle.elem)})}if(!d||d.nodeType===3||d.nodeType===8)return v;a.result=v;a.target=d;b=c.makeArray(b);b.unshift(a)}a.currentTarget=d;(f=c.data(d,"handle"))&&f.apply(d,
b);f=d.parentNode||d.ownerDocument;try{if(!(d&&d.nodeName&&c.noData[d.nodeName.toLowerCase()]))if(d["on"+e]&&d["on"+e].apply(d,b)===false)a.result=false}catch(i){}if(!a.isPropagationStopped()&&f)c.event.trigger(a,b,f,true);else if(!a.isDefaultPrevented()){d=a.target;var j;if(!(c.nodeName(d,"a")&&e==="click")&&!(d&&d.nodeName&&c.noData[d.nodeName.toLowerCase()])){try{if(d[e]){if(j=d["on"+e])d["on"+e]=null;this.triggered=true;d[e]()}}catch(n){}if(j)d["on"+e]=j;this.triggered=false}}},handle:function(a){var b,
d;a=arguments[0]=c.event.fix(a||z.event);a.currentTarget=this;d=a.type.split(".");a.type=d.shift();b=!d.length&&!a.exclusive;var f=new RegExp("(^|\\.)"+d.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)");d=(c.data(this,"events")||{})[a.type];for(var e in d){var i=d[e];if(b||f.test(i.type)){a.handler=i;a.data=i.data;i=i.apply(this,arguments);if(i!==v){a.result=i;if(i===false){a.preventDefault();a.stopPropagation()}}if(a.isImmediatePropagationStopped())break}}return a.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
fix:function(a){if(a[G])return a;var b=a;a=c.Event(b);for(var d=this.props.length,f;d;){f=this.props[--d];a[f]=b[f]}if(!a.target)a.target=a.srcElement||r;if(a.target.nodeType===3)a.target=a.target.parentNode;if(!a.relatedTarget&&a.fromElement)a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement;if(a.pageX==null&&a.clientX!=null){b=r.documentElement;d=r.body;a.pageX=a.clientX+(b&&b.scrollLeft||d&&d.scrollLeft||0)-(b&&b.clientLeft||d&&d.clientLeft||0);a.pageY=a.clientY+(b&&b.scrollTop||
d&&d.scrollTop||0)-(b&&b.clientTop||d&&d.clientTop||0)}if(!a.which&&(a.charCode||a.charCode===0?a.charCode:a.keyCode))a.which=a.charCode||a.keyCode;if(!a.metaKey&&a.ctrlKey)a.metaKey=a.ctrlKey;if(!a.which&&a.button!==v)a.which=a.button&1?1:a.button&2?3:a.button&4?2:0;return a},guid:1E8,proxy:c.proxy,special:{ready:{setup:c.bindReady,teardown:c.noop},live:{add:function(a,b){c.extend(a,b||{});a.guid+=b.selector+b.live;b.liveProxy=a;c.event.add(this,b.live,na,b)},remove:function(a){if(a.length){var b=
0,d=new RegExp("(^|\\.)"+a[0]+"(\\.|$)");c.each(c.data(this,"events").live||{},function(){d.test(this.type)&&b++});b<1&&c.event.remove(this,a[0],na)}},special:{}},beforeunload:{setup:function(a,b,d){if(this.setInterval)this.onbeforeunload=d;return false},teardown:function(a,b){if(this.onbeforeunload===b)this.onbeforeunload=null}}}};c.Event=function(a){if(!this.preventDefault)return new c.Event(a);if(a&&a.type){this.originalEvent=a;this.type=a.type}else this.type=a;this.timeStamp=J();this[G]=true};
c.Event.prototype={preventDefault:function(){this.isDefaultPrevented=Z;var a=this.originalEvent;if(a){a.preventDefault&&a.preventDefault();a.returnValue=false}},stopPropagation:function(){this.isPropagationStopped=Z;var a=this.originalEvent;if(a){a.stopPropagation&&a.stopPropagation();a.cancelBubble=true}},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=Z;this.stopPropagation()},isDefaultPrevented:Y,isPropagationStopped:Y,isImmediatePropagationStopped:Y};var Aa=function(a){for(var b=
a.relatedTarget;b&&b!==this;)try{b=b.parentNode}catch(d){break}if(b!==this){a.type=a.data;c.event.handle.apply(this,arguments)}},Ba=function(a){a.type=a.data;c.event.handle.apply(this,arguments)};c.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){c.event.special[a]={setup:function(d){c.event.add(this,b,d&&d.selector?Ba:Aa,a)},teardown:function(d){c.event.remove(this,b,d&&d.selector?Ba:Aa)}}});if(!c.support.submitBubbles)c.event.special.submit={setup:function(a,b,d){if(this.nodeName.toLowerCase()!==
"form"){c.event.add(this,"click.specialSubmit."+d.guid,function(f){var e=f.target,i=e.type;if((i==="submit"||i==="image")&&c(e).closest("form").length)return ma("submit",this,arguments)});c.event.add(this,"keypress.specialSubmit."+d.guid,function(f){var e=f.target,i=e.type;if((i==="text"||i==="password")&&c(e).closest("form").length&&f.keyCode===13)return ma("submit",this,arguments)})}else return false},remove:function(a,b){c.event.remove(this,"click.specialSubmit"+(b?"."+b.guid:""));c.event.remove(this,
"keypress.specialSubmit"+(b?"."+b.guid:""))}};if(!c.support.changeBubbles){var da=/textarea|input|select/i;function Ca(a){var b=a.type,d=a.value;if(b==="radio"||b==="checkbox")d=a.checked;else if(b==="select-multiple")d=a.selectedIndex>-1?c.map(a.options,function(f){return f.selected}).join("-"):"";else if(a.nodeName.toLowerCase()==="select")d=a.selectedIndex;return d}function ea(a,b){var d=a.target,f,e;if(!(!da.test(d.nodeName)||d.readOnly)){f=c.data(d,"_change_data");e=Ca(d);if(a.type!=="focusout"||
d.type!=="radio")c.data(d,"_change_data",e);if(!(f===v||e===f))if(f!=null||e){a.type="change";return c.event.trigger(a,b,d)}}}c.event.special.change={filters:{focusout:ea,click:function(a){var b=a.target,d=b.type;if(d==="radio"||d==="checkbox"||b.nodeName.toLowerCase()==="select")return ea.call(this,a)},keydown:function(a){var b=a.target,d=b.type;if(a.keyCode===13&&b.nodeName.toLowerCase()!=="textarea"||a.keyCode===32&&(d==="checkbox"||d==="radio")||d==="select-multiple")return ea.call(this,a)},beforeactivate:function(a){a=
a.target;a.nodeName.toLowerCase()==="input"&&a.type==="radio"&&c.data(a,"_change_data",Ca(a))}},setup:function(a,b,d){for(var f in T)c.event.add(this,f+".specialChange."+d.guid,T[f]);return da.test(this.nodeName)},remove:function(a,b){for(var d in T)c.event.remove(this,d+".specialChange"+(b?"."+b.guid:""),T[d]);return da.test(this.nodeName)}};var T=c.event.special.change.filters}r.addEventListener&&c.each({focus:"focusin",blur:"focusout"},function(a,b){function d(f){f=c.event.fix(f);f.type=b;return c.event.handle.call(this,
f)}c.event.special[b]={setup:function(){this.addEventListener(a,d,true)},teardown:function(){this.removeEventListener(a,d,true)}}});c.each(["bind","one"],function(a,b){c.fn[b]=function(d,f,e){if(typeof d==="object"){for(var i in d)this[b](i,f,d[i],e);return this}if(c.isFunction(f)){e=f;f=v}var j=b==="one"?c.proxy(e,function(n){c(this).unbind(n,j);return e.apply(this,arguments)}):e;return d==="unload"&&b!=="one"?this.one(d,f,e):this.each(function(){c.event.add(this,d,j,f)})}});c.fn.extend({unbind:function(a,
b){if(typeof a==="object"&&!a.preventDefault){for(var d in a)this.unbind(d,a[d]);return this}return this.each(function(){c.event.remove(this,a,b)})},trigger:function(a,b){return this.each(function(){c.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0]){a=c.Event(a);a.preventDefault();a.stopPropagation();c.event.trigger(a,b,this[0]);return a.result}},toggle:function(a){for(var b=arguments,d=1;d<b.length;)c.proxy(a,b[d++]);return this.click(c.proxy(a,function(f){var e=(c.data(this,"lastToggle"+
a.guid)||0)%d;c.data(this,"lastToggle"+a.guid,e+1);f.preventDefault();return b[e].apply(this,arguments)||false}))},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});c.each(["live","die"],function(a,b){c.fn[b]=function(d,f,e){var i,j=0;if(c.isFunction(f)){e=f;f=v}for(d=(d||"").split(/\s+/);(i=d[j++])!=null;){i=i==="focus"?"focusin":i==="blur"?"focusout":i==="hover"?d.push("mouseleave")&&"mouseenter":i;b==="live"?c(this.context).bind(oa(i,this.selector),{data:f,selector:this.selector,
live:i},e):c(this.context).unbind(oa(i,this.selector),e?{guid:e.guid+this.selector+i}:null)}return this}});c.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),function(a,b){c.fn[b]=function(d){return d?this.bind(b,d):this.trigger(b)};if(c.attrFn)c.attrFn[b]=true});z.attachEvent&&!z.addEventListener&&z.attachEvent("onunload",function(){for(var a in c.cache)if(c.cache[a].handle)try{c.event.remove(c.cache[a].handle.elem)}catch(b){}});
(function(){function a(g){for(var h="",k,l=0;g[l];l++){k=g[l];if(k.nodeType===3||k.nodeType===4)h+=k.nodeValue;else if(k.nodeType!==8)h+=a(k.childNodes)}return h}function b(g,h,k,l,q,p){q=0;for(var u=l.length;q<u;q++){var t=l[q];if(t){t=t[g];for(var y=false;t;){if(t.sizcache===k){y=l[t.sizset];break}if(t.nodeType===1&&!p){t.sizcache=k;t.sizset=q}if(t.nodeName.toLowerCase()===h){y=t;break}t=t[g]}l[q]=y}}}function d(g,h,k,l,q,p){q=0;for(var u=l.length;q<u;q++){var t=l[q];if(t){t=t[g];for(var y=false;t;){if(t.sizcache===
k){y=l[t.sizset];break}if(t.nodeType===1){if(!p){t.sizcache=k;t.sizset=q}if(typeof h!=="string"){if(t===h){y=true;break}}else if(o.filter(h,[t]).length>0){y=t;break}}t=t[g]}l[q]=y}}}var f=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,e=0,i=Object.prototype.toString,j=false,n=true;[0,0].sort(function(){n=false;return 0});var o=function(g,h,k,l){k=k||[];var q=h=h||r;if(h.nodeType!==1&&h.nodeType!==9)return[];if(!g||
typeof g!=="string")return k;for(var p=[],u,t,y,R,H=true,M=w(h),I=g;(f.exec(""),u=f.exec(I))!==null;){I=u[3];p.push(u[1]);if(u[2]){R=u[3];break}}if(p.length>1&&s.exec(g))if(p.length===2&&m.relative[p[0]])t=fa(p[0]+p[1],h);else for(t=m.relative[p[0]]?[h]:o(p.shift(),h);p.length;){g=p.shift();if(m.relative[g])g+=p.shift();t=fa(g,t)}else{if(!l&&p.length>1&&h.nodeType===9&&!M&&m.match.ID.test(p[0])&&!m.match.ID.test(p[p.length-1])){u=o.find(p.shift(),h,M);h=u.expr?o.filter(u.expr,u.set)[0]:u.set[0]}if(h){u=
l?{expr:p.pop(),set:A(l)}:o.find(p.pop(),p.length===1&&(p[0]==="~"||p[0]==="+")&&h.parentNode?h.parentNode:h,M);t=u.expr?o.filter(u.expr,u.set):u.set;if(p.length>0)y=A(t);else H=false;for(;p.length;){var D=p.pop();u=D;if(m.relative[D])u=p.pop();else D="";if(u==null)u=h;m.relative[D](y,u,M)}}else y=[]}y||(y=t);y||o.error(D||g);if(i.call(y)==="[object Array]")if(H)if(h&&h.nodeType===1)for(g=0;y[g]!=null;g++){if(y[g]&&(y[g]===true||y[g].nodeType===1&&E(h,y[g])))k.push(t[g])}else for(g=0;y[g]!=null;g++)y[g]&&
y[g].nodeType===1&&k.push(t[g]);else k.push.apply(k,y);else A(y,k);if(R){o(R,q,k,l);o.uniqueSort(k)}return k};o.uniqueSort=function(g){if(C){j=n;g.sort(C);if(j)for(var h=1;h<g.length;h++)g[h]===g[h-1]&&g.splice(h--,1)}return g};o.matches=function(g,h){return o(g,null,null,h)};o.find=function(g,h,k){var l,q;if(!g)return[];for(var p=0,u=m.order.length;p<u;p++){var t=m.order[p];if(q=m.leftMatch[t].exec(g)){var y=q[1];q.splice(1,1);if(y.substr(y.length-1)!=="\\"){q[1]=(q[1]||"").replace(/\\/g,"");l=m.find[t](q,
h,k);if(l!=null){g=g.replace(m.match[t],"");break}}}}l||(l=h.getElementsByTagName("*"));return{set:l,expr:g}};o.filter=function(g,h,k,l){for(var q=g,p=[],u=h,t,y,R=h&&h[0]&&w(h[0]);g&&h.length;){for(var H in m.filter)if((t=m.leftMatch[H].exec(g))!=null&&t[2]){var M=m.filter[H],I,D;D=t[1];y=false;t.splice(1,1);if(D.substr(D.length-1)!=="\\"){if(u===p)p=[];if(m.preFilter[H])if(t=m.preFilter[H](t,u,k,p,l,R)){if(t===true)continue}else y=I=true;if(t)for(var U=0;(D=u[U])!=null;U++)if(D){I=M(D,t,U,u);var Da=
l^!!I;if(k&&I!=null)if(Da)y=true;else u[U]=false;else if(Da){p.push(D);y=true}}if(I!==v){k||(u=p);g=g.replace(m.match[H],"");if(!y)return[];break}}}if(g===q)if(y==null)o.error(g);else break;q=g}return u};o.error=function(g){throw"Syntax error, unrecognized expression: "+g;};var m=o.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
TAG:/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(g){return g.getAttribute("href")}},relative:{"+":function(g,h){var k=typeof h==="string",l=k&&!/\W/.test(h);k=k&&!l;if(l)h=h.toLowerCase();l=0;for(var q=g.length,
p;l<q;l++)if(p=g[l]){for(;(p=p.previousSibling)&&p.nodeType!==1;);g[l]=k||p&&p.nodeName.toLowerCase()===h?p||false:p===h}k&&o.filter(h,g,true)},">":function(g,h){var k=typeof h==="string";if(k&&!/\W/.test(h)){h=h.toLowerCase();for(var l=0,q=g.length;l<q;l++){var p=g[l];if(p){k=p.parentNode;g[l]=k.nodeName.toLowerCase()===h?k:false}}}else{l=0;for(q=g.length;l<q;l++)if(p=g[l])g[l]=k?p.parentNode:p.parentNode===h;k&&o.filter(h,g,true)}},"":function(g,h,k){var l=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=
h=h.toLowerCase();q=b}q("parentNode",h,l,g,p,k)},"~":function(g,h,k){var l=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=h=h.toLowerCase();q=b}q("previousSibling",h,l,g,p,k)}},find:{ID:function(g,h,k){if(typeof h.getElementById!=="undefined"&&!k)return(g=h.getElementById(g[1]))?[g]:[]},NAME:function(g,h){if(typeof h.getElementsByName!=="undefined"){var k=[];h=h.getElementsByName(g[1]);for(var l=0,q=h.length;l<q;l++)h[l].getAttribute("name")===g[1]&&k.push(h[l]);return k.length===0?null:k}},
TAG:function(g,h){return h.getElementsByTagName(g[1])}},preFilter:{CLASS:function(g,h,k,l,q,p){g=" "+g[1].replace(/\\/g,"")+" ";if(p)return g;p=0;for(var u;(u=h[p])!=null;p++)if(u)if(q^(u.className&&(" "+u.className+" ").replace(/[\t\n]/g," ").indexOf(g)>=0))k||l.push(u);else if(k)h[p]=false;return false},ID:function(g){return g[1].replace(/\\/g,"")},TAG:function(g){return g[1].toLowerCase()},CHILD:function(g){if(g[1]==="nth"){var h=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(g[2]==="even"&&"2n"||g[2]==="odd"&&
"2n+1"||!/\D/.test(g[2])&&"0n+"+g[2]||g[2]);g[2]=h[1]+(h[2]||1)-0;g[3]=h[3]-0}g[0]=e++;return g},ATTR:function(g,h,k,l,q,p){h=g[1].replace(/\\/g,"");if(!p&&m.attrMap[h])g[1]=m.attrMap[h];if(g[2]==="~=")g[4]=" "+g[4]+" ";return g},PSEUDO:function(g,h,k,l,q){if(g[1]==="not")if((f.exec(g[3])||"").length>1||/^\w/.test(g[3]))g[3]=o(g[3],null,null,h);else{g=o.filter(g[3],h,k,true^q);k||l.push.apply(l,g);return false}else if(m.match.POS.test(g[0])||m.match.CHILD.test(g[0]))return true;return g},POS:function(g){g.unshift(true);
return g}},filters:{enabled:function(g){return g.disabled===false&&g.type!=="hidden"},disabled:function(g){return g.disabled===true},checked:function(g){return g.checked===true},selected:function(g){return g.selected===true},parent:function(g){return!!g.firstChild},empty:function(g){return!g.firstChild},has:function(g,h,k){return!!o(k[3],g).length},header:function(g){return/h\d/i.test(g.nodeName)},text:function(g){return"text"===g.type},radio:function(g){return"radio"===g.type},checkbox:function(g){return"checkbox"===
g.type},file:function(g){return"file"===g.type},password:function(g){return"password"===g.type},submit:function(g){return"submit"===g.type},image:function(g){return"image"===g.type},reset:function(g){return"reset"===g.type},button:function(g){return"button"===g.type||g.nodeName.toLowerCase()==="button"},input:function(g){return/input|select|textarea|button/i.test(g.nodeName)}},setFilters:{first:function(g,h){return h===0},last:function(g,h,k,l){return h===l.length-1},even:function(g,h){return h%2===
0},odd:function(g,h){return h%2===1},lt:function(g,h,k){return h<k[3]-0},gt:function(g,h,k){return h>k[3]-0},nth:function(g,h,k){return k[3]-0===h},eq:function(g,h,k){return k[3]-0===h}},filter:{PSEUDO:function(g,h,k,l){var q=h[1],p=m.filters[q];if(p)return p(g,k,h,l);else if(q==="contains")return(g.textContent||g.innerText||a([g])||"").indexOf(h[3])>=0;else if(q==="not"){h=h[3];k=0;for(l=h.length;k<l;k++)if(h[k]===g)return false;return true}else o.error("Syntax error, unrecognized expression: "+
q)},CHILD:function(g,h){var k=h[1],l=g;switch(k){case "only":case "first":for(;l=l.previousSibling;)if(l.nodeType===1)return false;if(k==="first")return true;l=g;case "last":for(;l=l.nextSibling;)if(l.nodeType===1)return false;return true;case "nth":k=h[2];var q=h[3];if(k===1&&q===0)return true;h=h[0];var p=g.parentNode;if(p&&(p.sizcache!==h||!g.nodeIndex)){var u=0;for(l=p.firstChild;l;l=l.nextSibling)if(l.nodeType===1)l.nodeIndex=++u;p.sizcache=h}g=g.nodeIndex-q;return k===0?g===0:g%k===0&&g/k>=
0}},ID:function(g,h){return g.nodeType===1&&g.getAttribute("id")===h},TAG:function(g,h){return h==="*"&&g.nodeType===1||g.nodeName.toLowerCase()===h},CLASS:function(g,h){return(" "+(g.className||g.getAttribute("class"))+" ").indexOf(h)>-1},ATTR:function(g,h){var k=h[1];g=m.attrHandle[k]?m.attrHandle[k](g):g[k]!=null?g[k]:g.getAttribute(k);k=g+"";var l=h[2];h=h[4];return g==null?l==="!=":l==="="?k===h:l==="*="?k.indexOf(h)>=0:l==="~="?(" "+k+" ").indexOf(h)>=0:!h?k&&g!==false:l==="!="?k!==h:l==="^="?
k.indexOf(h)===0:l==="$="?k.substr(k.length-h.length)===h:l==="|="?k===h||k.substr(0,h.length+1)===h+"-":false},POS:function(g,h,k,l){var q=m.setFilters[h[2]];if(q)return q(g,k,h,l)}}},s=m.match.POS;for(var x in m.match){m.match[x]=new RegExp(m.match[x].source+/(?![^\[]*\])(?![^\(]*\))/.source);m.leftMatch[x]=new RegExp(/(^(?:.|\r|\n)*?)/.source+m.match[x].source.replace(/\\(\d+)/g,function(g,h){return"\\"+(h-0+1)}))}var A=function(g,h){g=Array.prototype.slice.call(g,0);if(h){h.push.apply(h,g);return h}return g};
try{Array.prototype.slice.call(r.documentElement.childNodes,0)}catch(B){A=function(g,h){h=h||[];if(i.call(g)==="[object Array]")Array.prototype.push.apply(h,g);else if(typeof g.length==="number")for(var k=0,l=g.length;k<l;k++)h.push(g[k]);else for(k=0;g[k];k++)h.push(g[k]);return h}}var C;if(r.documentElement.compareDocumentPosition)C=function(g,h){if(!g.compareDocumentPosition||!h.compareDocumentPosition){if(g==h)j=true;return g.compareDocumentPosition?-1:1}g=g.compareDocumentPosition(h)&4?-1:g===
h?0:1;if(g===0)j=true;return g};else if("sourceIndex"in r.documentElement)C=function(g,h){if(!g.sourceIndex||!h.sourceIndex){if(g==h)j=true;return g.sourceIndex?-1:1}g=g.sourceIndex-h.sourceIndex;if(g===0)j=true;return g};else if(r.createRange)C=function(g,h){if(!g.ownerDocument||!h.ownerDocument){if(g==h)j=true;return g.ownerDocument?-1:1}var k=g.ownerDocument.createRange(),l=h.ownerDocument.createRange();k.setStart(g,0);k.setEnd(g,0);l.setStart(h,0);l.setEnd(h,0);g=k.compareBoundaryPoints(Range.START_TO_END,
l);if(g===0)j=true;return g};(function(){var g=r.createElement("div"),h="script"+(new Date).getTime();g.innerHTML="<a name='"+h+"'/>";var k=r.documentElement;k.insertBefore(g,k.firstChild);if(r.getElementById(h)){m.find.ID=function(l,q,p){if(typeof q.getElementById!=="undefined"&&!p)return(q=q.getElementById(l[1]))?q.id===l[1]||typeof q.getAttributeNode!=="undefined"&&q.getAttributeNode("id").nodeValue===l[1]?[q]:v:[]};m.filter.ID=function(l,q){var p=typeof l.getAttributeNode!=="undefined"&&l.getAttributeNode("id");
return l.nodeType===1&&p&&p.nodeValue===q}}k.removeChild(g);k=g=null})();(function(){var g=r.createElement("div");g.appendChild(r.createComment(""));if(g.getElementsByTagName("*").length>0)m.find.TAG=function(h,k){k=k.getElementsByTagName(h[1]);if(h[1]==="*"){h=[];for(var l=0;k[l];l++)k[l].nodeType===1&&h.push(k[l]);k=h}return k};g.innerHTML="<a href='#'></a>";if(g.firstChild&&typeof g.firstChild.getAttribute!=="undefined"&&g.firstChild.getAttribute("href")!=="#")m.attrHandle.href=function(h){return h.getAttribute("href",
2)};g=null})();r.querySelectorAll&&function(){var g=o,h=r.createElement("div");h.innerHTML="<p class='TEST'></p>";if(!(h.querySelectorAll&&h.querySelectorAll(".TEST").length===0)){o=function(l,q,p,u){q=q||r;if(!u&&q.nodeType===9&&!w(q))try{return A(q.querySelectorAll(l),p)}catch(t){}return g(l,q,p,u)};for(var k in g)o[k]=g[k];h=null}}();(function(){var g=r.createElement("div");g.innerHTML="<div class='test e'></div><div class='test'></div>";if(!(!g.getElementsByClassName||g.getElementsByClassName("e").length===
0)){g.lastChild.className="e";if(g.getElementsByClassName("e").length!==1){m.order.splice(1,0,"CLASS");m.find.CLASS=function(h,k,l){if(typeof k.getElementsByClassName!=="undefined"&&!l)return k.getElementsByClassName(h[1])};g=null}}})();var E=r.compareDocumentPosition?function(g,h){return g.compareDocumentPosition(h)&16}:function(g,h){return g!==h&&(g.contains?g.contains(h):true)},w=function(g){return(g=(g?g.ownerDocument||g:0).documentElement)?g.nodeName!=="HTML":false},fa=function(g,h){var k=[],
l="",q;for(h=h.nodeType?[h]:h;q=m.match.PSEUDO.exec(g);){l+=q[0];g=g.replace(m.match.PSEUDO,"")}g=m.relative[g]?g+"*":g;q=0;for(var p=h.length;q<p;q++)o(g,h[q],k);return o.filter(l,k)};c.find=o;c.expr=o.selectors;c.expr[":"]=c.expr.filters;c.unique=o.uniqueSort;c.getText=a;c.isXMLDoc=w;c.contains=E})();var bb=/Until$/,cb=/^(?:parents|prevUntil|prevAll)/,db=/,/;Q=Array.prototype.slice;var Ea=function(a,b,d){if(c.isFunction(b))return c.grep(a,function(e,i){return!!b.call(e,i,e)===d});else if(b.nodeType)return c.grep(a,
function(e){return e===b===d});else if(typeof b==="string"){var f=c.grep(a,function(e){return e.nodeType===1});if(Qa.test(b))return c.filter(b,f,!d);else b=c.filter(b,f)}return c.grep(a,function(e){return c.inArray(e,b)>=0===d})};c.fn.extend({find:function(a){for(var b=this.pushStack("","find",a),d=0,f=0,e=this.length;f<e;f++){d=b.length;c.find(a,this[f],b);if(f>0)for(var i=d;i<b.length;i++)for(var j=0;j<d;j++)if(b[j]===b[i]){b.splice(i--,1);break}}return b},has:function(a){var b=c(a);return this.filter(function(){for(var d=
0,f=b.length;d<f;d++)if(c.contains(this,b[d]))return true})},not:function(a){return this.pushStack(Ea(this,a,false),"not",a)},filter:function(a){return this.pushStack(Ea(this,a,true),"filter",a)},is:function(a){return!!a&&c.filter(a,this).length>0},closest:function(a,b){if(c.isArray(a)){var d=[],f=this[0],e,i={},j;if(f&&a.length){e=0;for(var n=a.length;e<n;e++){j=a[e];i[j]||(i[j]=c.expr.match.POS.test(j)?c(j,b||this.context):j)}for(;f&&f.ownerDocument&&f!==b;){for(j in i){e=i[j];if(e.jquery?e.index(f)>
-1:c(f).is(e)){d.push({selector:j,elem:f});delete i[j]}}f=f.parentNode}}return d}var o=c.expr.match.POS.test(a)?c(a,b||this.context):null;return this.map(function(m,s){for(;s&&s.ownerDocument&&s!==b;){if(o?o.index(s)>-1:c(s).is(a))return s;s=s.parentNode}return null})},index:function(a){if(!a||typeof a==="string")return c.inArray(this[0],a?c(a):this.parent().children());return c.inArray(a.jquery?a[0]:a,this)},add:function(a,b){a=typeof a==="string"?c(a,b||this.context):c.makeArray(a);b=c.merge(this.get(),
a);return this.pushStack(pa(a[0])||pa(b[0])?b:c.unique(b))},andSelf:function(){return this.add(this.prevObject)}});c.each({parent:function(a){return(a=a.parentNode)&&a.nodeType!==11?a:null},parents:function(a){return c.dir(a,"parentNode")},parentsUntil:function(a,b,d){return c.dir(a,"parentNode",d)},next:function(a){return c.nth(a,2,"nextSibling")},prev:function(a){return c.nth(a,2,"previousSibling")},nextAll:function(a){return c.dir(a,"nextSibling")},prevAll:function(a){return c.dir(a,"previousSibling")},
nextUntil:function(a,b,d){return c.dir(a,"nextSibling",d)},prevUntil:function(a,b,d){return c.dir(a,"previousSibling",d)},siblings:function(a){return c.sibling(a.parentNode.firstChild,a)},children:function(a){return c.sibling(a.firstChild)},contents:function(a){return c.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:c.makeArray(a.childNodes)}},function(a,b){c.fn[a]=function(d,f){var e=c.map(this,b,d);bb.test(a)||(f=d);if(f&&typeof f==="string")e=c.filter(f,e);e=this.length>1?c.unique(e):
e;if((this.length>1||db.test(f))&&cb.test(a))e=e.reverse();return this.pushStack(e,a,Q.call(arguments).join(","))}});c.extend({filter:function(a,b,d){if(d)a=":not("+a+")";return c.find.matches(a,b)},dir:function(a,b,d){var f=[];for(a=a[b];a&&a.nodeType!==9&&(d===v||a.nodeType!==1||!c(a).is(d));){a.nodeType===1&&f.push(a);a=a[b]}return f},nth:function(a,b,d){b=b||1;for(var f=0;a;a=a[d])if(a.nodeType===1&&++f===b)break;return a},sibling:function(a,b){for(var d=[];a;a=a.nextSibling)a.nodeType===1&&a!==
b&&d.push(a);return d}});var Fa=/ jQuery\d+="(?:\d+|null)"/g,V=/^\s+/,Ga=/(<([\w:]+)[^>]*?)\/>/g,eb=/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,Ha=/<([\w:]+)/,fb=/<tbody/i,gb=/<|&\w+;/,sa=/checked\s*(?:[^=]|=\s*.checked.)/i,Ia=function(a,b,d){return eb.test(d)?a:b+"></"+d+">"},F={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],
col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};F.optgroup=F.option;F.tbody=F.tfoot=F.colgroup=F.caption=F.thead;F.th=F.td;if(!c.support.htmlSerialize)F._default=[1,"div<div>","</div>"];c.fn.extend({text:function(a){if(c.isFunction(a))return this.each(function(b){var d=c(this);d.text(a.call(this,b,d.text()))});if(typeof a!=="object"&&a!==v)return this.empty().append((this[0]&&this[0].ownerDocument||r).createTextNode(a));return c.getText(this)},
wrapAll:function(a){if(c.isFunction(a))return this.each(function(d){c(this).wrapAll(a.call(this,d))});if(this[0]){var b=c(a,this[0].ownerDocument).eq(0).clone(true);this[0].parentNode&&b.insertBefore(this[0]);b.map(function(){for(var d=this;d.firstChild&&d.firstChild.nodeType===1;)d=d.firstChild;return d}).append(this)}return this},wrapInner:function(a){if(c.isFunction(a))return this.each(function(b){c(this).wrapInner(a.call(this,b))});return this.each(function(){var b=c(this),d=b.contents();d.length?
d.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){c(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){c.nodeName(this,"body")||c(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,
false,function(b){this.parentNode.insertBefore(b,this)});else if(arguments.length){var a=c(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,false,function(b){this.parentNode.insertBefore(b,this.nextSibling)});else if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,c(arguments[0]).toArray());return a}},clone:function(a){var b=this.map(function(){if(!c.support.noCloneEvent&&
!c.isXMLDoc(this)){var d=this.outerHTML,f=this.ownerDocument;if(!d){d=f.createElement("div");d.appendChild(this.cloneNode(true));d=d.innerHTML}return c.clean([d.replace(Fa,"").replace(V,"")],f)[0]}else return this.cloneNode(true)});if(a===true){qa(this,b);qa(this.find("*"),b.find("*"))}return b},html:function(a){if(a===v)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(Fa,""):null;else if(typeof a==="string"&&!/<script/i.test(a)&&(c.support.leadingWhitespace||!V.test(a))&&!F[(Ha.exec(a)||
["",""])[1].toLowerCase()]){a=a.replace(Ga,Ia);try{for(var b=0,d=this.length;b<d;b++)if(this[b].nodeType===1){c.cleanData(this[b].getElementsByTagName("*"));this[b].innerHTML=a}}catch(f){this.empty().append(a)}}else c.isFunction(a)?this.each(function(e){var i=c(this),j=i.html();i.empty().append(function(){return a.call(this,e,j)})}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(c.isFunction(a))return this.each(function(b){var d=c(this),f=d.html();d.replaceWith(a.call(this,
b,f))});else a=c(a).detach();return this.each(function(){var b=this.nextSibling,d=this.parentNode;c(this).remove();b?c(b).before(a):c(d).append(a)})}else return this.pushStack(c(c.isFunction(a)?a():a),"replaceWith",a)},detach:function(a){return this.remove(a,true)},domManip:function(a,b,d){function f(s){return c.nodeName(s,"table")?s.getElementsByTagName("tbody")[0]||s.appendChild(s.ownerDocument.createElement("tbody")):s}var e,i,j=a[0],n=[];if(!c.support.checkClone&&arguments.length===3&&typeof j===
"string"&&sa.test(j))return this.each(function(){c(this).domManip(a,b,d,true)});if(c.isFunction(j))return this.each(function(s){var x=c(this);a[0]=j.call(this,s,b?x.html():v);x.domManip(a,b,d)});if(this[0]){e=a[0]&&a[0].parentNode&&a[0].parentNode.nodeType===11?{fragment:a[0].parentNode}:ra(a,this,n);if(i=e.fragment.firstChild){b=b&&c.nodeName(i,"tr");for(var o=0,m=this.length;o<m;o++)d.call(b?f(this[o],i):this[o],e.cacheable||this.length>1||o>0?e.fragment.cloneNode(true):e.fragment)}n&&c.each(n,
Ma)}return this}});c.fragments={};c.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){c.fn[a]=function(d){var f=[];d=c(d);for(var e=0,i=d.length;e<i;e++){var j=(e>0?this.clone(true):this).get();c.fn[b].apply(c(d[e]),j);f=f.concat(j)}return this.pushStack(f,a,d.selector)}});c.each({remove:function(a,b){if(!a||c.filter(a,[this]).length){if(!b&&this.nodeType===1){c.cleanData(this.getElementsByTagName("*"));c.cleanData([this])}this.parentNode&&
this.parentNode.removeChild(this)}},empty:function(){for(this.nodeType===1&&c.cleanData(this.getElementsByTagName("*"));this.firstChild;)this.removeChild(this.firstChild)}},function(a,b){c.fn[a]=function(){return this.each(b,arguments)}});c.extend({clean:function(a,b,d,f){b=b||r;if(typeof b.createElement==="undefined")b=b.ownerDocument||b[0]&&b[0].ownerDocument||r;var e=[];c.each(a,function(i,j){if(typeof j==="number")j+="";if(j){if(typeof j==="string"&&!gb.test(j))j=b.createTextNode(j);else if(typeof j===
"string"){j=j.replace(Ga,Ia);var n=(Ha.exec(j)||["",""])[1].toLowerCase(),o=F[n]||F._default,m=o[0];i=b.createElement("div");for(i.innerHTML=o[1]+j+o[2];m--;)i=i.lastChild;if(!c.support.tbody){m=fb.test(j);n=n==="table"&&!m?i.firstChild&&i.firstChild.childNodes:o[1]==="<table>"&&!m?i.childNodes:[];for(o=n.length-1;o>=0;--o)c.nodeName(n[o],"tbody")&&!n[o].childNodes.length&&n[o].parentNode.removeChild(n[o])}!c.support.leadingWhitespace&&V.test(j)&&i.insertBefore(b.createTextNode(V.exec(j)[0]),i.firstChild);
j=c.makeArray(i.childNodes)}if(j.nodeType)e.push(j);else e=c.merge(e,j)}});if(d)for(a=0;e[a];a++)if(f&&c.nodeName(e[a],"script")&&(!e[a].type||e[a].type.toLowerCase()==="text/javascript"))f.push(e[a].parentNode?e[a].parentNode.removeChild(e[a]):e[a]);else{e[a].nodeType===1&&e.splice.apply(e,[a+1,0].concat(c.makeArray(e[a].getElementsByTagName("script"))));d.appendChild(e[a])}return e},cleanData:function(a){for(var b=0,d;(d=a[b])!=null;b++){c.event.remove(d);c.removeData(d)}}});var hb=/z-?index|font-?weight|opacity|zoom|line-?height/i,
Ja=/alpha\([^)]*\)/,Ka=/opacity=([^)]*)/,ga=/float/i,ha=/-([a-z])/ig,ib=/([A-Z])/g,jb=/^-?\d+(?:px)?$/i,kb=/^-?\d/,lb={position:"absolute",visibility:"hidden",display:"block"},mb=["Left","Right"],nb=["Top","Bottom"],ob=r.defaultView&&r.defaultView.getComputedStyle,La=c.support.cssFloat?"cssFloat":"styleFloat",ia=function(a,b){return b.toUpperCase()};c.fn.css=function(a,b){return X(this,a,b,true,function(d,f,e){if(e===v)return c.curCSS(d,f);if(typeof e==="number"&&!hb.test(f))e+="px";c.style(d,f,e)})};
c.extend({style:function(a,b,d){if(!a||a.nodeType===3||a.nodeType===8)return v;if((b==="width"||b==="height")&&parseFloat(d)<0)d=v;var f=a.style||a,e=d!==v;if(!c.support.opacity&&b==="opacity"){if(e){f.zoom=1;b=parseInt(d,10)+""==="NaN"?"":"alpha(opacity="+d*100+")";a=f.filter||c.curCSS(a,"filter")||"";f.filter=Ja.test(a)?a.replace(Ja,b):b}return f.filter&&f.filter.indexOf("opacity=")>=0?parseFloat(Ka.exec(f.filter)[1])/100+"":""}if(ga.test(b))b=La;b=b.replace(ha,ia);if(e)f[b]=d;return f[b]},css:function(a,
b,d,f){if(b==="width"||b==="height"){var e,i=b==="width"?mb:nb;function j(){e=b==="width"?a.offsetWidth:a.offsetHeight;f!=="border"&&c.each(i,function(){f||(e-=parseFloat(c.curCSS(a,"padding"+this,true))||0);if(f==="margin")e+=parseFloat(c.curCSS(a,"margin"+this,true))||0;else e-=parseFloat(c.curCSS(a,"border"+this+"Width",true))||0})}a.offsetWidth!==0?j():c.swap(a,lb,j);return Math.max(0,Math.round(e))}return c.curCSS(a,b,d)},curCSS:function(a,b,d){var f,e=a.style;if(!c.support.opacity&&b==="opacity"&&
a.currentStyle){f=Ka.test(a.currentStyle.filter||"")?parseFloat(RegExp.$1)/100+"":"";return f===""?"1":f}if(ga.test(b))b=La;if(!d&&e&&e[b])f=e[b];else if(ob){if(ga.test(b))b="float";b=b.replace(ib,"-$1").toLowerCase();e=a.ownerDocument.defaultView;if(!e)return null;if(a=e.getComputedStyle(a,null))f=a.getPropertyValue(b);if(b==="opacity"&&f==="")f="1"}else if(a.currentStyle){d=b.replace(ha,ia);f=a.currentStyle[b]||a.currentStyle[d];if(!jb.test(f)&&kb.test(f)){b=e.left;var i=a.runtimeStyle.left;a.runtimeStyle.left=
a.currentStyle.left;e.left=d==="fontSize"?"1em":f||0;f=e.pixelLeft+"px";e.left=b;a.runtimeStyle.left=i}}return f},swap:function(a,b,d){var f={};for(var e in b){f[e]=a.style[e];a.style[e]=b[e]}d.call(a);for(e in b)a.style[e]=f[e]}});if(c.expr&&c.expr.filters){c.expr.filters.hidden=function(a){var b=a.offsetWidth,d=a.offsetHeight,f=a.nodeName.toLowerCase()==="tr";return b===0&&d===0&&!f?true:b>0&&d>0&&!f?false:c.curCSS(a,"display")==="none"};c.expr.filters.visible=function(a){return!c.expr.filters.hidden(a)}}var pb=
J(),qb=/<script(.|\s)*?\/script>/gi,rb=/select|textarea/i,sb=/color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,N=/=\?(&|$)/,ja=/\?/,tb=/(\?|&)_=.*?(&|$)/,ub=/^(\w+:)?\/\/([^\/?#]+)/,vb=/%20/g;c.fn.extend({_load:c.fn.load,load:function(a,b,d){if(typeof a!=="string")return this._load(a);else if(!this.length)return this;var f=a.indexOf(" ");if(f>=0){var e=a.slice(f,a.length);a=a.slice(0,f)}f="GET";if(b)if(c.isFunction(b)){d=b;b=null}else if(typeof b==="object"){b=
c.param(b,c.ajaxSettings.traditional);f="POST"}var i=this;c.ajax({url:a,type:f,dataType:"html",data:b,complete:function(j,n){if(n==="success"||n==="notmodified")i.html(e?c("<div />").append(j.responseText.replace(qb,"")).find(e):j.responseText);d&&i.each(d,[j.responseText,n,j])}});return this},serialize:function(){return c.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?c.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&
(this.checked||rb.test(this.nodeName)||sb.test(this.type))}).map(function(a,b){a=c(this).val();return a==null?null:c.isArray(a)?c.map(a,function(d){return{name:b.name,value:d}}):{name:b.name,value:a}}).get()}});c.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){c.fn[b]=function(d){return this.bind(b,d)}});c.extend({get:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b=null}return c.ajax({type:"GET",url:a,data:b,success:d,dataType:f})},getScript:function(a,
b){return c.get(a,null,b,"script")},getJSON:function(a,b,d){return c.get(a,b,d,"json")},post:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b={}}return c.ajax({type:"POST",url:a,data:b,success:d,dataType:f})},ajaxSetup:function(a){c.extend(c.ajaxSettings,a)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:z.XMLHttpRequest&&(z.location.protocol!=="file:"||!z.ActiveXObject)?function(){return new z.XMLHttpRequest}:
function(){try{return new z.ActiveXObject("Microsoft.XMLHTTP")}catch(a){}},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},etag:{},ajax:function(a){function b(){e.success&&e.success.call(o,n,j,w);e.global&&f("ajaxSuccess",[w,e])}function d(){e.complete&&e.complete.call(o,w,j);e.global&&f("ajaxComplete",[w,e]);e.global&&!--c.active&&c.event.trigger("ajaxStop")}
function f(q,p){(e.context?c(e.context):c.event).trigger(q,p)}var e=c.extend(true,{},c.ajaxSettings,a),i,j,n,o=a&&a.context||e,m=e.type.toUpperCase();if(e.data&&e.processData&&typeof e.data!=="string")e.data=c.param(e.data,e.traditional);if(e.dataType==="jsonp"){if(m==="GET")N.test(e.url)||(e.url+=(ja.test(e.url)?"&":"?")+(e.jsonp||"callback")+"=?");else if(!e.data||!N.test(e.data))e.data=(e.data?e.data+"&":"")+(e.jsonp||"callback")+"=?";e.dataType="json"}if(e.dataType==="json"&&(e.data&&N.test(e.data)||
N.test(e.url))){i=e.jsonpCallback||"jsonp"+pb++;if(e.data)e.data=(e.data+"").replace(N,"="+i+"$1");e.url=e.url.replace(N,"="+i+"$1");e.dataType="script";z[i]=z[i]||function(q){n=q;b();d();z[i]=v;try{delete z[i]}catch(p){}A&&A.removeChild(B)}}if(e.dataType==="script"&&e.cache===null)e.cache=false;if(e.cache===false&&m==="GET"){var s=J(),x=e.url.replace(tb,"$1_="+s+"$2");e.url=x+(x===e.url?(ja.test(e.url)?"&":"?")+"_="+s:"")}if(e.data&&m==="GET")e.url+=(ja.test(e.url)?"&":"?")+e.data;e.global&&!c.active++&&
c.event.trigger("ajaxStart");s=(s=ub.exec(e.url))&&(s[1]&&s[1]!==location.protocol||s[2]!==location.host);if(e.dataType==="script"&&m==="GET"&&s){var A=r.getElementsByTagName("head")[0]||r.documentElement,B=r.createElement("script");B.src=e.url;if(e.scriptCharset)B.charset=e.scriptCharset;if(!i){var C=false;B.onload=B.onreadystatechange=function(){if(!C&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){C=true;b();d();B.onload=B.onreadystatechange=null;A&&B.parentNode&&
A.removeChild(B)}}}A.insertBefore(B,A.firstChild);return v}var E=false,w=e.xhr();if(w){e.username?w.open(m,e.url,e.async,e.username,e.password):w.open(m,e.url,e.async);try{if(e.data||a&&a.contentType)w.setRequestHeader("Content-Type",e.contentType);if(e.ifModified){c.lastModified[e.url]&&w.setRequestHeader("If-Modified-Since",c.lastModified[e.url]);c.etag[e.url]&&w.setRequestHeader("If-None-Match",c.etag[e.url])}s||w.setRequestHeader("X-Requested-With","XMLHttpRequest");w.setRequestHeader("Accept",
e.dataType&&e.accepts[e.dataType]?e.accepts[e.dataType]+", */*":e.accepts._default)}catch(fa){}if(e.beforeSend&&e.beforeSend.call(o,w,e)===false){e.global&&!--c.active&&c.event.trigger("ajaxStop");w.abort();return false}e.global&&f("ajaxSend",[w,e]);var g=w.onreadystatechange=function(q){if(!w||w.readyState===0||q==="abort"){E||d();E=true;if(w)w.onreadystatechange=c.noop}else if(!E&&w&&(w.readyState===4||q==="timeout")){E=true;w.onreadystatechange=c.noop;j=q==="timeout"?"timeout":!c.httpSuccess(w)?
"error":e.ifModified&&c.httpNotModified(w,e.url)?"notmodified":"success";var p;if(j==="success")try{n=c.httpData(w,e.dataType,e)}catch(u){j="parsererror";p=u}if(j==="success"||j==="notmodified")i||b();else c.handleError(e,w,j,p);d();q==="timeout"&&w.abort();if(e.async)w=null}};try{var h=w.abort;w.abort=function(){w&&h.call(w);g("abort")}}catch(k){}e.async&&e.timeout>0&&setTimeout(function(){w&&!E&&g("timeout")},e.timeout);try{w.send(m==="POST"||m==="PUT"||m==="DELETE"?e.data:null)}catch(l){c.handleError(e,
w,null,l);d()}e.async||g();return w}},handleError:function(a,b,d,f){if(a.error)a.error.call(a.context||a,b,d,f);if(a.global)(a.context?c(a.context):c.event).trigger("ajaxError",[b,a,f])},active:0,httpSuccess:function(a){try{return!a.status&&location.protocol==="file:"||a.status>=200&&a.status<300||a.status===304||a.status===1223||a.status===0}catch(b){}return false},httpNotModified:function(a,b){var d=a.getResponseHeader("Last-Modified"),f=a.getResponseHeader("Etag");if(d)c.lastModified[b]=d;if(f)c.etag[b]=
f;return a.status===304||a.status===0},httpData:function(a,b,d){var f=a.getResponseHeader("content-type")||"",e=b==="xml"||!b&&f.indexOf("xml")>=0;a=e?a.responseXML:a.responseText;e&&a.documentElement.nodeName==="parsererror"&&c.error("parsererror");if(d&&d.dataFilter)a=d.dataFilter(a,b);if(typeof a==="string")if(b==="json"||!b&&f.indexOf("json")>=0)a=c.parseJSON(a);else if(b==="script"||!b&&f.indexOf("javascript")>=0)c.globalEval(a);return a},param:function(a,b){function d(j,n){if(c.isArray(n))c.each(n,
function(o,m){b?f(j,m):d(j+"["+(typeof m==="object"||c.isArray(m)?o:"")+"]",m)});else!b&&n!=null&&typeof n==="object"?c.each(n,function(o,m){d(j+"["+o+"]",m)}):f(j,n)}function f(j,n){n=c.isFunction(n)?n():n;e[e.length]=encodeURIComponent(j)+"="+encodeURIComponent(n)}var e=[];if(b===v)b=c.ajaxSettings.traditional;if(c.isArray(a)||a.jquery)c.each(a,function(){f(this.name,this.value)});else for(var i in a)d(i,a[i]);return e.join("&").replace(vb,"+")}});var ka={},wb=/toggle|show|hide/,xb=/^([+-]=)?([\d+-.]+)(.*)$/,
W,ta=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];c.fn.extend({show:function(a,b){if(a||a===0)return this.animate(K("show",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");this[a].style.display=d||"";if(c.css(this[a],"display")==="none"){d=this[a].nodeName;var f;if(ka[d])f=ka[d];else{var e=c("<"+d+" />").appendTo("body");f=e.css("display");if(f==="none")f="block";e.remove();
ka[d]=f}c.data(this[a],"olddisplay",f)}}a=0;for(b=this.length;a<b;a++)this[a].style.display=c.data(this[a],"olddisplay")||"";return this}},hide:function(a,b){if(a||a===0)return this.animate(K("hide",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");!d&&d!=="none"&&c.data(this[a],"olddisplay",c.css(this[a],"display"))}a=0;for(b=this.length;a<b;a++)this[a].style.display="none";return this}},_toggle:c.fn.toggle,toggle:function(a,b){var d=typeof a==="boolean";if(c.isFunction(a)&&
c.isFunction(b))this._toggle.apply(this,arguments);else a==null||d?this.each(function(){var f=d?a:c(this).is(":hidden");c(this)[f?"show":"hide"]()}):this.animate(K("toggle",3),a,b);return this},fadeTo:function(a,b,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,d)},animate:function(a,b,d,f){var e=c.speed(b,d,f);if(c.isEmptyObject(a))return this.each(e.complete);return this[e.queue===false?"each":"queue"](function(){var i=c.extend({},e),j,n=this.nodeType===1&&c(this).is(":hidden"),
o=this;for(j in a){var m=j.replace(ha,ia);if(j!==m){a[m]=a[j];delete a[j];j=m}if(a[j]==="hide"&&n||a[j]==="show"&&!n)return i.complete.call(this);if((j==="height"||j==="width")&&this.style){i.display=c.css(this,"display");i.overflow=this.style.overflow}if(c.isArray(a[j])){(i.specialEasing=i.specialEasing||{})[j]=a[j][1];a[j]=a[j][0]}}if(i.overflow!=null)this.style.overflow="hidden";i.curAnim=c.extend({},a);c.each(a,function(s,x){var A=new c.fx(o,i,s);if(wb.test(x))A[x==="toggle"?n?"show":"hide":x](a);
else{var B=xb.exec(x),C=A.cur(true)||0;if(B){x=parseFloat(B[2]);var E=B[3]||"px";if(E!=="px"){o.style[s]=(x||1)+E;C=(x||1)/A.cur(true)*C;o.style[s]=C+E}if(B[1])x=(B[1]==="-="?-1:1)*x+C;A.custom(C,x,E)}else A.custom(C,x,"")}});return true})},stop:function(a,b){var d=c.timers;a&&this.queue([]);this.each(function(){for(var f=d.length-1;f>=0;f--)if(d[f].elem===this){b&&d[f](true);d.splice(f,1)}});b||this.dequeue();return this}});c.each({slideDown:K("show",1),slideUp:K("hide",1),slideToggle:K("toggle",
1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(a,b){c.fn[a]=function(d,f){return this.animate(b,d,f)}});c.extend({speed:function(a,b,d){var f=a&&typeof a==="object"?a:{complete:d||!d&&b||c.isFunction(a)&&a,duration:a,easing:d&&b||b&&!c.isFunction(b)&&b};f.duration=c.fx.off?0:typeof f.duration==="number"?f.duration:c.fx.speeds[f.duration]||c.fx.speeds._default;f.old=f.complete;f.complete=function(){f.queue!==false&&c(this).dequeue();c.isFunction(f.old)&&f.old.call(this)};return f},easing:{linear:function(a,
b,d,f){return d+f*a},swing:function(a,b,d,f){return(-Math.cos(a*Math.PI)/2+0.5)*f+d}},timers:[],fx:function(a,b,d){this.options=b;this.elem=a;this.prop=d;if(!b.orig)b.orig={}}});c.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this);(c.fx.step[this.prop]||c.fx.step._default)(this);if((this.prop==="height"||this.prop==="width")&&this.elem.style)this.elem.style.display="block"},cur:function(a){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==
null))return this.elem[this.prop];return(a=parseFloat(c.css(this.elem,this.prop,a)))&&a>-10000?a:parseFloat(c.curCSS(this.elem,this.prop))||0},custom:function(a,b,d){function f(i){return e.step(i)}this.startTime=J();this.start=a;this.end=b;this.unit=d||this.unit||"px";this.now=this.start;this.pos=this.state=0;var e=this;f.elem=this.elem;if(f()&&c.timers.push(f)&&!W)W=setInterval(c.fx.tick,13)},show:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop===
"width"||this.prop==="height"?1:0,this.cur());c(this.elem).show()},hide:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(a){var b=J(),d=true;if(a||b>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var f in this.options.curAnim)if(this.options.curAnim[f]!==true)d=false;if(d){if(this.options.display!=null){this.elem.style.overflow=
this.options.overflow;a=c.data(this.elem,"olddisplay");this.elem.style.display=a?a:this.options.display;if(c.css(this.elem,"display")==="none")this.elem.style.display="block"}this.options.hide&&c(this.elem).hide();if(this.options.hide||this.options.show)for(var e in this.options.curAnim)c.style(this.elem,e,this.options.orig[e]);this.options.complete.call(this.elem)}return false}else{e=b-this.startTime;this.state=e/this.options.duration;a=this.options.easing||(c.easing.swing?"swing":"linear");this.pos=
c.easing[this.options.specialEasing&&this.options.specialEasing[this.prop]||a](this.state,e,0,1,this.options.duration);this.now=this.start+(this.end-this.start)*this.pos;this.update()}return true}};c.extend(c.fx,{tick:function(){for(var a=c.timers,b=0;b<a.length;b++)a[b]()||a.splice(b--,1);a.length||c.fx.stop()},stop:function(){clearInterval(W);W=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){c.style(a.elem,"opacity",a.now)},_default:function(a){if(a.elem.style&&a.elem.style[a.prop]!=
null)a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit;else a.elem[a.prop]=a.now}}});if(c.expr&&c.expr.filters)c.expr.filters.animated=function(a){return c.grep(c.timers,function(b){return a===b.elem}).length};c.fn.offset="getBoundingClientRect"in r.documentElement?function(a){var b=this[0];if(a)return this.each(function(e){c.offset.setOffset(this,a,e)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);var d=b.getBoundingClientRect(),
f=b.ownerDocument;b=f.body;f=f.documentElement;return{top:d.top+(self.pageYOffset||c.support.boxModel&&f.scrollTop||b.scrollTop)-(f.clientTop||b.clientTop||0),left:d.left+(self.pageXOffset||c.support.boxModel&&f.scrollLeft||b.scrollLeft)-(f.clientLeft||b.clientLeft||0)}}:function(a){var b=this[0];if(a)return this.each(function(s){c.offset.setOffset(this,a,s)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);c.offset.initialize();var d=b.offsetParent,f=
b,e=b.ownerDocument,i,j=e.documentElement,n=e.body;f=(e=e.defaultView)?e.getComputedStyle(b,null):b.currentStyle;for(var o=b.offsetTop,m=b.offsetLeft;(b=b.parentNode)&&b!==n&&b!==j;){if(c.offset.supportsFixedPosition&&f.position==="fixed")break;i=e?e.getComputedStyle(b,null):b.currentStyle;o-=b.scrollTop;m-=b.scrollLeft;if(b===d){o+=b.offsetTop;m+=b.offsetLeft;if(c.offset.doesNotAddBorder&&!(c.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(b.nodeName))){o+=parseFloat(i.borderTopWidth)||
0;m+=parseFloat(i.borderLeftWidth)||0}f=d;d=b.offsetParent}if(c.offset.subtractsBorderForOverflowNotVisible&&i.overflow!=="visible"){o+=parseFloat(i.borderTopWidth)||0;m+=parseFloat(i.borderLeftWidth)||0}f=i}if(f.position==="relative"||f.position==="static"){o+=n.offsetTop;m+=n.offsetLeft}if(c.offset.supportsFixedPosition&&f.position==="fixed"){o+=Math.max(j.scrollTop,n.scrollTop);m+=Math.max(j.scrollLeft,n.scrollLeft)}return{top:o,left:m}};c.offset={initialize:function(){var a=r.body,b=r.createElement("div"),
d,f,e,i=parseFloat(c.curCSS(a,"marginTop",true))||0;c.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});b.innerHTML="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";a.insertBefore(b,a.firstChild);
d=b.firstChild;f=d.firstChild;e=d.nextSibling.firstChild.firstChild;this.doesNotAddBorder=f.offsetTop!==5;this.doesAddBorderForTableAndCells=e.offsetTop===5;f.style.position="fixed";f.style.top="20px";this.supportsFixedPosition=f.offsetTop===20||f.offsetTop===15;f.style.position=f.style.top="";d.style.overflow="hidden";d.style.position="relative";this.subtractsBorderForOverflowNotVisible=f.offsetTop===-5;this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==i;a.removeChild(b);c.offset.initialize=c.noop},
bodyOffset:function(a){var b=a.offsetTop,d=a.offsetLeft;c.offset.initialize();if(c.offset.doesNotIncludeMarginInBodyOffset){b+=parseFloat(c.curCSS(a,"marginTop",true))||0;d+=parseFloat(c.curCSS(a,"marginLeft",true))||0}return{top:b,left:d}},setOffset:function(a,b,d){if(/static/.test(c.curCSS(a,"position")))a.style.position="relative";var f=c(a),e=f.offset(),i=parseInt(c.curCSS(a,"top",true),10)||0,j=parseInt(c.curCSS(a,"left",true),10)||0;if(c.isFunction(b))b=b.call(a,d,e);d={top:b.top-e.top+i,left:b.left-
e.left+j};"using"in b?b.using.call(a,d):f.css(d)}};c.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),d=this.offset(),f=/^body|html$/i.test(b[0].nodeName)?{top:0,left:0}:b.offset();d.top-=parseFloat(c.curCSS(a,"marginTop",true))||0;d.left-=parseFloat(c.curCSS(a,"marginLeft",true))||0;f.top+=parseFloat(c.curCSS(b[0],"borderTopWidth",true))||0;f.left+=parseFloat(c.curCSS(b[0],"borderLeftWidth",true))||0;return{top:d.top-f.top,left:d.left-f.left}},offsetParent:function(){return this.map(function(){for(var a=
this.offsetParent||r.body;a&&!/^body|html$/i.test(a.nodeName)&&c.css(a,"position")==="static";)a=a.offsetParent;return a})}});c.each(["Left","Top"],function(a,b){var d="scroll"+b;c.fn[d]=function(f){var e=this[0],i;if(!e)return null;if(f!==v)return this.each(function(){if(i=ua(this))i.scrollTo(!a?f:c(i).scrollLeft(),a?f:c(i).scrollTop());else this[d]=f});else return(i=ua(e))?"pageXOffset"in i?i[a?"pageYOffset":"pageXOffset"]:c.support.boxModel&&i.document.documentElement[d]||i.document.body[d]:e[d]}});
c.each(["Height","Width"],function(a,b){var d=b.toLowerCase();c.fn["inner"+b]=function(){return this[0]?c.css(this[0],d,false,"padding"):null};c.fn["outer"+b]=function(f){return this[0]?c.css(this[0],d,false,f?"margin":"border"):null};c.fn[d]=function(f){var e=this[0];if(!e)return f==null?null:this;if(c.isFunction(f))return this.each(function(i){var j=c(this);j[d](f.call(this,i,j[d]()))});return"scrollTo"in e&&e.document?e.document.compatMode==="CSS1Compat"&&e.document.documentElement["client"+b]||
e.document.body["client"+b]:e.nodeType===9?Math.max(e.documentElement["client"+b],e.body["scroll"+b],e.documentElement["scroll"+b],e.body["offset"+b],e.documentElement["offset"+b]):f===v?c.css(e,d):this.css(d,typeof f==="string"?f:f+"px")}});z.jQuery=z.$=c})(window);
/*
 * Raphael 1.4.7 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael=function(){function l(){if(l.is(arguments[0],U)){for(var a=arguments[0],b=Ca[K](l,a.splice(0,3+l.is(a[0],P))),c=b.set(),d=0,f=a[o];d<f;d++){var e=a[d]||{};sb.test(e.type)&&c[F](b[e.type]().attr(e))}return c}return Ca[K](l,arguments)}l.version="1.4.7";var V=/[, ]+/,sb=/^(circle|rect|path|ellipse|text|image)$/,p="prototype",z="hasOwnProperty",C=document,aa=window,Qa={was:Object[p][z].call(aa,"Raphael"),is:aa.Raphael};function H(){}var x="appendChild",K="apply",M="concat",Da="createTouch"in C,
A="",N=" ",D=String,G="split",Ra="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[G](N),Ea={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},R="join",o="length",fa=String[p].toLowerCase,v=Math,Y=v.max,ba=v.min,P="number",ga="string",U="array",O="toString",ca="fill",tb=Object[p][O],E=v.pow,F="push",ja=/^(?=[\da-f]$)/,Sa=/^url\(['"]?([^\)]+?)['"]?\)$/i,ub=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+(?:\s*,\s*[\d\.]+)?)\s*\)|rgba?\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%(?:\s*,\s*[\d\.]+%)?)\s*\)|hsb\(\s*([\d\.]+(?:deg|\xb0)?\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hsb\(\s*([\d\.]+(?:deg|\xb0|%)\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hsl\(\s*([\d\.]+(?:deg|\xb0)?\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hsl\(\s*([\d\.]+(?:deg|\xb0|%)\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i,
Q=v.round,W="setAttribute",y=parseFloat,ha=parseInt,Fa=" progid:DXImageTransform.Microsoft",sa=String[p].toUpperCase,ta={blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/",opacity:1,path:"M0,0",r:0,rotation:0,rx:0,ry:0,scale:"1 1",src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt",
"stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",translation:"0 0",width:0,x:0,y:0},Ga={along:"along",blur:P,"clip-rect":"csv",cx:P,cy:P,fill:"colour","fill-opacity":P,"font-size":P,height:P,opacity:P,path:"path",r:P,rotation:"csv",rx:P,ry:P,scale:"csv",stroke:"colour","stroke-opacity":P,"stroke-width":P,translation:"csv",width:P,x:P,y:P},I="replace";l.type=aa.SVGAngle||C.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure",
"1.1")?"SVG":"VML";if(l.type=="VML"){var da=C.createElement("div");da.innerHTML='<v:shape adj="1"/>';da=da.firstChild;da.style.behavior="url(#default#VML)";if(!(da&&typeof da.adj=="object"))return l.type=null;da=null}l.svg=!(l.vml=l.type=="VML");H[p]=l[p];l._id=0;l._oid=0;l.fn={};l.is=function(a,b){b=fa.call(b);return b=="object"&&a===Object(a)||b=="undefined"&&typeof a==b||b=="null"&&a==null||b=="array"&&Array.isArray&&Array.isArray(a)||fa.call(tb.call(a).slice(8,-1))==b};l.setWindow=function(a){aa=
a;C=aa.document};function ua(a){if(l.vml){var b=/^\s+|\s+$/g;ua=Z(function(d){var f;d=D(d)[I](b,A);try{var e=new aa.ActiveXObject("htmlfile");e.write("<body>");e.close();f=e.body}catch(g){f=aa.createPopup().document.body}e=f.createTextRange();try{f.style.color=d;var h=e.queryCommandValue("ForeColor");h=(h&255)<<16|h&65280|(h&16711680)>>>16;return"#"+("000000"+h[O](16)).slice(-6)}catch(i){return"none"}})}else{var c=C.createElement("i");c.title="Rapha\u00ebl Colour Picker";c.style.display="none";C.body[x](c);
ua=Z(function(d){c.style.color=d;return C.defaultView.getComputedStyle(c,A).getPropertyValue("color")})}return ua(a)}function Ta(){return"hsb("+[this.h,this.s,this.b]+")"}function vb(){return"hsl("+[this.h,this.s,this.l]+")"}function wb(){return this.hex}l.hsb2rgb=function(a,b,c){if(l.is(a,"object")&&"h"in a&&"s"in a&&"b"in a){c=a.b;b=a.s;a=a.h}return l.hsl2rgb(a,b,c/2)};l.hsl2rgb=function(a,b,c){if(l.is(a,"object")&&"h"in a&&"s"in a&&"l"in a){c=a.l;b=a.s;a=a.h}if(a>1||b>1||c>1){a/=255;b/=255;c/=
255}var d={},f=["r","g","b"],e;if(b){b=c<0.5?c*(1+b):c+b-c*b;c=2*c-b;for(var g=0,h=f.length;g<h;g++){e=a+1/3*-(g-1);e<0&&e++;e>1&&e--;d[f[g]]=e*6<1?c+(b-c)*6*e:e*2<1?b:e*3<2?c+(b-c)*(2/3-e)*6:c}}else d={r:c,g:c,b:c};d.r*=255;d.g*=255;d.b*=255;a=(~~d.r)[O](16);f=(~~d.g)[O](16);b=(~~d.b)[O](16);a=a[I](ja,"0");f=f[I](ja,"0");b=b[I](ja,"0");d.hex="#"+a+f+b;d.toString=wb;return d};l.rgb2hsb=function(a,b,c){if(b==null&&l.is(a,"object")&&"r"in a&&"g"in a&&"b"in a){c=a.b;b=a.g;a=a.r}if(b==null&&l.is(a,ga)){var d=
l.getRGB(a);a=d.r;b=d.g;c=d.b}if(a>1||b>1||c>1){a/=255;b/=255;c/=255}var f=Y(a,b,c),e=ba(a,b,c);d=f;if(e==f)return{h:0,s:0,b:f,toString:Ta};else{var g=f-e;e=g/f;a=a==f?(b-c)/g:b==f?2+(c-a)/g:4+(a-b)/g;a/=6;a<0&&a++;a>1&&a--}return{h:a,s:e,b:d,toString:Ta}};l.rgb2hsl=function(a,b,c){if(b==null&&l.is(a,"object")&&"r"in a&&"g"in a&&"b"in a){c=a.b;b=a.g;a=a.r}if(b==null&&l.is(a,ga)){var d=l.getRGB(a);a=d.r;b=d.g;c=d.b}if(a>1||b>1||c>1){a/=255;b/=255;c/=255}var f=Y(a,b,c),e=ba(a,b,c);d=(f+e)/2;if(e==f)a=
{h:0,s:0,l:d};else{var g=f-e;e=d<0.5?g/(f+e):g/(2-f-e);a=a==f?(b-c)/g:b==f?2+(c-a)/g:4+(a-b)/g;a/=6;a<0&&a++;a>1&&a--;a={h:a,s:e,l:d}}a.toString=vb;return a};var xb=/,?([achlmqrstvxz]),?/gi,ka=/\s*,\s*/,yb={hs:1,rg:1};l._path2string=function(){return this.join(",")[I](xb,"$1")};function Z(a,b,c){function d(){var f=Array[p].slice.call(arguments,0),e=f[R]("\u25ba"),g=d.cache=d.cache||{},h=d.count=d.count||[];if(g[z](e))return c?c(g[e]):g[e];h[o]>=1000&&delete g[h.shift()];h[F](e);g[e]=a[K](b,f);return c?
c(g[e]):g[e]}return d}l.getRGB=Z(function(a){if(!a||(a=D(a)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1};if(a=="none")return{r:-1,g:-1,b:-1,hex:"none"};!(yb[z](a.substring(0,2))||a.charAt()=="#")&&(a=ua(a));var b,c,d,f,e;if(a=a.match(ub)){if(a[2]){d=ha(a[2].substring(5),16);c=ha(a[2].substring(3,5),16);b=ha(a[2].substring(1,3),16)}if(a[3]){d=ha((e=a[3].charAt(3))+e,16);c=ha((e=a[3].charAt(2))+e,16);b=ha((e=a[3].charAt(1))+e,16)}if(a[4]){a=a[4][G](ka);b=y(a[0]);c=y(a[1]);d=y(a[2]);f=y(a[3])}if(a[5]){a=
a[5][G](ka);b=y(a[0])*2.55;c=y(a[1])*2.55;d=y(a[2])*2.55;f=y(a[3])}if(a[6]){a=a[6][G](ka);b=y(a[0]);c=y(a[1]);d=y(a[2]);(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360);return l.hsb2rgb(b,c,d)}if(a[7]){a=a[7][G](ka);b=y(a[0])*2.55;c=y(a[1])*2.55;d=y(a[2])*2.55;(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360*2.55);return l.hsb2rgb(b,c,d)}if(a[8]){a=a[8][G](ka);b=y(a[0]);c=y(a[1]);d=y(a[2]);(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360);return l.hsl2rgb(b,c,d)}if(a[9]){a=
a[9][G](ka);b=y(a[0])*2.55;c=y(a[1])*2.55;d=y(a[2])*2.55;(a[0].slice(-3)=="deg"||a[0].slice(-1)=="\u00b0")&&(b/=360*2.55);return l.hsl2rgb(b,c,d)}a={r:b,g:c,b:d};b=(~~b)[O](16);c=(~~c)[O](16);d=(~~d)[O](16);b=b[I](ja,"0");c=c[I](ja,"0");d=d[I](ja,"0");a.hex="#"+b+c+d;isFinite(y(f))&&(a.o=f);return a}return{r:-1,g:-1,b:-1,hex:"none",error:1}},l);l.getColor=function(a){a=this.getColor.start=this.getColor.start||{h:0,s:1,b:a||0.75};var b=this.hsb2rgb(a.h,a.s,a.b);a.h+=0.075;if(a.h>1){a.h=0;a.s-=0.2;
a.s<=0&&(this.getColor.start={h:0,s:1,b:a.b})}return b.hex};l.getColor.reset=function(){delete this.start};var zb=/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,Ab=/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig;l.parsePathString=Z(function(a){if(!a)return null;var b={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0},c=[];if(l.is(a,U)&&l.is(a[0],U))c=va(a);c[o]||D(a)[I](zb,function(d,f,e){var g=[];d=fa.call(f);e[I](Ab,function(h,i){i&&g[F](+i)});if(d=="m"&&g[o]>2){c[F]([f][M](g.splice(0,2)));d="l";
f=f=="m"?"l":"L"}for(;g[o]>=b[d];){c[F]([f][M](g.splice(0,b[d])));if(!b[d])break}});c[O]=l._path2string;return c});l.findDotsAtSegment=function(a,b,c,d,f,e,g,h,i){var j=1-i,m=E(j,3)*a+E(j,2)*3*i*c+j*3*i*i*f+E(i,3)*g;j=E(j,3)*b+E(j,2)*3*i*d+j*3*i*i*e+E(i,3)*h;var n=a+2*i*(c-a)+i*i*(f-2*c+a),r=b+2*i*(d-b)+i*i*(e-2*d+b),q=c+2*i*(f-c)+i*i*(g-2*f+c),k=d+2*i*(e-d)+i*i*(h-2*e+d);a=(1-i)*a+i*c;b=(1-i)*b+i*d;f=(1-i)*f+i*g;e=(1-i)*e+i*h;h=90-v.atan((n-q)/(r-k))*180/v.PI;(n>q||r<k)&&(h+=180);return{x:m,y:j,
m:{x:n,y:r},n:{x:q,y:k},start:{x:a,y:b},end:{x:f,y:e},alpha:h}};var xa=Z(function(a){if(!a)return{x:0,y:0,width:0,height:0};a=wa(a);for(var b=0,c=0,d=[],f=[],e,g=0,h=a[o];g<h;g++){e=a[g];if(e[0]=="M"){b=e[1];c=e[2];d[F](b);f[F](c)}else{b=Bb(b,c,e[1],e[2],e[3],e[4],e[5],e[6]);d=d[M](b.min.x,b.max.x);f=f[M](b.min.y,b.max.y);b=e[5];c=e[6]}}a=ba[K](0,d);e=ba[K](0,f);return{x:a,y:e,width:Y[K](0,d)-a,height:Y[K](0,f)-e}});function va(a){var b=[];if(!l.is(a,U)||!l.is(a&&a[0],U))a=l.parsePathString(a);for(var c=
0,d=a[o];c<d;c++){b[c]=[];for(var f=0,e=a[c][o];f<e;f++)b[c][f]=a[c][f]}b[O]=l._path2string;return b}var Ha=Z(function(a){if(!l.is(a,U)||!l.is(a&&a[0],U))a=l.parsePathString(a);var b=[],c=0,d=0,f=0,e=0,g=0;if(a[0][0]=="M"){c=a[0][1];d=a[0][2];f=c;e=d;g++;b[F](["M",c,d])}g=g;for(var h=a[o];g<h;g++){var i=b[g]=[],j=a[g];if(j[0]!=fa.call(j[0])){i[0]=fa.call(j[0]);switch(i[0]){case "a":i[1]=j[1];i[2]=j[2];i[3]=j[3];i[4]=j[4];i[5]=j[5];i[6]=+(j[6]-c).toFixed(3);i[7]=+(j[7]-d).toFixed(3);break;case "v":i[1]=
+(j[1]-d).toFixed(3);break;case "m":f=j[1];e=j[2];default:for(var m=1,n=j[o];m<n;m++)i[m]=+(j[m]-(m%2?c:d)).toFixed(3)}}else{b[g]=[];if(j[0]=="m"){f=j[1]+c;e=j[2]+d}i=0;for(m=j[o];i<m;i++)b[g][i]=j[i]}j=b[g][o];switch(b[g][0]){case "z":c=f;d=e;break;case "h":c+=+b[g][j-1];break;case "v":d+=+b[g][j-1];break;default:c+=+b[g][j-2];d+=+b[g][j-1]}}b[O]=l._path2string;return b},0,va),oa=Z(function(a){if(!l.is(a,U)||!l.is(a&&a[0],U))a=l.parsePathString(a);var b=[],c=0,d=0,f=0,e=0,g=0;if(a[0][0]=="M"){c=
+a[0][1];d=+a[0][2];f=c;e=d;g++;b[0]=["M",c,d]}g=g;for(var h=a[o];g<h;g++){var i=b[g]=[],j=a[g];if(j[0]!=sa.call(j[0])){i[0]=sa.call(j[0]);switch(i[0]){case "A":i[1]=j[1];i[2]=j[2];i[3]=j[3];i[4]=j[4];i[5]=j[5];i[6]=+(j[6]+c);i[7]=+(j[7]+d);break;case "V":i[1]=+j[1]+d;break;case "H":i[1]=+j[1]+c;break;case "M":f=+j[1]+c;e=+j[2]+d;default:for(var m=1,n=j[o];m<n;m++)i[m]=+j[m]+(m%2?c:d)}}else{m=0;for(n=j[o];m<n;m++)b[g][m]=j[m]}switch(i[0]){case "Z":c=f;d=e;break;case "H":c=i[1];break;case "V":d=i[1];
break;case "M":f=b[g][b[g][o]-2];e=b[g][b[g][o]-1];default:c=b[g][b[g][o]-2];d=b[g][b[g][o]-1]}}b[O]=l._path2string;return b},null,va);function ya(a,b,c,d){return[a,b,c,d,c,d]}function Ua(a,b,c,d,f,e){var g=1/3,h=2/3;return[g*a+h*c,g*b+h*d,g*f+h*c,g*e+h*d,f,e]}function Va(a,b,c,d,f,e,g,h,i,j){var m=v.PI,n=m*120/180,r=m/180*(+f||0),q=[],k,t=Z(function(J,ia,za){var Cb=J*v.cos(za)-ia*v.sin(za);J=J*v.sin(za)+ia*v.cos(za);return{x:Cb,y:J}});if(j){w=j[0];k=j[1];e=j[2];B=j[3]}else{k=t(a,b,-r);a=k.x;b=k.y;
k=t(h,i,-r);h=k.x;i=k.y;v.cos(m/180*f);v.sin(m/180*f);k=(a-h)/2;w=(b-i)/2;B=k*k/(c*c)+w*w/(d*d);if(B>1){B=v.sqrt(B);c=B*c;d=B*d}B=c*c;var L=d*d;B=(e==g?-1:1)*v.sqrt(v.abs((B*L-B*w*w-L*k*k)/(B*w*w+L*k*k)));e=B*c*w/d+(a+h)/2;var B=B*-d*k/c+(b+i)/2,w=v.asin(((b-B)/d).toFixed(7));k=v.asin(((i-B)/d).toFixed(7));w=a<e?m-w:w;k=h<e?m-k:k;w<0&&(w=m*2+w);k<0&&(k=m*2+k);if(g&&w>k)w-=m*2;if(!g&&k>w)k-=m*2}m=k-w;if(v.abs(m)>n){q=k;m=h;L=i;k=w+n*(g&&k>w?1:-1);h=e+c*v.cos(k);i=B+d*v.sin(k);q=Va(h,i,c,d,f,0,g,m,
L,[k,q,e,B])}m=k-w;f=v.cos(w);e=v.sin(w);g=v.cos(k);k=v.sin(k);m=v.tan(m/4);c=4/3*c*m;m=4/3*d*m;d=[a,b];a=[a+c*e,b-m*f];b=[h+c*k,i-m*g];h=[h,i];a[0]=2*d[0]-a[0];a[1]=2*d[1]-a[1];if(j)return[a,b,h][M](q);else{q=[a,b,h][M](q)[R]()[G](",");j=[];h=0;for(i=q[o];h<i;h++)j[h]=h%2?t(q[h-1],q[h],r).y:t(q[h],q[h+1],r).x;return j}}function la(a,b,c,d,f,e,g,h,i){var j=1-i;return{x:E(j,3)*a+E(j,2)*3*i*c+j*3*i*i*f+E(i,3)*g,y:E(j,3)*b+E(j,2)*3*i*d+j*3*i*i*e+E(i,3)*h}}var Bb=Z(function(a,b,c,d,f,e,g,h){var i=f-2*
c+a-(g-2*f+c),j=2*(c-a)-2*(f-c),m=a-c,n=(-j+v.sqrt(j*j-4*i*m))/2/i;i=(-j-v.sqrt(j*j-4*i*m))/2/i;var r=[b,h],q=[a,g];v.abs(n)>1000000000000&&(n=0.5);v.abs(i)>1000000000000&&(i=0.5);if(n>0&&n<1){n=la(a,b,c,d,f,e,g,h,n);q[F](n.x);r[F](n.y)}if(i>0&&i<1){n=la(a,b,c,d,f,e,g,h,i);q[F](n.x);r[F](n.y)}i=e-2*d+b-(h-2*e+d);j=2*(d-b)-2*(e-d);m=b-d;n=(-j+v.sqrt(j*j-4*i*m))/2/i;i=(-j-v.sqrt(j*j-4*i*m))/2/i;v.abs(n)>1000000000000&&(n=0.5);v.abs(i)>1000000000000&&(i=0.5);if(n>0&&n<1){n=la(a,b,c,d,f,e,g,h,n);q[F](n.x);
r[F](n.y)}if(i>0&&i<1){n=la(a,b,c,d,f,e,g,h,i);q[F](n.x);r[F](n.y)}return{min:{x:ba[K](0,q),y:ba[K](0,r)},max:{x:Y[K](0,q),y:Y[K](0,r)}}}),wa=Z(function(a,b){var c=oa(a),d=b&&oa(b);a={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null};b={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null};function f(q,k){var t;if(!q)return["C",k.x,k.y,k.x,k.y,k.x,k.y];!(q[0]in{T:1,Q:1})&&(k.qx=k.qy=null);switch(q[0]){case "M":k.X=q[1];k.Y=q[2];break;case "A":q=["C"][M](Va[K](0,[k.x,k.y][M](q.slice(1))));break;case "S":t=k.x+(k.x-
(k.bx||k.x));k=k.y+(k.y-(k.by||k.y));q=["C",t,k][M](q.slice(1));break;case "T":k.qx=k.x+(k.x-(k.qx||k.x));k.qy=k.y+(k.y-(k.qy||k.y));q=["C"][M](Ua(k.x,k.y,k.qx,k.qy,q[1],q[2]));break;case "Q":k.qx=q[1];k.qy=q[2];q=["C"][M](Ua(k.x,k.y,q[1],q[2],q[3],q[4]));break;case "L":q=["C"][M](ya(k.x,k.y,q[1],q[2]));break;case "H":q=["C"][M](ya(k.x,k.y,q[1],k.y));break;case "V":q=["C"][M](ya(k.x,k.y,k.x,q[1]));break;case "Z":q=["C"][M](ya(k.x,k.y,k.X,k.Y));break}return q}function e(q,k){if(q[k][o]>7){q[k].shift();
for(var t=q[k];t[o];)q.splice(k++,0,["C"][M](t.splice(0,6)));q.splice(k,1);i=Y(c[o],d&&d[o]||0)}}function g(q,k,t,L,B){if(q&&k&&q[B][0]=="M"&&k[B][0]!="M"){k.splice(B,0,["M",L.x,L.y]);t.bx=0;t.by=0;t.x=q[B][1];t.y=q[B][2];i=Y(c[o],d&&d[o]||0)}}for(var h=0,i=Y(c[o],d&&d[o]||0);h<i;h++){c[h]=f(c[h],a);e(c,h);d&&(d[h]=f(d[h],b));d&&e(d,h);g(c,d,a,b,h);g(d,c,b,a,h);var j=c[h],m=d&&d[h],n=j[o],r=d&&m[o];a.x=j[n-2];a.y=j[n-1];a.bx=y(j[n-4])||a.x;a.by=y(j[n-3])||a.y;b.bx=d&&(y(m[r-4])||b.x);b.by=d&&(y(m[r-
3])||b.y);b.x=d&&m[r-2];b.y=d&&m[r-1]}return d?[c,d]:c},null,va),Wa=Z(function(a){for(var b=[],c=0,d=a[o];c<d;c++){var f={},e=a[c].match(/^([^:]*):?([\d\.]*)/);f.color=l.getRGB(e[1]);if(f.color.error)return null;f.color=f.color.hex;e[2]&&(f.offset=e[2]+"%");b[F](f)}c=1;for(d=b[o]-1;c<d;c++)if(!b[c].offset){a=y(b[c-1].offset||0);e=0;for(f=c+1;f<d;f++)if(b[f].offset){e=b[f].offset;break}if(!e){e=100;f=d}e=y(e);for(e=(e-a)/(f-c+1);c<f;c++){a+=e;b[c].offset=a+"%"}}return b});function Xa(a,b,c,d){if(l.is(a,
ga)||l.is(a,"object")){a=l.is(a,ga)?C.getElementById(a):a;if(a.tagName)return b==null?{container:a,width:a.style.pixelWidth||a.offsetWidth,height:a.style.pixelHeight||a.offsetHeight}:{container:a,width:b,height:c}}else return{container:1,x:a,y:b,width:c,height:d}}function Ia(a,b){var c=this;for(var d in b)if(b[z](d)&&!(d in a))switch(typeof b[d]){case "function":(function(f){a[d]=a===c?f:function(){return f[K](c,arguments)}})(b[d]);break;case "object":a[d]=a[d]||{};Ia.call(this,a[d],b[d]);break;default:a[d]=
b[d];break}}function ma(a,b){a==b.top&&(b.top=a.prev);a==b.bottom&&(b.bottom=a.next);a.next&&(a.next.prev=a.prev);a.prev&&(a.prev.next=a.next)}function Ya(a,b){if(b.top!==a){ma(a,b);a.next=null;a.prev=b.top;b.top.next=a;b.top=a}}function Za(a,b){if(b.bottom!==a){ma(a,b);a.next=b.bottom;a.prev=null;b.bottom.prev=a;b.bottom=a}}function $a(a,b,c){ma(a,c);b==c.top&&(c.top=a);b.next&&(b.next.prev=a);a.next=b.next;a.prev=b;b.next=a}function ab(a,b,c){ma(a,c);b==c.bottom&&(c.bottom=a);b.prev&&(b.prev.next=
a);a.prev=b.prev;b.prev=a;a.next=b}function bb(a){return function(){throw new Error("Rapha\u00ebl: you are calling to method \u201c"+a+"\u201d of removed object");}}var cb=/^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/;l.pathToRelative=Ha;if(l.svg){H[p].svgns="http://www.w3.org/2000/svg";H[p].xlink="http://www.w3.org/1999/xlink";Q=function(a){return+a+(~~a===a)*0.5};var u=function(a,b){if(b)for(var c in b)b[z](c)&&a[W](c,D(b[c]));else{a=C.createElementNS(H[p].svgns,a);a.style.webkitTapHighlightColor="rgba(0,0,0,0)";
return a}};l[O]=function(){return"Your browser supports SVG.\nYou are running Rapha\u00ebl "+this.version};var db=function(a,b){var c=u("path");b.canvas&&b.canvas[x](c);b=new s(c,b);b.type="path";ea(b,{fill:"none",stroke:"#000",path:a});return b},pa=function(a,b,c){var d="linear",f=0.5,e=0.5,g=a.style;b=D(b)[I](cb,function(m,n,r){d="radial";if(n&&r){f=y(n);e=y(r);m=(e>0.5)*2-1;E(f-0.5,2)+E(e-0.5,2)>0.25&&(e=v.sqrt(0.25-E(f-0.5,2))*m+0.5)&&e!=0.5&&(e=e.toFixed(5)-1.0E-5*m)}return A});b=b[G](/\s*\-\s*/);
if(d=="linear"){var h=b.shift();h=-y(h);if(isNaN(h))return null;h=[0,0,v.cos(h*v.PI/180),v.sin(h*v.PI/180)];var i=1/(Y(v.abs(h[2]),v.abs(h[3]))||1);h[2]*=i;h[3]*=i;if(h[2]<0){h[0]=-h[2];h[2]=0}if(h[3]<0){h[1]=-h[3];h[3]=0}}b=Wa(b);if(!b)return null;i=a.getAttribute(ca);(i=i.match(/^url\(#(.*)\)$/))&&c.defs.removeChild(C.getElementById(i[1]));i=u(d+"Gradient");i.id="r"+(l._id++)[O](36);u(i,d=="radial"?{fx:f,fy:e}:{x1:h[0],y1:h[1],x2:h[2],y2:h[3]});c.defs[x](i);c=0;for(h=b[o];c<h;c++){var j=u("stop");
u(j,{offset:b[c].offset?b[c].offset:!c?"0%":"100%","stop-color":b[c].color||"#fff"});i[x](j)}u(a,{fill:"url(#"+i.id+")",opacity:1,"fill-opacity":1});g.fill=A;g.opacity=1;return g.fillOpacity=1},Ja=function(a){var b=a.getBBox();u(a.pattern,{patternTransform:l.format("translate({0},{1})",b.x,b.y)})},ea=function(a,b){var c={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},d=a.node,f=a.attrs,e=
a.rotate();function g(k,t){if(t=c[fa.call(t)]){var L=k.attrs["stroke-width"]||"1";k={round:L,square:L,butt:0}[k.attrs["stroke-linecap"]||b["stroke-linecap"]]||0;for(var B=[],w=t[o];w--;)B[w]=t[w]*L+(w%2?1:-1)*k;u(d,{"stroke-dasharray":B[R](",")})}}b[z]("rotation")&&(e=b.rotation);var h=D(e)[G](V);if(h.length-1){h[1]=+h[1];h[2]=+h[2]}else h=null;y(e)&&a.rotate(0,true);for(var i in b)if(b[z](i))if(ta[z](i)){var j=b[i];f[i]=j;switch(i){case "blur":a.blur(j);break;case "rotation":a.rotate(j,true);break;
case "href":case "title":case "target":var m=d.parentNode;if(fa.call(m.tagName)!="a"){var n=u("a");m.insertBefore(n,d);n[x](d);m=n}m.setAttributeNS(a.paper.xlink,i,j);break;case "cursor":d.style.cursor=j;break;case "clip-rect":m=D(j)[G](V);if(m[o]==4){a.clip&&a.clip.parentNode.parentNode.removeChild(a.clip.parentNode);var r=u("clipPath");n=u("rect");r.id="r"+(l._id++)[O](36);u(n,{x:m[0],y:m[1],width:m[2],height:m[3]});r[x](n);a.paper.defs[x](r);u(d,{"clip-path":"url(#"+r.id+")"});a.clip=n}if(!j){(j=
C.getElementById(d.getAttribute("clip-path")[I](/(^url\(#|\)$)/g,A)))&&j.parentNode.removeChild(j);u(d,{"clip-path":A});delete a.clip}break;case "path":if(a.type=="path")u(d,{d:j?(f.path=oa(j)):"M0,0"});break;case "width":d[W](i,j);if(f.fx){i="x";j=f.x}else break;case "x":if(f.fx)j=-f.x-(f.width||0);case "rx":if(i=="rx"&&a.type=="rect")break;case "cx":h&&(i=="x"||i=="cx")&&(h[1]+=j-f[i]);d[W](i,j);a.pattern&&Ja(a);break;case "height":d[W](i,j);if(f.fy){i="y";j=f.y}else break;case "y":if(f.fy)j=-f.y-
(f.height||0);case "ry":if(i=="ry"&&a.type=="rect")break;case "cy":h&&(i=="y"||i=="cy")&&(h[2]+=j-f[i]);d[W](i,j);a.pattern&&Ja(a);break;case "r":a.type=="rect"?u(d,{rx:j,ry:j}):d[W](i,j);break;case "src":a.type=="image"&&d.setAttributeNS(a.paper.xlink,"href",j);break;case "stroke-width":d.style.strokeWidth=j;d[W](i,j);f["stroke-dasharray"]&&g(a,f["stroke-dasharray"]);break;case "stroke-dasharray":g(a,j);break;case "translation":j=D(j)[G](V);j[0]=+j[0]||0;j[1]=+j[1]||0;if(h){h[1]+=j[0];h[2]+=j[1]}Aa.call(a,
j[0],j[1]);break;case "scale":j=D(j)[G](V);a.scale(+j[0]||1,+j[1]||+j[0]||1,isNaN(y(j[2]))?null:+j[2],isNaN(y(j[3]))?null:+j[3]);break;case ca:if(m=D(j).match(Sa)){r=u("pattern");var q=u("image");r.id="r"+(l._id++)[O](36);u(r,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1});u(q,{x:0,y:0});q.setAttributeNS(a.paper.xlink,"href",m[1]);r[x](q);j=C.createElement("img");j.style.cssText="position:absolute;left:-9999em;top-9999em";j.onload=function(){u(r,{width:this.offsetWidth,height:this.offsetHeight});
u(q,{width:this.offsetWidth,height:this.offsetHeight});C.body.removeChild(this);a.paper.safari()};C.body[x](j);j.src=m[1];a.paper.defs[x](r);d.style.fill="url(#"+r.id+")";u(d,{fill:"url(#"+r.id+")"});a.pattern=r;a.pattern&&Ja(a);break}m=l.getRGB(j);if(m.error){if(({circle:1,ellipse:1}[z](a.type)||D(j).charAt()!="r")&&pa(d,j,a.paper)){f.gradient=j;f.fill="none";break}}else{delete b.gradient;delete f.gradient;!l.is(f.opacity,"undefined")&&l.is(b.opacity,"undefined")&&u(d,{opacity:f.opacity});!l.is(f["fill-opacity"],
"undefined")&&l.is(b["fill-opacity"],"undefined")&&u(d,{"fill-opacity":f["fill-opacity"]})}m[z]("o")&&u(d,{"fill-opacity":m.o>1?m.o/100:m.o});case "stroke":m=l.getRGB(j);d[W](i,m.hex);i=="stroke"&&m[z]("o")&&u(d,{"stroke-opacity":m.o>1?m.o/100:m.o});break;case "gradient":(({circle:1,ellipse:1})[z](a.type)||D(j).charAt()!="r")&&pa(d,j,a.paper);break;case "opacity":case "fill-opacity":if(f.gradient){if(m=C.getElementById(d.getAttribute(ca)[I](/^url\(#|\)$/g,A))){m=m.getElementsByTagName("stop");m[m[o]-
1][W]("stop-opacity",j)}break}default:i=="font-size"&&(j=ha(j,10)+"px");m=i[I](/(\-.)/g,function(k){return sa.call(k.substring(1))});d.style[m]=j;d[W](i,j);break}}Db(a,b);if(h)a.rotate(h.join(N));else y(e)&&a.rotate(e,true)},eb=1.2,Db=function(a,b){if(!(a.type!="text"||!(b[z]("text")||b[z]("font")||b[z]("font-size")||b[z]("x")||b[z]("y")))){var c=a.attrs,d=a.node,f=d.firstChild?ha(C.defaultView.getComputedStyle(d.firstChild,A).getPropertyValue("font-size"),10):10;if(b[z]("text")){for(c.text=b.text;d.firstChild;)d.removeChild(d.firstChild);
b=D(b.text)[G]("\n");for(var e=0,g=b[o];e<g;e++)if(b[e]){var h=u("tspan");e&&u(h,{dy:f*eb,x:c.x});h[x](C.createTextNode(b[e]));d[x](h)}}else{b=d.getElementsByTagName("tspan");e=0;for(g=b[o];e<g;e++)e&&u(b[e],{dy:f*eb,x:c.x})}u(d,{y:c.y});a=a.getBBox();(a=c.y-(a.y+a.height/2))&&isFinite(a)&&u(d,{y:c.y+a})}},s=function(a,b){this[0]=a;this.id=l._oid++;this.node=a;a.raphael=this;this.paper=b;this.attrs=this.attrs||{};this.transformations=[];this._={tx:0,ty:0,rt:{deg:0,cx:0,cy:0},sx:1,sy:1};!b.bottom&&
(b.bottom=this);(this.prev=b.top)&&(b.top.next=this);b.top=this;this.next=null};s[p].rotate=function(a,b,c){if(this.removed)return this;if(a==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][R](N);return this._.rt.deg}var d=this.getBBox();a=D(a)[G](V);if(a[o]-1){b=y(a[1]);c=y(a[2])}a=y(a[0]);if(b!=null)this._.rt.deg=a;else this._.rt.deg+=a;c==null&&(b=null);this._.rt.cx=b;this._.rt.cy=c;b=b==null?d.x+d.width/2:b;c=c==null?d.y+d.height/2:c;if(this._.rt.deg){this.transformations[0]=
l.format("rotate({0} {1} {2})",this._.rt.deg,b,c);this.clip&&u(this.clip,{transform:l.format("rotate({0} {1} {2})",-this._.rt.deg,b,c)})}else{this.transformations[0]=A;this.clip&&u(this.clip,{transform:A})}u(this.node,{transform:this.transformations[R](N)});return this};s[p].hide=function(){!this.removed&&(this.node.style.display="none");return this};s[p].show=function(){!this.removed&&(this.node.style.display="");return this};s[p].remove=function(){if(!this.removed){ma(this,this.paper);this.node.parentNode.removeChild(this.node);
for(var a in this)delete this[a];this.removed=true}};s[p].getBBox=function(){if(this.removed)return this;if(this.type=="path")return xa(this.attrs.path);if(this.node.style.display=="none"){this.show();var a=true}var b={};try{b=this.node.getBBox()}catch(c){}finally{b=b||{}}if(this.type=="text"){b={x:b.x,y:Infinity,width:0,height:0};for(var d=0,f=this.node.getNumberOfChars();d<f;d++){var e=this.node.getExtentOfChar(d);e.y<b.y&&(b.y=e.y);e.y+e.height-b.y>b.height&&(b.height=e.y+e.height-b.y);e.x+e.width-
b.x>b.width&&(b.width=e.x+e.width-b.x)}}a&&this.hide();return b};s[p].attr=function(a,b){if(this.removed)return this;if(a==null){a={};for(var c in this.attrs)if(this.attrs[z](c))a[c]=this.attrs[c];this._.rt.deg&&(a.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(a.scale=this.scale());a.gradient&&a.fill=="none"&&(a.fill=a.gradient)&&delete a.gradient;return a}if(b==null&&l.is(a,ga)){if(a=="translation")return Aa.call(this);if(a=="rotation")return this.rotate();if(a=="scale")return this.scale();
if(a==ca&&this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[a]}if(b==null&&l.is(a,U)){b={};c=0;for(var d=a.length;c<d;c++)b[a[c]]=this.attr(a[c]);return b}if(b!=null){c={};c[a]=b;ea(this,c)}else a!=null&&l.is(a,"object")&&ea(this,a);return this};s[p].toFront=function(){if(this.removed)return this;this.node.parentNode[x](this.node);var a=this.paper;a.top!=this&&Ya(this,a);return this};s[p].toBack=function(){if(this.removed)return this;if(this.node.parentNode.firstChild!=
this.node){this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild);Za(this,this.paper)}return this};s[p].insertAfter=function(a){if(this.removed)return this;var b=a.node||a[a.length].node;b.nextSibling?b.parentNode.insertBefore(this.node,b.nextSibling):b.parentNode[x](this.node);$a(this,a,this.paper);return this};s[p].insertBefore=function(a){if(this.removed)return this;var b=a.node||a[0].node;b.parentNode.insertBefore(this.node,b);ab(this,a,this.paper);return this};s[p].blur=
function(a){var b=this;if(+a!==0){var c=u("filter"),d=u("feGaussianBlur");b.attrs.blur=a;c.id="r"+(l._id++)[O](36);u(d,{stdDeviation:+a||1.5});c.appendChild(d);b.paper.defs.appendChild(c);b._blur=c;u(b.node,{filter:"url(#"+c.id+")"})}else{if(b._blur){b._blur.parentNode.removeChild(b._blur);delete b._blur;delete b.attrs.blur}b.node.removeAttribute("filter")}};var fb=function(a,b,c,d){var f=u("circle");a.canvas&&a.canvas[x](f);a=new s(f,a);a.attrs={cx:b,cy:c,r:d,fill:"none",stroke:"#000"};a.type="circle";
u(f,a.attrs);return a},gb=function(a,b,c,d,f,e){var g=u("rect");a.canvas&&a.canvas[x](g);a=new s(g,a);a.attrs={x:b,y:c,width:d,height:f,r:e||0,rx:e||0,ry:e||0,fill:"none",stroke:"#000"};a.type="rect";u(g,a.attrs);return a},hb=function(a,b,c,d,f){var e=u("ellipse");a.canvas&&a.canvas[x](e);a=new s(e,a);a.attrs={cx:b,cy:c,rx:d,ry:f,fill:"none",stroke:"#000"};a.type="ellipse";u(e,a.attrs);return a},ib=function(a,b,c,d,f,e){var g=u("image");u(g,{x:c,y:d,width:f,height:e,preserveAspectRatio:"none"});g.setAttributeNS(a.xlink,
"href",b);a.canvas&&a.canvas[x](g);a=new s(g,a);a.attrs={x:c,y:d,width:f,height:e,src:b};a.type="image";return a},jb=function(a,b,c,d){var f=u("text");u(f,{x:b,y:c,"text-anchor":"middle"});a.canvas&&a.canvas[x](f);a=new s(f,a);a.attrs={x:b,y:c,"text-anchor":"middle",text:d,font:ta.font,stroke:"none",fill:"#000"};a.type="text";ea(a,a.attrs);return a},kb=function(a,b){this.width=a||this.width;this.height=b||this.height;this.canvas[W]("width",this.width);this.canvas[W]("height",this.height);return this},
Ca=function(){var a=Xa[K](0,arguments),b=a&&a.container,c=a.x,d=a.y,f=a.width;a=a.height;if(!b)throw new Error("SVG container not found.");var e=u("svg");c=c||0;d=d||0;f=f||512;a=a||342;u(e,{xmlns:"http://www.w3.org/2000/svg",version:1.1,width:f,height:a});if(b==1){e.style.cssText="position:absolute;left:"+c+"px;top:"+d+"px";C.body[x](e)}else b.firstChild?b.insertBefore(e,b.firstChild):b[x](e);b=new H;b.width=f;b.height=a;b.canvas=e;Ia.call(b,b,l.fn);b.clear();return b};H[p].clear=function(){for(var a=
this.canvas;a.firstChild;)a.removeChild(a.firstChild);this.bottom=this.top=null;(this.desc=u("desc"))[x](C.createTextNode("Created with Rapha\u00ebl"));a[x](this.desc);a[x](this.defs=u("defs"))};H[p].remove=function(){this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bb(a)}}if(l.vml){var lb={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},Eb=/([clmz]),?([^clmz]*)/gi,Fb=/-?[^,\s-]+/g,qa=1000+N+1000,na=10,ra={path:1,rect:1},Gb=function(a){var b=/[ahqstv]/ig,
c=oa;D(a).match(b)&&(c=wa);b=/[clmz]/g;if(c==oa&&!D(a).match(b))return a=D(a)[I](Eb,function(i,j,m){var n=[],r=fa.call(j)=="m",q=lb[j];m[I](Fb,function(k){if(r&&n[o]==2){q+=n+lb[j=="m"?"l":"L"];n=[]}n[F](Q(k*na))});return q+n});b=c(a);var d;a=[];for(var f=0,e=b[o];f<e;f++){c=b[f];d=fa.call(b[f][0]);d=="z"&&(d="x");for(var g=1,h=c[o];g<h;g++)d+=Q(c[g]*na)+(g!=h-1?",":A);a[F](d)}return a[R](N)};l[O]=function(){return"Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\u00ebl "+
this.version};db=function(a,b){var c=S("group");c.style.cssText="position:absolute;left:0;top:0;width:"+b.width+"px;height:"+b.height+"px";c.coordsize=b.coordsize;c.coordorigin=b.coordorigin;var d=S("shape"),f=d.style;f.width=b.width+"px";f.height=b.height+"px";d.coordsize=qa;d.coordorigin=b.coordorigin;c[x](d);d=new s(d,c,b);f={fill:"none",stroke:"#000"};a&&(f.path=a);d.isAbsolute=true;d.type="path";d.path=[];d.Path=A;ea(d,f);b.canvas[x](c);return d};ea=function(a,b){a.attrs=a.attrs||{};var c=a.node,
d=a.attrs,f=c.style,e;e=(b.x!=d.x||b.y!=d.y||b.width!=d.width||b.height!=d.height||b.r!=d.r)&&a.type=="rect";var g=a;for(var h in b)if(b[z](h))d[h]=b[h];if(e){d.path=mb(d.x,d.y,d.width,d.height,d.r);a.X=d.x;a.Y=d.y;a.W=d.width;a.H=d.height}b.href&&(c.href=b.href);b.title&&(c.title=b.title);b.target&&(c.target=b.target);b.cursor&&(f.cursor=b.cursor);"blur"in b&&a.blur(b.blur);if(b.path&&a.type=="path"||e)c.path=Gb(d.path);b.rotation!=null&&a.rotate(b.rotation,true);if(b.translation){e=D(b.translation)[G](V);
Aa.call(a,e[0],e[1]);if(a._.rt.cx!=null){a._.rt.cx+=+e[0];a._.rt.cy+=+e[1];a.setBox(a.attrs,e[0],e[1])}}if(b.scale){e=D(b.scale)[G](V);a.scale(+e[0]||1,+e[1]||+e[0]||1,+e[2]||null,+e[3]||null)}if("clip-rect"in b){e=D(b["clip-rect"])[G](V);if(e[o]==4){e[2]=+e[2]+ +e[0];e[3]=+e[3]+ +e[1];h=c.clipRect||C.createElement("div");var i=h.style,j=c.parentNode;i.clip=l.format("rect({1}px {2}px {3}px {0}px)",e);if(!c.clipRect){i.position="absolute";i.top=0;i.left=0;i.width=a.paper.width+"px";i.height=a.paper.height+
"px";j.parentNode.insertBefore(h,j);h[x](j);c.clipRect=h}}if(!b["clip-rect"])c.clipRect&&(c.clipRect.style.clip=A)}if(a.type=="image"&&b.src)c.src=b.src;if(a.type=="image"&&b.opacity){c.filterOpacity=Fa+".Alpha(opacity="+b.opacity*100+")";f.filter=(c.filterMatrix||A)+(c.filterOpacity||A)}b.font&&(f.font=b.font);b["font-family"]&&(f.fontFamily='"'+b["font-family"][G](",")[0][I](/^['"]+|['"]+$/g,A)+'"');b["font-size"]&&(f.fontSize=b["font-size"]);b["font-weight"]&&(f.fontWeight=b["font-weight"]);b["font-style"]&&
(f.fontStyle=b["font-style"]);if(b.opacity!=null||b["stroke-width"]!=null||b.fill!=null||b.stroke!=null||b["stroke-width"]!=null||b["stroke-opacity"]!=null||b["fill-opacity"]!=null||b["stroke-dasharray"]!=null||b["stroke-miterlimit"]!=null||b["stroke-linejoin"]!=null||b["stroke-linecap"]!=null){c=a.shape||c;f=c.getElementsByTagName(ca)&&c.getElementsByTagName(ca)[0];e=false;!f&&(e=f=S(ca));if("fill-opacity"in b||"opacity"in b){a=((+d["fill-opacity"]+1||2)-1)*((+d.opacity+1||2)-1)*((+l.getRGB(b.fill).o+
1||2)-1);a<0&&(a=0);a>1&&(a=1);f.opacity=a}b.fill&&(f.on=true);if(f.on==null||b.fill=="none")f.on=false;if(f.on&&b.fill)if(a=b.fill.match(Sa)){f.src=a[1];f.type="tile"}else{f.color=l.getRGB(b.fill).hex;f.src=A;f.type="solid";if(l.getRGB(b.fill).error&&(g.type in{circle:1,ellipse:1}||D(b.fill).charAt()!="r")&&pa(g,b.fill)){d.fill="none";d.gradient=b.fill}}e&&c[x](f);f=c.getElementsByTagName("stroke")&&c.getElementsByTagName("stroke")[0];e=false;!f&&(e=f=S("stroke"));if(b.stroke&&b.stroke!="none"||
b["stroke-width"]||b["stroke-opacity"]!=null||b["stroke-dasharray"]||b["stroke-miterlimit"]||b["stroke-linejoin"]||b["stroke-linecap"])f.on=true;(b.stroke=="none"||f.on==null||b.stroke==0||b["stroke-width"]==0)&&(f.on=false);a=l.getRGB(b.stroke);f.on&&b.stroke&&(f.color=a.hex);a=((+d["stroke-opacity"]+1||2)-1)*((+d.opacity+1||2)-1)*((+a.o+1||2)-1);h=(y(b["stroke-width"])||1)*0.75;a<0&&(a=0);a>1&&(a=1);b["stroke-width"]==null&&(h=d["stroke-width"]);b["stroke-width"]&&(f.weight=h);h&&h<1&&(a*=h)&&(f.weight=
1);f.opacity=a;b["stroke-linejoin"]&&(f.joinstyle=b["stroke-linejoin"]||"miter");f.miterlimit=b["stroke-miterlimit"]||8;b["stroke-linecap"]&&(f.endcap=b["stroke-linecap"]=="butt"?"flat":b["stroke-linecap"]=="square"?"square":"round");if(b["stroke-dasharray"]){a={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};f.dashstyle=a[z](b["stroke-dasharray"])?a[b["stroke-dasharray"]]:
A}e&&c[x](f)}if(g.type=="text"){f=g.paper.span.style;d.font&&(f.font=d.font);d["font-family"]&&(f.fontFamily=d["font-family"]);d["font-size"]&&(f.fontSize=d["font-size"]);d["font-weight"]&&(f.fontWeight=d["font-weight"]);d["font-style"]&&(f.fontStyle=d["font-style"]);g.node.string&&(g.paper.span.innerHTML=D(g.node.string)[I](/</g,"&#60;")[I](/&/g,"&#38;")[I](/\n/g,"<br>"));g.W=d.w=g.paper.span.offsetWidth;g.H=d.h=g.paper.span.offsetHeight;g.X=d.x;g.Y=d.y+Q(g.H/2);switch(d["text-anchor"]){case "start":g.node.style["v-text-align"]=
"left";g.bbx=Q(g.W/2);break;case "end":g.node.style["v-text-align"]="right";g.bbx=-Q(g.W/2);break;default:g.node.style["v-text-align"]="center";break}}};pa=function(a,b){a.attrs=a.attrs||{};var c="linear",d=".5 .5";a.attrs.gradient=b;b=D(b)[I](cb,function(i,j,m){c="radial";if(j&&m){j=y(j);m=y(m);E(j-0.5,2)+E(m-0.5,2)>0.25&&(m=v.sqrt(0.25-E(j-0.5,2))*((m>0.5)*2-1)+0.5);d=j+N+m}return A});b=b[G](/\s*\-\s*/);if(c=="linear"){var f=b.shift();f=-y(f);if(isNaN(f))return null}var e=Wa(b);if(!e)return null;
a=a.shape||a.node;b=a.getElementsByTagName(ca)[0]||S(ca);!b.parentNode&&a.appendChild(b);if(e[o]){b.on=true;b.method="none";b.color=e[0].color;b.color2=e[e[o]-1].color;a=[];for(var g=0,h=e[o];g<h;g++)e[g].offset&&a[F](e[g].offset+N+e[g].color);b.colors&&(b.colors.value=a[o]?a[R]():"0% "+b.color);if(c=="radial"){b.type="gradientradial";b.focus="100%";b.focussize=d;b.focusposition=d}else{b.type="gradient";b.angle=(270-f)%360}}return 1};s=function(a,b,c){this[0]=a;this.id=l._oid++;this.node=a;a.raphael=
this;this.Y=this.X=0;this.attrs={};this.Group=b;this.paper=c;this._={tx:0,ty:0,rt:{deg:0},sx:1,sy:1};!c.bottom&&(c.bottom=this);(this.prev=c.top)&&(c.top.next=this);c.top=this;this.next=null};s[p].rotate=function(a,b,c){if(this.removed)return this;if(a==null){if(this._.rt.cx)return[this._.rt.deg,this._.rt.cx,this._.rt.cy][R](N);return this._.rt.deg}a=D(a)[G](V);if(a[o]-1){b=y(a[1]);c=y(a[2])}a=y(a[0]);if(b!=null)this._.rt.deg=a;else this._.rt.deg+=a;c==null&&(b=null);this._.rt.cx=b;this._.rt.cy=c;
this.setBox(this.attrs,b,c);this.Group.style.rotation=this._.rt.deg;return this};s[p].setBox=function(a,b,c){if(this.removed)return this;var d=this.Group.style,f=this.shape&&this.shape.style||this.node.style;a=a||{};for(var e in a)if(a[z](e))this.attrs[e]=a[e];b=b||this._.rt.cx;c=c||this._.rt.cy;var g=this.attrs,h;switch(this.type){case "circle":a=g.cx-g.r;e=g.cy-g.r;h=g=g.r*2;break;case "ellipse":a=g.cx-g.rx;e=g.cy-g.ry;h=g.rx*2;g=g.ry*2;break;case "image":a=+g.x;e=+g.y;h=g.width||0;g=g.height||
0;break;case "text":this.textpath.v=["m",Q(g.x),", ",Q(g.y-2),"l",Q(g.x)+1,", ",Q(g.y-2)][R](A);a=g.x-Q(this.W/2);e=g.y-this.H/2;h=this.W;g=this.H;break;case "rect":case "path":if(this.attrs.path){g=xa(this.attrs.path);a=g.x;e=g.y;h=g.width;g=g.height}else{e=a=0;h=this.paper.width;g=this.paper.height}break;default:e=a=0;h=this.paper.width;g=this.paper.height;break}b=b==null?a+h/2:b;c=c==null?e+g/2:c;b=b-this.paper.width/2;c=c-this.paper.height/2;var i;d.left!=(i=b+"px")&&(d.left=i);d.top!=(i=c+"px")&&
(d.top=i);this.X=ra[z](this.type)?-b:a;this.Y=ra[z](this.type)?-c:e;this.W=h;this.H=g;if(ra[z](this.type)){f.left!=(i=-b*na+"px")&&(f.left=i);f.top!=(i=-c*na+"px")&&(f.top=i)}else if(this.type=="text"){f.left!=(i=-b+"px")&&(f.left=i);f.top!=(i=-c+"px")&&(f.top=i)}else{d.width!=(i=this.paper.width+"px")&&(d.width=i);d.height!=(i=this.paper.height+"px")&&(d.height=i);f.left!=(i=a-b+"px")&&(f.left=i);f.top!=(i=e-c+"px")&&(f.top=i);f.width!=(i=h+"px")&&(f.width=i);f.height!=(i=g+"px")&&(f.height=i)}};
s[p].hide=function(){!this.removed&&(this.Group.style.display="none");return this};s[p].show=function(){!this.removed&&(this.Group.style.display="block");return this};s[p].getBBox=function(){if(this.removed)return this;if(ra[z](this.type))return xa(this.attrs.path);return{x:this.X+(this.bbx||0),y:this.Y,width:this.W,height:this.H}};s[p].remove=function(){if(!this.removed){ma(this,this.paper);this.node.parentNode.removeChild(this.node);this.Group.parentNode.removeChild(this.Group);this.shape&&this.shape.parentNode.removeChild(this.shape);
for(var a in this)delete this[a];this.removed=true}};s[p].attr=function(a,b){if(this.removed)return this;if(a==null){a={};for(var c in this.attrs)if(this.attrs[z](c))a[c]=this.attrs[c];this._.rt.deg&&(a.rotation=this.rotate());(this._.sx!=1||this._.sy!=1)&&(a.scale=this.scale());a.gradient&&a.fill=="none"&&(a.fill=a.gradient)&&delete a.gradient;return a}if(b==null&&l.is(a,ga)){if(a=="translation")return Aa.call(this);if(a=="rotation")return this.rotate();if(a=="scale")return this.scale();if(a==ca&&
this.attrs.fill=="none"&&this.attrs.gradient)return this.attrs.gradient;return this.attrs[a]}if(this.attrs&&b==null&&l.is(a,U)){var d={};c=0;for(b=a[o];c<b;c++)d[a[c]]=this.attr(a[c]);return d}if(b!=null){d={};d[a]=b}b==null&&l.is(a,"object")&&(d=a);if(d){if(d.text&&this.type=="text")this.node.string=d.text;ea(this,d);if(d.gradient&&({circle:1,ellipse:1}[z](this.type)||D(d.gradient).charAt()!="r"))pa(this,d.gradient);(!ra[z](this.type)||this._.rt.deg)&&this.setBox(this.attrs)}return this};s[p].toFront=
function(){!this.removed&&this.Group.parentNode[x](this.Group);this.paper.top!=this&&Ya(this,this.paper);return this};s[p].toBack=function(){if(this.removed)return this;if(this.Group.parentNode.firstChild!=this.Group){this.Group.parentNode.insertBefore(this.Group,this.Group.parentNode.firstChild);Za(this,this.paper)}return this};s[p].insertAfter=function(a){if(this.removed)return this;if(a.constructor==X)a=a[a.length];a.Group.nextSibling?a.Group.parentNode.insertBefore(this.Group,a.Group.nextSibling):
a.Group.parentNode[x](this.Group);$a(this,a,this.paper);return this};s[p].insertBefore=function(a){if(this.removed)return this;if(a.constructor==X)a=a[0];a.Group.parentNode.insertBefore(this.Group,a.Group);ab(this,a,this.paper);return this};var Hb=/ progid:\S+Blur\([^\)]+\)/g;s[p].blur=function(a){var b=this.node.runtimeStyle,c=b.filter;c=c.replace(Hb,A);if(+a!==0){this.attrs.blur=a;b.filter=c+N+Fa+".Blur(pixelradius="+(+a||1.5)+")";b.margin=l.format("-{0}px 0 0 -{0}px",Q(+a||1.5))}else{b.filter=
c;b.margin=0;delete this.attrs.blur}};fb=function(a,b,c,d){var f=S("group"),e=S("oval");f.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";f.coordsize=qa;f.coordorigin=a.coordorigin;f[x](e);e=new s(e,f,a);e.type="circle";ea(e,{stroke:"#000",fill:"none"});e.attrs.cx=b;e.attrs.cy=c;e.attrs.r=d;e.setBox({x:b-d,y:c-d,width:d*2,height:d*2});a.canvas[x](f);return e};function mb(a,b,c,d,f){return f?l.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z",
a+f,b,c-f*2,f,-f,d-f*2,f*2-c,f*2-d):l.format("M{0},{1}l{2},0,0,{3},{4},0z",a,b,c,d,-c)}gb=function(a,b,c,d,f,e){var g=mb(b,c,d,f,e);a=a.path(g);var h=a.attrs;a.X=h.x=b;a.Y=h.y=c;a.W=h.width=d;a.H=h.height=f;h.r=e;h.path=g;a.type="rect";return a};hb=function(a,b,c,d,f){var e=S("group"),g=S("oval");e.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";e.coordsize=qa;e.coordorigin=a.coordorigin;e[x](g);g=new s(g,e,a);g.type="ellipse";ea(g,{stroke:"#000"});g.attrs.cx=
b;g.attrs.cy=c;g.attrs.rx=d;g.attrs.ry=f;g.setBox({x:b-d,y:c-f,width:d*2,height:f*2});a.canvas[x](e);return g};ib=function(a,b,c,d,f,e){var g=S("group"),h=S("image");g.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";g.coordsize=qa;g.coordorigin=a.coordorigin;h.src=b;g[x](h);h=new s(h,g,a);h.type="image";h.attrs.src=b;h.attrs.x=c;h.attrs.y=d;h.attrs.w=f;h.attrs.h=e;h.setBox({x:c,y:d,width:f,height:e});a.canvas[x](g);return h};jb=function(a,b,c,d){var f=S("group"),
e=S("shape"),g=e.style,h=S("path"),i=S("textpath");f.style.cssText="position:absolute;left:0;top:0;width:"+a.width+"px;height:"+a.height+"px";f.coordsize=qa;f.coordorigin=a.coordorigin;h.v=l.format("m{0},{1}l{2},{1}",Q(b*10),Q(c*10),Q(b*10)+1);h.textpathok=true;g.width=a.width;g.height=a.height;i.string=D(d);i.on=true;e[x](i);e[x](h);f[x](e);g=new s(i,f,a);g.shape=e;g.textpath=h;g.type="text";g.attrs.text=d;g.attrs.x=b;g.attrs.y=c;g.attrs.w=1;g.attrs.h=1;ea(g,{font:ta.font,stroke:"none",fill:"#000"});
g.setBox();a.canvas[x](f);return g};kb=function(a,b){var c=this.canvas.style;a==+a&&(a+="px");b==+b&&(b+="px");c.width=a;c.height=b;c.clip="rect(0 "+a+" "+b+" 0)";return this};var S;C.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!C.namespaces.rvml&&C.namespaces.add("rvml","urn:schemas-microsoft-com:vml");S=function(a){return C.createElement("<rvml:"+a+' class="rvml">')}}catch(Pb){S=function(a){return C.createElement("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}Ca=
function(){var a=Xa[K](0,arguments),b=a.container,c=a.height,d=a.width,f=a.x;a=a.y;if(!b)throw new Error("VML container not found.");var e=new H,g=e.canvas=C.createElement("div"),h=g.style;f=f||0;a=a||0;d=d||512;c=c||342;d==+d&&(d+="px");c==+c&&(c+="px");e.width=1000;e.height=1000;e.coordsize=na*1000+N+na*1000;e.coordorigin="0 0";e.span=C.createElement("span");e.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";g[x](e.span);h.cssText=
l.format("width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",d,c);if(b==1){C.body[x](g);h.left=f+"px";h.top=a+"px";h.position="absolute"}else b.firstChild?b.insertBefore(g,b.firstChild):b[x](g);Ia.call(e,e,l.fn);return e};H[p].clear=function(){this.canvas.innerHTML=A;this.span=C.createElement("span");this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";this.canvas[x](this.span);this.bottom=
this.top=null};H[p].remove=function(){this.canvas.parentNode.removeChild(this.canvas);for(var a in this)this[a]=bb(a);return true}}H[p].safari=navigator.vendor=="Apple Computer, Inc."&&(navigator.userAgent.match(/Version\/(.*?)\s/)[1]<4||aa.navigator.platform.slice(0,2)=="iP")?function(){var a=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});aa.setTimeout(function(){a.remove()})}:function(){};function Ib(){this.returnValue=false}function Jb(){return this.originalEvent.preventDefault()}
function Kb(){this.cancelBubble=true}function Lb(){return this.originalEvent.stopPropagation()}var Mb=function(){if(C.addEventListener)return function(a,b,c,d){var f=Da&&Ea[b]?Ea[b]:b;function e(g){if(Da&&Ea[z](b))for(var h=0,i=g.targetTouches&&g.targetTouches.length;h<i;h++)if(g.targetTouches[h].target==a){i=g;g=g.targetTouches[h];g.originalEvent=i;g.preventDefault=Jb;g.stopPropagation=Lb;break}return c.call(d,g)}a.addEventListener(f,e,false);return function(){a.removeEventListener(f,e,false);return true}};
else if(C.attachEvent)return function(a,b,c,d){function f(g){g=g||aa.event;g.preventDefault=g.preventDefault||Ib;g.stopPropagation=g.stopPropagation||Kb;return c.call(d,g)}a.attachEvent("on"+b,f);function e(){a.detachEvent("on"+b,f);return true}return e}}(),$=[];function Ka(a){for(var b=a.clientX,c=a.clientY,d,f=$.length;f--;){d=$[f];if(Da)for(var e=a.touches.length,g;e--;){g=a.touches[e];if(g.identifier==d.el._drag.id){b=g.clientX;c=g.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();
break}}else a.preventDefault();d.move&&d.move.call(d.el,b-d.el._drag.x,c-d.el._drag.y,b,c)}}function La(){l.unmousemove(Ka).unmouseup(La);for(var a=$.length,b;a--;){b=$[a];b.el._drag={};b.end&&b.end.call(b.el)}$=[]}for(da=Ra[o];da--;)(function(a){l[a]=s[p][a]=function(b){if(l.is(b,"function")){this.events=this.events||[];this.events.push({name:a,f:b,unbind:Mb(this.shape||this.node||C,a,b,this)})}return this};l["un"+a]=s[p]["un"+a]=function(b){for(var c=this.events,d=c[o];d--;)if(c[d].name==a&&c[d].f==
b){c[d].unbind();c.splice(d,1);!c.length&&delete this.events;return this}return this}})(Ra[da]);s[p].hover=function(a,b){return this.mouseover(a).mouseout(b)};s[p].unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};s[p].drag=function(a,b,c){this._drag={};this.mousedown(function(d){(d.originalEvent||d).preventDefault();this._drag.x=d.clientX;this._drag.y=d.clientY;this._drag.id=d.identifier;b&&b.call(this,d.clientX,d.clientY);!$.length&&l.mousemove(Ka).mouseup(La);$.push({el:this,move:a,
end:c})});return this};s[p].undrag=function(a,b,c){for(b=$.length;b--;){$[b].el==this&&$[b].move==a&&$[b].end==c&&$.splice(b,1);!$.length&&l.unmousemove(Ka).unmouseup(La)}};H[p].circle=function(a,b,c){return fb(this,a||0,b||0,c||0)};H[p].rect=function(a,b,c,d,f){return gb(this,a||0,b||0,c||0,d||0,f||0)};H[p].ellipse=function(a,b,c,d){return hb(this,a||0,b||0,c||0,d||0)};H[p].path=function(a){a&&!l.is(a,ga)&&!l.is(a[0],U)&&(a+=A);return db(l.format[K](l,arguments),this)};H[p].image=function(a,b,c,
d,f){return ib(this,a||"about:blank",b||0,c||0,d||0,f||0)};H[p].text=function(a,b,c){return jb(this,a||0,b||0,c||A)};H[p].set=function(a){arguments[o]>1&&(a=Array[p].splice.call(arguments,0,arguments[o]));return new X(a)};H[p].setSize=kb;H[p].top=H[p].bottom=null;H[p].raphael=l;function nb(){return this.x+N+this.y}s[p].resetScale=function(){if(this.removed)return this;this._.sx=1;this._.sy=1;this.attrs.scale="1 1"};s[p].scale=function(a,b,c,d){if(this.removed)return this;if(a==null&&b==null)return{x:this._.sx,
y:this._.sy,toString:nb};b=b||a;!+b&&(b=a);var f,e,g=this.attrs;if(a!=0){var h=this.getBBox(),i=h.x+h.width/2,j=h.y+h.height/2;f=a/this._.sx;e=b/this._.sy;c=+c||c==0?c:i;d=+d||d==0?d:j;h=~~(a/v.abs(a));var m=~~(b/v.abs(b)),n=this.node.style,r=c+(i-c)*f;j=d+(j-d)*e;switch(this.type){case "rect":case "image":var q=g.width*h*f,k=g.height*m*e;this.attr({height:k,r:g.r*ba(h*f,m*e),width:q,x:r-q/2,y:j-k/2});break;case "circle":case "ellipse":this.attr({rx:g.rx*h*f,ry:g.ry*m*e,r:g.r*ba(h*f,m*e),cx:r,cy:j});
break;case "text":this.attr({x:r,y:j});break;case "path":i=Ha(g.path);for(var t=true,L=0,B=i[o];L<B;L++){var w=i[L],J=sa.call(w[0]);if(!(J=="M"&&t)){t=false;if(J=="A"){w[i[L][o]-2]*=f;w[i[L][o]-1]*=e;w[1]*=h*f;w[2]*=m*e;w[5]=+!(h+m?!+w[5]:+w[5])}else if(J=="H"){J=1;for(var ia=w[o];J<ia;J++)w[J]*=f}else if(J=="V"){J=1;for(ia=w[o];J<ia;J++)w[J]*=e}else{J=1;for(ia=w[o];J<ia;J++)w[J]*=J%2?f:e}}}e=xa(i);f=r-e.x-e.width/2;e=j-e.y-e.height/2;i[0][1]+=f;i[0][2]+=e;this.attr({path:i});break}if(this.type in
{text:1,image:1}&&(h!=1||m!=1))if(this.transformations){this.transformations[2]="scale("[M](h,",",m,")");this.node[W]("transform",this.transformations[R](N));f=h==-1?-g.x-(q||0):g.x;e=m==-1?-g.y-(k||0):g.y;this.attr({x:f,y:e});g.fx=h-1;g.fy=m-1}else{this.node.filterMatrix=Fa+".Matrix(M11="[M](h,", M12=0, M21=0, M22=",m,", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");n.filter=(this.node.filterMatrix||A)+(this.node.filterOpacity||A)}else if(this.transformations){this.transformations[2]=
A;this.node[W]("transform",this.transformations[R](N));g.fx=0;g.fy=0}else{this.node.filterMatrix=A;n.filter=(this.node.filterMatrix||A)+(this.node.filterOpacity||A)}g.scale=[a,b,c,d][R](N);this._.sx=a;this._.sy=b}return this};s[p].clone=function(){if(this.removed)return null;var a=this.attr();delete a.scale;delete a.translation;return this.paper[this.type]().attr(a)};var ob=Z(function(a,b,c,d,f,e,g,h,i){for(var j=0,m,n=0;n<1.01;n+=0.01){var r=la(a,b,c,d,f,e,g,h,n);n&&(j+=E(E(m.x-r.x,2)+E(m.y-r.y,
2),0.5));if(j>=i)return r;m=r}});function Ma(a,b){return function(c,d,f){c=wa(c);for(var e,g,h,i,j="",m={},n=0,r=0,q=c.length;r<q;r++){h=c[r];if(h[0]=="M"){e=+h[1];g=+h[2]}else{i=Nb(e,g,h[1],h[2],h[3],h[4],h[5],h[6]);if(n+i>d){if(b&&!m.start){e=ob(e,g,h[1],h[2],h[3],h[4],h[5],h[6],d-n);j+=["C",e.start.x,e.start.y,e.m.x,e.m.y,e.x,e.y];if(f)return j;m.start=j;j=["M",e.x,e.y+"C",e.n.x,e.n.y,e.end.x,e.end.y,h[5],h[6]][R]();n+=i;e=+h[5];g=+h[6];continue}if(!a&&!b){e=ob(e,g,h[1],h[2],h[3],h[4],h[5],h[6],
d-n);return{x:e.x,y:e.y,alpha:e.alpha}}}n+=i;e=+h[5];g=+h[6]}j+=h}m.end=j;e=a?n:b?m:l.findDotsAtSegment(e,g,h[1],h[2],h[3],h[4],h[5],h[6],1);e.alpha&&(e={x:e.x,y:e.y,alpha:e.alpha});return e}}var Nb=Z(function(a,b,c,d,f,e,g,h){for(var i={x:0,y:0},j=0,m=0;m<1.01;m+=0.01){var n=la(a,b,c,d,f,e,g,h,m);m&&(j+=E(E(i.x-n.x,2)+E(i.y-n.y,2),0.5));i=n}return j}),pb=Ma(1),Ba=Ma(),Na=Ma(0,1);s[p].getTotalLength=function(){if(this.type=="path"){if(this.node.getTotalLength)return this.node.getTotalLength();return pb(this.attrs.path)}};
s[p].getPointAtLength=function(a){if(this.type=="path"){if(this.node.getPointAtLength)return this.node.getPointAtLength(a);return Ba(this.attrs.path,a)}};s[p].getSubpath=function(a,b){if(this.type=="path"){if(v.abs(this.getTotalLength()-b)<1.0E-6)return Na(this.attrs.path,a).end;b=Na(this.attrs.path,b,1);return a?Na(b,a).end:b}};l.easing_formulas={linear:function(a){return a},"<":function(a){return E(a,3)},">":function(a){return E(a-1,3)+1},"<>":function(a){a*=2;if(a<1)return E(a,3)/2;a-=2;return(E(a,
3)+2)/2},backIn:function(a){var b=1.70158;return a*a*((b+1)*a-b)},backOut:function(a){a-=1;var b=1.70158;return a*a*((b+1)*a+b)+1},elastic:function(a){if(a==0||a==1)return a;var b=0.3,c=b/4;return E(2,-10*a)*v.sin((a-c)*2*v.PI/b)+1},bounce:function(a){var b=7.5625,c=2.75;if(a<1/c)a=b*a*a;else if(a<2/c){a-=1.5/c;a=b*a*a+0.75}else if(a<2.5/c){a-=2.25/c;a=b*a*a+0.9375}else{a-=2.625/c;a=b*a*a+0.984375}return a}};var T={length:0};function qb(){var a=+new Date;for(var b in T)if(b!="length"&&T[z](b)){var c=
T[b];if(c.stop||c.el.removed){delete T[b];T[o]--}else{var d=a-c.start,f=c.ms,e=c.easing,g=c.from,h=c.diff,i=c.to,j=c.t,m=c.prev||0,n=c.el,r=c.callback,q={},k;if(d<f){r=l.easing_formulas[e]?l.easing_formulas[e](d/f):d/f;for(var t in g)if(g[z](t)){switch(Ga[t]){case "along":k=r*f*h[t];i.back&&(k=i.len-k);e=Ba(i[t],k);n.translate(h.sx-h.x||0,h.sy-h.y||0);h.x=e.x;h.y=e.y;n.translate(e.x-h.sx,e.y-h.sy);i.rot&&n.rotate(h.r+e.alpha,e.x,e.y);break;case P:k=+g[t]+r*f*h[t];break;case "colour":k="rgb("+[Oa(Q(g[t].r+
r*f*h[t].r)),Oa(Q(g[t].g+r*f*h[t].g)),Oa(Q(g[t].b+r*f*h[t].b))][R](",")+")";break;case "path":k=[];e=0;for(var L=g[t][o];e<L;e++){k[e]=[g[t][e][0]];for(var B=1,w=g[t][e][o];B<w;B++)k[e][B]=+g[t][e][B]+r*f*h[t][e][B];k[e]=k[e][R](N)}k=k[R](N);break;case "csv":switch(t){case "translation":k=h[t][0]*(d-m);e=h[t][1]*(d-m);j.x+=k;j.y+=e;k=k+N+e;break;case "rotation":k=+g[t][0]+r*f*h[t][0];g[t][1]&&(k+=","+g[t][1]+","+g[t][2]);break;case "scale":k=[+g[t][0]+r*f*h[t][0],+g[t][1]+r*f*h[t][1],2 in i[t]?i[t][2]:
A,3 in i[t]?i[t][3]:A][R](N);break;case "clip-rect":k=[];for(e=4;e--;)k[e]=+g[t][e]+r*f*h[t][e];break}break}q[t]=k}n.attr(q);n._run&&n._run.call(n)}else{if(i.along){e=Ba(i.along,i.len*!i.back);n.translate(h.sx-(h.x||0)+e.x-h.sx,h.sy-(h.y||0)+e.y-h.sy);i.rot&&n.rotate(h.r+e.alpha,e.x,e.y)}(j.x||j.y)&&n.translate(-j.x,-j.y);i.scale&&(i.scale+=A);n.attr(i);delete T[b];T[o]--;n.in_animation=null;l.is(r,"function")&&r.call(n)}c.prev=d}}l.svg&&n&&n.paper&&n.paper.safari();T[o]&&aa.setTimeout(qb)}function Oa(a){return Y(ba(a,
255),0)}function Aa(a,b){if(a==null)return{x:this._.tx,y:this._.ty,toString:nb};this._.tx+=+a;this._.ty+=+b;switch(this.type){case "circle":case "ellipse":this.attr({cx:+a+this.attrs.cx,cy:+b+this.attrs.cy});break;case "rect":case "image":case "text":this.attr({x:+a+this.attrs.x,y:+b+this.attrs.y});break;case "path":var c=Ha(this.attrs.path);c[0][1]+=+a;c[0][2]+=+b;this.attr({path:c});break}return this}s[p].animateWith=function(a,b,c,d,f){T[a.id]&&(b.start=T[a.id].start);return this.animate(b,c,d,
f)};s[p].animateAlong=rb();s[p].animateAlongBack=rb(1);function rb(a){return function(b,c,d,f){var e={back:a};l.is(d,"function")?(f=d):(e.rot=d);b&&b.constructor==s&&(b=b.attrs.path);b&&(e.along=b);return this.animate(e,c,f)}}s[p].onAnimation=function(a){this._run=a||0;return this};s[p].animate=function(a,b,c,d){if(l.is(c,"function")||!c)d=c||null;var f={},e={},g={};for(var h in a)if(a[z](h))if(Ga[z](h)){f[h]=this.attr(h);f[h]==null&&(f[h]=ta[h]);e[h]=a[h];switch(Ga[h]){case "along":var i=pb(a[h]),
j=Ba(a[h],i*!!a.back),m=this.getBBox();g[h]=i/b;g.tx=m.x;g.ty=m.y;g.sx=j.x;g.sy=j.y;e.rot=a.rot;e.back=a.back;e.len=i;a.rot&&(g.r=y(this.rotate())||0);break;case P:g[h]=(e[h]-f[h])/b;break;case "colour":f[h]=l.getRGB(f[h]);i=l.getRGB(e[h]);g[h]={r:(i.r-f[h].r)/b,g:(i.g-f[h].g)/b,b:(i.b-f[h].b)/b};break;case "path":i=wa(f[h],e[h]);f[h]=i[0];j=i[1];g[h]=[];i=0;for(m=f[h][o];i<m;i++){g[h][i]=[0];for(var n=1,r=f[h][i][o];n<r;n++)g[h][i][n]=(j[i][n]-f[h][i][n])/b}break;case "csv":j=D(a[h])[G](V);i=D(f[h])[G](V);
switch(h){case "translation":f[h]=[0,0];g[h]=[j[0]/b,j[1]/b];break;case "rotation":f[h]=i[1]==j[1]&&i[2]==j[2]?i:[0,j[1],j[2]];g[h]=[(j[0]-f[h][0])/b,0,0];break;case "scale":a[h]=j;f[h]=D(f[h])[G](V);g[h]=[(j[0]-f[h][0])/b,(j[1]-f[h][1])/b,0,0];break;case "clip-rect":f[h]=D(f[h])[G](V);g[h]=[];for(i=4;i--;)g[h][i]=(j[i]-f[h][i])/b;break}e[h]=j}}this.stop();this.in_animation=1;T[this.id]={start:a.start||+new Date,ms:b,easing:c,from:f,diff:g,to:e,el:this,callback:d,t:{x:0,y:0}};++T[o]==1&&qb();return this};
s[p].stop=function(){T[this.id]&&T[o]--;delete T[this.id];return this};s[p].translate=function(a,b){return this.attr({translation:a+" "+b})};s[p][O]=function(){return"Rapha\u00ebl\u2019s object"};l.ae=T;function X(a){this.items=[];this[o]=0;this.type="set";if(a)for(var b=0,c=a[o];b<c;b++)if(a[b]&&(a[b].constructor==s||a[b].constructor==X)){this[this.items[o]]=this.items[this.items[o]]=a[b];this[o]++}}X[p][F]=function(){for(var a,b,c=0,d=arguments[o];c<d;c++)if((a=arguments[c])&&(a.constructor==s||
a.constructor==X)){b=this.items[o];this[b]=this.items[b]=a;this[o]++}return this};X[p].pop=function(){delete this[this[o]--];return this.items.pop()};for(var Pa in s[p])if(s[p][z](Pa))X[p][Pa]=function(a){return function(){for(var b=0,c=this.items[o];b<c;b++)this.items[b][a][K](this.items[b],arguments);return this}}(Pa);X[p].attr=function(a,b){if(a&&l.is(a,U)&&l.is(a[0],"object")){b=0;for(var c=a[o];b<c;b++)this.items[b].attr(a[b])}else{c=0;for(var d=this.items[o];c<d;c++)this.items[c].attr(a,b)}return this};
X[p].animate=function(a,b,c,d){(l.is(c,"function")||!c)&&(d=c||null);var f=this.items[o],e=f,g,h=this,i;d&&(i=function(){!--f&&d.call(h)});c=l.is(c,ga)?c:i;for(g=this.items[--e].animate(a,b,c,i);e--;)this.items[e].animateWith(g,a,b,c,i);return this};X[p].insertAfter=function(a){for(var b=this.items[o];b--;)this.items[b].insertAfter(a);return this};X[p].getBBox=function(){for(var a=[],b=[],c=[],d=[],f=this.items[o];f--;){var e=this.items[f].getBBox();a[F](e.x);b[F](e.y);c[F](e.x+e.width);d[F](e.y+
e.height)}a=ba[K](0,a);b=ba[K](0,b);return{x:a,y:b,width:Y[K](0,c)-a,height:Y[K](0,d)-b}};X[p].clone=function(a){a=new X;for(var b=0,c=this.items[o];b<c;b++)a[F](this.items[b].clone());return a};l.registerFont=function(a){if(!a.face)return a;this.fonts=this.fonts||{};var b={w:a.w,face:{},glyphs:{}},c=a.face["font-family"];for(var d in a.face)if(a.face[z](d))b.face[d]=a.face[d];if(this.fonts[c])this.fonts[c][F](b);else this.fonts[c]=[b];if(!a.svg){b.face["units-per-em"]=ha(a.face["units-per-em"],10);
for(var f in a.glyphs)if(a.glyphs[z](f)){c=a.glyphs[f];b.glyphs[f]={w:c.w,k:{},d:c.d&&"M"+c.d[I](/[mlcxtrv]/g,function(g){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[g]||"M"})+"z"};if(c.k)for(var e in c.k)if(c[z](e))b.glyphs[f].k[e]=c.k[e]}}return a};H[p].getFont=function(a,b,c,d){d=d||"normal";c=c||"normal";b=+b||{normal:400,bold:700,lighter:300,bolder:800}[b]||400;if(l.fonts){var f=l.fonts[a];if(!f){a=new RegExp("(^|\\s)"+a[I](/[^\w\d\s+!~.:_-]/g,A)+"(\\s|$)","i");for(var e in l.fonts)if(l.fonts[z](e))if(a.test(e)){f=
l.fonts[e];break}}var g;if(f){e=0;for(a=f[o];e<a;e++){g=f[e];if(g.face["font-weight"]==b&&(g.face["font-style"]==c||!g.face["font-style"])&&g.face["font-stretch"]==d)break}}return g}};H[p].print=function(a,b,c,d,f,e){e=e||"middle";var g=this.set(),h=D(c)[G](A),i=0;l.is(d,c)&&(d=this.getFont(d));if(d){c=(f||16)/d.face["units-per-em"];var j=d.face.bbox.split(V);f=+j[0];e=+j[1]+(e=="baseline"?j[3]-j[1]+ +d.face.descent:(j[3]-j[1])/2);j=0;for(var m=h[o];j<m;j++){var n=j&&d.glyphs[h[j-1]]||{},r=d.glyphs[h[j]];
i+=j?(n.w||d.w)+(n.k&&n.k[h[j]]||0):0;r&&r.d&&g[F](this.path(r.d).attr({fill:"#000",stroke:"none",translation:[i,0]}))}g.scale(c,c,f,e).translate(a-f,b-e)}return g};var Ob=/\{(\d+)\}/g;l.format=function(a,b){var c=l.is(b,U)?[0][M](b):arguments;a&&l.is(a,ga)&&c[o]-1&&(a=a[I](Ob,function(d,f){return c[++f]==null?A:c[f]}));return a||A};l.ninja=function(){Qa.was?(Raphael=Qa.is):delete Raphael;return l};l.el=s[p];return l}();
(function(){function b(){}function c(w,u){for(var v in (u||{})){w[v]=u[v]}return w}function m(u){return(typeof u=="function")?u:function(){return u}}var k=Date.now||function(){return +new Date};function j(v){var u=h(v);return(u)?((u!="array")?[v]:v):[]}var h=function(u){return h.s.call(u).match(/^\[object\s(.*)\]$/)[1].toLowerCase()};h.s=Object.prototype.toString;function g(y,x){var w=h(y);if(w=="object"){for(var v in y){x(y[v],v)}}else{for(var u=0;u<y.length;u++){x(y[u],u)}}}function r(){var y={};for(var x=0,u=arguments.length;x<u;x++){var v=arguments[x];if(h(v)!="object"){continue}for(var w in v){var A=v[w],z=y[w];y[w]=(z&&h(A)=="object"&&h(z)=="object")?r(z,A):n(A)}}return y}function n(w){var v;switch(h(w)){case"object":v={};for(var y in w){v[y]=n(w[y])}break;case"array":v=[];for(var x=0,u=w.length;x<u;x++){v[x]=n(w[x])}break;default:return w}return v}function d(y,x){if(y.length<3){return null}if(y.length==4&&y[3]==0&&!x){return"transparent"}var v=[];for(var u=0;u<3;u++){var w=(y[u]-0).toString(16);v.push((w.length==1)?"0"+w:w)}return(x)?v:"#"+v.join("")}function i(u){f(u);if(u.parentNode){u.parentNode.removeChild(u)}if(u.clearAttributes){u.clearAttributes()}}function f(w){for(var v=w.childNodes,u=0;u<v.length;u++){i(v[u])}}function t(w,v,u){if(w.addEventListener){w.addEventListener(v,u,false)}else{w.attachEvent("on"+v,u)}}function s(v,u){return(" "+v.className+" ").indexOf(" "+u+" ")>-1}function p(v,u){if(!s(v,u)){v.className=(v.className+" "+u)}}function a(v,u){v.className=v.className.replace(new RegExp("(^|\\s)"+u+"(?:\\s|$)"),"$1")}function e(u){return document.getElementById(u)}var o=function(v){v=v||{};var u=function(){this.constructor=u;if(o.prototyping){return this}var x=(this.initialize)?this.initialize.apply(this,arguments):this;return x};for(var w in o.Mutators){if(!v[w]){continue}v=o.Mutators[w](v,v[w]);delete v[w]}c(u,this);u.constructor=o;u.prototype=v;return u};o.Mutators={Extends:function(w,u){o.prototyping=u.prototype;var v=new u;delete v.parent;v=o.inherit(v,w);delete o.prototyping;return v},Implements:function(u,v){g(j(v),function(w){o.prototying=w;c(u,(h(w)=="function")?new w:w);delete o.prototyping});return u}};c(o,{inherit:function(v,y){var u=arguments.callee.caller;for(var x in y){var w=y[x];var A=v[x];var z=h(w);if(A&&z=="function"){if(w!=A){if(u){w.__parent=A;v[x]=w}else{o.override(v,x,w)}}}else{if(z=="object"){v[x]=r(A,w)}else{v[x]=w}}}if(u){v.parent=function(){return arguments.callee.caller.__parent.apply(this,arguments)}}return v},override:function(v,u,y){var x=o.prototyping;if(x&&v[u]!=x[u]){x=null}var w=function(){var z=this.parent;this.parent=x?x[u]:v[u];var A=y.apply(this,arguments);this.parent=z;return A};v[u]=w}});o.prototype.implement=function(){var u=this.prototype;g(Array.prototype.slice.call(arguments||[]),function(v){o.inherit(u,v)});return this};this.TreeUtil={prune:function(v,u){this.each(v,function(x,w){if(w==u&&x.children){delete x.children;x.children=[]}})},getParent:function(u,y){if(u.id==y){return false}var x=u.children;if(x&&x.length>0){for(var w=0;w<x.length;w++){if(x[w].id==y){return u}else{var v=this.getParent(x[w],y);if(v){return v}}}}return false},getSubtree:function(u,y){if(u.id==y){return u}for(var w=0,x=u.children;w<x.length;w++){var v=this.getSubtree(x[w],y);if(v!=null){return v}}return null},getLeaves:function(w,u){var x=[],v=u||Number.MAX_VALUE;this.each(w,function(z,y){if(y<v&&(!z.children||z.children.length==0)){x.push({node:z,level:v-y})}});return x},eachLevel:function(u,z,w,y){if(z<=w){y(u,z);for(var v=0,x=u.children;v<x.length;v++){this.eachLevel(x[v],z+1,w,y)}}},each:function(u,v){this.eachLevel(u,0,Number.MAX_VALUE,v)},loadSubtrees:function(D,x){var C=x.request&&x.levelsToShow;var y=this.getLeaves(D,C),A=y.length,z={};if(A==0){x.onComplete()}for(var w=0,u=0;w<A;w++){var B=y[w],v=B.node.id;z[v]=B.node;x.request(v,B.level,{onComplete:function(G,E){var F=E.children;z[G].children=F;if(++u==A){x.onComplete()}}})}}};this.Canvas=(function(){var v={injectInto:"id",width:200,height:200,backgroundColor:"#333333",styles:{fillStyle:"#000000",strokeStyle:"#000000"},backgroundCanvas:false};function x(){x.t=x.t||typeof(HTMLCanvasElement);return"function"==x.t||"object"==x.t}function w(z,C,B){var A=document.createElement(z);(function(E,F){if(F){for(var D in F){E[D]=F[D]}}return arguments.callee})(A,C)(A.style,B);if(z=="canvas"&&!x()&&G_vmlCanvasManager){A=G_vmlCanvasManager.initElement(document.body.appendChild(A))}return A}function u(z){return document.getElementById(z)}function y(C,B,A,E){var D=A?(C.width-A):C.width;var z=E?(C.height-E):C.height;B.translate(D/2,z/2)}return function(B,C){var N,G,z,K,D,J;if(arguments.length<1){throw"Arguments missing"}var A=B+"-label",I=B+"-canvas",E=B+"-bkcanvas";C=r(v,C||{});var F={width:C.width,height:C.height};z=w("div",{id:B},r(F,{position:"relative"}));K=w("div",{id:A},{overflow:"visible",position:"absolute",top:0,left:0,width:F.width+"px",height:0});var L={position:"absolute",top:0,left:0,width:F.width+"px",height:F.height+"px"};D=w("canvas",r({id:I},F),L);var H=C.backgroundCanvas;if(H){J=w("canvas",r({id:E},F),L);z.appendChild(J)}z.appendChild(D);z.appendChild(K);u(C.injectInto).appendChild(z);N=D.getContext("2d");y(D,N);var M=C.styles;var O;for(O in M){N[O]=M[O]}if(H){G=J.getContext("2d");M=H.styles;for(O in M){G[O]=M[O]}y(J,G);H.impl.init(J,G);H.impl.plot(J,G)}return{id:B,getCtx:function(){return N},getElement:function(){return z},resize:function(T,P){var S=D.width,U=D.height;D.width=T;D.height=P;D.style.width=T+"px";D.style.height=P+"px";if(H){J.width=T;J.height=P;J.style.width=T+"px";J.style.height=P+"px"}if(!x()){y(D,N,S,U)}else{y(D,N)}var Q=C.styles;var R;for(R in Q){N[R]=Q[R]}if(H){Q=H.styles;for(R in Q){G[R]=Q[R]}if(!x()){y(J,G,S,U)}else{y(J,G)}H.impl.init(J,G);H.impl.plot(J,G)}},getSize:function(){return{width:D.width,height:D.height}},path:function(P,Q){N.beginPath();Q(N);N[P]();N.closePath()},clear:function(){var P=this.getSize();N.clearRect(-P.width/2,-P.height/2,P.width,P.height)},clearRectangle:function(T,R,Q,S){if(!x()){var P=N.fillStyle;N.fillStyle=C.backgroundColor;N.fillRect(S,T,Math.abs(R-S),Math.abs(Q-T));N.fillStyle=P}else{N.clearRect(S,T,Math.abs(R-S),Math.abs(Q-T))}}}}})();this.Polar=function(v,u){this.theta=v;this.rho=u};Polar.prototype={getc:function(u){return this.toComplex(u)},getp:function(){return this},set:function(u){u=u.getp();this.theta=u.theta;this.rho=u.rho},setc:function(u,v){this.rho=Math.sqrt(u*u+v*v);this.theta=Math.atan2(v,u);if(this.theta<0){this.theta+=Math.PI*2}},setp:function(v,u){this.theta=v;this.rho=u},clone:function(){return new Polar(this.theta,this.rho)},toComplex:function(w){var u=Math.cos(this.theta)*this.rho;var v=Math.sin(this.theta)*this.rho;if(w){return{x:u,y:v}}return new Complex(u,v)},add:function(u){return new Polar(this.theta+u.theta,this.rho+u.rho)},scale:function(u){return new Polar(this.theta,this.rho*u)},equals:function(u){return this.theta==u.theta&&this.rho==u.rho},$add:function(u){this.theta=this.theta+u.theta;this.rho+=u.rho;return this},$madd:function(u){this.theta=(this.theta+u.theta)%(Math.PI*2);this.rho+=u.rho;return this},$scale:function(u){this.rho*=u;return this},interpolate:function(w,C){var x=Math.PI,A=x*2;var v=function(D){return(D<0)?(D%A)+A:D%A};var z=this.theta,B=w.theta;var y;if(Math.abs(z-B)>x){if(z>B){y=v((B+((z-A)-B)*C))}else{y=v((B-A+(z-(B-A))*C))}}else{y=v((B+(z-B)*C))}var u=(this.rho-w.rho)*C+w.rho;return{theta:y,rho:u}}};var l=function(v,u){return new Polar(v,u)};Polar.KER=l(0,0);this.Complex=function(u,v){this.x=u;this.y=v};Complex.prototype={getc:function(){return this},getp:function(u){return this.toPolar(u)},set:function(u){u=u.getc(true);this.x=u.x;this.y=u.y},setc:function(u,v){this.x=u;this.y=v},setp:function(v,u){this.x=Math.cos(v)*u;this.y=Math.sin(v)*u},clone:function(){return new Complex(this.x,this.y)},toPolar:function(w){var u=this.norm();var v=Math.atan2(this.y,this.x);if(v<0){v+=Math.PI*2}if(w){return{theta:v,rho:u}}return new Polar(v,u)},norm:function(){return Math.sqrt(this.squaredNorm())},squaredNorm:function(){return this.x*this.x+this.y*this.y},add:function(u){return new Complex(this.x+u.x,this.y+u.y)},prod:function(u){return new Complex(this.x*u.x-this.y*u.y,this.y*u.x+this.x*u.y)},conjugate:function(){return new Complex(this.x,-this.y)},scale:function(u){return new Complex(this.x*u,this.y*u)},equals:function(u){return this.x==u.x&&this.y==u.y},$add:function(u){this.x+=u.x;this.y+=u.y;return this},$prod:function(w){var u=this.x,v=this.y;this.x=u*w.x-v*w.y;this.y=v*w.x+u*w.y;return this},$conjugate:function(){this.y=-this.y;return this},$scale:function(u){this.x*=u;this.y*=u;return this},$div:function(z){var u=this.x,w=this.y;var v=z.squaredNorm();this.x=u*z.x+w*z.y;this.y=w*z.x-u*z.y;return this.$scale(1/v)}};var q=function(v,u){return new Complex(v,u)};Complex.KER=q(0,0);this.Graph=new o({initialize:function(u){var v={complex:false,Node:{}};this.opt=r(v,u||{});this.nodes={}},getNode:function(u){if(this.hasNode(u)){return this.nodes[u]}return false},getAdjacence:function(w,u){var v=[];if(this.hasNode(w)&&this.hasNode(u)&&this.nodes[w].adjacentTo({id:u})&&this.nodes[u].adjacentTo({id:w})){v.push(this.nodes[w].getAdjacency(u));v.push(this.nodes[u].getAdjacency(w));return v}return false},addNode:function(u){if(!this.nodes[u.id]){this.nodes[u.id]=new Graph.Node(c({id:u.id,name:u.name,data:u.data},this.opt.Node),this.opt.complex)}return this.nodes[u.id]},addAdjacence:function(x,w,v){var y=[];if(!this.hasNode(x.id)){this.addNode(x)}if(!this.hasNode(w.id)){this.addNode(w)}x=this.nodes[x.id];w=this.nodes[w.id];for(var u in this.nodes){if(this.nodes[u].id==x.id){if(!this.nodes[u].adjacentTo(w)){y.push(this.nodes[u].addAdjacency(w,v))}}if(this.nodes[u].id==w.id){if(!this.nodes[u].adjacentTo(x)){y.push(this.nodes[u].addAdjacency(x,v))}}}return y},removeNode:function(w){if(this.hasNode(w)){var v=this.nodes[w];for(var u=0 in v.adjacencies){var adj=v.adjacencies[u];this.removeAdjacence(w,adj.nodeTo.id)}delete this.nodes[w]}},removeAdjacence:function(y,x){if(this.hasNode(y)){this.nodes[y].removeAdjacency(x)}if(this.hasNode(x)){this.nodes[x].removeAdjacency(y)}},hasNode:function(x){return x in this.nodes}});Graph.Node=new o({initialize:function(x,z){var y={id:"",name:"",data:{},adjacencies:{},selected:false,drawn:false,exist:false,angleSpan:{begin:0,end:0},alpha:1,startAlpha:1,endAlpha:1,pos:(z&&q(0,0))||l(0,0),startPos:(z&&q(0,0))||l(0,0),endPos:(z&&q(0,0))||l(0,0)};c(this,c(y,x))},adjacentTo:function(x){return x.id in this.adjacencies},getAdjacency:function(x){return this.adjacencies[x]},addAdjacency:function(y,z){var x=new Graph.Adjacence(this,y,z);return this.adjacencies[y.id]=x},removeAdjacency:function(x){delete this.adjacencies[x]}});Graph.Adjacence=function(x,z,y){this.nodeFrom=x;this.nodeTo=z;this.data=y||{};this.alpha=1;this.startAlpha=1;this.endAlpha=1};Graph.Util={filter:function(y){if(!y||!(h(y)=="string")){return function(){return true}}var x=y.split(" ");return function(A){for(var z=0;z<x.length;z++){if(A[x[z]]){return false}}return true}},getNode:function(x,y){return x.getNode(y)},eachNode:function(B,A,x){var z=this.filter(x);for(var y in B.nodes){if(z(B.nodes[y])){A(B.nodes[y])}}},eachAdjacency:function(A,B,x){var y=A.adjacencies,z=this.filter(x);for(var C in y){if(z(y[C])){B(y[C],C)}}},computeLevels:function(D,E,A,z){A=A||0;var B=this.filter(z);this.eachNode(D,function(F){F._flag=false;F._depth=-1},z);var y=D.getNode(E);y._depth=A;var x=[y];while(x.length!=0){var C=x.pop();C._flag=true;this.eachAdjacency(C,function(F){var G=F.nodeTo;if(G._flag==false&&B(G)){if(G._depth<0){G._depth=C._depth+1+A}x.unshift(G)}},z)}},eachBFS:function(C,D,B,y){var z=this.filter(y);this.clean(C);var x=[C.getNode(D)];while(x.length!=0){var A=x.pop();A._flag=true;B(A,A._depth);this.eachAdjacency(A,function(E){var F=E.nodeTo;if(F._flag==false&&z(F)){F._flag=true;x.unshift(F)}},y)}},eachLevel:function(B,F,y,C,A){var E=B._depth,x=this.filter(A),D=this;y=y===false?Number.MAX_VALUE-E:y;(function z(I,G,H){var J=I._depth;if(J>=G&&J<=H&&x(I)){C(I,J)}if(J<H){D.eachAdjacency(I,function(K){var L=K.nodeTo;if(L._depth>J){z(L,G,H)}})}})(B,F+E,y+E)},eachSubgraph:function(y,z,x){this.eachLevel(y,0,false,z,x)},eachSubnode:function(y,z,x){this.eachLevel(y,1,1,z,x)},anySubnode:function(A,z,y){var x=false;z=z||m(true);var B=h(z)=="string"?function(C){return C[z]}:z;this.eachSubnode(A,function(C){if(B(C)){x=true}},y);return x},getSubnodes:function(C,D,x){var z=[],B=this;D=D||0;var A,y;if(h(D)=="array"){A=D[0];y=D[1]}else{A=D;y=Number.MAX_VALUE-C._depth}this.eachLevel(C,A,y,function(E){z.push(E)},x);return z},getParents:function(y){var x=[];this.eachAdjacency(y,function(z){var A=z.nodeTo;if(A._depth<y._depth){x.push(A)}});return x},isDescendantOf:function(A,B){if(A.id==B){return true}var z=this.getParents(A),x=false;for(var y=0;!x&&y<z.length;y++){x=x||this.isDescendantOf(z[y],B)}return x},clean:function(x){this.eachNode(x,function(y){y._flag=false})}};Graph.Op={options:{type:"nothing",duration:2000,hideLabels:true,fps:30},removeNode:function(C,A){var x=this.viz;var y=r(this.options,x.controller,A);var E=j(C);var z,B,D;switch(y.type){case"nothing":for(z=0;z<E.length;z++){x.graph.removeNode(E[z])}break;case"replot":this.removeNode(E,{type:"nothing"});x.fx.clearLabels();x.refresh(true);break;case"fade:seq":case"fade":B=this;for(z=0;z<E.length;z++){D=x.graph.getNode(E[z]);D.endAlpha=0}x.fx.animate(r(y,{modes:["fade:nodes"],onComplete:function(){B.removeNode(E,{type:"nothing"});x.fx.clearLabels();x.reposition();x.fx.animate(r(y,{modes:["linear"]}))}}));break;case"fade:con":B=this;for(z=0;z<E.length;z++){D=x.graph.getNode(E[z]);D.endAlpha=0;D.ignore=true}x.reposition();x.fx.animate(r(y,{modes:["fade:nodes","linear"],onComplete:function(){B.removeNode(E,{type:"nothing"})}}));break;case"iter":B=this;x.fx.sequence({condition:function(){return E.length!=0},step:function(){B.removeNode(E.shift(),{type:"nothing"});x.fx.clearLabels()},onComplete:function(){y.onComplete()},duration:Math.ceil(y.duration/E.length)});break;default:this.doError()}},removeEdge:function(D,B){var x=this.viz;var z=r(this.options,x.controller,B);var y=(h(D[0])=="string")?[D]:D;var A,C,E;switch(z.type){case"nothing":for(A=0;A<y.length;A++){x.graph.removeAdjacence(y[A][0],y[A][1])}break;case"replot":this.removeEdge(y,{type:"nothing"});x.refresh(true);break;case"fade:seq":case"fade":C=this;for(A=0;A<y.length;A++){E=x.graph.getAdjacence(y[A][0],y[A][1]);if(E){E[0].endAlpha=0;E[1].endAlpha=0}}x.fx.animate(r(z,{modes:["fade:vertex"],onComplete:function(){C.removeEdge(y,{type:"nothing"});x.reposition();x.fx.animate(r(z,{modes:["linear"]}))}}));break;case"fade:con":C=this;for(A=0;A<y.length;A++){E=x.graph.getAdjacence(y[A][0],y[A][1]);if(E){E[0].endAlpha=0;E[0].ignore=true;E[1].endAlpha=0;E[1].ignore=true}}x.reposition();x.fx.animate(r(z,{modes:["fade:vertex","linear"],onComplete:function(){C.removeEdge(y,{type:"nothing"})}}));break;case"iter":C=this;x.fx.sequence({condition:function(){return y.length!=0},step:function(){C.removeEdge(y.shift(),{type:"nothing"});x.fx.clearLabels()},onComplete:function(){z.onComplete()},duration:Math.ceil(z.duration/y.length)});break;default:this.doError()}},sum:function(E,y){var C=this.viz;var F=r(this.options,C.controller,y),B=C.root;var A,D;C.root=y.id||C.root;switch(F.type){case"nothing":D=C.construct(E);A=Graph.Util;A.eachNode(D,function(G){A.eachAdjacency(G,function(H){C.graph.addAdjacence(H.nodeFrom,H.nodeTo,H.data)})});break;case"replot":C.refresh(true);this.sum(E,{type:"nothing"});C.refresh(true);break;case"fade:seq":case"fade":case"fade:con":A=Graph.Util;that=this;D=C.construct(E);var x=this.preprocessSum(D);var z=!x?["fade:nodes"]:["fade:nodes","fade:vertex"];C.reposition();if(F.type!="fade:con"){C.fx.animate(r(F,{modes:["linear"],onComplete:function(){C.fx.animate(r(F,{modes:z,onComplete:function(){F.onComplete()}}))}}))}else{A.eachNode(C.graph,function(G){if(G.id!=B&&G.pos.getp().equals(Polar.KER)){G.pos.set(G.endPos);G.startPos.set(G.endPos)}});C.fx.animate(r(F,{modes:["linear"].concat(z)}))}break;default:this.doError()}},morph:function(E,y){var C=this.viz;var F=r(this.options,C.controller,y),B=C.root;var A,D;C.root=y.id||C.root;switch(F.type){case"nothing":D=C.construct(E);A=Graph.Util;A.eachNode(D,function(G){A.eachAdjacency(G,function(H){C.graph.addAdjacence(H.nodeFrom,H.nodeTo,H.data)})});A.eachNode(C.graph,function(G){A.eachAdjacency(G,function(H){if(!D.getAdjacence(H.nodeFrom.id,H.nodeTo.id)){C.graph.removeAdjacence(H.nodeFrom.id,H.nodeTo.id)}});if(!D.hasNode(G.id)){C.graph.removeNode(G.id)}});break;case"replot":C.fx.clearLabels(true);this.morph(E,{type:"nothing"});C.refresh(true);C.refresh(true);break;case"fade:seq":case"fade":case"fade:con":A=Graph.Util;that=this;D=C.construct(E);var x=this.preprocessSum(D);A.eachNode(C.graph,function(G){if(!D.hasNode(G.id)){G.alpha=1;G.startAlpha=1;G.endAlpha=0;G.ignore=true}});A.eachNode(C.graph,function(G){if(G.ignore){return}A.eachAdjacency(G,function(H){if(H.nodeFrom.ignore||H.nodeTo.ignore){return}var I=D.getNode(H.nodeFrom.id);var J=D.getNode(H.nodeTo.id);if(!I.adjacentTo(J)){var K=C.graph.getAdjacence(I.id,J.id);x=true;K[0].alpha=1;K[0].startAlpha=1;K[0].endAlpha=0;K[0].ignore=true;K[1].alpha=1;K[1].startAlpha=1;K[1].endAlpha=0;K[1].ignore=true}})});var z=!x?["fade:nodes"]:["fade:nodes","fade:vertex"];C.reposition();A.eachNode(C.graph,function(G){if(G.id!=B&&G.pos.getp().equals(Polar.KER)){G.pos.set(G.endPos);G.startPos.set(G.endPos)}});C.fx.animate(r(F,{modes:["polar"].concat(z),onComplete:function(){A.eachNode(C.graph,function(G){if(G.ignore){C.graph.removeNode(G.id)}});A.eachNode(C.graph,function(G){A.eachAdjacency(G,function(H){if(H.ignore){C.graph.removeAdjacence(H.nodeFrom.id,H.nodeTo.id)}})});F.onComplete()}}));break;default:this.doError()}},preprocessSum:function(z){var x=this.viz;var y=Graph.Util;y.eachNode(z,function(B){if(!x.graph.hasNode(B.id)){x.graph.addNode(B);var C=x.graph.getNode(B.id);C.alpha=0;C.startAlpha=0;C.endAlpha=1}});var A=false;y.eachNode(z,function(B){y.eachAdjacency(B,function(C){var D=x.graph.getNode(C.nodeFrom.id);var E=x.graph.getNode(C.nodeTo.id);if(!D.adjacentTo(E)){var F=x.graph.addAdjacence(D,E,C.data);if(D.startAlpha==D.endAlpha&&E.startAlpha==E.endAlpha){A=true;F[0].alpha=0;F[0].startAlpha=0;F[0].endAlpha=1;F[1].alpha=0;F[1].startAlpha=0;F[1].endAlpha=1}}})});return A}};Graph.Plot={Interpolator:{moebius:function(C,E,A){if(E<=1||A.norm()<=1){var z=A.x,D=A.y;var B=C.startPos.getc().moebiusTransformation(A);C.pos.setc(B.x,B.y);A.x=z;A.y=D}},linear:function(x,A){var z=x.startPos.getc(true);var y=x.endPos.getc(true);x.pos.setc((y.x-z.x)*A+z.x,(y.y-z.y)*A+z.y)},"fade:nodes":function(x,A){if(A<=1&&(x.endAlpha!=x.alpha)){var z=x.startAlpha;var y=x.endAlpha;x.alpha=z+(y-z)*A}},"fade:vertex":function(x,A){var z=x.adjacencies;for(var y in z){this["fade:nodes"](z[y],A)}},polar:function(y,B){var A=y.startPos.getp(true);var z=y.endPos.getp();var x=z.interpolate(A,B);y.pos.setp(x.theta,x.rho)}},labelsHidden:false,labelContainer:false,labels:{},getLabelContainer:function(){return this.labelContainer?this.labelContainer:this.labelContainer=document.getElementById(this.viz.config.labelContainer)},getLabel:function(x){return(x in this.labels&&this.labels[x]!=null)?this.labels[x]:this.labels[x]=document.getElementById(x)},hideLabels:function(y){var x=this.getLabelContainer();if(y){x.style.display="none"}else{x.style.display=""}this.labelsHidden=y},clearLabels:function(x){for(var y in this.labels){if(x||!this.viz.graph.hasNode(y)){this.disposeLabel(y);delete this.labels[y]}}},disposeLabel:function(y){var x=this.getLabel(y);if(x&&x.parentNode){x.parentNode.removeChild(x)}},hideLabel:function(B,x){B=j(B);var y=x?"":"none",z,A=this;g(B,function(D){var C=A.getLabel(D.id);if(C){C.style.display=y}})},sequence:function(y){var z=this;y=r({condition:m(false),step:b,onComplete:b,duration:200},y||{});var x=setInterval(function(){if(y.condition()){y.step()}else{clearInterval(x);y.onComplete()}z.viz.refresh(true)},y.duration)},animate:function(z,y){var B=this,x=this.viz,C=x.graph,A=Graph.Util;z=r(x.controller,z||{});if(z.hideLabels){this.hideLabels(true)}this.animation.setOptions(r(z,{$animating:false,compute:function(E){var D=y?y.scale(-E):null;A.eachNode(C,function(G){for(var F=0;F<z.modes.length;F++){B.Interpolator[z.modes[F]](G,E,D)}});B.plot(z,this.$animating);this.$animating=true},complete:function(){A.eachNode(C,function(D){D.startPos.set(D.pos);D.startAlpha=D.alpha});if(z.hideLabels){B.hideLabels(false)}B.plot(z);z.onComplete();z.onAfterCompute()}})).start()},plot:function(y,G){var E=this.viz,B=E.graph,z=E.canvas,x=E.root,C=this,F=z.getCtx(),D=Graph.Util;y=y||this.viz.controller;y.clearCanvas&&z.clear();var A=!!B.getNode(x).visited;D.eachNode(B,function(H){D.eachAdjacency(H,function(I){var J=I.nodeTo;if(!!J.visited===A&&H.drawn&&J.drawn){!G&&y.onBeforePlotLine(I);F.save();F.globalAlpha=Math.min(Math.min(H.alpha,J.alpha),I.alpha);C.plotLine(I,z,G);F.restore();!G&&y.onAfterPlotLine(I)}});F.save();if(H.drawn){F.globalAlpha=H.alpha;!G&&y.onBeforePlotNode(H);C.plotNode(H,z,G);!G&&y.onAfterPlotNode(H)}if(!C.labelsHidden&&y.withLabels){if(H.drawn&&F.globalAlpha>=0.95){C.plotLabel(z,H,y)}else{C.hideLabel(H,false)}}F.restore();H.visited=!A})},plotLabel:function(A,B,z){var C=B.id,x=this.getLabel(C);if(!x&&!(x=document.getElementById(C))){x=document.createElement("div");var y=this.getLabelContainer();y.appendChild(x);x.id=C;x.className="node";x.style.position="absolute";z.onCreateLabel(x,B);this.labels[B.id]=x}this.placeLabel(x,B,z)},plotNode:function(z,y,G){var E=this.node,B=z.data;var D=E.overridable&&B;var x=D&&B.$lineWidth||E.lineWidth;var A=D&&B.$color||E.color;var F=y.getCtx();F.lineWidth=x;F.fillStyle=A;F.strokeStyle=A;var C=z.data&&z.data.$type||E.type;this.nodeTypes[C].call(this,z,y,G)},plotLine:function(E,z,G){var x=this.edge,B=E.data;var D=x.overridable&&B;var y=D&&B.$lineWidth||x.lineWidth;var A=D&&B.$color||x.color;var F=z.getCtx();F.lineWidth=y;F.fillStyle=A;F.strokeStyle=A;var C=E.data&&E.data.$type||x.type;this.edgeTypes[C].call(this,E,z,G)},fitsInCanvas:function(z,x){var y=x.getSize();if(z.x>=y.width||z.x<0||z.y>=y.height||z.y<0){return false}return true}};var Loader={construct:function(y){var z=(h(y)=="array");var x=new Graph(this.graphOptions);if(!z){(function(A,C){A.addNode(C);for(var B=0,D=C.children;B<D.length;B++){A.addAdjacence(C,D[B]);arguments.callee(A,D[B])}})(x,y)}else{(function(B,E){var H=function(J){for(var I=0;I<E.length;I++){if(E[I].id==J){return E[I]}}return undefined};for(var D=0;D<E.length;D++){B.addNode(E[D]);for(var C=0,A=E[D].adjacencies;C<A.length;C++){var F=A[C],G;if(typeof A[C]!="string"){G=F.data;F=F.nodeTo}B.addAdjacence(E[D],H(F),G)}}})(x,y)}return x},loadJSON:function(y,x){this.json=y;this.graph=this.construct(y);if(h(y)!="array"){this.root=y.id}else{this.root=y[x?x:0].id}}};this.Trans={linear:function(x){return x}};(function(){var x=function(A,z){z=j(z);return c(A,{easeIn:function(B){return A(B,z)},easeOut:function(B){return 1-A(1-B,z)},easeInOut:function(B){return(B<=0.5)?A(2*B,z)/2:(2-A(2*(1-B),z))/2}})};var y={Pow:function(A,z){return Math.pow(A,z[0]||6)},Expo:function(z){return Math.pow(2,8*(z-1))},Circ:function(z){return 1-Math.sin(Math.acos(z))},Sine:function(z){return 1-Math.sin((1-z)*Math.PI/2)},Back:function(A,z){z=z[0]||1.618;return Math.pow(A,2)*((z+1)*A-z)},Bounce:function(C){var B;for(var A=0,z=1;1;A+=z,z/=2){if(C>=(7-4*A)/11){B=z*z-Math.pow((11-6*A-11*C)/4,2);break}}return B},Elastic:function(A,z){return Math.pow(2,10*--A)*Math.cos(20*A*Math.PI*(z[0]||1)/3)}};g(y,function(A,z){Trans[z]=x(A)});g(["Quad","Cubic","Quart","Quint"],function(A,z){Trans[A]=x(function(B){return Math.pow(B,[z+2])})})})();var Animation=new o({initalize:function(x){this.setOptions(x)},setOptions:function(x){var y={duration:2500,fps:40,transition:Trans.Quart.easeInOut,compute:b,complete:b};this.opt=r(y,x||{});return this},getTime:function(){return k()},step:function(){var y=this.getTime(),x=this.opt;if(y<this.time+x.duration){var z=x.transition((y-this.time)/x.duration);x.compute(z)}else{this.timer=clearInterval(this.timer);x.compute(1);x.complete()}},start:function(){this.time=0;this.startTimer();return this},startTimer:function(){var y=this,x=this.opt;if(this.timer){return false}this.time=this.getTime()-this.time;this.timer=setInterval((function(){y.step()}),Math.round(1000/x.fps));return true}});(function(){var G=Array.prototype.slice;function E(Q,K,I,O){var M=K.Node,N=Graph.Util;var J=K.multitree;if(M.overridable){var P=-1,L=-1;N.eachNode(Q,function(T){if(T._depth==I&&(!J||("$orn" in T.data)&&T.data.$orn==O)){var R=T.data.$width||M.width;var S=T.data.$height||M.height;P=(P<R)?R:P;L=(L<S)?S:L}});return{width:P<0?M.width:P,height:L<0?M.height:L}}else{return M}}function H(J,M,L,I){var K=(I=="left"||I=="right")?"y":"x";J[M][K]+=L}function C(J,K){var I=[];g(J,function(L){L=G.call(L);L[0]+=K;L[1]+=K;I.push(L)});return I}function F(L,I){if(L.length==0){return I}if(I.length==0){return L}var K=L.shift(),J=I.shift();return[[K[0],J[1]]].concat(F(L,I))}function A(I,J){J=J||[];if(I.length==0){return J}var K=I.pop();return A(I,F(K,J))}function D(L,J,M,I,K){if(L.length<=K||J.length<=K){return 0}var O=L[K][1],N=J[K][0];return Math.max(D(L,J,M,I,++K)+M,O-N+I)}function B(L,J,I){function K(O,Q,N){if(Q.length<=N){return[]}var P=Q[N],M=D(O,P,J,I,0);return[M].concat(K(F(O,C(P,M)),Q,++N))}return K([],L,0)}function y(M,L,K){function I(P,R,O){if(R.length<=O){return[]}var Q=R[O],N=-D(Q,P,L,K,0);return[N].concat(I(F(C(Q,N),P),R,++O))}M=G.call(M);var J=I([],M.reverse(),0);return J.reverse()}function x(O,M,J,P){var K=B(O,M,J),N=y(O,M,J);if(P=="left"){N=K}else{if(P=="right"){K=N}}for(var L=0,I=[];L<K.length;L++){I[L]=(K[L]+N[L])/2}return I}function z(J,T,K,aa,Y){var M=aa.multitree;var S=["x","y"],P=["width","height"];var L=+(Y=="left"||Y=="right");var Q=S[L],Z=S[1-L];var V=aa.Node;var O=P[L],X=P[1-L];var N=aa.siblingOffset;var W=aa.subtreeOffset;var U=aa.align;var I=Graph.Util;function R(ad,ah,al){var ac=(V.overridable&&ad.data["$"+O])||V[O];var ak=ah||((V.overridable&&ad.data["$"+X])||V[X]);var ao=[],am=[],ai=false;var ab=ak+aa.levelDistance;I.eachSubnode(ad,function(aq){if(aq.exist&&(!M||("$orn" in aq.data)&&aq.data.$orn==Y)){if(!ai){ai=E(J,aa,aq._depth,Y)}var ap=R(aq,ai[X],al+ab);ao.push(ap.tree);am.push(ap.extent)}});var ag=x(am,W,N,U);for(var af=0,ae=[],aj=[];af<ao.length;af++){H(ao[af],K,ag[af],Y);aj.push(C(am[af],ag[af]))}var an=[[-ac/2,ac/2]].concat(A(aj));ad[K][Q]=0;if(Y=="top"||Y=="left"){ad[K][Z]=al}else{ad[K][Z]=-al}return{tree:ad,extent:an}}R(T,false,0)}this.ST=(function(){var J=[];function K(P){P=P||this.clickedNode;var M=this.geom,T=Graph.Util;var U=this.graph;var N=this.canvas;var L=P._depth,Q=[];T.eachNode(U,function(V){if(V.exist&&!V.selected){if(T.isDescendantOf(V,P.id)){if(V._depth<=L){Q.push(V)}}else{Q.push(V)}}});var R=M.getRightLevelToShow(P,N);T.eachLevel(P,R,R,function(V){if(V.exist&&!V.selected){Q.push(V)}});for(var S=0;S<J.length;S++){var O=this.graph.getNode(J[S]);if(!T.isDescendantOf(O,P.id)){Q.push(O)}}return Q}function I(O){var N=[],M=Graph.Util,L=this.config;O=O||this.clickedNode;M.eachLevel(this.clickedNode,0,L.levelsToShow,function(P){if(L.multitree&&!("$orn" in P.data)&&M.anySubnode(P,function(Q){return Q.exist&&!Q.drawn})){N.push(P)}else{if(P.drawn&&!M.anySubnode(P,"drawn")){N.push(P)}}});return N}return new o({Implements:Loader,initialize:function(O,L){var M={onBeforeCompute:b,onAfterCompute:b,onCreateLabel:b,onPlaceLabel:b,onComplete:b,onBeforePlotNode:b,onAfterPlotNode:b,onBeforePlotLine:b,onAfterPlotLine:b,request:false};var N={orientation:"left",labelContainer:O.id+"-label",levelsToShow:2,subtreeOffset:8,siblingOffset:5,levelDistance:30,withLabels:true,clearCanvas:true,align:"center",indent:10,multitree:false,constrained:true,Node:{overridable:false,type:"rectangle",color:"#ccb",lineWidth:1,height:20,width:90,dim:15,align:"center"},Edge:{overridable:false,type:"line",color:"#ccc",dim:15,lineWidth:1},duration:700,fps:25,transition:Trans.Quart.easeInOut};this.controller=this.config=r(N,M,L);this.canvas=O;this.graphOptions={complex:true};this.graph=new Graph(this.graphOptions);this.fx=new ST.Plot(this);this.op=new ST.Op(this);this.group=new ST.Group(this);this.geom=new ST.Geom(this);this.clickedNode=null},plot:function(){this.fx.plot(this.controller)},switchPosition:function(Q,P,O){var L=this.geom,M=this.fx,N=this;if(!M.busy){M.busy=true;this.contract({onComplete:function(){L.switchOrientation(Q);N.compute("endPos",false);M.busy=false;if(P=="animate"){N.onClick(N.clickedNode.id,O)}else{if(P=="replot"){N.select(N.clickedNode.id,O)}}}},Q)}},switchAlignment:function(N,M,L){this.config.align=N;if(M=="animate"){this.select(this.clickedNode.id,L)}else{if(M=="replot"){this.onClick(this.clickedNode.id,L)}}},addNodeInPath:function(L){J.push(L);this.select((this.clickedNode&&this.clickedNode.id)||this.root)},clearNodesInPath:function(L){J.length=0;this.select((this.clickedNode&&this.clickedNode.id)||this.root)},refresh:function(){this.reposition();this.select((this.clickedNode&&this.clickedNode.id)||this.root)},reposition:function(){Graph.Util.computeLevels(this.graph,this.root,0,"ignore");this.geom.setRightLevelToShow(this.clickedNode,this.canvas);Graph.Util.eachNode(this.graph,function(L){if(L.exist){L.drawn=true}});this.compute("endPos")},compute:function(N,M){var O=N||"startPos";var L=this.graph.getNode(this.root);c(L,{drawn:true,exist:true,selected:true});if(!!M||!("_depth" in L)){Graph.Util.computeLevels(this.graph,this.root,0,"ignore")}this.computePositions(L,O)},computePositions:function(P,L){var N=this.config;var M=N.multitree;var S=N.align;var O=S!=="center"&&N.indent;var T=N.orientation;var R=M?["top","right","bottom","left"]:[T];var Q=this;g(R,function(U){z(Q.graph,P,L,Q.config,U);var V=["x","y"][+(U=="left"||U=="right")];(function W(X){Graph.Util.eachSubnode(X,function(Y){if(Y.exist&&(!M||("$orn" in Y.data)&&Y.data.$orn==U)){Y[L][V]+=X[L][V];if(O){Y[L][V]+=S=="left"?O:-O}W(Y)}})})(P)})},requestNodes:function(O,P){var M=r(this.controller,P),L=this.config.levelsToShow,N=Graph.Util;if(M.request){var R=[],Q=O._depth;N.eachLevel(O,0,L,function(S){if(S.drawn&&!N.anySubnode(S)){R.push(S);S._level=L-(S._depth-Q)}});this.group.requestNodes(R,M)}else{M.onComplete()}},contract:function(P,Q){var O=this.config.orientation;var L=this.geom,N=this.group;if(Q){L.switchOrientation(Q)}var M=K.call(this);if(Q){L.switchOrientation(O)}N.contract(M,r(this.controller,P))},move:function(M,N){this.compute("endPos",false);var L=N.Move,O={x:L.offsetX,y:L.offsetY};if(L.enable){this.geom.translate(M.endPos.add(O).$scale(-1),"endPos")}this.fx.animate(r(this.controller,{modes:["linear"]},N))},expand:function(M,N){var L=I.call(this,M);this.group.expand(L,r(this.controller,N))},selectPath:function(P){var O=Graph.Util,N=this;O.eachNode(this.graph,function(R){R.selected=false});function Q(S){if(S==null||S.selected){return}S.selected=true;g(N.group.getSiblings([S])[S.id],function(T){T.exist=true;T.drawn=true});var R=O.getParents(S);R=(R.length>0)?R[0]:null;Q(R)}for(var L=0,M=[P.id].concat(J);L<M.length;L++){Q(this.graph.getNode(M[L]))}},setRoot:function(S,R,Q){var P=this,N=this.canvas;var L=this.graph.getNode(this.root);var M=this.graph.getNode(S);function O(){if(this.config.multitree&&M.data.$orn){var U=M.data.$orn;var V={left:"right",right:"left",top:"bottom",bottom:"top"}[U];L.data.$orn=V;(function T(W){Graph.Util.eachSubnode(W,function(X){if(X.id!=S){X.data.$orn=V;T(X)}})})(L);delete M.data.$orn}this.root=S;this.clickedNode=M;Graph.Util.computeLevels(this.graph,this.root,0,"ignore")}delete L.data.$orns;if(R=="animate"){this.onClick(S,{onBeforeMove:function(){O.call(P);P.selectPath(M)}})}else{if(R=="replot"){O.call(this);this.select(this.root)}}},addSubtree:function(L,N,M){if(N=="replot"){this.op.sum(L,c({type:"replot"},M||{}))}else{if(N=="animate"){this.op.sum(L,c({type:"fade:seq"},M||{}))}}},removeSubtree:function(Q,M,P,O){var N=this.graph.getNode(Q),L=[];Graph.Util.eachLevel(N,+!M,false,function(R){L.push(R.id)});if(P=="replot"){this.op.removeNode(L,c({type:"replot"},O||{}))}else{if(P=="animate"){this.op.removeNode(L,c({type:"fade:seq"},O||{}))}}},select:function(L,O){var T=this.group,R=this.geom;var P=this.graph.getNode(L),N=this.canvas;var S=this.graph.getNode(this.root);var M=r(this.controller,O);var Q=this;M.onBeforeCompute(P);this.selectPath(P);this.clickedNode=P;this.requestNodes(P,{onComplete:function(){T.hide(T.prepare(K.call(Q)),M);R.setRightLevelToShow(P,N);Q.compute("pos");Graph.Util.eachNode(Q.graph,function(V){var U=V.pos.getc(true);V.startPos.setc(U.x,U.y);V.endPos.setc(U.x,U.y);V.visited=false});Q.geom.translate(P.endPos.scale(-1),["pos","startPos","endPos"]);T.show(I.call(Q));Q.plot();M.onAfterCompute(Q.clickedNode);M.onComplete()}})},onClick:function(N,U){var O=this.canvas,S=this,R=this.fx,T=Graph.Util,L=this.geom;var Q={Move:{enable:true,offsetX:0,offsetY:0},onBeforeRequest:b,onBeforeContract:b,onBeforeMove:b,onBeforeExpand:b};var M=r(this.controller,Q,U);if(!this.busy){this.busy=true;var P=this.graph.getNode(N);this.selectPath(P,this.clickedNode);this.clickedNode=P;M.onBeforeCompute(P);M.onBeforeRequest(P);this.requestNodes(P,{onComplete:function(){M.onBeforeContract(P);S.contract({onComplete:function(){L.setRightLevelToShow(P,O);M.onBeforeMove(P);S.move(P,{Move:M.Move,onComplete:function(){M.onBeforeExpand(P);S.expand(P,{onComplete:function(){S.busy=false;M.onAfterCompute(N);M.onComplete()}})}})}})}})}}})})();ST.Op=new o({Implements:Graph.Op,initialize:function(I){this.viz=I}});ST.Group=new o({initialize:function(I){this.viz=I;this.canvas=I.canvas;this.config=I.config;this.animation=new Animation;this.nodes=null},requestNodes:function(N,M){var L=0,J=N.length,P={};var K=function(){M.onComplete()};var I=this.viz;if(J==0){K()}for(var O=0;O<J;O++){P[N[O].id]=N[O];M.request(N[O].id,N[O]._level,{onComplete:function(R,Q){if(Q&&Q.children){Q.id=R;I.op.sum(Q,{type:"nothing"})}if(++L==J){Graph.Util.computeLevels(I.graph,I.root,0);K()}}})}},contract:function(K,J){var M=Graph.Util;var I=this.viz;var L=this;K=this.prepare(K);this.animation.setOptions(r(J,{$animating:false,compute:function(N){if(N==1){N=0.99}L.plotStep(1-N,J,this.$animating);this.$animating="contract"},complete:function(){L.hide(K,J)}})).start()},hide:function(K,J){var N=Graph.Util,I=this.viz;for(var L=0;L<K.length;L++){if(true||!J||!J.request){N.eachLevel(K[L],1,false,function(O){if(O.exist){c(O,{drawn:false,exist:false})}})}else{var M=[];N.eachLevel(K[L],1,false,function(O){M.push(O.id)});I.op.removeNode(M,{type:"nothing"});I.fx.clearLabels()}}J.onComplete()},expand:function(J,I){var L=this,K=Graph.Util;this.show(J);this.animation.setOptions(r(I,{$animating:false,compute:function(M){L.plotStep(M,I,this.$animating);this.$animating="expand"},complete:function(){L.plotStep(undefined,I,false);I.onComplete()}})).start()},show:function(I){var K=Graph.Util,J=this.config;this.prepare(I);g(I,function(M){if(J.multitree&&!("$orn" in M.data)){delete M.data.$orns;var L=" ";K.eachSubnode(M,function(N){if(("$orn" in N.data)&&L.indexOf(N.data.$orn)<0&&N.exist&&!N.drawn){L+=N.data.$orn+" "}});M.data.$orns=L}K.eachLevel(M,0,J.levelsToShow,function(N){if(N.exist){N.drawn=true}})})},prepare:function(I){this.nodes=this.getNodesWithChildren(I);return this.nodes},getNodesWithChildren:function(K){var J=[],O=Graph.Util,M=this.config,I=this.viz.root;K.sort(function(R,Q){return(R._depth<=Q._depth)-(R._depth>=Q._depth)});for(var N=0;N<K.length;N++){if(O.anySubnode(K[N],"exist")){for(var L=N+1,P=false;!P&&L<K.length;L++){if(!M.multitree||"$orn" in K[L].data){P=P||O.isDescendantOf(K[N],K[L].id)}}if(!P){J.push(K[N])}}}return J},plotStep:function(T,O,V){var S=this.viz,L=this.config,K=S.canvas,U=K.getCtx(),I=this.nodes,Q=Graph.Util;var N,M;var J={};for(N=0;N<I.length;N++){M=I[N];J[M.id]=[];var R=L.multitree&&!("$orn" in M.data);var P=R&&M.data.$orns;Q.eachSubgraph(M,function(W){if(R&&P&&P.indexOf(W.data.$orn)>0&&W.drawn){W.drawn=false;J[M.id].push(W)}else{if((!R||!P)&&W.drawn){W.drawn=false;J[M.id].push(W)}}});M.drawn=true}if(I.length>0){S.fx.plot()}for(N in J){g(J[N],function(W){W.drawn=true})}for(N=0;N<I.length;N++){M=I[N];U.save();S.fx.plotSubtree(M,O,T,V);U.restore()}},getSiblings:function(I){var K={},J=Graph.Util;g(I,function(N){var M=J.getParents(N);if(M.length==0){K[N.id]=[N]}else{var L=[];J.eachSubnode(M[0],function(O){L.push(O)});K[N.id]=L}});return K}});ST.Geom=new o({initialize:function(I){this.viz=I;this.config=I.config;this.node=I.config.Node;this.edge=I.config.Edge},translate:function(J,I){I=j(I);Graph.Util.eachNode(this.viz.graph,function(K){g(I,function(L){K[L].$add(J)})})},switchOrientation:function(I){this.config.orientation=I},dispatch:function(){var J=Array.prototype.slice.call(arguments);var K=J.shift(),I=J.length;var L=function(M){return typeof M=="function"?M():M};if(I==2){return(K=="top"||K=="bottom")?L(J[0]):L(J[1])}else{if(I==4){switch(K){case"top":return L(J[0]);case"right":return L(J[1]);case"bottom":return L(J[2]);case"left":return L(J[3])}}}return undefined},getSize:function(J,I){var L=this.node,M=J.data,K=this.config;var O=L.overridable,P=K.siblingOffset;var R=(this.config.multitree&&("$orn" in J.data)&&J.data.$orn)||this.config.orientation;var Q=(O&&M.$width||L.width)+P;var N=(O&&M.$height||L.height)+P;if(!I){return this.dispatch(R,N,Q)}else{return this.dispatch(R,Q,N)}},getTreeBaseSize:function(M,N,J){var K=this.getSize(M,true),I=0,L=this;if(J(N,M)){return K}if(N===0){return 0}Graph.Util.eachSubnode(M,function(O){I+=L.getTreeBaseSize(O,N-1,J)});return(K>I?K:I)+this.config.subtreeOffset},getEdge:function(I,N,Q){var M=function(S,R){return function(){return I.pos.add(new Complex(S,R))}};var L=this.node;var O=this.node.overridable,J=I.data;var P=O&&J.$width||L.width;var K=O&&J.$height||L.height;if(N=="begin"){if(L.align=="center"){return this.dispatch(Q,M(0,K/2),M(-P/2,0),M(0,-K/2),M(P/2,0))}else{if(L.align=="left"){return this.dispatch(Q,M(0,K),M(0,0),M(0,0),M(P,0))}else{if(L.align=="right"){return this.dispatch(Q,M(0,0),M(-P,0),M(0,-K),M(0,0))}else{throw"align: not implemented"}}}}else{if(N=="end"){if(L.align=="center"){return this.dispatch(Q,M(0,-K/2),M(P/2,0),M(0,K/2),M(-P/2,0))}else{if(L.align=="left"){return this.dispatch(Q,M(0,0),M(P,0),M(0,K),M(0,0))}else{if(L.align=="right"){return this.dispatch(Q,M(0,-K),M(0,0),M(0,0),M(-P,0))}else{throw"align: not implemented"}}}}}},getScaledTreePosition:function(I,J){var L=this.node;var O=this.node.overridable,K=I.data;var P=(O&&K.$width||L.width);var M=(O&&K.$height||L.height);var Q=(this.config.multitree&&("$orn" in I.data)&&I.data.$orn)||this.config.orientation;var N=function(S,R){return function(){return I.pos.add(new Complex(S,R)).$scale(1-J)}};if(L.align=="left"){return this.dispatch(Q,N(0,M),N(0,0),N(0,0),N(P,0))}else{if(L.align=="center"){return this.dispatch(Q,N(0,M/2),N(-P/2,0),N(0,-M/2),N(P/2,0))}else{if(L.align=="right"){return this.dispatch(Q,N(0,0),N(-P,0),N(0,-M),N(0,0))}else{throw"align: not implemented"}}}},treeFitsInCanvas:function(N,I,O){var K=I.getSize(N);var L=(this.config.multitree&&("$orn" in N.data)&&N.data.$orn)||this.config.orientation;var J=this.dispatch(L,K.width,K.height);var M=this.getTreeBaseSize(N,O,function(Q,P){return Q===0||!Graph.Util.anySubnode(P)});return(M<J)},setRightLevelToShow:function(K,I){var L=this.getRightLevelToShow(K,I),J=this.viz.fx;Graph.Util.eachLevel(K,0,this.config.levelsToShow,function(N){var M=N._depth-K._depth;if(M>L){N.drawn=false;N.exist=false;J.hideLabel(N,false)}else{N.exist=true}});K.drawn=true},getRightLevelToShow:function(L,J){var I=this.config;var M=I.levelsToShow;var K=I.constrained;if(!K){return M}while(!this.treeFitsInCanvas(L,J,M)&&M>1){M--}return M}});ST.Plot=new o({Implements:Graph.Plot,initialize:function(I){this.viz=I;this.config=I.config;this.node=this.config.Node;this.edge=this.config.Edge;this.animation=new Animation;this.nodeTypes=new ST.Plot.NodeTypes;this.edgeTypes=new ST.Plot.EdgeTypes},plotSubtree:function(N,M,P,K){var I=this.viz,L=I.canvas;P=Math.min(Math.max(0.001,P),1);if(P>=0){N.drawn=false;var J=L.getCtx();var O=I.geom.getScaledTreePosition(N,P);J.translate(O.x,O.y);J.scale(P,P)}this.plotTree(N,!P,M,K);if(P>=0){N.drawn=true}},plotTree:function(L,M,I,S){var O=this,Q=this.viz,J=Q.canvas,K=this.config,R=J.getCtx();var P=K.multitree&&!("$orn" in L.data);var N=P&&L.data.$orns;Graph.Util.eachSubnode(L,function(U){if((!P||N.indexOf(U.data.$orn)>0)&&U.exist&&U.drawn){var T=L.getAdjacency(U.id);!S&&I.onBeforePlotLine(T);R.globalAlpha=Math.min(L.alpha,U.alpha);O.plotLine(T,J,S);!S&&I.onAfterPlotLine(T);O.plotTree(U,M,I,S)}});if(L.drawn){R.globalAlpha=L.alpha;!S&&I.onBeforePlotNode(L);this.plotNode(L,J,S);!S&&I.onAfterPlotNode(L);if(M&&R.globalAlpha>=0.95){this.plotLabel(J,L,I)}else{this.hideLabel(L,false)}}else{this.hideLabel(L,true)}},placeLabel:function(T,L,O){var R=L.pos.getc(true),M=this.node,J=this.viz.canvas;var S=M.overridable&&L.data.$width||M.width;var N=M.overridable&&L.data.$height||M.height;var P=J.getSize();var K,Q;if(M.align=="center"){K={x:Math.round(R.x-S/2+P.width/2),y:Math.round(R.y-N/2+P.height/2)}}else{if(M.align=="left"){Q=this.config.orientation;if(Q=="bottom"||Q=="top"){K={x:Math.round(R.x-S/2+P.width/2),y:Math.round(R.y+P.height/2)}}else{K={x:Math.round(R.x+P.width/2),y:Math.round(R.y-N/2+P.height/2)}}}else{if(M.align=="right"){Q=this.config.orientation;if(Q=="bottom"||Q=="top"){K={x:Math.round(R.x-S/2+P.width/2),y:Math.round(R.y-N+P.height/2)}}else{K={x:Math.round(R.x-S+P.width/2),y:Math.round(R.y-N/2+P.height/2)}}}else{throw"align: not implemented"}}}var I=T.style;I.left=K.x+"px";I.top=K.y+"px";I.display=this.fitsInCanvas(K,J)?"":"none";O.onPlaceLabel(T,L)},getAlignedPos:function(N,L,I){var K=this.node;var M,J;if(K.align=="center"){M={x:N.x-L/2,y:N.y-I/2}}else{if(K.align=="left"){J=this.config.orientation;if(J=="bottom"||J=="top"){M={x:N.x-L/2,y:N.y}}else{M={x:N.x,y:N.y-I/2}}}else{if(K.align=="right"){J=this.config.orientation;if(J=="bottom"||J=="top"){M={x:N.x-L/2,y:N.y-I}}else{M={x:N.x-L,y:N.y-I/2}}}else{throw"align: not implemented"}}}return M},getOrientation:function(I){var K=this.config;var J=K.orientation;if(K.multitree){var L=I.nodeFrom;var M=I.nodeTo;J=(("$orn" in L.data)&&L.data.$orn)||(("$orn" in M.data)&&M.data.$orn)}return J}});ST.Plot.NodeTypes=new o({none:function(){},circle:function(M,J){var P=M.pos.getc(true),L=this.node,N=M.data;var K=L.overridable&&N;var O=K&&N.$dim||L.dim;var I=this.getAlignedPos(P,O*2,O*2);J.path("fill",function(Q){Q.arc(I.x+O,I.y+O,O,0,Math.PI*2,true)})},square:function(M,J){var P=M.pos.getc(true),L=this.node,N=M.data;var K=L.overridable&&N;var O=K&&N.$dim||L.dim;var I=this.getAlignedPos(P,O,O);J.getCtx().fillRect(I.x,I.y,O,O)},ellipse:function(K,J){var N=K.pos.getc(true),O=this.node,L=K.data;var M=O.overridable&&L;var I=(M&&L.$width||O.width)/2;var Q=(M&&L.$height||O.height)/2;var P=this.getAlignedPos(N,I*2,Q*2);var R=J.getCtx();R.save();R.scale(I/Q,Q/I);J.path("fill",function(S){S.arc((P.x+I)*(Q/I),(P.y+Q)*(I/Q),Q,0,Math.PI*2,true)});R.restore()},rectangle:function(K,J){var N=K.pos.getc(true),O=this.node,L=K.data;var M=O.overridable&&L;var I=M&&L.$width||O.width;var Q=M&&L.$height||O.height;var P=this.getAlignedPos(N,I,Q);J.getCtx().fillRect(P.x,P.y,I,Q)}});ST.Plot.EdgeTypes=new o({none:function(){},line:function(J,L){var K=this.getOrientation(J);var N=J.nodeFrom,O=J.nodeTo;var M=this.viz.geom.getEdge(N._depth<O._depth?N:O,"begin",K);var I=this.viz.geom.getEdge(N._depth<O._depth?O:N,"end",K);L.path("stroke",function(P){P.moveTo(M.x,M.y);P.lineTo(I.x,I.y)})},"quadratic:begin":function(R,J){var Q=this.getOrientation(R);var M=R.data,I=this.edge;var O=R.nodeFrom,S=R.nodeTo;var K=this.viz.geom.getEdge(O._depth<S._depth?O:S,"begin",Q);var L=this.viz.geom.getEdge(O._depth<S._depth?S:O,"end",Q);var P=I.overridable&&M;var N=P&&M.$dim||I.dim;switch(Q){case"left":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x+N,K.y,L.x,L.y)});break;case"right":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x-N,K.y,L.x,L.y)});break;case"top":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x,K.y+N,L.x,L.y)});break;case"bottom":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(K.x,K.y-N,L.x,L.y)});break}},"quadratic:end":function(R,J){var Q=this.getOrientation(R);var M=R.data,I=this.edge;var O=R.nodeFrom,S=R.nodeTo;var K=this.viz.geom.getEdge(O._depth<S._depth?O:S,"begin",Q);var L=this.viz.geom.getEdge(O._depth<S._depth?S:O,"end",Q);var P=I.overridable&&M;var N=P&&M.$dim||I.dim;switch(Q){case"left":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x-N,L.y,L.x,L.y)});break;case"right":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x+N,L.y,L.x,L.y)});break;case"top":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x,L.y-N,L.x,L.y)});break;case"bottom":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.quadraticCurveTo(L.x,L.y+N,L.x,L.y)});break}},bezier:function(R,J){var M=R.data,I=this.edge;var Q=this.getOrientation(R);var O=R.nodeFrom,S=R.nodeTo;var K=this.viz.geom.getEdge(O._depth<S._depth?O:S,"begin",Q);var L=this.viz.geom.getEdge(O._depth<S._depth?S:O,"end",Q);var P=I.overridable&&M;var N=P&&M.$dim||I.dim;switch(Q){case"left":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x+N,K.y,L.x-N,L.y,L.x,L.y)});break;case"right":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x-N,K.y,L.x+N,L.y,L.x,L.y)});break;case"top":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x,K.y+N,L.x,L.y-N,L.x,L.y)});break;case"bottom":J.path("stroke",function(T){T.moveTo(K.x,K.y);T.bezierCurveTo(K.x,K.y-N,L.x,L.y+N,L.x,L.y)});break}},arrow:function(Q,L){var W=this.getOrientation(Q);var U=Q.nodeFrom,M=Q.nodeTo;var Z=Q.data,P=this.edge;var R=P.overridable&&Z;var O=R&&Z.$dim||P.dim;if(R&&Z.$direction&&Z.$direction.length>1){var K={};K[U.id]=U;K[M.id]=M;var V=Z.$direction;U=K[V[0]];M=K[V[1]]}var N=this.viz.geom.getEdge(U,"begin",W);var S=this.viz.geom.getEdge(M,"end",W);var T=new Complex(S.x-N.x,S.y-N.y);T.$scale(O/T.norm());var X=new Complex(S.x-T.x,S.y-T.y);var Y=new Complex(-T.y/2,T.x/2);var J=X.add(Y),I=X.$add(Y.$scale(-1));L.path("stroke",function(aa){aa.moveTo(N.x,N.y);aa.lineTo(S.x,S.y)});L.path("fill",function(aa){aa.moveTo(J.x,J.y);aa.lineTo(I.x,I.y);aa.lineTo(S.x,S.y)})}})})();var AngularWidth={setAngularWidthForNodes:function(){var x=this.config.Node;var z=x.overridable;var y=x.dim;Graph.Util.eachBFS(this.graph,this.root,function(C,A){var B=(z&&C.data&&C.data.$aw)||y;C._angularWidth=B/A},"ignore")},setSubtreesAngularWidth:function(){var x=this;Graph.Util.eachNode(this.graph,function(y){x.setSubtreeAngularWidth(y)},"ignore")},setSubtreeAngularWidth:function(A){var z=this,y=A._angularWidth,x=0;Graph.Util.eachSubnode(A,function(B){z.setSubtreeAngularWidth(B);x+=B._treeAngularWidth},"ignore");A._treeAngularWidth=Math.max(y,x)},computeAngularWidths:function(){this.setAngularWidthForNodes();this.setSubtreesAngularWidth()}};this.RGraph=new o({Implements:[Loader,AngularWidth],initialize:function(A,x){var z={labelContainer:A.id+"-label",interpolation:"linear",levelDistance:100,withLabels:true,Node:{overridable:false,type:"circle",dim:3,color:"#ccb",width:5,height:5,lineWidth:1},Edge:{overridable:false,type:"line",color:"#ccb",lineWidth:1},fps:40,duration:2500,transition:Trans.Quart.easeInOut,clearCanvas:true};var y={onBeforeCompute:b,onAfterCompute:b,onCreateLabel:b,onPlaceLabel:b,onComplete:b,onBeforePlotLine:b,onAfterPlotLine:b,onBeforePlotNode:b,onAfterPlotNode:b};this.controller=this.config=r(z,y,x);this.graphOptions={complex:false,Node:{selected:false,exist:true,drawn:true}};this.graph=new Graph(this.graphOptions);this.fx=new RGraph.Plot(this);this.op=new RGraph.Op(this);this.json=null;this.canvas=A;this.root=null;this.busy=false;this.parent=false},refresh:function(){this.compute();this.plot()},reposition:function(){this.compute("endPos")},plot:function(){this.fx.plot()},compute:function(y){var z=y||["pos","startPos","endPos"];var x=this.graph.getNode(this.root);x._depth=0;Graph.Util.computeLevels(this.graph,this.root,0,"ignore");this.computeAngularWidths();this.computePositions(z)},computePositions:function(E){var y=j(E);var D=this.graph;var C=Graph.Util;var x=this.graph.getNode(this.root);var B=this.parent;var z=this.config;for(var A=0;A<y.length;A++){x[y[A]]=l(0,0)}x.angleSpan={begin:0,end:2*Math.PI};x._rel=1;C.eachBFS(this.graph,this.root,function(I){var L=I.angleSpan.end-I.angleSpan.begin;var O=(I._depth+1)*z.levelDistance;var M=I.angleSpan.begin;var N=0,F=[];C.eachSubnode(I,function(Q){N+=Q._treeAngularWidth;F.push(Q)},"ignore");if(B&&B.id==I.id&&F.length>0&&F[0].dist){F.sort(function(R,Q){return(R.dist>=Q.dist)-(R.dist<=Q.dist)})}for(var J=0;J<F.length;J++){var H=F[J];if(!H._flag){H._rel=H._treeAngularWidth/N;var P=H._rel*L;var G=M+P/2;for(var K=0;K<y.length;K++){H[y[K]]=l(G,O)}H.angleSpan={begin:M,end:M+P};M+=P}}},"ignore")},getNodeAndParentAngle:function(E){var z=false;var D=this.graph.getNode(E);var B=Graph.Util.getParents(D);var A=(B.length>0)?B[0]:false;if(A){var x=A.pos.getc(),C=D.pos.getc();var y=x.add(C.scale(-1));z=Math.atan2(y.y,y.x);if(z<0){z+=2*Math.PI}}return{parent:A,theta:z}},tagChildren:function(B,D){if(B.angleSpan){var C=[];Graph.Util.eachAdjacency(B,function(E){C.push(E.nodeTo)},"ignore");var x=C.length;for(var A=0;A<x&&D!=C[A].id;A++){}for(var z=(A+1)%x,y=0;D!=C[z].id;z=(z+1)%x){C[z].dist=y++}}},onClick:function(B,y){if(this.root!=B&&!this.busy){this.busy=true;this.root=B;that=this;this.controller.onBeforeCompute(this.graph.getNode(B));var z=this.getNodeAndParentAngle(B);this.tagChildren(z.parent,B);this.parent=z.parent;this.compute("endPos");var x=z.theta-z.parent.endPos.theta;Graph.Util.eachNode(this.graph,function(C){C.endPos.set(C.endPos.getp().add(l(x,0)))});var A=this.config.interpolation;y=r({onComplete:b},y||{});this.fx.animate(r({hideLabels:true,modes:[A]},y,{onComplete:function(){that.busy=false;y.onComplete()}}))}}});RGraph.Op=new o({Implements:Graph.Op,initialize:function(x){this.viz=x}});RGraph.Plot=new o({Implements:Graph.Plot,initialize:function(x){this.viz=x;this.config=x.config;this.node=x.config.Node;this.edge=x.config.Edge;this.animation=new Animation;this.nodeTypes=new RGraph.Plot.NodeTypes;this.edgeTypes=new RGraph.Plot.EdgeTypes},placeLabel:function(y,C,z){var E=C.pos.getc(true),A=this.viz.canvas;var x=A.getSize();var D={x:Math.round(E.x+x.width/2),y:Math.round(E.y+x.height/2)};var B=y.style;B.left=D.x+"px";B.top=D.y+"px";B.display=this.fitsInCanvas(D,A)?"":"none";z.onPlaceLabel(y,C)}});RGraph.Plot.NodeTypes=new o({none:function(){},circle:function(z,x){var C=z.pos.getc(true),y=this.node,B=z.data;var A=y.overridable&&B&&B.$dim||y.dim;x.path("fill",function(D){D.arc(C.x,C.y,A,0,Math.PI*2,true)})},square:function(A,x){var D=A.pos.getc(true),z=this.node,C=A.data;var B=z.overridable&&C&&C.$dim||z.dim;var y=2*B;x.getCtx().fillRect(D.x-B,D.y-B,y,y)},rectangle:function(B,y){var D=B.pos.getc(true),A=this.node,C=B.data;var z=A.overridable&&C&&C.$width||A.width;var x=A.overridable&&C&&C.$height||A.height;y.getCtx().fillRect(D.x-z/2,D.y-x/2,z,x)},triangle:function(B,y){var F=B.pos.getc(true),G=this.node,C=B.data;var x=G.overridable&&C&&C.$dim||G.dim;var A=F.x,z=F.y-x,I=A-x,H=F.y+x,E=A+x,D=H;y.path("fill",function(J){J.moveTo(A,z);J.lineTo(I,H);J.lineTo(E,D)})},star:function(z,y){var D=z.pos.getc(true),E=this.node,B=z.data;var x=E.overridable&&B&&B.$dim||E.dim;var F=y.getCtx(),C=Math.PI/5;F.save();F.translate(D.x,D.y);F.beginPath();F.moveTo(x,0);for(var A=0;A<9;A++){F.rotate(C);if(A%2==0){F.lineTo((x/0.525731)*0.200811,0)}else{F.lineTo(x,0)}}F.closePath();F.fill();F.restore()}});RGraph.Plot.EdgeTypes=new o({none:function(){},line:function(x,y){var A=x.nodeFrom.pos.getc(true);var z=x.nodeTo.pos.getc(true);y.path("stroke",function(B){B.moveTo(A.x,A.y);B.lineTo(z.x,z.y)})},arrow:function(J,B){var D=J.nodeFrom,A=J.nodeTo;var E=J.data,x=this.edge;var I=x.overridable&&E;var L=I&&E.$dim||14;if(I&&E.$direction&&E.$direction.length>1){var y={};y[D.id]=D;y[A.id]=A;var z=E.$direction;D=y[z[0]];A=y[z[1]]}var N=D.pos.getc(true),C=A.pos.getc(true);var H=new Complex(C.x-N.x,C.y-N.y);H.$scale(L/H.norm());var F=new Complex(C.x-H.x,C.y-H.y);var G=new Complex(-H.y/2,H.x/2);var M=F.add(G),K=F.$add(G.$scale(-1));B.path("stroke",function(O){O.moveTo(N.x,N.y);O.lineTo(C.x,C.y)});B.path("fill",function(O){O.moveTo(M.x,M.y);O.lineTo(K.x,K.y);O.lineTo(C.x,C.y)})}});Complex.prototype.moebiusTransformation=function(z){var x=this.add(z);var y=z.$conjugate().$prod(this);y.x++;return x.$div(y)};Graph.Util.getClosestNodeToOrigin=function(y,z,x){return this.getClosestNodeToPos(y,Polar.KER,z,x)};Graph.Util.getClosestNodeToPos=function(z,C,B,x){var y=null;B=B||"pos";C=C&&C.getc(true)||Complex.KER;var A=function(E,D){var G=E.x-D.x,F=E.y-D.y;return G*G+F*F};this.eachNode(z,function(D){y=(y==null||A(D[B].getc(true),C)<A(y[B].getc(true),C))?D:y},x);return y};Graph.Util.moebiusTransformation=function(z,B,A,y,x){this.eachNode(z,function(D){for(var C=0;C<A.length;C++){var F=B[C].scale(-1),E=y?y:A[C];D[A[C]].set(D[E].getc().moebiusTransformation(F))}},x)};this.Hypertree=new o({Implements:[Loader,AngularWidth],initialize:function(A,x){var z={labelContainer:A.id+"-label",withLabels:true,Node:{overridable:false,type:"circle",dim:7,color:"#ccb",width:5,height:5,lineWidth:1,transform:true},Edge:{overridable:false,type:"hyperline",color:"#ccb",lineWidth:1},clearCanvas:true,fps:40,duration:1500,transition:Trans.Quart.easeInOut};var y={onBeforeCompute:b,onAfterCompute:b,onCreateLabel:b,onPlaceLabel:b,onComplete:b,onBeforePlotLine:b,onAfterPlotLine:b,onBeforePlotNode:b,onAfterPlotNode:b};this.controller=this.config=r(z,y,x);this.graphOptions={complex:false,Node:{selected:false,exist:true,drawn:true}};this.graph=new Graph(this.graphOptions);this.fx=new Hypertree.Plot(this);this.op=new Hypertree.Op(this);this.json=null;this.canvas=A;this.root=null;this.busy=false},refresh:function(x){if(x){this.reposition();Graph.Util.eachNode(this.graph,function(y){y.startPos.rho=y.pos.rho=y.endPos.rho;y.startPos.theta=y.pos.theta=y.endPos.theta})}else{this.compute()}this.plot()},reposition:function(){this.compute("endPos");var x=this.graph.getNode(this.root).pos.getc().scale(-1);Graph.Util.moebiusTransformation(this.graph,[x],["endPos"],"endPos","ignore");Graph.Util.eachNode(this.graph,function(y){if(y.ignore){y.endPos.rho=y.pos.rho;y.endPos.theta=y.pos.theta}})},plot:function(){this.fx.plot()},compute:function(y){var z=y||["pos","startPos"];var x=this.graph.getNode(this.root);x._depth=0;Graph.Util.computeLevels(this.graph,this.root,0,"ignore");this.computeAngularWidths();this.computePositions(z)},computePositions:function(F){var G=j(F);var B=this.graph,D=Graph.Util;var E=this.graph.getNode(this.root),C=this,x=this.config;var H=this.canvas.getSize();var z=Math.min(H.width,H.height)/2;for(var A=0;A<G.length;A++){E[G[A]]=l(0,0)}E.angleSpan={begin:0,end:2*Math.PI};E._rel=1;var y=(function(){var K=0;D.eachNode(B,function(L){K=(L._depth>K)?L._depth:K;L._scale=z},"ignore");for(var J=0.51;J<=1;J+=0.01){var I=(function(L,M){return(1-Math.pow(L,M))/(1-L)})(J,K+1);if(I>=2){return J-0.01}}return 0.5})();D.eachBFS(this.graph,this.root,function(N){var J=N.angleSpan.end-N.angleSpan.begin;var O=N.angleSpan.begin;var M=(function(Q){var R=0;D.eachSubnode(Q,function(S){R+=S._treeAngularWidth},"ignore");return R})(N);for(var L=1,I=0,K=y,P=N._depth;L<=P+1;L++){I+=K;K*=y}D.eachSubnode(N,function(T){if(!T._flag){T._rel=T._treeAngularWidth/M;var S=T._rel*J;var R=O+S/2;for(var Q=0;Q<G.length;Q++){T[G[Q]]=l(R,I)}T.angleSpan={begin:O,end:O+S};O+=S}},"ignore")},"ignore")},onClick:function(z,x){var y=this.graph.getNode(z).pos.getc(true);this.move(y,x)},move:function(C,z){var y=q(C.x,C.y);if(this.busy===false&&y.norm()<1){var B=Graph.Util;this.busy=true;var x=B.getClosestNodeToPos(this.graph,y),A=this;B.computeLevels(this.graph,x.id,0);this.controller.onBeforeCompute(x);if(y.norm()<1){z=r({onComplete:b},z||{});this.fx.animate(r({modes:["moebius"],hideLabels:true},z,{onComplete:function(){A.busy=false;z.onComplete()}}),y)}}}});Hypertree.Op=new o({Implements:Graph.Op,initialize:function(x){this.viz=x}});Hypertree.Plot=new o({Implements:Graph.Plot,initialize:function(x){this.viz=x;this.config=x.config;this.node=this.config.Node;this.edge=this.config.Edge;this.animation=new Animation;this.nodeTypes=new Hypertree.Plot.NodeTypes;this.edgeTypes=new Hypertree.Plot.EdgeTypes},hyperline:function(I,A){var B=I.nodeFrom,z=I.nodeTo,F=I.data;var J=B.pos.getc(),E=z.pos.getc();var D=this.computeArcThroughTwoPoints(J,E);var K=A.getSize();var C=Math.min(K.width,K.height)/2;if(D.a>1000||D.b>1000||D.ratio>1000){A.path("stroke",function(L){L.moveTo(J.x*C,J.y*C);L.lineTo(E.x*C,E.y*C)})}else{var H=Math.atan2(E.y-D.y,E.x-D.x);var G=Math.atan2(J.y-D.y,J.x-D.x);var y=this.sense(H,G);var x=A.getCtx();A.path("stroke",function(L){L.arc(D.x*C,D.y*C,D.ratio*C,H,G,y)})}},computeArcThroughTwoPoints:function(L,K){var D=(L.x*K.y-L.y*K.x),z=D;var C=L.squaredNorm(),B=K.squaredNorm();if(D==0){return{x:0,y:0,ratio:1001}}var J=(L.y*B-K.y*C+L.y-K.y)/D;var H=(K.x*C-L.x*B+K.x-L.x)/z;var I=-J/2;var G=-H/2;var F=(J*J+H*H)/4-1;if(F<0){return{x:0,y:0,ratio:1001}}var E=Math.sqrt(F);var A={x:I,y:G,ratio:E,a:J,b:H};return A},sense:function(x,y){return(x<y)?((x+Math.PI>y)?false:true):((y+Math.PI>x)?true:false)},placeLabel:function(F,A,C){var E=A.pos.getc(true),y=this.viz.canvas;var D=y.getSize();var B=A._scale;var z={x:Math.round(E.x*B+D.width/2),y:Math.round(E.y*B+D.height/2)};var x=F.style;x.left=z.x+"px";x.top=z.y+"px";x.display="";C.onPlaceLabel(F,A)}});Hypertree.Plot.NodeTypes=new o({none:function(){},circle:function(A,y){var z=this.node,C=A.data;var B=z.overridable&&C&&C.$dim||z.dim;var D=A.pos.getc(),E=D.scale(A._scale);var x=z.transform?B*(1-D.squaredNorm()):B;if(x>=B/4){y.path("fill",function(F){F.arc(E.x,E.y,x,0,Math.PI*2,true)})}},square:function(A,z){var F=this.node,C=A.data;var x=F.overridable&&C&&C.$dim||F.dim;var y=A.pos.getc(),E=y.scale(A._scale);var D=F.transform?x*(1-y.squaredNorm()):x;var B=2*D;if(D>=x/4){z.getCtx().fillRect(E.x-D,E.y-D,B,B)}},rectangle:function(A,z){var E=this.node,B=A.data;var y=E.overridable&&B&&B.$width||E.width;var F=E.overridable&&B&&B.$height||E.height;var x=A.pos.getc(),D=x.scale(A._scale);var C=1-x.squaredNorm();y=E.transform?y*C:y;F=E.transform?F*C:F;if(C>=0.25){z.getCtx().fillRect(D.x-y/2,D.y-F/2,y,F)}},triangle:function(C,z){var I=this.node,D=C.data;var x=I.overridable&&D&&D.$dim||I.dim;var y=C.pos.getc(),H=y.scale(C._scale);var G=I.transform?x*(1-y.squaredNorm()):x;if(G>=x/4){var B=H.x,A=H.y-G,K=B-G,J=H.y+G,F=B+G,E=J;z.path("fill",function(L){L.moveTo(B,A);L.lineTo(K,J);L.lineTo(F,E)})}},star:function(A,z){var G=this.node,C=A.data;var x=G.overridable&&C&&C.$dim||G.dim;var y=A.pos.getc(),F=y.scale(A._scale);var E=G.transform?x*(1-y.squaredNorm()):x;if(E>=x/4){var H=z.getCtx(),D=Math.PI/5;H.save();H.translate(F.x,F.y);H.beginPath();H.moveTo(x,0);for(var B=0;B<9;B++){H.rotate(D);if(B%2==0){H.lineTo((E/0.525731)*0.200811,0)}else{H.lineTo(E,0)}}H.closePath();H.fill();H.restore()}}});Hypertree.Plot.EdgeTypes=new o({none:function(){},line:function(x,y){var z=x.nodeFrom._scale;var B=x.nodeFrom.pos.getc(true);var A=x.nodeTo.pos.getc(true);y.path("stroke",function(C){C.moveTo(B.x*z,B.y*z);C.lineTo(A.x*z,A.y*z)})},hyperline:function(x,y){this.hyperline(x,y)}});this.TM={layout:{orientation:"h",vertical:function(){return this.orientation=="v"},horizontal:function(){return this.orientation=="h"},change:function(){this.orientation=this.vertical()?"h":"v"}},innerController:{onBeforeCompute:b,onAfterCompute:b,onComplete:b,onCreateElement:b,onDestroyElement:b,request:false},config:{orientation:"h",titleHeight:13,rootId:"infovis",offset:4,levelsToShow:3,addLeftClickHandler:false,addRightClickHandler:false,selectPathOnHover:false,Color:{allow:false,minValue:-100,maxValue:100,minColorValue:[255,0,50],maxColorValue:[0,255,50]},Tips:{allow:false,offsetX:20,offsetY:20,onShow:b}},initialize:function(x){this.tree=null;this.shownTree=null;this.controller=this.config=r(this.config,this.innerController,x);this.rootId=this.config.rootId;this.layout.orientation=this.config.orientation;if(this.config.Tips.allow&&document.body){var B=document.getElementById("_tooltip")||document.createElement("div");B.id="_tooltip";B.className="tip";var z=B.style;z.position="absolute";z.display="none";z.zIndex=13000;document.body.appendChild(B);this.tip=B}var A=this;var y=function(){A.empty();if(window.CollectGarbage){window.CollectGarbage()}delete y};if(window.addEventListener){window.addEventListener("unload",y,false)}else{window.attachEvent("onunload",y)}},each:function(x){(function y(D){if(!D){return}var C=D.childNodes,z=C.length;if(z>0){x.apply(this,[D,z===1,C[0],C[1]])}if(z>1){for(var A=C[1].childNodes,B=0;B<A.length;B++){y(A[B])}}})(e(this.rootId).firstChild)},toStyle:function(z){var x="";for(var y in z){x+=y+":"+z[y]+";"}return x},leaf:function(x){return x.children==0},createBox:function(y,A,x){var z;if(!this.leaf(y)){z=this.headBox(y,A)+this.bodyBox(x,A)}else{z=this.leafBox(y,A)}return this.contentBox(y,A,z)},plot:function(B){var D=B.coord,A="";if(this.leaf(B)){return this.createBox(B,D,null)}for(var z=0,C=B.children;z<C.length;z++){var y=C[z],x=y.coord;if(x.width*x.height>1){A+=this.plot(y)}}return this.createBox(B,D,A)},headBox:function(y,B){var x=this.config,A=x.offset;var z={height:x.titleHeight+"px",width:(B.width-A)+"px",left:A/2+"px"};return'<div class="head" style="'+this.toStyle(z)+'">'+y.name+"</div>"},bodyBox:function(y,C){var x=this.config,z=x.titleHeight,B=x.offset;var A={width:(C.width-B)+"px",height:(C.height-B-z)+"px",top:(z+B/2)+"px",left:(B/2)+"px"};return'<div class="body" style="'+this.toStyle(A)+'">'+y+"</div>"},contentBox:function(z,B,y){var A={};for(var x in B){A[x]=B[x]+"px"}return'<div class="content" style="'+this.toStyle(A)+'" id="'+z.id+'">'+y+"</div>"},leafBox:function(A,E){var z=this.config;var y=z.Color.allow&&this.setColor(A),D=z.offset,B=E.width-D,x=E.height-D;var C={top:(D/2)+"px",height:x+"px",width:B+"px",left:(D/2)+"px"};if(y){C["background-color"]=y}return'<div class="leaf" style="'+this.toStyle(C)+'">'+A.name+"</div>"},setColor:function(F){var A=this.config.Color,B=A.maxColorValue,y=A.minColorValue,C=A.maxValue,G=A.minValue,E=C-G,D=(F.data.$color-0);var z=function(I,H){return Math.round((((B[I]-y[I])/E)*(H-G)+y[I]))};return d([z(0,D),z(1,D),z(2,D)])},enter:function(x){this.view(x.parentNode.id)},onLeftClick:function(x){this.enter(x)},out:function(){var x=TreeUtil.getParent(this.tree,this.shownTree.id);if(x){if(this.controller.request){TreeUtil.prune(x,this.config.levelsToShow)}this.view(x.id)}},onRightClick:function(){this.out()},view:function(B){var x=this.config,z=this;var y={onComplete:function(){z.loadTree(B);e(x.rootId).focus()}};if(this.controller.request){var A=TreeUtil;A.loadSubtrees(A.getSubtree(this.tree,B),r(this.controller,y))}else{y.onComplete()}},resetPath:function(x){var y=this.rootId,B=this.resetPath.previous;this.resetPath.previous=x||false;function z(D){var C=D.parentNode;return C&&(C.id!=y)&&C}function A(F,C){if(F){var D=e(F.id);if(D){var E=z(D);while(E){F=E.childNodes[0];if(s(F,"in-path")){if(C==undefined||!!C){a(F,"in-path")}}else{if(!C){p(F,"in-path")}}E=z(E)}}}}A(B,true);A(x,false)},initializeElements:function(){var x=this.controller,z=this;var y=m(false),A=x.Tips.allow;this.each(function(F,E,D,C){var B=TreeUtil.getSubtree(z.tree,F.id);x.onCreateElement(F,B,E,D,C);if(x.addRightClickHandler){D.oncontextmenu=y}if(x.addLeftClickHandler||x.addRightClickHandler){t(D,"mouseup",function(G){var H=(G.which==3||G.button==2);if(H){if(x.addRightClickHandler){z.onRightClick()}}else{if(x.addLeftClickHandler){z.onLeftClick(D)}}if(G.preventDefault){G.preventDefault()}else{G.returnValue=false}})}if(x.selectPathOnHover||A){t(D,"mouseover",function(G){if(x.selectPathOnHover){if(E){p(D,"over-leaf")}else{p(D,"over-head");p(F,"over-content")}if(F.id){z.resetPath(B)}}if(A){x.Tips.onShow(z.tip,B,E,D)}});t(D,"mouseout",function(G){if(x.selectPathOnHover){if(E){a(D,"over-leaf")}else{a(D,"over-head");a(F,"over-content")}z.resetPath()}if(A){z.tip.style.display="none"}});if(A){t(D,"mousemove",function(J,I){var O=z.tip;I=I||window;J=J||I.event;var N=I.document;N=N.html||N.body;var K={x:J.pageX||J.clientX+N.scrollLeft,y:J.pageY||J.clientY+N.scrollTop};O.style.display="";I={height:document.body.clientHeight,width:document.body.clientWidth};var H={width:O.offsetWidth,height:O.offsetHeight};var G=O.style,M=x.Tips.offsetX,L=x.Tips.offsetY;G.top=((K.y+L+H.height>I.height)?(K.y-H.height-L):K.y+L)+"px";G.left=((K.x+H.width+M>I.width)?(K.x-H.width-M):K.x+M)+"px"})}}})},destroyElements:function(){if(this.controller.onDestroyElement!=b){var x=this.controller,y=this;this.each(function(C,B,A,z){x.onDestroyElement(C,TreeUtil.getSubtree(y.tree,C.id),B,A,z)})}},empty:function(){this.destroyElements();f(e(this.rootId))},loadTree:function(x){this.empty();this.loadJSON(TreeUtil.getSubtree(this.tree,x))}};TM.SliceAndDice=new o({Implements:TM,loadJSON:function(A){this.controller.onBeforeCompute(A);var y=e(this.rootId),z=this.config,B=y.offsetWidth,x=y.offsetHeight;var C={coord:{top:0,left:0,width:B,height:x+z.titleHeight+z.offset}};if(this.tree==null){this.tree=A}this.shownTree=A;this.compute(C,A,this.layout.orientation);y.innerHTML=this.plot(A);this.initializeElements();this.controller.onAfterCompute(A)},compute:function(D,M,B){var O=this.config,I=D.coord,L=O.offset,H=I.width-L,F=I.height-L-O.titleHeight,y=D.data,x=(y&&("$area" in y))?M.data.$area/y.$area:1;var G,E,K,C,A;var N=(B=="h");if(N){B="v";G=F;E=Math.round(H*x);K="height";C="top";A="left"}else{B="h";G=Math.round(F*x);E=H;K="width";C="left";A="top"}M.coord={width:E,height:G,top:0,left:0};var J=0,z=this;g(M.children,function(P){z.compute(M,P,B);P.coord[C]=J;P.coord[A]=0;J+=Math.floor(P.coord[K])})}});TM.Area=new o({loadJSON:function(z){this.controller.onBeforeCompute(z);var y=e(this.rootId),A=y.offsetWidth,x=y.offsetHeight,E=this.config.offset,C=A-E,B=x-E-this.config.titleHeight;z.coord={height:x,width:A,top:0,left:0};var D=r(z.coord,{width:C,height:B});this.compute(z,D);y.innerHTML=this.plot(z);if(this.tree==null){this.tree=z}this.shownTree=z;this.initializeElements();this.controller.onAfterCompute(z)},computeDim:function(A,E,y,D,z){if(A.length+E.length==1){var x=(A.length==1)?A:E;this.layoutLast(x,y,D);return}if(A.length>=2&&E.length==0){E=[A[0]];A=A.slice(1)}if(A.length==0){if(E.length>0){this.layoutRow(E,y,D)}return}var C=A[0];if(z(E,y)>=z([C].concat(E),y)){this.computeDim(A.slice(1),E.concat([C]),y,D,z)}else{var B=this.layoutRow(E,y,D);this.computeDim(A,[],B.dim,B,z)}},worstAspectRatio:function(x,E){if(!x||x.length==0){return Number.MAX_VALUE}var y=0,F=0,B=Number.MAX_VALUE;for(var C=0;C<x.length;C++){var z=x[C]._area;y+=z;B=(B<z)?B:z;F=(F>z)?F:z}var D=E*E,A=y*y;return Math.max(D*F/A,A/(D*B))},avgAspectRatio:function(A,x){if(!A||A.length==0){return Number.MAX_VALUE}var C=0;for(var y=0;y<A.length;y++){var B=A[y]._area;var z=B/x;C+=(x>z)?x/z:z/x}return C/A.length},layoutLast:function(y,x,z){y[0].coord=z}});TM.Squarified=new o({Implements:[TM,TM.Area],compute:function(F,C){if(!(C.width>=C.height&&this.layout.horizontal())){this.layout.change()}var x=F.children,z=this.config;if(x.length>0){this.processChildrenLayout(F,x,C);for(var B=0;B<x.length;B++){var A=x[B].coord,D=z.offset,E=A.height-(z.titleHeight+D),y=A.width-D;C={width:y,height:E,top:0,left:0};this.compute(x[B],C)}}},processChildrenLayout:function(F,x,B){var y=B.width*B.height;var A,C=0,G=[];for(A=0;A<x.length;A++){G[A]=parseFloat(x[A].data.$area);C+=G[A]}for(A=0;A<G.length;A++){x[A]._area=y*G[A]/C}var z=(this.layout.horizontal())?B.height:B.width;x.sort(function(I,H){return(I._area<=H._area)-(I._area>=H._area)});var E=[x[0]];var D=x.slice(1);this.squarify(D,E,z,B)},squarify:function(y,A,x,z){this.computeDim(y,A,x,z,this.worstAspectRatio)},layoutRow:function(y,x,z){if(this.layout.horizontal()){return this.layoutV(y,x,z)}else{return this.layoutH(y,x,z)}},layoutV:function(x,F,C){var G=0,z=Math.round;g(x,function(H){G+=H._area});var y=z(G/F),D=0;for(var A=0;A<x.length;A++){var B=z(x[A]._area/y);x[A].coord={height:B,width:y,top:C.top+D,left:C.left};D+=B}var E={height:C.height,width:C.width-y,top:C.top,left:C.left+y};E.dim=Math.min(E.width,E.height);if(E.dim!=E.height){this.layout.change()}return E},layoutH:function(x,E,B){var G=0,y=Math.round;g(x,function(H){G+=H._area});var F=y(G/E),C=B.top,z=0;for(var A=0;A<x.length;A++){x[A].coord={height:F,width:y(x[A]._area/F),top:C,left:B.left+z};z+=x[A].coord.width}var D={height:B.height-F,width:B.width,top:B.top+F,left:B.left};D.dim=Math.min(D.width,D.height);if(D.dim!=D.width){this.layout.change()}return D}});TM.Strip=new o({Implements:[TM,TM.Area],compute:function(F,C){var x=F.children,z=this.config;if(x.length>0){this.processChildrenLayout(F,x,C);for(var B=0;B<x.length;B++){var A=x[B].coord,D=z.offset,E=A.height-(z.titleHeight+D),y=A.width-D;C={width:y,height:E,top:0,left:0};this.compute(x[B],C)}}},processChildrenLayout:function(A,z,E){var B=E.width*E.height;var C=parseFloat(A.data.$area);g(z,function(F){F._area=B*parseFloat(F.data.$area)/C});var y=(this.layout.horizontal())?E.width:E.height;var D=[z[0]];var x=z.slice(1);this.stripify(x,D,y,E)},stripify:function(y,A,x,z){this.computeDim(y,A,x,z,this.avgAspectRatio)},layoutRow:function(y,x,z){if(this.layout.horizontal()){return this.layoutH(y,x,z)}else{return this.layoutV(y,x,z)}},layoutV:function(x,F,C){var G=0,z=function(H){return H};g(x,function(H){G+=H._area});var y=z(G/F),D=0;for(var A=0;A<x.length;A++){var B=z(x[A]._area/y);x[A].coord={height:B,width:y,top:C.top+(F-B-D),left:C.left};D+=B}var E={height:C.height,width:C.width-y,top:C.top,left:C.left+y,dim:F};return E},layoutH:function(x,E,B){var G=0,y=function(H){return H};g(x,function(H){G+=H._area});var F=y(G/E),C=B.height-F,z=0;for(var A=0;A<x.length;A++){x[A].coord={height:F,width:y(x[A]._area/F),top:C,left:B.left+z};z+=x[A].coord.width}var D={height:B.height-F,width:B.width,top:B.top,left:B.left,dim:E};return D}})})();/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var A=arguments,E=null,C,B,D;for(C=0;C<A.length;C=C+1){D=(""+A[C]).split(".");E=YAHOO;for(B=(D[0]=="YAHOO")?1:0;B<D.length;B=B+1){E[D[B]]=E[D[B]]||{};E=E[D[B]];}}return E;};YAHOO.log=function(D,A,C){var B=YAHOO.widget.Logger;if(B&&B.log){return B.log(D,A,C);}else{return false;}};YAHOO.register=function(A,E,D){var I=YAHOO.env.modules,B,H,G,F,C;if(!I[A]){I[A]={versions:[],builds:[]};}B=I[A];H=D.version;G=D.build;F=YAHOO.env.listeners;B.name=A;B.version=H;B.build=G;B.versions.push(H);B.builds.push(G);B.mainClass=E;for(C=0;C<F.length;C=C+1){F[C](B);}if(E){E.VERSION=H;E.BUILD=G;}else{YAHOO.log("mainClass is undefined for module "+A,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(A){return YAHOO.env.modules[A]||null;};YAHOO.env.ua=function(){var D=function(H){var I=0;return parseFloat(H.replace(/\./g,function(){return(I++==1)?"":".";}));},G=navigator,F={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0,caja:G.cajaVersion,secure:false,os:null},C=navigator&&navigator.userAgent,E=window&&window.location,B=E&&E.href,A;F.secure=B&&(B.toLowerCase().indexOf("https")===0);if(C){if((/windows|win32/i).test(C)){F.os="windows";}else{if((/macintosh/i).test(C)){F.os="macintosh";}}if((/KHTML/).test(C)){F.webkit=1;}A=C.match(/AppleWebKit\/([^\s]*)/);if(A&&A[1]){F.webkit=D(A[1]);if(/ Mobile\//.test(C)){F.mobile="Apple";}else{A=C.match(/NokiaN[^\/]*/);if(A){F.mobile=A[0];}}A=C.match(/AdobeAIR\/([^\s]*)/);if(A){F.air=A[0];}}if(!F.webkit){A=C.match(/Opera[\s\/]([^\s]*)/);if(A&&A[1]){F.opera=D(A[1]);A=C.match(/Opera Mini[^;]*/);if(A){F.mobile=A[0];}}else{A=C.match(/MSIE\s([^;]*)/);if(A&&A[1]){F.ie=D(A[1]);}else{A=C.match(/Gecko\/([^\s]*)/);if(A){F.gecko=1;A=C.match(/rv:([^\s\)]*)/);if(A&&A[1]){F.gecko=D(A[1]);}}}}}}return F;}();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var B=YAHOO_config.listener,A=YAHOO.env.listeners,D=true,C;if(B){for(C=0;C<A.length;C++){if(A[C]==B){D=false;break;}}if(D){A.push(B);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var B=YAHOO.lang,A=Object.prototype,H="[object Array]",C="[object Function]",G="[object Object]",E=[],F=["toString","valueOf"],D={isArray:function(I){return A.toString.apply(I)===H;},isBoolean:function(I){return typeof I==="boolean";},isFunction:function(I){return(typeof I==="function")||A.toString.apply(I)===C;},isNull:function(I){return I===null;},isNumber:function(I){return typeof I==="number"&&isFinite(I);},isObject:function(I){return(I&&(typeof I==="object"||B.isFunction(I)))||false;},isString:function(I){return typeof I==="string";},isUndefined:function(I){return typeof I==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(K,J){var I,M,L;for(I=0;I<F.length;I=I+1){M=F[I];L=J[M];if(B.isFunction(L)&&L!=A[M]){K[M]=L;}}}:function(){},extend:function(L,M,K){if(!M||!L){throw new Error("extend failed, please check that "+"all dependencies are included.");}var J=function(){},I;J.prototype=M.prototype;L.prototype=new J();L.prototype.constructor=L;L.superclass=M.prototype;if(M.prototype.constructor==A.constructor){M.prototype.constructor=M;}if(K){for(I in K){if(B.hasOwnProperty(K,I)){L.prototype[I]=K[I];}}B._IEEnumFix(L.prototype,K);}},augmentObject:function(M,L){if(!L||!M){throw new Error("Absorb failed, verify dependencies.");}var I=arguments,K,N,J=I[2];if(J&&J!==true){for(K=2;K<I.length;K=K+1){M[I[K]]=L[I[K]];}}else{for(N in L){if(J||!(N in M)){M[N]=L[N];}}B._IEEnumFix(M,L);}},augmentProto:function(L,K){if(!K||!L){throw new Error("Augment failed, verify dependencies.");}var I=[L.prototype,K.prototype],J;for(J=2;J<arguments.length;J=J+1){I.push(arguments[J]);}B.augmentObject.apply(this,I);},dump:function(I,N){var K,M,P=[],Q="{...}",J="f(){...}",O=", ",L=" => ";if(!B.isObject(I)){return I+"";}else{if(I instanceof Date||("nodeType" in I&&"tagName" in I)){return I;}else{if(B.isFunction(I)){return J;}}}N=(B.isNumber(N))?N:3;if(B.isArray(I)){P.push("[");for(K=0,M=I.length;K<M;K=K+1){if(B.isObject(I[K])){P.push((N>0)?B.dump(I[K],N-1):Q);}else{P.push(I[K]);}P.push(O);}if(P.length>1){P.pop();}P.push("]");}else{P.push("{");for(K in I){if(B.hasOwnProperty(I,K)){P.push(K+L);if(B.isObject(I[K])){P.push((N>0)?B.dump(I[K],N-1):Q);}else{P.push(I[K]);}P.push(O);}}if(P.length>1){P.pop();}P.push("}");}return P.join("");},substitute:function(Y,J,R){var N,M,L,U,V,X,T=[],K,O="dump",S=" ",I="{",W="}",Q,P;for(;;){N=Y.lastIndexOf(I);if(N<0){break;}M=Y.indexOf(W,N);if(N+1>=M){break;}K=Y.substring(N+1,M);U=K;X=null;L=U.indexOf(S);if(L>-1){X=U.substring(L+1);U=U.substring(0,L);}V=J[U];if(R){V=R(U,V,X);}if(B.isObject(V)){if(B.isArray(V)){V=B.dump(V,parseInt(X,10));}else{X=X||"";Q=X.indexOf(O);if(Q>-1){X=X.substring(4);}P=V.toString();if(P===G||Q>-1){V=B.dump(V,parseInt(X,10));}else{V=P;}}}else{if(!B.isString(V)&&!B.isNumber(V)){V="~-"+T.length+"-~";T[T.length]=K;}}Y=Y.substring(0,N)+V+Y.substring(M+1);}for(N=T.length-1;N>=0;N=N-1){Y=Y.replace(new RegExp("~-"+N+"-~"),"{"+T[N]+"}","g");}return Y;},trim:function(I){try{return I.replace(/^\s+|\s+$/g,"");}catch(J){return I;}},merge:function(){var L={},J=arguments,I=J.length,K;for(K=0;K<I;K=K+1){B.augmentObject(L,J[K],true);}return L;},later:function(P,J,Q,L,M){P=P||0;J=J||{};var K=Q,O=L,N,I;if(B.isString(Q)){K=J[Q];}if(!K){throw new TypeError("method undefined");}if(O&&!B.isArray(O)){O=[L];}N=function(){K.apply(J,O||E);};I=(M)?setInterval(N,P):setTimeout(N,P);return{interval:M,cancel:function(){if(this.interval){clearInterval(I);}else{clearTimeout(I);}}};},isValue:function(I){return(B.isObject(I)||B.isString(I)||B.isNumber(I)||B.isBoolean(I));}};B.hasOwnProperty=(A.hasOwnProperty)?function(I,J){return I&&I.hasOwnProperty(J);}:function(I,J){return !B.isUndefined(I[J])&&I.constructor.prototype[J]!==I[J];};D.augmentObject(B,D,true);YAHOO.util.Lang=B;B.augment=B.augmentProto;YAHOO.augment=B.augmentProto;YAHOO.extend=B.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.8.0r4",build:"2449"});
(function(){YAHOO.env._id_counter=YAHOO.env._id_counter||0;var E=YAHOO.util,L=YAHOO.lang,m=YAHOO.env.ua,A=YAHOO.lang.trim,d={},h={},N=/^t(?:able|d|h)$/i,X=/color$/i,K=window.document,W=K.documentElement,e="ownerDocument",n="defaultView",v="documentElement",t="compatMode",b="offsetLeft",P="offsetTop",u="offsetParent",Z="parentNode",l="nodeType",C="tagName",O="scrollLeft",i="scrollTop",Q="getBoundingClientRect",w="getComputedStyle",a="currentStyle",M="CSS1Compat",c="BackCompat",g="class",F="className",J="",B=" ",s="(?:^|\\s)",k="(?= |$)",U="g",p="position",f="fixed",V="relative",j="left",o="top",r="medium",q="borderLeftWidth",R="borderTopWidth",D=m.opera,I=m.webkit,H=m.gecko,T=m.ie;E.Dom={CUSTOM_ATTRIBUTES:(!W.hasAttribute)?{"for":"htmlFor","class":F}:{"htmlFor":"for","className":g},DOT_ATTRIBUTES:{},get:function(z){var AB,x,AA,y,Y,G;if(z){if(z[l]||z.item){return z;}if(typeof z==="string"){AB=z;z=K.getElementById(z);G=(z)?z.attributes:null;if(z&&G&&G.id&&G.id.value===AB){return z;}else{if(z&&K.all){z=null;x=K.all[AB];for(y=0,Y=x.length;y<Y;++y){if(x[y].id===AB){return x[y];}}}}return z;}if(YAHOO.util.Element&&z instanceof YAHOO.util.Element){z=z.get("element");}if("length" in z){AA=[];for(y=0,Y=z.length;y<Y;++y){AA[AA.length]=E.Dom.get(z[y]);}return AA;}return z;}return null;},getComputedStyle:function(G,Y){if(window[w]){return G[e][n][w](G,null)[Y];}else{if(G[a]){return E.Dom.IE_ComputedStyle.get(G,Y);}}},getStyle:function(G,Y){return E.Dom.batch(G,E.Dom._getStyle,Y);},_getStyle:function(){if(window[w]){return function(G,y){y=(y==="float")?y="cssFloat":E.Dom._toCamel(y);var x=G.style[y],Y;if(!x){Y=G[e][n][w](G,null);if(Y){x=Y[y];}}return x;};}else{if(W[a]){return function(G,y){var x;switch(y){case"opacity":x=100;try{x=G.filters["DXImageTransform.Microsoft.Alpha"].opacity;}catch(z){try{x=G.filters("alpha").opacity;}catch(Y){}}return x/100;case"float":y="styleFloat";default:y=E.Dom._toCamel(y);x=G[a]?G[a][y]:null;return(G.style[y]||x);}};}}}(),setStyle:function(G,Y,x){E.Dom.batch(G,E.Dom._setStyle,{prop:Y,val:x});},_setStyle:function(){if(T){return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){switch(x){case"opacity":if(L.isString(Y.style.filter)){Y.style.filter="alpha(opacity="+y*100+")";if(!Y[a]||!Y[a].hasLayout){Y.style.zoom=1;}}break;case"float":x="styleFloat";default:Y.style[x]=y;}}else{}};}else{return function(Y,G){var x=E.Dom._toCamel(G.prop),y=G.val;if(Y){if(x=="float"){x="cssFloat";}Y.style[x]=y;}else{}};}}(),getXY:function(G){return E.Dom.batch(G,E.Dom._getXY);},_canPosition:function(G){return(E.Dom._getStyle(G,"display")!=="none"&&E.Dom._inDoc(G));},_getXY:function(){if(K[v][Q]){return function(y){var z,Y,AA,AF,AE,AD,AC,G,x,AB=Math.floor,AG=false;if(E.Dom._canPosition(y)){AA=y[Q]();AF=y[e];z=E.Dom.getDocumentScrollLeft(AF);Y=E.Dom.getDocumentScrollTop(AF);AG=[AB(AA[j]),AB(AA[o])];if(T&&m.ie<8){AE=2;AD=2;AC=AF[t];if(m.ie===6){if(AC!==c){AE=0;AD=0;}}if((AC===c)){G=S(AF[v],q);x=S(AF[v],R);if(G!==r){AE=parseInt(G,10);}if(x!==r){AD=parseInt(x,10);}}AG[0]-=AE;AG[1]-=AD;}if((Y||z)){AG[0]+=z;AG[1]+=Y;}AG[0]=AB(AG[0]);AG[1]=AB(AG[1]);}else{}return AG;};}else{return function(y){var x,Y,AA,AB,AC,z=false,G=y;if(E.Dom._canPosition(y)){z=[y[b],y[P]];x=E.Dom.getDocumentScrollLeft(y[e]);Y=E.Dom.getDocumentScrollTop(y[e]);AC=((H||m.webkit>519)?true:false);while((G=G[u])){z[0]+=G[b];z[1]+=G[P];if(AC){z=E.Dom._calcBorders(G,z);}}if(E.Dom._getStyle(y,p)!==f){G=y;while((G=G[Z])&&G[C]){AA=G[i];AB=G[O];if(H&&(E.Dom._getStyle(G,"overflow")!=="visible")){z=E.Dom._calcBorders(G,z);}if(AA||AB){z[0]-=AB;z[1]-=AA;}}z[0]+=x;z[1]+=Y;}else{if(D){z[0]-=x;z[1]-=Y;}else{if(I||H){z[0]+=x;z[1]+=Y;}}}z[0]=Math.floor(z[0]);z[1]=Math.floor(z[1]);}else{}return z;};}}(),getX:function(G){var Y=function(x){return E.Dom.getXY(x)[0];};return E.Dom.batch(G,Y,E.Dom,true);},getY:function(G){var Y=function(x){return E.Dom.getXY(x)[1];};return E.Dom.batch(G,Y,E.Dom,true);},setXY:function(G,x,Y){E.Dom.batch(G,E.Dom._setXY,{pos:x,noRetry:Y});},_setXY:function(G,z){var AA=E.Dom._getStyle(G,p),y=E.Dom.setStyle,AD=z.pos,Y=z.noRetry,AB=[parseInt(E.Dom.getComputedStyle(G,j),10),parseInt(E.Dom.getComputedStyle(G,o),10)],AC,x;if(AA=="static"){AA=V;y(G,p,AA);}AC=E.Dom._getXY(G);if(!AD||AC===false){return false;}if(isNaN(AB[0])){AB[0]=(AA==V)?0:G[b];}if(isNaN(AB[1])){AB[1]=(AA==V)?0:G[P];}if(AD[0]!==null){y(G,j,AD[0]-AC[0]+AB[0]+"px");}if(AD[1]!==null){y(G,o,AD[1]-AC[1]+AB[1]+"px");}if(!Y){x=E.Dom._getXY(G);if((AD[0]!==null&&x[0]!=AD[0])||(AD[1]!==null&&x[1]!=AD[1])){E.Dom._setXY(G,{pos:AD,noRetry:true});}}},setX:function(Y,G){E.Dom.setXY(Y,[G,null]);},setY:function(G,Y){E.Dom.setXY(G,[null,Y]);},getRegion:function(G){var Y=function(x){var y=false;if(E.Dom._canPosition(x)){y=E.Region.getRegion(x);}else{}return y;};return E.Dom.batch(G,Y,E.Dom,true);},getClientWidth:function(){return E.Dom.getViewportWidth();},getClientHeight:function(){return E.Dom.getViewportHeight();},getElementsByClassName:function(AB,AF,AC,AE,x,AD){AF=AF||"*";AC=(AC)?E.Dom.get(AC):null||K;if(!AC){return[];}var Y=[],G=AC.getElementsByTagName(AF),z=E.Dom.hasClass;for(var y=0,AA=G.length;y<AA;++y){if(z(G[y],AB)){Y[Y.length]=G[y];}}if(AE){E.Dom.batch(Y,AE,x,AD);}return Y;},hasClass:function(Y,G){return E.Dom.batch(Y,E.Dom._hasClass,G);},_hasClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom._getAttribute(x,F)||J;if(Y.exec){G=Y.test(y);}else{G=Y&&(B+y+B).indexOf(B+Y+B)>-1;}}else{}return G;},addClass:function(Y,G){return E.Dom.batch(Y,E.Dom._addClass,G);},_addClass:function(x,Y){var G=false,y;if(x&&Y){y=E.Dom._getAttribute(x,F)||J;if(!E.Dom._hasClass(x,Y)){E.Dom.setAttribute(x,F,A(y+B+Y));G=true;}}else{}return G;},removeClass:function(Y,G){return E.Dom.batch(Y,E.Dom._removeClass,G);},_removeClass:function(y,x){var Y=false,AA,z,G;if(y&&x){AA=E.Dom._getAttribute(y,F)||J;E.Dom.setAttribute(y,F,AA.replace(E.Dom._getClassRegex(x),J));z=E.Dom._getAttribute(y,F);if(AA!==z){E.Dom.setAttribute(y,F,A(z));Y=true;if(E.Dom._getAttribute(y,F)===""){G=(y.hasAttribute&&y.hasAttribute(g))?g:F;
y.removeAttribute(G);}}}else{}return Y;},replaceClass:function(x,Y,G){return E.Dom.batch(x,E.Dom._replaceClass,{from:Y,to:G});},_replaceClass:function(y,x){var Y,AB,AA,G=false,z;if(y&&x){AB=x.from;AA=x.to;if(!AA){G=false;}else{if(!AB){G=E.Dom._addClass(y,x.to);}else{if(AB!==AA){z=E.Dom._getAttribute(y,F)||J;Y=(B+z.replace(E.Dom._getClassRegex(AB),B+AA)).split(E.Dom._getClassRegex(AA));Y.splice(1,0,B+AA);E.Dom.setAttribute(y,F,A(Y.join(J)));G=true;}}}}else{}return G;},generateId:function(G,x){x=x||"yui-gen";var Y=function(y){if(y&&y.id){return y.id;}var z=x+YAHOO.env._id_counter++;if(y){if(y[e]&&y[e].getElementById(z)){return E.Dom.generateId(y,z+x);}y.id=z;}return z;};return E.Dom.batch(G,Y,E.Dom,true)||Y.apply(E.Dom,arguments);},isAncestor:function(Y,x){Y=E.Dom.get(Y);x=E.Dom.get(x);var G=false;if((Y&&x)&&(Y[l]&&x[l])){if(Y.contains&&Y!==x){G=Y.contains(x);}else{if(Y.compareDocumentPosition){G=!!(Y.compareDocumentPosition(x)&16);}}}else{}return G;},inDocument:function(G,Y){return E.Dom._inDoc(E.Dom.get(G),Y);},_inDoc:function(Y,x){var G=false;if(Y&&Y[C]){x=x||Y[e];G=E.Dom.isAncestor(x[v],Y);}else{}return G;},getElementsBy:function(Y,AF,AB,AD,y,AC,AE){AF=AF||"*";AB=(AB)?E.Dom.get(AB):null||K;if(!AB){return[];}var x=[],G=AB.getElementsByTagName(AF);for(var z=0,AA=G.length;z<AA;++z){if(Y(G[z])){if(AE){x=G[z];break;}else{x[x.length]=G[z];}}}if(AD){E.Dom.batch(x,AD,y,AC);}return x;},getElementBy:function(x,G,Y){return E.Dom.getElementsBy(x,G,Y,null,null,null,true);},batch:function(x,AB,AA,z){var y=[],Y=(z)?AA:window;x=(x&&(x[C]||x.item))?x:E.Dom.get(x);if(x&&AB){if(x[C]||x.length===undefined){return AB.call(Y,x,AA);}for(var G=0;G<x.length;++G){y[y.length]=AB.call(Y,x[G],AA);}}else{return false;}return y;},getDocumentHeight:function(){var Y=(K[t]!=M||I)?K.body.scrollHeight:W.scrollHeight,G=Math.max(Y,E.Dom.getViewportHeight());return G;},getDocumentWidth:function(){var Y=(K[t]!=M||I)?K.body.scrollWidth:W.scrollWidth,G=Math.max(Y,E.Dom.getViewportWidth());return G;},getViewportHeight:function(){var G=self.innerHeight,Y=K[t];if((Y||T)&&!D){G=(Y==M)?W.clientHeight:K.body.clientHeight;}return G;},getViewportWidth:function(){var G=self.innerWidth,Y=K[t];if(Y||T){G=(Y==M)?W.clientWidth:K.body.clientWidth;}return G;},getAncestorBy:function(G,Y){while((G=G[Z])){if(E.Dom._testElement(G,Y)){return G;}}return null;},getAncestorByClassName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return E.Dom.hasClass(y,G);};return E.Dom.getAncestorBy(Y,x);},getAncestorByTagName:function(Y,G){Y=E.Dom.get(Y);if(!Y){return null;}var x=function(y){return y[C]&&y[C].toUpperCase()==G.toUpperCase();};return E.Dom.getAncestorBy(Y,x);},getPreviousSiblingBy:function(G,Y){while(G){G=G.previousSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getPreviousSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getPreviousSiblingBy(G);},getNextSiblingBy:function(G,Y){while(G){G=G.nextSibling;if(E.Dom._testElement(G,Y)){return G;}}return null;},getNextSibling:function(G){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getNextSiblingBy(G);},getFirstChildBy:function(G,x){var Y=(E.Dom._testElement(G.firstChild,x))?G.firstChild:null;return Y||E.Dom.getNextSiblingBy(G.firstChild,x);},getFirstChild:function(G,Y){G=E.Dom.get(G);if(!G){return null;}return E.Dom.getFirstChildBy(G);},getLastChildBy:function(G,x){if(!G){return null;}var Y=(E.Dom._testElement(G.lastChild,x))?G.lastChild:null;return Y||E.Dom.getPreviousSiblingBy(G.lastChild,x);},getLastChild:function(G){G=E.Dom.get(G);return E.Dom.getLastChildBy(G);},getChildrenBy:function(Y,y){var x=E.Dom.getFirstChildBy(Y,y),G=x?[x]:[];E.Dom.getNextSiblingBy(x,function(z){if(!y||y(z)){G[G.length]=z;}return false;});return G;},getChildren:function(G){G=E.Dom.get(G);if(!G){}return E.Dom.getChildrenBy(G);},getDocumentScrollLeft:function(G){G=G||K;return Math.max(G[v].scrollLeft,G.body.scrollLeft);},getDocumentScrollTop:function(G){G=G||K;return Math.max(G[v].scrollTop,G.body.scrollTop);},insertBefore:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}return G[Z].insertBefore(Y,G);},insertAfter:function(Y,G){Y=E.Dom.get(Y);G=E.Dom.get(G);if(!Y||!G||!G[Z]){return null;}if(G.nextSibling){return G[Z].insertBefore(Y,G.nextSibling);}else{return G[Z].appendChild(Y);}},getClientRegion:function(){var x=E.Dom.getDocumentScrollTop(),Y=E.Dom.getDocumentScrollLeft(),y=E.Dom.getViewportWidth()+Y,G=E.Dom.getViewportHeight()+x;return new E.Region(x,y,G,Y);},setAttribute:function(Y,G,x){E.Dom.batch(Y,E.Dom._setAttribute,{attr:G,val:x});},_setAttribute:function(x,Y){var G=E.Dom._toCamel(Y.attr),y=Y.val;if(x&&x.setAttribute){if(E.Dom.DOT_ATTRIBUTES[G]){x[G]=y;}else{G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;x.setAttribute(G,y);}}else{}},getAttribute:function(Y,G){return E.Dom.batch(Y,E.Dom._getAttribute,G);},_getAttribute:function(Y,G){var x;G=E.Dom.CUSTOM_ATTRIBUTES[G]||G;if(Y&&Y.getAttribute){x=Y.getAttribute(G,2);}else{}return x;},_toCamel:function(Y){var x=d;function G(y,z){return z.toUpperCase();}return x[Y]||(x[Y]=Y.indexOf("-")===-1?Y:Y.replace(/-([a-z])/gi,G));},_getClassRegex:function(Y){var G;if(Y!==undefined){if(Y.exec){G=Y;}else{G=h[Y];if(!G){Y=Y.replace(E.Dom._patterns.CLASS_RE_TOKENS,"\\$1");G=h[Y]=new RegExp(s+Y+k,U);}}}return G;},_patterns:{ROOT_TAG:/^body|html$/i,CLASS_RE_TOKENS:/([\.\(\)\^\$\*\+\?\|\[\]\{\}\\])/g},_testElement:function(G,Y){return G&&G[l]==1&&(!Y||Y(G));},_calcBorders:function(x,y){var Y=parseInt(E.Dom[w](x,R),10)||0,G=parseInt(E.Dom[w](x,q),10)||0;if(H){if(N.test(x[C])){Y=0;G=0;}}y[0]+=G;y[1]+=Y;return y;}};var S=E.Dom[w];if(m.opera){E.Dom[w]=function(Y,G){var x=S(Y,G);if(X.test(G)){x=E.Dom.Color.toRGB(x);}return x;};}if(m.webkit){E.Dom[w]=function(Y,G){var x=S(Y,G);if(x==="rgba(0, 0, 0, 0)"){x="transparent";}return x;};}if(m.ie&&m.ie>=8&&K.documentElement.hasAttribute){E.Dom.DOT_ATTRIBUTES.type=true;}})();YAHOO.util.Region=function(C,D,A,B){this.top=C;this.y=C;this[1]=C;this.right=D;this.bottom=A;this.left=B;this.x=B;this[0]=B;
this.width=this.right-this.left;this.height=this.bottom-this.top;};YAHOO.util.Region.prototype.contains=function(A){return(A.left>=this.left&&A.right<=this.right&&A.top>=this.top&&A.bottom<=this.bottom);};YAHOO.util.Region.prototype.getArea=function(){return((this.bottom-this.top)*(this.right-this.left));};YAHOO.util.Region.prototype.intersect=function(E){var C=Math.max(this.top,E.top),D=Math.min(this.right,E.right),A=Math.min(this.bottom,E.bottom),B=Math.max(this.left,E.left);if(A>=C&&D>=B){return new YAHOO.util.Region(C,D,A,B);}else{return null;}};YAHOO.util.Region.prototype.union=function(E){var C=Math.min(this.top,E.top),D=Math.max(this.right,E.right),A=Math.max(this.bottom,E.bottom),B=Math.min(this.left,E.left);return new YAHOO.util.Region(C,D,A,B);};YAHOO.util.Region.prototype.toString=function(){return("Region {"+"top: "+this.top+", right: "+this.right+", bottom: "+this.bottom+", left: "+this.left+", height: "+this.height+", width: "+this.width+"}");};YAHOO.util.Region.getRegion=function(D){var F=YAHOO.util.Dom.getXY(D),C=F[1],E=F[0]+D.offsetWidth,A=F[1]+D.offsetHeight,B=F[0];return new YAHOO.util.Region(C,E,A,B);};YAHOO.util.Point=function(A,B){if(YAHOO.lang.isArray(A)){B=A[1];A=A[0];}YAHOO.util.Point.superclass.constructor.call(this,B,A,B,A);};YAHOO.extend(YAHOO.util.Point,YAHOO.util.Region);(function(){var B=YAHOO.util,A="clientTop",F="clientLeft",J="parentNode",K="right",W="hasLayout",I="px",U="opacity",L="auto",D="borderLeftWidth",G="borderTopWidth",P="borderRightWidth",V="borderBottomWidth",S="visible",Q="transparent",N="height",E="width",H="style",T="currentStyle",R=/^width|height$/,O=/^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,M={get:function(X,Z){var Y="",a=X[T][Z];if(Z===U){Y=B.Dom.getStyle(X,U);}else{if(!a||(a.indexOf&&a.indexOf(I)>-1)){Y=a;}else{if(B.Dom.IE_COMPUTED[Z]){Y=B.Dom.IE_COMPUTED[Z](X,Z);}else{if(O.test(a)){Y=B.Dom.IE.ComputedStyle.getPixel(X,Z);}else{Y=a;}}}}return Y;},getOffset:function(Z,e){var b=Z[T][e],X=e.charAt(0).toUpperCase()+e.substr(1),c="offset"+X,Y="pixel"+X,a="",d;if(b==L){d=Z[c];if(d===undefined){a=0;}a=d;if(R.test(e)){Z[H][e]=d;if(Z[c]>d){a=d-(Z[c]-d);}Z[H][e]=L;}}else{if(!Z[H][Y]&&!Z[H][e]){Z[H][e]=b;}a=Z[H][Y];}return a+I;},getBorderWidth:function(X,Z){var Y=null;if(!X[T][W]){X[H].zoom=1;}switch(Z){case G:Y=X[A];break;case V:Y=X.offsetHeight-X.clientHeight-X[A];break;case D:Y=X[F];break;case P:Y=X.offsetWidth-X.clientWidth-X[F];break;}return Y+I;},getPixel:function(Y,X){var a=null,b=Y[T][K],Z=Y[T][X];Y[H][K]=Z;a=Y[H].pixelRight;Y[H][K]=b;return a+I;},getMargin:function(Y,X){var Z;if(Y[T][X]==L){Z=0+I;}else{Z=B.Dom.IE.ComputedStyle.getPixel(Y,X);}return Z;},getVisibility:function(Y,X){var Z;while((Z=Y[T])&&Z[X]=="inherit"){Y=Y[J];}return(Z)?Z[X]:S;},getColor:function(Y,X){return B.Dom.Color.toRGB(Y[T][X])||Q;},getBorderColor:function(Y,X){var Z=Y[T],a=Z[X]||Z.color;return B.Dom.Color.toRGB(B.Dom.Color.toHex(a));}},C={};C.top=C.right=C.bottom=C.left=C[E]=C[N]=M.getOffset;C.color=M.getColor;C[G]=C[P]=C[V]=C[D]=M.getBorderWidth;C.marginTop=C.marginRight=C.marginBottom=C.marginLeft=M.getMargin;C.visibility=M.getVisibility;C.borderColor=C.borderTopColor=C.borderRightColor=C.borderBottomColor=C.borderLeftColor=M.getBorderColor;B.Dom.IE_COMPUTED=C;B.Dom.IE_ComputedStyle=M;})();(function(){var C="toString",A=parseInt,B=RegExp,D=YAHOO.util;D.Dom.Color={KEYWORDS:{black:"000",silver:"c0c0c0",gray:"808080",white:"fff",maroon:"800000",red:"f00",purple:"800080",fuchsia:"f0f",green:"008000",lime:"0f0",olive:"808000",yellow:"ff0",navy:"000080",blue:"00f",teal:"008080",aqua:"0ff"},re_RGB:/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,re_hex:/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,re_hex3:/([0-9A-F])/gi,toRGB:function(E){if(!D.Dom.Color.re_RGB.test(E)){E=D.Dom.Color.toHex(E);}if(D.Dom.Color.re_hex.exec(E)){E="rgb("+[A(B.$1,16),A(B.$2,16),A(B.$3,16)].join(", ")+")";}return E;},toHex:function(H){H=D.Dom.Color.KEYWORDS[H]||H;if(D.Dom.Color.re_RGB.exec(H)){var G=(B.$1.length===1)?"0"+B.$1:Number(B.$1),F=(B.$2.length===1)?"0"+B.$2:Number(B.$2),E=(B.$3.length===1)?"0"+B.$3:Number(B.$3);H=[G[C](16),F[C](16),E[C](16)].join("");}if(H.length<6){H=H.replace(D.Dom.Color.re_hex3,"$1$1");}if(H!=="transparent"&&H.indexOf("#")<0){H="#"+H;}return H.toLowerCase();}};}());YAHOO.register("dom",YAHOO.util.Dom,{version:"2.8.0r4",build:"2449"});YAHOO.util.CustomEvent=function(D,C,B,A,E){this.type=D;this.scope=C||window;this.silent=B;this.fireOnce=E;this.fired=false;this.firedWith=null;this.signature=A||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var F="_YUICEOnSubscribe";if(D!==F){this.subscribeEvent=new YAHOO.util.CustomEvent(F,this,true);}this.lastError=null;};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(B,C,D){if(!B){throw new Error("Invalid callback for subscriber to '"+this.type+"'");}if(this.subscribeEvent){this.subscribeEvent.fire(B,C,D);}var A=new YAHOO.util.Subscriber(B,C,D);if(this.fireOnce&&this.fired){this.notify(A,this.firedWith);}else{this.subscribers.push(A);}},unsubscribe:function(D,F){if(!D){return this.unsubscribeAll();}var E=false;for(var B=0,A=this.subscribers.length;B<A;++B){var C=this.subscribers[B];if(C&&C.contains(D,F)){this._delete(B);E=true;}}return E;},fire:function(){this.lastError=null;var H=[],A=this.subscribers.length;var D=[].slice.call(arguments,0),C=true,F,B=false;if(this.fireOnce){if(this.fired){return true;}else{this.firedWith=D;}}this.fired=true;if(!A&&this.silent){return true;}if(!this.silent){}var E=this.subscribers.slice();for(F=0;F<A;++F){var G=E[F];if(!G){B=true;}else{C=this.notify(G,D);if(false===C){if(!this.silent){}break;}}}return(C!==false);},notify:function(F,C){var B,H=null,E=F.getScope(this.scope),A=YAHOO.util.Event.throwErrors;if(!this.silent){}if(this.signature==YAHOO.util.CustomEvent.FLAT){if(C.length>0){H=C[0];}try{B=F.fn.call(E,H,F.obj);}catch(G){this.lastError=G;if(A){throw G;}}}else{try{B=F.fn.call(E,this.type,C,F.obj);}catch(D){this.lastError=D;if(A){throw D;}}}return B;},unsubscribeAll:function(){var A=this.subscribers.length,B;for(B=A-1;B>-1;B--){this._delete(B);}this.subscribers=[];return A;},_delete:function(A){var B=this.subscribers[A];if(B){delete B.fn;delete B.obj;}this.subscribers.splice(A,1);},toString:function(){return"CustomEvent: "+"'"+this.type+"', "+"context: "+this.scope;}};YAHOO.util.Subscriber=function(A,B,C){this.fn=A;this.obj=YAHOO.lang.isUndefined(B)?null:B;this.overrideContext=C;};YAHOO.util.Subscriber.prototype.getScope=function(A){if(this.overrideContext){if(this.overrideContext===true){return this.obj;}else{return this.overrideContext;}}return A;};YAHOO.util.Subscriber.prototype.contains=function(A,B){if(B){return(this.fn==A&&this.obj==B);}else{return(this.fn==A);}};YAHOO.util.Subscriber.prototype.toString=function(){return"Subscriber { obj: "+this.obj+", overrideContext: "+(this.overrideContext||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var G=false,H=[],J=[],A=0,E=[],B=0,C={63232:38,63233:40,63234:37,63235:39,63276:33,63277:34,25:9},D=YAHOO.env.ua.ie,F="focusin",I="focusout";return{POLL_RETRYS:500,POLL_INTERVAL:40,EL:0,TYPE:1,FN:2,WFN:3,UNLOAD_OBJ:3,ADJ_SCOPE:4,OBJ:5,OVERRIDE:6,CAPTURE:7,lastError:null,isSafari:YAHOO.env.ua.webkit,webkit:YAHOO.env.ua.webkit,isIE:D,_interval:null,_dri:null,_specialTypes:{focusin:(D?"focusin":"focus"),focusout:(D?"focusout":"blur")},DOMReady:false,throwErrors:false,startInterval:function(){if(!this._interval){this._interval=YAHOO.lang.later(this.POLL_INTERVAL,this,this._tryPreloadAttach,null,true);}},onAvailable:function(Q,M,O,P,N){var K=(YAHOO.lang.isString(Q))?[Q]:Q;for(var L=0;L<K.length;L=L+1){E.push({id:K[L],fn:M,obj:O,overrideContext:P,checkReady:N});}A=this.POLL_RETRYS;this.startInterval();},onContentReady:function(N,K,L,M){this.onAvailable(N,K,L,M,true);},onDOMReady:function(){this.DOMReadyEvent.subscribe.apply(this.DOMReadyEvent,arguments);},_addListener:function(M,K,V,P,T,Y){if(!V||!V.call){return false;}if(this._isValidCollection(M)){var W=true;for(var Q=0,S=M.length;Q<S;++Q){W=this.on(M[Q],K,V,P,T)&&W;}return W;}else{if(YAHOO.lang.isString(M)){var O=this.getEl(M);if(O){M=O;}else{this.onAvailable(M,function(){YAHOO.util.Event._addListener(M,K,V,P,T,Y);});return true;}}}if(!M){return false;}if("unload"==K&&P!==this){J[J.length]=[M,K,V,P,T];return true;}var L=M;if(T){if(T===true){L=P;}else{L=T;}}var N=function(Z){return V.call(L,YAHOO.util.Event.getEvent(Z,M),P);};var X=[M,K,V,N,L,P,T,Y];var R=H.length;H[R]=X;try{this._simpleAdd(M,K,N,Y);}catch(U){this.lastError=U;this.removeListener(M,K,V);return false;}return true;},_getType:function(K){return this._specialTypes[K]||K;},addListener:function(M,P,L,N,O){var K=((P==F||P==I)&&!YAHOO.env.ua.ie)?true:false;return this._addListener(M,this._getType(P),L,N,O,K);},addFocusListener:function(L,K,M,N){return this.on(L,F,K,M,N);},removeFocusListener:function(L,K){return this.removeListener(L,F,K);},addBlurListener:function(L,K,M,N){return this.on(L,I,K,M,N);},removeBlurListener:function(L,K){return this.removeListener(L,I,K);},removeListener:function(L,K,R){var M,P,U;K=this._getType(K);if(typeof L=="string"){L=this.getEl(L);}else{if(this._isValidCollection(L)){var S=true;for(M=L.length-1;M>-1;M--){S=(this.removeListener(L[M],K,R)&&S);}return S;}}if(!R||!R.call){return this.purgeElement(L,false,K);}if("unload"==K){for(M=J.length-1;M>-1;M--){U=J[M];if(U&&U[0]==L&&U[1]==K&&U[2]==R){J.splice(M,1);return true;}}return false;}var N=null;var O=arguments[3];if("undefined"===typeof O){O=this._getCacheIndex(H,L,K,R);}if(O>=0){N=H[O];}if(!L||!N){return false;}var T=N[this.CAPTURE]===true?true:false;try{this._simpleRemove(L,K,N[this.WFN],T);}catch(Q){this.lastError=Q;return false;}delete H[O][this.WFN];delete H[O][this.FN];H.splice(O,1);return true;},getTarget:function(M,L){var K=M.target||M.srcElement;return this.resolveTextNode(K);},resolveTextNode:function(L){try{if(L&&3==L.nodeType){return L.parentNode;}}catch(K){}return L;},getPageX:function(L){var K=L.pageX;if(!K&&0!==K){K=L.clientX||0;if(this.isIE){K+=this._getScrollLeft();}}return K;},getPageY:function(K){var L=K.pageY;if(!L&&0!==L){L=K.clientY||0;if(this.isIE){L+=this._getScrollTop();}}return L;},getXY:function(K){return[this.getPageX(K),this.getPageY(K)];},getRelatedTarget:function(L){var K=L.relatedTarget;if(!K){if(L.type=="mouseout"){K=L.toElement;
}else{if(L.type=="mouseover"){K=L.fromElement;}}}return this.resolveTextNode(K);},getTime:function(M){if(!M.time){var L=new Date().getTime();try{M.time=L;}catch(K){this.lastError=K;return L;}}return M.time;},stopEvent:function(K){this.stopPropagation(K);this.preventDefault(K);},stopPropagation:function(K){if(K.stopPropagation){K.stopPropagation();}else{K.cancelBubble=true;}},preventDefault:function(K){if(K.preventDefault){K.preventDefault();}else{K.returnValue=false;}},getEvent:function(M,K){var L=M||window.event;if(!L){var N=this.getEvent.caller;while(N){L=N.arguments[0];if(L&&Event==L.constructor){break;}N=N.caller;}}return L;},getCharCode:function(L){var K=L.keyCode||L.charCode||0;if(YAHOO.env.ua.webkit&&(K in C)){K=C[K];}return K;},_getCacheIndex:function(M,P,Q,O){for(var N=0,L=M.length;N<L;N=N+1){var K=M[N];if(K&&K[this.FN]==O&&K[this.EL]==P&&K[this.TYPE]==Q){return N;}}return -1;},generateId:function(K){var L=K.id;if(!L){L="yuievtautoid-"+B;++B;K.id=L;}return L;},_isValidCollection:function(L){try{return(L&&typeof L!=="string"&&L.length&&!L.tagName&&!L.alert&&typeof L[0]!=="undefined");}catch(K){return false;}},elCache:{},getEl:function(K){return(typeof K==="string")?document.getElementById(K):K;},clearCache:function(){},DOMReadyEvent:new YAHOO.util.CustomEvent("DOMReady",YAHOO,0,0,1),_load:function(L){if(!G){G=true;var K=YAHOO.util.Event;K._ready();K._tryPreloadAttach();}},_ready:function(L){var K=YAHOO.util.Event;if(!K.DOMReady){K.DOMReady=true;K.DOMReadyEvent.fire();K._simpleRemove(document,"DOMContentLoaded",K._ready);}},_tryPreloadAttach:function(){if(E.length===0){A=0;if(this._interval){this._interval.cancel();this._interval=null;}return;}if(this.locked){return;}if(this.isIE){if(!this.DOMReady){this.startInterval();return;}}this.locked=true;var Q=!G;if(!Q){Q=(A>0&&E.length>0);}var P=[];var R=function(T,U){var S=T;if(U.overrideContext){if(U.overrideContext===true){S=U.obj;}else{S=U.overrideContext;}}U.fn.call(S,U.obj);};var L,K,O,N,M=[];for(L=0,K=E.length;L<K;L=L+1){O=E[L];if(O){N=this.getEl(O.id);if(N){if(O.checkReady){if(G||N.nextSibling||!Q){M.push(O);E[L]=null;}}else{R(N,O);E[L]=null;}}else{P.push(O);}}}for(L=0,K=M.length;L<K;L=L+1){O=M[L];R(this.getEl(O.id),O);}A--;if(Q){for(L=E.length-1;L>-1;L--){O=E[L];if(!O||!O.id){E.splice(L,1);}}this.startInterval();}else{if(this._interval){this._interval.cancel();this._interval=null;}}this.locked=false;},purgeElement:function(O,P,R){var M=(YAHOO.lang.isString(O))?this.getEl(O):O;var Q=this.getListeners(M,R),N,K;if(Q){for(N=Q.length-1;N>-1;N--){var L=Q[N];this.removeListener(M,L.type,L.fn);}}if(P&&M&&M.childNodes){for(N=0,K=M.childNodes.length;N<K;++N){this.purgeElement(M.childNodes[N],P,R);}}},getListeners:function(M,K){var P=[],L;if(!K){L=[H,J];}else{if(K==="unload"){L=[J];}else{K=this._getType(K);L=[H];}}var R=(YAHOO.lang.isString(M))?this.getEl(M):M;for(var O=0;O<L.length;O=O+1){var T=L[O];if(T){for(var Q=0,S=T.length;Q<S;++Q){var N=T[Q];if(N&&N[this.EL]===R&&(!K||K===N[this.TYPE])){P.push({type:N[this.TYPE],fn:N[this.FN],obj:N[this.OBJ],adjust:N[this.OVERRIDE],scope:N[this.ADJ_SCOPE],index:Q});}}}}return(P.length)?P:null;},_unload:function(R){var L=YAHOO.util.Event,O,N,M,Q,P,S=J.slice(),K;for(O=0,Q=J.length;O<Q;++O){M=S[O];if(M){K=window;if(M[L.ADJ_SCOPE]){if(M[L.ADJ_SCOPE]===true){K=M[L.UNLOAD_OBJ];}else{K=M[L.ADJ_SCOPE];}}M[L.FN].call(K,L.getEvent(R,M[L.EL]),M[L.UNLOAD_OBJ]);S[O]=null;}}M=null;K=null;J=null;if(H){for(N=H.length-1;N>-1;N--){M=H[N];if(M){L.removeListener(M[L.EL],M[L.TYPE],M[L.FN],N);}}M=null;}L._simpleRemove(window,"unload",L._unload);},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var K=document.documentElement,L=document.body;if(K&&(K.scrollTop||K.scrollLeft)){return[K.scrollTop,K.scrollLeft];}else{if(L){return[L.scrollTop,L.scrollLeft];}else{return[0,0];}}},regCE:function(){},_simpleAdd:function(){if(window.addEventListener){return function(M,N,L,K){M.addEventListener(N,L,(K));};}else{if(window.attachEvent){return function(M,N,L,K){M.attachEvent("on"+N,L);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(M,N,L,K){M.removeEventListener(N,L,(K));};}else{if(window.detachEvent){return function(L,M,K){L.detachEvent("on"+M,K);};}else{return function(){};}}}()};}();(function(){var EU=YAHOO.util.Event;EU.on=EU.addListener;EU.onFocus=EU.addFocusListener;EU.onBlur=EU.addBlurListener;
/* DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller/Diego Perini */
if(EU.isIE){if(self!==self.top){document.onreadystatechange=function(){if(document.readyState=="complete"){document.onreadystatechange=null;EU._ready();}};}else{YAHOO.util.Event.onDOMReady(YAHOO.util.Event._tryPreloadAttach,YAHOO.util.Event,true);var n=document.createElement("p");EU._dri=setInterval(function(){try{n.doScroll("left");clearInterval(EU._dri);EU._dri=null;EU._ready();n=null;}catch(ex){}},EU.POLL_INTERVAL);}}else{if(EU.webkit&&EU.webkit<525){EU._dri=setInterval(function(){var rs=document.readyState;if("loaded"==rs||"complete"==rs){clearInterval(EU._dri);EU._dri=null;EU._ready();}},EU.POLL_INTERVAL);}else{EU._simpleAdd(document,"DOMContentLoaded",EU._ready);}}EU._simpleAdd(window,"load",EU._load);EU._simpleAdd(window,"unload",EU._unload);EU._tryPreloadAttach();})();}YAHOO.util.EventProvider=function(){};YAHOO.util.EventProvider.prototype={__yui_events:null,__yui_subscribers:null,subscribe:function(A,C,F,E){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[A];if(D){D.subscribe(C,F,E);}else{this.__yui_subscribers=this.__yui_subscribers||{};var B=this.__yui_subscribers;if(!B[A]){B[A]=[];}B[A].push({fn:C,obj:F,overrideContext:E});}},unsubscribe:function(C,E,G){this.__yui_events=this.__yui_events||{};var A=this.__yui_events;if(C){var F=A[C];if(F){return F.unsubscribe(E,G);}}else{var B=true;for(var D in A){if(YAHOO.lang.hasOwnProperty(A,D)){B=B&&A[D].unsubscribe(E,G);}}return B;}return false;},unsubscribeAll:function(A){return this.unsubscribe(A);
},createEvent:function(B,G){this.__yui_events=this.__yui_events||{};var E=G||{},D=this.__yui_events,F;if(D[B]){}else{F=new YAHOO.util.CustomEvent(B,E.scope||this,E.silent,YAHOO.util.CustomEvent.FLAT,E.fireOnce);D[B]=F;if(E.onSubscribeCallback){F.subscribeEvent.subscribe(E.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var A=this.__yui_subscribers[B];if(A){for(var C=0;C<A.length;++C){F.subscribe(A[C].fn,A[C].obj,A[C].overrideContext);}}}return D[B];},fireEvent:function(B){this.__yui_events=this.__yui_events||{};var D=this.__yui_events[B];if(!D){return null;}var A=[];for(var C=1;C<arguments.length;++C){A.push(arguments[C]);}return D.fire.apply(D,A);},hasEvent:function(A){if(this.__yui_events){if(this.__yui_events[A]){return true;}}return false;}};(function(){var A=YAHOO.util.Event,C=YAHOO.lang;YAHOO.util.KeyListener=function(D,I,E,F){if(!D){}else{if(!I){}else{if(!E){}}}if(!F){F=YAHOO.util.KeyListener.KEYDOWN;}var G=new YAHOO.util.CustomEvent("keyPressed");this.enabledEvent=new YAHOO.util.CustomEvent("enabled");this.disabledEvent=new YAHOO.util.CustomEvent("disabled");if(C.isString(D)){D=document.getElementById(D);}if(C.isFunction(E)){G.subscribe(E);}else{G.subscribe(E.fn,E.scope,E.correctScope);}function H(O,N){if(!I.shift){I.shift=false;}if(!I.alt){I.alt=false;}if(!I.ctrl){I.ctrl=false;}if(O.shiftKey==I.shift&&O.altKey==I.alt&&O.ctrlKey==I.ctrl){var J,M=I.keys,L;if(YAHOO.lang.isArray(M)){for(var K=0;K<M.length;K++){J=M[K];L=A.getCharCode(O);if(J==L){G.fire(L,O);break;}}}else{L=A.getCharCode(O);if(M==L){G.fire(L,O);}}}}this.enable=function(){if(!this.enabled){A.on(D,F,H);this.enabledEvent.fire(I);}this.enabled=true;};this.disable=function(){if(this.enabled){A.removeListener(D,F,H);this.disabledEvent.fire(I);}this.enabled=false;};this.toString=function(){return"KeyListener ["+I.keys+"] "+D.tagName+(D.id?"["+D.id+"]":"");};};var B=YAHOO.util.KeyListener;B.KEYDOWN="keydown";B.KEYUP="keyup";B.KEY={ALT:18,BACK_SPACE:8,CAPS_LOCK:20,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,META:224,NUM_LOCK:144,PAGE_DOWN:34,PAGE_UP:33,PAUSE:19,PRINTSCREEN:44,RIGHT:39,SCROLL_LOCK:145,SHIFT:16,SPACE:32,TAB:9,UP:38};})();YAHOO.register("event",YAHOO.util.Event,{version:"2.8.0r4",build:"2449"});YAHOO.register("yahoo-dom-event", YAHOO, {version: "2.8.0r4", build: "2449"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
(function(){var B=YAHOO.util;var A=function(D,C,E,F){if(!D){}this.init(D,C,E,F);};A.NAME="Anim";A.prototype={toString:function(){var C=this.getEl()||{};var D=C.id||C.tagName;return(this.constructor.NAME+": "+D);},patterns:{noNegatives:/width|height|opacity|padding/i,offsetAttribute:/^((width|height)|(top|left))$/,defaultUnit:/width|height|top$|bottom$|left$|right$/i,offsetUnit:/\d+(em|%|en|ex|pt|in|cm|mm|pc)$/i},doMethod:function(C,E,D){return this.method(this.currentFrame,E,D-E,this.totalFrames);},setAttribute:function(C,F,E){var D=this.getEl();if(this.patterns.noNegatives.test(C)){F=(F>0)?F:0;}if(C in D&&!("style" in D&&C in D.style)){D[C]=F;}else{B.Dom.setStyle(D,C,F+E);}},getAttribute:function(C){var E=this.getEl();var G=B.Dom.getStyle(E,C);if(G!=="auto"&&!this.patterns.offsetUnit.test(G)){return parseFloat(G);}var D=this.patterns.offsetAttribute.exec(C)||[];var H=!!(D[3]);var F=!!(D[2]);if("style" in E){if(F||(B.Dom.getStyle(E,"position")=="absolute"&&H)){G=E["offset"+D[0].charAt(0).toUpperCase()+D[0].substr(1)];}else{G=0;}}else{if(C in E){G=E[C];}}return G;},getDefaultUnit:function(C){if(this.patterns.defaultUnit.test(C)){return"px";}return"";},setRuntimeAttribute:function(D){var I;var E;var F=this.attributes;this.runtimeAttributes[D]={};var H=function(J){return(typeof J!=="undefined");};if(!H(F[D]["to"])&&!H(F[D]["by"])){return false;}I=(H(F[D]["from"]))?F[D]["from"]:this.getAttribute(D);if(H(F[D]["to"])){E=F[D]["to"];}else{if(H(F[D]["by"])){if(I.constructor==Array){E=[];for(var G=0,C=I.length;G<C;++G){E[G]=I[G]+F[D]["by"][G]*1;}}else{E=I+F[D]["by"]*1;}}}this.runtimeAttributes[D].start=I;this.runtimeAttributes[D].end=E;this.runtimeAttributes[D].unit=(H(F[D].unit))?F[D]["unit"]:this.getDefaultUnit(D);return true;},init:function(E,J,I,C){var D=false;var F=null;var H=0;E=B.Dom.get(E);this.attributes=J||{};this.duration=!YAHOO.lang.isUndefined(I)?I:1;this.method=C||B.Easing.easeNone;this.useSeconds=true;this.currentFrame=0;this.totalFrames=B.AnimMgr.fps;this.setEl=function(M){E=B.Dom.get(M);};this.getEl=function(){return E;};this.isAnimated=function(){return D;};this.getStartTime=function(){return F;};this.runtimeAttributes={};this.animate=function(){if(this.isAnimated()){return false;}this.currentFrame=0;this.totalFrames=(this.useSeconds)?Math.ceil(B.AnimMgr.fps*this.duration):this.duration;if(this.duration===0&&this.useSeconds){this.totalFrames=1;}B.AnimMgr.registerElement(this);return true;};this.stop=function(M){if(!this.isAnimated()){return false;}if(M){this.currentFrame=this.totalFrames;this._onTween.fire();}B.AnimMgr.stop(this);};var L=function(){this.onStart.fire();this.runtimeAttributes={};for(var M in this.attributes){this.setRuntimeAttribute(M);}D=true;H=0;F=new Date();};var K=function(){var O={duration:new Date()-this.getStartTime(),currentFrame:this.currentFrame};O.toString=function(){return("duration: "+O.duration+", currentFrame: "+O.currentFrame);};this.onTween.fire(O);var N=this.runtimeAttributes;for(var M in N){this.setAttribute(M,this.doMethod(M,N[M].start,N[M].end),N[M].unit);}H+=1;};var G=function(){var M=(new Date()-F)/1000;var N={duration:M,frames:H,fps:H/M};N.toString=function(){return("duration: "+N.duration+", frames: "+N.frames+", fps: "+N.fps);};D=false;H=0;this.onComplete.fire(N);};this._onStart=new B.CustomEvent("_start",this,true);this.onStart=new B.CustomEvent("start",this);this.onTween=new B.CustomEvent("tween",this);this._onTween=new B.CustomEvent("_tween",this,true);this.onComplete=new B.CustomEvent("complete",this);this._onComplete=new B.CustomEvent("_complete",this,true);this._onStart.subscribe(L);this._onTween.subscribe(K);this._onComplete.subscribe(G);}};B.Anim=A;})();YAHOO.util.AnimMgr=new function(){var C=null;var B=[];var A=0;this.fps=1000;this.delay=1;this.registerElement=function(F){B[B.length]=F;A+=1;F._onStart.fire();this.start();};this.unRegister=function(G,F){F=F||E(G);if(!G.isAnimated()||F===-1){return false;}G._onComplete.fire();B.splice(F,1);A-=1;if(A<=0){this.stop();}return true;};this.start=function(){if(C===null){C=setInterval(this.run,this.delay);}};this.stop=function(H){if(!H){clearInterval(C);for(var G=0,F=B.length;G<F;++G){this.unRegister(B[0],0);}B=[];C=null;A=0;}else{this.unRegister(H);}};this.run=function(){for(var H=0,F=B.length;H<F;++H){var G=B[H];if(!G||!G.isAnimated()){continue;}if(G.currentFrame<G.totalFrames||G.totalFrames===null){G.currentFrame+=1;if(G.useSeconds){D(G);}G._onTween.fire();}else{YAHOO.util.AnimMgr.stop(G,H);}}};var E=function(H){for(var G=0,F=B.length;G<F;++G){if(B[G]===H){return G;}}return -1;};var D=function(G){var J=G.totalFrames;var I=G.currentFrame;var H=(G.currentFrame*G.duration*1000/G.totalFrames);var F=(new Date()-G.getStartTime());var K=0;if(F<G.duration*1000){K=Math.round((F/H-1)*G.currentFrame);}else{K=J-(I+1);}if(K>0&&isFinite(K)){if(G.currentFrame+K>=J){K=J-(I+1);}G.currentFrame+=K;}};this._queue=B;this._getIndex=E;};YAHOO.util.Bezier=new function(){this.getPosition=function(E,D){var F=E.length;var C=[];for(var B=0;B<F;++B){C[B]=[E[B][0],E[B][1]];}for(var A=1;A<F;++A){for(B=0;B<F-A;++B){C[B][0]=(1-D)*C[B][0]+D*C[parseInt(B+1,10)][0];C[B][1]=(1-D)*C[B][1]+D*C[parseInt(B+1,10)][1];}}return[C[0][0],C[0][1]];};};(function(){var A=function(F,E,G,H){A.superclass.constructor.call(this,F,E,G,H);};A.NAME="ColorAnim";A.DEFAULT_BGCOLOR="#fff";var C=YAHOO.util;YAHOO.extend(A,C.Anim);var D=A.superclass;var B=A.prototype;B.patterns.color=/color$/i;B.patterns.rgb=/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i;B.patterns.hex=/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;B.patterns.hex3=/^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i;B.patterns.transparent=/^transparent|rgba\(0, 0, 0, 0\)$/;B.parseColor=function(E){if(E.length==3){return E;}var F=this.patterns.hex.exec(E);if(F&&F.length==4){return[parseInt(F[1],16),parseInt(F[2],16),parseInt(F[3],16)];}F=this.patterns.rgb.exec(E);if(F&&F.length==4){return[parseInt(F[1],10),parseInt(F[2],10),parseInt(F[3],10)];}F=this.patterns.hex3.exec(E);if(F&&F.length==4){return[parseInt(F[1]+F[1],16),parseInt(F[2]+F[2],16),parseInt(F[3]+F[3],16)];
}return null;};B.getAttribute=function(E){var G=this.getEl();if(this.patterns.color.test(E)){var I=YAHOO.util.Dom.getStyle(G,E);var H=this;if(this.patterns.transparent.test(I)){var F=YAHOO.util.Dom.getAncestorBy(G,function(J){return !H.patterns.transparent.test(I);});if(F){I=C.Dom.getStyle(F,E);}else{I=A.DEFAULT_BGCOLOR;}}}else{I=D.getAttribute.call(this,E);}return I;};B.doMethod=function(F,J,G){var I;if(this.patterns.color.test(F)){I=[];for(var H=0,E=J.length;H<E;++H){I[H]=D.doMethod.call(this,F,J[H],G[H]);}I="rgb("+Math.floor(I[0])+","+Math.floor(I[1])+","+Math.floor(I[2])+")";}else{I=D.doMethod.call(this,F,J,G);}return I;};B.setRuntimeAttribute=function(F){D.setRuntimeAttribute.call(this,F);if(this.patterns.color.test(F)){var H=this.attributes;var J=this.parseColor(this.runtimeAttributes[F].start);var G=this.parseColor(this.runtimeAttributes[F].end);if(typeof H[F]["to"]==="undefined"&&typeof H[F]["by"]!=="undefined"){G=this.parseColor(H[F].by);for(var I=0,E=J.length;I<E;++I){G[I]=J[I]+G[I];}}this.runtimeAttributes[F].start=J;this.runtimeAttributes[F].end=G;}};C.ColorAnim=A;})();
/*
TERMS OF USE - EASING EQUATIONS
Open source under the BSD License.
Copyright 2001 Robert Penner All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
YAHOO.util.Easing={easeNone:function(B,A,D,C){return D*B/C+A;},easeIn:function(B,A,D,C){return D*(B/=C)*B+A;},easeOut:function(B,A,D,C){return -D*(B/=C)*(B-2)+A;},easeBoth:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B+A;}return -D/2*((--B)*(B-2)-1)+A;},easeInStrong:function(B,A,D,C){return D*(B/=C)*B*B*B+A;},easeOutStrong:function(B,A,D,C){return -D*((B=B/C-1)*B*B*B-1)+A;},easeBothStrong:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B*B*B+A;}return -D/2*((B-=2)*B*B*B-2)+A;},elasticIn:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F)==1){return A+G;}if(!E){E=F*0.3;}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}return -(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A;},elasticOut:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F)==1){return A+G;}if(!E){E=F*0.3;}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}return B*Math.pow(2,-10*C)*Math.sin((C*F-D)*(2*Math.PI)/E)+G+A;},elasticBoth:function(C,A,G,F,B,E){if(C==0){return A;}if((C/=F/2)==2){return A+G;}if(!E){E=F*(0.3*1.5);}if(!B||B<Math.abs(G)){B=G;var D=E/4;}else{var D=E/(2*Math.PI)*Math.asin(G/B);}if(C<1){return -0.5*(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A;}return B*Math.pow(2,-10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E)*0.5+G+A;},backIn:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}return E*(B/=D)*B*((C+1)*B-C)+A;},backOut:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}return E*((B=B/D-1)*B*((C+1)*B+C)+1)+A;},backBoth:function(B,A,E,D,C){if(typeof C=="undefined"){C=1.70158;}if((B/=D/2)<1){return E/2*(B*B*(((C*=(1.525))+1)*B-C))+A;}return E/2*((B-=2)*B*(((C*=(1.525))+1)*B+C)+2)+A;},bounceIn:function(B,A,D,C){return D-YAHOO.util.Easing.bounceOut(C-B,0,D,C)+A;},bounceOut:function(B,A,D,C){if((B/=C)<(1/2.75)){return D*(7.5625*B*B)+A;}else{if(B<(2/2.75)){return D*(7.5625*(B-=(1.5/2.75))*B+0.75)+A;}else{if(B<(2.5/2.75)){return D*(7.5625*(B-=(2.25/2.75))*B+0.9375)+A;}}}return D*(7.5625*(B-=(2.625/2.75))*B+0.984375)+A;},bounceBoth:function(B,A,D,C){if(B<C/2){return YAHOO.util.Easing.bounceIn(B*2,0,D,C)*0.5+A;}return YAHOO.util.Easing.bounceOut(B*2-C,0,D,C)*0.5+D*0.5+A;}};(function(){var A=function(H,G,I,J){if(H){A.superclass.constructor.call(this,H,G,I,J);}};A.NAME="Motion";var E=YAHOO.util;YAHOO.extend(A,E.ColorAnim);var F=A.superclass;var C=A.prototype;C.patterns.points=/^points$/i;C.setAttribute=function(G,I,H){if(this.patterns.points.test(G)){H=H||"px";F.setAttribute.call(this,"left",I[0],H);F.setAttribute.call(this,"top",I[1],H);}else{F.setAttribute.call(this,G,I,H);}};C.getAttribute=function(G){if(this.patterns.points.test(G)){var H=[F.getAttribute.call(this,"left"),F.getAttribute.call(this,"top")];}else{H=F.getAttribute.call(this,G);}return H;};C.doMethod=function(G,K,H){var J=null;if(this.patterns.points.test(G)){var I=this.method(this.currentFrame,0,100,this.totalFrames)/100;J=E.Bezier.getPosition(this.runtimeAttributes[G],I);}else{J=F.doMethod.call(this,G,K,H);}return J;};C.setRuntimeAttribute=function(P){if(this.patterns.points.test(P)){var H=this.getEl();var J=this.attributes;var G;var L=J["points"]["control"]||[];var I;var M,O;if(L.length>0&&!(L[0] instanceof Array)){L=[L];}else{var K=[];for(M=0,O=L.length;M<O;++M){K[M]=L[M];}L=K;}if(E.Dom.getStyle(H,"position")=="static"){E.Dom.setStyle(H,"position","relative");}if(D(J["points"]["from"])){E.Dom.setXY(H,J["points"]["from"]);
}else{E.Dom.setXY(H,E.Dom.getXY(H));}G=this.getAttribute("points");if(D(J["points"]["to"])){I=B.call(this,J["points"]["to"],G);var N=E.Dom.getXY(this.getEl());for(M=0,O=L.length;M<O;++M){L[M]=B.call(this,L[M],G);}}else{if(D(J["points"]["by"])){I=[G[0]+J["points"]["by"][0],G[1]+J["points"]["by"][1]];for(M=0,O=L.length;M<O;++M){L[M]=[G[0]+L[M][0],G[1]+L[M][1]];}}}this.runtimeAttributes[P]=[G];if(L.length>0){this.runtimeAttributes[P]=this.runtimeAttributes[P].concat(L);}this.runtimeAttributes[P][this.runtimeAttributes[P].length]=I;}else{F.setRuntimeAttribute.call(this,P);}};var B=function(G,I){var H=E.Dom.getXY(this.getEl());G=[G[0]-H[0]+I[0],G[1]-H[1]+I[1]];return G;};var D=function(G){return(typeof G!=="undefined");};E.Motion=A;})();(function(){var D=function(F,E,G,H){if(F){D.superclass.constructor.call(this,F,E,G,H);}};D.NAME="Scroll";var B=YAHOO.util;YAHOO.extend(D,B.ColorAnim);var C=D.superclass;var A=D.prototype;A.doMethod=function(E,H,F){var G=null;if(E=="scroll"){G=[this.method(this.currentFrame,H[0],F[0]-H[0],this.totalFrames),this.method(this.currentFrame,H[1],F[1]-H[1],this.totalFrames)];}else{G=C.doMethod.call(this,E,H,F);}return G;};A.getAttribute=function(E){var G=null;var F=this.getEl();if(E=="scroll"){G=[F.scrollLeft,F.scrollTop];}else{G=C.getAttribute.call(this,E);}return G;};A.setAttribute=function(E,H,G){var F=this.getEl();if(E=="scroll"){F.scrollLeft=H[0];F.scrollTop=H[1];}else{C.setAttribute.call(this,E,H,G);}};B.Scroll=D;})();YAHOO.register("animation",YAHOO.util.Anim,{version:"2.8.0r4",build:"2449"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
(function(){YAHOO.util.Config=function(D){if(D){this.init(D);}};var B=YAHOO.lang,C=YAHOO.util.CustomEvent,A=YAHOO.util.Config;A.CONFIG_CHANGED_EVENT="configChanged";A.BOOLEAN_TYPE="boolean";A.prototype={owner:null,queueInProgress:false,config:null,initialConfig:null,eventQueue:null,configChangedEvent:null,init:function(D){this.owner=D;this.configChangedEvent=this.createEvent(A.CONFIG_CHANGED_EVENT);this.configChangedEvent.signature=C.LIST;this.queueInProgress=false;this.config={};this.initialConfig={};this.eventQueue=[];},checkBoolean:function(D){return(typeof D==A.BOOLEAN_TYPE);},checkNumber:function(D){return(!isNaN(D));},fireEvent:function(D,F){var E=this.config[D];if(E&&E.event){E.event.fire(F);}},addProperty:function(E,D){E=E.toLowerCase();this.config[E]=D;D.event=this.createEvent(E,{scope:this.owner});D.event.signature=C.LIST;D.key=E;if(D.handler){D.event.subscribe(D.handler,this.owner);}this.setProperty(E,D.value,true);if(!D.suppressEvent){this.queueProperty(E,D.value);}},getConfig:function(){var D={},F=this.config,G,E;for(G in F){if(B.hasOwnProperty(F,G)){E=F[G];if(E&&E.event){D[G]=E.value;}}}return D;},getProperty:function(D){var E=this.config[D.toLowerCase()];if(E&&E.event){return E.value;}else{return undefined;}},resetProperty:function(D){D=D.toLowerCase();var E=this.config[D];if(E&&E.event){if(this.initialConfig[D]&&!B.isUndefined(this.initialConfig[D])){this.setProperty(D,this.initialConfig[D]);return true;}}else{return false;}},setProperty:function(E,G,D){var F;E=E.toLowerCase();if(this.queueInProgress&&!D){this.queueProperty(E,G);return true;}else{F=this.config[E];if(F&&F.event){if(F.validator&&!F.validator(G)){return false;}else{F.value=G;if(!D){this.fireEvent(E,G);this.configChangedEvent.fire([E,G]);}return true;}}else{return false;}}},queueProperty:function(S,P){S=S.toLowerCase();var R=this.config[S],K=false,J,G,H,I,O,Q,F,M,N,D,L,T,E;if(R&&R.event){if(!B.isUndefined(P)&&R.validator&&!R.validator(P)){return false;}else{if(!B.isUndefined(P)){R.value=P;}else{P=R.value;}K=false;J=this.eventQueue.length;for(L=0;L<J;L++){G=this.eventQueue[L];if(G){H=G[0];I=G[1];if(H==S){this.eventQueue[L]=null;this.eventQueue.push([S,(!B.isUndefined(P)?P:I)]);K=true;break;}}}if(!K&&!B.isUndefined(P)){this.eventQueue.push([S,P]);}}if(R.supercedes){O=R.supercedes.length;for(T=0;T<O;T++){Q=R.supercedes[T];F=this.eventQueue.length;for(E=0;E<F;E++){M=this.eventQueue[E];if(M){N=M[0];D=M[1];if(N==Q.toLowerCase()){this.eventQueue.push([N,D]);this.eventQueue[E]=null;break;}}}}}return true;}else{return false;}},refireEvent:function(D){D=D.toLowerCase();var E=this.config[D];if(E&&E.event&&!B.isUndefined(E.value)){if(this.queueInProgress){this.queueProperty(D);}else{this.fireEvent(D,E.value);}}},applyConfig:function(D,G){var F,E;if(G){E={};for(F in D){if(B.hasOwnProperty(D,F)){E[F.toLowerCase()]=D[F];}}this.initialConfig=E;}for(F in D){if(B.hasOwnProperty(D,F)){this.queueProperty(F,D[F]);}}},refresh:function(){var D;for(D in this.config){if(B.hasOwnProperty(this.config,D)){this.refireEvent(D);}}},fireQueue:function(){var E,H,D,G,F;this.queueInProgress=true;for(E=0;E<this.eventQueue.length;E++){H=this.eventQueue[E];if(H){D=H[0];G=H[1];F=this.config[D];F.value=G;this.eventQueue[E]=null;this.fireEvent(D,G);}}this.queueInProgress=false;this.eventQueue=[];},subscribeToConfigEvent:function(D,E,G,H){var F=this.config[D.toLowerCase()];if(F&&F.event){if(!A.alreadySubscribed(F.event,E,G)){F.event.subscribe(E,G,H);}return true;}else{return false;}},unsubscribeFromConfigEvent:function(D,E,G){var F=this.config[D.toLowerCase()];if(F&&F.event){return F.event.unsubscribe(E,G);}else{return false;}},toString:function(){var D="Config";if(this.owner){D+=" ["+this.owner.toString()+"]";}return D;},outputEventQueue:function(){var D="",G,E,F=this.eventQueue.length;for(E=0;E<F;E++){G=this.eventQueue[E];if(G){D+=G[0]+"="+G[1]+", ";}}return D;},destroy:function(){var E=this.config,D,F;for(D in E){if(B.hasOwnProperty(E,D)){F=E[D];F.event.unsubscribeAll();F.event=null;}}this.configChangedEvent.unsubscribeAll();this.configChangedEvent=null;this.owner=null;this.config=null;this.initialConfig=null;this.eventQueue=null;}};A.alreadySubscribed=function(E,H,I){var F=E.subscribers.length,D,G;if(F>0){G=F-1;do{D=E.subscribers[G];if(D&&D.obj==I&&D.fn==H){return true;}}while(G--);}return false;};YAHOO.lang.augmentProto(A,YAHOO.util.EventProvider);}());YAHOO.widget.DateMath={DAY:"D",WEEK:"W",YEAR:"Y",MONTH:"M",ONE_DAY_MS:1000*60*60*24,WEEK_ONE_JAN_DATE:1,add:function(A,D,C){var F=new Date(A.getTime());switch(D){case this.MONTH:var E=A.getMonth()+C;var B=0;if(E<0){while(E<0){E+=12;B-=1;}}else{if(E>11){while(E>11){E-=12;B+=1;}}}F.setMonth(E);F.setFullYear(A.getFullYear()+B);break;case this.DAY:this._addDays(F,C);break;case this.YEAR:F.setFullYear(A.getFullYear()+C);break;case this.WEEK:this._addDays(F,(C*7));break;}return F;},_addDays:function(D,C){if(YAHOO.env.ua.webkit&&YAHOO.env.ua.webkit<420){if(C<0){for(var B=-128;C<B;C-=B){D.setDate(D.getDate()+B);}}else{for(var A=96;C>A;C-=A){D.setDate(D.getDate()+A);}}}D.setDate(D.getDate()+C);},subtract:function(A,C,B){return this.add(A,C,(B*-1));},before:function(C,B){var A=B.getTime();if(C.getTime()<A){return true;}else{return false;}},after:function(C,B){var A=B.getTime();if(C.getTime()>A){return true;}else{return false;}},between:function(B,A,C){if(this.after(B,A)&&this.before(B,C)){return true;}else{return false;}},getJan1:function(A){return this.getDate(A,0,1);},getDayOffset:function(B,D){var C=this.getJan1(D);var A=Math.ceil((B.getTime()-C.getTime())/this.ONE_DAY_MS);return A;},getWeekNumber:function(D,B,G){B=B||0;G=G||this.WEEK_ONE_JAN_DATE;var H=this.clearTime(D),L,M;if(H.getDay()===B){L=H;}else{L=this.getFirstDayOfWeek(H,B);}var I=L.getFullYear();M=new Date(L.getTime()+6*this.ONE_DAY_MS);var F;if(I!==M.getFullYear()&&M.getDate()>=G){F=1;}else{var E=this.clearTime(this.getDate(I,0,G)),A=this.getFirstDayOfWeek(E,B);var J=Math.round((H.getTime()-A.getTime())/this.ONE_DAY_MS);var K=J%7;var C=(J-K)/7;
F=C+1;}return F;},getFirstDayOfWeek:function(D,A){A=A||0;var B=D.getDay(),C=(B-A+7)%7;return this.subtract(D,this.DAY,C);},isYearOverlapWeek:function(A){var C=false;var B=this.add(A,this.DAY,6);if(B.getFullYear()!=A.getFullYear()){C=true;}return C;},isMonthOverlapWeek:function(A){var C=false;var B=this.add(A,this.DAY,6);if(B.getMonth()!=A.getMonth()){C=true;}return C;},findMonthStart:function(A){var B=this.getDate(A.getFullYear(),A.getMonth(),1);return B;},findMonthEnd:function(B){var D=this.findMonthStart(B);var C=this.add(D,this.MONTH,1);var A=this.subtract(C,this.DAY,1);return A;},clearTime:function(A){A.setHours(12,0,0,0);return A;},getDate:function(D,A,C){var B=null;if(YAHOO.lang.isUndefined(C)){C=1;}if(D>=100){B=new Date(D,A,C);}else{B=new Date();B.setFullYear(D);B.setMonth(A);B.setDate(C);B.setHours(0,0,0,0);}return B;}};(function(){var C=YAHOO.util.Dom,A=YAHOO.util.Event,E=YAHOO.lang,D=YAHOO.widget.DateMath;function F(I,G,H){this.init.apply(this,arguments);}F.IMG_ROOT=null;F.DATE="D";F.MONTH_DAY="MD";F.WEEKDAY="WD";F.RANGE="R";F.MONTH="M";F.DISPLAY_DAYS=42;F.STOP_RENDER="S";F.SHORT="short";F.LONG="long";F.MEDIUM="medium";F.ONE_CHAR="1char";F.DEFAULT_CONFIG={YEAR_OFFSET:{key:"year_offset",value:0,supercedes:["pagedate","selected","mindate","maxdate"]},TODAY:{key:"today",value:new Date(),supercedes:["pagedate"]},PAGEDATE:{key:"pagedate",value:null},SELECTED:{key:"selected",value:[]},TITLE:{key:"title",value:""},CLOSE:{key:"close",value:false},IFRAME:{key:"iframe",value:(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<=6)?true:false},MINDATE:{key:"mindate",value:null},MAXDATE:{key:"maxdate",value:null},MULTI_SELECT:{key:"multi_select",value:false},START_WEEKDAY:{key:"start_weekday",value:0},SHOW_WEEKDAYS:{key:"show_weekdays",value:true},SHOW_WEEK_HEADER:{key:"show_week_header",value:false},SHOW_WEEK_FOOTER:{key:"show_week_footer",value:false},HIDE_BLANK_WEEKS:{key:"hide_blank_weeks",value:false},NAV_ARROW_LEFT:{key:"nav_arrow_left",value:null},NAV_ARROW_RIGHT:{key:"nav_arrow_right",value:null},MONTHS_SHORT:{key:"months_short",value:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]},MONTHS_LONG:{key:"months_long",value:["January","February","March","April","May","June","July","August","September","October","November","December"]},WEEKDAYS_1CHAR:{key:"weekdays_1char",value:["S","M","T","W","T","F","S"]},WEEKDAYS_SHORT:{key:"weekdays_short",value:["Su","Mo","Tu","We","Th","Fr","Sa"]},WEEKDAYS_MEDIUM:{key:"weekdays_medium",value:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},WEEKDAYS_LONG:{key:"weekdays_long",value:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},LOCALE_MONTHS:{key:"locale_months",value:"long"},LOCALE_WEEKDAYS:{key:"locale_weekdays",value:"short"},DATE_DELIMITER:{key:"date_delimiter",value:","},DATE_FIELD_DELIMITER:{key:"date_field_delimiter",value:"/"},DATE_RANGE_DELIMITER:{key:"date_range_delimiter",value:"-"},MY_MONTH_POSITION:{key:"my_month_position",value:1},MY_YEAR_POSITION:{key:"my_year_position",value:2},MD_MONTH_POSITION:{key:"md_month_position",value:1},MD_DAY_POSITION:{key:"md_day_position",value:2},MDY_MONTH_POSITION:{key:"mdy_month_position",value:1},MDY_DAY_POSITION:{key:"mdy_day_position",value:2},MDY_YEAR_POSITION:{key:"mdy_year_position",value:3},MY_LABEL_MONTH_POSITION:{key:"my_label_month_position",value:1},MY_LABEL_YEAR_POSITION:{key:"my_label_year_position",value:2},MY_LABEL_MONTH_SUFFIX:{key:"my_label_month_suffix",value:" "},MY_LABEL_YEAR_SUFFIX:{key:"my_label_year_suffix",value:""},NAV:{key:"navigator",value:null},STRINGS:{key:"strings",value:{previousMonth:"Previous Month",nextMonth:"Next Month",close:"Close"},supercedes:["close","title"]}};F._DEFAULT_CONFIG=F.DEFAULT_CONFIG;var B=F.DEFAULT_CONFIG;F._EVENT_TYPES={BEFORE_SELECT:"beforeSelect",SELECT:"select",BEFORE_DESELECT:"beforeDeselect",DESELECT:"deselect",CHANGE_PAGE:"changePage",BEFORE_RENDER:"beforeRender",RENDER:"render",BEFORE_DESTROY:"beforeDestroy",DESTROY:"destroy",RESET:"reset",CLEAR:"clear",BEFORE_HIDE:"beforeHide",HIDE:"hide",BEFORE_SHOW:"beforeShow",SHOW:"show",BEFORE_HIDE_NAV:"beforeHideNav",HIDE_NAV:"hideNav",BEFORE_SHOW_NAV:"beforeShowNav",SHOW_NAV:"showNav",BEFORE_RENDER_NAV:"beforeRenderNav",RENDER_NAV:"renderNav"};F.STYLES={CSS_ROW_HEADER:"calrowhead",CSS_ROW_FOOTER:"calrowfoot",CSS_CELL:"calcell",CSS_CELL_SELECTOR:"selector",CSS_CELL_SELECTED:"selected",CSS_CELL_SELECTABLE:"selectable",CSS_CELL_RESTRICTED:"restricted",CSS_CELL_TODAY:"today",CSS_CELL_OOM:"oom",CSS_CELL_OOB:"previous",CSS_HEADER:"calheader",CSS_HEADER_TEXT:"calhead",CSS_BODY:"calbody",CSS_WEEKDAY_CELL:"calweekdaycell",CSS_WEEKDAY_ROW:"calweekdayrow",CSS_FOOTER:"calfoot",CSS_CALENDAR:"yui-calendar",CSS_SINGLE:"single",CSS_CONTAINER:"yui-calcontainer",CSS_NAV_LEFT:"calnavleft",CSS_NAV_RIGHT:"calnavright",CSS_NAV:"calnav",CSS_CLOSE:"calclose",CSS_CELL_TOP:"calcelltop",CSS_CELL_LEFT:"calcellleft",CSS_CELL_RIGHT:"calcellright",CSS_CELL_BOTTOM:"calcellbottom",CSS_CELL_HOVER:"calcellhover",CSS_CELL_HIGHLIGHT1:"highlight1",CSS_CELL_HIGHLIGHT2:"highlight2",CSS_CELL_HIGHLIGHT3:"highlight3",CSS_CELL_HIGHLIGHT4:"highlight4",CSS_WITH_TITLE:"withtitle",CSS_FIXED_SIZE:"fixedsize",CSS_LINK_CLOSE:"link-close"};F._STYLES=F.STYLES;F.prototype={Config:null,parent:null,index:-1,cells:null,cellDates:null,id:null,containerId:null,oDomContainer:null,today:null,renderStack:null,_renderStack:null,oNavigator:null,_selectedDates:null,domEventMap:null,_parseArgs:function(H){var G={id:null,container:null,config:null};if(H&&H.length&&H.length>0){switch(H.length){case 1:G.id=null;G.container=H[0];G.config=null;break;case 2:if(E.isObject(H[1])&&!H[1].tagName&&!(H[1] instanceof String)){G.id=null;G.container=H[0];G.config=H[1];}else{G.id=H[0];G.container=H[1];G.config=null;}break;default:G.id=H[0];G.container=H[1];G.config=H[2];break;}}else{}return G;},init:function(J,H,I){var G=this._parseArgs(arguments);J=G.id;H=G.container;I=G.config;this.oDomContainer=C.get(H);if(!this.oDomContainer.id){this.oDomContainer.id=C.generateId();
}if(!J){J=this.oDomContainer.id+"_t";}this.id=J;this.containerId=this.oDomContainer.id;this.initEvents();this.cfg=new YAHOO.util.Config(this);this.Options={};this.Locale={};this.initStyles();C.addClass(this.oDomContainer,this.Style.CSS_CONTAINER);C.addClass(this.oDomContainer,this.Style.CSS_SINGLE);this.cellDates=[];this.cells=[];this.renderStack=[];this._renderStack=[];this.setupConfig();if(I){this.cfg.applyConfig(I,true);}this.cfg.fireQueue();this.today=this.cfg.getProperty("today");},configIframe:function(I,H,J){var G=H[0];if(!this.parent){if(C.inDocument(this.oDomContainer)){if(G){var K=C.getStyle(this.oDomContainer,"position");if(K=="absolute"||K=="relative"){if(!C.inDocument(this.iframe)){this.iframe=document.createElement("iframe");this.iframe.src="javascript:false;";C.setStyle(this.iframe,"opacity","0");if(YAHOO.env.ua.ie&&YAHOO.env.ua.ie<=6){C.addClass(this.iframe,this.Style.CSS_FIXED_SIZE);}this.oDomContainer.insertBefore(this.iframe,this.oDomContainer.firstChild);}}}else{if(this.iframe){if(this.iframe.parentNode){this.iframe.parentNode.removeChild(this.iframe);}this.iframe=null;}}}}},configTitle:function(H,G,I){var K=G[0];if(K){this.createTitleBar(K);}else{var J=this.cfg.getProperty(B.CLOSE.key);if(!J){this.removeTitleBar();}else{this.createTitleBar("&#160;");}}},configClose:function(H,G,I){var K=G[0],J=this.cfg.getProperty(B.TITLE.key);if(K){if(!J){this.createTitleBar("&#160;");}this.createCloseButton();}else{this.removeCloseButton();if(!J){this.removeTitleBar();}}},initEvents:function(){var G=F._EVENT_TYPES,I=YAHOO.util.CustomEvent,H=this;H.beforeSelectEvent=new I(G.BEFORE_SELECT);H.selectEvent=new I(G.SELECT);H.beforeDeselectEvent=new I(G.BEFORE_DESELECT);H.deselectEvent=new I(G.DESELECT);H.changePageEvent=new I(G.CHANGE_PAGE);H.beforeRenderEvent=new I(G.BEFORE_RENDER);H.renderEvent=new I(G.RENDER);H.beforeDestroyEvent=new I(G.BEFORE_DESTROY);H.destroyEvent=new I(G.DESTROY);H.resetEvent=new I(G.RESET);H.clearEvent=new I(G.CLEAR);H.beforeShowEvent=new I(G.BEFORE_SHOW);H.showEvent=new I(G.SHOW);H.beforeHideEvent=new I(G.BEFORE_HIDE);H.hideEvent=new I(G.HIDE);H.beforeShowNavEvent=new I(G.BEFORE_SHOW_NAV);H.showNavEvent=new I(G.SHOW_NAV);H.beforeHideNavEvent=new I(G.BEFORE_HIDE_NAV);H.hideNavEvent=new I(G.HIDE_NAV);H.beforeRenderNavEvent=new I(G.BEFORE_RENDER_NAV);H.renderNavEvent=new I(G.RENDER_NAV);H.beforeSelectEvent.subscribe(H.onBeforeSelect,this,true);H.selectEvent.subscribe(H.onSelect,this,true);H.beforeDeselectEvent.subscribe(H.onBeforeDeselect,this,true);H.deselectEvent.subscribe(H.onDeselect,this,true);H.changePageEvent.subscribe(H.onChangePage,this,true);H.renderEvent.subscribe(H.onRender,this,true);H.resetEvent.subscribe(H.onReset,this,true);H.clearEvent.subscribe(H.onClear,this,true);},doPreviousMonthNav:function(H,G){A.preventDefault(H);setTimeout(function(){G.previousMonth();var J=C.getElementsByClassName(G.Style.CSS_NAV_LEFT,"a",G.oDomContainer);if(J&&J[0]){try{J[0].focus();}catch(I){}}},0);},doNextMonthNav:function(H,G){A.preventDefault(H);setTimeout(function(){G.nextMonth();var J=C.getElementsByClassName(G.Style.CSS_NAV_RIGHT,"a",G.oDomContainer);if(J&&J[0]){try{J[0].focus();}catch(I){}}},0);},doSelectCell:function(M,G){var R,O,I,L;var N=A.getTarget(M),H=N.tagName.toLowerCase(),K=false;while(H!="td"&&!C.hasClass(N,G.Style.CSS_CELL_SELECTABLE)){if(!K&&H=="a"&&C.hasClass(N,G.Style.CSS_CELL_SELECTOR)){K=true;}N=N.parentNode;H=N.tagName.toLowerCase();if(N==this.oDomContainer||H=="html"){return;}}if(K){A.preventDefault(M);}R=N;if(C.hasClass(R,G.Style.CSS_CELL_SELECTABLE)){L=G.getIndexFromId(R.id);if(L>-1){O=G.cellDates[L];if(O){I=D.getDate(O[0],O[1]-1,O[2]);var Q;if(G.Options.MULTI_SELECT){Q=R.getElementsByTagName("a")[0];if(Q){Q.blur();}var J=G.cellDates[L];var P=G._indexOfSelectedFieldArray(J);if(P>-1){G.deselectCell(L);}else{G.selectCell(L);}}else{Q=R.getElementsByTagName("a")[0];if(Q){Q.blur();}G.selectCell(L);}}}}},doCellMouseOver:function(I,H){var G;if(I){G=A.getTarget(I);}else{G=this;}while(G.tagName&&G.tagName.toLowerCase()!="td"){G=G.parentNode;if(!G.tagName||G.tagName.toLowerCase()=="html"){return;}}if(C.hasClass(G,H.Style.CSS_CELL_SELECTABLE)){C.addClass(G,H.Style.CSS_CELL_HOVER);}},doCellMouseOut:function(I,H){var G;if(I){G=A.getTarget(I);}else{G=this;}while(G.tagName&&G.tagName.toLowerCase()!="td"){G=G.parentNode;if(!G.tagName||G.tagName.toLowerCase()=="html"){return;}}if(C.hasClass(G,H.Style.CSS_CELL_SELECTABLE)){C.removeClass(G,H.Style.CSS_CELL_HOVER);}},setupConfig:function(){var G=this.cfg;G.addProperty(B.TODAY.key,{value:new Date(B.TODAY.value.getTime()),supercedes:B.TODAY.supercedes,handler:this.configToday,suppressEvent:true});G.addProperty(B.PAGEDATE.key,{value:B.PAGEDATE.value||new Date(B.TODAY.value.getTime()),handler:this.configPageDate});G.addProperty(B.SELECTED.key,{value:B.SELECTED.value.concat(),handler:this.configSelected});G.addProperty(B.TITLE.key,{value:B.TITLE.value,handler:this.configTitle});G.addProperty(B.CLOSE.key,{value:B.CLOSE.value,handler:this.configClose});G.addProperty(B.IFRAME.key,{value:B.IFRAME.value,handler:this.configIframe,validator:G.checkBoolean});G.addProperty(B.MINDATE.key,{value:B.MINDATE.value,handler:this.configMinDate});G.addProperty(B.MAXDATE.key,{value:B.MAXDATE.value,handler:this.configMaxDate});G.addProperty(B.MULTI_SELECT.key,{value:B.MULTI_SELECT.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.START_WEEKDAY.key,{value:B.START_WEEKDAY.value,handler:this.configOptions,validator:G.checkNumber});G.addProperty(B.SHOW_WEEKDAYS.key,{value:B.SHOW_WEEKDAYS.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.SHOW_WEEK_HEADER.key,{value:B.SHOW_WEEK_HEADER.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.SHOW_WEEK_FOOTER.key,{value:B.SHOW_WEEK_FOOTER.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.HIDE_BLANK_WEEKS.key,{value:B.HIDE_BLANK_WEEKS.value,handler:this.configOptions,validator:G.checkBoolean});G.addProperty(B.NAV_ARROW_LEFT.key,{value:B.NAV_ARROW_LEFT.value,handler:this.configOptions});
G.addProperty(B.NAV_ARROW_RIGHT.key,{value:B.NAV_ARROW_RIGHT.value,handler:this.configOptions});G.addProperty(B.MONTHS_SHORT.key,{value:B.MONTHS_SHORT.value,handler:this.configLocale});G.addProperty(B.MONTHS_LONG.key,{value:B.MONTHS_LONG.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_1CHAR.key,{value:B.WEEKDAYS_1CHAR.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_SHORT.key,{value:B.WEEKDAYS_SHORT.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_MEDIUM.key,{value:B.WEEKDAYS_MEDIUM.value,handler:this.configLocale});G.addProperty(B.WEEKDAYS_LONG.key,{value:B.WEEKDAYS_LONG.value,handler:this.configLocale});var H=function(){G.refireEvent(B.LOCALE_MONTHS.key);G.refireEvent(B.LOCALE_WEEKDAYS.key);};G.subscribeToConfigEvent(B.START_WEEKDAY.key,H,this,true);G.subscribeToConfigEvent(B.MONTHS_SHORT.key,H,this,true);G.subscribeToConfigEvent(B.MONTHS_LONG.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_1CHAR.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_SHORT.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_MEDIUM.key,H,this,true);G.subscribeToConfigEvent(B.WEEKDAYS_LONG.key,H,this,true);G.addProperty(B.LOCALE_MONTHS.key,{value:B.LOCALE_MONTHS.value,handler:this.configLocaleValues});G.addProperty(B.LOCALE_WEEKDAYS.key,{value:B.LOCALE_WEEKDAYS.value,handler:this.configLocaleValues});G.addProperty(B.YEAR_OFFSET.key,{value:B.YEAR_OFFSET.value,supercedes:B.YEAR_OFFSET.supercedes,handler:this.configLocale});G.addProperty(B.DATE_DELIMITER.key,{value:B.DATE_DELIMITER.value,handler:this.configLocale});G.addProperty(B.DATE_FIELD_DELIMITER.key,{value:B.DATE_FIELD_DELIMITER.value,handler:this.configLocale});G.addProperty(B.DATE_RANGE_DELIMITER.key,{value:B.DATE_RANGE_DELIMITER.value,handler:this.configLocale});G.addProperty(B.MY_MONTH_POSITION.key,{value:B.MY_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_YEAR_POSITION.key,{value:B.MY_YEAR_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MD_MONTH_POSITION.key,{value:B.MD_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MD_DAY_POSITION.key,{value:B.MD_DAY_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MDY_MONTH_POSITION.key,{value:B.MDY_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MDY_DAY_POSITION.key,{value:B.MDY_DAY_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MDY_YEAR_POSITION.key,{value:B.MDY_YEAR_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_LABEL_MONTH_POSITION.key,{value:B.MY_LABEL_MONTH_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_LABEL_YEAR_POSITION.key,{value:B.MY_LABEL_YEAR_POSITION.value,handler:this.configLocale,validator:G.checkNumber});G.addProperty(B.MY_LABEL_MONTH_SUFFIX.key,{value:B.MY_LABEL_MONTH_SUFFIX.value,handler:this.configLocale});G.addProperty(B.MY_LABEL_YEAR_SUFFIX.key,{value:B.MY_LABEL_YEAR_SUFFIX.value,handler:this.configLocale});G.addProperty(B.NAV.key,{value:B.NAV.value,handler:this.configNavigator});G.addProperty(B.STRINGS.key,{value:B.STRINGS.value,handler:this.configStrings,validator:function(I){return E.isObject(I);},supercedes:B.STRINGS.supercedes});},configStrings:function(H,G,I){var J=E.merge(B.STRINGS.value,G[0]);this.cfg.setProperty(B.STRINGS.key,J,true);},configPageDate:function(H,G,I){this.cfg.setProperty(B.PAGEDATE.key,this._parsePageDate(G[0]),true);},configMinDate:function(H,G,I){var J=G[0];if(E.isString(J)){J=this._parseDate(J);this.cfg.setProperty(B.MINDATE.key,D.getDate(J[0],(J[1]-1),J[2]));}},configMaxDate:function(H,G,I){var J=G[0];if(E.isString(J)){J=this._parseDate(J);this.cfg.setProperty(B.MAXDATE.key,D.getDate(J[0],(J[1]-1),J[2]));}},configToday:function(I,H,J){var K=H[0];if(E.isString(K)){K=this._parseDate(K);}var G=D.clearTime(K);if(!this.cfg.initialConfig[B.PAGEDATE.key]){this.cfg.setProperty(B.PAGEDATE.key,G);}this.today=G;this.cfg.setProperty(B.TODAY.key,G,true);},configSelected:function(I,G,K){var H=G[0],J=B.SELECTED.key;if(H){if(E.isString(H)){this.cfg.setProperty(J,this._parseDates(H),true);}}if(!this._selectedDates){this._selectedDates=this.cfg.getProperty(J);}},configOptions:function(H,G,I){this.Options[H.toUpperCase()]=G[0];},configLocale:function(H,G,I){this.Locale[H.toUpperCase()]=G[0];this.cfg.refireEvent(B.LOCALE_MONTHS.key);this.cfg.refireEvent(B.LOCALE_WEEKDAYS.key);},configLocaleValues:function(J,I,K){J=J.toLowerCase();var M=I[0],H=this.cfg,N=this.Locale;switch(J){case B.LOCALE_MONTHS.key:switch(M){case F.SHORT:N.LOCALE_MONTHS=H.getProperty(B.MONTHS_SHORT.key).concat();break;case F.LONG:N.LOCALE_MONTHS=H.getProperty(B.MONTHS_LONG.key).concat();break;}break;case B.LOCALE_WEEKDAYS.key:switch(M){case F.ONE_CHAR:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_1CHAR.key).concat();break;case F.SHORT:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_SHORT.key).concat();break;case F.MEDIUM:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_MEDIUM.key).concat();break;case F.LONG:N.LOCALE_WEEKDAYS=H.getProperty(B.WEEKDAYS_LONG.key).concat();break;}var L=H.getProperty(B.START_WEEKDAY.key);if(L>0){for(var G=0;G<L;++G){N.LOCALE_WEEKDAYS.push(N.LOCALE_WEEKDAYS.shift());}}break;}},configNavigator:function(H,G,I){var J=G[0];if(YAHOO.widget.CalendarNavigator&&(J===true||E.isObject(J))){if(!this.oNavigator){this.oNavigator=new YAHOO.widget.CalendarNavigator(this);this.beforeRenderEvent.subscribe(function(){if(!this.pages){this.oNavigator.erase();}},this,true);}}else{if(this.oNavigator){this.oNavigator.destroy();this.oNavigator=null;}}},initStyles:function(){var G=F.STYLES;this.Style={CSS_ROW_HEADER:G.CSS_ROW_HEADER,CSS_ROW_FOOTER:G.CSS_ROW_FOOTER,CSS_CELL:G.CSS_CELL,CSS_CELL_SELECTOR:G.CSS_CELL_SELECTOR,CSS_CELL_SELECTED:G.CSS_CELL_SELECTED,CSS_CELL_SELECTABLE:G.CSS_CELL_SELECTABLE,CSS_CELL_RESTRICTED:G.CSS_CELL_RESTRICTED,CSS_CELL_TODAY:G.CSS_CELL_TODAY,CSS_CELL_OOM:G.CSS_CELL_OOM,CSS_CELL_OOB:G.CSS_CELL_OOB,CSS_HEADER:G.CSS_HEADER,CSS_HEADER_TEXT:G.CSS_HEADER_TEXT,CSS_BODY:G.CSS_BODY,CSS_WEEKDAY_CELL:G.CSS_WEEKDAY_CELL,CSS_WEEKDAY_ROW:G.CSS_WEEKDAY_ROW,CSS_FOOTER:G.CSS_FOOTER,CSS_CALENDAR:G.CSS_CALENDAR,CSS_SINGLE:G.CSS_SINGLE,CSS_CONTAINER:G.CSS_CONTAINER,CSS_NAV_LEFT:G.CSS_NAV_LEFT,CSS_NAV_RIGHT:G.CSS_NAV_RIGHT,CSS_NAV:G.CSS_NAV,CSS_CLOSE:G.CSS_CLOSE,CSS_CELL_TOP:G.CSS_CELL_TOP,CSS_CELL_LEFT:G.CSS_CELL_LEFT,CSS_CELL_RIGHT:G.CSS_CELL_RIGHT,CSS_CELL_BOTTOM:G.CSS_CELL_BOTTOM,CSS_CELL_HOVER:G.CSS_CELL_HOVER,CSS_CELL_HIGHLIGHT1:G.CSS_CELL_HIGHLIGHT1,CSS_CELL_HIGHLIGHT2:G.CSS_CELL_HIGHLIGHT2,CSS_CELL_HIGHLIGHT3:G.CSS_CELL_HIGHLIGHT3,CSS_CELL_HIGHLIGHT4:G.CSS_CELL_HIGHLIGHT4,CSS_WITH_TITLE:G.CSS_WITH_TITLE,CSS_FIXED_SIZE:G.CSS_FIXED_SIZE,CSS_LINK_CLOSE:G.CSS_LINK_CLOSE};
},buildMonthLabel:function(){return this._buildMonthLabel(this.cfg.getProperty(B.PAGEDATE.key));},_buildMonthLabel:function(G){var I=this.Locale.LOCALE_MONTHS[G.getMonth()]+this.Locale.MY_LABEL_MONTH_SUFFIX,H=(G.getFullYear()+this.Locale.YEAR_OFFSET)+this.Locale.MY_LABEL_YEAR_SUFFIX;if(this.Locale.MY_LABEL_MONTH_POSITION==2||this.Locale.MY_LABEL_YEAR_POSITION==1){return H+I;}else{return I+H;}},buildDayLabel:function(G){return G.getDate();},createTitleBar:function(G){var H=C.getElementsByClassName(YAHOO.widget.CalendarGroup.CSS_2UPTITLE,"div",this.oDomContainer)[0]||document.createElement("div");H.className=YAHOO.widget.CalendarGroup.CSS_2UPTITLE;H.innerHTML=G;this.oDomContainer.insertBefore(H,this.oDomContainer.firstChild);C.addClass(this.oDomContainer,this.Style.CSS_WITH_TITLE);return H;},removeTitleBar:function(){var G=C.getElementsByClassName(YAHOO.widget.CalendarGroup.CSS_2UPTITLE,"div",this.oDomContainer)[0]||null;if(G){A.purgeElement(G);this.oDomContainer.removeChild(G);}C.removeClass(this.oDomContainer,this.Style.CSS_WITH_TITLE);},createCloseButton:function(){var K=YAHOO.widget.CalendarGroup.CSS_2UPCLOSE,J=this.Style.CSS_LINK_CLOSE,M="us/my/bn/x_d.gif",L=C.getElementsByClassName(J,"a",this.oDomContainer)[0],G=this.cfg.getProperty(B.STRINGS.key),H=(G&&G.close)?G.close:"";if(!L){L=document.createElement("a");A.addListener(L,"click",function(O,N){N.hide();A.preventDefault(O);},this);}L.href="#";L.className=J;if(F.IMG_ROOT!==null){var I=C.getElementsByClassName(K,"img",L)[0]||document.createElement("img");I.src=F.IMG_ROOT+M;I.className=K;L.appendChild(I);}else{L.innerHTML='<span class="'+K+" "+this.Style.CSS_CLOSE+'">'+H+"</span>";}this.oDomContainer.appendChild(L);return L;},removeCloseButton:function(){var G=C.getElementsByClassName(this.Style.CSS_LINK_CLOSE,"a",this.oDomContainer)[0]||null;if(G){A.purgeElement(G);this.oDomContainer.removeChild(G);}},renderHeader:function(Q){var P=7,O="us/tr/callt.gif",G="us/tr/calrt.gif",N=this.cfg,K=N.getProperty(B.PAGEDATE.key),L=N.getProperty(B.STRINGS.key),V=(L&&L.previousMonth)?L.previousMonth:"",H=(L&&L.nextMonth)?L.nextMonth:"",M;if(N.getProperty(B.SHOW_WEEK_HEADER.key)){P+=1;}if(N.getProperty(B.SHOW_WEEK_FOOTER.key)){P+=1;}Q[Q.length]="<thead>";Q[Q.length]="<tr>";Q[Q.length]='<th colspan="'+P+'" class="'+this.Style.CSS_HEADER_TEXT+'">';Q[Q.length]='<div class="'+this.Style.CSS_HEADER+'">';var X,U=false;if(this.parent){if(this.index===0){X=true;}if(this.index==(this.parent.cfg.getProperty("pages")-1)){U=true;}}else{X=true;U=true;}if(X){M=this._buildMonthLabel(D.subtract(K,D.MONTH,1));var R=N.getProperty(B.NAV_ARROW_LEFT.key);if(R===null&&F.IMG_ROOT!==null){R=F.IMG_ROOT+O;}var I=(R===null)?"":' style="background-image:url('+R+')"';Q[Q.length]='<a class="'+this.Style.CSS_NAV_LEFT+'"'+I+' href="#">'+V+" ("+M+")"+"</a>";}var W=this.buildMonthLabel();var S=this.parent||this;if(S.cfg.getProperty("navigator")){W='<a class="'+this.Style.CSS_NAV+'" href="#">'+W+"</a>";}Q[Q.length]=W;if(U){M=this._buildMonthLabel(D.add(K,D.MONTH,1));var T=N.getProperty(B.NAV_ARROW_RIGHT.key);if(T===null&&F.IMG_ROOT!==null){T=F.IMG_ROOT+G;}var J=(T===null)?"":' style="background-image:url('+T+')"';Q[Q.length]='<a class="'+this.Style.CSS_NAV_RIGHT+'"'+J+' href="#">'+H+" ("+M+")"+"</a>";}Q[Q.length]="</div>\n</th>\n</tr>";if(N.getProperty(B.SHOW_WEEKDAYS.key)){Q=this.buildWeekdays(Q);}Q[Q.length]="</thead>";return Q;},buildWeekdays:function(H){H[H.length]='<tr class="'+this.Style.CSS_WEEKDAY_ROW+'">';if(this.cfg.getProperty(B.SHOW_WEEK_HEADER.key)){H[H.length]="<th>&#160;</th>";}for(var G=0;G<this.Locale.LOCALE_WEEKDAYS.length;++G){H[H.length]='<th class="'+this.Style.CSS_WEEKDAY_CELL+'">'+this.Locale.LOCALE_WEEKDAYS[G]+"</th>";}if(this.cfg.getProperty(B.SHOW_WEEK_FOOTER.key)){H[H.length]="<th>&#160;</th>";}H[H.length]="</tr>";return H;},renderBody:function(m,k){var AK=this.cfg.getProperty(B.START_WEEKDAY.key);this.preMonthDays=m.getDay();if(AK>0){this.preMonthDays-=AK;}if(this.preMonthDays<0){this.preMonthDays+=7;}this.monthDays=D.findMonthEnd(m).getDate();this.postMonthDays=F.DISPLAY_DAYS-this.preMonthDays-this.monthDays;m=D.subtract(m,D.DAY,this.preMonthDays);var Y,N,M="w",f="_cell",c="wd",w="d",P,u,AC=this.today,O=this.cfg,W=AC.getFullYear(),v=AC.getMonth(),J=AC.getDate(),AB=O.getProperty(B.PAGEDATE.key),I=O.getProperty(B.HIDE_BLANK_WEEKS.key),j=O.getProperty(B.SHOW_WEEK_FOOTER.key),b=O.getProperty(B.SHOW_WEEK_HEADER.key),U=O.getProperty(B.MINDATE.key),a=O.getProperty(B.MAXDATE.key),T=this.Locale.YEAR_OFFSET;if(U){U=D.clearTime(U);}if(a){a=D.clearTime(a);}k[k.length]='<tbody class="m'+(AB.getMonth()+1)+" "+this.Style.CSS_BODY+'">';var AI=0,Q=document.createElement("div"),l=document.createElement("td");Q.appendChild(l);var AA=this.parent||this;for(var AE=0;AE<6;AE++){Y=D.getWeekNumber(m,AK);N=M+Y;if(AE!==0&&I===true&&m.getMonth()!=AB.getMonth()){break;}else{k[k.length]='<tr class="'+N+'">';if(b){k=this.renderRowHeader(Y,k);}for(var AJ=0;AJ<7;AJ++){P=[];this.clearElement(l);l.className=this.Style.CSS_CELL;l.id=this.id+f+AI;if(m.getDate()==J&&m.getMonth()==v&&m.getFullYear()==W){P[P.length]=AA.renderCellStyleToday;}var Z=[m.getFullYear(),m.getMonth()+1,m.getDate()];this.cellDates[this.cellDates.length]=Z;if(m.getMonth()!=AB.getMonth()){P[P.length]=AA.renderCellNotThisMonth;}else{C.addClass(l,c+m.getDay());C.addClass(l,w+m.getDate());for(var AD=0;AD<this.renderStack.length;++AD){u=null;var y=this.renderStack[AD],AL=y[0],H,e,L;switch(AL){case F.DATE:H=y[1][1];e=y[1][2];L=y[1][0];if(m.getMonth()+1==H&&m.getDate()==e&&m.getFullYear()==L){u=y[2];this.renderStack.splice(AD,1);}break;case F.MONTH_DAY:H=y[1][0];e=y[1][1];if(m.getMonth()+1==H&&m.getDate()==e){u=y[2];this.renderStack.splice(AD,1);}break;case F.RANGE:var h=y[1][0],g=y[1][1],n=h[1],S=h[2],X=h[0],AH=D.getDate(X,n-1,S),K=g[1],q=g[2],G=g[0],AG=D.getDate(G,K-1,q);if(m.getTime()>=AH.getTime()&&m.getTime()<=AG.getTime()){u=y[2];if(m.getTime()==AG.getTime()){this.renderStack.splice(AD,1);}}break;case F.WEEKDAY:var R=y[1][0];
if(m.getDay()+1==R){u=y[2];}break;case F.MONTH:H=y[1][0];if(m.getMonth()+1==H){u=y[2];}break;}if(u){P[P.length]=u;}}}if(this._indexOfSelectedFieldArray(Z)>-1){P[P.length]=AA.renderCellStyleSelected;}if((U&&(m.getTime()<U.getTime()))||(a&&(m.getTime()>a.getTime()))){P[P.length]=AA.renderOutOfBoundsDate;}else{P[P.length]=AA.styleCellDefault;P[P.length]=AA.renderCellDefault;}for(var z=0;z<P.length;++z){if(P[z].call(AA,m,l)==F.STOP_RENDER){break;}}m.setTime(m.getTime()+D.ONE_DAY_MS);m=D.clearTime(m);if(AI>=0&&AI<=6){C.addClass(l,this.Style.CSS_CELL_TOP);}if((AI%7)===0){C.addClass(l,this.Style.CSS_CELL_LEFT);}if(((AI+1)%7)===0){C.addClass(l,this.Style.CSS_CELL_RIGHT);}var o=this.postMonthDays;if(I&&o>=7){var V=Math.floor(o/7);for(var AF=0;AF<V;++AF){o-=7;}}if(AI>=((this.preMonthDays+o+this.monthDays)-7)){C.addClass(l,this.Style.CSS_CELL_BOTTOM);}k[k.length]=Q.innerHTML;AI++;}if(j){k=this.renderRowFooter(Y,k);}k[k.length]="</tr>";}}k[k.length]="</tbody>";return k;},renderFooter:function(G){return G;},render:function(){this.beforeRenderEvent.fire();var H=D.findMonthStart(this.cfg.getProperty(B.PAGEDATE.key));this.resetRenderers();this.cellDates.length=0;A.purgeElement(this.oDomContainer,true);var G=[];G[G.length]='<table cellSpacing="0" class="'+this.Style.CSS_CALENDAR+" y"+(H.getFullYear()+this.Locale.YEAR_OFFSET)+'" id="'+this.id+'">';G=this.renderHeader(G);G=this.renderBody(H,G);G=this.renderFooter(G);G[G.length]="</table>";this.oDomContainer.innerHTML=G.join("\n");this.applyListeners();this.cells=C.getElementsByClassName(this.Style.CSS_CELL,"td",this.id);this.cfg.refireEvent(B.TITLE.key);this.cfg.refireEvent(B.CLOSE.key);this.cfg.refireEvent(B.IFRAME.key);this.renderEvent.fire();},applyListeners:function(){var P=this.oDomContainer,H=this.parent||this,L="a",S="click";var M=C.getElementsByClassName(this.Style.CSS_NAV_LEFT,L,P),I=C.getElementsByClassName(this.Style.CSS_NAV_RIGHT,L,P);if(M&&M.length>0){this.linkLeft=M[0];A.addListener(this.linkLeft,S,this.doPreviousMonthNav,H,true);}if(I&&I.length>0){this.linkRight=I[0];A.addListener(this.linkRight,S,this.doNextMonthNav,H,true);}if(H.cfg.getProperty("navigator")!==null){this.applyNavListeners();}if(this.domEventMap){var J,G;for(var R in this.domEventMap){if(E.hasOwnProperty(this.domEventMap,R)){var N=this.domEventMap[R];if(!(N instanceof Array)){N=[N];}for(var K=0;K<N.length;K++){var Q=N[K];G=C.getElementsByClassName(R,Q.tag,this.oDomContainer);for(var O=0;O<G.length;O++){J=G[O];A.addListener(J,Q.event,Q.handler,Q.scope,Q.correct);}}}}}A.addListener(this.oDomContainer,"click",this.doSelectCell,this);A.addListener(this.oDomContainer,"mouseover",this.doCellMouseOver,this);A.addListener(this.oDomContainer,"mouseout",this.doCellMouseOut,this);},applyNavListeners:function(){var H=this.parent||this,I=this,G=C.getElementsByClassName(this.Style.CSS_NAV,"a",this.oDomContainer);if(G.length>0){A.addListener(G,"click",function(N,M){var L=A.getTarget(N);if(this===L||C.isAncestor(this,L)){A.preventDefault(N);}var J=H.oNavigator;if(J){var K=I.cfg.getProperty("pagedate");J.setYear(K.getFullYear()+I.Locale.YEAR_OFFSET);J.setMonth(K.getMonth());J.show();}});}},getDateByCellId:function(H){var G=this.getDateFieldsByCellId(H);return(G)?D.getDate(G[0],G[1]-1,G[2]):null;},getDateFieldsByCellId:function(G){G=this.getIndexFromId(G);return(G>-1)?this.cellDates[G]:null;},getCellIndex:function(I){var H=-1;if(I){var G=I.getMonth(),N=I.getFullYear(),M=I.getDate(),K=this.cellDates;for(var J=0;J<K.length;++J){var L=K[J];if(L[0]===N&&L[1]===G+1&&L[2]===M){H=J;break;}}}return H;},getIndexFromId:function(I){var H=-1,G=I.lastIndexOf("_cell");if(G>-1){H=parseInt(I.substring(G+5),10);}return H;},renderOutOfBoundsDate:function(H,G){C.addClass(G,this.Style.CSS_CELL_OOB);G.innerHTML=H.getDate();return F.STOP_RENDER;},renderRowHeader:function(H,G){G[G.length]='<th class="'+this.Style.CSS_ROW_HEADER+'">'+H+"</th>";return G;},renderRowFooter:function(H,G){G[G.length]='<th class="'+this.Style.CSS_ROW_FOOTER+'">'+H+"</th>";return G;},renderCellDefault:function(H,G){G.innerHTML='<a href="#" class="'+this.Style.CSS_CELL_SELECTOR+'">'+this.buildDayLabel(H)+"</a>";},styleCellDefault:function(H,G){C.addClass(G,this.Style.CSS_CELL_SELECTABLE);},renderCellStyleHighlight1:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT1);},renderCellStyleHighlight2:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT2);},renderCellStyleHighlight3:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT3);},renderCellStyleHighlight4:function(H,G){C.addClass(G,this.Style.CSS_CELL_HIGHLIGHT4);},renderCellStyleToday:function(H,G){C.addClass(G,this.Style.CSS_CELL_TODAY);},renderCellStyleSelected:function(H,G){C.addClass(G,this.Style.CSS_CELL_SELECTED);},renderCellNotThisMonth:function(H,G){C.addClass(G,this.Style.CSS_CELL_OOM);G.innerHTML=H.getDate();return F.STOP_RENDER;},renderBodyCellRestricted:function(H,G){C.addClass(G,this.Style.CSS_CELL);C.addClass(G,this.Style.CSS_CELL_RESTRICTED);G.innerHTML=H.getDate();return F.STOP_RENDER;},addMonths:function(I){var H=B.PAGEDATE.key,J=this.cfg.getProperty(H),G=D.add(J,D.MONTH,I);this.cfg.setProperty(H,G);this.resetRenderers();this.changePageEvent.fire(J,G);},subtractMonths:function(G){this.addMonths(-1*G);},addYears:function(I){var H=B.PAGEDATE.key,J=this.cfg.getProperty(H),G=D.add(J,D.YEAR,I);this.cfg.setProperty(H,G);this.resetRenderers();this.changePageEvent.fire(J,G);},subtractYears:function(G){this.addYears(-1*G);},nextMonth:function(){this.addMonths(1);},previousMonth:function(){this.addMonths(-1);},nextYear:function(){this.addYears(1);},previousYear:function(){this.addYears(-1);},reset:function(){this.cfg.resetProperty(B.SELECTED.key);this.cfg.resetProperty(B.PAGEDATE.key);this.resetEvent.fire();},clear:function(){this.cfg.setProperty(B.SELECTED.key,[]);this.cfg.setProperty(B.PAGEDATE.key,new Date(this.today.getTime()));this.clearEvent.fire();},select:function(I){var L=this._toFieldArray(I),H=[],K=[],M=B.SELECTED.key;for(var G=0;G<L.length;++G){var J=L[G];
if(!this.isDateOOB(this._toDate(J))){if(H.length===0){this.beforeSelectEvent.fire();K=this.cfg.getProperty(M);}H.push(J);if(this._indexOfSelectedFieldArray(J)==-1){K[K.length]=J;}}}if(H.length>0){if(this.parent){this.parent.cfg.setProperty(M,K);}else{this.cfg.setProperty(M,K);}this.selectEvent.fire(H);}return this.getSelectedDates();},selectCell:function(J){var H=this.cells[J],N=this.cellDates[J],M=this._toDate(N),I=C.hasClass(H,this.Style.CSS_CELL_SELECTABLE);if(I){this.beforeSelectEvent.fire();var L=B.SELECTED.key;var K=this.cfg.getProperty(L);var G=N.concat();if(this._indexOfSelectedFieldArray(G)==-1){K[K.length]=G;}if(this.parent){this.parent.cfg.setProperty(L,K);}else{this.cfg.setProperty(L,K);}this.renderCellStyleSelected(M,H);this.selectEvent.fire([G]);this.doCellMouseOut.call(H,null,this);}return this.getSelectedDates();},deselect:function(K){var G=this._toFieldArray(K),J=[],M=[],N=B.SELECTED.key;for(var H=0;H<G.length;++H){var L=G[H];if(!this.isDateOOB(this._toDate(L))){if(J.length===0){this.beforeDeselectEvent.fire();M=this.cfg.getProperty(N);}J.push(L);var I=this._indexOfSelectedFieldArray(L);if(I!=-1){M.splice(I,1);}}}if(J.length>0){if(this.parent){this.parent.cfg.setProperty(N,M);}else{this.cfg.setProperty(N,M);}this.deselectEvent.fire(J);}return this.getSelectedDates();},deselectCell:function(K){var H=this.cells[K],N=this.cellDates[K],I=this._indexOfSelectedFieldArray(N);var J=C.hasClass(H,this.Style.CSS_CELL_SELECTABLE);if(J){this.beforeDeselectEvent.fire();var L=this.cfg.getProperty(B.SELECTED.key),M=this._toDate(N),G=N.concat();if(I>-1){if(this.cfg.getProperty(B.PAGEDATE.key).getMonth()==M.getMonth()&&this.cfg.getProperty(B.PAGEDATE.key).getFullYear()==M.getFullYear()){C.removeClass(H,this.Style.CSS_CELL_SELECTED);}L.splice(I,1);}if(this.parent){this.parent.cfg.setProperty(B.SELECTED.key,L);}else{this.cfg.setProperty(B.SELECTED.key,L);}this.deselectEvent.fire([G]);}return this.getSelectedDates();},deselectAll:function(){this.beforeDeselectEvent.fire();var J=B.SELECTED.key,G=this.cfg.getProperty(J),H=G.length,I=G.concat();if(this.parent){this.parent.cfg.setProperty(J,[]);}else{this.cfg.setProperty(J,[]);}if(H>0){this.deselectEvent.fire(I);}return this.getSelectedDates();},_toFieldArray:function(H){var G=[];if(H instanceof Date){G=[[H.getFullYear(),H.getMonth()+1,H.getDate()]];}else{if(E.isString(H)){G=this._parseDates(H);}else{if(E.isArray(H)){for(var I=0;I<H.length;++I){var J=H[I];G[G.length]=[J.getFullYear(),J.getMonth()+1,J.getDate()];}}}}return G;},toDate:function(G){return this._toDate(G);},_toDate:function(G){if(G instanceof Date){return G;}else{return D.getDate(G[0],G[1]-1,G[2]);}},_fieldArraysAreEqual:function(I,H){var G=false;if(I[0]==H[0]&&I[1]==H[1]&&I[2]==H[2]){G=true;}return G;},_indexOfSelectedFieldArray:function(K){var J=-1,G=this.cfg.getProperty(B.SELECTED.key);for(var I=0;I<G.length;++I){var H=G[I];if(K[0]==H[0]&&K[1]==H[1]&&K[2]==H[2]){J=I;break;}}return J;},isDateOOM:function(G){return(G.getMonth()!=this.cfg.getProperty(B.PAGEDATE.key).getMonth());},isDateOOB:function(I){var J=this.cfg.getProperty(B.MINDATE.key),K=this.cfg.getProperty(B.MAXDATE.key),H=D;if(J){J=H.clearTime(J);}if(K){K=H.clearTime(K);}var G=new Date(I.getTime());G=H.clearTime(G);return((J&&G.getTime()<J.getTime())||(K&&G.getTime()>K.getTime()));},_parsePageDate:function(G){var J;if(G){if(G instanceof Date){J=D.findMonthStart(G);}else{var K,I,H;H=G.split(this.cfg.getProperty(B.DATE_FIELD_DELIMITER.key));K=parseInt(H[this.cfg.getProperty(B.MY_MONTH_POSITION.key)-1],10)-1;I=parseInt(H[this.cfg.getProperty(B.MY_YEAR_POSITION.key)-1],10)-this.Locale.YEAR_OFFSET;J=D.getDate(I,K,1);}}else{J=D.getDate(this.today.getFullYear(),this.today.getMonth(),1);}return J;},onBeforeSelect:function(){if(this.cfg.getProperty(B.MULTI_SELECT.key)===false){if(this.parent){this.parent.callChildFunction("clearAllBodyCellStyles",this.Style.CSS_CELL_SELECTED);this.parent.deselectAll();}else{this.clearAllBodyCellStyles(this.Style.CSS_CELL_SELECTED);this.deselectAll();}}},onSelect:function(G){},onBeforeDeselect:function(){},onDeselect:function(G){},onChangePage:function(){this.render();},onRender:function(){},onReset:function(){this.render();},onClear:function(){this.render();},validate:function(){return true;},_parseDate:function(I){var J=I.split(this.Locale.DATE_FIELD_DELIMITER),G;if(J.length==2){G=[J[this.Locale.MD_MONTH_POSITION-1],J[this.Locale.MD_DAY_POSITION-1]];G.type=F.MONTH_DAY;}else{G=[J[this.Locale.MDY_YEAR_POSITION-1]-this.Locale.YEAR_OFFSET,J[this.Locale.MDY_MONTH_POSITION-1],J[this.Locale.MDY_DAY_POSITION-1]];G.type=F.DATE;}for(var H=0;H<G.length;H++){G[H]=parseInt(G[H],10);}return G;},_parseDates:function(H){var O=[],N=H.split(this.Locale.DATE_DELIMITER);for(var M=0;M<N.length;++M){var L=N[M];if(L.indexOf(this.Locale.DATE_RANGE_DELIMITER)!=-1){var G=L.split(this.Locale.DATE_RANGE_DELIMITER),K=this._parseDate(G[0]),P=this._parseDate(G[1]),J=this._parseRange(K,P);O=O.concat(J);}else{var I=this._parseDate(L);O.push(I);}}return O;},_parseRange:function(G,K){var H=D.add(D.getDate(G[0],G[1]-1,G[2]),D.DAY,1),J=D.getDate(K[0],K[1]-1,K[2]),I=[];I.push(G);while(H.getTime()<=J.getTime()){I.push([H.getFullYear(),H.getMonth()+1,H.getDate()]);H=D.add(H,D.DAY,1);}return I;},resetRenderers:function(){this.renderStack=this._renderStack.concat();},removeRenderers:function(){this._renderStack=[];this.renderStack=[];},clearElement:function(G){G.innerHTML="&#160;";G.className="";},addRenderer:function(G,H){var J=this._parseDates(G);for(var I=0;I<J.length;++I){var K=J[I];if(K.length==2){if(K[0] instanceof Array){this._addRenderer(F.RANGE,K,H);}else{this._addRenderer(F.MONTH_DAY,K,H);}}else{if(K.length==3){this._addRenderer(F.DATE,K,H);}}}},_addRenderer:function(H,I,G){var J=[H,I,G];this.renderStack.unshift(J);this._renderStack=this.renderStack.concat();},addMonthRenderer:function(H,G){this._addRenderer(F.MONTH,[H],G);},addWeekdayRenderer:function(H,G){this._addRenderer(F.WEEKDAY,[H],G);},clearAllBodyCellStyles:function(G){for(var H=0;
H<this.cells.length;++H){C.removeClass(this.cells[H],G);}},setMonth:function(I){var G=B.PAGEDATE.key,H=this.cfg.getProperty(G);H.setMonth(parseInt(I,10));this.cfg.setProperty(G,H);},setYear:function(H){var G=B.PAGEDATE.key,I=this.cfg.getProperty(G);I.setFullYear(parseInt(H,10)-this.Locale.YEAR_OFFSET);this.cfg.setProperty(G,I);},getSelectedDates:function(){var I=[],H=this.cfg.getProperty(B.SELECTED.key);for(var K=0;K<H.length;++K){var J=H[K];var G=D.getDate(J[0],J[1]-1,J[2]);I.push(G);}I.sort(function(M,L){return M-L;});return I;},hide:function(){if(this.beforeHideEvent.fire()){this.oDomContainer.style.display="none";this.hideEvent.fire();}},show:function(){if(this.beforeShowEvent.fire()){this.oDomContainer.style.display="block";this.showEvent.fire();}},browser:(function(){var G=navigator.userAgent.toLowerCase();if(G.indexOf("opera")!=-1){return"opera";}else{if(G.indexOf("msie 7")!=-1){return"ie7";}else{if(G.indexOf("msie")!=-1){return"ie";}else{if(G.indexOf("safari")!=-1){return"safari";}else{if(G.indexOf("gecko")!=-1){return"gecko";}else{return false;}}}}}})(),toString:function(){return"Calendar "+this.id;},destroy:function(){if(this.beforeDestroyEvent.fire()){var G=this;if(G.navigator){G.navigator.destroy();}if(G.cfg){G.cfg.destroy();}A.purgeElement(G.oDomContainer,true);C.removeClass(G.oDomContainer,G.Style.CSS_WITH_TITLE);C.removeClass(G.oDomContainer,G.Style.CSS_CONTAINER);C.removeClass(G.oDomContainer,G.Style.CSS_SINGLE);G.oDomContainer.innerHTML="";G.oDomContainer=null;G.cells=null;this.destroyEvent.fire();}}};YAHOO.widget.Calendar=F;YAHOO.widget.Calendar_Core=YAHOO.widget.Calendar;YAHOO.widget.Cal_Core=YAHOO.widget.Calendar;})();(function(){var D=YAHOO.util.Dom,F=YAHOO.widget.DateMath,A=YAHOO.util.Event,E=YAHOO.lang,G=YAHOO.widget.Calendar;function B(J,H,I){if(arguments.length>0){this.init.apply(this,arguments);}}B.DEFAULT_CONFIG=B._DEFAULT_CONFIG=G.DEFAULT_CONFIG;B.DEFAULT_CONFIG.PAGES={key:"pages",value:2};var C=B.DEFAULT_CONFIG;B.prototype={init:function(K,I,J){var H=this._parseArgs(arguments);K=H.id;I=H.container;J=H.config;this.oDomContainer=D.get(I);if(!this.oDomContainer.id){this.oDomContainer.id=D.generateId();}if(!K){K=this.oDomContainer.id+"_t";}this.id=K;this.containerId=this.oDomContainer.id;this.initEvents();this.initStyles();this.pages=[];D.addClass(this.oDomContainer,B.CSS_CONTAINER);D.addClass(this.oDomContainer,B.CSS_MULTI_UP);this.cfg=new YAHOO.util.Config(this);this.Options={};this.Locale={};this.setupConfig();if(J){this.cfg.applyConfig(J,true);}this.cfg.fireQueue();if(YAHOO.env.ua.opera){this.renderEvent.subscribe(this._fixWidth,this,true);this.showEvent.subscribe(this._fixWidth,this,true);}},setupConfig:function(){var H=this.cfg;H.addProperty(C.PAGES.key,{value:C.PAGES.value,validator:H.checkNumber,handler:this.configPages});H.addProperty(C.YEAR_OFFSET.key,{value:C.YEAR_OFFSET.value,handler:this.delegateConfig,supercedes:C.YEAR_OFFSET.supercedes,suppressEvent:true});H.addProperty(C.TODAY.key,{value:new Date(C.TODAY.value.getTime()),supercedes:C.TODAY.supercedes,handler:this.configToday,suppressEvent:false});H.addProperty(C.PAGEDATE.key,{value:C.PAGEDATE.value||new Date(C.TODAY.value.getTime()),handler:this.configPageDate});H.addProperty(C.SELECTED.key,{value:[],handler:this.configSelected});H.addProperty(C.TITLE.key,{value:C.TITLE.value,handler:this.configTitle});H.addProperty(C.CLOSE.key,{value:C.CLOSE.value,handler:this.configClose});H.addProperty(C.IFRAME.key,{value:C.IFRAME.value,handler:this.configIframe,validator:H.checkBoolean});H.addProperty(C.MINDATE.key,{value:C.MINDATE.value,handler:this.delegateConfig});H.addProperty(C.MAXDATE.key,{value:C.MAXDATE.value,handler:this.delegateConfig});H.addProperty(C.MULTI_SELECT.key,{value:C.MULTI_SELECT.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.START_WEEKDAY.key,{value:C.START_WEEKDAY.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.SHOW_WEEKDAYS.key,{value:C.SHOW_WEEKDAYS.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.SHOW_WEEK_HEADER.key,{value:C.SHOW_WEEK_HEADER.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.SHOW_WEEK_FOOTER.key,{value:C.SHOW_WEEK_FOOTER.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.HIDE_BLANK_WEEKS.key,{value:C.HIDE_BLANK_WEEKS.value,handler:this.delegateConfig,validator:H.checkBoolean});H.addProperty(C.NAV_ARROW_LEFT.key,{value:C.NAV_ARROW_LEFT.value,handler:this.delegateConfig});H.addProperty(C.NAV_ARROW_RIGHT.key,{value:C.NAV_ARROW_RIGHT.value,handler:this.delegateConfig});H.addProperty(C.MONTHS_SHORT.key,{value:C.MONTHS_SHORT.value,handler:this.delegateConfig});H.addProperty(C.MONTHS_LONG.key,{value:C.MONTHS_LONG.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_1CHAR.key,{value:C.WEEKDAYS_1CHAR.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_SHORT.key,{value:C.WEEKDAYS_SHORT.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_MEDIUM.key,{value:C.WEEKDAYS_MEDIUM.value,handler:this.delegateConfig});H.addProperty(C.WEEKDAYS_LONG.key,{value:C.WEEKDAYS_LONG.value,handler:this.delegateConfig});H.addProperty(C.LOCALE_MONTHS.key,{value:C.LOCALE_MONTHS.value,handler:this.delegateConfig});H.addProperty(C.LOCALE_WEEKDAYS.key,{value:C.LOCALE_WEEKDAYS.value,handler:this.delegateConfig});H.addProperty(C.DATE_DELIMITER.key,{value:C.DATE_DELIMITER.value,handler:this.delegateConfig});H.addProperty(C.DATE_FIELD_DELIMITER.key,{value:C.DATE_FIELD_DELIMITER.value,handler:this.delegateConfig});H.addProperty(C.DATE_RANGE_DELIMITER.key,{value:C.DATE_RANGE_DELIMITER.value,handler:this.delegateConfig});H.addProperty(C.MY_MONTH_POSITION.key,{value:C.MY_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_YEAR_POSITION.key,{value:C.MY_YEAR_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MD_MONTH_POSITION.key,{value:C.MD_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});
H.addProperty(C.MD_DAY_POSITION.key,{value:C.MD_DAY_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MDY_MONTH_POSITION.key,{value:C.MDY_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MDY_DAY_POSITION.key,{value:C.MDY_DAY_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MDY_YEAR_POSITION.key,{value:C.MDY_YEAR_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_LABEL_MONTH_POSITION.key,{value:C.MY_LABEL_MONTH_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_LABEL_YEAR_POSITION.key,{value:C.MY_LABEL_YEAR_POSITION.value,handler:this.delegateConfig,validator:H.checkNumber});H.addProperty(C.MY_LABEL_MONTH_SUFFIX.key,{value:C.MY_LABEL_MONTH_SUFFIX.value,handler:this.delegateConfig});H.addProperty(C.MY_LABEL_YEAR_SUFFIX.key,{value:C.MY_LABEL_YEAR_SUFFIX.value,handler:this.delegateConfig});H.addProperty(C.NAV.key,{value:C.NAV.value,handler:this.configNavigator});H.addProperty(C.STRINGS.key,{value:C.STRINGS.value,handler:this.configStrings,validator:function(I){return E.isObject(I);},supercedes:C.STRINGS.supercedes});},initEvents:function(){var J=this,L="Event",M=YAHOO.util.CustomEvent;var I=function(O,R,N){for(var Q=0;Q<J.pages.length;++Q){var P=J.pages[Q];P[this.type+L].subscribe(O,R,N);}};var H=function(N,Q){for(var P=0;P<J.pages.length;++P){var O=J.pages[P];O[this.type+L].unsubscribe(N,Q);}};var K=G._EVENT_TYPES;J.beforeSelectEvent=new M(K.BEFORE_SELECT);J.beforeSelectEvent.subscribe=I;J.beforeSelectEvent.unsubscribe=H;J.selectEvent=new M(K.SELECT);J.selectEvent.subscribe=I;J.selectEvent.unsubscribe=H;J.beforeDeselectEvent=new M(K.BEFORE_DESELECT);J.beforeDeselectEvent.subscribe=I;J.beforeDeselectEvent.unsubscribe=H;J.deselectEvent=new M(K.DESELECT);J.deselectEvent.subscribe=I;J.deselectEvent.unsubscribe=H;J.changePageEvent=new M(K.CHANGE_PAGE);J.changePageEvent.subscribe=I;J.changePageEvent.unsubscribe=H;J.beforeRenderEvent=new M(K.BEFORE_RENDER);J.beforeRenderEvent.subscribe=I;J.beforeRenderEvent.unsubscribe=H;J.renderEvent=new M(K.RENDER);J.renderEvent.subscribe=I;J.renderEvent.unsubscribe=H;J.resetEvent=new M(K.RESET);J.resetEvent.subscribe=I;J.resetEvent.unsubscribe=H;J.clearEvent=new M(K.CLEAR);J.clearEvent.subscribe=I;J.clearEvent.unsubscribe=H;J.beforeShowEvent=new M(K.BEFORE_SHOW);J.showEvent=new M(K.SHOW);J.beforeHideEvent=new M(K.BEFORE_HIDE);J.hideEvent=new M(K.HIDE);J.beforeShowNavEvent=new M(K.BEFORE_SHOW_NAV);J.showNavEvent=new M(K.SHOW_NAV);J.beforeHideNavEvent=new M(K.BEFORE_HIDE_NAV);J.hideNavEvent=new M(K.HIDE_NAV);J.beforeRenderNavEvent=new M(K.BEFORE_RENDER_NAV);J.renderNavEvent=new M(K.RENDER_NAV);J.beforeDestroyEvent=new M(K.BEFORE_DESTROY);J.destroyEvent=new M(K.DESTROY);},configPages:function(T,R,N){var L=R[0],J=C.PAGEDATE.key,W="_",M,O=null,S="groupcal",V="first-of-type",K="last-of-type";for(var I=0;I<L;++I){var U=this.id+W+I,Q=this.containerId+W+I,P=this.cfg.getConfig();P.close=false;P.title=false;P.navigator=null;if(I>0){M=new Date(O);this._setMonthOnDate(M,M.getMonth()+I);P.pageDate=M;}var H=this.constructChild(U,Q,P);D.removeClass(H.oDomContainer,this.Style.CSS_SINGLE);D.addClass(H.oDomContainer,S);if(I===0){O=H.cfg.getProperty(J);D.addClass(H.oDomContainer,V);}if(I==(L-1)){D.addClass(H.oDomContainer,K);}H.parent=this;H.index=I;this.pages[this.pages.length]=H;}},configPageDate:function(O,N,L){var J=N[0],M;var K=C.PAGEDATE.key;for(var I=0;I<this.pages.length;++I){var H=this.pages[I];if(I===0){M=H._parsePageDate(J);H.cfg.setProperty(K,M);}else{var P=new Date(M);this._setMonthOnDate(P,P.getMonth()+I);H.cfg.setProperty(K,P);}}},configSelected:function(J,H,L){var K=C.SELECTED.key;this.delegateConfig(J,H,L);var I=(this.pages.length>0)?this.pages[0].cfg.getProperty(K):[];this.cfg.setProperty(K,I,true);},delegateConfig:function(I,H,L){var M=H[0];var K;for(var J=0;J<this.pages.length;J++){K=this.pages[J];K.cfg.setProperty(I,M);}},setChildFunction:function(K,I){var H=this.cfg.getProperty(C.PAGES.key);for(var J=0;J<H;++J){this.pages[J][K]=I;}},callChildFunction:function(M,I){var H=this.cfg.getProperty(C.PAGES.key);for(var L=0;L<H;++L){var K=this.pages[L];if(K[M]){var J=K[M];J.call(K,I);}}},constructChild:function(K,I,J){var H=document.getElementById(I);if(!H){H=document.createElement("div");H.id=I;this.oDomContainer.appendChild(H);}return new G(K,I,J);},setMonth:function(L){L=parseInt(L,10);var M;var I=C.PAGEDATE.key;for(var K=0;K<this.pages.length;++K){var J=this.pages[K];var H=J.cfg.getProperty(I);if(K===0){M=H.getFullYear();}else{H.setFullYear(M);}this._setMonthOnDate(H,L+K);J.cfg.setProperty(I,H);}},setYear:function(J){var I=C.PAGEDATE.key;J=parseInt(J,10);for(var L=0;L<this.pages.length;++L){var K=this.pages[L];var H=K.cfg.getProperty(I);if((H.getMonth()+1)==1&&L>0){J+=1;}K.setYear(J);}},render:function(){this.renderHeader();for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.render();}this.renderFooter();},select:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.select(H);}return this.getSelectedDates();},selectCell:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.selectCell(H);}return this.getSelectedDates();},deselect:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.deselect(H);}return this.getSelectedDates();},deselectAll:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.deselectAll();}return this.getSelectedDates();},deselectCell:function(H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.deselectCell(H);}return this.getSelectedDates();},reset:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.reset();}},clear:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.clear();}this.cfg.setProperty(C.SELECTED.key,[]);this.cfg.setProperty(C.PAGEDATE.key,new Date(this.pages[0].today.getTime()));this.render();},nextMonth:function(){for(var I=0;I<this.pages.length;
++I){var H=this.pages[I];H.nextMonth();}},previousMonth:function(){for(var I=this.pages.length-1;I>=0;--I){var H=this.pages[I];H.previousMonth();}},nextYear:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.nextYear();}},previousYear:function(){for(var I=0;I<this.pages.length;++I){var H=this.pages[I];H.previousYear();}},getSelectedDates:function(){var J=[];var I=this.cfg.getProperty(C.SELECTED.key);for(var L=0;L<I.length;++L){var K=I[L];var H=F.getDate(K[0],K[1]-1,K[2]);J.push(H);}J.sort(function(N,M){return N-M;});return J;},addRenderer:function(H,I){for(var K=0;K<this.pages.length;++K){var J=this.pages[K];J.addRenderer(H,I);}},addMonthRenderer:function(K,H){for(var J=0;J<this.pages.length;++J){var I=this.pages[J];I.addMonthRenderer(K,H);}},addWeekdayRenderer:function(I,H){for(var K=0;K<this.pages.length;++K){var J=this.pages[K];J.addWeekdayRenderer(I,H);}},removeRenderers:function(){this.callChildFunction("removeRenderers");},renderHeader:function(){},renderFooter:function(){},addMonths:function(H){this.callChildFunction("addMonths",H);},subtractMonths:function(H){this.callChildFunction("subtractMonths",H);},addYears:function(H){this.callChildFunction("addYears",H);},subtractYears:function(H){this.callChildFunction("subtractYears",H);},getCalendarPage:function(K){var M=null;if(K){var N=K.getFullYear(),J=K.getMonth();var I=this.pages;for(var L=0;L<I.length;++L){var H=I[L].cfg.getProperty("pagedate");if(H.getFullYear()===N&&H.getMonth()===J){M=I[L];break;}}}return M;},_setMonthOnDate:function(I,J){if(YAHOO.env.ua.webkit&&YAHOO.env.ua.webkit<420&&(J<0||J>11)){var H=F.add(I,F.MONTH,J-I.getMonth());I.setTime(H.getTime());}else{I.setMonth(J);}},_fixWidth:function(){var H=0;for(var J=0;J<this.pages.length;++J){var I=this.pages[J];H+=I.oDomContainer.offsetWidth;}if(H>0){this.oDomContainer.style.width=H+"px";}},toString:function(){return"CalendarGroup "+this.id;},destroy:function(){if(this.beforeDestroyEvent.fire()){var J=this;if(J.navigator){J.navigator.destroy();}if(J.cfg){J.cfg.destroy();}A.purgeElement(J.oDomContainer,true);D.removeClass(J.oDomContainer,B.CSS_CONTAINER);D.removeClass(J.oDomContainer,B.CSS_MULTI_UP);for(var I=0,H=J.pages.length;I<H;I++){J.pages[I].destroy();J.pages[I]=null;}J.oDomContainer.innerHTML="";J.oDomContainer=null;this.destroyEvent.fire();}}};B.CSS_CONTAINER="yui-calcontainer";B.CSS_MULTI_UP="multi";B.CSS_2UPTITLE="title";B.CSS_2UPCLOSE="close-icon";YAHOO.lang.augmentProto(B,G,"buildDayLabel","buildMonthLabel","renderOutOfBoundsDate","renderRowHeader","renderRowFooter","renderCellDefault","styleCellDefault","renderCellStyleHighlight1","renderCellStyleHighlight2","renderCellStyleHighlight3","renderCellStyleHighlight4","renderCellStyleToday","renderCellStyleSelected","renderCellNotThisMonth","renderBodyCellRestricted","initStyles","configTitle","configClose","configIframe","configStrings","configToday","configNavigator","createTitleBar","createCloseButton","removeTitleBar","removeCloseButton","hide","show","toDate","_toDate","_parseArgs","browser");YAHOO.widget.CalGrp=B;YAHOO.widget.CalendarGroup=B;YAHOO.widget.Calendar2up=function(J,H,I){this.init(J,H,I);};YAHOO.extend(YAHOO.widget.Calendar2up,B);YAHOO.widget.Cal2up=YAHOO.widget.Calendar2up;})();YAHOO.widget.CalendarNavigator=function(A){this.init(A);};(function(){var A=YAHOO.widget.CalendarNavigator;A.CLASSES={NAV:"yui-cal-nav",NAV_VISIBLE:"yui-cal-nav-visible",MASK:"yui-cal-nav-mask",YEAR:"yui-cal-nav-y",MONTH:"yui-cal-nav-m",BUTTONS:"yui-cal-nav-b",BUTTON:"yui-cal-nav-btn",ERROR:"yui-cal-nav-e",YEAR_CTRL:"yui-cal-nav-yc",MONTH_CTRL:"yui-cal-nav-mc",INVALID:"yui-invalid",DEFAULT:"yui-default"};A.DEFAULT_CONFIG={strings:{month:"Month",year:"Year",submit:"Okay",cancel:"Cancel",invalidYear:"Year needs to be a number"},monthFormat:YAHOO.widget.Calendar.LONG,initialFocus:"year"};A._DEFAULT_CFG=A.DEFAULT_CONFIG;A.ID_SUFFIX="_nav";A.MONTH_SUFFIX="_month";A.YEAR_SUFFIX="_year";A.ERROR_SUFFIX="_error";A.CANCEL_SUFFIX="_cancel";A.SUBMIT_SUFFIX="_submit";A.YR_MAX_DIGITS=4;A.YR_MINOR_INC=1;A.YR_MAJOR_INC=10;A.UPDATE_DELAY=50;A.YR_PATTERN=/^\d+$/;A.TRIM=/^\s*(.*?)\s*$/;})();YAHOO.widget.CalendarNavigator.prototype={id:null,cal:null,navEl:null,maskEl:null,yearEl:null,monthEl:null,errorEl:null,submitEl:null,cancelEl:null,firstCtrl:null,lastCtrl:null,_doc:null,_year:null,_month:0,__rendered:false,init:function(A){var C=A.oDomContainer;this.cal=A;this.id=C.id+YAHOO.widget.CalendarNavigator.ID_SUFFIX;this._doc=C.ownerDocument;var B=YAHOO.env.ua.ie;this.__isIEQuirks=(B&&((B<=6)||(this._doc.compatMode=="BackCompat")));},show:function(){var A=YAHOO.widget.CalendarNavigator.CLASSES;if(this.cal.beforeShowNavEvent.fire()){if(!this.__rendered){this.render();}this.clearErrors();this._updateMonthUI();this._updateYearUI();this._show(this.navEl,true);this.setInitialFocus();this.showMask();YAHOO.util.Dom.addClass(this.cal.oDomContainer,A.NAV_VISIBLE);this.cal.showNavEvent.fire();}},hide:function(){var A=YAHOO.widget.CalendarNavigator.CLASSES;if(this.cal.beforeHideNavEvent.fire()){this._show(this.navEl,false);this.hideMask();YAHOO.util.Dom.removeClass(this.cal.oDomContainer,A.NAV_VISIBLE);this.cal.hideNavEvent.fire();}},showMask:function(){this._show(this.maskEl,true);if(this.__isIEQuirks){this._syncMask();}},hideMask:function(){this._show(this.maskEl,false);},getMonth:function(){return this._month;},getYear:function(){return this._year;},setMonth:function(A){if(A>=0&&A<12){this._month=A;}this._updateMonthUI();},setYear:function(B){var A=YAHOO.widget.CalendarNavigator.YR_PATTERN;if(YAHOO.lang.isNumber(B)&&A.test(B+"")){this._year=B;}this._updateYearUI();},render:function(){this.cal.beforeRenderNavEvent.fire();if(!this.__rendered){this.createNav();this.createMask();this.applyListeners();this.__rendered=true;}this.cal.renderNavEvent.fire();},createNav:function(){var B=YAHOO.widget.CalendarNavigator;var C=this._doc;var D=C.createElement("div");D.className=B.CLASSES.NAV;var A=this.renderNavContents([]);D.innerHTML=A.join("");this.cal.oDomContainer.appendChild(D);
this.navEl=D;this.yearEl=C.getElementById(this.id+B.YEAR_SUFFIX);this.monthEl=C.getElementById(this.id+B.MONTH_SUFFIX);this.errorEl=C.getElementById(this.id+B.ERROR_SUFFIX);this.submitEl=C.getElementById(this.id+B.SUBMIT_SUFFIX);this.cancelEl=C.getElementById(this.id+B.CANCEL_SUFFIX);if(YAHOO.env.ua.gecko&&this.yearEl&&this.yearEl.type=="text"){this.yearEl.setAttribute("autocomplete","off");}this._setFirstLastElements();},createMask:function(){var B=YAHOO.widget.CalendarNavigator.CLASSES;var A=this._doc.createElement("div");A.className=B.MASK;this.cal.oDomContainer.appendChild(A);this.maskEl=A;},_syncMask:function(){var B=this.cal.oDomContainer;if(B&&this.maskEl){var A=YAHOO.util.Dom.getRegion(B);YAHOO.util.Dom.setStyle(this.maskEl,"width",A.right-A.left+"px");YAHOO.util.Dom.setStyle(this.maskEl,"height",A.bottom-A.top+"px");}},renderNavContents:function(A){var D=YAHOO.widget.CalendarNavigator,E=D.CLASSES,B=A;B[B.length]='<div class="'+E.MONTH+'">';this.renderMonth(B);B[B.length]="</div>";B[B.length]='<div class="'+E.YEAR+'">';this.renderYear(B);B[B.length]="</div>";B[B.length]='<div class="'+E.BUTTONS+'">';this.renderButtons(B);B[B.length]="</div>";B[B.length]='<div class="'+E.ERROR+'" id="'+this.id+D.ERROR_SUFFIX+'"></div>';return B;},renderMonth:function(D){var G=YAHOO.widget.CalendarNavigator,H=G.CLASSES;var I=this.id+G.MONTH_SUFFIX,F=this.__getCfg("monthFormat"),A=this.cal.cfg.getProperty((F==YAHOO.widget.Calendar.SHORT)?"MONTHS_SHORT":"MONTHS_LONG"),E=D;if(A&&A.length>0){E[E.length]='<label for="'+I+'">';E[E.length]=this.__getCfg("month",true);E[E.length]="</label>";E[E.length]='<select name="'+I+'" id="'+I+'" class="'+H.MONTH_CTRL+'">';for(var B=0;B<A.length;B++){E[E.length]='<option value="'+B+'">';E[E.length]=A[B];E[E.length]="</option>";}E[E.length]="</select>";}return E;},renderYear:function(B){var E=YAHOO.widget.CalendarNavigator,F=E.CLASSES;var G=this.id+E.YEAR_SUFFIX,A=E.YR_MAX_DIGITS,D=B;D[D.length]='<label for="'+G+'">';D[D.length]=this.__getCfg("year",true);D[D.length]="</label>";D[D.length]='<input type="text" name="'+G+'" id="'+G+'" class="'+F.YEAR_CTRL+'" maxlength="'+A+'"/>';return D;},renderButtons:function(A){var D=YAHOO.widget.CalendarNavigator.CLASSES;var B=A;B[B.length]='<span class="'+D.BUTTON+" "+D.DEFAULT+'">';B[B.length]='<button type="button" id="'+this.id+"_submit"+'">';B[B.length]=this.__getCfg("submit",true);B[B.length]="</button>";B[B.length]="</span>";B[B.length]='<span class="'+D.BUTTON+'">';B[B.length]='<button type="button" id="'+this.id+"_cancel"+'">';B[B.length]=this.__getCfg("cancel",true);B[B.length]="</button>";B[B.length]="</span>";return B;},applyListeners:function(){var B=YAHOO.util.Event;function A(){if(this.validate()){this.setYear(this._getYearFromUI());}}function C(){this.setMonth(this._getMonthFromUI());}B.on(this.submitEl,"click",this.submit,this,true);B.on(this.cancelEl,"click",this.cancel,this,true);B.on(this.yearEl,"blur",A,this,true);B.on(this.monthEl,"change",C,this,true);if(this.__isIEQuirks){YAHOO.util.Event.on(this.cal.oDomContainer,"resize",this._syncMask,this,true);}this.applyKeyListeners();},purgeListeners:function(){var A=YAHOO.util.Event;A.removeListener(this.submitEl,"click",this.submit);A.removeListener(this.cancelEl,"click",this.cancel);A.removeListener(this.yearEl,"blur");A.removeListener(this.monthEl,"change");if(this.__isIEQuirks){A.removeListener(this.cal.oDomContainer,"resize",this._syncMask);}this.purgeKeyListeners();},applyKeyListeners:function(){var D=YAHOO.util.Event,A=YAHOO.env.ua;var C=(A.ie||A.webkit)?"keydown":"keypress";var B=(A.ie||A.opera||A.webkit)?"keydown":"keypress";D.on(this.yearEl,"keypress",this._handleEnterKey,this,true);D.on(this.yearEl,C,this._handleDirectionKeys,this,true);D.on(this.lastCtrl,B,this._handleTabKey,this,true);D.on(this.firstCtrl,B,this._handleShiftTabKey,this,true);},purgeKeyListeners:function(){var D=YAHOO.util.Event,A=YAHOO.env.ua;var C=(A.ie||A.webkit)?"keydown":"keypress";var B=(A.ie||A.opera||A.webkit)?"keydown":"keypress";D.removeListener(this.yearEl,"keypress",this._handleEnterKey);D.removeListener(this.yearEl,C,this._handleDirectionKeys);D.removeListener(this.lastCtrl,B,this._handleTabKey);D.removeListener(this.firstCtrl,B,this._handleShiftTabKey);},submit:function(){if(this.validate()){this.hide();this.setMonth(this._getMonthFromUI());this.setYear(this._getYearFromUI());var B=this.cal;var A=YAHOO.widget.CalendarNavigator.UPDATE_DELAY;if(A>0){var C=this;window.setTimeout(function(){C._update(B);},A);}else{this._update(B);}}},_update:function(B){var A=YAHOO.widget.DateMath.getDate(this.getYear()-B.cfg.getProperty("YEAR_OFFSET"),this.getMonth(),1);B.cfg.setProperty("pagedate",A);B.render();},cancel:function(){this.hide();},validate:function(){if(this._getYearFromUI()!==null){this.clearErrors();return true;}else{this.setYearError();this.setError(this.__getCfg("invalidYear",true));return false;}},setError:function(A){if(this.errorEl){this.errorEl.innerHTML=A;this._show(this.errorEl,true);}},clearError:function(){if(this.errorEl){this.errorEl.innerHTML="";this._show(this.errorEl,false);}},setYearError:function(){YAHOO.util.Dom.addClass(this.yearEl,YAHOO.widget.CalendarNavigator.CLASSES.INVALID);},clearYearError:function(){YAHOO.util.Dom.removeClass(this.yearEl,YAHOO.widget.CalendarNavigator.CLASSES.INVALID);},clearErrors:function(){this.clearError();this.clearYearError();},setInitialFocus:function(){var A=this.submitEl,C=this.__getCfg("initialFocus");if(C&&C.toLowerCase){C=C.toLowerCase();if(C=="year"){A=this.yearEl;try{this.yearEl.select();}catch(B){}}else{if(C=="month"){A=this.monthEl;}}}if(A&&YAHOO.lang.isFunction(A.focus)){try{A.focus();}catch(D){}}},erase:function(){if(this.__rendered){this.purgeListeners();this.yearEl=null;this.monthEl=null;this.errorEl=null;this.submitEl=null;this.cancelEl=null;this.firstCtrl=null;this.lastCtrl=null;if(this.navEl){this.navEl.innerHTML="";}var B=this.navEl.parentNode;if(B){B.removeChild(this.navEl);}this.navEl=null;var A=this.maskEl.parentNode;
if(A){A.removeChild(this.maskEl);}this.maskEl=null;this.__rendered=false;}},destroy:function(){this.erase();this._doc=null;this.cal=null;this.id=null;},_show:function(B,A){if(B){YAHOO.util.Dom.setStyle(B,"display",(A)?"block":"none");}},_getMonthFromUI:function(){if(this.monthEl){return this.monthEl.selectedIndex;}else{return 0;}},_getYearFromUI:function(){var B=YAHOO.widget.CalendarNavigator;var A=null;if(this.yearEl){var C=this.yearEl.value;C=C.replace(B.TRIM,"$1");if(B.YR_PATTERN.test(C)){A=parseInt(C,10);}}return A;},_updateYearUI:function(){if(this.yearEl&&this._year!==null){this.yearEl.value=this._year;}},_updateMonthUI:function(){if(this.monthEl){this.monthEl.selectedIndex=this._month;}},_setFirstLastElements:function(){this.firstCtrl=this.monthEl;this.lastCtrl=this.cancelEl;if(this.__isMac){if(YAHOO.env.ua.webkit&&YAHOO.env.ua.webkit<420){this.firstCtrl=this.monthEl;this.lastCtrl=this.yearEl;}if(YAHOO.env.ua.gecko){this.firstCtrl=this.yearEl;this.lastCtrl=this.yearEl;}}},_handleEnterKey:function(B){var A=YAHOO.util.KeyListener.KEY;if(YAHOO.util.Event.getCharCode(B)==A.ENTER){YAHOO.util.Event.preventDefault(B);this.submit();}},_handleDirectionKeys:function(H){var G=YAHOO.util.Event,A=YAHOO.util.KeyListener.KEY,D=YAHOO.widget.CalendarNavigator;var F=(this.yearEl.value)?parseInt(this.yearEl.value,10):null;if(isFinite(F)){var B=false;switch(G.getCharCode(H)){case A.UP:this.yearEl.value=F+D.YR_MINOR_INC;B=true;break;case A.DOWN:this.yearEl.value=Math.max(F-D.YR_MINOR_INC,0);B=true;break;case A.PAGE_UP:this.yearEl.value=F+D.YR_MAJOR_INC;B=true;break;case A.PAGE_DOWN:this.yearEl.value=Math.max(F-D.YR_MAJOR_INC,0);B=true;break;default:break;}if(B){G.preventDefault(H);try{this.yearEl.select();}catch(C){}}}},_handleTabKey:function(D){var C=YAHOO.util.Event,A=YAHOO.util.KeyListener.KEY;if(C.getCharCode(D)==A.TAB&&!D.shiftKey){try{C.preventDefault(D);this.firstCtrl.focus();}catch(B){}}},_handleShiftTabKey:function(D){var C=YAHOO.util.Event,A=YAHOO.util.KeyListener.KEY;if(D.shiftKey&&C.getCharCode(D)==A.TAB){try{C.preventDefault(D);this.lastCtrl.focus();}catch(B){}}},__getCfg:function(D,B){var C=YAHOO.widget.CalendarNavigator.DEFAULT_CONFIG;var A=this.cal.cfg.getProperty("navigator");if(B){return(A!==true&&A.strings&&A.strings[D])?A.strings[D]:C.strings[D];}else{return(A!==true&&A[D])?A[D]:C[D];}},__isMac:(navigator.userAgent.toLowerCase().indexOf("macintosh")!=-1)};YAHOO.register("calendar",YAHOO.widget.Calendar,{version:"2.8.0r4",build:"2449"});/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
(function(){var D=YAHOO.util.Dom,B=YAHOO.util.Event,F=YAHOO.lang,E=YAHOO.widget;YAHOO.widget.TreeView=function(H,G){if(H){this.init(H);}if(G){this.buildTreeFromObject(G);}else{if(F.trim(this._el.innerHTML)){this.buildTreeFromMarkup(H);}}};var C=E.TreeView;C.prototype={id:null,_el:null,_nodes:null,locked:false,_expandAnim:null,_collapseAnim:null,_animCount:0,maxAnim:2,_hasDblClickSubscriber:false,_dblClickTimer:null,currentFocus:null,singleNodeHighlight:false,_currentlyHighlighted:null,setExpandAnim:function(G){this._expandAnim=(E.TVAnim.isValid(G))?G:null;},setCollapseAnim:function(G){this._collapseAnim=(E.TVAnim.isValid(G))?G:null;},animateExpand:function(I,J){if(this._expandAnim&&this._animCount<this.maxAnim){var G=this;var H=E.TVAnim.getAnim(this._expandAnim,I,function(){G.expandComplete(J);});if(H){++this._animCount;this.fireEvent("animStart",{"node":J,"type":"expand"});H.animate();}return true;}return false;},animateCollapse:function(I,J){if(this._collapseAnim&&this._animCount<this.maxAnim){var G=this;var H=E.TVAnim.getAnim(this._collapseAnim,I,function(){G.collapseComplete(J);});if(H){++this._animCount;this.fireEvent("animStart",{"node":J,"type":"collapse"});H.animate();}return true;}return false;},expandComplete:function(G){--this._animCount;this.fireEvent("animComplete",{"node":G,"type":"expand"});},collapseComplete:function(G){--this._animCount;this.fireEvent("animComplete",{"node":G,"type":"collapse"});},init:function(I){this._el=D.get(I);this.id=D.generateId(this._el,"yui-tv-auto-id-");this.createEvent("animStart",this);this.createEvent("animComplete",this);this.createEvent("collapse",this);this.createEvent("collapseComplete",this);this.createEvent("expand",this);this.createEvent("expandComplete",this);this.createEvent("enterKeyPressed",this);this.createEvent("clickEvent",this);this.createEvent("focusChanged",this);var G=this;this.createEvent("dblClickEvent",{scope:this,onSubscribeCallback:function(){G._hasDblClickSubscriber=true;}});this.createEvent("labelClick",this);this.createEvent("highlightEvent",this);this._nodes=[];C.trees[this.id]=this;this.root=new E.RootNode(this);var H=E.LogWriter;if(this._initEditor){this._initEditor();}},buildTreeFromObject:function(G){var H=function(P,M){var L,Q,K,J,O,I,N;for(L=0;L<M.length;L++){Q=M[L];if(F.isString(Q)){K=new E.TextNode(Q,P);}else{if(F.isObject(Q)){J=Q.children;delete Q.children;O=Q.type||"text";delete Q.type;switch(F.isString(O)&&O.toLowerCase()){case"text":K=new E.TextNode(Q,P);break;case"menu":K=new E.MenuNode(Q,P);break;case"html":K=new E.HTMLNode(Q,P);break;default:if(F.isString(O)){I=E[O];}else{I=O;}if(F.isObject(I)){for(N=I;N&&N!==E.Node;N=N.superclass.constructor){}if(N){K=new I(Q,P);}else{}}else{}}if(J){H(K,J);}}else{}}}};if(!F.isArray(G)){G=[G];}H(this.root,G);},buildTreeFromMarkup:function(I){var H=function(J){var N,Q,M=[],L={},K,O;for(N=D.getFirstChild(J);N;N=D.getNextSibling(N)){switch(N.tagName.toUpperCase()){case"LI":K="";L={expanded:D.hasClass(N,"expanded"),title:N.title||N.alt||null,className:F.trim(N.className.replace(/\bexpanded\b/,""))||null};Q=N.firstChild;if(Q.nodeType==3){K=F.trim(Q.nodeValue.replace(/[\n\t\r]*/g,""));if(K){L.type="text";L.label=K;}else{Q=D.getNextSibling(Q);}}if(!K){if(Q.tagName.toUpperCase()=="A"){L.type="text";L.label=Q.innerHTML;L.href=Q.href;L.target=Q.target;L.title=Q.title||Q.alt||L.title;}else{L.type="html";var P=document.createElement("div");P.appendChild(Q.cloneNode(true));L.html=P.innerHTML;L.hasIcon=true;}}Q=D.getNextSibling(Q);switch(Q&&Q.tagName.toUpperCase()){case"UL":case"OL":L.children=H(Q);break;}if(YAHOO.lang.JSON){O=N.getAttribute("yuiConfig");if(O){O=YAHOO.lang.JSON.parse(O);L=YAHOO.lang.merge(L,O);}}M.push(L);break;case"UL":case"OL":L={type:"text",label:"",children:H(Q)};M.push(L);break;}}return M;};var G=D.getChildrenBy(D.get(I),function(K){var J=K.tagName.toUpperCase();return J=="UL"||J=="OL";});if(G.length){this.buildTreeFromObject(H(G[0]));}else{}},_getEventTargetTdEl:function(H){var I=B.getTarget(H);while(I&&!(I.tagName.toUpperCase()=="TD"&&D.hasClass(I.parentNode,"ygtvrow"))){I=D.getAncestorByTagName(I,"td");}if(F.isNull(I)){return null;}if(/\bygtv(blank)?depthcell/.test(I.className)){return null;}if(I.id){var G=I.id.match(/\bygtv([^\d]*)(.*)/);if(G&&G[2]&&this._nodes[G[2]]){return I;}}return null;},_onClickEvent:function(J){var H=this,L=this._getEventTargetTdEl(J),I,K,G=function(M){I.focus();if(M||!I.href){I.toggle();try{B.preventDefault(J);}catch(N){}}};if(!L){return;}I=this.getNodeByElement(L);if(!I){return;}K=B.getTarget(J);if(D.hasClass(K,I.labelStyle)||D.getAncestorByClassName(K,I.labelStyle)){this.fireEvent("labelClick",I);}if(/\bygtv[tl][mp]h?h?/.test(L.className)){G(true);}else{if(this._dblClickTimer){window.clearTimeout(this._dblClickTimer);this._dblClickTimer=null;}else{if(this._hasDblClickSubscriber){this._dblClickTimer=window.setTimeout(function(){H._dblClickTimer=null;if(H.fireEvent("clickEvent",{event:J,node:I})!==false){G();}},200);}else{if(H.fireEvent("clickEvent",{event:J,node:I})!==false){G();}}}}},_onDblClickEvent:function(G){if(!this._hasDblClickSubscriber){return;}var H=this._getEventTargetTdEl(G);if(!H){return;}if(!(/\bygtv[tl][mp]h?h?/.test(H.className))){this.fireEvent("dblClickEvent",{event:G,node:this.getNodeByElement(H)});if(this._dblClickTimer){window.clearTimeout(this._dblClickTimer);this._dblClickTimer=null;}}},_onMouseOverEvent:function(G){var H;if((H=this._getEventTargetTdEl(G))&&(H=this.getNodeByElement(H))&&(H=H.getToggleEl())){H.className=H.className.replace(/\bygtv([lt])([mp])\b/gi,"ygtv$1$2h");}},_onMouseOutEvent:function(G){var H;if((H=this._getEventTargetTdEl(G))&&(H=this.getNodeByElement(H))&&(H=H.getToggleEl())){H.className=H.className.replace(/\bygtv([lt])([mp])h\b/gi,"ygtv$1$2");}},_onKeyDownEvent:function(L){var N=B.getTarget(L),K=this.getNodeByElement(N),J=K,G=YAHOO.util.KeyListener.KEY;switch(L.keyCode){case G.UP:do{if(J.previousSibling){J=J.previousSibling;}else{J=J.parent;}}while(J&&!J._canHaveFocus());if(J){J.focus();
}B.preventDefault(L);break;case G.DOWN:do{if(J.nextSibling){J=J.nextSibling;}else{J.expand();J=(J.children.length||null)&&J.children[0];}}while(J&&!J._canHaveFocus);if(J){J.focus();}B.preventDefault(L);break;case G.LEFT:do{if(J.parent){J=J.parent;}else{J=J.previousSibling;}}while(J&&!J._canHaveFocus());if(J){J.focus();}B.preventDefault(L);break;case G.RIGHT:var I=this,M,H=function(O){I.unsubscribe("expandComplete",H);M(O);};M=function(O){do{if(O.isDynamic()&&!O.childrenRendered){I.subscribe("expandComplete",H);O.expand();O=null;break;}else{O.expand();if(O.children.length){O=O.children[0];}else{O=O.nextSibling;}}}while(O&&!O._canHaveFocus());if(O){O.focus();}};M(J);B.preventDefault(L);break;case G.ENTER:if(K.href){if(K.target){window.open(K.href,K.target);}else{window.location(K.href);}}else{K.toggle();}this.fireEvent("enterKeyPressed",K);B.preventDefault(L);break;case G.HOME:J=this.getRoot();if(J.children.length){J=J.children[0];}if(J._canHaveFocus()){J.focus();}B.preventDefault(L);break;case G.END:J=J.parent.children;J=J[J.length-1];if(J._canHaveFocus()){J.focus();}B.preventDefault(L);break;case 107:if(L.shiftKey){K.parent.expandAll();}else{K.expand();}break;case 109:if(L.shiftKey){K.parent.collapseAll();}else{K.collapse();}break;default:break;}},render:function(){var G=this.root.getHtml(),H=this.getEl();H.innerHTML=G;if(!this._hasEvents){B.on(H,"click",this._onClickEvent,this,true);B.on(H,"dblclick",this._onDblClickEvent,this,true);B.on(H,"mouseover",this._onMouseOverEvent,this,true);B.on(H,"mouseout",this._onMouseOutEvent,this,true);B.on(H,"keydown",this._onKeyDownEvent,this,true);}this._hasEvents=true;},getEl:function(){if(!this._el){this._el=D.get(this.id);}return this._el;},regNode:function(G){this._nodes[G.index]=G;},getRoot:function(){return this.root;},setDynamicLoad:function(G,H){this.root.setDynamicLoad(G,H);},expandAll:function(){if(!this.locked){this.root.expandAll();}},collapseAll:function(){if(!this.locked){this.root.collapseAll();}},getNodeByIndex:function(H){var G=this._nodes[H];return(G)?G:null;},getNodeByProperty:function(I,H){for(var G in this._nodes){if(this._nodes.hasOwnProperty(G)){var J=this._nodes[G];if((I in J&&J[I]==H)||(J.data&&H==J.data[I])){return J;}}}return null;},getNodesByProperty:function(J,I){var G=[];for(var H in this._nodes){if(this._nodes.hasOwnProperty(H)){var K=this._nodes[H];if((J in K&&K[J]==I)||(K.data&&I==K.data[J])){G.push(K);}}}return(G.length)?G:null;},getNodesBy:function(I){var G=[];for(var H in this._nodes){if(this._nodes.hasOwnProperty(H)){var J=this._nodes[H];if(I(J)){G.push(J);}}}return(G.length)?G:null;},getNodeByElement:function(I){var J=I,G,H=/ygtv([^\d]*)(.*)/;do{if(J&&J.id){G=J.id.match(H);if(G&&G[2]){return this.getNodeByIndex(G[2]);}}J=J.parentNode;if(!J||!J.tagName){break;}}while(J.id!==this.id&&J.tagName.toLowerCase()!=="body");return null;},getHighlightedNode:function(){return this._currentlyHighlighted;},removeNode:function(H,G){if(H.isRoot()){return false;}var I=H.parent;if(I.parent){I=I.parent;}this._deleteNode(H);if(G&&I&&I.childrenRendered){I.refresh();}return true;},_removeChildren_animComplete:function(G){this.unsubscribe(this._removeChildren_animComplete);this.removeChildren(G.node);},removeChildren:function(G){if(G.expanded){if(this._collapseAnim){this.subscribe("animComplete",this._removeChildren_animComplete,this,true);E.Node.prototype.collapse.call(G);return;}G.collapse();}while(G.children.length){this._deleteNode(G.children[0]);}if(G.isRoot()){E.Node.prototype.expand.call(G);}G.childrenRendered=false;G.dynamicLoadComplete=false;G.updateIcon();},_deleteNode:function(G){this.removeChildren(G);this.popNode(G);},popNode:function(J){var K=J.parent;var H=[];for(var I=0,G=K.children.length;I<G;++I){if(K.children[I]!=J){H[H.length]=K.children[I];}}K.children=H;K.childrenRendered=false;if(J.previousSibling){J.previousSibling.nextSibling=J.nextSibling;}if(J.nextSibling){J.nextSibling.previousSibling=J.previousSibling;}if(this.currentFocus==J){this.currentFocus=null;}if(this._currentlyHighlighted==J){this._currentlyHighlighted=null;}J.parent=null;J.previousSibling=null;J.nextSibling=null;J.tree=null;delete this._nodes[J.index];},destroy:function(){if(this._destroyEditor){this._destroyEditor();}var H=this.getEl();B.removeListener(H,"click");B.removeListener(H,"dblclick");B.removeListener(H,"mouseover");B.removeListener(H,"mouseout");B.removeListener(H,"keydown");for(var G=0;G<this._nodes.length;G++){var I=this._nodes[G];if(I&&I.destroy){I.destroy();}}H.innerHTML="";this._hasEvents=false;},toString:function(){return"TreeView "+this.id;},getNodeCount:function(){return this.getRoot().getNodeCount();},getTreeDefinition:function(){return this.getRoot().getNodeDefinition();},onExpand:function(G){},onCollapse:function(G){},setNodesProperty:function(G,I,H){this.root.setNodesProperty(G,I);if(H){this.root.refresh();}},onEventToggleHighlight:function(H){var G;if("node" in H&&H.node instanceof E.Node){G=H.node;}else{if(H instanceof E.Node){G=H;}else{return false;}}G.toggleHighlight();return false;}};var A=C.prototype;A.draw=A.render;YAHOO.augment(C,YAHOO.util.EventProvider);C.nodeCount=0;C.trees=[];C.getTree=function(H){var G=C.trees[H];return(G)?G:null;};C.getNode=function(H,I){var G=C.getTree(H);return(G)?G.getNodeByIndex(I):null;};C.FOCUS_CLASS_NAME="ygtvfocus";})();(function(){var B=YAHOO.util.Dom,C=YAHOO.lang,A=YAHOO.util.Event;YAHOO.widget.Node=function(F,E,D){if(F){this.init(F,E,D);}};YAHOO.widget.Node.prototype={index:0,children:null,tree:null,data:null,parent:null,depth:-1,expanded:false,multiExpand:true,renderHidden:false,childrenRendered:false,dynamicLoadComplete:false,previousSibling:null,nextSibling:null,_dynLoad:false,dataLoader:null,isLoading:false,hasIcon:true,iconMode:0,nowrap:false,isLeaf:false,contentStyle:"",contentElId:null,enableHighlight:true,highlightState:0,propagateHighlightUp:false,propagateHighlightDown:false,className:null,_type:"Node",init:function(G,F,D){this.data={};this.children=[];this.index=YAHOO.widget.TreeView.nodeCount;
++YAHOO.widget.TreeView.nodeCount;this.contentElId="ygtvcontentel"+this.index;if(C.isObject(G)){for(var E in G){if(G.hasOwnProperty(E)){if(E.charAt(0)!="_"&&!C.isUndefined(this[E])&&!C.isFunction(this[E])){this[E]=G[E];}else{this.data[E]=G[E];}}}}if(!C.isUndefined(D)){this.expanded=D;}this.createEvent("parentChange",this);if(F){F.appendChild(this);}},applyParent:function(E){if(!E){return false;}this.tree=E.tree;this.parent=E;this.depth=E.depth+1;this.tree.regNode(this);E.childrenRendered=false;for(var F=0,D=this.children.length;F<D;++F){this.children[F].applyParent(this);}this.fireEvent("parentChange");return true;},appendChild:function(E){if(this.hasChildren()){var D=this.children[this.children.length-1];D.nextSibling=E;E.previousSibling=D;}this.children[this.children.length]=E;E.applyParent(this);if(this.childrenRendered&&this.expanded){this.getChildrenEl().style.display="";}return E;},appendTo:function(D){return D.appendChild(this);},insertBefore:function(D){var F=D.parent;if(F){if(this.tree){this.tree.popNode(this);}var E=D.isChildOf(F);F.children.splice(E,0,this);if(D.previousSibling){D.previousSibling.nextSibling=this;}this.previousSibling=D.previousSibling;this.nextSibling=D;D.previousSibling=this;this.applyParent(F);}return this;},insertAfter:function(D){var F=D.parent;if(F){if(this.tree){this.tree.popNode(this);}var E=D.isChildOf(F);if(!D.nextSibling){this.nextSibling=null;return this.appendTo(F);}F.children.splice(E+1,0,this);D.nextSibling.previousSibling=this;this.previousSibling=D;this.nextSibling=D.nextSibling;D.nextSibling=this;this.applyParent(F);}return this;},isChildOf:function(E){if(E&&E.children){for(var F=0,D=E.children.length;F<D;++F){if(E.children[F]===this){return F;}}}return -1;},getSiblings:function(){var D=this.parent.children.slice(0);for(var E=0;E<D.length&&D[E]!=this;E++){}D.splice(E,1);if(D.length){return D;}return null;},showChildren:function(){if(!this.tree.animateExpand(this.getChildrenEl(),this)){if(this.hasChildren()){this.getChildrenEl().style.display="";}}},hideChildren:function(){if(!this.tree.animateCollapse(this.getChildrenEl(),this)){this.getChildrenEl().style.display="none";}},getElId:function(){return"ygtv"+this.index;},getChildrenElId:function(){return"ygtvc"+this.index;},getToggleElId:function(){return"ygtvt"+this.index;},getEl:function(){return B.get(this.getElId());},getChildrenEl:function(){return B.get(this.getChildrenElId());},getToggleEl:function(){return B.get(this.getToggleElId());},getContentEl:function(){return B.get(this.contentElId);},collapse:function(){if(!this.expanded){return;}var D=this.tree.onCollapse(this);if(false===D){return;}D=this.tree.fireEvent("collapse",this);if(false===D){return;}if(!this.getEl()){this.expanded=false;}else{this.hideChildren();this.expanded=false;this.updateIcon();}D=this.tree.fireEvent("collapseComplete",this);},expand:function(F){if(this.isLoading||(this.expanded&&!F)){return;}var D=true;if(!F){D=this.tree.onExpand(this);if(false===D){return;}D=this.tree.fireEvent("expand",this);}if(false===D){return;}if(!this.getEl()){this.expanded=true;return;}if(!this.childrenRendered){this.getChildrenEl().innerHTML=this.renderChildren();}else{}this.expanded=true;this.updateIcon();if(this.isLoading){this.expanded=false;return;}if(!this.multiExpand){var G=this.getSiblings();for(var E=0;G&&E<G.length;++E){if(G[E]!=this&&G[E].expanded){G[E].collapse();}}}this.showChildren();D=this.tree.fireEvent("expandComplete",this);},updateIcon:function(){if(this.hasIcon){var D=this.getToggleEl();if(D){D.className=D.className.replace(/\bygtv(([tl][pmn]h?)|(loading))\b/gi,this.getStyle());}}},getStyle:function(){if(this.isLoading){return"ygtvloading";}else{var E=(this.nextSibling)?"t":"l";var D="n";if(this.hasChildren(true)||(this.isDynamic()&&!this.getIconMode())){D=(this.expanded)?"m":"p";}return"ygtv"+E+D;}},getHoverStyle:function(){var D=this.getStyle();if(this.hasChildren(true)&&!this.isLoading){D+="h";}return D;},expandAll:function(){var D=this.children.length;for(var E=0;E<D;++E){var F=this.children[E];if(F.isDynamic()){break;}else{if(!F.multiExpand){break;}else{F.expand();F.expandAll();}}}},collapseAll:function(){for(var D=0;D<this.children.length;++D){this.children[D].collapse();this.children[D].collapseAll();}},setDynamicLoad:function(D,E){if(D){this.dataLoader=D;this._dynLoad=true;}else{this.dataLoader=null;this._dynLoad=false;}if(E){this.iconMode=E;}},isRoot:function(){return(this==this.tree.root);},isDynamic:function(){if(this.isLeaf){return false;}else{return(!this.isRoot()&&(this._dynLoad||this.tree.root._dynLoad));}},getIconMode:function(){return(this.iconMode||this.tree.root.iconMode);},hasChildren:function(D){if(this.isLeaf){return false;}else{return(this.children.length>0||(D&&this.isDynamic()&&!this.dynamicLoadComplete));}},toggle:function(){if(!this.tree.locked&&(this.hasChildren(true)||this.isDynamic())){if(this.expanded){this.collapse();}else{this.expand();}}},getHtml:function(){this.childrenRendered=false;return['<div class="ygtvitem" id="',this.getElId(),'">',this.getNodeHtml(),this.getChildrenHtml(),"</div>"].join("");},getChildrenHtml:function(){var D=[];D[D.length]='<div class="ygtvchildren" id="'+this.getChildrenElId()+'"';if(!this.expanded||!this.hasChildren()){D[D.length]=' style="display:none;"';}D[D.length]=">";if((this.hasChildren(true)&&this.expanded)||(this.renderHidden&&!this.isDynamic())){D[D.length]=this.renderChildren();}D[D.length]="</div>";return D.join("");},renderChildren:function(){var D=this;if(this.isDynamic()&&!this.dynamicLoadComplete){this.isLoading=true;this.tree.locked=true;if(this.dataLoader){setTimeout(function(){D.dataLoader(D,function(){D.loadComplete();});},10);}else{if(this.tree.root.dataLoader){setTimeout(function(){D.tree.root.dataLoader(D,function(){D.loadComplete();});},10);}else{return"Error: data loader not found or not specified.";}}return"";}else{return this.completeRender();}},completeRender:function(){var E=[];for(var D=0;D<this.children.length;++D){E[E.length]=this.children[D].getHtml();
}this.childrenRendered=true;return E.join("");},loadComplete:function(){this.getChildrenEl().innerHTML=this.completeRender();if(this.propagateHighlightDown){if(this.highlightState===1&&!this.tree.singleNodeHighlight){for(var D=0;D<this.children.length;D++){this.children[D].highlight(true);}}else{if(this.highlightState===0||this.tree.singleNodeHighlight){for(D=0;D<this.children.length;D++){this.children[D].unhighlight(true);}}}}this.dynamicLoadComplete=true;this.isLoading=false;this.expand(true);this.tree.locked=false;},getAncestor:function(E){if(E>=this.depth||E<0){return null;}var D=this.parent;while(D.depth>E){D=D.parent;}return D;},getDepthStyle:function(D){return(this.getAncestor(D).nextSibling)?"ygtvdepthcell":"ygtvblankdepthcell";},getNodeHtml:function(){var E=[];E[E.length]='<table id="ygtvtableel'+this.index+'" border="0" cellpadding="0" cellspacing="0" class="ygtvtable ygtvdepth'+this.depth;if(this.enableHighlight){E[E.length]=" ygtv-highlight"+this.highlightState;}if(this.className){E[E.length]=" "+this.className;}E[E.length]='"><tr class="ygtvrow">';for(var D=0;D<this.depth;++D){E[E.length]='<td class="ygtvcell '+this.getDepthStyle(D)+'"><div class="ygtvspacer"></div></td>';}if(this.hasIcon){E[E.length]='<td id="'+this.getToggleElId();E[E.length]='" class="ygtvcell ';E[E.length]=this.getStyle();E[E.length]='"><a href="#" class="ygtvspacer">&#160;</a></td>';}E[E.length]='<td id="'+this.contentElId;E[E.length]='" class="ygtvcell ';E[E.length]=this.contentStyle+' ygtvcontent" ';E[E.length]=(this.nowrap)?' nowrap="nowrap" ':"";E[E.length]=" >";E[E.length]=this.getContentHtml();E[E.length]="</td></tr></table>";return E.join("");},getContentHtml:function(){return"";},refresh:function(){this.getChildrenEl().innerHTML=this.completeRender();if(this.hasIcon){var D=this.getToggleEl();if(D){D.className=D.className.replace(/\bygtv[lt][nmp]h*\b/gi,this.getStyle());}}},toString:function(){return this._type+" ("+this.index+")";},_focusHighlightedItems:[],_focusedItem:null,_canHaveFocus:function(){return this.getEl().getElementsByTagName("a").length>0;},_removeFocus:function(){if(this._focusedItem){A.removeListener(this._focusedItem,"blur");this._focusedItem=null;}var D;while((D=this._focusHighlightedItems.shift())){B.removeClass(D,YAHOO.widget.TreeView.FOCUS_CLASS_NAME);}},focus:function(){var F=false,D=this;if(this.tree.currentFocus){this.tree.currentFocus._removeFocus();}var E=function(G){if(G.parent){E(G.parent);G.parent.expand();}};E(this);B.getElementsBy(function(G){return(/ygtv(([tl][pmn]h?)|(content))/).test(G.className);},"td",D.getEl().firstChild,function(H){B.addClass(H,YAHOO.widget.TreeView.FOCUS_CLASS_NAME);if(!F){var G=H.getElementsByTagName("a");if(G.length){G=G[0];G.focus();D._focusedItem=G;A.on(G,"blur",function(){D.tree.fireEvent("focusChanged",{oldNode:D.tree.currentFocus,newNode:null});D.tree.currentFocus=null;D._removeFocus();});F=true;}}D._focusHighlightedItems.push(H);});if(F){this.tree.fireEvent("focusChanged",{oldNode:this.tree.currentFocus,newNode:this});this.tree.currentFocus=this;}else{this.tree.fireEvent("focusChanged",{oldNode:D.tree.currentFocus,newNode:null});this.tree.currentFocus=null;this._removeFocus();}return F;},getNodeCount:function(){for(var D=0,E=0;D<this.children.length;D++){E+=this.children[D].getNodeCount();}return E+1;},getNodeDefinition:function(){if(this.isDynamic()){return false;}var G,D=C.merge(this.data),F=[];if(this.expanded){D.expanded=this.expanded;}if(!this.multiExpand){D.multiExpand=this.multiExpand;}if(!this.renderHidden){D.renderHidden=this.renderHidden;}if(!this.hasIcon){D.hasIcon=this.hasIcon;}if(this.nowrap){D.nowrap=this.nowrap;}if(this.className){D.className=this.className;}if(this.editable){D.editable=this.editable;}if(this.enableHighlight){D.enableHighlight=this.enableHighlight;}if(this.highlightState){D.highlightState=this.highlightState;}if(this.propagateHighlightUp){D.propagateHighlightUp=this.propagateHighlightUp;}if(this.propagateHighlightDown){D.propagateHighlightDown=this.propagateHighlightDown;}D.type=this._type;for(var E=0;E<this.children.length;E++){G=this.children[E].getNodeDefinition();if(G===false){return false;}F.push(G);}if(F.length){D.children=F;}return D;},getToggleLink:function(){return"return false;";},setNodesProperty:function(D,G,F){if(D.charAt(0)!="_"&&!C.isUndefined(this[D])&&!C.isFunction(this[D])){this[D]=G;}else{this.data[D]=G;}for(var E=0;E<this.children.length;E++){this.children[E].setNodesProperty(D,G);}if(F){this.refresh();}},toggleHighlight:function(){if(this.enableHighlight){if(this.highlightState==1){this.unhighlight();}else{this.highlight();}}},highlight:function(E){if(this.enableHighlight){if(this.tree.singleNodeHighlight){if(this.tree._currentlyHighlighted){this.tree._currentlyHighlighted.unhighlight(E);}this.tree._currentlyHighlighted=this;}this.highlightState=1;this._setHighlightClassName();if(!this.tree.singleNodeHighlight){if(this.propagateHighlightDown){for(var D=0;D<this.children.length;D++){this.children[D].highlight(true);}}if(this.propagateHighlightUp){if(this.parent){this.parent._childrenHighlighted();}}}if(!E){this.tree.fireEvent("highlightEvent",this);}}},unhighlight:function(E){if(this.enableHighlight){this.tree._currentlyHighlighted=null;this.highlightState=0;this._setHighlightClassName();if(!this.tree.singleNodeHighlight){if(this.propagateHighlightDown){for(var D=0;D<this.children.length;D++){this.children[D].unhighlight(true);}}if(this.propagateHighlightUp){if(this.parent){this.parent._childrenHighlighted();}}}if(!E){this.tree.fireEvent("highlightEvent",this);}}},_childrenHighlighted:function(){var F=false,E=false;if(this.enableHighlight){for(var D=0;D<this.children.length;D++){switch(this.children[D].highlightState){case 0:E=true;break;case 1:F=true;break;case 2:F=E=true;break;}}if(F&&E){this.highlightState=2;}else{if(F){this.highlightState=1;}else{this.highlightState=0;}}this._setHighlightClassName();if(this.propagateHighlightUp){if(this.parent){this.parent._childrenHighlighted();
}}}},_setHighlightClassName:function(){var D=B.get("ygtvtableel"+this.index);if(D){D.className=D.className.replace(/\bygtv-highlight\d\b/gi,"ygtv-highlight"+this.highlightState);}}};YAHOO.augment(YAHOO.widget.Node,YAHOO.util.EventProvider);})();YAHOO.widget.RootNode=function(A){this.init(null,null,true);this.tree=A;};YAHOO.extend(YAHOO.widget.RootNode,YAHOO.widget.Node,{_type:"RootNode",getNodeHtml:function(){return"";},toString:function(){return this._type;},loadComplete:function(){this.tree.draw();},getNodeCount:function(){for(var A=0,B=0;A<this.children.length;A++){B+=this.children[A].getNodeCount();}return B;},getNodeDefinition:function(){for(var C,A=[],B=0;B<this.children.length;B++){C=this.children[B].getNodeDefinition();if(C===false){return false;}A.push(C);}return A;},collapse:function(){},expand:function(){},getSiblings:function(){return null;},focus:function(){}});(function(){var B=YAHOO.util.Dom,C=YAHOO.lang,A=YAHOO.util.Event;YAHOO.widget.TextNode=function(F,E,D){if(F){if(C.isString(F)){F={label:F};}this.init(F,E,D);this.setUpLabel(F);}};YAHOO.extend(YAHOO.widget.TextNode,YAHOO.widget.Node,{labelStyle:"ygtvlabel",labelElId:null,label:null,title:null,href:null,target:"_self",_type:"TextNode",setUpLabel:function(D){if(C.isString(D)){D={label:D};}else{if(D.style){this.labelStyle=D.style;}}this.label=D.label;this.labelElId="ygtvlabelel"+this.index;},getLabelEl:function(){return B.get(this.labelElId);},getContentHtml:function(){var D=[];D[D.length]=this.href?"<a":"<span";D[D.length]=' id="'+this.labelElId+'"';D[D.length]=' class="'+this.labelStyle+'"';if(this.href){D[D.length]=' href="'+this.href+'"';D[D.length]=' target="'+this.target+'"';}if(this.title){D[D.length]=' title="'+this.title+'"';}D[D.length]=" >";D[D.length]=this.label;D[D.length]=this.href?"</a>":"</span>";return D.join("");},getNodeDefinition:function(){var D=YAHOO.widget.TextNode.superclass.getNodeDefinition.call(this);if(D===false){return false;}D.label=this.label;if(this.labelStyle!="ygtvlabel"){D.style=this.labelStyle;}if(this.title){D.title=this.title;}if(this.href){D.href=this.href;}if(this.target!="_self"){D.target=this.target;}return D;},toString:function(){return YAHOO.widget.TextNode.superclass.toString.call(this)+": "+this.label;},onLabelClick:function(){return false;},refresh:function(){YAHOO.widget.TextNode.superclass.refresh.call(this);var D=this.getLabelEl();D.innerHTML=this.label;if(D.tagName.toUpperCase()=="A"){D.href=this.href;D.target=this.target;}}});})();YAHOO.widget.MenuNode=function(C,B,A){YAHOO.widget.MenuNode.superclass.constructor.call(this,C,B,A);this.multiExpand=false;};YAHOO.extend(YAHOO.widget.MenuNode,YAHOO.widget.TextNode,{_type:"MenuNode"});(function(){var B=YAHOO.util.Dom,C=YAHOO.lang,A=YAHOO.util.Event;YAHOO.widget.HTMLNode=function(G,F,E,D){if(G){this.init(G,F,E);this.initContent(G,D);}};YAHOO.extend(YAHOO.widget.HTMLNode,YAHOO.widget.Node,{contentStyle:"ygtvhtml",html:null,_type:"HTMLNode",initContent:function(E,D){this.setHtml(E);this.contentElId="ygtvcontentel"+this.index;if(!C.isUndefined(D)){this.hasIcon=D;}},setHtml:function(E){this.html=(typeof E==="string")?E:E.html;var D=this.getContentEl();if(D){D.innerHTML=this.html;}},getContentHtml:function(){return this.html;},getNodeDefinition:function(){var D=YAHOO.widget.HTMLNode.superclass.getNodeDefinition.call(this);if(D===false){return false;}D.html=this.html;return D;}});})();(function(){var B=YAHOO.util.Dom,C=YAHOO.lang,A=YAHOO.util.Event,D=YAHOO.widget.Calendar;YAHOO.widget.DateNode=function(G,F,E){YAHOO.widget.DateNode.superclass.constructor.call(this,G,F,E);};YAHOO.extend(YAHOO.widget.DateNode,YAHOO.widget.TextNode,{_type:"DateNode",calendarConfig:null,fillEditorContainer:function(G){var H,F=G.inputContainer;if(C.isUndefined(D)){B.replaceClass(G.editorPanel,"ygtv-edit-DateNode","ygtv-edit-TextNode");YAHOO.widget.DateNode.superclass.fillEditorContainer.call(this,G);return;}if(G.nodeType!=this._type){G.nodeType=this._type;G.saveOnEnter=false;G.node.destroyEditorContents(G);G.inputObject=H=new D(F.appendChild(document.createElement("div")));if(this.calendarConfig){H.cfg.applyConfig(this.calendarConfig,true);H.cfg.fireQueue();}H.selectEvent.subscribe(function(){this.tree._closeEditor(true);},this,true);}else{H=G.inputObject;}G.oldValue=this.label;H.cfg.setProperty("selected",this.label,false);var I=H.cfg.getProperty("DATE_FIELD_DELIMITER");var E=this.label.split(I);H.cfg.setProperty("pagedate",E[H.cfg.getProperty("MDY_MONTH_POSITION")-1]+I+E[H.cfg.getProperty("MDY_YEAR_POSITION")-1]);H.cfg.fireQueue();H.render();H.oDomContainer.focus();},getEditorValue:function(F){if(C.isUndefined(D)){return F.inputElement.value;}else{var H=F.inputObject,G=H.getSelectedDates()[0],E=[];E[H.cfg.getProperty("MDY_DAY_POSITION")-1]=G.getDate();E[H.cfg.getProperty("MDY_MONTH_POSITION")-1]=G.getMonth()+1;E[H.cfg.getProperty("MDY_YEAR_POSITION")-1]=G.getFullYear();return E.join(H.cfg.getProperty("DATE_FIELD_DELIMITER"));}},displayEditedValue:function(G,E){var F=E.node;F.label=G;F.getLabelEl().innerHTML=G;},getNodeDefinition:function(){var E=YAHOO.widget.DateNode.superclass.getNodeDefinition.call(this);if(E===false){return false;}if(this.calendarConfig){E.calendarConfig=this.calendarConfig;}return E;}});})();(function(){var E=YAHOO.util.Dom,F=YAHOO.lang,B=YAHOO.util.Event,D=YAHOO.widget.TreeView,C=D.prototype;D.editorData={active:false,whoHasIt:null,nodeType:null,editorPanel:null,inputContainer:null,buttonsContainer:null,node:null,saveOnEnter:true,oldValue:undefined};C.validator=null;C._initEditor=function(){this.createEvent("editorSaveEvent",this);this.createEvent("editorCancelEvent",this);};C._nodeEditing=function(M){if(M.fillEditorContainer&&M.editable){var I,K,L,J,H=D.editorData;H.active=true;H.whoHasIt=this;if(!H.nodeType){H.editorPanel=I=document.body.appendChild(document.createElement("div"));E.addClass(I,"ygtv-label-editor");L=H.buttonsContainer=I.appendChild(document.createElement("div"));E.addClass(L,"ygtv-button-container");J=L.appendChild(document.createElement("button"));
E.addClass(J,"ygtvok");J.innerHTML=" ";J=L.appendChild(document.createElement("button"));E.addClass(J,"ygtvcancel");J.innerHTML=" ";B.on(L,"click",function(O){var P=B.getTarget(O);var N=D.editorData.node;if(E.hasClass(P,"ygtvok")){B.stopEvent(O);this._closeEditor(true);}if(E.hasClass(P,"ygtvcancel")){B.stopEvent(O);this._closeEditor(false);}},this,true);H.inputContainer=I.appendChild(document.createElement("div"));E.addClass(H.inputContainer,"ygtv-input");B.on(I,"keydown",function(P){var O=D.editorData,N=YAHOO.util.KeyListener.KEY;switch(P.keyCode){case N.ENTER:B.stopEvent(P);if(O.saveOnEnter){this._closeEditor(true);}break;case N.ESCAPE:B.stopEvent(P);this._closeEditor(false);break;}},this,true);}else{I=H.editorPanel;}H.node=M;if(H.nodeType){E.removeClass(I,"ygtv-edit-"+H.nodeType);}E.addClass(I," ygtv-edit-"+M._type);K=E.getXY(M.getContentEl());E.setStyle(I,"left",K[0]+"px");E.setStyle(I,"top",K[1]+"px");E.setStyle(I,"display","block");I.focus();M.fillEditorContainer(H);return true;}};C.onEventEditNode=function(H){if(H instanceof YAHOO.widget.Node){H.editNode();}else{if(H.node instanceof YAHOO.widget.Node){H.node.editNode();}}};C._closeEditor=function(J){var H=D.editorData,I=H.node,K=true;if(J){K=H.node.saveEditorValue(H)!==false;}else{this.fireEvent("editorCancelEvent",I);}if(K){E.setStyle(H.editorPanel,"display","none");H.active=false;I.focus();}};C._destroyEditor=function(){var H=D.editorData;if(H&&H.nodeType&&(!H.active||H.whoHasIt===this)){B.removeListener(H.editorPanel,"keydown");B.removeListener(H.buttonContainer,"click");H.node.destroyEditorContents(H);document.body.removeChild(H.editorPanel);H.nodeType=H.editorPanel=H.inputContainer=H.buttonsContainer=H.whoHasIt=H.node=null;H.active=false;}};var G=YAHOO.widget.Node.prototype;G.editable=false;G.editNode=function(){this.tree._nodeEditing(this);};G.fillEditorContainer=null;G.destroyEditorContents=function(H){B.purgeElement(H.inputContainer,true);H.inputContainer.innerHTML="";};G.saveEditorValue=function(H){var J=H.node,K,I=J.tree.validator;K=this.getEditorValue(H);if(F.isFunction(I)){K=I(K,H.oldValue,J);if(F.isUndefined(K)){return false;}}if(this.tree.fireEvent("editorSaveEvent",{newValue:K,oldValue:H.oldValue,node:J})!==false){this.displayEditedValue(K,H);}};G.getEditorValue=function(H){};G.displayEditedValue=function(I,H){};var A=YAHOO.widget.TextNode.prototype;A.fillEditorContainer=function(I){var H;if(I.nodeType!=this._type){I.nodeType=this._type;I.saveOnEnter=true;I.node.destroyEditorContents(I);I.inputElement=H=I.inputContainer.appendChild(document.createElement("input"));}else{H=I.inputElement;}I.oldValue=this.label;H.value=this.label;H.focus();H.select();};A.getEditorValue=function(H){return H.inputElement.value;};A.displayEditedValue=function(J,H){var I=H.node;I.label=J;I.getLabelEl().innerHTML=J;};A.destroyEditorContents=function(H){H.inputContainer.innerHTML="";};})();YAHOO.widget.TVAnim=function(){return{FADE_IN:"TVFadeIn",FADE_OUT:"TVFadeOut",getAnim:function(B,A,C){if(YAHOO.widget[B]){return new YAHOO.widget[B](A,C);}else{return null;}},isValid:function(A){return(YAHOO.widget[A]);}};}();YAHOO.widget.TVFadeIn=function(A,B){this.el=A;this.callback=B;};YAHOO.widget.TVFadeIn.prototype={animate:function(){var D=this;var C=this.el.style;C.opacity=0.1;C.filter="alpha(opacity=10)";C.display="";var B=0.4;var A=new YAHOO.util.Anim(this.el,{opacity:{from:0.1,to:1,unit:""}},B);A.onComplete.subscribe(function(){D.onComplete();});A.animate();},onComplete:function(){this.callback();},toString:function(){return"TVFadeIn";}};YAHOO.widget.TVFadeOut=function(A,B){this.el=A;this.callback=B;};YAHOO.widget.TVFadeOut.prototype={animate:function(){var C=this;var B=0.4;var A=new YAHOO.util.Anim(this.el,{opacity:{from:1,to:0.1,unit:""}},B);A.onComplete.subscribe(function(){C.onComplete();});A.animate();},onComplete:function(){var A=this.el.style;A.display="none";A.opacity=1;A.filter="alpha(opacity=100)";this.callback();},toString:function(){return"TVFadeOut";}};YAHOO.register("treeview",YAHOO.widget.TreeView,{version:"2.8.0r4",build:"2449"});/**
 * The top-level WSO2Vis namespace. All public methods and fields should be
 * registered on this object. Note that core wso2vis source is surrounded by an
 * anonymous function, so any other declared globals will not be visible outside
 * of core methods. This also allows multiple versions of WSO2Vis to coexist,
 * since each version will see their own <tt>wso2vis</tt> namespace.
 *
 * @namespace The top-level wso2vis namespace, <tt>wso2vis</tt>.
 */
var wso2vis = {};

/**
 * @namespace wso2vis namespace for Providers, <tt>wso2vis.p</tt>.
 */
wso2vis.p = {};

/**
 * @namespace wso2vis namespace for Filters, <tt>wso2vis.f</tt>.
 */
wso2vis.f = {};

/**
 * @namespace wso2vis namespace for Filter Forms, <tt>wso2vis.f.form</tt>.
 */
wso2vis.f.form = {};

/**
 * @namespace wso2vis namespace for Subscribers, <tt>wso2vis.s</tt>.
 */
wso2vis.s = {};

/**
 * @namespace wso2vis namespace for Subscriber Charts, <tt>wso2vis.s.chart</tt>.
 */
wso2vis.s.chart = {};

/**
 * @namespace wso2vis namespace for Subscriber Protovis Charts, <tt>wso2vis.s.chart.protovis</tt>.
 */
wso2vis.s.chart.protovis = {};

/**
 * @namespace wso2vis namespace for Subscriber Raphael Charts, <tt>wso2vis.s.chart.raphael</tt>.
 */
wso2vis.s.chart.raphael = {};

/**
 * @namespace wso2vis namespace for Subscriber Infovis Charts, <tt>wso2vis.s.chart.raphael</tt>.
 */
wso2vis.s.chart.infovis = {};

/**
 * @namespace wso2vis namespace for Subscriber composite Charts, <tt>wso2vis.s.chart.composite</tt>.
 */
wso2vis.s.chart.composite = {};

/**
 * @namespace wso2vis namespace for Subscriber Forms, <tt>wso2vis.s.form</tt>.
 */
wso2vis.s.form = {};

/**
 * @namespace wso2vis namespace for Subscriber Gauges, <tt>wso2vis.s.gauge</tt>.
 */
wso2vis.s.gauge = {};

/**
 * @namespace wso2vis namespace for Subscriber Raphael Charts, <tt>wso2vis.s.chart.raphael</tt>.
 */
wso2vis.s.gauge.raphael = {};

/**
 * @namespace wso2vis namespace for Utility Components, <tt>wso2vis.u</tt>.
 */
wso2vis.u = {};

/**
 * @namespace wso2vis namespace for utility functions, <tt>wso2vis.util</tt>.
 */
wso2vis.util = {};

/**
 * @namespace wso2vis namespace for Adaptors, <tt>wso2vis.a</tt>.
 */
wso2vis.a = {};

/**
 * @namespace wso2vis namespace for controls, <tt>wso2vis.c</tt>.
 */
wso2vis.c = {};

/**
 * @namespace wso2vis namespace for user defined custom functions, <tt>wso2vis.fn</tt>.
 */
wso2vis.fn = {};

/**
 * WSO2Vis major and minor version numbers.
 *
 * @namespace WSO2Vis major and minor version numbers.
 */
wso2vis.version = {
   /**
    * The major version number.
    *
    * @type number
    * @constant
    */
    major: 0,

   /**
    * The minor version number.
    *
    * @type number
    * @constant
    */
    minor: 1
};

/**
 * WSO2Vis environment. All data providers, filters and charts are registred in the environment.
 * @namespace wso2vis namespace for environment variables, <tt>wso2vis.environment</tt>.
 */ 
wso2vis.environment = { 
   /** 
    * providers array
    */
    providers: [],

   /** 
    * filters array
    */
    filters: [],
    
   /**
    * charts array
    */
    charts: [],
    
   /** 
    * dialogs array
    */
    dialogs: [],
    
    /**
     * subscribers array
     */
     subscribers: [],
     
    /**
     * adapters array
     */
     adapters: [],

	 /**
	  * controls array
	  */
	 controls: [],
	 
	 /**
	  * gauges array
	  */
	 gauges: []
	
};

wso2vis.fn.getProviderFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.providers.length > id)) {
        return wso2vis.environment.providers[id];
    }
    return null;
};

wso2vis.fn.getFilterFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.filters.length > id)) {
        return wso2vis.environment.filters[id];
    }
    return null;    
};

wso2vis.fn.getChartFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.charts.length > id)) {
        return wso2vis.environment.charts[id];
    }
    return null;
};

wso2vis.fn.getDialogFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.dialogs.length > id)) {
        return wso2vis.environment.dialogs[id];
    }
    return null;
};

wso2vis.fn.getElementFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.elements.length > id)) {
        return wso2vis.environment.elements[id];
    }
    return null;
};

wso2vis.fn.getAdapterFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.adapters.length > id)) {
        return wso2vis.environment.adapters[id];
    }
    return null;
};

wso2vis.fn.getControlFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.controls.length > id)) {
        return wso2vis.environment.controls[id];
    }
    return null;
};

wso2vis.fn.getGaugeFromID = function(id) {
    if ((id >= 0) && (wso2vis.environment.gauges.length > id)) {
        return wso2vis.environment.gauges[id];
    }
    return null;
};

wso2vis.fn.traverseToDataField = function (object, dataFieldArray) {
	var a = object;					
	for (var i = 0; i < dataFieldArray.length; i++) {
		a = a[dataFieldArray[i]];
	}
	return a;
};

wso2vis.fn.traverseNKillLeaf = function (object, dataFieldArray) {
	var a = object;
	for (var i = 0; i < dataFieldArray.length; i++) {
		if (i == dataFieldArray.length - 1) {
			delete a[dataFieldArray[i]];
		}
		else {
			a = a[dataFieldArray[i]];
		}
	}
};

/* using "Parasitic Combination Inheritance" */
wso2vis.extend = function(subc, superc /*, overrides*/) {
    if (!superc||!subc) {
        throw new Error("extend failed, please check that " +
                        "all dependencies are included.");
    }
    var F = function() {}/*, i*/;
    F.prototype=superc.prototype;
    subc.prototype=new F();
    subc.prototype.constructor=subc;
    subc.superclass=superc.prototype;
    if (superc.prototype.constructor == Object.prototype.constructor) {
        superc.prototype.constructor=superc;
    }

    /* Lets worry about the following later
    if (overrides) {
        for (i in overrides) {
            if (L.hasOwnProperty(overrides, i)) {
                subc.prototype[i]=overrides[i];
            }
        }

        L._IEEnumFix(subc.prototype, overrides);
    } */
};

wso2vis.initialize = function() {
    wso2vis.environment.tooltip = new wso2vis.c.Tooltip();        
};


//Global utility functions

function $(_id) {
    return document.getElementById(_id);
}

Array.prototype.max = function() {
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
    return max;
}

Array.prototype.min = function() {
    var min = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
    return min;
}

wso2vis.util.generateColors = function(count, scheme) {
    function hexNumtoHexStr(n) {
        function toHexStr(N) {
             if (N==null) return "00";
             N=parseInt(N); if (N==0 || isNaN(N)) return "00";
             N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
             return "0123456789ABCDEF".charAt((N-N%16)/16)
                  + "0123456789ABCDEF".charAt(N%16);
        }
        
        return "#" + toHexStr((n & 0xFF0000)>>>16) + toHexStr((n & 0x00FF00)>>>8) + toHexStr((n & 0x0000FF));
    }
        
    function generateInterpolatedColorArray(count, colors) {
        function interpolateColors(color1, color2, f) {
            if (f >= 1)
                return color2;
            if (f <= 0)
                return color1;
            var fb = 1 - f;
            return ((((color2 & 0xFF0000) * f)+((color1 & 0xFF0000) * fb)) & 0xFF0000)
                   +((((color2 & 0x00FF00) * f)+((color1 & 0x00FF00) * fb)) & 0x00FF00)
                   +((((color2 & 0x0000FF) * f)+((color1 & 0x0000FF) * fb)) & 0x0000FF);                                   
        }               
        
        var len = colors.length;
        var res = new Array();
        res.push(hexNumtoHexStr(colors[0]));
        
        for (var i = 1; i < count; i++) {
            var val = i * len / count;
            var color1 = Math.floor(val);
            var color2 = Math.ceil(val);
            res.push(hexNumtoHexStr(interpolateColors(colors[color1], colors[color2], val - color1)));                        
        }
        
        return res;
    }

    if (count <= 0) 
        return null;
        
    var a10 = [0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd,
        0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf];
    var b20 = [0x1f77b4, 0xaec7e8, 0xff7f0e, 0xffbb78, 0x2ca02c,
          0x98df8a, 0xd62728, 0xff9896, 0x9467bd, 0xc5b0d5,
          0x8c564b, 0xc49c94, 0xe377c2, 0xf7b6d2, 0x7f7f7f,
          0xc7c7c7, 0xbcbd22, 0xdbdb8d, 0x17becf, 0x9edae5];
    var c19 = [0x9c9ede, 0x7375b5, 0x4a5584, 0xcedb9c, 0xb5cf6b,
          0x8ca252, 0x637939, 0xe7cb94, 0xe7ba52, 0xbd9e39,
          0x8c6d31, 0xe7969c, 0xd6616b, 0xad494a, 0x843c39,
          0xde9ed6, 0xce6dbd, 0xa55194, 0x7b4173];
    var colorScheme;
    
    if (scheme == 20) {
        colorScheme = b20;
    }
    else if (scheme == 10) {
        colorScheme = a10;
    }
    else /* any ((scheme === undefined) || (scheme == 19))*/{
        colorScheme = c19;
    }
    
    if (count <= colorScheme.length) {
        c = new Array();
        for (var i = 0; i < count; i++)
            c.push(hexNumtoHexStr(colorScheme[i]));
        return c;
    }
    
    return generateInterpolatedColorArray(count, colorScheme);
}

/**
 * Timer 
 */
wso2vis.u.Timer = function(timerInterval) {
	this.timerInterval = timerInterval; // sets the interval

	var timerID = 0;
	var timerRunning = false;
	var thisObject = null;
	
	this.updateInterval = function(interval) {
		if ((interval > 0) && (interval != this.timerInterval)) {
			this.timerInterval = interval;
			this.stopTimer();
			this.startTimer();
		}
	};

	this.startTimer = function(immediate) {
        this.stopTimer();
		if (timerInterval > 0) {
			this.timerRunning = true;
	
			thisObject = this;
			if (thisObject.timerRunning)
			{
                if(immediate) thisObject.tick();
				thisObject.timerID = setInterval(
					function()
					{
						thisObject.tick();
					}, 
					thisObject.timerInterval);
			}
		}
	};
	
	this.stopTimer = function() {
		if (this.timerRunning)
			clearInterval(thisObject.timerID);
		this.timerRunning = false;        
	};
	
	this.tick = function() {	
	};
};

/**
* Constructs a new Tooltip.
* @class Represents a tool-tip which creates a graphical tool-tip in WSO2Vis.
* @constructor
*/
wso2vis.c.Tooltip = function () {
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'ttipRRR'); // a random name to avoid conflicts. 
    this.el.style.display = 'none';
    this.el.style.width = 'auto';
    this.el.style.height = 'auto';
    this.el.style.margin = '0';
    this.el.style.padding = '5px';
    this.el.style.backgroundColor = '#ffffff';
    this.el.style.borderStyle = 'solid';
    this.el.style.borderWidth = '1px';
    this.el.style.borderColor = '#444444';
    this.el.style.opacity = 0.85;
    
    this.el.style.fontFamily = 'Fontin-Sans, Arial';
    this.el.style.fontSize = '12px';
    
    this.el.innerHTML = "<b>wso2vis</b> tooltip demo <br/> works damn fine!";    
    document.body.appendChild(this.el);    
};

wso2vis.c.Tooltip.prototype.style = function() {
    return this.el.style;
};

/**
* Shows the tool-tip in the given x y coordinates.
* @param {float} x x coordinate of the tool-tip.
* @param {float} y y coordinate of the tool-tip.
* @param {string} content content of the tool-tip.
*/
wso2vis.c.Tooltip.prototype.show = function(x, y, content) {    
	var w = this.el.style.width;
	var h = this.el.style.height;
	var deltaX = 15;
    var deltaY = 15;
	
	if ((w + x) >= (this.getWindowWidth() - deltaX)) { 
		x = x - w;
		x = x - deltaX;
	} 
	else {
		x = x + deltaX;
	}
	
	if ((h + y) >= (this.getWindowHeight() - deltaY)) { 
		y = y - h;
		y = y - deltaY;
	} 
	else {
		y = y + deltaY;
	} 
	
	this.el.style.position = 'absolute';
	this.el.style.top = y + 'px';
	this.el.style.left = x + 'px';	
	if (content != undefined) 
	    this.el.innerHTML = content;
	this.el.style.display = 'block';
	this.el.style.zindex = 1000;
};

/**
* Hides the tool-tip.
*/
wso2vis.c.Tooltip.prototype.hide = function() {
    this.el.style.display = 'none';
};

/**
* Returns current window height
* @private
*/
wso2vis.c.Tooltip.prototype.getWindowHeight = function(){
    var innerHeight;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerHeight = document.body.clientHeight;
    } 
    else {
	    innerHeight = window.innerHeight;
    }
    return innerHeight;	
};

/**
* Returns current window width
* @private
*/
wso2vis.c.Tooltip.prototype.getWindowWidth = function(){
    var innerWidth;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerWidth = document.body.clientWidth;
    } 
    else {
	    innerWidth = window.innerWidth;
    }
    return innerWidth;	
};

/**
 * Abstract Class for Providers
 * @class Provider
 * @constructor
 */
wso2vis.p.Provider = function() {
    this.drList = [];
    wso2vis.environment.providers.push(this);
    id = wso2vis.environment.providers.length - 1;
    this.getID = function() {
        return id;
    }
};

wso2vis.p.Provider.prototype.initialize = function() {
};

wso2vis.p.Provider.prototype.addDataReceiver = function(dataReceiver) {
    this.drList.push(dataReceiver);
};

wso2vis.p.Provider.prototype.pushData = function(data) {
    // loop all data receivers. Pump data to them.
    //console.log(JSON.stringify(data) + this.url);
    if (this.postValidate(this, data)) {
        for (i = 0; i < this.drList.length; i++) {
            (this.drList[i]).pushData(data);
        }
    }
};

wso2vis.p.Provider.prototype.preValidate = function(that) {
    return true;
};

wso2vis.p.Provider.prototype.postValidate = function(that, data) {
    return true;
};

wso2vis.p.Provider.prototype.errorCallback = function(phase, that, type) {
};

wso2vis.p.Provider.prototype.flowStart = function(that) {
};

wso2vis.p.Provider.prototype.pullData = function() {

};

/**
 * @class ProviderGET
 * @augments wso2vis.p.Provider
 * @constructor
 * @param {String} url The data source URL
 **/
wso2vis.p.ProviderGET = function(url, args, that) {
    this.url = url;
    this.that = that;
    this.args = args;
    this.xmlHttpReq = null;

    wso2vis.p.Provider.call(this);
};

wso2vis.extend(wso2vis.p.ProviderGET, wso2vis.p.Provider);

wso2vis.p.ProviderGET.prototype.initialize = function() {
};

wso2vis.p.ProviderGET.prototype.pullData = function() {
    this.flowStart(this);
    // Make sure the XMLHttpRequest object was instantiated
    if (this.preValidate(this)) {
        var that = this;
        if (!that.xmlHttpReq) {
            that.xmlHttpReq = this.createXmlHttpRequest();
        }
        if (that.xmlHttpReq) {
            that.xmlHttpReq.open("GET", that.getURLwithRandomParam(), true); // to prevent IE caching
            that.xmlHttpReq.onreadystatechange = function() {
                if (that.xmlHttpReq.readyState == 4) {
                    that.pushData(that.parseResponse(that.xmlHttpReq.responseText, that));
                }
            };
            that.xmlHttpReq.send(null);
        }
    }
};

wso2vis.p.ProviderGET.prototype.pullDataSync = function() {
    this.flowStart(this);
    if (this.preValidate(this)) {
        var that = this;
        if (!that.xmlHttpReq) {
            that.xmlHttpReq = this.createXmlHttpRequest();
        }

        if (that.xmlHttpReq) {
            that.xmlHttpReq.open("GET", that.getURLwithRandomParam(), false); // to prevent IE caching
            that.xmlHttpReq.send(null);
            if (that.xmlHttpReq.status == 200) {
                that.pushData(that.parseResponse(that.xmlHttpReq.responseText, that));
                return true;
            }
        }
        return false;
    }
};

wso2vis.p.ProviderGET.prototype.preValidate = function(that, url, args) {
    return true;
};

wso2vis.p.ProviderGET.prototype.parseResponse = function(response, that) {
    var resp = that.parseXml(response);
    return that.xmlToJson(resp, "  ");
};

wso2vis.p.ProviderGET.prototype.getURLwithRandomParam = function() {
    var that = this.that ? this.that : this;
    var url = this.url instanceof Function ? this.url.apply(that, this.args) : this.url;
    if (url.indexOf('?') == -1) {
        return url + '?random=' + new Date().getTime();
    }
    return url + '&random=' + new Date().getTime();
}

wso2vis.p.ProviderGET.prototype.createXmlHttpRequest = function() {
    var request;

    // Lets try using ActiveX to instantiate the XMLHttpRequest
    // object
    try {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    } catch(ex1) {
        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(ex2) {
            request = null;
        }
    }

    // If the previous didn't work, lets check if the browser natively support XMLHttpRequest
    if (!request && typeof XMLHttpRequest != "undefined") {
        //The browser does, so lets instantiate the object
        request = new XMLHttpRequest();
    }

    return request;
}

/**
 * converts xml string to a dom object
 *
 * @param {string} [xml] a xml string
 * @returns {dom} a xml dom object
 */
wso2vis.p.ProviderGET.prototype.parseXml = function(xml) {
    var dom = null;
    if (window.DOMParser) {
        try {
            dom = (new DOMParser()).parseFromString(xml, "text/xml");
        }
        catch (e) {
            dom = null;
        }
    }
    else if (window.ActiveXObject) {
        try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) // parse error ..
                window.alert(dom.parseError.reason + dom.parseError.srcText);
        }
        catch (e) {
            dom = null;
        }
    }
    else
        window.alert("oops");
    return dom;
}

/**
 * Once passed an xml dom object xmlToJson will create a corresponding JSON object.
 *
 * @param {DOM} [xml] a xml dom object
 * @param {string} [tab] an optional whitespace character to beutify the created JSON string.
 * @returns {object} a JSON object
 */
wso2vis.p.ProviderGET.prototype.xmlToJson = function(xml, tab) {
    var X = {
        toObj: function(xml) {
            var o = {};
            if (xml.nodeType == 1) {
                if (xml.attributes.length)
                    for (var i = 0; i < xml.attributes.length; i++)
                        o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                if (xml.firstChild) {
                    var textChild = 0, cdataChild = 0, hasElementChild = false;
                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType == 1) hasElementChild = true;
                        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
                        else if (n.nodeType == 4) cdataChild++;
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) {
                            X.removeWhite(xml);
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3)
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                }
                                else
                                    o[n.nodeName] = X.toObj(n);
                            }
                        }
                        else {
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    } //(hasElementChild)
                    else if (textChild) {
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    }
                    else if (cdataChild) {
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (var n = xml.firstChild; n; n = n.nextSibling)
                                o["#cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType == 9) {
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function(o, name, ind) {
            var p = name.lastIndexOf(':');
            if (p != -1) {
                if (p + 1 >= name.length)
                    name = "";
                else
                    name = name.substr(p + 1);
            }
            var json = name ? ("\"" + name + "\"") : "";
            if (o instanceof Array) {
                for (var i = 0,n = o.length; i < n; i++)
                    o[i] = X.toJson(o[i], "", ind + "\t");
                json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name && ":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
            }
            else if (typeof(o) == "string")
                json += (name && ":") + "\"" + o.toString() + "\"";
            else
                json += (name && ":") + o.toString();
            return json;
        },
        innerXml: function(node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function(n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i = 0; i < n.attributes.length; i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c = n.firstChild; c; c = c.nextSibling)
                                s += asXml(c);
                            s += "</" + n.nodeName + ">";
                        }
                        else
                            s += "/>";
                    }
                    else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c = node.firstChild; c; c = c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function(txt) {
            return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
            e.normalize();
            for (var n = e.firstChild; n;) {
                if (n.nodeType == 3) {
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    }
                    else
                        n = n.nextSibling;
                }
                else if (n.nodeType == 1) {
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
                else
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9)
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return JSON.parse("{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}");
}

/**
* @class ProviderGET
* @extends Provider
**/
wso2vis.p.ProviderGETJSON = function(url, args, that) {
	wso2vis.p.ProviderGET.call(this, url, args, that);
};

wso2vis.extend(wso2vis.p.ProviderGETJSON, wso2vis.p.ProviderGET);


wso2vis.p.ProviderGETJSON.prototype.parseResponse = function(response, that) {
    return JSON.parse(response);
};

wso2vis.p.ProviderGETJSON.prototype.initialize = function() {
};
/**
 * @class ProviderGETMakeRequest
 * @extends ProviderGET
 * @author suho@wso2.com
 **/

wso2vis.p.ProviderGETMakeRequest = function(url) {
    wso2vis.p.ProviderGET.call(this, url);
};

wso2vis.extend(wso2vis.p.ProviderGETMakeRequest, wso2vis.p.ProviderGET);

wso2vis.p.ProviderGETMakeRequest.prototype.pullData = function() {
    // Make sure the XMLHttpRequest object was instantiated
    var that = this;
    var st = new Date().getTime();

    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;

    var refreshInterval = 0;
    var sep = "?";
    if (this.url.indexOf("nocache=") < 0) {
        if (this.url.indexOf("?") > -1) {
            sep = "&";
        }
        this.url = [ this.url, sep, "nocache=", refreshInterval ].join("");
    }

    if (this.url.indexOf("randVal=") < 0) {
        if (this.url.indexOf("?") > -1) {
            sep = "&";
        }
        this.url = [ this.url, sep, "randVal=", st ].join("");
    } else {
        var urlArr = this.url.split("&");
        urlArr.pop();
        this.url = [ urlArr.join(""), "&", "randVal=", st ].join("");
    }

    gadgets.io.makeRequest(this.url, callback, params);

    function callback(resp) {
        that.parseResponse(resp, that);
    }

}

wso2vis.p.ProviderGETMakeRequest.prototype.pullDataSync = function() {
    var that = this;
    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
    var refreshInterval = 0;
    var sep = "?";
    if (this.url.indexOf("nocache=") < 0) {
        if (this.url.indexOf("?") > -1) {
            sep = "&";
        }
        this.url = [ this.url, sep, "nocache=", refreshInterval ].join("");
    }

    gadgets.io.makeRequest(this.url, callback, params);

    function callback(resp) {
        that.parseResponse(resp, that);
    }

    return false;
}

wso2vis.p.ProviderGETMakeRequest.prototype.parseResponse = function(response, that) {
    that.pushData(that.xmlToJson(response.data, "  "));
}


/** 
 * DataSubscriber 
 */
wso2vis.s.Subscriber = function() {
    this.attr = [];
    wso2vis.environment.subscribers.push(this);
    id = wso2vis.environment.subscribers.length - 1;
    this.getID = function() {
        return id;
    };
};

wso2vis.s.Subscriber.prototype.property = function(name) {
    /*
    * Define the setter-getter globally
    */
    wso2vis.s.Subscriber.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

/**
 * Set data to the subscriber. Providers use this method to push data to subscribers.
 *
 * @param {object} [data] a JSON object.
 */
wso2vis.s.Subscriber.prototype.pushData = function(data) {
};

/**
 * Filter
 */
wso2vis.f.Filter = function() {
    this.attr = [];
	this.dp = null;
	this.drList = [];
	wso2vis.environment.filters.push(this);
    id = wso2vis.environment.filters.length - 1;
    this.getID = function() {return id;}
};

wso2vis.f.Filter.prototype.property = function(name) {
    /*
    * Define the setter-getter globally
    */
    wso2vis.f.Filter.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

wso2vis.f.Filter.prototype.dataProvider = function(dp) {
	this.dp = dp;
	this.dp.addDataReceiver(this);
	return;
};

wso2vis.f.Filter.prototype.addDataReceiver = function(dr) {
	this.drList.push(dr);
};

wso2vis.f.Filter.prototype.pushData = function(data) {
	var filteredData = this.filterData(data);
	for (i = 0; i < this.drList.length; i++) {
		(this.drList[i]).pushData(filteredData); 
	}
};

wso2vis.f.Filter.prototype.pullData = function() {
	this.dp.pullData();
};

wso2vis.f.Filter.prototype.filterData = function(data) {
	return data;
};

wso2vis.f.Filter.prototype.traverseToDataField = function (object, dataFieldArray) {
	var a = object;					
	for (var i = 0; i < dataFieldArray.length; i++) {
		a = a[dataFieldArray[i]];
	}
	return a;
};
/**
* Constructs a new BasicFilter.
* @class Represents a basic filter.
* @augments wso2vis.f.Filter
* @param {dataField} dataField the data field string.
* @param {dataLabel} dataLabel the data label string.
* @param {filterArray} filterArray the filter array.
* @constructor
*/
wso2vis.f.BasicFilter = function(dataField, dataLabel, filterArray) {
	wso2vis.f.Filter.call(this);

    this.dataField(dataField)
        .dataLabel(dataLabel)
	    .filterArray(filterArray);

    /* @private */
    this.remainingArray = [];
};

wso2vis.extend(wso2vis.f.BasicFilter, wso2vis.f.Filter);

/* Define all properties. */
wso2vis.f.BasicFilter.prototype
    .property("dataField")
    .property("dataLabel")
    .property("filterArray");

/**
* @private Filters data from the data object.
* @param {data} data the data object.
*/
wso2vis.f.BasicFilter.prototype.filterData = function(data) {	
    function getLbl(obj, dataLabel, x, that) {
        var r;
        if (obj instanceof Array) {
            r = obj[x];
        }
        else {
            r = obj;
        }
        return that.traverseToDataField(r, dataLabel);
    }
	    
	function filter(object, dataLabel, filterArray, that) {	    
	    var dcount = 1;
	    if (object instanceof Array)
	        dcount = object.length;
	    
	    if ((filterArray === undefined) || (filterArray == null)) {
	        var arr = [];
	         
	        for (var i = dcount - 1; i >= 0; i--) {
				arr.push(getLbl(object, dataLabel, i, that));
			}
			return {rem:[], fil:arr, isObj:false};					    
	    }
	    else {
	        remainingArray = [];
			var isObj = false;
		    for (var i = dcount - 1; i >= 0; i--) {
			    var found = false;
			    var label = getLbl(object, dataLabel, i, that);
			    for (var j = 0; j < filterArray.length; j++) {
				    if (label == filterArray[j]) {
					    found  = true;
					    break;
				    }							
			    }
			    if (!found) {				
				    remainingArray.push(label);
				    if (object instanceof Array)
				        object.splice(i, 1); // not found! remove from the object				
				    else {
				        isObj = true;
				    }
			    }			
		    }
		    return {rem:remainingArray, fil:filterArray, isObj:isObj};
	    }
	}
	
	function sortthem(object, dataLabel, filterArray, that) {
	    if ((filterArray === undefined) || (filterArray == null)) {
	        return;
	    }
	    var dcount = 1;
	    if (object instanceof Array)
	        dcount = object.length;
	        
		var index = 0;
		for (var i = 0; i < filterArray.length; i++) {
			for (var j = 0; j < dcount; j++) {
			    var label = getLbl(object, dataLabel, j, that);
				if (label == filterArray[i]) {
					if (index != j) {
						var temp = object[index];
						object[index] = object[j];
						object[j] = temp;
					}
					index++;
					break;
				}														
			}
		}
	}

    
	var cloned = JSON.parse(JSON.stringify(data)); //eval (data.toSource());				
	var filtered = wso2vis.fn.traverseToDataField(cloned, this.dataField());
	var result = filter(filtered, this.dataLabel(), this.filterArray(), this);
	this.remainingArray = result.rem;
	this.filterArray(result.fil);
	if (result.isObj) {
		wso2vis.fn.traverseNKillLeaf(cloned, this.dataField());
	}
	else {
		sortthem(filtered, this.dataLabel(), this.filterArray(), this);
	}

	return cloned;
};
/**
* Constructs a new CallbackFilter.
* @class Represents a filter which uses a callback function to filter data.
* @augments wso2vis.f.Filter
* @param {callback} callback callback function to filter data.
* @constructor
*/
wso2vis.f.CallbackFilter = function(callback) {
	wso2vis.f.Filter.call(this);
    this.callback(callback);
};

wso2vis.extend(wso2vis.f.CallbackFilter, wso2vis.f.Filter);

/* Define all properties. */
wso2vis.f.CallbackFilter.prototype
    .property("callback");

/**
* @private Filters data from the data object.
* @param {data} data the data object.
*/
wso2vis.f.CallbackFilter.prototype.filterData = function(data) {	
    return this.callback().call(this, data);
};

/**
 * @class Select
 * @extends Form
 */
wso2vis.f.form.Select = function() { //canvas, selectID, onChangeFuncStr, dataField, key, value, defaultText) {
    wso2vis.f.BasicFilter.call(this);
    this.defaultText("default");
    this.filterArray([]);
    /* @private */
	this.dirty = true;
};

wso2vis.extend(wso2vis.f.form.Select, wso2vis.f.BasicFilter);

wso2vis.f.form.Select.prototype
    .property("canvas")
    .property("dataField")
    .property("dataLabel")
    .property("dataValue")
    .property("defaultText");

wso2vis.f.form.Select.prototype.invalidate = function() {
    this.dirty = true;
}

/*wso2vis.f.form.Select.prototype.filterData = function(data) {
    if (this.dirty) {
        this.dirty = false;
        
        
        
    }
    this.superclass.filterData(data);
};*/

wso2vis.f.form.Select.prototype.create = function() {
    var newElementHTML = '<select id="wso2visSelect_'+this.getID()+'" onchange="wso2vis.fn.selectFormChanged('+this.getID()+');">';    
    if ((this.filterArray() !== undefined) && (this.filterArray() !== null) && (this.filterArray().length > 0)) {
        newElementHTML += '<option value="' + this.defaultText() + '">' + this.defaultText() + '</option>';
        newElementHTML += '<option value="' + this.filterArray()[0] + '" selected>' + this.filterArray()[0] + '</option>';        
    }
    else {
        newElementHTML += '<option value="' + this.defaultText() + '" selected>' + this.defaultText() + '</option>';
    }    
    if (this.remainingArray !== null && this.remainingArray.length > 0) {
        for (var x = 0; x < this.remainingArray.length; x++) {
            newElementHTML += '<option value="' + this.remainingArray[x] + '">' + this.remainingArray[x] + '</option>'
        }
    }    
    newElementHTML += '</select>';
    return newElementHTML;
};

wso2vis.f.form.Select.prototype.load = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = this.create();};
wso2vis.f.form.Select.prototype.unload = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = "";};

wso2vis.f.form.Select.prototype.onChange = function(text) {    
};

wso2vis.fn.selectFormChanged = function(id) {
    var filter = wso2vis.fn.getFilterFromID(id);
    var elem = document.getElementById("wso2visSelect_"+id);      
    filter.filterArray([]);
    if (elem[elem.selectedIndex].text != filter.defaultText())
        filter.filterArray().push(elem[elem.selectedIndex].text);   
    filter.onChange(elem[elem.selectedIndex].text);  
};
/**
* FilterForm 
*/
wso2vis.f.form.FilterForm = function() {
	wso2vis.f.BasicFilter.call(this);
};

wso2vis.extend(wso2vis.f.form.FilterForm, wso2vis.f.BasicFilter);

wso2vis.f.form.FilterForm.prototype.property("canvas");

wso2vis.f.form.FilterForm.prototype.create = function() {
    var i = 0;
    var content;
    content = '<form>' +
    '<table width="100%" border="0">' +
    '<tr>' +
    '  <td width="13%" rowspan="4"><select name="FilterFormList1_'+this.getID()+'" id="FilterFormList1_'+this.getID()+'" size="10" style="width: 110px">';
    for (i = 0; i < this.remainingArray.length; i++) {
        if (i == 0)
            content += '<option value="'+i+'" selected>' + this.remainingArray[i] +'</option>';
        else 
            content += '<option value="'+i+'">' + this.remainingArray[i] +'</option>';
    }
    content += '  </select></td>' +
    '  <td width="6%">&nbsp;</td>' +
    '  <td width="14%" rowspan="4"><select name="FilterFormList2_'+this.getID()+'" id="FilterFormList2_'+this.getID()+'" size="10" style="width: 110px">';
    if (this.filterArray() !== undefined) {
        for (i = 0; i < this.filterArray().length; i++) {
            if (i == 0)
                content += '<option value="'+i+'" selected>' + this.filterArray()[i] +'</option>';
            else 
                content += '<option value="'+i+'">' + this.filterArray()[i] +'</option>';
        }
    }
    content += '  </select></td>' +
    '  <td width="7%">&nbsp;</td>' +
    '  <td width="60%" rowspan="4">&nbsp;</td>' +
    '</tr>' +
    '<tr>' +
    '  <td><div align="center">' +
    '    <input type="button" name="buttonLeft" id="buttonLeft" value="Add" style="width: 50px" onclick="FilterFormButtonLeft('+this.getID()+');"/>' +
    '  </div></td>' +
    '  <td><div align="center">' +
    '      <input type="button" name="buttonUp" id="buttonUp" value="Up" style="width: 50px" onclick="FilterFormButtonUp('+this.getID()+');"/>' +
    '  </div></td>' +
    '</tr>' +
    '<tr>' +
    '  <td><div align="center">' +
    '    <input type="button" name="buttonRight" id="buttonRight" value="Remove" style="width: 50px" onclick="FilterFormButtonRight('+this.getID()+');"/>' +
    '  </div></td>' +
    '  <td><div align="center">' +
    '      <input type="button" name="buttonDown" id="buttonDown" value="Down" style="width: 50px" onclick="FilterFormButtonDown('+this.getID()+');"/>' +
    '  </div></td>' +
    '</tr>' +
    '<tr>' +
    '  <td>&nbsp;</td>' +
    '  <td>&nbsp;</td>' +
    '</tr>' +
    '<tr>' +
    '  <td colspan="5">' +
    '    <input type="button" name="buttonApply" id="buttonApply" value="Apply" style="width: 50px"  onclick="FilterFormButtonApply('+this.getID()+')"/>' +
    '    <input type="button" name="buttonCancel" id="buttonCancel" value="Cancel" style="width: 50px"  onclick="FilterFormButtonCancel('+this.getID()+')"/></td>' +
    '</tr>' +
    '</table>' +
    '</form>';
    
    return content;
}

wso2vis.f.form.FilterForm.prototype.load = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = this.create();};
wso2vis.f.form.FilterForm.prototype.unload = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = "";};

wso2vis.f.form.FilterForm.prototype.onApply = function(data) {    
};

wso2vis.f.form.FilterForm.prototype.create.onCancel = function() {
};

FilterFormButtonUp = function(id) {
	FilterFormItemMoveWithin(true, "FilterFormList2_"+id);
};

FilterFormButtonDown = function(id) {
	FilterFormItemMoveWithin(false, "FilterFormList2_"+id);
};

FilterFormButtonLeft = function(id) {
	FilterFormItemMoveInbetween("FilterFormList1_"+id, "FilterFormList2_"+id);
};

FilterFormButtonRight = function(id) {
	FilterFormItemMoveInbetween("FilterFormList2_"+id, "FilterFormList1_"+id);
};

FilterFormButtonApply = function(id) {
    var basicDataFilter = wso2vis.fn.getFilterFromID(id);	
    var list2Element = document.getElementById("FilterFormList2_" + id);
    var i = 0;
    basicDataFilter.filterArray([]);
    for (i = 0; i < list2Element.length; i++) {
        basicDataFilter.filterArray().push(list2Element.options[i].text);
    }    
    basicDataFilter.onApply(basicDataFilter.filterArray());
};

FilterFormButtonCancel = function(id) {
    var FilterForm = wso2vis.fn.getFilterFromID(id);
    FilterForm.onCancel();
};

FilterFormItemMoveInbetween = function(listName, listName2) {
    var src = document.getElementById(listName);
    var dst = document.getElementById(listName2);
    var idx = src.selectedIndex;
    if (idx==-1) 
        alert("You must first select the item to move.");
    else {
        var oldVal = src[idx].value;
        var oldText = src[idx].text;
        src.remove(idx);		

        var nxidx;
        if (idx>=src.length-1) 
	        nxidx=src.length-1;		
        else 
	        nxidx=idx;			
        if (src.length > 0) { 
	        src.selectedIndex = nxidx;		
        }

        var opNew = document.createElement('option');
        opNew.text = oldText;
        opNew.value = oldVal;		
        try {
	        dst.add(opNew, null); // standards compliant; doesn't work in IE
        }
        catch(ex) {
	        dst.add(opNew); // IE only
        }		
        dst.selectedIndex = dst.length - 1;	
    }
};

FilterFormItemMoveWithin = function(bDir,sName) {
    var el = document.getElementById(sName);
    var idx = el.selectedIndex
    if (idx==-1) 
        alert("You must first select the item to reorder.")
    else {
        var nxidx = idx+( bDir? -1 : 1)
        if (nxidx<0) nxidx=el.length-1
        if (nxidx>=el.length) nxidx=0
        var oldVal = el[idx].value
        var oldText = el[idx].text
        el[idx].value = el[nxidx].value
        el[idx].text = el[nxidx].text
        el[nxidx].value = oldVal
        el[nxidx].text = oldText
        el.selectedIndex = nxidx
    }
};

/**
 * @class
 * Base class for all charts
 */
wso2vis.s.chart.Chart = function (canvas, ttle, desc) {
    wso2vis.s.Subscriber.call(this);
    /* @private */
    this.title(ttle)
            .description(desc)
            .divEl(canvas)
            .tooltip(true)
            .legend(true)
            .marks(false)
            .width(600)
            .height(500)
            .titleFont("10px sans-serif")
            .labelFont("10px sans-serif")
            .legendX(0)
            .legendY(0)
            .paddingTop(25)
            .paddingLeft(10)
            .paddingRight(60)
            .paddingBottom(10);

    /* @private */
    this.data = null;
    this.formattedData = null;

    wso2vis.environment.charts.push(this);
    id = wso2vis.environment.charts.length - 1;
    this.getID = function() {
        return id;
    };
};

wso2vis.extend(wso2vis.s.chart.Chart, wso2vis.s.Subscriber);

wso2vis.s.chart.Chart.prototype
        .property("title")
        .property("description")
        .property("divEl")
        .property("msgDiv")
        .property("tooltip")
        .property("legend")
        .property("x")
        .property("y")
        .property("width")
        .property("height")
        .property("paddingTop")
        .property("paddingLeft")
        .property("paddingRight")
        .property("paddingBottom")
        .property("anchorTop")
        .property("anchorLeft")
        .property("anchorRight")
        .property("anchorBottom")
        .property("legendX")
        .property("legendY")
        .property("titleFont")
        .property("labelFont")
        .property("marks");

wso2vis.s.chart.Chart.prototype.pushData = function (d) {
    if (this.validateData(d)) {
        this.data = d;
        this.preUpdate();
        this.update();
        this.postUpdate();
    } else {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
};

wso2vis.s.chart.Chart.prototype.validateData = function (d) {
    //Check whether we have valid data or not.
    if (d === null || d === undefined) {
        return false;
    }
    else {
        return true;
    }
};

wso2vis.s.chart.Chart.prototype.update = function () {
};

wso2vis.s.chart.Chart.prototype.updateMessageDiv = function (s) {

    if (this.msgDiv() !== undefined) {
        var msgdiv = document.getElementById(this.msgDiv());
        if (msgdiv !== undefined) {
            msgdiv.innerHTML = s;
            msgdiv.style.display = "block";
        }
    }
};

wso2vis.s.chart.Chart.prototype.showMessageDiv = function () {
    if (this.msgDiv() !== undefined) {
        var msgdiv = document.getElementById(this.msgDiv());
        if (msgdiv !== undefined) {
            msgdiv.style.display = "block";
        }
    }
};

wso2vis.s.chart.Chart.prototype.hideMessageDiv = function (s) {
    if (this.msgDiv() !== undefined) {
        var msgdiv = document.getElementById(this.msgDiv());
        if (msgdiv !== undefined) {
            msgdiv.style.display = "none";
        }
    }
};

wso2vis.s.chart.Chart.prototype.messageInterceptFunction = function () {

    return "Invalid Data";
};

wso2vis.s.chart.Chart.prototype.onClick = function () {
};

wso2vis.s.chart.Chart.prototype.onTooltip = function (data) {
    return "";
};

wso2vis.s.chart.Chart.prototype.onKey = function () {
};

wso2vis.s.chart.Chart.prototype.traverseToDataField = function (object, dataFieldArray) {
    var a = object;
    try { //Try catch outside the loop TODO
        for (var i = 0; i < dataFieldArray.length; i++) {
            a = a[dataFieldArray[i]];
        }
    }
    catch (e) {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
    return a;
};

wso2vis.s.chart.Chart.prototype.getDataObject = function (dataObj, i) {
    if (dataObj instanceof Array) {
        return dataObj[i];
    }
    else {
        return dataObj;
    }
};

wso2vis.s.chart.Chart.prototype.preUpdate = function () {

};

wso2vis.s.chart.Chart.prototype.postUpdate = function () {

};

wso2vis.s.chart.Chart.prototype.show = function() {
    var divEl = document.getElementById(this.divEl());
    if (divEl !== undefined) {
        divEl.style.display = "block";
    }
};

wso2vis.s.chart.Chart.prototype.hide = function() {
    var divEl = document.getElementById(this.divEl());
    if (divEl !== undefined) {
        divEl.style.display = "none";
    }
};

//@class wso2vis.s.chart.protovis.WedgeChart : wso2vis.s.chart.Chart
//This is the custom wrapper class for axiis bar charts

//Constructor
wso2vis.s.chart.protovis.WedgeChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.labelLength(12)
        .thickness(30);

    /* @private */
    this.vis = null;
}

// this makes c.protovis.WedgeChart.prototype inherits from wso2vis.s.chart.Chart
wso2vis.extend(wso2vis.s.chart.protovis.WedgeChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.WedgeChart.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("labelLength")
    .property("thickness");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.WedgeChart.prototype.load = function (w) {
    if ( w !== undefined ) {
        this.width(w);
    }
    /*if ( h !== undefined ) { //not using height for the Wedge
        this.height(h);
    }*/
    //var r = this.width() / 2.5;

    var thisObject = this;
    
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .overflow('hidden');

    var chart = this.vis.add(pv.Panel)
        .width(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()); })
        .height(function() { return (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()); })
        .top(thisObject.paddingTop())
        .bottom(thisObject.paddingBottom())
        .left(thisObject.paddingLeft())
        .right(thisObject.paddingRight());
    
    var wedge = chart.add(pv.Wedge)
        .data(function() { return pv.normalize(thisObject.getData(thisObject)); })
        .left((thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) / 2)
        .bottom((thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()) / 2)
        .innerRadius(function() { return (((thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) / 2.5) - thisObject.thickness()); })
        .outerRadius(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) / 2.5; })
        .angle(function(d) { return (d * 2 * Math.PI); })
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    wedge.anchor("outer").add(pv.Label)
        .visible(function(d) { return (d > 0.05); })
        .textMargin(function(){ return thisObject.thickness() + 5; })
        .text(function(d) { var lbl=thisObject.getDataLabel(this.index); return (lbl.length > thisObject.labelLength() ? lbl.substring(0,thisObject.labelLength())+"..." : lbl); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle(function() { return wedge.fillStyle(); });

    wedge.anchor("center").add(pv.Label)
         .visible(function(d) { return (thisObject.marks() && (d > 0.10)); })
         .textAngle(0)
         .text(function(d) { return (d*100).toFixed() + "%"; })
         .textStyle("#fff");

    /* Legend */
/*    var legend = chart.add(pv.Panel)
        .top(function() { return thisObject.legendTop(); })
        .left(function() { return thisObject.legendLeft(); })
        .right(function() { return thisObject.legendRight(); })
        .bottom(function() { return thisObject.legendBottom(); })*/
        

    chart.add(pv.Dot)
        .data(function() { return pv.normalize(thisObject.getData(thisObject)); })
        .visible(function() { return thisObject.legend(); })
        .fillStyle(function() { return wedge.fillStyle(); })
        .right(function() { return (thisObject.width() - thisObject.legendX()); })
        .bottom(function() { return (this.index * 15) + (thisObject.height() - thisObject.legendY()); })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { var lbl=thisObject.getDataLabel(this.index); return (lbl.length > thisObject.labelLength() ? lbl.substring(0,thisObject.labelLength())+"..." : lbl); });

     this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.WedgeChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.chart.protovis.WedgeChart.prototype.populateData = function (thisObject) {

    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
    var dataGrpCount = 1;

    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    this.formattedData = pv.range(dataGrpCount).map( genDataMap );

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }
};

wso2vis.s.chart.protovis.WedgeChart.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.WedgeChart.prototype.update = function () {

    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.WedgeChart.prototype.getDataLabel = function (i) {

    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

//@class wso2vis.s.chart.protovis.PieChart : wso2vis.s.chart.WedgeChart

//Constructor
wso2vis.s.chart.protovis.PieChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.protovis.WedgeChart.call(this, canvas, chartTitle, chartDesc);
}

// this makes c.protovis.PieChart.prototype inherits from wso2vis.s.chart.WedgeChart
wso2vis.extend(wso2vis.s.chart.protovis.PieChart, wso2vis.s.chart.protovis.WedgeChart);

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.PieChart.prototype.load = function (w) {
    if ( w !== undefined ) {
        this.width(w);
    }
    /*if ( h !== undefined ) { //not using height for the Wedge
        this.height(h);
    }*/
    //var r = this.width() / 2.5;

    var thisObject = this;
    
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });
    
    var chart = this.vis.add(pv.Panel)
        .width(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()); })
        .height(function() { return (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()); })
        .top(thisObject.paddingTop())
        .bottom(thisObject.paddingBottom())
        .left(thisObject.paddingLeft())
        .right(thisObject.paddingRight());
    
    var wedge = chart.add(pv.Wedge)
        .data(function() { return pv.normalize(thisObject.getData(thisObject)); })
        .left((thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) / 2)
        .bottom((thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()) / 2)
        .innerRadius(0)
        .outerRadius(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) / 2.5; })
        .angle(function(d) { return (d * 2 * Math.PI); })
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    wedge.anchor("center").add(pv.Label)
         .visible(function(d) { return (thisObject.marks() && (d > 0.10)); })
         .textAngle(0)
         .text(function(d) { return (d*100).toFixed() + "%"; })
         .textStyle("#fff");

	//wedge.anchor("end").add(pv.Label)
		//.visible(function(d) { return (d > 0.05); })
		//.textMargin(0) //function(){ return thisObject.thickness() + 5; }
		//.text(function(d) { var lbl=thisObject.getDataLabel(this.index); return (lbl.length > thisObject.labelLength() ? lbl.substring(0,thisObject.labelLength())+"..." : lbl); })
		//.font(function() { return thisObject.labelFont(); });
//		.textStyle(function() { return wedge.fillStyle(); });

    /* Legend */
/*    var legend = chart.add(pv.Panel)
        .top(function() { return thisObject.legendTop(); })
        .left(function() { return thisObject.legendLeft(); })
        .right(function() { return thisObject.legendRight(); })
        .bottom(function() { return thisObject.legendBottom(); })*/
        

    chart.add(pv.Dot)
        .data(function() { return pv.normalize(thisObject.getData(thisObject)); })
        .visible(function() { return thisObject.legend(); })
        .fillStyle(function() { return wedge.fillStyle(); })
        .right(function() { return (thisObject.width() - thisObject.legendX()); })
        .bottom(function() { return (this.index * 15) + (thisObject.height() - thisObject.legendY()); })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.index); });

     this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

//Class c.protovis.BarChart : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.protovis.BarChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;

    this.legendText("Data 1");
}

// this makes c.protovis.BarChart.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.protovis.BarChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.BarChart.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix")
    .property("titleTop")
    .property("titleLeft")
    .property("titleRight")
    .property("titleBottom")
    .property("xTitle")
    .property("yTitle")
    .property("legendText")
    .property("segmentBorderColor");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.BarChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, 1).range(0, this.width());
    this.y = pv.Scale.ordinal(pv.range(3)).splitBanded(0, this.height(), 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });

    var chart = this.vis.add(pv.Panel)
        .width(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()); })
        .height(function() { return (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()); })
        .top(thisObject.paddingTop())
        .bottom(thisObject.paddingBottom())
        .left(thisObject.paddingLeft())
        .right(thisObject.paddingRight());

    /* Draw Bars */
    var bar = chart.add(pv.Bar)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return thisObject.y(this.index); })
        .height(function() { return thisObject.y.range().band; })
        .width(thisObject.x)
        .left(0)
        //.strokeStyle("rgba(15, 55, 90, .9)")
        .fillStyle("rgba(31, 119, 180, 1)")
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
    
    /* marks */
    bar.anchor("right").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .textMargin(5)
        .text(function(d) { return d; });

    /* legend */
    chart.add(pv.Dot)
        .data(function() { return [thisObject.legendText()]; })
        .visible(function() { return thisObject.legend(); })
        .left(function() { return thisObject.legendX(); })
        .top(function() { return thisObject.legendY(); })
        .fillStyle(function() { return bar.fillStyle(); })
        .size(20)
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label);

    bar.anchor("left").add(pv.Label)
        .textMargin(5)
        .textAlign("right")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgb(0,0,0)");
     
    chart.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.3)" : "rgba(128,128,128,.8)"); })
      .add(pv.Rule)
        .bottom(0)
        .height(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgb(0,0,0)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.BarChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.chart.protovis.BarChart.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );

    
    var maxVal = thisObject.formattedData.max();
    if (maxVal < 5) maxVal = 5; // fixing value repeating issue.

    thisObject.x.domain(0, maxVal).range(0, (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) );
    thisObject.y.domain(pv.range(dataGrpCount)).splitBanded(0, (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()), 4/5);

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }
};

wso2vis.s.chart.protovis.BarChart.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.BarChart.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.BarChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

//Class c.protovis.ClusteredBarChart : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.protovis.ClusteredBarChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.ySuffix("")
        .xSuffix("");

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
    this.dataFieldCount = 1;
    this.subDataFieldCount = 1;
    this.maxDataValue = 50;
}

// this makes c.protovis.ClusteredBarChart.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.ClusteredBarChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.ClusteredBarChart.prototype
    .property("dataField")
    .property("dataLabel")
    .property("subDataField")
    .property("subDataValue")
    .property("subDataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.ClusteredBarChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, this.maxDataValue).range(0, this.width());
    this.y = pv.Scale.ordinal(pv.range(this.dataFieldCount)).splitBanded(0, this.height(), 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });

    var chart = this.vis.add(pv.Panel)
        .width(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()); })
        .height(function() { return (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()); })
        .top(thisObject.paddingTop())
        .bottom(thisObject.paddingBottom())
        .left(thisObject.paddingLeft())
        .right(thisObject.paddingRight());
     
    var bar = chart.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return thisObject.y(this.index); })
      .add(pv.Bar)
        .data(function(a) { return a; })
        .top(function() { return (this.index * thisObject.y.range().band / thisObject.subDataFieldCount); })
        .height(function() { return (thisObject.y.range().band / thisObject.subDataFieldCount); })
        .left(0)
        .width(thisObject.x)
        .fillStyle(pv.Colors.category20().by(pv.index))
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onTooltip(dataObj, this.index);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onClick(dataObj, this.index);
            }
        });
    
    /* marks */
    bar.anchor("right").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .text(function(d) { return d; });
     
    chart.add(pv.Label)
        .data(function() { return pv.range(thisObject.dataFieldCount); })
        .left(0)
        .top(function() { return (thisObject.y(this.index) + thisObject.y.range().band / 2); })
        .textMargin(5)
        .textAlign("right")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgb(0,0,0)");
     
    chart.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.3)" : "rgba(128,128,128,.8)"); })
      .add(pv.Rule)
        .bottom(0)
        .height(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgb(0,0,0)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.ClusteredBarChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.populateData = function (thisObject) {

    var tmpMaxValHolder = [];
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.subDataFieldCount = 1;
    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );
    thisObject.dataFieldCount = dataGrpCount;
    thisObject.maxDataValue = tmpMaxValHolder.max() + 5; //to keep bars inside the ruler
    if (thisObject.maxDataValue < 5) thisObject.maxDataValue = 5; // fixing value repeating issue.

    thisObject.x.domain(0, thisObject.maxDataValue).range(0, (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()));
    thisObject.y.domain(pv.range(thisObject.dataFieldCount)).splitBanded(0, (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()), 4/5);

    function genDataMap(x) {
        var innerArray = [];

        var rootObja;
        if( _dataField instanceof Array ) {
            rootObja = _dataField[x];
        }
        else {
            rootObja = _dataField;
        }

        var _subDataField = thisObject.traverseToDataField(rootObja, thisObject.subDataField());

        var subDataGrpCount = 1;
        if( _subDataField instanceof Array ) {
            subDataGrpCount = _subDataField.length;
            thisObject.subDataFieldCount = (thisObject.subDataFieldCount < _subDataField.length) ? _subDataField.length : thisObject.subDataFieldCount;
        }

        for(var y=0; y<subDataGrpCount; y++) {
            var rootObjb;
            if( _subDataField instanceof Array ) {
                rootObjb = _subDataField[y];
            }
            else {
                rootObjb = _subDataField;
            }
            var temp = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.subDataValue()));
            innerArray.push(temp);
        }
        tmpMaxValHolder.push(innerArray.max());
        return innerArray;
    }
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.update = function () {

    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

wso2vis.s.chart.protovis.ClusteredBarChart.prototype.getSubDataLable = function (i, j) {
    if (this.data !== null){
        var rootDataObj;
        var _dataField = this.traverseToDataField(this.data, this.dataField());

        if( _dataField instanceof Array ) {
            rootDataObj = _dataField[i];
        }
        else {
            rootDataObj = _dataField;
        }

        var rootSubDataObj = this.traverseToDataField(rootDataObj, this.subDataField());

        if( rootSubDataObj instanceof Array ) {
            return this.traverseToDataField(rootSubDataObj[j], this.subDataLabel());
        }
        else {
            return this.traverseToDataField(rootSubDataObj, this.subDataLabel());
        }
    }
    return j;
};

//Class c.protovis.ColumnChart : Chart
//This is the custom wrapper class for protovis column charts

//Constructor
wso2vis.s.chart.protovis.ColumnChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.ySuffix("")
        .xSuffix("");

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
}

// this makes c.protovis.ColumnChart.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.protovis.ColumnChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.ColumnChart.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.ColumnChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var n = 3;
    var thisObject = this;

    this.y = pv.Scale.linear(0, 1).range(0, this.height());
    this.x = pv.Scale.ordinal(pv.range(n)).splitBanded(0, this.width(), 4/5);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });

    var chart = this.vis.add(pv.Panel)
        .width(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()); })
        .height(function() { return (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()); })
        .top(thisObject.paddingTop())
        .bottom(thisObject.paddingBottom())
        .left(thisObject.paddingLeft())
        .right(thisObject.paddingRight());
     
    var bar = chart.add(pv.Bar)
        .data(function() { return thisObject.getData(thisObject); })
        .left(function() { return thisObject.x(this.index); })
        .width(function() { return thisObject.x.range().band; })
        .bottom(0)
        .height(thisObject.y)
        .title(function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() { 
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
     
    bar.anchor("top").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .textMargin(5)
        .text(function(d) { return d; });

    bar.anchor("bottom").add(pv.Label)
        .textMargin(10)
        .textBaseline("top")
        .textAngle(Math.PI / 2)
        .textAlign("left")
        .text(function() { return thisObject.getDataLabel(this.index); })
        .font(function() { return thisObject.labelFont(); });
        /*.add(pv.Bar).fillStyle("rgba(128,128,128,0.1)").height(6);*/
     
    chart.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.5)" : "#000"); })
      .add(pv.Rule)
        .left(0)
        .width(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("left").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); });

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.ColumnChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

wso2vis.s.chart.protovis.ColumnChart.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );

    
    var maxVal = thisObject.formattedData.max() + 5; //to make sure the bars are inside the rule
    if (maxVal < 5) maxVal = 5; // fixing value repeating issue.

    this.y.domain(0, maxVal).range(0, (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()));
    this.x.domain(pv.range(dataGrpCount)).splitBanded(0, (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()), 4/5);
    
    var maxLabelLength = (maxVal == 0) ? 1 : Math.floor(Math.log(maxVal)/Math.log(10)) + 1; //TODO: maxheight will never become 0. But we check it just to be in the safe side. useless?
    this.vis.left((maxLabelLength*9.5)+5);

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }
};

wso2vis.s.chart.protovis.ColumnChart.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.ColumnChart.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.ColumnChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

//Class c.protovis.ClusteredColumnChart : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.protovis.ClusteredColumnChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.ySuffix("")
        .xSuffix("");

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
    this.dataFieldCount = 1;
    this.subDataFieldCount = 1;
    this.maxDataValue = 50;
}

// this makes c.protovis.ClusteredColumnChart.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.ClusteredColumnChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype
    .property("dataField")
    .property("dataLabel")
    .property("subDataField")
    .property("subDataValue")
    .property("subDataLabel")
    .property("ySuffix")
    .property("xSuffix")
    .property("dataLabelLength")
    .property("dataLabelAngle");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.y = pv.Scale.linear(0, this.maxDataValue).range(0, this.height());
    this.x = pv.Scale.ordinal(pv.range(this.dataFieldCount)).splitBanded(0, this.width(), 4/5);

    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });

    var chart = this.vis.add(pv.Panel)
        .width(function() { return (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()); })
        .height(function() { return (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()); })
        .top(thisObject.paddingTop())
        .bottom(thisObject.paddingBottom())
        .left(thisObject.paddingLeft())
        .right(thisObject.paddingRight());

    var bar = chart.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .left(function() { return thisObject.x(this.index); })
      .add(pv.Bar)
        .data(function(a) { return a; })
        .left(function() { return (this.index * thisObject.x.range().band / thisObject.subDataFieldCount); })
        .width(function() { return (thisObject.x.range().band / thisObject.subDataFieldCount); })
        .bottom(0)
        .height(thisObject.y)
        .fillStyle(pv.Colors.category20().by(pv.index))
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index], this.index);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    bar.anchor("top").add(pv.Label)
        .visible(function() { return thisObject.marks(); })
        .textStyle("white")
        .text(function(d) { return d; });

    chart.add(pv.Label)
        .events("all")
        .data(function() { return pv.range(thisObject.dataFieldCount); })
        .bottom(0)
        .left(function() { return thisObject.x(this.index); }) //TODO fix the alignment issue (+ thisObject.x.range().band / 2)
        .textMargin(5)
        .textBaseline("top")
        .text(function() {
            if(!thisObject.dataLabelLength()) return thisObject.getDataLabel(this.index);
            var length = thisObject.getDataLabel(this.index).substr(0, thisObject.dataLabelLength() instanceof Function ?
                            thisObject.dataLabelLength().call() : thisObject.dataLabelLength());
            return length ? length : thisObject.getDataLabel(this.index);
        })
        .title(function() {
            if(!thisObject.dataLabelLength()) return null;
            var length = thisObject.getDataLabel(this.index).substr(0, thisObject.dataLabelLength() instanceof Function ?
                            thisObject.dataLabelLength().call() : thisObject.dataLabelLength());
            return (length && length < thisObject.getDataLabel(this.index).length) ? thisObject.getDataLabel(this.index) : null;
        })
        .textAngle(thisObject.dataLabelAngle() ? thisObject.dataLabelAngle() : 0)
        .font(function() { return thisObject.labelFont(); });

    chart.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle(function(d) { return (d ? "rgba(128,128,128,.3)" : "#000"); })
      .add(pv.Rule)
        .left(0)
        .width(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("left").add(pv.Label)
        .text(function(d) { return d.toFixed(); })
        .font(function() { return thisObject.labelFont(); });

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.populateData = function (thisObject) {

    var tmpMaxValHolder = [];
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.subDataFieldCount = 1;
    thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );
    thisObject.dataFieldCount = dataGrpCount;
    thisObject.maxDataValue = tmpMaxValHolder.max();
    if (thisObject.maxDataValue < 8) thisObject.maxDataValue = 8; // fixing value repeating issue.

    thisObject.y.domain(0, thisObject.maxDataValue).range(0, (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()));
    thisObject.x.domain(pv.range(thisObject.dataFieldCount)).splitBanded(0, (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()), 4/5);

    function genDataMap(x) {
        var innerArray = [];

        var rootObja;
        if( _dataField instanceof Array ) {
            rootObja = _dataField[x];
        }
        else {
            rootObja = _dataField;
        }

        var _subDataField = thisObject.traverseToDataField(rootObja, thisObject.subDataField());

        var subDataGrpCount = 1;
        if( _subDataField instanceof Array ) {
            subDataGrpCount = _subDataField.length;
            thisObject.subDataFieldCount = (thisObject.subDataFieldCount < _subDataField.length) ? _subDataField.length : thisObject.subDataFieldCount;
        }

        for(var y=0; y<subDataGrpCount; y++) {
            var rootObjb;
            if( _subDataField instanceof Array ) {
                rootObjb = _subDataField[y];
            }
            else {
                rootObjb = _subDataField;
            }
            var temp = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.subDataValue()));
            innerArray.push(temp);
        }
        tmpMaxValHolder.push(innerArray.max());
        return innerArray;
    }
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.update = function () {

    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

wso2vis.s.chart.protovis.ClusteredColumnChart.prototype.getSubDataLable = function (i, j) {
    if (this.data !== null){
        var rootDataObj;
        var _dataField = this.traverseToDataField(this.data, this.dataField());

        if( _dataField instanceof Array ) {
            rootDataObj = _dataField[i];
        }
        else {
            rootDataObj = _dataField;
        }

        var rootSubDataObj = this.traverseToDataField(rootDataObj, this.subDataField());

        if( rootSubDataObj instanceof Array ) {
            return this.traverseToDataField(rootSubDataObj[j], this.subDataLabel());
        }
        else {
            return this.traverseToDataField(rootSubDataObj, this.subDataLabel());
        }
    }
    return j;
};

//Class AreaChart : Chart
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.AreaChart = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, div, chartTitle, chartDesc);

    this.band(12)
        .ySuffix("")
        .xSuffix("")
        .xInterval(10000)
		.dirFromLeft(true);

    /* @private */
    this.dataHistory = [];
    this.vis = null;
    this.x = null;
    this.y = null;
};

// this makes AreaChart.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.AreaChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.AreaChart.prototype
    .property("band")
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix")
    .property("xInterval")
	.property("dirFromLeft");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.AreaChart.prototype.load = function (w, h, band) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }
    if ( band !== undefined ) {
        this.band(band);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, this.band()).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); });
        //.strokeStyle("#ccc");

    var area = panel.add(pv.Area)
        .data(function(a) { return a; })
        .left(function(d) 
			  {
				  if (thisObject.dirFromLeft())
				  	 return thisObject.x(this.index);
			      return thisObject.x((thisObject.dataHistory[this.parent.index].length <= thisObject.band()) ? (thisObject.band() - thisObject.dataHistory[this.parent.index].length) + this.index + 1: this.index); 
			  })
        .bottom(0)//pv.Layout.stack())
        .height(function(d) { return thisObject.y(d); })
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    var areaDot = area.anchor("top").add(pv.Dot).title(function(d) { return d; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle("#fff")
        .size(10);
        //.add(pv.Label);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return area.fillStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    /* Vertical Grid Lines */
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        //.visible(function(d) { return (d > 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        //.strokeStyle("rgba(128,128,128,.1)")
      //.add(pv.Rule)
        .bottom(-2)
        .height(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("bottom").add(pv.Label)
        .textMargin(10)
        .text(function(d) { var n = new Number(((thisObject.dirFromLeft())? d : thisObject.band() - d) * thisObject.xInterval() / 1000); return n.toFixed() + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgb(0,0,0)");
    
    /* Horizontal Grid Lines */
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        //.visible(function() { return !(this.parent.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
        //.strokeStyle(function(d) { return (d==12) ? "green" : "rgba(128,128,128,.2)"; })
      .add(pv.Rule)
        .left(-5)
        .width(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("left").add(pv.Label)
        .textMargin(10)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgb(0,0,0)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.AreaChart.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private 
*/
wso2vis.s.chart.protovis.AreaChart.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map(genDataMap);

    thisObject.x.domain(0, thisObject.band()).range(0,thisObject.width());
    var maxheight = calcMaxHeight();
    if (maxheight < 5) maxheight = 5; // fixing value repeating issue.
    thisObject.y.domain(0, maxheight).range(0, (thisObject.height() * thisObject.titleSpacing()) - 35);
    thisObject.y.nice();
    
    var maxLabelLength = (maxheight == 0) ? 1 : Math.floor(Math.log(maxheight)/Math.log(10)) + 1; //TODO: maxheight will never become 0. But we check it just to be in the safe side. useless?
    this.vis.left((maxLabelLength*9.5)+10);
    
    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        var valObj = parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));

        if (thisObject.dataHistory[x] === undefined){
            thisObject.dataHistory[x] = new Array();
        }
		if (thisObject.dirFromLeft()) {
			thisObject.dataHistory[x].unshift(valObj);

			if(thisObject.dataHistory[x].length > thisObject.band()+1){
				thisObject.dataHistory[x].pop();
			}
		}
		else {
			thisObject.dataHistory[x].push(valObj);

			if(thisObject.dataHistory[x].length > thisObject.band()+1){
				thisObject.dataHistory[x].shift();
			}
		}
        return thisObject.dataHistory[x];
    }

    function calcMaxHeight() {
        var totHeights = [];
        for (var k=0; k<thisObject.dataHistory.length; k++) {
            totHeights.push(thisObject.dataHistory[k].max());
        }
        return totHeights.max();
    }
};

wso2vis.s.chart.protovis.AreaChart.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.AreaChart.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.AreaChart.prototype.getDataLabel = function (i) {
    if (this.data !== null){
        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

wso2vis.s.chart.protovis.AreaChart.prototype.clear = function () {
    this.dataHistory.length = 0;
};

//Class AreaChart2 : Chart
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.AreaChart2 = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, div, chartTitle, chartDesc);

    this.band(12)
        .xSuffix("")
        .ySuffix("");

    /* @private */
    this.vis = null;
    this.x = null;
    this.y = null;
    this.customXticks = null;
};

// this makes AreaChart2.prototype inherit from Chart
wso2vis.extend(wso2vis.s.chart.protovis.AreaChart2, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.AreaChart2.prototype
    .property("dataField")
    .property("subDataField")
    .property("xDataValue")
    .property("yDataValue")
    .property("dataLabel")
    .property("xSuffix")
    .property("ySuffix")
    .property("xLabel")
    .property("band");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.AreaChart2.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, 4).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
    this.customXticks = [];
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .data(function() { return thisObject.getData(thisObject); })
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .strokeStyle("#ccc");

    var area = panel.add(pv.Area)
        .data(function(a) { return a; })
        .left(function(d) { return thisObject.x(d.x); })
        .bottom(0)//pv.Layout.stack())
        .height(function(d) { return thisObject.y(d.y); })
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });

    var areaDot = area.anchor("top").add(pv.Dot).title(function(d) { return d.y; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle("#fff")
        .size(10);
        //.add(pv.Label);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return area.fillStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.customXticks; /*thisObject.x.ticks();*/ })
        .visible(function(d) { return (d > 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .anchor("bottom").add(pv.Label)
        .text(function(d) { return d.toFixed() + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        .visible(function() { return !(this.parent.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .anchor("left").add(pv.Label)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.AreaChart2.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private 
*/
wso2vis.s.chart.protovis.AreaChart2.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
    var tempDataArray = [];

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }

    thisObject.formattedData = pv.range(dataGrpCount).map(genDataMap);
    var xMax = 0;
    var xMin = Infinity;

    for (var x=0; x<thisObject.formattedData.length; x++) {
        var dataSet = thisObject.formattedData[x];
        for (var y=0; y<dataSet.length; y++) {
            xMax = (xMax < dataSet[y].x) ? dataSet[y].x : xMax;
            xMin = (xMin > dataSet[y].x) ? dataSet[y].x : xMin;
            //TODO clean up this. we need only one data set
            thisObject.customXticks[y] = dataSet[y].x;
        }
    }

    var maxheight = tempDataArray.max();
    if (maxheight < 5) maxheight = 5; // fixing value repeating issue.
    if (thisObject.xDataValue() === undefined) {
        thisObject.x.domain(0, thisObject.band()).range(0, this.width());
    }
    else {
        //thisObject.x.domain(thisObject.formattedData[0], function(d) { return d.x; }).range(0, this.width());
        thisObject.x.domain(xMin, xMax).range(0, this.width());
    }
    thisObject.y.domain(0, maxheight).range(0, (thisObject.height() * thisObject.titleSpacing()) - 35);
    thisObject.y.nice();
    
    function genDataMap(x) {
        var innerArray = [];
        var rootObja;
        if( _dataField instanceof Array ) {
            rootObja = _dataField[x];
        }
        else {
            rootObja = _dataField;
        }

        var _subDataField = thisObject.traverseToDataField(rootObja, thisObject.subDataField());

        var subDataGrpCount = 1;
        if( _subDataField instanceof Array ) {
            subDataGrpCount = _subDataField.length;
        }

        for(var y=0; y<subDataGrpCount; y++) {
            var rootObjb;
            if( _subDataField instanceof Array ) {
                rootObjb = _subDataField[y];
            }
            else {
                rootObjb = _subDataField;
            }

            var valObjY = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.yDataValue()));
            tempDataArray.push(valObjY);

            if (thisObject.xDataValue() === undefined) {
                innerArray.push(valObjY);
            }
            else {
                var valObjX = parseInt(thisObject.traverseToDataField(rootObjb, thisObject.xDataValue()));
                innerArray.push({ x: valObjX, y: valObjY });
            }
        }
        return innerArray;
    }
};

wso2vis.s.chart.protovis.AreaChart2.prototype.getData = function (thisObject) {
    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.AreaChart2.prototype.update = function () {
    this.populateData(this);
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.AreaChart2.prototype.getDataLabel = function (i) {
    if (this.data !== null){
        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    return i;
};

//Class c.protovis.LineChart : AreaChart
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.LineChart = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.protovis.AreaChart.call(this, div, chartTitle, chartDesc);
}

// this makes c.protovis.LineChart.prototype inherit from ProtovisStakedAreaChart
wso2vis.extend(wso2vis.s.chart.protovis.LineChart, wso2vis.s.chart.protovis.AreaChart);

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.LineChart.prototype.load = function (w, h, band) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }
    if ( band !== undefined ) {
        this.band(band);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, this.band).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .def("i", -1)
        .bottom(20)
        .top(0)
        .left(30)
        .right(10);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .data(function() { return thisObject.getData(thisObject); });

    var line = panel.add(pv.Line)
        .data(function(a) { return a; })
        //.left(function(d) { return thisObject.x(this.index); })
		.left(function(d) 
			  {
				  if (thisObject.dirFromLeft())
				  	 return thisObject.x(this.index);
			      return thisObject.x((thisObject.dataHistory[this.parent.index].length <= thisObject.band()) ? (thisObject.band() - thisObject.dataHistory[this.parent.index].length) + this.index + 1: this.index); 
			  })
        .bottom(function(d) { return thisObject.y(d); })
        .lineWidth(3)
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
    
    var lineDot = line.add(pv.Dot).title(function(d) { return d; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle(function() { return this.strokeStyle(); });
        //.add(pv.Label);

    line.add(pv.Dot).title(function(d) { return d; })
        .visible(function() { return thisObject.marks(); })
        .strokeStyle("#fff")
        .lineWidth(1);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(100)
        .fillStyle(function() { return line.strokeStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.x.ticks(); })
        //.visible(function(d) { return (d > 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .add(pv.Rule)
        .bottom(-2)
        .height(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("bottom").add(pv.Label)
        .textMargin(10)
        .text(function(d) { var n = new Number(((thisObject.dirFromLeft())? d : thisObject.band() - d) * thisObject.xInterval() / 1000); return n.toFixed() + thisObject.xSuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        //.visible(function() { return !(this.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .add(pv.Rule)
        .left(-5) //TODO right(5)
        .width(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("left").add(pv.Label) //TODO right
        .textMargin(10)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

//Class c.protovis.LineChart2 : AreaChart2
//This is the custom wrapper class for protovis area/line charts

//Constructor
wso2vis.s.chart.protovis.LineChart2 = function(div, chartTitle, chartDesc) {
    wso2vis.s.chart.protovis.AreaChart2.call(this, div, chartTitle, chartDesc);
}

// this makes c.protovis.LineChart2.prototype inherit from ProtovisStakedAreaChart
wso2vis.extend(wso2vis.s.chart.protovis.LineChart2, wso2vis.s.chart.protovis.AreaChart2);

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.LineChart2.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    }

    var thisObject = this;

    this.x = pv.Scale.linear(0, 4).range(0, this.width());
    this.y = pv.Scale.linear(0, 50).range(0, this.height()*0.9);
    this.customXticks = [];
 
    this.vis = new pv.Panel()
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); })
        .def("i", -1)
        .bottom(160)
        .top(0)
        .left(30)
        .right(60);

    var panel = this.vis.add(pv.Panel)
        .top(function() { return (thisObject.height() * (1 - thisObject.titleSpacing())); })
        .height(function() { return (thisObject.height() * thisObject.titleSpacing()); })
        .data(function() { return thisObject.getData(thisObject); });

    var line = panel.add(pv.Line)
        .data(function(a) { return a; })
        .left(function(d) { return thisObject.x(d.x); })
        .bottom(function(d) { return thisObject.y(d.y); })
        .lineWidth(3)
        .title(function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onTooltip(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onTooltip(dataObj);
            }
        })
        .event("click", function() {
            var dataObj = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
            if( dataObj instanceof Array ) {
                return thisObject.onClick(dataObj[this.parent.index]);
            }
            else {
                return thisObject.onClick(dataObj);
            }
        });
    
    var lineDot = line.add(pv.Dot).title(function(d) { return d.y; })
        .visible(function() { return thisObject.marks(); })
        .fillStyle(function() { return this.strokeStyle(); });
        //.add(pv.Label);

    line.add(pv.Dot).title(function(d) { return d.y; })
        .visible(function() { return thisObject.marks(); })
        .strokeStyle("#fff")
        .lineWidth(1);

    /* Legend */
    panel.add(pv.Dot)
        .visible(function() { return thisObject.legend(); })
        .right(150)
        .fillStyle(function() { return line.strokeStyle(); })
        .bottom(function() { return (this.parent.index * 15) + 10; })
        .size(20) 
        .lineWidth(1)
        .strokeStyle("#000")
      .anchor("right").add(pv.Label)
        .text(function() { return thisObject.getDataLabel(this.parent.index); });
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.customXticks; /*thisObject.x.ticks()*/ })
        .visible(function(d) { return (d >= 0); })
        .left(function(d) { return (Math.round(thisObject.x(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.1)")
      .add(pv.Rule)
        .bottom(-2)
        .height(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("bottom").add(pv.Label)
        .textMargin(5)
        .textBaseline("top")
        .textAlign("left")
        .textAngle(Math.PI / 3)
        /*.text(function(d) { return thisObject.formatDataLabel( thisObject.traverseToDataField(thisObject.traverseToDataField(thisObject.traverseToDataField(thisObject.data, thisObject.dataField())[this.parent.index], thisObject.subDataField())[this.index], thisObject.xLabel()) ) + thisObject.xSuffix(); })*/
        .text(function(d) { return thisObject.getXDataLabel(this.parent.index, this.index); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");
     
    panel.add(pv.Rule)
        .data(function() { return thisObject.y.ticks(); })
        //.visible(function() { return !(this.index % 2); })
        .bottom(function(d) { return (Math.round(thisObject.y(d)) - 0.5); })
        .strokeStyle("rgba(128,128,128,.2)")
      .add(pv.Rule)
        .left(-5)
        .width(5)
        .strokeStyle("rgba(128,128,128,1)")
      .anchor("left").add(pv.Label)
        .textMargin(10)
        .text(function(d) {return d.toFixed() + thisObject.ySuffix(); })
        .font(function() { return thisObject.labelFont(); })
        .textStyle("rgba(128,128,128,0.5)");

    this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

wso2vis.s.chart.protovis.LineChart2.prototype.formatDataLabel = function (label) {

    return label;
};

wso2vis.s.chart.protovis.LineChart2.prototype.getXDataLabel = function (parentIndex, thisIndex) {

    var thisObject = this;

    var a = thisObject.getDataObject( thisObject.traverseToDataField( thisObject.data, thisObject.dataField() ), [parentIndex] );

    var b = thisObject.getDataObject( thisObject.traverseToDataField( a, thisObject.subDataField() ), [thisIndex] );

    var c = thisObject.traverseToDataField( b, thisObject.xLabel() );

    return thisObject.formatDataLabel( c ) + thisObject.xSuffix();
};

//@class wso2vis.s.chart.protovis.Sunburst : wso2vis.s.chart.Chart

//Constructor
wso2vis.s.chart.protovis.Sunburst = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    this.labelLength(12)
        .thickness(30);

    /* @private */
    this.vis = null;
    this.sunburst = null;
    this.wedge = null;

    this.flare = {
      analytics: {
        cluster: {
          AgglomerativeCluster: 3938,
          CommunityStructure: 3812,
          HierarchicalCluster: 6714,
          MergeEdge: 743
        },
        graph: {
          BetweennessCentrality: 3534,
          LinkDistance: 5731,
          MaxFlowMinCut: 7840,
          ShortestPaths: 5914,
          SpanningTree: 3416
        },
        optimization: {
          AspectRatioBanker: 7074
        }
      }
    };
}

// this makes c.protovis.Sunburst.prototype inherits from wso2vis.s.chart.Chart
wso2vis.extend(wso2vis.s.chart.protovis.Sunburst, wso2vis.s.chart.Chart);

wso2vis.s.chart.protovis.Sunburst.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("labelLength")
    .property("thickness");

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.chart.protovis.Sunburst.prototype.load = function (w) {
    if ( w !== undefined ) {
        this.width(w);
    }
    /*if ( h !== undefined ) { //not using height for the Wedge
        this.height(h);
    }*/
    var r = this.width() / 2.5;

    var thisObject = this;

    //this.sunburst = pv.Layout.sunburst(this.data).size(Number);
    
    this.vis = new pv.Panel()
        //.def("i", -1)
        .canvas(function() { return thisObject.divEl(); })
        .width(function() { return thisObject.width(); })
        .height(function() { return thisObject.height(); });
    
    this.wedge = this.vis.add(pv.Wedge)
        .extend(pv.Layout.sunburst(this.formattedData).size(function(n) { return parseInt(n); }))
        .fillStyle(pv.Colors.category10()
              .by(function(n) { return n.children ? n.keys : n.keys.slice(0, -1); }))
        .strokeStyle("#222")
          .lineWidth(1)
          //.visible(function(n) { return n.depth < 3; })
          .title(function(n) { return /*thisObject.traverseToDataField(thisObject.data, n.keys)*/ n.keys.join(".") + ": " + n.size; });
        //.anchor("center").add(pv.Label)
          //.visible(function(n) { return n.angle * n.depth > .05; })
          //.text(function(n) { return n.keys[n.keys.length - 1]; });

     this.vis.add(pv.Label)
        .left(this.width() / 2)
        .visible(function() { return !(thisObject.title() === ""); })
        .top(16)
        .textAlign("center")
        .text(function() { return thisObject.title(); })
        .font(function() { return thisObject.titleFont(); });
};

/**
* @private
*/
wso2vis.s.chart.protovis.Sunburst.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.chart.protovis.Sunburst.prototype.populateData = function (thisObject) {

    rec(this.data);
    //console.log(this.data);
    this.formattedData = this.data;

    function rec(d) {
        for( i in d ) {
            if( typeof(d[i]) == "string" && isNaN(d[i]) ) {
                d[i] = 0;
            }
            rec(d[i]);
        }
    }
};

wso2vis.s.chart.protovis.Sunburst.prototype.getData = function (thisObject) {

    return thisObject.formattedData;
};

wso2vis.s.chart.protovis.Sunburst.prototype.update = function () {

    this.populateData(this);
    this.wedge.extend(pv.Layout.sunburst(this.formattedData).size(function(n) { return parseInt(n); })); 
    //this.sunburst.size(Number);//console.log(JSON.stringify(this.data));
    this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.chart.protovis.Sunburst.prototype.getDataLable = function (i) {

    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

wso2vis.s.chart.raphael.FunnelChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);
    
    this.colscheme(20)
        .gap(4)
        .labelRelief(15)
        .labelSpan(1)
        .showPercent(true)
        .showValue(true);
}

// inherits from Chart
wso2vis.extend(wso2vis.s.chart.raphael.FunnelChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.raphael.FunnelChart.prototype
    .property("colscheme")
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("gap")
    .property("showPercent")
    .property("showValue")
    .property("labelRelief")
    .property("labelSpan");
    

wso2vis.s.chart.raphael.FunnelChart.prototype.load = function (w, h) {
    if (w !== undefined) {
        this.width(w);
    }
    if (h !== undefined) {
        this.height(h);
    }
    
    this.r = Raphael(this.divEl(), this.width(), this.height());  
    
    this.wf = this.width() / 406.01;
	this.hf = this.height() / 325.01;
	this.eh = 1007.9 * this.hf;
	this.ew = 663 * this.wf;
	this.e1x = -560 * this.wf + 5;
	this.e2x = 173 * this.wf + 5;
	this.ey = -136 * this.hf;   	
	this.fc = 139 * this.wf + 5;     
	
	return this; 
};

wso2vis.s.chart.raphael.FunnelChart.prototype.update = function () {
    this.convertData(this);
    
    var total = 0;
    
    for (var i = 0; i < this.formattedData.length; i++) {
        total += this.formattedData[i]["value"];
    }
    
    var funnelHeightRatio = (this.height()  - this.gap() * (this.formattedData.length - 1) - this.labelRelief() * this.formattedData.length) / total;        
    
    var colors = wso2vis.util.generateColors(this.formattedData.length, this.colscheme());
    
    var is_label_visible = false,
        leave_timer;
    
    var currY = 0;
    var df = this.traverseToDataField(this.data, this.dataField());    
    if (df instanceof Array) {
        df = df;
    }
    else {
        df = [df];
    }
    
    var first;
    
    for (i = 0; i < this.formattedData.length; i++) {
        var crect;
        if (i != 0) {
            this.r.rect(0, currY, this.width(), this.gap()).attr({fill:"#fff", stroke:"#fff"});          
            crect = this.r.rect(0, currY + this.gap(), this.width(), funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief()).attr({fill:colors[i], stroke:"#fff"});
            currY += this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();                
        }
        else {
            crect = this.r.rect(0, 0, this.width(), funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief()).attr({fill:colors[i], stroke:"#fff"});
            currY += funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();           
            first = this.formattedData[i]["value"];    
        }
        
        if (this.tooltip()) {
            (function (data, lbl, func, org) {
                $(crect.node).hover(function (e) {
                    clearTimeout(leave_timer);
                    var tip = func({label:lbl, value:data, total:total, first:first, raw:org});
                    wso2vis.environment.tooltip.show(e.pageX, e.pageY, tip);
                    is_label_visible = true;
                }, function () {
                    leave_timer = setTimeout(function () {
                        wso2vis.environment.tooltip.hide();
                        is_label_visible = false;
                    }, 2);
                });
            })(this.formattedData[i]["value"], this.formattedData[i]["label"], this.onTooltip, df[i]);//(this.fc - frame.attrs.width/2 , crect.attrs.y + crect.attrs.height, this.formattedData[i]["value"], this.formattedData[i]["label"]);
            
            (function (data, lbl, func, org) {
                $(crect.node).mousemove(function (e) {
                    if (is_label_visible) {
                        clearTimeout(leave_timer);
                        var tip = func({label:lbl, value:data, total:total, first:first, raw:org});
                        wso2vis.environment.tooltip.show(e.pageX, e.pageY, tip);
                    }
                });
            })(this.formattedData[i]["value"], this.formattedData[i]["label"], this.onTooltip, df[i]);//(this.fc - frame.attrs.width/2 , crect.attrs.y + crect.attrs.height, this.formattedData[i]["value"], this.formattedData[i]["label"]);
        }
    }   

    var el1 = this.r.ellipse(-560 * this.wf + 5 + 663 * this.wf / 2, -136 * this.hf + 1007.9 * this.hf / 2, 663 * this.wf / 2, 1007.9 * this.hf / 2);
    var el2 = this.r.ellipse(173 * this.wf + 5 + 663 * this.wf / 2, -136 * this.hf + 1007.9 * this.hf / 2, 663 * this.wf / 2, 1007.9 * this.hf / 2); 
    
    el1.attr({fill:"#fff", opacity:0.9, stroke:"#fff"});
    el2.attr({fill:"#fff", opacity:0.8, stroke:"#fff"});
    
    currY = 0;
    for (i = 0; i < this.formattedData.length; i++) {
        var t2;
        if (i != 0) {
            var t = this.r.text(this.width(), currY + this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), this.formattedData[i]["label"]).attr({fill:colors[i]});
            t.attr({"font-size":12});              
            var bbox = t.getBBox();
            t.translate(-bbox.width/2 - 2 * this.labelSpan(), -bbox.height/2 - this.labelSpan());
            var str = this.showValue()?this.formattedData[i]["value"]:"";
            if ((this.formattedData[0]["value"] != 0) && this.showPercent()) {
                str += "(" + (this.formattedData[i]["value"] * 100/ this.formattedData[0]["value"]).toFixed() + "%)";
            }
            t2 = this.r.text(this.fc, currY + this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), str).attr({fill:"#fff"});
            t2.attr({"font-size":10});
            bbox = t2.getBBox();
            t2.translate(0, -bbox.height/2 - this.labelSpan());
            currY += this.gap() + funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();                
        }
        else {
            var t = this.r.text(this.width(), funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), this.formattedData[i]["label"]).attr({fill:colors[i]});            
            t.attr({"font-size":12});  
            var bbox = t.getBBox();
            t.translate(-bbox.width/2 - 2 * this.labelSpan(), -bbox.height/2 - this.labelSpan());            
            var str = this.showValue()?this.formattedData[i]["value"]:"";
            if ((this.formattedData[0]["value"] != 0) && this.showPercent()) {
                str += "(" + (this.formattedData[i]["value"] * 100/ this.formattedData[0]["value"]).toFixed() + "%)";
            }
            t2 = this.r.text(this.fc, funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief(), str).attr({fill:"#fff"});
            t2.attr({"font-size":10});
            bbox = t2.getBBox();
            t2.translate(0, -bbox.height/2 - this.labelSpan());
            currY += funnelHeightRatio * this.formattedData[i]["value"] + this.labelRelief();                
        }
    }   
    this.r.rect(0, 0, this.width()-1, this.height()-1);
};

wso2vis.s.chart.raphael.FunnelChart.prototype.convertData = function (that) {
    var df = that.traverseToDataField(that.data, that.dataField());    
    var dcount = 1;
    if (df instanceof Array) {
        dcount = df.length;
    }
    
    that.formattedData = [];
    
    for (var i = 0; i < dcount; i++) {
        that.formattedData.push({"label":getLbl(i), "value":getVal(i)});
    }
    
    function getVal(x) {
        var r;
        if (df instanceof Array) {
            r = df[x];
        }
        else {
            r = df;
        }        
        return parseInt(that.traverseToDataField(r, that.dataValue()));
    }
    
    function getLbl(x) {
        var r;
        if (df instanceof Array) {
            r = df[x];
        }
        else {
            r = df;
        }
        return that.traverseToDataField(r, that.dataLabel());
    }
};

wso2vis.s.chart.raphael.FunnelChart.prototype.onTooltip = function (data) {
    return data.label + ":" + data.value;
};




//Class c.infovis.SpaceTree : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.infovis.SpaceTree = function(divElementLog, canvas, chartTitle, chartDesc) {
	wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

	/* @private */
	this.divElementLog = divElementLog;
	this.canvas = canvas;
	this.st = null;
	this.y = null;
	this.x = null;
	this.tip = new wso2vis.c.Tooltip();
	this.testLabel = null;
	this.edgeLabelArray = null;
};

//this makes c.infovis.SpaceTree.prototype inherits
//from Chart.prototype
wso2vis.extend(wso2vis.s.chart.infovis.SpaceTree, wso2vis.s.chart.Chart);

wso2vis.s.chart.infovis.SpaceTree.prototype
.property("dataField")
.property("dataValue")
.property("dataLabel")
.property("ySuffix")
.property("xSuffix");


ST.Plot.EdgeTypes.implement({
	'custom-line': function(adj, canvas) {
	//plot arrow edge
	this.edgeTypes.arrow.call(this, adj, canvas);
	//get nodes cartesian coordinates
	var pos = adj.nodeFrom.pos.getc(true);
	var posChild = adj.nodeTo.pos.getc(true);
	//check for edge label in data
	var data = adj.nodeTo.data;
	if(data.labelid && data.labeltext) {
		var domlabel = document.getElementById(data.labelid);
		//if the label doesn't exist create it and append it
		//to the label container
		if(!domlabel) {
			var domlabel= document.createElement('div');
			domlabel.id = data.labelid;
			domlabel.innerHTML = data.labeltext;
			//add some custom style
			var style = domlabel.style;
			style.position = 'absolute';
			style.color = '#00f';
			style.fontSize = '9px';
			//append the label to the labelcontainer
			this.getLabelContainer().appendChild(domlabel);
			
		}

		//now adjust the label placement
		var radius = this.viz.canvas.getSize();
		domlabel.style.left = parseInt((pos.x + posChild.x + radius.width - domlabel.offsetWidth) /2) + 'px';
		domlabel.style.top = parseInt((pos.y + posChild.y + radius.height) /2) + 'px';
	}
}
});


//Public function loadChart
//Loads the chart inside the given HTML element
wso2vis.s.chart.infovis.SpaceTree.prototype.load = function (w, h) {

	if (w !== undefined) {
		this.width(w);
	}	
	if (h !== undefined) {
		this.height(h);
	}

	that = this;
	var Log = {
			elem: false,
			write: function(text){
		if (!this.elem) 
			this.elem = that.divElementLog;
		this.elem.innerHTML = text;
		this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
	}
	};
	//init canvas
	//Create a new canvas instance.
	var canvas = new Canvas('mycanvas', {
		'injectInto': that.canvas,
		'width': that.width(),
		'height': that.height(),
		'backgroundColor': '#1a1a1a'
	});
	//end

	//init st
	//Create a new ST instance
	this.st = new ST(canvas, {
		//set duration for the animation
		orientation: "left",
		duration: 400,
		//set animation transition type
		transition: Trans.Quart.easeInOut,
		//set distance between node and its children
		levelDistance: 60,
		//set node and edge styles
		//set overridable=true for styling individual
		//nodes or edges
		Node: {
		width:20,
		type: 'none',
		color: '#aaa',
		overridable: true
	},

	Edge: {
		type: 'arrow',
		overridable: true
		

	},

	onBeforeCompute: function(node){

		//     Log.write("loading " + node.name);
	},

	onAfterCompute: function(){
		//Log.write("done");
	},

	//This method is called on DOM label creation.
	//Use this method to add event handlers and styles to
	//your node.
	onCreateLabel: function(label, node){
		label.id = node.id;
		label.innerHTML = node.name;
		label.onclick = function(){
			that.st.onClick(node.id);

			//	Log.write("Done");
		};
		label.onmouseover = function(e){
			that.tip.show(e.pageX, e.pageY, node.name);	
			//	Log.write("mouse is over the" + node.name + "label, triggering mouse event : " + e.toString());
		};
		label.onmouseout = function () {
			that.tip.hide();
		};
		//set label styles
		var style = label.style;
		style.width = 10 + 'px';
		style.height = 17 + 'px';            
		style.cursor = 'pointer';
		style.color = '#333';
		style.fontSize = '0.8em';
		style.textAlign= 'center';
		style.paddingTop = '4px';
		style.paddingLeft = '3px';
	},

	//This method is called right before plotting
	//a node. It's useful for changing an individual node
	//style properties before plotting it.
	//The data properties prefixed with a dollar
	//sign will override the global node style properties.
	onBeforePlotNode: function(node){
		//add some color to the nodes in the path between the
		//root node and the selected node.

		if (node.selected) {
			node.data.$color = "#ff7";
		}
		else {
			delete node.data.$color;
			var GUtil = Graph.Util;
			//if the node belongs to the last plotted level
			if(!GUtil.anySubnode(node, "exist")) {
				//count children number
				var count = 0;
				GUtil.eachSubnode(node, function(n) { count++; });
				//assign a node color based on
				//how many children it has
				node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];                    
			}
		}
	},

	//This method is called right before plotting
	//an edge. It's useful for changing an individual edge
	//style properties before plotting it.
	//Edge data proprties prefixed with a dollar sign will
	//override the Edge global style properties.
	onBeforePlotLine: function(adj){
		if (adj.nodeFrom.selected && adj.nodeTo.selected) {
			adj.data.$color = "#eed";
			adj.data.$lineWidth = 3;
		}
		else {
			delete adj.data.$color;
			delete adj.data.$lineWidth;
		}
	}
	});

};


wso2vis.s.chart.infovis.SpaceTree.prototype.populateData = function (thisObject) {
	// Space Tree can only be drawn with a JSON Tree i.e. with JSON nodes
	var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
	if ((_dataField instanceof Array) && (_dataField.length < 1)) {
		return false;
	}
	var st = thisObject.st;
	var lbs = st.fx.labels;

	for (label in lbs) {
		if (lbs[label]) {
			lbs[label].parentNode.removeChild(lbs[label]);
		}
	}
//	for (edge in edges) {
//	if (edges(edge)) {
//	edges[edge]
//	}
	st.fx.labels = {};
//	thisObject.adjustWidth(_dataField[0]);
	thisObject.st.loadJSON(_dataField[0]);
	return true;

};

wso2vis.s.chart.infovis.SpaceTree.prototype.trim = function (txt) { 
	if (txt.length > 20) {
		var str = txt.substr(0,18);
		str += "...";	
	} else {
		var str = txt;
	}
	return str;
}


wso2vis.s.chart.infovis.SpaceTree.prototype.getNodeDiv = function () { 
	if (this.testLabel == null) {

		var testLabel = this.testLabel = document.createElement('div'); 
		testLabel.id = "mytestlabel"; 
		testLabel.style.visibility = "hidden"; 
		testLabel.style.position = "absolute";
		testLabel.style.height = 20 + 'px'; 
		document.body.appendChild(testLabel);
		return this.testLabel;
	}
}



wso2vis.s.chart.infovis.SpaceTree.prototype.adjustWidth = function(tree) {
	var elem = this.getNodeDiv();
	TreeUtil.each(tree, function(node) { 
		elem.innerHTML = that.trim(node.name); 
		node.data.$width = elem.offsetWidth; 
	}); 
} 

wso2vis.s.chart.infovis.SpaceTree.prototype.update = function () {
	var st = this.st;
	if (this.populateData(this)) {
		//compute node positions and layout
		st.compute();
		//optional: make a translation of the tree
		st.geom.translate(new Complex(-200, 0), "startPos");
		//emulate a click on the root node.
		st.onClick(st.root);

		if(this.tooltip() === true) {
			tooltip.init();
		}
	}
};
//Class c.infovis.HyperTree : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.infovis.HyperTree = function(divElementLog, canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.divElementLog = divElementLog;
    this.canvas = canvas;
    this.ht = null;
    this.y = null;
    this.x = null;
}

// this makes c.infovis.HyperTree.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.infovis.HyperTree, wso2vis.s.chart.Chart);

wso2vis.s.chart.infovis.HyperTree.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix");


function addEvent(obj, type, fn) {
    if (obj.addEventListener) obj.addEventListener(type, fn, false);
    else obj.attachEvent('on' + type, fn);
};

//Public function loadChart
//Loads the chart inside the given HTML element

wso2vis.s.chart.infovis.HyperTree.prototype.load = function (w, h) {
	 
	if (w !== undefined) {
	      this.width(w);
	}	
	if (h !== undefined) {
		this.height(h);
	}

	that = this;
		var Log = {
		    elem: false,
		    write: function(text){
		        if (!this.elem) 
		            this.elem = that.divElementLog;
		        this.elem.innerHTML = text;
		        this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
		    }
		};
	
var canvas = new Canvas('mycanvas', {
	        'injectInto': that.canvas,
	        'width': that.width(),
	        'height': that.height(),
	        'backgroundColor': '#1a1a1a'
	    });

    //end
    var style = document.getElementById('mycanvas').style;
    style.marginLeft = style.marginTop = "25px";
    //init Hypertree
    this.ht = new Hypertree(canvas, {
        //Change node and edge styles such as
        //color, width and dimensions.
        Node: {
            dim: 9,
            color: "#f00"
        },
        
        Edge: {
            lineWidth: 2,
            color: "#024"
        },
        
        onBeforeCompute: function(node){
            //Log.write("centering");
        },
        //Attach event handlers and add text to the
        //labels. This method is only triggered on label
        //creation
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            addEvent(domElement, 'click', function () {
                that.ht.onClick(node.id);
            });
        },
        //Change node styles when labels are placed
        //or moved.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            if (node._depth <= 1) {
                style.fontSize = "0.8em";
                style.color = "#000";

            } else if(node._depth == 2){
                style.fontSize = "0.7em";
                style.color = "#011";

            } else {
                style.display = 'none';
            }

            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
        },
        
        onAfterCompute: function(){
           // Log.write("done");
	    }
	});
	    
};


wso2vis.s.chart.infovis.HyperTree.prototype.populateData = function (thisObject) {
	// Space Tree can only be drawn with a JSON Tree i.e. with JSON nodes
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
if ((_dataField instanceof Array) && (_dataField.length < 1)) {
	return false;
}
var ht = thisObject.ht
var lbs = ht.fx.labels;
for (label in lbs) {
 	   if (lbs[label]) {
 	    lbs[label].parentNode.removeChild(lbs[label]);
 	   }
}
ht.fx.labels = {};
thisObject.ht.loadJSON(_dataField[0]);
return true;

  };



wso2vis.s.chart.infovis.HyperTree.prototype.update = function () {
	var ht = this.ht;
if (this.populateData(this)) {
   ht.refresh();
   ht.controller.onAfterCompute();  
	
    if(this.tooltip() === true) {
        tooltip.init();
    }
}
};

//Class s.chart.composite.CompositeChart1 : Chart
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.chart.composite.CompositeChart1 = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.vis = null;
    this.y = null;
    this.x = null;
	this.chart = null;
	this.chartType(0);
	

    //this.legendText("Data 1");
}

// this makes s.chart.composite.CompositeChart1.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.chart.composite.CompositeChart1, wso2vis.s.chart.Chart);

wso2vis.s.chart.composite.CompositeChart1.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix")
    .property("titleTop")
    .property("titleLeft")
    .property("titleRight")
    .property("titleBottom")
    .property("xTitle")
    .property("yTitle")
    .property("legendText")
    .property("segmentBorderColor")
	.property("labelLength")
    .property("thickness")
	.property("chartType");
	
wso2vis.s.chart.composite.CompositeChart1.prototype.load = function (w, h) {
    if (this.chartType() == 0) {
		this.chart = new wso2vis.s.chart.protovis.BarChart(this.divEl(), this.title(), this.description());
	}
	else if (this.chartType() == 1) {
		this.chart = new wso2vis.s.chart.protovis.ColumnChart(this.divEl(), this.title(), this.description());
	}
	else if (this.chartType() == 2) {
		this.chart = new wso2vis.s.chart.protovis.WedgeChart(this.divEl(), this.title(), this.description());
	}
	else if (this.chartType() == 3) {
		this.chart = new wso2vis.s.chart.protovis.PieChart(this.divEl(), this.title(), this.description());
	}
	else if (this.chartType() == 4) {
		this.chart = new wso2vis.s.chart.protovis.LineChart2(this.divEl(), this.title(), this.description());
	}	
	else if (this.chartType() == 5) {
		this.chart = new wso2vis.s.chart.protovis.AreaChart2(this.divEl(), this.title(), this.description());
	}	
	
	
	this.chart.dataField(this.dataField());
	this.chart.dataValue(this.dataValue());
	this.chart.dataLabel(this.dataLabel());
	this.chart.ySuffix(this.ySuffix());
	this.chart.xSuffix(this.xSuffix());
	this.chart.tooltip(this.tooltip());
	this.chart.legend(this.legend());
	this.chart.marks(this.marks());
	this.chart.width(this.width());
	this.chart.height(this.height());
	this.chart.titleFont(this.titleFont());
	this.chart.labelFont(this.labelFont());
	this.chart.legendX(this.legendX());
	this.chart.legendY(this.legendY());
	this.chart.paddingTop(this.paddingTop());
	this.chart.paddingLeft(this.paddingLeft());
	this.chart.paddingRight(this.paddingRight());
	this.chart.paddingBottom(this.paddingBottom());

	this.chart.load(w, h);
};

/**
* @private
*/
wso2vis.s.chart.composite.CompositeChart1.prototype.populateData = function (thisObject) {    
	this.chart.populateData(thisObject.chart);
};

wso2vis.s.chart.composite.CompositeChart1.prototype.update = function () {
    this.chart.update();
};

wso2vis.s.chart.composite.CompositeChart1.prototype.getDataLabel = function (i) {
    if (this.data !== null){
        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};

wso2vis.s.chart.composite.CompositeChart1.prototype.pushData = function (d) {
    if( this.validateData(d) ){
        this.chart.data = d;
        this.chart.update();
    } else {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
};
/**
 * @class TreeView
 * @extends Subscriber
 */
wso2vis.s.form.TreeView = function() {
	wso2vis.s.Subscriber.call(this);

    /* @private */
    this.tree = null;
    this.data = null;
};

wso2vis.extend(wso2vis.s.form.TreeView, wso2vis.s.Subscriber);

wso2vis.s.form.TreeView.prototype
    .property("canvas")
    .property("nodeLabel")
    .property("nodeValue")
    .property("nodeChildren")
    .property("dataField");

wso2vis.s.form.TreeView.prototype.create = function() {

    var that = this;

    //instantiate the TreeView control:
    this.tree = new YAHOO.widget.TreeView(this.canvas());
    var rootNode = this.tree.getRoot();

    if( this.data !== null ){
        //begin adding children 
        rec(rootNode, this.data);
    }

    function rec(node, data) {
        var children;
        if( data === undefined || data === null ) {
            return;
        }

        var dataField = that.traverseToDataField(data, that.dataField());

        if (dataField instanceof Array) {
            children = dataField.length;
        }
        else {
            children = 1;
        }

        for (var i=0; i<children; i++) {
            var dataObj;
            if ( dataField instanceof Array ){
                dataObj = dataField[i];
            }
            else {
                dataObj = dataField;
            }
            var nodeLabel = that.traverseToDataField(dataObj, that.nodeLabel());
            var nodeValue = that.traverseToDataField(dataObj, that.nodeValue());
            var nodeChildren = that.traverseToDataField(dataObj, that.nodeChildren());

            var dataNode = {};
            dataNode.label = nodeLabel;
            dataNode.value = nodeValue;

            var childNode = new YAHOO.widget.TextNode(dataNode, node, true);
            rec(childNode, nodeChildren);
        }
    }

    // Expand and collapse happen prior to the actual expand/collapse,
    // and can be used to cancel the operation
    this.tree.subscribe("expand", this.onExpand);
    this.tree.subscribe("collapse", this.onCollapse);
    this.tree.subscribe("labelClick", this.onLabelClick);

    this.tree.draw();
};

wso2vis.s.form.TreeView.prototype.update = function() {    var canvas = document.getElementById(this.canvas());    canvas.innerHTML = "";

    this.create();};

wso2vis.s.form.TreeView.prototype.onExpand = function(node) {
    console.log(node.index + " - " + node.label + " was expanded");
};

wso2vis.s.form.TreeView.prototype.onCollapse = function(node) {
    console.log(node.index + " - " + node.label + " was collapsed");
};

wso2vis.s.form.TreeView.prototype.onLabelClick = function(node) {
    console.log(node.index + " - " + node.label + " label was clicked");
};

wso2vis.s.form.TreeView.prototype.pushData = function(data) {
      this.data = data;//console.log(data);
      this.update();
};

wso2vis.s.form.TreeView.prototype.traverseToDataField = function (object, dataFieldArray) {
	var a = object;					
	for (var i = 0; i < dataFieldArray.length; i++) {
		a = a[dataFieldArray[i]];
	}
	return a;
};

/**
 * @class
 * Base class for all gauges
 */
wso2vis.s.gauge.Gauge = function (canvas, ttle, desc) {
    wso2vis.s.Subscriber.call(this);
    /* @private */
    this.title(ttle)
        .description(desc)
        .divEl(canvas)
        .tooltip(true)
        //.legend(true)
        //.marks(false)
        .width(600)
        .height(500)
        //.titleFont("10px sans-serif")
        //.labelFont("10px sans-serif")
        //.legendX(0)
        //.legendY(0)
        .paddingTop(25)
        .paddingLeft(10)
        .paddingRight(60)
        .paddingBottom(10);

    /* @private */
    this.data = null;
    //this.formattedData = null;

    wso2vis.environment.gauges.push(this);
    id = wso2vis.environment.gauges.length - 1;
    this.getID = function() {
        return id;
    };
};

wso2vis.extend(wso2vis.s.gauge.Gauge, wso2vis.s.Subscriber);

wso2vis.s.gauge.Gauge.prototype
    .property("title")
    .property("description")
    .property("divEl")
    .property("msgDiv")
    .property("tooltip")
    //.property("legend")
    .property("x")
    .property("y")
    .property("width")
    .property("height")
    .property("paddingTop")
    .property("paddingLeft")
    .property("paddingRight")
    .property("paddingBottom")
    .property("anchorTop")
    .property("anchorLeft")
    .property("anchorRight")
    .property("anchorBottom")
    //.property("legendX")
    //.property("legendY")
    .property("titleFont");
    //.property("labelFont")
    //.property("marks");

wso2vis.s.gauge.Gauge.prototype.pushData = function (d) {
    if( this.validateData(d) ){
        this.data = d;
        this.update();
    } else {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
};

wso2vis.s.gauge.Gauge.prototype.validateData = function (d) {
    //Check whether we have valid data or not.
    if( d === null || d === undefined ) {
        return false;
    }
    else {
        return true;
    }
};

wso2vis.s.gauge.Gauge.prototype.update = function () {
};

wso2vis.s.gauge.Gauge.prototype.updateMessageDiv = function (s) {
    if( this.msgDiv() !== undefined ) {
        var msgdiv = document.getElementById(this.msgDiv());
        if( msgdiv !== undefined ) {
            msgdiv.innerHTML = s;
            msgdiv.style.display = "block";
        }
    }
};

wso2vis.s.gauge.Gauge.prototype.messageInterceptFunction = function () {
    return "Invalid Data";
};

wso2vis.s.gauge.Gauge.prototype.onClick = function () {
};

wso2vis.s.gauge.Gauge.prototype.onTooltip = function (data) {
    return "";
};

wso2vis.s.gauge.Gauge.prototype.onKey = function () {
};

wso2vis.s.gauge.Gauge.prototype.traverseToDataField = function (object, dataFieldArray) {
	var a = object;
    try { //Try catch outside the loop TODO
	    for (var i = 0; i < dataFieldArray.length; i++) {
		    a = a[dataFieldArray[i]];
	    }
    }
    catch (e) {
        this.updateMessageDiv(this.messageInterceptFunction());
    }
	return a;
};

wso2vis.s.gauge.Gauge.prototype.getDataObject = function (dataObj, i) {
    if( dataObj instanceof Array ) {
        return dataObj[i];
    }
    else {
        return dataObj;
    }
};

//Class c.raphael.Gauge1 : Gauge1
//This is the custom wrapper class for protovis bar charts

//Constructor
wso2vis.s.gauge.raphael.Gauge1 = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.gauge.Gauge.call(this, canvas, chartTitle, chartDesc);

    /* @private */
    this.y = null;
    this.x = null;

	this.r = null; // raphael page
	this.s = null; // needle set
	this.cx = 0;
	this.cy = 0;
	
	this.minValue(0);
	this.maxValue(1000);
	this.largeTick(100);
	this.smallTick(10);
	this.minAngle(30);
	this.maxAngle(330);
	this.radius(60);
	
	this.needleLength(55);
	this.smallTickLength(10);
	this.largeTickLength(15);
    //this.legendText("Data 1");
}

// this makes c.protovis.BarChart.prototype inherits
// from Chart.prototype
wso2vis.extend(wso2vis.s.gauge.raphael.Gauge1, wso2vis.s.gauge.Gauge);

wso2vis.s.gauge.raphael.Gauge1.prototype
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("ySuffix")
    .property("xSuffix")
    .property("titleTop")
    .property("titleLeft")
    .property("titleRight")
    .property("titleBottom")
    .property("xTitle")
    .property("yTitle")
    .property("legendText")
    .property("segmentBorderColor")
	
	.property("minAngle")
	.property("maxAngle")
	.property("radius")
	
	.property("minValue")
	.property("maxValue")
	.property("largeTick")
	.property("smallTick")
	.property("largeTickLength")
	.property("smallTickLength")
	.property("needleLength")
	
	.property("needleColor")
	.property("needleBaseColor")
	.property("labelColor")
	.property("largeTickColor")
	.property("smallTickColor");
	
	

//Public function load
//Loads the chart inside the given HTML element
wso2vis.s.gauge.raphael.Gauge1.prototype.load = function (w, h) {
    if ( w !== undefined ) {
        this.width(w);
    }
    if ( h !== undefined ) {
        this.height(h);
    } 
	
	this.cx = this.width() / 2;
	this.cy = this.height() / 2;
	
	this.r = Raphael(this.divEl(), this.width(), this.height());
	
	this.drawDial(this.r, this.largeTick(), this.radius(), this.largeTickLength(), this.cx, this.cy, true);
	this.drawDial(this.r, this.smallTick(), this.radius(), this.smallTickLength(), this.cx, this.cy, false);
	
	//drawBorder(this.r, this.radius(), this.cx, this.cy);
	
	this.drawInitialNeedle(this.r, this.radius(), this.cx, this.cy);
	this.showTitle();
};


/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.showTitle = function() {
	this.r.text(this.cx, this.cy + this.radius() + 20, this.title()).attr({"stroke-width": 1, stroke: "#ccc"});
}

/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.drawDial = function(r, tick, radius, length, cx, cy, isLargeTick) {
	var maxValAlt = Math.floor(this.maxValue() / tick) * tick;
	var minValAlt = Math.ceil(this.minValue() / tick) * tick;
	
	var n = Math.floor((maxValAlt - minValAlt) / tick);
	
	var tickAngle = tick * (this.maxAngle() - this.minAngle()) / (this.maxValue() - this.minValue());
	var startAngle = 0;
	if (this.minValue() >= 0) 
	{
		startAngle = ((this.minValue() % tick) == 0)? 0 : (tick - this.minValue() % tick) * (this.maxAngle() - this.minAngle()) / (this.maxValue() - this.minValue());
	}
	else 
	{
		startAngle = (-this.minValue() % tick) * (this.maxAngle() - this.minAngle()) / (this.maxValue() - this.minValue());
	}
	for (var i = 0; i <= n; i++) {
		var ang = (this.minAngle() + startAngle + i * tickAngle);
		r.path("M" + cx + " " + (cy + radius) + "L" + cx+ " " + (cy + radius - length)).attr({rotation: ang + " " + cx + " " + cy, "stroke-width": isLargeTick? 2 : 1, stroke: "#fff"});		
		if (isLargeTick) 
		{
			/*if (minValAlt + i * tick == 0)
				r.text(cx, cy + radius + 10, "0").attr({rotation:ang + " " + cx + " " + cy, "stroke-width": 1, stroke: "#fff"});						
			else 
				r.text(cx, cy + radius + 10, minValAlt + i * tick).attr({rotation:ang + " " + cx + " " + cy, "stroke-width": 1, stroke: "#fff"});						
			*/
			if (ang >= 90 && ang <= 270) {
				if (minValAlt + i * tick == 0)
					r.text(cx, cy - radius - 10, "0").attr({rotation:(ang-180) + " " + cx + " " + cy, "stroke-width": 1, stroke: "#fff"});						
				else 
					r.text(cx, cy - radius - 10, minValAlt + i * tick).attr({rotation:(ang-180) + " " + cx + " " + cy, "stroke-width": 1, stroke: "#fff"});						
			}
			else {
				if (minValAlt + i * tick == 0)
					r.text(cx, cy + radius + 10, "0").attr({rotation:ang + " " + cx + " " + cy, "stroke-width": 1, stroke: "#fff"});						
				else 
					r.text(cx, cy + radius + 10, minValAlt + i * tick).attr({rotation:ang + " " + cx + " " + cy, "stroke-width": 1, stroke: "#fff"});						
			}
		
		}
		
	}
}

/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.drawBorder = function(r, radius, cx, cy) {
	var alpha = (360 - (this.maxAngle() - this.minAngle()));
	var alphar = alpha * Math.PI / 180;
	var tx, ty;
	tx = cx + radius * Math.sin(alphar);
	ty = cy + radius * Math.cos(alphar);
	r.path("M320 " + (cy + radius) + " A " + radius + " " + radius + " 0 1 1 "+ tx + " " + ty).attr({rotation: this.minAngle(), "stroke-width": 1, stroke: "#fff"});
} 

/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.drawInitialNeedle = function(r, radius, cx, cy) {
	this.s = r.set();                
	this.s.push(r.path("M" + cx + " " + (cy - 15) + " L" + cx + " " + (cy + this.needleLength())).attr({fill: "none", "stroke-width": 4, stroke: "#f00"}));
	this.s.push(r.circle(cx, cy, 5).attr({fill: "none", "stroke-width": 10, stroke: "#aaa"}));
	this.s.animate({rotation:this.minAngle() + " " + cx + " " + cy}, 0, "<>");
}

/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.updateNeedle = function(val) {
	var angle = (val - this.minValue()) * (this.maxAngle() - this.minAngle()) / (this.maxValue() - this.minValue()) + this.minAngle();
	this.s.animate({rotation:angle + " " + this.cx + " " + this.cy}, 800, "<>");
}

/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.titleSpacing = function () {
    if(this.title() === "") {
        return 1;
    }
    else {
        return 0.9;
    }
};

/**
* @private
*/
wso2vis.s.gauge.raphael.Gauge1.prototype.populateData = function (thisObject) {
    var _dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());

    var dataGrpCount = 1;
    if( _dataField instanceof Array ) {
        dataGrpCount = _dataField.length;
    }
	
	var rootObj;
	if (_dataField instanceof Array ) {
		rootObj = _dataField[0];
	}
	else {
		rootObj = _dataField;
	}
	
	this.updateNeedle(parseInt(thisObject.traverseToDataField(rootObj, this.dataValue())));

    /*thisObject.formattedData = pv.range(dataGrpCount).map( genDataMap );

    
    var maxVal = thisObject.formattedData.max();
    if (maxVal < 5) maxVal = 5; // fixing value repeating issue.

    thisObject.x.domain(0, maxVal).range(0, (thisObject.width() - thisObject.paddingLeft() - thisObject.paddingRight()) );
    thisObject.y.domain(pv.range(dataGrpCount)).splitBanded(0, (thisObject.height() - thisObject.paddingTop() - thisObject.paddingBottom()), 4/5);

    function genDataMap(x) {
        var rootObj;
        if( _dataField instanceof Array ) {
            rootObj = _dataField[x];
        }
        else {
            rootObj = _dataField;
        }
        return parseInt(thisObject.traverseToDataField(rootObj, thisObject.dataValue()));
    }*/
};

//wso2vis.s.gauge.raphael.Gauge1.prototype.getData = function (thisObject) {
    //return thisObject.formattedData;
//};

wso2vis.s.gauge.raphael.Gauge1.prototype.update = function () {
    this.populateData(this);
    //this.vis.render();
    if(this.tooltip() === true) {
        tooltip.init();
    }
};

wso2vis.s.gauge.raphael.Gauge1.prototype.getDataLabel = function (i) {
    if (this.data !== null){

        var rootObj = this.traverseToDataField(this.data, this.dataField());
        if( rootObj instanceof Array ) {
            return  this.traverseToDataField(rootObj[i], this.dataLabel());
        }
        else {
            return  this.traverseToDataField(rootObj, this.dataLabel());
        }
    }
    
    return i;
};
wso2vis.s.chart.raphael.DependencyTree = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);
    this.div = canvas;
    this.nodelength(50)
        .nodeheight(20)
        .edgelength(20)
        .sx(30) // distance between 2 successive horizontal nodes
        .sy(40) // distance between 2 successive vertical nodes
        .arrowsize(5)
        .arrowpos("mid");

}

//inherits from Chart
wso2vis.extend(wso2vis.s.chart.raphael.DependencyTree, wso2vis.s.chart.Chart);

wso2vis.s.chart.raphael.DependencyTree.prototype
	.property("dataField")
	.property("dataValue")
    .property("nodelength")
    .property("nodeheight")
    .property("edgelength")
    .property("sx")
    .property("sy")
    .property("arrowsize")
    .property("arrowpos");





Raphael.fn.node = function(x, y, width, height, node_label, url) {

	var box = this.rect(x,y , width, height);

	var mid_x = (x*2 + width)/2;
	var mid_y = (y*2 + height)/2;

	//truncate string
	var trunc_string = null;
	trunc_string = (node_label.length < 15 )? node_label : node_label.substring(0,11) + "...";

	var box_label = this.text(mid_x, mid_y, trunc_string);

	// configure tooltip
	var tip = new wso2vis.c.Tooltip();
	box_label.node.onmouseover = function(e) {
		tip.show(e.pageX, e.pageY, node_label);
	}
	box_label.node.onmouseout = function (e) {
		tip.hide();
	}

	// set up url on label
	if (url) {
		box_label.node.onclick = function(e) {
			open(url);
		}
		box_label.node.onmouseover = function(e) {
			box_label.attr({
				fill: "#25B"

			});
			box_label.node.style.cursor = "pointer";
			tip.show(e.pageX, e.pageY, node_label);
		}
		box_label.node.onmouseout = function (e) {
			box_label.attr({fill: "#000"});
			tip.hide();
		}
	}
	return [box, box_label];
}

Raphael.fn.edge = function (x1, y1, x2, y2, size, arrow_position, edge_label) {
	var angle = Math.atan2(y2-y1,x2-x1) * 180 / Math.PI ;
	var arrow_x = x2;
	var arrow_y = y2;
	var mid_x = (x1+x2)/2;
	var mid_y = (y1+y2)/2;

	if (arrow_position == "start") {
		arrow_x = x1;
		arrow_y = y1;
	} else if (arrow_position == "mid") {
		arrow_x = mid_x;
		arrow_y = mid_y;
	} else if (arrow_position == "end") {
		arrow_x = x2;
		arrow_y = y2;
	}

	var arrow_path = this.path("M"+arrow_x+" "+arrow_y+"l"+0+" "+-(size/2)+"l"+size+" "+(size/2)+"l"+-size+" "+(size/2) +"z").attr("fill","black").rotate(angle, arrow_x, arrow_y);
	var line_path = this.path("M"+x1+" "+y1+"L"+x2+" "+y2);
	var label;
	if (edge_label) {
		//truncate string
		var trunc_string = null;
		trunc_string = (edge_label.length < 9 )? edge_label : edge_label.substring(0,5) + "...";

		label = this.text(mid_x, mid_y-(size+2), trunc_string).rotate(angle, mid_x, mid_y);

		// configure tooltip
		var tip = new wso2vis.c.Tooltip();
		label.node.onmouseover = function(e) {
			tip.show(e.pageX, e.pageY, edge_label);
		}
		label.node.onmouseout = function (e) {
			tip.hide();
		}


	}
	return [arrow_path, line_path, label];
}



Raphael.fn.node_edge = function ( x, y, px, py, node_length, node_height, node_label, edge_length, edge_label, size, arrow_position, url) {
	var _node = this.node(x,y - (node_height/2),node_length, node_height, node_label, url);
	_node[0].attr({fill: '#4AE',
        stroke: '#3b4449',
        'stroke-width': 3,
        'stroke-linejoin': 'round'});
	var _edge = null;
	if (px != null || py != null) {
		_edge = this.edge(px, py, x , y , size, arrow_position, edge_label);
		_edge[0].attr({ stroke: '#3b4449',
	        'stroke-width': 3,
	        'stroke-linejoin': 'round'});
		_edge[1].attr({ stroke: '#3b4449',
	        'stroke-width': 3,
	        'stroke-linejoin': 'round'});
	}
	return [_node, _edge];
}

//public function
wso2vis.s.chart.raphael.DependencyTree.prototype.load = function (w, h) {
    if (w !== undefined) {
        this.width(w);
    }
    if (h !== undefined) {
        this.height(h);
    }

    this.paper = Raphael(this.divEl(), this.width(), this.height());

	return this;
};


wso2vis.s.chart.raphael.DependencyTree.prototype.draw_tree_node_edge = function (paper, px, py ,x,y, node_label, edge_label, url) {
	var node_length = this.nodelength();
	var edge_length = this.edgelength();
	var node_height = this.nodeheight();
	var size = this.arrowsize();
	var arrow_position = this.arrowpos();
	paper.node_edge(x, y, px, py, node_length, node_height, node_label, edge_length, edge_label, size, arrow_position, url);
	return [x + node_length, y];
}


wso2vis.s.chart.raphael.DependencyTree.prototype.draw_json_node = function (paper, jsonObj, px, py, pid, x, y) {
	var edge_label = null;
	if (jsonObj.data.edges) {
		var edge_array = jsonObj.data.edges;
		for (var j = 0;j < edge_array.length; j++) {
			var edge_ids = edge_array[j].id.split("---");
			if (edge_ids != null && edge_ids.length > 1) {
				if (edge_ids[0] == pid && edge_ids[1] == jsonObj.id) {
					edge_label = edge_array[j].name;
				}
			}
		}
	}
	var url = null;
	if (jsonObj.data.url) {
		url = jsonObj.data.url;
	}
	return this.draw_tree_node_edge(paper, px, py, x, y, jsonObj.name, edge_label, url );

}

// Node class
function Node (_json) {
	this.json = _json;
	this.visited;
	this.level;
	this.px;
	this.py;
	this.pid;
	this.i;
	this.scount;
	Node.prototype.getChildren = function () {
		var childArray = new Array();
		var child;
		var children = this.json.children;
		for (var i = 0; i < children.length; i++) {
			childArray.push(new Node(children[i]));
		}
		return childArray;
	}
}

function coYCalc() {
	var sy = 5;
	var h = 8;
	cy = jNode.py;
	cy += -((sCount * h) + (sCount-1) * sy)
	//
}


wso2vis.s.chart.raphael.DependencyTree.prototype.calc_draw_single_node = function (paper, jNode) {
	var initX = 10;
	var initY = this.height() /2;
	var d = 30;
	var sx = this.sx();

	var h = 10;
	if (jNode.level == 0) {
		return this.draw_json_node(paper, jNode.json, null, null, null, initX, initY);
	} else {
		var sy = this.sy(); //200/(2*jNode.level);
		cx = jNode.px + sx; //+ (jNode.pLevel - (json.level + 1)) * (d + sx) ;
		var sCount = jNode.sCount;
		var addConst = (sCount == 0) ? 0 : (sCount - 1) ;
		cy = jNode.py + (h + sy) * (jNode.i - ((sCount-1)/2))/Math.pow(3, jNode.level); //((jNode.i  * (h + sy)) - (((sCount - 1) * (sy + h)) / 2));
		return this.draw_json_node(paper, jNode.json, jNode.px, jNode.py, jNode.pid, cx, cy);
	}

}

wso2vis.s.chart.raphael.DependencyTree.prototype.DrawTreeBFS = function (paper, jNode) {
	var queue = new Array();
	jNode.visited = true;
	queue.push(jNode);
	var level = 0;
	var px, py;
	while (queue.length > 0) {
		var pNode = queue.shift();
		level = pNode.level;
		var coArr = this.calc_draw_single_node(paper, pNode);
		px = coArr[0];
		py = coArr[1];
		pid = pNode.json.id;
		 //document.write(pNode.level + "," +pNode.json.id+" | ");
		var children = pNode.getChildren();
		var lInc = false;
		for (var i = 0; i < children.length; i++) {
			if (i == 0) {
				level++;
			}
			if (!children[i].visited) {
				children[i].visited = true;
				children[i].level = level;
				children[i].pid = pid;
				children[i].px = px;
				children[i].py = py;
				children[i].i = i;
				children[i].sCount = children.length;
				queue.push(children[i]);

			}
		}
	}

}

wso2vis.s.chart.raphael.DependencyTree.prototype.populateData = function (thisObject) {
	// Space Tree can only be drawn with a JSON Tree i.e. with JSON nodes
	this._dataField = thisObject.traverseToDataField(thisObject.data, thisObject.dataField());
	if ((this._dataField instanceof Array) && (this._dataField.length < 1)) {
		return false;
	}

	return true;

};


wso2vis.s.chart.raphael.DependencyTree.prototype.update = function () {
	if (this.populateData(this)) {
		this.paper.clear();
		var root = new Node(this._dataField[0]);
		root.level = 0;
		this.DrawTreeBFS(this.paper, root);
	}

}
wso2vis.s.chart.raphael.PieChart = function(canvas, chartTitle, chartDesc) {
    wso2vis.s.chart.Chart.call(this, canvas, chartTitle, chartDesc);
    
    this.colscheme(20)
        .width(300)
        .height(300)
        .showPercent(true)
        .showValue(true)
        .padding(5)
        .fontFamily('Fontin-Sans, Arial')
        .fontSize('10px')
        .raphaelPaper(null)
		.left(0)
		.top(0);
		
	this.chart = null;
}

// inherits from Chart
wso2vis.extend(wso2vis.s.chart.raphael.PieChart, wso2vis.s.chart.Chart);

wso2vis.s.chart.raphael.PieChart.prototype
    .property("colscheme")
    .property("dataField")
    .property("dataValue")
    .property("dataLabel")
    .property("showPercent")
    .property("showValue")
    .property("padding")
    .property("fontFamily")
    .property("fontSize")
    .property("raphaelPaper")
	.property("left")
	.property("top");
    

wso2vis.s.chart.raphael.PieChart.prototype.load = function (w) {
    if (w !== undefined) {
        this.width(w);
    }
    
    if (this.raphaelPaper() == null) {
        this.raphaelPaper(Raphael(this.divEl(), this.width(), this.width())); //Create a new Raphael paper.
    }
	return this; 
};

wso2vis.s.chart.raphael.PieChart.prototype.update = function () {
    this.convertData(this);
    var parent = this;     
    
    var colors = wso2vis.util.generateColors(this.formattedData.length, this.colscheme());
    
    var is_label_visible = false,
        leave_timer;
    
    var currY = 0;
    var df = this.traverseToDataField(this.data, this.dataField());    
    if (df instanceof Array) {
        df = df;
    }
    else {
        df = [df];
    }
    
    var first;
    
    var paper = this.raphaelPaper(),
        rad = Math.PI / 180,
        cx = this.left() + this.width()/2,
        cy = this.top() + this.width()/2,
        radius = (this.width()/2) - this.padding(),
        data = this.formattedData;
		
	if (this.chart != null) 
	{
		var item1 = this.chart.pop(); 
		
		while (item1 != null) {
			item1.remove();
			item1 = this.chart.pop(); 
		}
	}

	this.chart = paper.set();
        
    function sector(cx, cy, radius, startAngle, endAngle, params) {
        var x1 = cx + radius * Math.cos(-startAngle * rad),
            x2 = cx + radius * Math.cos(-endAngle * rad),
            y1 = cy + radius * Math.sin(-startAngle * rad),
            y2 = cy + radius * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", radius, radius, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    
	var thischart = this.chart;
	
    var angle = 0,
        total = 0,
        start = 0,
        process = function (j) {
            var value = data[j]["value"],
                perc = Math.round((value / total) * 100),
                angleplus = 360 * (value / total),
                popangle = angle + (angleplus / 2),
                color = "hsb(" + start + ", 1, 0.8)",
                ms = 500,
                delta = 30,
                bcolor = colors[j],
                p = sector(cx, cy, radius, angle, angle + angleplus, {fill: bcolor, stroke: "none", "stroke-width": 1}),
                opac = 1,
                labelValue = (parent.showValue()) ? data[j]["value"] : "",
                labelPercent = (parent.showPercent()) ? " ("+perc+"%)" : "",
                txt = paper.text(cx + (radius - delta) * Math.cos(-popangle * rad), cy + (radius - delta) * Math.sin(-popangle * rad), labelValue + labelPercent ).attr({fill: "#fff", stroke: "none", opacity: opac, "font-family": parent.fontFamily(), "font-size": parent.fontSize()});
            angle += angleplus;
            thischart.push(p);
            thischart.push(txt);
            start += .1;
            
            if (parent.tooltip()) {
                (function (data, lbl, func, org) {
                    $(p.node).hover(function (e) {
                        clearTimeout(leave_timer);
                        var tip = func({label:lbl, value:data, total:total, first:first, raw:org});
                        wso2vis.environment.tooltip.show(e.pageX, e.pageY, tip);
                        is_label_visible = true;
                    }, function () {
                        leave_timer = setTimeout(function () {
                            wso2vis.environment.tooltip.hide();
                            is_label_visible = false;
                        }, 2);
                    });
                })(parent.formattedData[i]["value"], parent.formattedData[i]["label"], parent.onTooltip, df[i]);
                
                (function (data, lbl, func, org) {
                    $(p.node).mousemove(function (e) {
                        if (is_label_visible) {
                            clearTimeout(leave_timer);
                            var tip = func({label:lbl, value:data, total:total, first:first, raw:org});
                            wso2vis.environment.tooltip.show(e.pageX, e.pageY, tip);
                        }
                    });
                })(parent.formattedData[i]["value"], parent.formattedData[i]["label"], parent.onTooltip, df[i]);
            }
        };
        
    for (var i = 0, ii = data.length; i < ii; i++) {
        total += data[i]["value"];
    }
    
    for (var i = 0; i < ii; i++) {
        process(i);
    }
};

wso2vis.s.chart.raphael.PieChart.prototype.convertData = function (that) {
    var df = that.traverseToDataField(that.data, that.dataField());    
    var dcount = 1;
    if (df instanceof Array) {
        dcount = df.length;
    }
    
    that.formattedData = [];
    
    for (var i = 0; i < dcount; i++) {
        that.formattedData.push({"label":getLbl(i), "value":getVal(i)});
    }
    
    function getVal(x) {
        var r;
        if (df instanceof Array) {
            r = df[x];
        }
        else {
            r = df;
        }        
        return parseInt(that.traverseToDataField(r, that.dataValue()));
    }
    
    function getLbl(x) {
        var r;
        if (df instanceof Array) {
            r = df[x];
        }
        else {
            r = df;
        }
        return that.traverseToDataField(r, that.dataLabel());
    }
};

wso2vis.s.chart.raphael.PieChart.prototype.onTooltip = function (data) {
    return data.label + ":" + data.value;
};

/**
* Constructs a new TrafficLight.
* @class Represents a traffic light widget which creates a graphical traffic light in WSO2Vis.
* @param {canvas} canvas the name of the HTML element (ex: div) where the graphical traffic light should be drawn.
* @constructor
*/
wso2vis.c.TrafficLight = function(canvas) {
    this.attr = [];
    
    this.divEl(canvas);

    /* @private */
    this.lights = [];
    this.back = [];
    
    this.stat = [];
    this.stat["top"] = false;
    this.stat["middle"] = false;
    this.stat["bottom"] = false;
        
    this.color = [];
    this.color["top_on"] = "r#f00-#f00-#89070D";
    this.color["top_off"] = "r#900-#560101-#350305";
    this.color["middle_on"] = "r#FFD52E-#FFEB14-#9E4500";
    this.color["middle_off"] = "r#BD5F00-#6B2F00-#473A00";
    this.color["bottom_on"] = "r#0f0-#0e0-#07890D";
    this.color["bottom_off"] = "r#090-#015601-#033505";
        
    this.radius(35)
        .xspace(15)
        .yspace(20)
        .gap(10)
        .paper(null);
        
    this.dia = this.radius()*2;
    this.backh = (this.dia*3)+(this.gap()*2)+(this.yspace()*2);
    this.backw = this.dia+(this.xspace()*2);
    
    this.startX = this.radius() + this.xspace();
    this.startY = this.radius() + this.yspace();
};

/**
* @private Defines and registers a property method for the property with the given name.
* @param {string} name the property name.
*/
wso2vis.c.TrafficLight.prototype.property = function(name) {
    /*
    * Define the setter-getter globally
    */
    wso2vis.c.TrafficLight.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

/* Define all properties. */
wso2vis.c.TrafficLight.prototype
    .property("title")
    .property("divEl")
    .property("radius")
    .property("gap")
    .property("paper")
    .property("xspace")
    .property("yspace");

/**
* Loads the graphical control inside the given HTML element (ex: div).
* @param {string} name the property name.
*/
wso2vis.c.TrafficLight.prototype.load = function (p) {

    if( (p != null) && (p != undefined) && (p != "") ) {
        this.paper(p);
    }
    else {
        this.paper(Raphael(this.divEl()));
    }
    
    /* Init */
    this.paper().clear();
    this.back[0] = this.paper().rect(0, 0, this.backw, this.backh, 8).attr({"stroke-width": 1, stroke: "#000", fill: "#ccc"});
    this.back[1] = this.paper().rect(5, 5, this.backw-10, this.backh-10, 8).attr({stroke: "none", fill: "#000"});
    
    //Lights
    this.lights["top"] = this.paper().circle(this.startX, this.startY, this.radius()).attr({fill: this.color["top_off"], stroke: "#333"});
    this.lights["middle"] = this.paper().circle(this.startX, (this.startY + this.dia + this.gap()), this.radius()).attr({fill: this.color["middle_off"], stroke: "#333"});
    this.lights["bottom"] = this.paper().circle(this.startX, this.startY + (this.dia*2) + (this.gap()*2), this.radius()).attr({fill: this.color["bottom_off"], stroke: "#333"});

};

wso2vis.c.TrafficLight.prototype.on = function (light) {
    this.lights[light].animate({fill: this.color[light+"_on"]}, 100);
    this.stat[light] = true;
};

wso2vis.c.TrafficLight.prototype.off = function (light) {
    this.lights[light].animate({fill: this.color[light+"_off"]}, 100);
    this.stat[light] = false;
};

wso2vis.c.TrafficLight.prototype.toggle = function (light) {
    if( this.stat[light] ) {
        this.off(light);
    }
    else {
        this.on(light);
    }
};

wso2vis.c.TrafficLight.prototype.horizontal = function () {
    /**
    * Horizontal Layout
    **/
    this.back[0].attr({width: this.backh, height: this.backw});
    this.back[1].attr({width: this.backh-10, height: this.backw-10});
    
    this.lights["top"].attr({cx: this.startY, cy: this.startX});
    this.lights["middle"].attr({cx: this.startY + this.dia + this.gap(), cy: this.startX});
    this.lights["bottom"].attr({cx: this.startY + (this.dia*2) + (this.gap()*2), cy: this.startX});
};

wso2vis.c.TrafficLight.prototype.vertical = function () {
    /**
    * Vertical Layout
    **/
    this.back[0].attr({width: this.backw, height: this.backh});
    this.back[1].attr({width: this.backw-10, height: this.backh-10});
    
    this.lights["top"].attr({cx: this.startX, cy: this.startY});
    this.lights["middle"].attr({cx: this.startX, cy: this.startY + this.dia + this.gap()});
    this.lights["bottom"].attr({cx: this.startX, cy: this.startY + (this.dia*2) + (this.gap()*2)});
};

/**
* Constructs a new data adapter.
* @class Represents an abstract Class for data adapters. The Adapter class is the base class for all custom adapters in WSO2Vis.
* @constructor
*/
wso2vis.a.Adapter = function() {
    this.dp = null;
	this.drList = [];
	wso2vis.environment.adapters.push(this);
    id = wso2vis.environment.adapters.length - 1;    
    this.getID = function() {
        return id;
    }
};

/**
* Adds a data provider.
* @param {wso2vis.p.DataProvider} dp a data provider.
*/
wso2vis.a.Adapter.prototype.dataProvider = function(dp) {
	this.dp = dp;
	this.dp.addDataReceiver(this);
	return;
};

/**
* Adds a data receiver.
* @param {wso2vis.s.Subscriber} dr a data receiver.
*/
wso2vis.a.Adapter.prototype.addDataReceiver = function(dr) {
	this.drList.push(dr);
};


/**
* Pushes data to all the available data receivers.
* @private
* @param {json} data a json data object.
*/
wso2vis.a.Adapter.prototype.pushData = function(data) {
	var filteredData = this.convertData(data);
	for (i = 0; i < this.drList.length; i++) {
		(this.drList[i]).pushData(filteredData); 
	}
};

/**
* Pulls data from the data provider.
*/
wso2vis.a.Adapter.prototype.pullData = function() {
	this.dp.pullData();
};

/**
* Converts data inside the adapter. This method should be override with a custom converter function.
* @param {json} data a json data object.
* @returns {json} converted json data object.
*/
wso2vis.a.Adapter.prototype.convertData = function(data) {
	return data;
};

/**
* Constructs a new Control.
* @class Represents an abstract Class for controls. The Control class is the base class for all graphical controls in WSO2Vis.
* @constructor
* @param {string} canvas the name of the HTML element (ex: div) where the graphical control should be drawn.
*/
wso2vis.c.Control = function(canvas) {
   	this.attr = []; 	
  	this.canvas(canvas);   
    
	this.dp = null;
	wso2vis.environment.controls.push(this);
    
	id = wso2vis.environment.controls.length - 1;
    this.getID = function() {return id;}	
};

/**
* @private Defines and registers a property method for the property with the given name.
* @param {string} name the property name.
*/
wso2vis.c.Control.prototype.property = function(name) {
    wso2vis.c.Control.prototype[name] = function(v) {
      if (arguments.length) {
        this.attr[name] = v;
        return this;
      }
      return this.attr[name];
    };

    return this;
};

/* Define all properties. */
wso2vis.c.Control.prototype.property("canvas");

/**
* Creates the graphical control.
*/
wso2vis.c.Control.prototype.create = function() {
};

/**
* Loads the graphical control inside the given HTML element (ex: div).
*/
wso2vis.c.Control.prototype.load = function() {
    var divEl = document.getElementById(this.canvas());
    divEl.innerHTML = this.create();
};

/**
* Unloads the graphical control from the given HTML element (ex: div).
*/
wso2vis.c.Control.prototype.unload = function() {
    var divEl = document.getElementById(this.canvas());
    divEl.innerHTML = "";
};

/**
* Constructs a new Tooltip.
* @class Represents a tool-tip which creates a graphical tool-tip in WSO2Vis.
* @constructor
*/
wso2vis.c.Tooltip = function () {
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'ttipRRR'); // a random name to avoid conflicts. 
    this.el.style.display = 'none';
    this.el.style.width = 'auto';
    this.el.style.height = 'auto';
    this.el.style.margin = '0';
    this.el.style.padding = '5px';
    this.el.style.backgroundColor = '#ffffff';
    this.el.style.borderStyle = 'solid';
    this.el.style.borderWidth = '1px';
    this.el.style.borderColor = '#444444';
    this.el.style.opacity = 0.85;
    
    this.el.style.fontFamily = 'Fontin-Sans, Arial';
    this.el.style.fontSize = '12px';
    
    this.el.innerHTML = "<b>wso2vis</b> tooltip demo <br/> works damn fine!";    
    document.body.appendChild(this.el);    
};

wso2vis.c.Tooltip.prototype.style = function() {
    return this.el.style;
};

/**
* Shows the tool-tip in the given x y coordinates.
* @param {float} x x coordinate of the tool-tip.
* @param {float} y y coordinate of the tool-tip.
* @param {string} content content of the tool-tip.
*/
wso2vis.c.Tooltip.prototype.show = function(x, y, content) {    
	var w = this.el.style.width;
	var h = this.el.style.height;
	var deltaX = 15;
    var deltaY = 15;
	
	if ((w + x) >= (this.getWindowWidth() - deltaX)) { 
		x = x - w;
		x = x - deltaX;
	} 
	else {
		x = x + deltaX;
	}
	
	if ((h + y) >= (this.getWindowHeight() - deltaY)) { 
		y = y - h;
		y = y - deltaY;
	} 
	else {
		y = y + deltaY;
	} 
	
	this.el.style.position = 'absolute';
	this.el.style.top = y + 'px';
	this.el.style.left = x + 'px';	
	if (content != undefined) 
	    this.el.innerHTML = content;
	this.el.style.display = 'block';
	this.el.style.zindex = 1000;
};

/**
* Hides the tool-tip.
*/
wso2vis.c.Tooltip.prototype.hide = function() {
    this.el.style.display = 'none';
};

/**
* Returns current window height
* @private
*/
wso2vis.c.Tooltip.prototype.getWindowHeight = function(){
    var innerHeight;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerHeight = document.body.clientHeight;
    } 
    else {
	    innerHeight = window.innerHeight;
    }
    return innerHeight;	
};

/**
* Returns current window width
* @private
*/
wso2vis.c.Tooltip.prototype.getWindowWidth = function(){
    var innerWidth;
    if (navigator.appVersion.indexOf('MSIE')>0) {
	    innerWidth = document.body.clientWidth;
    } 
    else {
	    innerWidth = window.innerWidth;
    }
    return innerWidth;	
};

/**
 * Constructs a new DateRange.
 * @class Represents a DateRange.
 * @augments wso2vis.c.Control
 * @constructor
 */
wso2vis.c.DateRange = function() {
    this.currentTimestamp = 0;
    this.firstStart = true; // user to hide the date selection box in the first start
    this.startHr;
    this.endHr = 0;
    this.startEndHrState = "init";
    this.pageMode = 'hour'; //This is a flag set to keep the page mode (hour,day,or month);

    wso2vis.c.Control.call(this);

    this.showHours(true);
    this.showDays(true);
    this.showMonths(true);
};

wso2vis.extend(wso2vis.c.DateRange, wso2vis.c.Control);

/* Define all properties. */
wso2vis.c.DateRange.prototype.property("showHours");
wso2vis.c.DateRange.prototype.property("showDays");
wso2vis.c.DateRange.prototype.property("showMonths");

wso2vis.c.DateRange.prototype.onApplyClicked = function(mode, date1, date2) {
}

wso2vis.c.DateRange.prototype.create = function() {
    /*YAHOO.util.Event.onDOMReady(function() {*/
    //variables to keep the date interval start and end
    var styleTabMonthDisplay = '';
    var styleTabDayDisplay = '';
    var styleTabHourDisplay = '';
    var styleMonthDisplay = '';
    var styleDayDisplay = '';
    var styleHourDisplay = '';

    this.pageMode = 'none';

    if (this.showMonths()) {
        this.pageMode = 'month';
        styleMonthDisplay = '';
        styleDayDisplay = 'style="display:none"';
        styleHourDisplay = 'style="display:none"';
    }
    else {
        styleTabMonthDisplay = 'style="display:none"';
        styleMonthDisplay = 'style="display:none"';
    }

    if (this.showDays()) {
        this.pageMode = 'day';
        styleMonthDisplay = 'style="display:none"';
        styleDayDisplay = '';
        styleHourDisplay = 'style="display:none"';
    }
    else {
        styleTabDayDisplay = 'style="display:none"';
        styleDayDisplay = 'style="display:none"';
    }

    if (this.showHours()) {
        this.pageMode = 'hour';
        styleMonthDisplay = 'style="display:none"';
        styleDayDisplay = 'style="display:none"';
        styleHourDisplay = '';
    }
    else {
        styleTabHourDisplay = 'style="display:none"';
        styleHourDisplay = 'style="display:none"';
    }

    if (this.pageMode == 'none')
        return;

    var canvas = YAHOO.util.Dom.get(this.canvas());
    canvas.innerHTML = '<div style="height:40px;"><a style="cursor:pointer;" onClick="wso2vis.fn.toggleDateSelector(' + this.getID() + ')">' + 
                '<table class="time-header">' + 
                	'<tr>' + 
                    	'<td><span id="dateDisplay' + this.getID() + '"></span><img src="../images/down.png" alt="calendar" align="middle" style="margin-bottom: 4px;margin-left:5px;margin-right:5px" id="imgObj' + this.getID() + '"/></td>' +
                    '</tr>' +
                '</table>' +
            '</a></div>' +
            '<div class="dates-selection-Box yui-skin-sam" style="display:none" id="datesSelectionBox' + this.getID() + '">' +
            	'<div class="dates" style="float:left">' +
                    '<table>' +
                        '<tr>' +
                            '<td>Range</td>' +
                            '<td><input type="text" name="in" id="in' + this.getID() + '" class="in"></td>' +
                            '<td> -</td>' +
                            '<td><input type="text" name="out" id="out' + this.getID() + '" class="out"></td>' +
                        '</tr>' +
                    '</table>' +
                '</div>' +
                '<ul class="dates-types" id="datesTypes' + this.getID() + '">' +
                    '<li><a class="nor-right" id="datesSelectionBox' + this.getID() + 'MonthTab" onClick="wso2vis.fn.setPageMode(\'month\',this,' + this.getID() + ')" ' + styleTabMonthDisplay + '>Month</a></li>' +
                    '<li><a class="nor-rep" id="datesSelectionBox' + this.getID() + 'DayTab" onClick="wso2vis.fn.setPageMode(\'day\',this,' + this.getID() + ')" ' + styleTabDayDisplay + '>Day</a></li>' +
                    '<li><a class="sel-left" id="datesSelectionBox' + this.getID() + 'HourTab" onClick="wso2vis.fn.setPageMode(\'hour\',this,' + this.getID() + ')" ' + styleTabHourDisplay + '>Hour</a></li>' +
                '</ul>' +
                '<div class="dateBox-main" id="dateBox-main' + this.getID() + '"><div id="cal1Container' + this.getID() + '" ' + styleDayDisplay + '></div></div>' +
                '<div class="timeBox-main" id="timeBox-main' + this.getID() + '" ' + styleHourDisplay + '></div>' +
                '<div class="monthBox-main" id="monthBox-main' + this.getID() + '" ' + styleMonthDisplay + '></div>' +
                '<div style="clear:both;padding-top:5px;"><input type="button" value="Apply" onClick="wso2vis.fn.updatePage(' + this.getID() + ', true);wso2vis.fn.toggleDateSelector(' + this.getID() + ')" class="button"/></div>' +
            '</div>' +
            '<div style="clear:both"></div>';

    var d = new Date();
    var dateDisplay = YAHOO.util.Dom.get("dateDisplay" + this.getID());
    var inTxtTop = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
    var outTxtTop = "";
    var inTxt = YAHOO.util.Dom.get("in" + this.getID()),
            outTxt = YAHOO.util.Dom.get("out" + this.getID()),
            inDate, outDate, interval;

    inTxt.value = "";
    outTxt.value = "";

    var d = new Date();
    this.currentTimestamp = d.getTime();

    var cal = new YAHOO.example.calendar.IntervalCalendar("cal1Container" + this.getID(), {pages:3,width:60});
    var copyOfID = this.getID();

    cal.selectEvent.subscribe(function() {
        interval = this.getInterval();
        if (interval.length == 2) {
            inDate = interval[0];
            inTxt.value = (inDate.getMonth() + 1) + "/" + inDate.getDate() + "/" + inDate.getFullYear();
            inTxtTop = getStringMonth(inDate.getMonth()) + ' ' + inDate.getDate() + ',' + inDate.getFullYear();
            wso2vis.fn.getControlFromID(copyOfID).startHr = inDate.getTime();
            if (interval[0].getTime() != interval[1].getTime()) {
                outDate = interval[1];
                outTxt.value = (outDate.getMonth() + 1) + "/" + outDate.getDate() + "/" + outDate.getFullYear();
                outTxtTop = getStringMonth(outDate.getMonth()) + ' ' + outDate.getDate() + ',' + outDate.getFullYear();
                wso2vis.fn.getControlFromID(copyOfID).endHr = outDate.getTime();
            } else {
                outTxt.value = "";
                outTxtTop = "";
            }
        }
        dateDisplay.innerHTML = inTxtTop + " - " + outTxtTop;
    }, cal, true);

    cal.render();
    genTimeHours(this.getID());
    genTimeMonths(this.getID());

    //Set the time ranges
    var tmpString;
    if (this.showMonths()) {
        var twoMonthLate = new Date(getPrevMonth(getPrevMonth(d.getTime()))); //Get the prev month
        tmpString = getStringMonth(twoMonthLate.getMonth()) + ' ' + twoMonthLate.getDate() + ',' + twoMonthLate.getFullYear();
        tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
        wso2vis.fn.getControlFromID(this.getID()).startHr = twoMonthLate.getTime();
        wso2vis.fn.getControlFromID(this.getID()).endHr = d.getTime();
    }

    if (this.showDays()) {
        var sevenDayLate = new Date(d.getTime() - 7 * oneDay); //Get the yesterdays midnight
        tmpString = getStringMonth(sevenDayLate.getMonth()) + ' ' + sevenDayLate.getDate() + ',' + sevenDayLate.getFullYear();
        tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
        wso2vis.fn.getControlFromID(this.getID()).startHr = sevenDayLate.getTime();
        wso2vis.fn.getControlFromID(this.getID()).endHr = d.getTime();
    }

    if (this.showHours()) {
        wso2vis.fn.setPageMode('hour', document.getElementById('datesSelectionBox' + this.getID() + 'HourTab'), this.getID());
    }
    else if (this.showDays()) {
        wso2vis.fn.setPageMode('day', document.getElementById('datesSelectionBox' + this.getID() + 'DayTab'), this.getID());
    }
    else if (this.showMonths()) {
        wso2vis.fn.setPageMode('month', document.getElementById('datesSelectionBox' + this.getID() + 'MonthTab'), this.getID());
    }

    wso2vis.fn.updatePage(this.getID());
};


function genHourTable(timestamp, id) {
    var timeBoxMain = document.getElementById('timeBox-main' + id);
    var d = new Date(timestamp);
    var externDiv = document.createElement("DIV");
    YAHOO.util.Dom.addClass(externDiv, 'timeBox-sub');
    var insideStr = '<div class="date-title">' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + '</div>' +
            '<div class="timeBox-Wrapper">' +
            '<ul>';
    for (var i = 0; i <= 23; i++) {
        insideStr += '<li title="' + (timestamp + i * oneHour) + '" onclick="wso2vis.fn.setHourRange(this, ' + id + ')">' + i + '</li>';
    }
    insideStr += '</ul></div>';
    externDiv.innerHTML = insideStr;

    timeBoxMain.appendChild(externDiv);
}

function genTimeHours(id) {
    var clearToday = getClearTimestamp(wso2vis.fn.getControlFromID(id).currentTimestamp);


    //set the buttons
    var timeBoxMain = document.getElementById('timeBox-main' + id);
    var navButtons = '<div class="navButtons"><a class="left" onclick="wso2vis.fn.navHour(\'left\',' + id + ')"><<</a><a class="right" onclick="wso2vis.fn.navHour(\'right\',' + id + ')">>></a></div>';
    var navButtonDiv = document.createElement("DIV");
    navButtonDiv.innerHTML = navButtons;
    timeBoxMain.innerHTML = "";
    timeBoxMain.appendChild(navButtonDiv);

    genHourTable(clearToday - oneDay * 2, id);
    genHourTable(clearToday - oneDay, id);
    genHourTable(clearToday, id);
}

/**
 * Creates Month range selector.
 * @param {string} timestamp the time stamp.
 * @param {number} id .
 */
function genMonthTable(timestamp, id) {
    var timeBoxMain = document.getElementById('monthBox-main' + id);
    var d = new Date(timestamp);
    var externDiv = document.createElement("DIV");
    YAHOO.util.Dom.addClass(externDiv, 'monthBox-sub');
    var insideStr = '<div class="date-title">' + d.getFullYear() + '</div>' +
            '<div class="monthBox-Wrapper">' +
            '<ul>';
    var iTime = timestamp;
    for (var i = 0; i < m_names.length; i++) {
        insideStr += '<li title="' + iTime + '" onclick="wso2vis.fn.setMonthRange(this, ' + id + ')">' + m_names[i] + '</li>';
        iTime = getNextMonth(iTime);
    }
    insideStr += '</ul></div>';
    externDiv.innerHTML = insideStr;

    timeBoxMain.appendChild(externDiv);
}

/**
 * @param {number} id .
 */
function genTimeMonths(id) {
    //set the buttons
    var timeBoxMain = document.getElementById('monthBox-main' + id);
    var navButtons = '<div class="navButtons"><a class="left" onclick="wso2vis.fn.navMonth(\'left\',' + id + ')"><<</a><a class="right" onclick="wso2vis.fn.navMonth(\'right\', ' + id + ')">>></a></div>';
    var navButtonDiv = document.createElement("DIV");
    navButtonDiv.innerHTML = navButtons;
    timeBoxMain.innerHTML = "";
    timeBoxMain.appendChild(navButtonDiv);
    var jan1st = new Date((new Date(wso2vis.fn.getControlFromID(id).currentTimestamp)).getFullYear(), 0, 1);
    genMonthTable(getPrevYear(wso2vis.fn.getControlFromID(id).currentTimestamp), id);
    genMonthTable(jan1st.getTime(), id);
}

function getNextYear(timestamp) {
    now = new Date(timestamp);
    var current;
    current = new Date(now.getFullYear() + 1, 0, 1);
    return current.getTime();
}

function getPrevYear(timestamp) {
    now = new Date(timestamp);
    var current;
    current = new Date(now.getFullYear() - 1, 0, 1);
    return current.getTime();
}

//util function
function getStringMonth(num) {
    var m_names = new Array("January", "February", "March",
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December");

    return m_names[num];
}

function getClearTimestamp(timestamp) {
    var d = new Date(timestamp);
    var dateClear = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    return (dateClear.getTime() + d.getTimezoneOffset() * 1000 * 60);
}

function formatDate(inDate) {
    var year = inDate.split(" ")[0].split("-")[0];
    var month = inDate.split(" ")[0].split("-")[1];
    var day = inDate.split(" ")[0].split("-")[2];
    var hour = inDate.split(" ")[1].split(":")[0];

    return m_names[month - 1] + " " + day + "-" + hour + ":00";
}


/**
 * YAHOO IntervalCalender.
 */
function IntervalCalendar(container, cfg) {
    this._iState = 0;
    cfg = cfg || {};
    cfg.multi_select = true;
    IntervalCalendar.superclass.constructor.call(this, container, cfg);

    this.beforeSelectEvent.subscribe(this._intervalOnBeforeSelect, this, true);
    this.selectEvent.subscribe(this._intervalOnSelect, this, true);
    this.beforeDeselectEvent.subscribe(this._intervalOnBeforeDeselect, this, true);
    this.deselectEvent.subscribe(this._intervalOnDeselect, this, true);
}

IntervalCalendar._DEFAULT_CONFIG = YAHOO.widget.CalendarGroup._DEFAULT_CONFIG;

YAHOO.lang.extend(IntervalCalendar, YAHOO.widget.CalendarGroup, {
    _dateString : function(d) {
        var a = [];
        a[this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.MDY_MONTH_POSITION.key) - 1] = (d.getMonth() + 1);
        a[this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.MDY_DAY_POSITION.key) - 1] = d.getDate();
        a[this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.MDY_YEAR_POSITION.key) - 1] = d.getFullYear();
        var s = this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.DATE_FIELD_DELIMITER.key);
        return a.join(s);
    },

    _dateIntervalString : function(l, u) {
        var s = this.cfg.getProperty(IntervalCalendar._DEFAULT_CONFIG.DATE_RANGE_DELIMITER.key);
        return (this._dateString(l)
                + s + this._dateString(u));
    },

    getInterval : function() {
        // Get selected dates
        var dates = this.getSelectedDates();
        if (dates.length > 0) {
            // Return lower and upper date in array
            var l = dates[0];
            var u = dates[dates.length - 1];
            return [l, u];
        }
        else {
            // No dates selected, return empty array
            return [];
        }
    },

    setInterval : function(d1, d2) {
        // Determine lower and upper dates
        var b = (d1 <= d2);
        var l = b ? d1 : d2;
        var u = b ? d2 : d1;
        // Update configuration
        this.cfg.setProperty('selected', this._dateIntervalString(l, u), false);
        this._iState = 2;
    },

    resetInterval : function() {
        // Update configuration
        this.cfg.setProperty('selected', [], false);
        this._iState = 0;
    },

    _intervalOnBeforeSelect : function(t, a, o) {
        // Update interval state
        this._iState = (this._iState + 1) % 3;
        if (this._iState == 0) {
            // If starting over with upcoming selection, first deselect all
            this.deselectAll();
            this._iState++;
        }
    },

    _intervalOnSelect : function(t, a, o) {
        // Get selected dates
        var dates = this.getSelectedDates();
        if (dates.length > 1) {
            /* If more than one date is selected, ensure that the entire interval
             between and including them is selected */
            var l = dates[0];
            var u = dates[dates.length - 1];
            this.cfg.setProperty('selected', this._dateIntervalString(l, u), false);
        }
        // Render changes
        this.render();
    },

    _intervalOnBeforeDeselect : function(t, a, o) {
        if (this._iState != 0) {
            /* If part of an interval is already selected, then swallow up
             this event because it is superfluous (see _intervalOnDeselect) */
            return false;
        }
    },

    _intervalOnDeselect : function(t, a, o) {
        if (this._iState != 0) {
            // If part of an interval is already selected, then first deselect all
            this._iState = 0;
            this.deselectAll();

            // Get individual date deselected and page containing it
            var d = a[0][0];
            var date = YAHOO.widget.DateMath.getDate(d[0], d[1] - 1, d[2]);
            var page = this.getCalendarPage(date);
            if (page) {
                // Now (re)select the individual date
                page.beforeSelectEvent.fire();
                this.cfg.setProperty('selected', this._dateString(date), false);
                page.selectEvent.fire([d]);
            }
            // Swallow up since we called deselectAll above
            return false;
        }
    }
});

YAHOO.namespace("example.calendar");
YAHOO.example.calendar.IntervalCalendar = IntervalCalendar;

/* <end> YAHOO IntervalCalender */


function gotoInitMode(id) {
    var allDivs1 = document.getElementById("timeBox-main" + id).getElementsByTagName("*");
    var allDivs2 = document.getElementById("monthBox-main" + id).getElementsByTagName("*");

    for (i = 0; i < allDivs1.length; i++) {
        YAHOO.util.Dom.removeClass(allDivs1[i], 'selected');
    }
    for (i = 0; i < allDivs2.length; i++) {
        YAHOO.util.Dom.removeClass(allDivs2[i], 'selected');
    }
    wso2vis.fn.getControlFromID(id).startEndHrState = "init";
}

function getNextMonth(timestamp) {
    now = new Date(timestamp);
    var current;
    if (now.getMonth() == 11) {
        current = new Date(now.getFullYear() + 1, 0, 1);
    } else {
        current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    return current.getTime();
}

function getPrevMonth(timestamp) {
    now = new Date(timestamp);
    var current;
    if (now.getMonth() == 0) {
        current = new Date(now.getFullYear() - 1, 11, 1);
    } else {
        current = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    return current.getTime();
}

var oneDay = 1000 * 60 * 60 * 24;
var oneHour = 1000 * 60 * 60;
var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

wso2vis.fn.setPageMode = function(mode, clickedObj, id) {
    var d = new Date();
    wso2vis.fn.getControlFromID(id).pageMode = mode;
    var dateDisplay = YAHOO.util.Dom.get("dateDisplay" + id);
    var allObjs = document.getElementById("datesTypes" + id).getElementsByTagName("*");
    for (var i = 0; i < allObjs.length; i++) {
        if (YAHOO.util.Dom.hasClass(allObjs[i], "sel-left")) {
            YAHOO.util.Dom.removeClass(allObjs[i], "sel-left");
            YAHOO.util.Dom.addClass(allObjs[i], "nor-left");
        }
        if (YAHOO.util.Dom.hasClass(allObjs[i], "sel-right")) {
            YAHOO.util.Dom.removeClass(allObjs[i], "sel-right");
            YAHOO.util.Dom.addClass(allObjs[i], "nor-right");
        }
        if (YAHOO.util.Dom.hasClass(allObjs[i], "sel-rep")) {
            YAHOO.util.Dom.removeClass(allObjs[i], "sel-rep");
            YAHOO.util.Dom.addClass(allObjs[i], "nor-rep");
        }
    }
    var timeBoxMain = document.getElementById('timeBox-main' + id);
    var cal1Container = document.getElementById('cal1Container' + id);
    var monthBoxMain = document.getElementById('monthBox-main' + id);
    gotoInitMode(id);
    if (wso2vis.fn.getControlFromID(id).pageMode == 'hour') {
        timeBoxMain.style.display = '';
        cal1Container.style.display = 'none';
        monthBoxMain.style.display = 'none';
        YAHOO.util.Dom.removeClass(clickedObj, "nor-left");
        YAHOO.util.Dom.addClass(clickedObj, "sel-left");
        if (wso2vis.fn.getControlFromID(id).startEndHrState == 'init') {
            var hourLate = new Date(d.getTime() - oneHour * 8);
            var tmpString = getStringMonth(hourLate.getMonth()) + ' ' + hourLate.getDate() + ',' + hourLate.getFullYear() + ' - <span class="hourStrong">' + hourLate.getHours() + ':00</span>';
            tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + ' - <span class="hourStrong">' + d.getHours() + ':00</span>';
            dateDisplay.innerHTML = tmpString;
        }
        wso2vis.fn.updatePage(id);
    }
    if (wso2vis.fn.getControlFromID(id).pageMode == 'day') {
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        timeBoxMain.style.display = 'none';
        monthBoxMain.style.display = 'none';
        cal1Container.style.display = '';
        YAHOO.util.Dom.removeClass(clickedObj, "nor-rep");
        YAHOO.util.Dom.addClass(clickedObj, "sel-rep");
        if (wso2vis.fn.getControlFromID(id).startEndHrState == 'init') {
            var sevenDayLate = new Date(d.getTime() - 7 * oneDay); //Get the yesterdays midnight
            var tmpString = getStringMonth(sevenDayLate.getMonth()) + ' ' + sevenDayLate.getDate() + ',' + sevenDayLate.getFullYear();
            tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
            dateDisplay.innerHTML = tmpString;
            wso2vis.fn.getControlFromID(id).startHr = sevenDayLate.getTime();
            wso2vis.fn.getControlFromID(id).endHr = d.getTime();
        }
        wso2vis.fn.updatePage(id);
    }
    if (wso2vis.fn.getControlFromID(id).pageMode == 'month') {
        d = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
        timeBoxMain.style.display = 'none';
        monthBoxMain.style.display = '';
        cal1Container.style.display = 'none';
        YAHOO.util.Dom.removeClass(clickedObj, "nor-right");
        YAHOO.util.Dom.addClass(clickedObj, "sel-right");
        if (wso2vis.fn.getControlFromID(id).startEndHrState == 'init') {
            var twoMonthLate = new Date(getPrevMonth(getPrevMonth(d.getTime()))); //Get the prev month
            var tmpString = getStringMonth(twoMonthLate.getMonth()) + ' ' + twoMonthLate.getDate() + ',' + twoMonthLate.getFullYear();
            tmpString += ' -> ' + getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
            dateDisplay.innerHTML = tmpString;
            wso2vis.fn.getControlFromID(id).startHr = twoMonthLate.getTime();
            wso2vis.fn.getControlFromID(id).endHr = d.getTime();
        }
        wso2vis.fn.updatePage(id);
    }
};

wso2vis.fn.updatePage = function(id, butt) {
    if (butt !== undefined)
        (wso2vis.fn.getControlFromID(id)).onApplyClicked(wso2vis.fn.getControlFromID(id).pageMode, wso2vis.fn.getControlFromID(id).startHr, wso2vis.fn.getControlFromID(id).endHr);

    if (!wso2vis.fn.getControlFromID(id).firstStart) {
        var now = new Date();
        if (wso2vis.fn.getControlFromID(id).startEndHrState == "init") {
            if (wso2vis.fn.getControlFromID(id).pageMode == "hour") {
                now = getClearTimestamp(now.getTime());
                wso2vis.fn.getControlFromID(id).startHr = now - 8 * oneHour;
                wso2vis.fn.getControlFromID(id).endHr = now;
            } else if (wso2vis.fn.getControlFromID(id).pageMode == "day") {
                now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                wso2vis.fn.getControlFromID(id).startHr = now.getTime() - oneDay * 7;
                wso2vis.fn.getControlFromID(id).endHr = now.getTime();
            } else if (wso2vis.fn.getControlFromID(id).pageMode == "month") {
                now = new Date(now.getFullYear(), now.getMonth(), 1);
                wso2vis.fn.getControlFromID(id).startHr = getPrevMonth(getPrevMonth(now.getTime()));
                wso2vis.fn.getControlFromID(id).endHr = now.getTime();
            }
        } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
            wso2vis.fn.getControlFromID(id).endHr = wso2vis.fn.getControlFromID(id).startHr;
            if (wso2vis.fn.getControlFromID(id).pageMode == "hour") {
                wso2vis.fn.getControlFromID(id).startHr = wso2vis.fn.getControlFromID(id).startHr - 8 * oneHour;
            } else if (wso2vis.fn.getControlFromID(id).pageMode == "day") {
                wso2vis.fn.getControlFromID(id).startHr = wso2vis.fn.getControlFromID(id).startHr - oneDay * 7;
            } else if (wso2vis.fn.getControlFromID(id).pageMode == "month") {
                wso2vis.fn.getControlFromID(id).startHr = getPrevMonth(getPrevMonth(wso2vis.fn.getControlFromID(id).startHr));
            }
        } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
        }
    }
    wso2vis.fn.getControlFromID(id).firstStart = false;
    //var startHrToSend = wso2vis.fn.getControlFromID(id).startHr-oneHour*1/2;
    //var endHrToSend = wso2vis.fn.getControlFromID(id).endHr-oneHour*1/2;
};

wso2vis.fn.setHourRange = function(theli, id) {
    var inTxt = YAHOO.util.Dom.get("in" + id),outTxt = YAHOO.util.Dom.get("out" + id),dateDisplay = YAHOO.util.Dom.get("dateDisplay" + id);
    var timestamp = theli.title;
    timestamp = parseInt(timestamp);
    var allDivs = document.getElementById("timeBox-main" + id).getElementsByTagName("*");

    if (wso2vis.fn.getControlFromID(id).startEndHrState == "init") {
        wso2vis.fn.getControlFromID(id).startHr = timestamp;
        for (var i = 0; i < allDivs.length; i++) {
            YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
        }
        YAHOO.util.Dom.addClass(theli, 'selected');
        wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";
        //set the headers and the text boxes
        var d = new Date(timestamp);
        inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " - " + d.getHours() + ":00";
        outTxt.value = '';
        var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + ' - <span class="hourStrong">' + d.getHours() + ':00</span>';
        dateDisplay.innerHTML = tmpString;

    } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
        wso2vis.fn.getControlFromID(id).startHr = timestamp;
        for (var i = 0; i < allDivs.length; i++) {
            YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
        }
        YAHOO.util.Dom.addClass(theli, 'selected');
        wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";

        //set the headers and the text boxes
        var d = new Date(timestamp);
        inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " - " + d.getHours() + ":00";
        outTxt.value = '';
        var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear() + ' - <span class="hourStrong">' + d.getHours() + ':00</span>';
        dateDisplay.innerHTML = tmpString;

    } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
        wso2vis.fn.getControlFromID(id).endHr = timestamp;
        if (wso2vis.fn.getControlFromID(id).startHr > wso2vis.fn.getControlFromID(id).endHr) {//Swap if the end time is smaller than start time
            var tmp = wso2vis.fn.getControlFromID(id).endHr;
            wso2vis.fn.getControlFromID(id).endHr = wso2vis.fn.getControlFromID(id).startHr;
            wso2vis.fn.getControlFromID(id).startHr = tmp;
        }
        for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
                YAHOO.util.Dom.addClass(allDivs[i], 'selected');
            }
            else {
                YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
            }
        }
        wso2vis.fn.getControlFromID(id).startEndHrState = "endSet";

        //set the headers and the text boxes
        var dStart = new Date(wso2vis.fn.getControlFromID(id).startHr);
        var dEnd = new Date(wso2vis.fn.getControlFromID(id).endHr);
        inTxt.value = (dStart.getMonth() + 1) + "/" + dStart.getDate() + "/" + dStart.getFullYear() + " - " + dStart.getHours() + ":00";
        outTxt.value = (dEnd.getMonth() + 1) + "/" + dEnd.getDate() + "/" + dEnd.getFullYear() + " - " + dEnd.getHours() + ":00";
        var tmpString = getStringMonth(dStart.getMonth()) + ' ' + dStart.getDate() + ',' + dStart.getFullYear() + ' - <span class="hourStrong">' + dStart.getHours() + ':00</span>' + ' -> ' + getStringMonth(dEnd.getMonth()) + ' ' + dEnd.getDate() + ',' + dEnd.getFullYear() + ' - <span class="hourStrong">' + dEnd.getHours() + ':00</span>';
        dateDisplay.innerHTML = tmpString;
    }
};

wso2vis.fn.navHour = function(direction, id) {
    if (direction == "left") {
        wso2vis.fn.getControlFromID(id).currentTimestamp -= oneDay;
    } else if (direction == "right") {
        wso2vis.fn.getControlFromID(id).currentTimestamp += oneDay;
    }
    genTimeHours(id);
    var allDivs = document.getElementById("timeBox-main" + id).getElementsByTagName("*");
    if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
        for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].title == wso2vis.fn.getControlFromID(id).startHr) {
                YAHOO.util.Dom.addClass(allDivs[i], 'selected');
            }
        }
    } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
        for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
                YAHOO.util.Dom.addClass(allDivs[i], 'selected');
            }
            else {
                YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
            }
        }
    }
};

wso2vis.fn.navMonth = function(direction, id) {
    if (direction == "left") {
        wso2vis.fn.getControlFromID(id).currentTimestamp = getPrevYear(wso2vis.fn.getControlFromID(id).currentTimestamp);
    } else if (direction == "right") {
        wso2vis.fn.getControlFromID(id).currentTimestamp = getNextYear(wso2vis.fn.getControlFromID(id).currentTimestamp);
    }
    genTimeMonths(id);
    var allDivs = document.getElementById("monthBox-main" + id).getElementsByTagName("*");
    if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
        for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].title == wso2vis.fn.getControlFromID(id).startHr) {
                YAHOO.util.Dom.addClass(allDivs[i], 'selected');
            }
        }
    } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
        for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
                YAHOO.util.Dom.addClass(allDivs[i], 'selected');
            }
            else {
                YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
            }
        }
    }
};

wso2vis.fn.setMonthRange = function(theli, id) {
    var inTxt = YAHOO.util.Dom.get("in" + id),outTxt = YAHOO.util.Dom.get("out" + id),dateDisplay = YAHOO.util.Dom.get("dateDisplay" + id);
    var timestamp = theli.title;
    timestamp = parseInt(timestamp);
    var allDivs = document.getElementById("monthBox-main" + id).getElementsByTagName("*");

    if (wso2vis.fn.getControlFromID(id).startEndHrState == "init") {
        wso2vis.fn.getControlFromID(id).startHr = timestamp;
        for (var i = 0; i < allDivs.length; i++) {
            YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
        }
        YAHOO.util.Dom.addClass(theli, 'selected');
        wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";
        //set the headers and the text boxes
        var d = new Date(timestamp);
        inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        outTxt.value = '';
        var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
        dateDisplay.innerHTML = tmpString;

    } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "endSet") {
        wso2vis.fn.getControlFromID(id).startHr = timestamp;
        for (var i = 0; i < allDivs.length; i++) {
            YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
        }
        YAHOO.util.Dom.addClass(theli, 'selected');
        wso2vis.fn.getControlFromID(id).startEndHrState = "startSet";

        //set the headers and the text boxes
        var d = new Date(timestamp);
        inTxt.value = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
        outTxt.value = '';
        var tmpString = getStringMonth(d.getMonth()) + ' ' + d.getDate() + ',' + d.getFullYear();
        dateDisplay.innerHTML = tmpString;

    } else if (wso2vis.fn.getControlFromID(id).startEndHrState == "startSet") {
        wso2vis.fn.getControlFromID(id).endHr = timestamp;
        if (wso2vis.fn.getControlFromID(id).startHr > wso2vis.fn.getControlFromID(id).endHr) {//Swap if the end time is smaller than start time
            var tmp = wso2vis.fn.getControlFromID(id).endHr;
            wso2vis.fn.getControlFromID(id).endHr = wso2vis.fn.getControlFromID(id).startHr;
            wso2vis.fn.getControlFromID(id).startHr = tmp;
        }
        for (var i = 0; i < allDivs.length; i++) {
            if (allDivs[i].title <= wso2vis.fn.getControlFromID(id).endHr && allDivs[i].title >= wso2vis.fn.getControlFromID(id).startHr) {
                YAHOO.util.Dom.addClass(allDivs[i], 'selected');
            }
            else {
                YAHOO.util.Dom.removeClass(allDivs[i], 'selected');
            }
        }
        wso2vis.fn.getControlFromID(id).startEndHrState = "endSet";

        //set the headers and the text boxes
        var dStart = new Date(wso2vis.fn.getControlFromID(id).startHr);
        var dEnd = new Date(wso2vis.fn.getControlFromID(id).endHr);
        inTxt.value = (dStart.getMonth() + 1) + "/" + dStart.getDate() + "/" + dStart.getFullYear();
        outTxt.value = (dEnd.getMonth() + 1) + "/" + dEnd.getDate() + "/" + dEnd.getFullYear();
        var tmpString = getStringMonth(dStart.getMonth()) + ' ' + dStart.getDate() + ',' + dStart.getFullYear() + ' -> ' + getStringMonth(dEnd.getMonth()) + ' ' + dEnd.getDate() + ',' + dEnd.getFullYear();
        dateDisplay.innerHTML = tmpString;
    }
};

wso2vis.fn.toggleDateSelector = function(id) {
    var anim = "";
    var attributes;
    var datesSelectionBox = document.getElementById('datesSelectionBox' + id);
    var imgObj = document.getElementById('imgObj' + id);
    if (datesSelectionBox.style.display == "none") {
        attributes = {
            opacity: { to: 1 },
            height: { to: 230 }
        };
        anim = new YAHOO.util.Anim('datesSelectionBox' + id, attributes);
        datesSelectionBox.style.display = "";
        imgObj.src = "../images/up.png";
    } else {
        attributes = {
            opacity: { to: 0 },
            height: { to: 0 }
        };
        anim = new YAHOO.util.Anim('datesSelectionBox' + id, attributes);

        anim.onComplete.subscribe(function() {
            datesSelectionBox.style.display = "none";
        }, datesSelectionBox);
        imgObj.src = "../images/down.png";
    }

    anim.duration = 0.3;
    anim.animate();
};