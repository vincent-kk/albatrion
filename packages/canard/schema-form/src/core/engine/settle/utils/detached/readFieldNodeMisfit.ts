import type { FieldNodeRecord } from '../../../record';

/** Read the current or final committed misfit lamp for one reference. */
export const readFieldNodeMisfit = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean =>
  node.detached
    ? (node.runtime.detachedReads?.get(node)?.misfit ?? false)
    : node.runtime.misfitPaths.has(node.path);
