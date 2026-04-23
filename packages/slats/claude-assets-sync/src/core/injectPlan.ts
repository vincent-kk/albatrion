import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

import { hashEquals, hashFile, type Sha256Hex } from './hash.js';

export type Action =
  | { kind: 'copy'; relPath: string; dstAbs: string }
  | { kind: 'skip-uptodate'; relPath: string; dstAbs: string }
  | { kind: 'warn-diverged'; relPath: string; dstAbs: string }
  | { kind: 'warn-orphan'; relPath: string; dstAbs: string }
  | { kind: 'delete'; relPath: string; dstAbs: string };

export interface InjectPlan {
  actions: Action[];
  requiresForce: boolean;
}

export interface PlanInput {
  sourceHashes: Record<string, Sha256Hex>;
  targetRoot: string;
  namespacePrefixes: string[];
  force: boolean;
}

const toPosix = (p: string): string => (sep === '/' ? p : p.split(sep).join('/'));

async function* walkFiles(root: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const abs = join(root, entry.name);
    if (entry.isDirectory()) yield* walkFiles(abs);
    else if (entry.isFile()) yield abs;
  }
}

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
