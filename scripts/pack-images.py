#!/usr/bin/env python3

import sys
import os.path
import json
from PIL import Image

outfile = sys.argv[1]
infiles = sys.argv[2:]
textures = []

print(str(len(infiles)), "images to store")

for name in infiles:
	orig = Image.open(name)
	bbox = orig.getbbox()
	crop = orig.crop(bbox)
	textures.append({
		"name": name,
		"orig": orig,
		"bbox": bbox,
		"crop": crop,
	})

textures.sort(key = lambda x: x["crop"].size[1], reverse = True)

for power in range(1,12):
	size = 2 ** power
	okay = True
	left = 0
	top = 0
	extents = [0] * size
	count = 0
	
	for tex in textures:
		width = tex["crop"].width
		height = tex["crop"].height
		
		if left + width > size:
			left = 0
		
		top = max(extents[left : left + width])
		
		while top + height > size:
			left += 1
			top = max(extents[left : left + width])
			
			if left + width > size:
				okay = False
				break
		
		if not okay:
			break
		
		tex["texpos"] = (left, top)
		extents[left : left + width] = [top + height] * width
		left += width
		count += 1
	
	if okay:
		break
	
	print("size", size, "did not work.", count, "images fit into it.")

result = Image.new("RGBA", (size, size))

for tex in textures:
	result.paste(tex["crop"], tex["texpos"])

result.save(outfile)

texdata = {
	"name": outfile,
	"size": size,
	"textures": [
		{
			"name": tex["name"],
			"origsize": tex["orig"].size,
			"cropbox": tex["bbox"],
			"texpos": tex["texpos"],
		}
		for tex in textures
	]
}

jsonfile = os.path.splitext(outfile)[0] + ".json"
open(jsonfile, "w").write(json.dumps(texdata, indent = "\t"))
