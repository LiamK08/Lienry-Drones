"""Shared pieces for the site's stills: the owner's H1 in real, photographed settings.

Model space of the H1 file is millimetres: +X forward (the spray boom reaches x 770), rotors at (+-414, +-414, ~440),
skids at z -222, the top at z 537; the rear supply hose (P26) trails to x -1989.
Every still is a Cycles render of the H1 (and any proxy surfaces it touches) lit by a CC0 HDRI of the same place
as the CC0 photograph behind it, so the drone takes the light, shadows and reflections of the real setting.
"""
import bpy  # noqa: I001 (bpy first: it puts addon_utils on the path)
import addon_utils
import math
import os
import sys
import urllib.request

import numpy as np
from mathutils import Euler, Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
H1_FILE = os.environ.get(
    "DRONE", os.path.join(os.path.dirname(os.path.abspath(__file__)), "Lienry_H1_v3_Revision_B_Blender42.blend"))
HOSE = ("H1_P26_SupplyHose_1p8m", "H1_P26_Braid_-1", "H1_P26_Braid_1", "H1_P26_BlueBraidedSleeve")
MOTORS = ((414, 414), (-414, 414), (-414, -414), (414, -414))
LUM = np.array([0.2126, 0.7152, 0.0722], np.float32)


def fetch(url, name=None):
    """Download a CC0 asset once into stills/assets and return its path."""
    os.makedirs(ASSETS, exist_ok=True)
    dst = os.path.join(ASSETS, name or url.rsplit("/", 1)[-1])
    if os.path.exists(dst) and os.path.getsize(dst) > 1000:
        return dst
    print("downloading", url, flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "lienry-stills-render"})
    with urllib.request.urlopen(req, timeout=900) as r, open(dst + ".part", "wb") as fh:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            fh.write(chunk)
    os.replace(dst + ".part", dst)
    return dst


def reset(res=(2560, 1440), samples=256, adaptive=0.01, min_samples=32, transparent=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    addon_utils.enable("cycles", default_set=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    cy = sc.cycles
    cy.device = "CPU"
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = adaptive
    cy.adaptive_min_samples = min_samples
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    cy.max_bounces, cy.diffuse_bounces, cy.glossy_bounces = 12, 4, 6
    cy.transmission_bounces, cy.volume_bounces, cy.transparent_max_bounces = 12, 2, 16
    cy.caustics_reflective = cy.caustics_refractive = False
    cy.sample_clamp_indirect = 8.0
    cy.blur_glossy = 0.5
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = int(os.environ.get("PCT", "100"))
    sc.render.film_transparent = transparent
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "16"
    sc.render.threads_mode = "AUTO"
    return sc


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


def load_h1(loc=(0, 0, 0), rot_deg=(0, 0, 0), hose=False, spin=True, spin_deg=690.0, seed=3):
    """Append the H1, parent it to one root (metres, +X forward), and return the root.
    spin: the props turn about their motors over the shutter (needs motion blur on), as in flight."""
    sc = bpy.context.scene
    col = bpy.data.collections.new("H1")
    sc.collection.children.link(col)
    with bpy.data.libraries.load(H1_FILE, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n.startswith("H1_") and n != "H1_Notes_PartsAndAssumptions"]
    objs = [o for o in dst.objects if o is not None]
    for o in objs:
        col.objects.link(o)
        if o.type in ("FONT",) or "Dimension" in o.name or o.name.startswith("H1_Dim"):
            o.hide_render = True
    if not hose:
        for n in HOSE:
            o = bpy.data.objects.get(n)
            if o:
                o.hide_render = True
                o.hide_viewport = True
    root = bpy.data.objects.new("H1", None)
    col.objects.link(root)
    for o in objs:
        if o.parent is None:
            o.parent = root
    root.scale = (0.001, 0.001, 0.001)
    root.rotation_euler = Euler(tuple(math.radians(a) for a in rot_deg), "XYZ")
    root.location = Vector(loc)
    bpy.context.view_layer.update()
    if spin:
        import random
        rng = random.Random(seed)
        sc.frame_start = sc.frame_end = 1
        for k, (mx, my) in enumerate(MOTORS, start=1):
            piv = bpy.data.objects.new(f"prop pivot M{k}", None)
            col.objects.link(piv)
            piv.parent = root
            piv.location = (mx, my, 434)
            bpy.context.view_layer.update()
            turning = [x for x in objs if x.name == f"H1_P01_Motor_M{k}" or x.name.startswith((
                f"H1_P02_Prop_M{k}_", f"H1_P01_PropAdapter_M{k}", f"H1_P02_FoldingHub_M{k}", f"H1_P02_FoldPivot_M{k}_",
                f"H1_P01_AdapterBolt_M{k}_", f"H1_P01_CoolingSlot_M{k}_", f"H1_P01_MotorLabel_M{k}", f"H1_P01_RotationMark_M{k}"))]
            for o in turning:
                mw = o.matrix_world.copy()
                o.parent = piv
                o.matrix_world = mw
                o.cycles.motion_steps = 7
            sp = (1 if k % 2 else -1) * math.radians(spin_deg * (1.0, 1.014, 0.986, 1.021)[k - 1])
            start = rng.uniform(0, 2 * math.pi)
            piv.rotation_euler = (0, 0, start)
            drv = piv.driver_add("rotation_euler", 2).driver
            drv.type = "SCRIPTED"
            drv.expression = f"{start:.6f} + {sp:.6f} * (frame - 1)"
        sc.frame_set(1)
        sc.render.use_motion_blur = True
        sc.render.motion_blur_shutter = float(os.environ.get("SHUTTER", "0.5"))
        sc.render.motion_blur_position = "CENTER"
    return root


def model_to_world(root, p_mm):
    bpy.context.view_layer.update()
    return root.matrix_world @ Vector(p_mm)


def world_hdri(path, strength=1.0, rot_z_deg=0.0, visible=True, bg_strength=None):
    """The real place's light. visible=False keeps it for lighting and reflections only (a backplate is behind)."""
    w = bpy.data.worlds.new("world")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(rot_z_deg))
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(path, check_existing=True)
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    if bg_strength is not None or not visible:
        # camera rays see a different strength (or nothing) while everything else gets the full light
        lp = nt.nodes.new("ShaderNodeLightPath")
        bg2 = nt.nodes.new("ShaderNodeBackground")
        bg2.inputs["Strength"].default_value = 0.0 if not visible else bg_strength
        nt.links.new(env.outputs["Color"], bg2.inputs["Color"])
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
        nt.links.new(bg.outputs["Background"], mix.inputs[1])
        nt.links.new(bg2.outputs["Background"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    else:
        nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


def camera(loc, look_at, lens=50.0, sensor=36.0, fstop=None, focus=None, shift=(0.0, 0.0), roll_deg=0.0):
    sc = bpy.context.scene
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_width = sensor
    cd.shift_x, cd.shift_y = shift
    co = bpy.data.objects.new("cam", cd)
    sc.collection.objects.link(co)
    co.location = Vector(loc)
    d = Vector(look_at) - Vector(loc)
    co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    if roll_deg:
        co.rotation_euler.rotate_axis("Z", math.radians(roll_deg))
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = focus if focus else d.length
    sc.camera = co
    return co


def plane(name, size, loc, rot_deg=(0, 0, 0), material=None, catcher=False):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=tuple(math.radians(a) for a in rot_deg))
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[1], 1)
    if material:
        o.data.materials.append(material)
    if catcher:
        o.is_shadow_catcher = True
    return o


def sun(rot_deg, strength=3.0, angle_deg=0.53, color=(1, 1, 1)):
    ld = bpy.data.lights.new("sun", "SUN")
    ld.energy = strength
    ld.angle = math.radians(angle_deg)
    ld.color = color
    lo = bpy.data.objects.new("sun", ld)
    bpy.context.scene.collection.objects.link(lo)
    lo.rotation_euler = Euler(tuple(math.radians(a) for a in rot_deg), "XYZ")
    return lo


def render(path):
    sc = bpy.context.scene
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("rendered", path, flush=True)
    return path


# ---------------------------------------------------------------- loading, compositing and grading in numpy
def load_px(p, linear=False):
    img = bpy.data.images.load(p, check_existing=False)
    img.colorspace_settings.name = "Non-Color"
    w, h = img.size
    a = np.empty(w * h * img.channels, np.float32)
    img.pixels.foreach_get(a)
    a = a.reshape(h, w, img.channels)[::-1].copy()
    bpy.data.images.remove(img)
    return a


def save_px(a, p, quality=None):
    h, w = a.shape[:2]
    img = bpy.data.images.new("out", w, h, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"
    rgba = np.ones((h, w, 4), np.float32)
    rgba[..., :3] = np.clip(a[..., :3], 0, 1)
    img.pixels.foreach_set(rgba[::-1].ravel())
    img.filepath_raw = p
    img.file_format = "JPEG" if p.lower().endswith((".jpg", ".jpeg")) else "PNG"
    if quality:
        bpy.context.scene.render.image_settings.quality = quality
    img.save()
    bpy.data.images.remove(img)


def gblur(a, sigma):
    pad = int(3 * sigma) + 1
    ap = np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode="reflect")
    H, W = ap.shape[:2]
    fy = np.fft.fftfreq(H)[:, None]
    fx = np.fft.rfftfreq(W)[None, :]
    g = np.exp(-2 * np.pi ** 2 * sigma ** 2 * (fx ** 2 + fy ** 2))
    out = np.empty_like(ap)
    for c in range(ap.shape[2]):
        out[..., c] = np.fft.irfft2(np.fft.rfft2(ap[..., c]) * g, s=(H, W))
    return out[pad:-pad, pad:-pad]


def grade(a, seed=1, levels=(0.02, 0.92), sat=0.95, vignette=0.12, grain=1.0):
    """A camera's finish, gentler than the hero film's (stills sit on light pages): levels, faint glare, bloom,
    a soft S, slightly lower saturation, a light vignette, lens softness and fine grain."""
    H, W = a.shape[:2]
    lo, hi = levels
    a = np.clip((a[..., :3] - lo) / (hi - lo), 0, None)
    a = a * 0.985 + gblur(a, W / 20) * 0.015
    a = a + gblur(np.clip(a - 0.75, 0, None) / 0.25, W / 120) * 0.04
    a = 0.85 * a + 0.15 * (a * a * (3 - 2 * np.clip(a, 0, 1)))
    lum = (a @ LUM)[..., None]
    a = lum + (a - lum) * sat
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    a = a * (1 - vignette * r ** 2.2)[..., None].astype(np.float32)
    m = np.maximum(a.max(axis=-1, keepdims=True), 1e-6)
    K = 0.85
    ms = np.where(m > K, K + (1 - K) * (1 - np.exp(-(m - K) / (1 - K))), m)
    a = a * (ms / m)
    a = 0.8 * a + 0.2 * gblur(a, 0.5)
    rng = np.random.default_rng(seed)
    lum = np.clip(a @ LUM, 0, 1)
    g = rng.normal(0, 1, (H, W, 1)).astype(np.float32) * ((0.003 + 0.004 * (1 - lum)) * grain)[..., None]
    return np.clip(a + g, 0, 1)


# ---------------------------------------------------------------- the spray: a flat 25 degree fan from the boom's nozzle
NOZZLE_MM = (830, 0, 190)


def _icosphere():
    import bmesh
    b = bmesh.new()
    bmesh.ops.create_icosphere(b, subdivisions=1, radius=1.0)
    v = np.array([x.co[:] for x in b.verts], np.float64)
    f = np.array([[x.index for x in fc.verts] for fc in b.faces], np.int64)
    b.free()
    return v, f


def _track(d):
    return np.array(Vector(d).normalized().to_track_quat("Z", "Y").to_matrix(), np.float64)


def write_mesh(name, verts, faces, material):
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(verts))
    me.vertices.foreach_set("co", np.ascontiguousarray(verts, np.float32).ravel())
    nf, k = faces.shape
    me.loops.add(nf * k)
    me.loops.foreach_set("vertex_index", np.ascontiguousarray(faces, np.int32).ravel())
    me.polygons.add(nf)
    me.polygons.foreach_set("loop_start", (np.arange(nf) * k).astype(np.int32))
    me.update(calc_edges=True)
    me.validate(verbose=False)
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(material)
    return o


def water_streak_mat(fac=None, white=None):
    """Spray drops: clear water with a share of white scatter (aerated water in a fan reads silvery-white)."""
    white = float(os.environ.get("SPRAY_WHITE", "0.35")) if white is None else white
    fac = float(os.environ.get("SPRAY_CLEAR", "0.6")) if fac is None else fac
    m = bpy.data.materials.new("spray streak")
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    n.remove(n["Principled BSDF"])
    g = n.new("ShaderNodeBsdfGlass")
    g.inputs["IOR"].default_value = 1.33
    g.inputs["Roughness"].default_value = 0.05
    tl = n.new("ShaderNodeBsdfTranslucent")
    tl.inputs["Color"].default_value = (0.95, 0.97, 1.0, 1)
    gw = n.new("ShaderNodeMixShader")
    gw.inputs["Fac"].default_value = white
    l_.new(g.outputs["BSDF"], gw.inputs[1])
    l_.new(tl.outputs["BSDF"], gw.inputs[2])
    t = n.new("ShaderNodeBsdfTransparent")
    mx = n.new("ShaderNodeMixShader")
    mx.inputs["Fac"].default_value = fac
    l_.new(t.outputs["BSDF"], mx.inputs[1])
    l_.new(gw.outputs["Shader"], mx.inputs[2])
    l_.new(mx.outputs["Shader"], n["Material Output"].inputs["Surface"])
    return m


def spray(root, hit, normal, drops=2600, seed=7, half_deg=12.5, vel=25.0, splash=1.0, name="spray", nz=None):
    """The jet from the nozzle to a surface: hit is the point on the surface the fan's centre strikes, normal
    the surface's outward normal. Each drop is an icosphere stretched along its path over a 1/48 s exposure,
    thicker toward the surface where the sheet breaks up, with rebound and splash at the strike."""
    import random
    rng = random.Random(seed)
    nz = nozzle(root) if nz is None else Vector(nz)
    hit, normal = Vector(hit), Vector(normal).normalized()
    axis = (hit - nz).normalized()
    side = axis.cross(Vector((0, 0, 1)))
    side = side.normalized() if side.length > 1e-4 else Vector((1, 0, 0))
    up = side.cross(axis).normalized()
    L_ = (hit - nz).length
    half0 = L_ * math.tan(math.radians(half_deg))
    out = []
    for k in range(drops):
        t = rng.random() ** 0.35
        ang = math.radians(rng.uniform(-half_deg, half_deg))
        if k % 2 == 0:
            ang = math.radians(rng.choice((-1, 1)) * half_deg * (1 - rng.random() ** 4))
        spread = math.radians(rng.gauss(0, 1.2))
        d = (axis * math.cos(ang) + side * math.sin(ang) + up * math.sin(spread)).normalized()
        dist = L_ * t / max(0.2, math.cos(ang))
        p = nz + d * dist
        p.z -= 0.5 * 9.81 * (dist / vel) ** 2
        gap = (p - hit).dot(normal)  # height above the surface
        if gap < 0.004 + rng.uniform(0, 0.03):
            continue
        r = rng.uniform(0.0002, 0.0006) * float(os.environ.get("DROP_R", "1.0"))
        hl = min(r * rng.uniform(250, 700) * float(os.environ.get("STREAK", "1.0")), gap / max(1e-6, -d.dot(normal)) - 0.004, (p - nz).length)
        out.append((r, max(1.0, hl / r), _track(d), p[:]))
    # rebound off the strike, a shallow cone back out and down; and splash thrown along the surface
    t1 = normal.orthogonal().normalized()
    t2 = normal.cross(t1).normalized()
    for k in range(int(220 * splash)):
        th = math.radians(rng.uniform(0, 35))
        ph = rng.uniform(0, 2 * math.pi)
        d = (normal * math.cos(th) + (t1 * math.cos(ph) + t2 * math.sin(ph)) * math.sin(th) - Vector((0, 0, 0.35))).normalized()
        p = hit + side * rng.uniform(-half0, half0) + up * rng.gauss(0, 0.012) + d * rng.uniform(0.02, 0.16)
        out.append((rng.uniform(0.0003, 0.0008), rng.uniform(3, 8), _track(d), p[:]))
    for k in range(int(260 * splash)):
        a = rng.uniform(0, 2 * math.pi)
        d = (t1 * math.cos(a) + t2 * math.sin(a) * 0.8 + normal * 0.15 * rng.random()).normalized()
        if d.z > 0.2:
            d.z *= 0.3
        p = hit + side * rng.uniform(-half0, half0) + normal * rng.uniform(0.004, 0.025) + d * rng.uniform(0.02, 0.08)
        out.append((rng.uniform(0.0003, 0.0007), rng.uniform(12, 40), _track(d), p[:]))
    V, F = _icosphere()
    rad = np.array([o[0] for o in out])
    st = np.array([o[1] for o in out])
    rot = np.stack([o[2] for o in out])
    pos = np.array([o[3] for o in out])
    loc = V[None] * np.stack([rad, rad, rad * st], -1)[:, None, :]
    verts = np.einsum("nij,nvj->nvi", rot, loc) + pos[:, None, :]
    faces = F[None] + (np.arange(len(out)) * len(V))[:, None, None]
    o = write_mesh(name, verts.reshape(-1, 3), faces.reshape(-1, 3), water_streak_mat())
    o.visible_shadow = False
    return o, nz, half0


def wet_patch(center, normal, up, width, height, name="wet"):
    """The washed strip on a photographed surface: a thin water film (glossy, faintly darkening) over a shadow
    catcher, fading at its edges, so the photo shows through and reads wet."""
    import bmesh
    normal, up = Vector(normal).normalized(), Vector(up).normalized()
    side = up.cross(normal).normalized()
    up = normal.cross(side).normalized()
    b = bmesh.new()
    c = Vector(center) + normal * 0.002
    pts = [c + side * sx * width / 2 + up * sy * height / 2 for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    vs = [b.verts.new(p) for p in pts]
    fc = b.faces.new(vs)
    uv = b.loops.layers.uv.new()
    for lp, (u, v) in zip(fc.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = (u, v)
    me = bpy.data.meshes.new(name)
    b.to_mesh(me)
    b.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.02, 0.025, 0.03, 1)
    p.inputs["Roughness"].default_value = 0.04
    p.inputs["IOR"].default_value = 1.33
    p.inputs["Specular IOR Level"].default_value = 0.5
    # edge fade from the UVs, broken up with noise
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l_.new(tc.outputs["UV"], sep.inputs["Vector"])
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 9.0
    noise.inputs["Detail"].default_value = 8.0
    l_.new(tc.outputs["UV"], noise.inputs["Vector"])
    def edge(sock):
        a = n.new("ShaderNodeMath"); a.operation = "PINGPONG"; a.inputs[1].default_value = 0.5
        l_.new(sock, a.inputs[0])
        s = n.new("ShaderNodeMapRange"); s.inputs["From Min"].default_value = 0.0; s.inputs["From Max"].default_value = 0.3
        l_.new(a.outputs["Value"], s.inputs["Value"])
        return s.outputs["Result"]
    ex, ey = edge(sep.outputs["X"]), edge(sep.outputs["Y"])
    mul = n.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    l_.new(ex, mul.inputs[0]); l_.new(ey, mul.inputs[1])
    mul2 = n.new("ShaderNodeMath"); mul2.operation = "MULTIPLY"
    l_.new(mul.outputs["Value"], mul2.inputs[0]); l_.new(noise.outputs["Fac"], mul2.inputs[1])
    cl = n.new("ShaderNodeMapRange"); cl.inputs["From Min"].default_value = 0.3; cl.inputs["From Max"].default_value = 0.55
    l_.new(mul2.outputs["Value"], cl.inputs["Value"])
    # mostly clear: the photo shows through; the film adds a glossy sheen, runnels and a little darkening
    tr = n.new("ShaderNodeBsdfTransparent")
    gl = n.new("ShaderNodeBsdfGlossy"); gl.inputs["Roughness"].default_value = 0.06
    runm = n.new("ShaderNodeMapping"); runm.inputs["Scale"].default_value = (14, 1.2, 1)
    l_.new(tc.outputs["UV"], runm.inputs["Vector"])
    runs = n.new("ShaderNodeTexNoise"); runs.inputs["Scale"].default_value = 3.0; runs.inputs["Detail"].default_value = 6
    l_.new(runm.outputs["Vector"], runs.inputs["Vector"])
    rk = n.new("ShaderNodeMapRange"); rk.inputs["From Min"].default_value = 0.45; rk.inputs["From Max"].default_value = 0.7
    rk.inputs["To Min"].default_value = 0.03; rk.inputs["To Max"].default_value = float(os.environ.get("WET_GLOSS", "0.22"))
    l_.new(runs.outputs["Fac"], rk.inputs["Value"])
    amt = n.new("ShaderNodeMath"); amt.operation = "MULTIPLY"
    l_.new(cl.outputs["Result"], amt.inputs[0]); l_.new(rk.outputs["Result"], amt.inputs[1])
    mx = n.new("ShaderNodeMixShader")
    l_.new(amt.outputs["Value"], mx.inputs["Fac"])
    l_.new(tr.outputs["BSDF"], mx.inputs[1])
    l_.new(gl.outputs["BSDF"], mx.inputs[2])
    l_.new(mx.outputs["Shader"], n["Material Output"].inputs["Surface"])
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def mist(center, normal, side, half_w, n=5000, seed=9, name="mist"):
    """Fine droplets hanging round the strike: a flattened cloud along the fan's line, thickest at the glass."""
    import random
    rng = random.Random(seed)
    normal, side = Vector(normal).normalized(), Vector(side).normalized()
    up = normal.cross(side).normalized()
    out = []
    for k in range(n):
        s = rng.uniform(-1.2, 1.2) * half_w
        h = abs(rng.gauss(0, 0.05)) + 0.004
        u_ = rng.gauss(0, 0.05)
        p = Vector(center) + side * s + normal * h + up * u_
        r = rng.uniform(0.00008, 0.00025)
        d = (normal * rng.uniform(-0.3, 1) + side * rng.uniform(-1, 1) + up * rng.uniform(-1, 0.4)).normalized()
        out.append((r, rng.uniform(1.0, 6.0), _track(d), p[:]))
    V, F = _icosphere()
    rad = np.array([o[0] for o in out]); st = np.array([o[1] for o in out])
    rot = np.stack([o[2] for o in out]); pos = np.array([o[3] for o in out])
    loc = V[None] * np.stack([rad, rad, rad * st], -1)[:, None, :]
    verts = np.einsum("nij,nvj->nvi", rot, loc) + pos[:, None, :]
    faces = F[None] + (np.arange(len(out)) * len(V))[:, None, None]
    o = write_mesh(name, verts.reshape(-1, 3), faces.reshape(-1, 3), water_streak_mat(0.45))
    o.visible_shadow = False
    return o


SWIVEL_MM = (-320, 0, 315)


def tether(root, end, sag=0.6, radius=0.007, name="tether"):
    """The supply hose from the rear swivel to end (a roof parapet, a feed point), hanging in a slack curve:
    out of the swivel along the model's stub, dipping under its own weight, then up (or along) to the end."""
    start = model_to_world(root, SWIVEL_MM)
    stub = (model_to_world(root, (-366, 9, 276)) - start).normalized()
    end = Vector(end)
    d = end - start
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 6
    cu.resolution_u = 64
    sp = cu.splines.new("BEZIER")
    if d.z > 0.5 * d.length:
        # fed from above (a roof parapet): the hose rises from the swivel toward the feed in a shallow bow
        # under its own weight, never dipping below the drone first
        side = Vector((d.x, d.y, 0))
        side = side.normalized() if side.length > 1e-6 else Vector((1, 0, 0))
        mid = start + d * 0.5 + side * (sag * 0.35) + Vector((0, 0, -sag * 0.2))
        pts = [(start, d * 0.12), (mid, d * 0.22), (end, d * 0.12)]
    else:
        mid1 = start + stub * 0.35 + Vector((0, 0, -sag))
        mid2 = start + d * 0.45 + Vector((0, 0, -sag * 0.35))
        pts = [(start, stub * 0.15), (mid1, (d.normalized() * 0.3 + Vector((0, 0, 0.0)))), (mid2, d * 0.18), (end, d.normalized() * 0.5)]
    sp.bezier_points.add(len(pts) - 1)
    for bp, (co, hd) in zip(sp.bezier_points, pts):
        bp.co = co
        bp.handle_left = co - hd
        bp.handle_right = co + hd
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat("tether jacket", (0.05, 0.054, 0.058), 0.3, **{"Coat Weight": 0.5, "Coat Roughness": 0.1}))
    sl = cu.copy()
    sl.bevel_depth = radius * 1.3
    so = bpy.data.objects.new(name + " sleeve", sl)
    so.data.materials.clear()
    so.data.materials.append(bpy.data.materials.get("Lienry • blue accent") or mat("blue sleeve", (0.1, 0.35, 0.6), 0.4))
    so.data.bevel_factor_mapping_end = "SPLINE"
    so.data.bevel_factor_end = min(1.0, 0.3 / max(0.3, d.length))
    bpy.context.scene.collection.objects.link(so)
    return o


TILT_PIVOT_MM = (250, 0, 190)
_TILT = {"deg": 0.0}


def set_tilt(deg):
    """Tilt the lance on its gimbal (the owner's convention: positive up, negative down; down is unlimited
    within +-30 degrees of pan)."""
    o = bpy.data.objects.get("H1_Gimbal_TiltPivot")
    if o is None:
        raise RuntimeError("no tilt pivot in the model")
    o.rotation_euler.y = -math.radians(deg)
    _TILT["deg"] = deg
    bpy.context.view_layer.update()


def _tilted_mm(p):
    a = -math.radians(_TILT["deg"])
    cx, cy, cz = TILT_PIVOT_MM
    x, y, z = p[0] - cx, p[1] - cy, p[2] - cz
    return (cx + x * math.cos(a) + z * math.sin(a), y + cy, cz - x * math.sin(a) + z * math.cos(a))


def nozzle(root):
    return model_to_world(root, _tilted_mm(NOZZLE_MM))


def lance_dir(root):
    a = model_to_world(root, _tilted_mm((830, 0, 190)))
    b = model_to_world(root, _tilted_mm((930, 0, 190)))
    return (b - a).normalized()


def wet_ground(center, length, width, heading_deg, strength=0.55, name="wet ground"):
    """A washed lane on photographed paving: darker (wet bricks absorb), glossier, ragged at its edges, as a
    semi-transparent film laid over the plate. heading: the lane's direction in degrees from +X."""
    import bmesh
    h = math.radians(heading_deg)
    u = Vector((math.cos(h), math.sin(h), 0)); v = Vector((-u.y, u.x, 0))
    c = Vector(center) + Vector((0, 0, 0.003))
    b = bmesh.new()
    pts = [c - u * length / 2 - v * width / 2, c + u * length / 2 - v * width / 2, c + u * length / 2 + v * width / 2, c - u * length / 2 + v * width / 2]
    fc = b.faces.new([b.verts.new(p) for p in pts])
    uvl = b.loops.layers.uv.new()
    for lp, uvv in zip(fc.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uvl].uv = uvv
    me = bpy.data.meshes.new(name); b.to_mesh(me); b.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    m = bpy.data.materials.new(name); m.use_nodes = True
    n, l_ = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.012, 0.012, 0.013, 1)
    p.inputs["Roughness"].default_value = float(os.environ.get("WET_ROUGH", "0.35"))
    p.inputs["Specular IOR Level"].default_value = float(os.environ.get("WET_SPEC", "0.12"))
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l_.new(tc.outputs["UV"], sep.inputs["Vector"])
    nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 6.0; nz.inputs["Detail"].default_value = 8
    l_.new(tc.outputs["UV"], nz.inputs["Vector"])
    def edge(s, w):
        a = n.new("ShaderNodeMath"); a.operation = "PINGPONG"; a.inputs[1].default_value = 0.5; l_.new(s, a.inputs[0])
        r = n.new("ShaderNodeMapRange"); r.inputs["From Max"].default_value = w; l_.new(a.outputs["Value"], r.inputs["Value"])
        return r.outputs["Result"]
    mu = n.new("ShaderNodeMath"); mu.operation = "MULTIPLY"
    l_.new(edge(sep.outputs["X"], 0.06), mu.inputs[0]); l_.new(edge(sep.outputs["Y"], 0.25), mu.inputs[1])
    mu2 = n.new("ShaderNodeMath"); mu2.operation = "MULTIPLY"; l_.new(mu.outputs["Value"], mu2.inputs[0]); l_.new(nz.outputs["Fac"], mu2.inputs[1])
    cl = n.new("ShaderNodeMapRange"); cl.inputs["From Min"].default_value = 0.22; cl.inputs["From Max"].default_value = 0.4
    cl.inputs["To Max"].default_value = strength
    l_.new(mu2.outputs["Value"], cl.inputs["Value"])
    tr = n.new("ShaderNodeBsdfTransparent"); mx = n.new("ShaderNodeMixShader")
    l_.new(cl.outputs["Result"], mx.inputs["Fac"]); l_.new(tr.outputs["BSDF"], mx.inputs[1]); l_.new(p.outputs["BSDF"], mx.inputs[2])
    l_.new(mx.outputs["Shader"], n["Material Output"].inputs["Surface"])
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def wet_wall(center, normal, width, height, strength=1.0, name="wet wall"):
    """A wet streak on a photographed wall (render, brick): a vertical mask strip whose value darkens the plate
    in the composite (see plate.render_mask / apply_wet): full at the top where the jet strikes, running down in
    uneven fingers."""
    o = wet_ground(Vector((0, 0, 0)), height, width, 0.0, strength=strength, name=name)
    # stand it up: the strip's length (local x) runs down the wall from the strike, its width along the wall
    normal = Vector(normal).normalized()
    side = Vector((0, 0, 1)).cross(normal).normalized()
    m = Matrix.Identity(4)
    m.col[0][:3] = Vector((0, 0, -1))  # local +x (length) points down
    m.col[1][:3] = side
    m.col[2][:3] = normal
    m.col[3][:3] = Vector(center) + normal * 0.004 + Vector((0, 0, -height / 2))
    o.matrix_world = m
    return o
