import type { RasterAsset } from './contracts';

const placeholderRoot = '/assets/placeholders/ui';

export const placeholderRasterAssets = {
  mapPlate: {
    id: 'placeholder-map-plate',
    width: 720,
    height: 480,
    placeholder: true,
    sources: [
      { src: `${placeholderRoot}/map-plate-placeholder@1x.png`, density: 1 },
      { src: `${placeholderRoot}/map-plate-placeholder@2x.png`, density: 2 },
    ],
  },
  portrait: {
    id: 'placeholder-anonymous-portrait',
    width: 80,
    height: 80,
    placeholder: true,
    sources: [
      { src: `${placeholderRoot}/portrait-placeholder@1x.png`, density: 1 },
      { src: `${placeholderRoot}/portrait-placeholder@2x.png`, density: 2 },
    ],
  },
  seal: {
    id: 'placeholder-blank-seal',
    width: 32,
    height: 32,
    placeholder: true,
    sources: [
      { src: `${placeholderRoot}/seal-placeholder@1x.png`, density: 1 },
      { src: `${placeholderRoot}/seal-placeholder@2x.png`, density: 2 },
    ],
  },
} as const satisfies Record<string, RasterAsset>;

export const missingRasterAsset: RasterAsset = {
  id: 'fixture-missing-raster',
  width: 32,
  height: 32,
  placeholder: true,
  sources: [{ src: `${placeholderRoot}/intentionally-missing.png`, density: 1 }],
};
