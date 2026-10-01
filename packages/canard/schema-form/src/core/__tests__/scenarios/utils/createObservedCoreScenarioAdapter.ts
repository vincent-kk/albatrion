import type { FormScenario, FormScenarioStep, ScenarioAdapter,
  ScenarioExpectation } from '@aileron/schema-form-scenarios';
import { expect } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { SchemaNodeEventType, SetValueOption } from '../../../SchemaNode';
import type { SchemaNode } from '../../../SchemaNode';
import type { SchemaNode as RuntimeSchemaNode } from '../../../SchemaNode/SchemaNode';
import { loadSchemaNodeAtMount } from '../../../settle';
import { ValidationMode } from '../../../types/state';
import { makeSchemaNodeTree } from '../../makeSchemaNodeTree';
import { assertCoreScenarioExpectation } from './assertCoreScenarioExpectation';
import { executeCoreScenarioStep } from './executeCoreScenarioStep';

/** Execute batches through the public node boundary while reusing existing actions. */
const executeStep = (root: SchemaNode, scenario: FormScenario,
  step: FormScenarioStep): void => {
  if (step.action === 'batch') {
    root.batch(() => {
      for (const nested of step.steps) executeStep(root, scenario, nested);
    });
    return;
  }
  executeCoreScenarioStep(root as RuntimeSchemaNode, scenario, step);
};

/** Record only value deliveries; error deliveries belong to validation assertions. */
const subscribeValueTree = (node: SchemaNode, order: string[]): void => {
  node.subscribe((event) => {
    if (event.type & SchemaNodeEventType.UpdateValue) order.push(node.path);
  });
  for (const child of node.children ?? []) subscribeValueTree(child, order);
};

/**
 * Bind pure notification or validation data to the real core node tree.
 * @param scenario - Shared schema and steps
 * @param family - Selects automatic-request counting or explicit verdict checks
 * @returns Step-local observations through the shared adapter interface
 */
export function createObservedCoreScenarioAdapter(
  scenario: FormScenario, family: 'notify' | 'validation',
): ScenarioAdapter {
  const delivered: string[] = [];
  const reported: string[] = [];
  let onChangeCount = 0;
  let validationRequestCount = 0;
  const { root, runtime } = makeSchemaNodeTree(scenario.schema as BlueprintSchema, {
    snapshot: scenario.initialValue,
    errorReporter: { hasConsumer: () => true,
      report: (record) => { reported.push(record.code); } },
  });
  loadSchemaNodeAtMount(root as RuntimeSchemaNode, scenario.initialValue,
    SetValueOption.Overwrite);
  subscribeValueTree(root, delivered);
  Reflect.set(runtime, 'onChange', () => { onChangeCount += 1; });
  Reflect.set(runtime, 'validationMode', family === 'notify'
    ? ValidationMode.OnChange : ValidationMode.OnRequest);
  if (family === 'notify') Reflect.set(runtime, 'requestValidation', () => {
    validationRequestCount += 1;
  });

  return {
    execute: (step) => {
      delivered.length = 0;
      reported.length = 0;
      onChangeCount = 0;
      validationRequestCount = 0;
      executeStep(root, scenario, step);
    },
    settle: family === 'validation' ? async () => { await root.validate(); } : undefined,
    assert: (expectation: ScenarioExpectation) => {
      assertCoreScenarioExpectation(root, { ...expectation, errors: undefined });
      if (expectation.deliveryOrder)
        expect(delivered, 'deliveryOrder').toEqual(expectation.deliveryOrder);
      if (expectation.onChangeCount !== undefined)
        expect(onChangeCount, 'onChangeCount').toBe(expectation.onChangeCount);
      if (expectation.validationRequestCount !== undefined)
        expect(validationRequestCount, 'validationRequestCount')
          .toBe(expectation.validationRequestCount);
      if (expectation.onErrorCodes)
        expect(reported, 'onErrorCodes').toEqual(expectation.onErrorCodes);
      for (const [path, issues] of Object.entries(expectation.errors ?? {})) {
        const node = root.find(path);
        expect(node, `errors node ${path}`).not.toBeNull();
        expect(node?.errors, `errors ${path}`).toHaveLength(issues.length);
        expect(node?.errors, `errors ${path}`).toMatchObject(issues);
      }
    },
  };
}
