"""The H1 washing the bay window of a real country house (Poly Haven lythwood_terrace, backplate DSC08820, CC0):
the camera matched to the plate, the drone 0.6 m off the bay's front glass, its spray striking the upper pane,
the glass wet below the strike, lit by the same place's HDRI."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L, plate as P
import bpy
from mathutils import Vector
E = os.environ.get
f = lambda k, d: float(E(k, d))
L.reset(res=(100, 100), samples=int(E("SPP", "24")), adaptive=f("ADAPT", "0.03"), min_samples=8, transparent=True)
crop = tuple(int(v) for v in E("CROP", "2400,1500,4400,4481").split(",")) if E("CROP", "") != "none" else None
pl = P.Plate(os.path.join(L.ASSETS, "bp", E("PLATE", "DSC08820.jpg")), f("FOCAL", "38"), sensor=f("SENSOR", "35.9"), size=(int(f("PW", "7360")), int(f("PH", "4912"))), h=1.6, pitch=f("PITCH", "5.4"), yaw=90, roll=0,
             crop=crop, scale=f("SCALE", "1.0"))
pl.setup(transparent=True)
P.linear_output()
L.world_hdri(os.path.join(L.ASSETS, E("HDR", "lythwood_terrace_4k.hdr")), f("SKY", "1.0"), f("ROT", "0"))
print("plate", E("PLATE"))
GY = f("GY", "21.0")  # the glass plane, facing the camera
# the drone: centred on the image point (DPX, DPY) of the full plate, 1.43 m in front of the glass
dpx, dpy = f("DPX", "3520"), f("DPY", "3000")
cam_o = pl.cam.matrix_world.translation
probe = pl.ray_at_distance(dpx, dpy, 1.0) - cam_o
t = (GY - 1.43 - cam_o.y) / probe.y
c = cam_o + probe * t
root = L.load_h1(loc=tuple(c), rot_deg=(0, 4, 90 + f("YAWOFF", "0")), spin=True)
bpy.context.view_layer.update()
nz = L.model_to_world(root, L.NOZZLE_MM)
hit = Vector((nz.x, GY - 0.02, nz.z - 0.06))
_, _, half0 = L.spray(root, hit, (0, -1, 0), drops=int(E("DROPS", "3000")))
L.mist(hit, (0, -1, 0), (1, 0, 0), half0, n=5000)
# the glass: a shadow catcher over the photographed bay (the drone's soft shadow, contact) and a water film
glass_c = L.plane("bay glass catcher", (6.0, 3.0), (0, GY, hit.z), rot_deg=(90, 0, 0), catcher=True)
WET = []
if E("SURF", "glass") == "glass":
    L.wet_patch(Vector((hit.x, GY - 0.003, hit.z - 0.45)), (0, -1, 0), (0, 0, 1), 0.85, 1.0)
else:
    WET.append(L.wet_wall(Vector((hit.x, GY, hit.z + 0.05)), (0, -1, 0), 2 * half0 * 1.1, f("WET_H", "1.0")))
    WET.append(L.wet_wall(Vector((hit.x - 2 * half0, GY, hit.z + 0.05)), (0, -1, 0), 2 * half0, f("WET_H", "1.0") * 1.1, strength=0.8, name="wet wall 2"))
    for w_ in WET:
        w_.hide_render = True
# the hose droops from the rear swivel to the terrace and out of frame to the right
L.tether(root, (c.x + f("HOSE_DX", "2.8"), GY - f("HOSE_DY", "2.5"), f("HOSE_Z", "0.9")), sag=1.1, radius=0.007)
out = os.path.splitext(os.path.join(L.HERE, E("OUT", "house_bay.exr")))[0] + ".exr"
L.render(out)
mask = None
if WET:
    for w_ in WET:
        w_.hide_render = False
    mask = out.replace(".exr", "_wet.exr")
    P.render_mask(WET, mask)
grade = lambda s: L.grade(s, seed=2, levels=(0.0, f("HI", "1.0")), sat=1.0, vignette=0.06, grain=0.6)
patch = tuple(int(v) for v in E("PATCH", "").split(",")) if E("PATCH") else None
pl.composite(out, out.replace(".exr", ".jpg"), grade=grade, wet_mask=mask, wet_k=f("WETK", "0.45"), patch=patch)
print("drone at", tuple(round(v, 2) for v in c), "hit", tuple(round(v, 2) for v in hit))
