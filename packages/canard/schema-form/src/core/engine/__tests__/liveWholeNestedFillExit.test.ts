import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

const TARGETS = ['own path', 'parent', 'virtual'] as const;
const FORMS = ['Merge', 'batch', 'nested batch'] as const;
const SHAPES = [
  'object',
  'array parent',
  'array descendant',
  'inactive slot',
] as const;

/** Drop two nested object levels in a whole write, then name their live leaf and close the gate. */
const observe = (
  shape: (typeof SHAPES)[number],
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

it.each(SHAPES)('keeps a named grandchild under a filled %s', (shape) => {
  const expected = {
    value: { on: false, src: 's', end: 'closed' },
    retained:
      shape === 'array parent'
        ? { '/o': [{ z: 'mid', n: { m: { y: 'latest' } } }] }
        : {
            '/o/n/m/y': shape === 'array descendant' ? ['latest'] : 'latest',
            '/o/z': 'mid',
            ...(shape === 'inactive slot' ? { '/o/n/m/held': 'held0' } : {}),
          },
    diagnostics: [],
  };
  for (const target of TARGETS)
    for (const form of FORMS)
      expect
        .soft(observe(shape, target, form), `${target} / ${form}`)
        .toEqual(expected);
});
