import { expect, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import {
  dispatchMount,
  subscribeFieldNode,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';
import { observeArraySettlement } from '../../../__tests__/fixtures/observeArraySettlement';
import { observeDetachedReads } from '../../../__tests__/fixtures/observeDetachedReads';
import * as detached from '../../../utils/detached/captureDetachedFieldNodeReads';
import { prunePerishedPaths } from '../../../utils/transition/prunePerishedPaths';
import * as bulk from '../../utils/rekey/clearArrayRuntimePaths';
import { rekeyArrayRuntimePaths } from '../../utils/rekey/rekeyArrayRuntimePaths';
import { normalizeRuleIds } from './normalizeRuleIds';
import { observeGateRegistry } from './observeGateRegistry';
import { observePathStores } from './observePathStores';
import { slotsOf } from './slotsOf';

/** One public write applied identically to the candidate and the oracle. */
export interface ClearStep {
  /** Public verb or write; its return value is compared. */
  apply: (root: DispatchTestNode) => unknown;
  /** Whether the candidate must clean the host's path stores by host prefix. */
  bulk: boolean;
}

/**
 * Every node of the subtrees in order, owner first.
 * @param nodes - Item roots
 * @returns Items and their descendants in preorder
 */
const subtreesOf = (nodes: readonly DispatchTestNode[]): DispatchTestNode[] => {
  const all: DispatchTestNode[] = [];
  const visit = (node: DispatchTestNode) => {
    all.push(node);
    for (const child of node.children ?? []) visit(child);
  };
  for (const node of nodes) visit(node);
  return all;
};

/**
 * Run identical public writes with the host-prefix cleanup and positional detached reads, and with their predecessors.
 * The oracle replaces the host-prefix cleanup with the perished-path prune followed by a re-key of every old position,
 * and reads every detached defaultValue by its path. After each step it compares results, delivered events in order,
 * the full settlement observation (revisions, stores, snapshot), path-store lookups, latent dirtiness, the gate registry by path
 * (no departed node may stay registered) and the detached reads of every removed node and descendant; rule keys compare without their per-tree occurrence number.
 * @param schema - Authored declarations for two independently owned trees
 * @param input - Source mounted through the public chain before the history
 * @param steps - Writes and whether each must take the host-prefix cleanup
 * @param select - Array host whose former items are checked; the root by default
 * @returns The candidate and oracle roots after matching histories
 */
export const compareArrayClear = (
  schema: BlueprintSchema,
  input: unknown,
  steps: readonly ClearStep[],
  select: (root: DispatchTestNode) => DispatchTestNode = (root) => root,
): { candidate: DispatchTestNode; oracle: DispatchTestNode } => {
  const histories: unknown[][] = [];
  const roots: DispatchTestNode[] = [];
  const capture = detached.captureDetachedFieldNodeReads;
  for (const oracle of [false, true]) {
    const { root } = createDispatchTree(schema);
    const delivered: unknown[] = [];
    root.runtime.validationMode = 0;
    root.runtime.errorReporter = { hasConsumer: () => true, report: vi.fn() };
    const listen = (node: DispatchTestNode) =>
      subscribeFieldNode(node, (event) => {
        delivered.push({ path: node.path, event });
      });
    const factory = root.runtime.nodeFactory;
    root.runtime.nodeFactory = (entry, parent, runtime) => {
      const node = factory(entry, parent, runtime);
      listen(node);
      return node;
    };
    listen(root);
    dispatchMount(root, input, WriteOption.Overwrite, {
      deferValidation: true,
    });
    const history: unknown[] = [];
    const departed = new Set<DispatchTestNode>();
    const cleanup = vi.spyOn(bulk, 'clearArrayRuntimePaths');
    const reads = vi.spyOn(detached, 'captureDetachedFieldNodeReads');
    // Oracle roots come from the live host before the public write.
    let perishedRootPaths: readonly string[] = [];
    if (oracle) {
      cleanup.mockImplementation((runtime, hostPath, oldCount) => {
        expect(hostPath).toBe(select(root).path);
        prunePerishedPaths(runtime, perishedRootPaths);
        rekeyArrayRuntimePaths(
          runtime,
          hostPath,
          Array.from({ length: oldCount }, (_, index) => ({
            previous: hostPath + '/' + index,
          })),
        );
      });
      reads.mockImplementation((node, snapshot) => capture(node, snapshot));
    }
    try {
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index];
        delivered.length = 0;
        cleanup.mockClear();
        const host = select(root);
        const formerItems = host.children ?? [];
        const former = subtreesOf(formerItems);
        perishedRootPaths = formerItems.map((node) => node.path);
        let result: unknown;
        try {
          result = step.apply(root);
        } catch (error) {
          result = error;
        }
        if (!oracle)
          expect(
            cleanup.mock.calls.length,
            `bulk cleanup at step ${index}`,
          ).toBe(step.bulk ? 1 : 0);
        const current = select(root);
        for (const node of former) if (node.detached) departed.add(node);
        const gates = observeGateRegistry(root, departed);
        expect(
          gates?.stale ?? [],
          `registered departed nodes at step ${index}`,
        ).toEqual([]);
        history.push({
          result: slotsOf(result),
          delivered: [...delivered],
          settlement: observeArraySettlement(root),
          stores: observePathStores(root.runtime, current.path),
          gates,
          departed: observeDetachedReads(root, former),
          formerPaths: former.map((node) => [node.path, node.isActive]),
        });
      }
    } finally {
      cleanup.mockRestore();
      reads.mockRestore();
    }
    histories.push(history.map(normalizeRuleIds));
    roots.push(root);
  }
  expect(histories[0]).toEqual(histories[1]);
  return { candidate: roots[0], oracle: roots[1] };
};
