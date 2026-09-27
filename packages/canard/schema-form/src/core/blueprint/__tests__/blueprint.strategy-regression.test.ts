import { describe, expect, it } from 'vitest';

import { blueprint, mergeEffectiveSchema } from '../index';

describe('declaration-only strategy regression', () => {
  it('does not apply branch overlay terminal hints to a static host', () => {
    const node = blueprint({
      type: 'object',
      oneOf: [{ options: { terminal: true } }],
    }).root;
    expect(node.strategy).toBe('branch');
    expect(mergeEffectiveSchema(node, [])).not.toHaveProperty(
      'options.terminal',
    );
  });

  it('does not apply a nested conditional overlay in a declaration-only branch', () => {
    const node = blueprint({
      type: 'object',
      oneOf: [
        {
          properties: {
            a: {
              type: 'object',
              if: {},
              then: { options: { terminal: true } },
            },
          },
        },
      ],
    }).root.childEntries[0].node;
    expect(node.strategy).toBe('branch');
    expect(
      mergeEffectiveSchema(
        node,
        node.declarations.map((declaration) => declaration.id),
      ),
    ).not.toHaveProperty('options.terminal');
  });
});
