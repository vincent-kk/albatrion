import type { ReactNode } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type CompositeCase,
  compositeCases,
  findScenarioHandle,
  playScenario,
  pluginFormPlan,
  registerScenarioHandle,
} from '@aileron/schema-form-scenarios';

import { type FieldInputProps, type JSONSchema, ShowError, ValidationMode, VirtualizationBackfill } from '@/schema-form';

import { renderForm } from '../renderForm';

// Shared steps of CX-01 to CX-12. jsdom has no IntersectionObserver or idle callback; inert stubs keep placeholders deferred.
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestIdleCallback', () => 0);
  vi.stubGlobal('cancelIdleCallback', () => {});
});
afterEach(() => vi.unstubAllGlobals());

/**
 * Input that throws while rendering on the CX-06 trigger value.
 * @param props - FieldInput props.
 * @returns The text input; throws on pluginFormPlan.trigger.
 */
const ThrowOnTrigger = ({ path, value, onChange }: FieldInputProps<string>): ReactNode => {
  if (value === pluginFormPlan.trigger) throw new Error(`input at ${path} threw`);
  return <input id={path} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
};

/**
 * Map a case's plain props to Form props; the errors prop belongs to the consumer tail and is not mounted here.
 * @param props - Plain props from the case data.
 * @returns Form props for renderForm.
 */
const toFormProps = (props: CompositeCase['props']) => ({
  ...(props?.context && { context: props.context }),
  ...(props?.validationMode && { validationMode: ValidationMode[props.validationMode] }),
  ...(typeof props?.showError === 'boolean' && { showError: props.showError }),
  ...(typeof props?.showError === 'string' && { showError: ShowError[props.showError] }),
  ...(props?.virtualization && { virtualization: { ...props.virtualization, backfill: props.virtualization.backfill === 'idle' ? VirtualizationBackfill.Idle : VirtualizationBackfill.None } }),
});

/**
 * Run one composite case's shared steps through the registered screen adapter with the harness validator.
 * Error expectations are partial issue contracts, matched by count and shape as in validation.test.tsx.
 * @param item - Composite case.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (item: CompositeCase) => {
  const { scenario } = item;
  const form = await renderForm(scenario.schema as JSONSchema, {
    defaultValue: scenario.initialValue, validator: true, ...toFormProps(item.props),
    fieldInputMap: { '/broken': ThrowOnTrigger },
  });
  const base = findScenarioHandle(form.container).adapter;
  const unregister = registerScenarioHandle(form.container, form.handle, {
    // ERROR-070 a budget failure throws at the end of the write chain; a step expecting degraded diagnostics catches it,
    // as the story adapter does, and the assert then reads the diagnostics.
    async execute(step) {
      try {
        await base.execute(step);
      } catch (error) {
        if (step.expect?.diagnostics?.status !== 'degraded') throw error;
        expect(error).toMatchObject({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' });
      }
    },
    settle: base.settle,
    async assert(observation) {
      const { errors, ...rest } = observation;
      await base.assert(rest);
      if (!errors) return;
      await form.validate();
      for (const [path, expected] of Object.entries(errors)) {
        const actual = form.node(path)?.errors ?? [];
        expect(actual, `validation issue count at ${path}`).toHaveLength(expected.length);
        expect(actual, `validation issue contract at ${path}`).toMatchObject(expected);
      }
    },
  });
  try {
    await playScenario(scenario, form.container);
  } finally {
    unregister();
    form.unmount();
  }
};

describe('features — composite shared steps CX-01 to CX-12 (TEST-025)', () => {
  it.each(compositeCases.slice(0, 12).map((item) => [item.scenario.name, item] as const))('%s', async (_, item) => {
    await run(item);
  });
});
