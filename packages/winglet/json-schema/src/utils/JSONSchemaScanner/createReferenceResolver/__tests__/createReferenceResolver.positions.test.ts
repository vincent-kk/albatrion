import { describe, expect, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { assertEquivalent } from './fixtures/assertEquivalent';
import { scan } from './fixtures/scan';

/** Draft-07 keeps the tested ignored-sibling region inert. */
const old = 'http://json-schema.org/draft-07/schema#';

describe('relocation at unrecognised schema positions', () => {
  it('does not rewrite reference-shaped values in unknown containers', () => {
    const B = { $id: 'https://e.test/B', hidden: { $ref: '#/x' } };
    const schema = { $id: 'https://e.test/A', $ref: 'B' };
    expect(
      scan(schema, {}, { resources: { 'https://e.test/B': B } }).outcomes.get(
        '#',
      ),
    ).toMatchObject([{ skipped: 'relocation' }]);
  });
  it('preserves a pointer whose target is not an indexed schema position', () => {
    const schema = {
      $schema: old,
      $id: 'https://e.test/root.json',
      hidden: {
        $id: 'sub/target.json',
        type: 'object',
        properties: { v: { $ref: 'leaf.json' } },
      },
      properties: { x: { $ref: '#/hidden' } },
    };
    const resources = {
      'https://e.test/leaf.json': {
        $schema: old,
        $id: 'https://e.test/leaf.json',
        type: 'number',
      },
      'https://e.test/sub/leaf.json': {
        $schema: old,
        $id: 'https://e.test/sub/leaf.json',
        type: 'string',
      },
    };
    const { output, outcomes } = scan(schema, {}, { resources });
    assertEquivalent(
      schema,
      output,
      [{ x: { v: 's' } }, { x: { v: 1 } }],
      'draft-07',
      Object.values(resources),
    );
    expect(outcomes.get('#/properties/x')).toMatchObject([
      { skipped: 'relocation' },
    ]);
  });
  it('preserves a pointer into an inert reference sibling', () => {
    const schema = {
      $schema: old,
      $ref: '#/properties/a',
      properties: { a: { type: 'string' } },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('#/properties/a', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped', reason: 'relocation' });
    const { output, outcomes } = scan(schema);
    expect(outcomes.get('#')).toMatchObject([{ skipped: 'relocation' }]);
    assertEquivalent(schema, output, ['s', 1], 'draft-07');
  });
  it.each([false, true])(
    'preserves a pointer across an inert identifier, descendant target %s',
    (descendant) => {
      const schema = {
        $schema: old,
        $id: 'https://e.test/root.json',
        definitions: {
          Base: {},
          D: {
            $ref: '#/definitions/Base',
            properties: {
              T: {
                $id: 'sub/target.json',
                type: 'object',
                properties: { v: { $ref: 'leaf.json' } },
              },
            },
          },
        },
        properties: {
          x: {
            $ref:
              '#/definitions/D/properties/T' +
              (descendant ? '/properties/v' : ''),
          },
        },
      };
      const resources = {
        'https://e.test/leaf.json': {
          $schema: old,
          $id: 'https://e.test/leaf.json',
          type: 'number',
        },
        'https://e.test/sub/leaf.json': {
          $schema: old,
          $id: 'https://e.test/sub/leaf.json',
          type: 'string',
        },
      };
      const original = JSON.stringify(schema);
      const { output, outcomes } = scan(schema, {}, { resources });
      const samples = descendant
        ? [{ x: 's' }, { x: 1 }]
        : [{ x: { v: 's' } }, { x: { v: 1 } }];
      assertEquivalent(
        schema,
        output,
        samples,
        'draft-07',
        Object.values(resources),
      );
      expect(outcomes.get('#/properties/x')).toMatchObject([
        { skipped: 'relocation' },
      ]);
      expect(output).toBe(schema);
      expect(JSON.stringify(schema)).toBe(original);
    },
  );
  it.each(['#/prefixItems/0', '#/prefixItems/0/hidden'])(
    'preserves %s at or below a dialect-inert applicator',
    (reference) => {
      const schema = {
        $schema: old,
        prefixItems: [{ type: 'string', hidden: false }],
        properties: { x: { $ref: reference } },
      };
      const { output, outcomes } = scan(schema);
      expect(outcomes.get('#/properties/x')).toMatchObject([
        { skipped: 'relocation' },
      ]);
      assertEquivalent(schema, output, [{}, { x: 's' }, { x: 1 }], 'draft-07');
    },
  );
  it('preserves an unindexed descendant of an unknown ignored sibling', () => {
    const schema = {
      $schema: old,
      definitions: {
        Base: {},
        D: { $ref: '#/definitions/Base', hidden: { child: false } },
      },
      properties: { x: { $ref: '#/definitions/D/hidden/child' } },
    };
    const { output, outcomes } = scan(schema);
    expect(outcomes.get('#/properties/x')).toMatchObject([
      { skipped: 'relocation' },
    ]);
    assertEquivalent(schema, output, [{}, { x: 's' }, { x: 1 }], 'draft-07');
  });
  it.each(['definitions', '$defs'])(
    'still inlines ordinary %s positions beside a retained reference',
    (container) => {
      const schema = {
        $schema: old,
        definitions: {
          Base: {},
          D: {
            $ref: '#/definitions/Base',
            [container]: { T: { type: 'string' } },
          },
        },
        properties: { x: { $ref: '#/definitions/D/' + container + '/T' } },
      };
      const { output } = scan(schema);
      expect(output.properties.x).toEqual({ type: 'string' });
      assertEquivalent(schema, output, [{ x: 's' }, { x: 1 }], 'draft-07');
    },
  );
});
