import { lstat } from 'node:fs/promises';

import {
  type AgentTarget,
  type ResolvedLocations,
  assertProjectPathsContained,
} from '../../../../agentTarget/index.js';

/**
 * Check that the ownership record can be read or replaced without following an alias.
 * @param path Absolute location of the scope's record.
 * @param agentTarget Resolved scope used to enforce project containment.
 * @param resolved Cache local to this path check.
 * @returns True when a regular record is present.
 * @throws When the file links to another destination or cannot be inspected.
 */
export async function checkInstalledRecord(
  path: string,
  agentTarget: AgentTarget,
  resolved: ResolvedLocations,
): Promise<boolean> {
  await assertProjectPathsContained({
    agentTarget,
    dstPaths: [path],
    resolved,
  });
  try {
    const entry = await lstat(path);
    if (entry.isFile() && entry.nlink === 1) return true;
    throw new Error(
      `Installed asset record is not an independent file: ${path}`,
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return false;
    throw error;
  }
}
