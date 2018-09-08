#include <SDL.h>
#include <GL/glew.h>
#include "shaders.h"
#include "helper.h"

void resize(int w, int h)
{
	printf("resize %i %i\n", w, h);
	glViewport(0, 0, w, h);
}

GLuint vao;

int main(int argc, char **argv)
{	
	SDL_Init(SDL_INIT_VIDEO);
	
	SDL_GL_SetAttribute(SDL_GL_RED_SIZE, 8);
	SDL_GL_SetAttribute(SDL_GL_GREEN_SIZE, 8);
	SDL_GL_SetAttribute(SDL_GL_BLUE_SIZE, 8);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
	SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 3);
	
	SDL_Window *wnd = SDL_CreateWindow("Hello", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
		800, 600, SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE);
	
	if(wnd == 0) {
		fprintf(stderr, "window creation failed\n");
	}
	
	SDL_GLContext *gl = SDL_GL_CreateContext(wnd);
	
	if(gl == 0) {
		fprintf(stderr, "context creation failed\n");
	}
	
	glewExperimental = GL_TRUE;
	GLenum res = glewInit();
	
	if(res != GLEW_OK) {
		fprintf(stderr, "glew initialization failed\n");
	}
	
	SDL_GL_SetSwapInterval(1);
	
	glGenVertexArrays(1, &vao);
	glBindVertexArray(vao);
	
	GLuint prog = createShader(src_map_vert_glsl, src_map_frag_glsl);
	
	resize(800, 600);
	glClearColor(0.25, 0.5, 1, 1);
	
	SDL_Event ev;
	int running = 1;
	
	while(running) {
		while(SDL_PollEvent(&ev)) {
			switch(ev.type) {
				case SDL_QUIT:
					running = 0;
					break;
				case SDL_WINDOWEVENT:
					switch(ev.window.event) {
						case SDL_WINDOWEVENT_RESIZED:
							resize(ev.window.data1, ev.window.data2);
							break;
					}
					break;
			}
		}
		
		glClear(GL_COLOR_BUFFER_BIT);
		glUseProgram(prog);
		glDrawArrays(GL_TRIANGLE_STRIP, 0, 3);
		SDL_GL_SwapWindow(wnd);
	}
	
	return 0;
}
