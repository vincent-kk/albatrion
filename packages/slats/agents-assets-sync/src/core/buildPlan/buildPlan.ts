import { join, relative } from 'node:path';

import type { AsyncFn } from '@aileron/declare';

import type { Destination, OrphanScan } from '../agentTarget/index.js';
import { type Sha256Hex, hashEquals, hashFile } from '../hash/index.js';
import {
  blockBodyMatches,
  parseBlocks,
} from '../markerBlock/index.js';
import { isNoisePath } from '../utils/isNoisePath.js';
import { toPosix } from '../utils/toPosix.js';
import { walkFiles } from '../utils/walkFiles.js';
import type { Action, ActionKind, InjectPlan, PlanInput } from './type.js';
import { indexManagedAliases } from './utils/indexManagedAliases.js';
import { isManagedAlias } from './utils/isManagedAlias.js';
import { createDocumentReader } from './utils/readDocument.js';

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
    const actualHash =
      input.assetRoot && destination.kind !== 'unsupported'
        ? await hashFile(join(input.assetRoot, relPath))
        : srcHash;
    if (actualHash === null) throw new Error(`Source file missing: ${relPath}`);
    const sourceHashReconciled = actualHash !== srcHash;
    const kind = await classify(destination, actualHash, readDocument);
    if (kind === 'warn-diverged') requiresForce = true;
    actions.push({
      kind,
      relPath,
      target: destination,
      ...(sourceHashReconciled ? { sourceHashReconciled } : {}),
    });
  }

  const known = new Set(Object.keys(sourceHashes));
  const aliases = indexManagedAliases(destinations);
  for (const scan of orphanScans) {
    for await (const orphan of findOrphans(
      scan,
      known,
      readDocument,
      aliases,
    )) {
      // Deleting is as user-visible as overwriting: under --force the flag is
      // what makes renderers confirm and list the deletion.
      requiresForce = true;
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
  readDocument: AsyncFn<[fileAbs: string], string | null>,
): Promise<ActionKind> {
  if (destination.kind === 'unsupported') return 'skip-unsupported';
  if (destination.kind === 'file') {
    const dstHash = await hashFile(destination.dstAbs);
    if (dstHash === null) return 'copy';
    return hashEquals(dstHash, srcHash) ? 'skip-uptodate' : 'warn-diverged';
  }
  const content = await readDocument(destination.fileAbs);
  if (content === null) return 'copy';
  const blockId = Buffer.from(destination.blockId, 'utf8').toString('latin1');
  const blocks = parseBlocks(content).filter(block => block.blockId === blockId);
  if (!blocks.length) return 'copy';
  return blocks.every(block => blockBodyMatches(block.body, srcHash, 'latin1')) ? 'skip-uptodate' : 'warn-diverged';
}

// Yield content this package installed earlier but no longer ships. Noise the
// source hasher drops was never installed, so it is never an orphan. A block
// scan is limited to blocks the owner package wrote, so another package's
// blocks in the same document are never proposed for deletion.
async function* findOrphans(
  scan: OrphanScan,
  known: ReadonlySet<string>,
  readDocument: AsyncFn<[fileAbs: string], string | null>,
  aliases: ReadonlyMap<string, readonly string[]>,
): AsyncGenerator<{ relPath: string; target: Destination }> {
  if (scan.kind === 'directory') {
    for await (const abs of walkFiles(scan.scanRoot)) {
      const scanRelPath = toPosix(relative(scan.scanRoot, abs));
      if (isNoisePath(scanRelPath)) continue;
      const relPath = scan.relPathPrefix + scanRelPath;
      if (known.has(relPath) || (await isManagedAlias(relPath, abs, aliases)))
        continue;
      yield { relPath, target: { kind: 'file', dstAbs: abs } };
    }
    return;
  }
  const content = await readDocument(scan.fileAbs);
  if (content === null) return;
  for (const block of parseBlocks(content)) {
    if (block.packageName !== scan.ownerPackage) continue;
    const relPath = Buffer.from(block.relPath, 'latin1').toString('utf8');
    if (known.has(relPath)) continue;
    yield {
      relPath,
      target: { kind: 'block', fileAbs: scan.fileAbs, blockId: Buffer.from(block.blockId, 'latin1').toString('utf8') },
    };
  }
}
