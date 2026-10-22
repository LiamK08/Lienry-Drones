"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import { Drone, TETHER_PORT } from "../software/Drone";
import { routeAt } from "../software/layout";
import { PANEL_GAP, PANEL_H, REEL, ROUTE, ROW_LEN, SLOPE, STANDOFF, TILT, onTable, rowZ } from "./layout";
import { PALETTE, surfaces } from "../software/materials";
import type { SceneControl } from "../software/control";
import type { Clock, Fade } from "../software/Building";

const TUBE_R = 0.035;
const TUBE_SEGMENTS = 72;
/** The tether lies on the ground this far in front of (north of) the row being washed. */
const AISLE = 1.15;
const GROUND = 0.05;

/** The aisle in front of a row, where the tether lies while that row is washed. */
const aisleZ = (row: number) => rowZ(row) + (SLOPE / 2) * Math.cos(TILT) + AISLE;
/** Where the drone holds (z) on a row's upper and lower lines. */
const lineZ = (row: number, level: number) => onTable(row, 0, (level + 0.5) * (PANEL_H + PANEL_GAP)).z + STANDOFF.z;

/** The spray bar's ends in the drone's own frame (see Drone), and half the width the fan lands on the glass. */
const BAR_L = new THREE.Vector3(-0.38, -0.05, 0.44);
const BAR_R = new THREE.Vector3(0.38, -0.05, 0.44);
const FAN = 0.62;
/**
 * The drone is drawn a third larger than the building's, so it reads at the array's scale (the tables
 * are low and the overview is wide); the model is illustrative, and its proportions stay the same.
 */
const DRONE_SCALE = 1.35;

const scratch = {
  pos: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  aim: new THREE.Object3D(),
  port: new THREE.Vector3(),
  hit: new THREE.Vector3(),
  bar: new THREE.Vector3(),
  pts: Array.from({ length: 7 }, () => new THREE.Vector3()),
};

/**
 * The spray: a fan of fine water from the bar to the glass, densest at the nozzles and thinning as it
 * spreads, drawn as one soft quad that follows the drone.
 */
const sprayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  uniforms: { uColor: { value: new THREE.Color("#eef7f8") }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 uColor; uniform float uTime; varying vec2 vUv;
    void main() {
      // vUv.x runs across the fan, vUv.y from the bar (0) to the glass (1).
      float across = 1.0 - smoothstep(0.3, 0.5, abs(vUv.x - 0.5));
      float streaks = 0.7 + 0.3 * sin(vUv.x * 64.0 + vUv.y * 7.0 - uTime * 16.0);
      float along = smoothstep(0.0, 0.1, vUv.y) * (1.0 - 0.5 * vUv.y);
      gl_FragColor = vec4(uColor, across * along * streaks * 0.55);
      #include <colorspace_fragment>
    }`,
});

/**
 * The drone on the solar route: a metre over the line it is washing, nearly level and facing south, its
 * spray bar fanning down onto the glass, and level while it moves between rows. Its tether
 * runs from the reel on the pad along the ground to the aisle in front of the row it is washing, then
 * up into its port; the route is a thin dotted line.
 */
export function SolarFleet({ controlRef, clockRef, fadeRef }: { controlRef: RefObject<SceneControl>; clockRef: RefObject<Clock>; fadeRef: RefObject<Fade> }) {
  const drone = useRef<THREE.Group>(null);
  const tether = useRef<THREE.Mesh>(null);
  const spray = useRef<THREE.Mesh>(null);
  const route = useRef<Line2 | LineSegments2 | null>(null);
  const spraying = useRef(false);
  const sprayGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), 2));
    g.setIndex([0, 2, 1, 1, 2, 3]);
    return g;
  }, []);
  useEffect(() => {
    const mesh = tether.current;
    return () => {
      mesh?.geometry.dispose();
      sprayGeometry.dispose();
    };
  }, [sprayGeometry]);

  useFrame(() => {
    const d = drone.current;
    const cable = tether.current;
    const fan = spray.current;
    const line = route.current;
    if (!d || !cable || !fan) return;
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
    fan.visible = false;
    if (!visible) return;

    const { pos, dir, aim, port, hit, bar, pts } = scratch;
    const seg = routeAt(ROUTE, control.wash, pos, dir);
    spraying.current = ROUTE.passStarts.has(seg);
    const leg = ROUTE.legs[seg] ?? null;
    control.activity = leg;

    // The drone hovers as a multirotor does, nearly level and facing south (towards the glass): washing,
    // its nose dips a little towards the line and it banks a touch into the pass; between rows it flies level.
    aim.position.copy(pos);
    aim.lookAt(pos.x, pos.y, pos.z - 1);
    if (spraying.current) {
      aim.rotateX(0.16);
      aim.rotateZ(Math.sign(dir.x) * 0.05);
    }
    d.quaternion.slerp(aim.quaternion, 1 - Math.pow(0.002, dt));
    d.position.copy(pos);
    d.position.y += Math.sin((t / 1000) * 2.4) * 0.03;
    d.updateMatrixWorld();
    control.drone.x = d.position.x;
    control.drone.y = d.position.y;
    control.drone.z = d.position.z;

    // The spray fan, from the bar's ends to a strip of glass a little wider than the bar.
    if (spraying.current) {
      const p = sprayGeometry.getAttribute("position") as THREE.BufferAttribute;
      hit.copy(d.position).sub(STANDOFF);
      d.localToWorld(bar.copy(BAR_L));
      p.setXYZ(0, bar.x, bar.y, bar.z);
      d.localToWorld(bar.copy(BAR_R));
      p.setXYZ(1, bar.x, bar.y, bar.z);
      p.setXYZ(2, hit.x - FAN, hit.y, hit.z);
      p.setXYZ(3, hit.x + FAN, hit.y, hit.z);
      p.needsUpdate = true;
      sprayGeometry.computeBoundingSphere();
      sprayMaterial.uniforms.uTime.value = t / 1000;
      fan.visible = true;
    }

    // Tether: the reel, round to the array's east end, along the aisle in front of this row to the
    // drone, then up into the port with a slack loop. Between rows the aisle it lies in moves with the
    // drone, under the table it is crossing, from the last row's aisle to the next one's.
    port.copy(TETHER_PORT);
    d.localToWorld(port);
    const row = leg?.floor ?? 0;
    let z = aisleZ(row);
    if (leg?.moving && row > 0) {
      const from = lineZ(row - 1, 0);
      const to = lineZ(row, 1);
      const u = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((from - pos.z) / (from - to), 0, 1), 0, 1);
      z = THREE.MathUtils.lerp(aisleZ(row - 1), aisleZ(row), u);
    }
    const east = ROW_LEN / 2 + 0.6;
    const nearX = Math.min(east - 0.4, pos.x + 1.4);
    pts[0].copy(REEL);
    pts[1].set(REEL.x - 1.1, GROUND, THREE.MathUtils.lerp(REEL.z, z, 0.55));
    pts[2].set(east + 0.6, GROUND, z);
    pts[3].set(Math.max(nearX, THREE.MathUtils.lerp(east, pos.x, 0.5)), GROUND, z);
    pts[4].set(nearX, GROUND + 0.02, z - 0.1);
    pts[5].set(port.x + 0.25, THREE.MathUtils.lerp(GROUND, port.y, 0.55), THREE.MathUtils.lerp(z, port.z, 0.55));
    pts[6].copy(port);
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const old = cable.geometry;
    cable.geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_R, 6, false);
    old.dispose();
  });

  return (
    <group>
      <Drone
        ref={(el: THREE.Group | null) => {
          drone.current = el;
          el?.scale.setScalar(DRONE_SCALE);
        }}
        clockRef={clockRef}
        sprayingRef={spraying}
      />
      <mesh ref={spray} geometry={sprayGeometry} material={sprayMaterial} renderOrder={2} frustumCulled={false} visible={false} />
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
