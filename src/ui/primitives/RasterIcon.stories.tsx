import type { Meta, StoryObj } from '@storybook/react-vite';
import { missingRasterAsset, placeholderRasterAssets } from '../../assets/raster/placeholders';
import styles from '../foundation/FoundationStories.module.css';
import { IconActionButton } from './Button';
import { RasterIcon } from './RasterIcon';

function RasterIconGallery() {
  return (
    <main className={`${styles.gallery} pl-foundation-scope`}>
      <h1>Raster asset contract</h1>
      <p>
        Logical dimensions remain fixed; the browser selects 1×/2× density. Each state uses a text
        overlay without altering the source bitmap.
      </p>
      <section className={styles.iconGrid} aria-label="Raster icon states">
        <div>
          <RasterIcon
            asset={placeholderRasterAssets.seal}
            alt="Blank seal fixture"
            loading="eager"
          />
          <span>Meaningful 32×32</span>
        </div>
        <div>
          <RasterIcon asset={placeholderRasterAssets.seal} alt="" loading="eager" />
          <span>Decorative alt empty</span>
        </div>
        <div>
          <RasterIcon
            asset={placeholderRasterAssets.seal}
            alt="Selected claimant seal"
            state="selected"
            visibility="public"
            loading="eager"
          />
          <span>Selected + public</span>
        </div>
        <div>
          <RasterIcon
            asset={placeholderRasterAssets.seal}
            alt="Warning seal"
            state="warning"
            visibility="private"
            loading="eager"
          />
          <span>Warning + private</span>
        </div>
        <div>
          <RasterIcon
            asset={placeholderRasterAssets.seal}
            alt="Disabled seal"
            state="disabled"
            loading="eager"
          />
          <span>Disabled</span>
        </div>
        <div>
          <RasterIcon asset={missingRasterAsset} alt="Missing clerk seal" loading="eager" />
          <span>Deliberate error fallback</span>
        </div>
      </section>
      <section className={styles.group}>
        <h2>Icon-only control contract</h2>
        <IconActionButton
          asset={placeholderRasterAssets.seal}
          label="Seal the proclamation"
          compact
          variant="primary"
        />
        <p>The visible image is decorative; the button’s required label names the action.</p>
      </section>
    </main>
  );
}

const meta = {
  title: 'Primitives/RasterIcon',
  component: RasterIconGallery,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'minimumDesktop' } },
  tags: ['autodocs'],
} satisfies Meta<typeof RasterIconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DensitySemanticsAndFallback: Story = {};
