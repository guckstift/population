#!/usr/bin/env python3
import sys, os.path, json, PIL.Image
outfile = sys.argv[1]
infiles = sys.argv[2:]
textures = []
print(str(len(infiles)), "images to store")
for name in infiles:
	orig = PIL.Image.open(name)
	bbox = orig.getbbox()
	crop = orig.crop(bbox)
	textures.append({ "name": name, "orig": orig, "bbox": bbox, "crop": crop })
textures.sort(key = lambda x: x["crop"].size[1], reverse = True)
for power in range(12):
	size = 2 ** power
	okay = True
	left = top = count = 0
	extents = [0] * size
	for tex in textures:
		width, height = tex["crop"].size
		if left + width > size: left = 0
		top = max(extents[left : left + width])
		while top + height > size:
			left += 1
			if left + width > size: okay = False; break
			top = max(extents[left : left + width])
		if not okay: break
		tex["texpos"] = (left, top)
		extents[left : left + width] = [top + height] * width
		left += width
		count += 1
	if okay: break
	print("size", size, "did not work.", count, "images fit into it.")
result = PIL.Image.new("RGBA", (size, size))
for tex in textures: result.paste(tex["crop"], tex["texpos"])
result.save(outfile)
open(os.path.splitext(outfile)[0] + ".json", "w").write(json.dumps({"name":outfile, "size":size,
"textures":[{"name":tex["name"], "origsize":tex["orig"].size, "cropbox":tex["bbox"],
"texpos":tex["texpos"]} for tex in textures ] }, indent = "\t"))
