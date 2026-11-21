import { vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';
import type { FORMS, POLICIES, TARGETS } from './liveWholeCases';

/** Observe which of two live writes supplies the named source to the exit policy. */
export const observeLiveWholeFillOrder = (
  policy: (typeof POLICIES)[number],
  order: 'omit then name' | 'name then omit',
  target: (typeof TARGETS)[number],
  form: (typeof FORMS)[number],
) => {
  const omitFirst = order === 'omit then name';
  const whole = (value: { y?: string; z: string }) =>
    target === 'virtual' ? { '../group': [value] } : { '../o': value };
  const name = (z: string) =>
    target === 'own path' ? { '../o/y': 'latest' } : whole({ y: 'latest', z });
  const schema: AuthoredSchema = {
    type: 'object',
    options: { virtual: { group: { fields: ['o'] } } },
    properties: {
      on: { type: 'boolean' },
      src: {
        type: 'string',
        controls: {
          injectTo: (value) =>
            value === 's' ? (omitFirst ? whole({ z: 'mid' }) : name('z0')) : {},
        },
      },
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
          z: { type: 'string' },
        },
      },
      end: {
        type: 'string',
        controls: {
          derived: omitFirst
            ? '/o/z === "mid" ? "closed" : /end'
            : '/o/y === "latest" ? "closed" : /end',
          injectTo: (value) =>
            value === 'closed'
              ? {
                  '../on': false,
                  ...(omitFirst ? name('mid') : whole({ z: 'mid' })),
                }
              : {},
        },
      },
    },
  };
  const report = vi.fn();
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { on: true, o: { y: 'y0', z: 'z0' } },
    validationMode: ValidationMode.None,
    errorReporter: { hasConsumer: () => true, report },
  });
  if (policy === 'onInactive') root.find('/o/y')!.onInactive(() => 'resolved');
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
