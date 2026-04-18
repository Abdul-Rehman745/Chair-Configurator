'use client';

import { useState, useCallback } from 'react';
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
      />
    </div>
  );
}
