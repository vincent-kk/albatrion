import { afterEach, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchSetValue } from '../../write';
import type { SettlementContext } from '../types/settlement';
import * as registration from '../utils/dependencies/registerPresenceChanges';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import * as settlement from '../utils/settlement/createSettlementContext';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { presenceHost } from './fixtures/presenceReaderCases';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

/** Count contracts deliberately use record mode; shipping skip mode allocates no counters. */
const previousMode = gateWheelEvaluation.mode;
afterEach(() => {
  vi.restoreAllMocks();
  gateWheelEvaluation.mode = previousMode;
});

it('an unchanged presence write computes only root and leaf with no registration or reentry', () => {
  gateWheelEvaluation.mode = 'record';
  let latest: SettlementContext<DispatchTestNode> | undefined;
  const create = settlement.createSettlementContext;
  vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
    (...args) => {
      const context = create(...args);
      latest = context as SettlementContext<DispatchTestNode>;
      return context;
    },
  );
  const root = mountPresenceTree({
    type: 'object',
    properties: { h: presenceHost(true), w: { type: 'string' } },
    oneOf: [
      {
        controls: { active: "./h/c === 'x'" },
        properties: { z: { type: 'string' } },
      },
    ],
  });
  const register = vi.spyOn(registration, 'registerPresenceChanges');
  dispatchSetValue(getDispatchNode(root, 'w'), 'a');
  expect(register).toHaveBeenCalledTimes(0);
  expect(latest?.presenceRegistrations ?? 0).toBe(0);
  expect(latest?.presenceMetrics).toEqual({
    computes: new Map([
      ['', 1],
      ['/w', 1],
    ]),
    ancestorRechecks: 0,
    ancestorWheels: 0,
    calls: 0,
    ownerInsertions: 0,
    indexLookups: 0,
  });
  for (const t of ['off', 'on']) {
    dispatchSetValue(getDispatchNode(root, 'h', 't'), t);
    expect(latest?.presenceMetrics?.ancestorWheels).toBeGreaterThan(0);
    expect(
      Math.max(...(latest?.presenceMetrics?.computes.values() ?? [])),
    ).toBeLessThanOrEqual(3);
    expect(root.runtime.diagnostics.status).toBe('stable');
  }
});

it('registration agrees with every bound occurrence after both directed intersections', () => {
  gateWheelEvaluation.mode = 'record';
  const register = registration.registerPresenceChanges;
  let comparisons = 0;
  vi.spyOn(registration, 'registerPresenceChanges').mockImplementation(
    (host, previous, context) => {
      const result = register(host, previous, context);
      const registry = getGateRegistry(context.root.runtime);
      const byPath = Reflect.get(registry, 'byPath') as Map<
        string,
        {
          occurrences: {
            hostPath: string;
            evaluationHostPath: string;
            watchPaths: readonly string[];
          }[];
        }
      >;
      for (const changed of context.changedPresence ?? []) {
        const h = changed.slice(0, changed.lastIndexOf('/'));
        for (const entry of byPath.values())
          for (const occurrence of entry.occurrences) {
            const owner = occurrence.hostPath;
            if (owner === changed || owner.startsWith(changed + '/')) continue;
            for (const watched of occurrence.watchPaths) {
              if (
                !(
                  watched === changed ||
                  watched.startsWith(changed + '/') ||
                  changed.startsWith(watched + '/') ||
                  watched === ''
                )
              )
                continue;
              if (
                owner.startsWith(h + '/') &&
                (watched === h || h.startsWith(watched + '/') || watched === '')
              )
                continue;
              const location = occurrence.evaluationHostPath;
              expect(
                location === h ||
                  h.startsWith(location + '/') ||
                  location === '',
              ).toBe(true);
              // Load-scope ancestors are already shape-dirty before registration.
              if (
                location !== h &&
                (h.startsWith(location + '/') || location === '')
              )
                expect(context.shapeDirtyPaths.has(location)).toBe(true);
              comparisons++;
            }
          }
      }
      return result;
    },
  );
  const root = mountPresenceTree(
    {
      type: 'object',
      properties: {
        h: presenceHost(),
        z: { type: 'string', controls: { active: "../h/c === 'x'" } },
      },
    },
    { h: { t: 'on', c: 'x' } },
  );
  for (const t of ['off', 'on'])
    dispatchSetValue(getDispatchNode(root, 'h', 't'), t);
  expect(comparisons).toBeGreaterThan(0);
});

/** Capture the actual call-local counters without changing the settlement context. */
const capturePresenceContext = () => {
  let latest: SettlementContext<DispatchTestNode> | undefined;
  const create = settlement.createSettlementContext;
  vi.spyOn(settlement, 'createSettlementContext').mockImplementation(
    (...args) => {
      const context = create(...args);
      latest = context as SettlementContext<DispatchTestNode>;
      return context;
    },
  );
  return () => latest;
};

/** Array readers share one authored template while keeping caller values independent. */
const readerSchema = (
  expression: string,
  properties: Record<string, BlueprintSchema> = {},
): BlueprintSchema => ({
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          active: { type: 'boolean' },
          name: { type: 'string', controls: { active: expression } },
          ...properties,
        },
      },
    },
  },
});

it.each(['record', 'skip', 'shadow'] as const)(
  '%s: fixed-index and whole-array readers keep linear owner insertions',
  (mode) => {
    const latest = capturePresenceContext();
    for (const whole of [false, true]) {
      const schema = readerSchema(
        whole ? '(../../)?.[0]?.active === true' : '../../0/active === true',
      );
      const totals: { mount: number; write: number }[] = [];
      for (const count of [250, 1_000]) {
        gateWheelEvaluation.mode = mode;
        const value = {
          items: Array.from({ length: count }, () => ({
            active: true,
            name: 'N',
          })),
        };
        const root = mountPresenceTree(schema, value);
        const mount = latest()?.presenceMetrics?.ownerInsertions;
        if (mode === 'record') {
          expect(mount).toBeTypeOf('number');
          expect
            .soft(mount)
            .toBeLessThanOrEqual(whole ? 3 * count : 2 * count + 1);
        } else expect(latest()?.presenceMetrics).toBeUndefined();
        let write = 0;
        for (const active of [false, true]) {
          dispatchSetValue(
            getDispatchNode(root, 'items', '0', 'active'),
            active,
          );
          const insertions = latest()?.presenceMetrics?.ownerInsertions;
          if (mode === 'record') {
            expect(insertions).toBeTypeOf('number');
            if (whole) expect.soft(insertions).toBeLessThanOrEqual(count);
            else expect.soft(insertions).toBe(0);
            write = Math.max(write, insertions ?? 0);
          } else expect(latest()?.presenceMetrics).toBeUndefined();
          const expected = mountPresenceTree(schema, {
            items: value.items.map((item, index) =>
              index === 0 ? { ...item, active } : item,
            ),
          });
          expect(observePresenceTree(root)).toEqual(
            observePresenceTree(expected),
          );
        }
        totals.push({ mount: mount ?? 0, write });
      }
      if (mode === 'record') {
        expect
          .soft(totals[1].mount)
          .toBeLessThanOrEqual(4 * totals[0].mount + 1);
        expect
          .soft(totals[1].write)
          .toBeLessThanOrEqual(4 * totals[0].write + 1);
      }
    }
  },
  60_000,
);

it.each(['record', 'skip', 'shadow'] as const)(
  '%s: folded watch unions preserve mixed, multiple-index and presence reads',
  (mode) => {
    gateWheelEvaluation.mode = mode;
    for (const expression of [
      '../../0/active === true && (../../)?.length > 0',
      '../../0/active === true && ../../1/active === true',
      '../../0/active === true',
    ]) {
      const schema = readerSchema(expression, {
        enabled: { type: 'boolean' },
        active: {
          type: 'boolean',
          controls: { active: '../enabled === true' },
        },
      });
      const value = {
        items: [
          { enabled: true, active: true, name: 'A' },
          { enabled: true, active: true, name: 'B' },
        ],
      };
      const root = mountPresenceTree(schema, value);
      for (const index of [0, 1])
        for (const enabled of [false, true]) {
          dispatchSetValue(
            getDispatchNode(root, 'items', String(index), 'enabled'),
            enabled,
          );
          const expected = mountPresenceTree(schema, {
            items: value.items.map((entry, position) =>
              position === index ? { ...entry, enabled } : entry,
            ),
          });
          expect(observePresenceTree(root)).toEqual(
            observePresenceTree(expected),
          );
        }
    }
  },
);

it('a whole-array state reader below its registering host stays on the exclusion chain', () => {
  gateWheelEvaluation.mode = 'record';
  const latest = capturePresenceContext();
  const schema = readerSchema('../active === true', {
    state: {
      type: 'string',
      controls: { visible: '(../../)?.[0]?.name !== undefined' },
    },
  });
  const value = { items: [{ active: true, name: 'N', state: 'S' }] };
  const root = mountPresenceTree(schema, value);
  for (const active of [false, true]) {
    dispatchSetValue(getDispatchNode(root, 'items', '0', 'active'), active);
    const computes = latest()?.presenceMetrics?.computes.get('/items/0/state');
    expect(computes).toBe(1);
    const expected = mountPresenceTree(schema, {
      items: [{ ...value.items[0], active }],
    });
    expect(observePresenceTree(root)).toEqual(observePresenceTree(expected));
  }
});
