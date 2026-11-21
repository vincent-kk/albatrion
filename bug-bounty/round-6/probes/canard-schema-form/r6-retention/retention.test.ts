import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

// Bounty probes use the same mounted source engine as Form, then public node methods.
it.each(['string', 'array', 'object'] as const)(
  'an explicit undefined clears an inactive %s before its parent exits',
  (kind) => {
    const initial = kind === 'string' ? 'old' : kind === 'array' ? ['old'] : { y: 'old' };
    const leaf: any = kind === 'string' ? { type: 'string' } : kind === 'array'
      ? { type: 'array', items: { type: 'string' } }
      : { type: 'object', properties: { y: { type: 'string' } } };
    const run = (route: 'own' | 'parent') => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object', properties: {
            on: { type: 'boolean' }, hold: { type: 'boolean' },
            start: { type: 'boolean', controls: { injectTo: (v) => v
              ? { ...(route === 'own' ? { '../o/held': undefined } : { '../o': { held: undefined } }), '../on': false }
              : {} } },
            o: { type: 'object', controls: { active: '/on === true' }, properties: {
              held: { ...leaf, controls: { active: '/hold === true' } },
            } },
          },
        },
        defaultValue: { on: true, hold: true, o: { held: initial } },
        validationMode: ValidationMode.None,
      });
      root.find('/hold')!.setValue(false);
      root.find('/start')!.setValue(true);
      root.setValue({ on: true, hold: true }, WriteOption.Merge);
      return root.find('/o/held')!.value;
    };
    expect(run('own')).toBeUndefined();
    expect(run('parent')).toBeUndefined();
  },
);

it.each(['oneOf', 'anyOf', 'allOf'] as const)(
  'a grown second %s item retains the named candidate rather than the retired candidate',
  (keyword) => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: {
        on: { type: 'boolean' }, kind: { type: 'string' },
        start: { type: 'boolean', controls: { injectTo: (v) => v ? { '../o/list': [] } : {} } },
        o: { type: 'object', controls: { active: '/on === true' }, properties: {
          list: { type: 'array', items: { type: 'object', [keyword]: [
            { controls: { active: '/kind === "text"' }, properties: { y: { type: 'string' } } },
            { controls: { active: '/kind === "number"' }, properties: { y: { type: 'number' } } },
          ] } },
        } },
        finish: { type: 'boolean', controls: {
          derived: '/start === true && /o/list.length === 0 ? true : /finish',
          injectTo: (v) => v ? { '../o/list': [{ y: 42 }], '../on': false } : {},
        } },
      } } as any,
      defaultValue: { on: true, kind: 'number', o: { list: [{ y: 7 }] } },
      validationMode: ValidationMode.None,
    });
    root.find('/start')!.setValue(true);
    root.setValue({ on: true }, WriteOption.Merge);
    expect(root.find('/o/list/0/y')?.value).toBe(42);
  },
);

it.each(['default', 'const'] as const)(
  'a %s fill is not retained over the pre-write source when its container exits',
  (fill) => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: {
        on: { type: 'boolean' },
        start: { type: 'boolean', controls: { injectTo: (v) => v ? { '../o': { z: 'middle' } } : {} } },
        o: { type: 'object', controls: { active: '/on === true' }, properties: {
          z: { type: 'string' },
          y: { type: 'string', ...(fill === 'default' ? { default: 'fill' } : {}) },
        }, ...(fill === 'const' ? { allOf: [{ properties: { y: { const: 'fill' } } }] } : {}) },
        finish: { type: 'boolean', controls: {
          derived: '/o/z === "middle" ? true : /finish',
          injectTo: (v) => v ? { '../on': false } : {},
        } },
      } },
      defaultValue: { on: true, o: { y: 'old' } },
      validationMode: ValidationMode.None,
    });
    const boundary = root.find('/o/y')!.value;
    root.find('/start')!.setValue(true);
    expect(root.inactiveValues).toContainEqual({ path: '/o/y', value: boundary });
  },
);
