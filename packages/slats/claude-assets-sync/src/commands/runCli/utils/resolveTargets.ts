import { logger } from '../../../utils/logger.js';
import { classifyTarget } from './classifyTarget.js';
import { resolvePackage, type ResolvedMetadata } from './resolvePackage.js';
import { resolveScopeAlias } from './resolveScopeAlias.js';

/**
 * Classify each `--package` value, resolve them all, and dedupe the
 * result by `packageName`.
 *
 * - `@<scope>` values enumerate through `resolveScopeAlias` (soft skip
 *   when a workspace package lacks `claude.assetPath`).
 * - `@<scope>/<name>` and `<name>` values go through `resolvePackage`.
 *   When there is a single `--package` value, the call is strict
 *   (asset-missing → exit 2); otherwise asset-missing is a soft skip
 *   so the rest of the batch can proceed.
 *
 * Invalid `--package` values exit with code 2 before any filesystem IO.
 */
export async function resolveTargets(
  targets: readonly string[],
  rootCwd: string,
): Promise<ResolvedMetadata[]> {
  if (targets.length === 0) return [];

  const isSingleTarget = targets.length === 1;
  const seen = new Set<string>();
  const results: ResolvedMetadata[] = [];

  for (const target of targets) {
    const classification = classifyTarget(target);
    if (classification.kind === 'invalid') {
      logger.error(classification.reason);
      process.exit(2);
    }

    let candidates: ResolvedMetadata[];
    if (classification.kind === 'scope') {
      candidates = await resolveScopeAlias(classification.scope, rootCwd);
    } else {
      const meta = await resolvePackage(classification.name, {
        skipMissingAsset: !isSingleTarget,
      });
      candidates = meta ? [meta] : [];
    }

    for (const meta of candidates) {
      if (!seen.has(meta.packageName)) {
        seen.add(meta.packageName);
        results.push(meta);
      }
    }
  }

  return results;
}
