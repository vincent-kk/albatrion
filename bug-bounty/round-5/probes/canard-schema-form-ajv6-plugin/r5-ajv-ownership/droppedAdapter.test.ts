import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/** Round 5, hunter r5-ajv-ownership: AJV 6 row of the ajv8 probe droppedAdapter.test.tsx (plugin level). */
setFlagsFromString('--expose_gc');
const gc = runInNewContext('gc') as () => void;

const collect = async () => {
  for (let index = 0; index < 6; index++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    gc();
  }
  await new Promise((resolve) => setTimeout(resolve, 20));
};

const ID = 'https://r5.invalid/ajv6/route-form.json';
const schema = {
  $id: ID,
  type: 'object',
  properties: { name: { type: 'string', minLength: 3 } },
} satisfies JSONSchema;

const visitWithoutRelease = async (ajv: Ajv.Ajv) => {
  const validator = createValidator(ajv);
  let verdict: unknown;
  try {
    const issues = await validator.compile(JSON.parse(JSON.stringify(schema)))({ name: 'ab' });
    verdict = issues?.map(({ keyword, dataPath }) => `${keyword} ${dataPath}`) ?? [];
  } catch (error) {
    verdict = `compile threw: ${(error as Error).message}`;
  }
  return { verdict, adapter: new WeakRef(validator) };
};

describe('ajv6: a dropped per-mount adapter and the shared application instance', () => {
  it('[control] a second visit before the first adapter is collected validates', async () => {
    const ajv = new Ajv({ allErrors: true });
    expect((await visitWithoutRelease(ajv)).verdict).toEqual(['minLength /name']);
    expect((await visitWithoutRelease(ajv)).verdict).toEqual(['minLength /name']);
  });

  it('a second visit after the first adapter was collected validates the same way as before collection', async () => {
    const ajv = new Ajv({ allErrors: true });
    const first = await visitWithoutRelease(ajv);
    expect(first.verdict).toEqual(['minLength /name']);
    await collect();
    expect(first.adapter.deref()).toBeUndefined();
    expect({
      leftover: Object.keys(ajv._refs).filter((key) => key === ID),
      second: (await visitWithoutRelease(ajv)).verdict,
    }).toEqual({ leftover: [], second: ['minLength /name'] });
  });
});
