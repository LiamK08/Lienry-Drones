"""A glass curtain wall built in code: unitised panes (each a hair off true, as real panes are, so the city's
reflection breaks up from pane to pane), aluminium mullion caps and transoms, back-painted spandrels at each
slab, dim office interiors behind (ceilings, lights, blinds), dust on the glass, and a washed lane: clean and
wet above the strike, dull below it. Facade coordinates: u along the wall, w up, the wall's outer face at v=0,
its outward normal +v. place() maps them into the world."""
import math
import random

import bmesh
import bpy
from mathutils import Matrix, Vector

import h1lib as L

import os
DUST_FILM = float(os.environ.get("DUST_FILM", "0.3"))


class Wall:
    def __init__(self, origin, yaw_deg, width=30.0, height=40.0, bay=1.5, floor=3.6, spandrel=1.1, seed=5):
        self.o = Vector(origin)
        self.yaw = math.radians(yaw_deg)
        self.u = Vector((math.cos(self.yaw), math.sin(self.yaw), 0))  # along the wall
        self.n = Vector((-self.u.y, self.u.x, 0))  # outward normal (+v)
        self.W, self.H, self.bay, self.floor, self.sp = width, height, bay, floor, spandrel
        self.rng = random.Random(seed)

    def p(self, u, v, w):
        return self.o + self.u * u + self.n * v + Vector((0, 0, w))

    def mat_world(self):
        m = Matrix.Identity(4)
        m.col[0][:3] = self.u
        m.col[1][:3] = self.n
        m.col[2][:3] = (0, 0, 1)
        m.col[3][:3] = self.o
        return m


def glass_mat(name="curtain glass", tint=(0.42, 0.5, 0.54), dust=0.35, lane=None, film=True):
    if os.environ.get("TINT"):
        tint = tuple(float(v) for v in os.environ["TINT"].split(","))
    """lane = (u0, u1, w_top, w_strike) in facade metres: clean and wet between w_strike and w_top."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*tint, 1)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.52
    p.inputs["Roughness"].default_value = 0.0
    p.inputs["Specular IOR Level"].default_value = float(os.environ.get("GLASS_SPEC", "1.6"))
    if film and os.environ.get("FILM") and "Thin Film Thickness" in p.inputs:
        p.inputs["Thin Film Thickness"].default_value = 180.0  # a low-e coat: a faint cool cast in the reflection
        p.inputs["Thin Film IOR"].default_value = 2.0
    tc = n.new("ShaderNodeTexCoord")
    att = n.new("ShaderNodeAttribute")
    att.attribute_name = "fpos"  # facade (u, w) written per vertex
    sep = n.new("ShaderNodeSeparateXYZ")
    l_.new(att.outputs["Vector"], sep.inputs["Vector"])
    # dust: large soft blotches plus fine speckle, heavier toward the bottom of each pane (rain runs it down)
    big = n.new("ShaderNodeTexNoise"); big.inputs["Scale"].default_value = 0.35; big.inputs["Detail"].default_value = 6
    fine = n.new("ShaderNodeTexNoise"); fine.inputs["Scale"].default_value = 60; fine.inputs["Detail"].default_value = 4
    l_.new(att.outputs["Vector"], big.inputs["Vector"]); l_.new(att.outputs["Vector"], fine.inputs["Vector"])
    streak_map = n.new("ShaderNodeMapping"); streak_map.inputs["Scale"].default_value = (9, 0.6, 1)
    l_.new(att.outputs["Vector"], streak_map.inputs["Vector"])
    streak = n.new("ShaderNodeTexNoise"); streak.inputs["Scale"].default_value = 3; streak.inputs["Detail"].default_value = 3
    l_.new(streak_map.outputs["Vector"], streak.inputs["Vector"])
    def mr(sock, a, b, c=0.0, d=1.0):
        r = n.new("ShaderNodeMapRange"); r.clamp = True
        r.inputs["From Min"].default_value, r.inputs["From Max"].default_value = a, b
        r.inputs["To Min"].default_value, r.inputs["To Max"].default_value = c, d
        l_.new(sock, r.inputs["Value"]); return r.outputs["Result"]
    def op(o, a, b):
        x = n.new("ShaderNodeMath"); x.operation = o
        for i, s in enumerate((a, b)):
            if isinstance(s, (int, float)): x.inputs[i].default_value = s
            else: l_.new(s, x.inputs[i])
        return x.outputs["Value"]
    d = op("ADD", op("MULTIPLY", mr(big.outputs["Fac"], 0.35, 0.7), 0.7), op("MULTIPLY", mr(fine.outputs["Fac"], 0.45, 0.75), 0.3))
    d = op("ADD", d, op("MULTIPLY", mr(streak.outputs["Fac"], 0.55, 0.8), float(os.environ.get("STREAKS", "0.12"))))
    d = op("MULTIPLY", d, dust)
    wet = None
    if lane:
        u0, u1, wt, ws = lane
        # inside the lane horizontally (soft edges) and between the strike and the top
        e = 0.06
        inx = op("MULTIPLY", mr(sep.outputs["X"], u0, u0 + e), mr(sep.outputs["X"], u1, u1 - e))
        inz = op("MULTIPLY", mr(sep.outputs["Y"], ws - 0.02, ws + 0.04), mr(sep.outputs["Y"], wt + 0.05, wt - 0.05))
        # the strike line is ragged: the sheet runs ahead of it in fingers
        fing = n.new("ShaderNodeTexNoise"); fing.inputs["Scale"].default_value = 14; fing.inputs["Detail"].default_value = 4
        l_.new(att.outputs["Vector"], fing.inputs["Vector"])
        below = op("MULTIPLY", mr(sep.outputs["Y"], ws - 0.35, ws - 0.02), mr(fing.outputs["Fac"], 0.42, 0.58))
        wet = op("MAXIMUM", op("MULTIPLY", inx, inz), op("MULTIPLY", inx, below))
        d = op("MULTIPLY", d, op("SUBTRACT", 1.0, op("MULTIPLY", inx, inz)))
    # dust: rougher, a little milky; water: a thin film with ripples in the normal
    rough = op("ADD", 0.0, op("MULTIPLY", d, 0.35))
    l_.new(rough, p.inputs["Roughness"])
    milky = n.new("ShaderNodeMix"); milky.data_type = "RGBA"
    milky.inputs["A"].default_value = (*tint, 1); milky.inputs["B"].default_value = (0.62, 0.6, 0.56, 1)
    l_.new(op("MULTIPLY", d, 0.6), milky.inputs["Factor"])
    l_.new(milky.outputs["Result"], p.inputs["Base Color"])
    # dust scatters light: a thin diffuse film over the glass, so dull glass reads hazy and the washed lane clear
    dif = n.new("ShaderNodeBsdfDiffuse"); dif.inputs["Color"].default_value = (0.5, 0.48, 0.45, 1)
    dmix = n.new("ShaderNodeMixShader")
    l_.new(op("MULTIPLY", d, DUST_FILM), dmix.inputs["Fac"])
    l_.new(p.outputs["BSDF"], dmix.inputs[1]); l_.new(dif.outputs["BSDF"], dmix.inputs[2])
    l_.new(dmix.outputs["Shader"], n["Material Output"].inputs["Surface"])
    if wet is not None:
        rip = n.new("ShaderNodeTexNoise"); rip.inputs["Scale"].default_value = 40; rip.inputs["Detail"].default_value = 6
        rm = n.new("ShaderNodeMapping"); rm.inputs["Scale"].default_value = (1, 0.25, 1)
        l_.new(att.outputs["Vector"], rm.inputs["Vector"]); l_.new(rm.outputs["Vector"], rip.inputs["Vector"])
        bump = n.new("ShaderNodeBump"); bump.inputs["Distance"].default_value = 0.0015
        l_.new(op("MULTIPLY", rip.outputs["Fac"], wet), bump.inputs["Height"])
        l_.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def anodised(col):
    m = bpy.data.materials.new("anodised aluminium")
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*col, 1)
    p.inputs["Metallic"].default_value = 1.0
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 3.0; nz.inputs["Detail"].default_value = 8
    r = n.new("ShaderNodeMapRange"); r.inputs["To Min"].default_value = 0.28; r.inputs["To Max"].default_value = 0.5
    l_.new(nz.outputs["Fac"], r.inputs["Value"]); l_.new(r.outputs["Result"], p.inputs["Roughness"])
    return m


def build(wall, lane=None, tint=(0.42, 0.5, 0.54), dust=0.35, interior=True, frame_col=(0.16, 0.165, 0.17),
          spandrel_col=(0.06, 0.07, 0.08), u_range=None, w_range=None):
    """Panes, caps, transoms, spandrels and interiors over u_range x w_range (facade metres)."""
    rng = wall.rng
    u_lo, u_hi = u_range or (-wall.W / 2, wall.W / 2)
    w_lo, w_hi = w_range or (0.0, wall.H)
    gm = glass_mat(tint=tint, dust=dust, lane=lane)
    frame = anodised(frame_col)
    span = L.mat("spandrel", spandrel_col, 0.08, 0.0, **{"Coat Weight": 1.0, "Coat Roughness": 0.03})
    bm = bmesh.new()
    fpos = bm.verts.layers.float_vector.new("fpos")
    nb0, nb1 = math.floor(u_lo / wall.bay), math.ceil(u_hi / wall.bay)
    nf0, nf1 = math.floor(w_lo / wall.floor), math.ceil(w_hi / wall.floor)
    for i in range(nb0, nb1):
        for j in range(nf0, nf1):
            u0, u1 = i * wall.bay + 0.03, (i + 1) * wall.bay - 0.03
            w0, w1 = j * wall.floor + wall.sp, (j + 1) * wall.floor - 0.03
            # each pane a hair off true: rotated a little about its own centre
            ax, az_ = rng.gauss(0, 0.0018), rng.gauss(0, 0.0018)
            cu, cw = (u0 + u1) / 2, (w0 + w1) / 2
            vs = []
            for uu, ww in ((u0, w0), (u1, w0), (u1, w1), (u0, w1)):
                vv = -0.04 + (uu - cu) * az_ + (ww - cw) * ax
                v = bm.verts.new(wall.p(uu, vv, ww))
                v[fpos] = (uu, ww, 0)
                vs.append(v)
            bm.faces.new(vs)
    me = bpy.data.meshes.new("panes")
    bm.to_mesh(me)
    bm.free()
    panes = bpy.data.objects.new("panes", me)
    bpy.context.scene.collection.objects.link(panes)
    panes.data.materials.append(gm)
    # caps, transoms and spandrels as boxes in facade space
    def fbox(name, u0, u1, v0, v1, w0, w1, m):
        c = wall.p((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2)
        bpy.ops.mesh.primitive_cube_add(size=1, location=c)
        o = bpy.context.active_object
        o.name = name
        o.scale = (u1 - u0, v1 - v0, w1 - w0)
        o.rotation_euler = (0, 0, wall.yaw)
        o.data.materials.append(m)
        if m is frame:
            b = o.modifiers.new("bevel", "BEVEL"); b.width = 0.006; b.segments = 2; b.affect = "EDGES"
            b.use_clamp_overlap = True
        return o
    objs = []
    for i in range(nb0, nb1 + 1):
        objs.append(fbox("cap", i * wall.bay - 0.035, i * wall.bay + 0.035, -0.04, 0.07, w_lo, w_hi, frame))
    for j in range(nf0, nf1 + 1):
        objs.append(fbox("transom", u_lo, u_hi, -0.04, 0.05, j * wall.floor - 0.035, j * wall.floor + 0.035, frame))
        objs.append(fbox("spandrel", u_lo, u_hi, -0.045, -0.035, j * wall.floor + 0.035, j * wall.floor + wall.sp - 0.03, span))
        objs.append(fbox("sill", u_lo, u_hi, -0.04, 0.035, j * wall.floor + wall.sp - 0.035, j * wall.floor + wall.sp + 0.01, frame))
    if interior:
        cv = float(os.environ.get("CEIL", "0.22")); ceil = L.mat("office ceiling", (cv, cv, cv * 0.98), 0.8)
        dark = L.mat("office depth", (0.03, 0.032, 0.035), 0.9)
        lamp = L.mat("office light", (1, 1, 1), 0.5, **{"Emission Color": (1.0, 0.96, 0.9, 1), "Emission Strength": float(os.environ.get("OFFICE_LIGHTS", "0.9"))})
        blind = L.mat("blind", (0.62, 0.62, 0.6), 0.7)
        for j in range(nf0, nf1):
            wf = j * wall.floor
            objs.append(fbox("ceiling", u_lo, u_hi, -6.0, -0.3, wf + wall.floor - 0.6, wf + wall.floor - 0.58, ceil))
            objs.append(fbox("back", u_lo, u_hi, -6.0, -5.9, wf, wf + wall.floor, dark))
            objs.append(fbox("floor", u_lo, u_hi, -6.0, -0.3, wf + 0.0, wf + 0.02, dark))
            for k in range(int(u_lo // 2.4), int(u_hi // 2.4) + 1):
                for r_ in (1.5, 3.9):
                    if float(os.environ.get("OFFICE_LIGHTS", "0.9")) > 0 and rng.random() < float(os.environ.get("LIGHT_FILL", "0.6")):
                        objs.append(fbox("light", k * 2.4 - 0.6, k * 2.4 + 0.6, -r_ - 0.15, -r_ + 0.15, wf + wall.floor - 0.62, wf + wall.floor - 0.6, lamp))
            for i in range(nb0, nb1):
                if rng.random() < float(os.environ.get("BLINDS", "0.45")):
                    drop = rng.uniform(0.2, 1.0) * (wall.floor - wall.sp - 0.6)
                    objs.append(fbox("blind", i * wall.bay + 0.05, (i + 1) * wall.bay - 0.05, -0.25, -0.22,
                                     wf + wall.floor - 0.6 - drop, wf + wall.floor - 0.6, blind))
    for o in objs:
        o.visible_shadow = o.name.startswith(("cap", "transom", "spandrel", "sill"))
    return panes


def water_sheet(wall, u0, u1, w_top, w_strike, seed=4, name="water sheet"):
    """The water running down the washed lane: a thin film just proud of the glass from above the strike down
    past it in uneven fingers, rippled, so the glass behind it refracts and catches highlights."""
    rng = random.Random(seed)
    bm = bmesh.new()
    cols, rows = 48, 60
    xs = [u0 + (u1 - u0) * i / cols for i in range(cols + 1)]
    ph = [rng.uniform(0, 6.28) for _ in range(4)]
    bottoms = []
    for i, x in enumerate(xs):
        f = sum(math.sin(i * (0.35 + 0.17 * k) + ph[k]) for k in range(4)) / 4
        bottoms.append(w_strike - 0.25 - 0.55 * max(0.0, f + rng.uniform(-0.15, 0.15)))
    grid = []
    for i, x in enumerate(xs):
        grid.append([bm.verts.new(wall.p(x, 0.0015, w_top + (bottoms[i] - w_top) * j / rows)) for j in range(rows + 1)])
    for i in range(cols):
        for j in range(rows):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (1, 1, 1, 1)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.33
    p.inputs["Roughness"].default_value = 0.0
    tc = n.new("ShaderNodeTexCoord")
    mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (30, 30, 4)
    l_.new(tc.outputs["Object"], mp.inputs["Vector"])
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 1.0; nz.inputs["Detail"].default_value = 6
    l_.new(mp.outputs["Vector"], nz.inputs["Vector"])
    bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.5; bump.inputs["Distance"].default_value = 0.002
    l_.new(nz.outputs["Fac"], bump.inputs["Height"]); l_.new(bump.outputs["Normal"], p.inputs["Normal"])
    o.data.materials.append(m)
    o.visible_shadow = False
    return o
