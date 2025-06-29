import React from 'react';

import type { Preview } from '@storybook/react-vite';

import {
  LOCAL_STORAGE_THEME_KEY,
  Theme,
} from '../../../aileron/constants/storybook';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: Theme.LIGHT,
      toolbar: {
        icon: 'circlehollow',
        items: [Theme.LIGHT, Theme.DARK],
        showName: true,
      },
    },
  },
};

export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme;
    const prevTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (prevTheme !== theme) {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
      window.top?.location.reload();
    }
    return <Story />;
  },
];

export default preview;
