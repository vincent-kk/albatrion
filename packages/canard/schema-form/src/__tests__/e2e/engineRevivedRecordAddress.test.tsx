import { expect, it } from 'vitest';

import type { JSONSchema as AuthoredSchema } from '../../index';
import { ValidationMode } from '../../index';
import { SetValueOption as WriteOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

/*
 * Settle DETAIL WRITE-079: when a later reaction of the settlement cancels an exit, each record is
 * written to the revived node at the address it named. A rule naming /o/y while /o leaves and
 * reopens writes y and leaves the sibling x the record did not name as it was.
 */

const inject = (target: string, value: unknown) => ({
  type: 'string' as const,
  controls: {
    injectTo: (source: unknown) => (source ? { [target]: value } : {}),
  },
});

const SCHEMA: AuthoredSchema = {
  type: 'object',
  properties: {
    on: { type: 'boolean' },
    o: {
      type: 'object',
      controls: { active: '/on === true' },
      properties: { y: { type: 'string' }, x: { type: 'string' } },
    },
    src: inject('../o/y', 'new'),
    reopen: inject('../on', true),
  },
};

it('a record naming a descendant of a revived node writes that descendant only', () => {
  const root = mountEngineForm({
    jsonSchema: SCHEMA,
    defaultValue: { on: true, o: { y: 'old', x: 'x0' } },
    validationMode: ValidationMode.None,
  });
  root.setValue({ on: false, src: 's', reopen: 'r' }, WriteOption.Merge);
  expect(root.find('/o')!.value).toEqual({ y: 'new', x: 'x0' });
  expect(root.inactiveValues).toEqual([]);
});
