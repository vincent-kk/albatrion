import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming';

import {
  LOCAL_STORAGE_THEME_KEY,
  Theme,
} from '../../../aileron/constants/storybook';

const userPref = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) ?? Theme.LIGHT;

addons.setConfig({
  theme: userPref === Theme.DARK ? themes.dark : themes.light,
});
