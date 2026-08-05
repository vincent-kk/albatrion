import { join } from 'node:path';

import { formatBlockId } from '../../markerBlock/index.js';
import type {
  AgentTarget,
  AssetKind,
  Destination,
  OrphanScan,
} from '../type.js';
import { splitAssetKind } from './splitAssetKind.js';

const SKILLS_PREFIX = 'skills/';

interface ResolveDestinationsInput {
  readonly agentTarget: AgentTarget;
  /** Consumer package that owns these paths; namespaces the marker blocks. */
  readonly packageName: string;
  /** Manifest paths to place. */
  readonly relPaths: readonly string[];
  /** Managed skill namespaces, e.g. `['skills/foo/']`, from the hash manifest. */
  readonly namespacePrefixes: readonly string[];
  /** Kinds the caller asked for; anything else is left alone entirely. */
  readonly assetKinds: ReadonlySet<AssetKind>;
}

/**
 * Map every manifest path to the place this agent keeps it, and describe
 * where content this package no longer ships could still be sitting.
 *
 * Paths whose leading segment names no known kind, and kinds the caller
 * filtered out, are absent from the result — absence means "not ours to
 * touch", which is what keeps a filtered run from deleting anything.
 *
 * @param input - target, owning package, paths, namespaces and kind filter
 * @returns `destinations` keyed by manifest path, and the orphan scans to run
 * @throws when a skill directory would shadow a reserved agent namespace
 */
export function resolveDestinations(input: ResolveDestinationsInput): {
  destinations: Map<string, Destination>;
  orphanScans: OrphanScan[];
} {
  const { agentTarget, packageName, relPaths, namespacePrefixes, assetKinds } =
    input;
  const { directoryRoots, rulesMergeFile, unsupported } = agentTarget;

  const destinations = new Map<string, Destination>();
  for (const relPath of relPaths) {
    const split = splitAssetKind(relPath);
    if (!split || !assetKinds.has(split.kind)) continue;
    const { kind, rest } = split;
    assertNotReserved(kind, rest);

    const reason = unsupported[kind];
    if (reason !== undefined) {
      destinations.set(relPath, { kind: 'unsupported', reason });
      continue;
    }
    if (kind === 'rules' && rulesMergeFile !== null) {
      destinations.set(relPath, {
        kind: 'block',
        fileAbs: rulesMergeFile,
        blockId: formatBlockId(packageName, relPath),
      });
      continue;
    }
    const root = directoryRoots[kind];
    if (root !== null)
      destinations.set(relPath, { kind: 'file', dstAbs: join(root, rest) });
  }

  const orphanScans: OrphanScan[] = [];
  const skillsRoot = directoryRoots.skills;
  if (assetKinds.has('skills') && skillsRoot !== null) {
    for (const prefix of namespacePrefixes) {
      if (!prefix.startsWith(SKILLS_PREFIX)) continue;
      // A namespace prefix ends with `/`, and `join` keeps it — trim so the
      // scan root reads as a directory path rather than a prefix.
      const namespace = prefix.slice(SKILLS_PREFIX.length).replace(/\/+$/, '');
      if (namespace.length === 0) continue;
      orphanScans.push({
        kind: 'directory',
        scanRoot: join(skillsRoot, namespace),
        relPathPrefix: prefix,
      });
    }
  }
  if (assetKinds.has('rules') && rulesMergeFile !== null)
    orphanScans.push({
      kind: 'block-file',
      fileAbs: rulesMergeFile,
      ownerPackage: packageName,
    });

  return { destinations, orphanScans };
}

// A dot-prefixed first segment is how agents mark their own reserved space
// (Codex ships built-ins under `skills/.system/`). Writing there would look
// like a built-in and could be overwritten by the agent's own updates.
function assertNotReserved(kind: AssetKind, rest: string): void {
  if (!rest.startsWith('.')) return;
  throw new Error(
    `[agents-assets-sync] ${kind}/${rest} starts with a dot; that namespace is reserved by the agent and cannot receive injected assets.`,
  );
}
