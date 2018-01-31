#!/usr/bin/env python3

from html.parser import HTMLParser

alnums = list("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_")
white = list(" \t\r\n")

sources = []

class ScriptFinder(HTMLParser):
	def handle_starttag(self, tag, attribs):
		if tag == "script":
			for name, val in attribs:
				if name == "src":
					sources.append(val)

parser = ScriptFinder()
parser.feed(open("dev.html", "r").read())

combined = "(function(){" + "\n".join([open(src).read() for src in sources]) + "})();"
result = ""

state = "start"
start = 0
i = 0

scopestack = [{"__counter": 0}]
counter = 0

def codevar(n):
	res = ""
	while n > 0:
		res += alnums[n % 52]
		n //= 52
	if res == "":
		res = "a"
	if res == "if":
		res += "_"
	return res

def beginScope():
	scope = scopestack[-1]
	scopestack.append({"__counter": scope["__counter"]})

def endScope():
	scopestack.pop()

def lookup(name):
	for scope in reversed(scopestack):
		if name in scope:
			return scope[name]
	return name

def register(name):
	scope = scopestack[-1]
	if name not in scope:
		newname = newName()
		scope[name] = newname
		return newname
	else:
		return scope[name]

def newName():
	scope = scopestack[-1]
	name = codevar(scope["__counter"])
	scope["__counter"] += 1
	return name

while i < len(combined):

	# single line comments
	if combined[i:i+2] == "//":
		i = combined.find("\n", i)
	
	# multi line comments
	elif combined[i:i+2] == "/*":
		i = combined.find("*/", i) + 2
	
	# strings to preserve
	elif combined[i:i+1] == '"':
		s = i
		i = combined.find('"', i + 1) + 1
		result += combined[s:i]
	
	# whitespace
	elif combined[i] in white:
		while combined[i] in white:
			i += 1
		if result[-1] in alnums and combined[i] in alnums:
			result += " "
	
	# begin scope
	elif combined[i] == "{":
		beginScope()
		result += "{"
		i += 1
	
	# end scope
	elif combined[i] == "}":
		endScope()
		result += "}"
		i += 1
	
	# var declaration
	elif combined[i:i+3] == "var" and combined[i+3:i+4] not in alnums:
		i += 3
		while combined[i] in white:
			i += 1
		s = i
		while combined[i] in alnums:
			i += 1
		name = combined[s:i]
		newname = register(name)
		result += "var " + newname
	
	# function declaration
	elif combined[i:i+8] == "function" and combined[i+8:i+9] not in alnums:
		i += 8
		while combined[i] in white:
			i += 1
		s = i
		while combined[i] in alnums:
			i += 1
		name = combined[s:i]
		if name != "":
			newname = register(name)
			result += "function " + newname
		else:
			result += "function"
		while combined[i] != "(":
			i += 1
		i += 1
		result += "("
		beginScope()
		pcount = 0
		while combined[i] != ")":
			if pcount > 0:
				result += ","
			pcount += 1
			s = i
			while combined[i] in alnums:
				i += 1
			param = combined[s:i]
			newname = register(param)
			result += newname
			while combined[i] not in alnums and combined[i] != ")":
				i += 1
		i += 1
		result += ")"
		while combined[i] != "{":
			i += 1
		result += "{"
		i += 1
	
	# identifier
	elif combined[i] in alnums:
		s = i
		while combined[i] in alnums:
			i += 1
		name = combined[s:i]
		if combined[s-1] != ".":
			result += lookup(name)
		else:
			result += name
	
	# other
	else:
		result += combined[i]
		i += 1

result += "\n"

open("game.bundle.js", "w").write(result)
