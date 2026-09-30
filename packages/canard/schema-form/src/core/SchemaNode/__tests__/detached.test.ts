import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { SetValueOption } from '../index';

// filid:contract surface-detached
describe('detached SchemaNode references', () => {
  const groupedTree = () => makeSchemaNodeTree({ type: 'object', properties: {
    flag: { type: 'boolean' },
    group: { type: 'object', controls: { active: '../flag' }, properties: {
      leaf: { type: 'string' },
    } },
  } });

  it('detaches every descendant and writes latent raw without settling', () => {
    const { root, runtime } = groupedTree();
    root.setValue({ flag: true, group: { leaf: 'before' } });
    const group = root.find('/group');
    const leaf = root.find('/group/leaf');
    if (!group || !leaf) throw new Error('Expected the active group subtree');
    root.find('/flag')?.setValue(false);
    expect(group.active).toBe(false);
    expect(leaf.active).toBe(false);
    expect(Reflect.get(leaf, 'detached')).toBe(true);
    const commit = Reflect.get(runtime, 'commitNumber');
    leaf.setValue('x');
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    root.find('/flag')?.setValue(true);
    expect(root.find('/group/leaf')?.value).toBe('x');
    expect(root.find('/group/leaf')).not.toBe(leaf);
  });

  it('replaces a detached group without retaining its older child latent raw', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        enabled: { type: 'boolean' },
        leaf: { type: 'string', controls: { active: '../enabled' } },
      } },
    } });
    root.setValue({ flag: true, group: { enabled: false, leaf: 'old latent' } });
    const group = root.find('/group');
    if (!group) throw new Error('Expected the active group');
    expect(root.find('/group/leaf')).toBeNull();
    root.find('/flag')?.setValue(false);
    group.setValue({ enabled: true, leaf: 'z' });
    root.find('/flag')?.setValue(true);
    expect(root.find('/group')?.value).toEqual({ enabled: true, leaf: 'z' });
    expect(root.find('/group/leaf')?.value).toBe('z');
  });

  it('re-enters a detached whole-replaced object with its new leaf value', () => {
    const { root } = groupedTree();
    root.setValue({ flag: true, group: { leaf: 'before' } });
    const group = root.find('/group');
    const leaf = root.find('/group/leaf');
    if (!group || !leaf) throw new Error('Expected the active group subtree');
    root.find('/flag')?.setValue(false);
    leaf.setValue('older latent');
    group.setValue({ leaf: 'z' });
    root.find('/flag')?.setValue(true);
    expect(root.find('/group')?.value).toEqual({ leaf: 'z' });
  });

  it('merges object keys into detached latent raw and replaces touched child sources', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        leaf: { type: 'string' }, other: { type: 'string' },
      } },
    } });
    root.setValue({ flag: true, group: { leaf: 'before', other: 'before' } });
    const group = root.find('/group');
    const leaf = root.find('/group/leaf');
    const other = root.find('/group/other');
    if (!group || !leaf || !other) throw new Error('Expected the active group');
    root.find('/flag')?.setValue(false);
    leaf.setValue('older leaf');
    other.setValue('retained other');
    const commit = Reflect.get(runtime, 'commitNumber');
    group.setValue({ leaf: 'merged', extra: 'E' }, SetValueOption.Merge);
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    root.find('/flag')?.setValue(true);
    expect(root.find('/group')?.value).toEqual({
      leaf: 'merged', other: 'retained other', extra: 'E',
    });
  });

  it('replaces detached latent raw for Merge with a non-object input', () => {
    const { root } = groupedTree();
    root.setValue({ flag: true, group: { leaf: 'before' } });
    const group = root.find('/group');
    const leaf = root.find('/group/leaf');
    if (!group || !leaf) throw new Error('Expected the active group');
    root.find('/flag')?.setValue(false);
    leaf.setValue('older latent');
    group.setValue('replaced', SetValueOption.Merge);
    root.find('/flag')?.setValue(true);
    expect(root.find('/group')?.raw).toBe('replaced');
    expect(root.find('/group/leaf')?.raw).toBeUndefined();
  });

  it('reads live diagnostics through a detached reference', () => {
    const { root, runtime } = groupedTree();
    root.setValue({ flag: true, group: { leaf: 'before' } });
    const group = root.find('/group');
    if (!group) throw new Error('Expected the active group');
    root.find('/flag')?.setValue(false);
    const diagnostics = { status: 'degraded' as const, cause: 'budget' as const,
      exceededBudget: 'hostWheel' as const, iterations: 2, commit: 3 };
    Reflect.set(runtime, 'diagnostics', diagnostics);
    expect(group.diagnostics).toBe(diagnostics);
  });

  it('freezes mismatch and load reads on an old reference across re-entry', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        target: { type: 'object' },
      } },
    } }, { snapshot: { group: { target: { seed: 'loaded' } } } });
    root.setValue({ flag: true, group: { target: 42 } });
    const target = root.find('/group/target');
    if (!target) throw new Error('Expected the active target');
    const before = {
      typeMismatch: target.typeMismatch,
      typeMismatches: target.typeMismatches,
      inactiveValues: target.inactiveValues,
      defaultValue: target.defaultValue,
    };
    expect(before.typeMismatch).toBe(true);
    expect(before.typeMismatches).toContain('/group/target');
    root.find('/flag')?.setValue(false);
    expect(target.typeMismatch).toBe(before.typeMismatch);
    expect(target.typeMismatches).toBe(before.typeMismatches);
    Reflect.set(runtime, 'loadSnapshot', { group: { target: { seed: 'changed' } } });
    root.setValue({ flag: true, group: { target: { updated: true } } });
    const current = root.find('/group/target');
    expect(current).not.toBe(target);
    expect(current?.typeMismatch).toBe(false);
    expect(current?.defaultValue).toEqual({ seed: 'changed' });
    expect(target.typeMismatch).toBe(before.typeMismatch);
    expect(target.typeMismatches).toBe(before.typeMismatches);
    expect(target.inactiveValues).toBe(before.inactiveValues);
    expect(target.defaultValue).toBe(before.defaultValue);
  });

  it('keeps an old group inactive-value list after a new shape commits', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      group: { type: 'object', controls: { active: '../flag' }, properties: {
        enabled: { type: 'boolean' },
        hidden: { type: 'string', controls: { active: '../enabled' } },
      } },
    } });
    root.setValue({ flag: true, group: { enabled: false, hidden: 'held' } });
    const group = root.find('/group');
    if (!group) throw new Error('Expected the active group');
    const before = group.inactiveValues;
    expect(before).toEqual([{ path: '/group/hidden', value: 'held' }]);
    root.find('/flag')?.setValue(false);
    root.setValue({ flag: true, group: { enabled: true, hidden: 'new' } });
    expect(root.find('/group')).not.toBe(group);
    expect(group.inactiveValues).toBe(before);
    expect(root.find('/group')?.inactiveValues).toEqual([]);
  });
});
