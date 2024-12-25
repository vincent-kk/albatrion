import React from 'react';

import type { Preview } from '@storybook/react';
import { ConfigProvider } from 'antd';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Page', 'Components', '*'],
      },
    },
    decorators: [
      (Story) => (
        <ConfigProvider theme={{ token: { colorError: '#ff4d4f' } }}>
          <Story />
        </ConfigProvider>
      ),
    ],
  },
};

export default preview;
