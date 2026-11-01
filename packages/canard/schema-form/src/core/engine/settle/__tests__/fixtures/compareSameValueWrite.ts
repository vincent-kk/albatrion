import { expect, vi } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as recalculation from '../../utils/dependencies/registerRecalculation';
import * as admission from '../../utils/input/utils/admitsSameValueWrite';
import { readFieldNodeDefaultValue } from '../../utils/loadValues/readFieldNodeDefaultValue';
import { observeArraySelection } from './observeArraySelection';

/** One public write applied identically to the candidate and the oracle. */
export interface SameValueStep {
  /** Public write; its return value or thrown error is compared. */
  apply: (root: DispatchTestNode) => unknown;
  /** Whether the candidate must mark fewer nodes or fewer shape-dirty hosts than the oracle. */
  skip: boolean;
}

/** Marks of a write's first recalculation registration: written inputs and shape-dirty paths. */
export interface WriteMarks {
  /** Nodes `markWrite` recorded a caller input for, one per call. */
  written: number;
  /** Hosts sent through the shape path, sorted. */
  shapeDirty: string[];
}

/**
 * Run identical public writes with the same-value admission enabled and declined.
 * After each step it compares results, deliveries in order, settlement observations with
 * per-bit revisions, Refresh targets, derive rounds, key order and output references,
 * default sources, validation errors and reporter records.
 * @param schema - Authored declarations for two independently owned trees
 * @param input - Source mounted through the public chain before the history
 * @param steps - Writes and whether each must take the skip
 * @param prepare - Optional identical setup applied to each tree after mount
 * @returns Per-step marks of the candidate and the oracle
 */
export const compareSameValueWrite = async (
  schema: BlueprintSchema,
  input: unknown,
  steps: readonly SameValueStep[],
  prepare?: (root: DispatchTestNode) => void,
): Promise<{ candidate: WriteMarks[]; oracle: WriteMarks[] }> => {
  const histories: unknown[][] = [];
  const marks: WriteMarks[][] = [];
  for (const declined of [false, true]) {
    const report = vi.fn();
    const { root } = createDispatchTree(
      schema,
      undefined,
      createTestValidator(),
      { hasConsumer: () => true, report },
    );
    const delivered: unknown[] = [];
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
    dispatchMount(root, input, WriteOption.Overwrite);
    root.runtime.validationMode = ValidationMode.OnChange;
    prepare?.(root);
    await new Promise((resolve) => setImmediate(resolve));
    const history: unknown[] = [];
    const runMarks: WriteMarks[] = [];
    const admit = vi.spyOn(admission, 'admitsSameValueWrite');
    if (declined) admit.mockReturnValue(false);
    const register = recalculation.registerRecalculation;
    let first: WriteMarks | undefined;
    const spy = vi
      .spyOn(recalculation, 'registerRecalculation')
      .mockImplementation((context) => {
        first ??= {
          written: context.writtenInputs.size,
          shapeDirty: [...context.shapeDirtyPaths].sort(),
        };
        register(context);
      });
    try {
      for (const step of steps) {
        delivered.length = 0;
        report.mockClear();
        first = undefined;
        const before = new Map(
          nodesOf(root).map((node) => [node.path, node.local]),
        );
        let result: unknown;
        try {
          result = step.apply(root);
        } catch (error) {
          result = error;
        }
        await new Promise((resolve) => setImmediate(resolve));
        runMarks.push(first ?? { written: 0, shapeDirty: [] });
        const nodes = nodesOf(root);
        history.push({
          result,
          delivered: [...delivered],
          records: [...report.mock.calls],
          settlement: observeArraySelection(root),
          refresh: [...(root.runtime.refreshTargets ?? [])],
          rounds: root.runtime.settlementTrace?.rounds.length,
          order: JSON.stringify([root.local, root.emit]),
          nodes: nodes.map((node) => ({
            path: node.path,
            keys:
              node.local !== null && typeof node.local === 'object'
                ? Object.keys(node.local)
                : null,
            copied: before.get(node.path) !== node.local,
            defaultValue: JSON.stringify(readFieldNodeDefaultValue(node)),
          })),
          errors: root.runtime.globalErrors,
        });
      }
    } finally {
      admit.mockRestore();
      spy.mockRestore();
    }
    histories.push(history);
    marks.push(runMarks);
  }
  expect(histories[0]).toEqual(histories[1]);
  steps.forEach((step, index) => {
    const [candidate, oracle] = [marks[0][index], marks[1][index]];
    if (step.skip)
      expect(
        candidate.written < oracle.written ||
          candidate.shapeDirty.length < oracle.shapeDirty.length,
        `skip at step ${index}`,
      ).toBe(true);
    else expect(candidate, `general path at step ${index}`).toEqual(oracle);
  });
  return { candidate: marks[0], oracle: marks[1] };
};

/**
 * List live nodes in document order.
 * @param root - Committed tree
 * @returns Nodes from the root down, children in order
 */
const nodesOf = (root: DispatchTestNode): DispatchTestNode[] => {
  const nodes: DispatchTestNode[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    nodes.push(node);
    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
      pending.push(node.children![index]);
  }
  return nodes;
};
