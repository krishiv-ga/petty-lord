export type RasterDensitySource = {
  readonly src: string;
  readonly density: 1 | 2;
};

export type RasterAsset = {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly sources: readonly [RasterDensitySource, ...RasterDensitySource[]];
  readonly placeholder?: boolean;
};

export function rasterSrcSet(asset: RasterAsset): string {
  return [...asset.sources]
    .sort((left, right) => left.density - right.density)
    .map(({ src, density }) => `${src} ${density}x`)
    .join(', ');
}

export function rasterFallbackSource(asset: RasterAsset): string {
  return asset.sources.find(({ density }) => density === 1)?.src ?? asset.sources[0].src;
}

export function validateRasterAsset(asset: RasterAsset): readonly string[] {
  const errors: string[] = [];

  if (!asset.id.trim()) errors.push('Raster asset id is required.');
  if (!Number.isInteger(asset.width) || asset.width <= 0) {
    errors.push(`${asset.id || 'Raster asset'} width must be a positive integer.`);
  }
  if (!Number.isInteger(asset.height) || asset.height <= 0) {
    errors.push(`${asset.id || 'Raster asset'} height must be a positive integer.`);
  }
  if (!asset.sources.some(({ density }) => density === 1)) {
    errors.push(`${asset.id || 'Raster asset'} requires a 1x fallback source.`);
  }
  for (const { src } of asset.sources) {
    if (!/\.(png|webp)(?:\?.*)?$/i.test(src)) {
      errors.push(`${asset.id || 'Raster asset'} source must be PNG or WebP: ${src}`);
    }
  }

  return errors;
}
