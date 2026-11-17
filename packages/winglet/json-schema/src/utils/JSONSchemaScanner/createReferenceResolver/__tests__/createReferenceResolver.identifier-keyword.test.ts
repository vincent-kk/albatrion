import { describe, expect, it } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { enterChild } from './fixtures/enterChild';
import { scan } from './fixtures/scan';

const DRAFT04 = 'http://json-schema.org/draft-04/schema#';
const DRAFT07 = 'http://json-schema.org/draft-07/schema#';
const DRAFT2020 = 'https://json-schema.org/draft/2020-12/schema';

describe('identifier keywords by dialect', () => {
  it('ignores $id in a draft-04 subschema', () => {
    const schema = {
      $schema: DRAFT04,
      definitions: {
        a: { $id: 'urn:example:a', definitions: { b: { type: 'number' } } },
        b: { type: 'string' },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    expect(resolver.resolve('urn:example:a', '$ref', root)).toMatchObject({
      status: 'skipped',
      reason: 'unresolved',
    });
    const a = enterChild(resolver, root, 'definitions', schema.definitions.a);
    expect(resolver.resolve('#/definitions/b', '$ref', a)).toMatchObject({
      status: 'resolved',
      target: { type: 'string' },
    });
  });

  it('ignores $id at a draft-04 root', () => {
    const schema = {
      $schema: DRAFT04,
      $id: 'urn:example:root',
      definitions: { b: { type: 'string' } },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('#/definitions/b', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'resolved', uri: '#/definitions/b' });
  });

  it('reads id in a draft-04 subschema', () => {
    const schema = {
      $schema: DRAFT04,
      definitions: {
        a: { id: 'urn:example:a', definitions: { b: { type: 'number' } } },
        b: { type: 'string' },
      },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('urn:example:a', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'resolved' });
  });

  it('ignores id in a draft-07 subschema', () => {
    const schema = {
      $schema: DRAFT07,
      definitions: { a: { id: 'urn:example:a' } },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('urn:example:a', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped', reason: 'unresolved' });
  });

  it('identifies an embedded draft-04 resource by id inside a 2020-12 root', () => {
    const schema = {
      $defs: {
        a: {
          $schema: DRAFT04,
          id: 'urn:example:a',
          definitions: { b: { type: 'number' } },
        },
      },
    };
    const resolver = createReferenceResolver(schema);
    const root = resolver.root(schema);
    const a = enterChild(resolver, root, '$defs', schema.$defs.a);
    expect(resolver.resolve('#/definitions/b', '$ref', a)).toMatchObject({
      status: 'resolved',
      target: { type: 'number' },
    });
    expect(resolver.resolve('urn:example:a', '$ref', root)).toEqual({
      status: 'skipped',
      reason: 'relocation',
      uri: 'urn:example:a#',
    });
  });

  it('identifies an embedded 2020-12 resource by $id inside a draft-04 root', () => {
    const schema = {
      $schema: DRAFT04,
      definitions: {
        a: {
          $schema: DRAFT2020,
          $id: 'urn:example:a',
          $defs: { b: { type: 'number' } },
        },
      },
    };
    const resolver = createReferenceResolver(schema);
    const a = enterChild(
      resolver,
      resolver.root(schema),
      'definitions',
      schema.definitions.a,
    );
    expect(resolver.resolve('#/$defs/b', '$ref', a)).toMatchObject({
      status: 'resolved',
      target: { type: 'number' },
    });
  });

  it('ignores a draft-04 id beside $ref', () => {
    const schema = {
      $schema: DRAFT04,
      definitions: {
        a: { id: 'urn:example:a', $ref: '#/definitions/b' },
        b: {},
      },
    };
    const resolver = createReferenceResolver(schema);
    expect(
      resolver.resolve('urn:example:a', '$ref', resolver.root(schema)),
    ).toMatchObject({ status: 'skipped', reason: 'unresolved' });
  });
});

describe('copied targets keep keywords that are not identifiers in their dialect', () => {
  it('keeps id in a 2020-12 target', () => {
    const schema = {
      $defs: { A: { id: 'user', type: 'string' } },
      properties: { p: { $ref: '#/$defs/A' } },
    };
    const { output } = scan(schema);
    expect(output.properties!.p).toEqual({ id: 'user', type: 'string' });
  });

  it('keeps $anchor in a draft-07 target', () => {
    const schema = {
      $schema: DRAFT07,
      definitions: { A: { $anchor: 'note', type: 'string' } },
      properties: { p: { $ref: '#/definitions/A' } },
    };
    const { output } = scan(schema);
    expect(output.properties!.p).toEqual({ $anchor: 'note', type: 'string' });
  });

  it('removes the 2020-12 $anchor and keeps id beside it', () => {
    const schema = {
      $schema: DRAFT2020,
      $defs: { A: { $anchor: 'a', id: 'user', type: 'string' } },
      properties: { p: { $ref: '#a' } },
    };
    const { output } = scan(schema);
    expect(output.properties!.p).toEqual({ id: 'user', type: 'string' });
  });
});
