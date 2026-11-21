import {
  type OrphanScan,
  resolveDestinations,
} from '../../../../../agentTarget/index.js';
import {
  type InstalledAssets,
  RECORDED_CLAUDE_KINDS,
} from '../../utils/readInstalledAssets.js';

/**
 * Select exact orphan candidates from prior successful installations.
 * @param installed Ownership record for the current scope.
 * @param options Current manifest destinations and requested kinds.
 * @param orphanScans Ordinary scans that already cover current skill namespaces.
 * @returns Exact files that only this participant recorded and no longer ships.
 */
export function getInstalledOrphanScans(
  installed: InstalledAssets,
  options: Parameters<typeof resolveDestinations>[0],
  orphanScans: readonly OrphanScan[],
): Extract<OrphanScan, { kind: 'installed-file' }>[] {
  const previous = installed.packages.get(options.packageName);
  if (!previous?.size) return [];
  const retained = new Set(options.relPaths);
  for (const [owner, paths] of installed.packages) {
    if (owner === options.packageName) continue;
    for (const path of paths.keys()) retained.add(path);
  }
  const relPaths = [...previous.keys()].filter(
    (path) =>
      !retained.has(path) &&
      !orphanScans.some(
        (scan) =>
          scan.kind === 'directory' && path.startsWith(scan.relPathPrefix),
      ),
  );
  const { destinations } = resolveDestinations({
    ...options,
    relPaths,
    namespacePrefixes: [],
    assetKinds: new Set(
      RECORDED_CLAUDE_KINDS.filter((kind) => options.assetKinds.has(kind)),
    ),
  });
  const scans: Extract<OrphanScan, { kind: 'installed-file' }>[] = [];
  for (const [relPath, destination] of destinations) {
    const installedHash = previous.get(relPath);
    if (destination.kind === 'file' && installedHash)
      scans.push({
        kind: 'installed-file',
        relPath,
        dstAbs: destination.dstAbs,
        installedHash,
      });
  }
  return scans;
}
