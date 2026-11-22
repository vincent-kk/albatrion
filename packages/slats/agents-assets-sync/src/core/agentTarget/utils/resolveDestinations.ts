import { join } from 'node:path';

import { formatBlockId } from '../../markerBlock/index.js';
import type {
  AgentTarget,
  AssetKind,
  Destination,
  OrphanScan,
  PlanningOrphanScan,
} from '../type.js';
import { splitAssetKind } from './splitAssetKind.js';

const SKILLS_PREFIX = 'skills/';
// A `..` segment under either separator: `join` would resolve it above the
// kind root. A name that merely contains dots (`a..b`) does not match.
const PARENT_SEGMENT = /(?:^|[\\/])\.\.(?:[\\/]|$)/;

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

/** Destinations paired with the scans available to the caller. */
type ResolvedDestinations<Scan extends PlanningOrphanScan> = {
  destinations: Map<string, Destination>;
  orphanScans: Scan[];
};

/**
 * Map every manifest path to the place this agent keeps it, and describe
 * where content this package no longer ships could still be sitting.
 *
 * Paths whose leading segment names no known kind, and kinds the caller
 * filtered out, are absent from the result — absence means "not ours to
 * touch", which is what keeps a filtered run from deleting anything.
 *
 * @param input - target, owning package, paths, namespaces and kind filter
 * @param previous - ownership evidence for paths absent from the current manifest, supplied by the planner
 * @returns `destinations` keyed by manifest path, and the orphan scans to run
 * @throws when a skill directory would shadow a reserved agent namespace, or
 *   when a manifest path or namespace prefix holds a `..` segment that would
 *   place a destination or an orphan scan outside its kind root
 */
export function resolveDestinations(
  input: ResolveDestinationsInput,
): ResolvedDestinations<OrphanScan>;
export function resolveDestinations(
  input: ResolveDestinationsInput,
  previous: ReadonlyMap<string, string> | undefined,
): ResolvedDestinations<PlanningOrphanScan>;
export function resolveDestinations(
  input: ResolveDestinationsInput,
  previous: ReadonlyMap<string, string> | undefined = undefined,
): ResolvedDestinations<PlanningOrphanScan> {
  const { agentTarget, packageName, relPaths, namespacePrefixes, assetKinds } =
    input;
  const { directoryRoots, rulesMergeFile, unsupported } = agentTarget;

  const destinations = new Map<string, Destination>();
  const orphanScans: PlanningOrphanScan[] = [];
  const current = previous?.size ? new Set(relPaths) : undefined;
  const paths = current && previous ? new Set([...current, ...previous.keys()]) : relPaths;
  for (const relPath of paths) {
    const split = splitAssetKind(relPath);
    if (!split || !assetKinds.has(split.kind)) continue;
    const { kind, rest } = split;
    const root = directoryRoots[kind];
    assertContained(relPath);
    assertNotReserved(kind, rest);
    if (current && !current.has(relPath)) {
      const installedHash = previous?.get(relPath);
      if (
        root !== null &&
        kind !== 'commands' &&
        installedHash &&
        (kind !== 'skills' || !namespacePrefixes.some((prefix) => relPath.startsWith(prefix)))
      )
        orphanScans.push({ kind: 'installed-file', relPath, dstAbs: join(root, rest), installedHash });
      continue;
    }

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
    if (root !== null)
      destinations.set(relPath, { kind: 'file', dstAbs: join(root, rest) });
  }

  const skillsRoot = directoryRoots.skills;
  if (assetKinds.has('skills') && skillsRoot !== null) {
    for (const prefix of namespacePrefixes) {
      if (!prefix.startsWith(SKILLS_PREFIX)) continue;
      assertContained(prefix);
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

/** Public destination planning takes no installed ownership evidence. */
export const resolvePublicDestinations: (
  input: ResolveDestinationsInput,
) => ResolvedDestinations<OrphanScan> = resolveDestinations;

// Manifest keys come from a published file or a public API caller, so they are
// untrusted: refuse any that would climb out of the root they are joined to.
function assertContained(manifestPath: string): void {
  if (!PARENT_SEGMENT.test(manifestPath)) return;
  throw new Error(
    `[agents-assets-sync] ${manifestPath} contains a '..' segment; injected assets must stay inside their destination root.`,
  );
}

// A dot-prefixed first segment is how agents mark their own reserved space
// (Codex ships built-ins under `skills/.system/`). Writing there would look
// like a built-in and could be overwritten by the agent's own updates.
function assertNotReserved(kind: AssetKind, rest: string): void {
  if (kind !== 'skills' || !rest.startsWith('.') || !rest.includes('/')) return;
  throw new Error(
    `[agents-assets-sync] ${kind}/${rest} starts with a dot; that namespace is reserved by the agent and cannot receive injected assets.`,
  );
}
