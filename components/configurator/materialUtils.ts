import * as THREE from 'three';
import { MESH_TO_PART, TEXTURE_OPTIONS, PartKey } from './data';

const pbrCache = new Map<string, { color: THREE.Texture; normal: THREE.Texture; roughness: THREE.Texture }>();
const textureLoader = typeof window !== 'undefined' ? new THREE.TextureLoader() : null;

export function loadPBRAsync(key: string): Promise<{
  color: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
} | null> {
  return new Promise((resolve) => {
    if (pbrCache.has(key)) {
      resolve(pbrCache.get(key)!);
      return;
    }

    const def = TEXTURE_OPTIONS.find((t) => t.key === key);
    if (!def || !def.maps || !textureLoader) {
      resolve(null);
      return;
    }

    const loader = textureLoader;

    const loadTex = (url: string, isSRGB: boolean) =>
      new Promise<THREE.Texture>((res) => {
        loader.load(url, (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(4, 4);
          tex.colorSpace = isSRGB
            ? THREE.SRGBColorSpace
            : THREE.LinearSRGBColorSpace;
          res(tex);
        });
      });

    Promise.all([
      loadTex(def.maps.color, true),
      loadTex(def.maps.normal, false),
      loadTex(def.maps.roughness, false),
    ]).then(([color, normal, roughness]) => {
      const maps = { color, normal, roughness };
      pbrCache.set(key, maps);
      resolve(maps);
    });
  });
}

export function animateMaterialTransition(
  material: THREE.MeshStandardMaterial,
  target: {
    map?: THREE.Texture | null;
    normalMap?: THREE.Texture | null;
    roughnessMap?: THREE.Texture | null;
    color: THREE.Color;
  },
  duration = 300
) {
  const startTime = performance.now();

  const startColor = material.color.clone();
  const endColor = target.color;

  const animate = () => {
    const now = performance.now();
    const t = Math.min((now - startTime) / duration, 1);

    // Smooth easing
    const ease = t * t * (3 - 2 * t);

    material.color.lerpColors(startColor, endColor, ease);

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      material.map = target.map ?? null;
      material.normalMap = target.normalMap ?? null;
      material.roughnessMap = target.roughnessMap ?? null;
      material.needsUpdate = true;
    }
  };

  animate();
}

export function matchPartKey(meshName: string): PartKey | undefined {
  return MESH_TO_PART[meshName];
}
