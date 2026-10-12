import type { FormScenario, FormScenarioStep } from '@aileron/schema-form-scenarios';

import type { SchemaNode as RuntimeSchemaNode } from '../../../SchemaNode/SchemaNode';
import { SetValueOption } from '../../../SchemaNode';
import { resetSchemaNodeForm } from '../../../settle';

/**
 * Apply one core-observable action to the tree, including root form loads.
 * @param root - Live runtime record behind the public node surface
 * @param scenario - Shared initial value used by the reset action
 * @param step - Operation to execute; unsupported later-PR actions fail loudly
 * @returns The synchronous action result after settlement
 */
export function executeCoreScenarioStep(
  root: RuntimeSchemaNode, scenario: FormScenario, step: FormScenarioStep,
): unknown {
  const previousDiagnostics = root.diagnostics;
  try {
    if (step.action === 'reset') {
      resetSchemaNodeForm(root, scenario.initialValue,
        SetValueOption.Overwrite | (step.automaticWrites === 'disabled'
          ? SetValueOption.DisableAutomaticWrites : 0));
    } else if (step.action === 'resetSubtree') {
      const node = root.find(step.path);
      if (!node) throw new Error(`Scenario node missing at ${step.path}`);
      node.resetSubtree();
    } else if (step.action === 'setValue' || step.action === 'clear' ||
      step.action === 'push' || step.action === 'pop' ||
      step.action === 'remove' || step.action === 'update') {
      const node = root.find(step.path);
      if (!node) throw new Error(`Scenario node missing at ${step.path}`);
      if (step.action === 'setValue') return node.setValue(step.value);
      if (step.action === 'clear')
        return node.type === 'array' ? node.clear() : node.setValue(undefined);
      if (step.action === 'push') return node.push(step.value);
      if (step.action === 'pop') return node.pop();
      if (step.action === 'remove') return node.remove(step.index);
      return node.update(step.index, step.value);
    } else if (step.action === 'batch') {
      for (const nested of step.steps) executeCoreScenarioStep(root, scenario, nested);
    } else {
      throw new Error(`Core scenario action ${step.action} requires a later PR`);
    }
  } catch (error) {
    if ((step.action !== 'setValue' && step.action !== 'reset' &&
      step.action !== 'resetSubtree') ||
      step.expect?.diagnostics?.status !== 'degraded' ||
      root.diagnostics.status !== 'degraded' ||
      root.diagnostics === previousDiagnostics) throw error;
  }
  return undefined;
}
