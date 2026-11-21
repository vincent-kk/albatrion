import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../../types/state';

it.each(['/start', '/period/start', '/period/../start', '/period'])(
  'validation at %s publishes the same stored field verdict',
  (path) => {
    const make = () =>
      nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            start: { type: 'string' },
            end: { type: 'string' },
            note: { type: 'string' },
          },
          options: { virtual: { period: { fields: ['start', 'end'] } } },
        },
        defaultValue: { start: 'bad', end: 'ok', note: 'bad' },
        validationMode: ValidationMode.OnRequest,
        validator: {
          compile: () => () => [
            { dataPath: '/start', keyword: 'invalid' },
            { dataPath: '/note', keyword: 'invalid' },
          ],
          compileGuard: () => () => true,
        },
      });
    const run = async (target: string) => {
      const root = make();
      await root.find(target)!.validate();
      return {
        start: root.find('/start')!.errors.map((issue) => issue.keyword),
        note: root.find('/note')!.errors.map((issue) => issue.keyword),
      };
    };
    return Promise.all([run(path), run('/start')]).then(
      ([actual, expected]) => {
        expect(expected).toEqual({ start: ['invalid'], note: [] });
        expect(actual).toEqual(expected);
      },
    );
  },
);
