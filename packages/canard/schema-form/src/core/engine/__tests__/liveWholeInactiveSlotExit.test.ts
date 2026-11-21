import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

const TARGETS = ['own path', 'parent', 'virtual'] as const;
const FORMS = ['Merge', 'batch', 'nested batch'] as const;
const HELD_INPUTS = ['omitted', 'named'] as const;

/** Drop two levels in a whole write, then close while writing under them. */
const observe = (
  heldInput: (typeof HELD_INPUTS)[number],
  target: (typeof TARGETS)[number],
  form: (typeof FORMS)[number],
) => {
  const namesHeld = heldInput === 'named';
  const whole = (value: {
    z: string;
    n?: { m: { y: string; held?: string } };
  }) => (target === 'virtual' ? { '../group': [value] } : { '../o': value });
  const item: AuthoredSchema = {
    type: 'object',
    properties: {
      z: { type: 'string' },
      n: {
        type: 'object',
        properties: {
          m: {
            type: 'object',
            properties: {
              y: { type: 'string' },
              held: {
                type: 'string',
                controls: { active: '/hold === true' },
              },
            },
          },
        },
      },
    },
  };
  const schema: AuthoredSchema = {
    type: 'object',
    options: { virtual: { group: { fields: ['o'] } } },
    properties: {
      on: { type: 'boolean' },
      hold: { type: 'boolean' },
      src: {
        type: 'string',
        controls: {
          injectTo: (value) => (value ? whole({ z: 'mid' }) : {}),
        },
      },
      o: { ...item, controls: { active: '/on === true' } },
      end: {
        type: 'string',
        controls: {
          derived: '/o/z === "mid" ? "closed" : /end',
          injectTo: (value) =>
            value === 'closed'
              ? {
                  '../on': false,
                  ...(target === 'own path'
                    ? {
                        '../o/n/m/y': 'latest',
                        ...(namesHeld ? { '../o/n/m/held': 'held1' } : {}),
                      }
                    : whole({
                        z: 'mid',
                        n: {
                          m: {
                            y: 'latest',
                            ...(namesHeld ? { held: 'held1' } : {}),
                          },
                        },
                      })),
                }
              : {},
        },
      },
    },
  };
  const report = vi.fn();
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: {
      on: true,
      o: {
        z: 'z0',
        n: {
          m: {
            y: 'y0',
            held: 'held0',
          },
        },
      },
    },
    validationMode: ValidationMode.None,
    errorReporter: { hasConsumer: () => true, report },
  });
  const write = () => root.find('/src')!.setValue('s');
  if (form === 'Merge') root.setValue({ src: 's' }, WriteOption.Merge);
  else if (form === 'batch') root.batch(write);
  else root.batch(() => root.batch(write));
  return {
    value: root.value,
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
    diagnostics: report.mock.calls,
  };
};

it.each(HELD_INPUTS)(
  'retains the source of an inactive slot that is %s',
  (heldInput) => {
    const expected = {
      value: { on: false, src: 's', end: 'closed' },
      retained: {
        '/o/n/m/y': 'latest',
        '/o/z': 'mid',
        '/o/n/m/held': heldInput === 'named' ? 'held1' : 'held0',
      },
      diagnostics: [],
    };
    for (const target of TARGETS)
      for (const form of FORMS)
        expect
          .soft(observe(heldInput, target, form), `${target} / ${form}`)
          .toEqual(expected);
  },
);
