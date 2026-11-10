"""Retouch a rectangle with pixels copied from (dx, dy) away, scaled row by row so the copy follows the
shading of a reference strip of the same surface (rx0..rx1): python patchgrad.py in out x0,y0,x1,y1,dx,dy,rx0,rx1"""
import sys, subprocess, numpy as np
src, dst = sys.argv[1], sys.argv[2]
w, h = (int(v) for v in subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", src]).decode().strip().split(","))
a = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]), np.uint8).reshape(h, w, 3).astype(np.float32)
for r in sys.argv[3:]:
    x0, y0, x1, y1, dx, dy, rx0, rx1 = (int(v) for v in r.split(","))
    s = a[y0 + dy:y1 + dy, x0 + dx:x1 + dx].copy()
    ref_t = a[y0:y1, rx0:rx1].mean(1)            # the surface's shade on the target rows
    ref_s = a[y0 + dy:y1 + dy, rx0:rx1].mean(1)  # and on the source rows
    s = s * (ref_t / np.maximum(ref_s, 1))[:, None, :]
    hh, ww = s.shape[:2]
    f = np.minimum(np.minimum(np.arange(hh)[:, None], np.arange(hh)[::-1][:, None]), np.minimum(np.arange(ww)[None, :], np.arange(ww)[::-1][None, :]))
    m = np.clip(f / 6.0, 0, 1)[..., None]
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - m) + s * m
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-", "-q:v", "1", dst], stdin=subprocess.PIPE)
p.communicate(np.clip(a, 0, 255).astype(np.uint8).tobytes()); print("ok", dst)
