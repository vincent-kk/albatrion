import { afterEach, describe, expect, it } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchContextChange, dispatchSetValue } from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import {
  presenceCousinSchema,
  presenceGapSchemas,
  presenceHost,
  presenceRelocatedSchema,
  presenceStateSchema,
} from './fixtures/presenceReaderCases';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

/** Regression records run the same assertion history in every wheel mode. */
const previousMode = engineModes.gateWheel;
afterEach(() => {
  engineModes.setMode('gateWheel', previousMode);
});

describe.each(['record', 'skip', 'shadow'] as const)(
  'presence readers: %s',
  (mode) => {
    it('oneOf and property readers agree with fresh mounts with and without defaults', () => {
      engineModes.setMode('gateWheel', mode);
      for (const oneOf of [false, true])
        for (const withDefault of [false, true]) {
          const schema: BlueprintSchema = {
            type: 'object',
            properties: {
              h: presenceHost(withDefault),
              ...(!oneOf
                ? {
                    z: {
                      type: 'string',
                      controls: { active: "../h/c === 'x'" },
                    },
                  }
                : {}),
            },
            ...(oneOf
              ? {
                  oneOf: [
                    {
                      controls: { active: "./h/c === 'x'" },
                      properties: { z: { type: 'string' } },
                    },
                  ],
                }
              : {}),
          };
          for (const start of ['on', 'off']) {
            const root = mountPresenceTree(schema, { h: { t: start, c: 'x' } });
            for (const t of [start === 'on' ? 'off' : 'on', start]) {
              dispatchSetValue(getDispatchNode(root, 'h', 't'), t);
              expect(observePresenceTree(root)).toEqual(
                observePresenceTree(
                  mountPresenceTree(schema, { h: { t, c: 'x' } }),
                ),
              );
            }
          }
        }
    });

    it('non-root, array, visible and ancestor readers follow both directions', () => {
      engineModes.setMode('gateWheel', mode);
      for (const shape of [
        'nested',
        'array',
        'visible',
        'ancestor',
        'derived',
      ]) {
        const schema: BlueprintSchema =
          shape === 'nested'
            ? {
                type: 'object',
                properties: {
                  a: {
                    type: 'object',
                    properties: {
                      h: presenceHost(),
                      z: {
                        type: 'string',
                        controls: { active: "../h/c === 'x'" },
                      },
                    },
                  },
                },
              }
            : shape === 'array'
              ? {
                  type: 'object',
                  properties: {
                    list: { type: 'array', items: presenceHost() },
                    z: {
                      type: 'string',
                      controls: { active: "../list/0/c === 'x'" },
                    },
                  },
                }
              : {
                  type: 'object',
                  properties: {
                    h: presenceHost(),
                    z: {
                      type: 'string',
                      default: 'Z',
                      controls:
                        shape === 'visible'
                          ? { visible: "../h/c === 'x'" }
                          : shape === 'derived'
                            ? { derived: '../h/c' }
                            : { active: "(../h).c === 'x'" },
                    },
                  },
                };
        const value = (t: string) =>
          shape === 'nested'
            ? { a: { h: { t, c: 'x' } } }
            : shape === 'array'
              ? { list: [{ t, c: 'x' }] }
              : { h: { t, c: 'x' } };
        for (const start of ['on', 'off']) {
          const root = mountPresenceTree(schema, value(start));
          for (const t of [start === 'on' ? 'off' : 'on', start]) {
            dispatchSetValue(
              getDispatchNode(
                root,
                ...(shape === 'nested'
                  ? ['a', 'h', 't']
                  : shape === 'array'
                    ? ['list', '0', 't']
                    : ['h', 't']),
              ),
              t,
            );
            expect(observePresenceTree(root)).toEqual(
              observePresenceTree(mountPresenceTree(schema, value(t))),
            );
          }
        }
      }
    });

    it('same-host relocated readers follow presence changes', () => {
      engineModes.setMode('gateWheel', mode);
      const value = (value: string) => ({
        current: { value, primer: 'ready' },
      });
      const root = mountPresenceTree(presenceRelocatedSchema, value('idle'));
      for (const next of ['in-progress', 'idle', 'in-progress']) {
        dispatchSetValue(getDispatchNode(root, 'current', 'value'), next);
        expect(observePresenceTree(root)).toEqual(
          observePresenceTree(
            mountPresenceTree(presenceRelocatedSchema, value(next)),
          ),
        );
      }
    });

    it('late cousin exists on a fresh mount and after an update', () => {
      engineModes.setMode('gateWheel', mode);
      const value = (mode: string) => ({
        mode,
        p: { child: 'P' },
        later: true,
      });
      const root = mountPresenceTree(presenceCousinSchema, value('y'));
      dispatchSetValue(getDispatchNode(root, 'mode'), 'x');
      const fresh = mountPresenceTree(presenceCousinSchema, value('x'));
      expect(getDispatchNode(root, 'p', 'child').emit).toEqual('P');
      expect(getDispatchNode(fresh, 'p', 'child').emit).toEqual('P');
      expect(observePresenceTree(root)).toEqual(observePresenceTree(fresh));
    });

    it('retains registration across both prior-child and entered-child wheel gaps', () => {
      engineModes.setMode('gateWheel', mode);
      for (const schema of presenceGapSchemas) {
        const value = (t: string) => ({
          h: { t, c: 'C', n: 'N', d: 'D', e: 'E', f: 'F' },
        });
        const root = mountPresenceTree(schema, value('off'));
        for (const t of ['on', 'off', 'on']) {
          dispatchSetValue(getDispatchNode(root, 'h', 't'), t);
          expect(observePresenceTree(root)).toEqual(
            observePresenceTree(mountPresenceTree(schema, value(t))),
          );
        }
      }
    });

    it('state-key ancestor readers evaluate the final emitted tree', () => {
      engineModes.setMode('gateWheel', mode);
      const value = (k: number) => ({ k, h: { p: 'P' } });
      const root = mountPresenceTree(presenceStateSchema, value(1));
      for (const k of [2, 1]) {
        dispatchSetValue(getDispatchNode(root, 'k'), k);
        expect(observePresenceTree(root)).toEqual(
          observePresenceTree(mountPresenceTree(presenceStateSchema, value(k))),
        );
      }
    });

    it('setContext presence changes re-evaluate other gates in both directions', () => {
      engineModes.setMode('gateWheel', mode);
      const schema: BlueprintSchema = {
        type: 'object',
        properties: {
          h: {
            type: 'object',
            properties: {
              c: { type: 'string', controls: { active: '(@).on === true' } },
            },
          },
          z: {
            type: 'string',
            default: 'Z',
            controls: { active: "../h/c === 'x'" },
          },
        },
      };
      const value = { h: { c: 'x' } };
      for (const start of [true, false]) {
        const root = mountPresenceTree(schema, value, { on: start });
        for (const on of [!start, start]) {
          dispatchContextChange(root, { on });
          expect(observePresenceTree(root)).toEqual(
            observePresenceTree(mountPresenceTree(schema, value, { on })),
          );
        }
      }
    });
  },
);
