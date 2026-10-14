import { setProjectAnnotations } from '@storybook/react-vite';

import { withStoryPanels } from '../stories/components/panels/withStoryPanels';
import preview from './preview';

setProjectAnnotations([preview, { decorators: [withStoryPanels] }]);
