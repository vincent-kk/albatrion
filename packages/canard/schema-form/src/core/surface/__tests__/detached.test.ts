import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import {
  FieldNodeEventType,
  loadFieldNodeAtMount,
  resetFieldNodeForm,
} from '@/schema-form/core/engine';

import { FieldNode } from '../runtime/FieldNode';
import { SetValueOption } from '../type';
import type { ArrayNode } from '../type';
import { finishFieldNodeInput } from '../utils/binding/finishFieldNodeInput';
import { isArrayNode } from '../utils/guards';

const detachedList = () => {
  const { root } = makeFieldNodeTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      list: {
        type: 'array',
        items: { type: 'string' },
        controls: { active: '../flag' },
      },
    },
  });
  root.setValue({ flag: true, list: ['a', 'b'] });
  const old = root.find('/list');
  root.find('/flag')?.setValue(false);
  root.find('/flag')?.setValue(true);
  const current = root.find('/list');
  if (!old || !isArrayNode(old) || !current || current === old)
    throw new Error('Expected a new /list');
  return { root, old, current };
};

const DETACHED_VERBS: readonly [
  string,
  (node: ArrayNode) => unknown,
  unknown,
  readonly string[],
][] = [
  ['push', (node) => node.push('z'), 3, ['a', 'b', 'z']],
  ['pop', (node) => node.pop(), 'b', ['a']],
  ['remove', (node) => node.remove(0), 'a', ['b']],
  ['update', (node) => node.update(0, 'q'), 'q', ['q', 'b']],
  ['clear', (node) => node.clear(), undefined, []],
];

// filid:contract surface-detached
describe('detached FieldNode references', () => {
  it('26C-10 freezes the previous load mismatch and default on form reset', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'number', controls: { active: '../flag' } },
      },
    });
    if (!(root instanceof FieldNode))
      throw new Error('Expected a runtime FieldNode');
    const runtimeRoot: FieldNode = root;
    loadFieldNodeAtMount(
      runtimeRoot,
      { flag: true, target: 'bad' },
      SetValueOption.Overwrite,
    );
    const target = root.find('/target');
    if (!target) throw new Error('Expected the loaded target');
    expect(target.misfit).toBe(true);
    resetFieldNodeForm(
      runtimeRoot,
      { flag: false, target: 'other' },
      SetValueOption.Overwrite,
    );
    expect(Reflect.get(target, 'detached')).toBe(true);
    expect(target.misfit).toBe(true);
    expect(target.misfits).toEqual(['/target']);
    expect(target.defaultValue).toBe('bad');
  });

  const groupedTree = () =>
    makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
          },
        },
      },
    });

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
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            enabled: { type: 'boolean' },
            leaf: { type: 'string', controls: { active: '../enabled' } },
          },
        },
      },
    });
    root.setValue({
      flag: true,
      group: { enabled: false, leaf: 'old latent' },
    });
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
    const { root, runtime } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            leaf: { type: 'string' },
            other: { type: 'string' },
          },
        },
      },
    });
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
      leaf: 'merged',
      other: 'retained other',
      extra: 'E',
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
    const diagnostics = {
      status: 'degraded' as const,
      cause: 'budget' as const,
      exceededBudget: 'hostWheel' as const,
      iterations: 2,
      commit: 3,
    };
    Reflect.set(runtime, 'diagnostics', diagnostics);
    expect(group.diagnostics).toBe(diagnostics);
  });

  it('freezes mismatch and load reads on an old reference across re-entry', () => {
    const { root, runtime } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          group: {
            type: 'object',
            controls: { active: '../flag' },
            properties: {
              target: { type: 'object' },
            },
          },
        },
      },
      { snapshot: { group: { target: { seed: 'loaded' } } } },
    );
    root.setValue({ flag: true, group: { target: 42 } });
    const target = root.find('/group/target');
    if (!target) throw new Error('Expected the active target');
    const before = {
      misfit: target.misfit,
      misfits: target.misfits,
      inactiveValues: target.inactiveValues,
      defaultValue: target.defaultValue,
    };
    expect(before.misfit).toBe(true);
    expect(before.misfits).toContain('/group/target');
    root.find('/flag')?.setValue(false);
    expect(target.misfit).toBe(before.misfit);
    expect(target.misfits).toBe(before.misfits);
    Reflect.set(runtime, 'loadSnapshot', {
      group: { target: { seed: 'changed' } },
    });
    root.setValue({ flag: true, group: { target: { updated: true } } });
    const current = root.find('/group/target');
    expect(current).not.toBe(target);
    expect(current?.misfit).toBe(false);
    expect(current?.defaultValue).toEqual({ seed: 'changed' });
    expect(target.misfit).toBe(before.misfit);
    expect(target.misfits).toBe(before.misfits);
    expect(target.inactiveValues).toBe(before.inactiveValues);
    expect(target.defaultValue).toBe(before.defaultValue);
  });

  it('keeps an old group inactive-value list after a new shape commits', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        group: {
          type: 'object',
          controls: { active: '../flag' },
          properties: {
            enabled: { type: 'boolean' },
            hidden: { type: 'string', controls: { active: '../enabled' } },
          },
        },
      },
    });
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

  it('26C-12 ignores old detached writes and reset while the same path is live', () => {
    const { root, runtime } = makeFieldNodeTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          target: { type: 'string', controls: { active: '../flag' } },
        },
      },
      { snapshot: { flag: true, target: 'loaded' } },
    );
    root.setValue({ flag: true, target: 'initial' });
    const old = root.find('/target');
    if (!old) throw new Error('Expected the first target');
    root.find('/flag')?.setValue(false);
    root.find('/flag')?.setValue(true);
    const current = root.find('/target');
    if (!current || current === old) throw new Error('Expected a new target');
    const commit = Reflect.get(runtime, 'commitNumber');
    old.setValue('x');
    old.resetSubtree();
    expect(current.raw).toBe('initial');
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    expect(Reflect.get(runtime, 'latentRaw')).toBeInstanceOf(Map);
    expect(Reflect.get(runtime, 'latentRaw')).toHaveProperty('size', 0);
    expect(root.inactiveValues.some((entry) => entry.path === '/target')).toBe(
      false,
    );

    root.find('/flag')?.setValue(false);
    current.setValue('from second reference');
    old.setValue('y');
    root.find('/flag')?.setValue(true);
    expect(root.find('/target')?.raw).toBe('y');
  });

  it('26C-12 NODE-044 sends a detached write inside a batch to the latent source, never to the live node at its path', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    root.setValue({ flag: true, target: 'initial' });
    const old = root.find('/target');
    if (!old) throw new Error('Expected the first target');
    root.find('/flag')?.setValue(false);
    root.find('/flag')?.setValue(true);
    const current = root.find('/target');
    if (!current || current === old) throw new Error('Expected a new target');
    root.batch(() => {
      old.setValue('x');
    });
    expect(current.raw).toBe('initial');
    root.find('/flag')?.setValue(false);
    root.batch(() => {
      old.setValue('y');
    });
    root.find('/flag')?.setValue(true);
    expect(root.find('/target')?.raw).toBe('y');
  });

  for (const [verb, call, result, latent] of DETACHED_VERBS)
    it(`26C-12 NODE-044 sends a detached ${verb} inside a batch to the latent source, never to the live array at its path`, () => {
      const { root, old, current } = detachedList();
      let events = 0;
      root.subscribe((event) => {
        if (event.type & FieldNodeEventType.UpdateValue) events += 1;
      });
      let returned: unknown;
      root.batch(() => {
        returned = call(old);
      });
      expect(returned).toEqual(result);
      expect(current.value).toEqual(['a', 'b']);
      expect(events).toBe(0);
      root.find('/flag')?.setValue(false);
      root.batch(() => {
        call(old);
      });
      root.find('/flag')?.setValue(true);
      expect(root.find('/list')?.value).toEqual(latent);
    });

  it('26C-12 NODE-044 never sends a detached finishInput inside a batch to the live node at its path', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: {
          type: 'string',
          options: { trim: true },
          controls: { active: '../flag' },
        },
      },
    });
    root.setValue({ flag: true, target: ' x ' });
    const old = root.find('/target');
    root.find('/flag')?.setValue(false);
    root.find('/flag')?.setValue(true);
    const current = root.find('/target');
    if (!old || !current || current === old)
      throw new Error('Expected a new /target');
    root.batch(() => {
      finishFieldNodeInput(old);
    });
    expect(current.raw).toBe(' x ');
  });

  it('26C-12 EVENT-013 judges a detached write against the shape committed before the batch', () => {
    const { root } = makeFieldNodeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    root.setValue({ flag: true, target: 'initial' });
    const old = root.find('/target');
    if (!old) throw new Error('Expected the first target');
    root.find('/flag')?.setValue(false);
    root.find('/flag')?.setValue(true);
    root.batch(() => {
      root.find('/flag')?.setValue(false);
      old.setValue('y');
    });
    root.find('/flag')?.setValue(true);
    expect(root.find('/target')?.raw).toBe('initial');
  });

  it('26C-12 ignores Merge through an old detached object while its path is live', () => {
    const { root, runtime } = groupedTree();
    root.setValue({ flag: true, group: { leaf: 'initial' } });
    const old = root.find('/group');
    if (!old) throw new Error('Expected the first group');
    root.find('/flag')?.setValue(false);
    root.find('/flag')?.setValue(true);
    const current = root.find('/group');
    if (!current || current === old) throw new Error('Expected a new group');
    const commit = Reflect.get(runtime, 'commitNumber');
    old.setValue({ leaf: 'x' }, SetValueOption.Merge);
    expect(current.raw).toBeUndefined();
    expect(root.find('/group/leaf')?.raw).toBe('initial');
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    expect(Reflect.get(runtime, 'latentRaw')).toBeInstanceOf(Map);
    expect(Reflect.get(runtime, 'latentRaw')).toHaveProperty('size', 0);
    expect(root.inactiveValues.some((entry) => entry.path === '/group')).toBe(
      false,
    );
  });
});
