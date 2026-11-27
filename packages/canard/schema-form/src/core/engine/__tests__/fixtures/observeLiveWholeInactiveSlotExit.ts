import { vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';
import type { FORMS, TARGETS } from './liveWholeCases';

/** Observe a held slot after omitting two ancestors, optionally naming it before exit. */
export const observeLiveWholeInactiveSlotExit = (
  heldInput: 'omitted' | 'named',
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
