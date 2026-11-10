"""Rooftop solar on real-looking houses, lit by CC0 HDRIs of real residential places.
SHOT=y2: a single-storey Australian brick-veneer house with a Colorbond corrugated roof (22.5 degrees) and an all-black
array, seen from just above roof height (Poly Haven 'balcony', an elevated residential viewpoint).
SHOT=p4: a two-storey brick terrace with a slate roof (35 degrees), sash windows and chimney stacks, seen from across
the street at upper-floor height (Poly Haven 'urban_street_03', a London street of brick terraces).
The H1 hovers ~0.4-0.5 m over the array mid-pass, lance down, a light fan striking the upper row; behind it the
glass is wet and clean, ahead dusty; the hose runs down the roof beside the array, over the gutter lip and down."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import h1lib as L
import solar as S
import bpy
import numpy as np
from mathutils import Vector
E = os.environ.get
f = lambda k, d: float(E(k, d))
SHOT = E("SHOT", "y2")
P = {
    "y2": dict(RES="1200x1600", HDR="balcony_8k.hdr", ROT="25", PITCH="22.5", LENS="40", FSTOP="4",
               CAMX="-2.5", CAMY="-4.4", CAMZ="5.7", XS="0.9", VS="2.9", YAW="150", PAN="12", TILT="-45", STAND="0.5",
               SX="0.0", SY="0.0", CAMPITCH="-12"),
    "p4": dict(RES="1200x1800", HDR="bloem_olive_house_4k.hdr", ROT="99", PITCH="35", LENS="50", FSTOP="5.6",
               CAMX="-2.2", CAMY="-11.5", CAMZ="7.4", XS="0.6", VS="2.6", YAW="150", PAN="12", TILT="-45", STAND="0.5",
               SX="0.0", SY="0.0", CAMPITCH="-4"),
}[SHOT]
g = lambda k: E(k, P[k])
res = tuple(int(x) for x in g("RES").split("x"))
sc = L.reset(res=res, samples=int(E("SPP", "16")), adaptive=f("ADAPT", "0.03"), min_samples=8)
sc.view_settings.exposure = f("EXPOSURE", "0.0")
L.world_hdri(os.path.join(L.ASSETS, g("HDR")), f("SKY", "1.0"), float(g("ROT")))
NB = S.NB
TEX = S.TEX
PITCH = math.radians(float(g("PITCH")))
u_ax = Vector((1, 0, 0))
v_ax = Vector((0, math.cos(PITCH), math.sin(PITCH)))
n_ax = u_ax.cross(v_ax).normalized()


def box(c, s, m, name="box", rot_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c)
    o = bpy.context.active_object
    o.name = name
    o.scale = s
    o.rotation_euler = (0, 0, rot_z)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)  # object-space textures in metres
    if m:
        o.data.materials.append(m)
    return o


CUTTERS = bpy.data.collections.new("window cutters")
bpy.context.scene.collection.children.link(CUTTERS)


def cut_openings(wall):
    """Cut every window opening (the cutter boxes) out of a wall solid."""
    md = wall.modifiers.new("openings", "BOOLEAN")
    md.operation = "DIFFERENCE"
    md.operand_type = "COLLECTION"
    md.collection = CUTTERS
    md.solver = "EXACT"
    CUTTERS.hide_render = True
    for o in CUTTERS.objects:
        o.hide_render = True
        o.display_type = "WIRE"


def tex_mat(name, base, scale, tint=(1, 1, 1), rough_add=0.0, bump=1.0, rot=0.0, dirt=0.0, boxp=True):
    """A Poly Haven texture set mapped in object space (metres): base like 'brick_wall_09'."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    p = b.n["Principled BSDF"]
    tc = b.node("ShaderNodeTexCoord").outputs["Object"]
    mp = b.node("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    mp.inputs["Rotation"].default_value = (0, 0, rot)
    b.set(mp.inputs["Vector"], tc)
    vec = mp.outputs[0]
    pth = lambda k: os.path.join(TEX, f"{base}_{k}_2k.jpg")
    col = b.img(pth("diff"), vec, box=boxp).outputs["Color"]
    tn = b.node("ShaderNodeMix")
    tn.data_type = "RGBA"
    tn.blend_type = "MULTIPLY"
    tn.inputs["Factor"].default_value = 1.0
    b.set(tn.inputs["A"], col)
    tn.inputs["B"].default_value = (*tint, 1)
    col = tn.outputs["Result"]
    if dirt:
        Pw = b.node("ShaderNodeTexCoord").outputs["Object"]
        dn = b.mr(b.noise(Pw, 0.6, 5), 0.35, 0.75, 0.0, dirt)
        dk = b.node("ShaderNodeMix")
        dk.data_type = "RGBA"
        dk.blend_type = "MULTIPLY"
        b.set(dk.inputs["Factor"], dn)
        b.set(dk.inputs["A"], col)
        dk.inputs["B"].default_value = (0.55, 0.52, 0.48, 1)
        col = dk.outputs["Result"]
    b.set(p.inputs["Base Color"], col)
    r = b.img(pth("rough"), vec, noncolor=True, box=boxp).outputs["Color"]
    b.set(p.inputs["Roughness"], b.math("ADD", r, rough_add, clamp=True))
    nm = b.img(pth("nor_gl"), vec, noncolor=True, box=boxp).outputs["Color"]
    nmap = b.node("ShaderNodeNormalMap")
    nmap.inputs["Strength"].default_value = bump * (0.6 if boxp else 1.0)
    b.set(nmap.inputs["Color"], nm)
    b.set(p.inputs["Normal"], nmap.outputs["Normal"])
    return m


def painted(name, col, rough=0.4, grime=0.0, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    p = b.n["Principled BSDF"]
    P_ = b.node("ShaderNodeTexCoord").outputs["Object"]
    nz = b.noise(P_, 1.2, 6)
    c2 = tuple(min(1.0, c * 1.12) for c in col)
    c1 = tuple(c * 0.88 for c in col)
    b.set(p.inputs["Base Color"], b.mix(b.mr(nz, 0.35, 0.7), (*c1, 1), (*c2, 1)))
    b.set(p.inputs["Roughness"], b.mr(nz, 0.3, 0.7, rough * 0.85, rough * 1.2))
    p.inputs["Metallic"].default_value = metal
    return m


def corrugated(origin, width, slope_len, mat, pitch=0.076, depth=0.017, spw=10, name="roof sheet"):
    """Corrugated sheet on the roof plane: crests run down the slope (along v), the wave along u."""
    o = Vector(origin)
    n_w = int(width / pitch * spw)
    V, F = [], []
    for i in range(n_w + 1):
        x = width * i / n_w
        off = n_ax * (depth / 2 * math.cos(2 * math.pi * x / pitch))
        for j, vv in enumerate((0.0, slope_len)):
            V.append(tuple(o + u_ax * x + v_ax * vv + off))
    for i in range(n_w):
        a = 2 * i
        F.append((a, a + 2, a + 3, a + 1))
    me = bpy.data.meshes.new(name)
    me.from_pydata(V, [], F)
    me.shade_smooth()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob


def plane_quad(name, a, b_, c, d, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(a), tuple(b_), tuple(c), tuple(d)], [], [(0, 1, 2, 3)])
    me.uv_layers.new()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob


def window(c, w, h, depth_dir, mat_frame, mat_glass, sash=True, name="window"):
    """A window in a wall whose outward normal is -depth_dir: reveal, frame, sashes with glazing bars, glass and
    a dim room behind (with a pale curtain)."""
    c = Vector(c)
    out = -Vector(depth_dir)
    up = Vector((0, 0, 1))
    side = up.cross(out).normalized()
    A = S.MeshAcc()
    fw = 0.06
    rec = 0.11  # set back into the reveal
    cf = c - out * rec
    for (cc, sx, sz) in ((cf + up * (h / 2 - fw / 2), w, fw), (cf - up * (h / 2 - fw / 2), w, fw),
                         (cf + side * (w / 2 - fw / 2), fw, h), (cf - side * (w / 2 - fw / 2), fw, h)):
        A.box(cc, side, out, up, sx, 0.08, sz)
    if sash:
        A.box(cf + out * 0.015, side, out, up, w - 2 * fw, 0.05, 0.045)  # meeting rail
        for k in (-1, 1):
            A.box(cf + up * (k * h / 4) + out * (0.02 if k > 0 else -0.01), side, out, up, 0.025, 0.035, h / 2 - fw)
    fr = A.write(name + " frame", mat_frame)
    gl = plane_quad(name + " glass", cf - side * w / 2 - up * h / 2, cf + side * w / 2 - up * h / 2,
                    cf + side * w / 2 + up * h / 2, cf - side * w / 2 + up * h / 2, mat_glass)
    gl.visible_shadow = False
    # the opening (cut from the wall), the room behind: a dark box and a curtain to one side
    ct_ = box(c - out * 0.6, (w if abs(side.x) > 0.5 else 1.2, 1.2 if abs(side.x) > 0.5 else w, h), None, name + " cutter")
    for col in ct_.users_collection:
        col.objects.unlink(ct_)
    CUTTERS.objects.link(ct_)
    room = L.mat("room", (0.035, 0.032, 0.03), 0.9)
    box(c - out * 1.95, (w + 1.0 if abs(side.x) > 0.5 else 2.8, 2.8 if abs(side.x) > 0.5 else w + 1.0, h + 0.8), room, name + " room")
    cur = L.mat("curtain", (0.55, 0.52, 0.47), 0.9)
    ct = plane_quad(name + " curtain", cf - out * 0.25 - side * w * 0.48 - up * h * 0.45, cf - out * 0.25 - side * w * 0.18 - up * h * 0.45,
                    cf - out * 0.25 - side * w * 0.18 + up * h * 0.48, cf - out * 0.25 - side * w * 0.48 + up * h * 0.48, cur)
    # sill below
    box(c - up * (h / 2 + 0.04) + out * 0.03, (w + 0.12 if abs(side.x) > 0.5 else 0.18, 0.18 if abs(side.x) > 0.5 else w + 0.12, 0.06),
        mat_frame if SHOT == "p4" else L.mat("sill", (0.5, 0.48, 0.45), 0.8), name + " sill")
    return fr, gl


glass_win = bpy.data.materials.new("window glass")
glass_win.use_nodes = True
_p = glass_win.node_tree.nodes["Principled BSDF"]
_p.inputs["Base Color"].default_value = (0.9, 0.92, 0.93, 1)
_p.inputs["Transmission Weight"].default_value = 1.0
_p.inputs["Roughness"].default_value = 0.0
_p.inputs["IOR"].default_value = 1.52

# ---------------------------------------------------------------- the houses
if SHOT == "y2":
    WALL = 2.7
    EAVE_OUT = 0.45
    HW = 12.0          # house width along X
    DEPTH = 10.0       # front-to-back
    RUN = DEPTH / 2 + EAVE_OUT
    # walls (brick veneer)
    brick = tex_mat("brick", "brick_wall_09", f("BRICK_SCALE", "0.45"), tint=(1.0, 0.92, 0.85))
    box((0, DEPTH / 2, WALL / 2), (HW, DEPTH, WALL), brick, "walls")
    eave_z = WALL + 0.05
    o_roof = Vector((-HW / 2 - EAVE_OUT, -EAVE_OUT, eave_z))
    slope = RUN / math.cos(PITCH)
    roofcol = tuple(float(v) for v in E("ROOF_COL", "0.42,0.43,0.42").split(","))  # Colorbond 'Shale Grey'-like
    sheet = painted("colorbond", roofcol, rough=0.38, metal=0.15)
    corrugated(o_roof, HW + 2 * EAVE_OUT, slope + 0.05, sheet)
    # back slope (unseen but it shades and closes the silhouette)
    ridge = o_roof + v_ax * slope
    vb = Vector((0, math.cos(PITCH), -math.sin(PITCH)))
    plane_quad("back slope", ridge, ridge + u_ax * (HW + 2 * EAVE_OUT), ridge + u_ax * (HW + 2 * EAVE_OUT) + vb * slope, ridge + vb * slope, sheet)
    # ridge capping (rolled), barge capping at both ends
    cap = painted("ridge cap", roofcol, rough=0.35, metal=0.15)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=HW + 2 * EAVE_OUT + 0.04, location=tuple(ridge + u_ax * (HW / 2 + EAVE_OUT) + Vector((0, 0, -0.06))),
                                        rotation=(0, math.pi / 2, 0), vertices=32)
    rc = bpy.context.active_object; rc.scale = (1, 1, 1); rc.data.materials.append(cap); rc.scale = (0.5, 1.0, 1.0)
    for sx in (-1, 1):
        xe = sx * (HW / 2 + EAVE_OUT + 0.01)
        a = Vector((xe, -EAVE_OUT, eave_z))
        A = S.MeshAcc()
        mid = a + v_ax * (slope / 2) + n_ax * 0.03
        A.box(mid, v_ax, u_ax, n_ax, slope + 0.05, 0.03, 0.1)
        A.write("barge", cap)
        # gable infill (brick) under the barge
        gz = WALL
        gl = S.MeshAcc()
        gl.quad(Vector((sx * HW / 2, 0, gz)), Vector((sx * HW / 2, DEPTH, gz)), Vector((sx * HW / 2, DEPTH / 2, gz + DEPTH / 2 * math.tan(PITCH))),
                Vector((sx * HW / 2, DEPTH / 2, gz + DEPTH / 2 * math.tan(PITCH))))
        gl.write("gable", brick)
    # fascia, gutter (quad profile), soffit lining
    fas = painted("fascia", roofcol, rough=0.4, metal=0.15)
    box((0, -EAVE_OUT - 0.01, eave_z - 0.1), (HW + 2 * EAVE_OUT, 0.02, 0.2), fas, "fascia")
    gut = painted("gutter", roofcol, rough=0.32, metal=0.2)
    A = S.MeshAcc()
    gy, gz = -EAVE_OUT - 0.08, eave_z - 0.11
    A.box(Vector((0, gy - 0.055, gz)), u_ax, Vector((0, 1, 0)), Vector((0, 0, 1)), HW + 2 * EAVE_OUT, 0.01, 0.115)  # front face
    A.box(Vector((0, gy, gz - 0.055)), u_ax, Vector((0, 1, 0)), Vector((0, 0, 1)), HW + 2 * EAVE_OUT, 0.115, 0.01)  # sole
    A.box(Vector((0, gy - 0.062, gz + 0.052)), u_ax, Vector((0, 1, 0)), Vector((0, 0, 1)), HW + 2 * EAVE_OUT, 0.02, 0.012)  # bead
    A.write("gutter", gut)
    sof = L.mat("eave lining", (0.62, 0.62, 0.6), 0.85)
    box((0, -EAVE_OUT / 2, eave_z - 0.2), (HW + 2 * EAVE_OUT, EAVE_OUT, 0.01), sof, "soffit")
    # a window under the eave
    alu = L.mat("window frame", (0.06, 0.06, 0.065), 0.4, 0.5)
    window((-2.4, -0.002, 1.55), 1.8, 1.3, (0, 1, 0), alu, glass_win, sash=False, name="win1")
    window((2.6, -0.002, 1.55), 1.5, 1.3, (0, 1, 0), alu, glass_win, sash=False, name="win2")
    cut_openings(bpy.data.objects["walls"])
    # screw fixings on the crests, in rows at the purlins
    A = S.MeshAcc()
    for j in range(1, int(slope / 0.9)):
        vv = j * 0.9
        for i in range(int((HW + 2 * EAVE_OUT) / 0.076)):
            if i % 3:
                continue
            p = o_roof + u_ax * (i * 0.076) + v_ax * vv + n_ax * 0.0095
            A.box(p, u_ax, v_ax, n_ax, 0.012, 0.012, 0.006)
    A.write("roof screws", painted("screw", roofcol, rough=0.4, metal=0.2))
    # the array: 2 rows x 6 modules in portrait, 1722 x 1134, 0.11 m off the sheet
    MU, MV, NU, NV = 1.134, 1.722, 6, 2
    arr_w = NU * (MU + 0.02) - 0.02
    arr_o = o_roof + u_ax * ((HW + 2 * EAVE_OUT) / 2 - arr_w / 2 + f("ARR_DX", "0.0")) + v_ax * f("ARR_V0", "1.15") + n_ax * 0.11
    tiles = S.cell_tiles((182, 91), 1.6, 10, 0.45, 1.5, 2.5, 12.0, "black", name="cell_182x91_10bb_black")
    grid, border = (6, 18), ((1134 - 6 * 183.6) / 2, (1722 - 18 * 92.6) / 2)
    frame_m = S.anodised("frame black", (0.025, 0.026, 0.028), (0.3, 0.45), metal=0.6)
    rail_m = S.anodised("rail", (0.7, 0.71, 0.72), (0.3, 0.45))
else:
    # ---------------------------------------------------------------- p4: a brick terrace
    BAY = 5.2          # house width
    NH = 5             # houses in the row
    FL = 3.1           # storey height
    WALL = 2 * FL + 0.3
    DEPTH = 9.0
    RUN = 4.2          # front slope run (to the ridge)
    brick = tex_mat("brick", "brick_wall_09", f("BRICK_SCALE", "0.45"), tint=(1.0, 0.95, 0.9), dirt=0.25)
    xs0 = -NH * BAY / 2
    box((0, DEPTH / 2, WALL / 2), (NH * BAY, DEPTH, WALL), brick, "terrace")
    eave_z = WALL
    o_roof = Vector((xs0, -0.12, eave_z + 0.05))
    slope = RUN / math.cos(PITCH)
    slate = tex_mat("slate", "grey_roof_tiles_02", f("SLATE_SCALE", "0.55"), tint=(0.85, 0.87, 0.9), rough_add=0.05, bump=1.2, rot=0.0, boxp=False)
    rs = plane_quad("roof", o_roof, o_roof + u_ax * NH * BAY, o_roof + u_ax * NH * BAY + v_ax * slope, o_roof + v_ax * slope, slate)
    # the slate texture runs its courses horizontally: map in the roof's own plane (u along X, v up the slope)
    ridge = o_roof + v_ax * slope
    vb = Vector((0, math.cos(PITCH), -math.sin(PITCH)))
    plane_quad("back slope", ridge, ridge + u_ax * NH * BAY, ridge + u_ax * NH * BAY + vb * slope, ridge + vb * slope, slate)
    # ridge tiles (half round, terracotta-grey)
    rt = L.mat("ridge tiles", (0.16, 0.15, 0.15), 0.7)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.13, depth=NH * BAY, location=tuple(ridge + u_ax * NH * BAY / 2 + Vector((0, 0, 0.02))),
                                        rotation=(0, math.pi / 2, 0), vertices=24)
    bpy.context.active_object.data.materials.append(rt)
    # chimney stacks on the party walls, with pots
    for k in range(NH + 1):
        x = xs0 + k * BAY
        cz = ridge.z
        box((x, ridge.y - 0.25, cz + 0.55), (0.75, 0.55, 1.6), brick, f"stack{k}")
        box((x, ridge.y - 0.25, cz + 1.38), (0.85, 0.65, 0.08), L.mat("stack cap", (0.5, 0.49, 0.47), 0.85), f"stackcap{k}")
        for pk in (-0.18, 0.18):
            bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.45, location=(x + pk, ridge.y - 0.25, cz + 1.64), vertices=20)
            bpy.context.active_object.data.materials.append(L.mat("chimney pot", (0.42, 0.22, 0.14), 0.8))
    # fascia board and a black half-round gutter on brackets, downpipes at the party walls
    blk = L.mat("gutter black", (0.012, 0.012, 0.013), 0.35)
    box((0, -0.14, eave_z - 0.02), (NH * BAY, 0.04, 0.2), L.mat("fascia", (0.85, 0.85, 0.83), 0.5), "fascia")
    bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=NH * BAY, location=(0, -0.22, eave_z - 0.04), rotation=(0, math.pi / 2, 0), vertices=24)
    gut = bpy.context.active_object; gut.data.materials.append(blk)
    for k in range(1, NH, 2):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=eave_z, location=(xs0 + k * BAY + 0.15, -0.08, eave_z / 2), vertices=16)
        bpy.context.active_object.data.materials.append(blk)
    # stone band at first floor, sash windows with stone lintels and sills, white painted
    stone = L.mat("stone", (0.62, 0.6, 0.55), 0.85)
    box((0, -0.03, FL), (NH * BAY, 0.08, 0.18), stone, "string course")
    white = L.mat("painted timber", (0.82, 0.82, 0.8), 0.45)
    for k in range(NH):
        cx = xs0 + (k + 0.5) * BAY
        for (wx, wz, ww, wh) in ((cx - 1.15, FL + 1.55, 1.05, 1.75), (cx + 1.15, FL + 1.55, 1.05, 1.75),
                                 (cx + 0.9, 1.6, 1.3, 1.8)):
            window((wx, -0.002, wz), ww, wh, (0, 1, 0), white, glass_win, sash=True, name=f"w{k}_{wx:.1f}_{wz:.1f}")
            box((wx, -0.04, wz + wh / 2 + 0.12), (ww + 0.25, 0.1, 0.22), stone, "lintel")
        # front door, recessed
        box((cx - 1.2, 0.12, 1.15), (1.0, 0.1, 2.3), L.mat("door", (0.03, 0.06, 0.09), 0.35), "door")
    cut_openings(bpy.data.objects["terrace"])
    # the array on the middle house: 2 rows x 4 modules in portrait
    MU, MV, NU, NV = 1.134, 1.722, 4, 2
    arr_w = NU * (MU + 0.02) - 0.02
    arr_o = o_roof + u_ax * (NH * BAY / 2 - arr_w / 2 + f("ARR_DX", "0.0")) + v_ax * f("ARR_V0", "0.55") + n_ax * 0.12
    tiles = S.cell_tiles((182, 91), 1.6, 10, 0.45, 1.5, 2.5, 12.0, "black", name="cell_182x91_10bb_black")
    grid, border = (6, 18), ((1134 - 6 * 183.6) / 2, (1722 - 18 * 92.6) / 2)
    frame_m = S.anodised("frame black", (0.025, 0.026, 0.028), (0.3, 0.45), metal=0.6)
    rail_m = S.anodised("rail", (0.7, 0.71, 0.72), (0.3, 0.45))

# ---------------------------------------------------------------- the array, the strike and the wash
XS, VS = float(g("XS")), float(g("VS"))  # strike: XS m from the array's centre along the row, VS m up the array
strike = arr_o + u_ax * (arr_w / 2 + XS) + v_ax * VS
DIR = 1.0
wash = S.Wash(strike, u_ax * DIR, -v_ax, fresh=0.7, edge=0.05, top=f("BAND_TOP", "0.25"))
gm = S.pv_material("pv roof", (MU * 1000, MV * 1000), grid, border, tiles, dust=f("DUST", "0.3"), wash=wash, edge_dirt=1.3)
S.modules_on_plane(arr_o, u_ax, v_ax, NU, NV, MU, MV, 0.02, 0.02, glass_mat=gm, frame_mat=frame_m, name="array", seed=3)
# rails and feet
A = S.MeshAcc()
for j in range(NV):
    for vv in (0.35, MV - 0.35):
        c = arr_o + u_ax * arr_w / 2 + v_ax * (j * (MV + 0.02) + vv) - n_ax * (0.035 + 0.025)
        A.box(c, u_ax, v_ax, n_ax, arr_w + 0.15, 0.04, 0.05)
        for i in range(5):
            fc = arr_o + u_ax * (0.3 + i * (arr_w - 0.6) / 4) + v_ax * (j * (MV + 0.02) + vv) - n_ax * 0.1
            A.box(fc, u_ax, v_ax, n_ax, 0.04, 0.05, 0.06)
A.write("rails", rail_m)

# ---------------------------------------------------------------- the drone
root = L.load_h1(loc=(0, 0, 8), rot_deg=(0, f("PITCHD", "3"), float(g("YAW"))), hose=False, spin=True)
S.aim(root, float(g("PAN")), float(g("TILT")))
nz, ld = S.place_for_strike2(root, strike, n_ax, standoff=float(g("STAND")))
clr = S.clearance(root, strike, n_ax)
print("drone at", tuple(round(v, 3) for v in root.location), "nozzle", tuple(round(v, 3) for v in nz), "clearance", round(clr, 3), flush=True)
_, _, half0 = L.spray(root, strike, n_ax, drops=int(E("DROPS", "1400")), nz=nz, seed=int(E("SEED", "7")))
L.mist(strike, n_ax, ld.cross(Vector((0, 0, 1))).normalized(), half0, n=int(E("MIST", "3000")))

# the hose: from the rear swivel down to the roof beside the array, down the slope, over the gutter lip and down
sw = L.model_to_world(root, L.SWIVEL_MM)
stub = (L.model_to_world(root, (-366, 9, 276)) - sw).normalized()
xr = arr_o.x + arr_w + 0.35  # beside the array's end
def on_roof(x, vv, lift=0.02):
    return o_roof + u_ax * (x - o_roof.x) + v_ax * vv + n_ax * lift
v_top = (sw - o_roof).dot(v_ax)
gutter_lip = Vector((xr + 0.25, (-0.62 if SHOT == "y2" else -0.3), eave_z + (-0.04 if SHOT == "y2" else 0.03)))
if SHOT == "y2":
    # down beside the array, then slanting back under its lower edge to cross the gutter's front lip in view
    xe = arr_o.x + arr_w - f("HOSE_BACK", "0.7")
    gutter_lip = Vector((xe, -0.62, eave_z - 0.04))
    v_low = (arr_o - o_roof).dot(v_ax)
    pts = [sw, sw + stub * 0.12, sw + Vector((0.5, -0.1, -0.35)),
           on_roof(xr, min(v_top - 0.6, slope - 0.6), 0.05), on_roof(xr + 0.05, v_top * 0.55, 0.02), on_roof(xr, v_low - 0.15, 0.02),
           on_roof(xr - 0.45, v_low - 0.55, 0.02), on_roof(xe + 0.1, 0.18, 0.02), gutter_lip + Vector((0, 0, 0.02)),
           gutter_lip + Vector((-0.03, -0.1, -0.3)), gutter_lip + Vector((-0.05, -0.14, -1.4)), gutter_lip + Vector((-0.06, -0.16, -eave_z + 0.2))]
else:
    pts = [sw, sw + stub * 0.12, sw + Vector((0.5, -0.1, -0.35)),
           on_roof(xr, min(v_top - 0.6, slope - 0.6), 0.05), on_roof(xr + 0.05, v_top * 0.55, 0.02), on_roof(xr + 0.15, 0.6, 0.02),
           on_roof(xr + 0.2, 0.12, 0.02), gutter_lip + Vector((0, 0, 0.02)),
           gutter_lip + Vector((0.05, -0.12, -0.35)), gutter_lip + Vector((0.1, -0.16, -1.6)), gutter_lip + Vector((0.12, -0.18, -eave_z + 0.2))]
S.hose(pts, radius=0.0085)

# ---------------------------------------------------------------- ground: the place's own ground as a shadow catcher
if SHOT == "y2":
    # no built ground: the HDRI was shot from a raised deck at about this height, so the gardens and trees it shows
    # beyond the ridge sit at the right angles; only a small catcher round the house takes the hose's shadow
    gnd = L.plane("ground", (16, 14), (0, 3, 0), material=L.mat("ground bounce", (0.2, 0.22, 0.16), 0.9), catcher=True)
else:
    gnd = L.plane("ground", (300, 300), (0, 0, 0), material=L.mat("ground bounce", (0.18, 0.18, 0.16), 0.9), catcher=True)

# ---------------------------------------------------------------- camera
dc = root.location.copy()
cam = Vector((float(g("CAMX")), float(g("CAMY")), float(g("CAMZ"))))
tgt = dc + Vector((f("AIMX", "0.0"), 0, 0.3))
hd = math.hypot(tgt.x - cam.x, tgt.y - cam.y)
tgt.z = cam.z + hd * math.tan(math.radians(float(g("CAMPITCH"))))
focus = (cam - (dc + Vector((0, 0, 0.3)))).length
L.camera(cam, tgt, lens=float(g("LENS")), fstop=float(g("FSTOP")), focus=focus, shift=(float(g("SX")), float(g("SY"))))
print("camera", tuple(round(v, 2) for v in cam), "focus", round(focus, 2), flush=True)
out = os.path.join(L.HERE, E("OUT", f"tests_solar/{SHOT}_t.png"))
L.render(out)
a = L.load_px(out)
L.save_px(L.grade(a, seed=13, levels=(f("LO", "0.02"), f("HI", "0.94")), sat=f("SAT", "0.95"), vignette=0.12, grain=0.8),
          out.replace(".png", "_g.jpg"), quality=92)
print("graded", flush=True)
