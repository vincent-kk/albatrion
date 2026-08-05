import { relative } from 'node:path';

import type { Destination, OrphanScan } from '../agentTarget/index.js';
import { hashEquals, hashFile, type Sha256Hex } from '../hash/index.js';
import {
  blockBodyMatches,
  findBlockBody,
  parseBlocks,
} from '../markerBlock/index.js';
import type { Action, ActionKind, InjectPlan, PlanInput } from './type.js';
import { createDocumentReader } from './utils/readDocument.js';
import { toPosix } from './utils/toPosix.js';
import { walkFiles } from './utils/walkFiles.js';

/**
 * Compare every manifest entry against what is already installed and produce
 * the declarative action list an applier can execute.
 *
 * Reads the filesystem; writes nothing. A path missing from `destinations` is
 * omitted from the plan entirely, which is how a kind-filtered run avoids
 * touching — or deleting — anything outside the requested kinds.
 *
 * @param input - source hashes, destinations, orphan scans and the force flag
 * @returns the actions to apply and whether user-owned content is at stake
 */
export async function buildPlan(input: PlanInput): Promise<InjectPlan> {
  const { sourceHashes, destinations, orphanScans, force } = input;
  const readDocument = createDocumentReader();
  const actions: Action[] = [];
  let requiresForce = false;

  for (const [relPath, srcHash] of Object.entries(sourceHashes)) {
    const destination = destinations.get(relPath);
    if (!destination) continue;
    const kind = await classify(destination, srcHash, readDocument);
    if (kind === 'warn-diverged') requiresForce = true;
    actions.push({ kind, relPath, target: destination });
  }

  const known = new Set(Object.keys(sourceHashes));
  for (const scan of orphanScans) {
    for await (const orphan of findOrphans(scan, known, readDocument)) {
      if (!force) requiresForce = true;
      actions.push({
        kind: force ? 'delete' : 'warn-orphan',
        relPath: orphan.relPath,
        target: orphan.target,
      });
    }
  }

  return { actions, requiresForce };
}

// Decide one entry's verdict. A block is judged by its body hash exactly as a
// file is judged by its content hash, so both share one vocabulary.
async function classify(
  destination: Destination,
  srcHash: Sha256Hex,
  readDocument: (fileAbs: string) => Promise<string | null>,
): Promise<ActionKind> {
  if (destination.kind === 'unsupported') return 'skip-unsupported';
  if (destination.kind === 'file') {
    const dstHash = await hashFile(destination.dstAbs);
    if (dstHash === null) return 'copy';
    return hashEquals(dstHash, srcHash) ? 'skip-uptodate' : 'warn-diverged';
  }
  const content = await readDocument(destination.fileAbs);
  if (content === null) return 'copy';
  const body = findBlockBody(content, destination.blockId);
  if (body === null) return 'copy';
  return blockBodyMatches(body, srcHash) ? 'skip-uptodate' : 'warn-diverged';
}

// Yield content this package installed earlier but no longer ships. A block
// scan is limited to blocks the owner package wrote, so another package's
// blocks in the same document are never proposed for deletion.
async function* findOrphans(
  scan: OrphanScan,
  known: ReadonlySet<string>,
  readDocument: (fileAbs: string) => Promise<string | null>,
): AsyncGenerator<{ relPath: string; target: Destination }> {
  if (scan.kind === 'directory') {
    for await (const abs of walkFiles(scan.scanRoot)) {
      const relPath =
        scan.relPathPrefix + toPosix(relative(scan.scanRoot, abs));
      if (known.has(relPath)) continue;
      yield { relPath, target: { kind: 'file', dstAbs: abs } };
    }
    return;
  }
  const content = await readDocument(scan.fileAbs);
  if (content === null) return;
  for (const block of parseBlocks(content)) {
    if (block.packageName !== scan.ownerPackage) continue;
    if (known.has(block.relPath)) continue;
    yield {
      relPath: block.relPath,
      target: { kind: 'block', fileAbs: scan.fileAbs, blockId: block.blockId },
    };
  }
}
