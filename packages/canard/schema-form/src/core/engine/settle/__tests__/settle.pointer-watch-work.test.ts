import { afterEach, describe, expect, it, vi } from 'vitest';

import * as pointer from '@/schema-form/helpers/jsonPointer';
import * as segmentGrammar from '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { FieldNodeEventType } from '../../record';
import { WriteOption } from '../../types/value';
import { getCachedPointerSegments } from '../../utils/paths/getCachedPointerSegments';
import * as dependencyPaths from '../../utils/paths/resolveDependencyPath';
import { dispatchMount, dispatchRemove, dispatchSetValue } from '../../write';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { createWatchDeliveryIndex } from '../utils/commit/utils/createWatchDeliveryIndex';
import { getWatchDeliveryPaths } from '../utils/commit/utils/getWatchDeliveryPaths';
import { getStateDependencyPlan } from '../utils/controls/getStateDependencyPlan';
import { readFieldNodeWatchValues } from '../utils/controls/readFieldNodeWatchValues';
import { readStateDependency } from '../utils/controls/readStateDependency';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';

afterEach(() => vi.restoreAllMocks());

describe('watch dependency syntax ownership', () => {
  it('shares prepared syntax between value and delivery reads while traversing current emit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'number' },
        watcher: { type: 'string', controls: { watch: ['../source', '@'] } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 1, watcher: 'w' },
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    const resolve = vi.spyOn(dependencyPaths, 'resolveDependencyPath');
    const wrapper = vi.spyOn(pointer, 'parsePointer');
    const decoder = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    pointer.parsePointer('/positive-control');
    expect(wrapper).toHaveBeenCalledTimes(1);
    expect(decoder).toHaveBeenCalledTimes(1);
    wrapper.mockClear();
    decoder.mockClear();
    const values = readFieldNodeWatchValues(watcher);
    expect(readFieldNodeWatchValues(watcher)).toBe(values);
    expect(getWatchDeliveryPaths(watcher)).toEqual(['/source', '@']);
    root.emit = { source: 2, watcher: 'w' };
    const context = { replacement: true };
    root.runtime.context = context;
    expect(readFieldNodeWatchValues(watcher)).toEqual([2, context]);
    expect(resolve).not.toHaveBeenCalled();
    expect(wrapper).not.toHaveBeenCalled();
    expect(decoder).not.toHaveBeenCalled();
    Reflect.set(root.runtime, 'context', undefined);
    const withoutContext = readFieldNodeWatchValues(watcher);
    expect(withoutContext).toEqual([2, {}]);
    expect(readFieldNodeWatchValues(watcher)).toBe(withoutContext);
  });

  it('keeps absent-context identities local to each node and commit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        watcher: { type: 'string', controls: { watch: ['@'] } },
        other: { type: 'string', controls: { watch: ['@'] } },
      },
    });
    loadFieldNodeAtMount(root, { watcher: 'w' }, WriteOption.Overwrite);
    Reflect.set(root.runtime, 'context', undefined);
    const watcher = root.structure!.watcher;
    const first = readFieldNodeWatchValues(watcher);
    expect(readFieldNodeWatchValues(watcher)).toBe(first);
    expect(readFieldNodeWatchValues(root.structure!.other)[0]).not.toBe(
      first[0],
    );
    root.runtime.commitNumber = (root.runtime.commitNumber ?? 0) + 1;
    const second = readFieldNodeWatchValues(watcher);
    expect(second).toEqual([{}]);
    expect(second[0]).not.toBe(first[0]);
    expect(readFieldNodeWatchValues(watcher)).toBe(second);
  });

  it('keeps dependencies and same-path host identities separate and rebinds a moved host', () => {
    const runtime = {};
    const first = {};
    const second = {};
    const left = getStateDependencyPlan(
      runtime,
      '/rows/0/watch',
      '../left',
      first,
    );
    const right = getStateDependencyPlan(
      runtime,
      '/rows/0/watch',
      '../right',
      first,
    );
    expect(left.path).toBe('/rows/0/left');
    expect(right.path).toBe('/rows/0/right');
    expect(
      getStateDependencyPlan(runtime, '/rows/0/watch', '../left', first),
    ).toBe(left);
    expect(
      getStateDependencyPlan(runtime, '/rows/0/watch', '../left', second),
    ).not.toBe(left);
    const moved = getStateDependencyPlan(
      runtime,
      '/rows/1/watch',
      '../left',
      first,
    );
    expect(moved.path).toBe('/rows/1/left');
    expect(moved).not.toBe(left);
    expect(
      getStateDependencyPlan(runtime, '/rows/0/watch', '../left', second).path,
    ).toBe('/rows/0/left');
  });

  it('removes membership without parsing even after its syntax leaves the runtime cache', () => {
    const runtime = {};
    const index = createWatchDeliveryIndex(runtime);
    const watcher = {};
    index.update(watcher, ['/source/nested', '@']);
    for (let slot = 0; slot < 257; slot++)
      getCachedPointerSegments(runtime, `/unseen/${slot}`);
    const wrapper = vi.spyOn(pointer, 'parsePointer');
    const decoder = vi.spyOn(segmentGrammar, 'parsePointerSegments');
    index.remove(watcher);
    expect(wrapper).not.toHaveBeenCalled();
    expect(decoder).not.toHaveBeenCalled();
    expect(index.allNodes.size).toBe(0);
    expect(index.contextNodes.size).toBe(0);
    index.update(watcher, ['/replacement/nested']);
    const oldCandidates = new Set<unknown>();
    index.affected('/source', oldCandidates);
    expect(oldCandidates.size).toBe(0);
    const newCandidates = new Set<unknown>();
    index.affected('/replacement', newCandidates);
    expect([...newCandidates]).toEqual([watcher]);
    wrapper.mockClear();
    decoder.mockClear();
    index.affected('/replacement', newCandidates);
    expect(wrapper).not.toHaveBeenCalled();
    expect(decoder).not.toHaveBeenCalled();
  });

  it('replaces a same-node same-commit watch schema and publishes only its new edges', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'number' },
        b: { type: 'number' },
        watcher: { type: 'string', controls: { watch: ['../a'] } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { a: 1, b: 2, watcher: 'w' },
      WriteOption.Overwrite,
    );
    const watcher = root.structure!.watcher;
    expect(readFieldNodeWatchValues(watcher)).toEqual([1]);
    watcher.schema = {
      ...watcher.schema,
      schema: { type: 'string', controls: { watch: ['../b', '@'] } },
    };
    const context = { replacement: true };
    root.runtime.context = context;
    expect(readFieldNodeWatchValues(watcher)).toEqual([2, context]);
    expect(getWatchDeliveryPaths(watcher)).toEqual(['/b', '@']);
    for (const pending of root.runtime.deliveries ?? [])
      pending.pendingDelivery = undefined;
    const scratch = getSettlementScratch(root.runtime);
    try {
      const settlement = createSettlementContext(
        root,
        'input',
        WriteOption.Overwrite,
        scratch,
      );
      settlement.changedNodes.add(watcher);
      markCommitDeliveries(settlement);
    } finally {
      releaseSettlementScratch(scratch);
    }
    expect(watcher.deliveryWatchValues).toEqual([2, context]);
    expect(
      (watcher.pendingDelivery?.type ?? 0) &
        FieldNodeEventType.UpdateControlledProperties,
    ).toBe(FieldNodeEventType.UpdateControlledProperties);
    const previous = new Set<unknown>();
    root.runtime.deliveryWatchIndex!.affected('/a', previous);
    expect(previous.has(watcher)).toBe(false);
    const current = new Set<unknown>();
    root.runtime.deliveryWatchIndex!.affected('/b', current);
    expect(current.has(watcher)).toBe(true);
    expect(root.runtime.deliveryWatchIndex!.contextNodes.has(watcher)).toBe(
      true,
    );
    watcher.schema = { ...watcher.schema, schema: { type: 'string' } };
    expect(readFieldNodeWatchValues(watcher)).toEqual([]);
    const cleanup = getSettlementScratch(root.runtime);
    try {
      const settlement = createSettlementContext(
        root,
        'input',
        WriteOption.Overwrite,
        cleanup,
      );
      settlement.changedNodes.add(watcher);
      markCommitDeliveries(settlement);
    } finally {
      releaseSettlementScratch(cleanup);
    }
    expect(root.runtime.deliveryWatchIndex!.allNodes.has(watcher)).toBe(false);
  });

  it('selects prior schema, context and emission independently of the current watch plan', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        watcher: {
          type: 'string',
          controls: { watch: ['/current', '@'] },
        },
      },
    });
    loadFieldNodeAtMount(root, { watcher: 'w' }, WriteOption.Overwrite);
    const watcher = root.structure!.watcher;
    const currentContext = { version: 'current' };
    root.emit = { current: 'now', previous: 'wrong' };
    root.runtime.context = currentContext;
    expect(readFieldNodeWatchValues(watcher)).toEqual(['now', currentContext]);
    const previousContext = { version: 'previous' };
    const snapshot = {
      schema: {
        type: 'string' as const,
        controls: { watch: ['/previous', '@'] },
      },
      emit: { current: 'wrong', previous: 'then' },
      context: previousContext,
    };
    expect(readFieldNodeWatchValues(watcher, snapshot)).toEqual([
      'then',
      previousContext,
    ]);
    expect(readFieldNodeWatchValues(watcher)).toEqual(['now', currentContext]);
    expect(
      readStateDependency(root, watcher.path, '/previous', snapshot, watcher),
    ).toBe('then');
    expect(
      readFieldNodeWatchValues(watcher, {
        ...snapshot,
        emit: { previous: 'later snapshot' },
      }),
    ).toEqual(['later snapshot', previousContext]);
    watcher.detached = true;
    expect(readFieldNodeWatchValues(watcher)).toEqual([
      'later snapshot',
      previousContext,
    ]);
  });

  it('rebinds a retained watcher after an actual array rekey and reads its live source', () => {
    const { root } = createDispatchTree({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          watcher: { type: 'string', controls: { watch: ['../source'] } },
        },
      },
    });
    dispatchMount(root, [
      { source: 'first', watcher: 'a' },
      { source: 'second', watcher: 'b' },
    ]);
    const oldWatcher = root.structure!['0'].structure!.watcher;
    const retained = root.structure!['1'].structure!.watcher;
    expect(readFieldNodeWatchValues(retained)).toEqual(['second']);
    dispatchRemove(root, 0);
    expect(root.structure!['0'].structure!.watcher).toBe(retained);
    expect(retained.path).toBe('/0/watcher');
    expect(getWatchDeliveryPaths(retained)).toEqual(['/0/source']);
    expect(root.runtime.deliveryWatchIndex!.allNodes.has(oldWatcher)).toBe(
      false,
    );
    const stale = new Set<unknown>();
    root.runtime.deliveryWatchIndex!.affected('/1/source', stale);
    expect(stale.has(retained)).toBe(false);
    dispatchSetValue(root.structure!['0'].structure!.source, 'changed');
    expect(readFieldNodeWatchValues(retained)).toEqual(['changed']);
    expect(retained.deliveryWatchValues).toEqual(['changed']);
  });
});
