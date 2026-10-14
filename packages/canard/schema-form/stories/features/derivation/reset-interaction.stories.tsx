// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { derivationFeatureScenarios, playScenario, resetInteractionStages } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';
import { readStateNames } from '../components/readStateNames';

export default { title: 'Features/Derivation/ResetInteraction', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(derivationFeatureScenarios, 'derivation.reset-interaction');
const probe = createHandleProbe();

/** Shared scenario `derivation.reset-interaction`, driven through resetInteractionStages. */
export const ClearEdgeResetsState: Story = {
  args: { scenario, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    const name = canvasElement.querySelector<HTMLInputElement>('input[id="/name"]')!;
    const clear = canvasElement.querySelector<HTMLInputElement>('input[id="/clear"]')!;
    for (const [index, stage] of resetInteractionStages.entries()) {
      if (stage.act === 'editName') {
        await userEvent.type(name, stage.text!);
        await userEvent.tab();
      } else await userEvent.click(clear);
      const label = `stage ${index} ${stage.act}`;
      await expectEventually(() => readStateNames(handle.findNode('/name')!.state ?? {}), stage.nameState, `/name state after ${label}`);
      await expectEventually(() => Object.fromEntries(Object.keys(stage.values).map((path) => [path, handle.findNode(path)?.value])), stage.values, `values after ${label}`);
    }
  },
};
