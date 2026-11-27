import { expect, it } from 'vitest';

import { Dialect } from '../index';
import { JSONSchemaScannerAsync } from '../index';
import { createReferenceResolver } from '../index';
import { createReferenceResolverAsync } from '../index';
import { JSONSchemaScanner } from '../index';

/** Observe the dialect through a keyword draft-04 treats as inert. */
function schema($schema: string) {
  return { $schema, contains: { type: 'string' } };
}

it('round-3 json-schema 3: case aliases select the same dialect in both drivers', async () => {
  const canonical = 'http://json-schema.org/draft-04/schema#';
  const paths = ($schema: string) => {
    const result: string[] = [];
    new JSONSchemaScanner({
      visitor: {
        enter: (entry) => {
          if (entry.inert) result.push(entry.path);
        },
      },
    }).scan(schema($schema));
    return result;
  };
  const expected = paths(canonical);
  expect(expected).toContain('#/contains');
  for (const uri of [
    canonical.toUpperCase().replace('DRAFT-04/SCHEMA', 'draft-04/schema'),
    'HTTP://json-schema.org/draft-04/schema#',
    'https://JSON-SCHEMA.ORG/draft-04/schema',
    'HtTpS://JsOn-ScHeMa.OrG/draft-04/schema#',
  ]) {
    expect(paths(uri)).toEqual(expected);
    const result: string[] = [];
    await new JSONSchemaScannerAsync({
      visitor: {
        enter: (entry) => {
          if (entry.inert) result.push(entry.path);
        },
      },
    }).scan(schema(uri));
    expect(result).toEqual(expected);
  }
});

it('round-3 json-schema 3: custom aliases fold scheme and host, preserving path and user information', async () => {
  const aliases = { 'https://User@EX.example/Case?Query': Dialect.Draft04 };
  const lower = schema('http://User@ex.example/Case?Query#');
  for (const make of [createReferenceResolver, createReferenceResolverAsync]) {
    const resolver = make(lower, { dialects: aliases });
    expect(resolver.dialect(resolver.root(lower))).toBe(Dialect.Draft04);
    for (const uri of [
      'http://user@ex.example/Case?Query',
      'http://User@ex.example/case?Query',
      'http://User@ex.example/Case?query',
    ]) {
      const different = schema(uri);
      const fresh = make(different, { dialects: aliases });
      expect(fresh.dialect(fresh.root(different))).toBe(Dialect.Draft202012);
    }
  }
});
