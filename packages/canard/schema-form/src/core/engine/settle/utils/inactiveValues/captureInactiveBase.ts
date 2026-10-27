import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type {
  InactiveBase,
  InactiveEntry,
  InactiveSource,
  InactiveValues,
} from '../../types/inactiveValues';

/**
 * Capture a full fallback's immutable source and selected-entry baseline.
 * @param root - Final shape after the full oracle publication
 * @param values - Version-to-array cache receiving existing frozen publications
 * @returns A source baseline independent from later mutable latent stores
 */
export const captureInactiveBase = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  values: WeakMap<object, InactiveValues>,
): InactiveBase => {
  const runtime = root.runtime;
  const sources = new PathKeyedMap<InactiveSource>('pair');
  for (const [key, source] of runtime.latentRaw) {
    const info = runtime.latentRawMetadata?.get(key);
    if (info)
      sources.set(key, {
        key,
        path: info.path,
        present: true,
        source,
        template: info.blueprintNode,
        order: info.order,
        visible: find(root, info.path) !== null,
      });
  }
  const versions = new Map<string, object>();
  for (const [path, list] of runtime.inactiveValuesMemo) {
    const version = {};
    versions.set(path, version);
    values.set(version, list);
  }
  return {
    sources,
    entries: new PathKeyedMap<InactiveEntry>(
      'pair',
      runtime.inactiveValueEntries,
    ),
    versions,
  };
};
