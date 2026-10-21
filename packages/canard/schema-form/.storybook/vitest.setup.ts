import { setProjectAnnotations } from '@storybook/react-vite';

import { gateSelectionTable } from '../src/core/engine/settle/utils/gates/gateSelectionTable';
import { withStoryPanels } from '../stories/components/panels/withStoryPanels';
import preview from './preview';

setProjectAnnotations([preview, { decorators: [withStoryPanels] }]);
gateSelectionTable.mode =
  import.meta.env.VITE_SCHEMA_FORM_GATE_SELECTION_MODE === 'table'
    ? 'table'
    : 'verify';
