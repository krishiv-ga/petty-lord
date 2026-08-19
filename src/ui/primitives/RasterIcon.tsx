import { useEffect, useState } from 'react';
import type { RasterAsset } from '../../assets/raster/contracts';
import { rasterFallbackSource, rasterSrcSet } from '../../assets/raster/contracts';
import styles from './RasterIcon.module.css';

export type RasterIconState = 'default' | 'disabled' | 'selected' | 'warning';
export type RasterIconVisibility = 'none' | 'public' | 'private';

export type RasterIconProps = {
  readonly asset: RasterAsset;
  readonly alt: string;
  readonly className?: string;
  readonly state?: RasterIconState;
  readonly visibility?: RasterIconVisibility;
  readonly loading?: 'eager' | 'lazy';
  readonly onLoadStateChange?: (state: 'loading' | 'loaded' | 'error') => void;
};

const visibleStateLabels: Partial<Record<RasterIconState | RasterIconVisibility, string>> = {
  selected: 'Selected',
  warning: 'Warning',
  disabled: 'Disabled',
  public: 'Public',
  private: 'Private',
};

export function RasterIcon({
  asset,
  alt,
  className,
  state = 'default',
  visibility = 'none',
  loading = 'lazy',
  onLoadStateChange,
}: RasterIconProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const assetId = asset.id;

  useEffect(() => {
    if (!assetId) return;
    setLoadState('loading');
    onLoadStateChange?.('loading');
  }, [assetId, onLoadStateChange]);

  const meaningful = alt.trim().length > 0;
  const stateLabel = visibleStateLabels[state];
  const visibilityLabel = visibleStateLabels[visibility];

  const reportLoad = (nextState: 'loaded' | 'error') => {
    setLoadState(nextState);
    onLoadStateChange?.(nextState);
    if (nextState === 'error' && import.meta.env.DEV) {
      console.warn(`[RasterIcon] Missing raster asset: ${asset.id}`);
    }
  };

  return (
    <span
      className={[styles.frame, className].filter(Boolean).join(' ')}
      data-asset-id={asset.id}
      data-load-state={loadState}
      data-raster-state={state}
      data-visibility={visibility}
      style={{ width: asset.width, height: asset.height }}
      {...(meaningful
        ? loadState === 'error'
          ? { role: 'img', 'aria-label': `${alt} — image unavailable` }
          : {}
        : { 'aria-hidden': true })}
    >
      {loadState !== 'error' ? (
        <img
          className={styles.image}
          src={rasterFallbackSource(asset)}
          srcSet={rasterSrcSet(asset)}
          width={asset.width}
          height={asset.height}
          alt={alt}
          loading={loading}
          decoding="async"
          draggable={false}
          onLoad={() => reportLoad('loaded')}
          onError={() => reportLoad('error')}
        />
      ) : (
        <span className={styles.fallback} aria-hidden="true">
          <span>Image</span>
          <span>missing</span>
        </span>
      )}
      {visibilityLabel ? (
        <span className={styles.visibilityLabel} aria-hidden="true">
          {visibilityLabel}
        </span>
      ) : null}
      {stateLabel ? (
        <span className={styles.stateLabel} aria-hidden="true">
          {stateLabel}
        </span>
      ) : null}
    </span>
  );
}
