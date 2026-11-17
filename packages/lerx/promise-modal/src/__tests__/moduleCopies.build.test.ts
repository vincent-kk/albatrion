// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';

it.each([
  ['esm', 'esm'],
  ['esm', 'cjs'],
  ['cjs', 'esm'],
])(
  'shares pending prompt drafts and DOM ownership across %s/%s evaluations',
  (first, second) => {
    const output = execFileSync(
      process.execPath,
      [`${process.cwd()}/src/__tests__/fixtures/runModuleCopies.mjs`, first, second],
      { encoding: 'utf8' },
    );
    expect(output).toContain(
      `MODULE_COPIES_OK ${first}+${second} prompt=draft keydown=1 cleanup=1`,
    );
  },
);
