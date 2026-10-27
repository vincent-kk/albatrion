import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as selection from '../utils/compute/childSelection/selectChildren';
import { getStaticGateList } from '../utils/compute/utils/getStaticGateList';
import { resetFieldNodeForm } from '../utils/reset/resetFieldNodeForm';
import { resetFieldNodeSubtree } from '../utils/reset/resetFieldNodeSubtree';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { preparedHostSchema } from './fixtures/preparedHostSchema';

afterEach(() => vi.restoreAllMocks());

it('reports the original derive budget failure after prepared-host revival', () => {
  const fixture = gateTableCases.find((item) =>
    item.name.startsWith('revival p'),
  )!;
  const { root } = createTestTree(fixture.schema);
  loadFieldNodeAtMount(root, fixture.input, WriteOption.Overwrite);
  expect(() =>
    writeFieldNode(
      root.structure!.src,
      'go',
      'callerReplace',
      WriteOption.Overwrite,
    ),
  ).toThrow('Derive budget exceeded');
  expect(getHostDerived(root).preparedStaticHost).toBeUndefined();
});

// filid:contract settle-b2-p2-preparation
it('does not copy or enumerate the prepared gate list on a scalar switch', () => {
  const { root } = createTestTree(preparedHostSchema);
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, 1, 'input', WriteOption.Overwrite);
  const list = getStaticGateList(root).gates;
  const iterator = vi.spyOn(list, Symbol.iterator).mockImplementation(() => {
    throw new Error('Gate list copied after preparation');
  });
  try {
    writeFieldNode(root.structure!.kind, 0, 'input', WriteOption.Overwrite);
    expect(root.local).toEqual({ kind: 0, fixed: 'fixed', a: 'a' });
  } finally {
    iterator.mockRestore();
  }
});

it.each(['form', 'subtree'] as const)(
  'discards static preparation on %s reset',
  (kind) => {
    const { root } = createTestTree(preparedHostSchema);
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    writeFieldNode(root.structure!.kind, 1, 'input', WriteOption.Overwrite);
    expect(getHostDerived(root).preparedStaticHost).toBeDefined();
    if (kind === 'form') resetFieldNodeForm(root, {}, WriteOption.Overwrite);
    else resetFieldNodeSubtree(root, WriteOption.Overwrite);
    expect(getHostDerived(root).preparedStaticHost).toBeUndefined();
    expect(root.structure!.kind.raw).toBe(0);
  },
);

it('prepares a new wheel for a host that leaves and re-enters', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      host: { ...preparedHostSchema, controls: { active: '../show' } },
    },
  });
  loadFieldNodeAtMount(root, { show: true }, WriteOption.Overwrite);
  const old = root.structure!.host;
  const plan = getHostDerived(old).wheelPlan;
  expect(plan).toBeDefined();
  writeFieldNode(root.structure!.show, false, 'input', WriteOption.Overwrite);
  writeFieldNode(root.structure!.show, true, 'input', WriteOption.Overwrite);
  const current = root.structure!.host;
  expect(current).not.toBe(old);
  expect(getHostDerived(current).wheelPlan).not.toBe(plan);
  expect(current.structure!.kind.path).toBe('/host/kind');
});

it('rebinds occurrence witnesses after array rearrangement', () => {
  const { root } = createTestTree({ type: 'array', items: preparedHostSchema });
  loadFieldNodeAtMount(root, [{}, {}], WriteOption.Overwrite);
  const moved = root.structure!['0'];
  writeFieldNode(moved.structure!.kind, 1, 'input', WriteOption.Overwrite);
  const before = getHostDerived(moved).preparedStaticHost;
  expect(before).toBeDefined();
  arrangeFieldNodeItems(root, { kind: 'insert', index: 0, value: {} });
  const host = root.structure!['1'];
  writeFieldNode(host.structure!.kind, 0, 'input', WriteOption.Overwrite);
  expect(getHostDerived(host).preparedStaticHost).not.toBe(before);
  expect(host.structure!.fixed.path).toBe('/1/fixed');
  expect(host.local).toEqual({ kind: 0, fixed: 'fixed', a: 'a' });
});

it('discards witnesses after a selection failure and recovers with a new baseline', () => {
  const { root } = createTestTree(preparedHostSchema);
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, 1, 'input', WriteOption.Overwrite);
  const previous = getHostDerived(root).preparedStaticHost;
  expect(previous).toBeDefined();
  const select = vi
    .spyOn(selection, 'selectChildren')
    .mockImplementationOnce(() => {
      throw new Error('selection interrupted');
    });
  expect(() =>
    writeFieldNode(root.structure!.kind, 0, 'input', WriteOption.Overwrite),
  ).toThrow('selection interrupted');
  select.mockRestore();
  expect(getHostDerived(root).preparedStaticHost).toBeUndefined();
  writeFieldNode(root.structure!.kind, 1, 'input', WriteOption.Overwrite);
  expect(getHostDerived(root).preparedStaticHost).not.toBe(previous);
  expect(root.local).toEqual({ kind: 1, fixed: 'fixed', b: 'b' });
});
