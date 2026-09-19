"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import { zones, type ZoneId } from "@/content/software";
import { BAYS_E, BAYS_N, D, FLOORS, H, PANELS, PARAPET_H, RECESS, ROOF_Y, W, debrisAt, faceFrame, zoneOutline, type Face } from "./layout";
import { PALETTE, heatTexture, makeDebrisMaterial, makeGlassMaterial, makePointsMaterial, washTexture } from "./materials";
import type { SceneControl } from "./control";

export type Fade = { scan: number; wash: number; debris: number; zones: number };
/** Scene time in ms and the last step in seconds, from the capture-aware clock. */
export type Clock = { t: number; dt: number };

const SCAN_MS = 4200;
const SCAN_TOP = ROOF_Y + PARAPET_H + 2.4;
const SWEEP = 0.018;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Points on every surface the scan would see: glass, slab bands, parapet, roof. */
function buildPointCloud(): Float32Array {
  const rnd = seeded(7);
  const pts: number[] = [];
  for (const p of PANELS) {
    const n = Math.max(4, Math.round(p.width * p.height * 2.4));
    const f = faceFrame(p.face);
    for (let i = 0; i < n; i++) {
      const du = (rnd() - 0.5) * p.width;
      const dv = (rnd() - 0.5) * p.height;
      if (p.face === "R") pts.push(p.centre.x + du, p.centre.y + 0.05, p.centre.z + dv);
      else {
        const v = p.centre.clone().addScaledVector(f.along, du).addScaledVector(f.normal, 0.04);
        pts.push(v.x, p.centre.y + dv, v.z);
      }
    }
  }
  for (const face of ["N", "E", "S", "W"] as Face[]) {
    const f = faceFrame(face);
    for (let k = 0; k <= FLOORS; k++) {
      const y0 = k * 3.2;
      for (let u = 0.2; u < f.length; u += 0.45) {
        const v = f.origin.clone().addScaledVector(f.along, u).addScaledVector(f.normal, 0.03);
        pts.push(v.x, y0 + 0.1 + rnd() * 0.35, v.z);
      }
    }
    for (let u = 0.15; u < f.length; u += 0.3) {
      const v = f.origin.clone().addScaledVector(f.along, u).addScaledVector(f.normal, 0.03);
      pts.push(v.x, ROOF_Y + rnd() * PARAPET_H, v.z);
    }
  }
  for (let x = -W / 2; x < W / 2; x += 0.6) for (let z = -D / 2; z < D / 2; z += 0.6) pts.push(x + rnd() * 0.3, ROOF_Y + 0.04, z + rnd() * 0.3);
  return new Float32Array(pts);
}

type LineRef = Line2 | LineSegments2;

export function Building({ controlRef, clockRef, fadeRef }: { controlRef: RefObject<SceneControl>; clockRef: RefObject<Clock>; fadeRef: RefObject<Fade> }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const glass = useRef<THREE.InstancedMesh>(null);
  const points = useRef<THREE.Points>(null);
  const overlayMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const scanPlane = useRef<THREE.Mesh>(null);
  const lines = useRef<Partial<Record<ZoneId, LineRef | null>>>({});
  const hovered = useRef(-1);
  const glassMaterial = useMemo(() => makeGlassMaterial(), []);
  const state = useMemo(() => {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(PANELS.length * 4), 4);
    a.setUsage(THREE.DynamicDrawUsage);
    return a;
  }, []);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.setAttribute("aState", state);
    return g;
  }, [state]);
  const pointsMaterial = useMemo(() => makePointsMaterial(dpr), [dpr]);
  const cloud = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(buildPointCloud(), 3));
    return g;
  }, []);
  const overlays = useMemo(() => {
    const make = (face: "N" | "E") => {
      const f = faceFrame(face);
      const bays = face === "N" ? BAYS_N : BAYS_E;
      const heat = heatTexture((u, v) => debrisAt(face, u, v), f.length, H);
      const wash = washTexture({ cols: bays, rows: FLOORS, at: (col, row) => PANELS.find((p) => p.face === face && p.floor === row && p.bay === col)?.washAt ?? [] });
      const material = makeDebrisMaterial(heat, wash);
      const centre = f.origin.clone().addScaledVector(f.along, f.length / 2).addScaledVector(f.normal, -RECESS + 0.03);
      centre.y = H / 2;
      return { material, position: centre, rotationY: f.rotationY, size: [f.length, H] as [number, number] };
    };
    return [make("N"), make("E")];
  }, []);
  const outlines = useMemo(() => zones.map((z) => ({ id: z.id, points: zoneOutline(z.id) })), []);

  useLayoutEffect(() => {
    const m = glass.current;
    if (!m) return;
    const o = new THREE.Object3D();
    PANELS.forEach((p, i) => {
      o.position.copy(p.centre);
      if (p.face === "R") {
        o.position.y += 0.03;
        o.rotation.set(-Math.PI / 2, 0, 0);
      } else o.rotation.set(0, p.rotationY, 0);
      o.scale.set(p.width, p.height, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, []);

  useFrame(() => {
    const m = glass.current;
    const cloudMaterial = points.current?.material as THREE.ShaderMaterial | undefined;
    if (!m || !cloudMaterial) return;
    const control = controlRef.current;
    const { t, dt } = clockRef.current;
    const f = fadeRef.current;
    const L = control.layers;
    const ease = (v: number, on: boolean) => THREE.MathUtils.clamp(v + (on ? 1 : -1) * dt * 3.2, 0, 1);
    f.scan = ease(f.scan, L.scan);
    f.wash = ease(f.wash, L.wash);
    f.debris = ease(f.debris, L.debris);
    f.zones = ease(f.zones, L.zones);

    const scanU = L.scan && control.scanStartedAt !== null ? THREE.MathUtils.clamp((t - control.scanStartedAt) / SCAN_MS, 0, 1) : 0;
    const scanY = -0.6 + scanU * (SCAN_TOP + 0.6);
    const p = control.wash * f.wash;
    const attr = m.geometry.getAttribute("aState") as THREE.InstancedBufferAttribute;
    const arr = attr.array as Float32Array;
    let completed = 0;
    let total = 0;
    for (let i = 0; i < PANELS.length; i++) {
      const panel = PANELS[i];
      let washed = 0;
      let sweep = 0;
      if (panel.washAt.length) {
        total++;
        for (const w of panel.washAt) {
          if (p >= w) {
            washed += 1 / panel.washAt.length;
            const s = (p - w) / SWEEP;
            if (s < 1) sweep = 1 - s;
          }
        }
      }
      if (washed >= 0.999) completed++;
      const scanned = f.scan * (scanU >= 1 ? 1 : panel.centre.y < scanY ? 1 : 0);
      const j = i * 4;
      arr[j] = washed;
      arr[j + 1] = sweep;
      arr[j + 2] = scanned;
      arr[j + 3] = hovered.current === i ? 1 : 0;
    }
    attr.needsUpdate = true;
    control.stats.completed = completed;
    control.stats.total = total;

    for (const mesh of overlayMeshes.current) {
      const u = (mesh?.material as THREE.ShaderMaterial | undefined)?.uniforms;
      if (!u) continue;
      u.uProgress.value = p;
      u.uOpacity.value = f.debris;
    }
    cloudMaterial.uniforms.uScanY.value = scanU >= 1 ? SCAN_TOP + 1 : scanY;
    cloudMaterial.uniforms.uOpacity.value = f.scan * 0.9;
    if (scanPlane.current) {
      scanPlane.current.visible = L.scan && scanU > 0 && scanU < 1;
      scanPlane.current.position.y = scanY;
    }
    for (const z of zones) {
      const line = lines.current[z.id];
      if (!line) continue;
      const sel = control.selected === z.id;
      line.visible = f.zones > 0.01;
      line.material.opacity = f.zones * (sel ? 1 : control.selected ? 0.3 : 0.6);
      line.material.linewidth = sel ? 2 : 1;
    }
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const control = controlRef.current;
    const id = e.instanceId ?? -1;
    if (id === hovered.current) return;
    hovered.current = id;
    const panel = PANELS[id];
    if (!panel) return control.onHover(null, 0, 0);
    const zone = zones.find((z) => z.id === panel.zone);
    control.onHover(
      zone ? { zone: zone.name, surface: zone.surface, pressure: zone.pressure, lastWashed: panel.lastWashed, debris: panel.debris } : { zone: "Not in this plan", surface: "Curtain wall glass", pressure: "None", lastWashed: panel.lastWashed, debris: 0 },
      e.nativeEvent.clientX,
      e.nativeEvent.clientY,
    );
    control.requestFrame();
  };
  const onOut = () => {
    if (hovered.current === -1) return;
    hovered.current = -1;
    controlRef.current.onHover(null, 0, 0);
    controlRef.current.requestFrame();
  };

  return (
    <group>
      <instancedMesh ref={glass} args={[geometry, glassMaterial, PANELS.length]} onPointerMove={onMove} onPointerOut={onOut} />
      {overlays.map((o, i) => (
        <mesh
          key={i}
          ref={(el) => {
            overlayMeshes.current[i] = el;
          }}
          position={o.position}
          rotation={[0, o.rotationY, 0]}
          material={o.material}
          renderOrder={2}
        >
          <planeGeometry args={o.size} />
        </mesh>
      ))}
      <points ref={points} geometry={cloud} material={pointsMaterial} renderOrder={3} frustumCulled={false} />
      <mesh ref={scanPlane} position={[0, -1, 0]} renderOrder={4} visible={false}>
        <boxGeometry args={[W + 5, 0.07, D + 5]} />
        <meshBasicMaterial color={PALETTE.glassOnDark} transparent opacity={0.65} depthWrite={false} toneMapped={false} />
      </mesh>
      {outlines.map((o) => (
        <Line
          key={o.id}
          ref={(el: LineRef | null) => {
            if (el) el.visible = false;
            lines.current[o.id] = el;
          }}
          points={o.points}
          color={PALETTE.glass}
          lineWidth={1}
          transparent
          opacity={0}
          depthTest={false}
          renderOrder={5}
        />
      ))}
    </group>
  );
}
