"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

const COLS = 9;
const ROWS = 14;
const TILE = 0.32;
const GAP = 0.035;
const W = COLS * (TILE + GAP);
const H = ROWS * (TILE + GAP);
const D = 2.2;

const colours = {
  base: new THREE.Color("#d9d3c8"),
  scanned: new THREE.Color("#e8e2d6"),
  washed: new THREE.Color("#cfe6ec"),
  debris: new THREE.Color("#c99a5b"),
  debrisLight: new THREE.Color("#d8b98f"),
};

// Deterministic debris zones so the story is the same for every visitor.
const DEBRIS = new Set<number>();
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) DEBRIS.add((r + 1) * COLS + c + 1);
for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) DEBRIS.add((r + 8) * COLS + c + 4);
for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) DEBRIS.add((r + 11) * COLS + c + 6);

function Facade({ progress }: { progress: MotionValue<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const drone = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const p = THREE.MathUtils.clamp(progress.get(), 0, 1);
    // Phase 1 (0 to 0.4): scan sweep from bottom to top. Phase 2 (0.4 to 1): wash from top to bottom, column by column.
    const scan = THREE.MathUtils.clamp(p / 0.4, 0, 1);
    const wash = THREE.MathUtils.clamp((p - 0.42) / 0.58, 0, 1);
    const washedTiles = Math.floor(wash * COLS * ROWS);
    for (let i = 0; i < COLS * ROWS; i++) {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const x = (c - (COLS - 1) / 2) * (TILE + GAP);
      const y = (r - (ROWS - 1) / 2) * (TILE + GAP);
      dummy.position.set(x, y, D / 2 + 0.002);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      const isDebris = DEBRIS.has(i);
      const scannedRow = (r + 0.5) / ROWS <= scan;
      // Wash order: top row first, left to right.
      const order = (ROWS - 1 - r) * COLS + c;
      const washed = order < washedTiles;
      if (washed) colour.copy(colours.washed);
      else if (isDebris) colour.copy(scannedRow ? colours.debris : colours.debrisLight);
      else colour.copy(scannedRow ? colours.scanned : colours.base);
      m.setColorAt(i, colour);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (sweep.current) {
      sweep.current.visible = scan > 0 && scan < 1;
      sweep.current.position.y = -H / 2 + scan * H;
    }
    if (drone.current) {
      drone.current.visible = wash > 0 && wash < 1;
      const idx = Math.min(COLS * ROWS - 1, washedTiles);
      const r = ROWS - 1 - Math.floor(idx / COLS);
      const c = idx % COLS;
      const tx = (c - (COLS - 1) / 2) * (TILE + GAP);
      const ty = (r - (ROWS - 1) / 2) * (TILE + GAP);
      drone.current.position.lerp(new THREE.Vector3(tx, ty, D / 2 + 0.75), 0.12);
    }
  });

  return (
    <group>
      {/* Building body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[W + 0.2, H + 0.2, D]} />
        <meshStandardMaterial color="#e4dfd5" roughness={0.9} metalness={0} />
      </mesh>
      {/* Roof capsule */}
      <mesh position={[W / 4, H / 2 + 0.22, -0.2]}>
        <capsuleGeometry args={[0.16, 0.5, 6, 12]} />
        <meshStandardMaterial color="#f3efe7" roughness={0.6} />
      </mesh>
      {/* Facade tiles */}
      <instancedMesh ref={mesh} args={[undefined, undefined, COLS * ROWS]}>
        <planeGeometry args={[TILE, TILE]} />
        <meshStandardMaterial roughness={0.35} metalness={0.05} />
      </instancedMesh>
      {/* Scan sweep */}
      <mesh ref={sweep} position={[0, -H / 2, D / 2 + 0.01]}>
        <planeGeometry args={[W + 0.4, 0.03]} />
        <meshBasicMaterial color="#8ed4e0" transparent opacity={0.9} />
      </mesh>
      {/* Drone: body plus four rotor discs */}
      <group ref={drone} position={[0, H / 2, D / 2 + 0.75]}>
        <mesh>
          <boxGeometry args={[0.22, 0.06, 0.22]} />
          <meshStandardMaterial color="#f3efe7" roughness={0.5} />
        </mesh>
        {[
          [-0.16, 0, -0.16],
          [0.16, 0, -0.16],
          [-0.16, 0, 0.16],
          [0.16, 0, 0.16],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05, 0.09, 16]} />
            <meshBasicMaterial color="#26221d" side={THREE.DoubleSide} />
          </mesh>
        ))}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 1.2, 6]} />
          <meshBasicMaterial color="#0f6a7c" />
        </mesh>
      </group>
      {/* Ground */}
      <mesh position={[0, -H / 2 - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#ece6da" roughness={1} />
      </mesh>
    </group>
  );
}

function Rig() {
  const t = useRef(0);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    t.current += dt;
    const orbit = Math.sin(t.current * 0.12) * 0.18 + state.pointer.x * 0.25;
    const lift = state.pointer.y * 0.2;
    const radius = 8.6;
    target.set(Math.sin(orbit + 0.55) * radius, 1.2 + lift, Math.cos(orbit + 0.55) * radius);
    state.camera.position.lerp(target, 0.05);
    state.camera.lookAt(0, 0.2, 0);
  });
  return null;
}

export default function BuildingScene({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [4.5, 1.2, 7.4], fov: 32, near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 8, 5]} intensity={1.1} color="#fff4e3" />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#dcedf0" />
      <fog attach="fog" args={["#f3efe7", 12, 22]} />
      <Facade progress={progress} />
      <Rig />
    </Canvas>
  );
}
