#!/usr/bin/env python3

from PIL import Image, ImageDraw, ImageOps, ImageFont

font = ImageFont.truetype("UbuntuMono-R.ttf", 16)
font = ImageFont.truetype("Ubuntu-R.ttf", 14)

for i in range(32,128):

	c = chr(i)
	im = Image.new("RGBA", (20, 32), (0, 0, 0, 0))
	draw = ImageDraw.Draw(im)
	draw.text((1, 1), c, (255, 255, 255, 255), font)
	bbox = im.getbbox() or (0, 0, im.size[0], im.size[1])
	realbbox = bbox
	bbox = (bbox[0], 0, bbox[2], im.size[1])
	im = im.crop(bbox)
	im = ImageOps.expand(im, 1)
	pixels = im.load()
	size = im.size

	for x in range(size[0]):
		for y in range(size[1]):
			
			val1 = 255 + 192 - int(255 * y / realbbox[3])
			val2 = 255 + 64 - int(255 * y / realbbox[3])
			
			if pixels[x,y][3] < 128:
				pixels[x,y] = (0, 0, 0, 0)
			else:
				pixels[x,y] = (val1, val1, val2, 255)

	imDest = im.copy()
	pixelsDest = imDest.load()

	for x in range(size[0]):
		for y in range(size[1]):
			
			col =  (0, 0, 0, 255)
	
			if pixels[x,y][3] == 255:
		
				if x > 0 and pixels[x-1, y][3] == 0:
					pixelsDest[x-1, y] = col
		
				if y > 0 and pixels[x, y-1][3] == 0:
					pixelsDest[x, y-1] = col
		
				if x < size[0] and pixels[x+1, y][3] == 0:
					pixelsDest[x+1, y] = col
		
				if y < size[1] and pixels[x, y+1][3] == 0:
					pixelsDest[x, y+1] = col

	imDest.save("gfxsets/chars/char-" + str(i) + ".png")
