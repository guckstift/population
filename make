#!/usr/bin/env python3

import os
import subprocess
import glob

srcdir = "src"
builddir = "build"
cflags = "-std=c11 `sdl2-config --cflags` `pkg-config glew --cflags`"
ldflags = "`sdl2-config --libs` `pkg-config glew --libs`"

class Target:

	def __init__(self, name, deps, recipe):
	
		self.name = name
		self.deps = deps
		self.recipe = recipe
	
	def mtime(self):
	
		return 0 if not os.path.isfile(self.name) else os.path.getmtime(self.name)
	
	def depNames(self):
	
		return " ".join([dep.name for dep in self.deps])
	
	def update(self):
	
		depsUpdated = False
	
		for dep in self.deps:
		
			dep.update()
			
			if dep.mtime() > self.mtime():
				depsUpdated = True
		
		if depsUpdated:
			print("updating '" + self.name + "'")
			dirname = os.path.dirname(self.name)
			os.makedirs(dirname, exist_ok=True)
			self.recipe(self)
			return True
		
		return False

def compileCfile(target):

	runCmd("gcc -o " + target.name + " " + target.depNames() + " -c " + cflags)

def compileBinary(target):

	runCmd("gcc -o " + target.name + " " + target.depNames() + " " + ldflags)

def packShaders(target):

	res = ""
	
	for dep in target.deps:
	
		glsl = dep.name
		varname = glsl.replace("/", "_").replace(".", "_").strip("_")
		glsrc = open(glsl).read().splitlines()
		res += "const char *" + varname + " = \n"
		
		res += "\n".join(
			'\t"' + line.replace("\t", "\\t") + '\\n"'
			for line in glsrc
		)
		
		res += ";\n"
	
	open(target.name, "w").write(res)
	
def packShadersHeader(target):

	hres = ""
	
	for dep in target.deps:
	
		glsl = dep.name
		varname = glsl.replace("/", "_").replace(".", "_").strip("_")
		hres += "extern const char *" + varname + ";\n"
	
	open(target.name, "w").write(hres)

def noop(target):

	pass

def touchFile(target):

	os.utime(target.name)

def runCmd(cmd):

	print("$", cmd)
	
	return subprocess.run(cmd, shell=True)

def getHeaderDeps(cfile):

	src = open(cfile).read()
	dirname = os.path.dirname(cfile)
	headers = []
	
	for line in src.splitlines():
		
		if line.startswith("#include \""):
			hfile = dirname + "/" + line.replace("#include \"", "")[:-1]
			if hfile not in headers:
				headers.append(hfile)
			headers = list(set(headers + getHeaderDeps(hfile)))
	
	return headers

glsls = glob.glob("./" + srcdir + "/*.glsl", recursive=True)
glsls = [Target(glsl, [], noop) for glsl in glsls]
shadersC = Target("./" + srcdir + "/shaders.c", glsls, packShaders)
shadersH = Target("./" + srcdir + "/shaders.h", glsls, packShadersHeader)

shadersC.update()
shadersH.update()

ofiles = []

for cfile in glob.glob("./" + srcdir + "/*.c", recursive=True):

	hdeps = [Target(hdep, [], noop) for hdep in getHeaderDeps(cfile)]
	ofile = os.path.splitext(cfile)[0].replace("/" + srcdir + "/", "/" + builddir + "/") + ".o"
	cfile = Target(cfile, hdeps, noop)
	ofile = Target(ofile, [cfile], compileCfile)
	ofiles.append(ofile)

populationBin = Target("./" + builddir + "/population", ofiles, compileBinary)

if not populationBin.update():
	print("everything is up-to-date")

