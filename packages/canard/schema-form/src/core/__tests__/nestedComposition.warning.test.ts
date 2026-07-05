import { afterEach, describe, expect, it, vi } from 'vitest';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

describe('nested composition ignored — dev warning', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns and drops a oneOf nested inside a oneOf branch', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
      oneOf: [
        {
          computed: { if: "./kind === 'a'" },
          properties: { base: { type: 'number' } },
          oneOf: [{ properties: { nested: { type: 'string' } } }],
        },
        {
          computed: { if: "./kind === 'b'" },
          properties: { other: { type: 'number' } },
        },
      ],
    } as unknown as JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema: schema as any,
      onChange: () => {},
    }) as ObjectNode;

    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toContain(
      'SCHEMA_FORM_WARNING.NESTED_COMPOSITION_IGNORED_FOR_FORM',
    );
    expect(warn.mock.calls[0][0]).toContain("'oneOf' inside 'oneOf'");
    // The nested field is not expanded into the tree.
    expect(node.find('nested')).toBeNull();
  });

  it('warns for an anyOf nested inside a oneOf branch', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['a'], default: 'a' } },
      oneOf: [
        {
          computed: { if: "./kind === 'a'" },
          properties: { base: { type: 'number' } },
          anyOf: [{ properties: { nested: { type: 'string' } } }],
        },
      ],
    } as unknown as JsonSchema;

    nodeFromJsonSchema({ jsonSchema: schema as any, onChange: () => {} });

    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toContain("'anyOf' inside 'oneOf'");
  });

  it('does not warn for a flat oneOf without nested composition', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schema = {
      type: 'object',
      properties: { kind: { type: 'string', enum: ['a', 'b'], default: 'a' } },
      oneOf: [
        {
          computed: { if: "./kind === 'a'" },
          properties: { base: { type: 'number' } },
        },
        {
          computed: { if: "./kind === 'b'" },
          properties: { other: { type: 'number' } },
        },
      ],
    } as unknown as JsonSchema;

    nodeFromJsonSchema({ jsonSchema: schema as any, onChange: () => {} });

    expect(warn).not.toHaveBeenCalled();
  });
});
