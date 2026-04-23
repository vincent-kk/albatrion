import type { ConsumerPackage } from '../../../discover/index.js';
import { isPathInside } from './isPathInside.js';

/**
 * Returns the consumer whose `packageRoot` contains `cwd` (including equality).
 * When multiple consumers match (e.g. nested packages), the longest
 * `packageRoot` wins — the deepest owner takes priority.
 */
export function resolveCwdPackageName(
  all: ConsumerPackage[],
  cwd: string,
): string | null {
  let best: ConsumerPackage | null = null;
  for (const pkg of all) {
    if (!isPathInside(cwd, pkg.packageRoot)) continue;
    if (!best || pkg.packageRoot.length > best.packageRoot.length) best = pkg;
  }
  return best ? best.name : null;
}
