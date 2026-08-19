import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActionPreviewLetter,
  CrisisFrameFragment,
  LordPortraitStrip,
  RasterMapHotspotFixture,
} from './CompositionSpikes';

const meta = {
  title: 'Compositions/Political foundation spikes',
  component: LordPortraitStrip,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'minimumDesktop' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LordPortraitStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LordPortraitSupportStrip: Story = {};

export const ActionPreviewLetterWithLongConsequences: Story = {
  render: () => <ActionPreviewLetter />,
};

export const CompactCrisisFrameAtMinimumHeight: Story = {
  render: () => <CrisisFrameFragment />,
};

export const RasterMapWithKeyboardHotspots: Story = {
  render: () => <RasterMapHotspotFixture />,
};

export const PreferredViewportCrisisFrame: Story = {
  render: () => <CrisisFrameFragment />,
  parameters: { viewport: { defaultViewport: 'preferredDesktop' } },
};
