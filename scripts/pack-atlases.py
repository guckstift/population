#!/usr/bin/env python3

import os

for d in os.listdir("gfxsets"):
	os.system("./libs/spritegl/scripts/pack-images.py gfx/" + d + ".png gfxsets/" + d + "/*")

