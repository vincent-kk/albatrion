// @vitest-environment node
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('ships public declarations without benchmark artifacts', () => {
  const entries = readdirSync(resolve(__dirname, '../../dist'), {
    recursive: true,
    encoding: 'utf8',
  });

  expect(entries).toContain('index.d.ts');
  expect(
    entries.filter(
      (entry) =>
        /(^|[/\\])__benchmarks__([/\\]|$)/.test(entry) ||
        /\.bench\.d\.[cm]?ts$/.test(entry),
    ),
  ).toEqual([]);
});
