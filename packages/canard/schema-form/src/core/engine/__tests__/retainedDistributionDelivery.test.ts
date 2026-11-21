import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { FieldNodeEventType } from '../record';
import { ValidationMode } from '../types/state';
import { FieldNodeWriteKind, WriteOption } from '../types/value';

it('keeps caller delivery provenance when a rule updates a covered inactive slot', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        o: {
          type: 'object',
          properties: {
            shown: { type: 'string' },
            held: { type: 'string', controls: { active: '/open === true' } },
          },
        },
        source: {
          type: 'string',
          controls: {
            injectTo: (value) =>
              typeof value === 'string' ? { '../o/held': value } : {},
          },
        },
      },
    },
    defaultValue: { open: false, o: { shown: 'old', held: 'held0' } },
    validationMode: ValidationMode.None,
  });
  const listener = vi.fn();
  root.find('/o')!.subscribe(listener);
  root.setValue(
    { o: { shown: 'caller', held: 'covered' }, source: 'rule' },
    WriteOption.Merge,
  );
  expect(root.find('/o')!.value).toEqual({ shown: 'caller' });
  expect(root.inactiveValues).toEqual([{ path: '/o/held', value: 'rule' }]);
  expect(listener).toHaveBeenCalledOnce();
  expect(
    listener.mock.lastCall?.[0].options[FieldNodeEventType.UpdateValue],
  ).toEqual({ source: FieldNodeWriteKind.CallerPartial });
});
