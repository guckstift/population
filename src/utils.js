function noop()
{
}

log = console.log;

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
