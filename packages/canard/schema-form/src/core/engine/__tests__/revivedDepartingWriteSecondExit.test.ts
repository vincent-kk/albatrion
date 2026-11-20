import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

type Root = ReturnType<typeof nodeFromJSONSchema>;
type Target = 'own path' | 'parent object' | 'virtual group';
type Policy = 'default' | 'unsetOnInactive' | 'inactiveValue' | 'onInactive';

/** A source writes a fixed value when given a nonempty input. */
const inject = (target: string, value: unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) => (source ? { [target]: value } : {}),
  },
});

/** The first gate closes in caller compute, then two separate reactions reopen and close it. */
const createSchema = (target: Target, policy: Policy): AuthoredSchema => ({
  type: 'object',
  options: { virtual: { group: { fields: ['o'] } } },
  properties: {
    on: { type: 'boolean' },
    src:
      target === 'own path'
        ? inject('../o/y', 'new')
        : target === 'parent object'
          ? inject('../o', { y: 'new' })
          : inject('../group', [{ y: 'new' }]),
    o: {
      type: 'object',
      controls: { active: '/on === true' },
      properties: {
        y: {
          type: 'string',
          controls:
            policy === 'unsetOnInactive'
              ? { unsetOnInactive: true }
              : policy === 'inactiveValue'
                ? { inactiveValue: 'resolved' }
                : {},
        },
      },
    },
    reopen: inject('../on', true),
    closeAgain: {
      type: 'string',
      controls: {
        derived: '/o/y === "new" ? "closed" : /closeAgain',
        injectTo: (value: unknown) =>
          value === 'closed' ? { '../on': false } : {},
      },
    },
  },
});

const CALLER_VALUES = { on: false, src: 's', reopen: 'r' };

/** Write the same caller values through the individual fields of the batch. */
const writeFields = (root: Root) => {
  for (const [key, value] of Object.entries(CALLER_VALUES))
    root.find('/' + key)!.setValue(value);
};

const FORMS = [
  [
    'one Merge',
    (root: Root) => root.setValue(CALLER_VALUES, WriteOption.Merge),
  ],
  ['batch', (root: Root) => root.batch(() => writeFields(root))],
  [
    'nested batch',
    (root: Root) => root.batch(() => root.batch(() => writeFields(root))),
  ],
] as const;

/** Observe the retained write, the gate, and any settlement diagnostics. */
const observe = (
  target: Target,
  policy: Policy,
  write: (root: Root) => void,
) => {
  const report = vi.fn();
  const resolver = vi.fn(() => 'resolved');
  const root = nodeFromJSONSchema({
    jsonSchema: createSchema(target, policy),
    defaultValue: { on: true, o: { y: 'y0' } },
    validationMode: ValidationMode.None,
    errorReporter: { hasConsumer: () => true, report },
  });
  if (policy === 'onInactive') root.find('/o/y')!.onInactive(resolver);
  write(root);
  return {
    on: root.find('/on')!.value,
    closeAgain: root.find('/closeAgain')!.value,
    retained: Object.fromEntries(
      root.inactiveValues.map(({ path, value }) => [path, value]),
    ),
    resolverCalls: resolver.mock.calls.length,
    diagnostics: report.mock.calls,
  };
};

it.each(['default', 'unsetOnInactive', 'inactiveValue', 'onInactive'] as const)(
  'retains the revived declarative value on the second exit under %s',
  (policy) => {
    for (const [form, write] of FORMS) {
      const ownPath = observe('own path', policy, write);
      expect.soft(ownPath, `${form}, own path`).toEqual({
        on: false,
        closeAgain: 'closed',
        retained: { '/o/y': 'new' },
        resolverCalls: policy === 'onInactive' ? 1 : 0,
        diagnostics: [],
      });
      for (const target of ['parent object', 'virtual group'] as const)
        expect
          .soft(observe(target, policy, write), `${form}, ${target}`)
          .toEqual(ownPath);
    }
  },
);
