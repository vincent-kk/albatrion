import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

/*
 * Write DETAIL EVENT-013: a subtree reset whose barrier settlement detaches its scope is refused and
 * keeps its in-scope marks, except the addresses a later out-of-scope mark covers. An in-scope whole
 * write of /o is followed by a Merge that closes /o's gate and names only /o/x, then /o is reset:
 * the Merge covers x and the whole write keeps y, as one Merge of the same final caller value does.
 */

const SCHEMA: AuthoredSchema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    o: {
      type: 'object',
      controls: { active: '/on === true' },
      properties: { x: { type: 'string' }, y: { type: 'string' } },
    },
  },
};

type Root = ReturnType<typeof nodeFromJSONSchema>;

const retained = (write: (root: Root) => void) => {
  const root = nodeFromJSONSchema({
    jsonSchema: SCHEMA,
    defaultValue: { on: true, o: { x: 'x0', y: 'y0' } },
    validationMode: ValidationMode.None,
  });
  write(root);
  return Object.fromEntries(
    root.inactiveValues.map(({ path, value }) => [path, value]),
  );
};

const calls = (root: Root) => {
  const o = root.find('/o')!;
  o.setValue({ x: 'earlyX', y: 'earlyY' });
  root.setValue({ on: false, o: { x: 'lateX' } }, WriteOption.Merge);
  o.resetSubtree();
};

const EXPECTED = { '/o/x': 'lateX', '/o/y': 'earlyY' };

it('a refused reset keeps the part of an earlier whole mark a later Merge does not name', () => {
  expect(retained((root) => root.batch(() => calls(root)))).toEqual(EXPECTED);
  expect(
    retained((root) => root.batch(() => root.batch(() => calls(root)))),
  ).toEqual(EXPECTED);
});

it('one Merge of the same final caller value leaves the same retained sources', () => {
  expect(
    retained((root) =>
      root.setValue(
        { on: false, o: { x: 'lateX', y: 'earlyY' } },
        WriteOption.Merge,
      ),
    ),
  ).toEqual(EXPECTED);
});
