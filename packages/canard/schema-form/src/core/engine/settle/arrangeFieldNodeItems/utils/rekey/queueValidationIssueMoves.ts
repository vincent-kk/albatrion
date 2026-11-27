import { FieldNodeEventType, queueNonSettleEvent } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';

/**
 * Announce held validator issues that an array move rewrote, so `onValidate` and error readers see the new paths.
 * @param root - Live form root owning the rewritten stores
 * @param owners - Held-list owners from `rekeyValidationIssuePaths`; keys of other trees are skipped
 * @returns Nothing; UpdateError per owner and UpdateGlobalError on the root join the next non-settlement wave
 */
export const queueValidationIssueMoves = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  owners: ReadonlySet<unknown>,
): void => {
  const runtime = root.runtime;
  for (const owner of owners)
    if (isTreeNode<Self>(owner, runtime))
      queueNonSettleEvent(
        owner,
        FieldNodeEventType.UpdateError,
        runtime.validationErrors?.get(owner) ?? [],
      );
  queueNonSettleEvent(
    root,
    FieldNodeEventType.UpdateGlobalError,
    runtime.globalErrors ?? [],
  );
};

/**
 * Narrow a held-list key to a record of this tree without an unchecked assertion.
 * @param candidate - Key of `runtime.validationErrors`
 * @param runtime - Runtime of the tree being announced
 * @returns Whether the key is a record owned by this runtime
 */
const isTreeNode = <Self extends FieldNodeRecord<Self>>(
  candidate: unknown,
  runtime: Self['runtime'],
): candidate is Self =>
  candidate !== null &&
  typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime;
