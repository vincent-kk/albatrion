import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';

const schema = {
  type: 'object',
  properties: {
    yOn: { type: 'boolean' },
    other: { type: 'boolean' },
    object: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string', controls: { active: '/yOn === true' } },
      },
    },
    source: {
      type: 'string',
      controls: {
        injectTo: (value: unknown) =>
          typeof value === 'string' ? { '../object': JSON.parse(value) } : {},
      },
    },
  },
} as const satisfies AuthoredSchema;

/** One declarative object write, alone or batched with an unrelated write. */
const observe = (written: object, yOn: boolean, batched: boolean) => {
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { yOn, object: { x: 'x0', y: 'y0' } },
    validationMode: ValidationMode.None,
  });
  const write = () => {
    root.find('/other')!.setValue(true);
    root.find('/source')!.setValue(JSON.stringify(written));
  };
  if (batched) root.batch(write);
  else write();
  root.find('/yOn')!.setValue(true);
  return root.value;
};

// Known limit (settle DETAIL WRITE-079): a batched automatic object write outside the caller paths applies partially.
it.fails.each([
  [{ x: 'o' }, true],
  [{ x: 'o', y: 'p' }, false],
])(
  'applies a declarative object write %j (y active %s) the same in and out of a batch',
  (written, yOn) => {
    expect(observe(written, yOn, true)).toEqual(observe(written, yOn, false));
  },
);
