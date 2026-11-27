import * as path from 'node:path';

import { buildDeclarationIndex } from './buildDeclarationIndex';
import { discoverPackages, listUnbuiltPackages } from './packageRegistry';
import { planPackageFiles } from './planSync/planPackageFiles';
import { planRedirects } from './planSync/planRedirects';
import type { SyncPlan } from './planSync/types';
import type { Redirect } from './types';

export type { SyncPlan };

const NAMESPACE = 'winglet';

/**
 * Plans the pages, category metadata and redirect list of the winglet
 * packages, reading the file system without writing to it. A page without
 * the generated marker is never written or deleted; a generated page no
 * declaration needs is deleted, and so is the `_category_.json` of a
 * category directory left without pages.
 *
 * @param options.packageFilter - Package directory name to limit the plan to, e.g. "json"; null plans
 *   every package. With a filter, the redirects of the other packages stay as they are.
 * @param options.docsDir - Docs root that holds `winglet/<package>/`; the redirect list is the
 *   `redirects.winglet.json` beside it.
 * @param options.packagesDir - Directory that holds `winglet/<package>/package.json`.
 * @returns The plan; any error empties its writes and deletes.
 */
export function planSync(options: { packageFilter: string | null; docsDir: string; packagesDir: string }): SyncPlan {
  const { packageFilter, docsDir, packagesDir } = options;
  const isSelected = (shortName: string): boolean => packageFilter === null || shortName === packageFilter;
  const unbuilt = listUnbuiltPackages(NAMESPACE, { docsDir, packagesDir }).filter(name =>
    isSelected(name.slice(name.indexOf('/') + 1)),
  );
  const errors = unbuilt.map(name => `not built: ${name}`);
  const packages = discoverPackages({ docsDir, packagesDir }).filter(
    pkg => pkg.namespace === NAMESPACE && isSelected(pkg.shortName) && !unbuilt.includes(pkg.name),
  );
  if (packages.length === 0 && errors.length === 0) {
    errors.push(`no ${NAMESPACE} packages found${packageFilter === null ? '' : ` named ${packageFilter}`}`);
  }

  const writes: SyncPlan['writes'] = [];
  const deletes: string[] = [];
  const redirects: Redirect[] = [];
  for (const pkg of packages) {
    let index;
    try {
      index = buildDeclarationIndex(pkg);
    } catch (error) {
      errors.push(`${pkg.name}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const item of index.undocumented) {
      errors.push(`exported but undocumented: ${pkg.name} ${item.entryKey} ${item.exportedName} (${item.filePath})`);
    }
    const files = planPackageFiles(path.join(docsDir, NAMESPACE, pkg.shortName), pkg.shortName, index.pages);
    writes.push(...files.writes);
    deletes.push(...files.deletes);
    redirects.push(...index.redirects);
  }

  const replacedPrefixes = packageFilter === null ? null : packages.map(pkg => `/docs/${NAMESPACE}/${pkg.shortName}/`);
  const redirectsWrite = planRedirects(path.join(path.dirname(docsDir), `redirects.${NAMESPACE}.json`), redirects, replacedPrefixes);
  if (redirectsWrite) writes.push(redirectsWrite);

  if (errors.length > 0) return { writes: [], deletes: [], errors, packageCount: packages.length };
  return { writes, deletes, errors, packageCount: packages.length };
}
