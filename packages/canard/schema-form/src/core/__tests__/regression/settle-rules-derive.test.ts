import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

// filid:contract factory-single-path
describe('round18 derive settlement rules', () => {
  it('settleRules.test.mjs:15 SETTLE-004 later source wins an equal-rank tie', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'number', controls: { injectTo: () => ({ '../target': 'earlier' }) } },
      b: { type: 'number', controls: { injectTo: () => ({ '../target': 'later' }) } },
      target: { type: 'string' },
    } });
    root.setValue({ a: 1, b: 1 });
    expect(root.find('/target')?.raw).toBe('later');
  });

  it('settleRules.test.mjs:25 SETTLE-004 higher kind survives a later round', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'number', controls: { injectTo: (value: unknown) => ({ '../b': Number(value) + 1 }) } },
      b: { type: 'number', controls: { injectTo: (value: unknown) => ({ '../target': `I${value}` }) } },
      target: { type: 'string', controls: { derived: '"D" + ../a' } },
    } });
    root.setValue({ a: 1, b: 1 });
    expect(root.find('/target')?.raw).toBe('D1');
  });

  it('settleRules.test.mjs:36 SETTLE-004 layer and fragment order break source ties', () => {
    const nodeLayer = makeSchemaNodeTree({ type: 'object', controls: {
      children: [{ targets: ['target'], controls: { derived: './source + " child"' } }],
    }, properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source + " node"' } },
    } }).root;
    nodeLayer.setValue({ source: 'A' });
    expect(nodeLayer.find('/target')?.raw).toBe('A node');
    const fragmentLayer = makeSchemaNodeTree({ type: 'object', properties: {
      source: { type: 'string' },
    }, allOf: [
      { controls: { derived: './source + " first"' }, properties: { target: { type: 'string' } } },
      { controls: { derived: './source + " second"' }, properties: { target: { type: 'string' } } },
    ] }).root;
    fragmentLayer.setValue({ source: 'A' });
    expect(fragmentLayer.find('/target')?.raw).toBe('A second');
  });

  it('settleRules.test.mjs:59 LANDING-064 exit edge does not inject after root replacement', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' }, target: { type: 'string' },
      source: { type: 'string', controls: {
        active: '../flag', injectTo: (value: unknown) => ({ '../target': value }),
      } },
    } });
    root.setValue({ flag: true, source: 'before' });
    expect(root.find('/target')?.raw).toBe('before');
    root.setValue({ flag: false, source: 'after', target: 'before' });
    expect(root.find('/target')?.raw).toBe('before');
  });
});
