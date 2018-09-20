import {loadShader, getShaderVars, createShader} from "./utils.js";
import {gl} from "./display.js";

let cache = {};

export default function shader(id, vertSrc, fragSrc)
{
	if(cache[id]) {
		return cache[id];
	}
	
	return cache[id] = new Shader(vertSrc, fragSrc);
}

shader.fromUrls = function(vertUrls, fragUrls)
{
	vertUrls = Array.isArray(vertUrls) ? vertUrls : [vertUrls];
	fragUrls = Array.isArray(fragUrls) ? fragUrls : [fragUrls];
	
	let id = vertUrls.join(";") + ";" + fragUrls.join(";");
	
	if(cache[id]) {
		return cache[id];
	}
	
	return cache[id] = new ExternalShader(vertUrls, fragUrls);
}

class Shader 
{
	constructor(vertSrc, fragSrc)
	{
		this.prog = createShader(gl, vertSrc, fragSrc);
		this.vars = getShaderVars(gl, this.prog);
	}
	
	use()
	{
		gl.useProgram(this.prog);
	}
}

class ExternalShader
{
	constructor(vertUrls, fragUrls)
	{
		this.onLoad = this.onLoad.bind(this);
		this.ready = loadShader(gl, vertUrls, fragUrls).then(this.onLoad);
	}
	
	use()
	{
		if(this.prog) {
			gl.useProgram(this.prog);
		}
	}
	
	onLoad(prog)
	{
		this.prog = prog;
		this.vars = getShaderVars(gl, prog);
	}
}
