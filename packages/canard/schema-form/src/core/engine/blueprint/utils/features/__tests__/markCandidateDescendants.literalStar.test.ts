import { expect, it } from 'vitest';

import { blueprint } from '../../../blueprint';

it('leaves ordinary array templates and star-like property names unmarked', () => {
  const result = blueprint({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        '*suffix': { type: 'string' },
        'slash/*': { type: 'string' },
      },
    },
  });
  for (const node of result.nodes)
    expect(Object.keys(node)).not.toContain('containsLiteralStar');
});

it('propagates a nested literal star without inventing candidate descendants', () => {
  const result = blueprint({
    type: 'object',
    properties: {
      group: { type: 'object', properties: { '*': { type: 'string' } } },
      ordinary: { type: 'string' },
    },
  });
  expect(result.root.containsLiteralStar).toBe(true);
  expect(
    result.root.childEntries.find((entry) => entry.name === 'group')!.node
      .containsLiteralStar,
  ).toBe(true);
  expect(
    result.root.childEntries.find((entry) => entry.name === 'ordinary')!.node
      .containsLiteralStar,
  ).toBeUndefined();
  expect(result.root.hasCandidateDescendants).not.toBe(true);
});

it('propagates the fact through repeated and tuple item edges', () => {
  const result = blueprint({
    type: 'array',
    prefixItems: [{ type: 'object', properties: { '*': { type: 'string' } } }],
    items: { type: 'object', properties: { '*': { type: 'number' } } },
  });
  expect(result.root.containsLiteralStar).toBe(true);
  expect(result.root.item!.containsLiteralStar).toBe(true);
  expect(result.root.prefixItems![0].containsLiteralStar).toBe(true);
});

it('marks recursive reference templates without expanding occurrences', () => {
  const result = blueprint({
    $ref: '#/$defs/Node',
    $defs: {
      Node: {
        type: 'object',
        properties: {
          '*': { type: 'string' },
          next: { type: 'array', items: { $ref: '#/$defs/Node' } },
        },
      },
    },
  });
  expect(result.root.containsLiteralStar).toBe(true);
  expect(
    result.root.childEntries.find((entry) => entry.name === 'next')!.node
      .containsLiteralStar,
  ).toBe(true);
});

it('does not confuse recursive array item addresses with literal-star bindings', () => {
  const result = blueprint({
    $ref: '#/$defs/Node',
    $defs: {
      Node: {
        type: 'object',
        properties: {
          children: { type: 'array', items: { $ref: '#/$defs/Node' } },
          tuple: { type: 'array', prefixItems: [{ type: 'string' }] },
        },
      },
    },
  });
  for (const node of result.nodes)
    expect(Object.keys(node)).not.toContain('containsLiteralStar');
});

it('includes unselected authored fragments in the static fact', () => {
  const result = blueprint({
    type: 'object',
    properties: { ordinary: { type: 'string' } },
    allOf: [
      { controls: { active: false }, properties: { '*': { type: 'string' } } },
    ],
  });
  expect(result.root.containsLiteralStar).toBe(true);
});
