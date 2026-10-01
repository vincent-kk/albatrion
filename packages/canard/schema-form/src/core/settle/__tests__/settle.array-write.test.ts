import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { patchSchemaNodeInteractionState } from '../../record';
import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { createTestTree } from './fixtures/createTestTree';
import { writeSchemaNode } from '../index';
import { hasWrongKindBranchAncestor } from '../utils/transition/hasWrongKindBranchAncestor';
import { transitionSettlement } from '../utils/transition/transitionSettlement';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { getSettlementScratch } from '../utils/write/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/write/releaseSettlementScratch';

// filid:contract settle-array
describe('array settlement writes', () => {
  it('NODE-051 and LANDING-164 retain positions, keys, and interaction state', () => {
    const { root } = createTestTree({ type: 'array', items: { type: 'string' } });
    writeSchemaNode(root, ['a', 'b'], 'callerReplace', SetValueOption.Overwrite);
    const first = root.children![0];
    const second = root.children![1];
    patchSchemaNodeInteractionState(second, { touched: true, dirty: true });
    writeSchemaNode(root, ['x', 'y', 'z'], 'callerReplace', SetValueOption.Overwrite);
    expect(root.children![0]).toBe(first);
    expect(root.children![1]).toBe(second);
    expect(root.children![1].state).toMatchObject({ touched: true, dirty: true });
    expect(root.children!.map((item) => item.itemKey)).toEqual([0, 1, 2]);
    expect(root.local).toEqual(['x', 'y', 'z']);
  });

  it('WRITE-090 and LANDING-202 fill only a new tail on a non-load write', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: { a: { type: 'string', default: 'x' } },
    } });
    root.setValue([{}]);
    root.setValue([{}, {}]);
    expect(root.value).toEqual([{}, { a: 'x' }]);
    root.resetSubtree();
    expect(root.value).toEqual([{ a: 'x' }, { a: 'x' }]);
  });

  it('WRITE-048 resets by load while retaining surviving item identity', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: { type: 'string' } },
      { snapshot: ['a', 'b'] });
    root.resetSubtree();
    const first = root.children![0];
    root.setValue(['x']);
    root.resetSubtree();
    expect(root.children![0]).toBe(first);
    expect(root.value).toEqual(['a']);
  });

  it('WRITE-095 aligns snapshot slots after replacement and Merge', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      items: { type: 'array', items: { type: 'string', default: 'fill' } },
    } }, { snapshot: { items: ['a', 'b'] } });
    root.resetSubtree();
    root.setValue({ items: ['x'] });
    root.setValue({ items: ['x', 'z'] });
    const items = root.find('/items')!;
    expect(items.children![1].defaultValue).toBeUndefined();
    items.resetSubtree();
    expect(items.value).toEqual(['a', 'fill']);
    items.setValue(['q'], SetValueOption.Merge);
    expect(items.value).toEqual(['q']);
    expect(items.children).toHaveLength(1);
  });

  it('NODE-044 and WRITE-007 Merge whole-replaces an array and perishes its tail', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'array',
      items: { type: 'string' } });
    root.setValue(['a', 'b']);
    const first = root.children![0];
    const perished = root.children![1];
    root.setValue(['x'], SetValueOption.Merge);
    expect(root.value).toEqual(['x']);
    expect(root.children).toEqual([first]);
    expect(Reflect.get(perished, 'detached')).toBe(true);
    expect(perished.value).toBe('b');
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    expect(latent.has(JSON.stringify(['/1', 'string']))).toBe(false);
  });

  it('NODE-052 and 25C-11 retain tuple extras and template schemaType reference', () => {
    const { root } = createTestTree({ type: 'array',
      prefixItems: [{ type: 'string' }, { type: 'number' }], items: false });
    writeSchemaNode(root, ['a', 2, 'c', 'd'], 'callerReplace', SetValueOption.Overwrite);
    expect(root.itemCount).toBe(4);
    expect(root.children).toHaveLength(2);
    expect(root.extras).toEqual(['c', 'd']);
    expect(root.local).toEqual(['a', 2, 'c', 'd']);
    expect(root.children![0].schemaType).toBe(root.blueprintNode.prefixItems![0].schemaType);
  });

  it('VALUE-034 supports an empty root and holes in slot output', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: { type: 'string' } });
    root.setValue([]);
    expect(root.value).toEqual([]);
    root.setValue(['a', undefined, 'c']);
    expect(root.value).toHaveLength(3);
    expect(root.value).toEqual(['a', null, 'c']);
  });

  it('NODE-051 retains a wrong-kind array raw and perishes its old items', () => {
    const { root } = createTestTree({ type: 'array', items: { type: 'string' } });
    writeSchemaNode(root, ['a'], 'callerReplace', SetValueOption.Overwrite);
    const old = root.children![0];
    writeSchemaNode(root, { 0: 'wrong' }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.raw).toEqual({ 0: 'wrong' });
    expect(root.itemCount).toBe(0);
    expect(root.children).toEqual([]);
    expect(root.extras).toBeUndefined();
    expect(old.detached).toBe(true);
    writeSchemaNode(root, ['b'], 'callerReplace', SetValueOption.Overwrite);
    expect(root.children![0].itemKey).toBeGreaterThan(old.itemKey!);
  });

  it('WRITE-090 blocks non-load descendant fills below wrong-kind array raw', () => {
    const { root } = makeSchemaNodeTree({ type: 'array',
      items: { type: 'string', default: 'fill' } });
    root.setValue(['kept']);
    const former = root.children![0];
    root.setValue(7);
    expect(root.children).toEqual([]);
    expect(former.value).toBe('kept');

    const transient = createTestTree({ type: 'array',
      items: { type: 'string', default: 'fill' } });
    writeSchemaNode(transient.root, [undefined], 'callerReplace',
      SetValueOption.DisableAutomaticWrites);
    const pending = transient.root.children![0];
    const scratch = getSettlementScratch(transient.root.runtime);
    const context = createSettlementContext(transient.root, 'callerReplace',
      SetValueOption.Overwrite, scratch);
    transient.root.raw = 7;
    context.entered.add(pending);
    try {
      expect(hasWrongKindBranchAncestor(pending)).toBe(true);
      transitionSettlement(context);
      expect(pending.raw).toBeUndefined();
      expect(context.filledNodes.has(pending)).toBe(false);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });

  it('WRITE-090 recalculates an array created by an automatic default', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      items: { type: 'array', default: ['x'], items: { type: 'string' } },
    } });
    root.setValue({});
    expect(root.find('/items')?.children).toHaveLength(1);
    expect(root.find('/items')?.value).toEqual(['x']);
  });
});
