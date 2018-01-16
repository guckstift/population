loader = {

	images: {},
	texts: {},
	jsons: {},
	scripts: {},
	itemsToLoad: 0,
	waitCallback: noop,
	errorCallback: noop,
	
	ready: function(callback)
	{
		if(this.itemsToLoad === 0) {
			callback();
		}
		else {
			this.waitCallback = callback;
		}
	
		return this;
	},
	
	error: function(callback)
	{
		this.errorCallback = callback;
	
		return this;
	},
		
	onError: function(url)
	{
		this.errorCallback(url);
	},
	
	urlToName: function(url)
	{
		url = basename(url);
		url = stripext(url);
		url = url.replace(/[^a-zA-Z0-9]+/g, "_");
		
		return url;
	},
	
	image: function(url, callback)
	{
		var name = this.urlToName(url);
		var img = newElm("img");
		
		callback = callback || noop;
		
		if(this.images[name] !== undefined) {
			callback();
			return this;
		}
		
		this.itemsToLoad++;
		
		img.addEventListener("load", imgLoad.bind(this));
		img.addEventListener("error", this.onError.bind(this, url));
		img.src = url;
	
		return this;
		
		function imgLoad()
		{
			this.images[name] = img;
			this.itemsToLoad--;
			callback();

			if(this.itemsToLoad === 0) {
				var cb = this.waitCallback;
				this.waitCallback = noop;
				cb.call(this);
			}
		}
	},
	
	text: function(url, callback)
	{
		var name = this.urlToName(url);
		var xhr = new XMLHttpRequest();
		
		callback = callback || noop;
		
		if(this.texts[name] !== undefined) {
			callback();
			return this;
		}
		
		this.itemsToLoad++;

		xhr.open("GET", url);
		xhr.addEventListener("load", xhrLoad.bind(this));
		xhr.send();
	
		return this;
		
		function xhrLoad()
		{
			if(xhr.status === 200) {
				this.texts[name] = xhr.responseText;
				this.itemsToLoad--;
				callback();
	
				if(this.itemsToLoad === 0) {
					var cb = this.waitCallback;
					this.waitCallback = noop;
					cb.call(this);
				}
			}
			else {
				this.onError(url);
			}
		}
	},

	json: function(url, callback)
	{
		var name = this.urlToName(url);
		
		callback = callback || noop;

		if(this.jsons[name] !== undefined) {
			callback();
			return this;
		}

		this.text(url, textLoad.bind(this));
	
		return this;
		
		function textLoad()
		{
			var text = this.texts[name];
			var json = JSON.parse(text);
			this.jsons[name] = json;
			callback();
		}
	},
	
	script: function(url, callback)
	{
		var name = this.urlToName(url);
		
		callback = callback || noop;

		if(this.scripts[name] !== undefined) {
			callback();
			return this;
		}
		
		this.itemsToLoad++;
		
		loadScript(url, scriptLoad.bind(this), this.onError.bind(this, url));
		
		return this;
		
		function scriptLoad()
		{
			this.scripts[name] = true;
			this.itemsToLoad--;
			callback();

			if(this.itemsToLoad === 0) {
				var cb = this.waitCallback;
				this.waitCallback = noop;
				cb.call(this);
			}
		}
	},
};
