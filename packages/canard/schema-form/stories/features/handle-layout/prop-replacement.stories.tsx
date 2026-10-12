// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { handleLayoutFeatureScenarios, playScenario, propReplacementStages } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/HandleLayout/PropReplacement', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(handleLayoutFeatureScenarios, 'handle-layout.prop-replacement');
const probe = createHandleProbe();

/** Props staged cumulatively: a stage without a schema or defaultValue keeps the previous one. */
const stages = propReplacementStages.reduce<{ jsonSchema: unknown; defaultValue: unknown }[]>((list, stage) => {
  const previous = list.at(-1) ?? { jsonSchema: scenario.schema, defaultValue: scenario.initialValue };
  return [...list, { jsonSchema: stage.schema ?? previous.jsonSchema, defaultValue: stage.defaultValue ?? previous.defaultValue }];
}, []);

/** Shared scenario `handle-layout.prop-replacement`, driven through propReplacementStages. */
export const ResetLoadsCommittedProps: Story = {
  args: { scenario, propStages: stages, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const [index, stage] of propReplacementStages.entries()) {
      const before = handle.findNode('/name');
      if (index > 0) await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Apply next form props"]')!);
      if (stage.reset) handle.reset();
      await expectEventually(() => ({ outputValue: handle.getValue(), nodeKept: handle.findNode('/name') === before }), { outputValue: stage.outputValue, nodeKept: stage.nodeKept }, `after stage ${index} ${stage.label}`);
    }
  },
};
