import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { verifyGateSelection } from '../gates/verifyGateSelection';
import { getDependencyIndex } from './getDependencyIndex';

/**
 * Answer owner membership without expanding dormant table members into a set.
 * @param context - Settlement retaining explicit owners and monotone split hits
 * @param path - Concrete declaration owner tested by state/exit publication
 * @returns The same membership as the full-registration reference set
 */
export const isDependencyOwner = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  const owner = context.splitHitEpochs
    ? getDependencyIndex(context.root.runtime.blueprint).splitOwners.get(path)
    : undefined;
  const result =
    context.dependencyOwnerPaths.has(path) ||
    (!!owner && !!context.splitHitEpochs?.has(owner.bucket));
  if (context.registrationShadow)
    verifyGateSelection(
      result === context.registrationShadow.owners.has(path),
      'S3 dependency owner differs: ' + path,
    );
  return result;
};
