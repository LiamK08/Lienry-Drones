"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

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

/** Requests frames only while the sequence is playing; otherwise the canvas stays idle. */
function Driver({ progress, active }: { progress: RefObject<number>; active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    if (!active) return;
    let raf = 0;
    const loop = () => {
      invalidate();
      if (progress.current < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, invalidate, progress]);
  return null;
}

function Facade({ progress }: { progress: RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const drone = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const p = THREE.MathUtils.clamp(progress.current, 0, 1);
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
      target.set((c - (COLS - 1) / 2) * (TILE + GAP), (r - (ROWS - 1) / 2) * (TILE + GAP), D / 2 + 0.75);
      drone.current.position.lerp(target, 0.12);
    }
  });

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[W + 0.2, H + 0.2, D]} />
        <meshLambertMaterial color="#e4dfd5" />
      </mesh>
      <mesh position={[W / 4, H / 2 + 0.16, -0.2]}>
        <boxGeometry args={[0.7, 0.3, 0.36]} />
        <meshLambertMaterial color="#f3efe7" />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, COLS * ROWS]}>
        <planeGeometry args={[TILE, TILE]} />
        <meshLambertMaterial />
      </instancedMesh>
      <mesh ref={sweep} position={[0, -H / 2, D / 2 + 0.01]}>
        <planeGeometry args={[W + 0.4, 0.03]} />
        <meshBasicMaterial color="#8ed4e0" transparent opacity={0.9} />
      </mesh>
      <group ref={drone} position={[0, H / 2, D / 2 + 0.75]}>
        <mesh>
          <boxGeometry args={[0.22, 0.06, 0.22]} />
          <meshLambertMaterial color="#f3efe7" />
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
      <mesh position={[0, -H / 2 - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshLambertMaterial color="#ece6da" />
      </mesh>
    </group>
  );
}

export default function BuildingScene({ progress, active }: { progress: RefObject<number>; active: boolean }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [4.6, 1.3, 7.6], fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 8, 5]} intensity={1.1} color="#fff4e3" />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#dcedf0" />
      <fog attach="fog" args={["#f3efe7", 12, 22]} />
      <Facade progress={progress} />
      <Driver progress={progress} active={active} />
    </Canvas>
  );
}
