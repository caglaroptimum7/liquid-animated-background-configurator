export interface BlobConfig {
  color: string;
  t: number;
}

export interface Config {
  backgroundColor: string;
  blobs: BlobConfig[];
  blur: number;
  opacity: number;
  speed: number;
  blendMode: string;
  interactive: boolean;
  blobRadius: number;
}

export const DEFAULT_CONFIG: Config = {
  backgroundColor: '#000000',
  blobs: [
    { color: '#3843D0', t: 0 },
    { color: '#ff72e3', t: 2 },
    { color: '#000000', t: 4 },
    { color: '#2f39ba', t: 6 },
  ],
  blur: 100,
  opacity: 1,
  speed: 5,
  blendMode: 'screen',
  interactive: true,
  blobRadius: 0.5,
};

export const BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
] as const;
