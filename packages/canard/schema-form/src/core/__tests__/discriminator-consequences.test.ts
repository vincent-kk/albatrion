import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';
import type { JSONSchema } from '../../types';

describe('discriminator selection consequences', () => {
  it('C7 selects both anyOf branches sharing one tag and closes both on another value', () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'string' } },
      anyOf: [
        {
          properties: {
            kind: { const: 'shared' },
            first: { type: 'string', default: 'first' },
          },
        },
        {
          properties: {
            kind: { const: 'shared' },
            second: { type: 'string', default: 'second' },
          },
        },
      ],
    } satisfies JSONSchema;
    const node = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { kind: 'shared' },
    });
    expect(node.value).toEqual({
      kind: 'shared',
      first: 'first',
      second: 'second',
    });
    node.find('/kind')?.setValue('none');
    expect(node.value).toEqual({ kind: 'none' });
    node.find('/kind')?.setValue('shared');
    expect(node.value).toEqual({
      kind: 'shared',
      first: 'first',
      second: 'second',
    });
  });

  it('C9 selects every tag kind admitted by the host tag union', () => {
    const schema = {
      type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: ['string', 'number'] } },
      oneOf: [
        {
          properties: {
            kind: { const: 'a' },
            text: { type: 'string', default: 'text' },
          },
        },
        {
          properties: {
            kind: { const: 1 },
            numeric: { type: 'number', default: 7 },
          },
        },
      ],
    } satisfies JSONSchema;
    const node = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { kind: 'a' },
    });
    expect(node.value).toEqual({ kind: 'a', text: 'text' });
    node.find('/kind')?.setValue(1);
    expect(node.value).toEqual({ kind: 1, numeric: 7 });
    node.find('/kind')?.setValue('a');
    expect(node.value).toEqual({ kind: 'a', text: 'text' });
  });

  it('C12 selects independent unions with different keys on the same node', () => {
    const schema = {
      type: 'object',
      properties: {
        target: {
          type: 'object',
          properties: { kind: { type: 'string' }, mode: { type: 'string' } },
          controls: { discriminator: 'kind' },
          oneOf: [
            {
              properties: {
                kind: { const: 'a' },
                first: { type: 'string', default: 'first' },
              },
            },
            {
              properties: {
                kind: { const: 'b' },
                second: { type: 'string', default: 'second' },
              },
            },
          ],
        },
      },
      allOf: [
        {
          properties: {
            target: {
              type: 'object',
              controls: { discriminator: 'mode' },
              oneOf: [
                {
                  properties: {
                    mode: { const: 'x' },
                    left: { type: 'string', default: 'left' },
                  },
                },
                {
                  properties: {
                    mode: { const: 'y' },
                    right: { type: 'string', default: 'right' },
                  },
                },
              ],
            },
          },
        },
      ],
    } satisfies JSONSchema;
    const node = nodeFromJSONSchema({
      jsonSchema: schema,
      defaultValue: { target: { kind: 'a', mode: 'x' } },
    });
    expect(node.value).toEqual({
      target: { kind: 'a', mode: 'x', first: 'first', left: 'left' },
    });
    node.find('/target/kind')?.setValue('b');
    expect(node.value).toEqual({
      target: { kind: 'b', mode: 'x', second: 'second', left: 'left' },
    });
    node.find('/target/mode')?.setValue('y');
    expect(node.value).toEqual({
      target: { kind: 'b', mode: 'y', second: 'second', right: 'right' },
    });
  });
});
