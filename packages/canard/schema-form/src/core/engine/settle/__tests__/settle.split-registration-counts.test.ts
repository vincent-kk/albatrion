import { expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as traversal from '../utils/compute/dirtyChildren';
import { getDependencyIndex } from '../utils/dependencies/getDependencyIndex';
import * as registration from '../utils/dependencies/registerRecalculation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';

it('keeps registration owners and dirtyChildren sweeps constant at N=5 and N=80', () => {
  const mode = gateSelectionTable.mode;
  const wheel = gateWheelEvaluation.mode;
  const rows: {
    count: number;
    mode: string;
    owners: number[];
    sweeps: number;
    dormant: number;
  }[] = [];
  try {
    gateWheelEvaluation.mode = 'skip';
    for (const count of [5, 80])
      for (const selection of ['off', 'table'] as const) {
        gateSelectionTable.mode = selection;
        const { root, blueprint } = createTestTree(
          gateTableCases[count === 5 ? 0 : 1].schema,
        );
        loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
        const index = getDependencyIndex(blueprint);
        const affected = index.affected;
        const split = index.affectedForRegistration;
        const register = registration.registerRecalculation;
        const dirty = traversal.dirtyChildren;
        const row = {
          count,
          mode: selection,
          owners: [] as number[],
          sweeps: 0,
          dormant: 0,
        };
        let visited = 0;
        vi.spyOn(index, 'affected').mockImplementation((...args) => {
          const owners = affected.apply(index, args);
          visited += owners.length;
          return owners;
        });
        vi.spyOn(index, 'affectedForRegistration').mockImplementation(
          (changed, node, sink) =>
            split.call(index, changed, node, {
              ...sink,
              owner: (...args) => {
                visited++;
                sink.owner(...args);
              },
            }),
        );
        vi.spyOn(registration, 'registerRecalculation').mockImplementation(
          (context) => {
            visited = 0;
            register(context);
            row.owners.push(visited);
            if (row.owners.length === 1)
              row.dormant = [...context.dirtyPaths].filter(
                (path) =>
                  path.startsWith('/payload_') &&
                  !root.structure?.[path.slice(1)],
              ).length;
          },
        );
        vi.spyOn(traversal, 'dirtyChildren').mockImplementation(
          (node, context) => {
            row.sweeps +=
              context.dirtyChildrenByParent.get(node.path)?.size ?? 0;
            return dirty(node, context);
          },
        );
        try {
          writeFieldNode(
            root.structure!.kind,
            `kind_${count - 1}`,
            'input',
            WriteOption.Overwrite,
          );
        } finally {
          vi.restoreAllMocks();
        }
        rows.push(row);
      }
    console.log('SPLIT_REGISTRATION_COUNTS', JSON.stringify(rows));
    expect(rows[2].owners).toEqual([241, 241]);
    expect(rows[2].dormant).toBe(237);
    expect(rows[2].sweeps).toBe(1429);
    // Four unique paths produce five events: the host is also a plain owner.
    expect(rows[3].owners).toEqual([5, 5]);
    expect(rows[3].dormant).toBe(0);
    expect(rows[3].sweeps).toBe(rows[1].sweeps);
  } finally {
    gateSelectionTable.mode = mode;
    gateWheelEvaluation.mode = wheel;
    vi.restoreAllMocks();
  }
});
