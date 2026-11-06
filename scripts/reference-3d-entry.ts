import * as THREE from 'three';
import {
  createReference3DScene,
  type ReferenceStillId,
} from '../app/lib/nighty-video-templates/reference-3d';

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(1);
renderer.setSize(360, 640, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

const api = window as unknown as { snap: (id: ReferenceStillId) => string };
api.snap = (id) => {
  const { scene, camera } = createReference3DScene(id);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
};
