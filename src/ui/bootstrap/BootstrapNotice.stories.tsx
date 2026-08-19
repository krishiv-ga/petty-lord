import type { Meta, StoryObj } from '@storybook/react-vite';
import { BootstrapNotice } from './BootstrapNotice';

const meta = {
  title: 'Bootstrap/Text Notice',
  component: BootstrapNotice,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof BootstrapNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RepositoryReady: Story = {
  args: {
    children: 'Repository foundation ready for the first implementation wave.',
  },
};
