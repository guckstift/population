var promises = [];
var items    = {};
var textures = {};
var shaders  = {};
var display  = undefined;
var noop     = () => {};

export default
{
	items: items,
	promises: promises,
	textures: textures,
	shaders: shaders,
	
	image(url, readyFunc = noop)
	{
		var url = "gfx/" + url;
		
		if(url in items) {
			readyFunc(items[url]);
			
			return this;
		}
		
		promises.push(new Promise((res, rej) => {
			let img = document.createElement("img");
			img.addEventListener("load", () => res(items[url] = img));
			img.setAttribute("src", url);
		}).then(readyFunc));
		
		return this;
	},
	
	text(url, readyFunc = noop)
	{
		if(url in items) {
			promises.push(items[url].then(val => {readyFunc(val); return val;}));
			
			return this;
		}
		
		var prom = new Promise((res, rej) => {
			let xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.addEventListener("load", () => res(xhr.responseText));
			xhr.send();
		}).then(val => {readyFunc(val); return val;});
		
		promises.push(prom);
		
		items[url] = prom;
		
		return this;
	},
	
	json(url, readyFunc = noop)
	{
		this.text(url, text => readyFunc(JSON.parse(text)));
		
		return this;
	},
	
	texture(url, readyFunc = noop)
	{
		if(url in textures) {
			promises.push(textures[url].then(readyFunc));
			
			return this;
		}
		
		var prom = new Promise((res, rej) => {
	        this.image(url, img => res(display.texture(img)));
		}).then(val => {readyFunc(val); return val;});
		
		promises.push(prom);
		
		textures[url] = prom;
		
		return this;
	},
	
	shader(vertUrls, fragUrls, readyFunc = noop)
	{
		var id       = vertUrls.join("|") + "|" + fragUrls.join("|");
		var vertUrls = vertUrls.map(v => "shaders/" + v);
		var fragUrls = fragUrls.map(v => "shaders/" + v);
		var vertSrcs = {};
		var fragSrcs = {};
		
		if(id in shaders) {
			promises.push(shaders[id].then(readyFunc));
			
			return this;
		}
		
		var vertProms = vertUrls.map(url => new Promise((res, rej) => {
			this.text(url, src => {vertSrcs[url] = src; res();})
		}));
		
		var fragProms = fragUrls.map(url => new Promise((res, rej) => {
			this.text(url, src => {fragSrcs[url] = src; res();})
		}));
		
		var prom = Promise.all(
			[...vertProms, ...fragProms]
		).then(() => {
			var shader = display.shader(
		        vertUrls.reduce((src, url) => src + vertSrcs[url], ""),
		        fragUrls.reduce((src, url) => src + fragSrcs[url], ""),
		    );
			readyFunc(shader);
			return shader;
		});
		
		promises.push(prom);
		
		shaders[id] = prom;
		
		return this;
	},
	
	display(_display)
	{
		display = _display;
	},
	
	ready(readyFunc)
	{
		Promise.all(promises).then(readyFunc);
		
		return this;
	},
}
