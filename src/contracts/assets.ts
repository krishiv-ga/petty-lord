import {
  characterPortraits,
  type PortraitSlot,
  type PortraitSlotStatus,
  type RivalPortraitId,
} from '../assets/raster/characterPortraits';
import { type RasterAsset, validateRasterAsset } from '../assets/raster/contracts';
import { missingRasterAsset } from '../assets/raster/placeholders';
import type { GameContent } from './content';

export type CharacterAssetSlot = `character.${RivalPortraitId}.${PortraitSlot}`;

export interface RasterManifestEntry {
  readonly asset: RasterAsset;
  readonly contentSlotId: string;
  readonly semanticSlot: CharacterAssetSlot;
  readonly status: PortraitSlotStatus;
}

export interface RasterAssetResolution {
  readonly available: boolean;
  readonly asset: RasterAsset;
  readonly entry?: RasterManifestEntry;
  readonly warning?: string;
}

const rivalIds = ['edric', 'ysabel', 'renard', 'oswin', 'mara'] as const;
const portraitSlots = ['full', 'bust', 'tight'] as const;

export function createFoundationRasterManifest(
  content: GameContent,
): Readonly<Record<CharacterAssetSlot, RasterManifestEntry>> {
  const contentSlots = new Set(content.assets.map((slot) => slot.id));
  const entries = rivalIds.flatMap((lordId) => {
    return portraitSlots.map((slot) => {
      const portrait = characterPortraits[lordId][slot];
      const contentSlotId = `character-${lordId}-${slot}`;
      const contentSlot = content.assets.find(({ id }) => id === contentSlotId);
      if (!contentSlot || !contentSlots.has(contentSlotId)) {
        throw new Error(`Canonical content is missing raster slot ${contentSlotId}`);
      }
      const asset: RasterAsset = Object.freeze({
        ...portrait.asset,
        sources: Object.freeze(
          portrait.asset.sources.map((source) => Object.freeze({ ...source })),
        ) as RasterAsset['sources'],
      });
      const errors = validateRasterAsset(asset);
      const densities = asset.sources.map(({ density }) => density);
      if (
        errors.length > 0 ||
        asset.width !== contentSlot.logicalWidth ||
        asset.height !== contentSlot.logicalHeight ||
        densities.length !== contentSlot.densities.length ||
        densities.some((density) => !contentSlot.densities.includes(density))
      ) {
        throw new Error(
          `Raster slot ${contentSlotId} violates its content contract: ${errors.join(' ') || 'dimensions or densities differ'}`,
        );
      }
      const semanticSlot: CharacterAssetSlot = `character.${lordId}.${slot}`;
      return [
        semanticSlot,
        Object.freeze({
          asset,
          contentSlotId,
          semanticSlot,
          status: portrait.status,
        }),
      ] as const;
    });
  });
  return Object.freeze(Object.fromEntries(entries)) as Readonly<
    Record<CharacterAssetSlot, RasterManifestEntry>
  >;
}

export function resolveFoundationRasterAsset(
  manifest: Readonly<Record<CharacterAssetSlot, RasterManifestEntry>>,
  semanticSlot: string,
): RasterAssetResolution {
  if (Object.hasOwn(manifest, semanticSlot)) {
    const entry = manifest[semanticSlot as CharacterAssetSlot];
    const errors = validateRasterAsset(entry.asset);
    if (errors.length > 0) {
      return {
        available: false,
        asset: missingRasterAsset,
        warning: `Invalid raster manifest entry ${semanticSlot}: ${errors.join(' ')}`,
      };
    }
    return {
      available: true,
      asset: entry.asset,
      entry,
    };
  }
  return {
    available: false,
    asset: missingRasterAsset,
    warning: `Missing raster manifest entry: ${semanticSlot}`,
  };
}
