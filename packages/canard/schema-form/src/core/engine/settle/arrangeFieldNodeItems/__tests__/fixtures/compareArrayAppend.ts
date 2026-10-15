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
import * as general from '../../utils/arraySlots/applyArraySlots';
import * as admission from '../../utils/arraySlots/prepareArrayAppend';
import { defaultsOf } from './defaultsOf';
import { slotsOf } from './slotsOf';

/** One public write applied identically to the candidate and the oracle. */
export interface AppendStep {
  /** Public verb or write; its return value is compared. */
  apply: (root: DispatchTestNode) => unknown;
  /** Whether the candidate must admit this step to the append path. */
  append: boolean;
}

/**
 * Run identical public writes with the append admission enabled and declined.
 * After each step it compares results, deliveries, settlement observations, default sources,
 * old-position ownership and the contents of every container retained before the step.
 * @param schema - Authored declarations for two independently owned trees
 * @param input - Source mounted through the public chain before the history
 * @param steps - Writes and whether each must take the append path
 * @param select - Array host whose retained containers and positions are checked; the root by default
 * @returns The candidate and oracle roots after matching histories
 */
export const compareArrayAppend = (
  schema: BlueprintSchema,
  input: unknown,
  steps: readonly AppendStep[],
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
    const admit = vi.spyOn(admission, 'prepareArrayAppend');
    if (declined) admit.mockReturnValue(undefined);
    const slots = vi.spyOn(general, 'applyArraySlots');
    try {
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        delivered.length = 0;
        admit.mockClear();
        slots.mockClear();
        const host = select(root);
        const children = host.children;
        const formerChildren = [...(children ?? [])];
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
            `append admission at step ${index}`,
          ).toBe(step.append);
          if (step.append) expect(slots).not.toHaveBeenCalled();
        }
        expect(children ? [...children] : children).toEqual(
          children ? formerChildren : children,
        );
        expect(slotsOf(local)).toEqual(formerLocal);
        expect(slotsOf(emit)).toEqual(formerEmit);
        expect(snapshot).toStrictEqual(formerSnapshot);
        const current = select(root);
        history.push({
          result,
          delivered: [...delivered],
          settlement: observeArraySelection(root),
          local: slotsOf(current.local),
          emit: slotsOf(current.emit),
          defaults: defaultsOf(root),
          owners: formerChildren.map(
            (child, index) =>
              current.children?.[index] === child &&
              child.parent === current &&
              !child.detached,
          ),
        });
      }
    } finally {
      admit.mockRestore();
      slots.mockRestore();
    }
    histories.push(history);
    roots.push(root);
  }
  expect(histories[0]).toEqual(histories[1]);
  return { candidate: roots[0], oracle: roots[1] };
};
