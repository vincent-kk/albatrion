import { expect, it } from 'vitest';

import { ValidationMode } from '../../index';
import { SetValueOption as WriteOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it('lets a later live whole write replace a revived right to a named inactive child', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        show: { type: 'boolean' },
        write: {
          type: 'boolean',
          controls: {
            injectTo: (value) =>
              value ? { '../o': { y: 'revived', held: 'early' } } : {},
          },
        },
        reopen: {
          type: 'boolean',
          controls: {
            injectTo: (value) => (value ? { '../on': true } : {}),
          },
        },
        o: {
          type: 'object',
          controls: { active: '/on === true' },
          properties: {
            y: { type: 'string' },
            held: { type: 'string', controls: { active: '/show === true' } },
          },
        },
        finish: {
          type: 'boolean',
          controls: {
            derived: '/o/y === "revived" ? true : /finish',
            injectTo: (value) =>
              value
                ? { '../on': false, '../o': { y: 'latest', held: 'late' } }
                : {},
          },
        },
      },
    },
    defaultValue: { on: true, o: { y: 'old', held: 'held0' } },
    validationMode: ValidationMode.None,
  });
  root.setValue({ on: false, write: true, reopen: true }, WriteOption.Merge);
  expect(root.inactiveValues).toEqual([
    { path: '/o/y', value: 'latest' },
    { path: '/o/held', value: 'late' },
  ]);
});
