// Loaded by Storybook CSF through the features glob in .storybook/main.ts; each named export is one story.
import {
  playScenario, submitOutcomes, submitScenario, validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, spyOn, userEvent, waitFor } from 'storybook/test';

import { shouldSkipUnfocusedPlay } from '../../components/play/shouldSkipUnfocusedPlay';
import { skipPlay } from '../../components/play/skipPlay';
import { unfocusedPlayReason } from '../../components/play/unfocusedPlayReason';

import { FeatureStory } from '../components/FeatureStory';
import { findScenario } from '../components/findScenario';
import { createHandleProbe } from '../components/createHandleProbe';

export default { title: 'Features/ValidationState/Submit', component: FeatureStory, tags: ['autodocs'] } satisfies Meta<typeof FeatureStory>;
type Story = StoryObj<typeof FeatureStory>;

const rejected = findScenario(validationStateFeatureScenarios, 'validation-state.submit-rejected');
const successSubmit = fn();
const rejectedSubmit = fn();
const enterSubmit = fn();
const enterRejectedSubmit = fn();
const rejectedProbe = createHandleProbe();

/** Shared scenario `validation.submit`: a valid submit calls onSubmit once with the sent value. */
export const SubmitSuccess: Story = {
  args: { scenario: submitScenario, formProps: { onSubmit: successSubmit } },
  parameters: { docs: { description: { story: submitScenario.description ?? submitScenario.name } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    successSubmit.mockClear();
    await playScenario(args.scenario, canvasElement);
    expect(successSubmit).toHaveBeenCalledTimes(1);
  },
};

/** Shared scenario `validation-state.submit-rejected`: the handle's submit rejects and onSubmit is never called. */
export const SubmitRejected: Story = {
  args: { scenario: rejected, formProps: { onSubmit: rejectedSubmit }, onHandle: rejectedProbe.onHandle },
  parameters: { docs: { description: { story: rejected.description } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    rejectedSubmit.mockClear();
    await playScenario(args.scenario, canvasElement);
    const handle = await rejectedProbe.handle(canvasElement);
    await expect(handle.submit()).rejects.toMatchObject({ code: submitOutcomes.rejectionCode });
    expect(rejectedSubmit).not.toHaveBeenCalled();
  },
};

/** Shared scenario `validation-state.submit-rejected`, fixed from the screen and submitted with Enter. */
export const EnterSubmit: Story = {
  args: { scenario: rejected, formProps: { onSubmit: enterSubmit } },
  parameters: { docs: { description: { story: 'Enter in a field submits the native form; a valid value reaches onSubmit once.' } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    enterSubmit.mockClear();
    await playScenario(args.scenario, canvasElement);
    const email = canvasElement.querySelector<HTMLInputElement>('input[id="/email"]')!;
    await userEvent.clear(email);
    await userEvent.type(email, `${submitOutcomes.validEmail}{Enter}`);
    await waitFor(() => expect(enterSubmit).toHaveBeenCalledTimes(1));
    expect(enterSubmit).toHaveBeenLastCalledWith({ email: submitOutcomes.validEmail });
  },
};

/** Shared scenario `validation-state.submit-rejected` submitted with Enter while invalid: the rejection reaches the host sink. */
export const EnterRejected: Story = {
  args: { scenario: rejected, formProps: { onSubmit: enterRejectedSubmit } },
  parameters: { docs: { description: { story: 'ERROR-139 nobody awaits a native submit, so its rejection goes to the host sink (globalThis.reportError); onSubmit is not called.' } } },
  async play({ args, canvasElement, step }) {
    if (shouldSkipUnfocusedPlay()) return skipPlay(step, unfocusedPlayReason);
    enterRejectedSubmit.mockClear();
    const sink: unknown[] = [];
    // The play stands in for the host: spying on reportError receives the sink delivery without dispatching an error event.
    const report = spyOn(window, 'reportError').mockImplementation((error) => { sink.push(error); });
    try {
      await playScenario(args.scenario, canvasElement);
      await userEvent.type(canvasElement.querySelector<HTMLInputElement>('input[id="/email"]')!, '{Enter}');
      await waitFor(() => expect(sink).toHaveLength(1));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      expect(sink).toHaveLength(1);
      expect(sink[0]).toMatchObject({ code: submitOutcomes.rejectionCode });
      expect(enterRejectedSubmit).not.toHaveBeenCalled();
    } finally {
      report.mockRestore();
    }
  },
};
