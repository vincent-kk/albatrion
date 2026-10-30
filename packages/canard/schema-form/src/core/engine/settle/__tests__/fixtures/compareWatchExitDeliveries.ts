import { expect, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { find } from '@/schema-form/core/engine/navigation';
import * as record from '@/schema-form/core/engine/record';
import type { FieldNodeRecord } from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  dispatchWriteInput,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';
import * as watchIndex from '../../utils/commit/utils/createWatchDeliveryIndex';

/** One write applied identically to the candidate and the oracle. */
export type WatchExitStep = WatchExitInput | WatchExitVerb;

/** One input write settled through the public chain. */
export interface WatchExitInput {
  /** Absolute path of the written field. */
  path: string;
  /** Input value written with Overwrite. */
  value: unknown;
}

/** One array verb, or any other public dispatch, settled as one commit. */
export interface WatchExitVerb {
  /** Absolute path of the live field the dispatch targets. */
  path: string;
  /** Dispatch run against the field found at `path` in each tree. */
  apply: (target: DispatchTestNode) => void;
}

/** Observations of one step, identical between the candidate and the oracle. */
export interface WatchExitObservation {
  /** Every `markFieldNodeEvent` call: path, bit, payload and options, in call order; compared per path. */
  marks: unknown[];
  /** Listener deliveries in delivery order. */
  delivered: unknown[];
  /** Root emitted value after the step. */
  emit: unknown;
  /** Paths of the live watchers still held by the reverse watch index, sorted. */
  watchers: string[];
  /** Paths whose watch values were re-read in this step's commit, sorted. */
  reread: string[];
}

/**
 * Run identical input writes with the indexed exit lookup and with every watcher
 * forced into the candidate set, the rule exits followed before the index covered them.
 * The oracle wraps the live index so each lookup first adds every indexed watcher.
 * Marks are compared per path in call order, deliveries in full delivery order.
 * @param schema - Authored declarations for two independently owned trees
 * @param input - Source mounted through the public chain before the history
 * @param steps - Input writes or dispatches, each settled and delivered before the next
 * @returns Per-step observations of the candidate, after asserting the oracle's are equal
 */
export const compareWatchExitDeliveries = (
  schema: BlueprintSchema,
  input: unknown,
  steps: readonly WatchExitStep[],
): WatchExitObservation[] => {
  const histories: WatchExitObservation[][] = [];
  const create = watchIndex.createWatchDeliveryIndex;
  const mark = record.markFieldNodeEvent;
  for (const forced of [false, true]) {
    const { root } = createDispatchTree(schema);
    root.runtime.validationMode = 0;
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
    const marks: unknown[] = [];
    const markSpy = vi
      .spyOn(record, 'markFieldNodeEvent')
      .mockImplementation(
        <Self extends FieldNodeRecord<Self>>(
          node: Self,
          bit: record.FieldNodeEventType,
          payload?: unknown,
          options?: unknown,
        ) => {
          marks.push({ path: node.path, bit, payload, options });
          mark(node, bit, payload, options);
        },
      );
    const indexSpy = vi.spyOn(watchIndex, 'createWatchDeliveryIndex');
    if (forced)
      indexSpy.mockImplementation(() => {
        const index = create();
        const affected = index.affected.bind(index);
        index.affected = (path, candidates) => {
          for (const watcher of index.allNodes) candidates.add(watcher);
          affected(path, candidates);
        };
        return index;
      });
    const history: WatchExitObservation[] = [];
    try {
      dispatchMount(root, input, WriteOption.Overwrite, {
        deferValidation: true,
      });
      for (const step of steps) {
        marks.length = 0;
        delivered.length = 0;
        const target = find(root, step.path);
        if (!target) throw new Error(`No live field at ${step.path}`);
        if ('apply' in step) step.apply(target);
        else dispatchWriteInput(target, step.value, WriteOption.Overwrite);
        const commit = root.runtime.commitNumber;
        const watchers: string[] = [];
        const reread: string[] = [];
        for (const node of root.runtime.deliveryWatchIndex?.allNodes ?? [])
          if (isRecord(node)) watchers.push(node.path);
        for (const node of root.runtime.deliveryWatchIndex?.allNodes ?? [])
          if (
            isRecord(node) &&
            root.runtime.watchValuesMemo?.get(node)?.commit === commit
          )
            reread.push(node.path);
        history.push({
          marks: [...marks],
          delivered: [...delivered],
          emit: structuredClone(root.emit),
          watchers: watchers.sort(),
          reread: reread.sort(),
        });
      }
    } finally {
      markSpy.mockRestore();
      indexSpy.mockRestore();
    }
    histories.push(history);
  }
  const [candidate, oracle] = histories;
  // Listeners receive a wave in document order, so only each node's own mark order is observable.
  const shared = ({ marks, delivered, emit, watchers }: WatchExitObservation) => ({
    marks: [...marks].sort((left, right) =>
      pathOf(left).localeCompare(pathOf(right)),
    ),
    delivered,
    emit,
    watchers,
  });
  expect(
    candidate.map(shared),
    'indexed exit lookup equals the forced full watcher scan',
  ).toEqual(oracle.map(shared));
  return candidate;
};

/**
 * Read the path of one logged mark.
 * @param entry - Logged `markFieldNodeEvent` call
 * @returns The marked node's path at the time of the call
 */
const pathOf = (entry: unknown): string =>
  entry !== null && typeof entry === 'object'
    ? String(Reflect.get(entry, 'path'))
    : '';

/**
 * Narrow an indexed watcher to a record of the test tree.
 * @param value - Entry of the reverse watch index
 * @returns Whether the entry is a field record
 */
const isRecord = (value: unknown): value is DispatchTestNode =>
  value !== null && typeof value === 'object' && 'runtime' in value;
