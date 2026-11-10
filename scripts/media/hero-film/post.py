# Lienry hero film, step 3: paste each moving-region frame onto the full plate, grade it like the stills
# (levels, a faint lens glare, slight chromatic aberration, bloom, vignette, sensor-like grain) into NAME-graded.
# Uses only Blender's own Python and numpy; finish_final.sh encodes the graded frames with ffmpeg.
# Run: venv/bin/python post.py NAME   (NAME = final-landscape or final-portrait; finish_final.sh runs it)
import glob
import os
import sys

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
NAME = ARGS[0] if ARGS else "final-landscape"
plate_p = os.path.join(HERE, f"{NAME}-plate", "f_0001.png")
region_p = os.path.join(HERE, f"{NAME}-frames.region")
frames = sorted(glob.glob(os.path.join(HERE, f"{NAME}-frames", "f_*.png")))
if not frames:
    sys.exit(f"Nothing to finish for {NAME}: render the frames first.")
# With a moving camera every frame is rendered whole; with a still camera only the moving region is, over a plate.
REGIONED = os.path.exists(region_p) and os.path.exists(plate_p)
rx, ry = (float(v) for v in open(region_p).read().split()) if REGIONED else (0.0, 0.0)
out_dir = os.path.join(HERE, f"{NAME}-graded")
os.makedirs(out_dir, exist_ok=True)


def load(p):
    img = bpy.data.images.load(p, check_existing=False)
    img.colorspace_settings.name = "Non-Color"  # the stored values, untouched
    w, h = img.size
    a = np.empty(w * h * img.channels, np.float32)
    img.pixels.foreach_get(a)
    a = a.reshape(h, w, img.channels)[::-1, :, :3].copy()
    bpy.data.images.remove(img)
    return a


def save(a, p):
    h, w = a.shape[:2]
    img = bpy.data.images.new("graded", w, h, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    rgba = np.ones((h, w, 4), np.float32)
    rgba[..., :3] = np.clip(a, 0, 1)
    img.pixels.foreach_set(rgba[::-1].ravel())
    img.filepath_raw = p
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def gblur(a, sigma):
    """Gaussian blur through the FFT, with mirrored edges."""
    pad = int(3 * sigma) + 1
    ap = np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode="reflect")
    H, W = ap.shape[:2]
    fy = np.fft.fftfreq(H)[:, None]
    fx = np.fft.rfftfreq(W)[None, :]
    g = np.exp(-2 * np.pi ** 2 * sigma ** 2 * (fx ** 2 + fy ** 2))
    out = np.empty_like(ap)
    for c in range(ap.shape[2]):
        out[..., c] = np.fft.irfft2(np.fft.rfft2(ap[..., c]) * g, s=(H, W))
    return out[pad:-pad, pad:-pad]


_maps = {}


def rescale(ch, k):
    """The channel scaled by k about the centre (bilinear)."""
    h, w = ch.shape
    key = (h, w, k)
    if key not in _maps:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        cy, cx = (h - 1) / 2, (w - 1) / 2
        sy = np.clip(cy + (yy - cy) / k, 0, h - 1)
        sx = np.clip(cx + (xx - cx) / k, 0, w - 1)
        y0, x0 = np.floor(sy).astype(np.int32), np.floor(sx).astype(np.int32)
        _maps[key] = (y0, x0, np.minimum(y0 + 1, h - 1), np.minimum(x0 + 1, w - 1), sy - y0, sx - x0)
    y0, x0, y1, x1, fy, fx = _maps[key]
    return (ch[y0, x0] * (1 - fx) * (1 - fy) + ch[y0, x1] * fx * (1 - fy) + ch[y1, x0] * (1 - fx) * fy + ch[y1, x1] * fx * fy)


LUM = np.array([0.2126, 0.7152, 0.0722], np.float32)
plate = load(plate_p) if REGIONED else load(frames[len(frames) // 2])
H, W = plate.shape[:2]
# one camera grade for every frame and every run: fixed levels, not measured on whichever frame is in the middle
lo, hi = float(os.environ.get("LEVELS_LO", "0.030")), float(os.environ.get("LEVELS_HI", "0.80"))
# a little barrel distortion, as every real lens has
_ys, _xs = np.mgrid[0:H, 0:W].astype(np.float32)
_cy, _cx = (H - 1) / 2, (W - 1) / 2
_rn = np.sqrt(((_xs - _cx) / _cx) ** 2 + ((_ys - _cy) / _cx) ** 2)
_k = float(os.environ.get("BARREL", "0.012"))
_sc = (1 + _k * _rn ** 2) / (1 + _k * (1 + (H / W) ** 2))
_bsy = np.clip(_cy + (_ys - _cy) * _sc, 0, H - 1)
_bsx = np.clip(_cx + (_xs - _cx) * _sc, 0, W - 1)
_by0, _bx0 = np.floor(_bsy).astype(np.int32), np.floor(_bsx).astype(np.int32)
_by1, _bx1 = np.minimum(_by0 + 1, H - 1), np.minimum(_bx0 + 1, W - 1)
_bfy, _bfx = (_bsy - _by0)[..., None], (_bsx - _bx0)[..., None]


def barrel(a):
    return (a[_by0, _bx0] * (1 - _bfx) * (1 - _bfy) + a[_by0, _bx1] * _bfx * (1 - _bfy)
            + a[_by1, _bx0] * (1 - _bfx) * _bfy + a[_by1, _bx1] * _bfx * _bfy)
print(f"{NAME}: {len(frames)} frames, {W}x{H}, levels {lo:.4f} {hi:.4f}", flush=True)
yy, xx = np.mgrid[0:H, 0:W]
vig = (1 - 0.16 * (np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)) ** 2.2)[..., None].astype(np.float32)
left, top = int(round(rx * W)), int(round(ry * H))
FEATHER = 24
k1 = np.array([0.107, 0.786, 0.107], np.float32)


def grade(a, seed):
    a = barrel(a)
    a = np.clip((a - lo) / (hi - lo), 0, None) * 0.97  # true blacks, no milky floor
    a = a * 0.98 + gblur(a, W / 20) * 0.02  # a faint veiling glare
    a = np.stack([rescale(a[..., 0], 1.0010), a[..., 1], rescale(a[..., 2], 0.9990)], axis=-1)  # lateral CA
    a = a + gblur(np.clip(a - 0.7, 0, None) / 0.3, W / 90) * 0.06  # bloom
    a = a + gblur(np.clip(a - 0.55, 0, None) / 0.45, W / 320) * 0.06  # halation: a tight glow round bright edges
    a = np.clip(a, 0, None) ** 1.18  # mids about half a stop down, so the white headline sits on it
    a = 0.78 * a + 0.22 * (a * a * (3 - 2 * np.clip(a, 0, 1)))  # a gentle S: a toe in the shadows, a soft shoulder
    lum_ = (a @ LUM)[..., None]
    a = a + np.clip(1 - lum_ / 0.3, 0, 1) * np.array([-0.006, 0.0, 0.012], np.float32)  # shadows toward teal-slate
    lum_ = (a @ LUM)[..., None]
    a = lum_ + (a - lum_) * 0.93  # a little less saturation
    a = a * vig
    # a soft highlight shoulder on the brightest channel, hue kept, so no channel clips (knee 0.80); the
    # hottest highlights drift toward white, as film does
    m = np.maximum(a.max(axis=-1, keepdims=True), 1e-6)
    K = 0.80
    ms = np.where(m > K, K + (1 - K) * (1 - np.exp(-(m - K) / (1 - K))), m)
    w = np.clip((m - K) / (1 - K), 0, 1) ** 2 * 0.35
    a = a * (ms / m)
    a = a + ((a @ LUM)[..., None] - a) * w
    # a soft toe: the render's true zeros (unlit mullion faces) sit at about 4/255; above 0.06 untouched
    a = a + 0.016 * np.clip(1 - a / 0.06, 0, 1)
    a = 0.75 * a + 0.25 * gblur(a, 0.6)  # a real lens's softness: no razor CG edges
    rng = np.random.default_rng(seed)
    lum = np.clip(a @ LUM, 0, 1)
    g = rng.normal(0, 1, (H, W, 1)).astype(np.float32) * (0.004 + 0.006 * (1 - lum))[..., None] + rng.normal(0, 0.002, (H, W, 3)).astype(np.float32)
    # soften the grain by half a pixel so it survives the video encode
    g = (np.roll(g, 1, 0) * k1[0] + g * k1[1] + np.roll(g, -1, 0) * k1[2])
    g = (np.roll(g, 1, 1) * k1[0] + g * k1[1] + np.roll(g, -1, 1) * k1[2])
    return a + g


graded = []
for i, f in enumerate(frames):
    reg = load(f)
    h, w = reg.shape[:2]
    if not REGIONED or (h, w) == (H, W):
        n = int(os.path.basename(f)[2:6])
        out = os.path.join(out_dir, f"g_{n:04d}.png")
        save(grade(reg, n), out)
        graded.append(out)
        print(f"graded {i + 1}/{len(frames)}", flush=True)
        continue
    m = np.ones((h, w), np.float32)
    ramp = np.linspace(0, 1, FEATHER, dtype=np.float32)
    if left > 0:
        m[:, :FEATHER] *= ramp[None, :]
    if left + w < W:
        m[:, -FEATHER:] *= ramp[::-1][None, :]
    if top > 0:
        m[:FEATHER, :] *= ramp[:, None]
    if top + h < H:
        m[-FEATHER:, :] *= ramp[::-1][:, None]
    full = plate.copy()
    full[top:top + h, left:left + w] = reg * m[..., None] + full[top:top + h, left:left + w] * (1 - m[..., None])
    n = int(os.path.basename(f)[2:6])
    out = os.path.join(out_dir, f"g_{n:04d}.png")
    save(grade(full, n), out)
    graded.append(out)
    print(f"graded {i + 1}/{len(frames)}", flush=True)

print("graded", len(graded), "frames ->", out_dir, flush=True)
