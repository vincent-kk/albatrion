import { expect, it, vi } from 'vitest';

import { dirtyChildren } from '../utils/compute/dirtyChildren';
import * as predicate from '../utils/gates/canSkipGateWheel';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
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
        (root) => [...(root.runtime.committedDeclarationIds ?? [])],
      ).map((observation) => {
        const { visits: _visits, ...publication } = observation as {
          visits: unknown;
          [key: string]: unknown;
        };
        return publication;
      });
    try {
      const expected = run('record');
      decisions.length = 0;
      expect(run('skip')).toEqual(expected);
      console.log('relocated-attempt', newHost, JSON.stringify(decisions));
      expect(decisions).toContainEqual({
        host: '',
        round: 0,
        allowed: false,
        added: newHost,
        dirty: ['/p'],
      });
      expect(run('shadow')).toEqual(expected);
    } finally {
      proving.mockRestore();
      gateWheelEvaluation.mode = previousMode;
    }
  },
);
