#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "helper.h"

GLuint createShader(const GLchar *vertSrc, const GLchar *fragSrc)
{
	GLuint vert = glCreateShader(GL_VERTEX_SHADER);
	GLuint frag = glCreateShader(GL_FRAGMENT_SHADER);
	GLuint prog = glCreateProgram();
	
	const GLchar *str1[] = {vertSrc};
	const GLint int1[] = {strlen(vertSrc)};
	glShaderSource(vert, 1, str1, int1);
	
	const GLchar *str2[] = {fragSrc};
	const GLint int2[] = {strlen(fragSrc)};
	glShaderSource(frag, 1, str2, int2);
	
	glCompileShader(vert);
	glCompileShader(frag);
	
	GLint status;
	
	glGetShaderiv(vert, GL_COMPILE_STATUS, &status);
	
	if(status == GL_FALSE) {
		GLchar info[1024];
		GLsizei size;
		glGetShaderInfoLog(vert, 1024, &size, info);
		fprintf(stderr, "vertex shader compilation error: %s\n", info);
		exit(-1);
	}
	
	glGetShaderiv(frag, GL_COMPILE_STATUS, &status);
	
	if(status == GL_FALSE) {
		GLchar info[1024];
		GLsizei size;
		glGetShaderInfoLog(frag, 1024, &size, info);
		fprintf(stderr, "fragment shader compilation error: %s\n", info);
		exit(-1);
	}
	
	glAttachShader(prog, vert);
	glAttachShader(prog, frag);
	glLinkProgram(prog);
	
	glGetProgramiv(prog, GL_LINK_STATUS, &status);
	
	if(status == GL_FALSE) {
		GLchar info[1024];
		GLsizei size;
		glGetProgramInfoLog(prog, 1024, &size, info);
		fprintf(stderr, "shader linking error: %s\n", info);
		exit(-1);
	}
	
	glDeleteShader(vert);
	glDeleteShader(frag);
	
	return prog;
}

