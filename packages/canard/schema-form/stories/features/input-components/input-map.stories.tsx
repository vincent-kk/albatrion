// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { inputComponentsFeatureScenarios, inputMapCase, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { readWinner } from './utils/readWinner';
import { toInputMap } from './utils/toInputMap';

export default { title: 'Features/InputComponents/InputMap', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(inputComponentsFeatureScenarios, 'input-components.input-map');

/** Shared scenario `input-components.input-map` with exact, pattern, and wildcard keys from inputMapCase. */
export const ExactPatternAndWildcard: Story = {
  args: { scenario, formProps: { fieldInputMap: toInputMap(inputMapCase.map) } },
  parameters: { docs: { description: { story: `${scenario.description} Map: ${JSON.stringify(inputMapCase.map)}.` } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    await expectEventually(
      () => Object.fromEntries(Object.keys(inputMapCase.winners).map((path) => [path, readWinner(canvasElement, path)])),
      inputMapCase.winners,
      'winners by map key',
    );
  },
};
