import type { FormScenario, ScenarioAdapter } from '@aileron/schema-form-scenarios';

import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../blueprint';
import { schemaNodeFactory, SetValueOption } from '../../../SchemaNode';
import type { SchemaNode as RuntimeSchemaNode } from '../../../SchemaNode/SchemaNode';
import { loadSchemaNodeAtMount } from '../../../settle';
import { assertCoreScenarioExpectation } from './assertCoreScenarioExpectation';
import { executeCoreScenarioStep } from './executeCoreScenarioStep';

/**
 * Bind a shared scenario to the PR-2 node tree and its form load lifetime.
 * @param scenario - Pure schema, initial value, and steps from the shared package
 * @returns Adapter that executes steps and asserts the live public node surface
 */
export function createCoreScenarioAdapter(scenario: FormScenario): ScenarioAdapter {
  const root = schemaNodeFactory(blueprint(scenario.schema as BlueprintSchema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,
    latentRaw: new Map(),
    typeMismatchPaths: new Set(),
    inactiveValuesMemo: new Map(),
  });
  loadSchemaNodeAtMount(root as RuntimeSchemaNode, scenario.initialValue,
    SetValueOption.Overwrite);
  return {
    execute: (step) => executeCoreScenarioStep(root as RuntimeSchemaNode, scenario, step),
    assert: (expectation) => assertCoreScenarioExpectation(root, expectation),
  };
}
