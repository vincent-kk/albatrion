import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type {
  InactiveEntry,
  InactiveGeneration,
  InactiveValues,
} from '../../types/inactiveValues';
import { rebuildInactiveValuesMemo } from '../commit/rebuildInactiveValuesMemo';
import { inactiveValuesVerification } from '../commit/verifyInactiveValuesMemo';
import { EMPTY_VALUES } from '../detached/emptyDetachedReads';
import { readInactiveProjection } from './readInactiveProjection';

/**
 * Rebuild an exact historical source snapshot independently on each verify read.
 * @param root - Runtime layout; its current sources are not used for historical truth
 * @param generation - Immutable generation requested by the public reader
 * @param path - Host path captured with that generation
 * @param actual - Frozen lazy result being checked
 * @param emptyVersion - Shared unchanged-empty version for the root source projection
 * @returns Nothing; throws when a retained generation differs from full reconstruction
 */
export const verifyInactiveRead = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  generation: InactiveGeneration,
  path: string,
  actual: InactiveValues,
  emptyVersion: object,
): void => {
  const view = readInactiveProjection(generation, path, emptyVersion);
  const latentRaw = new PathKeyedMap<unknown>('pair');
  const metadata = new PathKeyedMap<
    NonNullable<
      FieldNodeRuntime<unknown>['latentRawMetadata']
    > extends PathKeyedMap<infer Info>
      ? Info
      : never
  >('pair');
  for (const [key, source] of view.sources) {
    latentRaw.set(key, source.source);
    metadata.set(key, {
      path: source.path,
      blueprintNode: source.template,
      order: source.order,
    });
  }
  const oracle = {
    ...root.runtime,
    latentRaw,
    latentRawMetadata: metadata,
    latentRawDirty: true,
    inactiveValueEntries: new PathKeyedMap<InactiveEntry>('pair'),
    inactiveValuesMemo: new PathKeyedMap<InactiveValues>('path'),
  };
  rebuildInactiveValuesMemo(
    root,
    oracle,
    (candidate) =>
      view.visibility.get(candidate) ??
      view.sources.get(
        view.sources.pathIndex.at(candidate).values().next().value ?? '',
      )?.visible ??
      false,
  );
  const expected = oracle.inactiveValuesMemo.get(path) ?? EMPTY_VALUES;
  inactiveValuesVerification.reads++;
  if (
    !Object.isFrozen(actual) ||
    actual.length !== expected.length ||
    expected.some(
      (entry, index) =>
        entry.path !== actual[index].path ||
        !Object.is(entry.value, actual[index].value) ||
        !Object.isFrozen(actual[index]),
    )
  ) {
    inactiveValuesVerification.violations++;
    throw new Error(
      'Inactive value generation read differs from the full rebuild oracle',
    );
  }
};
