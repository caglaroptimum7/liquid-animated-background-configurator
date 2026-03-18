import { useState, useCallback, useMemo } from 'react';
import type { Config } from './types';
import { BLEND_MODES } from './types';
import './Configurator.css';

interface Props {
  config: Config;
  onChange: (config: Config) => void;
}

export default function Configurator({ config, onChange }: Props) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showUsage, setShowUsage] = useState(false);

  const update = useCallback(
    (partial: Partial<Config>) => {
      onChange({ ...config, ...partial });
    },
    [config, onChange]
  );

  const updateBlob = useCallback(
    (index: number, color: string) => {
      const blobs = [...config.blobs];
      blobs[index] = { ...blobs[index], color };
      onChange({ ...config, blobs });
    },
    [config, onChange]
  );

  const addBlob = useCallback(() => {
    const hue = Math.floor(Math.random() * 360);
    const newBlob = {
      color: `hsl(${hue}, 70%, 50%)`,
      t: config.blobs.length * 2,
    };
    onChange({ ...config, blobs: [...config.blobs, newBlob] });
  }, [config, onChange]);

  const removeBlob = useCallback(
    (index: number) => {
      if (config.blobs.length <= 1) return;
      const blobs = config.blobs.filter((_, i) => i !== index);
      onChange({ ...config, blobs });
    },
    [config, onChange]
  );

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(json);
    setCopied('json');
    setTimeout(() => setCopied(null), 2000);
  }, [config]);

  const exportCode = useCallback(() => {
    const gradients = config.blobs
      .map((b, i) => {
        const positions = ['0% 0%', '100% 0%', '100% 100%', '0% 100%'];
        const pos = positions[i % positions.length];
        return `radial-gradient(circle at ${pos}, ${b.color}, transparent 80%)`;
      })
      .join(',\n    ');

    const blobsJS = config.blobs
      .map(
        (b, i) =>
          `  { color: '${b.color}', x: 0, y: 0, vx: ${i % 2 === 0 ? 1 : -1}, vy: ${i < 2 ? 1 : -1}, s: 1, t: ${b.t} }`
      )
      .join(',\n');

    const code = `<div style="width: 100%; height: 100%; overflow: hidden; position: relative; background-color: ${config.backgroundColor}; background-image: ${gradients};">
  <canvas id="liquid-bg" style="width: 100%; height: 100%; display: block; filter: blur(${config.blur}px); opacity: ${config.opacity}; mix-blend-mode: ${config.blendMode};"></canvas>
  <script>
    (function() {
      const canvas = document.getElementById('liquid-bg');
      const ctx = canvas.getContext('2d');
      let time = 0;
      const speed = ${config.speed} * 0.002;
      const isInteractive = ${config.interactive};
      const blendMode = '${config.blendMode}';
      const blobs = [
${blobsJS}
      ];
      let mouse = { x: 0, y: 0 }, targetMouse = { x: 0, y: 0 }, hasMouse = false;
      function resize() {
        canvas.width = 128;
        canvas.height = 128;
      }
      window.addEventListener('resize', resize);
      resize();
      if (isInteractive) {
        canvas.addEventListener('mousemove', (e) => {
          hasMouse = true;
          const r = canvas.getBoundingClientRect();
          targetMouse.x = (e.clientX - r.left) / r.width * canvas.width;
          targetMouse.y = (e.clientY - r.top) / r.height * canvas.height;
        });
        canvas.addEventListener('mouseleave', () => { hasMouse = false; });
      }
      function animate() {
        time += speed;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = blendMode;
        if (isInteractive) {
          mouse.x += (targetMouse.x - mouse.x) * 0.05;
          mouse.y += (targetMouse.y - mouse.y) * 0.05;
        }
        blobs.forEach((b) => {
          const mx = Math.sin(time + b.t) * 0.5 + Math.sin(time * 0.5 + b.t * 2) * 0.5;
          const my = Math.cos(time + b.t) * 0.5 + Math.cos(time * 0.6 + b.t * 2) * 0.5;
          let x = canvas.width / 2 + mx * canvas.width * 0.3;
          let y = canvas.height / 2 + my * canvas.height * 0.3;
          if (isInteractive && hasMouse) {
            const dx = mouse.x - x, dy = mouse.y - y;
            const dist = Math.sqrt(dx*dx + dy*dy), maxDist = canvas.width * 0.6;
            if (dist < maxDist) { const f = (maxDist - dist) / maxDist; x += dx * f * 0.2; y += dy * f * 0.2; }
          }
          const radius = canvas.width * ${config.blobRadius};
          const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
          g.addColorStop(0, b.color);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(animate);
      }
      animate();
    })();
  </script>
</div>`;

    navigator.clipboard.writeText(code);
    setCopied('code');
    setTimeout(() => setCopied(null), 2000);
  }, [config]);

  const usageSnippet = useMemo(() => {
    const json = JSON.stringify(config, null, 2);
    return `import { LiquidBackground } from 'liquid-animated-background';

const config = ${json};

export default function MyPage() {
  return (
    <LiquidBackground config={config} style={{ position: 'fixed', inset: 0 }}>
      {/* Your content here */}
    </LiquidBackground>
  );
}`;
  }, [config]);

  const copyUsage = useCallback(() => {
    navigator.clipboard.writeText(usageSnippet);
    setCopied('usage');
    setTimeout(() => setCopied(null), 2000);
  }, [usageSnippet]);

  return (
    <>
      <button
        className="panel-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close configurator' : 'Open configurator'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </>
          )}
        </svg>
      </button>

      <div className={`panel ${open ? 'panel--open' : 'panel--closed'}`}>
        <div className="panel-inner">
          <div className="panel-header">
            <h1 className="panel-title">Liquid Background</h1>
            <span className="panel-subtitle">Configurator</span>
          </div>

          <div className="panel-scroll">
            {/* Background Color */}
            <section className="section">
              <label className="section-label">Background</label>
              <div className="color-row">
                <div className="color-swatch-wrap">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => update({ backgroundColor: e.target.value })}
                    className="color-input"
                  />
                  <div className="color-swatch" style={{ backgroundColor: config.backgroundColor }} />
                </div>
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => update({ backgroundColor: e.target.value })}
                  className="text-input color-text"
                />
              </div>
            </section>

            {/* Blobs */}
            <section className="section">
              <div className="section-header">
                <label className="section-label">
                  Blobs
                  <span className="badge">{config.blobs.length}</span>
                </label>
                <button className="btn-icon" onClick={addBlob} title="Add blob">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
              <div className="blob-list">
                {config.blobs.map((blob, i) => (
                  <div key={i} className="blob-item">
                    <div className="color-swatch-wrap">
                      <input
                        type="color"
                        value={blob.color}
                        onChange={(e) => updateBlob(i, e.target.value)}
                        className="color-input"
                      />
                      <div className="color-swatch" style={{ backgroundColor: blob.color }} />
                    </div>
                    <input
                      type="text"
                      value={blob.color}
                      onChange={(e) => updateBlob(i, e.target.value)}
                      className="text-input color-text"
                    />
                    <button
                      className="btn-icon btn-icon--danger"
                      onClick={() => removeBlob(i)}
                      disabled={config.blobs.length <= 1}
                      title="Remove blob"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Sliders */}
            <section className="section">
              <label className="section-label">Effects</label>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="slider-label">Blur</span>
                  <span className="slider-value">{config.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="1"
                  value={config.blur}
                  onChange={(e) => update({ blur: Number(e.target.value) })}
                  className="range-input"
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="slider-label">Opacity</span>
                  <span className="slider-value">{config.opacity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.opacity}
                  onChange={(e) => update({ opacity: Number(e.target.value) })}
                  className="range-input"
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="slider-label">Speed</span>
                  <span className="slider-value">{config.speed.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={config.speed}
                  onChange={(e) => update({ speed: Number(e.target.value) })}
                  className="range-input"
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="slider-label">Blob Size</span>
                  <span className="slider-value">{(config.blobRadius * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.01"
                  value={config.blobRadius}
                  onChange={(e) => update({ blobRadius: Number(e.target.value) })}
                  className="range-input"
                />
              </div>
            </section>

            {/* Blend Mode */}
            <section className="section">
              <label className="section-label">Blend Mode</label>
              <select
                value={config.blendMode}
                onChange={(e) => update({ blendMode: e.target.value })}
                className="select-input"
              >
                {BLEND_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </section>

            {/* Interactive Toggle */}
            <section className="section">
              <div className="toggle-row">
                <span className="slider-label">Mouse Interaction</span>
                <button
                  className={`toggle ${config.interactive ? 'toggle--on' : ''}`}
                  onClick={() => update({ interactive: !config.interactive })}
                  role="switch"
                  aria-checked={config.interactive}
                >
                  <div className="toggle-thumb" />
                </button>
              </div>
            </section>

            {/* Export */}
            <section className="section section--export">
              <button className="btn-export" onClick={exportJSON}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                {copied === 'json' ? 'Copied!' : 'Copy JSON'}
              </button>
              <button className="btn-export" onClick={exportCode}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                {copied === 'code' ? 'Copied!' : 'Copy HTML'}
              </button>
            </section>

            {/* Usage Guide */}
            <section className="section section--usage">
              <button
                className="usage-toggle"
                onClick={() => setShowUsage(!showUsage)}
              >
                <div className="usage-toggle-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span>Use as npm package</span>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`usage-chevron ${showUsage ? 'usage-chevron--open' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showUsage && (
                <div className="usage-content">
                  <div className="usage-step">
                    <span className="usage-step-num">1</span>
                    <div className="usage-step-body">
                      <p className="usage-step-title">Install the package</p>
                      <div className="usage-code-block">
                        <code>npm i liquid-animated-background</code>
                      </div>
                    </div>
                  </div>

                  <div className="usage-step">
                    <span className="usage-step-num">2</span>
                    <div className="usage-step-body">
                      <p className="usage-step-title">Paste into your component</p>
                      <p className="usage-step-desc">
                        Works with React, Next.js (App Router & Pages), Remix, and any React-based framework.
                      </p>
                      <div className="usage-code-block usage-code-block--lg">
                        <button className="usage-copy-btn" onClick={copyUsage}>
                          {copied === 'usage' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                            </svg>
                          )}
                        </button>
                        <pre><code>{usageSnippet}</code></pre>
                      </div>
                    </div>
                  </div>

                  <div className="usage-step">
                    <span className="usage-step-num">3</span>
                    <div className="usage-step-body">
                      <p className="usage-step-title">That's it!</p>
                      <p className="usage-step-desc">
                        Tweak the config above, copy again, and paste to update.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Footer */}
          <div className="panel-footer">
            Developed by{' '}
            <a href="https://github.com/caglaroptimum7" target="_blank" rel="noopener noreferrer">
              Caglar Ergul
            </a>
            {' '}at{' '}
            <a href="https://optimum7.com" target="_blank" rel="noopener noreferrer">
              Optimum7
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
