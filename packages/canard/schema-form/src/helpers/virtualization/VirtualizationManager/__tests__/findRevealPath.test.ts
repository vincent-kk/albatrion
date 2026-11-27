// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { DeferredGate } from '../types/deferredGate';
import { findRevealPath } from '../utils/findRevealPath';

/** Physical chain with a virtual group at its middle object. */
const root = nodeFromJSONSchema({
  jsonSchema: {
    type: 'object',
    properties: {
      branch: {
        type: 'object',
        properties: { target: { type: 'string' } },
        options: { virtual: { group: { fields: ['target'] } } },
      },
      sibling: { type: 'string' },
    },
  },
});
/** Concrete leaf referenced from both its parent and the virtual group. */
const target = root.find('/branch/target')!;
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('includes physical ancestors and intermediate virtual groups in the render path', () => {
  const element = document.body.appendChild(document.createElement('div'));
  const gate = { node: root.find('/branch')!, reveal: vi.fn() };
  const result = findRevealPath(target, new Map([[element, gate]]), new Map());
  expect(result?.element).toBe(element);
  expect(result?.renderPath).toEqual(
    expect.arrayContaining([
      root,
      target,
      gate.node,
      root.find('/branch/group'),
    ]),
  );
});
it('chooses the first DOM position across waiting, revealing and virtual group gates', () => {
  const first = document.body.appendChild(document.createElement('div'));
  const second = document.body.appendChild(document.createElement('div'));
  const waiting = new Map<Element, DeferredGate>([
    [second, { node: target, reveal: vi.fn() }],
  ]);
  const revealing = new Map<Element, DeferredGate>([
    [first, { node: root.find('/branch/group')!, reveal: vi.fn() }],
  ]);
  expect(findRevealPath(target, waiting, revealing)?.element).toBe(first);
});
it('does not confuse a sibling or missing gate with the render path', () => {
  const element = document.body.appendChild(document.createElement('div'));
  expect(
    findRevealPath(
      target,
      new Map([[element, { node: root.find('/sibling')!, reveal: vi.fn() }]]),
      new Map(),
    ),
  ).toBeNull();
});
it('rejects a non-present target and a target below a terminal ancestor', () => {
  const hidden = nodeFromJSONSchema({
    jsonSchema: { type: 'string', controls: { visible: false } },
  });
  const terminal = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: { child: { type: 'string' } } },
  });
  const element = document.createElement('div');
  expect(
    findRevealPath(
      hidden,
      new Map([[element, { node: hidden, reveal: vi.fn() }]]),
      new Map(),
    ),
  ).toBeNull();
  const child = terminal.find('/child');
  expect(child).not.toBeNull();
  vi.spyOn(terminal, 'strategy', 'get').mockReturnValue('terminal');
  expect(
    findRevealPath(
      child!,
      new Map([[element, { node: terminal, reveal: vi.fn() }]]),
      new Map(),
    ),
  ).toBeNull();
});
