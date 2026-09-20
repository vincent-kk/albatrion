import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { renderForm } from '../renderForm';

/**
 * The validated value carries a marker of the `oneOf` branch in use inside each
 * object that has one. The marker belongs to an object the value holds: where
 * the value has no such object, validation has to see the value as it is.
 */
describe('validation.branch-marker.render — a branch marker never adds a value of its own', () => {
  it('reports a required object that the value leaves out while one of its branches is in use', async () => {
    const schema: JSONSchema = {
      type: 'object',
      required: ['target'],
      properties: {
        kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
        target: {
          type: 'object',
          oneOf: [
            {
              '&if': "../kind === 'a'",
              properties: { aValue: { type: 'string' } },
            },
            {
              '&if': "../kind === 'b'",
              properties: { bValue: { type: 'string' } },
            },
          ],
        },
      },
    };
    const form = await renderForm(schema, { validator: true });

    expect(form.getValue()).toEqual({ kind: 'a' });
    expect(
      (await form.validate()).map((error) => [error.dataPath, error.keyword]),
    ).toEqual([['/target', 'required']]);
  });

  it('validates the items the array holds after one with a branch in use is removed', async () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          maxItems: 1,
          items: {
            type: 'object',
            properties: {
              kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
            },
            oneOf: [
              {
                '&if': "./kind === 'a'",
                properties: { aValue: { type: 'string' } },
              },
              {
                '&if': "./kind === 'b'",
                properties: { bValue: { type: 'string' } },
              },
            ],
          },
        },
      },
    };
    const form = await renderForm(schema, {
      defaultValue: { list: [{ kind: 'a' }, { kind: 'b' }] },
      validator: true,
    });
    expect((await form.validate()).map((error) => error.keyword)).toEqual([
      'maxItems',
    ]);

    await form.removeItem('/list', 1);

    expect(form.getValue()).toEqual({ list: [{ kind: 'a' }] });
    expect(await form.validate()).toEqual([]);
  });
});
