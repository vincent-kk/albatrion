// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { interactionStateStages, playScenario, validationStateFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { SchemaNodeState } from '../../../src';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { readStateNames } from '../components/readStateNames';

export default { title: 'Features/ValidationState/InteractionState', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(validationStateFeatureScenarios, 'validation-state.interaction-state');
const probe = createHandleProbe();
const onStateChange = fn();

/** Shared scenario `validation-state.interaction-state`, driven through interactionStateStages. */
export const DirtyTouchedAndNotifications: Story = {
  args: { scenario, formProps: { onStateChange }, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    onStateChange.mockClear();
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    const title = canvasElement.querySelector<HTMLInputElement>('input[id="/title"]')!;
    for (const stage of interactionStateStages) {
      const before = onStateChange.mock.calls.length;
      if (stage.act === 'type' || stage.act === 'returnAndType') await userEvent.type(title, stage.text!);
      else if (stage.act === 'blur') await userEvent.tab();
      else if (stage.act === 'clearState') handle.clearState();
      else if (stage.act === 'setState') handle.setState({ [SchemaNodeState.Touched]: true });
      await expectEventually(
        () => ({ state: readStateNames(handle.getState()), notifications: onStateChange.mock.calls.length - before }),
        { state: stage.state, notifications: stage.notifications },
        `after ${stage.act}`,
      );
      if (stage.notifications) expect(readStateNames(onStateChange.mock.lastCall![0]), `notified state after ${stage.act}`).toEqual(stage.state);
    }
  },
};
