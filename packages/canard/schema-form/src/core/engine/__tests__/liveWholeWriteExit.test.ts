import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

type Target = 'own path' | 'parent' | 'virtual';
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue' | 'onInactive';
type Scenario =
  | 'single rule'
  | 'repeat exit'
  | 'omitted sibling'
  | 'nested object'
  | 'array parent'
  | 'schema default'
  | 'lower rank'
  | 'appearance fill'
  | 'caller';

const POLICIES = [
  'default',
  'unsetOnInactive',
  'inactiveValue',
  'onInactive',
] as const;
const TARGETS = ['own path', 'parent', 'virtual'] as const;
const FORMS = ['Merge', 'batch', 'nested batch'] as const;

const observe = (
  scenario: Scenario,
  target: Target,
  policy: Policy,
  form: (typeof FORMS)[number],
) => {
  const nested = scenario === 'nested object';
  const array = scenario === 'array parent';
  const omitted = scenario === 'omitted sibling';
  const address = array ? '/o/0' : nested ? '/o/n/m/y' : '/o/y';
  const pack = (y: string) =>
    array ? [y] : nested ? { n: { m: { y } } } : { y };
  const nameValue = (y: string) =>
    target === 'own path'
      ? { ['..' + address]: y }
      : target === 'parent'
        ? { '../o': pack(y) }
        : { '../group': [pack(y)] };
  const close = (y: string) => ({ '../on': false, ...nameValue(y) });
  const leaf: AuthoredSchema = {
    type: 'string',
    ...(scenario === 'schema default' ? { default: 'D' } : {}),
    controls:
      policy === 'unsetOnInactive'
        ? { unsetOnInactive: true }
        : policy === 'inactiveValue'
          ? { inactiveValue: 'resolved' }
          : {},
  };
  const appearance = scenario === 'appearance fill';
  const repeat = scenario === 'repeat exit';
  const ranked = scenario === 'lower rank';
  const caller = scenario === 'caller';
  const schema: AuthoredSchema = {
    type: 'object',
    options: { virtual: { group: { fields: ['o'] } } },
    properties: {
      on: { type: 'boolean' },
      ...(ranked
        ? {
            low: {
              type: 'string',
              controls: {
                derived: '/o/y === "latest" ? "low" : /low',
                injectTo: (value) => (value === 'low' ? close('lower') : {}),
              },
            },
          }
        : {}),
      src: {
        type: 'string',
        controls: {
          injectTo: (value) => {
            if (!value || appearance) return {};
            if (caller) return { '../on': false };
            if (repeat) return nameValue('new');
            return ranked ? nameValue('latest') : close('latest');
          },
        },
      },
      o: array
        ? { type: 'array', controls: { active: '/on === true' }, items: leaf }
        : {
            type: 'object',
            controls: { active: '/on === true' },
            properties: nested
              ? {
                  n: {
                    type: 'object',
                    properties: {
                      m: { type: 'object', properties: { y: leaf } },
                    },
                  },
                }
              : {
                  y: leaf,
                  ...(omitted ? { z: { type: 'string' } } : {}),
                  ...(appearance
                    ? {
                        z: {
                          type: 'object',
                          default: { x: 'D' },
                          controls: { active: '/src === "s"' },
                          properties: { x: { type: 'string' } },
                        },
                      }
                    : {}),
                },
          },
      ...(repeat
        ? {
            reopen: {
              type: 'string',
              controls: {
                injectTo: (value) => (value ? { '../on': true } : {}),
              },
            },
          }
        : {}),
      ...(repeat || appearance
        ? {
            closeAgain: {
              type: 'string',
              controls: {
                derived: repeat
                  ? '/o/y === "new" ? "closed" : /closeAgain'
                  : '/o/z/x === "D" ? "closed" : /closeAgain',
                injectTo: (value) =>
                  value === 'closed' ? close('latest') : {},
              },
            },
          }
        : {}),
    },
  };
  const report = vi.fn();
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: {
      on: true,
      o: omitted
        ? { y: 'y0', z: 'z0' }
        : scenario === 'schema default'
          ? {}
          : pack('y0'),
    },
    validationMode: ValidationMode.None,
    errorReporter: { hasConsumer: () => true, report },
  });
  if (policy === 'onInactive') root.find(address)!.onInactive(() => 'resolved');
  const fields = repeat ? { on: false, src: 's', reopen: 'r' } : { src: 's' };
  const writeFields = () => {
    if (caller) {
      if (target === 'own path') root.find(address)!.setValue('latest');
      else if (target === 'parent') root.find('/o')!.setValue(pack('latest'));
      else root.find('/group')!.setValue([pack('latest')]);
    }
    for (const [key, value] of Object.entries(fields))
      root.find('/' + key)!.setValue(value);
  };
  if (form === 'Merge')
    root.setValue(
      caller ? { ...fields, o: pack('latest') } : fields,
      WriteOption.Merge,
    );
  else if (form === 'batch') root.batch(writeFields);
  else root.batch(() => root.batch(writeFields));
  return {
    value: root.value,
    retained: root.inactiveValues,
    diagnostics: report.mock.calls,
  };
};

it.each(POLICIES)(
  'keeps named live values through an exit with %s policy',
  (policy) => {
    for (const scenario of ['single rule', 'repeat exit', 'caller'] as const) {
      const merged = observe(scenario, 'own path', policy, 'Merge');
      const value =
        policy === 'default' || scenario === 'caller' ? 'latest' : 'resolved';
      expect(merged.retained, scenario).toEqual(
        policy === 'unsetOnInactive' ? [] : [{ path: '/o/y', value }],
      );
      expect(merged.diagnostics).toEqual([]);
      for (const target of TARGETS)
        for (const form of FORMS)
          expect
            .soft(
              observe(scenario, target, policy, form),
              `${scenario} / ${target} / ${form}`,
            )
            .toEqual(merged);
    }
  },
);

it.each([
  'omitted sibling',
  'nested object',
  'array parent',
  'schema default',
  'lower rank',
  'appearance fill',
] as const)('keeps path and settlement parity for %s', (scenario) => {
  const merged = observe(scenario, 'own path', 'default', 'Merge');
  const path =
    scenario === 'nested object'
      ? '/o/n/m/y'
      : scenario === 'array parent'
        ? '/o'
        : '/o/y';
  expect(merged.retained).toEqual([
    {
      path,
      value:
        scenario === 'array parent'
          ? ['latest']
          : scenario === 'lower rank'
            ? 'lower'
            : 'latest',
    },
    ...(scenario === 'omitted sibling' ? [{ path: '/o/z', value: 'z0' }] : []),
  ]);
  expect(merged.diagnostics).toEqual([]);
  for (const target of TARGETS)
    for (const form of FORMS)
      expect
        .soft(observe(scenario, target, 'default', form), `${target} / ${form}`)
        .toEqual(merged);
});
