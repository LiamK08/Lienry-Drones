"""The owner's dock and H1 on a real roof deck (Poly Haven rooftop_day, Johannesburg, CC0): the camera matched to a
backplate (Canon 600D, APS-C 22.3 mm sensor, EXIF focal length), the dock placed on the deck by image position,
lit by the same roof's HDRI with its sun aligned to the plate's shadows; the deck a shadow catcher (wet, with
puddle reflections, for s1); plate objects in front of the CG held out. Settings come from the environment
(see the queue lines); OUT names the .exr render and the graded .jpg composite."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L, plate as P, dock as D
import bpy
import numpy as np
from mathutils import Vector
E = os.environ.get
f = lambda k, d: float(E(k, d))
L.reset(res=(100, 100), samples=int(E("SPP", "16")), adaptive=f("ADAPT", "0.03"), min_samples=8, transparent=True)
bpy.context.scene.cycles.sample_clamp_indirect = 4.0
PLATE = os.path.join(L.ASSETS, E("PLATE", "bp_roof/IMG_6246.jpg"))
W, H = (int(v) for v in E("PSIZE", "5184x3456").split("x"))
crop, scale, res, outw = D.env_crop(E, W, H)
pl = P.Plate(PLATE, f("FOCAL", "35"), sensor=f("SENSOR", "22.3"), size=(W, H), h=f("H", "1.6"), pitch=f("PITCH", "0"), yaw=90,
             roll=f("ROLL", "0"), crop=crop, scale=scale)
pl.setup(transparent=True)
P.linear_output()
# rooftop_day's sun sits at texture azimuth -31.7 deg, elevation 33 deg: world sun azimuth = -31.7 - ROT
w = D.world_split(os.path.join(L.ASSETS, E("HDR", "rooftop_day_8k.hdr")), f("ROT", "-112"), k_sun=f("SUNK", "1.0"),
                  k_fill=f("FILLK", "0.2"), thresh=f("SUNT", "40"))
# the dock on the deck, its centre under plate pixel (DPX, DPY); heading DYAW (world degrees, +X = dock front)
g = pl.ray_to_ground(f("DPX", "1250"), f("DPY", "2568"), 0.0)
g += Vector((f("DX", "0"), f("DY", "0"), 0))
dock = D.load_dock(loc=(g.x, g.y, 0.0), yaw_deg=f("DYAW", "55"), lid_deg=f("LID", "100"))
D.set_dock_lights(dock, f("LED", "3.0"))
D.weather_dock(dock, f("GRIME", "1.0"))
hover = f("HOVER", "0")
h1 = D.h1_on_dock(dock, hover=hover, spin=E("SPIN", "1" if hover > 0.05 else "0") == "1", parked_lights=hover <= 0.05,
                  roll_deg=f("DROLL", "0"), pitch_deg=f("DPITCH", "0"), yaw_extra=f("DYAWX", "0"))
if E("TETHER", "1") == "1":
    D.dock_tether(h1, dock, sag=f("SAG", "0.12"))
# the deck: a shadow catcher (limited to DECKD m from the camera when a building stands on it)
decd = f("DECKD", "60")
deck = D.catcher("deck catcher", (60, decd), (0, decd / 2, 0.0))
# the deck's albedo in the HDRI's units (its sunlit concrete reads 0.10 under a 2.9 horizontal irradiance)
deck_m = L.mat("deck concrete", (f("DECKA", "0.11"),) * 3, 0.75)
deck.data.materials.append(deck_m)
for i, spec in enumerate(x for x in E("HOLD", "").split(";") if x):
    x, y, z, sx, sy, sz, yaw = map(float, spec.split(","))
    D.holdout_box(f"holdout {i}", (x, y, z), (sx, sy, sz), yaw)
for i, spec in enumerate(x for x in E("PROXY", "").split(";") if x):
    x, y, z, sx, sy, sz, yaw = map(float, spec.split(","))
    D.proxy_box(f"proxy {i}", (x, y, z), (sx, sy, sz), yaw).data.materials.append(deck_m)
WET = E("WET", "0") == "1"
masks = []
if WET:
    D.wet_dock(dock)
    # the wet deck: plate pixels darkened under the mask, plus a Fresnel reflection film (mirror puddles)
    poly = [pl.ray_to_ground(*map(float, p.split(",")), 0.0) for p in E("WETPX", "0,3456;5184,3456;5184,2200;0,2200").split(";")]
    D.reflect_film("wet deck film", [(v.x, v.y, 0.002) for v in poly], rough=f("WROUGH", "0.12"), strength=f("WREF", "1.0"),
                   puddle_tex=(f("PUDS", "0.35"), f("PUDLO", "0.52"), f("PUDHI", "0.56")))
    masks.append(D.mask_plane("wet deck mask", [(v.x, v.y, 0.001) for v in poly], value_tex=(f("PUDS", "0.35"), 0.4, 0.56, f("WETMIN", "0.75"))))
out = os.path.splitext(os.path.join(L.HERE, E("OUT", "tests_docks/roof.exr")))[0] + ".exr"
os.makedirs(os.path.dirname(out), exist_ok=True)
L.render(out)
mask = None
if masks:
    for m in masks:
        m.hide_render = False
    mask = out.replace(".exr", "_wet.exr")
    P.render_mask(masks, mask)
lo, hi = f("LO", "0.0"), f("HI", "0.62")
wb = tuple(float(v) for v in E("WB", "1,1,1").split(","))
grade = lambda s: L.grade(D.look(s, wb, f("SPLIT", "0"), f("GAMMA", "1")), seed=int(f("SEED", "5")), levels=(lo, hi), sat=f("SAT", "0.92"), vignette=f("VIG", "0.10"), grain=f("GRAIN", "0.7"))
s = grade(D.composite(PLATE, crop, out, wet_mask=mask, wet_k=f("WETK", "0.45")))
s = D.finish(s, outw, int(round(outw * res[1] / res[0])))
L.save_px(s, out.replace(".exr", ".jpg"), quality=93)
print("crop", crop, "dock", tuple(round(v, 2) for v in g), "dist", round(g.length, 2))
