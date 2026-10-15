import { expect, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';
import { observeArraySelection } from '../../../__tests__/fixtures/observeArraySelection';
import { observeDetachedReads } from '../../../__tests__/fixtures/observeDetachedReads';
import * as selection from '../../../utils/compute/childSelection/canReuseArrayChildren';
import * as general from '../../utils/arraySlots/applyArraySlots';
import * as admission from '../../utils/arraySlots/prepareArraySplice';
import { defaultsOf } from './defaultsOf';
import { slotsOf } from './slotsOf';

/** One public write applied identically to the candidate and the oracle. */
export interface SpliceStep {
  /** Public verb or write; its return value is compared. */
  apply: (root: DispatchTestNode) => unknown;
  /** Whether the candidate must admit this step to the splice path. */
  splice: boolean;
  /** Whether the candidate must reuse the static selection of an admitted step; `splice` when absent, unchecked for a declined step. */
  reuse?: boolean;
}

/**
 * Run identical public writes with the splice admission enabled and declined.
 * An admitted step must also reuse its host's selection in the candidate unless the step says otherwise, while the oracle never reuses it.
 * After each step it compares results, deliveries with payloads in order, settlement observations (raw, keys, names, paths, revisions and latent raw included),
 * default sources, where every former item now sits, departed nodes' detached reads and the contents of every container retained before the step.
 * @param schema - Authored declarations for two independently owned trees
 * @param input - Source mounted through the public chain before the history
 * @param steps - Writes and whether each must take the splice path
 * @param select - Array host whose retained containers and positions are checked; the root by default
 * @returns The candidate and oracle roots after matching histories
 */
export const compareArraySplice = (
  schema: BlueprintSchema,
  input: unknown,
  steps: readonly SpliceStep[],
  select: (root: DispatchTestNode) => DispatchTestNode = (root) => root,
): { candidate: DispatchTestNode; oracle: DispatchTestNode } => {
  const histories: unknown[][] = [];
  const roots: DispatchTestNode[] = [];
  for (const declined of [false, true]) {
    const { root } = createDispatchTree(schema);
    const delivered: unknown[] = [];
    root.runtime.validationMode = 0;
    root.runtime.errorReporter = { hasConsumer: () => true, report: vi.fn() };
    const listen = (node: DispatchTestNode) =>
      subscribeFieldNode(node, (event) => {
        delivered.push({ path: node.path, event });
      });
    listen(root);
    const factory = root.runtime.nodeFactory;
    root.runtime.nodeFactory = (entry, parent, runtime) => {
      const node = factory(entry, parent, runtime);
      listen(node);
      return node;
    };
    dispatchMount(root, input, WriteOption.Overwrite, {
      deferValidation: true,
    });
    const history: unknown[] = [];
    const admit = vi.spyOn(admission, 'prepareArraySplice');
    if (declined) admit.mockReturnValue(undefined);
    const slots = vi.spyOn(general, 'applyArraySlots');
    const route = vi.spyOn(selection, 'canReuseArrayChildren');
    try {
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        delivered.length = 0;
        admit.mockClear();
        slots.mockClear();
        route.mockClear();
        const host = select(root);
        const children = host.children;
        const formerChildren = [...(children ?? [])];
        const formerKeys = formerChildren.map((child) => child.itemKey);
        const local = host.local;
        const formerLocal = slotsOf(local);
        const emit = host.emit;
        const formerEmit = slotsOf(emit);
        const snapshot = root.runtime.loadSnapshot;
        const formerSnapshot = structuredClone(snapshot);
        let result: unknown;
        try {
          result = step.apply(root);
        } catch (error) {
          result = error;
        }
        if (!declined) {
          expect(
            admit.mock.results.some((call) => call.value !== undefined),
            `splice admission at step ${index}`,
          ).toBe(step.splice);
          if (step.splice) expect(slots).not.toHaveBeenCalled();
        }
        if (step.splice)
          expect(
            route.mock.results.some((call) => call.value === true),
            `selection reuse at step ${index}`,
          ).toBe(!declined && (step.reuse ?? true));
        expect(children ? [...children] : children).toEqual(
          children ? formerChildren : children,
        );
        expect(slotsOf(local)).toEqual(formerLocal);
        expect(slotsOf(emit)).toEqual(formerEmit);
        expect(snapshot).toStrictEqual(formerSnapshot);
        const current = select(root);
        history.push({
          result: slotsOf(result),
          delivered: [...delivered],
          settlement: observeArraySelection(root),
          local: slotsOf(current.local),
          emit: slotsOf(current.emit),
          defaults: defaultsOf(root),
          departed: observeDetachedReads(root, formerChildren),
          positions: formerChildren.map((child, position) => ({
            at: current.children?.indexOf(child) ?? -1,
            key: child.itemKey === formerKeys[position],
            name: child.name,
            path: child.path,
            parent: child.parent === current,
            detached: child.detached,
          })),
        });
      }
    } finally {
      admit.mockRestore();
      slots.mockRestore();
      route.mockRestore();
    }
    histories.push(history);
    roots.push(root);
  }
  expect(histories[0]).toEqual(histories[1]);
  return { candidate: roots[0], oracle: roots[1] };
};
