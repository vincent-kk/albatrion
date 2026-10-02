import { flushSync } from 'react-dom';

import type { ScenarioAdapter } from '@aileron/schema-form-scenarios';
import { expect, userEvent } from 'storybook/test';

import { SchemaNodeEventType } from '../../../src';

import { assertStoryObservation } from './assertStoryObservation';
import { executeStoryStep } from './executeStoryStep';
import type { StoryScenarioContext, StoryStepEvidence } from './types';

/**
 * Bind screen input, handle-only actions, and step-local notification evidence.
 * @param context - Consumer-owned Form and DOM registration scope.
 * @returns An adapter consumed unchanged by playScenario; failed steps propagate.
 */
export function createStoryScenarioAdapter(context: StoryScenarioContext): ScenarioAdapter {
  const { handle, element, observations } = context;
  const evidence: StoryStepEvidence = { result: undefined, changes: 0, errors: 0, validationRequests: 0, deliveries: [], priorNodes: {} };
  return {
    async execute(step) {
      evidence.result = undefined;
      evidence.changes = observations.changes.length;
      evidence.errors = observations.errorCodes.length;
      evidence.validationRequests = observations.validationRequests;
      evidence.deliveries = [];
      evidence.priorNodes = Object.fromEntries(Object.values(step.expect?.identity ?? {}).map((path) => [path, handle.findNode(path)]));
      const paths = step.expect?.deliveryOrder ? Array.from(element.querySelectorAll<HTMLElement>('[data-path]')).map((item) => item.dataset.path!) : [];
      const stops = paths.flatMap((path) => {
        const node = handle.findNode(path);
        return node ? [node.subscribe((event) => { if (event.type & SchemaNodeEventType.UpdateValue) evidence.deliveries.push(path); })] : [];
      });
      try {
        const field = 'path' in step ? Array.from(element.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[id], select[id], textarea[id]')).find((item) => item.id === step.path) : undefined;
        if (field && !field.disabled && !(field as HTMLInputElement).readOnly) {
          if (step.action === 'clear' && (field.type === 'text' || field.type === 'number')) { await userEvent.clear(field); return; }
          if (step.action === 'setValue') {
            if (field.type === 'checkbox' && typeof step.value === 'boolean') { if ((field as HTMLInputElement).checked !== step.value) await userEvent.click(field); return; }
            if (field.tagName === 'SELECT' && typeof step.value === 'string') { await userEvent.selectOptions(field, step.value); return; }
            if (typeof step.value === 'string' || (field.type === 'number' && typeof step.value === 'number')) { await userEvent.clear(field); if (String(step.value)) await userEvent.type(field, String(step.value)); return; }
          }
        }
        flushSync(() => { evidence.result = executeStoryStep(handle, step); });
        await evidence.result;
      } catch (error) {
        if (step.expect?.diagnostics?.status !== 'degraded') throw error;
        expect(error).toMatchObject({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' });
      } finally { stops.forEach((stop) => stop()); }
    },
    async settle() { await new Promise<void>((resolve) => requestAnimationFrame(() => resolve())); },
    assert: (observation) => assertStoryObservation(context, observation, evidence),
  };
}
