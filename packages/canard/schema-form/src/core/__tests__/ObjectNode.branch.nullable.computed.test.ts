import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { SetValueOption, nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

/** Nullable object with a computed child, so the owner re-evaluates its value after every unsettled update. */
const schema = {
  type: 'object',
  properties: {
    target: {
      type: ['object', 'null'],
      properties: {
        a: { type: 'string' },
        b: { type: 'string', computed: { visible: '../a === "x"' } },
      },
    },
  },
} satisfies JSONSchema;

describe('ObjectNode branch nullable — null survives computed-property re-evaluation', () => {
  it('computed 자식을 가진 nullable 객체에 setValue(null) 하면 null이 출력되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: { a: 'y' } },
    });
    await delay(10);
    expect(node.value).toEqual({ target: { a: 'y' } });

    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);

    expect(node.find('target')?.value).toBeNull();
    expect(node.value).toEqual({ target: null });
  });

  it('루트에서 setValue({ target: null }) 해도 null이 출력되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: { a: 'x', b: 'kept' } },
    });
    await delay(10);
    expect(node.value).toEqual({ target: { a: 'x', b: 'kept' } });

    (node as ObjectNode).setValue({ target: null });
    await delay(10);

    expect(node.value).toEqual({ target: null });
  });

  it('null 이후 자식에 값을 쓰면 승격되고 비활성 computed 자식 값은 제외되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: { a: 'x', b: 'kept' } },
    });
    await delay(10);

    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);
    (node.find('target/a') as StringNode).setValue('y');
    await delay(10);

    expect(node.value).toEqual({ target: { a: 'y' } });
  });

  it('null 객체에 명시적으로 setValue({}) 하면 빈 객체로 바뀌어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: null },
    });
    await delay(10);
    expect(node.find('target')?.value).toBeNull();

    (node.find('target') as ObjectNode).setValue({});
    await delay(10);

    expect(node.find('target')?.value).toEqual({});
  });

  it('null 객체에 빈 객체를 Merge 하는 것은 아무것도 바꾸지 않으므로 null이 유지되어야 함', async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: { target: null },
    });
    await delay(10);

    (node.find('target') as ObjectNode).setValue({}, SetValueOption.Merge);
    await delay(10);
    expect(node.value).toEqual({ target: null });

    (node.find('target') as ObjectNode).setValue(
      { a: 'y' },
      SetValueOption.Merge,
    );
    await delay(10);
    expect(node.value).toEqual({ target: { a: 'y' } });
  });
});
