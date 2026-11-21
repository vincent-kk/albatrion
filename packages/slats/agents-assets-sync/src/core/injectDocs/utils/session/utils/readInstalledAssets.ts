import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type {
  AgentTarget,
  AssetKind,
  ResolvedLocations,
} from '../../../../agentTarget/index.js';
import { checkInstalledRecord } from './checkInstalledRecord.js';

/** The scopes where Claude uses files instead of self-identifying blocks. */
export const RECORDED_CLAUDE_KINDS = [
  'rules',
  'skills',
] as const satisfies readonly AssetKind[];

/** The one installed-content record shared by every Claude unit in a run. */
export interface InstalledAssets {
  readonly path: string;
  packages: Map<string, Map<string, string>>;
}

/**
 * Reads the previous successful installations for this scope.
 * @param agentTarget Claude's resolved installation target.
 * @param resolved Shared run cache for containment checks.
 * @returns The verified state, initially empty if the record does not exist.
 * @throws When an existing record is malformed or its path cannot be safely read.
 */
export async function readInstalledAssets(
  agentTarget: AgentTarget,
  resolved: ResolvedLocations,
): Promise<InstalledAssets> {
  const path = join(
    agentTarget.projectRoot,
    '.agents-assets-sync',
    'claude.json',
  );
  const state: InstalledAssets = { path, packages: new Map() };
  if (!(await checkInstalledRecord(path, agentTarget, resolved))) return state;
  const contents: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (!contents || typeof contents !== 'object' || Array.isArray(contents))
    throw new Error(`Invalid installed asset record: ${path}`);
  for (const [name, files] of Object.entries(contents))
    state.packages.set(name, parseHashes(files, path));
  return state;
}

/** Reads relative paths and SHA-256 digests from one package record. */
function parseHashes(files: unknown, path: string): Map<string, string> {
  if (!files || typeof files !== 'object' || Array.isArray(files))
    throw new Error(`Invalid installed asset record: ${path}`);
  const hashes = new Map<string, string>();
  for (const [name, hash] of Object.entries(files)) {
    if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/i.test(hash))
      throw new Error(`Invalid installed asset hash: ${path}`);
    hashes.set(name, hash);
  }
  return hashes;
}
