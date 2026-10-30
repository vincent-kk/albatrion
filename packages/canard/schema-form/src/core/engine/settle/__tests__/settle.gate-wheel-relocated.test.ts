import { expect, it, vi } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import { dirtyChildren } from '../utils/compute/dirtyChildren';
import * as predicate from '../utils/gates/canSkipGateWheel';
import type { gateSelectionCases } from './fixtures/gateSelectionCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

it.each(['record', 'skip', 'shadow'] as const)(
  '%s: relocated child follows a value-only write after its host was located',
  (mode) => {
    const previousMode = engineModes.gateWheel;
    try {
      runGateSelectionCase(
        {
          name: 'value-only change after relocated host locate',
          schema: {
            type: 'object',
            properties: {
              mode: { type: 'string' },
              p: {
                type: 'object',
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
          input: { mode: 'x', p: { child: 'P' } },
          writes: [{ path: '/later', value: true }],
        },
        () => {
          engineModes.setMode('gateWheel', mode);
        },
        (root) =>
          expect(root.structure?.p?.structure?.child !== undefined).toBe(
            root.structure?.later?.emit === true,
          ),
      );
    } finally {
      engineModes.setMode('gateWheel', previousMode);
    }
  },
);

it.each(['record', 'skip', 'shadow'] as const)(
  '%s: relocated declaring-host reader follows a sibling gate that flips mid-round',
  (mode) => {
    const previousMode = engineModes.gateWheel;
    try {
      runGateSelectionCase(
        {
          name: 'declaring-host reader after a mid-round sibling gate flip',
          schema: {
            type: 'object',
            properties: {
              X: {
                type: 'object',
                properties: {
                  current: {
                    type: 'object',
                    properties: {
                      b: { type: 'string' },
                      a: {
                        type: 'string',
                        controls: {
                          active: '(#/X)?.current?.b === "B"',
                        },
                      },
                      reader: {
                        type: 'string',
                        controls: {
                          active: '(#/X)?.current?.a === "A"',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          input: { X: { current: { b: 'no', a: 'A' } } },
          writes: [{ path: '/X/current/b', value: 'B' }],
        },
        () => {
          engineModes.setMode('gateWheel', mode);
        },
        (root) => {
          const current = root.structure?.X?.structure?.current;
          expect(current?.structure?.reader !== undefined).toBe(
            current?.structure?.a?.emit === 'A',
          );
        },
      );
    } finally {
      engineModes.setMode('gateWheel', previousMode);
    }
  },
);

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
    const previousMode = engineModes.gateWheel;
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
    const run = (mode: typeof engineModes.gateWheel) =>
      runGateSelectionCase(
        fixture,
        () => {
          engineModes.setMode('gateWheel', mode);
        },
        (root) => {
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
          engineModes.setMode('gateWheel', 'record');
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
      engineModes.setMode('gateWheel', previousMode);
    }
  },
);
