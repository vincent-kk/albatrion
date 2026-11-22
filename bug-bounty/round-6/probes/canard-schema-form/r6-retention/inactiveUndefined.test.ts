import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { SetValueOption, ValidationMode } from '@/schema-form';

it.each([false, true])('a nested undefined from a parent write clears the inactive slot, close=%s', (close) => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: {
      on: { type: 'boolean' }, hold: { type: 'boolean' },
      start: { type: 'boolean', controls: { injectTo: (value) => value ? {
        '../o': { held: undefined }, ...(close ? { '../on': false } : {}),
      } : {} } },
      o: { type: 'object', controls: { active: '/on === true' }, properties: {
        held: { type: 'string', controls: { active: '/hold === true' } },
      } },
    } },
    defaultValue: { on: true, hold: true, o: { held: 'old' } },
    validationMode: ValidationMode.None,
  });
  root.find('/hold')!.setValue(false);
  root.find('/start')!.setValue(true);
  expect(root.inactiveValues).not.toContainEqual({ path: '/o/held', value: 'old' });
  root.setValue({ on: true, hold: true }, SetValueOption.Merge);
  expect(root.find('/o/held')!.value).toBeUndefined();
});
