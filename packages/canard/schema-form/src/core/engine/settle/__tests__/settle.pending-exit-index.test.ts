import { afterEach, describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { selectChildren } from '../utils/compute/childSelection/selectChildren';
import { primeHost } from '../utils/compute/primeHost';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { updatePendingExitIndex } from '../utils/scratch/updatePendingExitIndex';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { finalizePerished } from '../utils/transition/finalizePerished';
import { expectPendingExitIndex } from './fixtures/expectPendingExitIndex';
import { gateTableScene } from './fixtures/gateTableScene';

const previous = gateSelectionTable.mode;
afterEach(() => {
  gateSelectionTable.mode = previous;
});

// filid:contract settle-pending-exit-index-lifetime
describe('both pending-exit index layers at all five maintenance sites', () => {
  it('V4 selectChildren exit registration equals a recomputation', () => {
    const { root, context } = gateTableScene();
    gateSelectionTable.mode = 'off';
    const prior = { ...root.structure };
    root.structure!.kind.raw =
      root.structure!.kind.local =
      root.structure!.kind.emit =
        'b';
    selectChildren(root, context, prior, () => {}, true);
    expect(context.pendingExits.size).toBe(1);
    expectPendingExitIndex(context);
  });

  it('selectEntryStep revival deletes both the child count and empty host bucket', () => {
    const { root, context } = gateTableScene();
    const child = root.structure!.a;
    context.pendingExits.set('["/a","string"]', child);
    updatePendingExitIndex(context, '/a', 1);
    expectPendingExitIndex(context);
    delete root.structure!.a;
    selectChildren(root, context, {}, () => {}, true);
    expect(context.revived.has(child)).toBe(true);
    expect(context.pendingExits.size).toBe(0);
    expectPendingExitIndex(context);
  });

  it('primeHost baseline revival removes both layers', () => {
    const { root, context } = gateTableScene();
    const prior = { ...root.structure };
    const child = prior.common;
    delete prior.common;
    delete root.structure!.common;
    context.pendingExits.set('["/common","string"]', child);
    updatePendingExitIndex(context, '/common', 1);
    primeHost(root, prior, context);
    expect(root.structure!.common).toBe(child);
    expect(context.pendingExits.size).toBe(0);
    expectPendingExitIndex(context);
  });

  it('finalizePerished removes a pending descendant of a removed array item', () => {
    const { root } = createTestTree({
      type: 'array',
      items: { type: 'object', properties: { a: { type: 'string' } } },
    });
    loadFieldNodeAtMount(root, [{ a: 'A' }], WriteOption.Overwrite);
    const item = root.structure!['0'];
    const child = item.structure!.a;
    delete item.structure!.a;
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      'input',
      WriteOption.Overwrite,
      scratch,
    );
    context.pendingExits.set('["/0/a","string"]', child);
    updatePendingExitIndex(context, '/0/a', 1);
    expectPendingExitIndex(context);
    context.perished.add(item);
    delete root.structure!['0'];
    root.children = [];
    root.itemCount = 0;
    finalizePerished(context);
    expect(context.pendingExits.size).toBe(0);
    expectPendingExitIndex(context);
  });

  it('scratch release clears and reuses the lazily created two-layer index', () => {
    const { root, scratch, context } = gateTableScene();
    expect(context.pendingExitPaths).toBeUndefined();
    context.pendingExits.set('["/a","string"]', root.structure!.a);
    updatePendingExitIndex(context, '/a', 1);
    const index = context.pendingExitPaths;
    expect(index).toBe(scratch.pendingExitPaths);
    expectPendingExitIndex(context);
    releaseSettlementScratch(scratch);
    expectPendingExitIndex(scratch);
    expect(scratch.pendingExitPaths?.size).toBe(0);
    const next = createSettlementContext(
      root,
      'input',
      WriteOption.Overwrite,
      getSettlementScratch(root.runtime),
    );
    expect(next.pendingExitPaths).toBe(index);
    expectPendingExitIndex(next);
  });

  it('multiple kinds share one child count while unrelated hosts remain separate', () => {
    const { root, context } = gateTableScene();
    for (const [key, path] of [
      ['["/a","string"]', '/a'],
      ['["/a","number"]', '/a'],
      ['["/other/a","string"]', '/other/a'],
    ]) {
      context.pendingExits.set(key, root.structure!.a);
      updatePendingExitIndex(context, path, 1);
      expectPendingExitIndex(context);
    }
    expect(context.pendingExitPaths!.get('')!.get('/a')).toBe(2);
    context.pendingExits.delete('["/a","number"]');
    updatePendingExitIndex(context, '/a', -1);
    expectPendingExitIndex(context);
  });
});
