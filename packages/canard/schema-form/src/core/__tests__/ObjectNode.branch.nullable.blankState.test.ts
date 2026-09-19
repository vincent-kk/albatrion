import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

const schema = {
  type: 'object',
  properties: {
    quantity: { type: 'number', default: 2 },
    target: {
      type: ['object', 'null'],
      properties: {
        note: { type: 'string' },
        reason: { type: 'string', default: 'because' },
        state: { type: ['string', 'null'], default: null },
        labels: { type: 'array', items: { type: 'string' } },
        total: {
          type: 'number',
          computed: { derived: '(../../quantity || 0) * 10' },
        },
        inner: {
          type: 'object',
          properties: {
            code: { type: 'string', default: 'C' },
            memo: { type: 'string' },
          },
        },
      },
    },
  },
} satisfies JSONSchema;

const childPaths = [
  'target/note',
  'target/reason',
  'target/state',
  'target/labels',
  'target/total',
  'target/inner',
  'target/inner/code',
  'target/inner/memo',
];

const filled = {
  target: {
    note: 'typed',
    reason: 'edited',
    state: 'open',
    labels: ['x'],
    inner: { code: 'Z', memo: 'm' },
  },
};

/** Every way a form can bring `target` to `null`; each must leave the same blank subtree behind. */
const waysToNull: Record<string, () => Promise<ObjectNode>> = {
  'defaultValue null': async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: null },
    }) as ObjectNode;
    await delay(10);
    return root;
  },
  '노드 setValue(null)': async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: filled,
    }) as ObjectNode;
    await delay(10);
    (root.find('target') as ObjectNode).setValue(null);
    await delay(10);
    return root;
  },
  '루트 setValue({ target: null })': async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: filled,
    }) as ObjectNode;
    await delay(10);
    root.setValue({ quantity: 2, target: null });
    await delay(10);
    return root;
  },
};

const snapshot = (root: ObjectNode) =>
  Object.fromEntries(
    childPaths.map((path) => [path, root.find(path)?.value]),
  );

describe('ObjectNode branch nullable — every way to null leaves the same blank subtree', () => {
  it.each(Object.keys(waysToNull))(
    '%s: 자식이 스키마 기준 새 상태를 가져야 함',
    async (way) => {
      const root = await waysToNull[way]();

      expect(root.value).toEqual({ quantity: 2, target: null });
      expect(snapshot(root)).toEqual({
        'target/note': undefined,
        'target/reason': 'because',
        'target/state': null,
        'target/labels': [],
        'target/total': 20,
        'target/inner': { code: 'C' },
        'target/inner/code': 'C',
        'target/inner/memo': undefined,
      });
    },
  );

  it.each(Object.keys(waysToNull))(
    '%s: 풀린 값이 새 객체에 같은 쓰기를 한 값과 같아야 함',
    async (way) => {
      const root = await waysToNull[way]();

      (root.find('target/inner/memo') as StringNode).setValue('written');
      await delay(10);

      expect(root.find('target')?.value).toEqual({
        reason: 'because',
        state: null,
        total: 20,
        inner: { code: 'C', memo: 'written' },
      });
    },
  );

  it.each([false, true])(
    'minItems 배열 자식도 경로와 무관하게 같은 상태여야 함 (terminal: %s)',
    async (terminal) => {
      const jsonSchema = {
        type: 'object',
        properties: {
          target: {
            type: ['object', 'null'],
            properties: {
              note: { type: 'string' },
              rows: {
                type: 'array',
                terminal,
                minItems: 2,
                items: { type: 'string', default: 'S' },
              },
              tags: { type: 'array', terminal, items: { type: 'string' } },
            },
          },
        },
      } satisfies JSONSchema;
      const results: unknown[] = [];
      for (const defaultValue of [
        undefined,
        { target: null },
        { target: { rows: ['a', 'b', 'c'], tags: ['t'] } },
      ]) {
        const root = nodeFromJSONSchema({
          onChange: () => {},
          jsonSchema,
          defaultValue,
        }) as ObjectNode;
        await delay(10);
        if (defaultValue?.target) {
          (root.find('target') as ObjectNode).setValue(null);
          await delay(10);
        }
        const blank = [
          root.find('target/rows')?.value,
          root.find('target/tags')?.value,
        ];
        (root.find('target/note') as StringNode).setValue('written');
        await delay(10);
        results.push({ blank, promoted: root.find('target')?.value });
      }

      expect(results[0]).toEqual({
        blank: [['S', 'S'], []],
        promoted: { note: 'written', rows: ['S', 'S'] },
      });
      expect(results[1]).toEqual(results[0]);
      expect(results[2]).toEqual(results[0]);
    },
  );
});
