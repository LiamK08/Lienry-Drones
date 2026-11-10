"""Hide small background signs: inside each feathered rectangle, desaturate and darken toward the surrounding dark tone.
usage: python3 unsign.py in.jpg out.jpg x0,y0,x1,y1[,k] ..."""
import sys, subprocess, numpy as np
src, dst, rects = sys.argv[1], sys.argv[2], sys.argv[3:]
import os
ALPHA = os.environ.get("ALPHA")
w, h = (int(v) for v in subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", src]).decode().strip().split(","))
a = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]), np.uint8).reshape(h, w, 3).astype(np.float32)
for r in rects:
    v = [float(x) for x in r.split(",")]
    x0, y0, x1, y1 = (int(t) for t in v[:4]); k = v[4] if len(v) > 4 else 0.3
    pad = 10
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)
    reg = a[Y0:Y1, X0:X1]
    ring = np.concatenate([a[Y0:y0, X0:X1].reshape(-1, 3), a[y1:Y1, X0:X1].reshape(-1, 3), a[Y0:Y1, X0:x0].reshape(-1, 3), a[Y0:Y1, x1:X1].reshape(-1, 3)])
    tone = np.median(ring, 0)
    lum = reg.mean(2, keepdims=True)
    tgt = tone + (lum - lum.mean()) * k  # the surrounding tone, keeping a trace of the texture
    yy = np.arange(Y0, Y1)[:, None]; xx = np.arange(X0, X1)[None, :]
    d = np.minimum(np.minimum(yy - Y0, Y1 - 1 - yy), np.minimum(xx - X0, X1 - 1 - xx)).astype(np.float32)
    m = np.clip(d / pad, 0, 1)[..., None]
    if ALPHA:
        al = np.load(ALPHA)[Y0:Y1, X0:X1][..., None]
        m = m * (1 - np.clip(al * 1.5, 0, 1))  # the CG in front (the dock's mast) stays as rendered
    a[Y0:Y1, X0:X1] = reg * (1 - m) + tgt * m
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-", "-q:v", "1", dst], stdin=subprocess.PIPE)
p.communicate(np.clip(a, 0, 255).astype(np.uint8).tobytes())
print("ok", dst)
