import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import type { GatePredicateInputs } from '../types/gatePredicate';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import * as preparation from '../utils/gates/prepareGateTableRound';
import * as views from '../utils/gates/readGateHostView';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createGatePredicateSchema } from './fixtures/createGatePredicateSchema';

const modes = {
  predicate: engineModes.gatePredicate,
  selection: engineModes.gateSelection,
  wheel: engineModes.gateWheel,
};
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gatePredicate', modes.predicate);
  engineModes.setMode('gateSelection', modes.selection);
  engineModes.setMode('gateWheel', modes.wheel);
});

// filid:contract gate-predicate-allocation
describe('gate predicate allocation bounds', () => {
  it.each(['active', 'if'] as const)(
    '%s reuses each pure occurrence input array and call object across writes',
    (kind) => {
      engineModes.setMode('gatePredicate', 'on');
      engineModes.setMode('gateSelection', 'off');
      engineModes.setMode('gateWheel', 'skip');
      const { root } = createTestTree(
        createGatePredicateSchema(kind),
        createTestValidator(),
      );
      loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
      const registry = getGateRegistry(root.runtime);
      const predicates = root.blueprintNode.declarations
        .flatMap((declaration) => declaration.gates)
        .filter((gate) => gate.kind === kind)
        .map((gate) => registry.locate(root, gate).predicate);
      expect(predicates).toHaveLength(80);
      const seen = predicates.map((predicate) => {
        if (!predicate) throw new Error('Mounted predicate must be bound');
        const calls = new Set<GatePredicateInputs>();
        const arrays = new Set<unknown[]>();
        const evaluate = predicate.evaluate;
        vi.spyOn(predicate, 'evaluate').mockImplementation((input) => {
          calls.add(input);
          arrays.add(input.values);
          return evaluate(input);
        });
        return { calls, arrays, prepared: predicate.arguments };
      });
      for (const tag of ['tag_79', 'tag_0', 'tag_79'])
        writeFieldNode(
          root.structure!.kind,
          tag,
          'input',
          WriteOption.Overwrite,
        );
      expect(
        seen.map(({ calls, arrays }) => [calls.size, arrays.size]),
      ).toEqual(Array.from({ length: 80 }, () => [1, 1]));
      for (const { calls, prepared } of seen) {
        expect(calls.has(prepared)).toBe(true);
        for (const input of calls) expect(input.view).toBeUndefined();
      }
      expect(root.emit).toEqual({
        kind: 'tag_79',
        payload_79_a: 'A',
        payload_79_b: 1,
        payload_79_c: true,
      });
    },
  );

  it('registers literal active occurrences without per-occurrence getter closures', () => {
    const { root } = createTestTree(createGatePredicateSchema('active'));
    const registry = getGateRegistry(root.runtime);
    const occurrences = root.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .map((gate) => registry.locate(root, gate));
    expect(occurrences).toHaveLength(80);
    expect(
      occurrences.filter(
        (occurrence) =>
          Object.getOwnPropertyDescriptor(occurrence, 'predicate')?.get,
      ),
    ).toHaveLength(0);
  });

  it('releases failed input references and retries without replacing the buffer', () => {
    const { root } = createTestTree(
      createGatePredicateSchema('if', 3),
      createTestValidator(),
    );
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    const gate = root.blueprintNode.declarations
      .flatMap((declaration) => declaration.gates)
      .find((candidate) => candidate.kind === 'if')!;
    const occurrence = getGateRegistry(root.runtime).locate(root, gate);
    const input = occurrence.predicate.arguments;
    const evaluate = vi
      .spyOn(occurrence.predicate, 'evaluate')
      .mockImplementation(() => {
        throw new Error('guard failed');
      });
    for (const tag of ['tag_2', 'tag_0']) {
      const before = evaluate.mock.calls.length;
      expect(() =>
        writeFieldNode(
          root.structure!.kind,
          tag,
          'input',
          WriteOption.Overwrite,
        ),
      ).toThrow();
      expect(evaluate.mock.calls.length).toBeGreaterThan(before);
      expect(occurrence.memo).toBeUndefined();
      expect(occurrence.predicate.arguments).toBe(input);
      expect(input.values).toEqual(Array(input.values.length).fill(undefined));
      expect(input.view).toBeUndefined();
    }
  });

  it('creates no active host view and shares the empty schema-path list across rounds', () => {
    engineModes.setMode('gateSelection', 'table');
    engineModes.setMode('gateWheel', 'skip');
    const { root } = createTestTree(createGatePredicateSchema('active'));
    loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.kind,
      'tag_79',
      'input',
      WriteOption.Overwrite,
    );
    const view = vi.spyOn(views, 'readGateHostView');
    const prepare = preparation.prepareGateTableRound;
    const lists = new Set<readonly string[]>();
    vi.spyOn(preparation, 'prepareGateTableRound').mockImplementation(
      (node, context, round) => {
        prepare(node, context, round);
        const prepared = context.gateSelectionRounds?.get(node);
        if (prepared) lists.add(prepared.stableSchemaPaths);
      },
    );
    for (const tag of ['tag_0', 'tag_79', 'tag_0'])
      writeFieldNode(root.structure!.kind, tag, 'input', WriteOption.Overwrite);
    expect(view).not.toHaveBeenCalled();
    expect(lists.size).toBe(1);
    expect([...lists][0]).toHaveLength(0);
  });
});
