import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { placeholderRasterAssets } from '../../assets/raster/placeholders';
import { IconActionButton } from './Button';
import { RasterIcon } from './RasterIcon';

describe('RasterIcon semantics', () => {
  it('renders fixed logical dimensions, density sources, and a meaningful alt', () => {
    const markup = renderToStaticMarkup(
      createElement(RasterIcon, {
        asset: placeholderRasterAssets.seal,
        alt: 'Public pledge seal',
        loading: 'eager',
      }),
    );

    expect(markup).toContain('width="32"');
    expect(markup).toContain('height="32"');
    expect(markup).toContain('alt="Public pledge seal"');
    expect(markup).toContain('seal-placeholder@1x.png 1x');
    expect(markup).toContain('seal-placeholder@2x.png 2x');
  });

  it('keeps decorative images silent', () => {
    const markup = renderToStaticMarkup(
      createElement(RasterIcon, { asset: placeholderRasterAssets.seal, alt: '' }),
    );
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('alt=""');
  });

  it('requires an accessible label at the icon-only control boundary', () => {
    const markup = renderToStaticMarkup(
      createElement(IconActionButton, {
        asset: placeholderRasterAssets.seal,
        label: 'Seal the proclamation',
        compact: true,
      }),
    );
    expect(markup).toContain('aria-label="Seal the proclamation"');
    expect(markup).toContain('Seal the proclamation');
  });
});
