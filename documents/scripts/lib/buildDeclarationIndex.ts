import * as fs from 'node:fs';
import * as path from 'node:path';

import { dropDeprecatedCollisions } from './buildDeclarationIndex/dropDeprecatedCollisions';
import { findDeclaration } from './buildDeclarationIndex/findDeclaration';
import { listRedirects } from './buildDeclarationIndex/listRedirects';
import { orderImportPaths } from './buildDeclarationIndex/orderImportPaths';
import { selectEntry } from './buildDeclarationIndex/selectEntry';
import type { DeclarationIndex, DeclarationPage, ExportRef, IndexedEntry } from './buildDeclarationIndex/types';
import { collectDeprecatedExports } from './collectDeprecatedExports';
import { listEntryExports } from './listEntryExports';
import { parseReexportJSDoc } from './parseReexportJSDoc';
import type { PackageEntry, ParsedFunction, UndocumentedExport } from './types';

export type { DeclarationIndex, DeclarationPage };

/**
 * Builds one page per declaration that a package's entry points export.
 * A declaration's page goes to the category of its canonical sub-path
 * (`selectCanonicalEntry`), or directly under the package directory when only
 * the root exports it. The page is named after the declaration when the
 * canonical entry exports that name, otherwise after the lexically first name
 * it exports. Every other sub-path address and every alias in the canonical
 * category redirects to the page; root addresses of a package with sub-paths
 * do not, and neither does an address that equals a page path or a category
 * directory ignoring case.
 *
 * A deprecated declaration whose page path differs from a current page's only
 * by case gets no page, and its exports count as documented.
 *
 * @param pkg - A package whose main and sub-path .d.ts files exist, under a directory whose package.json carries `pkg.name`.
 * @returns The pages, the exports whose declaration could not be parsed, and the redirects.
 * @throws Error when two declarations need the same page path ignoring case and at most one of them is deprecated.
 */
export function buildDeclarationIndex(pkg: PackageEntry): DeclarationIndex {
  const packageRoot = findPackageRoot(pkg);
  const entries = [
    ...pkg.subPaths.map((subPath, order) => indexEntry(subPath.exportKey, subPath.dtsPath, order)),
    indexEntry('.', pkg.mainDtsPath, pkg.subPaths.length),
  ];
  const groups = new Map<string, ExportRef[]>();
  for (const entry of entries) {
    for (const item of listEntryExports(entry.dtsPath, packageRoot)) {
      const key = `${item.filePath}#${item.declaredName}`;
      groups.set(key, [...(groups.get(key) ?? []), { entry, item }]);
    }
  }

  const parsedFiles = new Map<string, ParsedFunction[]>();
  const candidates: Array<{ page: DeclarationPage; isDeprecated: boolean; refs: ExportRef[] }> = [];
  const undocumented: UndocumentedExport[] = [];
  for (const [key, refs] of groups) {
    const { declaredName, filePath, externalSpecifier } = refs[0].item;
    const canonical = selectEntry(refs, entries, filePath);
    const names = refs.filter(ref => ref.entry === canonical).map(ref => ref.item.exportedName);
    const pageName = names.includes(declaredName) ? declaredName : [...names].sort()[0];
    const parsed = externalSpecifier
      ? parseReexportJSDoc(filePath, { moduleSpecifier: externalSpecifier, originalName: declaredName }, pkg.name, pkg.version, canonical.category)
      : findDeclaration(parsedFiles, filePath, declaredName, pkg);
    if (!parsed) {
      undocumented.push(...refs.map(ref => ({ entryKey: ref.entry.entryKey, exportedName: ref.item.exportedName, filePath })));
      continue;
    }
    const importPaths = orderImportPaths(refs, canonical, pageName, pkg.name);
    candidates.push({
      page: { key, pageName, category: canonical.category, parsed: { ...parsed, name: pageName, categoryPath: canonical.category, importPaths }, importPaths },
      isDeprecated: parsed.deprecated || refs.some(ref => ref.entry.deprecatedNames.has(ref.item.exportedName)),
      refs,
    });
  }

  const kept = dropDeprecatedCollisions(pkg.name, candidates);
  return { pages: kept.map(({ page }) => page), undocumented, redirects: listRedirects(pkg, kept, entries) };
}

/** Describes an entry point; its category is its export key without the leading "./". */
function indexEntry(entryKey: string, dtsPath: string, exportsOrder: number): IndexedEntry {
  const category = entryKey.replace(/^\.\/?/, '');
  const entryDir = fs.realpathSync(path.dirname(dtsPath));
  return { entryKey, dtsPath, entryDir, category, exportsOrder, deprecatedNames: collectDeprecatedExports(dtsPath) };
}

/** The directory above the main .d.ts whose package.json carries the package name. */
function findPackageRoot(pkg: PackageEntry): string {
  for (let dir = path.dirname(pkg.mainDtsPath); dir !== path.dirname(dir); dir = path.dirname(dir)) {
    const manifestPath = path.join(dir, 'package.json');
    if (fs.existsSync(manifestPath) && JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).name === pkg.name) return dir;
  }
  throw new Error(`no package.json named ${pkg.name} above ${pkg.mainDtsPath}`);
}
