'use client';

import { useState, useCallback, useEffect } from 'react';
import { PartKey, PartSettings } from './configurator/data';
import { ConfiguratorPanel } from './configurator/ConfiguratorPanel';
import { ConfiguratorViewer } from './configurator/ConfiguratorViewer';

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
  const [autoAR, setAutoAR] = useState(false);

  useEffect(() => {
    // Parse URL params for AR sharing
    const params = new URLSearchParams(window.location.search);
    if (params.get('ar') === '1') {
      const newSettings = { ...settings };
      let changed = false;
      
      // Keys are in format part_c for color and part_t for texture
      const parts: PartKey[] = ['frame', 'seat', 'pillows', 'stitches', 'armrest', 'wheels'];
      parts.forEach(p => {
        const c = params.get(`${p}_c`);
        const t = params.get(`${p}_t`);
        if (c || t) {
          changed = true;
          newSettings[p] = {
            color: c || newSettings[p].color,
            textureKey: t || undefined
          };
        }
      });

      if (changed) setSettings(newSettings);
      setAutoAR(true);
    }
  }, []);

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

  return (
    <div className="configurator-shell">
      <ConfiguratorPanel
        selectedPart={selectedPart}
        setSelectedPart={setSelectedPart}
        settings={settings}
        setColor={setColor}
        setTexture={setTexture}
        meshNames={meshNames}
      />
      <ConfiguratorViewer 
        selectedPart={selectedPart}
        settings={settings}
        setMeshNames={setMeshNames} 
        autoLaunchAR={autoAR}
      />
    </div>
  );
}
