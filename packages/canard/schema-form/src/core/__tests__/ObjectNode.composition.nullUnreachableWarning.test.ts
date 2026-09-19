import { afterEach, describe, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

const WARNING = 'SCHEMA_FORM_WARNING.NULLABLE_ONE_OF_NULL_UNREACHABLE';

type Branches = NonNullable<JSONSchema['oneOf']>;

const properties: NonNullable<JSONSchema['properties']> = {
  kind: { type: 'string', enum: ['a', 'b'] },
};

/**
 * Builds a form holding one object under test, and counts the null-unreachable warnings it printed.
 * Every case names its object differently: a development warning is printed once per message, and the message carries the path.
 * @param name - Property name of the object under test
 * @param target - Schema of that object
 * @returns How many times the warning was printed
 */
const warningsFor = (name: string, target: JSONSchema) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const jsonSchema: JSONSchema = {
    type: 'object',
    properties: { [name]: target },
  };
  nodeFromJSONSchema({ onChange: () => {}, jsonSchema });
  return warn.mock.calls.filter((call) => String(call[0]).includes(WARNING))
    .length;
};

const untypedBranches: Branches = [
  { '&if': "./kind === 'a'", properties: { aValue: { type: 'string' } } },
  { '&if': "./kind === 'b'", properties: { bValue: { type: 'string' } } },
];

const objectBranches: Branches = [
  {
    type: 'object',
    '&if': "./kind === 'a'",
    properties: { aValue: { type: 'string' } },
  },
  {
    type: 'object',
    '&if': "./kind === 'b'",
    properties: { bValue: { type: 'string' } },
  },
];

/** `oneOf` wants exactly one matching branch, so a nullable object validates as `null` only when exactly one branch admits `null`. */
describe('ObjectNode composition — nullable oneOf가 null을 검증할 수 없으면 경고', () => {
  afterEach(() => vi.restoreAllMocks());

  it('type 없는 분기는 모두 null에 맞으므로 경고해야 함', () => {
    expect(
      warningsFor('everyBranch', {
        type: ['object', 'null'],
        properties,
        oneOf: untypedBranches,
      }),
    ).toBe(1);
  });

  it('null에 맞는 분기가 하나도 없어도 경고해야 함', () => {
    expect(
      warningsFor('noBranch', {
        type: ['object', 'null'],
        properties,
        oneOf: objectBranches,
      }),
    ).toBe(1);
  });

  it('null 분기 하나와 type을 선언한 객체 분기면 경고하지 않아야 함', () => {
    expect(
      warningsFor('standard', {
        type: ['object', 'null'],
        properties,
        oneOf: [{ type: 'null' }, ...objectBranches],
      }),
    ).toBe(0);
  });

  it('type 없는 분기라도 const로 null을 배제하면 null에 맞는 분기로 세지 않아야 함', () => {
    expect(
      warningsFor('constExcluded', {
        type: ['object', 'null'],
        properties,
        oneOf: [
          { type: 'null' },
          { '&if': "./kind === 'a'", const: { kind: 'a' } },
          objectBranches[1],
        ],
      }),
    ).toBe(0);
  });

  it('enum으로 null을 배제한 type 없는 분기도 null에 맞는 분기로 세지 않아야 함', () => {
    expect(
      warningsFor('enumExcluded', {
        type: ['object', 'null'],
        properties,
        oneOf: [
          { type: 'null' },
          { '&if': "./kind === 'a'", enum: [{ kind: 'a' }] },
          objectBranches[1],
        ],
      }),
    ).toBe(0);
  });

  it('$ref 분기가 있으면 판단할 수 없으므로 경고하지 않아야 함', () => {
    expect(
      warningsFor('referenced', {
        type: ['object', 'null'],
        properties,
        $defs: { aBranch: objectBranches[0] },
        oneOf: [{ $ref: '#/$defs/aBranch' }, untypedBranches[1]],
      }),
    ).toBe(0);
  });

  it('nullable이 아닌 객체에는 경고하지 않아야 함', () => {
    expect(
      warningsFor('notNullable', {
        type: 'object',
        properties,
        oneOf: untypedBranches,
      }),
    ).toBe(0);
  });

  it('anyOf에는 경고하지 않아야 함', () => {
    expect(
      warningsFor('anyOfScope', {
        type: ['object', 'null'],
        properties,
        anyOf: untypedBranches,
      }),
    ).toBe(0);
  });
});
