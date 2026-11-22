import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';
import { clone, stableEquals } from '@/common-utils';
it('RG1: foreign Error cycles preserve enumerable cause and aliases', () => {
  const source = runInNewContext('const e = new Error("remote"); e.cause = e; ({ error: e, alias: e })');
  const output = clone(source);
  expect(output).not.toBe(source);
  expect(output.error).toBe(output.alias);
  expect(output.error.cause).toBe(output.error);
  expect(Object.getOwnPropertyDescriptor(output.error, 'cause')?.enumerable).toBe(true);
});
it('RG3: a deep alternating object-array graph preserves cycles without overflowing', () => {
  const root: any = {}; let tail = root;
  for (let index = 0; index < 12000; index++) { const next: any = {}; tail.next = [next]; tail = next; }
  tail.next = [root];
  const output = clone(root);
  expect(output === root).toBe(false);
  expect(stableEquals(root, output)).toBe(true);
});
