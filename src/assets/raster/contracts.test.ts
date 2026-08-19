/// <reference types="node" />

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { characterPortraits } from './characterPortraits';
import { rasterFallbackSource, rasterSrcSet, validateRasterAsset } from './contracts';
import { placeholderRasterAssets } from './placeholders';

function pngDimensions(filename: string): { readonly width: number; readonly height: number } {
  const bytes = readFileSync(filename);
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function walkFiles(root: string): readonly string[] {
  return readdirSync(root).flatMap((entry) => {
    const absolute = path.join(root, entry);
    return statSync(absolute).isDirectory() ? walkFiles(absolute) : [absolute];
  });
}

describe('raster asset contract', () => {
  it('builds ordered density sources with a stable 1x fallback', () => {
    expect(rasterFallbackSource(placeholderRasterAssets.seal)).toContain('@1x.png');
    expect(rasterSrcSet(placeholderRasterAssets.seal)).toMatch(
      /seal-placeholder@1x\.png 1x, .*seal-placeholder@2x\.png 2x/,
    );
    expect(validateRasterAsset(placeholderRasterAssets.seal)).toEqual([]);
  });

  it('ships the documented raster dimensions at 1x and 2x', () => {
    for (const asset of Object.values(placeholderRasterAssets)) {
      for (const source of asset.sources) {
        const filename = path.join('public', source.src.replace(/^\//, ''));
        expect(pngDimensions(filename)).toEqual({
          width: asset.width * source.density,
          height: asset.height * source.density,
        });
      }
    }
  });

  it('rejects non-raster and incomplete descriptors', () => {
    expect(
      validateRasterAsset({
        id: 'bad-vector',
        width: 16,
        height: 16,
        sources: [{ src: '/bad/icon.svg', density: 2 }],
      }),
    ).toEqual([
      'bad-vector requires a 1x fallback source.',
      'bad-vector source must be PNG or WebP: /bad/icon.svg',
    ]);
    expect(
      validateRasterAsset({
        id: 'spoofed-vector',
        width: 16,
        height: 16,
        sources: [{ src: 'data:image/svg+xml,<svg/>.png', density: 1 }],
      }),
    ).toEqual(['spoofed-vector source must be PNG or WebP: data:image/svg+xml,<svg/>.png']);
  });

  it('freezes production full, temporary bust, and temporary tight portrait slots', () => {
    expect(Object.keys(characterPortraits)).toEqual(['edric', 'ysabel', 'renard', 'oswin', 'mara']);

    for (const [id, portraits] of Object.entries(characterPortraits)) {
      expect(Object.isFrozen(portraits)).toBe(true);
      expect(Object.isFrozen(portraits.full.asset)).toBe(true);
      expect(Object.isFrozen(portraits.full.asset.sources)).toBe(true);
      expect(Object.isFrozen(portraits.full.asset.sources[0])).toBe(true);
      expect(() => {
        (portraits.full.asset.sources[0] as { src: string }).src = 'data:image/svg+xml,<svg/>';
      }).toThrow();
      expect(portraits.full).toMatchObject({ slot: 'full', status: 'production-master' });
      expect(portraits.full.asset.placeholder).not.toBe(true);
      expect(rasterFallbackSource(portraits.full.asset)).toMatch(
        new RegExp(`/assets/characters/${id}(?:\\.[a-z0-9]+)?\\.png(?:\\?.*)?$`),
      );

      for (const slot of ['bust', 'tight'] as const) {
        const portrait = portraits[slot];
        expect(portrait).toMatchObject({ slot, status: 'temporary-master-crop' });
        expect(portrait.asset.placeholder).toBe(true);
        expect(validateRasterAsset(portrait.asset)).toEqual([]);

        for (const source of portrait.asset.sources) {
          const filename = path.join('public', source.src.replace(/^\//, ''));
          expect(pngDimensions(filename)).toEqual({
            width: portrait.asset.width * source.density,
            height: portrait.asset.height * source.density,
          });
        }
      }
    }
  });
});

describe('project-authored vector prohibition', () => {
  it('contains no shipped SVG file', () => {
    const shippedFiles = [...walkFiles('src'), ...walkFiles('public')].filter(
      (filename) => !filename.endsWith('.test.ts'),
    );
    expect(shippedFiles.filter((filename) => filename.toLowerCase().endsWith('.svg'))).toEqual([]);
  });

  it('contains no inline SVG, SVG data/mask, icon-font, or prohibited icon import', () => {
    const codeFiles = [...walkFiles('src'), ...walkFiles('public')].filter(
      (filename) =>
        /\.(?:ts|tsx|css|html)$/i.test(filename) &&
        !filename.endsWith('.test.ts') &&
        !filename.endsWith('.stories.tsx'),
    );
    const source = codeFiles.map((filename) => readFileSync(filename, 'utf8')).join('\n');
    const forbidden = [
      /<\s*svg\b/i,
      /data:image\/svg/i,
      /(?:mask|mask-image)\s*:[^;]*\.svg/i,
      /@(?:heroicons|fortawesome)\//i,
      /(?:from|import\s*\()["'](?:lucide|@radix-ui\/react-icons|@tabler\/icons|phosphor|iconify)/i,
      /font-family\s*:\s*["']?(?:Font Awesome|Material Icons|IcoMoon)/i,
    ];

    for (const pattern of forbidden) expect(source).not.toMatch(pattern);
  });
});
