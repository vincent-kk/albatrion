import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

const schema: AuthoredSchema = {
  type: 'object',
  properties: {
    open: { type: 'boolean' },
    o: {
      type: 'object',
      controls: { active: '/open === true' },
      properties: {
        y: { type: 'string', default: 'default' },
        z: { type: 'string' },
      },
    },
  },
};

const createRoot = () =>
  nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { open: true, o: { y: 'initial', z: 'sibling' } },
    validationMode: ValidationMode.None,
  });

it('keeps a leaving field’s pre-settlement source when no write names it', () => {
  const root = createRoot();
  root.find('/open')!.setValue(false);
  expect(root.inactiveValues).toContainEqual({
    path: '/o/y',
    value: 'initial',
  });
});

it('updates an already inactive key in a later settlement', () => {
  const root = createRoot();
  root.find('/open')!.setValue(false);
  root.setValue({ o: { y: 'later' } }, WriteOption.Merge);
  expect(root.inactiveValues).toEqual([
    { path: '/o/y', value: 'later' },
    { path: '/o/z', value: 'sibling' },
  ]);
});

it.each([null, 'scalar'])(
  'writes one key after a whole object replacement by %s',
  (replacement) => {
    const root = createRoot();
    root.find('/o')!.setValue(replacement);
    expect(root.find('/o')!.outputValue).toBe(replacement);
    root.setValue({ o: { y: 'later' } }, WriteOption.Merge);
    expect(root.find('/o')!.value).toEqual({ y: 'later' });
  },
);
