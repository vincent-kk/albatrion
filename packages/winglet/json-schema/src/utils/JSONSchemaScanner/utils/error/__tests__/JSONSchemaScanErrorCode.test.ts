import { describe, expect, it } from 'vitest';

import { JSONSchemaScanError } from '../JSONSchemaScanError';
import { JSONSchemaScanErrorCode } from '../JSONSchemaScanErrorCode';

describe('JSONSchemaScanErrorCode', () => {
  it('keeps the published code strings', () => {
    expect(JSONSchemaScanErrorCode).toEqual({
      DuplicateIdentifier: 'duplicate-identifier',
      IdentifierMutation: 'identifier-mutation',
      InlinedNodeLimit: 'inlined-node-limit',
      InvalidResolverResult: 'invalid-resolver-result',
      ReferenceChainLimit: 'reference-chain-limit',
      ScanInProgress: 'scan-in-progress',
      SchemaCycle: 'schema-cycle',
      UnresolvedReference: 'unresolved-reference',
    });
  });

  it('carries the table entry on the error as code and specific', () => {
    const error = new JSONSchemaScanError(
      JSONSchemaScanErrorCode.SchemaCycle,
      'cycle',
    );
    expect(error.code).toBe('schema-cycle');
    expect(error.specific).toBe('schema-cycle');
    expect(error.group).toBe('JSON_SCHEMA_SCAN');
  });
});
