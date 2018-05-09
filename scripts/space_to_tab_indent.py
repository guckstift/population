#!/usr/bin/env python3

import sys, re

lines = 0

def replacer(match):

	global lines
	
	tabcnt = int(len(match.group(2)) / 4)
	lines += 1
	
	return "\n" + "\t" * tabcnt

infilename = sys.argv[1]
infile = open(infilename).read()
outfile = re.sub(r"(\n((    )+))", replacer, infile)

open(infilename, "w").write(outfile)

print(lines, "lines modified")
