import { describe, expect, expectTypeOf, it } from 'vitest';

import type { Nullish } from '@aileron/declare';

import { blueprint } from '@/schema-form/core/engine';

import type {
  ArrayNode,
  BooleanNode,
  BranchNode,
  FieldNode,
  NumberNode,
  ObjectNode,
  StringNode,
  TerminalNode,
  UnionNode,
  VirtualNode,
} from '../type';
import { fieldNodeFactory } from '../utils/fieldNodeFactory';
import {
  isArrayNode,
  isBooleanNode,
  isBranchNode,
  isNumberNode,
  isObjectNode,
  isStringNode,
  isTerminalNode,
  isUnionNode,
  isVirtualNode,
} from '../utils/guards';

/** All kind and strategy predicates share the same absent-reference contract. */
const guards = [
  isStringNode,
  isNumberNode,
  isBooleanNode,
  isObjectNode,
  isArrayNode,
  isVirtualNode,
  isUnionNode,
  isBranchNode,
  isTerminalNode,
];

describe('node guards accept absence without weakening narrowing', () => {
  describe.each([null, undefined])('absent node %s', (node) => {
    it.each(guards)('%s returns false', (guard) => {
      expect(guard(node)).toBe(false);
    });
  });

  it('preserves every subtype when narrowing a nullish node reference', () => {
    const kinds = [
      'string',
      'number',
      'boolean',
      'object',
      'array',
      'null',
    ] as const;
    const nodes = kinds.map((type) =>
      fieldNodeFactory(blueprint({ type }), {
        diagnostics: { status: 'stable' },
        loadSnapshot: undefined,
      }),
    );
    for (const node of [...nodes, null, undefined]) {
      /** Check declarations against a genuinely nullish input, including all predicate targets. */
      const check = (candidate: FieldNode | Nullish) => {
        if (isStringNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<StringNode>();
        if (isNumberNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<NumberNode>();
        if (isBooleanNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<BooleanNode>();
        if (isObjectNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<ObjectNode>();
        if (isArrayNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<ArrayNode>();
        if (isVirtualNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<VirtualNode>();
        if (isUnionNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<UnionNode>();
        if (isBranchNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<BranchNode>();
        if (isTerminalNode(candidate))
          expectTypeOf(candidate).toEqualTypeOf<TerminalNode>();
      };
      check(node);
    }
    expect(nodes.map((node) => guards.map((guard) => guard(node)))).toEqual([
      [true, false, false, false, false, false, false, false, true],
      [false, true, false, false, false, false, false, false, true],
      [false, false, true, false, false, false, false, false, true],
      [false, false, false, true, false, false, false, true, false],
      [false, false, false, false, true, false, false, true, false],
      [false, false, false, false, false, false, false, false, true],
    ]);
  });
});
