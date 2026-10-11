import { describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { arrangeSchemaNodeItems, writeSchemaNode } from '../index';
import * as independentDefaults from '../utils/compute/utils/hasIndependentLeafDefaults';
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

// filid:contract settle-array
describe('90C-01 같은 전이 라운드의 호스트 채움 자손', () => {
  it.each([1, 1000])('배열 D의 %i개 아이템은 명시 원본을 보존하고 없는 자손을 채운다', count => {
    const defaults = Array.from({ length: count }, (_, value) => ({ value }));
    const root = loadGeneric({ type: 'array', default: defaults, items: itemSchema });
    expect(root.emit).toEqual(defaults.map(({ value }) => ({
      value, label: 'item', priority: 'control',
    })));
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
    expect(root.runtime.commitNumber).toBe(1);
    expect(defaults).toEqual(Array.from({ length: count }, (_, value) => ({ value })));
  });

  it('아이템 안 배열 D가 만든 자손도 같은 라운드에서 채운다', () => {
    const root = loadGeneric({ type: 'array', default: [{}], items: {
      type: 'object', properties: {
        nested: { type: 'array', default: [{ value: 7 }], items: itemSchema },
      },
    } });
    expect(root.emit).toEqual([{ nested: [{ value: 7, label: 'item', priority: 'control' }] }]);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('객체 D가 제공한 배열 안의 없는 자손도 채운다', () => {
    const root = loadGeneric({ type: 'object', default: { items: [{ value: 8 }] },
      properties: { items: { type: 'array', items: itemSchema } },
    });
    expect(root.emit).toEqual({ items: [{ value: 8, label: 'item', priority: 'control' }] });
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('DisableAutomaticWrites는 배열 D와 명시 아이템의 자손 채움을 모두 억제한다', () => {
    const schema: BlueprintSchema = { type: 'array', default: [{ value: 1 }], items: itemSchema };
    const option = SetValueOption.Overwrite | SetValueOption.DisableAutomaticWrites;
    expect(loadGeneric(schema, undefined, option).emit).toEqual([]);
    const supplied = loadGeneric(schema, [{ value: 2 }], option);
    expect(supplied.emit).toEqual([{ value: 2 }]);
    expect(supplied.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('WRITE-088 push(v)는 기존 아이템을 유지하고 새 아이템의 없는 자손만 채운다', () => {
    const root = loadGeneric({ type: 'array', items: itemSchema }, [{ value: 3, label: 'given' }]);
    const first = root.children![0];
    expect(arrangeSchemaNodeItems(root, { kind: 'push', value: { value: 4 } })).toBe(2);
    expect(root.children![0]).toBe(first);
    expect(root.emit).toEqual([
      { value: 3, label: 'given', priority: 'control' },
      { value: 4, label: 'item', priority: 'control' },
    ]);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('BLUEPRINT-030 자동 기본값이 같은 재귀 배열을 다시 낳으면 정착 오류로 끊는다', () => {
    expect(() => loadGeneric({ type: 'array', default: [{}], items: {
      type: 'object', properties: { next: { $ref: '#' } },
    } })).toThrow(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED' }));
  });

  it('채움 자손에 기본값이 없어도 게이트가 낸 형제는 다음 라운드에서 채운다', () => {
    const root = loadGeneric({ type: 'object', default: { rows: [{}], enabled: true },
      properties: {
        rows: { type: 'array', items: { type: 'object', properties: { empty: { type: 'string' } } } },
        enabled: { type: 'boolean' },
        gated: { type: 'string', default: 'gate', controls: { active: '../enabled' } },
      },
    });
    expect(root.structure!.gated.raw).toBe('gate');
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('배열 D가 만든 아이템은 채움 전에 unset과 derived의 우선순위를 적용한다', () => {
    const root = loadGeneric({ type: 'array', default: [{ value: 3 }], items: {
      type: 'object', properties: {
        value: { type: 'number' },
        hidden: { type: 'string', default: 'fill', controls: { unsetValue: 'true' } },
        derived: { type: 'number', default: -1, controls: { derived: '../value + 1' } },
      },
    } });
    expect(root.emit).toEqual([{ value: 3, derived: 4 }]);
    expect(root.children![0].structure!.hidden.raw).toBeUndefined();
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('재귀 게이트의 상대 읽기가 원본 조상에 닿는 동안 유한 기본값 확장을 허용한다', () => {
    const root = loadGeneric({ type: 'object', properties: {
      allow: { type: 'boolean' }, children: { $ref: '#/$defs/Children' },
    }, $defs: {
      Children: { type: 'array', default: [{ allow: false }],
        controls: { active: '../../../../../allow === true' }, items: { $ref: '#/$defs/Node' } },
      Node: { type: 'object', properties: {
        allow: { type: 'boolean' }, children: { $ref: '#/$defs/Children' },
      } },
    } }, { allow: true });
    expect(root.emit).toEqual({ allow: true, children: [{ allow: false,
      children: [{ allow: false, children: [{ allow: false }] }],
    }] });
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });
});
