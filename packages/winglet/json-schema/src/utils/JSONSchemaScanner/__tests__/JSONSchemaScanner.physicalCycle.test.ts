import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { JSONScannerOptions, SchemaVisitor } from '../utils/type';

/** Both drivers expose the same cycle-checking contract without sharing private state. */
type ScannerConstructor = new (config: {
  options?: JSONScannerOptions;
  visitor?: SchemaVisitor;
}) => {
  scan(schema: UnknownSchema): unknown;
  getValue(): UnknownSchema | undefined;
};

describe('physical schema cycles', () => {
  it('rejects a traversed physical cycle before a finite depth bound in sync scans', () => {
    const schema: UnknownSchema = {};
    schema.properties = { self: schema };
    const scanner = new JSONSchemaScanner({ options: { maxDepth: 300 } });
    expect(() => scanner.scan(schema)).toThrowError(
      expect.objectContaining({ code: 'schema-cycle' }),
    );
    expect(scanner.getValue()).toBeUndefined();
  });

  it('rejects a traversed physical cycle in async scans and clears state', async () => {
    const schema: UnknownSchema = {};
    schema.items = schema;
    const scanner = new JSONSchemaScannerAsync({ options: { maxDepth: 300 } });
    await expect(scanner.scan(schema)).rejects.toMatchObject({
      code: 'schema-cycle',
    });
    expect(scanner.getValue()).toBeUndefined();
  });
});

describe.each<[string, ScannerConstructor]>([
  ['sync', JSONSchemaScanner],
  ['async', JSONSchemaScannerAsync],
])('%s deep cycle checkpoints', (_name, Scanner) => {
  it('rejects a cycle longer than 300 nodes within the checkpoint detection bound', async () => {
    const nodes: UnknownSchema[] = Array.from({ length: 350 }, () => ({
      type: 'object',
    }));
    for (let index = 0; index < nodes.length; index++)
      nodes[index].items = nodes[(index + 1) % nodes.length];
    let visited = 0;
    const scanner = new Scanner({
      options: { maxDepth: 2000 },
      visitor: { enter: () => visited++ },
    });
    let failure: unknown;
    try {
      await scanner.scan(nodes[0]);
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({ code: 'schema-cycle' });
    expect(visited).toBeLessThan(2 * (256 + nodes.length) + 2);
    expect(scanner.getValue()).toBeUndefined();
  });

  it('does not flag a shared DAG deeper than 600 when switching siblings', async () => {
    let shared: UnknownSchema = { type: 'string' };
    for (let index = 0; index < 700; index++) shared = { items: shared };
    const schema = { allOf: [shared, shared] };
    let visited = 0;
    const scanner = new Scanner({ visitor: { enter: () => visited++ } });
    await scanner.scan(schema);
    expect(visited).toBe(1403);
    expect(scanner.getValue() === schema).toBe(true);
  });

  it('rejects a cycle inside a default value when output needs copying', async () => {
    const data: Record<string, unknown> = {};
    data.self = data;
    const schema = { default: data, properties: { child: { type: 'string' } } };
    const scanner = new Scanner({
      options: {
        mutate: (entry) => (entry.depth === 1 ? { type: 'number' } : undefined),
      },
    });
    await scanner.scan(schema);
    expect(() => scanner.getValue()).toThrowError(
      expect.objectContaining({ code: 'schema-cycle' }),
    );
    expect(schema.properties.child.type).toBe('string');
    expect(data.self === data).toBe(true);
  });
});
