import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScannerAsync } from '../async/JSONSchemaScannerAsync';
import { JSONSchemaScanner } from '../sync/JSONSchemaScanner';
import type { JSONScannerOptions } from '../utils/type';
import { createTestResolver } from './fixtures/createTestResolver';

/** Common result surface keeps both drivers' private state out of the test contract. */
type ScannerConstructor = new (config?: { options?: JSONScannerOptions }) => {
  scan(schema: UnknownSchema): unknown;
  getValue(): UnknownSchema | undefined;
};

describe.each<[string, ScannerConstructor]>([
  ['sync', JSONSchemaScanner],
  ['async', JSONSchemaScannerAsync],
])('%s output construction', (_name, Scanner) => {
  it('does not change a parent mutation value while applying a child replacement', async () => {
    const parent = {
      type: 'object',
      properties: { child: { type: 'string' } },
    };
    const original = { properties: { parent: { type: 'object' } } };
    const scanner = new Scanner({
      options: {
        mutate: (entry) => {
          if (entry.path === '#/properties/parent') return parent;
          if (entry.path === '#/properties/parent/properties/child')
            return { type: 'number' };
          return undefined;
        },
      },
    });
    await scanner.scan(original);
    const output = scanner.getValue()!;
    expect(parent.properties.child.type).toBe('string');
    expect(output.properties.parent.properties.child.type).toBe('number');
    expect(output.properties.parent).not.toBe(parent);
    expect(original.properties.parent).toEqual({ type: 'object' });
    expect(scanner.getValue()).toBe(output);
  });

  it('does not change a root mutation value while applying descendant replacements', async () => {
    const root = { properties: { child: { type: 'string' } } };
    const scanner = new Scanner({
      options: {
        mutate: (entry) => (entry.depth === 0 ? root : { type: 'integer' }),
      },
    });
    await scanner.scan({ type: 'null' });
    const output = scanner.getValue()!;
    expect(root.properties.child.type).toBe('string');
    expect(output.properties.child.type).toBe('integer');
    expect(output).not.toBe(root);
  });

  it('keeps a false result cached after the first output calculation', async () => {
    const root: UnknownSchema = { type: 'string' };
    const scanner = new Scanner({
      options: {
        mutate: (() => false) as unknown as NonNullable<
          JSONScannerOptions['mutate']
        >,
      },
    });
    await scanner.scan(root);
    expect(scanner.getValue()).toBe(false);
    expect(scanner.getValue()).toBe(false);
  });

  it('returns a false root when no operation is needed', async () => {
    const scanner = new Scanner();
    await scanner.scan(false as unknown as UnknownSchema);
    expect(scanner.getValue()).toBe(false);
  });

  it('isolates resolver targets and untouched input objects', async () => {
    const shared = { nested: { value: 1 } };
    const schema: UnknownSchema = {
      default: { first: shared, second: shared },
      properties: { ref: { $ref: '#/target' } },
    };
    const target = { type: 'object' };
    const scanner = new Scanner({
      options: { resolveReference: createTestResolver(() => target) },
    });
    await scanner.scan(schema);
    const output = scanner.getValue()!;
    expect(output.properties.ref).not.toBe(target);
    expect(output.default.first).not.toBe(shared);
    expect(output.default.first).not.toBe(output.default.second);
  });

  it('isolates every target container during a nested mutation', async () => {
    const target = {
      properties: { child: { type: 'string' }, untouched: { type: 'boolean' } },
    };
    const scanner = new Scanner({
      options: {
        resolveReference: createTestResolver(() => target),
        mutate: (entry) =>
          entry.path === '#/properties/ref/properties/child'
            ? { type: 'number' }
            : undefined,
      },
    });
    await scanner.scan({ properties: { ref: { $ref: '#/target' } } });
    const output = scanner.getValue()!;
    expect(target.properties.child.type).toBe('string');
    expect(output.properties.ref.properties.child.type).toBe('number');
    expect(output.properties.ref).not.toBe(target);
    expect(output.properties.ref.properties).not.toBe(target.properties);
    expect(output.properties.ref.properties.untouched).not.toBe(
      target.properties.untouched,
    );
  });

  it('discards uncomputed operations and completed cached output before reusing an instance', async () => {
    let mutate = true;
    const scanner = new Scanner({
      options: { mutate: () => (mutate ? { type: 'integer' } : undefined) },
    });
    await scanner.scan({ type: 'string' });
    mutate = false;
    const second = { type: 'number' };
    await scanner.scan(second);
    expect(scanner.getValue()).toBe(second);
    const third = { type: 'boolean' };
    await scanner.scan(third);
    expect(scanner.getValue()).toBe(third);
  });
});
