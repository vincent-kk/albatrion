import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { SetValueOption, nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { BooleanNode } from '../nodes/BooleanNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';
import type { VirtualNode } from '../nodes/VirtualNode';

const fields: NonNullable<JSONSchema['properties']> = {
  note: { type: 'string' },
  reason: { type: 'string', default: 'because' },
};

/** The null contract seen through each public way of reaching a nullable object: root value, activation, `undefined`, virtual groups, `injectTo`. */
describe('ObjectNode branch nullable — the contract holds through every public interface', () => {
  it('루트가 nullable이어도 같은 계약을 따라야 함', async () => {
    const values: unknown[] = [];
    for (const defaultValue of [null, undefined]) {
      const root = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: { type: ['object', 'null'], properties: fields },
        defaultValue,
      }) as ObjectNode;
      await delay(10);
      if (defaultValue === null) expect(root.value).toBeNull();
      (root.find('note') as StringNode).setValue('written');
      await delay(10);
      values.push(root.value);
    }

    expect(values[0]).toEqual({ note: 'written', reason: 'because' });
    expect(values[0]).toEqual(values[1]);
  });

  it('비활성인 동안에는 키가 빠지고, 다시 활성화되면 null로 돌아와야 함', async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          target: {
            type: ['object', 'null'],
            computed: { active: '../enabled === true' },
            properties: fields,
          },
        },
      },
      defaultValue: { target: null },
    }) as ObjectNode;
    await delay(10);
    expect(root.value).toEqual({ enabled: true, target: null });

    (root.find('enabled') as BooleanNode).setValue(false);
    await delay(10);
    expect(root.value).toEqual({ enabled: false });

    (root.find('enabled') as BooleanNode).setValue(true);
    await delay(10);
    expect(root.value).toEqual({ enabled: true, target: null });
  });

  it('undefined 대입은 null과 달리 서브트리를 비우고 자식 default를 복원하지 않아야 함', async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: { target: { type: ['object', 'null'], properties: fields } },
      },
      defaultValue: { target: { note: 'typed', reason: 'edited' } },
    }) as ObjectNode;
    await delay(10);

    (root.find('target') as ObjectNode).setValue(undefined);
    await delay(10);
    expect(root.find('target')?.value).toBeUndefined();
    expect(root.find('target/reason')?.value).toBeUndefined();
    expect(root.value).toEqual({});

    (root.find('target/note') as StringNode).setValue('written');
    await delay(10);
    expect(root.value).toEqual({ target: { note: 'written' } });
  });

  it('virtual 그룹을 통한 쓰기도 null을 풀어야 함', async () => {
    const values: unknown[] = [];
    for (const defaultValue of [{ target: null }, undefined]) {
      const root = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            target: {
              type: ['object', 'null'],
              properties: {
                start: { type: 'string' },
                end: { type: 'string' },
                reason: { type: 'string', default: 'because' },
              },
              virtual: { period: { fields: ['start', 'end'] } },
            },
          },
        },
        defaultValue,
      }) as ObjectNode;
      await delay(10);
      if (defaultValue) expect(root.value).toEqual({ target: null });
      (root.find('target/period') as VirtualNode).setValue([
        '2026-01-01',
        '2026-12-31',
      ]);
      await delay(10);
      values.push(root.find('target')?.value);
    }

    expect(values[0]).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
      reason: 'because',
    });
    expect(values[0]).toEqual(values[1]);
  });

  it('injectTo는 밖에서의 쓰기이므로 null 객체 안의 대상을 채우며 null을 풀어야 함', async () => {
    const root = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            injectTo: (value: string) => ({ '../target/note': `from:${value}` }),
          },
          target: { type: ['object', 'null'], properties: fields },
        },
      },
      defaultValue: { target: null },
    }) as ObjectNode;
    await delay(10);
    expect(root.value).toEqual({ target: null });

    (root.find('source') as StringNode).setValue('s');
    await delay(10);

    expect(root.value).toEqual({
      source: 's',
      target: { note: 'from:s', reason: 'because' },
    });
  });

  it('키를 담은 Merge도 빈 양식 위에 얹혀야 함', async () => {
    const values: unknown[] = [];
    for (const defaultValue of [{ target: null }, undefined]) {
      const root = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            target: { type: ['object', 'null'], properties: fields },
          },
        },
        defaultValue,
      }) as ObjectNode;
      await delay(10);
      (root.find('target') as ObjectNode).setValue(
        { note: 'merged' },
        SetValueOption.Merge,
      );
      await delay(10);
      values.push(root.find('target')?.value);
    }

    expect(values[0]).toEqual({ note: 'merged', reason: 'because' });
    expect(values[0]).toEqual(values[1]);
  });

  it.each([
    ['source의 default', { type: 'string', default: 'seed' }, undefined],
    [
      'source의 derived 값',
      { type: 'string', computed: { derived: '../trigger' } },
      'changed',
    ],
  ] as const)(
    '%s로 구동된 injectTo는 자동 쓰기이므로 null을 풀지 않아야 함',
    async (_label, source, trigger) => {
      const root = nodeFromJSONSchema({
        onChange: () => {},
        jsonSchema: {
          type: 'object',
          properties: {
            trigger: { type: 'string', default: 'initial' },
            source: {
              ...source,
              injectTo: (value: string) => ({
                '../target/note': `from:${value}`,
              }),
            },
            target: { type: ['object', 'null'], properties: fields },
          },
        },
        defaultValue: { target: null },
      }) as ObjectNode;
      await delay(10);
      if (trigger) {
        (root.find('trigger') as StringNode).setValue(trigger);
        await delay(10);
      }

      expect(root.find('target')?.value).toBeNull();
      expect(root.find('target/note')?.value).toBe(
        `from:${root.find('source')?.value}`,
      );

      (root.find('target/reason') as StringNode).setValue('edited');
      await delay(10);
      expect(root.find('target')?.value).toEqual({
        note: `from:${root.find('source')?.value}`,
        reason: 'edited',
      });
    },
  );

  it('null 조상이 없는 폼에서 같은 값을 다시 쓰는 것은 아무 변화도 알리지 않아야 함', async () => {
    const reported: unknown[] = [];
    const root = nodeFromJSONSchema({
      onChange: (value) => reported.push(value),
      jsonSchema: {
        type: 'object',
        properties: {
          holder: {
            type: 'object',
            properties: {
              inner: {
                type: 'object',
                properties: { code: { type: 'string', default: 'C' } },
              },
              rows: {
                type: 'array',
                minItems: 1,
                items: { type: 'string', default: 'S' },
              },
            },
          },
        },
      },
    }) as ObjectNode;
    await delay(10);
    reported.length = 0;

    (root.find('holder/inner/code') as StringNode).setValue('C');
    (root.find('holder/rows/0') as StringNode).setValue('S');
    await delay(10);

    expect(reported).toEqual([]);
  });
});
