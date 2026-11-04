import { setProjectAnnotations } from '@storybook/react-vite';
import { afterAll } from 'vitest';

import { engineModes } from '../src/core/engine/utils/cache/engineModes';
import { withStoryPanels } from '../stories/components/panels/withStoryPanels';
import preview from './preview';

setProjectAnnotations([preview, { decorators: [withStoryPanels] }]);
const previousMode = engineModes.gateSelection;
engineModes.setMode(
  'gateSelection',
  import.meta.env.VITE_SCHEMA_FORM_GATE_SELECTION_MODE === 'table'
    ? 'table'
    : 'verify',
);

afterAll(() => engineModes.setMode('gateSelection', previousMode));
