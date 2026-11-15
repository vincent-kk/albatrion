import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { DirtyPathSet } from '../scratch/DirtyPathSet';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Mirror every ordinary dirty effect throughout the complete verification settlement.
 * @param context - Fresh context before write marking has started
 * @returns Nothing; scratch cleanup restores all wrapped container methods
 */
export const watchSplitRegistration = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (engineModes.gateSelection !== 'verify' || !context.hasGates) return;
  const dirtyPaths = context.dirtyPaths;
  const shape = context.shapeDirtyPaths;
  const owners = context.dependencyOwnerPaths;
  const add = dirtyPaths.add;
  const remove = dirtyPaths.delete;
  const clear = dirtyPaths.clear;
  const addShape = shape.add;
  const addOwner = owners.add;
  const shadow = (context.registrationShadow = {
    dirtyPaths: new DirtyPathSet(new Map()),
    shape: new Set<string>(),
    owners: new Set<string>(),
    isRegistering: false,
    supplementInsertions: 0,
    restore: () => {
      dirtyPaths.add = add;
      dirtyPaths.delete = remove;
      dirtyPaths.clear = clear;
      shape.add = addShape;
      owners.add = addOwner;
      if (dirtyPaths instanceof DirtyPathSet)
        dirtyPaths.restoreRegistrationObserver = undefined;
      verifyGateSelection(
        shadow.supplementInsertions === 0,
        'S4 supplement insertions must be zero',
      );
    },
  });
  for (const path of dirtyPaths) shadow.dirtyPaths.add(path);
  for (const path of shape) shadow.shape.add(path);
  for (const path of owners) shadow.owners.add(path);
  dirtyPaths.add = function (path: string) {
    if (!shadow.isRegistering) shadow.dirtyPaths.add(path);
    return add.call(this, path);
  };
  dirtyPaths.delete = function (path: string) {
    if (!shadow.isRegistering) shadow.dirtyPaths.delete(path);
    return remove.call(this, path);
  };
  dirtyPaths.clear = function () {
    verifyGateSelection(false, 'S3 gated dirty set cleared during settlement');
    return clear.call(this);
  };
  shape.add = function (path: string) {
    if (!shadow.isRegistering) shadow.shape.add(path);
    return addShape.call(this, path);
  };
  owners.add = function (path: string) {
    if (!shadow.isRegistering) shadow.owners.add(path);
    return addOwner.call(this, path);
  };
  if (dirtyPaths instanceof DirtyPathSet)
    dirtyPaths.restoreRegistrationObserver = shadow.restore;
};
