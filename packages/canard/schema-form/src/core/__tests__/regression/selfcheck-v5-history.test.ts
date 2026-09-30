import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const historyTree = () => makeSchemaNodeTree({ type: 'object', properties: {
  kind: { type: 'string' }, base: { type: 'string', default: 'BASE' },
}, allOf: [
  { controls: { active: './kind === "a"' }, properties: {
    a: { type: 'string', default: 'A0' },
  } },
  { controls: { active: './kind === "b"' }, properties: {
    b: { type: 'string' },
  } },
] }).root;

// filid:contract factory-single-path
describe('selfcheck-v5 raw history regression', () => {
  it('selfcheck-v5.mjs:365 SETTLE-048 replaces latent raw and appends extras last', () => {
    const root = historyTree();
    root.setValue({ kind: 'b', b: 'SECRET' });
    root.setValue({ kind: 'a', a: 'NEW', extra: 1 });
    expect(JSON.stringify(root.outputValue)).toBe('{"kind":"a","a":"NEW","extra":1}');
    root.find('/kind')?.setValue('b');
    expect(JSON.stringify(root.outputValue)).toBe('{"kind":"b","extra":1}');
    expect(root.find('/b')?.raw).toBeUndefined();
  });

  it('selfcheck-v5.mjs:379 distinguishes partial latent retention from replacement', () => {
    const root = historyTree();
    root.setValue({ kind: 'a', a: 'OLD', b: 'SECRET', extra: 7 });
    root.find('/kind')?.setValue('b');
    expect(root.outputValue).toHaveProperty('b', 'SECRET');
    root.setValue({ kind: 'a', a: 'NEW' });
    root.find('/kind')?.setValue('b');
    expect(root.outputValue).not.toHaveProperty('b');
    root.setValue({ kind: 'a', a: 'OLD', b: 'SECRET', extra: 7 });
    expect(root.inactiveValues).toContainEqual({ path: '/b', value: 'SECRET' });
    root.setValue(root.outputValue);
    root.find('/kind')?.setValue('b');
    expect(root.find('/b')?.raw).toBeUndefined();
  });
});
