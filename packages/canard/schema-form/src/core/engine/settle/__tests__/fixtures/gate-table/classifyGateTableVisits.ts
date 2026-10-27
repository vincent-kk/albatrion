import { vi } from 'vitest';

import * as trees from '../../../../__tests__/fixtures/createTestTree';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import type { GateSelectionTable } from '../../../types/gateSelectionTable';
import * as computation from '../../../utils/compute/computeNode';

/** Assembly visits owned by a host's statically eligible extended table path. */
interface ClassifiedVisits {
  /** Original complete traversal log, retained without mutation for snapshots. */
  visits: string[];
  /** Positions at which an if/discriminator table host assembled its projection. */
  tableAssemblies: Set<number>;
}

/**
 * Classify projection assembly work whose scheduling belongs to extended tables.
 * @returns Scoped hooks and a comparison-only normalizer; public observations stay intact
 * @remarks The Vitest module spies observe the existing fixture factory and compute wrapper.
 */
export const classifyGateTableVisits = () => {
  const records = new WeakMap<object, ClassifiedVisits>();
  const histories: ClassifiedVisits[] = [];
  let current: ClassifiedVisits | undefined;
  const create = trees.createTestTree;
  const creating = vi
    .spyOn(trees, 'createTestTree')
    .mockImplementation((...args) => {
      const tree = create(...args);
      const record = {
        visits: tree.visits,
        tableAssemblies: new Set<number>(),
      };
      records.set(tree.root.runtime, record);
      current ??= record;
      return tree;
    });
  const compute = computation.computeNode;
  const computing = vi
    .spyOn(computation, 'computeNode')
    .mockImplementation((node, context) => {
      const record = records.get(node.runtime);
      const table = getHostDerived<
        'gateSelectionTable',
        GateSelectionTable | null
      >(node.blueprintNode).gateSelectionTable;
      const extended =
        table?.groups.some(
          (group) => group.firstGate.kind === 'discriminator',
        ) || table?.predicateGroups.some((group) => group.gate.kind === 'if');
      const start = record?.visits.length ?? 0;
      try {
        return compute(node, context);
      } finally {
        if (record && extended)
          for (let index = start; index < record.visits.length; index++)
            if (record.visits[index] === node.path)
              record.tableAssemblies.add(index);
      }
    });
  return {
    /** Start an independent off/table/verify history group. */
    reset: () => {
      histories.length = 0;
    },
    /** Capture the first plain tree of the next complete observation history. */
    begin: () => {
      current = undefined;
    },
    /** Preserve the classified source positions after all settlements have finished. */
    complete: () => {
      if (current) histories.push(current);
      else throw new Error('Missing gate table fixture tree');
    },
    /** Compare only non-table assembly visits; every other section remains exact. */
    normalize: (sections: Record<string, unknown>, history: number) => {
      const classified = histories[history].tableAssemblies;
      sections.visits = (sections.visits as string[][]).map((row) =>
        row.filter((_, index) => !classified.has(index)),
      );
    },
    /** Restore both fixture hooks even after a failed shadow assertion. */
    restore: () => {
      computing.mockRestore();
      creating.mockRestore();
    },
  };
};
