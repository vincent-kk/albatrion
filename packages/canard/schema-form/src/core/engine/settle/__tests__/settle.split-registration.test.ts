import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as registration from '../utils/dependencies/registerRecalculation';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableCases } from './fixtures/gate-table/gateTableCases';
import { observeGateTableCase } from './fixtures/gate-table/observeGateTableCase';

// filid:contract settle-split-registration
describe('split registration preserves the settlement contract', () => {
  const initialMode = gateSelectionTable.mode;
  afterEach(() => {
    gateSelectionTable.mode = initialMode;
    vi.restoreAllMocks();
  });

  it('N=80 inserts no never-live split owners at registration', () => {
    gateSelectionTable.mode = 'table';
    const { root } = createTestTree(gateTableCases[1].schema);
    loadFieldNodeAtMount(root, { kind: 'kind_0' }, WriteOption.Overwrite);
    const register = registration.registerRecalculation;
    const rows: string[][] = [];
    vi.spyOn(registration, 'registerRecalculation').mockImplementation(
      (context) => {
        register(context);
        rows.push(
          [...context.dirtyPaths].filter(
            (path) =>
              path.startsWith('/payload_') &&
              !path.startsWith('/payload_0_') &&
              !path.startsWith('/payload_79_'),
          ),
        );
      },
    );
    writeFieldNode(
      root.structure!.kind,
      'kind_79',
      'input',
      WriteOption.Overwrite,
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.length === 0)).toBe(true);
  });

  it('S3 covers registration and every dirtyChildren call, and S4 covers revival', () => {
    gateSelectionTable.mode = 'verify';
    gateSelectionTable.assertions = Object.create(null);
    gateSelectionTable.violations = 0;
    const fixture = gateTableCases.find((item) =>
      item.name.startsWith('converging revival'),
    )!;
    observeGateTableCase(fixture);
    expect(gateSelectionTable.assertions.S3).toBeGreaterThan(0);
    expect(gateSelectionTable.assertions.S4).toBeGreaterThan(0);
    expect(gateSelectionTable.violations).toBe(0);
  });

  it('V7 preserves h then g in both derive and transition passes', () => {
    gateSelectionTable.mode = 'table';
    const fixture = gateTableCases.find(
      (item) => item.name === 'verified anchor (derived includes)',
    )!;
    const history = JSON.parse(observeGateTableCase(fixture));
    for (const phase of ['derive', 'transition']) {
      const calls = history.observations[1].extra.dirtyChildren.filter(
        (call: { phase: string; host: string; children: string[] }) =>
          call.phase === phase && call.host === '' && call.children.length > 0,
      );
      expect(calls.length).toBeGreaterThan(0);
      for (const call of calls) expect(call.children).toEqual(['/h', '/g']);
    }
  });

  it('oscillating revival records the budget failure and still exercises S4', () => {
    gateSelectionTable.mode = 'verify';
    gateSelectionTable.assertions = Object.create(null);
    const fixture = gateTableCases.find((item) =>
      item.name.startsWith('revival p'),
    )!;
    const history = JSON.parse(observeGateTableCase(fixture));
    expect(history.observations[1].failure).toContain('Derive budget exceeded');
    expect(history.observations[1].extra.revivals).toContain('/p');
    expect(gateSelectionTable.assertions.S4).toBeGreaterThan(0);
  });

  it('converges after entry, computation, exit, dormant hit and revival', () => {
    gateSelectionTable.mode = 'verify';
    const { root } = createTestTree({
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          default: 'c',
          controls: {
            derived:
              '../hop === "back" ? "b" : (../kind === "b" ? "a" : undefined)',
          },
        },
        hop: {
          type: 'string',
          controls: { derived: '../kind === "a" ? "back" : undefined' },
        },
      },
      oneOf: ['a', 'b', 'c'].map((name) => ({
        controls: { active: `./kind === '${name}'` },
        properties: {
          [`p${name}`]: { type: 'string', default: name.toUpperCase() },
        },
      })),
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    const register = registration.registerRecalculation;
    const stages: { living: boolean; pending: boolean; dirty: boolean }[] = [];
    vi.spyOn(registration, 'registerRecalculation').mockImplementation(
      (context) => {
        register(context);
        stages.push({
          living: !!root.structure?.pb,
          pending: [...context.pendingExits.values()].some(
            (node) => node.path === '/pb',
          ),
          dirty: context.dirtyPaths.has('/pb'),
        });
      },
    );
    writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite);
    expect(stages).toContainEqual({
      living: true,
      pending: false,
      dirty: true,
    });
    expect(stages).toContainEqual({
      living: false,
      pending: true,
      dirty: true,
    });
    expect(root.local).toEqual({ kind: 'b', hop: 'back', pb: 'B' });
  });
});
