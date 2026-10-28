import { describe, expect, it } from 'vitest';

import { blueprint } from '../../../blueprint';

const item = (controls?: Record<string, unknown>) => ({
  type: 'object' as const,
  properties: {
    drop: { type: 'number' as const },
    keep: { type: 'number' as const, ...(controls ? { controls } : null) },
  },
});

describe('explicit keep declarations below a template', () => {
  it('marks the array when an item descendant declares unsetOnInactive false', () => {
    const analysis = blueprint({
      type: 'array',
      items: item({ unsetOnInactive: false }),
    });
    expect(analysis.root.hasKeepDescendants).toBe(true);
  });

  it('marks the array when an item descendant declares an expression', () => {
    const analysis = blueprint({
      type: 'array',
      items: item({ unsetOnInactive: '#/clear' }),
    });
    expect(analysis.root.hasKeepDescendants).toBe(true);
  });

  it('marks the array when the item itself declares a keep', () => {
    const analysis = blueprint({
      type: 'array',
      items: { type: 'string', controls: { unsetOnInactive: false } },
    });
    expect(analysis.root.hasKeepDescendants).toBe(true);
  });

  it('marks a host whose controls.fields address a child with a keep', () => {
    const analysis = blueprint({
      type: 'object',
      properties: { a: { type: 'string' } },
      controls: {
        fields: [{ targets: ['a'], controls: { unsetOnInactive: false } }],
      },
    });
    expect(analysis.root.hasKeepDescendants).toBe(true);
  });

  it('marks every ancestor on the path to the declaration', () => {
    const analysis = blueprint({
      type: 'object',
      properties: {
        list: { type: 'array', items: item({ unsetOnInactive: false }) },
      },
    });
    expect(analysis.root.hasKeepDescendants).toBe(true);
    expect(analysis.root.childEntries[0].node.hasKeepDescendants).toBe(true);
  });

  it('leaves arrays without any keep declaration unmarked', () => {
    const analysis = blueprint({ type: 'array', items: item() });
    expect(analysis.root.hasKeepDescendants).toBeUndefined();
  });

  it('does not count a literal clear declaration as a keep', () => {
    const analysis = blueprint({
      type: 'array',
      controls: { unsetOnInactive: true },
      items: item({ unsetOnInactive: true }),
    });
    expect(analysis.root.hasKeepDescendants).toBeUndefined();
  });

  it('does not count the array own keep as a descendant keep', () => {
    const analysis = blueprint({
      type: 'array',
      controls: { unsetOnInactive: false },
      items: item(),
    });
    expect(analysis.root.hasKeepDescendants).toBeUndefined();
  });

  it('marks a recursive template that reaches a keep', () => {
    const analysis = blueprint({
      type: 'object',
      properties: {
        keep: { type: 'string', controls: { unsetOnInactive: false } },
        children: { type: 'array', items: { $ref: '#' } },
      },
    });
    expect(analysis.root.hasKeepDescendants).toBe(true);
  });
});
