# "Through the glass": the Lienry home hero test frame, built from code around the owner's H1 model.
# From inside a quiet office at first light, the drone washes the window from outside, its boom aimed at
# the glass; water runs down the pane; a hazy city beyond.
# Run: venv/bin/python glass.py MODE [out.png]   or   blender -b --factory-startup -P glass.py -- MODE
# Modes: preview, final, portrait (stills); motion, motion-full, motion-portrait (frame sequences).
import bpy  # noqa: I001 (bpy first: it puts addon_utils on the path)
import addon_utils
import bmesh
import math
import os
import random
import sys
import time
from mathutils import Euler, Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
MODE = ARGS[0] if ARGS else "preview"
OUT = ARGS[1] if len(ARGS) > 1 else os.path.join(HERE, f"glass-{MODE}.png")
# Motion: a seamless loop with the camera still. The props turn, the spray flows, beads run down the glass
# and the drone hovers. LOOP frames at 24 fps; LOOP is a multiple of 3 so the two-blade props come round.
MOTION = MODE.startswith("motion")
LOOP = int(os.environ.get("LOOP", "192" if MODE in ("motion-full", "motion-portrait") else "48"))
# The 15 s cut (10 November): the first 8 s stay exactly as first rendered, timed on LOOP; the film runs to END.
# Lane 2: after the side-step it climbs back to the top of the next lane, leans into the jet as the valve
# opens and washes down it beside the lane it has just washed, still spraying as the film ends (it loops to
# frame 1, mid-wash on lane 1). Nothing new moves before S2: the flight looks 1.4 frames ahead.
END = int(os.environ.get("END", "360" if MODE in ("motion-full", "motion-portrait") else "0")) or LOOP
S2, C_END = 196, 230  # the climb back to the top of the lane
LEAD, F_O2 = 4, 238  # the valve opens over LEAD frames, the drone leaning in step; the jet reaches the glass at F_O2
D2_START = 242  # and it starts down lane 2, easing into lane 1's speed
# The cleaning pass: the drone works down its lane, top-down as facade cleaning is done, DESCENT metres over
# the clip, so the strike line moves down the pane and leaves clean, wet glass above it.
DESCENT = float(os.environ.get("DESCENT", "0.42" if MOTION else "0.0"))
# Lane 1, the first 8 s: it descends its lane spraying (about 5.5 s), eases to a stop as the spray shuts off,
# then side-steps one lane to the left with a slight climb, banking into the move, and settles.
STEP = float(os.environ.get("STEP", "0.27"))
CLIMB = float(os.environ.get("CLIMB", "0.04"))
ROLL_MAX = math.radians(float(os.environ.get("ROLL", "3.0")))
A_END = round(float(os.environ.get("A_FRAC", "0.69")) * (LOOP - 1)) + 1
B_START = A_END + 12  # the drone stops, the valve closes, it levels out, then it moves
B_END = min(LOOP, round(float(os.environ.get("B_FRAC", "0.9")) * (LOOP - 1)) + 1)


def _descend(u):
    # constant speed, easing to a stop over the last 15% of the descent
    g = u if u < 0.85 else 0.85 + (u - 0.85) - (u - 0.85) ** 2 / 0.3
    return g / 0.925


F_V = A_END + 4  # the valve closes once the drone has stopped at the lane's foot, about half a second into the
# medium shot; the jet's pressure collapses over about a tenth of a second


def valve(f):
    """Nozzle pressure, 1 while the valve is open, then an exponential collapse (tau 2 frames). For lane 2 it
    opens again, the pressure building over LEAD frames to F_O2."""
    if END > LOOP and f >= F_O2 - LEAD:  # lane 2: the pressure builds over LEAD frames
        u = min(1.0, (f - (F_O2 - LEAD)) / LEAD)
        return u * u * (3 - 2 * u)
    return 1.0 if f <= F_V else math.exp(-(f - F_V) / 2.0)


def lean(x):
    """The controller's lean into the jet: a frame behind the valve, except as lane 2's valve opens, which the
    controller knows ahead: it leans in step with the building pressure, so the push and the lean cancel and
    the jet lands on its line."""
    if END > LOOP and x >= F_O2 - LEAD:
        return valve(x)
    return valve(x - 1.0)


def _lane2_z(f):
    """Lane 2's height offset: a quintic climb from where the side-step left it to the lane's top, a hover,
    then down at lane 1's constant speed, eased in over half a second."""
    top, park = DESCENT / 2, -DESCENT / 2 + CLIMB
    if f <= C_END:
        u = max(0.0, (f - S2) / (C_END - S2))
        return park + (top - park) * (6 * u ** 5 - 15 * u ** 4 + 10 * u ** 3)
    if f <= D2_START:
        return top
    speed = DESCENT / 0.925 / max(1, A_END - 1)  # lane 1's, per frame
    t, r_ = f - D2_START, 12.0
    return top - speed * ((t ** 3 / r_ ** 2 - t ** 4 / (2 * r_ ** 3)) if t < r_ else (r_ / 2 + t - r_))


def pass_state(f):
    """(offset from the mid-pass position, extra roll in radians, spray on 0..1) at frame f."""
    if not MOTION or DESCENT <= 0:
        return Vector((0.0, 0.0, 0.0)), 0.0, 1.0
    if END > LOOP and f > S2:  # lane 2 (ahead of every lane 1 expression, which stays as it was)
        return Vector((-STEP, 0.0, _lane2_z(f))), 0.0, (valve(f) if f >= F_O2 - LEAD else 0.0)
    spray = valve(f)
    if f <= A_END:
        u = (f - 1) / max(1, A_END - 1)
        return Vector((0.0, 0.0, DESCENT * (0.5 - _descend(u)))), 0.0, spray
    if f <= B_START or B_START >= LOOP:
        return Vector((0.0, 0.0, -DESCENT / 2)), 0.0, spray
    u = min(1.0, (f - B_START) / max(1, B_END - B_START))
    s5 = 6 * u ** 5 - 15 * u ** 4 + 10 * u ** 3
    acc = (60 * u - 180 * u ** 2 + 120 * u ** 3) / 5.77  # the move's acceleration, for the bank
    return Vector((-STEP * s5, 0.0, -DESCENT / 2 + CLIMB * s5)), ROLL_MAX * acc, 0.0


def pass_offset(f):
    return pass_state(f)[0]
def _find_drone():
    if os.environ.get("DRONE"):
        return os.environ["DRONE"]
    here = sorted(f for f in os.listdir(HERE) if f.lower().endswith(".blend"))
    lienry = [f for f in here if "lienry" in f.lower()] or here
    if lienry:
        return os.path.join(HERE, lienry[0])
    return os.path.join(HERE, "Lienry_H1_v3_Revision_B_Blender42.blend")  # the owner's file, kept out of the repository


DRONE_FILE = _find_drone()
rng = random.Random(11)
# The real city: a CC0 HDRI from Poly Haven ("Joburg Central Sunset", Greg Zaal and Dimitrios Savva), shot
# from a rooftop in a city centre at dusk. It is the view, the light and the reflections at once.
HDRI = os.environ.get("HDRI", os.path.join(HERE, "assets", "sunset_jhbcentral_8k.exr"))
ASSETS = os.path.join(HERE, "assets")
PH = "https://dl.polyhaven.org/file/ph-assets"
ASSET_URLS = {
    "sunset_jhbcentral_8k.exr": f"{PH}/HDRIs/exr/8k/sunset_jhbcentral_8k.exr",
    "concrete_floor_worn_001_diff_2k.jpg": f"{PH}/Textures/jpg/2k/concrete_floor_worn_001/concrete_floor_worn_001_diff_2k.jpg",
    "concrete_floor_worn_001_rough_2k.jpg": f"{PH}/Textures/jpg/2k/concrete_floor_worn_001/concrete_floor_worn_001_rough_2k.jpg",
    "concrete_floor_worn_001_nor_2k.jpg": f"{PH}/Textures/jpg/2k/concrete_floor_worn_001/concrete_floor_worn_001_nor_gl_2k.jpg",
    "black_oak_veneer_diff_2k.jpg": f"{PH}/Textures/jpg/2k/black_oak_veneer/black_oak_veneer_diff_2k.jpg",
    "black_oak_veneer_rough_2k.jpg": f"{PH}/Textures/jpg/2k/black_oak_veneer/black_oak_veneer_rough_2k.jpg",
    "black_oak_veneer_nor_2k.jpg": f"{PH}/Textures/jpg/2k/black_oak_veneer/black_oak_veneer_nor_gl_2k.jpg",
}


def ensure_assets():
    """The city photograph and the scanned textures (all CC0, Poly Haven), downloaded once if missing."""
    import urllib.request
    os.makedirs(ASSETS, exist_ok=True)
    for name, url in ASSET_URLS.items():
        dst = os.path.join(ASSETS, name)
        if os.path.exists(dst) and os.path.getsize(dst) > 1000:
            continue
        print("downloading", name, "...", flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": "lienry-hero-render"})
        with urllib.request.urlopen(req, timeout=600) as r, open(dst + ".part", "wb") as fh:
            while True:
                chunk = r.read(1 << 20)
                if not chunk:
                    break
                fh.write(chunk)
        os.replace(dst + ".part", dst)


ensure_assets()
if not os.path.exists(DRONE_FILE):
    sys.exit(f"Drone model not found: {DRONE_FILE}. Put the .blend next to glass.py or set DRONE.")
print("drone model:", DRONE_FILE)

bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable("cycles", default_set=True)
scene = bpy.context.scene
col = scene.collection


# ---------------------------------------------------------------- helpers
def mat(name, base=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, **extra):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*base, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    for k, v in extra.items():
        p.inputs[k].default_value = v
    return m


def link_obj(name, bm, material=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    col.objects.link(o)
    if material:
        o.data.materials.append(material)
    return o


def box(name, size, loc, material=None, rot=(0, 0, 0), bevel=0.0, seg=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    o = link_obj(name, bm, material)
    o.location = loc
    o.rotation_euler = rot
    if bevel:
        m = o.modifiers.new("bevel", "BEVEL")
        m.width = bevel
        m.segments = seg
        m.limit_method = "NONE"
    return o


def cyl(name, r, depth, loc, material=None, rot=(0, 0, 0), verts=32, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    o = link_obj(name, bm, material)
    o.location = loc
    o.rotation_euler = rot
    for f in o.data.polygons:
        f.use_smooth = True
    return o


def ellipsoid(name, scale, loc, material=None, segs=(32, 16)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs[0], v_segments=segs[1], radius=0.5)
    bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
    o = link_obj(name, bm, material)
    o.location = loc
    for f in o.data.polygons:
        f.use_smooth = True
    return o


def facade_mat(name, frame, glass_col, bay, floor, lit=0.0):
    """A procedural curtain of windows: a brick grid where the bricks are glass and the mortar the frame."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["Object"], sep.inputs["Vector"])
    add = n.new("ShaderNodeMath")
    add.operation = "ADD"
    l.new(sep.outputs["X"], add.inputs[0])
    l.new(sep.outputs["Y"], add.inputs[1])
    comb = n.new("ShaderNodeCombineXYZ")
    l.new(add.outputs["Value"], comb.inputs["X"])
    l.new(sep.outputs["Z"], comb.inputs["Y"])
    br = n.new("ShaderNodeTexBrick")
    br.offset = 0.0
    br.squash = 1.0
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Brick Width"].default_value = bay
    br.inputs["Row Height"].default_value = floor
    br.inputs["Mortar Size"].default_value = min(bay, floor) * 0.16
    br.inputs["Mortar Smooth"].default_value = 0.1
    br.inputs["Mortar"].default_value = tuple(c * 0.8 for c in glass_col) + (1,)
    l.new(comb.outputs["Vector"], br.inputs["Vector"])
    # an opaque spandrel band across the bottom quarter of each floor
    sp_d = n.new("ShaderNodeMath")
    sp_d.operation = "DIVIDE"
    sp_d.inputs[1].default_value = floor
    l.new(sep.outputs["Z"], sp_d.inputs[0])
    sp_f = n.new("ShaderNodeMath")
    sp_f.operation = "FRACT"
    l.new(sp_d.outputs["Value"], sp_f.inputs[0])
    sp_m = n.new("ShaderNodeMath")
    sp_m.operation = "LESS_THAN"
    sp_m.inputs[1].default_value = 0.25
    l.new(sp_f.outputs["Value"], sp_m.inputs[0])
    sp_c = n.new("ShaderNodeMix")
    sp_c.data_type = "RGBA"
    l.new(sp_m.outputs["Value"], sp_c.inputs[0])
    l.new(br.outputs["Color"], sp_c.inputs[6])
    sp_c.inputs[7].default_value = tuple(c * 0.55 for c in frame) + (1,)
    l.new(sp_c.outputs[2], p.inputs["Base Color"])
    rough = n.new("ShaderNodeMapRange")
    rough.inputs["To Min"].default_value = 0.08
    rough.inputs["To Max"].default_value = 0.75
    l.new(br.outputs["Fac"], rough.inputs["Value"])
    # each pane its own value and finish, as real curtain walls never sit perfectly flat or even
    pcell = n.new("ShaderNodeVectorMath")
    pcell.operation = "SNAP"
    pcell.inputs[1].default_value = (bay, floor, 1.0)
    l.new(comb.outputs["Vector"], pcell.inputs[0])
    pwn = n.new("ShaderNodeTexWhiteNoise")
    l.new(pcell.outputs["Vector"], pwn.inputs["Vector"])
    pmix = n.new("ShaderNodeMix")
    pmix.data_type = "RGBA"
    pmix.inputs[6].default_value = tuple(c * 0.92 for c in glass_col) + (1,)
    pmix.inputs[7].default_value = tuple(min(1.0, c * 1.08) for c in glass_col) + (1,)
    sweep = n.new("ShaderNodeTexNoise")
    sweep.inputs["Scale"].default_value = 0.02
    sweep.inputs["Detail"].default_value = 1.0
    l.new(tc.outputs["Object"], sweep.inputs["Vector"])
    sweep_m = n.new("ShaderNodeMapRange")
    sweep_m.inputs["To Min"].default_value = 0.75
    sweep_m.inputs["To Max"].default_value = 1.25
    l.new(sweep.outputs["Fac"], sweep_m.inputs["Value"])
    l.new(pwn.outputs["Value"], pmix.inputs[0])
    swc = n.new("ShaderNodeVectorMath")
    swc.operation = "SCALE"
    l.new(pmix.outputs[2], swc.inputs[0])
    l.new(sweep_m.outputs["Result"], swc.inputs["Scale"])
    l.new(swc.outputs["Vector"], br.inputs["Color1"])
    l.new(swc.outputs["Vector"], br.inputs["Color2"])
    prough = n.new("ShaderNodeMapRange")
    prough.inputs["To Min"].default_value = 0.03
    prough.inputs["To Max"].default_value = 0.25
    l.new(pwn.outputs["Value"], prough.inputs["Value"])
    rmix = n.new("ShaderNodeMix")
    rmix.data_type = "FLOAT"
    l.new(br.outputs["Fac"], rmix.inputs[0])
    l.new(prough.outputs["Result"], rmix.inputs[2])
    rmix.inputs[3].default_value = 0.75
    l.new(rmix.outputs[0], p.inputs["Roughness"])
    metal = n.new("ShaderNodeMapRange")
    metal.inputs["To Min"].default_value = 0.7
    metal.inputs["To Max"].default_value = 0.0
    l.new(br.outputs["Fac"], metal.inputs["Value"])
    l.new(metal.outputs["Result"], p.inputs["Metallic"])
    # A few lit rooms: white noise per brick cell, thresholded, warm.
    cell = n.new("ShaderNodeVectorMath")
    cell.operation = "SNAP"
    cell.inputs[1].default_value = (bay, floor, 1.0)
    l.new(comb.outputs["Vector"], cell.inputs[0])
    wn = n.new("ShaderNodeTexWhiteNoise")
    l.new(cell.outputs["Vector"], wn.inputs["Vector"])
    th = n.new("ShaderNodeMath")
    th.operation = "LESS_THAN"
    th.inputs[1].default_value = lit
    l.new(wn.outputs["Value"], th.inputs[0])
    glassmask = n.new("ShaderNodeMath")
    glassmask.operation = "SUBTRACT"
    glassmask.inputs[0].default_value = 1.0
    l.new(br.outputs["Fac"], glassmask.inputs[1])
    em = n.new("ShaderNodeMath")
    em.operation = "MULTIPLY"
    l.new(th.outputs["Value"], em.inputs[0])
    l.new(glassmask.outputs["Value"], em.inputs[1])
    ems = n.new("ShaderNodeMath")
    ems.operation = "MULTIPLY"
    ems.inputs[1].default_value = 1.4
    l.new(em.outputs["Value"], ems.inputs[0])
    p.inputs["Emission Color"].default_value = (1.0, 0.84, 0.66, 1)
    l.new(ems.outputs["Value"], p.inputs["Emission Strength"])
    return m


# ---------------------------------------------------------------- the room
CEIL = 2.85
BAY = 2.0
WX0, WX1 = -6.0, 8.0

def scanned(name, stem, scale, rough_mul=1.0, tint=1.0):
    """A material from a scanned PBR set: colour, roughness and normal maps on object coordinates."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    bsdf = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord")
    mp = n.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    l.new(tc.outputs["Object"], mp.inputs["Vector"])
    def tex(kind, colour):
        t = n.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(os.path.join(ASSETS, f"{stem}_{kind}_2k.jpg"))
        t.image.colorspace_settings.name = "sRGB" if colour else "Non-Color"
        t.projection = "BOX"
        t.projection_blend = 0.2
        l.new(mp.outputs["Vector"], t.inputs["Vector"])
        return t
    d = tex("diff", True)
    tm = n.new("ShaderNodeMix")
    tm.data_type = "RGBA"
    tm.blend_type = "MULTIPLY"
    tm.inputs[0].default_value = 1.0
    l.new(d.outputs["Color"], tm.inputs[6])
    tm.inputs[7].default_value = (tint, tint, tint, 1)
    l.new(tm.outputs[2], bsdf.inputs["Base Color"])
    r = tex("rough", False)
    rm = n.new("ShaderNodeMath")
    rm.operation = "MULTIPLY"
    rm.inputs[1].default_value = rough_mul
    l.new(r.outputs["Color"], rm.inputs[0])
    l.new(rm.outputs["Value"], bsdf.inputs["Roughness"])
    nt = tex("nor", False)
    nm = n.new("ShaderNodeNormalMap")
    l.new(nt.outputs["Color"], nm.inputs["Color"])
    l.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return m


oak = scanned("black oak desk", "black_oak_veneer", 0.8, rough_mul=0.7)
floor_mat = scanned("worn concrete floor", "concrete_floor_worn_001", 0.35, rough_mul=0.55, tint=0.8)
wall = mat("wall", (0.2, 0.2, 0.2), rough=0.9)
plaster = mat("ceiling", (0.12, 0.12, 0.12), rough=0.9)
frame_mat = mat("window frame", (0.12, 0.125, 0.13), rough=0.55, metal=0.0)  # powder-coated aluminium
alu = mat("laptop", (0.55, 0.57, 0.6), rough=0.35, metal=0.9)
screen = mat("laptop screen", (0.02, 0.02, 0.025), rough=0.1, **{"Emission Color": (0.75, 0.82, 0.95, 1), "Emission Strength": 0.0})
mug_mat = mat("mug", (0.86, 0.85, 0.82), rough=0.25, **{"Coat Weight": 0.4})
light_warm = mat("ceiling light", (1, 1, 1), rough=0.5, **{"Emission Color": (1.0, 0.87, 0.72, 1), "Emission Strength": 3.5})
leaf = mat("leaf", (0.05, 0.1, 0.06), rough=0.55)
pot = mat("pot", (0.18, 0.18, 0.17), rough=0.7)
chair_mat = mat("chair", (0.04, 0.042, 0.045), rough=0.6)

box("floor", (16, 12, 0.1), (0, -6, -0.05), floor_mat)
light_warm.node_tree.nodes["Principled BSDF"].inputs["Emission Color"].default_value = (1.0, 0.95, 0.88, 1)
light_warm.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 5.0
near_m = light_warm.copy()
near_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 2.0
# (no near ceiling fixture: its reflection in the pane read as frozen prop blades)
for k, (fx, fy) in enumerate(((5.0, -7.0), (6.6, -7.0), (5.0, -9.6), (6.6, -9.6)) if os.environ.get("CEIL_LIGHTS", "0") == "1" else ()):
    box(f"ceiling light {k}", (0.06, 1.4, 0.02), (fx, fy, CEIL - 0.011), light_warm)
box("ceiling", (16, 12, 0.1), (0, -6, CEIL + 0.05), plaster)
box("left wall", (0.2, 12, CEIL), (WX0 - 0.1, -6, CEIL / 2), wall)
box("back wall", (16, 0.2, CEIL), (0, -12, CEIL / 2), wall)
box("right wall", (0.2, 12, CEIL), (WX1 + 0.1, -6, CEIL / 2), wall)
box("window head", (WX1 - WX0, 0.4, 0.3), (0, -0.22, CEIL - 0.15), plaster)
box("sill", (WX1 - WX0, 0.3, 0.05), (0, -0.16, 0.025), mat("sill", (0.05, 0.052, 0.055), rough=0.7))
# A warm lamp behind us to the left, out of frame and out of the glass's reflections: it lifts the desk.
lamp_data = bpy.data.lights.new("desk lamp", "AREA")
lamp_data.energy = 60
lamp_data.size = 1.2
lamp_data.color = (1.0, 0.97, 0.94)
lamp = bpy.data.objects.new("desk lamp", lamp_data)
lamp.location = (-2.6, -4.2, 2.4)
lamp.rotation_euler = (math.radians(55), 0, math.radians(-40))
lamp.visible_glossy = False
lamp.visible_transmission = False
col.objects.link(lamp)
# The room's back wall, lit softly so the panes carry a faint ghost of the interior; the lamp itself never
# shows in the glass.
ghost_data = bpy.data.lights.new("back wall wash", "AREA")
ghost_data.energy = 250
ghost_data.size = 3.0
ghost_data.color = (0.95, 0.97, 1.0)
ghost = bpy.data.objects.new("back wall wash", ghost_data)
ghost.location = (0, -6, 2.4)
ghost.rotation_euler = (math.radians(-90), 0, 0)  # facing -y, onto the back wall
ghost.visible_glossy = False
ghost.visible_transmission = False
col.objects.link(ghost)

# The desk, near and to the left: oak on slim legs; an open laptop, its screen glowing faintly; a mug.
DESK_Z = 0.74
DX, DY = (float(v) for v in os.environ.get("DESK", "0.9,-1.3").split(","))
box("desk top", (2.0, 0.8, 0.032), (DX, DY, DESK_Z), oak, bevel=0.005)
for sx in (-0.95, 0.95):
    box(f"desk leg {sx}", (0.035, 0.68, 0.72), (DX + sx, DY, DESK_Z / 2 - 0.02), frame_mat)
LX, LY = DX - 0.15, DY + 0.02
# Turned away from us: its aluminium lid back faces the camera and catches the window.
# box("laptop base", (0.32, 0.22, 0.012), (LX, LY, DESK_Z + 0.022), alu, rot=(0, 0, math.radians(204)), bevel=0.004)
# box("laptop lid", (0.32, 0.008, 0.21), (LX - 0.05, LY - 0.11, DESK_Z + 0.125), alu, rot=(math.radians(14), 0, math.radians(204)), bevel=0.003)
# box("laptop screen", (0.29, 0.002, 0.18), (LX - 0.048, LY - 0.104, DESK_Z + 0.125), screen, rot=(math.radians(14), 0, math.radians(204)))
# cyl("mug", 0.042, 0.095, (DX + 0.72, DY + 0.32, DESK_Z + 0.064), mug_mat, verts=40)
box("notebook", (0.21, 0.29, 0.012), (DX + 0.1, DY - 0.1, DESK_Z + 0.022), mat("notebook", (0.12, 0.13, 0.14), rough=0.7), rot=(0, 0, math.radians(-8)), bevel=0.003)
cyl("pot", 0.22, 0.46, (WX0 + 0.7, -0.75, 0.23), pot, verts=32, r2=0.18)
for k in range(30):
    a = rng.uniform(0, 2 * math.pi)
    h = rng.uniform(0.55, 1.55)
    lf = ellipsoid(f"leaf {k}", (0.07, 0.26, 0.012), (WX0 + 0.7 + math.cos(a) * 0.2, -0.75 + math.sin(a) * 0.2, 0.46 + h), leaf)
    lf.rotation_euler = (rng.uniform(-0.9, 0.9), rng.uniform(-0.4, 0.4), a)

# ---------------------------------------------------------------- the window, wet where the drone has sprayed
glass = bpy.data.materials.new("window glass")
glass.use_nodes = True
g = glass.node_tree
gn, gl = g.nodes, g.links
g.nodes.remove(gn["Principled BSDF"])
gbs = gn.new("ShaderNodeBsdfGlass")
gbs.inputs["IOR"].default_value = 1.5
gbs.inputs["Roughness"].default_value = 0.0
gbs.inputs["Color"].default_value = (0.93, 0.96, 0.96, 1)
gtc = gn.new("ShaderNodeTexCoord")
gsep = gn.new("ShaderNodeSeparateXYZ")
gl.new(gtc.outputs["Object"], gsep.inputs["Vector"])
mapb = gn.new("ShaderNodeMapping")
mapb.inputs["Scale"].default_value = (30, 30, 30)
gl.new(gtc.outputs["Object"], mapb.inputs["Vector"])
vor = gn.new("ShaderNodeTexVoronoi")
vor.inputs["Randomness"].default_value = 1.0
gl.new(mapb.outputs["Vector"], vor.inputs["Vector"])
bead = gn.new("ShaderNodeMapRange")
bead.inputs["From Min"].default_value = 0.0
bead.inputs["From Max"].default_value = 0.36
bead.inputs["To Min"].default_value = 1.0
bead.inputs["To Max"].default_value = 0.0
gl.new(vor.outputs["Distance"], bead.inputs["Value"])
bead_sq = gn.new("ShaderNodeMath")
bead_sq.operation = "POWER"
bead_sq.inputs[1].default_value = 1.5
gl.new(bead.outputs["Result"], bead_sq.inputs[0])
# about a third of the cells hold a drop
b_sep = gn.new("ShaderNodeSeparateColor")
gl.new(vor.outputs["Color"], b_sep.inputs["Color"])
b_gate = gn.new("ShaderNodeMath")
b_gate.operation = "GREATER_THAN"
b_gate.inputs[1].default_value = 0.66
gl.new(b_sep.outputs[0], b_gate.inputs[0])
b_drop = gn.new("ShaderNodeMath")
b_drop.operation = "MULTIPLY"
gl.new(bead_sq.outputs["Value"], b_drop.inputs[0])
gl.new(b_gate.outputs["Value"], b_drop.inputs[1])
mapr = gn.new("ShaderNodeMapping")
mapr.inputs["Scale"].default_value = (12, 12, 0.8)
r_wn = gn.new("ShaderNodeTexNoise")
r_wn.inputs["Scale"].default_value = 1.5
gl.new(gtc.outputs["Object"], r_wn.inputs["Vector"])
r_wo = gn.new("ShaderNodeMapRange")
r_wo.inputs["To Min"].default_value = -0.03
r_wo.inputs["To Max"].default_value = 0.03
gl.new(r_wn.outputs["Fac"], r_wo.inputs["Value"])
r_sep = gn.new("ShaderNodeSeparateXYZ")
gl.new(gtc.outputs["Object"], r_sep.inputs["Vector"])
r_x = gn.new("ShaderNodeMath")
r_x.operation = "ADD"
gl.new(r_sep.outputs["X"], r_x.inputs[0])
gl.new(r_wo.outputs["Result"], r_x.inputs[1])
r_comb = gn.new("ShaderNodeCombineXYZ")
gl.new(r_x.outputs["Value"], r_comb.inputs["X"])
gl.new(r_sep.outputs["Y"], r_comb.inputs["Y"])
gl.new(r_sep.outputs["Z"], r_comb.inputs["Z"])
gl.new(r_comb.outputs["Vector"], mapr.inputs["Vector"])
runs = gn.new("ShaderNodeTexNoise")
runs.inputs["Scale"].default_value = 2.2
runs.inputs["Detail"].default_value = 5.0
gl.new(mapr.outputs["Vector"], runs.inputs["Vector"])
rmid = gn.new("ShaderNodeMath")
rmid.operation = "SUBTRACT"
rmid.inputs[1].default_value = 0.5
gl.new(runs.outputs["Fac"], rmid.inputs[0])
rabs = gn.new("ShaderNodeMath")
rabs.operation = "ABSOLUTE"
gl.new(rmid.outputs["Value"], rabs.inputs[0])
rr = gn.new("ShaderNodeMapRange")
rr.inputs["From Min"].default_value = 0.0
rr.inputs["From Max"].default_value = 0.02
rr.inputs["To Min"].default_value = 1.0
rr.inputs["To Max"].default_value = 0.0
gl.new(rabs.outputs["Value"], rr.inputs["Value"])
wmax = gn.new("ShaderNodeMath")
wmax.operation = "MAXIMUM"
gl.new(b_drop.outputs["Value"], wmax.inputs[0])
r_round = gn.new("ShaderNodeMath")
r_round.operation = "POWER"
r_round.inputs[1].default_value = 0.5
gl.new(rr.outputs["Result"], r_round.inputs[0])
r_w = gn.new("ShaderNodeMath")
r_w.operation = "MULTIPLY"
r_w.inputs[1].default_value = float(os.environ.get("RUNS", "0.0"))  # the real rivulets are geometry now
gl.new(r_round.outputs["Value"], r_w.inputs[0])
gl.new(r_w.outputs["Value"], wmax.inputs[1])
wet_attr = gn.new("ShaderNodeAttribute")
wet_attr.attribute_name = "wet"
mask = gn.new("ShaderNodeMath")
mask.operation = "MULTIPLY"
gl.new(wmax.outputs["Value"], mask.inputs[0])
w_gate = gn.new("ShaderNodeMapRange")
w_gate.clamp = True
w_gate.inputs["From Min"].default_value = 0.2
w_gate.inputs["From Max"].default_value = 0.75
gl.new(wet_attr.outputs["Fac"], w_gate.inputs["Value"])
gl.new(w_gate.outputs["Result"], mask.inputs[1])
geo = gn.new("ShaderNodeNewGeometry")
nsep = gn.new("ShaderNodeSeparateXYZ")
gl.new(geo.outputs["Normal"], nsep.inputs["Vector"])
outer = gn.new("ShaderNodeMath")
outer.operation = "GREATER_THAN"
outer.inputs[1].default_value = 0.5
gl.new(nsep.outputs["Y"], outer.inputs[0])
h = mask  # the inner face carries no wet value, so the mask alone keeps the water outside
bump = gn.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.6
bump.inputs["Distance"].default_value = float(os.environ.get("BUMP", "0.001"))
gl.new(h.outputs["Value"], bump.inputs["Height"])
gl.new(bump.outputs["Normal"], gbs.inputs["Normal"])
g_lp = gn.new("ShaderNodeLightPath")
g_tr = gn.new("ShaderNodeBsdfTransparent")
g_mix = gn.new("ShaderNodeMixShader")
gl.new(g_lp.outputs["Is Shadow Ray"], g_mix.inputs["Fac"])
g_bf = gn.new("ShaderNodeNewGeometry")
g_sm = gn.new("ShaderNodeTexNoise")
g_sm.inputs["Scale"].default_value = 3.0
g_sm.inputs["Detail"].default_value = 3.0
gl.new(gtc.outputs["Object"], g_sm.inputs["Vector"])
g_smr = gn.new("ShaderNodeMapRange")
g_smr.inputs["From Min"].default_value = 0.5
g_smr.inputs["From Max"].default_value = 0.72
g_smr.inputs["To Max"].default_value = float(os.environ.get("SMUDGE", "0.05"))
gl.new(g_sm.outputs["Fac"], g_smr.inputs["Value"])
g_in = gn.new("ShaderNodeMath")
g_in.operation = "SUBTRACT"
g_in.inputs[0].default_value = 1.0
gl.new(g_bf.outputs["Backfacing"], g_in.inputs[1])
g_smf = gn.new("ShaderNodeMath")
g_smf.operation = "MULTIPLY"
gl.new(g_smr.outputs["Result"], g_smf.inputs[0])
gl.new(g_in.outputs["Value"], g_smf.inputs[1])
g_tl = gn.new("ShaderNodeBsdfTranslucent")
g_tl.inputs["Color"].default_value = (0.9, 0.93, 0.96, 1)
g_smix = gn.new("ShaderNodeMixShader")
gl.new(g_smf.outputs["Value"], g_smix.inputs["Fac"])
gl.new(gbs.outputs["BSDF"], g_smix.inputs[1])
gl.new(g_tl.outputs["BSDF"], g_smix.inputs[2])
def g_noise(scale, detail=6.0, vec=None):
    t = gn.new("ShaderNodeTexNoise")
    t.inputs["Scale"].default_value = scale
    t.inputs["Detail"].default_value = detail
    gl.new(vec or gtc.outputs["Object"], t.inputs["Vector"])
    return t
def g_math(op, a, b):
    m_ = gn.new("ShaderNodeMath")
    m_.operation = op
    for i_, x_ in enumerate((a, b)):
        if isinstance(x_, (int, float)):
            m_.inputs[i_].default_value = x_
        else:
            gl.new(x_, m_.inputs[i_])
    return m_.outputs["Value"]
def g_ramp(x_, lo, hi):
    r_ = gn.new("ShaderNodeMapRange")
    r_.clamp = True
    r_.inputs["From Min"].default_value = lo
    r_.inputs["From Max"].default_value = hi
    gl.new(x_, r_.inputs["Value"])
    return r_.outputs["Result"]
d_large = g_ramp(g_noise(1.2, 3.0).outputs["Fac"], 0.35, 0.7)
d_stmap = gn.new("ShaderNodeMapping")
d_stmap.inputs["Scale"].default_value = (60, 60, 1.4)
gl.new(gtc.outputs["Object"], d_stmap.inputs["Vector"])
d_streak = g_ramp(g_noise(1.0, 4.0, d_stmap.outputs["Vector"]).outputs["Fac"], 0.5, 0.75)
d_spmap = gn.new("ShaderNodeMapping")
d_spmap.inputs["Scale"].default_value = (55, 55, 55)
gl.new(gtc.outputs["Object"], d_spmap.inputs["Vector"])
d_vor = gn.new("ShaderNodeTexVoronoi")
gl.new(d_spmap.outputs["Vector"], d_vor.inputs["Vector"])
d_spots = g_ramp(g_math("SUBTRACT", 1.0, d_vor.outputs["Distance"]), 0.75, 0.9)
d_fine = g_ramp(g_noise(60, 4.0).outputs["Fac"], 0.45, 0.8)
d_sum = g_math("ADD", g_math("MULTIPLY", d_large, 0.2), g_math("ADD", g_math("MULTIPLY", d_streak, 0.3), g_math("ADD", g_math("MULTIPLY", d_spots, 0.5), g_math("MULTIPLY", d_fine, 0.2))))
g_clean = gn.new("ShaderNodeAttribute")
g_clean.attribute_name = "clean"
g_outer = gn.new("ShaderNodeAttribute")
g_outer.attribute_name = "outer"
d_mask = g_math("MULTIPLY", g_outer.outputs["Fac"], g_math("SUBTRACT", 1.0, g_clean.outputs["Fac"]))
d_fac = g_math("MULTIPLY", g_math("MULTIPLY", d_sum, d_mask), float(os.environ.get("DIRT", "0.42")))
film_maps = []
film_noises = []
for _ in range(2):
    mf_ = gn.new("ShaderNodeMapping")
    mf_.inputs["Scale"].default_value = (4.0, 4.0, 1.2)  # irregular wobbles about 3:1, not 15:1 flutes
    gl.new(r_comb.outputs["Vector"], mf_.inputs["Vector"])
    film_maps.append(mf_)
    film_noises.append(g_noise(6.0, 3.0, mf_.outputs["Vector"]).outputs["Fac"])
film_fade = gn.new("ShaderNodeValue")
film_fade.outputs[0].default_value = 0.0
fmix = gn.new("ShaderNodeMix")
fmix.data_type = "FLOAT"
gl.new(film_fade.outputs[0], fmix.inputs[0])
gl.new(film_noises[0], fmix.inputs[2])
gl.new(film_noises[1], fmix.inputs[3])
film_h = g_math("MULTIPLY", fmix.outputs[0], float(os.environ.get("FILM", "0.6")))
gl.new(g_math("MAXIMUM", wmax.outputs["Value"], film_h), mask.inputs[0])
g_dirt = gn.new("ShaderNodeBsdfTranslucent")
g_dirt.inputs["Color"].default_value = (0.9, 0.9, 0.9, 1)
g_dmix = gn.new("ShaderNodeMixShader")
gl.new(d_fac, g_dmix.inputs["Fac"])
gl.new(g_smix.outputs["Shader"], g_dmix.inputs[1])
gl.new(g_dirt.outputs["BSDF"], g_dmix.inputs[2])
g_strike = gn.new("ShaderNodeAttribute")
g_strike.attribute_name = "strike"
foam_map = gn.new("ShaderNodeMapping")
foam_map.inputs["Scale"].default_value = (70, 70, 120)
gl.new(gtc.outputs["Object"], foam_map.inputs["Vector"])
foam_noise = gn.new("ShaderNodeTexNoise")
foam_noise.noise_dimensions = "4D"
foam_noise.inputs["Scale"].default_value = 1.0
foam_noise.inputs["Detail"].default_value = 4.0
gl.new(foam_map.outputs["Vector"], foam_noise.inputs["Vector"])
foam_fac = g_math("MULTIPLY", g_math("MULTIPLY", g_ramp(foam_noise.outputs["Fac"], 0.42, 0.68), g_strike.outputs["Fac"]), float(os.environ.get("FOAM", "0.15")))
# the strike churns the water: its turbulence goes into the glass's relief, so it glitters and refracts
churn = g_math("MULTIPLY", g_ramp(foam_noise.outputs["Fac"], 0.35, 0.75), g_strike.outputs["Fac"])
gl.new(g_math("ADD", mask.outputs["Value"], g_math("MULTIPLY", churn, 0.5)), bump.inputs["Height"])
g_foam = gn.new("ShaderNodeBsdfTranslucent")
g_foam.inputs["Color"].default_value = (0.95, 0.96, 0.98, 1)
g_fmix = gn.new("ShaderNodeMixShader")
gl.new(foam_fac, g_fmix.inputs["Fac"])
gl.new(g_dmix.outputs["Shader"], g_fmix.inputs[1])
gl.new(g_foam.outputs["BSDF"], g_fmix.inputs[2])
gl.new(g_fmix.outputs["Shader"], g_mix.inputs[1])
gl.new(g_tr.outputs["BSDF"], g_mix.inputs[2])
gl.new(g_mix.outputs["Shader"], gn["Material Output"].inputs["Surface"])

# The drone's pose, decided first so the wet patch sits where its nozzle actually points.
D = Vector(tuple(float(v) for v in os.environ.get("DRONE_AT", "1.7,1.443,1.42").split(",")))
YAW = math.radians(float(os.environ.get("YAW", "-88")))
ROT = Euler((math.radians(1.5), math.radians(float(os.environ.get("PITCH", "5"))), YAW), "XYZ")
_R = ROT.to_matrix()
STANDOFF = float(os.environ.get("STANDOFF", "0.6"))  # nozzle orifice to glass, the owner's 600 mm
D.y = STANDOFF - (_R @ Vector((0.825, 0.0, 0.19))).y
NOZZLE = D + _R @ Vector((0.825, 0.0, 0.19))
_dir = (_R @ Vector((1.0, 0.0, 0.0))).normalized()
IMPACT = NOZZLE + _dir * (-NOZZLE.y / _dir.y)
IMPACT.y = 0.0
# The wet area, painted per vertex on a finely divided outer pane: strongest where the fan meets the
# glass and in the sheet running down from it, ragged at the edges.
bm = bmesh.new()
wet = bm.verts.layers.float.new("wet")
clean = bm.verts.layers.float.new("clean")
outer_l = bm.verts.layers.float.new("outer")
bm.verts.layers.float.new("strike")
nx = int((WX1 - WX0) / BAY)
for i in range(nx):
    x0 = WX0 + i * BAY + 0.035
    x1 = WX0 + (i + 1) * BAY - 0.035
    geom = bmesh.ops.create_grid(bm, x_segments=60, y_segments=110, size=0.5)
    vs = geom["verts"]
    bmesh.ops.rotate(bm, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(math.radians(-90), 3, "X"), verts=vs)  # outer face, normal +y
    bmesh.ops.scale(bm, vec=Vector(((x1 - x0), 1, (CEIL - 0.36))), verts=vs)
    bmesh.ops.translate(bm, vec=Vector(((x0 + x1) / 2, 0.006, 0.06 + (CEIL - 0.36) / 2)), verts=vs)
    inner = bmesh.ops.create_grid(bm, x_segments=2, y_segments=2, size=0.5)["verts"]
    bmesh.ops.rotate(bm, cent=Vector((0, 0, 0)), matrix=Matrix.Rotation(math.radians(90), 3, "X"), verts=inner)  # inner face, normal -y
    bmesh.ops.scale(bm, vec=Vector(((x1 - x0), 1, (CEIL - 0.36))), verts=inner)
    bmesh.ops.translate(bm, vec=Vector(((x0 + x1) / 2, -0.006, 0.06 + (CEIL - 0.36) / 2)), verts=inner)
bm.verts.ensure_lookup_table()
for v in bm.verts:
    if v.co.y < 0:
        v[wet] = 0.0
        v[clean] = 0.0
        v[outer_l] = 0.0
        continue
    v[outer_l] = 1.0
    dx, dz = v.co.x - IMPACT.x, v.co.z - IMPACT.z
    HALF = NOZZLE.y * math.tan(math.radians(12.5))  # half the strike line at the pane
    ex = max(0.0, abs(dx) - HALF)
    strike = math.exp(-(ex * ex / 0.02 ** 2 + dz * dz / 0.03 ** 2) / 2)
    ew = max(0.0, abs(dx) - max(0.4 * HALF, HALF - max(0.0, -dz) * 0.35))
    sheet = math.exp(-(ew * ew) / (2 * 0.025 ** 2)) * (math.exp(dz * 0.7) if dz < 0.0 else math.exp(-dz * 40))
    v[wet] = min(1.0, max(strike, sheet) * (0.75 + 0.5 * rng.random()))
    # the lane already washed on the way down: clean glass the strike's width, above the strike
    el = max(0.0, abs(dx) - (HALF + 0.015))
    lane = math.exp(-(el * el) / (2 * 0.02 ** 2)) * (1.0 if dz > -0.02 else 0.0)
    v[clean] = min(1.0, max(lane, v[wet] * 1.2))
panes = link_obj("window panes", bm, glass)
import numpy as np  # noqa: E402
_pv = np.empty(len(panes.data.vertices) * 3, dtype=np.float32)
panes.data.vertices.foreach_get("co", _pv)
_pv = _pv.reshape(-1, 3)
_outer = (_pv[:, 1] > 0).astype(np.float32)
_jit = np.array([0.75 + 0.5 * rng.random() for _ in range(len(_pv))], dtype=np.float32)


def paint_glass(imp, gain=1.0, t_off=0.0):
    """Water and the washed lane on the outer face for a strike at imp (x, z). t_off: seconds since the valve
    closed; the falling sheet then drains, its top edge running down the pane at about 0.8 m/s."""
    half = NOZZLE.y * math.tan(math.radians(12.5))
    dx = _pv[:, 0] - imp[0]
    dz = _pv[:, 2] - imp[1]
    ex = np.maximum(0.0, np.abs(dx) - half)
    strike = np.exp(-(ex * ex / 0.02 ** 2 + dz * dz / 0.03 ** 2) / 2) * gain
    ew = np.maximum(0.0, np.abs(dx) - np.maximum(0.4 * half, half - np.maximum(0.0, -dz) * 0.35))
    lane_x = np.exp(-(ew * ew) / (2 * 0.025 ** 2))
    # below the strike the falling sheet; above it the lane just washed stays wet, a film draining over seconds
    sheet = lane_x * np.where(dz < 0.0, np.exp(np.minimum(dz, 0.0) * 0.7), 0.5 + 0.35 * np.exp(-np.maximum(dz, 0.0) / 0.19))
    if t_off > 0.0:
        top = -0.8 * t_off  # the sheet's top edge, relative to the last strike
        edge = 1.0 / (1.0 + np.exp(-(top - dz) / 0.015))  # 1 below the edge, 0 above
        sheet = sheet * (0.5 + 0.5 * edge) * (0.6 + 0.4 * math.exp(-t_off / 0.8))
    w_ = np.minimum(1.0, np.maximum(strike, sheet) * _jit) * _outer
    el = np.maximum(0.0, np.abs(dx) - (half + 0.015))
    lane = np.exp(-(el * el) / (2 * 0.02 ** 2)) * (dz > -0.02)
    c_ = np.minimum(1.0, np.maximum(lane, w_ * 1.2)) * _outer
    panes.data.attributes["wet"].data.foreach_set("value", w_.astype(np.float32))
    panes.data.attributes["clean"].data.foreach_set("value", c_.astype(np.float32))
    st_band = np.exp(-(ex * ex / 0.012 ** 2 + (dz + 0.004) ** 2 / 0.011 ** 2) / 2) * gain * _outer
    panes.data.attributes["strike"].data.foreach_set("value", st_band.astype(np.float32))
    panes.data.update()
def lane_fields(imp, gain=1.0, t_off=0.0, top=None, front=None):
    """paint_glass's fields for one lane, returned, not written: lane 2 needs the union with lane 1's. top caps
    the washed band (and its film) where this lane's washing began; front cuts the falling sheet below the
    height it has run down to."""
    half = NOZZLE.y * math.tan(math.radians(12.5))
    dx = _pv[:, 0] - imp[0]
    dz = _pv[:, 2] - imp[1]
    ex = np.maximum(0.0, np.abs(dx) - half)
    strike = np.exp(-(ex * ex / 0.02 ** 2 + dz * dz / 0.03 ** 2) / 2) * gain
    ew = np.maximum(0.0, np.abs(dx) - np.maximum(0.4 * half, half - np.maximum(0.0, -dz) * 0.35))
    lane_x = np.exp(-(ew * ew) / (2 * 0.025 ** 2))
    above = 0.5 + 0.35 * np.exp(-np.maximum(dz, 0.0) / 0.19)
    below = np.exp(np.minimum(dz, 0.0) * 0.7)
    capz = 1.0
    if top is not None:
        capz = 1.0 / (1.0 + np.exp((_pv[:, 2] - top) / 0.015))  # 1 below where this lane began, 0 above
        above = above * capz
    if front is not None:
        below = below / (1.0 + np.exp((front - _pv[:, 2]) / 0.015))  # 1 above the sheet's foot, 0 below
    sheet = lane_x * np.where(dz < 0.0, below, above)
    if t_off > 0.0:
        top_ = -0.8 * t_off
        edge = 1.0 / (1.0 + np.exp(-(top_ - dz) / 0.015))
        sheet = sheet * (0.5 + 0.5 * edge) * (0.6 + 0.4 * math.exp(-t_off / 0.8))
    w_ = np.minimum(1.0, np.maximum(strike, sheet) * _jit) * _outer
    el = np.maximum(0.0, np.abs(dx) - (half + 0.015))
    lane = np.exp(-(el * el) / (2 * 0.02 ** 2)) * (dz > -0.02) * capz
    c_ = np.minimum(1.0, np.maximum(lane, w_ * 1.2)) * _outer
    st_band = np.exp(-(ex * ex / 0.012 ** 2 + (dz + 0.004) ** 2 / 0.011 ** 2) / 2) * gain * _outer
    return w_, c_, st_band


def paint_two_lanes(f):
    """Lane 1 as it stood, its last strike long drained, and lane 2 washing: their union on the glass."""
    w1, c1, s1 = lane_fields(strike_point(F_V), 0.0, (f - F_V) / 24.0)
    w2, c2, s2 = lane_fields(strike_point(f), 1.0, 0.0, top=Z_TOP2, front=lane2_front(f))
    panes.data.attributes["wet"].data.foreach_set("value", np.maximum(w1, w2).astype(np.float32))
    panes.data.attributes["clean"].data.foreach_set("value", np.maximum(c1, c2).astype(np.float32))
    panes.data.attributes["strike"].data.foreach_set("value", np.maximum(s1, s2).astype(np.float32))
    panes.data.update()


def strike_point(f):
    """Where the fan's centre meets the pane at frame f, from the simulated pose when there is one."""
    pose = globals().get("SIM_POSE", {}).get(f)
    if pose is None:
        off = pass_offset(f)
        return (IMPACT.x + off.x, IMPACT.z + off.z)
    loc, rot = pose
    R_ = rot.to_matrix()
    nz = loc + R_ @ Vector((0.825, 0.0, 0.19))
    d_ = R_ @ Vector((1.0, 0.0, 0.0))
    hit = nz + d_ * (-nz.y / d_.y)
    return (hit.x, hit.z)


if os.environ.get("DBG"):
    at = panes.data.attributes.get("wet")
    print("DBG attrs", [x.name for x in panes.data.attributes], at and (at.domain, at.data_type))
    import collections
    bins = collections.defaultdict(list)
    for vv, dd in zip(panes.data.vertices, at.data):
        bins[(round(vv.co.x), vv.co.y > 0)].append(dd.value)
    for k in sorted(bins):
        vals = bins[k]
        print("DBG", k, len(vals), round(sum(vals) / len(vals), 3), round(max(vals), 3))
    print("DBG impact", IMPACT, "nozzle", NOZZLE)
    sys.exit(0)
for f in panes.data.polygons:
    f.use_smooth = True
for i in range(nx + 1):
    x = WX0 + i * BAY
    box(f"mullion {i}", (0.075, 0.17, CEIL - 0.3), (x, -0.02, (CEIL - 0.3) / 2 + 0.03), frame_mat, bevel=0.006)
box("transom low", (WX1 - WX0, 0.12, 0.05), (0, -0.02, 0.06), frame_mat)
box("transom high", (WX1 - WX0, 0.12, 0.05), (0, -0.02, CEIL - 0.31), frame_mat)
spandrel = mat("spandrel", (0.03, 0.04, 0.045), rough=0.15)
box("spandrel low", (60, 0.4, 1.2), (0, 0.25, -0.6), spandrel)
box("spandrel high", (60, 0.4, 1.0), (0, 0.25, CEIL + 0.5), spandrel)
for nm_, sz_, lc_ in (("facade above", (80, 0.35, 26.0), (0, 0.43, CEIL + 1.0 + 13.0)),
                      ("facade below", (80, 0.35, 38.0), (0, 0.43, -1.2 - 19.0))):
    fo_ = box(nm_, sz_, lc_, mat(nm_, (0.03, 0.035, 0.04), rough=0.08))
    fo_.visible_camera = False
    fo_.visible_transmission = False

# ---------------------------------------------------------------- the city
GROUND = -40.0  # the room's floor is 40 m up: the building stays under the site's stated 70 m
if HDRI:
    st_ = box("street", (1000, 1000, 0.2), (0, 0, GROUND), mat("street", (0.05, 0.05, 0.055), rough=0.9))
    st_.visible_camera = False
    st_.visible_transmission = False
if not HDRI:  # (only without the photographed city)
    pass
    fmats = [
        facade_mat("tower pale", (0.64, 0.65, 0.66), (0.4, 0.45, 0.5), 1.6, 3.6),
        facade_mat("tower glass", (0.1, 0.11, 0.12), (0.12, 0.15, 0.18), 1.5, 3.4),
        facade_mat("tower stone", (0.55, 0.55, 0.54), (0.38, 0.43, 0.48), 2.2, 3.5),
        facade_mat("tower grey", (0.32, 0.34, 0.36), (0.4, 0.46, 0.52), 1.4, 3.3),
    ]


    def tower(name, x, y, w, d, h, m, setback=True, rz=0.0):
        box(name, (w, d, h), (x, y, GROUND + h / 2), m, rot=(0, 0, math.radians(rz)))
        if setback and h > 80:
            box(name + " top", (w * 0.7, d * 0.7, h * 0.18), (x, y, GROUND + h + h * 0.09), m)
            box(name + " plant", (w * 0.3, d * 0.3, 4.0), (x, y, GROUND + h * 1.18 + 2.0), fmats[3])


    # One dark glass tower near enough to read (right), the rest further back, shortening into the haze so
    # the sky opens above them.
    tower("near glass", 70, 120, 34, 30, 150, fmats[1], rz=-24)
    tower("pale", -60, 150, 40, 30, 96, fmats[0], rz=28)
    tower("stone", 5, 210, 46, 34, 118, fmats[2], rz=18)
    tower("grey", -150, 230, 40, 34, 136, fmats[3], rz=-22)
    tower("far pale", 150, 300, 44, 40, 168, fmats[0])
    # to the right of the view, further into the haze, so the open sky there has some depth
    tower("right A", 170, 175, 40, 36, 140, fmats[2], rz=12)
    tower("right B", 260, 205, 50, 40, 110, fmats[0], rz=-8)
    tower("right C", 330, 330, 44, 44, 170, fmats[3])
    for k in range(30):
        w, hh = rng.uniform(24, 50), rng.uniform(55, 150)
        tower(f"far {k}", rng.uniform(-420, 420), rng.uniform(260, 700), w, w, hh, fmats[k % 4])
    box("ground", (1600, 1600, 0.5), (0, 300, GROUND - 0.25), mat("ground", (0.1, 0.1, 0.1), rough=0.9))

    haze_mat = bpy.data.materials.new("morning haze")
    haze_mat.use_nodes = True
    hn = haze_mat.node_tree
    hn.nodes.remove(hn.nodes["Principled BSDF"])
    hv = hn.nodes.new("ShaderNodeVolumeScatter")
    hv.inputs["Color"].default_value = (0.8, 0.86, 0.93, 1)
    # Denser near the ground, thinning with height, so tower bases sink into it while their tops hold.
    h_tc = hn.nodes.new("ShaderNodeTexCoord")
    h_sep = hn.nodes.new("ShaderNodeSeparateXYZ")
    hn.links.new(h_tc.outputs["Object"], h_sep.inputs["Vector"])
    h_up = hn.nodes.new("ShaderNodeMath")
    h_up.operation = "ADD"
    h_up.inputs[1].default_value = 60.0 - GROUND  # the box's local z at the ground
    hn.links.new(h_sep.outputs["Z"], h_up.inputs[0])
    h_k = hn.nodes.new("ShaderNodeMath")
    h_k.operation = "MULTIPLY"
    h_k.inputs[1].default_value = -1.0 / 45.0
    hn.links.new(h_up.outputs["Value"], h_k.inputs[0])
    h_exp = hn.nodes.new("ShaderNodeMath")
    h_exp.operation = "EXPONENT"
    hn.links.new(h_k.outputs["Value"], h_exp.inputs[0])
    h_d = hn.nodes.new("ShaderNodeMath")
    h_d.operation = "MULTIPLY"
    h_d.inputs[1].default_value = float(os.environ.get("HAZE", "0.003"))
    hn.links.new(h_exp.outputs["Value"], h_d.inputs[0])
    hn.links.new(h_d.outputs["Value"], hv.inputs["Density"])
    hv.inputs["Anisotropy"].default_value = float(os.environ.get("ANISO", "0.45"))
    hn.links.new(hv.outputs["Volume"], hn.nodes["Material Output"].inputs["Volume"])
    haze = box("haze", (1400, 600, 320), (0, 406, 60), haze_mat)
    # The haze glows with the light it scatters but casts no shadow, so the low sun still reaches the drone.
    haze.visible_shadow = False

# ---------------------------------------------------------------- the drone: the owner's H1 model
with bpy.data.libraries.load(DRONE_FILE, link=False) as (src, dst):
    dst.objects = [n for n in src.objects if n.startswith("H1_") and n != "H1_Notes_PartsAndAssumptions"]
drone_objs = [o for o in dst.objects if o is not None]
for o in drone_objs:
    col.objects.link(o)
for name in ("H1_P26_SupplyHose_1p8m", "H1_P26_Braid_-1", "H1_P26_Braid_1", "H1_P26_BlueBraidedSleeve"):
    o = bpy.data.objects.get(name)
    if o:
        o.hide_render = True
        o.hide_viewport = True
root = bpy.data.objects.new("H1", None)
col.objects.link(root)
for o in drone_objs:
    if o.parent is None:
        o.parent = root
root.scale = (0.001, 0.001, 0.001)
root.rotation_euler = ROT
root.location = D
bpy.context.view_layer.update()
model_to_world = root.matrix_world.copy()


def world_of(mm):
    return model_to_world @ Vector(mm)


# Spinning props: each motor's two blades and adapter turn about the motor axis over the shutter.
scene.frame_start, scene.frame_end = 1, 2
bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
for k, (mx, my) in enumerate(((414, 414), (-414, 414), (-414, -414), (414, -414)), start=1):
    piv = bpy.data.objects.new(f"prop pivot M{k}", None)
    col.objects.link(piv)
    piv.parent = root
    piv.location = (mx, my, 434)
    bpy.context.view_layer.update()
    turning = [x for x in drone_objs if x.name == f"H1_P01_Motor_M{k}" or x.name.startswith((
        f"H1_P02_Prop_M{k}_", f"H1_P01_PropAdapter_M{k}", f"H1_P02_FoldingHub_M{k}", f"H1_P02_FoldPivot_M{k}_",
        f"H1_P01_AdapterBolt_M{k}_", f"H1_P01_CoolingSlot_M{k}_", f"H1_P01_MotorLabel_M{k}", f"H1_P01_RotationMark_M{k}"))]
    for o in turning:
        if o:
            mw = o.matrix_world.copy()
            o.parent = piv
            o.matrix_world = mw
            o.cycles.motion_steps = 6 if MOTION else 7
    spin = (1 if k % 2 else -1) * math.radians(float(os.environ.get("SPIN", "690")) * (1.0, 1.014, 0.986, 1.021)[k - 1])
    start = rng.uniform(0, 2 * math.pi)
    # a driver, not keyframes: keyframes ease in and out, so the blades crawled at the start of each shutter
    piv.rotation_euler = (0, 0, start)
    drv = piv.driver_add("rotation_euler", 2).driver
    drv.type = "SCRIPTED"
    drv.expression = f"{start:.6f} + {spin:.6f} * (frame - 1)"
if MOTION:
    import numpy as np
    G, SUB = 9.81, 10
    dt = 1.0 / (24 * SUB)
    wn, ze = 2 * math.pi * 0.9, 0.75
    J0 = G * math.tan(ROT.y)  # the fan's push from the glass, which the 5 degree lean into the glass balances
    SIM_POSE = {}
    ref = lambda fr: np.array(D + pass_offset(fr))  # noqa: E731
    # Gusts toward the glass (y) pitch the nose, and the close-up looks down the boom, so they stay light: the
    # strike line holds steady. The landscape wide was rendered first with the earlier, gustier y and keeps it
    # (the cut to the close-up hides the change); the portrait flies the calm one throughout.
    SIG_CALM = (np.array([0.3, 0.12, 0.12]), np.array([0.12, 0.10, 0.08]))  # gusts and fast turbulence, m/s^2
    SIG_WIDE = (np.array([0.3, 0.25, 0.12]), np.array([0.12, 0.3, 0.08]))
    CUT1_ = int(os.environ.get("CUT1", str(round(LOOP * 0.375) + 1)))
    FLIGHTS = [(*SIG_CALM, 1, END + 1)] if "portrait" in MODE else [(*SIG_WIDE, 1, CUT1_ - 1), (*SIG_CALM, CUT1_, END + 1)]
    for SIG, SIG_F, f_lo, f_hi in FLIGHTS:
        rs = np.random.default_rng(21)  # the same draws in every flight: x, z, roll and yaw come out identical
        gust_f = np.zeros(3)
        att_n = np.zeros(2)  # attitude noise (roll, pitch), radians
        p_ = ref(1)
        v_ = (ref(1.5) - ref(0.5)) * 24
        gust = np.zeros(3)
        yaw_n = 0.0
        for f in range(-47, END + 2):  # two seconds of settling before the first frame
            for k in range(SUB):
                fr = max(1.0, f + k / SUB)
                r_ = ref(fr)
                vr = (ref(fr + 0.5) - ref(fr - 0.5)) * 24
                gust += -gust / 1.5 * dt + SIG * math.sqrt(2 / 1.5 * dt) * rs.normal(0, 1, 3)
                gust_f += -gust_f / 0.15 * dt + SIG_F * math.sqrt(2 / 0.15 * dt) * rs.normal(0, 1, 3)
                att_n += -att_n / 0.1 * dt + math.radians(0.2) * math.sqrt(2 / 0.1 * dt) * rs.normal(0, 1, 2)
                pv_ = valve(fr)
                jet = np.array([0.0, J0 * pv_, 0.0])  # the fan pushes it back from the glass
                ff_ = np.array([0.0, -J0 * lean(fr), 0.0])  # the controller leans into it, a frame behind the valve
                a_cmd = wn * wn * (r_ - p_) + 2 * ze * wn * (vr - v_) + ff_
                a_att = np.array([-G * math.tan(att_n[0]), -G * math.tan(att_n[1]), 0.0])
                v_ += (a_cmd + gust + gust_f + jet + a_att) * dt
                p_ += v_ * dt
                yaw_n += (-yaw_n / 2.0) * dt + math.radians(0.08) * math.sqrt(dt) * rs.normal()
            if f < f_lo or f > f_hi:
                continue
            a_cmd = wn * wn * (ref(f) - p_) + 2 * ze * wn * ((ref(f + 0.5) - ref(f - 0.5)) * 24 - v_)
            a_cmd = a_cmd + np.array([0.0, -J0 * lean(f), 0.0])
            # the thrust tilts toward the commanded acceleration: along the glass (world x) is roll, toward the
            # glass (world -y) is nose-down pitch. The lean into the jet is part of it, so once the valve closes
            # the drone levels out.
            roll = -math.atan2(a_cmd[0], G) + att_n[0]
            pitch = math.atan2(-a_cmd[1], G) + att_n[1]
            root.location = Vector(p_.tolist())
            root.rotation_euler = (ROT.x + roll, pitch, ROT.z + yaw_n)
            SIM_POSE[f] = (Vector(p_.tolist()), Euler(tuple(root.rotation_euler), "XYZ"))
            root.keyframe_insert("location", frame=f)
            root.keyframe_insert("rotation_euler", frame=f)
    root.location = D
    root.rotation_euler = ROT
    strobe = bpy.data.materials.get("White strobe")
    if strobe:
        sp_ = [n_ for n_ in strobe.node_tree.nodes if n_.bl_idname == "ShaderNodeBsdfPrincipled"][0].inputs["Emission Strength"]
        for f in range(1, END + 2):
            sp_.default_value = 6.0 if ((f - 1) % 24) < 2 else 0.0
            sp_.keyframe_insert("default_value", frame=f)
            # constant between keys: a blink, not a fade
        for fc in (strobe.node_tree.animation_data.action.fcurves if hasattr(strobe.node_tree.animation_data.action, "fcurves") else []):
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"
if os.environ.get("HIDE_PROPS"):
    for o in drone_objs:
        if "_Prop_" in o.name:
            o.hide_render = True
scene.frame_set(1)
scene.render.use_motion_blur = True
scene.render.motion_blur_shutter = 0.5
scene.render.motion_blur_position = "START"

# ---------------------------------------------------------------- the spray: a flat 25° fan from the boom to the glass
nozzle = world_of((830, 0, 190))
print("nozzle", tuple(round(v, 3) for v in nozzle), "impact", tuple(round(v, 3) for v in IMPACT))
aim = Vector((IMPACT.x, 0.0, IMPACT.z))
water = bpy.data.materials.new("water")
water.use_nodes = True
wn = water.node_tree
wn.nodes.remove(wn.nodes["Principled BSDF"])
wg = wn.nodes.new("ShaderNodeBsdfPrincipled")
wg.inputs["Base Color"].default_value = (0.96, 0.98, 1.0, 1)
wg.inputs["Roughness"].default_value = 0.02
wg.inputs["Transmission Weight"].default_value = 1.0
wg.inputs["IOR"].default_value = 1.33
wn.links.new(wg.outputs["BSDF"], wn.nodes["Material Output"].inputs["Surface"])
axis = (aim - nozzle).normalized()
side = axis.cross(Vector((0, 0, 1))).normalized()
up = side.cross(axis).normalized()
L = (aim - nozzle).length
HALF0 = NOZZLE.y * math.tan(math.radians(12.5))


_ico = bmesh.new()
bmesh.ops.create_icosphere(_ico, subdivisions=1, radius=1.0)
ICO_V = np.array([v.co[:] for v in _ico.verts], np.float64)
ICO_F = np.array([[v.index for v in f_.verts] for f_ in _ico.faces], np.int64)
_ico.free()


def _rotz_to(d):
    """The 3x3 matrix that turns +Z onto d (Y kept up), as Vector.to_track_quat('Z', 'Y') does."""
    return np.array(d.to_track_quat("Z", "Y").to_matrix(), np.float64)


def spray_arrays(seed, k_=1.0, t_off=None, opening=False):
    """The spray's droplets as one mesh (vertex and face arrays): each drop an icosphere stretched along its
    path over the exposure. Built with numpy: building it drop by drop in bmesh took 20 s a frame.
    k_ is the nozzle pressure (1 open): as it collapses the fan narrows, the jet slows and sags, and the drops
    grow and thin out. t_off, seconds since the valve closed, adds the nozzle's last drips."""
    rng = random.Random(seed)
    drops = []  # (radius, stretch, rotation, position)
    pk = max(1e-3, k_)
    half_a = 12.5 * (0.45 + 0.55 * math.sqrt(pk))
    vel = 25.0 * math.sqrt(pk)  # exit speed, m/s
    # open: thicker toward the glass, where the sheet has broken up. Once the valve closes, a weakening
    # stream still joined to the nozzle that shortens back toward it, thinning as the pressure goes.
    n_ = int(int(os.environ.get("DROPS", "1600")) * pk ** (0.7 if k_ >= 1.0 else 1.3)) if k_ > 0.02 else 0
    for k in range(n_):
        u_ = rng.random()
        t = u_ ** 0.35 if k_ >= 1.0 else u_ * k_ ** 0.5
        ang = math.radians(rng.uniform(-half_a, half_a))
        if k % 2 == 0:  # a flat fan's heavier edges
            ang = math.radians(rng.choice((-1, 1)) * half_a * (1 - rng.random() ** 4))
        spread = math.radians(rng.gauss(0, 1.2))
        dirv = (axis * math.cos(ang) + side * math.sin(ang) + up * math.sin(spread)).normalized()
        dist = L * t / max(0.2, math.cos(ang))
        p = nozzle + dirv * dist
        p.z -= 0.5 * 9.81 * (dist / vel) ** 2  # the drop's fall over its flight
        if p.y < 0.02 + rng.uniform(0, 0.05):
            continue
        r = rng.uniform(0.0002, 0.0006) * pk ** -0.3
        # each drop drawn as its path over a 1/48 s exposure, clipped short of the glass and the nozzle
        hl = min(r * rng.uniform(250, 700) * math.sqrt(pk), (p.y - 0.008) / max(1e-6, -dirv.y), (p - nozzle).length)
        drops.append((r, max(1.0, hl / r), _rotz_to(dirv), p[:]))
    if t_off is not None and 0.0 < t_off < 1.6:  # the nozzle's last drips, about one every 0.15 s
        for k in range(int(t_off / 0.15) + 1):
            tau = t_off - k * 0.15
            if tau < 0.0 or tau > 0.45:
                continue
            r = 0.0011 + 0.0004 * rng.random()
            p = nozzle + axis * 0.004 + Vector((0.0, 0.0, -0.004 - 0.5 * 9.81 * tau * tau))
            st_ = max(1.0, 9.81 * tau / 48 / r)  # stretched over the exposure as it speeds up
            drops.append((r, st_, _rotz_to(Vector((0.0, 0.0, -1.0))), p[:]))
    # Rebound off the strike: a shallow cone back toward the drone and down.
    for k in range(int(120 * k_ * k_ * (0.0 if opening and k_ < 1.0 else 1.0))):
        th = math.radians(rng.uniform(0, 30))
        ph = rng.uniform(0, 2 * math.pi)
        dirv = Vector((math.sin(th) * math.cos(ph), math.cos(th), math.sin(th) * math.sin(ph) - 0.35)).normalized()
        p = IMPACT + Vector((rng.uniform(-HALF0, HALF0), 0.0, rng.gauss(0, 0.015))) + dirv * rng.uniform(0.02, 0.15)
        r = rng.uniform(0.0003, 0.0008)
        drops.append((r, rng.uniform(3, 8), _rotz_to(dirv), p[:]))
    # Splash thrown out along the pane from the strike.
    for k in range(int(150 * k_ * k_ * (0.0 if opening and k_ < 1.0 else 1.0))):  # thrown down and sideways along the pane; only fine mist would rise
        a = rng.uniform(math.pi, 2 * math.pi)
        dirv = Vector((math.cos(a), 0.15 * rng.random(), math.sin(a) * 0.8)).normalized()
        p = IMPACT + Vector((rng.uniform(-HALF0, HALF0), rng.uniform(0.005, 0.03), rng.uniform(-0.02, 0.0))) + dirv * rng.uniform(0.02, 0.07)
        r = rng.uniform(0.0003, 0.0007)
        drops.append((r, rng.uniform(15, 40), _rotz_to(dirv), p[:]))
    if not drops:
        return np.zeros((0, 3)), np.zeros((0, 3), np.int64)
    rad = np.array([d[0] for d in drops])
    st = np.array([d[1] for d in drops])
    rot = np.stack([d[2] for d in drops])
    pos = np.array([d[3] for d in drops])
    loc = ICO_V[None, :, :] * np.stack([rad, rad, rad * st], -1)[:, None, :]  # scaled about the drop's centre
    verts = np.einsum("nij,nvj->nvi", rot, loc) + pos[:, None, :]
    faces = ICO_F[None, :, :] + (np.arange(len(drops)) * len(ICO_V))[:, None, None]
    return verts.reshape(-1, 3), faces.reshape(-1, ICO_F.shape[1])


def write_mesh(me, verts, faces):
    """Replace a mesh's geometry with these arrays, flat shaded (as bmesh's to_mesh left it)."""
    me.clear_geometry()
    me.vertices.add(len(verts))
    me.vertices.foreach_set("co", np.ascontiguousarray(verts, np.float32).ravel())
    nf, k = faces.shape if len(faces) else (0, 3)
    me.loops.add(nf * k)
    me.loops.foreach_set("vertex_index", np.ascontiguousarray(faces, np.int32).ravel())
    me.polygons.add(nf)
    me.polygons.foreach_set("loop_start", (np.arange(nf) * k).astype(np.int32))
    if hasattr(me.polygons, "foreach_set") and nf:
        try:
            me.polygons.foreach_set("loop_total", np.full(nf, k, np.int32))
        except (AttributeError, TypeError, RuntimeError):
            pass
        me.polygons.foreach_set("use_smooth", np.zeros(nf, bool))
    me.update(calc_edges=True)
    me.validate(verbose=False)


def spray_mesh(seed, k_=1.0):
    v_, f_ = spray_arrays(seed, k_)
    bmw = bmesh.new()
    bv = [bmw.verts.new(c) for c in v_]
    for tri in f_:
        bmw.faces.new([bv[i] for i in tri])
    return bmw


streak_m = bpy.data.materials.new("spray streak")
streak_m.use_nodes = True
sk_n, sk_l = streak_m.node_tree.nodes, streak_m.node_tree.links
sk_n.remove(sk_n["Principled BSDF"])
sk_g = sk_n.new("ShaderNodeBsdfGlass")
sk_g.inputs["IOR"].default_value = 1.33
sk_g.inputs["Roughness"].default_value = 0.05
sk_t = sk_n.new("ShaderNodeBsdfTransparent")
sk_m = sk_n.new("ShaderNodeMixShader")
sk_m.inputs["Fac"].default_value = float(os.environ.get("STREAK", "0.6"))
sk_l.new(sk_t.outputs["BSDF"], sk_m.inputs[1])
sk_l.new(sk_g.outputs["BSDF"], sk_m.inputs[2])
sk_l.new(sk_m.outputs["Shader"], sk_n["Material Output"].inputs["Surface"])
spray_obj = link_obj("spray droplets", spray_mesh(1234), streak_m)

GY = 0.006  # the pane's outer face
HALF_S = NOZZLE.y * math.tan(math.radians(12.5))
bmr = bmesh.new()


AIR = 3e-5  # water rests on the glass across a hair of air, so Cycles never puts it inside the slab
RIV_TH = math.radians(float(os.environ.get("RIV_TH", "25")))  # a rivulet's contact angle


def tube(path, w, t=None, segs=12):
    """A water channel on the glass along a path of (x, z) points: a circular-segment section (contact angle
    RIV_TH), its width wandering and tapering to a point at both ends."""
    rings = []
    n_ = len(path)
    for i_, (x, z) in enumerate(path):
        taper = min(1.0, (i_ + 1) / 4.0, (n_ - i_) / 4.0)
        wi = w * max(0.12, taper) * (0.75 + 0.5 * rng.random())
        R_ = wi / math.sin(RIV_TH)
        ring = []
        for j in range(segs):
            ph = -RIV_TH + 2 * RIV_TH * j / (segs - 1)
            ring.append(bmr.verts.new((x + R_ * math.sin(ph), GY + AIR + R_ * (math.cos(ph) - math.cos(RIV_TH)), z)))
        rings.append(ring)
    for r0, r1 in zip(rings, rings[1:]):
        for j in range(segs):
            bmr.faces.new((r0[j], r0[(j + 1) % segs], r1[(j + 1) % segs], r1[j]))
    for ring, flip in ((rings[0], False), (rings[-1], True)):
        bmr.faces.new(ring[::-1] if flip else ring)


def cap(bm_, x, z, r, th_deg=45.0, sz=1.0, n=14, rings_=6):
    """A drop resting on the glass: a spherical cap of footprint radius r and contact angle th_deg on a hair
    of air, stretched sz times down the pane, closed by a flat base."""
    th = math.radians(th_deg)
    R_ = r / math.sin(th)
    rows = []
    for k in range(rings_):
        ph = th * (1 - k / rings_)
        rr = R_ * math.sin(ph)
        yy = GY + AIR + R_ * (math.cos(ph) - math.cos(th))
        rows.append([bm_.verts.new((x + rr * math.cos(2 * math.pi * j / n), yy, z + sz * rr * math.sin(2 * math.pi * j / n))) for j in range(n)])
    apex = bm_.verts.new((x, GY + AIR + R_ * (1 - math.cos(th)), z))
    for r0, r1 in zip(rows, rows[1:]):
        for j in range(n):
            bm_.faces.new((r0[j], r0[(j + 1) % n], r1[(j + 1) % n], r1[j]))
    for j in range(n):
        bm_.faces.new((rows[-1][j], rows[-1][(j + 1) % n], apex))
    bm_.faces.new(rows[0][::-1])


def bead(x, z, r, th_deg=45.0):
    cap(bmr, x, z, r, th_deg)


BOTTOM = 0.09
RIV_PATHS = []
n_riv = int(os.environ.get("RIVULETS", "5"))
for k in range(n_riv):
    if k < 2:  # one on each edge of the falling sheet
        x = IMPACT.x + (-1 if k == 0 else 1) * 0.9 * HALF_S
    else:
        x = IMPACT.x + HALF_S * (rng.random() * 2 - 1) * 0.8
    z = IMPACT.z + DESCENT / 2 * (1 if MOTION else 0) - (rng.uniform(0.0, 0.03) if k < 2 else rng.uniform(0.04, DESCENT + 0.1))
    stop = BOTTOM if rng.random() < 0.65 else rng.uniform(BOTTOM + 0.15, IMPACT.z - 0.2)
    w = rng.uniform(0.003, 0.008)
    path = []
    zz = z
    while zz > stop:
        path.append((x, zz))
        x += rng.gauss(0, 0.0012) + (rng.choice((-1, 1)) * rng.uniform(0.003, 0.010) if rng.random() < 0.12 else 0.0)  # stick-slip
        zz -= 0.012
    if len(path) > 2:
        tube(path, w)
        RIV_PATHS.append(path)
        if stop > BOTTOM:
            bead(path[-1][0], path[-1][1], w * 1.4, 55.0)
# scattered drops: thick at the strike and in the run-off, a few left behind in the washed lane above
for k in range(320):
    x = IMPACT.x + rng.gauss(0, HALF_S * 0.8)
    z = IMPACT.z - abs(rng.gauss(0, 0.35))
    bead(x, z, rng.uniform(0.0006, 0.0024))
for k in range(90):
    x = IMPACT.x + rng.uniform(-HALF_S, HALF_S)
    z = IMPACT.z + rng.uniform(0.03, 1.0)
    bead(x, z, rng.uniform(0.0005, 0.0016))
bmesh.ops.recalc_face_normals(bmr, faces=bmr.faces)
riv_obj = link_obj("rivulets and beads", bmr, water)
for f_ in riv_obj.data.polygons:
    f_.use_smooth = True
RUN_BEADS = [(rng.randrange(len(RIV_PATHS)), rng.random(), rng.uniform(0.002, 0.004), rng.randrange(1, 3)) for _ in range(14)]


def run_beads_mesh(t):
    """Beads sliding down the rivulets in stick-slip steps, on whole periods of the loop."""
    bmb = bmesh.new()
    for (ri, phase, r, laps) in RUN_BEADS:
        path = RIV_PATHS[ri]
        u = (phase + t * laps) % 1.0
        u = (u + 0.06 * math.sin(2 * math.pi * 3 * u) / (2 * math.pi)) % 1.0
        fi = u * (len(path) - 1)
        i_ = int(fi)
        a_ = fi - i_
        x = path[i_][0] * (1 - a_) + path[min(i_ + 1, len(path) - 1)][0] * a_
        z = path[i_][1] * (1 - a_) + path[min(i_ + 1, len(path) - 1)][1] * a_
        cap(bmb, x, z, r, 50.0, sz=1.6, n=12, rings_=5)
    bmesh.ops.recalc_face_normals(bmb, faces=bmb.faces)
    return bmb


run_obj = link_obj("running beads", run_beads_mesh(0.0), water)
if MOTION and END > LOOP and DESCENT > 0:
    # Lane 2's strike starts where the drone, leaning in, aims as the valve opens; its washed band runs from
    # there down (lane 1's ran to the head of the pane, washed before the film began). Its drops and rivulets
    # come from their own random stream, so nothing built before them changes.
    Z_TOP2 = max(strike_point(F_O2 + k)[1] for k in range(3)) + 0.05  # above the strike's halo
    X2 = IMPACT.x - STEP
    r2 = random.Random(2026)
    LANE2_RIV = []  # (points, widths): the falling sheet's edges and a few runs inside it
    for k in range(5):
        x = X2 + ((-1 if k == 0 else 1) * 0.9 * HALF_S if k < 2 else HALF_S * (r2.random() * 2 - 1) * 0.8)
        z = Z_TOP2 - (r2.uniform(0.0, 0.03) if k < 2 else r2.uniform(0.04, 0.5))
        stop = BOTTOM if r2.random() < 0.65 else r2.uniform(BOTTOM + 0.15, Z_TOP2 - 0.45)
        w = r2.uniform(0.003, 0.008)
        path, zz = [], z
        while zz > stop:
            path.append((x, zz))
            x += r2.gauss(0, 0.0012) + (r2.choice((-1, 1)) * r2.uniform(0.003, 0.010) if r2.random() < 0.12 else 0.0)
            zz -= 0.012
        if len(path) > 2:
            LANE2_RIV.append((path, [w * (0.75 + 0.5 * r2.random()) for _ in path], stop > BOTTOM))
    Z2_MID = Z_TOP2 - 0.21  # the middle of what lane 2 washes before the film ends
    LANE2_DROPS = [(X2 + r2.gauss(0, HALF_S * 0.8), min(Z_TOP2, Z2_MID - abs(r2.gauss(0, 0.35))), r2.uniform(0.0006, 0.0024))
                   for _ in range(320)]
    LANE2_DROPS += [(X2 + r2.uniform(-HALF_S, HALF_S), r2.uniform(Z2_MID - 0.2, Z_TOP2 - 0.01), r2.uniform(0.0005, 0.0016))
                    for _ in range(90)]

    def _tube2(bm_, path, widths, segs=12):
        """tube(), into bm_ and with fixed widths: the same channel, drawn afresh each frame."""
        rings = []
        n_ = len(path)
        for i_, ((x, z), w0) in enumerate(zip(path, widths)):
            wi = w0 * max(0.12, min(1.0, (i_ + 1) / 4.0, (n_ - i_) / 4.0))
            R_ = wi / math.sin(RIV_TH)
            rings.append([bm_.verts.new((x + R_ * math.sin(ph), GY + AIR + R_ * (math.cos(ph) - math.cos(RIV_TH)), z))
                          for ph in (-RIV_TH + 2 * RIV_TH * j / (segs - 1) for j in range(segs))])
        for r0, r1 in zip(rings, rings[1:]):
            for j in range(segs):
                bm_.faces.new((r0[j], r0[(j + 1) % segs], r1[(j + 1) % segs], r1[j]))
        bm_.faces.new(rings[0])
        bm_.faces.new(rings[-1][::-1])

    LANE2_RUN = [(r2.randrange(len(LANE2_RIV)), r2.random(), r2.uniform(0.002, 0.004), r2.randrange(1, 3)) for _ in range(10)]

    def lane2_front(f):
        """How far down the pane lane 2's falling sheet has run, about a metre a second from the strike."""
        return Z_TOP2 - 1.0 * (f - F_O2 + 1) / 24.0

    def lane2_mesh(f):
        bm2 = bmesh.new()
        if f >= F_O2:
            lo = lane2_front(f)
            for (x, z, r) in LANE2_DROPS:
                if lo <= z <= Z_TOP2:
                    cap(bm2, x, z, r)
            for path, widths, beaded in LANE2_RIV:
                keep = [i_ for i_, (x, z) in enumerate(path) if z >= lo]
                if len(keep) > 2:
                    _tube2(bm2, path[:keep[-1] + 1], widths[:keep[-1] + 1])
                    if beaded and keep[-1] == len(path) - 1:
                        cap(bm2, path[-1][0], path[-1][1], widths[-1] * 1.4, 55.0)
            for (ri, phase, r, laps) in LANE2_RUN:  # beads sliding down its rivulets in stick-slip steps
                path = LANE2_RIV[ri][0]
                u = (phase + (f - F_O2) / 96.0 * laps) % 1.0
                u = (u + 0.06 * math.sin(2 * math.pi * 3 * u) / (2 * math.pi)) % 1.0
                fi = u * (len(path) - 1)
                i_, a_ = int(fi), fi - int(fi)
                j_ = min(i_ + 1, len(path) - 1)
                x, z = path[i_][0] * (1 - a_) + path[j_][0] * a_, path[i_][1] * (1 - a_) + path[j_][1] * a_
                if z >= lo:
                    cap(bm2, x, z, r, 50.0, sz=1.6, n=12, rings_=5)
        bmesh.ops.recalc_face_normals(bm2, faces=bm2.faces)
        return bm2

    lane2_obj = link_obj("lane 2 water", lane2_mesh(1), water)  # empty until the valve opens
# the nozzle head is wet while it sprays
bmh = bmesh.new()
for k in range(30):
    a = rng.uniform(0, 2 * math.pi)
    xm = rng.uniform(780, 822)
    pos = world_of((xm, 21 * math.cos(a), 190 + 21 * math.sin(a)))
    g_ = bmesh.ops.create_uvsphere(bmh, u_segments=10, v_segments=6, radius=rng.uniform(0.0008, 0.0018))
    bmesh.ops.scale(bmh, vec=Vector((1, 1, 0.6)), verts=g_["verts"])
    bmesh.ops.translate(bmh, vec=pos, verts=g_["verts"])
nozzle_drops = link_obj("nozzle drops", bmh, water)

mist = bpy.data.materials.new("mist")
mist.use_nodes = True
mn = mist.node_tree
mn.nodes.remove(mn.nodes["Principled BSDF"])
pv = mn.nodes.new("ShaderNodeVolumeScatter")
pv.inputs["Color"].default_value = (0.96, 0.98, 1.0, 1)
pv.inputs["Anisotropy"].default_value = 0.75
mnoise = mn.nodes.new("ShaderNodeTexNoise")
mnoise.inputs["Scale"].default_value = 14.0
mnoise.inputs["Detail"].default_value = 4.0
mr = mn.nodes.new("ShaderNodeValToRGB")
mr.color_ramp.elements[0].position = 0.45
mr.color_ramp.elements[1].position = 0.75
mn.links.new(mnoise.outputs["Fac"], mr.inputs["Fac"])
mm = mn.nodes.new("ShaderNodeMath")
mm.operation = "MULTIPLY"
mm.inputs[1].default_value = float(os.environ.get("MIST", "12.0"))
mn.links.new(mr.outputs["Color"], mm.inputs[0])
mn.links.new(mm.outputs["Value"], pv.inputs["Density"])
mn.links.new(pv.outputs["Volume"], mn.nodes["Material Output"].inputs["Volume"])
mist_map = mn.nodes.new("ShaderNodeMapping")
mist_tc = mn.nodes.new("ShaderNodeTexCoord")
mn.links.new(mist_tc.outputs["Object"], mist_map.inputs["Vector"])
mnoise.noise_dimensions = "4D"
mn.links.new(mist_map.outputs["Vector"], mnoise.inputs["Vector"])
# fade to nothing at the box's edges so no outline shows
mist_grad = mn.nodes.new("ShaderNodeTexGradient")
mist_grad.gradient_type = "SPHERICAL"
mn.links.new(mist_tc.outputs["Generated"], mist_grad.inputs["Vector"])
mist_map2 = mn.nodes.new("ShaderNodeMapping")
mist_map2.inputs["Location"].default_value = (-1.0, -1.0, -1.0)
mist_map2.inputs["Scale"].default_value = (2.0, 2.0, 2.0)
mn.links.new(mist_tc.outputs["Generated"], mist_map2.inputs["Vector"])
mn.links.new(mist_map2.outputs["Vector"], mist_grad.inputs["Vector"])
mist_edge = mn.nodes.new("ShaderNodeMath")
mist_edge.operation = "MULTIPLY"
mn.links.new(mm.outputs["Value"], mist_edge.inputs[0])
mn.links.new(mist_grad.outputs["Fac"], mist_edge.inputs[1])
mist_on = mn.nodes.new("ShaderNodeValue")
mist_on.outputs[0].default_value = 1.0
mist_k = mn.nodes.new("ShaderNodeMath")
mist_k.operation = "MULTIPLY"
mn.links.new(mist_edge.outputs["Value"], mist_k.inputs[0])
mn.links.new(mist_on.outputs[0], mist_k.inputs[1])
mn.links.new(mist_k.outputs["Value"], pv.inputs["Density"])
mm.inputs[1].default_value = float(os.environ.get("MIST", "0.1"))
mist_obj = ellipsoid("strike mist", (0.45, 0.14, 0.24), Vector((IMPACT.x, 0.10, IMPACT.z - 0.06)), mist)
sheet_m = bpy.data.materials.new("fan sheet")
sheet_m.use_nodes = True
sn, sl = sheet_m.node_tree.nodes, sheet_m.node_tree.links
sn.remove(sn["Principled BSDF"])
s_uv = sn.new("ShaderNodeUVMap")
s_sep = sn.new("ShaderNodeSeparateXYZ")
sl.new(s_uv.outputs["UV"], s_sep.inputs["Vector"])
s_map = sn.new("ShaderNodeMapping")
s_map.inputs["Scale"].default_value = (260, 2.0, 1)
sl.new(s_uv.outputs["UV"], s_map.inputs["Vector"])
s_noise = sn.new("ShaderNodeTexNoise")
s_noise.inputs["Scale"].default_value = 1.0
s_noise.inputs["Detail"].default_value = 1.5
sl.new(s_map.outputs["Vector"], s_noise.inputs["Vector"])
s_ramp = sn.new("ShaderNodeMapRange")
s_ramp.inputs["From Min"].default_value = 0.5
s_ramp.inputs["From Max"].default_value = 0.62
sl.new(s_noise.outputs["Fac"], s_ramp.inputs["Value"])
# fade at the fan's two edges (u) and in from the nozzle (v)
s_edge = sn.new("ShaderNodeMath")
s_edge.operation = "SINE"
s_pi = sn.new("ShaderNodeMath")
s_pi.operation = "MULTIPLY"
s_pi.inputs[1].default_value = math.pi
sl.new(s_sep.outputs["X"], s_pi.inputs[0])
sl.new(s_pi.outputs["Value"], s_edge.inputs[0])
s_in = sn.new("ShaderNodeMapRange")
s_in.inputs["From Min"].default_value = 0.0
s_in.inputs["From Max"].default_value = 0.03
sl.new(s_sep.outputs["Y"], s_in.inputs["Value"])
s_a1 = sn.new("ShaderNodeMath")
s_a1.operation = "MULTIPLY"
sl.new(s_ramp.outputs["Result"], s_a1.inputs[0])
sl.new(s_edge.outputs["Value"], s_a1.inputs[1])
s_out = sn.new("ShaderNodeMapRange")
s_out.inputs["From Min"].default_value = 0.1
s_out.inputs["From Max"].default_value = 0.42
s_out.inputs["To Min"].default_value = 1.0
s_out.inputs["To Max"].default_value = 0.0
sl.new(s_sep.outputs["Y"], s_out.inputs["Value"])
s_io = sn.new("ShaderNodeMath")
s_io.operation = "MULTIPLY"
sl.new(s_in.outputs["Result"], s_io.inputs[0])
sl.new(s_out.outputs["Result"], s_io.inputs[1])
s_a2 = sn.new("ShaderNodeMath")
s_a2.operation = "MULTIPLY"
sl.new(s_a1.outputs["Value"], s_a2.inputs[0])
sl.new(s_io.outputs["Value"], s_a2.inputs[1])
# a flat fan carries more water at its two edges
s_rim = sn.new("ShaderNodeMath")
s_rim.operation = "SUBTRACT"
s_rim.inputs[1].default_value = 0.5
sl.new(s_sep.outputs["X"], s_rim.inputs[0])
s_rim2 = sn.new("ShaderNodeMath")
s_rim2.operation = "ABSOLUTE"
sl.new(s_rim.outputs["Value"], s_rim2.inputs[0])
s_rim3 = sn.new("ShaderNodeMath")
s_rim3.operation = "POWER"
s_rim3.inputs[1].default_value = 6.0
sl.new(s_rim2.outputs["Value"], s_rim3.inputs[0])
s_rim4 = sn.new("ShaderNodeMath")
s_rim4.operation = "MULTIPLY_ADD"
s_rim4.inputs[1].default_value = 1.5 * 64  # (2u - 1)^6 = 64 (u - 0.5)^6
s_rim4.inputs[2].default_value = 1.0
sl.new(s_rim3.outputs["Value"], s_rim4.inputs[0])
s_a2r = sn.new("ShaderNodeMath")
s_a2r.operation = "MULTIPLY"
sl.new(s_a2.outputs["Value"], s_a2r.inputs[0])
sl.new(s_rim4.outputs["Value"], s_a2r.inputs[1])
s_a3 = sn.new("ShaderNodeMath")
s_a3.operation = "MULTIPLY"
s_a3.inputs[1].default_value = float(os.environ.get("FAN", "0.3"))
sl.new(s_a2r.outputs["Value"], s_a3.inputs[0])
s_diff = sn.new("ShaderNodeBsdfTransparent")  # a clear sheet: glints and a slight tint, not milk
s_diff.inputs["Color"].default_value = (0.97, 0.98, 1.0, 1)
s_dif2 = sn.new("ShaderNodeBsdfGlossy")
s_dif2.inputs["Color"].default_value = (0.95, 0.97, 1.0, 1)
s_dif2.inputs["Roughness"].default_value = 0.05
s_mixd = sn.new("ShaderNodeMixShader")
s_fr = sn.new("ShaderNodeFresnel")  # glints where the sheet is seen at a glance, clear where seen face on
s_fr.inputs["IOR"].default_value = 1.33
s_frm = sn.new("ShaderNodeMapRange")
s_frm.inputs["To Min"].default_value = 0.25
s_frm.inputs["To Max"].default_value = 1.0
sl.new(s_fr.outputs["Fac"], s_frm.inputs["Value"])
sl.new(s_frm.outputs["Result"], s_mixd.inputs["Fac"])
sl.new(s_diff.outputs["BSDF"], s_mixd.inputs[1])
sl.new(s_dif2.outputs["BSDF"], s_mixd.inputs[2])
s_em = sn.new("ShaderNodeEmission")
s_em.inputs["Color"].default_value = (0.9, 0.94, 1.0, 1)
s_em.inputs["Strength"].default_value = float(os.environ.get("FAN_GLOW", "0.0"))
s_mixw = sn.new("ShaderNodeAddShader")
sl.new(s_mixd.outputs["Shader"], s_mixw.inputs[0])
sl.new(s_em.outputs["Emission"], s_mixw.inputs[1])
s_tr = sn.new("ShaderNodeBsdfTransparent")
s_mix = sn.new("ShaderNodeMixShader")
sl.new(s_a3.outputs["Value"], s_mix.inputs["Fac"])
sl.new(s_tr.outputs["BSDF"], s_mix.inputs[1])
sl.new(s_mixw.outputs["Shader"], s_mix.inputs[2])
sl.new(s_mix.outputs["Shader"], sn["Material Output"].inputs["Surface"])
fm = bpy.data.meshes.new("fan sheet")
NU, NV = 24, 16
fverts, ffaces, fuvs = [], [], []
for j in range(NV + 1):
    tt = j / NV
    for i in range(NU + 1):
        ang = math.radians(-12.5 + 25.0 * i / NU)
        dirv = (axis * math.cos(ang) + side * math.sin(ang)).normalized()
        pnt = nozzle + dirv * (max(0.004, L * tt) / math.cos(ang))
        if pnt.y < 0.012:
            pnt = nozzle + dirv * ((nozzle.y - 0.012) / -dirv.y)
        fverts.append(pnt)
for j in range(NV):
    for i in range(NU):
        a0 = j * (NU + 1) + i
        ffaces.append((a0, a0 + 1, a0 + NU + 2, a0 + NU + 1))
fm.from_pydata([tuple(v) for v in fverts], [], ffaces)
uvl = fm.uv_layers.new(name="UVMap")
for poly in fm.polygons:
    for li, vi in zip(poly.loop_indices, poly.vertices):
        uvl.data[li].uv = ((vi % (NU + 1)) / NU, (vi // (NU + 1)) / NV)
fan_obj = bpy.data.objects.new("fan sheet", fm)
fan_obj.data.materials.append(sheet_m)
col.objects.link(fan_obj)
# the spray rides with the drone as it hovers
for o_ in (spray_obj, nozzle_drops, fan_obj, mist_obj):
    o_.parent = root
    o_.matrix_parent_inverse = model_to_world.inverted()  # the rest pose the meshes were built in
if MOTION:
    s_noise.noise_dimensions = "4D"

    _last = [None]

    def on_frame(scene_, depsgraph=None):
        f = scene_.frame_current
        if f == _last[0]:
            return  # motion-blur sub-steps of the same frame keep the same droplets
        _last[0] = f
        _off, _roll, k_spray = pass_state(f)
        if END > LOOP and f >= F_O2 - LEAD:  # lane 2's valve open or opening
            write_mesh(spray_obj.data, *spray_arrays(1000 + f, k_spray, None, opening=True))
        else:
            write_mesh(spray_obj.data, *spray_arrays(1000 + f, k_spray, (f - F_V) / 24.0 if f > F_V else None))
        s_a3.inputs[1].default_value = float(os.environ.get("FAN", "0.12")) * k_spray
        if DESCENT > 0 and END > LOOP and f >= F_O2:
            paint_two_lanes(f)
        elif DESCENT > 0:  # (lane 1 only; once lane 2 is under way its gain is lane 2's, not lane 1's)
            paint_glass(strike_point(min(f, F_V)), pass_state(f)[2] if f <= S2 else 0.0, max(0.0, (f - F_V) / 24.0))
        if END > LOOP and DESCENT > 0:
            b2 = lane2_mesh(f)
            b2.to_mesh(lane2_obj.data)
            b2.free()
            for p_ in lane2_obj.data.polygons:
                p_.use_smooth = True
        b_ = run_beads_mesh(((f - 1) % LOOP) / LOOP)
        b_.to_mesh(run_obj.data)
        b_.free()
        s_noise.inputs["W"].default_value = f * 1.37  # the fan's sheet breaks up afresh every frame
        foam_noise.inputs["W"].default_value = f * 1.7  # the froth boils
        mnoise.inputs["W"].default_value = f * 0.15
        mist_map.inputs["Location"].default_value = (0.0, 0.0, 0.04 * f)  # drifting down in the rotor wash
        # the mist lingers about half a second after the spray stops
        mist_on.outputs[0].default_value = max(pass_state(f)[2], pass_state(max(1, f - 12))[2] * 0.6)
        ff = (f - 1) % LOOP
        film_maps[0].inputs["Location"].default_value = (0.0, 0.0, 0.024 * ff)  # the film on the glass runs down, about 0.48 m/s
        film_maps[1].inputs["Location"].default_value = (0.0, 0.0, 0.024 * (ff - LOOP))
        film_fade.outputs[0].default_value = ff / LOOP

    bpy.app.handlers.frame_change_pre.append(on_frame)

# ---------------------------------------------------------------- the tether, from the rear swivel up to the roof
hose_m = mat("tether", (0.05, 0.054, 0.058), rough=0.3, **{"Coat Weight": 0.5, "Coat Roughness": 0.1})  # a glossy PU jacket
blue = bpy.data.materials.get("Lienry • blue accent") or mat("blue sleeve", (0.1, 0.35, 0.6), rough=0.4)
# From the rear swivel along the model's own hose stub, a short dip, then up and away to the roof.
start = world_of((-320, 0, 315))
g_dir = (world_of((-366, 9, 276)) - start).normalized()
cu = bpy.data.curves.new("tether", "CURVE")
cu.dimensions = "3D"
cu.bevel_depth = 0.006
cu.bevel_resolution = 6
cu.resolution_u = 64
sp = cu.splines.new("BEZIER")
pts = [
    (start, g_dir * 0.1),
    (start + Vector((-0.35, 0.45, -0.42)), Vector((-0.22, 0.18, 0.0))),
    (start + Vector((-1.1, 0.95, 0.9)), Vector((-0.15, 0.12, 0.55))),
    (start + Vector((-1.7, 1.3, 5.0)), Vector((-0.08, 0.05, 1.6))),
    (start + Vector((-2.2, 1.6, 13.0)), Vector((-0.02, 0.02, 2.0))),
]
sp.bezier_points.add(len(pts) - 1)
for bp, (co, hd) in zip(sp.bezier_points, pts):
    bp.co = co
    bp.handle_left = co - hd
    bp.handle_right = co + hd
teth = bpy.data.objects.new("tether", cu)
teth.data.materials.append(hose_m)
col.objects.link(teth)
sleeve = cu.copy()
sleeve.bevel_depth = 0.008
sleeve_obj = bpy.data.objects.new("blue sleeve", sleeve)
sleeve_obj.data.materials.clear()
sleeve_obj.data.materials.append(blue)
sleeve_obj.data.bevel_factor_mapping_end = "SPLINE"
sleeve_obj.data.bevel_factor_end = 0.021  # about the model's 0.3 m sleeve on a 14 m run
col.objects.link(sleeve_obj)
# The hose's free run follows the drone late and sways a little in the breeze: its weight and drag.
lag = bpy.data.objects.new("tether lag", None)
col.objects.link(lag)
lag.matrix_world = model_to_world
if MOTION:
    for f in range(1, END + 2):
        src = SIM_POSE.get(max(1, f - 7))
        base_ = src[0] if src else root.location
        t_ = (f - 1) / 24.0
        lag.location = base_ + Vector((0.025 * math.sin(2 * math.pi * 0.37 * t_ + 0.4), 0.02 * math.sin(2 * math.pi * 0.45 * t_ + 1.9), 0.0))
        lag.keyframe_insert("location", frame=f)
for o_ in (teth, sleeve_obj):
    for idx, strength, who in (([0, 1, 2], 1.0, root), ([3, 4, 5], 0.75, lag), ([6, 7, 8], 0.3, lag)):  # control points with their handles
        hk = o_.modifiers.new("follow the drone", "HOOK")
        hk.object = who
        hk.vertex_indices_set(idx)
        hk.strength = strength
        hk.matrix_inverse = model_to_world.inverted()

# ---------------------------------------------------------------- light and camera
world = bpy.data.worlds.new("first light")
scene.world = world
world.use_nodes = True
wnt = world.node_tree
bg = wnt.nodes["Background"]
# A clear, cool morning sky drawn as a gradient on the view direction: pale mist at the horizon, a soft
# glass blue overhead. The low sun is its own lamp.
wtc = wnt.nodes.new("ShaderNodeTexCoord")
if HDRI:
    env = wnt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(HDRI)
    emap = wnt.nodes.new("ShaderNodeMapping")
    emap.inputs["Rotation"].default_value = (0, 0, math.radians(float(os.environ.get("HDRI_ROT", "4"))))
    wnt.links.new(wtc.outputs["Generated"], emap.inputs["Vector"])
    wnt.links.new(emap.outputs["Vector"], env.inputs["Vector"])
wsep = wnt.nodes.new("ShaderNodeSeparateXYZ")
wnt.links.new(wtc.outputs["Generated"], wsep.inputs["Vector"])
wmr = wnt.nodes.new("ShaderNodeMapRange")
wmr.inputs["From Min"].default_value = -0.05
wmr.inputs["From Max"].default_value = 0.55
wnt.links.new(wsep.outputs["Z"], wmr.inputs["Value"])
wramp = wnt.nodes.new("ShaderNodeValToRGB")
wramp.color_ramp.interpolation = "EASE"
wramp.color_ramp.elements[0].color = (0.86, 0.9, 0.94, 1)
wramp.color_ramp.elements[1].color = (0.45, 0.58, 0.74, 1)
wnt.links.new(wmr.outputs["Result"], wramp.inputs["Fac"])
wnt.links.new(wramp.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = float(os.environ.get("SKY", "0.85"))
if HDRI:
    # Below the horizon the photograph is the photographer's own white roof, not a street 40 m down: fade
    # it into a deep, hazy street-canyon slate from about 8 degrees down (also kills the roof's bounce light).
    low = wnt.nodes.new("ShaderNodeMapRange")
    low.clamp = True
    # the portrait keeps the photograph's street canyon down to about -9 degrees, and fades before the roof
    low.inputs["From Min"].default_value = -0.16 if "portrait" in MODE else -0.10
    low.inputs["From Max"].default_value = -0.21 if "portrait" in MODE else -0.26
    wnt.links.new(wsep.outputs["Z"], low.inputs["Value"])
    lmix = wnt.nodes.new("ShaderNodeMix")
    lmix.data_type = "RGBA"
    wnt.links.new(low.outputs["Result"], lmix.inputs[0])
    wnt.links.new(env.outputs["Color"], lmix.inputs[6])
    lmix.inputs[7].default_value = (0.11, 0.125, 0.145, 1)
    wnt.links.new(lmix.outputs[2], bg.inputs["Color"])
    if os.environ.get("CANYON", "1" if "portrait" in MODE else "0") == "1":
        # The portrait looks further down than the photograph has city for. Every direction below about 5
        # degrees down is folded smoothly into the photograph's own street canyon (5 to 11 degrees down,
        # traffic lights and building bases), darkening with depth, so the lower frame is a deep, defocused
        # street instead of a flat slab, and the photographer's roof (from 12 degrees down) never shows.
        def wm(op, a, b=None, c=None):
            n_ = wnt.nodes.new("ShaderNodeMath")
            n_.operation = op
            for i_, x_ in enumerate((a, b, c)):
                if x_ is None:
                    continue
                if isinstance(x_, (int, float)):
                    n_.inputs[i_].default_value = x_
                else:
                    wnt.links.new(x_, n_.inputs[i_])
            return n_.outputs["Value"]
        Z0, SPAN = -0.09, 0.10
        zz = wsep.outputs["Z"]
        dd = wm("MAXIMUM", wm("SUBTRACT", Z0, zz), 0.0)
        z2 = wm("SUBTRACT", wm("ADD", zz, dd), wm("MULTIPLY", SPAN, wm("SUBTRACT", 1.0, wm("EXPONENT", wm("DIVIDE", dd, -SPAN)))))
        hh = wm("SQRT", wm("MAXIMUM", wm("SUBTRACT", 1.0, wm("MULTIPLY", zz, zz)), 1e-6))
        h2 = wm("SQRT", wm("MAXIMUM", wm("SUBTRACT", 1.0, wm("MULTIPLY", z2, z2)), 1e-6))
        kk = wm("DIVIDE", h2, hh)
        cmb = wnt.nodes.new("ShaderNodeCombineXYZ")
        wnt.links.new(wm("MULTIPLY", wsep.outputs["X"], kk), cmb.inputs["X"])
        wnt.links.new(wm("MULTIPLY", wsep.outputs["Y"], kk), cmb.inputs["Y"])
        wnt.links.new(z2, cmb.inputs["Z"])
        wnt.links.new(cmb.outputs["Vector"], emap.inputs["Vector"])
        low.inputs["From Min"].default_value = Z0
        low.inputs["From Max"].default_value = -0.45
        lmix.blend_type = "MULTIPLY"
        lmix.inputs[7].default_value = (0.42, 0.44, 0.48, 1)
    bg.inputs["Strength"].default_value = float(os.environ.get("SKY", "1.0"))

sun_data = bpy.data.lights.new("low sun", "SUN")
sun_data.energy = float(os.environ.get("SUN", "0.0" if HDRI else "5.0"))  # dusk: the city's own soft light
sun_data.angle = math.radians(1.0)
sun_data.color = (1.0, 0.96, 0.91)
sun = bpy.data.objects.new("low sun", sun_data)
# Low, outside, beyond the drone and right of frame: it rims the canopy, arms and legs, backlights the
# spray and the water, and makes the haze glow; through the glass it lays patches on the desk and floor.
sun.rotation_euler = (math.radians(float(os.environ.get("SUN_RX", "76"))), 0, math.radians(float(os.environ.get("SUN_AZ", "200"))))
col.objects.link(sun)

cam_data = bpy.data.cameras.new("cam")
PORTRAIT = "portrait" in MODE
cam_data.lens = 42 if PORTRAIT else 46
cam_data.sensor_width = 36
cam = bpy.data.objects.new("cam", cam_data)
col.objects.link(cam)
scene.camera = cam
cam.location = Vector(tuple(float(v) for v in os.environ.get("CAM", "-1.35,-2.7,1.15").split(",")))
target = Vector(tuple(float(v) for v in os.environ.get("TARGET", "1.41,1.01,1.0" if PORTRAIT else "1.75,0.9,1.4").split(",")))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = (world_of((350, 0, 250)) - cam.location).length
cam_data.dof.aperture_fstop = float(os.environ.get("FSTOP", "2.0"))
cam_data.dof.aperture_blades = 9
cam_data.dof.aperture_rotation = 0.3
CAMMOVE = MOTION and os.environ.get("CAMMOVE", "1") == "1"


def _follow(aim_, fa, fb, hz=1.0, zeta=0.6, sub=8, back=12):
    """A fluid-head operator: a second-order follower on the raw aim, seeded `back` frames early with the
    aim's own position and speed, so it trails a move by about 5 frames and settles with a small overshoot."""
    wn_, dt_ = 2 * math.pi * hz, 1.0 / (24 * sub)
    fs = fa - back
    y, v = aim_(fs).copy(), (aim_(fs + 1) - aim_(fs)) * 24
    out = {}
    for f in range(fs, fb + 1):
        out[f] = y.copy()
        r0, r1 = aim_(f), aim_(f + 1)
        for k in range(sub):
            a = (r0.lerp(r1, (k + 0.5) / sub) - y) * (wn_ * wn_) - v * (2 * zeta * wn_)
            v = v + a * dt_
            y = y + v * dt_
    return out


def _jitter(n, mrad, seed):
    """Per-frame rotation jitter in radians, smoothed over three frames: a hand on a fluid head, ~0.2 px."""
    r_ = random.Random(seed)
    w = [r_.gauss(0.0, mrad * 1e-3) for _ in range(n + 3)]
    return [0.25 * w[i] + 0.5 * w[i + 1] + 0.25 * w[i + 2] for i in range(n + 1)]
if CAMMOVE:
    C0, T0 = cam.location.copy(), target.copy()
    view = (T0 - C0).normalized()
    PUSH = float(os.environ.get("PUSH", "0.22"))
    RACK = int(os.environ.get("RACK", "0"))  # frames of focus pull from the glass to the drone at the start

    def _float(t, seeds):
        return sum(a * math.sin(2 * math.pi * f_ * t + ph) for a, f_, ph in seeds)

    JXw, JZw = _jitter(END + 2, 0.15, 11), _jitter(END + 2, 0.15, 12)
    # lane 2: the operator on the wide follows the climb late, as on the shot cameras
    OFF_W = _follow(lambda f_: pass_offset(f_).copy(), LOOP + 1, END + 2) if END > LOOP else {}

    for f in range(1, END + 2):
        t = (f - 1) / 24.0
        if os.environ.get("SHOTS", "1") == "1":  # a steady push over the wide alone, no ease-in from rest
            ease = min(1.0, (f - 1) / max(1, int(os.environ.get("CUT1", str(round(LOOP * 0.375) + 1))) - 1)) * 0.31
        else:
            u = min(1.0, (f - 1) / max(1, LOOP - 1))
            ease = u * u * (3 - 2 * u)
        off_, _r, _k = pass_state(f)
        c = C0 + view * (PUSH * ease) + Vector((_float(t, ((0.0018, 0.31, 0.2), (0.0008, 0.83, 1.9))),
                                                 _float(t, ((0.0012, 0.27, 2.4),)),
                                                 _float(t, ((0.0015, 0.37, 0.9), (0.0006, 1.1, 0.3)))))
        if f > LOOP and f in OFF_W:
            off_ = OFF_W[f]
        tg = T0 + Vector((off_.x * 0.35, 0.0, off_.z * 0.3)) + Vector((_float(t, ((0.004, 0.23, 1.3), (0.0015, 0.71, 0.6))), 0.0,
                                                                       _float(t, ((0.003, 0.29, 2.2), (0.0012, 0.9, 1.1)))))
        cam.location = c
        q = (tg - c).to_track_quat("-Z", "Y")
        e = q.to_euler()
        e.y += math.radians(_float(t, ((0.08, 0.19, 0.7), (0.03, 0.6, 2.0))))  # a breath of roll
        e.x += JXw[f]
        e.z += JZw[f]
        cam.rotation_euler = e
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)
        d_drone = (world_of((350, 0, 250)) + pass_offset(max(1, f - 4)) - c).length * (1 + 0.006 * math.sin(f * 0.21 + 0.5))
        if RACK and f <= RACK:
            strike_ = Vector((IMPACT.x + off_.x, 0.0, IMPACT.z + off_.z))
            w_ = (f - 1) / max(1, RACK - 1)
            w_ = w_ * w_ * (3 - 2 * w_)
            d_drone = (strike_ - c).length * (1 - w_) + d_drone * w_
        cam_data.dof.focus_distance = d_drone
        cam_data.dof.keyframe_insert("focus_distance", frame=f)
    cam.location = C0

# Coverage, cut on the action like a real edit: the wide through the window as it descends, a close-up on the
# nozzle and the fan hitting the glass, then a medium that follows it as the spray cuts and it side-steps.
SHOTS = CAMMOVE and os.environ.get("SHOTS", "1") == "1"
if SHOTS:
    CUT1 = int(os.environ.get("CUT1", str(round(LOOP * 0.375) + 1)))  # 3.0 s
    CUT2 = int(os.environ.get("CUT2", str(A_END - 8)))  # just before the spray cuts

    def shot_camera(name, lens, f0, f1, loc0, loc1, aim, focus, pfac=0.66, seeds=(31, 32), fstop_p=None, last=None):
        last = LOOP if last is None else last  # its last key: lane 1's shots stop at LOOP, as they always did
        cd = bpy.data.cameras.new(name)
        cd.lens = lens * (pfac if PORTRAIT else 1.0)
        cd.sensor_width = 36
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop_p if (PORTRAIT and fstop_p) else float(os.environ.get("FSTOP", "2.0"))
        cd.dof.aperture_blades = 9
        cd.dof.aperture_rotation = 0.3
        co = bpy.data.objects.new(name, cd)
        col.objects.link(co)
        A_ = _follow(aim, max(1, f0 - 2), min(last, f1 + 2))
        JX, JZ = _jitter(max(LOOP, last) + 2, 0.10, seeds[0]), _jitter(max(LOOP, last) + 2, 0.10, seeds[1])
        for f in range(max(1, f0 - 2), min(last, f1 + 2) + 1):
            u = (f - f0) / max(1, f1 - f0)
            u = min(1.0, max(0.0, u))
            ease = u * u * (3 - 2 * u)
            t = (f - 1) / 24.0
            c = loc0.lerp(loc1, ease) + Vector((_float(t, ((0.0012, 0.33, 0.4), (0.0005, 0.9, 1.7))), 0.0,
                                                 _float(t, ((0.0010, 0.41, 2.2), (0.0004, 1.2, 0.6)))))
            tg = A_[f] + Vector((_float(t, ((0.002, 0.27, 1.0),)), 0.0, _float(t, ((0.0016, 0.35, 2.6),))))
            co.location = c
            e = (tg - c).to_track_quat("-Z", "Y").to_euler()
            e.y += math.radians(_float(t, ((0.05, 0.21, 0.3),)))
            e.x += JX[f]
            e.z += JZ[f]
            co.rotation_euler = e
            co.keyframe_insert("location", frame=f)
            co.keyframe_insert("rotation_euler", frame=f)
            cd.dof.focus_distance = (focus(max(1, f - 3)) - c).length
            cd.dof.keyframe_insert("focus_distance", frame=f)
        return co

    nozzle_at = lambda f: world_of((800, 0, 190)) + pass_offset(f)  # noqa: E731
    body_at = lambda f: world_of((150, 0, 250)) + pass_offset(f)  # noqa: E731
    # the close-up: from inside, a little below and left of the nozzle, through dirty glass beside the lane
    strike_at = lambda f: Vector((IMPACT.x, 0.0, IMPACT.z)) + pass_offset(f)  # noqa: E731
    # the operator follows 60% of the descent, so the drone drifts a little down the frame instead of being
    # pinned while the city scrolls past
    aim_c0 = nozzle_at(CUT1).lerp(strike_at(CUT1), 0.45) + Vector((0.0, 0.0, 0.02))
    camB = shot_camera("cam close", 70, CUT1, CUT2, Vector((0.92, -1.27, 1.16)), Vector((0.99, -1.24, 1.15)),
                       lambda f: aim_c0 + Vector((0.0, 0.0, -0.03)) + 0.6 * (pass_offset(f) - pass_offset(CUT1)), nozzle_at,
                       seeds=(31, 32))
    # the medium: closer than the wide, panning a little with the side-step
    camC = shot_camera("cam medium", 60, CUT2, LOOP, Vector((0.25, -2.05, 1.24)), Vector((0.2, -1.95, 1.24)),
                       lambda f: body_at(f) * 0.7 + body_at(CUT2) * 0.3 + (Vector((-0.07, 0.0, -0.20)) if PORTRAIT else Vector((0.12, 0.0, -0.03))),
                       body_at, pfac=0.50, seeds=(41, 42), fstop_p=1.4)
    MARKS = [(1, cam), (CUT1, camB), (CUT2, camC)]
    if END > LOOP:
        # Lane 2, cut on the action again: the wide as it climbs to the top of the next lane beside the one it
        # washed; the close-up as it leans in and the jet opens onto the glass beside the clean lane; then a
        # medium that eases back as it washes down, both lanes in view.
        CUT3, CUT4, CUT5 = LOOP + 1, F_O2 - LEAD, F_O2 + 40
        lift = pass_offset(CUT4) - pass_offset(CUT1)  # lane 2's top against the first close-up's start
        aim_e0 = nozzle_at(CUT4).lerp(strike_at(CUT4), 0.45) + Vector((0.0, 0.0, 0.02))
        camE = shot_camera("cam close 2", 70, CUT4, CUT5, Vector((0.99, -1.24, 1.15)) + lift, Vector((0.93, -1.27, 1.16)) + lift,
                           lambda f: aim_e0 + Vector((0.0, 0.0, -0.03)) + 0.6 * (pass_offset(f) - pass_offset(CUT4)), nozzle_at,
                           seeds=(51, 52), last=END + 1)
        drop = pass_offset((CUT5 + END) // 2) - pass_offset(CUT2)  # level with the drone half way down
        right = Vector((0.12, 0.0, 0.0))  # so the washed lane is in frame from the first
        camF = shot_camera("cam medium 2", 60, CUT5, END, Vector((0.25, -1.95, 1.24)) + drop + right, Vector((0.18, -2.2, 1.22)) + drop + right,
                           lambda f: body_at(f) * 0.7 + body_at(CUT5) * 0.3 + right + (Vector((-0.07, 0.0, -0.20)) if PORTRAIT else Vector((0.12, 0.0, -0.03))),
                           body_at, pfac=0.50, seeds=(61, 62), fstop_p=1.4, last=END + 1)
        MARKS += [(CUT3, cam), (CUT4, camE), (CUT5, camF)]
    for fr, c_ in MARKS:
        mk = scene.timeline_markers.new(f"shot {fr}", frame=fr)
        mk.camera = c_
    print("shots:", ", ".join(f"{c_.name} from {fr}" for fr, c_ in MARKS), "to", END)

if os.environ.get("FOREGROUND", "0") == "1":
    half_h = math.atan((cam_data.sensor_width / 2) / cam_data.lens) if not PORTRAIT else math.atan((cam_data.sensor_width / 2 * 9 / 16) / cam_data.lens)
    view_ = (target - cam.location).normalized()
    side_ = Vector((0, 0, 1)).cross(view_).normalized()  # to the left of the view
    fg = cam.location + (view_ * math.cos(0.9 * half_h) + side_ * math.sin(0.9 * half_h)).normalized() * 0.85 + Vector((0, 0, -0.08))
    for k in range(9):
        a = rng.uniform(0, 2 * math.pi)
        lf = ellipsoid(f"foreground leaf {k}", (0.07, 0.24, 0.012), fg + Vector((math.cos(a) * 0.05, math.sin(a) * 0.05, rng.uniform(-0.18, 0.12))), leaf)
        lf.rotation_euler = (rng.uniform(-0.9, 0.9), rng.uniform(-0.5, 0.5), a)

# The desk lamp and the wall wash light the room only; the drone outside takes the sun and the sky.
room = bpy.data.collections.new("room")
ROOM = ("floor", "ceiling", "left wall", "back wall", "right wall", "window head", "sill", "desk", "notebook", "pot", "leaf", "mullion", "transom")
for o in list(col.objects):
    if o.name.startswith(ROOM):
        room.objects.link(o)
# The right wall, washed softly where the pane in front of the drone reflects it: a faint ghost of the room.
rw_data = bpy.data.lights.new("right wall wash", "AREA")
rw_data.energy = float(os.environ.get("RWASH", "300"))
rw_data.size = 3.0
rw_data.color = (0.96, 0.97, 1.0)
rw = bpy.data.objects.new("right wall wash", rw_data)
rw.location = (WX1 - 1.5, -11.0, 2.6)
rw.rotation_euler = (0, math.radians(90), 0)  # facing +x, onto the right wall
rw.visible_glossy = False
rw.visible_transmission = False
col.objects.link(rw)
sun_block = bpy.data.collections.new("sun blockers")
BLOCK = ROOM + ("H1_", "tether", "blue sleeve", "spandrel")
for o in list(col.objects):
    if o.name.startswith(BLOCK):
        sun_block.objects.link(o)
sun.light_linking.blocker_collection = sun_block
# The drone's own shadow would land on the inside of the mullion as a dark blot; the sun skips the frames.
sun_recv = bpy.data.collections.new("sun receivers")
for o in list(col.objects):
    if not o.name.startswith(("mullion", "transom", "window panes")):
        sun_recv.objects.link(o)
sun.light_linking.receiver_collection = sun_recv
for lt in (lamp, ghost, rw):
    try:
        lt.light_linking.receiver_collection = room
    except AttributeError:
        print("no light linking in this build")

# ---------------------------------------------------------------- render
scene.render.engine = "CYCLES"
def select_device():
    want = os.environ.get("DEVICE", "AUTO").upper()
    if want == "CPU":
        return "CPU"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
    except KeyError:
        return "CPU"
    for dt in (("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL") if want == "AUTO" else (want,)):
        try:
            prefs.compute_device_type = dt
        except TypeError:
            continue
        prefs.get_devices()
        gpus = [d for d in prefs.devices if d.type == dt]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == dt
            scene.cycles.device = "GPU"
            return dt + ": " + ", ".join(d.name for d in gpus)
    return "CPU"


print("render device:", select_device(), flush=True)
FULL = MODE in ("final", "portrait", "motion-full", "motion-portrait")
w_, h_ = (1920, 1080) if FULL else (960, 540)
if PORTRAIT:
    w_, h_ = h_, w_
w_, h_ = int(w_ * float(os.environ.get("RES_SCALE", "1"))), int(h_ * float(os.environ.get("RES_SCALE", "1")))
if os.environ.get("RES"):  # an exact size, e.g. 1600x900
    w_, h_ = (int(v) for v in os.environ["RES"].split("x"))
scene.render.resolution_x = w_
scene.render.resolution_y = h_
scene.cycles.samples = int(os.environ.get("SAMPLES", "320" if FULL else "64"))
scene.cycles.use_denoising = True
try:
    scene.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    scene.cycles.denoising_prefilter = "ACCURATE"
except (AttributeError, TypeError):
    pass
scene.cycles.max_bounces = 10 if MOTION else 12
scene.cycles.transmission_bounces = 10 if MOTION else 12
scene.cycles.glossy_bounces = 4 if MOTION else 6
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = float(os.environ.get("ADAPTIVE", "0.02"))
scene.cycles.adaptive_min_samples = int(os.environ.get("ADAPTIVE_MIN", "0"))
scene.cycles.seed = 7  # the same noise pattern every frame, so whatever does not move renders identically
scene.cycles.use_animated_seed = MOTION and os.environ.get("CAMMOVE", "1") == "1"
scene.render.use_persistent_data = MOTION
scene.cycles.volume_bounces = 1
scene.cycles.transparent_max_bounces = 16
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.cycles.blur_glossy = 0.6
scene.view_settings.view_transform = "AgX"
for look_name in ("AgX - Medium High Contrast", "Medium High Contrast"):
    try:
        scene.view_settings.look = look_name
        break
    except Exception:  # noqa: BLE001
        pass
scene.view_settings.exposure = float(os.environ.get("EXPOSURE", "0.0"))
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_depth = "16"
if os.environ.get("DBG_MOTION"):
    def snap(fr, sub):
        scene.frame_set(fr, subframe=sub)
        return {o.name: o.matrix_world.translation.copy() for o in scene.objects if o.type == "MESH"}
    a0 = snap(1, 0.0)
    a1 = snap(1, 0.5)
    moves = sorted(((a1[k] - a0[k]).length, k) for k in a0 if k in a1)
    for d_, k in moves[-12:]:
        print("DBG move", round(d_ * 1000, 2), "mm", k)
    print("DBG root", [tuple(round(x, 4) for x in v) for v in (a0.get("H1_C01_Canopy", Vector()), a1.get("H1_C01_Canopy", Vector()))])
    print("DBG canopy-like", [k for k in a0 if "anopy" in k or "Shell" in k][:8])
    sys.exit(0)
if os.environ.get("PROFILE_SCRIPT"):  # a test harness: run that file here with the scene built, then stop
    exec(open(os.environ["PROFILE_SCRIPT"]).read())
    sys.stdout.flush()
    os._exit(0)
t = time.time()
if MOTION:
    scene.render.use_lock_interface = True
    scene.render.use_overwrite = False  # a re-run picks up where it stopped: frames already on disk are kept
    scene.render.use_placeholder = False
    scene.frame_start, scene.frame_end = int(os.environ.get("FRAME_START") or 1), int(os.environ.get("FRAME_END") or END)
    scene.frame_step = int(os.environ.get("FRAME_STEP", "1"))
    if os.environ.get("AUTO_REGION"):
        from bpy_extras.object_utils import world_to_camera_view
        pts_ = []
        H1_objs = [o for o in drone_objs if o.type == "MESH" and not o.hide_render]
        for f in sorted(set(list(range(1, LOOP + 1, 8)) + [A_END, LOOP])):
            scene.frame_set(f)
            for o in H1_objs[::3]:
                for c in o.bound_box:
                    pts_.append(o.matrix_world @ Vector(c))
        scene.frame_set(1)
        half_ = NOZZLE.y * math.tan(math.radians(12.5))
        for xx in (IMPACT.x - half_ - 0.08, IMPACT.x + half_ + 0.08):
            for zz in (0.06, IMPACT.z + DESCENT / 2 + 0.25):
                pts_.append(Vector((xx, 0.0, zz)))
        uv = [world_to_camera_view(scene, cam, q) for q in pts_]
        m_ = float(os.environ.get("REGION_MARGIN", "0.03"))
        rx0 = max(0.0, min(u.x for u in uv) - m_)
        rx1 = min(1.0, max(u.x for u in uv) + m_)
        ry0 = max(0.0, 1 - max(u.y for u in uv) - m_)
        ry1 = min(1.0, 1 - min(u.y for u in uv) + m_)
        W_, Hh_ = scene.render.resolution_x, scene.render.resolution_y
        rx0, rx1 = math.floor(rx0 * W_) / W_, math.ceil(rx1 * W_) / W_
        ry0, ry1 = math.floor(ry0 * Hh_) / Hh_, math.ceil(ry1 * Hh_) / Hh_
        os.environ["REGION"] = f"{rx0},{rx1},{ry0},{ry1}"
        print("REGION", os.environ["REGION"])
        with open(os.path.join(HERE, os.environ.get("FRAMES", MODE) + ".region"), "w") as fh:
            fh.write(f"{rx0} {ry0}\n")
    if os.environ.get("REGION"):  # x0,x1,y0,y1 as fractions from the top left
        x0, x1, y0, y1 = (float(v) for v in os.environ["REGION"].split(","))
        scene.render.use_border = True
        scene.render.use_crop_to_border = True
        scene.render.border_min_x, scene.render.border_max_x = x0, x1
        scene.render.border_min_y, scene.render.border_max_y = 1 - y1, 1 - y0
    frames_dir = os.path.join(HERE, os.environ.get("FRAMES", MODE))
    os.makedirs(frames_dir, exist_ok=True)
    scene.render.filepath = os.path.join(frames_dir, "f_####")
    bpy.ops.render.render(animation=True)
    print(f"rendered {MODE} ({END} frames) in {time.time() - t:.0f}s -> {frames_dir}", flush=True)
    # leave at once: the frames are on disk, and tearing down a scene with live handlers can crash on exit,
    # which would read as a failure to the batch file
    bpy.app.handlers.frame_change_pre.clear()
    sys.stdout.flush()
    os._exit(0)
else:
    scene.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
    print(f"rendered {MODE} in {time.time() - t:.0f}s -> {OUT}")
