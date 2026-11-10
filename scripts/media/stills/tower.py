"""A mid-rise glass office tower in the real city (CC0 HDRI), the H1 at work on it, seen from the street or from
across the street. One scene for p1-tower, s4-scan, s2-tether, f1-tether, h0-hero-still: SHOT picks the camera."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L
import facade as F
import bpy
from mathutils import Vector
E = os.environ.get
SHOT = E("SHOT", "p1")
res = tuple(int(x) for x in E("RES", "800x1200").split("x"))
sc = L.reset(res=res, samples=int(E("SPP", "32")), adaptive=float(E("ADAPT", "0.03")), min_samples=8)
L.world_hdri(os.path.join(L.ASSETS, E("HDR", "docklands_02_8k.hdr")), float(E("SKY", "1.0")), float(E("ROT", "210")))
FLOORS = int(E("FLOORS", "9")); FH = 3.6; TOP = FLOORS * FH  # ground floor at z=0
# the building occupies x>0, y<0: face A along +X (normal +Y), face B along -Y at x=0 (normal -X)
SPRAY = E("SPRAY", "1") == "1"
DX = float(E("DX", "4.5"))  # the drone's lane along face A, metres from the corner
DZ = float(E("DZ", "18.9"))  # its height
nz_z = DZ + 0.19 - 0.83 * math.sin(math.radians(5 if SPRAY else 0))
lane = (DX - 0.45, DX + 0.45, TOP, nz_z - 0.06) if SPRAY else (DX - 0.45, DX + 0.45, TOP, DZ - 0.6)
wa = F.Wall((0, 0, 0), 0.0, width=40, height=TOP, seed=21)
wb = F.Wall((0, 0, 0), 90.0, width=40, height=TOP, seed=22)
F.build(wa, lane=lane, dust=float(E("DUST", "0.45")), u_range=(0.0, 24.0), w_range=(0.0, TOP), interior=True)
F.build(wb, lane=None, dust=float(E("DUST", "0.45")), u_range=(-24.0, 0.0), w_range=(0.0, TOP), interior=True)
if SPRAY and E("WSHEET", "1") == "1":
    F.water_sheet(wa, DX - 0.42, DX + 0.42, min(TOP, nz_z + 3.0), nz_z - 0.06)
# parapet, roof slab and ground-floor plinth
par = L.mat("parapet coping", (0.2, 0.205, 0.21), 0.35, 1.0)
def box(c, s, m):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c)
    o = bpy.context.active_object; o.scale = s; o.data.materials.append(m); return o
box((12, -12, TOP + 0.55), (24.2, 24.2, 1.1), L.mat("parapet panel", (0.12, 0.125, 0.13), 0.25, 0.8))
box((12, -12, TOP + 1.12), (24.4, 24.4, 0.06), par)
box((12, -12, -0.5), (60, 60, 1.0), L.mat("street", (0.18, 0.18, 0.18), 0.85))
# the drone on face A, nose to the glass
root = L.load_h1(loc=(DX, 0.83 + float(E("STAND", "0.6" if SPRAY else "1.2")), DZ), rot_deg=(0, 5 if SPRAY else 0, -90), spin=True)
bpy.context.view_layer.update()
if SPRAY:
    nz = L.model_to_world(root, L.NOZZLE_MM)
    _, _, half0 = L.spray(root, Vector((nz.x, -0.04, nz.z - 0.05)), (0, 1, 0), drops=3600)
    L.mist(Vector((nz.x, -0.04, nz.z - 0.05)), (0, 1, 0), (1, 0, 0), half0, n=6000)
# the hose: up to the parapet above and a little behind the lane
L.tether(root, (DX - 0.8, 0.25, TOP + 1.15), sag=float(E("SAG", "0.5")), radius=0.008)
# cameras
cams = {
    # up: from the pavement below, looking up the face at the drone (reflections dominate at this angle)
    "up": dict(loc=(DX + float(E("UPX", "6.0")), float(E("UPY", "16.0")), 1.6), aim=(DX + float(E("UAX", "0.0")), 0.5, DZ + float(E("UAZ", "0.0"))), lens=float(E("LENS", "85")), fstop=8),
    # p1: from the far kerb, street level, looking up at the drone (2:3)
    "p1": dict(loc=(DX + 10.0, 24.0, DZ - 3.0), aim=(DX - 0.2, 0.5, DZ - 2.4), lens=100, fstop=5.6),
    # s4: from an upper floor across the street, a little below the drone, the corner running diagonally (4:3)
    "s4": dict(loc=(DX + 12.0, 16.0, DZ - 2.5), aim=(DX - 1.5, 0.0, DZ + 0.8), lens=60, fstop=5.6),
    # s2 / f1: below and behind the drone, the hose sweeping up to the parapet
    "s2": dict(loc=(DX - 3.2, 5.0, DZ - 2.2), aim=(DX - 0.3, 0.6, DZ + 1.6), lens=50, fstop=4),
    # h0: a wide across the street at mid height, the drone small on the face
    "h0": dict(loc=(DX + 16.0, 34.0, 12.0), aim=(DX + 3.0, 0.0, DZ - 1.0), lens=50, fstop=8),
}
c = cams[SHOT]
for k in ("lens", "fstop"):
    if E(k.upper()):
        c[k] = float(E(k.upper()))
cam = L.camera(c["loc"], c["aim"], lens=c["lens"], fstop=c["fstop"], focus=(Vector(c["loc"]) - Vector((DX, 1.4, DZ))).length,
               shift=(float(E("SX", "0")), float(E("SY", "0"))))
out = os.path.join(L.HERE, E("OUT", f"tower_{SHOT}.png"))
L.render(out)
a = L.load_px(out)
L.save_px(L.grade(a, seed=5, levels=(0.03, 0.9)), out.replace(".png", "_g.jpg"), quality=92)
