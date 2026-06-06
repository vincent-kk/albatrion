import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { ObjectNode } from '../nodes/ObjectNode';

/**
 * Companion guards to `BranchStrategy.oneOf.initialRace`.
 *
 * The initial-render race fix made `__children__` start empty (`[]`) and be
 * settled synchronously inside `initialize()` via `__primeInitialBranch__()`
 * + `__processChildren__()`. This file guards the two contracts that the race
 * file does NOT cover:
 *
 *   1. COMPUTED INTEGRITY — Unlike `children` (captured once via
 *      `useState(node.children)` and refreshed only on the microtask-deferred
 *      `UpdateChildren`), PURE computed properties (`visible`/`readOnly`/
 *      `computeManager.active`) are read from getters on every render and
 *      recalculated synchronously inside `super.__initialize__()`. They are
 *      already correct in the synchronous snapshot, with no microtask drain —
 *      this is *why* they are immune to the race that hit oneOf children. The
 *      scope-gated part of `active` for a oneOf branch child settles one
 *      microtask later (via `__updateScoped__`), yet is still safe: because the
 *      list is settled synchronously the child is already mounted and recovers
 *      through its `UpdateComputedProperties` tracker.
 *
 *   2. FILTERING HARMLESSNESS — Because `__children__` now starts empty, the
 *      `__emitChange__` call at the end of the constructor runs
 *      `__processComputedProperties__` over an empty list (a no-op). These tests
 *      guard that the inactive-child value exclusion still holds once
 *      initialization settles, i.e. the empty-start is harmless.
 */

const employmentSchema: JsonSchema = {
  type: 'object',
  properties: {
    employmentType: {
      type: 'string',
      enum: ['full_time', 'part_time'],
      default: 'full_time',
    },
    showSecret: { type: 'boolean', default: false },
    // Root-level child, inactive on mount (showSecret === false). Its default
    // value must be excluded from the committed object value.
    secret: {
      type: 'string',
      default: 'secret-value',
      computed: { active: '../showSecret === true' },
    },
  },
  oneOf: [
    {
      properties: {
        employmentType: { const: 'full_time' },
        salary: { type: 'number', default: 60000 },
      },
    },
    {
      properties: {
        employmentType: { const: 'part_time' },
        workingHours: { type: 'number', default: 20 },
      },
    },
  ],
};

const childByName = (node: ObjectNode, name: string) =>
  node.children?.find((child) => child.node.name === name)?.node ?? null;

describe('BranchStrategy oneOf - initial computed-property integrity', () => {
  it('SYNC: pure computed props (visible / computeManager.active) resolve synchronously after construction', () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    // oneOf branch child: list membership is settled synchronously (the fix),
    // and its PURE computed `visible` is already correct with no microtask —
    // pure computed props are recalculated inside super.__initialize__().
    const salary = childByName(node, 'salary');
    expect(salary).not.toBeNull();
    expect(salary?.visible).toBe(true);

    // Root child's PURE computed `active` (= computeManager.active, no scope
    // gate) is already false synchronously. This is the structural reason
    // visible/enabled never suffered the oneOf children race: getters read live
    // state recalculated during __initialize__, never a microtask-deferred snapshot.
    const secret = childByName(node, 'secret');
    expect(secret).not.toBeNull();
    expect(secret?.active).toBe(false);
  });

  it('SCOPED branch membership settles in the microtask, not in the synchronous prime', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    // `active` === computeManager.active && __scoped__. For a oneOf branch child
    // __scoped__ is set by __updateScoped__ comparing parent.oneOfIndex to the
    // child's variant. At construction parent.oneOfIndex is still -1, so the
    // synchronous __primeInitialBranch__ (which only snaps the list, never
    // resets children) leaves scope-gated `active` false.
    const salarySync = childByName(node, 'salary');
    expect(salarySync?.active).toBe(false);

    await delay();

    // __processOneOfChildren__ runs in the microtask and calls
    // __reset__({ updateScoped: true }), flipping __scoped__ to true. This is
    // safe precisely BECAUSE the list was settled synchronously: the child's
    // SchemaNodeProxy is already mounted and recovers via its
    // UpdateComputedProperties tracker — unlike the children race, where a
    // missing list entry meant the node was never mounted at all.
    const salarySettled = childByName(node, 'salary');
    expect(salarySettled?.active).toBe(true);
  });

  it('HARMLESS EMPTY-START: inactive child value is excluded from node.value once settled', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    await delay();

    const value = node.value as Record<string, unknown>;
    // Active oneOf branch field is committed...
    expect(value.salary).toBe(60000);
    // ...while the inactive root child's default is filtered out, even though
    // the constructor's __processComputedProperties__ ran over an empty
    // __children__ list. The empty-start is harmless.
    expect(value.secret).toBeUndefined();
  });

  it('reactivates the filtered child when its computed condition turns true', async () => {
    const node = nodeFromJsonSchema({
      onChange: () => {},
      jsonSchema: employmentSchema,
    }) as ObjectNode;

    await delay();
    expect((node.value as Record<string, unknown>).secret).toBeUndefined();

    // Flip the dependency: the previously inactive child must re-enter the value.
    const showSecret = childByName(node, 'showSecret') as BooleanNode | null;
    showSecret?.setValue(true);
    await delay();

    const secret = childByName(node, 'secret');
    expect(secret?.active).toBe(true);
    expect((node.value as Record<string, unknown>).secret).toBe('secret-value');
  });
});
