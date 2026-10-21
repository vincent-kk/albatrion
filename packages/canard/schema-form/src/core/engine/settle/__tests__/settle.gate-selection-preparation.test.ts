import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as directSelection from '../utils/compute/childSelection/getDirectChildSelectionPlan';
import * as gateSelection from '../utils/compute/childSelection/getGateSelectionTable';
import * as writer from '../utils/write/writeFieldNode';

/** Mirror the fixed-width benchmark's three payload fields per oneOf branch. */
const createBranchTree = (count: number) =>
  createTestTree({
    type: 'object',
    properties: {
      common: { type: 'string', default: 'shared' },
      kind: { type: 'string', default: 'kind_0' },
    },
    oneOf: Array.from({ length: count }, (_, index) => ({
      controls: { active: `./kind === 'kind_${index}'` },
      properties: {
        [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
        [`payload_${index}_b`]: { type: 'number', default: index },
        [`payload_${index}_c`]: {
          type: 'boolean',
          default: index % 2 === 0,
        },
      },
    })),
  });

// filid:contract settle-gate-selection-preparation
describe('mount-time gate selection preparation', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([5, 80])(
    'N=%i caches the plan and table before the first read',
    (count) => {
      const { root, blueprint } = createBranchTree(count);
      loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
      const plan = directSelection.getDirectChildSelectionPlan(
        blueprint.root,
        blueprint,
        false,
      );
      expect(plan).not.toBeNull();
      expect(
        directSelection.getDirectChildSelectionPlan(
          blueprint.root,
          blueprint,
          false,
        ),
      ).toBe(plan);
      const preparing = vi.spyOn(
        directSelection,
        'getDirectChildSelectionPlan',
      );
      const table = gateSelection.getGateSelectionTable(
        blueprint.root,
        blueprint,
      );
      expect(table).not.toBeNull();
      expect(table!.plan).toBe(plan);
      expect(
        gateSelection.getGateSelectionTable(blueprint.root, blueprint),
      ).toBe(table);
      expect(preparing).not.toHaveBeenCalled();
    },
  );

  it('N=80 builds one plan at mount and zero at the first non-load write', () => {
    const { root, blueprint } = createBranchTree(80);
    const builds = vi.spyOn(
      directSelection.DIRECT_CHILD_SELECTION_PLANS,
      'set',
    );
    loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
    const mountBuilds = builds.mock.calls.filter(
      ([host]) => host === blueprint.root,
    ).length;
    builds.mockClear();
    writer.writeFieldNode(
      root.structure!.kind,
      'kind_4',
      'input',
      WriteOption.Overwrite,
    );
    expect(builds).not.toHaveBeenCalled();
    expect(mountBuilds).toBe(1);
  });

  it('prepares once before the generic load writer', () => {
    const { root, blueprint } = createBranchTree(5);
    const tables = vi.spyOn(gateSelection, 'getGateSelectionTable');
    const write = writer.writeFieldNode;
    const loading = vi
      .spyOn(writer, 'writeFieldNode')
      .mockImplementation((node, value, mode, option) => {
        expect(tables).toHaveBeenCalledExactlyOnceWith(
          blueprint.root,
          blueprint,
        );
        expect(
          directSelection.DIRECT_CHILD_SELECTION_PLANS.has(blueprint.root),
        ).toBe(true);
        return write(node, value, mode, option);
      });
    loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
    expect(loading).toHaveBeenCalledOnce();
    expect(tables).toHaveBeenCalledOnce();
  });

  it('leaves branchless expression caches untouched', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: { value: { type: 'string', controls: { visible: 'true' } } },
    });
    expect(blueprint.capabilities.branchless).toBe(true);
    expect(blueprint.capabilities.hasExpressions).toBe(true);
    const tables = vi.spyOn(gateSelection, 'getGateSelectionTable');
    const builds = vi.spyOn(
      directSelection.DIRECT_CHILD_SELECTION_PLANS,
      'set',
    );
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(tables).not.toHaveBeenCalled();
    expect(builds).not.toHaveBeenCalled();
  });

  it('leaves branch caches untouched when there are no expressions', () => {
    const { root, blueprint } = createTestTree({
      type: 'object',
      properties: { kind: { type: 'string' } },
      oneOf: [
        { properties: { a: { type: 'string' } } },
        { properties: { b: { type: 'string' } } },
      ],
    });
    expect(blueprint.capabilities.branchless).toBe(false);
    expect(blueprint.capabilities.hasExpressions).toBe(false);
    const tables = vi.spyOn(gateSelection, 'getGateSelectionTable');
    const builds = vi.spyOn(
      directSelection.DIRECT_CHILD_SELECTION_PLANS,
      'set',
    );
    loadFieldNodeAtMount(root, { kind: 'a' }, WriteOption.Overwrite);
    expect(tables).not.toHaveBeenCalled();
    expect(builds).not.toHaveBeenCalled();
  });

  it('keeps lazy preparation for a load outside the mount entry', () => {
    const { root, blueprint } = createBranchTree(5);
    writer.writeFieldNode(
      root,
      { kind: 'kind_0' },
      'load',
      WriteOption.Overwrite,
    );
    expect(
      directSelection.DIRECT_CHILD_SELECTION_PLANS.has(blueprint.root),
    ).toBe(false);
    const builds = vi.spyOn(
      directSelection.DIRECT_CHILD_SELECTION_PLANS,
      'set',
    );
    writer.writeFieldNode(
      root.structure!.kind,
      'kind_4',
      'input',
      WriteOption.Overwrite,
    );
    expect(
      builds.mock.calls.filter(([host]) => host === blueprint.root),
    ).toHaveLength(1);
  });
});
