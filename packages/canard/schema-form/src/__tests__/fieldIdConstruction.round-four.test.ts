import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  if (entry.name.startsWith('.') || entry.name.startsWith('__')) return [];
  const path = join(directory, entry.name);
  return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
});

it('keeps one construction site for each identifier lineage', () => {
  const base: string[] = [], derived: string[] = [];
  for (const file of sourceFiles(root)) {
    const source = readFileSync(file, 'utf8');
    for (const line of source.split('\n')) {
      if (/(?:formId|scope)\s*\+\s*['"]:['"]|\$\{(?:formId|scope)\}:/.test(line)) base.push(relative(root, file));
      if (/['"]~(?:input|label)['"]/.test(line)) derived.push(relative(root, file));
    }
  }
  expect(base).toEqual(['helpers/fieldId/resolveFieldIdentifiers.ts']);
  expect(new Set(derived)).toEqual(new Set(['helpers/fieldId/resolveFieldIdentifiers.ts']));
});
