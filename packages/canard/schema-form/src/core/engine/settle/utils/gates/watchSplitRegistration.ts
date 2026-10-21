import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { DirtyPathSet } from '../scratch/DirtyPathSet';
import { gateSelectionTable } from './gateSelectionTable';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Mirror every ordinary dirty effect throughout the complete verification settlement.
 * @param context - Fresh context before write marking has started
 * @returns Nothing; scratch cleanup restores all wrapped container methods
 */
export const watchSplitRegistration = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (gateSelectionTable.mode !== 'verify' || !context.hasGates) return;
  const dirty = context.dirtyPaths;
  const shape = context.shapeDirtyPaths;
  const owners = context.dependencyOwnerPaths;
  const add = dirty.add;
  const remove = dirty.delete;
  const clear = dirty.clear;
  const addShape = shape.add;
  const addOwner = owners.add;
  const shadow = (context.registrationShadow = {
    dirty: new DirtyPathSet(new Map()),
    shape: new Set<string>(),
    owners: new Set<string>(),
    registering: false,
    supplementInsertions: 0,
    restore: () => {
      dirty.add = add;
      dirty.delete = remove;
      dirty.clear = clear;
      shape.add = addShape;
      owners.add = addOwner;
      if (dirty instanceof DirtyPathSet)
        dirty.restoreRegistrationObserver = undefined;
      verifyGateSelection(
        shadow.supplementInsertions === 0,
        'S4 supplement insertions must be zero',
      );
    },
  });
  for (const path of dirty) shadow.dirty.add(path);
  for (const path of shape) shadow.shape.add(path);
  for (const path of owners) shadow.owners.add(path);
  dirty.add = function (path: string) {
    if (!shadow.registering) shadow.dirty.add(path);
    return add.call(this, path);
  };
  dirty.delete = function (path: string) {
    if (!shadow.registering) shadow.dirty.delete(path);
    return remove.call(this, path);
  };
  dirty.clear = function () {
    verifyGateSelection(false, 'S3 gated dirty set cleared during settlement');
    return clear.call(this);
  };
  shape.add = function (path: string) {
    if (!shadow.registering) shadow.shape.add(path);
    return addShape.call(this, path);
  };
  owners.add = function (path: string) {
    if (!shadow.registering) shadow.owners.add(path);
    return addOwner.call(this, path);
  };
  if (dirty instanceof DirtyPathSet)
    dirty.restoreRegistrationObserver = shadow.restore;
};
