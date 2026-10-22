import { afterEach, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import type { BlueprintGate } from '../../blueprint';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as staticLists from '../utils/compute/utils/getStaticGateList';
import * as budgets from '../utils/gates/getGateBudgetCap';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';

afterEach(() => vi.restoreAllMocks());

it('4a compares only the relocated tail on repeated host budget reads', () => {
  const { root, blueprint } = createTestTree(gateTableCases[1].schema);
  const gates = staticLists.getStaticGateList(root).gates;
  const staticGates = Object.freeze(gates.slice(0, 78));
  let comparisons = 0;
  const observed = new Proxy(gates, {
    get(target, key, receiver) {
      if (typeof key === 'string' && /^\d+$/.test(key)) comparisons++;
      return Reflect.get(target, key, receiver);
    },
  });
  const cap = () =>
    Reflect.apply(budgets.getHostWheelBudgetCap, undefined, [
      root,
      blueprint,
      observed,
      staticGates,
    ]);
  expect(cap()).toBe(81);
  comparisons = 0;
  expect(cap()).toBe(81);
  expect(cap()).toBe(81);
  console.log('PR4_4a', comparisons);
  expect(comparisons).toBe(4);
});

it('4b does not expand local occurrences when looking up relocated gates', () => {
  const { root } = createTestTree(gateTableCases[1].schema);
  loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
  const registry = getGateRegistry(root.runtime);
  const locations = (
    registry as unknown as { byLocation: Map<string, Set<unknown>> }
  ).byLocation;
  const entries = locations.get('')!;
  const iterate = entries[Symbol.iterator].bind(entries);
  let expansions = 0;
  vi.spyOn(entries, Symbol.iterator).mockImplementation(() => {
    const iterator = iterate();
    const next = iterator.next.bind(iterator);
    iterator.next = () => {
      const result = next();
      if (!result.done) expansions++;
      return result;
    };
    return iterator;
  });
  expect(registry.relocated('')).toEqual([]);
  console.log('PR4_4b', { entries: entries.size, expansions });
  expect(expansions).toBe(0);
});

it('4c copies zero static gates on an unrelocated branch switch', () => {
  const { root } = createTestTree(gateTableCases[1].schema);
  const getList = staticLists.getStaticGateList;
  const list = getList(root);
  const authored = list.gates.slice();
  let copies = 0;
  const gates = new Proxy(list.gates, {
    get(target, key, receiver) {
      if (key === Symbol.iterator)
        return function* () {
          for (const gate of target) {
            copies++;
            yield gate;
          }
        };
      return Reflect.get(target, key, receiver);
    },
  });
  vi.spyOn(staticLists, 'getStaticGateList').mockImplementation((node) =>
    node === root ? { ...list, gates } : getList(node),
  );
  loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
  copies = 0;
  writeFieldNode(
    root.structure!.kind,
    'kind_79',
    'input',
    WriteOption.Overwrite,
  );
  console.log('PR4_4c', copies);
  expect(copies).toBe(0);
  expect(getList(root).gates).toBe(list.gates);
  expect(list.gates).toEqual(authored);
  for (const kind of ['kind_0', 'kind_79']) {
    writeFieldNode(root.structure!.kind, kind, 'input', WriteOption.Overwrite);
    expect(getList(root).gates).toBe(list.gates);
    expect(list.gates).toEqual(authored);
  }
});

it('4d filters zero declarations when revisiting warmed root buckets', () => {
  const { root } = createTestTree(gateTableCases[1].schema);
  loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
  const write = (value: string) =>
    writeFieldNode(root.structure!.kind, value, 'input', WriteOption.Overwrite);
  write('kind_79');
  const last = root.schema;
  write('kind_0');
  const first = root.schema;
  const source = root.blueprintNode.declarations;
  const filter = Array.prototype.filter;
  let declarations = 0;
  vi.spyOn(Array.prototype, 'filter').mockImplementation(function (
    this: unknown[],
    predicate,
    thisArg,
  ) {
    if (this === source) declarations += source.length;
    return Reflect.apply(filter, this, [predicate, thisArg]);
  });
  write('kind_79');
  expect(root.schema).toBe(last);
  write('kind_0');
  expect(root.schema).toBe(first);
  console.log('PR4_4d', declarations);
  expect(declarations).toBe(0);
});

it('4a retains the authored cap when relocated gates grow or change order', () => {
  const { root, blueprint } = createTestTree(gateTableCases[1].schema);
  const gates = staticLists.getStaticGateList(root).gates;
  const prefix = Object.freeze(gates.slice(0, 78));
  const read = (host: object, selected: readonly BlueprintGate[]) =>
    Reflect.apply(budgets.getHostWheelBudgetCap, undefined, [
      host,
      blueprint,
      selected,
      prefix,
    ]);
  for (const selected of [
    prefix,
    [...prefix, gates[78]],
    [...prefix, gates[78], gates[79]],
    [...prefix, gates[79], gates[78]],
    [...prefix, gates[79]],
  ]) {
    expect(read(root, selected)).toBe(
      budgets.getHostWheelBudgetCap({}, blueprint, selected),
    );
    expect(prefix).toEqual(gates.slice(0, 78));
  }
});
