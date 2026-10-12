// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import { eventsFeatureScenarios, playScenario, renderCommitStages } from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Profiler } from 'react';
import { expect } from 'storybook/test';

import { Form, ValidationMode } from '../../../src';

import { FeatureStory } from '../components/FeatureStory';
import { createHandleProbe } from '../components/createHandleProbe';
import { findScenario } from '../components/findScenario';

export default { title: 'Features/Events/RenderCommits', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const scenario = findScenario(eventsFeatureScenarios, 'events.render-commits');
const probe = createHandleProbe();
const commits = { count: 0 };

/**
 * Wrap the default group in a Profiler that counts the commits of its subtree.
 * @returns The layout for FeatureStory's children function.
 */
const layout = () => <Profiler id="group" onRender={() => { commits.count++; }}><Form.Group /></Profiler>;

/** Wait two animation frames so every commit scheduled by the write has landed. */
const nextFrames = async () => {
  for (let frame = 0; frame < 2; frame++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

/**
 * Build a story that writes renderCommitStages and counts the group's commits.
 * @param validated - Whether OnChange validation runs; otherwise the mode is None.
 * @returns The story object.
 */
const createCommitStory = (validated: boolean): Story => ({
  args: { scenario, layout, onHandle: probe.onHandle, ...(!validated && { formProps: { validationMode: ValidationMode.None } }) },
  parameters: { docs: { description: { story: scenario.description } } },
  async play({ args, canvasElement }) {
    await playScenario(args.scenario, canvasElement);
    const handle = await probe.handle(canvasElement);
    for (const stage of renderCommitStages) {
      await nextFrames();
      const start = commits.count;
      if (stage.batch) handle.node!.batch(() => { for (const [key, value] of Object.entries(stage.value)) handle.findNode(`/${key}`)!.setValue(value); });
      else handle.setValue(stage.value);
      await nextFrames();
      const expected = validated ? stage.commitsWithValidation : stage.commits;
      expect({ commits: commits.count - start, value: handle.getValue() }, stage.label).toEqual({ commits: expected, value: stage.value });
    }
  },
});

/** Shared scenario `events.render-commits` with validation mode None: one commit per write. */
export const OneCommitPerWrite: Story = createCommitStory(false);

/** Shared scenario `events.render-commits` with OnChange validation: the validation result commits in its own wave. */
export const ValidationOwnWave: Story = createCommitStory(true);
