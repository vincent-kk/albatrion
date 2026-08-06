import { logger } from '../../../utils/logger.js';
import { classifyTarget } from './classifyTarget.js';
import { type ResolvedMetadata, resolvePackage } from './resolvePackage.js';
import { resolveScopeAlias } from './resolveScopeAlias.js';

/**
 * Classify each `--package` value, resolve them all, and dedupe the
 * result by `packageName`.
 *
 * - `@<scope>` values enumerate through `resolveScopeAlias` (soft skip
 *   when a workspace package lacks `agents.assetPath`).
 * - `@<scope>/<name>` and `<name>` values go through `resolvePackage`.
 *   When the run names a single distinct package, the call is strict
 *   (asset-missing → exit 2); otherwise asset-missing is a soft skip
 *   so the rest of the batch can proceed.
 *
 * Invalid `--package` values exit with code 2 before any filesystem IO.
 *
 * @param targets - raw `--package` values
 * @param rootCwd - directory module resolution and scope enumeration start from
 * @param assetPathOverride - `--asset-path`, applied to every target; the
 *   same strict / soft-skip split then judges the directory instead of the
 *   missing `agents.assetPath` declaration
 * @returns the metadata that resolved, deduped by `packageName`; the reason
 *   each skipped package gave — a `--json` run reports those rather than
 *   leaving its reader to scrape stderr; and whether this run is strict, so
 *   later stages judge their own failures by the same split rather than
 *   counting `--package` values a second time
 */
export async function resolveTargets(
  targets: readonly string[],
  rootCwd: string,
  assetPathOverride?: string,
): Promise<{
  resolved: ResolvedMetadata[];
  skipped: string[];
  strict: boolean;
}> {
  const skipped: string[] = [];
  if (targets.length === 0) return { resolved: [], skipped, strict: false };

  // Naming one package twice still names one package: the split is about what
  // the run asked for, not how many times it said it.
  const isSingleTarget = new Set(targets).size === 1;
  const seen = new Set<string>();
  const results: ResolvedMetadata[] = [];
  let strict = false;

  for (const target of targets) {
    const classification = classifyTarget(target);
    if (classification.kind === 'invalid') {
      logger.error(classification.reason);
      process.exit(2);
    }

    let candidates: ResolvedMetadata[];
    if (classification.kind === 'scope') {
      candidates = await resolveScopeAlias(
        classification.scope,
        rootCwd,
        assetPathOverride,
        skipped,
      );
    } else {
      // A single named package is the whole run, so its failure is the run's.
      // A scope alias never is: a workspace member without assets is ordinary.
      strict = isSingleTarget;
      const meta = await resolvePackage(
        classification.name,
        {
          skipMissingAsset: !isSingleTarget,
          assetPathOverride,
          skipReasons: skipped,
        },
        rootCwd,
      );
      candidates = meta ? [meta] : [];
    }

    for (const meta of candidates) {
      if (!seen.has(meta.packageName)) {
        seen.add(meta.packageName);
        results.push(meta);
      }
    }
  }

  return { resolved: results, skipped, strict };
}
