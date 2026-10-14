import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Decide whether a distributed child input at this path counts as a caller write.
 * A batch composes its root input from the last committed value, so untouched keys
 * are present too; only a path inside a replace path, or an ancestor of one that the
 * distribution must pass through, was written (R1). Outside a batch every key counts.
 * @param context - Settlement whose `replacePaths` is set only for a multi-write batch
 * @param path - Child path the host would distribute to
 * @returns Whether the host's distributed input is a write for that child
 */
export const isWithinReplacePaths = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  const paths = context.replacePaths;
  if (paths === undefined) return true;
  for (let index = 0; index < paths.length; index++) {
    const written = paths[index];
    if (
      path === written ||
      path.startsWith(written + '/') ||
      written.startsWith(path + '/')
    )
      return true;
  }
  return false;
};
