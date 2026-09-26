"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { isCapture, now, runTicks, setManualTime } from "@/lib/clock";
import { Building, type Clock, type Fade } from "./software/Building";
import { Fleet } from "./software/Fleet";
import { Structure } from "./software/Structure";
import { CAMERA, fitDistance, presetBounds, presetPosition, type CameraPreset } from "./software/layout";
import type { SceneControl } from "./software/control";
import type { ZoneId } from "@/content/software";

const deg = (d: number) => (d * Math.PI) / 180;
const FLIGHT_MS = 1500;
/** Building's scan sweep takes 4.2s; a little over it, so its last frame is drawn. */
const SCAN_SWEEP_MS = 4400;

const skyMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: { uTop: { value: new THREE.Color("#f6f8f8") }, uHorizon: { value: new THREE.Color("#e4e6e3") }, uGround: { value: new THREE.Color("#cbc4b6") } },
  vertexShader: `varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGround; varying vec3 vPos;
    void main() {
      float y = normalize(vPos).y;
      vec3 c = y > 0.0 ? mix(uHorizon, uTop, smoothstep(0.0, 0.7, y)) : mix(uHorizon, uGround, smoothstep(0.0, 0.5, -y));
      gl_FragColor = vec4(c, 1.0);
    }`,
});

/** A soft gradient sky for the environment map so the glass reflects something everywhere, not only the light panels. */
function Sky() {
  return (
    <mesh scale={400} material={skyMaterial}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
  );
}

/** Slow auto orbit with damping between 25 and 70 degrees, no zoom, no pan, and camera flights to each zone. */
function Rig({ controlRef, clockRef, flyingRef }: { controlRef: RefObject<SceneControl>; clockRef: RefObject<Clock>; flyingRef: RefObject<boolean> }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const controls = useRef<OrbitControls | null>(null);
  const flight = useRef<{ from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; start: number } | null>(null);
  const pauseUntil = useRef(0);
  const current = useRef<"overview" | ZoneId>("overview");
  const follow = isCapture() && new URLSearchParams(window.location.search).has("follow");

  const place = (id: "overview" | ZoneId, out: THREE.Vector3): CameraPreset => {
    const preset = CAMERA[id];
    const { camera } = get();
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 35;
    presetPosition(preset, out, fitDistance(preset, presetBounds(id), size.width / Math.max(1, size.height), fov));
    return preset;
  };

  useEffect(() => {
    const { camera, gl } = get();
    const c = new OrbitControls(camera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.06;
    c.enableZoom = false;
    c.enablePan = false;
    c.minPolarAngle = deg(25);
    c.maxPolarAngle = deg(70);
    c.autoRotate = true;
    c.autoRotateSpeed = isCapture() ? 0.12 : 0.32;
    c.target.set(...CAMERA.overview.target);
    presetPosition(CAMERA.overview, camera.position);
    c.update();
    // On touch devices the page must keep scrolling over the model, so the orbit is automatic only.
    if (window.matchMedia("(pointer: coarse)").matches) {
      c.enableRotate = false;
      gl.domElement.style.touchAction = "auto";
    }
    let dragging = false;
    const onStart = () => {
      dragging = true;
      pauseUntil.current = now() + 6000;
    };
    const onEnd = () => {
      dragging = false;
    };
    // While the preview plays the driver draws every frame. While it is paused (or off screen) it
    // draws nothing, except that the user's own drag is drawn as it happens.
    const onChange = () => {
      if (dragging && !controlRef.current.active) get().invalidate();
    };
    c.addEventListener("start", onStart);
    c.addEventListener("end", onEnd);
    c.addEventListener("change", onChange);
    controls.current = c;
    return () => {
      c.removeEventListener("start", onStart);
      c.removeEventListener("end", onEnd);
      c.removeEventListener("change", onChange);
      c.dispose();
      controls.current = null;
    };
  }, [get, controlRef]);

  // Fit the current preset to the canvas on mount and whenever it is resized.
  useEffect(() => {
    const c = controls.current;
    if (!c || flight.current) return;
    const { camera } = get();
    const preset = place(current.current, camera.position);
    c.target.set(...preset.target);
    c.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, get]);

  useFrame((state) => {
    const c = controls.current;
    if (!c) return;
    const camera = state.camera;
    const control = controlRef.current;
    const { t, dt } = clockRef.current;
    if (control.flyTo) {
      const to = new THREE.Vector3();
      const preset = place(control.flyTo, to);
      current.current = control.flyTo;
      flight.current = { from: camera.position.clone(), to, fromT: c.target.clone(), toT: new THREE.Vector3(...preset.target), start: t };
      control.flyTo = null;
      pauseUntil.current = t + 9000;
    }
    if (follow) {
      // Recorder close-up: sit a couple of metres off the drone's front-right and look at it.
      const { x, y, z } = control.drone;
      camera.position.set(x + 2.6, y + 1.1, z + 2.4);
      c.target.set(x, y, z);
      camera.lookAt(x, y, z);
      return;
    }
    const fl = flight.current;
    if (fl) {
      const u = THREE.MathUtils.clamp((t - fl.start) / FLIGHT_MS, 0, 1);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      camera.position.lerpVectors(fl.from, fl.to, e);
      c.target.lerpVectors(fl.fromT, fl.toT, e);
      if (u >= 1) flight.current = null;
    }
    flyingRef.current = flight.current !== null;
    c.autoRotate = control.active && !fl && t > pauseUntil.current;
    c.update(dt);
  });
  return null;
}

/**
 * Whether a change the user started still needs frames: a layer fading in or out, the scan's sweep
 * up the building, or a camera flight. The driver draws these to the end even while the preview is
 * paused (a step preset or a zone chosen while paused would otherwise stop after one frame); the
 * wash and the orbit stay paused.
 */
function settling(control: SceneControl, fade: Fade, flying: boolean): boolean {
  const L = control.layers;
  if (flying) return true;
  if (fade.scan !== (L.scan ? 1 : 0) || fade.wash !== (L.wash ? 1 : 0) || fade.debris !== (L.debris ? 1 : 0) || fade.zones !== (L.zones ? 1 : 0)) return true;
  return L.scan && control.scanStartedAt !== null && now() - control.scanStartedAt < SCAN_SWEEP_MS;
}

/**
 * Keeps frames coming only while the window is on screen and playing, or while a change is still
 * settling. In capture mode the recorder steps time by hand.
 */
function Driver({ controlRef, clockRef, fadeRef, flyingRef }: { controlRef: RefObject<SceneControl>; clockRef: RefObject<Clock>; fadeRef: RefObject<Fade>; flyingRef: RefObject<boolean> }) {
  const invalidate = useThree((s) => s.invalidate);
  const get = useThree((s) => s.get);
  useEffect(() => {
    controlRef.current.requestFrame = () => invalidate();
    if (isCapture()) {
      const w = window as Window & { __lienryCapture?: { step: (ms: number) => void; flush: () => void; info: () => Record<string, number> } };
      w.__lienryCapture = {
        step: (ms: number) => {
          setManualTime(ms);
          runTicks();
          invalidate();
        },
        flush: () => invalidate(),
        info: () => {
          const r = get().gl.info;
          return { calls: r.render.calls, triangles: r.render.triangles, points: r.render.points, lines: r.render.lines, geometries: r.memory.geometries, textures: r.memory.textures, programs: r.programs?.length ?? 0 };
        },
      };
      invalidate();
      return;
    }
    let raf = 0;
    const loop = () => {
      const control = controlRef.current;
      if (document.visibilityState === "visible" && (control.active || settling(control, fadeRef.current, flyingRef.current))) invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controlRef, fadeRef, flyingRef, invalidate, get]);
  useFrame(() => {
    const t = now();
    const c = clockRef.current;
    c.dt = THREE.MathUtils.clamp((t - c.t) / 1000, 0, 0.1);
    c.t = t;
  }, -10);
  return null;
}

/**
 * Reports the scene's first frame once, after it is drawn: useFrame runs just before the frame
 * renders, so the report waits for the next animation frame. The window shows its poster until then.
 */
function FirstFrame({ onFirstFrame }: { onFirstFrame: () => void }) {
  const reported = useRef(false);
  const pending = useRef(0);
  useEffect(() => () => cancelAnimationFrame(pending.current), []);
  useFrame(() => {
    if (reported.current) return;
    reported.current = true;
    pending.current = requestAnimationFrame(() => onFirstFrame());
  });
  return null;
}

export default function SoftwareScene({ controlRef, onFirstFrame }: { controlRef: RefObject<SceneControl>; onFirstFrame?: () => void }) {
  const clockRef = useRef<Clock>({ t: 0, dt: 0 });
  const fadeRef = useRef<Fade>({ scan: 0, wash: 1, debris: 1, zones: 0 });
  const flyingRef = useRef(false);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ fov: 35, near: 1, far: 600, position: [60, 40, 60] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      style={{ background: "transparent" }}
    >
      <Environment resolution={256} frames={1}>
        <Sky />
        <Lightformer form="rect" intensity={2.4} color="#fff7ec" position={[0, 80, 10]} scale={[160, 120, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#dcedf0" position={[70, 30, 70]} scale={[90, 50, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#f3efe7" position={[-90, 25, 20]} scale={[70, 40, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#e9e3d8" position={[10, 12, -100]} scale={[120, 40, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#cfc8ba" position={[0, -40, 0]} scale={[160, 160, 1]} />
      </Environment>
      <ambientLight intensity={0.22} />
      <directionalLight position={[45, 70, 35]} intensity={1.7} color="#fff3e2" />
      <directionalLight position={[-40, 25, -20]} intensity={0.45} color="#dcedf0" />
      <directionalLight position={[-25, 35, 70]} intensity={0.55} color="#ffffff" />
      <Structure />
      <Building controlRef={controlRef} clockRef={clockRef} fadeRef={fadeRef} />
      <Fleet controlRef={controlRef} clockRef={clockRef} fadeRef={fadeRef} />
      <ContactShadows position={[0, 0.01, 0]} scale={100} far={20} blur={2.2} opacity={0.6} resolution={1024} frames={1} color="#1c1a17" />
      <Rig controlRef={controlRef} clockRef={clockRef} flyingRef={flyingRef} />
      <Driver controlRef={controlRef} clockRef={clockRef} fadeRef={fadeRef} flyingRef={flyingRef} />
      {onFirstFrame ? <FirstFrame onFirstFrame={onFirstFrame} /> : null}
    </Canvas>
  );
}
