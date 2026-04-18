import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import QRCode from 'react-qr-code';
import { PARTS, TEXTURE_OPTIONS, PartKey, PartSettings } from './data';
import { ChairModel } from './ChairModel';

// Declare model-viewer as an intrinsic Web Component so TypeScript allows it
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(3px)'
};

const modalContentStyle: React.CSSProperties = {
  background: '#f4f4f5',
  padding: '40px',
  borderRadius: '16px',
  textAlign: 'center',
  maxWidth: '400px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  position: 'relative'
};

const modalCloseStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '28px',
  cursor: 'pointer',
  color: '#666'
};

export function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.near = 0.01;
    cam.far = 100;
    cam.updateProjectionMatrix();
  }, [camera]);
  return null;
}

export function WebGLContextHandler() {
  const { gl } = useThree();
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost. Attempting to restore...');
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored. Reinitializing renderer...');
      // Force a resize to ensure proper rendering after context restoration
      gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
  
  return null;
}

export function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner" />
      <span>Loading 3D model…</span>
    </div>
  );
}

interface ConfiguratorViewerProps {
  selectedPart: PartKey;
  settings: Record<PartKey, PartSettings>;
  setMeshNames: (names: string[]) => void;
  autoLaunchAR?: boolean;
}

export function ConfiguratorViewer({
  selectedPart,
  settings,
  setMeshNames,
  autoLaunchAR = false,
}: ConfiguratorViewerProps) {
  const selectedSettings = settings[selectedPart] ?? {};
  const selectedPartDef = PARTS.find((part) => part.key === selectedPart)!;

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Group>(null);
  
  const [arBlobUrl, setArBlobUrl] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleResetView = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.reset();
      // Hardcode to exact initial page load values just in case saveState triggered late
      controls.object.position.set(0, 1.2, 5.5);
      controls.target.set(0, 1.1, 0);
      controls.update();
    }
  };

  const handleFullScreen = () => {
    if (canvasContainerRef.current) {
      if (!document.fullscreenElement) {
        canvasContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen failed:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleARView = async () => {
    if (!sceneRef.current) return;
    
    setIsExporting(true);
    
    // Determine if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        setArBlobUrl(url);
        setIsExporting(false);

        if (isMobile) {
          // Wait a tick for the hidden <model-viewer> to receive the src prop, then tap its native launch method!
          setTimeout(() => {
            const mv = document.getElementById('ar-bridge') as any;
            if (mv && mv.activateAR) mv.activateAR();
          }, 150);
        } else {
          // If desktop, compress current settings into URL parameters for the QR Code
          const params = new URLSearchParams();
          Object.entries(settings).forEach(([key, val]) => {
            if (val.color) params.set(`${key}_c`, val.color);
            if (val.textureKey) params.set(`${key}_t`, val.textureKey);
          });
          const arLink = `${window.location.origin}/?ar=1&${params.toString()}`;
          setQrUrl(arLink);
          setShowQRModal(true);
        }
      },
      (err) => {
        console.error('AR Export failed:', err);
        setIsExporting(false);
      },
      { binary: true } // AR explicitly requires the packed binary .glb format!
    );
  };

  // Handle auto-launch when arriving from QR code
  useEffect(() => {
    if (autoLaunchAR && sceneRef.current && !arBlobUrl && !isExporting) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        handleARView();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoLaunchAR, !!sceneRef.current]);

  useEffect(() => {
    // 💡 Fix for fullscreen return layout layout bug:
    // When returning from fullscreen, Chrome/Safari can leave the canvas expanded. 
    // Dispatching a resize event forces the 3D Canvas and Grid layouts to recompute bounds.
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
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

      <div className="viewer-canvas" ref={canvasContainerRef}>
        {/* Right Toolbar */}
        <div className="right-toolbar">
           <button className="icon-button" onClick={handleResetView} title="Reset View">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
           </button>
           <button className="icon-button" onClick={handleFullScreen} title="Fullscreen">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
           </button>
           <button className="icon-button ar-button" onClick={handleARView} title="View in AR" disabled={isExporting}>
             {isExporting ? (
               <div style={{ width: 20, height: 20, border: '2px solid #ccc', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
             ) : (
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
             )}
           </button>
        </div>

        {/* Hidden bridge connecting generated blobs exactly to Mobile OS AR APIs */}
        {arBlobUrl && (
          <model-viewer
            id="ar-bridge"
            src={arBlobUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            style={{ display: 'none' }}
          />
        )}

        {/* QR Code Desktop Modal Overlay */}
        {showQRModal && (
          <div className="modal-overlay" style={modalOverlayStyle} onClick={() => setShowQRModal(false)}>
            <div className="modal-content" style={modalContentStyle} onClick={e => e.stopPropagation()}>
              <button className="modal-close" style={modalCloseStyle} onClick={() => setShowQRModal(false)}>×</button>
              <h2 style={{marginTop: 0, fontSize: 18}}>View Chair in AR</h2>
              <p style={{fontSize: 14, color: '#666', marginBottom: 20}}>Scan this QR code with your iPhone or Android to drop your configured chair into your room.</p>
              <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block' }}>
                <QRCode value={qrUrl} size={200} />
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={<Loader />}>
          <Canvas
            camera={{ position: [0, 1.2, 5.5], fov: 40 }}
            shadows
            gl={{ 
              antialias: true, 
              toneMapping: THREE.ACESFilmicToneMapping, 
              toneMappingExposure: 1.0,
              preserveDrawingBuffer: true // Helps with context restoration
            }}
            style={{ background: 'linear-gradient(180deg, #e0e4e8 0%, #aab1b9 100%)' }}
          >
            <CameraRig />
            <WebGLContextHandler />
            
            <ambientLight intensity={0.3} />
            <spotLight position={[5, 8, 5]} angle={0.25} penumbra={1} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            
            <Environment preset="city" />
            
            <ChairModel settings={settings} onMeshNamesReady={setMeshNames} ref={sceneRef} />
            
            {/* Specialized shadows and ground elements */}
            <ContactShadows position={[0, 0, 0]} opacity={0.75} scale={10} blur={2.5} far={4} color="#111111" />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#c0c4c8" roughness={1} metalness={0} />
            </mesh>
            
            <OrbitControls
              ref={controlsRef}
              makeDefault
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
  );
}
