import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('round-4 scheduler guidance qualifies the nested microtask order by host', () => {
  const text = readFileSync(new URL('../scheduleMacrotask.ts', import.meta.url), 'utf8');
  expect(text).toContain('microtask checkpoint');
  expect(text).toContain('Node');
  expect(text).toContain('Browser fallback order');
});
