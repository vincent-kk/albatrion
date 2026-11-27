import type { BlueprintSchema } from '../../../../blueprint';

/** Literal regression scene and structural verb selected by the test table. */
export interface MoveReplayCase {
  /** Stable regression name. */
  name: string;
  /** Source representation and destination interpretation under test. */
  mode:
    | 'object-terminal'
    | 'terminal-null'
    | 'array-terminal'
    | 'nested-object'
    | 'nested-array'
    | 'nested-default'
    | 'inactive-number';
  /** Structural move that recreates the source in the other tuple slot. */
  operation: 'insert' | 'remove';
}

/**
 * Build a candidate-bearing tuple scene with a literal public result.
 * @param scene - Authored table row selecting representation, depth and verb
 * @returns Schema, mount input, insertion input and expected final public array
 */
export const createMoveReplayScene = (scene: MoveReplayCase) => {
  const dormant = [
    { controls: { active: false }, properties: { unused: { type: 'string' } } },
    { controls: { active: false }, properties: { unused: { type: 'number' } } },
  ] satisfies BlueprintSchema[];
  let source: BlueprintSchema;
  let destination: BlueprintSchema;
  let value: unknown;
  let expectedMoved: unknown;
  let inserted: unknown = {};
  let expectedInserted: unknown = {};
  if (scene.mode === 'object-terminal') {
    source = {
      type: 'object',
      properties: { v: { type: 'string' } },
      allOf: dormant,
    };
    destination = { type: 'object', options: { terminal: true } };
    value = { v: '123', extra: 9 };
    expectedMoved = value;
  } else if (scene.mode === 'terminal-null') {
    source = { type: 'object', nullable: true, options: { terminal: true } };
    destination = {
      type: 'object',
      nullable: true,
      properties: { v: { type: 'number', default: 29 } },
      allOf: dormant,
    };
    value = null;
    expectedMoved = null;
  } else if (scene.mode === 'array-terminal') {
    source = {
      type: 'array',
      items: {
        type: 'object',
        properties: { v: { type: 'string' } },
        allOf: dormant,
      },
    };
    destination = { type: 'array', options: { terminal: true } };
    value = [{ v: '123', extra: 9 }];
    expectedMoved = value;
    inserted = [];
    expectedInserted = [];
  } else if (scene.mode === 'inactive-number') {
    source = {
      type: 'object',
      properties: { enabled: { type: 'boolean' }, v: { type: 'string' } },
      allOf: dormant,
    };
    destination = {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        v: { type: 'number', controls: { active: '../enabled' } },
      },
    };
    value = { enabled: false, v: '123', extra: 9 };
    expectedMoved = { enabled: false, extra: 9 };
  } else {
    const defaults = scene.mode === 'nested-default';
    let sourceChild: BlueprintSchema = {
      type: 'object',
      properties: {
        x: { type: 'string', ...(defaults ? { default: '17' } : {}) },
      },
    };
    let destinationChild: BlueprintSchema = {
      type: 'object',
      properties: {
        x: { type: 'number', ...(defaults ? { default: 29 } : {}) },
      },
    };
    let child: unknown = { ...(defaults ? {} : { x: '123' }), extraInner: 7 };
    let expectedChild: unknown = { x: defaults ? 17 : 123, extraInner: 7 };
    if (scene.mode === 'nested-array') {
      sourceChild = { type: 'array', items: sourceChild };
      destinationChild = { type: 'array', items: destinationChild };
      child = [child];
      expectedChild = [expectedChild];
    }
    source = { type: 'object', properties: { v: sourceChild }, allOf: dormant };
    destination = { type: 'object', properties: { v: destinationChild } };
    value = { v: child };
    expectedMoved = { v: expectedChild };
    if (defaults) expectedInserted = { v: { x: '17' } };
  }
  const schema: BlueprintSchema = {
    type: 'array',
    prefixItems:
      scene.operation === 'insert'
        ? [source, destination]
        : [destination, source],
  };
  return {
    schema,
    initial: scene.operation === 'insert' ? [value] : [{}, value],
    inserted,
    destinationIndex: scene.operation === 'insert' ? '1' : '0',
    expectedMoved,
    expected:
      scene.operation === 'insert'
        ? [expectedInserted, expectedMoved]
        : [expectedMoved],
  };
};
