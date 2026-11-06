import * as THREE from 'three';
import { referenceUnit } from './reference-paint';

export type ReferenceStillId = 'reference-1' | 'reference-2' | 'reference-3';

function softDiscTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('texture context missing');
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.45, 'rgba(255,255,255,0.85)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function portraitCamera(fov = 48): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(fov, 360 / 640, 0.05, 80);
  camera.position.set(0, 0, 6.2);
  camera.lookAt(0, 0, 0);
  return camera;
}

function visibleHalf(camera: THREE.PerspectiveCamera): { x: number; y: number } {
  const distance = camera.position.z;
  const y = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
  return { y, x: y * camera.aspect };
}

function buildTerrain(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
  scene.background = new THREE.Color(0x07080d);
  scene.fog = new THREE.FogExp2(0x07080d, 0.085);
  const disc = softDiscTexture();
  const count = 52000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const half = visibleHalf(camera);
  for (let i = 0; i < count; i += 1) {
    const x = (referenceUnit(i, 1) - 0.5) * half.x * 2.35;
    const y = (referenceUnit(i, 2) - 0.5) * half.y * 2.15;
    const z = (referenceUnit(i, 3) - 0.15) * 7.5;
    const sheet = Math.sin(x * 0.85 + y * 0.28) * 1.1 + Math.cos(y * 0.45 - x * 0.2) * 0.45;
    const pulled = z * 0.35 + sheet + x * 0.55;
    positions[i * 3] = x + Math.sin(y * 0.7 + pulled) * 0.15;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = pulled;
    const ridge = Math.sin(x * 1.35 + y * 0.42 + pulled * 0.25);
    let r = 0.22;
    let g = 0.23;
    let b = 0.26;
    const depth = THREE.MathUtils.clamp((pulled + 2) / 6, 0, 1);
    r = g = b = 0.08 + depth * 0.22 + Math.max(0, ridge) * 0.18;
    if (ridge > 0.45) {
      r = 0.15;
      g = 0.55 + ridge * 0.35;
      b = 0.72 + ridge * 0.2;
    } else if (ridge < -0.45) {
      r = 0.62 + -ridge * 0.3;
      g = 0.1;
      b = 0.16;
    }
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const grains = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.055,
      map: disc,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.35,
      depthWrite: true,
      depthTest: true,
      sizeAttenuation: true,
    })
  );
  scene.add(grains);
  const hazeCount = 6000;
  const hazePos = new Float32Array(hazeCount * 3);
  const hazeCol = new Float32Array(hazeCount * 3);
  for (let i = 0; i < hazeCount; i += 1) {
    hazePos[i * 3] = (referenceUnit(i, 8) - 0.5) * half.x * 2.4;
    hazePos[i * 3 + 1] = (referenceUnit(i, 9) - 0.5) * half.y * 2.2;
    hazePos[i * 3 + 2] = (referenceUnit(i, 10) - 0.5) * 5;
    const gray = 0.25 + referenceUnit(i, 12) * 0.2;
    hazeCol[i * 3] = gray;
    hazeCol[i * 3 + 1] = gray;
    hazeCol[i * 3 + 2] = gray + 0.04;
  }
  const hazeGeo = new THREE.BufferGeometry();
  hazeGeo.setAttribute('position', new THREE.BufferAttribute(hazePos, 3));
  hazeGeo.setAttribute('color', new THREE.BufferAttribute(hazeCol, 3));
  scene.add(
    new THREE.Points(
      hazeGeo,
      new THREE.PointsMaterial({
        size: 0.28,
        map: disc,
        vertexColors: true,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        depthTest: true,
        sizeAttenuation: true,
      })
    )
  );
}

function cobaltMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0b3f9e,
    metalness: 0.78,
    roughness: 0.32,
    emissive: 0x041428,
    emissiveIntensity: 0.55,
  });
}

function buildKaleidoscope(scene: THREE.Scene): void {
  scene.background = new THREE.Color(0x000000);
  const material = cobaltMaterial();
  const root = new THREE.Group();
  const ribs = 12;
  for (let lobe = 0; lobe < 4; lobe += 1) {
    const group = new THREE.Group();
    group.rotation.z = (lobe * Math.PI) / 2;
    for (let rib = 0; rib < ribs; rib += 1) {
      const side = (rib / (ribs - 1) - 0.5) * 1.65;
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= 36; step += 1) {
        const t = step / 36;
        const along = -1.85 + t * 4.15;
        const bulge = Math.sin(t * Math.PI);
        const x = side * (0.12 + bulge * 0.95);
        const z = bulge * 0.7 + side * side * 0.2;
        points.push(new THREE.Vector3(x, along, z));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const radius = 0.048 + (rib % 4) * 0.012;
      const geometry = new THREE.TubeGeometry(curve, 56, radius, 8, false);
      group.add(new THREE.Mesh(geometry, material));
    }
    root.add(group);
  }
  scene.add(root);
  scene.add(new THREE.AmbientLight(0x1a2a44, 0.45));
  const key = new THREE.DirectionalLight(0xd7ecff, 3.2);
  key.position.set(2.4, 3.2, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3d7dff, 1.4);
  rim.position.set(-3.5, -1.2, 2);
  scene.add(rim);
  const fill = new THREE.PointLight(0x88c4ff, 8, 12);
  fill.position.set(0, 0, 1.4);
  scene.add(fill);
}

function buildVortex(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
  scene.background = new THREE.Color(0x02060f);
  scene.fog = new THREE.FogExp2(0x02060f, 0.11);
  const half = visibleHalf(camera);
  const nodes = [
    { x: 0, y: (0.5 - 0.7) * half.y * 2, z: 0.35 },
    { x: -0.62 * half.x * 2, y: (0.5 - 0.26) * half.y * 2, z: 0 },
    { x: 0.56 * half.x * 2, y: (0.5 - 0.18) * half.y * 2, z: -0.45 },
  ];
  const velocity = (x: number, y: number, z: number) => {
    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const r2 = dx * dx + dy * dy + 0.35;
      const spin = 1.15 / r2;
      vx += -dy * spin;
      vy += dx * spin;
      vz += (node.z - z) * 0.15;
    }
    vx += Math.sin(x * 1.4 + y * 0.6) * 0.25;
    vy += Math.cos(y * 1.2 - x * 0.4) * 0.25;
    return { vx, vy, vz };
  };
  const material = new THREE.MeshStandardMaterial({
    color: 0x12386a,
    emissive: 0x0a2748,
    emissiveIntensity: 0.7,
    metalness: 0.35,
    roughness: 0.55,
  });
  const disc = softDiscTexture();
  const dotPositions: number[] = [];
  const dotColors: number[] = [];
  const streams = 140;
  for (let i = 0; i < streams; i += 1) {
    let x = (referenceUnit(i, 20) - 0.5) * half.x * 2.1;
    let y = (referenceUnit(i, 21) - 0.5) * half.y * 2.05;
    let z = (referenceUnit(i, 22) - 0.5) * 2.4;
    if (i < 24) {
      const node = nodes[i % 3]!;
      const ang = referenceUnit(i, 23) * Math.PI * 2;
      const rad = 0.15 + referenceUnit(i, 24) * 0.85;
      x = node.x + Math.cos(ang) * rad;
      y = node.y + Math.sin(ang) * rad;
      z = node.z + (referenceUnit(i, 25) - 0.5) * 0.6;
    }
    const points: THREE.Vector3[] = [];
    for (let step = 0; step < 90; step += 1) {
      points.push(new THREE.Vector3(x, y, z));
      const v = velocity(x, y, z);
      const speed = Math.hypot(v.vx, v.vy, v.vz) || 1;
      const stepLen = 0.085;
      x += (v.vx / speed) * stepLen;
      y += (v.vy / speed) * stepLen;
      z += (v.vz / speed) * stepLen * 0.35;
      if (step % 3 === 0) {
        dotPositions.push(x, y, z);
        const hot = 0.45 + referenceUnit(i + step, 30) * 0.55;
        dotColors.push(0.35 * hot, 0.75 * hot, hot);
      }
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.TubeGeometry(curve, 80, 0.012 + referenceUnit(i, 26) * 0.01, 5, false);
    scene.add(new THREE.Mesh(tube, material));
  }
  const dots = new THREE.BufferGeometry();
  dots.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
  dots.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));
  scene.add(
    new THREE.Points(
      dots,
      new THREE.PointsMaterial({
        size: 0.045,
        map: disc,
        vertexColors: true,
        transparent: true,
        alphaTest: 0.2,
        depthWrite: true,
        sizeAttenuation: true,
      })
    )
  );
  for (const node of nodes) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: disc,
        color: 0xbfefff,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.95,
      })
    );
    sprite.position.set(node.x, node.y, node.z);
    sprite.scale.set(1.35, 1.35, 1);
    scene.add(sprite);
  }
  scene.add(new THREE.AmbientLight(0x123048, 0.8));
  const key = new THREE.DirectionalLight(0x9fd4ff, 1.4);
  key.position.set(1, 2, 3);
  scene.add(key);
}

export function createReference3DScene(id: ReferenceStillId): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
} {
  const scene = new THREE.Scene();
  const camera = portraitCamera(id === 'reference-2' ? 42 : 50);
  if (id === 'reference-2') camera.position.z = 7.4;
  if (id === 'reference-1') buildTerrain(scene, camera);
  else if (id === 'reference-2') buildKaleidoscope(scene);
  else buildVortex(scene, camera);
  return { scene, camera };
}
