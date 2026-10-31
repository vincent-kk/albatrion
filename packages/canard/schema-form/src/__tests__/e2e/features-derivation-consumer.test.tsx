import { render } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { contextStages, derivationFeatureScenarios, resetInteractionStages } from '@aileron/schema-form-scenarios';

import { type FormHandle, Form, type JSONSchema, FieldNodeState } from '@/schema-form';

import { renderForm, setupValidatorPlugin } from '../renderForm';

import { settleValidation } from '../helpers/settleValidation';

/** GOAL-061 touched lands in the animation frame after blur; jsdom runs frames on a timer, so waits cover one. */
const BLUR_FRAME_MS = 50;

// Consumer-only checks for derivation cases: resetInteraction state edges and Form context stages.

/**
 * Find a derivation scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string) => {
  const scenario = derivationFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Read dirty and touched from one node state record.
 * @param state - Node state keyed by FieldNodeState flags.
 * @returns Only the flags that are true, by name.
 */
const interaction = (state: Readonly<Record<string, boolean | undefined>> = {}) => ({
  ...(state[FieldNodeState.Dirty] && { dirty: true }),
  ...(state[FieldNodeState.Touched] && { touched: true }),
});

describe('features — derivation consumer-only', () => {
  it('CONTROLS-029 only a rising /clear edge resets dirty and touched of /name and no value changes', async () => {
    const scenario = scenarioNamed('derivation.reset-interaction');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue });
    try {
      for (const [index, stage] of resetInteractionStages.entries()) {
        if (stage.act === 'editName') {
          await form.user.type(form.field('/name')!, stage.text!);
          await form.user.tab();
        } else await form.user.click(form.field('/clear')!);
        await form.flush(BLUR_FRAME_MS);
        const label = `stage ${index} ${stage.act}`;
        expect(interaction(form.node('/name')!.state), `/name state after ${label}`).toEqual(stage.nameState);
        expect(Object.fromEntries(Object.keys(stage.values).map((path) => [path, form.node(path)?.value])), `values after ${label}`).toEqual(stage.values);
      }
    } finally {
      form.unmount();
    }
  });

  it('CONTROLS-080 a context change re-evaluates @ controls and derived once, and an equal copy runs no settle', async () => {
    const scenario = scenarioNamed('derivation.context-reference');
    const onChange = vi.fn();
    let handle: FormHandle | null = null;
    const view = (context: Readonly<Record<string, unknown>>) => (
      <Form<JSONSchema> ref={(next) => { handle = next; }} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue} context={context} onChange={onChange} />
    );
    setupValidatorPlugin();
    const { rerender, unmount } = render(view(contextStages[0].context));
    try {
      for (const [index, stage] of contextStages.entries()) {
        const before = onChange.mock.calls.length;
        if (index > 0) rerender(view(stage.context));
        await act(async () => { await settleValidation(); });
        const current = handle!;
        expect({
          states: { titleReadOnly: current.findNode('/title')!.readOnly, secretVisible: current.findNode('/secret')!.visible },
          values: Object.fromEntries(Object.keys(stage.values).map((path) => [path, current.findNode(path)?.value])),
          changes: onChange.mock.calls.length - before,
        }, `context stage ${stage.label}`).toEqual({ states: stage.states, values: stage.values, changes: stage.changes });
      }
    } finally {
      unmount();
    }
  });
});
