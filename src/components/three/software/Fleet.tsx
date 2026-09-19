"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import { Drone, TETHER_PORT } from "./Drone";
import { D, PARAPET_H, REEL, ROOF_Y, ROUTE, W, routeAt } from "./layout";
import { PALETTE, surfaces } from "./materials";
import type { SceneControl } from "./control";
import type { Clock, Fade } from "./Building";

const TUBE_R = 0.04;
const TUBE_SEGMENTS = 64;

// Scratch space for the per-frame maths; the fleet is a singleton so module scope is fine.
const scratch = {
  pos: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  e: new THREE.Euler(),
  port: new THREE.Vector3(),
  out: new THREE.Vector3(),
  lift: new THREE.Vector3(),
  pts: Array.from({ length: 6 }, () => new THREE.Vector3()),
};

/**
 * The drone on its planned route, its tether back to the reel on the roof as a sagging
 * Catmull-Rom tube that runs over the parapet and never through the building, and the
 * route itself as a thin dotted line.
 */
export function Fleet({ controlRef, clockRef, fadeRef }: { controlRef: RefObject<SceneControl>; clockRef: RefObject<Clock>; fadeRef: RefObject<Fade> }) {
  const drone = useRef<THREE.Group>(null);
  const tether = useRef<THREE.Mesh>(null);
  const route = useRef<Line2 | LineSegments2 | null>(null);
  const spraying = useRef(false);
  useEffect(() => {
    const mesh = tether.current;
    return () => {
      mesh?.geometry.dispose();
    };
  }, []);

  useFrame(() => {
    const d = drone.current;
    const cable = tether.current;
    const line = route.current;
    if (!d || !cable) return;
    const control = controlRef.current;
    const f = fadeRef.current;
    const { t, dt } = clockRef.current;
    const visible = f.wash > 0.01;
    d.visible = visible;
    cable.visible = visible;
    if (line) {
      line.visible = visible;
      line.material.opacity = 0.45 * f.wash;
    }
    if (!visible) return;

    const { pos, dir, q, e, port, out, lift, pts } = scratch;
    const seg = routeAt(ROUTE, control.wash, pos, dir);
    spraying.current = ROUTE.passStarts.has(seg);

    // Which way does the drone face? Down over the roof, otherwise square to the glass.
    const overRoof = pos.y > ROOF_Y + 0.5 && pos.x < W / 2 - 0.5 && pos.z < D / 2 - 0.5;
    let yaw = Math.PI;
    let pitch = 0;
    if (overRoof) pitch = Math.PI / 2;
    else if (pos.x >= W / 2 - 0.2 && pos.z < D / 2 + 0.6) yaw = -Math.PI / 2;
    e.set(pitch, yaw, spraying.current ? Math.sign(dir.x + dir.z) * -0.04 : 0, "YXZ");
    q.setFromEuler(e);
    d.quaternion.slerp(q, 1 - Math.pow(0.002, dt));
    d.position.copy(pos);
    d.position.y += Math.sin(t / 1000 * 2.4) * 0.035;
    d.updateMatrixWorld();
    control.drone.x = d.position.x;
    control.drone.y = d.position.y;
    control.drone.z = d.position.z;

    // Tether: reel, over the parapet at the nearest point, a sag outboard, then up into the port from below.
    port.copy(TETHER_PORT);
    d.localToWorld(port);
    pts[0].copy(REEL);
    if (overRoof) {
      pts[1].lerpVectors(REEL, port, 0.35).add(lift.set(0, 0.25, 0));
      pts[2].lerpVectors(REEL, port, 0.7).add(lift.set(0, 0.3, 0));
      pts[3].lerpVectors(REEL, port, 0.9).add(lift.set(0, -0.2, 0));
      pts[4].lerpVectors(REEL, port, 0.97).add(lift.set(0, -0.3, 0));
    } else {
      const gx = THREE.MathUtils.clamp(pos.x, -W / 2, W / 2);
      const gz = THREE.MathUtils.clamp(pos.z, -D / 2, D / 2);
      out.set(pos.x - gx, 0, pos.z - gz);
      if (out.lengthSq() < 1e-6) out.set(0, 0, 1);
      out.normalize();
      pts[1].set(gx, ROOF_Y + PARAPET_H + 0.12, gz).addScaledVector(out, -0.12);
      pts[2].copy(pts[1]).addScaledVector(out, 0.55).add(lift.set(0, -0.22, 0));
      const drop = Math.max(0, pts[2].y - port.y);
      pts[3].lerpVectors(pts[2], port, 0.5).addScaledVector(out, 1.1 + drop * 0.06);
      pts[3].y = THREE.MathUtils.lerp(pts[2].y, port.y, 0.56);
      pts[4].copy(port).addScaledVector(out, 0.5).add(lift.set(0, -0.6, 0));
    }
    pts[5].copy(port);
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const old = cable.geometry;
    cable.geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_R, 6, false);
    old.dispose();
  });

  return (
    <group>
      <Drone ref={drone} clockRef={clockRef} sprayingRef={spraying} />
      <mesh ref={tether} material={surfaces.tether} frustumCulled={false}>
        <bufferGeometry />
      </mesh>
      <Line
        ref={(el: Line2 | LineSegments2 | null) => {
          route.current = el;
        }}
        points={ROUTE.points}
        color={PALETTE.glass}
        lineWidth={1}
        dashed
        dashSize={0.45}
        gapSize={0.4}
        transparent
        opacity={0.45}
        renderOrder={1}
      />
    </group>
  );
}
