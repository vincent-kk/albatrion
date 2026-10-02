import { describe, expect, it } from 'vitest';

import { SchemaNodeEventType, writeSchemaNodeInput } from '../../SchemaNode';
import type { SchemaNode } from '../../SchemaNode';
import { makeSchemaNodeTree } from '../makeSchemaNodeTree';

const requireNode = (root: SchemaNode, path: string): SchemaNode => {
  const node = root.find(path);
  if (!node) throw new Error(`Missing test node ${path}`);
  return node;
};

const nestedTree = () => {
  const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
    mid: { type: 'object', properties: {
      x: { type: 'string' }, y: { type: 'string' },
    } }, top: { type: 'string' },
  } });
  root.setValue({ mid: { x: 'a', y: 'b' }, top: 't' });
  return { root, runtime, mid: requireNode(root, '/mid'),
    leaf: requireNode(root, '/mid/x') };
};

// filid:contract factory-single-path
describe('selfcheck-v5 notification ports', () => {
  it('selfcheck-v5.mjs:348 keeps the root emit reference when an omitted nested field becomes empty', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' }, addr: { type: 'object', properties: {
        zip: { type: 'string' },
      } },
    } });
    root.setValue({ a: 'x' });
    const before = root.outputValue;
    let notified = 0;
    root.subscribe(() => { notified += 1; });
    requireNode(root, '/addr/zip').setValue('');
    expect(root.outputValue).toBe(before);
    expect(notified).toBe(0);
  });

  it('selfcheck-v5.mjs:681 delivers root, parent, leaf for both write scopes', () => {
    const { root, mid, leaf } = nestedTree();
    const order: string[] = [];
    leaf.subscribe(() => { order.push('leaf'); });
    mid.subscribe(() => { order.push('mid'); });
    root.subscribe(() => { order.push('root'); });
    leaf.setValue('a2');
    expect(order).toEqual(['root', 'mid', 'leaf']);
    order.length = 0;
    root.setValue({ mid: { x: 'z', y: 'b' }, top: 'u' });
    expect(order).toEqual(['root', 'mid', 'leaf']);
  });

  it('selfcheck-v5.mjs:696 keeps first-wave payloads while listener writes commit', () => {
    const { mid, leaf } = nestedTree();
    const seen: { node: string; payload: unknown; value: unknown }[] = [];
    mid.subscribe((event) => {
      if (!(event.type & SchemaNodeEventType.UpdateValue)) return;
      const payload = event.payload?.[SchemaNodeEventType.UpdateValue];
      if (JSON.stringify(payload).includes('a2')) leaf.setValue('a3');
      seen.push({ node: 'mid', payload, value: mid.value });
    });
    leaf.subscribe((event) => {
      if (event.type & SchemaNodeEventType.UpdateValue)
        seen.push({ node: 'leaf',
          payload: event.payload?.[SchemaNodeEventType.UpdateValue], value: leaf.value });
    });
    leaf.setValue('a2');
    expect(seen.map(({ node }) => node)).toEqual(['mid', 'leaf', 'mid', 'leaf']);
    expect(seen[0].payload).toMatchObject({ current: { emit: { x: 'a2', y: 'b' } } });
    expect(seen[0].value).toEqual({ x: 'a3', y: 'b' });
    expect(seen[1].payload).toMatchObject({ current: 'a2' });
    expect(seen[1].value).toBe('a3');
  });

  it('selfcheck-v5.mjs:712 batches 1000 writes into one commit and one delivery wave', () => {
    const properties = Object.fromEntries(Array.from({ length: 1000 }, (_, i) =>
      [`f${i}`, { type: 'string' }]));
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties });
    root.setValue({});
    let changes = 0;
    let deliveries = 0;
    Reflect.set(runtime, 'onChange', () => { changes += 1; });
    for (let i = 0; i < 1000; i += 1)
      requireNode(root, `/f${i}`).subscribe(() => { deliveries += 1; });
    const revision = root.revision(SchemaNodeEventType.UpdateValue);
    root.batch(() => {
      for (let i = 0; i < 1000; i += 1)
        requireNode(root, `/f${i}`).setValue(`v${i}`);
    });
    expect(root.revision(SchemaNodeEventType.UpdateValue)).toBe(revision + 1);
    expect([changes, deliveries]).toEqual([1, 1000]);
    root.batch(() => {
      root.batch(() => {
        for (let i = 0; i < 500; i += 1)
          requireNode(root, `/f${i}`).setValue(`w${i}`);
      });
      root.batch(() => {
        for (let i = 500; i < 1000; i += 1)
          requireNode(root, `/f${i}`).setValue(`w${i}`);
      });
    });
    expect([changes, deliveries]).toEqual([2, 2000]);
  });

  it('selfcheck-v5.mjs:723 EVENT-010 isolates a throwing listener and throws at chain end', () => {
    const { root, mid, leaf } = nestedTree();
    const order: string[] = [];
    const failure = new Error('boom');
    const revision = root.revision();
    root.subscribe(() => { throw failure; });
    mid.subscribe(() => { order.push('mid'); });
    leaf.subscribe(() => { order.push('leaf'); });
    expect(() => leaf.setValue('a2')).toThrow(failure);
    expect(order).toEqual(['mid', 'leaf']);
    expect(root.revision()).toBe(revision + 1);
  });

  it('selfcheck-v5.mjs:745 leaves revisions and listeners untouched on a same-value write', () => {
    const { root, mid, leaf } = nestedTree();
    let calls = 0;
    for (const node of [root, mid, leaf])
      node.subscribe(() => { calls += 1; });
    const revisions = [root.revision(), mid.revision(), leaf.revision()];
    leaf.setValue('a');
    expect(calls).toBe(0);
    expect([root.revision(), mid.revision(), leaf.revision()]).toEqual(revisions);
  });

  it('selfcheck-v5.mjs:756 refreshes the injected sibling only', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string', controls: {
        injectTo: (value: unknown) => ({ '../b': `${value}!` }),
      } }, b: { type: 'string' },
    } });
    root.setValue({});
    const refreshed: string[] = [];
    for (const path of ['/a', '/b'])
      requireNode(root, path).subscribe((event) => {
        if (event.type & SchemaNodeEventType.RequestRefresh) refreshed.push(path);
      });
    writeSchemaNodeInput(requireNode(root, '/a'), 'ab');
    expect(refreshed).toEqual(['/b']);
  });

  it('selfcheck-v5.mjs:756 pair EVENT-071 refreshes a caller-written leaf once', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } });
    root.setValue({});
    const refreshed: string[] = [];
    for (const path of ['/a', '/b'])
      requireNode(root, path).subscribe((event) => {
        if (event.type & SchemaNodeEventType.RequestRefresh) refreshed.push(path);
      });
    requireNode(root, '/a').setValue('ab');
    expect(refreshed).toEqual(['/a']);
  });

  it('selfcheck-v5.mjs:765 EVENT-020 ends feedback after 25 waves', () => {
    const { root, leaf } = nestedTree();
    let feedback = 0;
    leaf.subscribe(() => {
      if (feedback < 40) leaf.setValue(`p${feedback++}`);
    });
    expect(() => leaf.setValue('go')).toThrowError(expect.objectContaining({
      code: 'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED',
    }));
    expect(feedback).toBe(26);
    expect(leaf.value).toBe('p24');
    expect(root.diagnostics.status).toBe('stable');
  });
});
