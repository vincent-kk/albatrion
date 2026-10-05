import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { arrangeSchemaNodeItems, writeSchemaNode } from '../index';
import * as independentDefaults from '../utils/compute/utils/hasIndependentLeafDefaults';
import * as transitionCap from '../utils/transition/getTransitionCap';
import * as calculation from '../utils/compute/computeNode';
import * as descendants from '../utils/transition/collectFillDescendants';
import { createTestTree } from './fixtures/createTestTree';

/** Load through the generic path used as the static-first-load oracle. */
const loadGeneric = (schema: BlueprintSchema, input?: unknown,
  option = SetValueOption.Overwrite) => {
  const { root } = createTestTree(schema);
  const generic = vi.spyOn(independentDefaults, 'hasIndependentLeafDefaults')
    .mockReturnValue(false);
  try { writeSchemaNode(root, input, 'load', option); }
  finally { generic.mockRestore(); }
  return root;
};

/** Supply one explicit child and leave both default layers absent from D. */
const itemSchema: BlueprintSchema = { type: 'object', properties: {
  value: { type: 'number', default: -1 },
  label: { type: 'string', default: 'item' },
  priority: { type: 'string', default: 'schema', controls: { default: 'control' } },
} };

// filid:contract settle-recursive-fill
describe('92C-01 원본 없는 재귀 사슬', () => {
  it('호출자의 push(undefined)가 만든 배열 자리는 재귀 아이템을 유한하게 연다', () => {
    const root = loadGeneric({ type: 'object', properties: {
      id: { type: 'string' }, children: { type: 'array', items: { $ref: '#' } },
    } }, { id: 'root', children: [] });
    expect(arrangeSchemaNodeItems(root.structure!.children, { kind: 'push', value: undefined })).toBe(1);
    expect(root.structure!.children.children![0].structure!.children.local).toEqual([]);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });
  it('78C-02 호출자가 준 배열 값은 유한 재귀 확장을 허용한다', () => {
    const root = loadGeneric({ type: 'array', items: {
      type: 'object', properties: { next: { $ref: '#' } },
    } }, [{ next: [{ next: [] }] }]);
    expect(root.emit).toEqual([{ next: [{}] }]);
    expect(root.children![0].structure!.next.children![0].structure!.next.local).toEqual([]);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('D가 재귀 키를 []로 명시하면 채움 사슬을 닫는다', () => {
    const root = loadGeneric({ type: 'array', default: [{ next: [] }], items: {
      type: 'object', properties: { next: { $ref: '#' } },
    } });
    expect(root.emit).toEqual([{}]);
    expect(root.children![0].structure!.next.local).toEqual([]);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('객체 D 안의 배열 재귀도 같은 오류와 진단으로 끊는다', () => {
    const { root } = createTestTree({ type: 'object', default: { rows: [{}] },
      properties: { rows: { $ref: '#/$defs/Rows' } }, $defs: {
        Rows: { type: 'array', default: [{}], items: {
          type: 'object', properties: { next: { $ref: '#/$defs/Rows' } },
        } },
      },
    });
    expect(() => writeSchemaNode(root, undefined, 'load', SetValueOption.Overwrite))
      .toThrow(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED',
        message: expect.stringContaining('Recursive shape diverged at ') }));
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'recursion' });
  });
});

/** The array D creates the item before its a→b→c→d gates can flip. */
const gatedItemSchema: BlueprintSchema = { type: 'array', default: [{}], items: {
  type: 'object', properties: {
    a: { type: 'boolean', default: true },
    b: { type: 'boolean', default: true, controls: { active: '../a === true' } },
    c: { type: 'boolean', default: true, controls: { active: '../b === true' } },
    d: { type: 'boolean', default: true, controls: { active: '../c === true' } },
  },
} };

// filid:contract settle-recursive-fill
describe('92C-03 첫 평가와 게이트 뒤집힘의 라운드', () => {
  it('뒤집힌 게이트가 만든 branch의 무게이트 자손도 다음 라운드에 채운다', () => {
    const compute = vi.spyOn(calculation, 'computeNode');
    const collect = vi.spyOn(descendants, 'collectFillDescendants');
    try {
      const root = loadGeneric({ type: 'array', default: [{}], items: {
        type: 'object', properties: {
          a: { type: 'boolean', default: true },
          branch: { type: 'object', controls: { active: '../a === true' },
            properties: { label: { type: 'string', default: 'next-round' } } },
        },
      } });
      expect(root.emit).toEqual([{ a: true, branch: { label: 'next-round' } }]);
      const continuations = collect.mock.results.filter(result => result.value !== undefined).length;
      expect(continuations).toBe(1);
      expect(compute.mock.calls.filter(([node]) => node.parent === null).length - 1 - continuations).toBe(2);
    } finally { compute.mockRestore(); collect.mockRestore(); }
  });
  it('새로 채운 배열의 아이템 게이트 첫 평가는 같은 라운드로 이어진다', () => {
    const compute = vi.spyOn(calculation, 'computeNode');
    const collect = vi.spyOn(descendants, 'collectFillDescendants');
    try {
      const root = loadGeneric({ type: 'array', default: [{}], items: {
        type: 'object', properties: { nested: { type: 'array', default: [{}], items: {
          type: 'object', controls: { active: 'true' },
          properties: { label: { type: 'string', default: 'filled' } },
        } } },
      } });
      expect(root.emit).toEqual([{ nested: [{ label: 'filled' }] }]);
      const continuations = collect.mock.results.filter(result => result.value !== undefined).length;
      expect(compute.mock.calls.filter(([node]) => node.parent === null).length - 1 - continuations).toBe(1);
    } finally { compute.mockRestore(); collect.mockRestore(); }
  });
  it('배열 D의 a→b→c→d는 이어 채움 1회와 전이 4회, 상한 4로 안정된다', () => {
    const compute = vi.spyOn(calculation, 'computeNode');
    const collect = vi.spyOn(descendants, 'collectFillDescendants');
    try {
      const root = loadGeneric(gatedItemSchema);
      expect(transitionCap.getTransitionCap(root.runtime.blueprint)).toBe(4);
      expect(root.emit).toEqual([{ a: true, b: true, c: true, d: true }]);
      expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
      const continuations = collect.mock.results.filter(result => result.value !== undefined).length;
      expect(continuations).toBe(1);
      // One initial calculation, four counted writes, and one continued fill.
      expect(compute.mock.calls.filter(([node]) => node.parent === null).length - 1 - continuations).toBe(4);
    } finally { compute.mockRestore(); collect.mockRestore(); }
  });

  it('이미 평가한 게이트의 사슬이 전이 상한을 넘으면 BUDGET_EXCEEDED로 끝난다', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      allow: { type: 'boolean' }, rows: { type: 'array', default: [{}],
        items: { $ref: '#/$defs/Item' } },
    }, $defs: { Item: { type: 'object', properties: {
      enabled: { type: 'boolean', default: true },
      next: { type: 'array', default: [{}], items: { $ref: '#/$defs/Item' },
        controls: { active: '../enabled === true' } },
      distant: { type: 'boolean', controls: {
        active: `${'../'.repeat(20)}allow === true`,
      } },
    } } } });
    expect(transitionCap.getTransitionCap(root.runtime.blueprint)).toBe(3);
    expect(() => writeSchemaNode(root, { allow: true }, 'load', SetValueOption.Overwrite))
      .toThrow(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' }));
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'transition', iterations: 3 });
  });

  it('게이트 없는 배열 D의 아이템 자손은 전이 1회에 채운다', () => {
    const compute = vi.spyOn(calculation, 'computeNode');
    const collect = vi.spyOn(descendants, 'collectFillDescendants');
    try {
      const root = loadGeneric({ type: 'array', default: [{}], items: itemSchema });
      expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
      expect(root.emit).toEqual([{ value: -1, label: 'item', priority: 'control' }]);
      expect(transitionCap.getTransitionCap(root.runtime.blueprint)).toBe(1);
      const continuations = collect.mock.results.filter(result => result.value !== undefined).length;
      expect(compute.mock.calls.filter(([node]) => node.parent === null).length - 1 - continuations).toBe(1);
    } finally { compute.mockRestore(); collect.mockRestore(); }
  });
});
