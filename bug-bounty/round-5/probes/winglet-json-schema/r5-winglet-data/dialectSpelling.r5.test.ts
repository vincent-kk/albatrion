import { describe, expect, it } from 'vitest';

import { JSONSchemaScanner } from '@/json-schema';

const inertPaths = (schema: Record<string, unknown>) => {
  const paths: string[] = [];
  new JSONSchemaScanner({
    visitor: { enter: (entry) => void (entry.inert && paths.push(entry.path)) },
  }).scan(schema);
  return paths;
};

describe('$schema spellings that RFC 3986 section 6.2.3 treats as the same URI (round 4 json-schema open lead)', () => {
  const draft04 = (uri: string) => inertPaths({ $schema: uri, contains: { type: 'string' } });

  it('control: the canonical draft-04 URI marks #/contains inert', () => {
    expect(draft04('http://json-schema.org/draft-04/schema#')).toEqual(['#/contains']);
  });

  for (const uri of [
    'http://json-schema.org:80/draft-04/schema#',
    'https://json-schema.org:443/draft-04/schema#',
  ])
    it(`${uri} selects draft-04 like the canonical spelling`, () => {
      expect(draft04(uri)).toEqual(draft04('http://json-schema.org/draft-04/schema#'));
    });
});
