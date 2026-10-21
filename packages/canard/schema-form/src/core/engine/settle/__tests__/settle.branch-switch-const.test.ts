import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import type { BlueprintGate, BlueprintSchema } from '../../blueprint';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as selection from '../utils/compute/childSelection/selectChildren';
import * as relocation from '../utils/compute/relocatedGates';
import * as budget from '../utils/gates/getGateBudgetCap';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Build ten branches with one independently gated payload each. */
const branchSchema = (): BlueprintSchema => ({
  type: 'object',
  properties: { kind: { type: 'number' } },
  oneOf: Array.from({ length: 10 }, (_, index) => ({
    controls: { active: `./kind === ${index}` },
    properties: {
      [`payload_${index}`]: { type: 'string', default: `value_${index}` },
    },
  })),
});

afterEach(() => vi.restoreAllMocks());

describe('branch-switch constant-factor regression records', () => {
  it('keeps the pending-exit path count while two exits wait at one path', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        s: { type: 'number' },
        x1: {
          type: 'number',
          default: 1,
          controls: { active: '../s === 1' },
        },
        x2: {
          type: 'number',
          default: 1,
          controls: { active: '../x1 === 1' },
        },
        x3: {
          type: 'number',
          default: 1,
          controls: { active: '../x2 === 1' },
        },
      },
      oneOf: [
        {
          controls: { active: './s === 0 || ./x3 === 1' },
          properties: { p: { type: 'string' } },
        },
        {
          controls: { active: './s === 1 && ./x1 === undefined' },
          properties: { p: { type: 'number' } },
        },
        {
          controls: {
            active: './s === 1 && ./x1 === 1 && ./x3 === undefined',
          },
          properties: { p: { type: 'boolean' } },
        },
      ],
    });
    loadFieldNodeAtMount(root, { s: 0, p: 'keep' }, WriteOption.Overwrite);
    const original = root.structure!.p;
    const selected = selection.selectChildren;
    const counts: number[] = [];
    vi.spyOn(selection, 'selectChildren').mockImplementation((...args) => {
      const changed = selected(...args);
      const context = args[1];
      const paths = new Map<string, number>();
      for (const key of context.pendingExits.keys()) {
        const [path] = JSON.parse(key) as [string, unknown];
        paths.set(path, (paths.get(path) ?? 0) + 1);
      }
      expect(context.pendingExitPaths ?? new Map()).toEqual(paths);
      counts.push(paths.get('/p') ?? 0);
      return changed;
    });
    writeFieldNode(root.structure!.s, 1, 'input', WriteOption.Overwrite);
    expect(Math.max(...counts)).toBe(2);
    expect(root.structure!.p).toBe(original);
    expect(original.local).toBe('keep');
  });

  it('encodes no unrelated inactive path while the outgoing branch is pending', () => {
    const { root } = createTestTree(branchSchema());
    loadFieldNodeAtMount(root, { kind: 0 }, WriteOption.Overwrite);
    const stringify = JSON.stringify;
    const unrelated: string[] = [];
    vi.spyOn(JSON, 'stringify').mockImplementation((...args) => {
      const caller = new Error().stack
        ?.split('\n')
        .find((line) => line.includes('/src/') && !line.includes('__tests__'));
      if (
        (caller?.includes('/childSelection/selectChildren.ts') ||
          caller?.includes('/childSelection/selectEntryStep.ts')) &&
        Array.isArray(args[0]) &&
        /^\/payload_[1-8]$/.test(args[0][0])
      )
        unrelated.push(args[0][0]);
      return Reflect.apply(stringify, JSON, args);
    });
    writeFieldNode(root.structure!.kind, 9, 'input', WriteOption.Overwrite);
    expect(root.local).toEqual({ kind: 9, payload_9: 'value_9' });
    expect(unrelated).toEqual([]);
  });

  it('finds the identical pending exit when its gate throws in a later wheel', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        t: { type: 'boolean' },
        a: {
          type: 'number',
          default: 1,
          controls: { active: '../t === true' },
        },
        g: {
          type: 'string',
          controls: { active: '@.gate(../a)', unsetOnInactive: true },
        },
      },
    });
    let armed = false;
    root.runtime.context = {
      gate: (a: unknown) => {
        if (a === undefined) return !armed;
        throw new Error('gate');
      },
    };
    loadFieldNodeAtMount(root, { g: 'G' }, WriteOption.Overwrite);
    const original = root.structure!.g;
    const selected = selection.selectChildren;
    const exits: boolean[] = [];
    vi.spyOn(selection, 'selectChildren').mockImplementation((...args) => {
      const changed = selected(...args);
      if (args[0] === root)
        exits.push(args[1].throwingGateExits?.has(original) === true);
      return changed;
    });
    armed = true;
    expect(() =>
      writeFieldNode(root.structure!.t, true, 'input', WriteOption.Overwrite),
    ).toThrow('Gate evaluation failed');
    expect(exits).toContain(true);
    expect({
      exits,
      local: root.local,
      detached: original.detached,
      latent: root.runtime.latentRaw.get(JSON.stringify(['/g', 'string'])),
      status: root.runtime.diagnostics.status,
    }).toMatchSnapshot();
  });

  it.each([
    {
      name: 'oneOf-10',
      schema: branchSchema(),
      input: { kind: 0 },
      writes: [{ kind: 9 }, { kind: 0 }],
    },
    {
      name: 'branches-with-relocation',
      schema: {
        type: 'object',
        properties: {
          kind: { type: 'number' },
          p: {
            type: 'object',
            properties: {
              child: {
                type: 'string',
                default: 'P',
                controls: { active: '#/kind === 0' },
              },
            },
          },
        },
        oneOf: [
          {
            controls: { active: './kind === 0' },
            properties: { own: { type: 'string', default: 'O' } },
          },
        ],
      } as BlueprintSchema,
      input: { kind: 1, p: {} },
      writes: [
        { kind: 0, p: {} },
        { kind: 1, p: {} },
      ],
    },
    {
      name: 'array-host',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kind: { type: 'number' },
            g: { type: 'string', controls: { active: '../kind === 1' } },
          },
        },
      } as BlueprintSchema,
      input: [{ kind: 0 }],
      writes: [[{ kind: 1 }, { kind: 0 }], [{ kind: 0 }]],
    },
  ])(
    'preserves HEAD gate identities, order and caps for $name',
    ({ schema, input, writes }) => {
      const { root } = createTestTree(schema);
      loadFieldNodeAtMount(root, input, WriteOption.Overwrite);
      const original = budget.getHostWheelBudgetCap;
      const observed: { host: string; gates: string[]; cap: number }[] = [];
      const identities = new Map<BlueprintGate, number>();
      vi.spyOn(budget, 'getHostWheelBudgetCap').mockImplementation(
        (host, blueprint, gates) => {
          const cap = original(host, blueprint, gates);
          expect(
            gates.filter((gate, index) => gates.indexOf(gate) === index),
          ).toHaveLength(gates.length);
          for (const gate of gates)
            if (!identities.has(gate)) identities.set(gate, identities.size);
          observed.push({
            host: (host as typeof root).path,
            gates: gates.map(
              (gate) => `${identities.get(gate)}:${gate.schemaPath}`,
            ),
            cap,
          });
          return cap;
        },
      );
      for (const input of writes)
        writeFieldNode(root, input, 'input', WriteOption.Overwrite);
      expect(observed.length).toBeGreaterThan(0);
      expect(observed).toMatchSnapshot();
    },
  );

  it('does not retain a relocated gate after the occurrence disappears', () => {
    const { root } = createTestTree(branchSchema());
    const other = createTestTree(branchSchema());
    loadFieldNodeAtMount(root, { kind: 0 }, WriteOption.Overwrite);
    const extra = other.blueprint.root.declarations.flatMap(
      (declaration) => declaration.gates,
    )[0];
    expect(extra).toBeDefined();
    const occurrence = { gate: extra, hostPath: '', evaluationHostPath: '' };
    let present = true;
    vi.spyOn(relocation, 'relocatedGates').mockImplementation((host) =>
      host === root && present ? [occurrence, occurrence] : [],
    );
    const original = budget.getHostWheelBudgetCap;
    const seen: BlueprintGate[][] = [];
    vi.spyOn(budget, 'getHostWheelBudgetCap').mockImplementation(
      (host, blueprint, gates) => {
        if (host === root) seen.push([...gates]);
        return original(host, blueprint, gates);
      },
    );
    writeFieldNode(root.structure!.kind, 9, 'input', WriteOption.Overwrite);
    expect(seen.some((gates) => gates[gates.length - 1] === extra)).toBe(true);
    expect(
      seen.every(
        (gates) => gates.filter((gate) => gate === extra).length === 1,
      ),
    ).toBe(true);
    present = false;
    seen.length = 0;
    writeFieldNode(root.structure!.kind, 0, 'input', WriteOption.Overwrite);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((gates) => !gates.includes(extra))).toBe(true);
  });
});
