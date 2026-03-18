# Liquid Animated Background Configurator

[![Deploy to GitHub Pages](https://github.com/caglaroptimum7/liquid-animated-background-configurator/actions/workflows/deploy.yml/badge.svg)](https://github.com/caglaroptimum7/liquid-animated-background-configurator/actions/workflows/deploy.yml)

A visual configurator tool for creating beautiful, animated liquid/blob gradient backgrounds. Design your background in real-time, then export the config to use in your React or Next.js project via the [`liquid-animated-background`](https://www.npmjs.com/package/liquid-animated-background) npm package.

## Demo

**[Live Demo](https://caglaroptimum7.github.io/liquid-animated-background-configurator/)**

## What is this?

This is an interactive web-based tool that lets you visually design animated liquid gradient backgrounds. Instead of tweaking code by hand, you adjust sliders, pick colors, and toggle settings — all while seeing the result live behind the configurator panel.

Once you're happy with the result, you can:

1. **Copy JSON** — exports the raw config object
2. **Copy HTML** — exports a self-contained HTML/Canvas snippet you can drop into any page
3. **Copy as React component** — exports a ready-to-paste React component with the npm package import

## Features

### Configurable Properties

| Property              | Description                                      | Range                                             |
| --------------------- | ------------------------------------------------ | ------------------------------------------------- |
| **Background Color**  | Base color behind the blobs                      | Any CSS color                                     |
| **Blobs**             | Individual gradient orbs with independent colors  | Add/remove freely, each with its own color picker |
| **Blur**              | CSS blur filter on the canvas                    | 0 – 200px                                        |
| **Opacity**           | Canvas transparency                              | 0 – 1                                            |
| **Speed**             | Animation speed multiplier                       | 0 – 20                                           |
| **Blob Size**         | Radius of each blob as a fraction of canvas      | 10% – 150%                                       |
| **Blend Mode**        | CSS blend mode for the canvas layer              | 16 modes (screen, multiply, overlay, etc.)        |
| **Mouse Interaction** | Blobs react to cursor/touch movement             | On / Off                                          |

### Export Options

- **Copy JSON** — Copies the configuration object to clipboard. Paste it directly into the `config` prop of the `<LiquidBackground>` component.
- **Copy HTML** — Copies a standalone HTML snippet with embedded `<canvas>` and `<script>`. Works anywhere — no framework required.
- **Use as npm package** — Expandable section at the bottom of the panel that shows step-by-step instructions for installing and using the [`liquid-animated-background`](https://www.npmjs.com/package/liquid-animated-background) npm package with your current config.

## Using Your Config in a Project

### 1. Install the package

```bash
npm install liquid-animated-background
```

### 2. Paste the config

Open the configurator, design your background, click **"Copy JSON"**, and paste it into your component:

```tsx
import { LiquidBackground } from 'liquid-animated-background';

const config = {
  "backgroundColor": "#000000",
  "blobs": [
    { "color": "#3843D0", "t": 0 },
    { "color": "#ff72e3", "t": 2 },
    { "color": "#000000", "t": 4 },
    { "color": "#2f39ba", "t": 6 }
  ],
  "blur": 100,
  "opacity": 1,
  "speed": 5,
  "blendMode": "screen",
  "interactive": true,
  "blobRadius": 0.5
};

export default function Page() {
  return (
    <LiquidBackground config={config} style={{ position: 'fixed', inset: 0 }}>
      <h1 style={{ color: 'white' }}>Your content here</h1>
    </LiquidBackground>
  );
}
```

Works with **React**, **Next.js** (App Router & Pages Router), **Remix**, and any React-based framework.

## Running Locally

```bash
git clone https://github.com/caglaroptimum7/liquid-animated-background-configurator.git
cd liquid-animated-background-configurator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** — fast dev server and build
- **Canvas API** — low-level 2D rendering for the animated blobs
- **GitHub Pages** — automated deployment via GitHub Actions

## Related

- [`liquid-animated-background`](https://www.npmjs.com/package/liquid-animated-background) — the npm package that renders the background from a config object
- [Package source code](https://github.com/caglaroptimum7/liquid-animated-background-pkg)

## License

MIT

---

Developed by [Caglar Ergul](https://github.com/caglaroptimum7) at [Optimum7](https://optimum7.com)

Copyright &copy; 2026 [Caglar Ergul](https://github.com/caglaroptimum7) / [Optimum7](https://optimum7.com). All rights reserved.
