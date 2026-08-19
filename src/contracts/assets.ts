import {
  characterPortraits,
  type PortraitSlot,
  type PortraitSlotStatus,
  type RivalPortraitId,
} from '../assets/raster/characterPortraits';
import type { RasterAsset } from '../assets/raster/contracts';
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
    const contentSlotId = `portrait-${lordId}`;
    if (!contentSlots.has(contentSlotId)) {
      throw new Error(`Canonical content is missing raster slot ${contentSlotId}`);
    }
    return portraitSlots.map((slot) => {
      const portrait = characterPortraits[lordId][slot];
      const semanticSlot: CharacterAssetSlot = `character.${lordId}.${slot}`;
      return [
        semanticSlot,
        Object.freeze({
          asset: portrait.asset,
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
    return {
      available: true,
      asset: manifest[semanticSlot as CharacterAssetSlot].asset,
      entry: manifest[semanticSlot as CharacterAssetSlot],
    };
  }
  return {
    available: false,
    asset: missingRasterAsset,
    warning: `Missing raster manifest entry: ${semanticSlot}`,
  };
}
