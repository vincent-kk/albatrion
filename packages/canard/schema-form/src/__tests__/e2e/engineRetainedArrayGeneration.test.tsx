import { expect, it } from 'vitest';

import { ValidationMode } from '../../index';
import { SetValueOption as WriteOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it('does not bring a retired candidate into a newly grown array position', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        kind: { type: 'string' },
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
            z: { type: 'string' },
            list: {
              type: 'array',
              allOf: [
                {
                  controls: { active: '/kind === "text"' },
                  items: { type: 'string' },
                },
                {
                  controls: { active: '/kind === "number"' },
                  items: { type: 'number' },
                },
              ],
            },
          },
        },
        finish: {
          type: 'boolean',
          controls: {
            derived: '/o/z === "middle" ? true : /finish',
            injectTo: (value) =>
              value ? { '../o/list': ['latest'], '../on': false } : {},
          },
        },
      },
    },
    defaultValue: { on: true, kind: 'number', o: { list: [7] } },
    validationMode: ValidationMode.None,
  });
  const old = root.find('/o/list/0')!;
  root.find('/kind')!.setValue('text');
  root.find('/kind')!.setValue('number');
  expect(root.find('/o/list/0')!.value).toBe(7);
  root.find('/kind')!.setValue('text');
  root.find('/start')!.setValue(true);
  expect(root.inactiveValues).toContainEqual({
    path: '/o/list',
    value: ['latest'],
  });
  expect(root.inactiveValues).not.toContainEqual({
    path: '/o/list/0',
    value: 7,
  });
  root.setValue({ on: true, kind: 'number' }, WriteOption.Merge);
  expect(root.find('/o/list/0')!.value).toBeUndefined();
  expect(old.value).toBe(7);
});
