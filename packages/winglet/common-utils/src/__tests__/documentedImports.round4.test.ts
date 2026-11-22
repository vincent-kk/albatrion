import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageDir = resolve(__dirname, '../..');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

/** Every `import { … } from '@winglet/common-utils…'` inside fenced code of a document. */
const documentedImports = (file: string) => {
  const text = readFileSync(join(packageDir, file), 'utf8');
  const found: Array<{ subpath: string; names: string[] }> = [];
  for (const block of text.matchAll(/```[^\n]*\n([\s\S]*?)```/g))
    for (const statement of block[1].matchAll(
      /import\s*\{([^}]*)\}\s*from\s*'@winglet\/common-utils(\/[^']+)?'/g,
    ))
      found.push({
        subpath: '.' + (statement[2] ?? ''),
        names: statement[1]
          .split(',')
          .map((name) => name.trim().replace(/^type\s+/, ''))
          .filter(Boolean),
      });
  return found;
};

/** Names a documented import requests that the source entry of its subpath does not export. */
const missingNames = async (file: string) => {
  const missing: string[] = [];
  for (const { subpath, names } of documentedImports(file)) {
    const source = manifest.exports[subpath]?.source;
    if (!source) {
      missing.push(`${subpath} (no such subpath)`);
      continue;
    }
    const entry = await import(join(packageDir, source));
    for (const name of names)
      if (!(name in entry) && name !== 'someUtility')
        missing.push(`${subpath}:${name}`);
  }
  return missing;
};

describe('r4-contracts common-utils README import examples', () => {
  it('every name the English README imports is exported by its subpath', async () => {
    expect(await missingNames('README.md')).toEqual([]);
  });

  it('every name the Korean README imports is exported by its subpath', async () => {
    expect(await missingNames('README-ko_kr.md')).toEqual([]);
  });

  it('control: the chunk function the example means exists on the array subpath', async () => {
    const { chunk } = await import(join(packageDir, 'src/utils/array/index.ts'));
    expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
});
