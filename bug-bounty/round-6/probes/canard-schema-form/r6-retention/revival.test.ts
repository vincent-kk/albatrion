import { expect, it, vi } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { SetValueOption, ValidationMode } from '@/schema-form';

it.each(['own', 'parent', 'virtual'] as const)(
  '%s array write survives revival and second exit with empty or defined resolver output',
  (route) => {
    for (const batch of [false, true]) for (const resolved of [undefined, ['resolved']]) for (const clear of [false, true]) {
      const root = nodeFromJSONSchema({
        jsonSchema: { type: 'object', options: { virtual: { group: { fields: ['o'] } } }, properties: {
          on: { type: 'boolean' },
          source: { type: 'boolean', controls: { injectTo: (value) => !value ? {} :
            route === 'own' ? { '../o/y': ['new'] } :
            route === 'parent' ? { '../o': { y: ['new'] } } : { '../group': [{ y: ['new'] }] },
          } },
          o: { type: 'object', controls: { active: '/on === true' }, properties: {
            y: { type: 'array', items: { type: 'string' }, controls: { unsetOnInactive: clear } },
          } },
          reopen: { type: 'boolean', controls: { injectTo: (value) => value ? { '../on': true } : {} } },
          close: { type: 'boolean', controls: {
            derived: '/o/y/0 === "new" ? true : /close',
            injectTo: (value) => value ? { '../on': false } : {},
          } },
        } },
        defaultValue: { on: true, o: { y: ['old'] } },
        validationMode: ValidationMode.None,
      });
      const resolver = vi.fn(() => resolved);
      root.find('/o/y')!.onInactive(resolver);
      if (batch) root.batch(() => {
        root.find('/on')!.setValue(false);
        root.find('/source')!.setValue(true);
        root.find('/reopen')!.setValue(true);
      });
      else root.setValue({ on: false, source: true, reopen: true }, SetValueOption.Merge);
      expect(root.find('/on')!.value).toBe(false);
      expect(root.find('/close')!.value).toBe(true);
      expect(root.inactiveValues).toContainEqual({ path: '/o/y', value: ['new'] });
      expect(resolver).toHaveBeenCalledTimes(clear ? 0 : 1);
      root.setValue({ on: true }, SetValueOption.Merge | SetValueOption.DisableAutomaticWrites);
      expect(root.find('/o/y')!.value).toEqual(['new']);
    }
  },
);
