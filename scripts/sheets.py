#!/usr/bin/env python3
"""Build one contact sheet per model and size from the step screenshots (needs Pillow)."""
import glob
import json
import os
import sys

from PIL import Image

out = sys.argv[1] if len(sys.argv) > 1 else 'shots'
summary = json.load(open(os.path.join(out, 'summary.json')))
for entry in summary:
    ims = [Image.open(f) for f in entry['files']]
    for im in ims:
        im.thumbnail((260, 560))
    cols = min(6, len(ims))
    rows = (len(ims) + cols - 1) // cols
    w, h = ims[0].width, ims[0].height
    sheet = Image.new('RGB', (cols * w, rows * h), 'white')
    for k, im in enumerate(ims):
        sheet.paste(im, ((k % cols) * w, (k // cols) * h))
    name = os.path.join(out, f"sheet-{entry['size']}-{entry['id']}.png")
    sheet.save(name)
    print(name, sheet.size)
