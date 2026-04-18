import { PARTS, COLORS, TEXTURE_OPTIONS, COLOR_FILTERS, PartKey, PartSettings } from './data';

interface ConfiguratorPanelProps {
  selectedPart: PartKey;
  setSelectedPart: (key: PartKey) => void;
  settings: Record<PartKey, PartSettings>;
  setColor: (hex: string) => void;
  setTexture: (textureKey: string) => void;
  meshNames: string[];
}

export function ConfiguratorPanel({
  selectedPart,
  setSelectedPart,
  settings,
  setColor,
  setTexture,
  meshNames,
}: ConfiguratorPanelProps) {
  const selectedSettings = settings[selectedPart] ?? {};
  const selectedPartDef = PARTS.find((part) => part.key === selectedPart)!;

  return (
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
            {TEXTURE_OPTIONS.filter((texture) => !texture.allowedParts || texture.allowedParts.includes(selectedPart)).map((texture) => (
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
  );
}
