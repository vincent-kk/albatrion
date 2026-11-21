import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as entry from '../../index';

const packageDir = resolve(__dirname, '../../..');

/** Names imported from the package root inside the fenced code of a document. */
const rootImports = (file: string) => {
  const text = readFileSync(join(packageDir, file), 'utf8');
  const names = new Set<string>();
  for (const block of text.matchAll(/```[^\n]*\n([\s\S]*?)```/g))
    for (const statement of block[1].matchAll(
      /import\s*\{([^}]*)\}\s*from\s*'@winglet\/style-utils'/g,
    ))
      for (const name of statement[1].split(','))
        if (name.trim()) names.add(name.trim().replace(/^type\s+/, ''));
  return [...names];
};

describe('r4-contracts style-utils README import examples', () => {
  it('control: every name the English README imports from the root is exported', () => {
    expect(rootImports('README.md').filter((name) => !(name in entry))).toEqual([]);
  });

  it('every name the Korean README imports from the root is exported', () => {
    expect(
      rootImports('README-ko_kr.md').filter((name) => !(name in entry)),
    ).toEqual([]);
  });
});
