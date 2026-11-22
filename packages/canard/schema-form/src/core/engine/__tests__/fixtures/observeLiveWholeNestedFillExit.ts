import { vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';
import type { FORMS, TARGETS } from './liveWholeCases';

/** Observe a filled object or array ancestor when a named descendant leaves. */
export const observeLiveWholeNestedFillExit = (
  shape: 'object' | 'array parent' | 'array descendant' | 'inactive slot',
  target: (typeof TARGETS)[number],
  form: (typeof FORMS)[number],
) => {
  const array = shape === 'array parent';
  const arrayDescendant = shape === 'array descendant';
  const valueAtY = (value: string) => (arrayDescendant ? [value] : value);
  const base = array ? '/o/0' : '/o';
  const y = base + '/n/m/y';
  const pack = (value: {
    z: string;
    n?: { m: { y: string | string[]; held?: string } };
  }) => (array ? [value] : value);
  const whole = (value: ReturnType<typeof pack>) =>
    target === 'virtual' ? { '../group': [value] } : { '../o': value };
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
              y: arrayDescendant
                ? { type: 'array', items: { type: 'string' } }
                : { type: 'string' },
              ...(shape === 'inactive slot'
                ? {
                    held: {
                      type: 'string',
                      controls: { active: '/hold === true' },
                    },
                  }
                : {}),
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
          injectTo: (value) => (value ? whole(pack({ z: 'mid' })) : {}),
        },
      },
      o: array
        ? { type: 'array', items: item, controls: { active: '/on === true' } }
        : { ...item, controls: { active: '/on === true' } },
      end: {
        type: 'string',
        controls: {
          derived: `${base}/z === "mid" ? "closed" : /end`,
          injectTo: (value) =>
            value === 'closed'
              ? {
                  '../on': false,
                  ...(target === 'own path'
                    ? { ['..' + y]: valueAtY('latest') }
                    : whole(
                        pack({ z: 'mid', n: { m: { y: valueAtY('latest') } } }),
                      )),
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
      o: pack({
        z: 'z0',
        n: {
          m: {
            y: valueAtY('y0'),
            ...(shape === 'inactive slot' ? { held: 'held0' } : {}),
          },
        },
      }),
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
