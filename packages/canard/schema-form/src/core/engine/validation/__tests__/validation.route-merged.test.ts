import { expect, it } from 'vitest';

import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {
  JSONPointer as $,
  isDescendantPath,
  parsePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../record';
import type { ValidationIssue } from '../types/issue';
import { isOffUnionBranchIssue } from '../utils/route/isOffUnionBranchIssue';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';
import { updateFieldNodeGlobalErrors } from '../utils/route/updateFieldNodeGlobalErrors';

/** Identify a record owned by this tree without an unchecked type assertion. */
const isOwnedNode = <Self extends FieldNodeRecord<Self>>(
  candidate: unknown,
  runtime: Self['runtime'],
): candidate is Self =>
  candidate !== null &&
  typeof candidate === 'object' &&
  Reflect.get(candidate, 'runtime') === runtime;

/**
 * Replace displayed validator issues inside a requested live subtree.
 * @param target - Scope being validated; siblings keep their displayed issues.
 * @param issues - Ordered whole-schema verdict retained at form level.
 * @returns Nodes whose displayed validator issues changed.
 */
const sequentialRoute = <Self extends FieldNodeRecord<Self>>(
  target: Self,
  issues: readonly ValidationIssue[],
): Set<Self> => {
  const root = target.rootNode;
  const runtime = root.runtime;
  const before =
    runtime.validationErrors ?? new Map<unknown, readonly unknown[]>();
  const next = new Map<unknown, readonly unknown[]>(before);
  let activeIds: Optional<Set<number>>;
  if (issues.length > 0 && runtime.committedDeclarationIds?.size) {
    activeIds = new Set<number>();
    for (const ids of runtime.committedDeclarationIds.values())
      for (let index = 0; index < ids.length; index++)
        activeIds.add(ids[index]);
  }
  const inScope = (node: Self): boolean =>
    node === target || isDescendantPath(node.path, target.path);
  for (const node of before.keys())
    if (isOwnedNode<Self>(node, runtime) && inScope(node)) next.delete(node);
  for (let index = 0; index < issues.length; index++) {
    const issue = issues[index];
    if (isOffUnionBranchIssue(issue, runtime.blueprint, activeIds)) continue;
    const path = issue.dataPath;
    let node = root;
    if (path) {
      const parsed = parsePointer(path);
      if (!parsed.absolute) continue;
      const segments = parsed.segments;
      for (
        let segmentIndex = 0;
        segmentIndex < segments.length;
        segmentIndex++
      ) {
        const key = segments[segmentIndex];
        if (typeof key !== 'string') {
          node = root;
          break;
        }
        if (node.structure === null) break;
        if (!hasOwnProperty(node.structure, key)) {
          node = root;
          break;
        }
        const child = node.structure[key];
        if (!child) {
          node = root;
          break;
        }
        node = child;
      }
      if (node === root && path !== $.Root) continue;
    }
    if (issue.rejectedKey) {
      while (node.parent && node.structure === null) node = node.parent;
    }
    if (!inScope(node)) continue;
    const previous = next.get(node) ?? [];
    next.set(node, [...previous, issue]);
  }
  const changed = new Set<Self>();
  const candidates = new Set(before.keys());
  for (const node of next.keys()) candidates.add(node);
  for (const node of candidates) {
    if (!isOwnedNode<Self>(node, runtime) || !inScope(node)) continue;
    const current = node;
    const oldIssues = before.get(node) ?? [];
    const newIssues = next.get(node) ?? [];
    if (oldIssues.length !== newIssues.length) changed.add(current);
    else if (isSameItems(oldIssues, newIssues)) {
      if (newIssues.length) next.set(node, oldIssues);
    } else changed.add(current);
  }
  runtime.validationErrors = next;
  if (runtime.validationChangedNodes)
    for (const node of changed) runtime.validationChangedNodes.add(node);
  else runtime.validationChangedNodes = changed;
  if (runtime.routedValidationErrors !== issues) {
    runtime.routedValidationErrors = issues;
    runtime.validationListChanged = true;
    updateFieldNodeGlobalErrors(root);
  }
  for (const node of changed) runtime.combinedErrors?.delete(node);
  return changed;
};

/**
 * Compare two routed issue lists of equal length by item identity.
 * @param before - Issues the node held after the previous routing.
 * @param after - Issues routed to the node now.
 * @returns True when every position holds the same issue object.
 */
const isSameItems = (
  before: readonly unknown[],
  after: readonly unknown[],
): boolean => {
  for (let index = 0; index < before.length; index++)
    if (before[index] !== after[index]) return false;
  return true;
};

/** Compare the current route surface with the sequential observable oracle. */
const compareRoutes = (
  selection: 'siblings' | 'overlap' | 'root' | 'stale',
) => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: { a: { type: 'string' }, b: { type: 'string' } },
        },
        outside: { type: 'string' },
      },
    },
    defaultValue: { group: { a: 'a', b: 'b' }, outside: 'outside' },
    deferMountValidation: true,
    validationMode: 2,
  });
  const group = root.structure?.group;
  const a = group?.structure?.a;
  const b = group?.structure?.b;
  const outside = root.structure?.outside;
  if (!group || !a || !b || !outside)
    throw new Error('Missing route fixture nodes');
  const staleRoot = nodeFromJSONSchema({
    jsonSchema: {
      type: 'array',
      items: { type: 'object', properties: { a: { type: 'string' } } },
    },
    defaultValue: [{ a: 'old' }],
    deferMountValidation: true,
    validationMode: 2,
  });
  const stale = (staleRoot.children ?? [])[0];
  if (!stale) throw new Error('Missing stale fixture');
  staleRoot.remove(0);
  // This stale key belongs to the same runtime and records exactly the live target path.
  const staleKey = { runtime: root.runtime, path: group.path };
  const staleDescendant = { runtime: root.runtime, path: a.path + '/retired' };
  const foreign = { runtime: staleRoot.runtime, path: a.path };
  const same = { dataPath: a.path, message: 'retained' };
  const issues = [
    same,
    { dataPath: b.path, message: 'changed' },
    { dataPath: outside.path, message: 'outside' },
    { dataPath: a.path + '/deep', message: 'terminal' },
    { dataPath: a.path, rejectedKey: 'extra', message: 'host' },
    { dataPath: '/missing', message: 'ownerless' },
  ];
  const initial = new Map<unknown, readonly unknown[]>([
    [a, [same, issues[3]]],
    [b, [{ dataPath: b.path, message: 'old' }]],
    [outside, [{ dataPath: outside.path, message: 'keep' }]],
    [staleKey, [same]],
    [staleDescendant, [same]],
    [foreign, [same]],
  ]);
  const combined = new Map<unknown, readonly unknown[]>(
    [...initial].map(([node]) => [node, [{ marker: 'combined' }]]),
  );
  const runtime = root.runtime;
  const reset = () => {
    runtime.validationErrors = new Map(initial);
    runtime.combinedErrors = new Map(combined);
    runtime.validationChangedNodes = undefined;
    runtime.routedValidationErrors = undefined;
    runtime.validationListChanged = undefined;
    runtime.globalErrors = undefined;
  };
  const targets =
    selection === 'root'
      ? [group, root, a]
      : selection === 'overlap'
        ? [a, group, b]
        : selection === 'stale'
          ? [group]
          : [a, b];
  reset();
  const expectedReturn = new Set<typeof root>();
  for (const target of targets)
    for (const node of sequentialRoute(target, issues))
      expectedReturn.add(node);
  const expected = {
    errors: new Map(runtime.validationErrors),
    changed: new Set(runtime.validationChangedNodes),
    combined: new Map(runtime.combinedErrors),
    routed: runtime.routedValidationErrors,
    listChanged: runtime.validationListChanged,
    global: runtime.globalErrors,
  };
  reset();
  const actualReturn = new Set<typeof root>();
  for (const node of routeValidationIssues(targets, issues))
    actualReturn.add(node);
  expect(runtime.validationErrors).toEqual(expected.errors);
  expect(runtime.validationChangedNodes).toEqual(expected.changed);
  expect(actualReturn).toEqual(expectedReturn);
  expect(runtime.combinedErrors).toEqual(expected.combined);
  expect(runtime.routedValidationErrors).toBe(expected.routed);
  expect(runtime.validationListChanged).toBe(expected.listChanged);
  expect(runtime.globalErrors).toBe(expected.global);
  for (const [node, previous] of initial)
    if (expected.errors.get(node) === previous)
      expect(runtime.validationErrors?.get(node)).toBe(previous);
  if (selection === 'stale')
    expect(runtime.validationErrors?.get(staleKey)).toBe(initial.get(staleKey));
};

it('preserves sequential routing effects for disjoint target scopes', () =>
  compareRoutes('siblings'));
it('preserves sequential routing effects for overlapping nested targets', () =>
  compareRoutes('overlap'));
it('preserves sequential routing effects when a root target overlaps descendants', () =>
  compareRoutes('root'));
it('does not clear a stale key whose address equals the target address', () =>
  compareRoutes('stale'));

it('uses a detached target path for strict descendants without selecting its live replacement', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'array',
      items: { type: 'object', properties: { a: { type: 'string' } } },
    },
    defaultValue: [{ a: 'old' }, { a: 'live' }],
    deferMountValidation: true,
    validationMode: 2,
  });
  const retired = (root.children ?? [])[0];
  if (!retired) throw new Error('Missing retiring target');
  root.remove(0);
  const live = (root.children ?? [])[0];
  const child = live?.structure?.a;
  if (!live || !child) throw new Error('Missing replacement nodes');
  expect(retired.detached).toBe(true);
  const issue = { dataPath: '/0/a', message: 'descendant' };
  const prior = [{ dataPath: '/0', message: 'live replacement' }];
  const seed = new Map<unknown, readonly unknown[]>([
    [live, prior],
    [retired, [issue]],
  ]);
  root.runtime.validationErrors = new Map(seed);
  const expected = sequentialRoute(retired, [issue]);
  const expectedErrors = new Map(root.runtime.validationErrors);
  root.runtime.validationErrors = new Map(seed);
  root.runtime.validationChangedNodes = undefined;
  const actual = routeValidationIssues([retired], [issue]);
  expect(actual).toEqual(expected);
  expect(root.runtime.validationErrors).toEqual(expectedErrors);
  expect(root.runtime.validationErrors?.get(live)).toBe(prior);
  expect(root.runtime.validationErrors?.get(child)).toEqual([issue]);
});

it('filters an inactive union issue and preserves rejected-key host attribution in a merged root scope', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' }, value: { type: 'string' } },
      oneOf: [
        { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
        { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
      ],
    },
    defaultValue: { kind: 'x', value: 'a' },
    deferMountValidation: true,
    validationMode: 2,
  });
  const value = root.structure?.value;
  if (!value) throw new Error('Missing union value');
  const issues = [
    {
      dataPath: '/value',
      schemaPath: '#/oneOf/0/properties/value/minLength',
      message: 'active',
    },
    {
      dataPath: '/value',
      schemaPath: '#/oneOf/1/properties/value/minLength',
      message: 'inactive',
    },
    { dataPath: '/value', rejectedKey: 'extra', message: 'host' },
  ];
  sequentialRoute(root, issues);
  const expected = new Map(root.runtime.validationErrors);
  root.runtime.validationErrors = new Map();
  root.runtime.validationChangedNodes = undefined;
  routeValidationIssues([root], issues);
  expect(root.runtime.validationErrors).toEqual(expected);
  expect(root.runtime.validationErrors?.get(value)).toEqual([issues[0]]);
  expect(root.runtime.validationErrors?.get(root)).toEqual([issues[2]]);
  expect(root.runtime.globalErrors).toBe(issues);
});
