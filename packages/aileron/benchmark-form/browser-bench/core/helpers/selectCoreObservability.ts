import type { CoreFixture } from '../../../fixtures/core/types';
import { coreObservability } from '../coreObservability';
import type { CoreObservabilityRow } from '../coreObservability';

/**
 * Select the observability row of a fixture's operation and validation mode.
 * @param fixture - Operation and whether validation is enabled.
 * @returns The row; throws for a combination the table does not describe.
 */
export function selectCoreObservability(
  fixture: Pick<CoreFixture, 'operation' | 'validation'>,
): CoreObservabilityRow {
  const key = `${fixture.operation}-${fixture.validation ? 'validate' : 'none'}`;
  const row = Object.entries(coreObservability).find(
    ([name]) => name === key,
  )?.[1];
  if (!row) throw new Error('Core observability row missing: ' + key);
  return row;
}
