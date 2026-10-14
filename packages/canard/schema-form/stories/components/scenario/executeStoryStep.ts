import type { FormScenarioStep } from '@aileron/schema-form-scenarios';

import type { FormHandle } from '../../../src';

/**
 * Execute handle-only operations without inserting intermediate DOM writes.
 * @param handle - Current public Form handle.
 * @param step - Shared action; batches cannot contain async submission.
 * @returns The action result; missing paths and invalid array targets throw.
 */
export function executeStoryStep(handle: FormHandle, step: FormScenarioStep): unknown {
  if (step.action === 'submit') return handle.submit();
  if (step.action === 'reset') {
    if (step.automaticWrites) throw new Error('FormHandle.reset has no per-call write option');
    return handle.reset();
  }
  if (step.action === 'batch') return handle.node!.batch(() => {
    for (const nested of step.steps) {
      if (nested.action === 'submit') throw new Error('Cannot submit inside a synchronous batch');
      executeStoryStep(handle, nested);
    }
  });
  const node = handle.findNode(step.path);
  if (!node) throw new Error(`Scenario node missing at ${step.path}`);
  if (step.action === 'resetSubtree') return node.resetSubtree();
  if (step.action === 'setValue') return node.setValue(step.value);
  if (step.action === 'clear') return node.type === 'array' ? node.clear() : node.setValue(undefined);
  if (node.type !== 'array') throw new Error(`Expected array at ${step.path}`);
  if (step.action === 'push') return node.push(step.value);
  if (step.action === 'pop') return node.pop();
  if (step.action === 'remove') return node.remove(step.index);
  return node.update(step.index, step.value);
}
