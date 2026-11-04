import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { verifyGateSelection } from '../gates/verifyGateSelection';
import { getDependencyIndex } from './getDependencyIndex';

/**
 * Defend an entry/revival against a hit newer than its last applied generation.
 * @param child - Newly entered or revived child after ordinary entry marking
 * @param context - Settlement whose split hit/mark maps carry the generation proof
 * @returns Nothing; current semantics require the child to be dirty already
 */
export const supplementSplitOwner = <Self extends FieldNodeRecord<Self>>(
  child: Self,
  context: SettlementContext<Self>,
): void => {
  if (!context.splitHitEpochs) return;
  const owner = getDependencyIndex(child.runtime.blueprint).splitOwners.get(
    child.path,
  );
  if (!owner) return;
  const lastHit = context.splitHitEpochs.get(owner.bucket);
  if (lastHit === undefined) return;
  const dirtyBefore = context.dirtyPaths.has(child.path);
  verifyGateSelection(
    dirtyBefore,
    'S4 entry/revival must already be dirty: ' + child.path,
  );
  if (lastHit > (context.splitMarks?.get(child.path) ?? -1)) {
    context.dirtyPaths.add(child.path);
    (context.splitMarks ??= new Map()).set(child.path, lastHit);
    if (!dirtyBefore && context.registrationShadow)
      context.registrationShadow.supplementInsertions++;
  }
};
