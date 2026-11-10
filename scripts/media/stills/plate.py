"""Compositing the H1 into a real photograph (a CC0 backplate): the camera matched to the plate (EXIF focal
length, full-frame sensor, its height, pitch, yaw and roll), proxies for every surface the drone or its water
touches as shadow catchers, the CG rendered with a transparent film in linear light, then laid over the
linearised plate and encoded back to sRGB. A crop of the plate is rendered with Cycles' border, so a 36 MP
plate can be framed tight (a longer lens, in effect) at full sharpness."""
import math
import os

import bpy
import numpy as np
from mathutils import Euler, Vector

import h1lib as L


def srgb_to_lin(a):
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(a):
    a = np.clip(a, 0, None)
    return np.where(a <= 0.0031308, a * 12.92, 1.055 * np.power(a, 1 / 2.4) - 0.055)


class Plate:
    def __init__(self, path, focal, sensor=35.9, size=None, h=1.6, pitch=0.0, yaw=90.0, roll=0.0, crop=None, scale=1.0):
        """size: plate pixels (w, h). The camera stands at (0, 0, h) looking along yaw (degrees from +X),
        pitched up by pitch, rolled by roll. crop: (x0, y0, x1, y1) in plate pixels, top-left origin."""
        self.path, self.focal, self.sensor = path, focal, sensor
        self.W, self.H = size
        self.h, self.pitch, self.yaw, self.roll = h, pitch, yaw, roll
        self.crop, self.scale = crop, scale

    def setup(self, transparent=True):
        sc = bpy.context.scene
        sc.render.resolution_x = int(self.W * self.scale)
        sc.render.resolution_y = int(self.H * self.scale)
        sc.render.resolution_percentage = 100
        sc.render.film_transparent = transparent
        if self.crop:
            x0, y0, x1, y1 = self.crop
            sc.render.use_border = True
            sc.render.use_crop_to_border = True
            sc.render.border_min_x, sc.render.border_max_x = x0 / self.W, x1 / self.W
            sc.render.border_min_y, sc.render.border_max_y = 1 - y1 / self.H, 1 - y0 / self.H
        cd = bpy.data.cameras.new("plate cam")
        cd.lens = self.focal
        cd.sensor_fit = "HORIZONTAL"
        cd.sensor_width = self.sensor
        co = bpy.data.objects.new("plate cam", cd)
        sc.collection.objects.link(co)
        co.location = (0, 0, self.h)
        # Blender camera looks down -Z: rotate X by 90 to look along +Y, then yaw about Z
        co.rotation_euler = Euler((math.radians(90 + self.pitch), math.radians(self.roll), math.radians(self.yaw - 90)), "XYZ")
        sc.camera = co
        self.cam = co
        bpy.context.view_layer.update()
        return co

    def ray_to_ground(self, px, py, z=0.0):
        """The world point where the ray through plate pixel (px, py) meets the plane at height z."""
        fpx = self.focal / self.sensor * self.W
        d_cam = Vector(((px - self.W / 2) / fpx, -(py - self.H / 2) / fpx, -1.0))
        d = (self.cam.matrix_world.to_3x3() @ d_cam).normalized()
        o = self.cam.matrix_world.translation
        t = (z - o.z) / d.z
        return o + d * t

    def ray_at_distance(self, px, py, dist):
        fpx = self.focal / self.sensor * self.W
        d_cam = Vector(((px - self.W / 2) / fpx, -(py - self.H / 2) / fpx, -1.0))
        d = (self.cam.matrix_world.to_3x3() @ d_cam).normalized()
        return self.cam.matrix_world.translation + d * dist

    def composite(self, render_exr, out_path, grade=None, preview_scale=None, wet_mask=None, wet_k=0.55, patch=None):
        """render over plate in linear light; grade(a) is an optional finishing function on sRGB values.
        patch=(x0, y0, x1, y1, dx, dy): retouch a plate region (a sign) with the pixels offset by (dx, dy)."""
        r = L.load_px(render_exr)  # RGBA linear, premultiplied
        plate = load_plate(self.path)
        if patch:
            x0, y0, x1, y1, dx, dy = patch
            src = plate[y0 + dy:y1 + dy, x0 + dx:x1 + dx].copy()
            # feather the patch edges over 12 px
            h_, w_ = src.shape[:2]
            fy = np.minimum(np.arange(h_), np.arange(h_)[::-1])[:, None]; fx = np.minimum(np.arange(w_), np.arange(w_)[::-1])[None, :]
            a_ = np.clip(np.minimum(fy, fx) / 12.0, 0, 1)[..., None]
            plate[y0:y1, x0:x1] = plate[y0:y1, x0:x1] * (1 - a_) + src * a_
        if self.crop:
            x0, y0, x1, y1 = self.crop
            plate = plate[y0:y1, x0:x1]
        if plate.shape[:2] != r.shape[:2]:
            plate = resize(plate, r.shape[1], r.shape[0])
        pl = srgb_to_lin(plate[..., :3])
        if wet_mask:
            wm = L.load_px(wet_mask)[..., 0]
            pl = apply_wet(pl, wm, wet_k)
        a = r[..., 3:4]
        out = r[..., :3] + (1 - a) * pl
        s = lin_to_srgb(out)
        if grade:
            s = grade(s)
        L.save_px(s, out_path, quality=93)
        return s


def load_plate(path):
    img = bpy.data.images.load(path, check_existing=False)
    img.colorspace_settings.name = "Non-Color"
    w, h = img.size
    a = np.empty(w * h * img.channels, np.float32)
    img.pixels.foreach_get(a)
    a = a.reshape(h, w, img.channels)[::-1].copy()
    bpy.data.images.remove(img)
    return a


def resize(a, w, h):
    ys = np.linspace(0, a.shape[0] - 1, h)
    xs = np.linspace(0, a.shape[1] - 1, w)
    y0 = np.floor(ys).astype(int); x0 = np.floor(xs).astype(int)
    y1 = np.minimum(y0 + 1, a.shape[0] - 1); x1 = np.minimum(x0 + 1, a.shape[1] - 1)
    fy = (ys - y0)[:, None, None]; fx = (xs - x0)[None, :, None]
    return (a[y0][:, x0] * (1 - fx) * (1 - fy) + a[y0][:, x1] * fx * (1 - fy) + a[y1][:, x0] * (1 - fx) * fy + a[y1][:, x1] * fx * fy)


def linear_output():
    """Render linear light to EXR so it can be laid over the linearised plate."""
    sc = bpy.context.scene
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.image_settings.file_format = "OPEN_EXR"
    sc.render.image_settings.color_depth = "16"
    sc.render.image_settings.color_mode = "RGBA"


def emit(name, col, strength=4.0):
    return L.mat(name, col, 0.5, **{"Emission Color": (*col, 1), "Emission Strength": strength})


def bar(a, b, w, m):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(radius=w, depth=d.length, location=(a + b) / 2, vertices=6)
    o = bpy.context.active_object
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def grid_ground(z, x_range, y_range, step=1.0, col=(1, 0.2, 0.05), w=0.01):
    m = emit("grid ground", col)
    for x in np.arange(x_range[0], x_range[1] + 1e-6, step):
        bar((x, y_range[0], z), (x, y_range[1], z), w, m)
    for y in np.arange(y_range[0], y_range[1] + 1e-6, step):
        bar((x_range[0], y, z), (x_range[1], y, z), w, m)


def grid_wall(origin, yaw_deg, u_range, w_range, step=0.5, col=(0.1, 0.7, 1), w=0.008):
    m = emit("grid wall", col)
    o = Vector(origin)
    u = Vector((math.cos(math.radians(yaw_deg)), math.sin(math.radians(yaw_deg)), 0))
    for uu in np.arange(u_range[0], u_range[1] + 1e-6, step):
        bar(o + u * uu + Vector((0, 0, w_range[0])), o + u * uu + Vector((0, 0, w_range[1])), w, m)
    for ww in np.arange(w_range[0], w_range[1] + 1e-6, step):
        bar(o + u * u_range[0] + Vector((0, 0, ww)), o + u * u_range[1] + Vector((0, 0, ww)), w, m)


def render_mask(mask_objs, path, samples=4):
    """A cheap second render: only the given objects, as white emission on black (their material's mix factor
    drives the value), so the composite can darken the plate's own pixels there (wet paving keeps its texture)."""
    sc = bpy.context.scene
    keep = set(mask_objs)
    hidden = []
    for o in sc.objects:
        if o.type in ("MESH", "CURVE", "FONT") and o not in keep and not o.hide_render:
            o.hide_render = True
            hidden.append(o)
    for o in mask_objs:
        m = o.data.materials[0]
        nt = m.node_tree
        mix = [n for n in nt.nodes if n.bl_idname == "ShaderNodeMixShader"][0]
        fac_link = mix.inputs["Fac"].links[0].from_socket
        em = nt.nodes.new("ShaderNodeEmission")
        nt.links.new(fac_link, em.inputs["Strength"])
        em.inputs["Color"].default_value = (1, 1, 1, 1)
        nt.links.new(em.outputs["Emission"], nt.nodes["Material Output"].inputs["Surface"])
    w = sc.world
    sc.world = None
    s0 = sc.cycles.samples
    sc.cycles.samples = samples
    sc.cycles.use_denoising = False
    sc.render.use_motion_blur = False
    sc.render.film_transparent = True
    L.render(path)
    sc.cycles.samples = s0
    sc.world = w


def apply_wet(plate_lin, mask, k=0.55, rgb=None):
    """Darken the plate where wet (wet masonry absorbs: albedo down by k at full wetness), sparing green
    (grass does not darken the same way), with a slight cool, glossy lift taken from the plate's own sky."""
    g = plate_lin
    green = np.clip((g[..., 1] - np.maximum(g[..., 0], g[..., 2])) / np.maximum(g[..., 1], 1e-4) * 3.0, 0, 1)
    m = np.clip(mask, 0, 1) * (1 - green)
    return g * (1 - k * m[..., None])
