"""m3-pod-master: the home system. The owner's dock on the wet brick patio of a real country house (Poly Haven
lythwood_terrace, backplate DSC08806, Sony A7R at 24 mm, CC0), lids open, the H1 parked on its pad, a short garden
hose from a CG brass tap on a copper riser at the lawn edge to the dock's rear inlet. The camera is matched to the
plate (EXIF focal length, 35.9 mm sensor, 1.6 m, level); the dock stands where the patio's garden table stood, so
its body hides the table; the wet paving takes the dock's contact shadow (a catcher) and its mirror image (a second
render of the scene reflected in the ground plane, with the HDRI flipped, blurred and laid on at a wet-brick
Fresnel weight). Lit by the same garden's overcast HDRI. OUT names the .exr render and the graded .jpg composite."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L, plate as P, dock as D
import bpy
import numpy as np
from mathutils import Matrix, Vector
E = os.environ.get
f = lambda k, d: float(E(k, d))
L.reset(res=(100, 100), samples=int(E("SPP", "16")), adaptive=f("ADAPT", "0.03"), min_samples=8, transparent=True)
bpy.context.scene.cycles.sample_clamp_indirect = 4.0
PLATE = os.path.join(L.ASSETS, E("PLATE", "bp/DSC08806.jpg"))
W, H = (int(v) for v in E("PSIZE", "7360x4912").split("x"))
crop, scale, res, outw = D.env_crop(E, W, H)
pl = P.Plate(PLATE, f("FOCAL", "24"), sensor=f("SENSOR", "35.9"), size=(W, H), h=f("H", "1.6"), pitch=f("PITCH", "0"), yaw=90,
             roll=f("ROLL", "0"), crop=crop, scale=scale)
pl.setup(transparent=True)
P.linear_output()
HDR = os.path.join(L.ASSETS, E("HDR", "lythwood_terrace_4k.hdr"))
sky = f("SKY", "0.3")
w = D.world_split(HDR, f("ROT", "135"), k_sun=sky, k_fill=sky, thresh=1e6)
# the dock where the table stood
g = pl.ray_to_ground(f("DPX", "3385"), f("DPY", "4030"), 0.0) + Vector((f("DX", "0"), f("DY", "0"), 0))
dock = D.load_dock(loc=(g.x, g.y, 0.0), yaw_deg=f("DYAW", "-60"), lid_deg=f("LID", "100"))
D.set_dock_lights(dock, f("LED", "1.0"))
D.weather_dock(dock, f("GRIME", "0.8"), seed=3.0)
D.wet_dock(dock, coat=0.6, coat_rough=0.06)
h1 = D.h1_on_dock(dock, hover=0.0, spin=False, parked_lights=True)
D.dock_tether(h1, dock, sag=f("SAG", "0.05"))
cg = [o for o in bpy.context.scene.objects if o.type in ("MESH", "CURVE", "FONT", "EMPTY") and o.parent is None and o.name not in ("plate cam",)]
# a garden tap: a copper riser out of the lawn edge with a brass bib tap, and a grey garden hose to the dock's inlet
TAP = Vector((f("TAPX", "-2.1"), f("TAPY", "6.3"), 0.0))
copper = L.mat("copper riser", (0.55, 0.27, 0.15), 0.4, 1.0)
brass = bpy.data.materials.get("Machined brass") or L.mat("brass", (0.66, 0.43, 0.15), 0.3, 1.0)
to_dock = (Vector((g.x, g.y, 0)) - TAP); to_dock.z = 0; to_dock.normalize()
side = Vector((-to_dock.y, to_dock.x, 0))
def cyl(r, a, b, m, v=24):
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=(b - a).length, location=(a + b) / 2, vertices=v)
    o = bpy.context.active_object
    o.rotation_euler = (b - a).to_track_quat("Z", "Y").to_euler()
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o
TH = 0.62  # the bib tap's height
cyl(0.0125, TAP + Vector((0, 0, -0.05)), TAP + Vector((0, 0, TH - 0.02)), copper)          # riser out of the paving joint
cyl(0.022, TAP + Vector((0, 0, -0.002)), TAP + Vector((0, 0, 0.012)), L.mat("pipe collar", (0.08, 0.08, 0.08), 0.6))
cyl(0.019, TAP + Vector((0, 0, TH - 0.03)), TAP + Vector((0, 0, TH + 0.035)), brass)       # tap body
cyl(0.006, TAP + Vector((0, 0, TH + 0.035)), TAP + Vector((0, 0, TH + 0.07)), brass, 12)   # spindle
for k in (0, 1):                                                                           # cross handle
    d = (to_dock if k == 0 else side) * 0.035
    cyl(0.0045, TAP + Vector((0, 0, TH + 0.07)) - d, TAP + Vector((0, 0, TH + 0.07)) + d, brass, 12)
spout_a = TAP + Vector((0, 0, TH)) + to_dock * 0.015
spout_b = spout_a + to_dock * 0.05 + Vector((0, 0, -0.035))
cyl(0.009, spout_a, spout_b, brass, 16)
fit = cyl(0.013, spout_b, spout_b + (spout_b - spout_a).normalized() * 0.05, L.mat("hose fitting", (0.06, 0.2, 0.08), 0.4), 16)
inlet = D.dock_point(dock, (D.GARDEN_INLET_MM[0] - 60, D.GARDEN_INLET_MM[1], D.GARDEN_INLET_MM[2]))
rear = (D.dock_point(dock, (-1000, D.GARDEN_INLET_MM[1], 0)) - D.dock_point(dock, (-880, D.GARDEN_INLET_MM[1], 0))).normalized()
cu = bpy.data.curves.new("garden hose", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.0095; cu.bevel_resolution = 4
cu.resolution_u = 48
spl = cu.splines.new("BEZIER")
h0 = spout_b + (spout_b - spout_a).normalized() * 0.05
R_ = 0.0095
pts = [(h0, (spout_b - spout_a).normalized() * 0.12),
       (TAP + to_dock * 0.32 + side * 0.06 + Vector((0, 0, R_)), to_dock * 0.18),
       (Vector(((TAP.x + inlet.x) / 2, (TAP.y + inlet.y) / 2, R_)) + side * 0.18 + rear * 0.15, (inlet - TAP).normalized() * 0.3),
       (inlet + rear * 0.28 + Vector((0, 0, -inlet.z + R_ + 0.02)), -rear * 0.12 + Vector((0, 0, 0.05))),
       (inlet, -rear * 0.06)]
spl.bezier_points.add(len(pts) - 1)
for bp, (co, hdl) in zip(spl.bezier_points, pts):
    bp.co = co; bp.handle_left = co - hdl; bp.handle_right = co + hdl
hose = bpy.data.objects.new("garden hose", cu); bpy.context.scene.collection.objects.link(hose)
hose.data.materials.append(L.mat("garden hose grey", (0.2, 0.21, 0.22), 0.45, **{"Coat Weight": 0.6, "Coat Roughness": 0.08}))
# the patio: a shadow catcher (contact shadow; overcast) and the dock's mirror image in the wet brick
pat = D.catcher("patio catcher", (30, 30), (0, 12, 0.0))
pat.data.materials.append(L.mat("wet brick", (0.05, 0.045, 0.04), 0.3))
out = os.path.splitext(os.path.join(L.HERE, E("OUT", "tests_docks/m3.exr")))[0] + ".exr"
os.makedirs(os.path.dirname(out), exist_ok=True)
L.render(out)
# the reflection pass: everything above the ground mirrored through z = 0, the HDRI flipped to match
refl = out.replace(".exr", "_refl.exr")
if E("REFL", "1") == "1":
    pat.hide_render = True
    mir = bpy.data.objects.new("mirror", None); bpy.context.scene.collection.objects.link(mir)
    for o in list(bpy.context.scene.objects):
        if o.parent is None and o not in (mir, pat, pl.cam) and o.type in ("MESH", "CURVE", "FONT", "EMPTY"):
            mw = o.matrix_world.copy(); o.parent = mir; o.matrix_parent_inverse = Matrix.Identity(4); o.matrix_basis = mw
    mir.scale = (1, 1, -1)
    mp = [n for n in w.node_tree.nodes if n.bl_idname == "ShaderNodeMapping"][0]
    mp.inputs["Scale"].default_value = (1, 1, -1)
    bpy.context.scene.cycles.samples = max(8, int(E("SPP", "16")) // 2)
    L.render(refl)
# composite: plate, then the reflection (Fresnel-weighted, blurred by the brick's roughness), then the render
r_w = L.load_px(out).shape[1]
has_refl = os.path.exists(refl) and E("REFL", "1") == "1"
s = D.composite(PLATE, crop, out, refl=refl if has_refl else None, refl_k=f("RK", "0.28"), refl_blur=f("RBLUR", "2.0") * r_w / 640)
s = L.grade(D.look(s, tuple(float(v) for v in E("WB", "1,1,1").split(",")), f("SPLIT", "0"), f("GAMMA", "1")), seed=int(f("SEED", "8")), levels=(f("LO", "0.0"), f("HI", "0.92")), sat=f("SAT", "0.95"), vignette=f("VIG", "0.08"), grain=f("GRAIN", "0.6"))
s = D.finish(s, outw, int(round(outw * res[1] / res[0])))
L.save_px(s, out.replace(".exr", ".jpg"), quality=93)
print("crop", crop, "dock", tuple(round(v, 2) for v in g), "dist", round(g.length, 2), "tap", tuple(round(v, 2) for v in TAP))
