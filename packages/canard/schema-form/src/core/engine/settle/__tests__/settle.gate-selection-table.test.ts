import { describe, expect, it } from 'vitest';

import { blueprint } from '../../blueprint';
import { getGateSelectionTable } from '../utils/compute/childSelection/getGateSelectionTable';

/** Build a two-gate host with configurable baseline and comparison forms. */
const analyze = (
  first = "./kind === 'a'",
  second = "./kind === 'b'",
  terminal = true,
) =>
  blueprint({
    type: 'object',
    properties: { kind: terminal ? { type: 'string' } : { type: 'object' } },
    oneOf: [
      { controls: { active: first }, properties: { a: { type: 'string' } } },
      { controls: { active: second }, properties: { b: { type: 'string' } } },
    ],
  });

describe('static gate selection table', () => {
  it('retains authored steps, baseline and shared literal buckets (E1–E4)', () => {
    const analysis = analyze(
      "./kind === 'shared' || ./kind === 'a'",
      "./kind === 'shared'",
    );
    const table = getGateSelectionTable(analysis.root, analysis)!;
    expect(table.plan.steps.map((step) => step.entry.name)).toEqual([
      'kind',
      'a',
      'b',
    ]);
    expect(table.alwaysSteps).toEqual([0]);
    expect([...table.tableSteps]).toEqual([1, 2]);
    expect([...table.stepIndexByName]).toEqual([
      ['kind', 0],
      ['a', 1],
      ['b', 2],
    ]);
    expect(table.groups).toHaveLength(1);
    const group = table.groups[0];
    expect(group.watchedName).toBe('kind');
    expect(group.firstStepIndex).toBe(1);
    expect(group.firstGate).toBe(table.plan.steps[1].gate);
    expect(group.buckets.get('shared')).toEqual([1, 2]);
    expect([...group.literalsByGate.get(group.firstGate)!]).toEqual([
      'shared',
      'a',
    ]);
  });

  it('leaves an unrecognized step outside the table', () => {
    const analysis = analyze("./kind === 'a'", "['b'].includes(./kind)");
    const table = getGateSelectionTable(analysis.root, analysis)!;
    expect(table.alwaysSteps).toEqual([0, 2]);
    expect([...table.tableSteps]).toEqual([1]);
    expect(table.root).toBeUndefined();
  });

  it('rejects a non-terminal watched entry (E3–E4)', () => {
    const analysis = analyze(undefined, undefined, false);
    expect(getGateSelectionTable(analysis.root, analysis)).toBeNull();
  });

  it('keeps a non-terminal watched step outside an otherwise eligible table', () => {
    const analysis = blueprint({
      type: 'object',
      properties: { x: { type: 'string' }, y: { type: 'object' } },
      oneOf: [
        {
          controls: { active: "./x === 'a'" },
          properties: { a: { type: 'string' } },
        },
        {
          controls: { active: './y === null' },
          properties: { b: { type: 'string' } },
        },
      ],
    });
    const table = getGateSelectionTable(analysis.root, analysis)!;
    expect(table.alwaysSteps).toEqual([0, 1, 3]);
    expect([...table.tableSteps]).toEqual([2]);
    expect(table.root).toBeUndefined();
  });

  it('rejects duplicate candidate names (E1)', () => {
    const analysis = blueprint({
      type: 'object',
      properties: { kind: { type: 'string' } },
      oneOf: [
        {
          controls: { active: "./kind === 'a'" },
          properties: { same: { type: 'string' } },
        },
        {
          controls: { active: "./kind === 'b'" },
          properties: { same: { type: 'string' } },
        },
      ],
    });
    expect(getGateSelectionTable(analysis.root, analysis)).toBeNull();
  });

  it('rejects gates with appliesWhen (E1)', () => {
    const analysis = analyze();
    const childEntries = analysis.root.childEntries.map((entry) => {
      if (!entry.declarations[0].gates.length) return entry;
      const gate = entry.declarations[0].gates[0];
      const declaration = {
        ...entry.declarations[0],
        gates: [{ ...gate, appliesWhen: [gate] }],
      };
      return {
        ...entry,
        declarations: [declaration],
        node: { ...entry.node, declarations: [declaration] },
      };
    });
    expect(
      getGateSelectionTable({ ...analysis.root, childEntries }, analysis),
    ).toBeNull();
  });

  it('caches both table and null decisions by host identity', () => {
    const analysis = analyze();
    expect(getGateSelectionTable(analysis.root, analysis)).toBe(
      getGateSelectionTable(analysis.root, analysis),
    );
    const ineligible = { ...analysis.root, childEntries: [] };
    expect(getGateSelectionTable(ineligible, analysis)).toBeNull();
    Object.assign(ineligible, { childEntries: analysis.root.childEntries });
    expect(getGateSelectionTable(ineligible, analysis)).toBeNull();
    expect(getGateSelectionTable({ ...analysis.root }, analysis)).not.toBe(
      getGateSelectionTable(analysis.root, analysis),
    );
  });

  it('builds root declaration buckets only when E5 holds', () => {
    const analysis = analyze();
    const table = getGateSelectionTable(analysis.root, analysis)!;
    expect(table.root?.ungatedIndices).toEqual([0]);
    expect(table.root?.groups[0].buckets.get('a')).toEqual([1]);
    expect(table.root?.groups[0].buckets.get('b')).toEqual([2]);
    expect(
      getGateSelectionTable({ ...analysis.root }, analysis)?.root,
    ).toBeUndefined();
  });

  it('retains independent root buckets for multiple watched keys', () => {
    const analysis = blueprint({
      type: 'object',
      properties: { x: { type: 'string' }, y: { type: 'string' } },
      oneOf: [
        {
          controls: { active: "./x === 'same'" },
          properties: { a: { type: 'string' } },
        },
        {
          controls: { active: "./y === 'same'" },
          properties: { b: { type: 'string' } },
        },
      ],
    });
    const table = getGateSelectionTable(analysis.root, analysis)!;
    expect(
      table.root?.groups.map((group) => [
        group.watchedName,
        group.buckets.get('same'),
      ]),
    ).toEqual([
      ['x', [1]],
      ['y', [2]],
    ]);
  });
});
