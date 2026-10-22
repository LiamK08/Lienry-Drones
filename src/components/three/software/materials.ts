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
 *   aState.x  washed (0 to 1)      dusty and hazy at 0; deep, dark and mirror-crisp at 1
 *   aState.y  sweep (0 to 1)       the specular highlight that passes once after a wash
 *   aState.z  scanned (0 to 1)     a faint cool lift while the scan layer is on
 *   aState.w  hovered (0 or 1)     the panel under the pointer
 * Each pane also varies a little by its instance (tint, and a lit ceiling seen through the glass at
 * the top of the pane, with some blinds part-drawn), so the facade reads as glass, not a flat grid.
 */
export function makeGlassMaterial(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#22323a"),
    metalness: 0.3,
    roughness: 0.06,
    ior: 1.52,
    envMapIntensity: 2.2,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    specularIntensity: 1,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec4 aState;\nvarying vec4 vState;\nvarying vec2 vPanelUv;\nvarying float vVar;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvState = aState;\nvPanelUv = uv;\nvVar = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec4 vState;\nvarying vec2 vPanelUv;\nvarying float vVar;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // A pane's own shade, then the room behind it: a warm lit ceiling strip under the head of the
        // pane, and on some panes a pale blind drawn part way down.
        diffuseColor.rgb *= 0.88 + 0.24 * vVar;
        float ceilingLit = smoothstep(0.80, 0.86, vPanelUv.y) * (1.0 - smoothstep(0.92, 0.97, vPanelUv.y));
        diffuseColor.rgb += vec3(0.16, 0.15, 0.12) * ceilingLit * (0.5 + 0.5 * vVar);
        float drop = 0.12 + 0.3 * fract(vVar * 7.31);
        float blind = step(0.68, vVar) * smoothstep(1.0 - drop - 0.01, 1.0 - drop, vPanelUv.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.46, 0.46, 0.43), blind * 0.32);
        // Dust: unwashed glass is lighter, greyer and hazy; the wash takes it back to clear.
        vec3 dusty = mix(diffuseColor.rgb, vec3(0.47, 0.48, 0.45), 0.5);
        diffuseColor.rgb = mix(dusty, diffuseColor.rgb, vState.x);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.66, 0.72), vState.z * 0.3);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.30, 0.62, 0.70), vState.w * 0.55);`,
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.42, roughnessFactor, vState.x);")
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\nmaterial.clearcoat *= mix(0.25, 1.0, vState.x);\nmaterial.clearcoatRoughness = mix(0.38, material.clearcoatRoughness, vState.x);",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float band = 1.0 - smoothstep(0.0, 0.42, abs((vPanelUv.x + vPanelUv.y * 0.35) - (vState.y * 1.7 - 0.25)));
        totalEmissiveRadiance += vec3(0.62, 0.78, 0.82) * band * vState.y * (1.0 - vState.y) * 2.4;`,
      );
  };
  m.customProgramCacheKey = () => "lienry-glass-3";
  return m;
}

/**
 * Solar glass: monocrystalline modules, each 6 by 12 cells (half-cut, so two blocks of 6 by 6 with a
 * gap down the middle), thin busbars and a dark backsheet between the cells, inside an anodised frame.
 * The cell grid fades to its average where a cell is smaller than a few pixels, so the array never
 * shimmers. Per instance: `aState` (washed, sweep, scanned, hovered) and `aDust`, the module's own
 * soiling. Unwashed, the glass carries a matte warm film, heavier towards the lower frame where the
 * rain leaves it, and loses most of its reflection; the wash takes it back to deep blue glass with a
 * wet sheen just behind the spray.
 */
export function makeSolarMaterial(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffffff"),
    metalness: 0.05,
    roughness: 0.1,
    ior: 1.5,
    // The anti-reflective coating gives solar glass its blue cast in reflection.
    specularColor: new THREE.Color("#9fb6e2"),
    envMapIntensity: 0.85,
    clearcoat: 0.4,
    clearcoatRoughness: 0.05,
  });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec4 aState;\nattribute float aDust;\nvarying vec4 vState;\nvarying vec2 vPanelUv;\nvarying float vVar;\nvarying float vDust;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvState = aState;\nvDust = aDust;\nvPanelUv = uv;\nvVar = fract(sin(float(gl_InstanceID) * 78.233) * 43758.5453);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec4 vState;\nvarying vec2 vPanelUv;\nvarying float vVar;\nvarying float vDust;\nfloat frameMask;\nfloat film;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // The frame: 30mm round a 2000 x 1000 module.
        vec2 edgeM = min(vPanelUv, 1.0 - vPanelUv) * vec2(2.0, 1.0);
        float fwF = fwidth(vPanelUv.y) * 0.75;
        frameMask = 1.0 - smoothstep(0.03 - fwF, 0.03 + fwF, min(edgeM.x, edgeM.y));
        // The cells inside it: 12 across, 6 up, half-cut, so a wider gap down the middle.
        vec2 inner = clamp((vPanelUv - vec2(0.016, 0.032)) / vec2(0.968, 0.936), 0.0, 1.0);
        vec2 grid = inner * vec2(12.0, 6.0);
        vec2 cellUv = fract(grid);
        vec2 fw = max(fwidth(grid), vec2(1e-4));
        // How much of the cell detail survives at this size on screen: none once a cell is under ~6px.
        float detail = 1.0 - smoothstep(0.08, 0.22, max(fw.x, fw.y));
        vec2 gapD = min(cellUv, 1.0 - cellUv);
        float gx = 1.0 - smoothstep(0.03 - fw.x, 0.03 + fw.x, gapD.x);
        float gy = 1.0 - smoothstep(0.05 - fw.y, 0.05 + fw.y, gapD.y);
        float mid = 1.0 - smoothstep(0.012 - fw.x / 12.0, 0.012 + fw.x / 12.0, abs(inner.x - 0.5));
        float gap = max(max(gx, gy), mid);
        float bus = 0.0;
        for (int k = 1; k < 4; k++) bus = max(bus, 1.0 - smoothstep(0.0, 0.012 + fw.x, abs(cellUv.x - float(k) * 0.25)));
        vec3 cellC = vec3(0.007, 0.02, 0.07) * (0.9 + 0.2 * vVar);
        vec3 gapC = vec3(0.13, 0.15, 0.19);
        vec3 avg = mix(cellC, gapC, 0.12);
        vec3 cell = mix(cellC, vec3(0.34, 0.37, 0.42), bus * 0.22);
        cell = mix(cell, gapC, gap);
        cell = mix(avg, cell, detail);
        vec3 surface = mix(cell, vec3(0.52, 0.55, 0.58), frameMask);
        // The film: the module's own soiling, heaviest along the lower frame, with a little grain.
        float n = fract(sin(dot(floor(vPanelUv * vec2(90.0, 45.0)), vec2(12.9898, 78.233))) * 43758.5453);
        film = clamp(0.38 + 0.5 * vDust + 0.35 * exp(-vPanelUv.y / 0.12) + (n - 0.5) * 0.08, 0.0, 1.0) * (1.0 - vState.x);
        vec3 dust = vec3(0.45, 0.38, 0.29);
        diffuseColor.rgb = mix(surface, dust, film * 0.58 * (1.0 - frameMask * 0.5));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.66, 0.72), vState.z * 0.3);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.30, 0.62, 0.70), vState.w * 0.5);`,
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(mix(roughnessFactor, 0.78, film), 0.34, frameMask);")
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.85, frameMask);")
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\nmaterial.clearcoat *= (1.0 - 0.85 * film) * (1.0 - frameMask);\nmaterial.clearcoatRoughness = mix(material.clearcoatRoughness, 0.5, film);",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        // Just behind the spray the glass runs wet: a bright sheen that fades as it dries.
        float band = 1.0 - smoothstep(0.0, 0.3, abs((vPanelUv.x + vPanelUv.y * 0.25) - (vState.y * 1.6 - 0.2)));
        totalEmissiveRadiance += vec3(0.62, 0.78, 0.82) * (band * 0.9 + 0.25) * vState.y * (1.0 - vState.y) * 2.0 * (1.0 - frameMask);`,
      );
  };
  m.customProgramCacheKey = () => "lienry-solar-3";
  return m;
}

/**
 * The frame: dark back-painted spandrels at each floor, anodised aluminium mullions and copings,
 * metal parapet cladding, a grey roof membrane and galvanised plant. The dock keeps its own finishes.
 */
export const surfaces = {
  slab: new THREE.MeshStandardMaterial({ color: "#323b41", roughness: 0.34, metalness: 0.55, envMapIntensity: 1.2 }),
  mullion: new THREE.MeshStandardMaterial({ color: "#9aa0a4", roughness: 0.3, metalness: 0.85, envMapIntensity: 1.1 }),
  reveal: new THREE.MeshStandardMaterial({ color: "#d7d0c3", roughness: 0.9, metalness: 0 }),
  parapet: new THREE.MeshStandardMaterial({ color: "#4a5257", roughness: 0.42, metalness: 0.6, envMapIntensity: 1.1 }),
  roof: new THREE.MeshStandardMaterial({ color: "#a29f98", roughness: 0.95, metalness: 0 }),
  plant: new THREE.MeshStandardMaterial({ color: "#bdbcb6", roughness: 0.5, metalness: 0.45 }),
  charcoal: new THREE.MeshStandardMaterial({ color: "#2a2723", roughness: 0.55, metalness: 0.2 }),
  shell: new THREE.MeshStandardMaterial({ color: "#f1ece2", roughness: 0.42, metalness: 0.05 }),
  lip: new THREE.MeshStandardMaterial({ color: PALETTE.glass, roughness: 0.4, metalness: 0.2 }),
  rubber: new THREE.MeshStandardMaterial({ color: "#1e1c19", roughness: 0.95, metalness: 0 }),
  sensor: new THREE.MeshPhysicalMaterial({ color: "#101418", roughness: 0.12, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1 }),
  pad: new THREE.MeshStandardMaterial({ color: "#e4ded3", roughness: 1, metalness: 0 }),
  tether: new THREE.MeshStandardMaterial({ color: PALETTE.glassDeep, roughness: 0.6, metalness: 0.1 }),
  lightOn: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
  /** A module's body under its glass: the anodised frame's sides and the backsheet. */
  module: new THREE.MeshStandardMaterial({ color: "#3a3f45", roughness: 0.4, metalness: 0.7, envMapIntensity: 1 }),
  /** Hot-dip galvanised posts and rails under the solar tables. */
  galvanised: new THREE.MeshStandardMaterial({ color: "#a9adaf", roughness: 0.45, metalness: 0.8, envMapIntensity: 1.1 }),
  /** The concrete pad the reel stands on. */
  concrete: new THREE.MeshStandardMaterial({ color: "#d3cfc6", roughness: 0.95, metalness: 0 }),
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

/** The scan point cloud: points show only below (or, along x, west of) the sweep plane, brightest just behind it. */
export function makePointsMaterial(dpr: number, axis: "x" | "y" = "y"): THREE.ShaderMaterial {
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
        vY = ${axis === "x" ? "position.x" : "position.y"};
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

/**
 * The ground: a disc that fades to nothing at its edge so it sits inside the page gradient. `grain`
 * (0 for the building's paving) mottles it, at the scale of `size` metres across, like dry ground
 * under an array.
 */
export function makeGroundMaterial(outer = "#e3ddd1", inner = "#ebe6db", grain = 0, size = 180): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(outer) }, uInner: { value: new THREE.Color(inner) }, uGrain: { value: grain }, uSize: { value: size } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor; uniform vec3 uInner; uniform float uGrain; uniform float uSize; varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = 1.0 - smoothstep(0.35, 1.0, r);
        vec3 c = mix(uInner, uColor, smoothstep(0.0, 0.6, r));
        if (uGrain > 0.0) {
          vec2 m = vUv * uSize;
          float n = noise(m * 0.18) * 0.55 + noise(m * 0.7) * 0.3 + noise(m * 2.6) * 0.15;
          c *= 1.0 + (n - 0.5) * uGrain;
        }
        gl_FragColor = vec4(c, a);
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
