#!/usr/bin/env python3

import os

for d in os.listdir("gfxsets"):
	res = os.system("./libs/spritegl/scripts/pack-images.py gfx/" + d + ".png gfxsets/" + d + "/*")
	if res != 0:
		exit()

