"""Retouch rectangles by copying nearby pixels, feathered: python patchcopy.py in out x0,y0,x1,y1,dx,dy ..."""
import sys, subprocess, numpy as np
src, dst = sys.argv[1], sys.argv[2]
w, h = (int(v) for v in subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", src]).decode().strip().split(","))
a = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]), np.uint8).reshape(h, w, 3).astype(np.float32)
for r in sys.argv[3:]:
    x0, y0, x1, y1, dx, dy = (int(v) for v in r.split(","))
    s = a[y0 + dy:y1 + dy, x0 + dx:x1 + dx].copy()
    hh, ww = s.shape[:2]
    f = np.minimum(np.minimum(np.arange(hh)[:, None], np.arange(hh)[::-1][:, None]), np.minimum(np.arange(ww)[None, :], np.arange(ww)[::-1][None, :]))
    m = np.clip(f / 8.0, 0, 1)[..., None]
    # match the copy's level to the target's own border, so the patch does not read as a lighter or darker block
    tb = np.concatenate([a[y0:y1, x0:x0+3].reshape(-1,3), a[y0:y1, x1-3:x1].reshape(-1,3), a[y0:y0+3, x0:x1].reshape(-1,3), a[y1-3:y1, x0:x1].reshape(-1,3)]).mean(0)
    sb = np.concatenate([s[:, :3].reshape(-1,3), s[:, -3:].reshape(-1,3), s[:3].reshape(-1,3), s[-3:].reshape(-1,3)]).mean(0)
    s = s * (tb / np.maximum(sb, 1))
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - m) + s * m
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-", "-q:v", "1", dst], stdin=subprocess.PIPE)
p.communicate(np.clip(a, 0, 255).astype(np.uint8).tobytes()); print("ok", dst)
