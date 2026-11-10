"""y3-story-driveway: the H1 washing the brick paving of a real country house (Poly Haven lythwood_terrace,
backplate DSC08816, Sony A7R at 25 mm, CC0), lance tilted down, the fan striking the bricks, washed lanes dark
and wet behind it."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L, plate as P
import bpy
from mathutils import Vector
E = os.environ.get
f = lambda k, d: float(E(k, d))
L.reset(res=(100, 100), samples=int(E("SPP", "24")), adaptive=f("ADAPT", "0.03"), min_samples=8, transparent=True)
crop = tuple(int(v) for v in E("CROP", "4700,2300,6500,4700").split(","))
pl = P.Plate(os.path.join(L.ASSETS, "bp", "DSC08816.jpg"), 25.0, size=(7360, 4912), h=1.6, pitch=0.0, yaw=90, crop=crop, scale=f("SCALE", "1.0"))
pl.setup(transparent=True)
P.linear_output()
L.world_hdri(os.path.join(L.ASSETS, "lythwood_terrace_4k.hdr"), f("SKY", "1.0"), f("ROT", "0"))
head = f("HEAD", "150")  # the drone's heading (degrees from +X)
hv = Vector((math.cos(math.radians(head)), math.sin(math.radians(head)), 0))
TILT = f("TILT", "-48")
ALT = f("ALT", "1.0")
# the strike on the paving at image point (SPX, SPY); the drone placed so its tilted lance reaches it
strike = pl.ray_to_ground(f("SPX", "6550"), f("SPY", "3690"), 0.0)
root = L.load_h1(loc=(0, 0, ALT), rot_deg=(0, 0, head), spin=True)
L.set_tilt(TILT)
nz = L.nozzle(root); d = L.lance_dir(root)
hit0 = nz + d * (-nz.z / d.z)
root.location += Vector((strike.x - hit0.x, strike.y - hit0.y, 0))
bpy.context.view_layer.update()
nz = L.nozzle(root)
hit = Vector((strike.x, strike.y, 0.0))
_, _, half0 = L.spray(root, hit, (0, 0, 1), drops=int(E("DROPS", "3200")), nz=nz)
L.mist(hit, (0, 0, 1), Vector((-hv.y, hv.x, 0)), half0, n=6000)
# the ground: a shadow catcher, and washed lanes along the path (its direction read from two image points)
pa = pl.ray_to_ground(f("PAX", "6500"), f("PAY", "4500"), 0.0); pb = pl.ray_to_ground(f("PBX", "5800"), f("PBY", "3600"), 0.0)
pdir = (pb - pa).normalized(); phead = math.degrees(math.atan2(pdir.y, pdir.x))
side = Vector((-pdir.y, pdir.x, 0))
L.plane("paving catcher", (14, 14), (strike.x, strike.y, 0.0), catcher=True)
lane_w = max(0.35, 2 * half0 * 1.05)
# the washed lane runs back along the path from the strike toward the camera; a second, older lane beside it
WET = [L.wet_ground(hit - pdir * 1.4, 2.8, lane_w, phead, strength=1.0),
       L.wet_ground(hit - pdir * 1.8 + side * lane_w * 0.92, 3.4, lane_w, phead, strength=0.75, name="wet lane 2"),
       L.wet_ground(hit, 0.45, lane_w * 1.15, phead, strength=1.0, name="wet strike")]
for w_ in WET:
    w_.hide_render = True
# the hose from the rear back along the paving and out of frame
L.tether(root, tuple(root.location - hv * 3.5 + Vector((0, 0, -ALT + 0.008))), sag=0.9, radius=0.007)
out = os.path.splitext(os.path.join(L.HERE, E("OUT", "driveway.exr")))[0] + ".exr"
L.render(out)
for w_ in WET:
    w_.hide_render = False
mask = out.replace(".exr", "_wet.exr")
P.render_mask(WET, mask)
grade = lambda s: L.grade(s, seed=4, levels=(0.0, f("HI", "1.0")), sat=1.0, vignette=0.05, grain=0.6)
pl.composite(out, out.replace(".exr", ".jpg"), grade=grade, wet_mask=mask, wet_k=f("WETK", "0.5"))
print("drone", tuple(round(v, 2) for v in root.location), "strike", tuple(round(v, 2) for v in hit))
