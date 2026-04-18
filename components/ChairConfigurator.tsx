'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Part definitions – each maps to GLB mesh names                     */
/* ------------------------------------------------------------------ */
const PARTS = [
  { key: 'frame', label: 'Frame', icon: '/assets/3dModels/model1/1311_0.png', allowColor: true, allowTexture: false },
  { key: 'seat', label: 'Seat & Back', icon: '/assets/3dModels/model1/1311_1.png', allowColor: true, allowTexture: true },
  { key: 'pillows', label: 'Pillows', icon: '/assets/3dModels/model1/1311_2.png', allowColor: true, allowTexture: true },
  { key: 'stitches', label: 'Stitches', icon: '/assets/3dModels/model1/1311_3.png', allowColor: true, allowTexture: false },
  { key: 'armrest', label: 'Armrest', icon: '/assets/3dModels/model1/1311_4.png', allowColor: true, allowTexture: true },
  { key: 'wheels', label: 'Wheels & Legs', icon: '/assets/3dModels/model1/1311_5.png', allowColor: true, allowTexture: false },
] as const;

/* ------------------------------------------------------------------ */
/*  Exact mesh-name → part-key mapping (from GLB model inspection)     */
/* ------------------------------------------------------------------ */
const MESH_TO_PART: Record<string, (typeof PARTS)[number]['key']> = {
  /* Frame: skeleton structure + legs */
  skelet_1: 'frame',
  skelet_2: 'frame',
  skelet_3: 'frame',
  skelet_4: 'frame',
  skelet_3_2: 'frame',
  leg: 'frame',
  leg_chrome: 'frame',
  leg_support: 'frame',

  /* Seat & Back: main cushioned surfaces */
  bottom_1: 'seat',
  bottom_2: 'seat',
  backrest: 'seat',

  /* Pillows */
  head_pillow: 'pillows',
  back_pillow: 'pillows',

  /* Stitches */
  stitches: 'stitches',
  stitches_2: 'stitches',
  stitches_3: 'stitches',
  stitches_backrest: 'stitches',

  /* Armrest: handles + belts */
  handles: 'armrest',
  belt_head_pillow: 'armrest',
  belt_back_pillow: 'armrest',

  /* Wheels */
  wheels: 'wheels',
};

/* ------------------------------------------------------------------ */
/*  Color swatches                                                     */
/* ------------------------------------------------------------------ */
const COLORS = [
  { hex: 'original', label: 'Original' },
  { hex: '#1a1a1a', label: 'Charcoal' },
  { hex: '#f4f0e6', label: 'Ivory' },
  { hex: '#db3a34', label: 'Red' },
  { hex: '#1a3d6f', label: 'Navy' },
  { hex: '#7a4b26', label: 'Brown' },
  { hex: '#1e4620', label: 'Forest' },
  { hex: '#f5a623', label: 'Amber' },
  { hex: '#6c5ce7', label: 'Purple' },
];

/* ------------------------------------------------------------------ */
/*  Texture definitions – actual PBR maps from disk                    */
/* ------------------------------------------------------------------ */
const TEXTURE_OPTIONS = [
  {
    key: 'plain',
    label: 'Plain / Solid',
    preview: '', // Handled as icon in UI or empty
    maps: null,
  },
  {
    key: 'fabric',
    label: 'Fabric',
    preview: '/assets/Textures/Fabric010_1K-JPG/Fabric010.png',
    maps: {
      color: '/assets/Textures/Fabric010_1K-JPG/Fabric010_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Fabric010_1K-JPG/Fabric010_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Fabric010_1K-JPG/Fabric010_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'fabric-015',
    label: 'Fabric Knit',
    preview: '/assets/Textures/Fabric015_1K-JPG/Fabric015.png',
    maps: {
      color: '/assets/Textures/Fabric015_1K-JPG/Fabric015_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Fabric015_1K-JPG/Fabric015_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Fabric015_1K-JPG/Fabric015_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'fabric-062',
    label: 'Fabric Denim',
    preview: '/assets/Textures/Fabric062_1K-JPG/Fabric062.png',
    maps: {
      color: '/assets/Textures/Fabric062_1K-JPG/Fabric062_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Fabric062_1K-JPG/Fabric062_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Fabric062_1K-JPG/Fabric062_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-003',
    label: 'Leather Classic',
    preview: '/assets/Textures/Leather003_1K-JPG/Leather003.png',
    maps: {
      color: '/assets/Textures/Leather003_1K-JPG/Leather003_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather003_1K-JPG/Leather003_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather003_1K-JPG/Leather003_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-025',
    label: 'Leather Grained',
    preview: '/assets/Textures/Leather025_1K-JPG/Leather025.png',
    maps: {
      color: '/assets/Textures/Leather025_1K-JPG/Leather025_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather025_1K-JPG/Leather025_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather025_1K-JPG/Leather025_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-033a',
    label: 'Leather Premium A',
    preview: '/assets/Textures/Leather033A_1K-JPG/Leather033A.png',
    maps: {
      color: '/assets/Textures/Leather033A_1K-JPG/Leather033A_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather033A_1K-JPG/Leather033A_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather033A_1K-JPG/Leather033A_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-033c',
    label: 'Leather Brown',
    preview: '/assets/Textures/Leather033C_1K-JPG/Leather033C.png',
    maps: {
      color: '/assets/Textures/Leather033C_1K-JPG/Leather033C_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather033C_1K-JPG/Leather033C_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather033C_1K-JPG/Leather033C_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-037',
    label: 'Leather Red',
    preview: '/assets/Textures/Leather037_1K-JPG/Leather037.png',
    maps: {
      color: '/assets/Textures/Leather037_1K-JPG/Leather037_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather037_1K-JPG/Leather037_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather037_1K-JPG/Leather037_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-038',
    label: 'Leather Rugged',
    preview: '/assets/Textures/Leather038_1K-JPG/Leather038.png',
    maps: {
      color: '/assets/Textures/Leather038_1K-JPG/Leather038_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather038_1K-JPG/Leather038_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather038_1K-JPG/Leather038_1K-JPG_Roughness.jpg',
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Material-Specific Color Filters                                    */
/*  Restricts colors for specific materials by color label.            */
/* ------------------------------------------------------------------ */
const COLOR_FILTERS: Record<string, string[]> = {
  // Key must match partSettings.textureKey or 'plain'
  'plain': COLORS.map(c => c.label), // All colors
  'fabric': COLORS.map(c => c.label), // All colors
  'fabric-015': COLORS.map(c => c.label), // All colors
  'fabric-062': COLORS.map(c => c.label), // All colors
  'leather-003': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-025': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-033a': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-033c': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-037': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-038': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type PartKey = (typeof PARTS)[number]['key'];

interface PartSettings {
  color?: string;
  textureKey?: string;
}

/* ------------------------------------------------------------------ */
/*  Texture loader cache (PBR maps)                                    */
/* ------------------------------------------------------------------ */
const pbrCache = new Map<string, { color: THREE.Texture; normal: THREE.Texture; roughness: THREE.Texture }>();
const textureLoader = typeof window !== 'undefined' ? new THREE.TextureLoader() : null;

function loadPBRAsync(key: string): Promise<{
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

function animateMaterialTransition(
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

/* ------------------------------------------------------------------ */
/*  Mesh-to-part matching                                              */
/* ------------------------------------------------------------------ */
function matchPartKey(meshName: string): PartKey | undefined {
  return MESH_TO_PART[meshName];
}

/* ------------------------------------------------------------------ */
/*  3D Scene – Chair model                                             */
/* ------------------------------------------------------------------ */
function ChairModel({ settings, onMeshNamesReady }: {
  settings: Record<PartKey, PartSettings>;
  onMeshNamesReady?: (names: string[]) => void;
}) {
  const { scene } = useGLTF('/assets/3dModels/model1/Chair.glb');
  const hasReported = useRef(false);
  const materialsRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());

  const [offset, setOffset] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    scene.updateWorldMatrix(true, true);

    const bbox = new THREE.Box3();
    bbox.makeEmpty();

    scene.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;

      // IMPORTANT: use geometry bounds only
      mesh.geometry.computeBoundingBox();

      if (mesh.geometry.boundingBox) {
        const geoBox = mesh.geometry.boundingBox.clone();
        geoBox.applyMatrix4(mesh.matrixWorld);
        bbox.union(geoBox);
      }
    });

    const center = bbox.getCenter(new THREE.Vector3());

    // stable offset (no recompute ever again)
    setOffset(new THREE.Vector3(
      -center.x,
      -bbox.min.y + 0.02,
      -center.z
    ));
  }, [scene]);
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
      material.side = THREE.FrontSide; // Default front-side for clean shadows

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
  }, [scene, settings]);

  if (!offset) return null;

  return (
    <primitive
      object={scene}
      position={[offset.x, offset.y, offset.z]}
      rotation={[0, 0, 0]}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Camera rig – ensures near plane doesn't clip                       */
/* ------------------------------------------------------------------ */
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.near = 0.01;
    cam.far = 100;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
}

/* ------------------------------------------------------------------ */
/*  Loading spinner                                                    */
/* ------------------------------------------------------------------ */
function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner" />
      <span>Loading 3D model…</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Configurator UI                                               */
/* ------------------------------------------------------------------ */
export default function ChairConfigurator() {
  const [selectedPart, setSelectedPart] = useState<PartKey>('seat');
  const [settings, setSettings] = useState<Record<PartKey, PartSettings>>({
    frame: { color: '#1a1a1a' },
    seat: { color: '#1a1a1a' },
    pillows: { color: '#1a1a1a' },
    stitches: { color: '#db3a34' },
    armrest: { color: '#1a1a1a' },
    wheels: { color: '#1a1a1a' },
  });
  const [meshNames, setMeshNames] = useState<string[]>([]);

  const selectedSettings = settings[selectedPart] ?? {};
  const selectedPartDef = PARTS.find((part) => part.key === selectedPart)!;

  const setColor = useCallback((color: string) => {
    setSettings((current) => ({
      ...current,
      [selectedPart]: {
        ...current[selectedPart],
        color,
      },
    }));
  }, [selectedPart]);

  const setTexture = useCallback((textureKey: string) => {
    setSettings((current) => ({
      ...current,
      [selectedPart]: {
        ...current[selectedPart],
        textureKey: textureKey === 'plain' ? undefined : textureKey,
        color: 'original', // Reset color when changing material
      },
    }));
  }, [selectedPart]);

  const clearTexture = useCallback(() => {
    setSettings((current) => ({
      ...current,
      [selectedPart]: {
        ...current[selectedPart],
        textureKey: undefined,
      },
    }));
  }, [selectedPart]);

  return (
    <div className="configurator-shell">
      {/* ── Left panel ─────────────────────────────────── */}
      <div className="configurator-panel">
        <div className="panel-heading">
          <h1>Chair Configurator</h1>
          <p>Precision Engineered · Select a part to customize.</p>
        </div>

        {/* Parts selector – icon buttons */}
        <div className="section">
          <h2>Select Part</h2>
          <div className="part-buttons">
            {PARTS.map((part) => (
              <button
                key={part.key}
                id={`part-btn-${part.key}`}
                type="button"
                className={part.key === selectedPart ? 'part-button active' : 'part-button'}
                onClick={() => setSelectedPart(part.key)}
                title={part.label}
              >
                <img
                  src={part.icon}
                  alt={part.label}
                  className="part-icon"
                  draggable={false}
                />
                <span className="part-label">{part.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="section">
          <h2>Color</h2>
          <div className="swatches">
            {(() => {
              const activeTexture = selectedSettings.textureKey || 'plain';
              const filter = COLOR_FILTERS[activeTexture];
              return filter 
                ? COLORS.filter(c => filter.includes(c.label)) 
                : COLORS;
            })().map(({ hex, label }) => (
              <button
                key={hex}
                id={`color-swatch-${label.toLowerCase()}`}
                type="button"
                className={selectedSettings.color === hex ? 'swatch active' : 'swatch'}
                style={{ 
                  background: hex === 'original' 
                    ? 'conic-gradient(#eee 0 25%, #fff 0 50%, #eee 0 75%, #fff 0)' 
                    : hex 
                }}
                onClick={() => setColor(hex)}
                aria-label={`Select ${label}`}
                title={label}
              >
                {hex === 'original' && <span className="original-dot" />}
              </button>
            ))}
          </div>
        </div>

        {/* Texture picker */}
        <div className="section">
          <h2>Material</h2>
          {selectedPartDef.allowTexture ? (
            <div className="texture-grid">
              {TEXTURE_OPTIONS.map((texture) => (
                <button
                  key={texture.key}
                  className={`texture-card ${
                    (!selectedSettings.textureKey && texture.key === 'plain') || 
                    selectedSettings.textureKey === texture.key 
                      ? 'active' : ''
                  }`}
                  onClick={() => setTexture(texture.key)}
                >
                  {texture.preview ? (
                    <img
                      src={texture.preview}
                      alt={texture.label}
                      className="texture-preview"
                      draggable={false}
                    />
                  ) : (
                    <div className="texture-preview plain-preview" />
                  )}
                  <span className="texture-label">{texture.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="hint">Material textures are not available for this part.</p>
          )}
        </div>

        {/* Mesh debug info – hidden normally */}
        {meshNames.length > 0 && (
          <details className="debug-details">
            <summary>Mesh names ({meshNames.length})</summary>
            <ul>
              {meshNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* ── Right viewer ───────────────────────────────── */}
      <div className="viewer-shell">
        <div className="viewer-topbar">
          <div className="topbar-left">
            <span className="topbar-dot" />
            <strong>{selectedPartDef.label}</strong>
          </div>
          <div className="topbar-badge">
            {selectedSettings.textureKey
              ? TEXTURE_OPTIONS.find((t) => t.key === selectedSettings.textureKey)?.label ?? 'Textured'
              : selectedSettings.color
                ? `Color: ${selectedSettings.color}`
                : 'Default'}
          </div>
        </div>

        <div className="viewer-canvas">
          <Suspense fallback={<Loader />}>
            <Canvas
              camera={{ position: [0, 1.2, 5.5], fov: 40 }}
              shadows
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
              style={{ background: 'linear-gradient(180deg, #e0e4e8 0%, #aab1b9 100%)' }}
            >
              <CameraRig />
              
              <ambientLight intensity={0.3} />
              <spotLight position={[5, 8, 5]} angle={0.25} penumbra={1} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
              <directionalLight position={[-5, 5, -5]} intensity={0.5} />
              
              <Environment preset="city" />
              
              <ChairModel settings={settings} onMeshNamesReady={setMeshNames} />
              
              {/* Specialized shadows and ground elements */}
              <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2.8} far={4} />
              
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#c0c4c8" roughness={1} metalness={0} />
              </mesh>
              
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={1.0}
                maxDistance={12}
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI / 2 - 0.05}
                target={[0, 1.1, 0]}
              />
            </Canvas>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
