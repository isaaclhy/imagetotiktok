import * as THREE from 'three';
import { referenceUnit } from './reference-paint';

export type ReferenceStillId = 'reference-1' | 'reference-2' | 'reference-3';

export type ReferenceSceneOptions = {
  clay?: boolean;
};

const CANVAS_W = 360;
const CANVAS_H = 640;

function gaussianTexture(sharpness: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('texture context missing');
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = ((x + 0.5) / size) * 2 - 1;
      const dy = ((y + 0.5) / size) * 2 - 1;
      const r2 = dx * dx + dy * dy;
      const alpha = r2 >= 1 ? 0 : Math.exp(-sharpness * r2);
      const i = (y * size + x) * 4;
      image.data[i] = 186;
      image.data[i + 1] = 236;
      image.data[i + 2] = 255;
      image.data[i + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function nodeOnView(
  camera: THREE.PerspectiveCamera,
  u: number,
  v: number,
  z = 0
): THREE.Vector3 {
  const dist = camera.position.z - z;
  const halfY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist;
  const halfX = halfY * camera.aspect;
  return new THREE.Vector3((2 * u - 1) * halfX, (1 - 2 * v) * halfY, z);
}

function moundHeight(u: number, v: number): number {
  const dome = Math.exp(-0.5 * ((u / 0.85) ** 2 + (v / 2.6) ** 2));
  const ripple = Math.sin(4 * u + 0.7 * v) * Math.exp(-0.5 * ((u / 1.1) ** 2 + (v / 2.8) ** 2));
  return 1.35 * dome + 0.1 * ripple;
}

function placeMound(u: number, v: number, z: number): THREE.Vector3 {
  const rad = THREE.MathUtils.degToRad(-20);
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return new THREE.Vector3(c * u - s * v - 0.95, s * u + c * v, z);
}

function buildTerrain(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
  camera.up.set(0, 0, 1);
  camera.fov = 42;
  camera.position.set(0, -6, 4.2);
  camera.near = 0.05;
  camera.far = 80;
  camera.updateProjectionMatrix();
  const peak = placeMound(0, 0, moundHeight(0, 0));
  camera.lookAt(peak.x + 0.2, peak.y - 0.65, peak.z - 2.7);

  scene.background = new THREE.Color(0x05060a);
  scene.fog = new THREE.FogExp2(0x05060a, 0.14);

  const count = 80000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const refDist = camera.position.distanceTo(peak);

  for (let i = 0; i < count; i += 1) {
    const ang = referenceUnit(i, 1) * Math.PI * 2;
    const rad = Math.sqrt(referenceUnit(i, 2));
    const u = Math.cos(ang) * rad * 2.15 + (referenceUnit(i, 6) - 0.5) * 0.04;
    const v = Math.sin(ang) * rad * 6.4 + (referenceUnit(i, 7) - 0.5) * 0.05;
    const e = 0.02;
    const du = (moundHeight(u + e, v) - moundHeight(u - e, v)) / (2 * e);
    const dv = (moundHeight(u, v + e) - moundHeight(u, v - e)) / (2 * e);
    const nx = -du;
    const ny = -dv;
    const nz = 1;
    const nlen = Math.hypot(nx, ny, nz) || 1;
    const lift = 0.01 + referenceUnit(i, 4) * 0.02;
    const point = placeMound(u, v, moundHeight(u, v) + (nz / nlen) * lift);
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;

    const nwx = (Math.cos(THREE.MathUtils.degToRad(-20)) * nx - Math.sin(THREE.MathUtils.degToRad(-20)) * ny) / nlen;
    const flank = nwx;
    const up = nz / nlen;
    const gray = 0.12 + 0.24 * Math.max(0, up);
    const cyan = Math.pow(Math.max(0, flank), 2.4) * 0.7;
    const red = Math.pow(Math.max(0, -flank - 0.22), 2) * 0.9;
    colors[i * 3] = Math.min(1, gray * 0.85 + red * 0.75);
    colors[i * 3 + 1] = Math.min(1, gray + cyan * 0.55);
    colors[i * 3 + 2] = Math.min(1, gray * 0.95 + cyan * 0.8);
    sizes[i] = 0.65 + referenceUnit(i, 5) * 0.8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uRefDist: { value: refDist },
      uFogDensity: { value: 0.14 },
      uFogColor: { value: new THREE.Color(0x05060a) },
    },
    vertexShader: `
      attribute float aSize;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vDist;
      uniform float uRefDist;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(aSize * (uRefDist / vDist), 0.6, 2.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDist;
      uniform float uFogDensity;
      uniform vec3 uFogColor;
      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        if (dot(p, p) > 0.25) discard;
        float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDist * vDist);
        gl_FragColor = vec4(mix(vColor, uFogColor, fog), 1.0);
      }
    `,
    depthTest: true,
    depthWrite: true,
    transparent: false,
  });
  scene.add(new THREE.Points(geometry, material));
  scene.background = new THREE.Color(0x05060a);
}

function centerline(u: number): THREE.Vector3 {
  return new THREE.Vector3(
    0.85 * Math.sin(u) * (1 + 0.12 * Math.cos(u)),
    1.65 + 1.3 * Math.cos(u),
    0.1 * Math.sin(2 * u)
  );
}

function centerlineDeriv(u: number): THREE.Vector3 {
  return new THREE.Vector3(
    0.85 * (Math.cos(u) + 0.12 * Math.cos(2 * u)),
    -1.3 * Math.sin(u),
    0.2 * Math.cos(2 * u)
  );
}

function tubeFrame(u: number): { C: THREE.Vector3; N: THREE.Vector3; B: THREE.Vector3 } {
  const C = centerline(u);
  const deriv = centerlineDeriv(u);
  const T = deriv.clone().normalize();
  const seed = new THREE.Vector3(deriv.y, -deriv.x, 0);
  if (seed.lengthSq() < 1e-8) seed.set(1, 0, 0);
  seed.normalize();
  const N = seed.sub(T.clone().multiplyScalar(seed.dot(T))).normalize();
  const B = new THREE.Vector3().crossVectors(T, N).normalize();
  return { C, N, B };
}

function buildPetalGeometry(): THREE.BufferGeometry {
  const uSeg = 768;
  const vSeg = 32;
  const positions = new Float32Array(uSeg * vSeg * 3);
  const normals = new Float32Array(uSeg * vSeg * 3);
  const indices: number[] = [];
  for (let i = 0; i < uSeg; i += 1) {
    const u = (i / uSeg) * Math.PI * 2;
    const { C, N, B } = tubeFrame(u);
    for (let j = 0; j < vSeg; j += 1) {
      const v = (j / vSeg) * Math.PI * 2;
      const radius = 0.3 * (1 + 0.12 * Math.cos(44 * u + 1.2 * Math.sin(v)));
      const radial = N.clone().multiplyScalar(Math.cos(v)).add(B.clone().multiplyScalar(Math.sin(v)));
      const point = C.clone().add(radial.clone().multiplyScalar(radius));
      const o = (i * vSeg + j) * 3;
      positions[o] = point.x;
      positions[o + 1] = point.y;
      positions[o + 2] = point.z;
      normals[o] = radial.x;
      normals[o + 1] = radial.y;
      normals[o + 2] = radial.z;
    }
  }
  for (let i = 0; i < uSeg; i += 1) {
    const i2 = (i + 1) % uSeg;
    for (let j = 0; j < vSeg; j += 1) {
      const j2 = (j + 1) % vSeg;
      const a = i * vSeg + j;
      const b = i * vSeg + j2;
      const c = i2 * vSeg + j;
      const d = i2 * vSeg + j2;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

function buildKaleidoscope(scene: THREE.Scene, clay: boolean): void {
  scene.background = new THREE.Color(0x000000);
  const geometry = buildPetalGeometry();
  const material = clay
    ? new THREE.MeshStandardMaterial({ color: 0xb5b5b5, metalness: 0.05, roughness: 0.72 })
    : new THREE.MeshStandardMaterial({
        color: 0x1c4c86,
        metalness: 0.18,
        roughness: 0.52,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });
  const offsets = [0.16, -0.12, 0.14, -0.18];
  const root = new THREE.Group();
  root.scale.setScalar(1.22);
  for (let lobe = 0; lobe < 4; lobe += 1) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = (lobe * Math.PI) / 2;
    mesh.position.z = offsets[lobe] ?? 0;
    root.add(mesh);
  }
  scene.add(root);
  scene.add(new THREE.AmbientLight(0x243044, 0.35));
  const key = new THREE.DirectionalLight(0xfff2e4, 1.7);
  key.position.set(4.5, 5.5, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9d7ea, 0.42);
  rim.position.set(-3.2, 1.4, -2);
  scene.add(rim);
}

function buildVortex(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
  scene.background = new THREE.Color(0x02040c);
  const targets = [
    { u: 0.44 + 8 / CANVAS_W, v: 0.695 - 1 / CANVAS_H, k: 1, intensity: 1 },
    { u: 0.25 - 3.2 / CANVAS_W, v: 0.256 - 14 / CANVAS_H, k: 0.72, intensity: 0.7 },
    { u: 0.84 + 24 / CANVAS_W, v: 0.188 + 22 / CANVAS_H, k: 0.78, intensity: 0.68 },
  ];
  const nodes = targets.map((target) => ({
    ...nodeOnView(camera, target.u, target.v, 0),
    k: target.k,
    intensity: target.intensity,
  }));

  const deriv = (x: number, y: number) => {
    let vx = 0;
    let vy = 0;
    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const r2 = dx * dx + dy * dy + 0.15;
      const spin = (node.k * 0.42) / r2;
      vx += -dy * spin;
      vy += dx * spin;
    }
    vx += Math.sin(x * 2.1 + y * 0.8) * 0.22;
    vy += Math.cos(y * 1.7 - x * 0.55) * 0.22;
    return { vx, vy };
  };
  const rk4 = (x: number, y: number, dt: number) => {
    const k1 = deriv(x, y);
    const k2 = deriv(x + k1.vx * dt * 0.5, y + k1.vy * dt * 0.5);
    const k3 = deriv(x + k2.vx * dt * 0.5, y + k2.vy * dt * 0.5);
    const k4 = deriv(x + k3.vx * dt, y + k3.vy * dt);
    return {
      x: x + ((k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx) * dt) / 6,
      y: y + ((k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy) * dt) / 6,
    };
  };

  const lineCount = 340;
  const samples = 320;
  const dt = 0.028;
  const glints: number[] = [];
  const glintSizes: number[] = [];
  for (let i = 0; i < lineCount; i += 1) {
    let x = nodeOnView(camera, referenceUnit(i, 20), referenceUnit(i, 21), 0).x;
    let y = nodeOnView(camera, referenceUnit(i, 20), referenceUnit(i, 21), 0).y;
    if (i < 48) {
      const node = nodes[i % 3]!;
      const ang = referenceUnit(i, 22) * Math.PI * 2;
      const rad = 0.05 + referenceUnit(i, 23) * 0.55;
      x = node.x + Math.cos(ang) * rad;
      y = node.y + Math.sin(ang) * rad;
    }
    const positions = new Float32Array(samples * 3);
    const colors = new Float32Array(samples * 3);
    const brightAt = Math.floor(referenceUnit(i, 27) * samples);
    const brightLen = 18 + Math.floor(referenceUnit(i, 28) * 50);
    for (let step = 0; step < samples; step += 1) {
      positions[step * 3] = x;
      positions[step * 3 + 1] = y;
      positions[step * 3 + 2] = 0;
      const along = Math.abs(step - brightAt);
      const hot = along < brightLen ? 1 - along / brightLen : 0;
      const base = 0.18 + referenceUnit(i, 29) * 0.25;
      const gain = base + hot * 0.28;
      colors[step * 3] = 0.15 * gain;
      colors[step * 3 + 1] = 0.45 * gain;
      colors[step * 3 + 2] = 0.85 * gain;
      const next = rk4(x, y, dt);
      x = next.x;
      y = next.y;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.12 + referenceUnit(i, 30) * 0.23,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        fog: false,
        toneMapped: false,
      })
    );
    line.renderOrder = 1;
    scene.add(line);
    const glintCount = 2 + Math.floor(referenceUnit(i, 31) * 5);
    for (let g = 0; g < glintCount; g += 1) {
      const at = Math.min(samples - 1, Math.floor(referenceUnit(i * 17 + g, 32) * samples));
      glints.push(positions[at * 3]!, positions[at * 3 + 1]!, 0.01);
      glintSizes.push(1.05 + referenceUnit(i + g, 33) * 0.9);
    }
  }

  const glintGeo = new THREE.BufferGeometry();
  glintGeo.setAttribute('position', new THREE.Float32BufferAttribute(glints, 3));
  glintGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(glintSizes, 1));
  const glintPoints = new THREE.Points(
    glintGeo,
    new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize;
        }
      `,
      fragmentShader: `
        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);
          if (dot(p, p) > 0.25) discard;
          gl_FragColor = vec4(0.75, 0.95, 1.0, 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      toneMapped: false,
    })
  );
  glintPoints.renderOrder = 2;
  scene.add(glintPoints);

}

function vortexOverlay(): { scene: THREE.Scene; camera: THREE.OrthographicCamera } {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, CANVAS_W, 0, -CANVAS_H, -5, 5);
  camera.position.z = 1;
  const marks = [
    { u: 0.44, v: 0.695, intensity: 1 },
    { u: 0.25, v: 0.256, intensity: 0.72 },
    { u: 0.84, v: 0.188, intensity: 0.68 },
  ];
  const haloMap = gaussianTexture(6);
  for (const mark of marks) {
    const x = mark.u * CANVAS_W;
    const y = -mark.v * CANVAS_H;
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: haloMap,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        fog: false,
        toneMapped: false,
        opacity: 0.16 * mark.intensity,
        color: 0x9fd8ff,
      })
    );
    halo.position.set(x, y, 0);
    halo.scale.set(52, 52, 1);
    halo.renderOrder = 3;
    scene.add(halo);
    const core = new THREE.Mesh(
      new THREE.CircleGeometry(4, 20),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.72 * mark.intensity + 0.28, 0.9 * mark.intensity + 0.1, 1),
        transparent: true,
        depthWrite: false,
        depthTest: false,
        fog: false,
        toneMapped: false,
      })
    );
    core.position.set(x, y, 0);
    core.renderOrder = 4;
    scene.add(core);
  }
  return { scene, camera };
}

export function createReference3DScene(
  id: ReferenceStillId,
  options: ReferenceSceneOptions = {}
): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  overlay?: { scene: THREE.Scene; camera: THREE.OrthographicCamera };
} {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(id === 'reference-2' ? 38 : 48, CANVAS_W / CANVAS_H, 0.05, 80);
  camera.position.set(0, 0, id === 'reference-2' ? 8.2 : 6.2);
  camera.lookAt(0, 0, 0);
  if (id === 'reference-1') buildTerrain(scene, camera);
  else if (id === 'reference-2') buildKaleidoscope(scene, options.clay === true);
  else buildVortex(scene, camera);
  return { scene, camera, overlay: id === 'reference-3' ? vortexOverlay() : undefined };
}
