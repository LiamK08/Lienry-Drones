import * as THREE from "three";

export const PALETTE = {
  plaster: "#f3efe7",
  raised: "#fbf9f4",
  sunken: "#e9e3d8",
  ink: "#1c1a17",
  inkRaised: "#26221d",
  muted: "#5e584f",
  glass: "#0f6a7c",
  glassDeep: "#0d6072",
  glassOnDark: "#8ed4e0",
  water: "#187566",
  debris: "#b9721c",
  debrisText: "#8a5210",
  hairline: "#dcd5c8",
  borderStrong: "#857d70",
};

/**
 * Curtain-wall glass: a physical material with one extra per-instance attribute.
 *   aState.x  washed (0 to 1)      brighter, cleaner, lower roughness
 *   aState.y  sweep (0 to 1)       the specular highlight that passes once after a wash
 *   aState.z  scanned (0 to 1)     a faint cool lift while the scan layer is on
 *   aState.w  hovered (0 or 1)     the panel under the pointer
 */
export function makeGlassMaterial(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#9fb3bd"),
    metalness: 0.05,
    roughness: 0.28,
    envMapIntensity: 1.2,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    reflectivity: 0.8,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec4 aState;\nvarying vec4 vState;\nvarying vec2 vPanelUv;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvState = aState;\nvPanelUv = uv;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec4 vState;\nvarying vec2 vPanelUv;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 washedTint = vec3(0.80, 0.90, 0.93);
        diffuseColor.rgb = mix(diffuseColor.rgb, washedTint, vState.x * 0.75);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.70, 0.86, 0.90), vState.z * 0.35);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.56, 0.83, 0.88), vState.w * 0.5);`,
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.06, vState.x);")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float band = 1.0 - smoothstep(0.0, 0.42, abs((vPanelUv.x + vPanelUv.y * 0.35) - (vState.y * 1.7 - 0.25)));
        totalEmissiveRadiance += vec3(0.62, 0.78, 0.82) * band * vState.y * (1.0 - vState.y) * 2.4;`,
      );
  };
  m.customProgramCacheKey = () => "lienry-glass";
  return m;
}

/** Concrete, slab and mullion finishes. Matte, in the site's warm neutrals. */
export const surfaces = {
  slab: new THREE.MeshStandardMaterial({ color: "#dcd5c8", roughness: 0.92, metalness: 0 }),
  mullion: new THREE.MeshStandardMaterial({ color: "#4f4b45", roughness: 0.5, metalness: 0.3 }),
  reveal: new THREE.MeshStandardMaterial({ color: "#d7d0c3", roughness: 0.9, metalness: 0 }),
  parapet: new THREE.MeshStandardMaterial({ color: "#ebe5d9", roughness: 0.9, metalness: 0 }),
  plant: new THREE.MeshStandardMaterial({ color: "#c9c2b5", roughness: 0.7, metalness: 0.15 }),
  charcoal: new THREE.MeshStandardMaterial({ color: "#2a2723", roughness: 0.55, metalness: 0.2 }),
  shell: new THREE.MeshStandardMaterial({ color: "#f1ece2", roughness: 0.42, metalness: 0.05 }),
  lip: new THREE.MeshStandardMaterial({ color: PALETTE.glass, roughness: 0.4, metalness: 0.2 }),
  rubber: new THREE.MeshStandardMaterial({ color: "#1e1c19", roughness: 0.95, metalness: 0 }),
  sensor: new THREE.MeshPhysicalMaterial({ color: "#101418", roughness: 0.12, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1 }),
  pad: new THREE.MeshStandardMaterial({ color: "#e4ded3", roughness: 1, metalness: 0 }),
  tether: new THREE.MeshStandardMaterial({ color: PALETTE.glassDeep, roughness: 0.6, metalness: 0.1 }),
  lightOn: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
};

/**
 * Debris overlay for one face: a heat map drawn as soft radial blobs on a canvas, shown at 60 %
 * opacity in amber to rust, and cleared wherever the wash has passed. `washMap` holds, per panel
 * cell, the progress at which the wash reaches that cell (two passes per floor, packed in r and g).
 */
export function makeDebrisMaterial(heat: THREE.Texture, washMap: THREE.DataTexture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uHeat: { value: heat },
      uWash: { value: washMap },
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
      uAmber: { value: new THREE.Color("#e0a13a") },
      uRust: { value: new THREE.Color("#b45a1c") },
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uHeat; uniform sampler2D uWash; uniform float uProgress; uniform float uOpacity;
      uniform vec3 uAmber; uniform vec3 uRust; varying vec2 vUv;
      void main() {
        float heat = texture2D(uHeat, vUv).r;
        vec2 wash = texture2D(uWash, vUv).rg;
        float cleared = smoothstep(wash.r - 0.004, wash.r + 0.004, uProgress) * 0.5 + smoothstep(wash.g - 0.004, wash.g + 0.004, uProgress) * 0.5;
        float a = heat * (1.0 - cleared) * uOpacity * 0.6;
        vec3 c = mix(uAmber, uRust, smoothstep(0.35, 1.0, heat));
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  });
}

/** The scan point cloud: points show only below the sweep plane, brightest just under it. */
export function makePointsMaterial(dpr: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uScanY: { value: -1 },
      uOpacity: { value: 0 },
      uSize: { value: 2.2 * dpr },
      uColor: { value: new THREE.Color(PALETTE.glass) },
      uBright: { value: new THREE.Color(PALETTE.glassOnDark) },
    },
    vertexShader: `
      uniform float uSize; varying float vY;
      void main() {
        vY = position.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * (60.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uScanY; uniform float uOpacity; uniform vec3 uColor; uniform vec3 uBright; varying float vY;
      void main() {
        if (vY > uScanY) discard;
        vec2 d = gl_PointCoord - 0.5;
        if (dot(d, d) > 0.25) discard;
        float near = 1.0 - smoothstep(0.0, 6.0, uScanY - vY);
        vec3 c = mix(uColor, uBright, near);
        gl_FragColor = vec4(c, uOpacity * (0.55 + 0.45 * near));
        #include <colorspace_fragment>
      }`,
  });
}

/** The ground: a disc that fades to nothing at its edge so it sits inside the page gradient. */
export function makeGroundMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color("#e3ddd1") }, uInner: { value: new THREE.Color("#ebe6db") } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor; uniform vec3 uInner; varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = 1.0 - smoothstep(0.35, 1.0, r);
        gl_FragColor = vec4(mix(uInner, uColor, smoothstep(0.0, 0.6, r)), a);
        #include <colorspace_fragment>
      }`,
  });
}

/** Draw the debris blobs for one face into a canvas texture with soft edges. */
export function heatTexture(sample: (u: number, v: number) => number, length: number, height: number): THREE.CanvasTexture {
  const w = 256;
  const h = Math.max(64, Math.round((w * height) / length));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = ((x + 0.5) / w) * length;
      const v = (1 - (y + 0.5) / h) * height;
      const a = sample(u, v);
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(a * 255);
      img.data[i + 1] = 0;
      img.data[i + 2] = 0;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Per-cell wash timing (two passes) for a face, as a float texture the overlay shader reads. */
export function washTexture(cells: { cols: number; rows: number; at: (col: number, row: number) => number[] }): THREE.DataTexture {
  const data = new Float32Array(cells.cols * cells.rows * 4);
  for (let row = 0; row < cells.rows; row++) {
    for (let col = 0; col < cells.cols; col++) {
      const w = cells.at(col, row);
      const i = (row * cells.cols + col) * 4;
      data[i] = w[0] ?? 2;
      data[i + 1] = w[1] ?? w[0] ?? 2;
      data[i + 2] = 0;
      data[i + 3] = 1;
    }
  }
  const tex = new THREE.DataTexture(data, cells.cols, cells.rows, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
