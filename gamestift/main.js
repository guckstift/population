main();

function main()
{
	loadScript("gamestift/loader.js", onLoaderLoad);
}

function onLoaderLoad()
{
	loader
		.script("gamestift/libs/seedrandom.min.js")
		.error(onGamestiftError)
		.ready(function() {
			loader
				.script("gamestift/math.js")
				.script("gamestift/display.js")
				.script("gamestift/label.js")
				.script("gamestift/buffer.js")
				.script("gamestift/shader.js")
				.script("gamestift/texture.js")
				.ready(onGamestiftLoad);
		});
}

function onGamestiftError(url)
{
	throw "Error: Couldn't find " + url;
}

function onGamestiftLoad()
{
	loader
		.script("src/main.js")
	;
}

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
