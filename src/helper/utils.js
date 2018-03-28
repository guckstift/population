log = console.log;

function noop()
{
}

function basename(path)
{
	return path.split("/").slice(-1)[0]
}

function stripext(path)
{
	return path.split(".").slice(0, -1).join(".")
}

function getext(filename)
{
	return filename.split(".").pop();
}

function elmById(id)
{
	return document.getElementById(id);
}

function elmByTag(tag)
{
	return document.getElementsByTagName(tag)[0];
}

function elmsByName(name)
{
	return document.getElementsByName(name);
}

function newElm(tag)
{
	return document.createElement(tag);
}

function loadScript(url, callback, errorcb)
{
	var script = newElm("script");
	
	callback = callback || noop;
	errorcb = errorcb || noop;
	
	script.src = url;
	script.addEventListener("load", callback);
	script.addEventListener("error", errorcb);
	document.head.appendChild(script);
}

function subclass(newclass, baseclass)
{
	newclass.prototype = Object.create(baseclass.prototype, {constructor: newclass});
}

function defclass(proto)
{
	if(typeof proto === "function") {
		return extendclass.apply(this, arguments);
	}

	var ctor = proto.constructor;

	ctor.prototype = proto;

	return implynew(ctor);
}

function extendclass(base, proto)
{
	var newproto = Object.create(base.prototype);
	var keys = Object.keys(proto);
	
	for(var i=0; i<keys.length; i++) {
		var key = keys[i];
		
		newproto[key] = proto[key];
	}
	
	return defclass(newproto);
}
			
function implynew(func)
{
	return function decorated()
	{
		if(!(this instanceof func)) {
			return new (func.bind.apply(func, arguments));
		}
	}
}
