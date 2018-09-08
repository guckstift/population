#!/usr/bin/env python3

import sys
import os.path
import json
from PIL import Image, ImageDraw

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

def pack(outfile, infiles):

	textures = []
	total = len(infiles)

	print(total, "images to store")

	for name in infiles:
		orig = Image.open(name)
		bbox = orig.convert("RGBa").getbbox() or (0,0,orig.size[0],orig.size[1])
		crop = orig.crop(bbox)
		textures.append({
			"name": os.path.basename(os.path.splitext(name)[0]),
			"ourl": name,
			"orig": orig,
			"bbox": bbox,
			"crop": crop,
		})
	
		print(orig.size, bbox)

	# sort by descending width
	textures.sort(key = lambda x: x["crop"].width * 1000000 + x["crop"].height, reverse = True)

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
					tex["pos"][0] + tex["crop"].size[0] - 1,
					tex["pos"][1] + tex["crop"].size[1] - 1,
				])

		result.save(outfile)
		
		texdata = {
			"texurl": outfile,
			"texsize": [sizex, sizey],
			"frames": {},
		}
		
		for tex in textures:
		
			print( tex["bbox"])
			texdata["frames"][tex["name"]] = {
				"name": tex["name"],
				"ourl": tex["ourl"],
				"size": tex["crop"].size,
				"osize": tex["orig"].size,
				"pos": tex["pos"],
				"pad": tex["bbox"][:2],
			}

		setname = os.path.basename(os.path.splitext(outfile)[0])
		print(setname)
		jsonfile = os.path.splitext(outfile)[0] + ".js"
		fs = open(jsonfile, "w")
		jsn = "var framesets = {} || framesets;\n"
		jsn += "framesets[\"" + setname + "\"] = "
		jsn += json.dumps(texdata, sort_keys = True, separators = (",",":"))
		jsn += ";"
		fs.write(jsn)


def main():

	pack(sys.argv[1], sys.argv[2:])

if __name__ == "__main__":
	main()

