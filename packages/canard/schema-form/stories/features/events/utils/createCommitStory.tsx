import { eventsFeatureScenarios, playScenario, renderCommitStages } from '@aileron/schema-form-scenarios';
import type { StoryObj } from '@storybook/react-vite';
import { Profiler } from 'react';
import { expect } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../../components/play/unfocusedPlayReason';

import { Form, ValidationMode } from '../../../../src';

import type { FeatureStory } from '../../components/FeatureStory';
import { createHandleProbe } from '../../components/createHandleProbe';
import { findScenario } from '../../components/findScenario';

const scenario = findScenario(eventsFeatureScenarios, 'events.render-commits');

/** Wait two animation frames so every commit scheduled by the write has landed. */
const nextFrames = async () => {
  for (let frame = 0; frame < 2; frame++) await new Promise((resolve) => requestAnimationFrame(resolve));
};

/**
 * Build a story that writes renderCommitStages and counts the commits of the default group's subtree.
 * @param validated - Whether OnChange validation runs; otherwise the mode is None.
 * @returns The story object; each story gets its own probe and commit counter.
 */
export const createCommitStory = (validated: boolean): StoryObj<typeof FeatureStory> => {
  const probe = createHandleProbe();
  const commits = { count: 0 };
  const layout = () => <Profiler id="group" onRender={() => { commits.count++; }}><Form.Group /></Profiler>;
  return {
    args: { scenario, layout, onHandle: probe.onHandle, ...(!validated && { formProps: { validationMode: ValidationMode.None } }) },
    parameters: { docs: { description: { story: scenario.description } } },
    async play({ args, canvasElement, step }) {
      if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
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
  };
};
