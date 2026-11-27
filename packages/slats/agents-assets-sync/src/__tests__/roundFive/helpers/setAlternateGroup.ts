import { chownSync, statSync } from 'node:fs';

/** Try an alternate group without assuming that membership grants chown access.
 * @param path Owned fixture file whose existing group is the comparison baseline.
 * @param groups Actual supplementary groups returned by the process.
 * @returns The group set successfully, or undefined when none can be set.
 */
export function setAlternateGroup(
  path: string,
  groups: readonly number[],
): number | undefined {
  const initialGroup = statSync(path).gid;
  for (const group of groups) {
    if (group === initialGroup) continue;
    try {
      chownSync(path, -1, group);
      return group;
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !('code' in error) ||
        !['EPERM', 'EACCES'].includes(String(error.code))
      )
        throw error;
    }
  }
  return undefined;
}
