import { act } from '@testing-library/react';
import type { FormScenarioStep, ScenarioAdapter } from '@aileron/schema-form-scenarios';
import { expect } from 'vitest';

import type { SchemaNode } from '@/schema-form';

import type { FormHarness } from '../renderForm';

/**
 * Bind shared steps to DOM input and the registered Form handle.
 * @param form - Mounted harness whose handle always addresses the current root.
 * @returns Step execution and assertions consumed by playScenario.
 */
export const createRenderScenarioAdapter = (form: FormHarness): ScenarioAdapter => {
  let result: unknown;
  let changeStart = 0;
  let errorStart = 0;
  const priorNodes = new Map<string, SchemaNode | null>();
  const imperative = (step: FormScenarioStep): unknown => {
    if (step.action === 'submit') return form.handle.submit();
    if (step.action === 'reset') {
      if (step.automaticWrites) throw new Error('FormHandle.reset has no per-call write option');
      return form.handle.reset();
    }
    if (step.action === 'batch') return form.handle.node!.batch(() => {
      for (const nested of step.steps) {
        if (nested.action === 'submit') throw new Error('Cannot submit inside a synchronous batch');
        imperative(nested);
      }
    });
    const node = form.node(step.path);
    if (!node) throw new Error(`Scenario node missing at ${step.path}`);
    if (step.action === 'resetSubtree') return node.resetSubtree();
    if (step.action === 'setValue') return node.setValue(step.value);
    if (step.action === 'clear')
      return node.type === 'array' ? node.clear() : node.setValue(undefined);
    if (node.type !== 'array') throw new Error(`Expected array at ${step.path}`);
    if (step.action === 'push') return node.push(step.value);
    if (step.action === 'pop') return node.pop();
    if (step.action === 'remove') return node.remove(step.index);
    return node.update(step.index, step.value);
  };
  return {
    async execute(step) {
      priorNodes.clear();
      for (const path of Object.values(step.expect?.identity ?? {}))
        priorNodes.set(path, form.node(path));
      changeStart = form.changeLog().length;
      errorStart = form.errorRecords().length;
      result = undefined;
      if (step.action === 'setValue') {
        const field = form.field(step.path);
        if (field && typeof step.value === 'string') {
          if (field.tagName === 'SELECT') await form.selectOption(step.path, step.value);
          else await form.type(step.path, step.value);
          return;
        }
        if (field?.type === 'checkbox' && typeof step.value === 'boolean') {
          if (form.checked(step.path) !== step.value) await form.toggle(step.path);
          return;
        }
        if (field?.type === 'number' && typeof step.value === 'number') {
          await form.type(step.path, String(step.value));
          return;
        }
      }
      await act(async () => { result = await imperative(step); });
    },
    settle: form.flush,
    async assert(observation) {
      for (const [path, presence] of Object.entries(observation.shape ?? {}))
        expect(form.wrapper(path) !== null, `DOM shape ${path}`).toBe(presence === 'present');
      for (const [path, value] of Object.entries(observation.values ?? {})) {
        expect(form.node(path), `node ${path}`).not.toBeNull();
        expect(form.node(path)?.value, `value ${path}`).toEqual(value);
      }
      for (const [path, states] of Object.entries(observation.states ?? {}))
        for (const [key, value] of Object.entries(states))
          expect(form.node(path)?.[key as keyof typeof states], `state ${path}.${key}`).toBe(value);
      if ('outputValue' in observation) expect(form.getValue()).toEqual(observation.outputValue);
      if ('result' in observation) expect(result).toEqual(observation.result);
      if (observation.diagnostics) expect(form.handle.node?.diagnostics).toMatchObject(observation.diagnostics);
      for (const [path, source] of Object.entries(observation.identity ?? {}))
        expect(form.node(path), `identity ${path}`).toBe(priorNodes.get(source));
      for (const key of ['defaultValues', 'schemaTypes', 'extras'] as const)
        for (const [path, value] of Object.entries(observation[key] ?? {})) {
          const property = key === 'defaultValues' ? 'defaultValue' : key === 'schemaTypes' ? 'schemaType' : 'extras';
          expect(form.node(path)?.[property], `${property} ${path}`).toEqual(value);
        }
      if (observation.errors) {
        await form.validate();
        for (const [path, errors] of Object.entries(observation.errors))
          expect(form.node(path)?.errors, `errors ${path}`).toEqual(errors);
      }
      if (observation.onChangeCount !== undefined)
        expect(form.changeLog().length - changeStart).toBe(observation.onChangeCount);
      if (observation.onErrorCodes)
        expect(form.errorRecords().slice(errorStart).map(({ code }) => code)).toEqual(observation.onErrorCodes);
      if (observation.deliveryOrder || observation.validationRequestCount !== undefined)
        throw new Error('Delivery and validator-call observations require an instrumented U9 runner');
    },
  };
};
