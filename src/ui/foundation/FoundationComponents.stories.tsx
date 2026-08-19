import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { placeholderRasterAssets } from '../../assets/raster/placeholders';
import { Button, IconActionButton } from '../primitives/Button';
import { Dialog, Popover, SegmentedTabs, Tooltip } from '../primitives/RadixWrappers';
import styles from './FoundationStories.module.css';
import {
  AllegianceRibbon,
  ChronicleLine,
  DeltaAnnouncer,
  IntelligenceAge,
  ParchmentPanel,
  ReasonRow,
  ResourceDatum,
  SealStatus,
  StateNotice,
} from './PoliticalObjects';

function ButtonStates() {
  return (
    <main className={`${styles.gallery} pl-foundation-scope`}>
      <h1>Action controls</h1>
      <section className={styles.group}>
        <h2>Default, hover/focus target, disabled and error-adjacent</h2>
        <div className={styles.row}>
          <Button variant="primary">Seal the offer</Button>
          <Button variant="secondary">Read consequences</Button>
          <Button variant="danger">Break agreement</Button>
          <Button variant="text">Return</Button>
          <Button disabled>Unavailable · requires Ailing</Button>
          <IconActionButton
            asset={placeholderRasterAssets.seal}
            label="Seal proclamation"
            variant="primary"
          />
          <Tooltip content="Icon-only controls keep a semantic label and keyboard tooltip.">
            <IconActionButton
              asset={placeholderRasterAssets.seal}
              label="Open the seal ledger"
              compact
            />
          </Tooltip>
        </div>
      </section>
      <StateNotice
        kind="error"
        title="The charter cannot be sealed"
        detail="Mara’s named collateral was withdrawn before acceptance. No resources were spent."
      />
    </main>
  );
}

function PoliticalStates() {
  return (
    <main className={`${styles.gallery} pl-foundation-scope`}>
      <h1>Political state grammar</h1>
      <section className={styles.group}>
        <div className={styles.stateGrid}>
          {(
            [
              'public',
              'private',
              'stale',
              'unknown',
              'coerced',
              'occupied',
              'invalid',
              'urgent',
            ] as const
          ).map((tone) => (
            <SealStatus
              asset={placeholderRasterAssets.seal}
              label={tone === 'coerced' ? 'Under duress' : tone}
              tone={tone}
              key={tone}
            />
          ))}
        </div>
      </section>
      <section className={styles.group}>
        <div className={styles.stateGrid}>
          <AllegianceRibbon level="none" />
          <AllegianceRibbon level="leaning" visibility="private" />
          <AllegianceRibbon level="pledged" />
          <AllegianceRibbon level="committed" />
          <AllegianceRibbon level="duress" />
        </div>
      </section>
      <section className={styles.group}>
        <div className={styles.stateGrid}>
          <IntelligenceAge state="public" observed="current" />
          <IntelligenceAge state="private" observed="Day 31" />
          <IntelligenceAge state="fresh" observed="1 day old" />
          <IntelligenceAge state="stale" observed="7 days old" />
          <IntelligenceAge state="unknown" />
        </div>
      </section>
      <ParchmentPanel eyebrow="Inspector fragment" title="Why Edric still withholds support">
        <ReasonRow
          label="Attitude"
          disposition="supports"
          reason="He respects the public victory at Westmarch."
        />
        <ReasonRow
          label="Proof"
          disposition="conditional"
          reason="Comparable public military position must survive until dawn."
        />
        <ReasonRow
          label="Private desire"
          disposition="unknown"
          reason="No current report reveals which office he now expects."
        />
        <ChronicleLine day="Day 31 · Bell IV" category="court" unread>
          Edric’s envoy arrived carrying an unbroken iron seal.
        </ChronicleLine>
      </ParchmentPanel>
      <div className={styles.row}>
        <ResourceDatum label="Gold" value="74" detail="20 reserved" />
        <ResourceDatum label="Levies" value="286 / 420" detail="100 locked" urgent />
      </div>
      <DeltaAnnouncer message="Prestige +8 — Victory at Westmarch" />
    </main>
  );
}

function LoadingStateSpecimen() {
  return (
    <main className={`${styles.gallery} pl-foundation-scope`}>
      <h1>Stable loading-state contract</h1>
      <StateNotice
        kind="loading"
        title="The clerk is opening the sealed register"
        detail="Known content remains absent until the raster and record projection have loaded."
      />
      <p>
        This story deliberately remains loading so motion and announcement behavior can be tested.
      </p>
    </main>
  );
}

function RadixBehaviors() {
  return (
    <main className={`${styles.gallery} pl-foundation-scope`}>
      <h1>Project-owned Radix behavior wrappers</h1>
      <div className={styles.behaviorGrid}>
        <ParchmentPanel title="Dialog focus contract" eyebrow="Behavior, not theme">
          <Dialog
            trigger={<Button variant="primary">Open the royal notice</Button>}
            title="A sealed demand awaits"
            description="Focus enters this letter, remains trapped, and returns to the opening control."
          >
            <p>No visible Radix theme or icon is used.</p>
          </Dialog>
        </ParchmentPanel>
        <ParchmentPanel title="Popover and tabs" eyebrow="Keyboard-operable records">
          <Popover title="Known consequence" trigger={<Button>Read consequence</Button>}>
            The public offer will be visible to every informed court.
          </Popover>
          <SegmentedTabs
            label="Evidence registers"
            items={[
              { value: 'public', label: 'Public', content: <p>One public Pledge is recorded.</p> },
              {
                value: 'private',
                label: 'Private',
                content: <p>One Leaning was seen on Day 31.</p>,
              },
            ]}
          />
        </ParchmentPanel>
      </div>
    </main>
  );
}

const meta = {
  title: 'Foundation/Component contracts',
  component: ButtonStates,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'minimumDesktop' } },
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonStates>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionsDefaultFocusDisabledError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Seal the offer' })).toHaveFocus();
    await userEvent.hover(canvas.getByRole('button', { name: 'Read consequences' }));
  },
};

export const PublicPrivateStaleUnknownCoerced: Story = {
  render: () => <PoliticalStates />,
};

export const DialogPopoverAndTabFocus: Story = {
  render: () => <RadixBehaviors />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open the royal notice' });
    await userEvent.click(trigger);
    const body = within(document.body);
    await expect(body.getByRole('dialog', { name: 'A sealed demand awaits' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};

export const RadixBehaviorsWithoutScriptedPlay: Story = {
  render: () => <RadixBehaviors />,
};

export const StableLoadingState: Story = {
  render: () => <LoadingStateSpecimen />,
};
