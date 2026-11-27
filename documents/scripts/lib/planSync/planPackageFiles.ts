import * as fs from 'node:fs';
import * as path from 'node:path';

import type { DeclarationPage } from '../buildDeclarationIndex';
import { AUTO_MARKER, generateCategoryMeta, generateMdx, serializeCategoryJSON } from '../mdxGenerator';
import { readIfExists } from './readIfExists';
import type { SyncPlan } from './types';

/** Writes and deletes under one package's docs directory. */
export function planPackageFiles(
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

/** Absolute paths of every file under `dir`; empty when it does not exist. */
function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath, entry.name));
}
