// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { largeArrayTyped, playScenario, scaleFeatureScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { expectEventually } from '../components/expectEventually';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Scale/LargeArray', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(scaleFeatureScenarios, 'scale.large-array');
const probe = createHandleProbe();

/** Shared scenario `scale.large-array` under default virtualization, then a scroll to the end and typing into the last item. */
export const EditAtBothEnds: Story = {
  args: { scenario, formProps: { virtualization: true }, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    const lastPath = `/items/${handle.findNode('/items')!.children!.length - 1}`;
    const before = handle.findNode(lastPath)!.value;
    canvasElement.querySelector(`[data-path="${lastPath}"]`)?.scrollIntoView({ block: 'center' });
    await expectEventually(() => Boolean(canvasElement.querySelector(`input[id="${lastPath}"]`)), true, `${lastPath} mounts after scrolling`);
    await userEvent.type(canvasElement.querySelector<HTMLInputElement>(`input[id="${lastPath}"]`)!, largeArrayTyped);
    await expectEventually(() => handle.findNode(lastPath)!.value, `${String(before)}${largeArrayTyped}`, `${lastPath} after typing`);
  },
};
