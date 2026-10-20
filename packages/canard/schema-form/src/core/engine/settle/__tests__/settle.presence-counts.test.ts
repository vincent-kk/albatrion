import { afterEach, expect, it, vi } from 'vitest';

import type { DispatchTestNode } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchSetValue } from '../../write';
import type { SettlementContext } from '../types/settlement';
import * as registration from '../utils/dependencies/registerPresenceChanges';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import * as settlement from '../utils/settlement/createSettlementContext';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { presenceHost } from './fixtures/presenceReaderCases';
import { mountPresenceTree } from './helpers/mountPresenceTree';

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
                location !== host.path &&
                (host.path.startsWith(location + '/') || location === '')
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
