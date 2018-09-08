function newElm(tag)
{
	return document.createElement(tag);
}

function elmById(id)
{
	return document.getElementById(id)
}

function elmBySrc(src)
{
	return document.querySelectorAll("[src=\"" + src + "\"]")[0];
}
