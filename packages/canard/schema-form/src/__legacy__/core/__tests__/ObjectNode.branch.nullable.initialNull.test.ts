import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ArrayNode } from '../nodes/ArrayNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/** `write`-shaped schema: every key is a required nullable object whose `null` means "not mapped". */
const stateMapSchema = {
  type: 'object',
  properties: {
    write: {
      type: 'object',
      properties: {
        open: {
          type: ['object', 'null'],
          properties: { labels: { type: 'array', items: { type: 'string' } } },
        },
        hold: {
          type: ['object', 'null'],
          properties: { labels: { type: 'array', items: { type: 'string' } } },
        },
        closed: {
          type: ['object', 'null'],
          properties: {
            labels: { type: 'array', items: { type: 'string' } },
            stateReason: { type: ['string', 'null'], default: null },
          },
        },
      },
      required: ['open', 'hold', 'closed'],
    },
  },
  required: ['write'],
} satisfies JSONSchema;

describe('ObjectNode branch nullable — initial null survives child initialization', () => {
  it('배열 자식의 초기 emit이 null 객체를 승격시키지 않아야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: { labels: { type: 'array', items: { type: 'string' } } },
          },
        },
      },
      defaultValue: { target: null },
    });
    await delay();

    expect(node.find('target')?.value).toBeNull();
    expect(node.value).toEqual({ target: null });
  });

  it.each([
    ['default: null', { type: ['string', 'null'], default: null }],
    ["default: 'x'", { type: 'string', default: 'x' }],
  ] as const)(
    '자식의 %s 초기 emit이 null 객체를 승격시키지 않아야 함',
    async (_label, reason) => {
      const node = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: ['object', 'null'], properties: { reason } },
          },
        },
        defaultValue: { target: null },
      });
      await delay();

      expect(node.find('target')?.value).toBeNull();
      expect(node.value).toEqual({ target: null });
    },
  );

  it('스키마 default: null 만으로도 null 객체가 보존되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            default: null,
            properties: {
              labels: { type: 'array', items: { type: 'string' } },
              reason: { type: ['string', 'null'], default: null },
            },
          },
        },
      },
    });
    await delay();

    expect(node.value).toEqual({ target: null });
  });

  it('required nullable 객체 키가 모두 null로 출력되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: stateMapSchema,
      defaultValue: { write: { open: null, hold: null, closed: null } },
    });
    await delay();

    expect(node.value).toEqual({
      write: { open: null, hold: null, closed: null },
    });
  });

  it('초기화 후 자식에 값을 쓰면 null 객체가 그 자식 값으로 승격되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: stateMapSchema,
      defaultValue: { write: { open: null, hold: null, closed: null } },
    });
    await delay();

    (node.find('write/closed/stateReason') as StringNode).setValue('completed');
    await delay();

    expect((node.find('write/closed') as ObjectNode).value).toEqual({
      stateReason: 'completed',
    });
    expect(node.value).toEqual({
      write: { open: null, hold: null, closed: { stateReason: 'completed' } },
    });
  });

  it('초기화 후 값 없는 자식 emit은 null 객체를 승격시키지 않아야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: stateMapSchema,
      defaultValue: { write: { open: null, hold: null, closed: null } },
    });
    await delay();

    (node.find('write/open/labels') as ArrayNode).setValue([]);
    await delay();

    expect(node.find('write/open')?.value).toBeNull();
    expect(node.value).toEqual({
      write: { open: null, hold: null, closed: null },
    });
  });
});
