import type { ScenarioExpectation } from '@aileron/schema-form-scenarios';
import { expect, waitFor } from 'storybook/test';

import type { StoryScenarioContext, StoryStepEvidence } from './types';

/**
 * Check shared expectations against committed DOM and public node observations.
 * @param context - Mounted Form, DOM scope, and consumer callback records.
 * @param observation - Every expectation requested by the shared data.
 * @param evidence - Results and counters captured before the current step.
 * @returns Completion after React commit and validation; failures propagate.
 */
export async function assertStoryObservation(context: StoryScenarioContext, observation: ScenarioExpectation, evidence: StoryStepEvidence): Promise<void> {
  const { handle, element, observations } = context;
  await waitFor(() => {
    for (const [path, presence] of Object.entries(observation.shape ?? {})) {
      const wrapper = Array.from(element.querySelectorAll<HTMLElement>('[data-path]')).find((item) => item.dataset.path === path);
      expect(Boolean(wrapper), `DOM shape ${path}`).toBe(presence === 'present');
    }
    for (const field of element.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[id], select[id], textarea[id]')) {
      const value = handle.findNode(field.id)?.value;
      if (field.type === 'checkbox' && typeof value === 'boolean') expect((field as HTMLInputElement).checked).toBe(value);
      else if (field.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) expect(field.value, `numeric draft ${field.id}`).toBe('');
      else if (typeof value === 'string' || typeof value === 'number') expect(field.value, `DOM value ${field.id}`).toBe(String(value));
    }
  });
  if ('outputValue' in observation) expect(handle.getValue()).toEqual(observation.outputValue);
  if ('result' in observation) expect(evidence.result).toEqual(observation.result);
  for (const [path, value] of Object.entries(observation.values ?? {})) {
    expect(handle.findNode(path), `node ${path}`).not.toBeNull();
    expect(handle.findNode(path)?.value, `value ${path}`).toEqual(value);
  }
  for (const [path, states] of Object.entries(observation.states ?? {}))
    for (const [key, value] of Object.entries(states)) expect(Reflect.get(handle.findNode(path)!, key), `state ${path}.${key}`).toBe(value);
  for (const [path, source] of Object.entries(observation.identity ?? {})) expect(handle.findNode(path), `identity ${path}`).toBe(evidence.priorNodes[source]);
  for (const key of ['defaultValues', 'schemaTypes', 'extras'] as const)
    for (const [path, value] of Object.entries(observation[key] ?? {})) {
      const property = key === 'defaultValues' ? 'defaultValue' : key === 'schemaTypes' ? 'schemaType' : 'extras';
      expect(Reflect.get(handle.findNode(path)!, property), `${property} ${path}`).toEqual(value);
    }
  if (observation.diagnostics) expect(handle.node?.diagnostics).toMatchObject(observation.diagnostics);
  if (observation.deliveryOrder) expect(evidence.deliveries).toEqual(observation.deliveryOrder);
  if (observation.onChangeCount !== undefined) expect(observations.changes.length - evidence.changes).toBe(observation.onChangeCount);
  if (observation.validationRequestCount !== undefined) expect(observations.validationRequests - evidence.validationRequests).toBe(observation.validationRequestCount);
  if (observation.onErrorCodes) expect(observations.errorCodes.slice(evidence.errors)).toEqual(observation.onErrorCodes);
  if (observation.errors) {
    await handle.validate();
    for (const [path, errors] of Object.entries(observation.errors)) {
      expect(handle.findNode(path)?.errors, `errors ${path}`).toHaveLength(errors.length);
      expect(handle.findNode(path)?.errors, `errors ${path}`).toMatchObject(errors);
    }
  }
}
