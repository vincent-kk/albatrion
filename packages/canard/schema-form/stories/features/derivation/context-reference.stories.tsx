// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { contextStages, derivationFeatureScenarios, playScenario } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent } from 'storybook/test';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Derivation/ContextReference', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(derivationFeatureScenarios, 'derivation.context-reference');
const probe = createHandleProbe();
const onChange = fn();

/** Shared scenario `derivation.context-reference`, stepping the Form context through contextStages. */
export const ContextStages: Story = {
  args: { scenario, propStages: contextStages.map((stage) => ({ context: stage.context })), onChange, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const [index, stage] of contextStages.entries()) {
      const before = onChange.mock.calls.length;
      if (index > 0) await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Apply next form props"]')!);
      await expectEventually(
        () => ({
          states: { titleReadOnly: handle.findNode('/title')!.readOnly, secretVisible: handle.findNode('/secret')!.visible },
          values: Object.fromEntries(Object.keys(stage.values).map((path) => [path, handle.findNode(path)?.value])),
          changes: onChange.mock.calls.length - before,
        }),
        { states: stage.states, values: stage.values, changes: stage.changes },
        `context stage ${stage.label}`,
      );
    }
  },
};
