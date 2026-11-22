import { expect, it } from 'vitest';

import { ValidationMode } from '../../index';
import { SetValueOption as WriteOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it('keeps a revived right when a different candidate later owns the same path', () => {
  const root = mountEngineForm({
    jsonSchema: {
      type: 'object',
      properties: {
        on: { type: 'boolean' },
        kind: { type: 'string' },
        write: {
          type: 'boolean',
          controls: {
            injectTo: (value) => (value ? { '../o/y': 'named' } : {}),
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
          oneOf: [
            {
              controls: { active: '/kind === "text"' },
              properties: {
                y: { type: 'string', controls: { unsetOnInactive: true } },
              },
            },
            {
              controls: { active: '/kind === "number"' },
              properties: { y: { type: 'number' } },
            },
          ],
        },
        switchKind: {
          type: 'boolean',
          controls: {
            derived: '/o/y === "named" ? true : /switchKind',
            injectTo: (value) => (value ? { '../kind': 'number' } : {}),
          },
        },
        closeAgain: {
          type: 'boolean',
          controls: {
            derived: '/kind === "number" ? true : /closeAgain',
            injectTo: (value) => (value ? { '../o/y': 7, '../on': false } : {}),
          },
        },
      },
    },
    defaultValue: { on: true, kind: 'text', o: { y: 'old' } },
    validationMode: ValidationMode.None,
  });
  root.setValue({ on: false, write: true, reopen: true }, WriteOption.Merge);
  expect(root.value).toMatchObject({
    on: false,
    kind: 'number',
    switchKind: true,
    closeAgain: true,
  });

  root.setValue({ on: true, kind: 'text' }, WriteOption.Merge);
  expect(root.find('/o/y')?.value).toBe('named');
});
