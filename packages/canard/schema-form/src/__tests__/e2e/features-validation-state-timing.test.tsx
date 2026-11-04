import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  type InteractionStateNames,
  type KeywordsByPath,
  interactionStateStages,
  submitOutcomes,
  submitScenario,
  validationModeCases,
  validationStateFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { type JSONSchema, FieldNodeState, ValidationMode } from '@/schema-form';

import { type FormHarness, renderForm } from '../renderForm';

/** GOAL-061 touched lands in the animation frame after blur; jsdom runs frames on a timer, so waits cover one. */
const BLUR_FRAME_MS = 50;

// Consumer-only checks for validation-state cases: mode timing, interaction state, and submit outcomes.

const MODES = { OnChange: ValidationMode.OnChange, OnRequest: ValidationMode.OnRequest, None: ValidationMode.None } as const;

/**
 * Find a validation-state scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string) => {
  const scenario = validationStateFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Read issue keywords held by each listed node without requesting validation.
 * @param form - Rendered harness.
 * @param expected - Paths to read; only its keys are used.
 * @returns Keywords per path in issue order.
 */
const keywords = (form: FormHarness, expected: KeywordsByPath): KeywordsByPath =>
  Object.fromEntries(Object.keys(expected).map((path) => [path, (form.node(path)?.errors ?? []).map((issue) => issue.keyword ?? '')]));

/**
 * Translate a global state record into flag names.
 * @param state - getState() result or onStateChange argument keyed by FieldNodeState flags.
 * @returns The same state keyed by edited, touched, and showError.
 */
const stateNames = (state: Readonly<Record<string, boolean | undefined>>): InteractionStateNames => ({
  ...(state[FieldNodeState.Edited] && { edited: true }),
  ...(state[FieldNodeState.Touched] && { touched: true }),
  ...(state[FieldNodeState.ErrorVisible] && { showError: true }),
});

describe('features — validation-state timing and submit (consumer-only)', () => {
  it.each(validationModeCases)('VALIDATE-049 and VALIDATE-008 $mode: issues after input and after a request', async (item) => {
    const scenario = scenarioNamed('validation-state.mode-timing');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, validationMode: MODES[item.mode] });
    try {
      await form.type('/name', 'ab');
      await form.type('/age', '10');
      expect(keywords(form, item.afterInput), 'issues after input').toEqual(item.afterInput);
      await form.validate();
      expect(keywords(form, item.afterRequest), 'issues after an explicit request').toEqual(item.afterRequest);
    } finally {
      form.unmount();
    }
  });

  it('EVENT-062 and EVENT-067 interaction stages set global state and notify once per state-changing entry', async () => {
    const scenario = scenarioNamed('validation-state.interaction-state');
    const onStateChange = vi.fn();
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, onStateChange });
    try {
      for (const stage of interactionStateStages) {
        const before = onStateChange.mock.calls.length;
        if (stage.act === 'type' || stage.act === 'returnAndType') await form.user.type(form.field('/title')!, stage.text!);
        else if (stage.act === 'blur') await form.user.tab();
        else if (stage.act === 'clearState') form.handle.clearState();
        else if (stage.act === 'setState') form.handle.setState({ [FieldNodeState.Touched]: true });
        await form.flush(BLUR_FRAME_MS);
        expect(stateNames(form.handle.getState()), `state after ${stage.act}`).toEqual(stage.state);
        expect(onStateChange.mock.calls.length - before, `onStateChange calls for ${stage.act}`).toBe(stage.notifications);
      }
    } finally {
      form.unmount();
    }
  });

  it('VALIDATE-006 a valid handle submit calls onSubmit once', async () => {
    const onSubmit = vi.fn();
    const form = await renderForm(submitScenario.schema as JSONSchema, { defaultValue: submitScenario.initialValue, validator: true, onSubmit });
    try {
      await act(() => form.handle.submit());
      expect(onSubmit).toHaveBeenCalledTimes(1);
    } finally {
      form.unmount();
    }
  });

  it('ERROR-139 an invalid handle submit rejects with the validation code and skips onSubmit', async () => {
    const scenario = scenarioNamed('validation-state.submit-rejected');
    const onSubmit = vi.fn();
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, onSubmit });
    try {
      await act(async () => {
        await expect(form.handle.submit()).rejects.toMatchObject({ code: submitOutcomes.rejectionCode });
      });
      expect(onSubmit).not.toHaveBeenCalled();
      expect(form.sinkErrors(), 'an awaited rejection never reaches the host sink').toEqual([]);
      expect(form.errorRecords(), 'ERROR-016 a validation failure is not recorded').toEqual([]);
    } finally {
      form.unmount();
    }
  });

  it('ERROR-139 Enter submits the native form: valid reaches onSubmit, invalid reaches the host sink', async () => {
    const scenario = scenarioNamed('validation-state.submit-rejected');
    const onSubmit = vi.fn();
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, onSubmit });
    try {
      await form.user.type(form.field('/email')!, '{Enter}');
      await form.flush();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(form.sinkErrors()).toEqual([expect.objectContaining({ code: submitOutcomes.rejectionCode })]);
      expect(form.errorRecords(), 'ERROR-016 a validation failure is not recorded').toEqual([]);
      await form.type('/email', `${submitOutcomes.validEmail}{Enter}`);
      await form.flush();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenLastCalledWith({ email: submitOutcomes.validEmail });
    } finally {
      form.unmount();
    }
  });
});
