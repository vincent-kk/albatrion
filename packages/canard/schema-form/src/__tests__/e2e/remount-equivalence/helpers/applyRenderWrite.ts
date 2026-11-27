import { act } from '@testing-library/react';

import type { FormScenarioStep } from '@aileron/schema-form-scenarios';

import type { FieldNode } from '@/schema-form';
import type { RemountWrite } from '@/schema-form/__tests__/fixtures/remountEquivalence/types';
import { createRenderScenarioAdapter } from '@/schema-form/__tests__/helpers/createRenderScenarioAdapter';
import type { FormHarness } from '@/schema-form/__tests__/renderForm';

import { applyPublicNodeWrite } from './applyPublicNodeWrite';

/**
 * Reuse the screen adapter and extend only its missing verification vocabulary.
 * @param form - Existing public Form render harness.
 * @param write - Shared scene step.
 * @param retained - Old references used by detached-write histories.
 * @returns Whether a UI input accepted the requested write.
 */
export async function applyRenderWrite(
  form: FormHarness,
  write: RemountWrite,
  retained: Map<string, FieldNode>,
): Promise<boolean> {
  if (write.action === 'context') {
    await form.rerenderContext(write.value as Record<string, unknown>);
    return true;
  }
  const field =
    write.action === 'setValue' ? form.field(write.path ?? '') : null;
  if (field && (field.disabled || ('readOnly' in field && field.readOnly)))
    return false;
  if (
    [
      'setValue',
      'clear',
      'push',
      'pop',
      'remove',
      'update',
      'reset',
      'resetSubtree',
    ].includes(write.action)
  ) {
    const adapter = createRenderScenarioAdapter(form);
    await adapter.execute(write as FormScenarioStep);
    await adapter.settle?.();
  } else {
    await act(async () => {
      applyPublicNodeWrite(form.node('')!, write, retained);
    });
    await form.flush();
  }
  return true;
}
