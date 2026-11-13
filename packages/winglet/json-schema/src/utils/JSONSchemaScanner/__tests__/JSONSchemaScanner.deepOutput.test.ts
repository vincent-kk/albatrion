import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { JSONScannerOptions } from '../type';

/** The common result surface exercises depth safety in both independent drivers. */
type ScannerConstructor = new (config: { options: JSONScannerOptions }) => {
  scan(schema: UnknownSchema): unknown;
  getValue(): UnknownSchema | undefined;
};

/** Build an input iteratively so the fixture cannot mask a recursive implementation failure. */
const deepSchema = (depth: number): UnknownSchema => {
  let schema: UnknownSchema = { type: 'string' };
  for (let index = 0; index < depth; index++)
    schema = { properties: { child: schema } };
  return schema;
};

describe.each<[string, ScannerConstructor]>([
  ['sync', JSONSchemaScanner],
  ['async', JSONSchemaScannerAsync],
])('%s deep outputs', (_name, Scanner) => {
  it('applies a leaf mutation 20000 levels deep while preserving every input container', async () => {
    const schema = deepSchema(20000);
    const scanner = new Scanner({
      options: {
        mutate: (entry) =>
          entry.depth === 20000 ? { type: 'number' } : undefined,
      },
    });
    await scanner.scan(schema);
    let output = scanner.getValue()!;
    let original = schema;
    for (let depth = 0; depth < 20000; depth++) {
        expect(output === original).toBe(false);
      output = output.properties.child;
      original = original.properties.child;
    }
    expect(output.type).toBe('number');
    expect(original.type).toBe('string');
  });

  it('copies a deep resolver target without recursive cloning', async () => {
    const target = deepSchema(20000);
    const scanner = new Scanner({
      options: { resolveReference: () => target },
    });
    await scanner.scan({ $ref: '#/target' });
    let output = scanner.getValue()!;
      expect(output === target).toBe(false);
    for (let depth = 0; depth < 20000; depth++)
      output = output.properties.child;
    expect(output.type).toBe('string');
  });
});
