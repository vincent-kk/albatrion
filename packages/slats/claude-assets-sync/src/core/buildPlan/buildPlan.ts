import { join, relative } from 'node:path';

import { hashEquals, hashFile } from '../hash/index.js';
import type { Action, InjectPlan, PlanInput } from './type.js';
import { toPosix } from './utils/toPosix.js';
import { walkFiles } from './utils/walkFiles.js';

export async function buildPlan(input: PlanInput): Promise<InjectPlan> {
  const { sourceHashes, targetRoot, namespacePrefixes, force } = input;
  const actions: Action[] = [];
  let requiresForce = false;

  for (const [relPath, srcHash] of Object.entries(sourceHashes)) {
    const dstAbs = join(targetRoot, relPath);
    const dstHash = await hashFile(dstAbs);
    if (dstHash === null) actions.push({ kind: 'copy', relPath, dstAbs });
    else if (hashEquals(dstHash, srcHash))
      actions.push({ kind: 'skip-uptodate', relPath, dstAbs });
    else {
      actions.push({ kind: 'warn-diverged', relPath, dstAbs });
      requiresForce = true;
    }
  }

  const known = new Set(Object.keys(sourceHashes));
  for (const prefix of namespacePrefixes) {
    const prefixRoot = join(targetRoot, prefix);
    for await (const abs of walkFiles(prefixRoot)) {
      const relPath = toPosix(relative(targetRoot, abs));
      if (known.has(relPath)) continue;
      if (force) actions.push({ kind: 'delete', relPath, dstAbs: abs });
      else {
        actions.push({ kind: 'warn-orphan', relPath, dstAbs: abs });
        requiresForce = true;
      }
    }
  }

  return { actions, requiresForce };
}
