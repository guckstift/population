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
i = 0

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
	
	# other
	else:
		result += combined[i]
		i += 1

result += "\n"

open("game.bundle.js", "w").write(result)
