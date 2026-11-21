import { replaceDocument } from '../../replaceDocument.js';
import type { RunUnit } from '../types.js';
import { checkInstalledRecord } from './checkInstalledRecord.js';
import {
  type InstalledAssets,
  RECORDED_CLAUDE_KINDS,
} from './readInstalledAssets.js';

/**
 * Saves ownership proved by successful filesystem actions.
 * @param installed Record read during planning and shared across this run.
 * @param unit Participant whose file actions all succeeded.
 * @returns Resolves when the latest evidence has been recorded.
 */
export async function recordInstalledAssets(
  installed: InstalledAssets,
  unit: RunUnit,
): Promise<void> {
  const previous = installed.packages.get(unit.target.name);
  const hashes = new Map(previous);
  let changed = false;
  for (const action of unit.plan.actions) {
    if (action.target.kind !== 'file') continue;
    if (
      !RECORDED_CLAUDE_KINDS.some((kind) =>
        action.relPath.startsWith(kind + '/'),
      )
    )
      continue;
    if (action.kind === 'delete')
      changed = hashes.delete(action.relPath) || changed;
    else if (
      (action.kind === 'copy' || action.kind === 'warn-diverged') &&
      action.sourceHash &&
      action.sourceHash !== hashes.get(action.relPath)
    ) {
      hashes.set(action.relPath, action.sourceHash);
      changed = true;
    }
  }
  if (!changed) return;
  const packages = new Map(installed.packages);
  if (hashes.size) packages.set(unit.target.name, hashes);
  else packages.delete(unit.target.name);
  const serialized = Object.fromEntries(
    Array.from(packages, ([owner, paths]) => [
      owner,
      Object.fromEntries(paths),
    ]),
  );
  await checkInstalledRecord(installed.path, unit.agentTarget, new Map());
  await replaceDocument(
    installed.path,
    Buffer.from(JSON.stringify(serialized) + '\n'),
  );
  installed.packages = packages;
}
