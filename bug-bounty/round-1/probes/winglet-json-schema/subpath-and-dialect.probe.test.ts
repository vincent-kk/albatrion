import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import * as root from '@winglet/json-schema';
import * as asyncScanner from '@winglet/json-schema/async-scanner';
import * as keyword from '@winglet/json-schema/keyword';
import * as scanner from '@winglet/json-schema/scanner';

import { JSONSchemaScanner, createReferenceResolver } from '../../index';

describe('bounty subpath identity and dialect probes', () => {
  it('S1 ESM subpaths share declaration identity', () => {
    expect(keyword.DEFAULT_KEYWORDS).toBe(root.DEFAULT_KEYWORDS);
    expect(keyword.Dialect).toBe(root.Dialect);
    expect((scanner as any).DEFAULT_KEYWORDS ?? keyword.DEFAULT_KEYWORDS).toBe(
      keyword.DEFAULT_KEYWORDS,
    );
    expect((asyncScanner as any).Dialect ?? keyword.Dialect).toBe(
      keyword.Dialect,
    );
    expect((scanner as any).JSONSchemaScanError).toBe(
      (root as any).JSONSchemaScanError,
    );
  });

  it('S2 CJS subpaths share declaration identity', () => {
    const require = createRequire(import.meta.url);
    const r = require('@winglet/json-schema');
    const k = require('@winglet/json-schema/keyword');
    const s = require('@winglet/json-schema/scanner');
    const a = require('@winglet/json-schema/async-scanner');
    expect(k.DEFAULT_KEYWORDS).toBe(r.DEFAULT_KEYWORDS);
    expect(k.Dialect).toBe(r.Dialect);
    expect(s.JSONSchemaScanError).toBe(r.JSONSchemaScanError);
    expect(a.Dialect).toBe(r.Dialect);
  });

  it('S3 pinned embedded draft-04-id/2020-12 case agrees with and without the resolver', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft-04/schema#',
      properties: {
        embedded: {
          id: 'child',
          $schema: 'http://json-schema.org/draft/2020-12/schema#',
          prefixItems: [{}],
        },
      },
    };
    const inert = (withResolver: boolean) => {
      let value: boolean | undefined;
      new JSONSchemaScanner({
        options: withResolver
          ? { resolveReference: createReferenceResolver(schema) }
          : {},
        visitor: {
          enter(e) {
            if (e.path === '#/properties/embedded/prefixItems/0')
              value = !!e.inert;
          },
        },
      }).scan(schema);
      return value;
    };
    expect(inert(false)).toBe(inert(true));
  });
});
