import { describe, expect, it } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScanner } from '../JSONSchemaScanner';

/** Make a schema-compatible result whose then getter records accidental promise detection. */
const createThenTrap = () =>
  Object.defineProperty({ type: 'string' }, 'then', {
    get() {
      throw new Error('sync callback then getter was read');
    },
  });

describe('JSONSchemaScanner callback result characterization', () => {
  it('does not inspect then on visitor results', () => {
    const trap = createThenTrap();
    const paths: string[] = [];
    expect(() =>
      new JSONSchemaScanner({
        visitor: {
          enter: (entry) => {
            paths.push(entry.path);
            return trap;
          },
          exit: () => trap,
        },
      }).scan({ properties: { child: { type: 'number' } } }),
    ).not.toThrow();
    expect(paths).toEqual(['#', '#/properties/child']);
  });

  it('does not inspect then on a truthy filter result', () => {
    const paths: string[] = [];
    new JSONSchemaScanner({
      options: { filter: () => createThenTrap() as unknown as boolean },
      visitor: { enter: (entry) => paths.push(entry.path) },
    }).scan({ properties: { child: { type: 'number' } } });
    expect(paths).toEqual(['#', '#/properties/child']);
  });

  it('does not inspect then on mutation results', () => {
    const trap = createThenTrap();
    let visited: UnknownSchema | boolean | undefined;
    new JSONSchemaScanner({
      options: { mutate: () => trap },
      visitor: {
        enter: (entry) => {
          visited = entry.schema;
        },
      },
    }).scan({ type: 'number' });
    expect(visited).toBe(trap);
  });

  it('does not inspect then on resolver results', () => {
    const trap = createThenTrap();
    const output = new JSONSchemaScanner<UnknownSchema>({
      options: { resolveReference: () => trap },
    })
      .scan({ $ref: '#/target' })
      .getValue();
    expect(output).toEqual({ type: 'string' });
  });
});
