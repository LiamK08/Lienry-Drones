"""m1-drone-master: the H1 mid-wash on a glass curtain wall, three-quarter, 70 mm f/2.8."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L
import facade as F
import bpy
from mathutils import Vector
E = os.environ.get
res = tuple(int(x) for x in E("RES", "1024x768").split("x"))
sc = L.reset(res=res, samples=int(E("SPP", "48")), adaptive=float(E("ADAPT", "0.03")), min_samples=8)
HDR = os.path.join(L.ASSETS, E("HDR", "potsdamer_platz_8k.hdr"))
L.world_hdri(HDR, float(E("SKY", "1.0")), float(E("ROT", "0")))
Z = float(E("Z", "20.25"))  # the drone at the fifth floor, its strike mid-pane
X = 0.0
wall = F.Wall((0, 0, 0), 0.0, width=40, height=40, bay=1.5, floor=3.6, spandrel=1.1, seed=11)
nz_z = Z + 0.19 - 0.83 * math.sin(math.radians(5))  # roughly the nozzle height after the lean
lane = (X - 0.45, X + 0.45, 40.0, nz_z - 0.06)
F.water_sheet(wall, X - 0.42, X + 0.42, nz_z + 0.25, nz_z - 0.06)
F.build(wall, lane=lane, dust=float(E("DUST", "0.45")), u_range=(-14, 14), w_range=(8, 32 if E("TETHER", "0") == "1" else 36))
# the drone faces the glass (-Y), leaning 5 degrees into the jet; nozzle 0.6 m off the glass
SPRAY = E("SPRAY", "1") == "1"
STAND = float(E("STAND", "0.6"))
root = L.load_h1(loc=(X, 0.83 + STAND, Z), rot_deg=(0, float(E("PITCH", "5" if SPRAY else "0")), -90), spin=True)
bpy.context.view_layer.update()
nz = L.model_to_world(root, L.NOZZLE_MM)
hit = Vector((nz.x, -0.04, nz.z - 0.05))
if SPRAY:
    _, _, half0 = L.spray(root, hit, (0, 1, 0), drops=int(E("DROPS", "3600")))
    L.mist(hit, (0, 1, 0), (1, 0, 0), half0, n=int(E("MIST", "6000")))
cam_d = float(E("CAMD", "5.2")); cam_a = math.radians(float(E("CAMA", "48")))
target = Vector((X + float(E("TX", "0.15")), float(E("TY", "0.9")), Z + float(E("TZ", "0.05"))))
cam = Vector((X + cam_d * math.sin(cam_a), 0.9 + cam_d * math.cos(cam_a), Z + float(E("CAMZ", "0.35"))))
L.camera(cam, target, lens=float(E("LENS", "70")), fstop=float(E("FSTOP", "2.8")), focus=(cam - Vector((X, float(E("FY", "1.1")), Z + float(E("FZ", "0"))))).length,
         shift=(float(E("SX", "0.0")), float(E("SY", "0.0"))))
if E("TETHER", "0") == "1":
    TOPW = 32.0
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -6, TOPW + 0.55))
    pp = bpy.context.active_object; pp.scale = (30, 12.1, 1.1); pp.data.materials.append(L.mat("parapet", (0.12, 0.125, 0.13), 0.25, 0.8))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -6, TOPW + 1.12))
    pc = bpy.context.active_object; pc.scale = (30.2, 12.3, 0.06); pc.data.materials.append(L.mat("coping", (0.2, 0.205, 0.21), 0.35, 1.0))
    L.tether(root, (X - float(E("TETH_DX", "0.9")), 0.12, TOPW + 1.16), sag=float(E("SAG", "0.55")), radius=float(E("HOSE_R", "0.008")))
L.render(os.path.join(L.HERE, E("OUT", "m1_test.png")))
if E("GRADE", "1") == "1":
    out = os.path.join(L.HERE, E("OUT", "m1_test.png"))
    a = L.load_px(out)
    g = L.grade(a, seed=3, levels=(float(E("LO", "0.03")), float(E("HI", "0.9"))))
    L.save_px(g, out.replace(".png", "_g.jpg"), quality=92)
    print("graded", flush=True)
