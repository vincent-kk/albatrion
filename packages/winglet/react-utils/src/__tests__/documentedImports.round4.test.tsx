import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';


import { describe, expect, it } from 'vitest';



const packageDir = resolve(__dirname, '../..');
const repositoryRoot = resolve(packageDir, '../../..');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

/** Every named import of a react-utils address inside the fenced code of a document. */
const documentedImports = (file: string) => {
  const text = readFileSync(file, 'utf8');
  const found: Array<{ subpath: string; names: string[] }> = [];
  for (const block of text.matchAll(/```[^\n]*\n([\s\S]*?)```/g))
    for (const statement of block[1].matchAll(
      /import\s*\{([^}]*)\}\s*from\s*'@winglet\/react-utils(\/[^']+)?'/g,
    ))
      found.push({
        subpath: '.' + (statement[2] ?? ''),
        names: statement[1]
          .split(',')
          .map((name) => name.trim())
          .filter((name) => name && !name.startsWith('type ')),
      });
  return found;
};

/** Value names a document imports that the source entry of the subpath does not export at run time. */
const missingNames = async (file: string) => {
  const missing: string[] = [];
  for (const { subpath, names } of documentedImports(file)) {
    const entry = await import(join(packageDir, manifest.exports[subpath].source));
    for (const name of names) if (!(name in entry)) missing.push(`${subpath}:${name}`);
  }
  return missing;
};

describe('documented public imports', () => {
  for (const file of ['README.md', 'README-ko_kr.md']) {
    it(file, async () => expect(await missingNames(join(packageDir, file))).toEqual([]));
  }
  for (const page of ['documents/docs/winglet/react-utils/index.mdx', 'documents/i18n/ko/docusaurus-plugin-content-docs/current/winglet/react-utils/index.mdx']) {
    it(page, async () => {
      const file = join(repositoryRoot, page), text = readFileSync(file, 'utf8');
      expect(await missingNames(file)).toEqual([]);
      for (const signature of ['react >=16.14 <20', 'useConstant(value)', 'useMemorize(input, dependencies)', 'useDebounce(callback, dependencies, ms)', 'withErrorBoundary(Component, fallback)', 'withUploader(Component)', 'Portal.with(Component)', 'useLazyConstant(() => new ExpensiveManager())', 'const App = Portal.with(']) expect(text).toContain(signature);
      expect(text).not.toContain('name="modal"');
    });
  }
});
