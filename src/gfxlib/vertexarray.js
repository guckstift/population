import display from "./display.js";

let gl = display.gl;
let glia = display.glia;
let glvao = display.glvao;

export default class VertexArray
{
	constructor(shader)
	{
		this.shader = shader;
		this.vao = glvao.createVertexArrayOES();
	}
	
	bind()
	{
		glvao.bindVertexArrayOES(this.vao);
	}
	
	assign(buffer, name, size, stride = 0, offset = 0, divisor = 0)
	{
		let loca = this.shader.vars[name];
		
		if(loca === undefined) {
			throw "Error: shader variable " + name + " is not defined.";
		}
		
		this.bind();
		buffer.bind();
		gl.enableVertexAttribArray(loca);
		gl.vertexAttribPointer(loca, size, buffer.glType, false, stride, offset);
		glia.vertexAttribDivisorANGLE(loca, divisor);
	}
	
	indices(buffer)
	{
		this.bind();
		buffer.bind();
	}
}
