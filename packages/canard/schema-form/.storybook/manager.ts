import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

import {
  LOCAL_STORAGE_THEME_KEY,
  Theme,
} from '../../../aileron/constants/storybook';
import { toDisplayLabel } from '../stories/components/panels/utils/toDisplayLabel';

const userPref = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) ?? Theme.LIGHT;

addons.setConfig({
  theme: create({
    base: userPref === Theme.DARK ? 'dark' : 'light',
    brandTitle: '@canard/schema-form',
  }),
  // Labels only: titles and export names keep deriving story IDs, links and test names.
  sidebar: { renderLabel: (item) => toDisplayLabel(item.name) },
});
