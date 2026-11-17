import { describe, expect, it } from 'vitest';

import { blueprint } from '../blueprint';

const compile = (active: string) =>
  blueprint({
    type: 'object',
    properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { active } },
    },
  }).expressions[0];

/**
 * Expressions written inline in the package documents (`docs/agents/**`, `docs/ko/**`), with the
 * reads each one must compile to. Fenced TypeScript examples run in `src/__tests__/agents-examples`.
 */
const DOCUMENTED_EXPRESSIONS: [expression: string, reads: string[]][] = [
  ['../age >= 18', ['../age']],
  ['../toggle === true', ['../toggle']],
  ['@.field', ['@']],
  ['../unit === "km /h"', ['../unit']],
  ['"a @ b"', []],
  ['`${../first} ${../last}`', ['../first', '../last']],
  ['/km\\/h/.test(../speed)', ['../speed']],
  ['(../price) / 100', ['../price']],
  ['/a/g', ['/a/g']],
  ['/foo/.test(../name)', ['/foo/.test', '../name']],
  ["new RegExp('foo').test(../name)", ['../name']],
  ['(../items).length > 0', ['../items']],
  ['../items.length', ['../items.length']],
  ['@.userRole === "admin"', ['@']],
  ['(@).permissions?.canEdit !== true', ['@']],
  ['(@).a?.b', ['@']],
  ["./type === 'A'", ['./type']],
  ['(../price ?? 0) * (../quantity ?? 1)', ['../price', '../quantity']],
];

describe('documented inline expressions', () => {
  // Compilation throws CREATE_DYNAMIC_FUNCTION when the generated function does not parse.
  it.each(DOCUMENTED_EXPRESSIONS)(
    '%s compiles and reads %j',
    (expression, reads) => {
      expect(compile(expression).dependencies).toEqual(reads);
    },
  );
});
