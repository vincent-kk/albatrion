import type { FormScenario, FormScenarioStep } from '@aileron/schema-form-scenarios';

import type { SchemaNode as RuntimeSchemaNode } from '../../../SchemaNode/SchemaNode';
import { SetValueOption } from '../../../SchemaNode';
import { resetSchemaNodeForm } from '../../../settle';

/**
 * Apply one core-observable action to the tree, including root form loads.
 * @param root - Live runtime record behind the public node surface
 * @param scenario - Shared initial value used by the reset action
 * @param step - Operation to execute; unsupported later-PR actions fail loudly
 * @returns Nothing after the synchronous settle completes
 */
export function executeCoreScenarioStep(
  root: RuntimeSchemaNode, scenario: FormScenario, step: FormScenarioStep,
): void {
  const previousDiagnostics = root.diagnostics;
  try {
    if (step.action === 'reset') {
      resetSchemaNodeForm(root, scenario.initialValue, SetValueOption.Overwrite);
    } else if (step.action === 'setValue' || step.action === 'clear') {
      const node = root.find(step.path);
      if (!node) throw new Error(`Scenario node missing at ${step.path}`);
      node.setValue(step.action === 'clear' ? undefined : step.value);
    } else if (step.action === 'batch') {
      for (const nested of step.steps) executeCoreScenarioStep(root, scenario, nested);
    } else {
      throw new Error(`Core scenario action ${step.action} requires a later PR`);
    }
  } catch (error) {
    if ((step.action !== 'setValue' && step.action !== 'reset') ||
      step.expect?.diagnostics?.status !== 'degraded' ||
      root.diagnostics.status !== 'degraded' ||
      root.diagnostics === previousDiagnostics) throw error;
  }
}
