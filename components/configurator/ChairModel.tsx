import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, forwardRef } from 'react';
import * as THREE from 'three';
import { PartKey, PartSettings } from './data';
import { loadPBRAsync, animateMaterialTransition, matchPartKey } from './materialUtils';

export const ChairModel = forwardRef<THREE.Group, {
  settings: Record<PartKey, PartSettings>;
  onMeshNamesReady?: (names: string[]) => void;
}>(({ settings, onMeshNamesReady }, ref) => {
  const { scene } = useGLTF('/assets/3dModels/model1/Chair.glb');
  const { gl } = useThree();
  const hasReported = useRef(false);
  const materialsRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const [forceMaterialUpdate, setForceMaterialUpdate] = useState(0);

  const [offset, setOffset] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    // Update world matrix to ensure accurate bounding box calculation
    scene.updateWorldMatrix(true, true);
    
    const bbox = new THREE.Box3().setFromObject(scene);
    const center = bbox.getCenter(new THREE.Vector3());

    // Stable offset (no recompute ever again)
    // Position the model so its bottom sits at y=0.02 and centered on x/z
    setOffset(new THREE.Vector3(
      -center.x,
      -bbox.min.y + 0.02,
      -center.z
    ));
  }, [scene]);

  // Handle WebGL context restoration to reapply materials
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleContextRestored = () => {
      console.log('Context restored in ChairModel - forcing material reapplication');
      setForceMaterialUpdate(prev => prev + 1);
      // Force material reapplication by traversing and updating
      scene.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.needsUpdate = true;
        }
      });
    };
    
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, scene]);

  useEffect(() => {
    /* Report mesh names once for debugging / mapping */
    if (!hasReported.current) {
      const names: string[] = [];
      const rows: Array<{ index: number; meshName: string; parent: string; material: string; vertices: number }> = [];
      let idx = 0;
      scene.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        names.push(mesh.name);
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        rows.push({
          index: idx++,
          meshName: mesh.name || '(unnamed)',
          parent: mesh.parent?.name || '(root)',
          material: (mat as THREE.Material)?.name || '(default)',
          vertices: (mesh.geometry as THREE.BufferGeometry)?.attributes?.position?.count ?? 0,
        });
      });

      console.log('%c🪑 CHAIR MODEL — All Meshes', 'font-size:16px; font-weight:bold; color:#7c6af6');
      console.table(rows);
      console.log('Mesh names list:', names);

      if (onMeshNamesReady) onMeshNamesReady(names);
      hasReported.current = true;
    }
  }, [scene, onMeshNamesReady]);

  /* Create a personal material for each mesh ONCE, then update its properties */
  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const partKey = matchPartKey(mesh.name);
      if (!partKey) return;

      /* Get or create a stable material clone per mesh */
      let material = materialsRef.current.get(mesh.name);
      if (!material) {
        material = (
          (mesh.material as THREE.MeshStandardMaterial)?.clone?.() ??
          new THREE.MeshStandardMaterial()
        ) as THREE.MeshStandardMaterial;
        materialsRef.current.set(mesh.name, material);
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }

      const partSettings = settings[partKey];

      const activeColor =
        !partSettings?.color || partSettings.color === 'original'
          ? new THREE.Color('#ffffff')
          : new THREE.Color(partSettings.color);

      /* Safety resets to prevent "see-through" or "cut" glitches */
      material.transparent = false;
      material.opacity = 1.0;
      material.alphaTest = 0;
      material.depthWrite = true;
      material.side = THREE.DoubleSide; // Critical: Many 3D models use single-planes for shells or legs. FrontSide makes them invisible (looks cut off)!

      if (partSettings?.textureKey) {
        // 🚀 WAIT FOR TEXTURES BEFORE APPLYING
        material.roughness = 1;
        material.metalness = 0;
        
        loadPBRAsync(partSettings.textureKey).then((maps) => {
          if (!maps) return;

          animateMaterialTransition(material, {
            map: maps.color,
            normalMap: maps.normal,
            roughnessMap: maps.roughness,
            color: activeColor,
          });
        });
      } else {
        material.roughness = 0.55;
        material.metalness = 0.1;
        
        animateMaterialTransition(material, {
          map: null,
          normalMap: null,
          roughnessMap: null,
          color: activeColor,
        });
      }

    });
  }, [scene, settings, forceMaterialUpdate]);

  if (!offset) return null;

  return (
    <group ref={ref}>
      <primitive
        object={scene}
        position={[offset.x, offset.y, offset.z]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
});
