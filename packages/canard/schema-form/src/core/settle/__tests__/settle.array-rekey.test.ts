import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { SchemaFormError } from '../../../errors';
import { createTestTree } from './fixtures/createTestTree';
import { arrangeSchemaNodeItems, writeSchemaNode } from '../index';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { rekeyArrayRuntimePaths } from '../utils/structure/rekeyArrayRuntimePaths';

// filid:contract settle-array
describe('array path movement', () => {
  it('35C-02 re-keys every path store in one collision-free pass', () => {
    const { root } = createTestTree({ type: 'array', items: { type: 'string' } });
    const runtime = root.runtime;
    const oldLeaf = JSON.stringify(['/1/hidden', 'string']);
    const newLeaf = JSON.stringify(['/0/hidden', 'string']);
    const oldRule = JSON.stringify(['/1/hidden', 'string', 1,
      '/schema/rule', 'target', '/1/target', 'string', 3]);
    const newRule = JSON.stringify(['/0/hidden', 'string', 1,
      '/schema/rule', 'target', '/0/target', 'string', 3]);
    const metadata = { path: '/1/hidden', blueprintNode: root.blueprintNode,
      order: [1] };
    const ids = [17];
    const baseline = { previous: 'value' };
    runtime.latentRaw.set(oldLeaf, 'secret');
    runtime.latentRaw.set(JSON.stringify(['/0/old', 'string']), 'removed');
    runtime.latentRawMetadata = new Map([[oldLeaf, metadata]]);
    runtime.committedDeclarationIds = new Map([[oldLeaf, ids]]);
    runtime.committedRuleValues = new Map([[oldRule, baseline]]);
    runtime.committedRuleKeysBySource = new Map([['/1/hidden', new Set([oldRule])]]);
    runtime.committedRuleKeysByTarget = new Map([['/1/target', new Set([oldRule])]]);
    runtime.typeMismatchPaths.add('/1/hidden');
    runtime.typeMismatchesMemo = new Map([['', { commit: 1,
      paths: ['/1/hidden'] }]]);
    runtime.inactiveValuesMemo.set('', [{ path: '/1/hidden', value: 'secret' }]);
    runtime.inactiveValueEntries = new Map([[oldLeaf, {
      value: 'secret', order: [1], entry: { path: '/1/hidden', value: 'secret' },
    }]]);

    rekeyArrayRuntimePaths(runtime, '', [
      { previous: '/0' }, { previous: '/1', current: '/0' },
    ]);
    expect(runtime.latentRaw.has(oldLeaf)).toBe(false);
    expect(runtime.latentRaw.has(JSON.stringify(['/0/old', 'string']))).toBe(false);
    expect(runtime.latentRaw.get(newLeaf)).toBe('secret');
    expect(runtime.latentRawMetadata?.has(oldLeaf)).toBe(false);
    expect(runtime.latentRawMetadata?.get(newLeaf))
      .toMatchObject({ path: '/0/hidden', order: [0] });
    expect(runtime.committedDeclarationIds?.has(oldLeaf)).toBe(false);
    expect(runtime.committedDeclarationIds?.get(newLeaf)).toBe(ids);
    expect(runtime.committedRuleValues?.has(oldRule)).toBe(false);
    expect(runtime.committedRuleValues?.get(newRule)).toBe(baseline);
    expect(runtime.committedRuleKeysBySource?.has('/1/hidden')).toBe(false);
    expect(runtime.committedRuleKeysBySource?.get('/0/hidden')).toEqual(new Set([newRule]));
    expect(runtime.committedRuleKeysByTarget?.has('/1/target')).toBe(false);
    expect(runtime.committedRuleKeysByTarget?.get('/0/target')).toEqual(new Set([newRule]));
    expect(runtime.typeMismatchPaths.has('/1/hidden')).toBe(false);
    expect(runtime.typeMismatchPaths.has('/0/hidden')).toBe(true);
    expect(runtime.typeMismatchesMemo?.has('')).toBe(false);
    expect(runtime.inactiveValuesMemo.has('')).toBe(false);
    expect(runtime.inactiveValueEntries?.has(oldLeaf)).toBe(false);
  });

  it('NODE-051 moves latent sources and registered gates with a live item', () => {
    const { root } = createTestTree({ type: 'array', items: {
      type: 'object', properties: {
        show: { type: 'boolean' },
        hidden: { type: 'string', controls: { active: '../show' } },
        count: { type: 'number' },
      },
    } });
    writeSchemaNode(root, [{ show: true, hidden: 'visible' },
      { show: false, hidden: 'secret', count: 'wrong' }],
      'callerReplace', SetValueOption.Overwrite);
    const shifted = root.children![1];
    const oldKey = JSON.stringify(['/1/hidden', 'string']);
    const newKey = JSON.stringify(['/0/hidden', 'string']);
    expect(root.runtime.latentRaw.has(oldKey)).toBe(true);
    expect(root.runtime.typeMismatchPaths.has('/1/count')).toBe(true);
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 }))
      .toEqual({ show: true, hidden: 'visible' });
    expect(root.children![0]).toBe(shifted);
    expect(shifted.path).toBe('/0');
    expect(root.runtime.latentRaw.has(oldKey)).toBe(false);
    expect(root.runtime.latentRaw.get(newKey)).toBe('secret');
    expect(root.runtime.typeMismatchPaths.has('/1/count')).toBe(false);
    expect(root.runtime.typeMismatchPaths.has('/0/count')).toBe(true);
    expect(getGateRegistry(root.runtime).hasRegisteredPathKind('/0', 'object'))
      .toBe(true);
    expect(getGateRegistry(root.runtime).hasRegisteredPathKind('/1', 'object'))
      .toBe(false);
    writeSchemaNode(shifted.structure!.show, true, 'callerReplace',
      SetValueOption.Overwrite);
    expect(shifted.structure!.hidden.local).toBe('secret');
  });

  it('NODE-044 lets a popped reference write latent but ignores a removed occupied path', () => {
    const { root } = createTestTree({ type: 'array', items: { type: 'string' } });
    writeSchemaNode(root, ['a', 'b'], 'callerReplace', SetValueOption.Overwrite);
    const popped = root.children![1];
    expect(arrangeSchemaNodeItems(root, { kind: 'pop' })).toBe('b');
    writeSchemaNode(popped, 'latent', 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/1', 'string'])))
      .toBe('latent');
    const removed = root.children![0];
    arrangeSchemaNodeItems(root, { kind: 'push', value: 'c' });
    expect(arrangeSchemaNodeItems(root, { kind: 'remove', index: 0 })).toBe('a');
    const commit = root.runtime.commitNumber;
    writeSchemaNode(removed, 'ignored', 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.commitNumber).toBe(commit);
    expect(root.local).toEqual(['c']);
    expect(root.runtime.latentRaw.has(JSON.stringify(['/0', 'string'])))
      .toBe(false);
  });

  it('NODE-044 applies a detached array verb through its latent whole-write path', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      show: { type: 'boolean' },
      list: { type: 'array', controls: { active: '../show' },
        items: { type: 'string' } },
    } });
    writeSchemaNode(root, { show: true, list: ['a'] }, 'callerReplace',
      SetValueOption.Overwrite);
    const former = root.structure!.list;
    writeSchemaNode(root.structure!.show, false, 'callerReplace',
      SetValueOption.Overwrite);
    expect(former.detached).toBe(true);
    expect(arrangeSchemaNodeItems(former, { kind: 'push', value: 'b' })).toBe(2);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/list', 'array'])))
      .toMatchObject({ raw: ['a', 'b'] });
    writeSchemaNode(root.structure!.show, true, 'callerReplace',
      SetValueOption.Overwrite);
    expect(root.structure!.list.local).toEqual(['a', 'b']);
    const commit = root.runtime.commitNumber;
    arrangeSchemaNodeItems(former, { kind: 'push', value: 'ignored' });
    expect(root.runtime.commitNumber).toBe(commit);
    expect(root.structure!.list.local).toEqual(['a', 'b']);
  });

  it('58C-01 GOAL-073 retains the single budget error and does not reuse a spent key', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
      items: { type: 'array', default: ['filled'], items: { type: 'string' } },
    }, allOf: [
      { controls: { active: './a === "0"' },
        properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== "0"' },
        properties: { a: { type: 'string' } } },
    ] });
    let caught: unknown;
    try { writeSchemaNode(root, { a: 0 }, 'callerReplace', SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(SchemaFormError);
    if (!(caught instanceof SchemaFormError)) throw new Error('Missing budget failure');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.BUDGET_EXCEEDED');
    const host = root.structure!.items;
    const spent = host.nextItemKey;
    expect(spent).toBeGreaterThan(0);
    root.runtime.disableAutomaticWrites = true;
    arrangeSchemaNodeItems(host, { kind: 'push', value: 'caller' });
    expect(host.children![0].itemKey).toBe(spent);
    expect(host.nextItemKey).toBeGreaterThan(spent);
  });
});
