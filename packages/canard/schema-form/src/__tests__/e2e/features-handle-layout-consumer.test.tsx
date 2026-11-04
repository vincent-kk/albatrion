import { render } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';

import {
  type FormScenario,
  handleCommandStages,
  handleLayoutFeatureScenarios,
  handleRoundTripIssues,
  layoutPlan,
  propReplacementStages,
  providerLayers,
} from '@aileron/schema-form-scenarios';

import { type FormHandle, Form, FormProvider, type JSONSchema } from '@/schema-form';

import { renderForm, setupValidatorPlugin } from '../renderForm';

import { settleValidation } from '../helpers/settleValidation';

// Consumer-only checks for handle-layout cases: handle commands, layouts, provider layers, and prop replacement.

/**
 * Find a handle-layout scenario by name.
 * @param name - Stable scenario name.
 * @returns The scenario; throws when the data was renamed.
 */
const scenarioNamed = (name: string): FormScenario => {
  const scenario = handleLayoutFeatureScenarios.find((item) => item.name === name);
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  return scenario;
};

/**
 * Settle React work and timers in jsdom.
 * @returns Completion after the act scope.
 */
const settle = (current: () => FormHandle['node'] | undefined) => act(async () => { await settleValidation(current); });

describe('features — handle-layout consumer-only', () => {
  it('handle validate and getErrors return the issues of the written value in document order', async () => {
    const scenario = scenarioNamed('handle-layout.handle-round-trip');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
    try {
      await form.setValue({ name: 'a', age: -1 });
      expect((await form.validate()).map((issue) => issue.keyword)).toEqual(handleRoundTripIssues);
      expect(form.handle.getErrors().map((issue) => issue.keyword)).toEqual(handleRoundTripIssues);
    } finally {
      form.unmount();
    }
  });

  it('EVENT-063 focus, select and refresh reach the addressed input, a missing path does nothing, and no value is written', async () => {
    const scenario = scenarioNamed('handle-layout.handle-commands');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true });
    try {
      for (const [index, stage] of handleCommandStages.entries()) {
        const before = form.field(stage.path);
        act(() => {
          if (stage.act === 'focus' || stage.act === 'focusMissing') form.handle.focus(stage.path);
          else if (stage.act === 'select') form.handle.select(stage.path);
          else form.handle.refresh(stage.path);
        });
        await form.flush(20);
        const target = form.field(stage.path);
        expect({ replaced: Boolean(before) && target !== before, values: form.getValue() }, `after stage ${index} ${stage.act}`)
          .toEqual({ replaced: stage.replaced, values: scenario.initialValue });
        // jsdom's select() leaves focus where it was, so focus moves are checked here only for focus; the story checks both in Chromium.
        if (stage.act === 'focus') expect(document.activeElement?.id, `focus at stage ${index}`).toBe(stage.activeId);
        if (stage.act === 'select' && target instanceof HTMLInputElement) expect([target.selectionStart, target.selectionEnd], `selection at stage ${index}`).toEqual(stage.selection);
      }
    } finally {
      form.unmount();
    }
  });

  it('a children-function layout places fields by path and repeated inputs keep their own drafts while typing', async () => {
    const scenario = scenarioNamed('handle-layout.layout-composition');
    const form = await renderForm(scenario.schema as JSONSchema, { defaultValue: scenario.initialValue, validator: true, showError: true, children: () => <>
      {layoutPlan.inputs.map((path) => <div key={path}><Form.Label path={path} /><Form.Input path={path} /></div>)}
      <div data-copy="second"><Form.Input path={layoutPlan.repeated} /></div>
      <div data-error-slot={layoutPlan.error}><Form.Error path={layoutPlan.error} /></div>
      <Form.Render path={layoutPlan.render}>{({ value }) => <output data-render={layoutPlan.render}>{String(value ?? '')}</output>}</Form.Render>
    </> });
    try {
      await form.setValue({ ...form.getValue(), count: 9, note: 'rendered' });
      await form.validate();
      const copies = () => Array.from(form.container.querySelectorAll<HTMLInputElement>(`input[id="${layoutPlan.repeated}"]`));
      await form.user.type(copies()[0], layoutPlan.typed);
      await form.flush();
      expect({
        copies: copies().map((input) => input.value),
        omitted: layoutPlan.omitted.map((path) => Boolean(form.container.querySelector(`[id="${path}"]`))),
        rendered: form.container.querySelector(`[data-render="${layoutPlan.render}"]`)?.textContent,
        error: Boolean(form.container.querySelector(`[data-error-slot="${layoutPlan.error}"]`)?.textContent?.trim()),
        output: form.getValue(),
      }).toEqual({ copies: [...layoutPlan.copiesAfterTyping], omitted: [false], rendered: 'rendered', error: true,
        output: { title: 'Plan v2', count: 9, enabled: true, note: 'rendered' } });
    } finally {
      form.unmount();
    }
  });

  it('CONTROLS-080 the Form context overrides the provider per key and provider settings apply beneath', async () => {
    const scenario = scenarioNamed('handle-layout.provider-layers');
    let handle: FormHandle | null = null;
    setupValidatorPlugin();
    const { container, unmount } = render(<FormProvider {...providerLayers.provider}>
      <Form<JSONSchema> ref={(next) => { handle = next; }} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue} {...providerLayers.form} />
    </FormProvider>);
    try {
      await settle(() => handle?.node);
      await act(async () => { await handle!.validate(); });
      await settle(() => handle?.node);
      expect({
        titleReadOnly: handle!.findNode('/title')!.isReadOnly,
        secretVisible: handle!.findNode('/secret')!.isVisible,
        codeMessageShown: Boolean(container.querySelector('[data-path="/code"] em')?.textContent?.trim()),
      }).toEqual(providerLayers.expected);
    } finally {
      unmount();
    }
  });

  it('WRITE-043 and WRITE-044 reset loads committed props; an equal schema keeps nodes and a different one rebuilds', async () => {
    const scenario = scenarioNamed('handle-layout.prop-replacement');
    let handle: FormHandle | null = null;
    let props = { jsonSchema: scenario.schema, defaultValue: scenario.initialValue };
    setupValidatorPlugin();
    const view = () => <Form<JSONSchema> ref={(next) => { handle = next; }} jsonSchema={props.jsonSchema as JSONSchema} defaultValue={props.defaultValue} />;
    const { rerender, unmount } = render(view());
    try {
      for (const [index, stage] of propReplacementStages.entries()) {
        await settle(() => handle?.node);
        const before = handle!.findNode('/name');
        props = { jsonSchema: stage.schema ?? props.jsonSchema, defaultValue: stage.defaultValue ?? props.defaultValue };
        if (index > 0) rerender(view());
        await settle(() => handle?.node);
        if (stage.reset) act(() => handle!.reset());
        await settle(() => handle?.node);
        expect({ outputValue: handle!.getValue(), nodeKept: handle!.findNode('/name') === before }, `after stage ${index} ${stage.label}`)
          .toEqual({ outputValue: stage.outputValue, nodeKept: stage.nodeKept });
      }
    } finally {
      unmount();
    }
  });
});
