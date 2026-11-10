import sys, bpy, numpy as np
img = bpy.data.images.load(sys.argv[1]); w, h = img.size
a = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(a); a = a.reshape(h, w, 4)[::-1]
np.save(sys.argv[2], a[..., 3]); print(w, h)
