"""The solar farm: fixed-tilt tables of 72-cell modules (2 in portrait, 25 degrees) in rows on a dry paddock, lit by
a CC0 HDRI of a real dry field (Poly Haven dry_field / dry_meadow). The H1 flies a pass along the near row, its lance
panned up the slope and tilted down, the fan striking the lower module; behind it a washed band, wet and clean,
mirrors the sky; ahead the glass is dull with fine dust. The hose drapes over the lower frame and runs back along the
aisle on the grass. SHOT picks the frame: so1 (2.36:1 hero, 35 mm), p5 (2:3 portrait, low three-quarter), so2
(macro on the turret and strike, 90 mm)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L
import solar as S
import bpy
from mathutils import Vector
E = os.environ.get
f = lambda k, d: float(E(k, d))
SHOT = E("SHOT", "so1")
P = {
    "so1": dict(RES="3168x1344", HDR="dry_field_8k.hdr", ROT="109", XS="6.0", VS="1.25", YAW="150", PAN="12", TILT="-42",
                STAND="0.6", CAMX="-5.0", CAMY="-0.9", CAMZ="1.5", LENS="38", FSTOP="2.8", AIMX="0.0", AIMZ="0.0",
                SX="0.0", SY="0.0", PITCHD="4", DIR="1"),
    "p5": dict(RES="1200x1800", HDR="dry_field_8k.hdr", ROT="9", XS="6.0", VS="1.25", YAW="30", PAN="-12", TILT="-42",
               STAND="0.5", CAMX="5.6", CAMY="-1.1", CAMZ="1.0", LENS="35", FSTOP="2.8", AIMX="0.0", AIMZ="0.0",
               SX="-0.12", SY="0.0", PITCHD="4", DIR="-1"),
    "so2": dict(RES="1920x1280", HDR="dry_field_8k.hdr", ROT="109", XS="6.0", VS="0.4", YAW="150", PAN="12", TILT="-48",
                STAND="0.42", CAMX="-1.25", CAMY="-0.75", CAMZ="0.42", LENS="85", FSTOP="2.4", AIMX="0.0", AIMZ="0.0",
                SX="0.0", SY="0.0", PITCHD="4", DIR="1"),
}[SHOT]
g = lambda k: E(k, P[k])
res = tuple(int(x) for x in g("RES").split("x"))
sc = L.reset(res=res, samples=int(E("SPP", "16")), adaptive=f("ADAPT", "0.03"), min_samples=8)
sc.view_settings.exposure = f("EXPOSURE", "0.0")
L.world_hdri(os.path.join(L.ASSETS, g("HDR")), f("SKY", "1.0"), float(g("ROT")))

# ---------------------------------------------------------------- the rows
TILT = math.radians(f("PV_TILT", "25"))
LOW = 0.75
MU, MV, NV, GAP = 1.038, 2.094, 2, 0.02
PITCH = f("ROW_PITCH", "8.5")
NU, NT, TGAP = 26, 4, 0.8
X0 = -34.0
u_ax = Vector((1, 0, 0))
v_ax = Vector((0, math.cos(TILT), math.sin(TILT)))
n_ax = u_ax.cross(v_ax).normalized()
SLOPE = NV * MV + (NV - 1) * GAP
tiles = S.cell_tiles((166, 166), 2.2, 5, 1.1, 1.75, 9.0, 12.0, "white")
frame_m = S.anodised()
steel = S.galvanised()
clamp_m = S.anodised("clamp", (0.75, 0.76, 0.78), (0.3, 0.45))

# the strike: on the lower module of row 0, XS along the row, VS up the slope
XS, VS = float(g("XS")), float(g("VS"))
strike = Vector((XS, 0, LOW)) + v_ax * VS
DIR = float(g("DIR"))  # +1: the drone heads -X and the washed band trails toward +X; -1 the reverse
wash = S.Wash(strike, u_ax * DIR, -v_ax, fresh=0.9, edge=0.06, top=f("BAND_TOP", "0.2"))
rows = [int(k) for k in E("ROWS", "-3,-2,-1,0,1,2,3,4").split(",")]
for k in rows:
    y0 = k * PITCH
    gm = S.pv_material(f"pv row {k}", (MU * 1000, MV * 1000), (6, 12), (14.4, 37.8), tiles, dust=f("DUST", "0.32") * (1.0 if k == 0 else 0.9),
                       wash=wash if k == 0 else None, seed=k)
    for t in range(NT):
        x_t = X0 + t * (NU * (MU + GAP) + TGAP)
        org = Vector((x_t, y0, LOW))
        S.modules_on_plane(org, u_ax, v_ax, NU, NV, MU, MV, GAP, GAP, glass_mat=gm, frame_mat=frame_m, name=f"r{k}t{t}", seed=k * 10 + t)
        # racking: purlins under each module's clamp zones, rafters and posts at stations
        R = S.MeshAcc()
        tl = NU * (MU + GAP) - GAP
        for j in range(NV):
            for vv in (0.42, MV - 0.42):
                vpos = j * (MV + GAP) + vv
                c = org + u_ax * tl / 2 + v_ax * vpos - n_ax * (0.035 + 0.05)
                R.box(c, u_ax, v_ax, n_ax, tl + 0.2, 0.05, 0.10)
                # mid clamps between modules, on top
                for i in range(NU + 1):
                    cx = org + u_ax * (i * (MU + GAP) - GAP / 2) + v_ax * vpos + n_ax * 0.008
                    R.box(cx, u_ax, v_ax, n_ax, 0.024 if 0 < i < NU else 0.04, 0.05, 0.02)
        nst = int(tl // 3.6) + 1
        for si in range(nst + 1):
            xs = org.x + 0.4 + (tl - 0.8) * si / nst
            base = Vector((xs, y0, LOW))
            c = base + v_ax * (SLOPE / 2) - n_ax * (0.035 + 0.1 + 0.06)
            R.box(c, v_ax, u_ax, n_ax, SLOPE - 0.3, 0.07, 0.12)
            for vp in (0.85, SLOPE - 0.95):
                top = base + v_ax * vp - n_ax * (0.035 + 0.1 + 0.12)
                R.box(Vector((top.x, top.y, top.z / 2)), Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)), 0.1, 0.15, top.z + 0.3)
            # a diagonal brace from the rear post foot to the rafter
            a = base + v_ax * (SLOPE - 0.95) - n_ax * 0.3
            a = Vector((a.x, a.y, 0.35))
            bpt = base + v_ax * 1.7 - n_ax * 0.25
            mid, d = (a + bpt) / 2, (bpt - a)
            R.box(mid, d.normalized(), Vector((1, 0, 0)), d.normalized().cross(Vector((1, 0, 0))), d.length, 0.04, 0.04)
        ro = R.write(f"rack r{k}t{t}", steel)
        if k == 0:
            pass
# the clamps share the steel mesh; their tops read silver enough at distance

# ---------------------------------------------------------------- the ground and the grass
gw = (strike, u_ax * DIR, Vector((0, 1, 0)), -0.25, 0.25)  # the drip line under row 0's lower edge, behind the strike
gmat = S.ground_material(scale=f("GSCALE", "0.42"), wet=gw, tint=tuple(float(v) for v in E("GTINT", "1.08,1.0,0.82").split(",")))
GROUND = E("GROUND", "catcher")
gnd = L.plane("ground", (700, 700), (0, 0, 0), material=gmat, catcher=(GROUND == "catcher"))
if GROUND == "catcher":
    # the photographed field of the HDRI itself is the ground (a shadow catcher takes the rows', hose's and drone's
    # shadows); the drip line under the washed modules is a thin wet film laid over it
    L.wet_ground(strike + u_ax * DIR * 9.0 + Vector((0, -0.05, -strike.z)), 18.0, 0.55, 0.0, strength=0.55, name="drip line")

# ---------------------------------------------------------------- the drone
root = L.load_h1(loc=(0, 0, 2), rot_deg=(0, f("PITCHD", P["PITCHD"]), float(g("YAW"))), hose=False, spin=True)
S.aim(root, float(g("PAN")), float(g("TILT")))
nz, ld = S.place_for_strike2(root, strike, n_ax, standoff=float(g("STAND")))
clr = S.clearance(root, strike, n_ax)
print("drone at", tuple(round(v, 3) for v in root.location), "nozzle", tuple(round(v, 3) for v in nz), "clearance", round(clr, 3), flush=True)
SPRAY = E("SPRAY", "1") == "1"
if SPRAY:
    _, _, half0 = L.spray(root, strike, n_ax, drops=int(E("DROPS", "2600")), nz=nz, seed=int(E("SEED", "7")))
    side = ld.cross(Vector((0, 0, 1))).normalized()
    L.mist(strike, n_ax, side, half0, n=int(E("MIST", "4000")))

# the hose: from the rear swivel down over the lower frame edge, to the grass, and back along the aisle
sw = L.model_to_world(root, L.SWIVEL_MM)
stub = (L.model_to_world(root, (-366, 9, 276)) - sw).normalized()
hx = sw.x
def H(dx, y, z):
    return Vector((hx + DIR * dx, y, z))
pts = [sw, sw + stub * 0.12,
       H(0.55, -0.02, LOW + 0.05),
       H(0.85, -0.06, LOW + 0.012 + 0.0085),  # resting on the lower frame lip
       H(1.05, -0.16, LOW - 0.12), H(1.35, -0.32, 0.25), H(1.7, -0.45, 0.0085),
       H(2.8, -0.62, 0.0085), H(4.6, -0.5, 0.0085), H(7.0, -0.78, 0.0085), H(10.5, -0.62, 0.0085), H(15.0, -0.9, 0.0085),
       H(22.0, -0.7, 0.0085), H(32.0, -0.95, 0.0085), H(50.0, -0.8, 0.0085)]
S.hose(pts, radius=0.0085)

# grass: tufts thick in the aisle near the camera, thinner under the tables and far away
cam_xy = (XS + float(g("CAMX")), float(g("CAMY")))
import random as _r
def patch(x, y):  # cheap value noise for mown, patchy cover with bare soil between
    return 0.5 + 0.25 * math.sin(x * 1.7 + 1.3 * math.sin(y * 0.9)) * math.sin(y * 2.1 + 0.7) + 0.25 * math.sin(x * 0.45 + y * 0.8 + 2.0)
def dens(x, y):
    d = math.hypot(x - cam_xy[0], y - cam_xy[1])
    near = 1.0 / (1.0 + (d / 9.0) ** 2)
    under = 0.55 if (0.0 < (y % PITCH) < 3.9) else 1.0
    return min(1.0, near * under * 1.4 * (f("PATCHY", "0.0") * (patch(x, y) - 1.0) + 1.0))
if E("GRASS", "0") == "1":  # blade grass over the built ground (unused with the photographed field)
    gb = (cam_xy[0] - 4, cam_xy[0] + 45, -PITCH * 1.4, PITCH * 1.2) if DIR > 0 else (cam_xy[0] - 45, cam_xy[0] + 4, -PITCH * 1.4, PITCH * 1.2)
    S.grass(dens, gb, int(E("TUFTS", "16000")), seed=4, height=(f("GH0", "0.05"), f("GH1", "0.26")), blades=(5, 16))

# ---------------------------------------------------------------- camera
dc = root.location.copy()
cam = Vector((XS + float(g("CAMX")), float(g("CAMY")), float(g("CAMZ"))))
if SHOT == "so2":
    # side-on to the jet, a little in front of the turret, grazing the glass at about 20 degrees
    mid = strike.lerp(nz, 0.5)
    az = math.radians(f("SO2_AZ", "214"))
    cam = mid + Vector((math.cos(az), math.sin(az), 0)) * f("SO2_D", "2.2")
    cam.z = LOW + cam.y * math.tan(TILT) + f("SO2_H", "0.5") / math.cos(TILT)
    # drops on the glass: splash beads on the dusty side ahead of the strike, a scatter on the washed side
    def region(a, b_):
        s_ = -a * DIR  # metres ahead of the strike along the row (positive: unwashed)
        if s_ > 0:
            return max(0.0, 1.0 - s_ / 0.45) * 0.9 if abs(b_) < 0.5 else 0.0
        return 0.25 if b_ < 0.1 else 0.05
    S.beads(strike + n_ax * 0.0005, u_ax, v_ax, n_ax, int(E("BEADS", "2500")), lambda a, b_: region(a * 0.8, b_ * 0.8),
            seed=9)
if SHOT == "so2":
    tgt = strike.lerp(nz, f("SO2_T", "0.56"))
    focus = (cam - tgt).length
else:
    tgt = dc + Vector((float(g("AIMX")), 0, 0.35 + float(g("AIMZ"))))
    if E("CAMPITCH"):  # level-ish camera: aim at the drone's bearing with a set pitch (degrees)
        hd = math.hypot(tgt.x - cam.x, tgt.y - cam.y)
        tgt.z = cam.z + hd * math.tan(math.radians(f("CAMPITCH", "0")))
    focus = (cam - (dc + Vector((0, 0, 0.3)))).length
L.camera(cam, tgt, lens=float(g("LENS")), fstop=float(g("FSTOP")), focus=focus, shift=(float(g("SX")), float(g("SY"))))
print("camera", tuple(round(v, 2) for v in cam), "focus", round(focus, 2), flush=True)

out = os.path.join(L.HERE, E("OUT", f"tests_solar/{SHOT}_t.png"))
L.render(out)
a = L.load_px(out)
L.save_px(L.grade(a, seed=11, levels=(f("LO", "0.02"), f("HI", "0.94")), sat=f("SAT", "0.95"), vignette=0.12, grain=0.8),
          out.replace(".png", "_g.jpg"), quality=92)
print("graded", flush=True)
