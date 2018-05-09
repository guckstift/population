export default class Shader
{
	constructor(display, vertsrc, fragsrc)
	{
		//console.log("shader");
		
		var gl = display.gl;
		
		this.display    = display;
		this.prog       = gl.createProgram();
		this.vert       = gl.createShader(gl.VERTEX_SHADER);
		this.frag       = gl.createShader(gl.FRAGMENT_SHADER);
		this.texcnt     = 0;
		
		gl.shaderSource(this.vert, vertsrc);
		gl.shaderSource(this.frag, fragsrc);

		gl.compileShader(this.vert);
		gl.compileShader(this.frag);

		if(!gl.getShaderParameter(this.vert, gl.COMPILE_STATUS)) {
			throw "Error: Vertex shader compilation failed: " + gl.getShaderInfoLog(this.vert);
		}

		if(!gl.getShaderParameter(this.frag, gl.COMPILE_STATUS)) {
			throw "Error: Fragment shader compilation failed: " + gl.getShaderInfoLog(this.frag);
		}

		gl.attachShader(this.prog, this.vert);
		gl.attachShader(this.prog, this.frag);
		gl.linkProgram(this.prog);

		if(!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
			throw "Error: Shader program linking failed: " + gl.getProgramInfoLog(this.prog);
		}
		
		var numAttributes = gl.getProgramParameter(this.prog, gl.ACTIVE_ATTRIBUTES);

		for(var i=0; i<numAttributes; i++) {
			this.createAttributeSetter(i);
		}

		var numUniforms = gl.getProgramParameter(this.prog, gl.ACTIVE_UNIFORMS);

		for(var i=0; i<numUniforms; i++) {
			this.createUniformSetter(i);
		}
	}
	
	use()
	{
		if(this.display.usedshader !== this) {
			this.display.gl.useProgram(this.prog);
			this.display.usedshader = this;
		}
		
		return this;
	}
	
	createAttributeSetter(index)
	{
		var gl   = this.display.gl;
		var info = gl.getActiveAttrib(this.prog, index);
		var name = info.name.match(/[a-zA-Z0-9_]+/)[0];
		var loca = gl.getAttribLocation(this.prog, name);
		var type = info.type;
		
		var components = (
			type === gl.FLOAT      ? 1 :
			type === gl.FLOAT_VEC2 ? 2 :
			type === gl.FLOAT_VEC3 ? 3 :
			type === gl.FLOAT_VEC4 ? 4 :
			0
		);
		
		this[name] = (buffer, stride = 0, offset = 0, divisor = 0) =>
		{
			this.use();
			buffer.update();
			gl.bindBuffer(buffer.target, buffer.buf);
			gl.enableVertexAttribArray(loca);
			gl.vertexAttribPointer(loca, components, buffer.gltype, false, stride, offset);
			
			if(this.display.glia) {
				this.display.glia.vertexAttribDivisorANGLE(loca, divisor);
			}
			
			return this;
		};
		
		return this;
	}
	
	createUniformSetter(index)
	{
		var gl      = this.display.gl;
		var info    = gl.getActiveUniform(this.prog, index);
		var name    = info.name.match(/[a-zA-Z0-9_]+/)[0];
		var loca    = gl.getUniformLocation(this.prog, name);
		var type    = info.type;
		var size    = info.size;
		var texunit = info.type === gl.SAMPLER_2D ? this.texcnt : 0;
	
		if(type === gl.SAMPLER_2D) {
			if(size > 1) {
				this[name] = textures =>
				{
					var texunits = [];
	
					for(var i=0; i<textures.length; i++) {
						texunits.push(texunit + i);
						gl.activeTexture(gl.TEXTURE0 + texunits[i]);
						gl.bindTexture(gl.TEXTURE_2D, textures[i].tex);
						textures[i].update();
					}
					
					this.use();
					gl.uniform1iv(loca, texunits);
					
					return this;
				};
			}
			else {
				this[name] = texture =>
				{
					this.use();
					gl.activeTexture(gl.TEXTURE0 + texunit);
					gl.bindTexture(gl.TEXTURE_2D, texture.tex);
					gl.uniform1i(loca, texunit);
					texture.update();
					
					return this;
				};
			}
			
			this.texcnt += size;
		}
		else {
			var func = (
				type === gl.FLOAT ? gl.uniform1f :
				type === gl.FLOAT_VEC2 ? gl.uniform2fv :
				type === gl.FLOAT_VEC3 ? gl.uniform3fv :
				type === gl.FLOAT_VEC4 ? gl.uniform4fv :
				type === gl.INT || type === gl.BOOL ? gl.uniform1i :
				type === gl.INT_VEC2 || type === gl.BOOL_VEC2 ? gl.uniform2iv :
				type === gl.INT_VEC3 || type === gl.BOOL_VEC3 ? gl.uniform3iv :
				type === gl.INT_VEC4 || type === gl.BOOL_VEC4 ? gl.uniform4iv :
				type === gl.FLOAT_MAT2 ? gl.uniformMatrix2fv :
				type === gl.FLOAT_MAT3 ? gl.uniformMatrix3fv :
				type === gl.FLOAT_MAT4 ? gl.uniformMatrix4fv :
				null
			);
			
			if(func === null) {
				throw "Error: Uniform type not supported.";
			}

			if(type === gl.FLOAT_MAT2 || type === gl.FLOAT_MAT3 || type === gl.FLOAT_MAT4) {
				this[name] = value =>
				{
					this.use();
					func.call(gl, loca, false, value);
					
					return this;
				};
			}
			else {
				this[name] = value =>
				{
					this.use();
					func.call(gl, loca, value);
					
					return this;
				};
			}
		}
	}
}
