// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { inputComponentsFeatureScenarios, playScenario, propsFlowAttributes } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/InputComponents/PropsFlow', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(inputComponentsFeatureScenarios, 'input-components.props-flow');

/** Shared scenario `input-components.props-flow`: presentation props and control states become input attributes. */
export const PresentationAndStates: Story = {
  args: { scenario },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    for (const [path, expected] of Object.entries(propsFlowAttributes)) {
      const read = () => {
        const input = canvasElement.querySelector<HTMLInputElement>(`input[id="${path}"]`)!;
        return Object.fromEntries(Object.keys(expected).map((key) => [key,
          key === 'className' ? input.className : key === 'placeholder' ? input.placeholder : key === 'readOnly' ? input.readOnly : input.disabled]));
      };
      await expectEventually(read, expected, `attributes at ${path}`);
    }
  },
};
