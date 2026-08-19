import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisualLanguageDecisionRecord } from './VisualLanguageDecisionRecord';

const meta = {
  title: 'Foundation/Visual language decision record',
  component: VisualLanguageDecisionRecord,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'preferredDesktop' },
    docs: {
      description: {
        component:
          'The implemented visual-language contract. It records the chancery material vocabulary, hierarchy, density, motion, focus, and rejected generic patterns.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VisualLanguageDecisionRecord>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChanceryDirection: Story = {};
