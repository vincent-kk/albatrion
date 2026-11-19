import { describe, expect, it } from 'vitest';

import { writeFieldNodeInput } from '../../core/surface/utils/binding/writeFieldNodeInput';
import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    constructor: { type: 'string' },
    toString: { type: 'string' },
    team: {
      type: 'object',
      properties: { constructor: { type: 'string' }, name: { type: 'string' } },
    },
    other: { type: 'string' },
  },
} as const;

const runUpdater = (mode: 'sequential' | 'batch', path: string) => {
  const { root } = build(schema, { other: 'o', team: { name: 'n' } });
  const seen: unknown[] = [];
  const write = () =>
    root.find(path).setValue((prev: unknown) => {
      seen.push(typeof prev === 'function' ? `function ${(prev as any).name}` : prev);
      return typeof prev === 'string' ? `${prev}!` : 'fresh';
    });
  if (mode === 'batch') root.batch(write);
  else write();
  return { seen, value: root.find(path).value };
};

describe('consequence: a counter updater on an absent field named constructor', () => {
  it('UC batch(() => node.setValue((prev) => (prev ?? "") + "x")) gives "x" as outside a batch', () => {
    const run = (mode: 'sequential' | 'batch') => {
      const { root } = build(schema, { other: 'o', team: { name: 'n' } });
      const write = () =>
        root.find('/team/constructor').setValue((prev: any) => (prev ?? '') + 'x');
      if (mode === 'batch') root.batch(write);
      else write();
      return root.outputValue;
    };
    const sequential = run('sequential');
    const batched = run('batch');
    diag('UC', { sequential, batched });
    expect(batched).toEqual(sequential);
  });
});

describe('the FieldInput onChange channel takes the batch path for updaters', () => {
  it('UI writeFieldNodeInput (the binding behind FieldInput onChange) with an updater on /team/constructor', () => {
    const { root } = build(schema, { other: 'o', team: { name: 'n' } });
    let seen: unknown;
    writeFieldNodeInput(root.find('/team/constructor'), (prev: any) => {
      seen = typeof prev === 'function' ? `function ${prev.name}` : prev;
      return (prev ?? '') + 'x';
    });
    diag('UI', { seen, out: root.outputValue });
    expect(seen).toBeUndefined();
  });
});

describe('updater input inside a batch for an absent field named like an Object.prototype member', () => {
  for (const path of ['/constructor', '/toString', '/team/constructor']) {
    it(`U ${path}: the updater receives undefined inside a batch, as outside`, () => {
      const sequential = runUpdater('sequential', path);
      const batched = runUpdater('batch', path);
      diag(`U ${path}`, { sequential, batched });
      expect(batched).toEqual(sequential);
    });
  }
});
