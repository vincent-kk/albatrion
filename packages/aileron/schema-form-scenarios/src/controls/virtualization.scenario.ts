import type { FormScenario } from '../types';

import { controlsRenderScenarios } from './render.scenario';

/** TEST-025: the screen consumer enables virtualization for this named scene. */
export const virtualizationScenario: FormScenario = {
  ...controlsRenderScenarios[0],
  name: 'controls.virtualization',
  description: 'TEST-025: virtualized inputs retain the same empty-draft and output contract.',
};
