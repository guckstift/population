cache = {
};

loader = {

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
	
	parseUrl: function(url)
	{
		var path = url.split("/").filter(Boolean);
		
		for(var i=0; i<path.length; i++) {
			path[i] = path[i].replace(/[^a-zA-Z0-9]+/g, "_");
		}
		
		return path;
	},
	
	setItem: function(url, item)
	{
		var path = this.parseUrl(url);
		var dir = cache;
		var base = path[path.length - 1];
		
		if(path.length > 1) {
			for(var i=0; i<path.length-1; i++) {
				var part = path[i];
				
				if(dir[part] === undefined) {
					dir[part] = {}
				}
				
				dir = dir[part]
			}
		}
		
		dir[base] = item;
	},
	
	getItem: function(url)
	{
		var path = this.parseUrl(url);
		var dir = cache;
		var base = path[path.length - 1];
		
		if(path.length > 1) {
			for(var i=0; i<path.length-1; i++) {
				var part = path[i];
				
				if(dir[part] === undefined) {
					return undefined;
				}
				
				dir = dir[part]
			}
		}
		
		return dir[base];
	},
	
	image: function(url, callback)
	{
		var img = newElm("img");
		
		callback = callback || noop;
		
		if(this.getItem(url) !== undefined) {
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
			this.setItem(url, img);
			//this.images[name] = img;
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
		var xhr = new XMLHttpRequest();
		
		callback = callback || noop;
		
		if(this.getItem(url) !== undefined) {
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
				this.setItem(url, xhr.responseText);
				//this.texts[name] = xhr.responseText;
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
		callback = callback || noop;

		if(this.getItem(url) !== undefined) {
			callback();
			return this;
		}

		this.text(url, textLoad.bind(this));
	
		return this;
		
		function textLoad()
		{
			var text = this.getItem(url);
			var json = JSON.parse(text);
			this.setItem(url, json);
			callback();
		}
	},
	
	script: function(url, callback)
	{
		callback = callback || noop;

		if(this.getItem(url) !== undefined) {
			callback();
			return this;
		}
		
		this.itemsToLoad++;
		
		loadScript(url, scriptLoad.bind(this), this.onError.bind(this, url));
		
		return this;
		
		function scriptLoad()
		{
			this.setItem(url, true);
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
