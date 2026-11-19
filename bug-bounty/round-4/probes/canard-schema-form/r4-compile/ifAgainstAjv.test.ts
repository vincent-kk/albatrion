import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '../../core/__tests__/fixtures/createTestValidator';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue, validator: createTestValidator() } as any) as any;

/** Which branch AJV applies to the value the form emits. */
const ajvBranch = (condition: any, value: unknown) =>
  new Ajv({ strict: false }).compile(condition)(value) ? 'then' : 'else';

const formBranch = (root: any) =>
  root.value?.t !== undefined ? 'then' : root.value?.e !== undefined ? 'else' : 'none';

const schema = (condition: any, extra: any = {}) => ({
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' } },
    name: { type: 'string' },
    n: { type: 'number' },
    ...extra,
  },
  if: condition,
  then: { properties: { t: { type: 'string', default: 'T' } } },
  else: { properties: { e: { type: 'string', default: 'E' } } },
});

const strip = (value: any) => {
  const { t, e, ...rest } = value ?? {};
  return rest;
};

type Step = [path: string, value: unknown];

const run = (condition: any, start: any, steps: Step[]) => {
  const root = tree(schema(condition), start);
  const rows: any[] = [];
  const record = () =>
    rows.push({
      emitted: strip(root.value),
      form: formBranch(root),
      ajv: ajvBranch(condition, strip(root.value)),
    });
  record();
  for (const [path, value] of steps) {
    root.find(path).setValue(value);
    record();
  }
  return rows;
};

const agree = (rows: any[]) => rows.every((row) => row.form === row.ajv);

describe('if gate verdict against AJV on the emitted host value', () => {
  it('required tags with an empty list (omitEmpty)', () => {
    const rows = run({ required: ['tags'] }, { tags: [] }, [
      ['/tags', ['a']],
      ['/tags', []],
      ['/tags', ['b']],
    ]);
    expect({ rows, agree: agree(rows) }).toMatchObject({ agree: true });
  });

  it('property minItems on tags', () => {
    const rows = run({ properties: { tags: { minItems: 1 } }, required: ['tags'] }, {}, [
      ['/tags', ['a']],
      ['/tags', []],
    ]);
    expect({ rows, agree: agree(rows) }).toMatchObject({ agree: true });
  });

  it('empty string name with minLength', () => {
    const rows = run({ properties: { name: { minLength: 1 } }, required: ['name'] }, { name: '' }, [
      ['/name', 'x'],
      ['/name', ''],
      ['/name', undefined],
    ]);
    expect({ rows, agree: agree(rows) }).toMatchObject({ agree: true });
  });

  it('number -0 and 0 with const 0', () => {
    const rows = run({ properties: { n: { const: 0 } }, required: ['n'] }, { n: 1 }, [
      ['/n', -0],
      ['/n', 0],
      ['/n', 2],
    ]);
    expect({ rows, agree: agree(rows) }).toMatchObject({ agree: true });
  });

  it('not required name (presence only)', () => {
    const rows = run({ not: { required: ['name'] } }, {}, [
      ['/name', 'x'],
      ['/name', undefined],
      ['/name', ''],
    ]);
    expect({ rows, agree: agree(rows) }).toMatchObject({ agree: true });
  });
});
