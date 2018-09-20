export default function dom(src, ...args)
{
	if(typeof src === "function") {
		dom.on(window, "load", src);
	}
	else {
		return configArgs(typeof src === "string" ? dom.elm(src) : src, ...args);
	}
};

dom.id = id => document.getElementById(id);
dom.elm = tag => document.createElement(tag);
dom.txt = text => document.createTextNode(text);
dom.rem = elm => elm.parentNode && elm.parentNode.removeChild(elm);
dom.remat = (parent, i) => parent.childNodes[i] && dom.rem(parent.childNodes[i]);
dom.insert = (parent, elm, i) => parent.insertBefore(elm, parent.childNodes[i]);
dom.cls = (elm, ...classes) => elm.classList.add(...classes);
dom.cls.rem = (elm, ...classes) => elm.classList.remove(...classes);
dom.cls.tog = (elm, cls) => elm.classList.toggle(cls);
dom.on = (elm, event, cb) => elm.addEventListener(event, cb);
dom.off = (elm, event, cb) => elm.removeEventListener(event, cb);
dom.clear = elm => elm.innerHTML = "";
dom.sel = (sel, elm = dom.doc) => elm.querySelectorAll(sel);
dom.body = document.body;
dom.head = document.head;
dom.doc = document;
dom.ready = new Promise(res => window.addEventListener("load", res));

dom.div = function(cls, ...children)
{
	return dom("div", {class: cls}, ...children);
};

dom.html = function(html)
{
	let elm = document.createElement("div");
	
	elm.innerHTML = html;
	
	return elm.firstChild;
};

dom.children = function(elm, sel)
{
	if(sel) {
		return [...elm.children].filter(child => child.matches(sel));
	}
	else {
		return [...elm.children];
	}
};

function configArgs(elm, ...args)
{
	args.forEach(arg => configArg(elm, arg));
	
	return elm;
}

function configArg(elm, arg)
{
	if(arg instanceof Node) {
		elm.appendChild(arg);
	}
	else if(arg !== null && typeof arg === "object") {
		assignArgs(elm, arg);
	}
	else {
		elm.appendChild(dom.txt(arg));
	}
}

function assignArgs(elm, obj)
{
	for(let key in obj) {
		assignArg(elm, key, obj[key]);
	}
}

function assignArg(elm, key, val)
{
	if(key === "class" && Array.isArray(val)) {
		let classes = val.filter(Boolean);
		classes.length && dom.cls(elm, ...classes);
	}
	else if(key in elm) {
		elm[key] = val;
	}
	else if(key in elm.style) {
		elm.style[key] = val;
	}
	else {
		elm.setAttribute(key, val);
	}
}

dom(e => {
	dom.body = document.body;
	dom.head = document.head;
});
