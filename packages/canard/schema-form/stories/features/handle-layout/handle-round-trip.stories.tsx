// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { handleLayoutFeatureScenarios, handleRoundTripIssues, playScenario, settleScenarios } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { createFeatureStory } from '../components/createFeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/HandleLayout/HandleRoundTrip', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(handleLayoutFeatureScenarios, 'handle-layout.handle-round-trip');
const probe = createHandleProbe();

/** Shared scenario `handle-layout.handle-round-trip`, plus the issues handle.validate() returns for the invalid value. */
export const SetValidateReset: Story = {
  args: { scenario, onHandle: probe.onHandle },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    handle.setValue({ name: 'a', age: -1 });
    expect((await handle.validate()).map((issue) => issue.keyword)).toEqual(handleRoundTripIssues);
    expect(handle.getErrors().map((issue) => issue.keyword)).toEqual(handleRoundTripIssues);
  },
};

/** Shared scenario `settle.form-reset-load`. */
export const ResetLoad: Story = createFeatureStory(findScenario(settleScenarios, 'settle.form-reset-load'));
