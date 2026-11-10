"""The owner's ground dock (the 'OPTIONAL GROUND DOCK' of their H1 build script, SHOW_DOCK, parts H1_P22..H1_P37)
for the dock stills, plus the pieces the dock shots share: the H1 parked on (or hovering over) its pad, the hose
from the pad's port to the drone's swivel, deck catchers, holdouts, a wet deck and the plate camera from env.

Dock model space (mm, as the build script): the body is 1750 x 1750 x 1100, centred at model (0, -2400), its base
on z 0; +X is the front (louvred doors, status bar, wordmark), -X the rear (hose port on the pad, garden inlet and
backflow valve, mains lead, weather mast at the rear-left corner). The landing pad's top is z 470, the brass
contact rails' top z 476, where the H1's skid shoes (model z 0) stand. Two clamshell lids, split along X, hinge
on their outer top edges (H1_P29_LidHinge_-1 / _1); hinge.rotation_euler.x = -s * radians(angle).
"""
import bpy  # noqa: I001
import math
import os
import random

import numpy as np
from mathutils import Matrix, Vector

import h1lib as L

DOCK_FILE = os.environ.get("DOCK_BLEND", os.path.join(L.HERE, "H1_with_dock.blend"))
DOCK_Y_MM = -2400.0
RAIL_TOP_M = 0.476
HOSE_PORT_MM = (-700.0, 0.0, 477.0)  # top of the pad's hose port, dock-centred mm
GARDEN_INLET_MM = (-880.0, -600.0, 170.0)


def load_dock(loc=(0, 0, 0), yaw_deg=0.0, lid_deg=40.0, name="Dock"):
    """Append the owner's H1_Dock collection, keep the lid hinge parenting and text markings, hide any
    dimension or notes objects, set the lids, and parent everything to one root (metres, dock base centre,
    +X the dock front). Returns the root."""
    sc = bpy.context.scene
    with bpy.data.libraries.load(DOCK_FILE, link=False) as (src, dst):
        dst.collections = ["H1_Dock"]
    objs = list(dst.collections[0].objects)
    col = bpy.data.collections.new(name)
    sc.collection.children.link(col)
    for o in objs:
        col.objects.link(o)
        if "Dimension" in o.name or o.name.startswith(("DIM_", "H1_Dim", "H1_Notes")):
            o.hide_render = o.hide_viewport = True
    bpy.context.view_layer.update()
    # the lids, then the actuators re-aimed at the same points on the lids' undersides
    act = {}
    for s in (-1, 1):
        hinge = bpy.data.objects.get(f"H1_P29_LidHinge_{s}")
        body = bpy.data.objects.get(f"H1_P29_ActuatorBody_{s}")
        rod = bpy.data.objects.get(f"H1_P29_ActuatorRod_{s}")
        if not (hinge and body and rod):
            continue
        base = Vector((450.0, DOCK_Y_MM + s * 810.0, 780.0))
        tip40 = Vector((450.0, DOCK_Y_MM + s * 550.0, 1260.0))
        bpy.context.view_layer.update()
        tip_local = hinge.matrix_world.inverted() @ tip40
        hinge.rotation_euler.x = -s * math.radians(lid_deg)
        bpy.context.view_layer.update()
        tip = hinge.matrix_world @ tip_local
        u = (tip - base).normalized()
        q = u.to_track_quat("Z", "Y")
        body.matrix_world = Matrix.LocRotScale(base + u * 119.0, q, Vector((1, 1, 1)))
        lr = max(20.0, (tip - base).length - 238.0)
        rod.matrix_world = Matrix.LocRotScale(base + u * (238.0 + lr / 2), q, Vector((1, 1, lr / 310.0)))
        act[s] = tip
        if lid_deg > 60:
            # past about 60 degrees the strut's lid point swings outside the wall and the rod would cross the
            # wall's top edge in view; the owner's model has no linkage for that, so the struts are left out
            body.hide_render = rod.hide_render = True
    bpy.context.view_layer.update()
    root = bpy.data.objects.new(name, None)
    col.objects.link(root)
    off = bpy.data.objects.new(name + " mm offset", None)
    col.objects.link(off)
    off.parent = root
    off.location = (0, -DOCK_Y_MM, 0)
    for o in objs:
        if o.parent is None:
            mw = o.matrix_world.copy()
            o.parent = off
            o.matrix_parent_inverse = Matrix.Identity(4)
            o.matrix_basis = mw
    root.scale = (0.001, 0.001, 0.001)
    root.rotation_euler = (0, 0, math.radians(yaw_deg))
    root.location = Vector(loc)
    bpy.context.view_layer.update()
    root["dock_objects"] = [o.name for o in objs]
    return root


def dock_objects(root):
    return [bpy.data.objects[n] for n in root["dock_objects"] if n in bpy.data.objects]


def dock_point(root, p_mm):
    """A dock-centred mm point (dock base centre at the origin) in world metres."""
    bpy.context.view_layer.update()
    return root.matrix_world @ Vector(p_mm)


def set_dock_lights(root, strength=4.0, color=None):
    """The pad's LED ring and the front status bar: their own copy of the status material."""
    m = None
    for o in dock_objects(root):
        if o.type in ("MESH", "CURVE") and o.data.materials and o.data.materials[0].name.startswith("Lienry status illumination"):
            if m is None:
                m = o.data.materials[0].copy()
                m.name = "dock status light"
                p = m.node_tree.nodes.get("Principled BSDF")
                p.inputs["Emission Strength"].default_value = strength
                if color:
                    p.inputs["Emission Color"].default_value = (*color, 1)
            o.data.materials[0] = m
    return m


def wet_dock(root, coat=0.9, coat_rough=0.04):
    """Rain on the dock's shells: a glossy water coat over the porcelain and graphite ASA."""
    done = {}
    for o in dock_objects(root):
        if o.type not in ("MESH", "CURVE", "FONT") or not o.data.materials:
            continue
        for i, m in enumerate(o.data.materials):
            if m is None or not m.name.startswith(("Lienry • porcelain", "Lienry • graphite", "Bare aluminium", "Stainless")):
                continue
            if m.name not in done:
                w = m.copy()
                w.name = m.name + " wet"
                p = w.node_tree.nodes.get("Principled BSDF")
                if p:
                    p.inputs["Coat Weight"].default_value = coat
                    p.inputs["Coat Roughness"].default_value = coat_rough
                    p.inputs["Roughness"].default_value = max(0.15, p.inputs["Roughness"].default_value * 0.7)
                done[m.name] = w
            o.data.materials[i] = done[m.name]


def h1_on_dock(dock_root, hover=0.0, spin=False, yaw_extra=0.0, roll_deg=0.0, pitch_deg=0.0, parked_lights=True, dx=0.0, dy=0.0):
    """The owner's H1 on the dock's pad (skid shoes on the brass rails), or hovering `hover` m above them,
    heading the dock's +X. Parked: props stopped, nav and strobe off, the status strip dim."""
    yaw = math.degrees(dock_root.rotation_euler.z) + yaw_extra
    p = dock_point(dock_root, (dx * 1000, dy * 1000, (RAIL_TOP_M + hover) * 1000))
    root = L.load_h1(loc=tuple(p), rot_deg=(roll_deg, pitch_deg, yaw), spin=spin)
    if parked_lights:
        for mn, st in (("Port navigation red", 0.0), ("Starboard navigation green", 0.0), ("White strobe", 0.0),
                       ("Lienry status illumination", 1.2)):
            m = bpy.data.materials.get(mn)
            if m:
                m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = st
    return root


def hose_port(dock_root):
    return dock_point(dock_root, HOSE_PORT_MM)


def dock_tether(h1_root, dock_root, sag=0.15, radius=0.0075):
    """The supply hose paying out of the pad's port (between its two guide rollers) to the H1's rear swivel."""
    return L.tether(h1_root, hose_port(dock_root), sag=sag, radius=radius)


def catcher(name, size, loc, rot_deg=(0, 0, 0)):
    return L.plane(name, size, loc, rot_deg=rot_deg, catcher=True)


def holdout_box(name, center, size, yaw_deg=0.0):
    """A plate object standing in front of the CG (a planter, a wall end): holds the render out there."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    o.rotation_euler = (0, 0, math.radians(yaw_deg))
    o.is_holdout = True
    o.visible_shadow = False
    return o


def proxy_box(name, center, size, yaw_deg=0.0, catch=True):
    """A plate object near the CG: casts the CG's shadows onto itself (catcher) and shadows the CG."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    o.rotation_euler = (0, 0, math.radians(yaw_deg))
    o.is_shadow_catcher = catch
    return o


def reflect_film(name, verts, rough=0.2, strength=1.0, puddle_tex=None):
    """An additive reflection layer on a wet deck: transparent plus a Fresnel-weighted glossy, so the plate
    (darkened separately by the wet mask) shows through and takes the sky's and the dock's reflections.
    verts: ground polygon (world). puddle_tex: (scale, lo, hi) noise threshold for mirror puddles."""
    import bmesh
    b = bmesh.new()
    fc = b.faces.new([b.verts.new(Vector(v)) for v in verts])
    uvl = b.loops.layers.uv.new()
    for lp in fc.loops:
        lp[uvl].uv = (lp.vert.co.x, lp.vert.co.y)
    me = bpy.data.meshes.new(name)
    b.to_mesh(me)
    b.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    n.remove(n["Principled BSDF"])
    tr = n.new("ShaderNodeBsdfTransparent")
    gl = n.new("ShaderNodeBsdfGlossy")
    gl.distribution = "GGX"
    fr = n.new("ShaderNodeFresnel")
    fr.inputs["IOR"].default_value = 1.33
    k = n.new("ShaderNodeMath"); k.operation = "MULTIPLY"; k.inputs[1].default_value = strength
    l_.new(fr.outputs["Fac"], k.inputs[0])
    col = n.new("ShaderNodeCombineColor")
    for c in ("Red", "Green", "Blue"):
        l_.new(k.outputs["Value"], col.inputs[c])
    l_.new(col.outputs["Color"], gl.inputs["Color"])
    if puddle_tex:
        sc_, lo, hi = puddle_tex
        tc = n.new("ShaderNodeTexCoord")
        nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = sc_; nz.inputs["Detail"].default_value = 6
        nz.inputs["Roughness"].default_value = 0.55
        l_.new(tc.outputs["Object"], nz.inputs["Vector"])
        mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = lo; mr.inputs["From Max"].default_value = hi
        mr.inputs["To Min"].default_value = rough; mr.inputs["To Max"].default_value = 0.015
        l_.new(nz.outputs["Fac"], mr.inputs["Value"])
        l_.new(mr.outputs["Result"], gl.inputs["Roughness"])
        m["puddle"] = True
    else:
        gl.inputs["Roughness"].default_value = rough
    add = n.new("ShaderNodeAddShader")
    l_.new(tr.outputs["BSDF"], add.inputs[0])
    l_.new(gl.outputs["BSDF"], add.inputs[1])
    l_.new(add.outputs["Shader"], n["Material Output"].inputs["Surface"])
    o.data.materials.append(m)
    o.visible_shadow = False
    o.visible_diffuse = False
    return o


def mask_plane(name, verts, value_tex=None):
    """A ground polygon for the wet mask (rendered alone as emission by plate.render_mask): its material is a
    Mix shader whose Fac is the wetness (1, or a noise for drying patches)."""
    import bmesh
    b = bmesh.new()
    b.faces.new([b.verts.new(Vector(v)) for v in verts])
    me = bpy.data.meshes.new(name)
    b.to_mesh(me)
    b.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    n.remove(n["Principled BSDF"])
    mix = n.new("ShaderNodeMixShader")
    if value_tex:
        sc_, lo, hi, vmin = value_tex
        tc = n.new("ShaderNodeTexCoord")
        nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = sc_; nz.inputs["Detail"].default_value = 6
        l_.new(tc.outputs["Object"], nz.inputs["Vector"])
        mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = lo; mr.inputs["From Max"].default_value = hi
        mr.inputs["To Min"].default_value = vmin; mr.inputs["To Max"].default_value = 1.0
        l_.new(nz.outputs["Fac"], mr.inputs["Value"])
        l_.new(mr.outputs["Result"], mix.inputs["Fac"])
    else:
        mix.inputs["Fac"].default_value = 1.0
    tr = n.new("ShaderNodeBsdfTransparent")
    l_.new(tr.outputs["BSDF"], mix.inputs[1])
    l_.new(tr.outputs["BSDF"], mix.inputs[2])
    l_.new(mix.outputs["Shader"], n["Material Output"].inputs["Surface"])
    o.data.materials.append(m)
    o.hide_render = True
    return o


def env_crop(E, W, H):
    """CROPC=cx,cy and CROPW=w (plate px) with the RES aspect -> (crop tuple, scale for the output width)."""
    res = tuple(int(v) for v in E("RES", "2048x1365").split("x"))
    cx, cy = (float(v) for v in E("CROPC", f"{W / 2},{H / 2}").split(","))
    cw = float(E("CROPW", str(W)))
    ch = cw * res[1] / res[0]
    x0 = int(round(min(max(cx - cw / 2, 0), W - cw)))
    y0 = int(round(min(max(cy - ch / 2, 0), H - ch)))
    crop = (x0, y0, int(round(x0 + cw)), int(round(y0 + ch)))
    outw = int(E("PREV", "0")) or res[0]
    return crop, outw / cw, res, outw


def finish(s, res_w, res_h):
    """Resize the graded composite to the exact master size (a pixel of rounding from the border crop)."""
    if s.shape[1] == res_w and s.shape[0] == res_h:
        return s
    from plate import resize
    return resize(s, res_w, res_h)


def world_split(path, rot_z_deg=0.0, k_sun=1.0, k_fill=1.0, thresh=40.0, visible=False):
    """The place's HDRI with its sun and its fill scaled apart: the plates' HDR merges are contrastier than the
    HDRI (shade crushed), so the fill (all radiance below `thresh`) is scaled by k_fill and the sun disc (the
    excess above it) by k_sun. Camera rays see nothing (the backplate is behind). Blender's equirect: u=0.5 is
    +X and u grows clockwise from above, so a sun at texture azimuth a lands at world azimuth a - rot."""
    w = bpy.data.worlds.new("world split")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(rot_z_deg))
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(path, check_existing=True)
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    mn = nt.nodes.new("ShaderNodeVectorMath"); mn.operation = "MINIMUM"
    mn.inputs[1].default_value = (thresh, thresh, thresh)
    nt.links.new(env.outputs["Color"], mn.inputs[0])
    sub = nt.nodes.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"
    nt.links.new(env.outputs["Color"], sub.inputs[0]); nt.links.new(mn.outputs["Vector"], sub.inputs[1])
    s1 = nt.nodes.new("ShaderNodeVectorMath"); s1.operation = "SCALE"; s1.inputs["Scale"].default_value = k_sun
    nt.links.new(sub.outputs["Vector"], s1.inputs[0])
    s2 = nt.nodes.new("ShaderNodeVectorMath"); s2.operation = "SCALE"; s2.inputs["Scale"].default_value = k_fill
    nt.links.new(mn.outputs["Vector"], s2.inputs[0])
    add = nt.nodes.new("ShaderNodeVectorMath"); add.operation = "ADD"
    nt.links.new(s1.outputs["Vector"], add.inputs[0]); nt.links.new(s2.outputs["Vector"], add.inputs[1])
    bg = nt.nodes.new("ShaderNodeBackground")
    nt.links.new(add.outputs["Vector"], bg.inputs["Color"])
    out = nt.nodes.new("ShaderNodeOutputWorld")
    lp = nt.nodes.new("ShaderNodeLightPath")
    tr = nt.nodes.new("ShaderNodeBackground"); tr.inputs["Strength"].default_value = 0.0
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(bg.outputs["Background"], mix.inputs[1])
    nt.links.new(tr.outputs["Background"] if not visible else bg.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    w.cycles.sampling_method = "MANUAL"
    w.cycles.sample_map_resolution = 4096
    return w


def weather_dock(root, amount=1.0, seed=0.0):
    """A season outdoors on the dock's shells: grime rising from the base (splash and dust), faint vertical
    run-off streaks and a slightly duller finish, as a multiply over the porcelain and graphite ASA."""
    done = {}
    base_z = root.matrix_world.translation.z
    for o in dock_objects(root):
        if o.type not in ("MESH", "CURVE") or not o.data.materials:
            continue
        for i, m in enumerate(o.data.materials):
            if m is None or not m.name.startswith(("Lienry • porcelain", "Lienry • graphite")):
                continue
            if m.name not in done:
                w = m.copy()
                w.name = m.name + " weathered"
                nt = w.node_tree
                n, l_ = nt.nodes, nt.links
                p = n.get("Principled BSDF")
                base = tuple(p.inputs["Base Color"].default_value)
                tc = n.new("ShaderNodeTexCoord")
                sep = n.new("ShaderNodeSeparateXYZ")
                geo = n.new("ShaderNodeNewGeometry")
                l_.new(geo.outputs["Position"], sep.inputs["Vector"])
                # height above the dock base (world metres)
                hz = n.new("ShaderNodeMath"); hz.operation = "SUBTRACT"; hz.inputs[1].default_value = base_z
                l_.new(sep.outputs["Z"], hz.inputs[0])
                low = n.new("ShaderNodeMapRange"); low.inputs["From Min"].default_value = 0.35; low.inputs["From Max"].default_value = 0.0
                l_.new(hz.outputs["Value"], low.inputs["Value"])
                nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 18.0; nz.inputs["Detail"].default_value = 10
                nz.noise_dimensions = "4D"
                nz.inputs["W"].default_value = seed
                l_.new(geo.outputs["Position"], nz.inputs["Vector"])
                g1 = n.new("ShaderNodeMath"); g1.operation = "MULTIPLY"
                l_.new(low.outputs["Result"], g1.inputs[0]); l_.new(nz.outputs["Fac"], g1.inputs[1])
                # vertical streaks: noise stretched along Z
                mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (60, 60, 1.5)
                l_.new(geo.outputs["Position"], mp.inputs["Vector"])
                st = n.new("ShaderNodeTexNoise"); st.inputs["Scale"].default_value = 1.0; st.inputs["Detail"].default_value = 4
                l_.new(mp.outputs["Vector"], st.inputs["Vector"])
                sr = n.new("ShaderNodeMapRange"); sr.inputs["From Min"].default_value = 0.55; sr.inputs["From Max"].default_value = 0.75
                sr.inputs["To Max"].default_value = 0.35
                l_.new(st.outputs["Fac"], sr.inputs["Value"])
                tot = n.new("ShaderNodeMath"); tot.operation = "ADD"; tot.use_clamp = True
                l_.new(g1.outputs["Value"], tot.inputs[0]); l_.new(sr.outputs["Result"], tot.inputs[1])
                k = n.new("ShaderNodeMath"); k.operation = "MULTIPLY"; k.inputs[1].default_value = 0.22 * amount
                l_.new(tot.outputs["Value"], k.inputs[0])
                mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MIX"
                mix.inputs["A"].default_value = base
                mix.inputs["B"].default_value = (base[0] * 0.55, base[1] * 0.52, base[2] * 0.48, 1)
                l_.new(k.outputs["Value"], mix.inputs["Factor"])
                l_.new(mix.outputs["Result"], p.inputs["Base Color"])
                # dust settling on up-facing surfaces (the lids' tops, the base band's ledge)
                up = n.new("ShaderNodeSeparateXYZ")
                l_.new(geo.outputs["Normal"], up.inputs["Vector"])
                upm = n.new("ShaderNodeMapRange"); upm.inputs["From Min"].default_value = 0.5; upm.inputs["From Max"].default_value = 0.95
                upm.inputs["To Max"].default_value = 0.18 * amount
                l_.new(up.outputs["Z"], upm.inputs["Value"])
                dn = n.new("ShaderNodeTexNoise"); dn.inputs["Scale"].default_value = 6.0; dn.inputs["Detail"].default_value = 8
                l_.new(geo.outputs["Position"], dn.inputs["Vector"])
                dm = n.new("ShaderNodeMath"); dm.operation = "MULTIPLY"
                l_.new(upm.outputs["Result"], dm.inputs[0]); l_.new(dn.outputs["Fac"], dm.inputs[1])
                mix2 = n.new("ShaderNodeMix"); mix2.data_type = "RGBA"; mix2.blend_type = "MIX"
                l_.new(mix.outputs["Result"], mix2.inputs["A"])
                mix2.inputs["B"].default_value = (0.42, 0.38, 0.32, 1)
                l_.new(dm.outputs["Value"], mix2.inputs["Factor"])
                l_.new(mix2.outputs["Result"], p.inputs["Base Color"])
                # orange-peel moulding texture and a slightly uneven sheen
                op = n.new("ShaderNodeTexNoise"); op.inputs["Scale"].default_value = 420.0; op.inputs["Detail"].default_value = 2
                l_.new(geo.outputs["Position"], op.inputs["Vector"])
                bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.04; bump.inputs["Distance"].default_value = 0.0005
                l_.new(op.outputs["Fac"], bump.inputs["Height"])
                old_n = [lk for lk in nt.links if lk.to_node == p and lk.to_socket.name == "Normal"]
                if old_n:
                    l_.new(old_n[0].from_socket, bump.inputs["Normal"])
                    nt.links.remove(old_n[0])
                l_.new(bump.outputs["Normal"], p.inputs["Normal"])
                rn = n.new("ShaderNodeTexNoise"); rn.inputs["Scale"].default_value = 2.5; rn.inputs["Detail"].default_value = 4
                l_.new(geo.outputs["Position"], rn.inputs["Vector"])
                r0 = min(0.6, p.inputs["Roughness"].default_value + 0.06)
                rm = n.new("ShaderNodeMapRange"); rm.inputs["To Min"].default_value = r0 - 0.06; rm.inputs["To Max"].default_value = r0 + 0.1
                l_.new(rn.outputs["Fac"], rm.inputs["Value"])
                l_.new(rm.outputs["Result"], p.inputs["Roughness"])
                done[m.name] = w
            o.data.materials[i] = done[m.name]


def look(s, wb=(1.0, 1.0, 1.0), split=0.0, gamma=1.0):
    """White balance (a multiply in display space), a split tone (cool shadows, warm highlights, by `split`)
    and a midtone gamma, before h1lib.grade's camera finish."""
    s = np.clip(s[..., :3] * np.array(wb, np.float32), 0, None)
    if gamma != 1.0:
        s = np.power(np.clip(s, 0, None), gamma)
    if split:
        lum = np.clip(s @ L.LUM, 0, 1)[..., None]
        cool = np.array((0.94, 0.99, 1.09), np.float32)
        warm = np.array((1.06, 1.0, 0.92), np.float32)
        tint = cool * (1 - lum) + warm * lum
        s = s * (1 + (tint - 1) * split)
    return s


def plate_crop(path, crop, size):
    """The plate's crop resampled to the render's size with a Lanczos filter (the plates are 4-7x the preview
    width and up to 3x the master width, so plain bilinear sampling would alias the paving and louvres)."""
    from PIL import Image
    im = Image.open(path).convert("RGB")
    if crop:
        im = im.crop(tuple(int(v) for v in crop))
    if im.size != tuple(size):
        im = im.resize(tuple(size), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0


def composite(path, crop, render_exr, wet_mask=None, wet_k=0.5, refl=None, refl_k=0.0, refl_blur=0.0):
    """Render over the linearised plate (optionally darkened under a wet mask and carrying a mirror pass)."""
    from plate import srgb_to_lin, lin_to_srgb, apply_wet
    r = L.load_px(render_exr)
    pl_lin = srgb_to_lin(plate_crop(path, crop, (r.shape[1], r.shape[0])))
    if wet_mask:
        pl_lin = apply_wet(pl_lin, L.load_px(wet_mask)[..., 0], wet_k)
    if refl:
        rf = L.load_px(refl)
        if refl_blur > 0:
            rf = np.concatenate([L.gblur(rf[..., :3], refl_blur), L.gblur(rf[..., 3:4], refl_blur)], -1)
        pl_lin = pl_lin * (1 - refl_k * rf[..., 3:4]) + refl_k * rf[..., :3]
    a = r[..., 3:4]
    return lin_to_srgb(r[..., :3] + (1 - a) * pl_lin)
