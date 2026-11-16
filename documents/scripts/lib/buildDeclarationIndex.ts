import * as fs from 'node:fs';
import * as path from 'node:path';

import { collectDeprecatedExports } from './collectDeprecatedExports';
import { type EntryExport, listEntryExports } from './listEntryExports';
import { parseReexportJSDoc, parseRichJSDoc } from './parseRichJSDoc';
import { selectCanonicalEntry } from './selectCanonicalEntry';
import type { ImportPath, PackageEntry, ParsedFunction, Redirect, UndocumentedExport } from './types';

/** The generated page of one declaration. */
export interface DeclarationPage {
  /** `filePath + '#' + declaredName` of the declaration. */
  key: string;
  /** File name and title of the page. */
  pageName: string;
  /** Category directory of the page; '' places it directly under the package directory. */
  category: string;
  /** Page content, with `name`, `categoryPath` and `importPaths` set for this page. */
  parsed: ParsedFunction;
  /** Canonical entry first, then the other sub-paths in `exports` order, then the root. */
  importPaths: ImportPath[];
}

/** Every page of a package, the exported names left without one, and the redirects to the pages. */
export interface DeclarationIndex {
  pages: DeclarationPage[];
  undocumented: UndocumentedExport[];
  /** Sorted by `from`. */
  redirects: Redirect[];
}

/** One entry point of the package, with the category its canonical pages go to. */
interface IndexedEntry {
  entryKey: string;
  dtsPath: string;
  /** Real path of the directory that holds `dtsPath`. */
  entryDir: string;
  category: string;
  exportsOrder: number;
  /** Names whose export specifier carries the deprecation tag. */
  deprecatedNames: Set<string>;
}

/** One way a declaration is exported: the entry and what it reports for the name. */
type ExportRef = { entry: IndexedEntry; item: EntryExport };

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

/** The canonical entry among the sub-paths that export a declaration, or the root when none does. */
function selectEntry(refs: ExportRef[], entries: IndexedEntry[], declarationFile: string): IndexedEntry {
  const hopsByEntry = new Map<IndexedEntry, number>();
  for (const { entry, item } of refs) {
    if (entry.entryKey !== '.') hopsByEntry.set(entry, Math.min(hopsByEntry.get(entry) ?? Infinity, item.hops));
  }
  if (hopsByEntry.size === 0) return entries[entries.length - 1];
  const exporting = [...hopsByEntry];
  const candidates = exporting.map(([entry, hops]) => ({ entryKey: entry.entryKey, entryDir: entry.entryDir, hops, exportsOrder: entry.exportsOrder }));
  return exporting[candidates.indexOf(selectCanonicalEntry(candidates, declarationFile))][0];
}

/** The parsed declaration named `declaredName` in `filePath`, parsing each file once. */
function findDeclaration(
  parsedFiles: Map<string, ParsedFunction[]>,
  filePath: string,
  declaredName: string,
  pkg: PackageEntry,
): ParsedFunction | null {
  let parsed = parsedFiles.get(filePath);
  if (!parsed) {
    parsed = parseRichJSDoc(filePath, pkg.name, pkg.version, '');
    parsedFiles.set(filePath, parsed);
  }
  return parsed.find(item => item.name === declaredName) ?? null;
}

/** Import paths with the canonical entry first, then `exports` order with the root last; within an entry, the page name first. */
function orderImportPaths(refs: ExportRef[], canonical: IndexedEntry, pageName: string, packageName: string): ImportPath[] {
  const entryRank = (ref: ExportRef): number => (ref.entry === canonical ? -1 : ref.entry.exportsOrder);
  const nameRank = (ref: ExportRef): string => (ref.item.exportedName === pageName ? '' : ref.item.exportedName);
  return [...refs]
    .sort((a, b) => entryRank(a) - entryRank(b) || compareText(nameRank(a), nameRank(b)))
    .map(({ entry, item }) => ({
      entryKey: entry.entryKey,
      moduleSpecifier: entry.category ? `${packageName}/${entry.category}` : packageName,
      exportedName: item.exportedName,
      isTypeOnly: item.isTypeOnly,
    }));
}

/**
 * Keeps one page per page path compared ignoring case: a lone page, or the
 * one current page among deprecated ones.
 */
function dropDeprecatedCollisions<T extends { page: DeclarationPage; isDeprecated: boolean }>(packageName: string, candidates: T[]): T[] {
  const byPath = new Map<string, T[]>();
  for (const candidate of candidates) {
    const key = pagePath(candidate.page.category, candidate.page.pageName).toLowerCase();
    byPath.set(key, [...(byPath.get(key) ?? []), candidate]);
  }
  return [...byPath.values()].map(same => {
    if (same.length === 1) return same[0];
    const current = same.filter(candidate => !candidate.isDeprecated);
    if (current.length === 1) return current[0];
    const described = same.map(({ page }) => `${pagePath(page.category, page.pageName)} (${page.parsed.sourceFile})`).sort();
    throw new Error(`page path collision: ${packageName} ${described.join(', ')}`);
  });
}

/** Redirects from every non-canonical address of each page, sorted by `from`. */
function listRedirects(pkg: PackageEntry, kept: Array<{ page: DeclarationPage; refs: ExportRef[] }>, entries: IndexedEntry[]): Redirect[] {
  const base = `/docs/${pkg.namespace}/${pkg.shortName}`;
  const address = (category: string, name: string): string => `${base}/${pagePath(category, name)}`;
  const reserved = new Set(
    [
      ...kept.map(({ page }) => address(page.category, page.pageName)),
      ...entries.filter(entry => entry.category).map(entry => `${base}/${entry.category}`),
    ].map(item => item.toLowerCase()),
  );
  const hasSubPaths = entries.length > 1;
  const redirects: Redirect[] = [];
  for (const { page, refs } of kept) {
    const to = address(page.category, page.pageName);
    for (const { entry, item } of refs) {
      if (hasSubPaths && entry.entryKey === '.') continue;
      const from = address(entry.category, item.exportedName);
      if (!reserved.has(from.toLowerCase())) redirects.push({ from, to });
    }
  }
  return redirects.sort((a, b) => compareText(a.from, b.from));
}

/** `<category>/<name>`, or `<name>` for a page directly under the package directory. */
function pagePath(category: string, name: string): string {
  return category ? `${category}/${name}` : name;
}

/** Code-unit order, independent of the locale. */
function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
