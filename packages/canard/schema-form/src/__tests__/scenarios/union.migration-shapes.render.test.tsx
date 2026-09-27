import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import type { JSONSchema } from '@winglet/json-schema';

import { nodeFromJSONSchema } from '@/schema-form/core';
import { blueprint } from '@/schema-form/core/blueprint';

import { renderForm } from '../renderForm';

/**
 * The public Form still uses the legacy node factory in PR 02. These authored
 * schemas therefore document its current rejection and the blueprint's new
 * acceptance separately. Rendering success belongs to the engine-switch PR.
 */
// filid:contract union-migration-shapes
describe('round 19 migration shapes at the render boundary', () => {
  it.each(['oneOf', 'anyOf'] as const)(
    'LANDING-207: %s inline object variants migrate to an object host',
    async (keyword) => {
      const branches = [
        {
          type: 'object',
          properties: {
            kind: { type: 'string', const: 'cat' },
            name: { type: 'string' },
          },
        },
        {
          type: 'object',
          properties: {
            kind: { type: 'string', const: 'dog' },
            age: { type: 'number' },
          },
        },
      ];
      const schema = { [keyword]: branches };

      expect(blueprint(schema).root).toMatchObject({
        kind: 'object',
        schemaType: 'object',
        nullable: false,
        strategy: 'branch',
      });
      expect(() =>
        nodeFromJSONSchema({
          jsonSchema: schema as unknown as JSONSchema,
          onChange: () => {},
        }),
      ).toThrow(expect.objectContaining({ specific: 'UNKNOWN_JSON_SCHEMA' }));
      const form = await renderForm(schema as unknown as JSONSchema);
      expect(form.handle).toBeNull();
      expect(form.container).toHaveTextContent('An unexpected error has occurred');
      form.unmount();
    },
  );

  it('LANDING-207: Optional[Self] changes to the unbounded-shape diagnosis', async () => {
    const schema = {
      anyOf: [
        {
          type: 'object',
          properties: { next: { $ref: '#' } },
        },
        { type: 'null' },
      ],
    };

    expect(() => blueprint(schema)).toThrow(
      expect.objectContaining({ specific: 'RECURSIVE_SHAPE_UNBOUNDED' }),
    );
    expect(() =>
      nodeFromJSONSchema({
        jsonSchema: schema as unknown as JSONSchema,
        onChange: () => {},
      }),
    ).toThrow(expect.objectContaining({ specific: 'UNKNOWN_JSON_SCHEMA' }));
    const form = await renderForm(schema as unknown as JSONSchema);
    expect(form.handle).toBeNull();
    expect(form.container).toHaveTextContent('An unexpected error has occurred');
    form.unmount();
  });

  it('LANDING-208: untyped const and enum properties become primitive leaves', async () => {
    const schema = {
      type: 'object',
      properties: {
        kind: { const: 'cat' },
        phase: { enum: ['draft', 'published', null] },
      },
    };

    const result = blueprint(schema);
    const children = Object.fromEntries(
      result.root.childEntries.map(({ name, node }) => [name, node]),
    );
    expect(children.kind).toMatchObject({
      kind: 'string',
      schemaType: 'string',
      nullable: false,
    });
    expect(children.phase).toMatchObject({
      kind: 'string',
      schemaType: 'string',
      nullable: true,
    });
    expect(() =>
      nodeFromJSONSchema({
        jsonSchema: schema as unknown as JSONSchema,
        onChange: () => {},
      }),
    ).toThrow(expect.objectContaining({ specific: 'UNKNOWN_JSON_SCHEMA' }));
    const form = await renderForm(schema as unknown as JSONSchema);
    expect(form.handle).toBeNull();
    expect(form.container).toHaveTextContent('An unexpected error has occurred');
    form.unmount();
  });
});
