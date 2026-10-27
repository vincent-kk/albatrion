import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';

/**
 * Snapshot the prior publication while retaining this commit's real latent truth.
 * @param root - Final real shape and current sources
 * @returns Verify-only copy with independent full-rebuild projection stores
 */
export const captureInactiveOracle = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): FieldNodeRuntime<Self> => {
  const runtime = root.runtime;
  return {
    ...runtime,
    latentRawDirty: true,
    latentRawMetadata:
      runtime.latentRawMetadata &&
      new PathKeyedMap('pair', runtime.latentRawMetadata),
    inactiveValueEntries: new PathKeyedMap(
      'pair',
      runtime.inactiveValueEntries,
    ),
    inactiveValuesMemo: new PathKeyedMap('path', runtime.inactiveValuesMemo),
  };
};
