import type { FieldNodeRecord } from '../../../record';

/**
 * Read the current or final committed mismatch lamp for one reference.
 * @param node - Live occurrence or departed reference with frozen reads
 * @returns Whether its retained raw value misses the effective accepted types
 */
export const readFieldNodeIsMisfit = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean =>
  node.detached
    ? (node.runtime.detachedReads?.get(node)?.isMisfit ?? false)
    : node.runtime.misfitPaths.has(node.path);
