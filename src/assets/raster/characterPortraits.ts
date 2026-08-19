import edricMasterUrl from '../../../assets/characters/edric.png';
import maraMasterUrl from '../../../assets/characters/mara.png';
import oswinMasterUrl from '../../../assets/characters/oswin.png';
import renardMasterUrl from '../../../assets/characters/renard.png';
import ysabelMasterUrl from '../../../assets/characters/ysabel.png';
import type { RasterAsset } from './contracts';

export type RivalPortraitId = 'edric' | 'ysabel' | 'renard' | 'oswin' | 'mara';
export type PortraitSlot = 'full' | 'bust' | 'tight';
export type PortraitSlotStatus = 'production-master' | 'temporary-master-crop';

export type PortraitSlotAsset = {
  readonly slot: PortraitSlot;
  readonly status: PortraitSlotStatus;
  readonly asset: RasterAsset;
};

export type CharacterPortraitSet = {
  readonly full: PortraitSlotAsset;
  readonly bust: PortraitSlotAsset;
  readonly tight: PortraitSlotAsset;
};

const temporaryRoot = '/assets/placeholders/ui';

function fullMaster(
  id: RivalPortraitId,
  src: string,
  width: number,
  height: number,
): PortraitSlotAsset {
  return {
    slot: 'full',
    status: 'production-master',
    asset: {
      id: `character-${id}-full-master`,
      width,
      height,
      sources: [{ src, density: 1 }],
    },
  };
}

function temporaryCrop(
  id: RivalPortraitId,
  slot: 'bust' | 'tight',
  size: 80 | 64,
): PortraitSlotAsset {
  return {
    slot,
    status: 'temporary-master-crop',
    asset: {
      id: `character-${id}-${slot}-temporary-master-crop`,
      width: size,
      height: size,
      placeholder: true,
      sources: [
        { src: `${temporaryRoot}/${id}-${slot}-temporary@1x.png`, density: 1 },
        { src: `${temporaryRoot}/${id}-${slot}-temporary@2x.png`, density: 2 },
      ],
    },
  };
}

export const characterPortraits = {
  edric: {
    full: fullMaster('edric', edricMasterUrl, 1024, 1536),
    bust: temporaryCrop('edric', 'bust', 80),
    tight: temporaryCrop('edric', 'tight', 64),
  },
  ysabel: {
    full: fullMaster('ysabel', ysabelMasterUrl, 1024, 1536),
    bust: temporaryCrop('ysabel', 'bust', 80),
    tight: temporaryCrop('ysabel', 'tight', 64),
  },
  renard: {
    full: fullMaster('renard', renardMasterUrl, 1024, 1536),
    bust: temporaryCrop('renard', 'bust', 80),
    tight: temporaryCrop('renard', 'tight', 64),
  },
  oswin: {
    full: fullMaster('oswin', oswinMasterUrl, 1086, 1448),
    bust: temporaryCrop('oswin', 'bust', 80),
    tight: temporaryCrop('oswin', 'tight', 64),
  },
  mara: {
    full: fullMaster('mara', maraMasterUrl, 1024, 1536),
    bust: temporaryCrop('mara', 'bust', 80),
    tight: temporaryCrop('mara', 'tight', 64),
  },
} as const satisfies Record<RivalPortraitId, CharacterPortraitSet>;

export function isRivalPortraitId(id: string): id is RivalPortraitId {
  return Object.hasOwn(characterPortraits, id);
}
