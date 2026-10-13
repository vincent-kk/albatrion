import { expect } from 'vitest';

import type {
  FormScenario,
  ScenarioAdapter,
} from '@aileron/schema-form-scenarios';

import { SetValueOption, fieldNodeFactory } from '../../../FieldNode';
import type { FieldNode as RuntimeFieldNode } from '../../../FieldNode/FieldNode';
import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../blueprint';
import { loadFieldNodeAtMount } from '../../../settle';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import { PathKeyedSet } from '../../../utils/pathIndex/PathKeyedSet';
import { createTestValidator } from '../../fixtures/createTestValidator';
import { assertCoreScenarioExpectation } from './assertCoreScenarioExpectation';
import { executeCoreScenarioStep } from './executeCoreScenarioStep';

/**
 * Bind a shared scenario to the PR-2 node tree and its form load lifetime.
 * @param scenario - Pure schema, initial value, and steps from the shared package
 * @returns Adapter and live root for core-only structural assertions
 */
export function createCoreScenarioAdapter(
  scenario: FormScenario,
): ScenarioAdapter & { readonly root: RuntimeFieldNode } {
  const root = fieldNodeFactory(
    blueprint(scenario.schema as BlueprintSchema),
    {
      diagnostics: { status: 'stable' },
      loadSnapshot: undefined,
      latentRaw: new PathKeyedMap('pair'),
      typeMismatchPaths: new PathKeyedSet(),
      inactiveValuesMemo: new PathKeyedMap<
        readonly { path: string; value: unknown }[]
      >('path'),
    },
    createTestValidator(),
  );
  loadFieldNodeAtMount(
    root as RuntimeFieldNode,
    scenario.initialValue,
    SetValueOption.Overwrite,
  );
  const priorNodes = new Map<
    string,
    { node: RuntimeFieldNode; itemKey: number | null }
  >();
  let actionResult: unknown;
  return {
    root: root as RuntimeFieldNode,
    execute: (step) => {
      priorNodes.clear();
      for (const path of Object.values(step.expect?.identity ?? {})) {
        const node = root.find(path) as RuntimeFieldNode | null;
        if (!node)
          throw new Error(`Scenario identity source missing at ${path}`);
        priorNodes.set(path, { node, itemKey: node.itemKey });
      }
      actionResult = executeCoreScenarioStep(
        root as RuntimeFieldNode,
        scenario,
        step,
      );
    },
    assert: (expectation) => {
      assertCoreScenarioExpectation(root, expectation);
      if ('result' in expectation)
        expect(actionResult, 'action result').toEqual(expectation.result);
      for (const [path, priorPath] of Object.entries(
        expectation.identity ?? {},
      )) {
        const prior = priorNodes.get(priorPath);
        expect(root.find(path), `identity ${path}`).toBe(prior?.node);
        expect(
          (root.find(path) as RuntimeFieldNode | null)?.itemKey,
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
