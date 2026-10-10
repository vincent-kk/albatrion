import { describe, expect, it } from 'vitest';

import type { FormScenario } from '@aileron/schema-form-scenarios';
import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../../settle';
import { createTestTree } from '../../settle/__tests__/fixtures/createTestTree';
import { runScenario } from './utils/runScenario';

// filid:contract scenario-runner
describe('union.entry-two-step', () => {
  it('WRITE-098 interprets original 0 under the final flag list after either prior kind', async () => {
    const schema: BlueprintSchema = { type: 'object', properties: {
      kind: { type: 'string' }, a: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './kind === "flag"' }, properties: {
        a: { type: 'boolean' },
      } },
      { controls: { active: './kind === "text"' }, properties: {
        a: { type: 'string' },
      } },
    ] };
    const scenario: FormScenario = { name: 'WRITE-098 union.entry-two-step', schema,
      steps: [
        { action: 'setValue', path: '', value: { kind: 'text', a: 'old' },
          expect: { outputValue: { kind: 'text', a: 'old' } } },
        { action: 'setValue', path: '', value: { kind: 'flag', a: 0 },
          expect: { outputValue: { kind: 'flag', a: false } } },
      ] };
    const { root } = createTestTree(schema);
    const result = await runScenario(scenario, {
      execute: (step) => {
        if (step.action === 'setValue') writeSchemaNode(root, step.value,
          'callerReplace', SetValueOption.Overwrite);
      },
      assert: (expected) => {
        if (root.structure?.kind?.raw === 'flag') {
          expect(root.structure?.a?.schema.schema).toMatchObject({ type: ['boolean'] });
          expect(root.structure?.a?.raw).toBe(false);
          expect(root.runtime.typeMismatchPaths.has('/a')).toBe(false);
        }
        expect(root.emit).toEqual(expected.outputValue);
      },
    });
    expect(result.executedSteps).toBe(2);
    const loaded = createTestTree(schema).root;
    loadSchemaNodeAtMount(loaded, { kind: 'flag', a: 0 }, SetValueOption.Overwrite);
    expect(loaded.structure?.a?.raw).toBe(false);
  });

  it('WRITE-099 repeats interpretation from original 0 until the feedback reaches string', async () => {
    const schema: BlueprintSchema = { type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './a === 0' }, properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== 0' }, properties: { a: { type: 'string' } } },
    ] };
    const scenario: FormScenario = { name: 'WRITE-099 convergent feedback', schema,
      steps: [{ action: 'setValue', path: '', value: { a: 0 },
        expect: { outputValue: { a: '0' } } }] };
    const { root } = createTestTree(schema);
    const result = await runScenario(scenario, {
      execute: (step) => {
        if (step.action === 'setValue') writeSchemaNode(root, step.value,
          'callerReplace', SetValueOption.Overwrite);
      },
      assert: (expected) => {
        expect(root.emit).toEqual(expected.outputValue);
        expect(root.structure?.a?.schema.schema).toMatchObject({ type: ['string'] });
        expect(root.structure?.a?.raw).toBe('0');
        expect(root.runtime.typeMismatchPaths.has('/a')).toBe(false);
      },
    });
    expect(result.executedSteps).toBe(1);
  });

  it('WRITE-099 nonconvergent feedback commits static Source B with diagnostics', async () => {
    const schema: BlueprintSchema = { type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
    }, allOf: [
      { controls: { active: './a === "0"' }, properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== "0"' }, properties: { a: { type: 'string' } } },
    ] };
    const scenario: FormScenario = { name: 'WRITE-099 nonconvergent feedback', schema,
      steps: [{ action: 'setValue', path: '', value: { a: 0 },
        expect: { outputValue: { a: 0 } } }] };
    const { root } = createTestTree(schema);
    const result = await runScenario(scenario, {
      execute: (step) => {
        if (step.action === 'setValue')
          expect(() => writeSchemaNode(root, step.value, 'callerReplace',
            SetValueOption.Overwrite)).toThrow();
      },
      assert: (expected) => {
        expect(root.emit).toEqual(expected.outputValue);
        expect(root.structure?.a?.raw).toBe(0);
        expect(root.runtime.typeMismatchPaths.has('/a')).toBe(true);
        expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
          cause: 'budget', exceededBudget: 'transition' });
      },
    });
    expect(result.executedSteps).toBe(1);
  });
});
