import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';

it('uses an accepted unset when its working value already matches an omission', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        start: {
          type: 'boolean',
          controls: {
            injectTo: (value) => (value ? { '../o': { z: 'middle' } } : {}),
          },
        },
        o: {
          type: 'object',
          controls: { active: '/on === true' },
          properties: {
            y: {
              type: 'string',
              controls: { unsetValue: '/o/z === "middle"' },
            },
            z: { type: 'string' },
          },
        },
        close: {
          type: 'boolean',
          controls: {
            derived: '/o/z === "middle" ? true : /close',
            injectTo: (value) => (value ? { '../on': false } : {}),
          },
        },
      },
    },
    defaultValue: { on: true, o: { y: 'initial', z: 'initial' } },
    validationMode: ValidationMode.None,
  });
  const listener = vi.fn();
  root.subscribe(listener);
  root.find('/start')!.setValue(true);
  expect(root.value).toEqual({ on: false, start: true, close: true });
  expect(root.inactiveValues).toEqual([{ path: '/o/z', value: 'middle' }]);
  expect(listener).toHaveBeenCalledOnce();
});
