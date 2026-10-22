import { expect, it, vi } from 'vitest';

import { dirtyChildren } from '../utils/compute/dirtyChildren';
import { getStaticGateList } from '../utils/compute/utils/getStaticGateList';
import * as predicate from '../utils/gates/canSkipGateWheel';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import type { gateSelectionCases } from './fixtures/gateSelectionCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

it.each([false, true])(
  'real relocated child with newly gated host=%s retains its next wheel',
  (newHost) => {
    const fixture: (typeof gateSelectionCases)[number] = {
      name: `late projected key, new host=${newHost}`,
      schema: {
        type: 'object',
        properties: {
          mode: { type: 'string' },
          p: {
            type: 'object',
            ...(newHost ? { controls: { active: '../mode === "x"' } } : {}),
            properties: {
              child: {
                type: 'string',
                controls: { active: '#/later === true' },
              },
            },
          },
        },
        allOf: [
          {
            controls: { active: './mode === "x"' },
            properties: { later: { type: 'boolean' } },
          },
        ],
      },
      input: { mode: 'y', p: { child: 'P' }, later: true },
      writes: [{ path: '/mode', value: 'x' }],
    };
    const previousMode = gateWheelEvaluation.mode;
    const staticReferences = new WeakMap<
      object,
      { reference: readonly unknown[]; contents: readonly unknown[] }
    >();
    const original = predicate.canSkipGateWheel;
    const decisions: {
      host: string;
      round: number;
      allowed: boolean;
      added: boolean;
      dirty: string[];
    }[] = [];
    const proving = vi
      .spyOn(predicate, 'canSkipGateWheel')
      .mockImplementation((node, context, frame, round, cap, count) => {
        const allowed = original(node, context, frame, round, cap, count);
        decisions.push({
          host: node.path,
          round,
          allowed,
          added: count !== frame.gateCount,
          dirty: dirtyChildren(node, context).map((child) => child.path),
        });
        return allowed;
      });
    const run = (mode: typeof gateWheelEvaluation.mode) =>
      runGateSelectionCase(
        fixture,
        () => {
          gateWheelEvaluation.mode = mode;
        },
        (root) => {
          const staticList = getStaticGateList(root);
          const staticGates = staticList.gates.slice();
          const previousStatic = staticReferences.get(root);
          if (previousStatic) {
            expect(staticList.gates).toBe(previousStatic.reference);
            expect(staticList.gates).toEqual(previousStatic.contents);
          } else
            staticReferences.set(root, {
              reference: staticList.gates,
              contents: staticGates,
            });
          const registry = getGateRegistry(root.runtime);
          const locations = (
            registry as unknown as {
              byLocation: Map<string, Set<{ hostPath: string }>>;
            }
          ).byLocation;
          const expected = [...(locations.get('') ?? [])].filter(
            (entry) => entry.hostPath !== '',
          );
          const relocated = registry.relocated('');
          expect(relocated).toHaveLength(expected.length);
          relocated.forEach((entry, index) =>
            expect(entry).toBe(expected[index]),
          );
          expect(getStaticGateList(root).gates).toBe(staticList.gates);
          expect(staticList.gates).toEqual(staticGates);
          if (root.structure?.mode?.emit === 'x')
            expect(root.structure.p?.structure?.child?.emit).toBe('P');
          return [...(root.runtime.committedDeclarationIds ?? [])];
        },
      ).map((observation) => {
        const { visits: _visits, ...publication } = observation as {
          visits: unknown;
          [key: string]: unknown;
        };
        return publication;
      });
    try {
      runGateSelectionCase(
        {
          ...fixture,
          input: { mode: 'x', p: { child: 'P' }, later: true },
          writes: [],
        },
        () => {
          gateWheelEvaluation.mode = 'record';
        },
        (root) => expect(root.structure?.p?.structure?.child?.emit).toBe('P'),
      );
      const expected = run('record');
      decisions.length = 0;
      expect(run('skip')).toEqual(expected);
      console.log('relocated-attempt', newHost, JSON.stringify(decisions));
      expect(decisions).toContainEqual({
        host: '',
        round: 0,
        allowed: false,
        added: true,
        dirty: ['/p'],
      });
      expect(run('shadow')).toEqual(expected);
    } finally {
      proving.mockRestore();
      gateWheelEvaluation.mode = previousMode;
    }
  },
);
