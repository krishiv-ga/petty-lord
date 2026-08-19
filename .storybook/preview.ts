import type { Preview } from '@storybook/react-vite';
import '../src/styles/global.css';
import '../src/ui/foundation/tokens.css';
import '../src/ui/foundation/base.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'centered',
    viewport: {
      options: {
        minimumDesktop: {
          name: 'Minimum desktop 1280×720',
          styles: { width: '1280px', height: '720px' },
        },
        preferredDesktop: {
          name: 'Preferred desktop 1440×900',
          styles: { width: '1440px', height: '900px' },
        },
        constrainedHeight: {
          name: 'Constrained height 1280×640',
          styles: { width: '1280px', height: '640px' },
        },
      },
    },
  },
};

export default preview;
