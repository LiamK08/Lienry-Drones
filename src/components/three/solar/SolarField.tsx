"use client";

import { Line } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import { solarZones, type SolarZoneId } from "@/content/software";
import { COLS, LOW, NORMAL, PAD, PANELS, PANEL_GAP, PANEL_H, PANEL_ROTATION_X, PANEL_W, REEL, ROUTE, ROWS, ROW_LEN, SLOPE, TILT, UP, onTable, rowZ, soilingAt, zoneOutline } from "./layout";
import { PALETTE, heatTexture, makeDebrisMaterial, makeGroundMaterial, makePointsMaterial, makeSolarMaterial, surfaces, washTexture } from "../software/materials";
import type { SceneControl } from "../software/control";
import type { Clock, Fade } from "../software/Building";

const SCAN_MS = 4200;
const SCAN_FROM = -ROW_LEN / 2 - 1.2;
const SCAN_TO = Math.max(ROW_LEN / 2, PAD.x + PAD.w / 2) + 1.2;
const SWEEP = 0.018;

const box = new THREE.BoxGeometry(1, 1, 1);
const drum = new THREE.CylinderGeometry(0.34, 0.34, 0.62, 28);
const flange = new THREE.CylinderGeometry(0.4, 0.4, 0.03, 28);

/** Post stations along a row: every two modules, both ends included. */
const STATIONS = Array.from({ length: COLS / 2 + 1 }, (_, k) => Math.min(ROW_LEN - 0.05, Math.max(0.05, k * 2 * (PANEL_W + PANEL_GAP) - PANEL_GAP / 2)));
/** The rafters' and posts' places up the slope (front post, rear post), and the two rails'. */
const POST_V = [0.32, SLOPE - 0.32];
const RAIL_V = [SLOPE * 0.24, SLOPE * 0.76];
/** How far the steel sits under the glass, along the normal. */
const UNDER = 0.07;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Points on what the scan would see: every module's glass, the posts, the rails' ends and the pad. */
function buildPointCloud(): Float32Array {
  const rnd = seeded(11);
  const pts: number[] = [];
  const v = new THREE.Vector3();
  for (const p of PANELS) {
    const u0 = p.col * (PANEL_W + PANEL_GAP);
    const v0 = p.level * (PANEL_H + PANEL_GAP);
    for (let i = 0; i < 22; i++) {
      onTable(p.row, u0 + rnd() * PANEL_W, v0 + rnd() * PANEL_H, v).addScaledVector(NORMAL, 0.03);
      pts.push(v.x, v.y, v.z);
    }
  }
  for (let row = 0; row < ROWS; row++)
    for (const u of STATIONS)
      for (const pv of POST_V) {
        const top = onTable(row, u, pv).addScaledVector(NORMAL, -UNDER);
        for (let y = 0.05; y < top.y; y += 0.14) pts.push(top.x + (rnd() - 0.5) * 0.06, y, top.z + (rnd() - 0.5) * 0.06);
      }
  for (let x = PAD.x - PAD.w / 2; x < PAD.x + PAD.w / 2; x += 0.22) for (let z = PAD.z - PAD.d / 2; z < PAD.z + PAD.d / 2; z += 0.22) pts.push(x + rnd() * 0.1, PAD.h + 0.02, z + rnd() * 0.1);
  return new Float32Array(pts);
}

/** The steel under each table: posts at every station (front and rear), a rafter between each pair, two rails along the row. */
function Steel() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = ROWS * (STATIONS.length * 3 + RAIL_V.length);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    const put = () => {
      o.updateMatrix();
      m.setMatrixAt(i++, o.matrix);
    };
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    for (let row = 0; row < ROWS; row++) {
      for (const u of STATIONS) {
        for (const pv of POST_V) {
          const top = onTable(row, u, pv, a).addScaledVector(NORMAL, -UNDER - 0.08);
          o.position.set(top.x, top.y / 2, top.z);
          o.rotation.set(0, 0, 0);
          o.scale.set(0.1, top.y, 0.1);
          put();
        }
        // The rafter: a sloped beam from the front post's head to the rear post's.
        onTable(row, u, POST_V[0] - 0.2, a).addScaledVector(NORMAL, -UNDER - 0.06);
        onTable(row, u, POST_V[1] + 0.2, b).addScaledVector(NORMAL, -UNDER - 0.06);
        o.position.copy(a).add(b).multiplyScalar(0.5);
        o.rotation.set(PANEL_ROTATION_X, 0, 0);
        o.scale.set(0.07, a.distanceTo(b), 0.1);
        put();
      }
      for (const rv of RAIL_V) {
        onTable(row, ROW_LEN / 2, rv, a).addScaledVector(NORMAL, -UNDER + 0.005);
        o.position.copy(a);
        o.rotation.set(PANEL_ROTATION_X, 0, 0);
        o.scale.set(ROW_LEN + 0.3, 0.08, 0.06);
        put();
      }
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, []);
  return <instancedMesh ref={ref} args={[box, surfaces.galvanised, count]} />;
}

/** Each module's body under its glass: the frame's sides and the backsheet, 40mm deep. */
function Modules() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    PANELS.forEach((p, i) => {
      o.position.copy(p.centre).addScaledVector(NORMAL, -0.022);
      o.rotation.set(PANEL_ROTATION_X, 0, 0);
      o.scale.set(PANEL_W, PANEL_H, 0.04);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, []);
  return <instancedMesh ref={ref} args={[box, surfaces.module, PANELS.length]} />;
}

/** A string combiner box on a short post at each row's east end, where the row's cabling comes down. */
function Combiners() {
  return (
    <group>
      {Array.from({ length: ROWS }, (_, row) => {
        const x = ROW_LEN / 2 + 0.55;
        const z = rowZ(row) + 0.25;
        return (
          <group key={row}>
            <mesh geometry={box} material={surfaces.galvanised} position={[x, 0.45, z]} scale={[0.07, 0.9, 0.07]} />
            <mesh geometry={box} material={surfaces.shell} position={[x, 0.86, z + 0.09]} scale={[0.42, 0.5, 0.16]} />
            <mesh geometry={box} material={surfaces.charcoal} position={[x, 1.12, z + 0.09]} scale={[0.46, 0.03, 0.2]} />
          </group>
        );
      })}
    </group>
  );
}

/** The reel on its concrete pad: a drum between two flanges on a stand, and the cabinet beside it. */
function Pad() {
  return (
    <group>
      <mesh geometry={box} material={surfaces.concrete} position={[PAD.x, PAD.h / 2, PAD.z]} scale={[PAD.w, PAD.h, PAD.d]} />
      <group position={[REEL.x, REEL.y, REEL.z]}>
        <mesh geometry={drum} material={surfaces.charcoal} rotation={[0, 0, Math.PI / 2]} />
        {[-0.32, 0.32].map((x) => (
          <mesh key={x} geometry={flange} material={surfaces.lip} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        ))}
        {[-0.46, 0.46].map((x) => (
          <mesh key={`s${x}`} geometry={box} material={surfaces.charcoal} position={[x, -0.27, 0]} scale={[0.06, 0.6, 0.55]} />
        ))}
      </group>
      <mesh geometry={box} material={surfaces.shell} position={[PAD.x + 0.75, PAD.h + 0.45, PAD.z + 0.65]} scale={[1.1, 0.9, 0.6]} />
      <mesh geometry={box} material={surfaces.charcoal} position={[PAD.x + 0.75, PAD.h + 0.91, PAD.z + 0.65]} scale={[1.16, 0.04, 0.66]} />
    </group>
  );
}

type LineRef = Line2 | LineSegments2;

/**
 * The demo solar array the window's solar model draws: four tilted tables of 20 modules on galvanised
 * steel, the reel on its pad at the east end, and the ground that fades into the page. Like the
 * building, it draws each module's wash, the soiling overlay (cleared where the wash has passed), the
 * scan (here a sweep from west to east) and the row outlines, and reports what it draws to the window.
 */
export function SolarField({ controlRef, clockRef, fadeRef }: { controlRef: RefObject<SceneControl>; clockRef: RefObject<Clock>; fadeRef: RefObject<Fade> }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const glass = useRef<THREE.InstancedMesh>(null);
  const points = useRef<THREE.Points>(null);
  const overlayMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const scanPlane = useRef<THREE.Mesh>(null);
  const lines = useRef<Partial<Record<SolarZoneId, LineRef | null>>>({});
  const hovered = useRef(-1);
  const material = useMemo(() => makeSolarMaterial(), []);
  const ground = useMemo(() => makeGroundMaterial("#d9d4c3", "#e2dccb", 0.14, 180), []);
  const state = useMemo(() => {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(PANELS.length * 4), 4);
    a.setUsage(THREE.DynamicDrawUsage);
    return a;
  }, []);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.setAttribute("aState", state);
    g.setAttribute("aDust", new THREE.InstancedBufferAttribute(new Float32Array(PANELS.map((p) => p.debris)), 1));
    return g;
  }, [state]);
  const pointsMaterial = useMemo(() => makePointsMaterial(dpr, "x"), [dpr]);
  const cloud = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(buildPointCloud(), 3));
    return g;
  }, []);
  const overlays = useMemo(
    () =>
      Array.from({ length: ROWS }, (_, row) => {
        const heat = heatTexture((u, v) => soilingAt(row, u, v), ROW_LEN, SLOPE);
        const wash = washTexture({ cols: COLS, rows: UP, at: (col, level) => PANELS.find((p) => p.row === row && p.level === level && p.col === col)?.washAt ?? [] });
        const position = onTable(row, ROW_LEN / 2, SLOPE / 2).addScaledVector(NORMAL, 0.012);
        return { material: makeDebrisMaterial(heat, wash), position };
      }),
    [],
  );
  const outlines = useMemo(() => solarZones.map((z) => ({ id: z.id, points: zoneOutline(z.id) })), []);

  useLayoutEffect(() => {
    controlRef.current.spans = ROUTE.spans;
  }, [controlRef]);

  useLayoutEffect(() => {
    const m = glass.current;
    if (!m) return;
    const o = new THREE.Object3D();
    PANELS.forEach((p, i) => {
      o.position.copy(p.centre);
      o.rotation.set(PANEL_ROTATION_X, 0, 0);
      o.scale.set(PANEL_W, PANEL_H, 1);
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
    const scanX = SCAN_FROM + scanU * (SCAN_TO - SCAN_FROM);
    const p = control.wash * f.wash;
    const attr = m.geometry.getAttribute("aState") as THREE.InstancedBufferAttribute;
    const arr = attr.array as Float32Array;
    let completed = 0;
    for (let i = 0; i < PANELS.length; i++) {
      const panel = PANELS[i];
      let washed = 0;
      let planned = 0;
      let sweep = 0;
      for (const w of panel.washAt) {
        if (control.wash >= w) planned += 1 / panel.washAt.length;
        if (p >= w) {
          washed += 1 / panel.washAt.length;
          const s = (p - w) / SWEEP;
          if (s < 1) sweep = 1 - s;
        }
      }
      if (planned >= 0.999) completed++;
      // The cells run in the same order as the panels (row, then lower and upper line, then west to east).
      control.cells[i] = planned;
      const j = i * 4;
      arr[j] = washed;
      arr[j + 1] = sweep;
      arr[j + 2] = f.scan * (scanU >= 1 ? 1 : panel.centre.x < scanX ? 1 : 0);
      arr[j + 3] = hovered.current === i ? 1 : 0;
    }
    attr.needsUpdate = true;
    control.stats.completed = completed;
    control.stats.total = PANELS.length;

    for (const mesh of overlayMeshes.current) {
      const u = (mesh?.material as THREE.ShaderMaterial | undefined)?.uniforms;
      if (!u) continue;
      u.uProgress.value = p;
      u.uOpacity.value = f.debris;
    }
    cloudMaterial.uniforms.uScanY.value = scanU >= 1 ? SCAN_TO + 1 : scanX;
    cloudMaterial.uniforms.uOpacity.value = f.scan * 0.9;
    if (scanPlane.current) {
      scanPlane.current.visible = L.scan && scanU > 0 && scanU < 1;
      scanPlane.current.position.x = scanX;
    }
    for (const z of solarZones) {
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
    const zone = solarZones.find((z) => z.id === panel.zone)!;
    control.onHover({ zone: `${zone.name}, ${panel.level === 1 ? "upper" : "lower"} module ${panel.col + 1}`, surface: zone.surface, pressure: zone.pressure, lastWashed: panel.lastWashed, debris: panel.debris }, e.nativeEvent.clientX, e.nativeEvent.clientY);
    control.requestFrame();
  };
  const onOut = () => {
    if (hovered.current === -1) return;
    hovered.current = -1;
    controlRef.current.onHover(null, 0, 0);
    controlRef.current.requestFrame();
  };

  const scanH = LOW + SLOPE * Math.sin(TILT) + 1.6;
  // The sweep spans the rows and the pad in front of them.
  const scanZ0 = rowZ(ROWS - 1) - SLOPE - 1;
  const scanZ1 = PAD.z + PAD.d / 2 + 1;
  return (
    <group>
      <instancedMesh ref={glass} args={[geometry, material, PANELS.length]} onPointerMove={onMove} onPointerOut={onOut} />
      <Modules />
      <Steel />
      <Combiners />
      <Pad />
      {overlays.map((o, i) => (
        <mesh
          key={i}
          ref={(el) => {
            overlayMeshes.current[i] = el;
          }}
          position={o.position}
          rotation={[PANEL_ROTATION_X, 0, 0]}
          material={o.material}
          renderOrder={2}
        >
          <planeGeometry args={[ROW_LEN, SLOPE]} />
        </mesh>
      ))}
      <points ref={points} geometry={cloud} material={pointsMaterial} renderOrder={3} frustumCulled={false} />
      <mesh ref={scanPlane} position={[SCAN_FROM, scanH / 2, (scanZ0 + scanZ1) / 2]} renderOrder={4} visible={false}>
        <boxGeometry args={[0.07, scanH, scanZ1 - scanZ0]} />
        <meshBasicMaterial color={PALETTE.glassOnDark} transparent opacity={0.3} depthWrite={false} toneMapped={false} />
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={ground}>
        <circleGeometry args={[90, 72]} />
      </mesh>
    </group>
  );
}
