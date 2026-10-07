import { afterEach, expect, it, vi } from 'vitest';

import { BEHAVIORS } from '../../../../behaviors';
import { dispatchMount, dispatchSetValue, subscribeSchemaNode } from '../../../../dispatch';
import { SetValueOption } from '../../../../types/value';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';

afterEach(() => vi.restoreAllMocks());

/** Follow value edges, including symbol keys, without visiting an object twice. */
const containsHint = (value: unknown, hints: readonly object[]): boolean => {
  const pending: unknown[] = [value];
  const seen = new Set<object>();
  while (pending.length) {
    const current = pending.pop();
    if (current === null || typeof current !== 'object') continue;
    if (hints.includes(current)) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const key of Reflect.ownKeys(current)) pending.push(Reflect.get(current, key));
  }
  return false;
};

it('never exposes any hint through emitted values or delivered payloads', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    nested: { type: 'object', properties: { value: { type: 'number', default: 1 } } },
    tail: { type: 'number', default: 2 },
  }, options: { virtual: { combined: { fields: ['nested', 'tail'] } } } });
  const hints: object[] = [];
  const payloads: unknown[] = [];
  const attach = (node: PlainNode) => {
    const row = BEHAVIORS[node.behavior.type]?.[node.behavior.strategy];
    if (!row) throw new Error(`No behavior row for ${node.path}`);
    vi.spyOn(node.behavior, 'assemble').mockImplementation((current, children, changed, hint) => {
      if (hint && !hints.includes(hint)) hints.push(hint);
      return Reflect.apply(row.assemble, undefined, [current, children, changed, hint]);
    });
    subscribeSchemaNode(node, event => payloads.push(event));
  };
  attach(root);
  const factory = root.runtime.nodeFactory;
  root.runtime.nodeFactory = (entry, parent, runtime) => {
    const node = factory(entry, parent, runtime);
    attach(node);
    return node;
  };
  dispatchMount(root, undefined, SetValueOption.Overwrite);
  for (const value of [3, 4, 1, 1])
    dispatchSetValue(root.structure!.nested.structure!.value, value, SetValueOption.Overwrite);
  expect(hints.length).toBeGreaterThan(0);
  expect(payloads.length).toBeGreaterThan(0);
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    expect(containsHint(node.emit, hints), node.path).toBe(false);
    expect(containsHint(node.local, hints), node.path).toBe(false);
    expect(containsHint(node.pendingDelivery?.payload, hints), node.path).toBe(false);
    for (const child of node.children ?? []) if (child.parent === node) pending.push(child);
  }
  expect(containsHint(payloads, hints)).toBe(false);
});
