export function nextPowerOfTwo(v)
{
	v--;
	v |= v >> 1;
	v |= v >> 2;
	v |= v >> 4;
	v |= v >> 8;
	v |= v >> 16;
	v++;
	
	return v;
}

export function createGl(options)
{
	return document.createElement("canvas").getContext("webgl", options);
}

export function createTex(gl)
{
	let tex = gl.createTexture();
	
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	return tex;
}

export function updateDataTex(gl, tex, w, h, data)
{
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

export function resizeDataTex(gl, tex, w, h, data)
{
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

export function createDataTex(gl, w, h)
{
	let tex = createTex(gl);
	
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	return tex;
}

export function updateImgTex(gl, tex, img)
{
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
}


export function createImgTex(gl, img)
{
	let tex = createTex(gl);
	
	updateImgTex(gl, tex, img);
	
	return tex;
}

export function createEmptyTex(gl, width, height)
{
	let tex = createTex(gl);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	return tex;
}

export function createShader(gl, vertSrc, fragSrc, inputProg = null)
{
	let prog = inputProg || gl.createProgram();
	let vert = gl.createShader(gl.VERTEX_SHADER);
	let frag = gl.createShader(gl.FRAGMENT_SHADER);
	
	gl.shaderSource(vert, vertSrc);
	gl.shaderSource(frag, fragSrc);
	gl.compileShader(vert);
	gl.compileShader(frag);
	
	if(!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
		throw "Error: Vertex shader compilation failed: " + gl.getShaderInfoLog(vert);
	}
	
	if(!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
		throw "Error: Fragment shader compilation failed: " + gl.getShaderInfoLog(frag);
	}
	
	gl.attachShader(prog, vert);
	gl.attachShader(prog, frag);
	gl.linkProgram(prog);
	
	if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		throw "Error: Shader program linking failed: " + gl.getProgramInfoLog(prog);
	}
	
	return prog;
}

export function getShaderVars(gl, prog)
{
	let vars = {};
	let numAttributes = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
	let numUniforms = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
	
	for(let i=0; i<numAttributes; i++) {
		let info = gl.getActiveAttrib(prog, i);
		let name = info.name.match(/^[a-zA-Z0-9_]+/)[0];
		let loca = gl.getAttribLocation(prog, name);
		vars[name] = loca;
	}
	
	for(let i=0; i<numUniforms; i++) {
		let info = gl.getActiveUniform(prog, i);
		let name = info.name.match(/^[a-zA-Z0-9_]+/)[0];
		let loca = gl.getUniformLocation(prog, name);
		vars[name] = loca;
	}
	
	return vars;
}

export function loadText(url)
{
	return fetch(url).then(resp => resp.text());
}

export function loadShader(gl, vertUrls, fragUrls)
{
	return Promise.all([
		Promise.all(
			vertUrls.map(loadText)
		).then(txts => txts.join()),
		Promise.all(
			fragUrls.map(loadText)
		).then(txts => txts.join()),
	]).then(
		([vertSrc, fragSrc]) => createShader(gl, vertSrc, fragSrc)
	);
}

export function loadImage(url)
{
	return new Promise(res => {
		let img = document.createElement("img");
		img.src = url;
		img.addEventListener("load", e => res(img))
	});
}

export function getImagePixels(img)
{
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext("2d");
	
	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);
	
	return ctx.getImageData(0, 0, img.width, img.height).data;
}

export function getImageBox(img)
{
	let box = {x: 0, y: 0, w: img.width, h: img.height};
	let pixels = getImagePixels(img);
	
	for(let found = false, x = 0; !found && x < img.width; x ++) {
		for(let y = 0; !found && y < img.height; y ++) {
			let col = pixels.subarray(4 * (y * img.width + x));
			if(col[3] > 0) {
				box.x = x;
				box.w -= box.x;
				found = true;
			}
		}
	}
	
	for(let found = false, y = 0; !found && y < img.height; y ++) {
		for(let x = box.x; !found && x < img.width; x ++) {
			let col = pixels.subarray(4 * (y * img.width + x));
			if(col[3] > 0) {
				box.y = y;
				box.h -= box.y;
				found = true;
			}
		}
	}
	
	for(let found = false, w = box.w; !found && w >= 0; w --) {
		for(let y = box.y; !found && y < img.height; y ++) {
			let col = pixels.subarray(4 * (y * img.width + (box.x + w - 1)));
			if(col[3] > 0) {
				box.w = w;
				found = true;
			}
		}
	}
	
	for(let found = false, h = box.h; !found && h >= 0; h --) {
		for(let x = box.x; !found && x < box.x + box.w; x ++) {
			let col = pixels.subarray(4 * ((box.y + h - 1) * img.width + x));
			if(col[3] > 0) {
				box.h = h;
				found = true;
			}
		}
	}
	
	return box;
}
