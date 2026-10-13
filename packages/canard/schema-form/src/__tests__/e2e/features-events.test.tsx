import { describe, expect, it, vi } from 'vitest';

import {
  eventsFeatureScenarios,
  findScenarioHandle,
  playScenario,
  registerScenarioHandle,
} from '@aileron/schema-form-scenarios';

import { type JSONSchema, FieldNodeEventType, ValidationMode } from '@/schema-form';

import { renderForm } from '../renderForm';

/**
 * Execute one events feature scenario with delivery-order and validation-request instrumentation, as notify.test.tsx does.
 * @param name - Stable scenario name; its description cites the ledger.
 * @returns Completion after every step expectation has been checked.
 */
const run = async (name: string) => {
  const scenario = eventsFeatureScenarios.find((item) => item.name === name);
  expect(scenario, name).toBeDefined();
  if (!scenario) throw new Error(`Missing scenario: ${name}`);
  const validate = vi.fn(() => null);
  const form = await renderForm(scenario.schema as JSONSchema, {
    defaultValue: scenario.initialValue,
    validatorFactory: { compile: () => validate, compileGuard: () => () => true },
    validationMode: ValidationMode.OnChange,
  });
  const base = findScenarioHandle(form.container).adapter;
  let deliveries: string[] = [];
  let requests = 0;
  const paths = Array.from(form.container.querySelectorAll<HTMLElement>('[data-path]')).map((item) => item.dataset.path!);
  const stops = paths.flatMap((path) => {
    const node = form.node(path);
    return node ? [node.subscribe((event) => { if (event.type & FieldNodeEventType.UpdateValue) deliveries.push(path); })] : [];
  });
  const unregister = registerScenarioHandle(form.container, form.handle, {
    async execute(step) {
      deliveries = [];
      requests = validate.mock.calls.length;
      await base.execute(step);
    },
    settle: base.settle,
    async assert(observation) {
      const { deliveryOrder, validationRequestCount, ...rest } = observation;
      await base.assert(rest);
      if (deliveryOrder) expect(deliveries, 'delivery order').toEqual(deliveryOrder);
      if (validationRequestCount !== undefined) expect(validate.mock.calls.length - requests, 'validation requests').toBe(validationRequestCount);
    },
  });
  try {
    await playScenario(scenario, form.container);
  } finally {
    stops.forEach((stop) => stop());
    unregister();
    form.unmount();
  }
};

describe('features — events shared screen runner (TEST-025)', () => {
  it.each([
    'events.batch-sync',
    'events.warning-once',
    'events.subscription-kinds',
    'events.render-commits',
  ])('%s runs its shared steps', async (name) => {
    await run(name);
  });
});
