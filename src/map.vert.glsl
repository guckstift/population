#version 330 core

out vec4 color;

void main()
{
	if(gl_VertexID == 0) {
		gl_Position = vec4(0, 0, 0, 1);
		color = vec4(1, 0, 0, 1);
	}
	else if(gl_VertexID == 1) {
		gl_Position = vec4(1, 0, 0, 1);
		color = vec4(0, 1, 0, 1);
	}
	else if(gl_VertexID == 2) {
		gl_Position = vec4(0, 1, 0, 1);
		color = vec4(0, 0, 1, 1);
	}
}
