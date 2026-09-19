"use client";

import { useFrame } from "@react-three/fiber";
import { forwardRef, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { surfaces } from "./materials";
import type { Clock } from "./Building";

const ROTOR_R = 0.42;
const GUARD_R = 0.17;
const ARM_ANGLES = [0, 60, 120, 180, 240, 300].map((a) => (a * Math.PI) / 180);

const geo = {
  base: new THREE.CylinderGeometry(0.26, 0.24, 0.08, 40),
  shell: new THREE.CylinderGeometry(0.235, 0.25, 0.1, 40),
  dome: new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  seam: new THREE.TorusGeometry(0.25, 0.008, 8, 48),
  arm: new THREE.BoxGeometry(0.26, 0.035, 0.05),
  guard: new THREE.TorusGeometry(GUARD_R, 0.012, 8, 40),
  lip: new THREE.TorusGeometry(GUARD_R + 0.006, 0.004, 6, 40),
  motor: new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16),
  blade: new THREE.BoxGeometry(0.3, 0.004, 0.028),
  sensorBar: new THREE.BoxGeometry(0.26, 0.05, 0.04),
  lens: new THREE.CylinderGeometry(0.014, 0.014, 0.012, 16),
  scanner: new THREE.CylinderGeometry(0.035, 0.035, 0.05, 20),
  scannerRing: new THREE.TorusGeometry(0.035, 0.004, 6, 24),
  sprayBar: new THREE.BoxGeometry(0.9, 0.03, 0.03),
  nozzle: new THREE.CylinderGeometry(0.012, 0.014, 0.03, 10),
  pad: new THREE.BoxGeometry(0.95, 0.16, 0.03),
  spring: new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8),
  roller: new THREE.CylinderGeometry(0.035, 0.035, 0.07, 16),
  port: new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12),
  boot: new THREE.CylinderGeometry(0.02, 0.036, 0.05, 12),
  skid: new THREE.BoxGeometry(0.34, 0.02, 0.05),
  leg: new THREE.CylinderGeometry(0.01, 0.01, 0.09, 8),
  contact: new THREE.BoxGeometry(0.04, 0.008, 0.03),
  light: new THREE.SphereGeometry(0.013, 12, 8),
  mist: new THREE.BoxGeometry(0.9, 0.18, 0.02),
};

const mistMaterial = new THREE.MeshBasicMaterial({ color: "#dcedf0", transparent: true, opacity: 0.32, depthWrite: false });

/**
 * The commercial hexacopter from the approved design sheet, built from primitives: charcoal base,
 * off-white upper shell with a gasket seam, six full prop guards with a thin lip in the site accent,
 * a dark glass sensor bar with two lenses, a scanning sensor on top, a front spray bar with five fan
 * nozzles over a sprung microfibre pad, two rubber standoff rollers, a rear-underside tether port with
 * a rubber boot, two low skids with charging contacts and a white status light under the nose.
 * The front (spray bar) points along local +z; the group is aimed at the glass with lookAt.
 */
export const Drone = forwardRef<THREE.Group, { clockRef: RefObject<Clock>; sprayingRef: RefObject<boolean> }>(function Drone({ clockRef, sprayingRef }, ref) {
  const props = useRef<(THREE.Mesh | null)[]>([]);
  const mist = useRef<THREE.Mesh>(null);
  const rotors = useMemo(
    () => ARM_ANGLES.map((a) => ({ x: Math.cos(a) * ROTOR_R, z: Math.sin(a) * ROTOR_R, armX: Math.cos(a) * (ROTOR_R - 0.14), armZ: Math.sin(a) * (ROTOR_R - 0.14), rot: -a })),
    [],
  );

  useFrame(() => {
    const t = clockRef.current.t / 1000;
    props.current.forEach((p, i) => {
      if (p) p.rotation.y = t * (i % 2 ? -52 : 52) + i;
    });
    if (mist.current) mist.current.visible = sprayingRef.current;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geo.base} material={surfaces.charcoal} position={[0, -0.02, 0]} />
      <mesh geometry={geo.shell} material={surfaces.shell} position={[0, 0.07, 0]} />
      <mesh geometry={geo.dome} material={surfaces.shell} position={[0, 0.11, 0]} scale={[1, 0.5, 1]} />
      <mesh geometry={geo.seam} material={surfaces.charcoal} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {rotors.map((r, i) => (
        <group key={i}>
          <mesh geometry={geo.arm} material={surfaces.charcoal} position={[r.armX, 0, r.armZ]} rotation={[0, r.rot, 0]} />
          <mesh geometry={geo.guard} material={surfaces.charcoal} position={[r.x, 0.02, r.z]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={geo.lip} material={surfaces.lip} position={[r.x, 0.036, r.z]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={geo.motor} material={surfaces.charcoal} position={[r.x, 0.03, r.z]} />
          <mesh
            ref={(el) => {
              props.current[i] = el;
            }}
            geometry={geo.blade}
            material={surfaces.charcoal}
            position={[r.x, 0.06, r.z]}
          />
        </group>
      ))}
      {/* Front sensor bar with two lenses, the scanning sensor on top, the status light under the nose. */}
      <mesh geometry={geo.sensorBar} material={surfaces.sensor} position={[0, 0.0, 0.29]} />
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} geometry={geo.lens} material={surfaces.sensor} position={[x, 0, 0.315]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
      <mesh geometry={geo.scanner} material={surfaces.charcoal} position={[0, 0.215, 0.05]} />
      <mesh geometry={geo.scannerRing} material={surfaces.lip} position={[0, 0.235, 0.05]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geo.light} material={surfaces.lightOn} position={[0, -0.05, 0.27]} />
      {/* Spray bar with five flat fan nozzles over a sprung microfibre pad, and two standoff rollers. */}
      <mesh geometry={geo.sprayBar} material={surfaces.charcoal} position={[0, -0.05, 0.4]} />
      {[-0.36, -0.18, 0, 0.18, 0.36].map((x) => (
        <mesh key={x} geometry={geo.nozzle} material={surfaces.charcoal} position={[x, -0.05, 0.43]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} geometry={geo.spring} material={surfaces.charcoal} position={[x, -0.15, 0.4]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
      <mesh geometry={geo.pad} material={surfaces.pad} position={[0, -0.16, 0.455]} />
      <mesh ref={mist} geometry={geo.mist} material={mistMaterial} position={[0, -0.09, 0.5]} />
      {[-0.44, 0.44].map((x) => (
        <mesh key={x} geometry={geo.roller} material={surfaces.rubber} position={[x, -0.06, 0.46]} />
      ))}
      {/* Rear-underside tether port with its rubber boot. */}
      <mesh geometry={geo.port} material={surfaces.charcoal} position={[0, -0.08, -0.2]} rotation={[-Math.PI / 3, 0, 0]} />
      <mesh geometry={geo.boot} material={surfaces.rubber} position={[0, -0.12, -0.235]} rotation={[-Math.PI / 3, 0, 0]} />
      {/* Two low skids on short legs, with charging contacts. */}
      {[-0.17, 0.17].map((x) => (
        <group key={x}>
          <mesh geometry={geo.skid} material={surfaces.charcoal} position={[x, -0.15, -0.02]} rotation={[0, Math.PI / 2, 0]} />
          {[-0.12, 0.12].map((z) => (
            <mesh key={z} geometry={geo.leg} material={surfaces.charcoal} position={[x, -0.1, z]} />
          ))}
          <mesh geometry={geo.contact} material={surfaces.lip} position={[x, -0.163, -0.02]} />
        </group>
      ))}
    </group>
  );
});

/** Where the tether leaves the drone, in the drone's local frame. */
export const TETHER_PORT = new THREE.Vector3(0, -0.15, -0.26);
