"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BAYS_E, BAYS_N, BAY_E, BAY_N, D, FLOORS, FLOOR_H, H, LANTERN, MULLION_W, PARAPET_H, PARAPET_T, RECESS, REEL, ROOF_SLAB, ROOF_Y, SLAB_H, W } from "./layout";
import { makeGroundMaterial, surfaces } from "./materials";

const interior = new THREE.MeshStandardMaterial({ color: "#2b2925", roughness: 1, metalness: 0 });
const box = new THREE.BoxGeometry(1, 1, 1);
const drum = new THREE.CylinderGeometry(0.3, 0.3, 0.56, 24);
const flange = new THREE.CylinderGeometry(0.34, 0.34, 0.025, 24);

function Slabs() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    for (let k = 0; k < FLOORS; k++) {
      o.position.set(0, k * FLOOR_H + SLAB_H / 2, 0);
      o.scale.set(W + 0.02, SLAB_H, D + 0.02);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={ref} args={[box, surfaces.slab, FLOORS]} />;
}

function Mullions() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = (BAYS_N + 1) * 2 + (BAYS_E + 1) * 2;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let i = 0;
    const depth = RECESS + 0.02;
    for (let b = 0; b <= BAYS_N; b++) {
      for (const s of [1, -1]) {
        o.position.set(-W / 2 + b * BAY_N, H / 2, s * (D / 2 - RECESS / 2 + 0.01));
        o.rotation.set(0, 0, 0);
        o.scale.set(MULLION_W, H, depth);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    for (let b = 0; b <= BAYS_E; b++) {
      for (const s of [1, -1]) {
        o.position.set(s * (W / 2 - RECESS / 2 + 0.01), H / 2, -D / 2 + b * BAY_E);
        o.rotation.set(0, Math.PI / 2, 0);
        o.scale.set(MULLION_W, H, depth);
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={ref} args={[box, surfaces.mullion, count]} />;
}

/**
 * Everything that never moves: floor slabs, the mullion grid the glass sits behind, the parapet
 * with its cap, rooftop plant, the glazed roof lantern's frame, the capsule dock with its tether
 * reel, and the ground disc that fades into the page.
 */
export function Structure() {
  const ground = useMemo(() => makeGroundMaterial(), []);
  const py = ROOF_Y + PARAPET_H / 2;
  return (
    <group>
      <mesh geometry={box} material={interior} position={[0, H / 2, 0]} scale={[W - 2 * RECESS - 0.1, H, D - 2 * RECESS - 0.1]} />
      <Slabs />
      <Mullions />
      <mesh geometry={box} material={surfaces.slab} position={[0, H + ROOF_SLAB / 2, 0]} scale={[W + 0.02, ROOF_SLAB, D + 0.02]} />
      {/* Parapet: four walls and a slightly proud cap. */}
      {[1, -1].map((s) => (
        <group key={`ns${s}`}>
          <mesh geometry={box} material={surfaces.parapet} position={[0, py, s * (D / 2 - PARAPET_T / 2 + 0.01)]} scale={[W + 0.02, PARAPET_H, PARAPET_T]} />
          <mesh geometry={box} material={surfaces.mullion} position={[0, ROOF_Y + PARAPET_H + 0.03, s * (D / 2 - PARAPET_T / 2 + 0.01)]} scale={[W + 0.14, 0.06, PARAPET_T + 0.12]} />
          <mesh geometry={box} material={surfaces.parapet} position={[s * (W / 2 - PARAPET_T / 2 + 0.01), py, 0]} scale={[PARAPET_T, PARAPET_H, D + 0.02]} />
          <mesh geometry={box} material={surfaces.mullion} position={[s * (W / 2 - PARAPET_T / 2 + 0.01), ROOF_Y + PARAPET_H + 0.03, 0]} scale={[PARAPET_T + 0.12, 0.06, D + 0.14]} />
        </group>
      ))}
      {/* Rooftop plant: lift overrun and two air handling units. */}
      <mesh geometry={box} material={surfaces.plant} position={[6, ROOF_Y + 1.5, -4.5]} scale={[4, 3, 3.5]} />
      <mesh geometry={box} material={surfaces.charcoal} position={[6, ROOF_Y + 3.03, -4.5]} scale={[4.2, 0.06, 3.7]} />
      <mesh geometry={box} material={surfaces.plant} position={[-8, ROOF_Y + 0.6, 5]} scale={[2.6, 1.2, 1.8]} />
      <mesh geometry={box} material={surfaces.charcoal} position={[-8, ROOF_Y + 1.25, 5]} scale={[2.2, 0.1, 1.4]} />
      <mesh geometry={box} material={surfaces.plant} position={[-4.4, ROOF_Y + 0.45, 5.6]} scale={[1.6, 0.9, 1.5]} />
      {/* The roof lantern's frame; its glazing is part of the instanced glass. */}
      <mesh geometry={box} material={surfaces.mullion} position={[LANTERN.x, ROOF_Y + LANTERN.h / 2, LANTERN.z]} scale={[LANTERN.w, LANTERN.h, LANTERN.d]} />
      <mesh geometry={box} material={interior} position={[LANTERN.x, ROOF_Y + LANTERN.h / 2 - 0.05, LANTERN.z]} scale={[LANTERN.w - 0.2, LANTERN.h - 0.1, LANTERN.d - 0.2]} />
      {/* The roof capsule: charcoal base, off-white shell, split lid slid open, cradle, and the reel behind. */}
      <group position={[REEL.x, ROOF_Y, REEL.z + 1.35]}>
        <mesh geometry={box} material={surfaces.charcoal} position={[0, 0.22, 0]} scale={[2.4, 0.44, 1.7]} />
        <mesh geometry={box} material={surfaces.shell} position={[0, 0.62, 0]} scale={[2.3, 0.36, 1.6]} />
        <mesh geometry={box} material={surfaces.charcoal} position={[0, 0.44, 0]} scale={[2.34, 0.03, 1.64]} />
        <mesh geometry={box} material={surfaces.charcoal} position={[0, 0.5, 0]} scale={[1.0, 0.1, 0.8]} />
        <mesh geometry={box} material={surfaces.lip} position={[0, 0.56, 0]} scale={[0.4, 0.02, 0.24]} />
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={box} material={surfaces.shell} position={[s * 1.28, 0.83, 0]} scale={[1.14, 0.05, 1.62]} />
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`rail${s}`} geometry={box} material={surfaces.charcoal} position={[0, 0.81, s * 0.78]} scale={[4.6, 0.03, 0.06]} />
        ))}
      </group>
      <group position={[REEL.x, REEL.y - 0.3, REEL.z]}>
        <mesh geometry={drum} material={surfaces.charcoal} rotation={[0, 0, Math.PI / 2]} />
        {[-0.29, 0.29].map((x) => (
          <mesh key={x} geometry={flange} material={surfaces.lip} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        ))}
        {[-0.42, 0.42].map((x) => (
          <mesh key={`b${x}`} geometry={box} material={surfaces.charcoal} position={[x, -0.15, 0]} scale={[0.06, 0.34, 0.5]} />
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={ground}>
        <circleGeometry args={[120, 72]} />
      </mesh>
    </group>
  );
}
