#!/usr/bin/env python3

doDebug = False

def findpos(destw, desth, srcw, srch, left, extents):

	while left + srcw <= destw:
	
		if max(extents[left : left + srcw]) + srch <= desth:
			return left
		
		left += 1
	
	left = 0
	
	while left + srcw <= destw:
	
		if max(extents[left : left + srcw]) + srch <= desth:
			return left
		
		left += 1
	
	return None

def packwith(destw, desth, textures):

	left = 0
	top = 0
	extents = [0] * destw
	count = 0

	for tex in textures:
	
		width = tex["crop"].width
		height = tex["crop"].height
		found = findpos(destw, desth, width, height, left, extents)
		
		if found is None:
			break
		
		left = found
		top = max(extents[left : left + width])
		tex["pos"] = (left, top)
		extents[left : left + width] = [top + height] * width
		left += width
		count += 1

	return count

import sys
import os.path
import json
from PIL import Image, ImageDraw

outfile = sys.argv[1]
infiles = sys.argv[2:]
textures = []

total = len(infiles)

print(total, "images to store")

for name in infiles:
	orig = Image.open(name)
	bbox = orig.convert("RGBa").getbbox()
	crop = orig.crop(bbox)
	textures.append({
		"name": os.path.basename(name),
		"orig": orig,
		"bbox": bbox,
		"crop": crop,
	})
	
	print(orig.size, bbox)

textures.sort(key = lambda x: x["crop"].width, reverse = True) # sort by descending width

for powerx in range(12):

	for powery in range(powerx + 1):
	
		sizex = 2 ** powerx
		sizey = 2 ** powery
		count = packwith(sizex, sizey, textures)
		
		if count == total: break
		
		print("size", sizex, "x", sizey, "did not work.", count, "images fit into it.")
	
	if count == total: break

if count == total:

	print("size", sizex, "x", sizey, "did work. all", count, "images fit into it.")
	
	result = Image.new("RGBA", (sizex, sizey))
	
	if doDebug:
		draw = ImageDraw.Draw(result)
	
	for tex in textures:
		result.paste(tex["crop"], tex["pos"])
	
	if doDebug:
		for tex in textures:
			draw.rectangle([
				tex["pos"][0],
				tex["pos"][1],
				tex["pos"][0] + tex["crop"].size[0],
				tex["pos"][1] + tex["crop"].size[1],
			])

	result.save(outfile)

	texdata = {
		"source": outfile,
		"size": [sizex, sizey],
		"frames": [
			{
				"name": tex["name"],
				"size": tex["crop"].size,
				"osize": tex["orig"].size,
				"pos": tex["pos"],
				"pad": tex["bbox"][:2],
			}
			for tex in textures
		]
	}

	jsonfile = os.path.splitext(outfile)[0] + ".json"
	fs = open(jsonfile, "w")
	json = json.dumps(texdata, sort_keys = True, separators = (",",":"))
	fs.write(json)
