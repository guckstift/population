#!/usr/bin/env python3

import sys
from PIL import Image

im = Image.open(sys.argv[2])
bbox = im.getbbox()
region = im.crop(bbox)
region.save(sys.argv[1])
