// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { inputComponentsFeatureScenarios, playScenario, trimStages } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/InputComponents/TrimOnBlur', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(inputComponentsFeatureScenarios, 'input-components.trim-on-blur');
const probe = createHandleProbe();

/** Shared scenario `input-components.trim-on-blur`, driven through trimStages. */
export const TrimAfterBlurOnly: Story = {
  args: { scenario, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const [index, stage] of trimStages.entries()) {
      const field = canvasElement.querySelector<HTMLInputElement>(`input[id="${stage.path}"]`)!;
      if (stage.act === 'type') await userEvent.type(field, stage.text!);
      else await userEvent.tab();
      await expectEventually(
        () => Object.fromEntries(Object.keys(stage.values).map((path) => [path, handle.findNode(path)?.value])),
        stage.values,
        `values after stage ${index} ${stage.act} ${stage.path}`,
      );
    }
  },
};
