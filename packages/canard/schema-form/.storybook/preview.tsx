import React from 'react';

import type { Decorator, Preview } from '@storybook/react-vite';

import {
  LOCAL_STORAGE_THEME_KEY,
  Theme,
} from '../../../aileron/constants/storybook';
import { withStoryPanels } from '../stories/components/panels/withStoryPanels';
import '../stories/styles/form.css';
import '../stories/styles/frame.css';
import '../stories/styles/tokens.css';

const preview: Preview = {
  parameters: {
    controls: {
      exclude:
        /^(scenario|propStages|formProps|providerProps|layout|on[A-Z]\w*)$/,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Usage', 'Features', 'Scenarios', 'Composite', '*'],
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

export const decorators: Decorator[] = [
  (Story, context) => {
    const theme = context.globals.theme ?? Theme.LIGHT;
    document.documentElement.dataset.theme = theme;
    const prevTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (prevTheme !== theme) {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
      if (prevTheme) window.top?.location.reload();
    }
    return <Story />;
  },
  withStoryPanels,
];

export default preview;
