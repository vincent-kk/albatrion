import { expect } from 'vitest';

import type {
  FormScenario,
  ScenarioAdapter,
} from '@aileron/schema-form-scenarios';

import type { BlueprintSchema } from '@/schema-form/core/engine';
import {
  PathKeyedSet,
  blueprint,
  loadFieldNodeAtMount,
} from '@/schema-form/core/engine';
import { SetValueOption, fieldNodeFactory } from '@/schema-form/core/surface';

import { createTestValidator } from '../../fixtures/createTestValidator';
import type {
  TestFieldNode,
  TestPublicFieldNode,
} from '../../fixtures/testFieldNode';
import { isTestFieldNode } from '../../fixtures/testFieldNode';
import { assertCoreScenarioExpectation } from './assertCoreScenarioExpectation';
import { executeCoreScenarioStep } from './executeCoreScenarioStep';

/**
 * Bind a shared scenario to the PR-2 node tree and its form load lifetime.
 * @param scenario - Pure schema, initial value, and steps from the shared package
 * @returns Adapter and live root for core-only structural assertions
 */
export function createCoreScenarioAdapter(
  scenario: FormScenario,
): ScenarioAdapter & { readonly root: TestPublicFieldNode } {
  const root = fieldNodeFactory(
    blueprint(scenario.schema as BlueprintSchema),
    {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,

      misfitPaths: new PathKeyedSet(),
    },
    createTestValidator(),
  );
  if (!isTestFieldNode(root)) throw new Error('Expected a runtime FieldNode');
  const record: TestFieldNode = root;
  loadFieldNodeAtMount(record, scenario.initialValue, SetValueOption.Overwrite);
  const priorNodes = new Map<
    string,
    { node: TestPublicFieldNode; itemKey: number | null }
  >();
  let actionResult: unknown;
  return {
    root,
    execute: (step) => {
      priorNodes.clear();
      for (const path of Object.values(step.expect?.identity ?? {})) {
        const node = root.find(path);
        if (!node || !isTestFieldNode(node))
          throw new Error(`Scenario identity source missing at ${path}`);
        priorNodes.set(path, { node, itemKey: node.itemKey });
      }
      actionResult = executeCoreScenarioStep(root, scenario, step);
    },
    assert: (expectation) => {
      assertCoreScenarioExpectation(root, expectation);
      if ('result' in expectation)
        expect(actionResult, 'action result').toEqual(expectation.result);
      for (const [path, priorPath] of Object.entries(
        expectation.identity ?? {},
      )) {
        const prior = priorNodes.get(priorPath);
        const current = root.find(path);
        expect(root.find(path), `identity ${path}`).toBe(prior?.node);
        expect(
          isTestFieldNode(current) ? current.itemKey : undefined,
          `item key ${path}`,
        ).toBe(prior?.itemKey);
      }
      for (const [path, value] of Object.entries(
        expectation.defaultValues ?? {},
      ))
        expect(root.find(path)?.defaultValue, `defaultValue ${path}`).toEqual(
          value,
        );
      for (const [path, value] of Object.entries(expectation.schemaTypes ?? {}))
        expect(root.find(path)?.schemaType, `schemaType ${path}`).toEqual(
          value,
        );
      for (const [path, value] of Object.entries(
        expectation.undeclaredValues ?? {},
      ))
        expect(
          root.find(path)?.undeclaredValues,
          `undeclaredValues ${path}`,
        ).toEqual(value);
    },
  };
}
