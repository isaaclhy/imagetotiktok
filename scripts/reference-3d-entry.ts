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

const api = window as unknown as {
  snap: (id: ReferenceStillId, clay?: boolean) => string;
};
api.snap = (id, clay) => {
  const { scene, camera, overlay } = createReference3DScene(id, { clay: clay === true });
  renderer.autoClear = true;
  renderer.render(scene, camera);
  if (overlay) {
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(overlay.scene, overlay.camera);
    renderer.autoClear = true;
  }
  return renderer.domElement.toDataURL('image/png');
};
