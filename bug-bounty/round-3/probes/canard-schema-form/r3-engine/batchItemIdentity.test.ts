import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form';

import { attempt, build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    list: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    },
  },
} as const;

/** Read each row's name with its own error keywords and touched flag. */
const rows = (root: any) =>
  root.find('/list').children.map((item: any) => ({
    name: item.value?.name,
    errors: item
      .find('./name')
      .errors.map((error: any) => error.keyword),
    touched: !!item.find('./name').isTouched,
  }));

const run = (mode: 'sequential' | 'batch', verb: (list: any) => void) => {
  const { root } = build(schema, {
    list: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
  });
  const first = root.find('/list/0/name');
  first.setExternalErrors([
    { dataPath: '/list/0/name', keyword: 'server', message: 'a is taken' },
  ]);
  first.setState({ [FieldNodeState.Touched]: true });
  const list = root.find('/list');
  const thrown = attempt(() =>
    mode === 'batch' ? list.batch(() => verb(list)) : verb(list),
  );
  return { rows: rows(root), thrown: thrown && String(thrown) };
};

describe('EQ2 node-owned state after an array verb inside a batch', () => {
  it('I1 remove(0): the error and touched flag of "a" do not move to "b"', () => {
    const sequential = run('sequential', (list) => list.remove(0));
    const batched = run('batch', (list) => list.remove(0));
    diag('I1', { sequential, batched });
    expect(batched.rows).toEqual(sequential.rows);
  });

  it('I2 insert(0): the error and touched flag of "a" stay on "a"', () => {
    const sequential = run('sequential', (list) => list.insert(0, { name: 'n' }));
    const batched = run('batch', (list) => list.insert(0, { name: 'n' }));
    diag('I2', { sequential, batched });
    expect(batched.rows).toEqual(sequential.rows);
  });
});
