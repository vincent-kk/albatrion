import type { FieldNodeRecord } from '../../../record';
import { EMPTY_PATHS } from './emptyDetachedReads';

/** Read the current or final committed misfit paths for one reference. */
export const readFieldNodeMisfits = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly string[] =>
  node.detached
    ? (node.runtime.detachedReads?.get(node)?.misfits ?? EMPTY_PATHS)
    : (node.runtime.misfitsMemo?.get(node.path)?.paths ?? EMPTY_PATHS);
