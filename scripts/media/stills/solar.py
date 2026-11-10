"""Solar modules built in code for the solar family of stills (so1, p5, so2, y2, p4).

A module is anodised aluminium frame + anti-reflective glass over a monocrystalline cell grid (cells with chamfered
corners, busbar ribbons and fine fingers, white or black backsheet in the gaps). The cell grid is one tiling texture
generated here with numpy (assets/solar/cell_*.png), so it holds up in a macro frame. The glass shader carries a dust
layer (fine mottling, heavier along each module's lower lip, where rain leaves it) and an optional washed region
given in world space: wet, clean, glossy, rippled, with runnels down the slope and beads at its edge, so the washed
part mirrors the sky and the unwashed part reads dull.
Racking (fixed-tilt tables, roof rails), a grass-and-soil ground with real blade geometry, and the supply hose live
here too. Units are metres, Z up."""
import math
import os
import random

import bpy
import numpy as np
from mathutils import Vector

import h1lib as L

SOLAR_ASSETS = os.path.join(L.ASSETS, "solar")
TEX = os.path.join(L.ASSETS, "tex")
E = os.environ.get


# ---------------------------------------------------------------- the cell texture
def cell_tiles(cell_mm=(166.0, 166.0), gap_mm=2.2, busbars=5, bus_w_mm=1.1, finger_pitch_mm=1.75, chamfer_mm=9.0,
               px_per_mm=12.0, backsheet="white", name=None):
    """One cell plus half a gap on every side, as two images: colour (sRGB) and a mask (R metal, G backsheet,
    B finger). Busbars run along the tile's V (they continue through the gap to the next cell of the string)."""
    os.makedirs(SOLAR_ASSETS, exist_ok=True)
    name = name or f"cell_{int(cell_mm[0])}x{int(cell_mm[1])}_{busbars}bb_{backsheet}"
    pc, pm = os.path.join(SOLAR_ASSETS, name + "_col.png"), os.path.join(SOLAR_ASSETS, name + "_mask.png")
    if os.path.exists(pc) and os.path.exists(pm):
        return pc, pm
    cw, ch = cell_mm
    W, H = int(round((cw + gap_mm) * px_per_mm)), int(round((ch + gap_mm) * px_per_mm))
    x = (np.arange(W) + 0.5) / px_per_mm - (cw + gap_mm) / 2  # mm from the tile centre
    y = (np.arange(H) + 0.5) / px_per_mm - (ch + gap_mm) / 2
    X, Y = np.meshgrid(x, y)
    aa = 1.0 / px_per_mm

    def inside(d):  # soft step: 1 inside (d < 0), 0 outside, one pixel wide
        return np.clip(0.5 - d / aa, 0, 1)

    # cell: a rectangle with its corners cut at 45 degrees
    d_rect = np.maximum(np.abs(X) - cw / 2, np.abs(Y) - ch / 2)
    d_cham = (np.abs(X) + np.abs(Y) - (cw / 2 + ch / 2 - chamfer_mm)) / math.sqrt(2)
    cell = inside(np.maximum(d_rect, d_cham))
    rng = np.random.default_rng(5)
    # the cell's surface: near-black blue, with a faint large-scale wash and fine texturing
    base = np.array([0.020, 0.028, 0.052])  # linear
    wash = L.gblur(rng.normal(0, 1, ((H + 7) // 8, (W + 7) // 8, 1)).astype(np.float32), 6)
    wash = np.kron(wash, np.ones((8, 8, 1)))[:H, :W]
    wash = (wash - wash.mean()) / (wash.std() + 1e-6)
    fine = rng.normal(0, 1, (H, W, 1)).astype(np.float32)
    col_cell = base[None, None, :] * (1 + 0.06 * wash + 0.05 * fine)
    # fingers: thin silver lines across the busbars
    fp = finger_pitch_mm
    dfy = np.abs(((Y + fp / 2) % fp) - fp / 2)
    finger = np.clip(1 - dfy / (0.06 + aa * 0.6), 0, 1) * 0.55 * cell
    finger *= inside(np.abs(X) - (cw / 2 - 1.2))
    # busbars: flat tinned ribbons along V, through the gap too
    bus = np.zeros_like(X)
    if busbars:
        pitch = cw / busbars
        for k in range(busbars):
            cx = -cw / 2 + pitch * (k + 0.5)
            bus = np.maximum(bus, inside(np.abs(X - cx) - bus_w_mm / 2))
    sheet_col = np.array([0.72, 0.72, 0.70]) if backsheet == "white" else np.array([0.018, 0.019, 0.021])
    finger_col = np.array([0.30, 0.30, 0.30])
    bus_col = np.array([0.62, 0.62, 0.60])
    col = sheet_col[None, None, :] * (1 - cell[..., None]) + col_cell * cell[..., None]
    col = col * (1 - finger[..., None]) + finger_col * finger[..., None]
    col = col * (1 - bus[..., None]) + bus_col * bus[..., None]
    # sRGB encode for a colour image
    s = np.where(col <= 0.0031308, col * 12.92, 1.055 * np.power(np.clip(col, 0, None), 1 / 2.4) - 0.055)
    mask = np.stack([bus, (1 - cell) * (1 - bus), finger], -1)
    L.save_px(s.astype(np.float32), pc)
    L.save_px(mask.astype(np.float32), pm)
    return pc, pm


# ---------------------------------------------------------------- node helpers
class NB:
    """A small node-building helper for one node tree."""

    def __init__(self, nt):
        self.nt, self.n, self.l = nt, nt.nodes, nt.links

    def node(self, kind, **inputs):
        x = self.n.new(kind)
        for k, v in inputs.items():
            self.set(x.inputs[k], v)
        return x

    def set(self, sock, v):
        if hasattr(v, "is_linked") or hasattr(v, "links"):
            self.l.new(v, sock)
        else:
            sock.default_value = v

    def math(self, op, a, b=None, clamp=False):
        x = self.n.new("ShaderNodeMath")
        x.operation = op
        x.use_clamp = clamp
        self.set(x.inputs[0], a)
        if b is not None:
            self.set(x.inputs[1], b)
        return x.outputs[0]

    def vmath(self, op, a, b=None, scale=None):
        x = self.n.new("ShaderNodeVectorMath")
        x.operation = op
        self.set(x.inputs[0], a)
        if b is not None:
            self.set(x.inputs[1], b)
        if scale is not None:
            self.set(x.inputs["Scale"], scale)
        out = x.outputs["Value"] if op in ("DOT_PRODUCT", "LENGTH", "DISTANCE") else x.outputs["Vector"]
        return out

    def mr(self, v, a, b, c=0.0, d=1.0, smooth=False):
        x = self.n.new("ShaderNodeMapRange")
        x.clamp = True
        if smooth:
            x.interpolation_type = "SMOOTHSTEP"
        self.set(x.inputs["Value"], v)
        x.inputs["From Min"].default_value, x.inputs["From Max"].default_value = a, b
        x.inputs["To Min"].default_value, x.inputs["To Max"].default_value = c, d
        return x.outputs["Result"]

    def noise(self, vec, scale, detail=4.0, rough=0.5, dim="3D"):
        x = self.n.new("ShaderNodeTexNoise")
        x.noise_dimensions = dim
        self.set(x.inputs["Vector"], vec)
        x.inputs["Scale"].default_value = scale
        x.inputs["Detail"].default_value = detail
        x.inputs["Roughness"].default_value = rough
        return x.outputs["Fac"]

    def mix(self, fac, a, b):
        x = self.n.new("ShaderNodeMix")
        x.data_type = "RGBA"
        self.set(x.inputs["Factor"], fac)
        self.set(x.inputs["A"], a)
        self.set(x.inputs["B"], b)
        return x.outputs["Result"]

    def mixf(self, fac, a, b):
        x = self.n.new("ShaderNodeMix")
        x.data_type = "FLOAT"
        self.set(x.inputs["Factor"], fac)
        self.set(x.inputs["A"], a)
        self.set(x.inputs["B"], b)
        return x.outputs["Result"]

    def combine(self, a, b, c=0.0):
        x = self.n.new("ShaderNodeCombineXYZ")
        for i, v in enumerate((a, b, c)):
            self.set(x.inputs[i], v)
        return x.outputs[0]

    def img(self, path, vec, noncolor=False, interp="Linear", ext="REPEAT", box=False):
        x = self.n.new("ShaderNodeTexImage")
        if box:
            x.projection = "BOX"
            x.projection_blend = 0.15
        x.image = bpy.data.images.load(path, check_existing=True)
        if noncolor:
            x.image.colorspace_settings.name = "Non-Color"
        x.interpolation = interp
        x.extension = ext
        self.set(x.inputs["Vector"], vec)
        return x


# ---------------------------------------------------------------- the module glass
class Wash:
    """The washed region in world space: wet where dot(P - origin, along) > 0 (with a ragged edge), freshest near the
    origin; downhill is the slope's fall line (for runnels)."""

    def __init__(self, origin, along, downhill, fresh=0.8, edge=0.07, top=None):
        self.o, self.a, self.d = Vector(origin), Vector(along).normalized(), Vector(downhill).normalized()
        self.fresh, self.edge, self.top = fresh, edge, top  # top: the band's upper edge, metres uphill of origin


def pv_material(name, mod_mm, grid, border_mm, tiles, dust=0.35, wash=None, cell_tint=1.0, edge_dirt=1.0, seed=0.0):
    """mod_mm: the module's glass (u, v) size in mm; grid: (cols, rows) of cells; border_mm: (u, v) margin from the
    glass edge to the cell grid. Mesh UVs run 0..1 over each module's glass, U across the module, V up the slope
    (V=0 the lower edge). Per-module variation comes from the 'modid' attribute (0..1)."""
    pc, pm = tiles
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    p = b.n["Principled BSDF"]
    out = b.n["Material Output"]
    uv = b.node("ShaderNodeUVMap").outputs["UV"]
    geo = b.node("ShaderNodeNewGeometry")
    P = geo.outputs["Position"]
    att = b.node("ShaderNodeAttribute")
    att.attribute_name = "modid"
    modid = att.outputs["Fac"]
    sep = b.node("ShaderNodeSeparateXYZ")
    b.set(sep.inputs[0], uv)
    U, V = sep.outputs[0], sep.outputs[1]
    # module mm coordinates, then cell-grid coordinates
    umm, vmm = b.math("MULTIPLY", U, mod_mm[0]), b.math("MULTIPLY", V, mod_mm[1])
    cols, rows = grid
    pitch_u = (mod_mm[0] - 2 * border_mm[0]) / cols
    pitch_v = (mod_mm[1] - 2 * border_mm[1]) / rows
    gu = b.math("DIVIDE", b.math("SUBTRACT", umm, border_mm[0]), pitch_u)
    gv = b.math("DIVIDE", b.math("SUBTRACT", vmm, border_mm[1]), pitch_v)
    ingrid = b.math("MULTIPLY", b.math("MULTIPLY", b.math("GREATER_THAN", gu, 0.0), b.math("LESS_THAN", gu, float(cols))),
                    b.math("MULTIPLY", b.math("GREATER_THAN", gv, 0.0), b.math("LESS_THAN", gv, float(rows))))
    cuv = b.combine(b.math("FRACT", gu), b.math("FRACT", gv))
    col = b.img(pc, cuv, ext="EXTEND")
    msk = b.img(pm, cuv, noncolor=True, ext="EXTEND")
    msep = b.node("ShaderNodeSeparateColor")
    b.set(msep.inputs[0], msk.outputs["Color"])
    metal = b.math("MULTIPLY", msep.outputs[0], ingrid)
    sheet = b.math("SUBTRACT", 1.0, b.math("MULTIPLY", b.math("SUBTRACT", 1.0, msep.outputs[1]), ingrid))
    # per-cell tint: monocrystalline cells differ a little in their blue
    cid = b.combine(b.math("FLOOR", gu), b.math("FLOOR", gv), b.math("MULTIPLY", modid, 37.0))
    wn = b.node("ShaderNodeTexWhiteNoise")
    wn.noise_dimensions = "3D"
    b.set(wn.inputs["Vector"], cid)
    tint = b.mr(wn.outputs["Value"], 0, 1, 0.88 * cell_tint, 1.12 * cell_tint)
    sheetcol = (0.72, 0.72, 0.70, 1) if "black" not in pc else (0.018, 0.019, 0.021, 1)
    basecol = b.mix(b.math("SUBTRACT", 1.0, ingrid), col.outputs["Color"], sheetcol)
    mul = b.node("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    b.set(mul.inputs["A"], basecol)
    b.set(mul.inputs["B"], b.combine(tint, tint, tint))
    b.set(p.inputs["Base Color"], mul.outputs["Result"])
    b.set(p.inputs["Metallic"], b.math("MULTIPLY", metal, 0.9))
    b.set(p.inputs["Roughness"], b.mixf(sheet, b.mixf(metal, 0.32, 0.22), 0.55))
    p.inputs["Specular IOR Level"].default_value = 0.35
    # the glass: a clear coat (anti-reflective: low IOR)
    p.inputs["Coat Weight"].default_value = 1.0
    p.inputs["Coat IOR"].default_value = float(E("PV_COAT_IOR", "1.38"))
    # dust: soft blotches + fine speckle, a band along the lower lip of each module and its side edges
    big = b.noise(P, 0.9, 5, 0.55)
    fine = b.noise(P, 45.0, 3, 0.6)
    vv = b.mr(vmm, 0.0, 60.0 * edge_dirt + 1e-3, 1.0, 0.0)  # 0..60 mm above the lower frame
    lip = b.math("MULTIPLY", vv, b.mr(b.noise(P, 14.0, 3), 0.3, 0.7, 0.5, 1.0))
    side = b.math("MAXIMUM", b.mr(umm, 0.0, 25.0, 0.5, 0.0), b.mr(umm, mod_mm[0] - 25.0, mod_mm[0], 0.0, 0.5))
    dmod = b.mr(modid, 0, 1, 0.8, 1.2)
    speck = b.noise(P, 420.0, 2, 0.5)
    d = b.math("ADD", b.math("MULTIPLY", b.mr(big, 0.3, 0.75, 0.55, 1.15), 0.7), b.math("MULTIPLY", b.mr(fine, 0.35, 0.7), 0.2))
    d = b.math("ADD", d, b.math("MULTIPLY", b.mr(speck, 0.45, 0.75), 0.1))
    d = b.math("MULTIPLY", b.math("MULTIPLY", d, dust), dmod)
    d = b.math("ADD", d, b.math("MULTIPLY", b.math("MAXIMUM", lip, side), min(1.0, dust * 1.6)))
    wet = None
    bump_h = None
    if wash is not None:
        rel = b.vmath("SUBTRACT", P, tuple(wash.o))
        s = b.vmath("DOT_PRODUCT", rel, tuple(wash.a))
        t = b.vmath("DOT_PRODUCT", rel, tuple(wash.d))
        # ragged edge: the sheet runs ahead of the strike in fingers down the fall line
        fing = b.noise(b.combine(b.math("MULTIPLY", s, 1.0), b.math("MULTIPLY", t, 0.12)), 9.0, 3, 0.5)
        rag = b.math("ADD", b.math("MULTIPLY", b.math("SUBTRACT", b.noise(P, 4.0, 4), 0.5), wash.edge * 2.0),
                     b.math("MULTIPLY", b.math("SUBTRACT", fing, 0.5), wash.edge * 3.0))
        se = b.math("ADD", s, rag)
        wet = b.mr(se, -0.015, 0.03, 0.0, 1.0, smooth=True)
        if wash.top is not None:
            # the pass washes a band: from its upper edge (the fan's reach) down the fall line; above it, dust
            te = b.math("ADD", t, b.math("MULTIPLY", b.math("SUBTRACT", b.noise(P, 6.0, 4), 0.5), 0.06))
            wet = b.math("MULTIPLY", wet, b.mr(te, -wash.top - 0.02, -wash.top + 0.03, 0.0, 1.0, smooth=True))
        # a wider, softer version of the mask for the water's relief, so the film has no hard rim
        wsoft = b.mr(se, -0.02, 0.35, 0.0, 1.0, smooth=True)
        if wash.top is not None:
            wsoft = b.math("MULTIPLY", wsoft, b.mr(te, -wash.top, -wash.top + 0.3, 0.0, 1.0, smooth=True))
        # beads thrown just ahead of the strike, on the unwashed glass
        ahead = b.mr(se, -0.6, -0.01, 0.0, 1.0)
        vor = b.node("ShaderNodeTexVoronoi")
        vor.feature = "F1"
        b.set(vor.inputs["Vector"], P)
        vor.inputs["Scale"].default_value = float(E("BEAD_SCALE", "70"))
        rnd = b.node("ShaderNodeTexWhiteNoise")
        b.set(rnd.inputs["Vector"], vor.outputs["Position"])
        keep = b.math("LESS_THAN", rnd.outputs["Value"], b.math("MULTIPLY", ahead, 0.55))
        bead = b.math("MULTIPLY", b.mr(vor.outputs["Distance"], 0.0, 0.32, 1.0, 0.0, smooth=True), keep)
        # the water film behind the strike: thick and rippled near it, thinner further back; runnels down the slope
        fresh = b.mr(s, 0.0, wash.fresh, 1.0, 0.25)
        run = b.noise(b.combine(b.math("MULTIPLY", s, 30.0), b.math("MULTIPLY", t, 2.5)), 1.0, 4, 0.55)
        rip = b.noise(b.combine(b.math("MULTIPLY", s, 14.0), b.math("MULTIPLY", t, 9.0)), 1.0, 6, 0.6)
        film = b.math("MULTIPLY", wsoft, b.math("ADD", b.math("MULTIPLY", rip, fresh), b.math("MULTIPLY", b.mr(run, 0.45, 0.75), 0.6)))
        bump_h = b.math("ADD", film, b.math("MULTIPLY", bead, 0.8))
        # the wash clears the dust; a faint residue streak remains down the fall line
        resid = b.math("MULTIPLY", b.mr(run, 0.6, 0.85, 0.0, float(E("RESID", "0.06"))), dust)
        d = b.mixf(wet, d, resid)
        # the beads on the dusty glass are clear spots
        d = b.math("MULTIPLY", d, b.math("SUBTRACT", 1.0, b.math("MULTIPLY", bead, 0.8)))
    d = b.math("MINIMUM", d, 0.85)
    coat_r = b.math("ADD", float(E("PV_CLEAN_ROUGH", "0.015")), b.math("MULTIPLY", d, float(E("PV_DUST_ROUGH", "0.55"))))
    b.set(p.inputs["Coat Roughness"], coat_r)
    if bump_h is not None:
        bump = b.node("ShaderNodeBump")
        bump.inputs["Strength"].default_value = float(E("WET_BUMP", "0.2"))
        bump.inputs["Distance"].default_value = 0.0008
        b.set(bump.inputs["Height"], bump_h)
        b.set(p.inputs["Coat Normal"], bump.outputs["Normal"])
    # dust scatters: a diffuse film over the glass (light tan-grey), stronger at grazing view (it is a layer)
    dcol = tuple(float(v) for v in E("DUST_COL", "0.52,0.47,0.39").split(",")) + (1,)
    dif = b.node("ShaderNodeBsdfDiffuse", Color=dcol)
    dif.inputs["Roughness"].default_value = 1.0
    lw = b.node("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    graze = b.mr(lw.outputs["Facing"], 0.0, 1.0, 1.0, 1.6)
    dfac = b.math("MINIMUM", b.math("MULTIPLY", b.math("MULTIPLY", d, graze), float(E("DUST_FILM", "0.55"))), 0.9)
    mx = b.node("ShaderNodeMixShader")
    b.set(mx.inputs["Fac"], dfac)
    b.set(mx.inputs[1], p.outputs["BSDF"])
    b.set(mx.inputs[2], dif.outputs["BSDF"])
    b.set(out.inputs["Surface"], mx.outputs["Shader"])
    if E("DEBUG_PV"):
        em = b.node("ShaderNodeEmission")
        b.set(em.inputs["Color"], b.combine(dfac, wet if wet is not None else 0.0, 0.0))
        b.set(out.inputs["Surface"], em.outputs["Emission"])
    m["wet_socket"] = 1 if wet is not None else 0
    return m


def anodised(name="frame silver", col=(0.80, 0.81, 0.83), rough=(0.25, 0.42), metal=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    p = b.n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*col, 1)
    p.inputs["Metallic"].default_value = metal
    tc = b.node("ShaderNodeTexCoord").outputs["Object"]
    # brushed: stretched noise for roughness
    mp = b.node("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.0, 1.0, 60.0)
    b.set(mp.inputs["Vector"], tc)
    b.set(p.inputs["Roughness"], b.mr(b.noise(mp.outputs[0], 6.0, 6), 0.3, 0.7, rough[0], rough[1]))
    return m


def galvanised(name="galvanised steel"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    p = b.n["Principled BSDF"]
    P = b.node("ShaderNodeTexCoord").outputs["Object"]
    spang = b.node("ShaderNodeTexVoronoi")
    b.set(spang.inputs["Vector"], P)
    spang.inputs["Scale"].default_value = 60.0
    blot = b.noise(P, 3.0, 6)
    v = b.math("ADD", b.math("MULTIPLY", spang.outputs["Distance"], 0.25), b.math("MULTIPLY", blot, 0.6))
    b.set(p.inputs["Base Color"], b.mix(b.mr(v, 0.2, 0.8), (0.42, 0.43, 0.44, 1), (0.66, 0.67, 0.68, 1)))
    p.inputs["Metallic"].default_value = 0.85
    b.set(p.inputs["Roughness"], b.mr(v, 0.2, 0.8, 0.32, 0.55))
    return m


# ---------------------------------------------------------------- mesh building in bulk
class MeshAcc:
    """Accumulates quads (with optional UVs and a per-face attribute) and writes one mesh object."""

    def __init__(self):
        self.v, self.f, self.uv, self.attr = [], [], [], []

    def quad(self, a, b, c, d, uv=((0, 0), (1, 0), (1, 1), (0, 1)), attr=0.0):
        i = len(self.v)
        self.v += [tuple(a), tuple(b), tuple(c), tuple(d)]
        self.f.append((i, i + 1, i + 2, i + 3))
        self.uv += list(uv)
        self.attr.append(attr)

    def box(self, c, ax, ay, az, sx, sy, sz, attr=0.0):
        """A box centred at c with unit axes ax, ay, az and full sizes sx, sy, sz."""
        c, ax, ay, az = Vector(c), Vector(ax), Vector(ay), Vector(az)
        hx, hy, hz = ax * sx / 2, ay * sy / 2, az * sz / 2
        P = [c - hx - hy - hz, c + hx - hy - hz, c + hx + hy - hz, c - hx + hy - hz,
             c - hx - hy + hz, c + hx - hy + hz, c + hx + hy + hz, c - hx + hy + hz]
        for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
            self.quad(*(P[k] for k in f), attr=attr)

    def write(self, name, material, attr_name=None, smooth=False):
        me = bpy.data.meshes.new(name)
        V = np.array(self.v, np.float32)
        F = np.array(self.f, np.int32)
        me.vertices.add(len(V))
        me.vertices.foreach_set("co", V.ravel())
        me.loops.add(F.size)
        me.loops.foreach_set("vertex_index", F.ravel())
        me.polygons.add(len(F))
        me.polygons.foreach_set("loop_start", (np.arange(len(F)) * 4).astype(np.int32))
        me.update(calc_edges=True)
        uvl = me.uv_layers.new(name="UVMap")
        uvl.data.foreach_set("uv", np.array(self.uv, np.float32).ravel())
        if attr_name:
            a = me.attributes.new(attr_name, "FLOAT", "FACE")
            a.data.foreach_set("value", np.array(self.attr, np.float32))
        if smooth:
            me.shade_smooth()
        me.validate(verbose=False)
        o = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(o)
        if material:
            o.data.materials.append(material)
        return o


def modules_on_plane(origin, u_ax, v_ax, n_u, n_v, mod_u, mod_v, gap_u=0.02, gap_v=0.02, frame_w=0.032, frame_h=0.035,
                     glass_mat=None, frame_mat=None, name="array", seed=1, clamps=True, clamp_mat=None, frame_back=True):
    """A grid of modules on the plane through origin spanned by u_ax (along the row) and v_ax (up the slope).
    origin is the lower-left corner of the first module's glass. Returns (glass_obj, frame_obj, info)."""
    rng = random.Random(seed)
    o, u, v = Vector(origin), Vector(u_ax).normalized(), Vector(v_ax).normalized()
    n = u.cross(v).normalized()
    G, Fr = MeshAcc(), MeshAcc()
    cents = []
    for i in range(n_u):
        for j in range(n_v):
            c0 = o + u * (i * (mod_u + gap_u)) + v * (j * (mod_v + gap_v))
            mid = rng.random()
            # a hair of misalignment, as real installs have
            jit = n * rng.uniform(-0.002, 0.002)
            a, b_, c, d = c0 + jit, c0 + u * mod_u + jit, c0 + u * mod_u + v * mod_v + jit, c0 + v * mod_v + jit
            G.quad(a, b_, c, d, attr=mid)
            cc = c0 + u * mod_u / 2 + v * mod_v / 2 + jit
            cents.append(cc)
            # frame: four bars, the top lip 2 mm proud of the glass and overlapping it by 10 mm
            lip = 0.010
            for (cpos, ax, length, w_ax) in (
                    (c0 + u * mod_u / 2, u, mod_u + 2 * (frame_w - lip), v),
                    (c0 + u * mod_u / 2 + v * mod_v, u, mod_u + 2 * (frame_w - lip), v),
                    (c0 + v * mod_v / 2, v, mod_v - 2 * lip, u),
                    (c0 + v * mod_v / 2 + u * mod_u, v, mod_v - 2 * lip, u)):
                # outward offset so the bar's inner edge sits `lip` over the glass
                out = (cpos - cc).normalized()
                out = w_ax * (1 if out.dot(w_ax) > 0 else -1)
                bc = cpos + out * (frame_w / 2 - lip) + n * (0.002 - frame_h / 2) + jit
                Fr.box(bc, ax, out, n, length, frame_w, frame_h)
    go = G.write(name + " glass", glass_mat, attr_name="modid")
    fo = Fr.write(name + " frame", frame_mat)
    bv = fo.modifiers.new("bevel", "BEVEL")
    bv.width = 0.0025
    bv.segments = 2
    bv.limit_method = "ANGLE"
    info = dict(origin=o, u=u, v=v, n=n, len_u=n_u * (mod_u + gap_u) - gap_u, len_v=n_v * (mod_v + gap_v) - gap_v,
                centres=cents)
    # the backsheet side: an opaque dark sheet just under the glass so nothing shows through from below
    if frame_back:
        B = MeshAcc()
        for i in range(n_u):
            for j in range(n_v):
                c0 = o + u * (i * (mod_u + gap_u)) + v * (j * (mod_v + gap_v)) - n * 0.006
                B.quad(c0, c0 + v * mod_v, c0 + u * mod_u + v * mod_v, c0 + u * mod_u)
        bo = B.write(name + " backsheet", L.mat("backsheet", (0.6, 0.6, 0.58), 0.6))
    return go, fo, info


# ---------------------------------------------------------------- ground: soil texture + grass blades
def ground_material(name="field soil", scale=0.45, wet=None, tint=(1.0, 1.0, 1.0)):
    """Poly Haven grass_ground (CC0) with its normal and roughness; wet = (origin, along, side_axis, y0, y1):
    darkened drip strip under the washed modules."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    p = b.n["Principled BSDF"]
    P = b.node("ShaderNodeTexCoord").outputs["Object"]
    mp = b.node("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    b.set(mp.inputs["Vector"], P)
    vec = mp.outputs[0]
    # break the tiling: blend a second, rotated sample by large noise
    mp2 = b.node("ShaderNodeMapping")
    mp2.inputs["Scale"].default_value = (scale * 0.71, scale * 0.71, scale)
    mp2.inputs["Rotation"].default_value = (0, 0, 1.1)
    b.set(mp2.inputs["Vector"], P)
    blend = b.mr(b.noise(P, 0.08, 3), 0.4, 0.6)
    base = os.path.join(TEX, "grass_ground_%s_2k.jpg")
    c1 = b.img(base % "diff", vec).outputs["Color"]
    c2 = b.img(base % "diff", mp2.outputs[0]).outputs["Color"]
    col = b.mix(blend, c1, c2)
    r1 = b.img(base % "rough", vec, noncolor=True).outputs["Color"]
    nm = b.img(base % "nor_gl", vec, noncolor=True).outputs["Color"]
    nmap = b.node("ShaderNodeNormalMap")
    nmap.inputs["Strength"].default_value = 1.0
    b.set(nmap.inputs["Color"], nm)
    tintn = b.node("ShaderNodeMix")
    tintn.data_type = "RGBA"
    tintn.blend_type = "MULTIPLY"
    tintn.inputs["Factor"].default_value = 1.0
    b.set(tintn.inputs["A"], col)
    tintn.inputs["B"].default_value = (*tint, 1)
    col = tintn.outputs["Result"]
    rough = b.math("ADD", b.math("MULTIPLY", r1, 0.25), 0.72)
    if wet is not None:
        o, along, side, y0, y1 = wet
        Pw = b.node("ShaderNodeNewGeometry").outputs["Position"]
        rel = b.vmath("SUBTRACT", Pw, tuple(o))
        s = b.vmath("DOT_PRODUCT", rel, tuple(Vector(along).normalized()))
        t = b.vmath("DOT_PRODUCT", rel, tuple(Vector(side).normalized()))
        nz = b.noise(Pw, 3.0, 4)
        k = b.math("MULTIPLY", b.mr(b.math("ADD", s, b.math("MULTIPLY", nz, 0.3)), 0.0, 0.4),
                   b.math("MULTIPLY", b.mr(t, y0 - 0.15, y0 + 0.05, 0.0, 1.0, smooth=True), b.mr(t, y1 - 0.05, y1 + 0.15, 1.0, 0.0, smooth=True)))
        k = b.math("MULTIPLY", k, b.mr(nz, 0.3, 0.6, 0.6, 1.0))
        dark = b.node("ShaderNodeMix")
        dark.data_type = "RGBA"
        dark.blend_type = "MULTIPLY"
        b.set(dark.inputs["Factor"], b.math("MULTIPLY", k, 0.55))
        b.set(dark.inputs["A"], col)
        dark.inputs["B"].default_value = (0.35, 0.33, 0.32, 1)
        col = dark.outputs["Result"]
        rough = b.mixf(k, rough, 0.45)
    b.set(p.inputs["Base Color"], col)
    b.set(p.inputs["Roughness"], rough)
    b.set(p.inputs["Normal"], nmap.outputs["Normal"])
    p.inputs["Specular IOR Level"].default_value = 0.3
    return m


def grass_material(name="dry grass"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = NB(m.node_tree)
    n, out = b.n, b.n["Material Output"]
    n.remove(n["Principled BSDF"])
    ca = b.node("ShaderNodeVertexColor")
    ca.layer_name = "gcol"
    col = ca.outputs["Color"]
    dif = b.node("ShaderNodeBsdfDiffuse")
    b.set(dif.inputs["Color"], col)
    tr = b.node("ShaderNodeBsdfTranslucent")
    b.set(tr.inputs["Color"], col)
    gl = b.node("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.45
    gl.inputs["Color"].default_value = (0.9, 0.9, 0.85, 1)
    m1 = b.node("ShaderNodeMixShader")
    m1.inputs["Fac"].default_value = float(E("GRASS_TRANS", "0.3"))
    b.set(m1.inputs[1], dif.outputs["BSDF"])
    b.set(m1.inputs[2], tr.outputs["BSDF"])
    fr = b.node("ShaderNodeFresnel")
    fr.inputs["IOR"].default_value = 1.35
    m2 = b.node("ShaderNodeMixShader")
    b.set(m2.inputs["Fac"], b.math("MULTIPLY", fr.outputs["Fac"], 0.5))
    b.set(m2.inputs[1], m1.outputs["Shader"])
    b.set(m2.inputs[2], gl.outputs["BSDF"])
    b.set(out.inputs["Surface"], m2.outputs["Shader"])
    return m


def grass(density_fn, bounds, n_tufts, seed=3, height=(0.05, 0.28), blades=(6, 22), name="grass", z_fn=None,
          palette=None, lean=0.35):
    """Blades as real geometry: tufts sampled by density_fn(x, y) in [0, 1] over bounds (x0, x1, y0, y1), each
    a clump of thin curved blades (three segments, tapering), with a straw palette (some green at the base)."""
    rng = np.random.default_rng(seed)
    x0, x1, y0, y1 = bounds
    cand = rng.uniform((x0, y0), (x1, y1), (n_tufts * 4, 2))
    keep = rng.random(len(cand)) < np.array([density_fn(px, py) for px, py in cand])
    T = cand[keep][:n_tufts]
    pal = np.array(palette or [(0.50, 0.42, 0.25), (0.62, 0.53, 0.33), (0.42, 0.36, 0.22), (0.70, 0.62, 0.42),
                               (0.36, 0.34, 0.20), (0.55, 0.50, 0.36)], np.float32)
    verts, faces, cols = [], [], []
    vi = 0
    SEG = 3
    for (tx, ty) in T:
        nb = rng.integers(blades[0], blades[1])
        hmul = rng.uniform(0.6, 1.3)
        tilt_dir = rng.uniform(0, 2 * math.pi)
        for _ in range(nb):
            r = abs(rng.normal(0, 0.025))
            a = rng.uniform(0, 2 * math.pi)
            bx, by = tx + r * math.cos(a), ty + r * math.sin(a)
            bz = z_fn(bx, by) if z_fn else 0.0
            h = rng.uniform(*height) * hmul
            w = rng.uniform(0.0018, 0.0042)
            ang = a if rng.random() < 0.6 else tilt_dir + rng.normal(0, 0.6)
            lean_k = rng.uniform(0.05, lean)
            dx, dy = math.cos(ang), math.sin(ang)
            face_a = ang + math.pi / 2 + rng.normal(0, 0.5)
            fx, fy = math.cos(face_a), math.sin(face_a)
            c = pal[rng.integers(len(pal))] * rng.uniform(0.75, 1.15)
            base_c = c * np.array([0.75, 0.9, 0.6]) if rng.random() < 0.35 else c * 0.8
            for k in range(SEG + 1):
                t = k / SEG
                off = lean_k * h * t * t * 1.4
                px, py, pz = bx + dx * off, by + dy * off, bz + h * t * (1 - 0.25 * lean_k * t)
                ww = w * (1 - t) ** 0.8 + 0.0002
                verts += [(px - fx * ww, py - fy * ww, pz), (px + fx * ww, py + fy * ww, pz)]
                cc = base_c * (1 - t) + c * t
                cols += [cc, cc]
            for k in range(SEG):
                a0 = vi + 2 * k
                faces.append((a0, a0 + 1, a0 + 3, a0 + 2))
            vi += 2 * (SEG + 1)
    V = np.array(verts, np.float32)
    F = np.array(faces, np.int32)
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(V))
    me.vertices.foreach_set("co", V.ravel())
    me.loops.add(F.size)
    me.loops.foreach_set("vertex_index", F.ravel())
    me.polygons.add(len(F))
    me.polygons.foreach_set("loop_start", (np.arange(len(F)) * 4).astype(np.int32))
    me.update(calc_edges=True)
    ca = me.color_attributes.new("gcol", "FLOAT_COLOR", "POINT")
    C = np.ones((len(V), 4), np.float32)
    C[:, :3] = np.array(cols, np.float32)
    ca.data.foreach_set("color", C.ravel())
    me.shade_smooth()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(grass_material())
    print("grass blades", len(F) // SEG, flush=True)
    return o


# ---------------------------------------------------------------- the supply hose resting on things
def hose(points, radius=0.0085, name="supply hose", sleeve_len=0.35):
    """A hose through the given points (a smooth NURBS-like Bezier with automatic handles)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 6
    cu.resolution_u = 24
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(points) - 1)
    for bp, co in zip(sp.bezier_points, points):
        bp.co = Vector(co)
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    jacket = L.mat("hose jacket", (0.045, 0.048, 0.052), 0.32, **{"Coat Weight": 0.6, "Coat Roughness": 0.12})
    o.data.materials.append(jacket)
    # blue braided sleeve over its first stretch (as on the drone's own tether)
    sl = cu.copy()
    sl.bevel_depth = radius * 1.3
    so = bpy.data.objects.new(name + " sleeve", sl)
    so.data.materials.clear()
    so.data.materials.append(bpy.data.materials.get("Lienry • blue accent") or L.mat("blue sleeve", (0.1, 0.35, 0.6), 0.4))
    total = sum((Vector(points[k + 1]) - Vector(points[k])).length for k in range(len(points) - 1))
    sl.bevel_factor_mapping_end = "SPLINE"
    sl.bevel_factor_end = min(1.0, sleeve_len / max(sleeve_len, total))
    bpy.context.scene.collection.objects.link(so)
    return o


# ---------------------------------------------------------------- placing the drone so its jet strikes a point
def place_for_strike(root, target, normal, standoff=0.6):
    """Move the drone (keeping its attitude and lance tilt) so the lance ray meets the plane through target with
    the given normal at target, from standoff metres along the lance."""
    target, normal = Vector(target), Vector(normal).normalized()
    for _ in range(4):
        bpy.context.view_layer.update()
        nz, d = L.nozzle(root), L.lance_dir(root)
        nd = normal.dot(d)
        dist = normal.dot(target - nz) / nd
        root.location += normal * ((standoff - dist) * (-nd))
        bpy.context.view_layer.update()
        nz, d = L.nozzle(root), L.lance_dir(root)
        dist = normal.dot(target - nz) / normal.dot(d)
        hit = nz + d * dist
        root.location += target - hit
    bpy.context.view_layer.update()
    nz, d = L.nozzle(root), L.lance_dir(root)
    return nz, d


def clearance(root, plane_pt, normal, names=("P03_Skid", "C11_SkidShoe", "P03_Leg", "C03_BellyPan", "C04_ChinPod", "P02_Prop")):
    """Least height of the drone's low parts above a plane (metres)."""
    bpy.context.view_layer.update()
    n = Vector(normal).normalized()
    best = 1e9
    for o in bpy.data.objects:
        if o.type == "MESH" and o.name.startswith("H1_") and not o.hide_render and any(k in o.name for k in names):
            mw = o.matrix_world
            for c in o.bound_box:
                p = mw @ Vector(c)
                best = min(best, n.dot(p - Vector(plane_pt)))
    return best


# ---------------------------------------------------------------- the lance on its pan/tilt gimbal
def aim(root, pan_deg=0.0, tilt_deg=0.0):
    """Pan (positive: nozzle toward the model's +Y) and tilt (negative: down) the lance; returns (nozzle, dir) in
    world space, read from the tilt pivot itself so pan is honoured."""
    pan = bpy.data.objects.get("H1_Gimbal_PanPivot")
    pan.rotation_euler.z = math.radians(pan_deg)
    L.set_tilt(tilt_deg)
    bpy.context.view_layer.update()
    return nozzle2(root)


def nozzle2(root):
    bpy.context.view_layer.update()
    t = bpy.data.objects.get("H1_Gimbal_TiltPivot")
    mw = t.matrix_world
    # the tilt pivot sits at model (250, 0, 190); the active tip's orifice face at x 830
    loc_piv = mw.translation
    ax = (mw.to_3x3() @ Vector((1, 0, 0))).normalized()
    # distance pivot -> orifice in world units (model mm scaled by the root)
    s = root.matrix_world.to_scale()[0]
    nz = loc_piv + ax * (580.0 * s)
    return nz, ax


def place_for_strike2(root, target, normal, standoff=0.6):
    """As place_for_strike, with the pan-aware nozzle."""
    target, normal = Vector(target), Vector(normal).normalized()
    for _ in range(5):
        nz, d = nozzle2(root)
        nd = normal.dot(d)
        dist = normal.dot(target - nz) / nd
        root.location += normal * ((standoff - dist) * (-nd))
        nz, d = nozzle2(root)
        dist = normal.dot(target - nz) / normal.dot(d)
        root.location += target - (nz + d * dist)
    return nozzle2(root)


# ---------------------------------------------------------------- water beads as geometry (for close frames)
def water_mat(name="water bead"):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (1, 1, 1, 1)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.333
    p.inputs["Roughness"].default_value = 0.0
    return m


def beads(origin, u, v, n, count, region_fn, rmin=0.0006, rmax=0.003, flat=0.45, seed=5, name="beads"):
    """Drops sitting on a plane: flattened spheres (a cap of water, contact angle well under 90 degrees) at points
    (a, b) in plane metres accepted by region_fn(a, b) -> probability. u, v span the plane, n its normal."""
    import bmesh
    rng = random.Random(seed)
    o, u, v, n = Vector(origin), Vector(u).normalized(), Vector(v).normalized(), Vector(n).normalized()
    V0, F0 = L._icosphere()
    verts, faces = [], []
    k = 0
    tries = 0
    while k < count and tries < count * 30:
        tries += 1
        a, b_ = rng.uniform(-1, 1), rng.uniform(-1, 1)
        pr = region_fn(a, b_)
        if rng.random() > pr:
            continue
        r = rmin + (rmax - rmin) * rng.random() ** 2.5
        # elongated a little down the fall line (-v), as drops on a slope are
        el = 1.0 + rng.random() * 0.6
        c = o + u * a + v * b_ + n * (r * flat * 0.35)
        for p in V0:
            q = c + u * (p[0] * r) + v * (p[1] * r * el) + n * (max(p[2], -0.35) * r * flat)
            verts.append(tuple(q))
        faces.extend((F0 + k * len(V0)).tolist())
        k += 1
    o_ = L.write_mesh(name, np.array(verts), np.array(faces), water_mat())
    for poly in o_.data.polygons:
        poly.use_smooth = True
    print("beads", k, flush=True)
    return o_
