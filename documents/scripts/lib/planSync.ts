import * as fs from 'node:fs';
import * as path from 'node:path';

import { type DeclarationPage, buildDeclarationIndex } from './buildDeclarationIndex';
import { AUTO_MARKER, generateCategoryMeta, generateMdx, serializeCategoryJSON } from './mdxGenerator';
import { discoverPackages, listUnbuiltPackages } from './packageRegistry';
import type { Redirect } from './types';

/** The file changes that bring the generated winglet pages in line with the built packages. */
export interface SyncPlan {
  /** Files to create or replace; empty when `errors` is not. */
  writes: Array<{ path: string; content: string }>;
  /** Files to remove; empty when `errors` is not. */
  deletes: string[];
  /** One line per problem that stops the sync: an unbuilt package, an exported name without a page, a page path collision. */
  errors: string[];
  /** Number of packages planned. */
  packageCount: number;
}

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

/** Writes and deletes under one package's docs directory. */
function planPackageFiles(
  pkgDocsDir: string,
  shortName: string,
  pages: DeclarationPage[],
): Pick<SyncPlan, 'writes' | 'deletes'> {
  const existing = listFiles(pkgDocsDir);
  const writes: SyncPlan['writes'] = [];
  const pagePaths = new Set<string>();
  for (const page of pages) {
    const filePath = path.join(pkgDocsDir, page.category, `${page.pageName}.mdx`);
    pagePaths.add(filePath);
    const current = readIfExists(filePath);
    if (current !== null && !current.includes(AUTO_MARKER)) continue;
    const content = generateMdx(page.parsed);
    if (current !== content) writes.push({ path: filePath, content });
  }
  for (const category of new Set(pages.map(page => page.category).filter(Boolean))) {
    const filePath = path.join(pkgDocsDir, category, '_category_.json');
    const content = serializeCategoryJSON(generateCategoryMeta(category, shortName));
    if (readIfExists(filePath) !== content) writes.push({ path: filePath, content });
  }

  const deletes = existing.filter(
    filePath => filePath.endsWith('.mdx') && !pagePaths.has(filePath) && fs.readFileSync(filePath, 'utf-8').includes(AUTO_MARKER),
  );
  const remainingPages = [...existing.filter(filePath => filePath.endsWith('.mdx') && !deletes.includes(filePath)), ...pagePaths];
  for (const metaPath of existing.filter(filePath => path.basename(filePath) === '_category_.json')) {
    const categoryDir = path.dirname(metaPath) + path.sep;
    if (!remainingPages.some(filePath => filePath.startsWith(categoryDir))) deletes.push(metaPath);
  }
  return { writes, deletes };
}

/**
 * The redirect list file write, or null when it is already current. Entries
 * whose `from` starts with none of `replacedPrefixes` are kept; a null
 * `replacedPrefixes` replaces the whole list.
 */
function planRedirects(
  filePath: string,
  redirects: Redirect[],
  replacedPrefixes: string[] | null,
): SyncPlan['writes'][number] | null {
  const current = readIfExists(filePath);
  const previous: Redirect[] = current === null ? [] : JSON.parse(current);
  const kept = replacedPrefixes === null ? [] : previous.filter(item => !replacedPrefixes.some(prefix => item.from.startsWith(prefix)));
  const list = [...kept, ...redirects].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  const content = JSON.stringify(list, null, 2) + '\n';
  return content === current ? null : { path: filePath, content };
}

/** File content, or null when the file does not exist. */
function readIfExists(filePath: string): string | null {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
}

/** Absolute paths of every file under `dir`; empty when it does not exist. */
function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath, entry.name));
}
