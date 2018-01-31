function Shader(vertSrc, fragSrc, disp)
{
	disp = disp || window.display;
	
	var gl = disp.gl;
	
	this.display = disp;
	this.gl = disp.gl;
	this.vertSrc = vertSrc;
	this.fragSrc = fragSrc;
	this.texUnitCounter = 0;
	this.indexBuf = null;
	
	this.vertShader = gl.createShader(gl.VERTEX_SHADER);
	this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	gl.shaderSource(this.vertShader, this.vertSrc);
	gl.shaderSource(this.fragShader, this.fragSrc);
	
	gl.compileShader(this.vertShader);
	gl.compileShader(this.fragShader);

	if(!gl.getShaderParameter(this.vertShader, gl.COMPILE_STATUS)) {
		throw(
			"Error: Vertex shader compilation failed: " +
			gl.getShaderInfoLog(this.vertShader)
		);
	}

	if(!gl.getShaderParameter(this.fragShader, gl.COMPILE_STATUS)) {
		throw(
			"Error: Fragment shader compilation failed: " +
			gl.getShaderInfoLog(this.fragShader)
		);
	}
	
	this.prog = gl.createProgram();
	
	gl.attachShader(this.prog, this.vertShader);
	gl.attachShader(this.prog, this.fragShader);
	
	gl.linkProgram(this.prog);
	
	if(!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
		throw(
			"A shader program linkage error occurred: " +
			this.gl.getProgramInfoLog(this.prog)
		);
	}
	
	this.attributes = {};
	this.uniforms = {};
	
	gl.useProgram(this.prog);
	
	var numAttributes = gl.getProgramParameter(this.prog, gl.ACTIVE_ATTRIBUTES);

	for(var i=0; i<numAttributes; i++) {
		var info = gl.getActiveAttrib(this.prog, i);

		this.attributes[info.name] = {
			location: gl.getAttribLocation(this.prog, info.name),
			type: info.type,
		};
	}
	
	var numUniforms = gl.getProgramParameter(this.prog, gl.ACTIVE_UNIFORMS);

	for(var i=0; i<numUniforms; i++) {
		var info = gl.getActiveUniform(this.prog, i);
		
		this.uniforms[info.name] = {
			location: gl.getUniformLocation(this.prog, info.name),
			type: info.type,
			size: info.size,
		};
	}
};
	
Shader.prototype = {

	constructor: Shader,
	
	setAttribute: function(name, buffer, stride, offset) //, divisor)
	{
		stride = stride || 0;
		offset = offset || 0;
		//divisor = divisor || 0;
		
		var gl = this.gl;
		//var glia = this.glia;
		var attrib = this.attributes[name];
		
		if(attrib === undefined) return this;
		
		var type = attrib.type;
		var location = attrib.location;
		
		var components = (
			type === gl.FLOAT ? 1 :
			type === gl.FLOAT_VEC2 ? 2 :
			type === gl.FLOAT_VEC3 ? 3 :
			type === gl.FLOAT_VEC4 ? 4 :
			0
		);
		
		if(components === 0) {
			throw "Error: Attribute type not supported.";
		}
		
		gl.bindBuffer(buffer.target, buffer.buf);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, components, buffer.gltype, false, stride, offset);
		//glia.vertexAttribDivisorANGLE(location, divisor);
		
		return this;
	},
	
	setUniform: function(name, value)
	{
		value = Array.isArray(value) ? value : [value];
		
		var gl = this.gl;
		var uniform = this.uniforms[name];
		
		if(uniform === undefined) return this;
		
		var type = uniform.type;
		var location = uniform.location;
		
		var func = (
			type === gl.FLOAT ? gl.uniform1fv :
			type === gl.FLOAT_VEC2 ? gl.uniform2fv :
			type === gl.FLOAT_VEC3 ? gl.uniform3fv :
			type === gl.FLOAT_VEC4 ? gl.uniform4fv :
			type === gl.INT || gl.BOOL ? gl.uniform1iv :
			type === gl.INT_VEC2 || gl.BOOL_VEC2 ? gl.uniform2iv :
			type === gl.INT_VEC3 || gl.BOOL_VEC3 ? gl.uniform3iv :
			type === gl.INT_VEC4 || gl.BOOL_VEC4 ? gl.uniform4iv :
			type === gl.FLOAT_MAT2 ? gl.uniformMatrix2fv :
			type === gl.FLOAT_MAT3 ? gl.uniformMatrix3fv :
			type === gl.FLOAT_MAt4 ? gl.uniformMatrix4fv :
			null
		);
		
		var matrix = type === gl.FLOAT_MAT2 || type === gl.FLOAT_MAT3 ||type === gl.FLOAT_MAT4;
		
		if(func === null) {
			throw "Error: Uniform type not supported.";
		}
		
		gl.useProgram(this.prog);
		
		if(matrix) {
			func.call(gl, location, false, value);
		}
		else {
			func.call(gl, location, value);
		}
		
		return this;
	},
	
	setTexture: function(name, texture)
	{
		var gl = this.gl;
		var uniform = this.uniforms[name];
		
		if(uniform === undefined) return this;
		
		var type = uniform.type;
		var location = uniform.location;
		
		if(type !== gl.SAMPLER_2D) {
			throw "Error: Uniform type must be sampler2D.";
		}
		
		this.gl.activeTexture(this.gl.TEXTURE0 + this.texUnitCounter);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.tex);
		this.gl.uniform1i(location, this.texUnitCounter);
		this.texUnitCounter ++;
		
		return this;
	},
	
	resetTextures: function()
	{
		this.texUnitCounter = 0;
		
		return this;
	},
	
	setIndices: function(buffer)
	{
		var gl = this.gl;
		
		this.indexBuf = buffer;
	
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.buf);
	},
	
	drawTriangleStrip: function()
	{
		var gl = this.gl;
		
		if(this.indexBuf !== null) {
			gl.drawElements(gl.TRIANGLE_STRIP, this.indexBuf.len, this.indexBuf.gltype, 0);
		}
		else {
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
	},

};

cache.shaders = cache.shaders || {};

loader.shader = function(shaderName, vertUrls, fragUrls, callback, disp)
{
	vertUrls = Array.isArray(vertUrls) ? vertUrls : [vertUrls];
	fragUrls = Array.isArray(fragUrls) ? fragUrls : [fragUrls];
	
	var vertUrlsToLoad = vertUrls.length;
	var fragUrlsToLoad = fragUrls.length;
	var vertSrc = null;
	var fragSrc = null;
	
	function vertSrcLoad()
	{
		vertUrlsToLoad --;
	
		if(vertUrlsToLoad === 0) {
			vertSrc = "precision highp float;precision highp int;";
			vertSrc += this.combineTextFromUrls(vertUrls);
			
			if(vertSrc !== null && fragSrc !== null) {
				cache.shaders[shaderName] = new Shader(vertSrc, fragSrc, disp);
				callback();
			}
		}
	}
	
	function fragSrcLoad()
	{
		fragUrlsToLoad --;
	
		if(fragUrlsToLoad === 0) {
			fragSrc = "precision highp float;precision highp int;";
			fragSrc += this.combineTextFromUrls(fragUrls);
			
			if(vertSrc !== null && fragSrc !== null) {
				cache.shaders[shaderName] = new Shader(vertSrc, fragSrc, disp);
				callback();
			}
		}
	}
	
	callback = callback || noop;
	disp = disp || display;

	if(cache.shaders[shaderName]) {
		callback();
		return this;
	}
	
	for(var i=0; i<vertUrls.length; i++) {
		var url = vertUrls[i];
		
		this.text(url, vertSrcLoad.bind(this));
	}
	
	for(var i=0; i<fragUrls.length; i++) {
		var url = fragUrls[i];
		
		this.text(url, fragSrcLoad.bind(this));
	}
	
	return this;
};

loader.combineTextFromUrls = function(urls)
{
	var res = "";
	
	for(var i=0; i<urls.length; i++) {
		var url = urls[i];
		var text = this.getItem(url);
		res += text;
	}
	
	return res;
};
