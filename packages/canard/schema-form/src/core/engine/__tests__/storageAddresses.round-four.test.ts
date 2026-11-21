import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

it.each([
  ['replace', '/start'],
  ['replace', '/period'],
  ['replace', '/period/start'],
  ['replace', '/period/../start'],
  ['merge', '/start'],
  ['merge', '/period'],
  ['merge', '/period/start'],
  ['merge', '/period/../start'],
  ['updater', '/start'],
  ['updater', '/period'],
  ['updater', '/period/start'],
  ['updater', '/period/../start'],
  ['reset', '/start'],
  ['reset', '/period'],
  ['reset', '/period/start'],
  ['reset', '/period/../start'],
  ['batch-reset', '/start'],
  ['batch-reset', '/period'],
  ['batch-reset', '/period/start'],
  ['batch-reset', '/period/../start'],
  ['validate', '/start'],
  ['validate', '/period'],
  ['validate', '/period/start'],
  ['validate', '/period/../start'],
  ['read', '/start'],
  ['read', '/period'],
  ['read', '/period/start'],
  ['read', '/period/../start'],
])(
  '%s at %s agrees with the physical storage operation',
  async (verb, path) => {
    const run = async (address: string) => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            start: { type: 'string' },
            end: { type: 'string' },
            note: { type: 'string' },
          },
          options: { virtual: { period: { fields: ['start', 'end'] } } },
        },
        defaultValue: { start: 'a', end: 'b', note: 'n' },
        validationMode: ValidationMode.OnRequest,
        validator: {
          compile: () => () => [
            { dataPath: '/start', keyword: 'invalid' },
            { dataPath: '/note', keyword: 'invalid' },
          ],
          compileGuard: () => () => true,
        },
      });
      const target = root.find(address)!;
      const virtual = address === '/period';
      const input = virtual ? ['x', 'b'] : 'x';
      let read: unknown;
      if (verb === 'replace' || verb === 'merge')
        target.setValue(
          input,
          verb === 'merge' ? WriteOption.Merge : WriteOption.Overwrite,
        );
      else if (verb === 'updater')
        root.batch(() =>
          target.setValue((previous: unknown) => {
            read = virtual && Array.isArray(previous) ? previous[0] : previous;
            return input;
          }),
        );
      else if (verb === 'reset' || verb === 'batch-reset') {
        const calls = () => {
          root.find('/start')!.setValue('x');
          target.resetSubtree();
        };
        if (verb === 'batch-reset') root.batch(calls);
        else calls();
      } else if (verb === 'validate') await target.validate();
      else
        read =
          virtual && Array.isArray(target.value)
            ? target.value[0]
            : target.value;
      return {
        value: root.value,
        read,
        start: root.find('/start')!.errors.map((issue) => issue.keyword),
        note: root.find('/note')!.errors.map((issue) => issue.keyword),
      };
    };
    expect(await run(path)).toEqual(await run('/start'));
  },
);
