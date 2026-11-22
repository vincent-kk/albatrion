import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../../types/state';
import { WriteOption } from '../../types/value';

it.each(['/o', ''])(
  'keeps inactive descendant sources out of the %j updater input',
  (path) => {
    const run = (batched: boolean) => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            o: {
              type: 'object',
              properties: {
                n: { type: 'string', controls: { active: false } },
              },
            },
          },
        },
        defaultValue: {},
        validationMode: ValidationMode.None,
        disableAutomaticWrites: true,
      });
      let seen: unknown;
      const calls = () => {
        root.setValue({ o: { n: 'entry' } }, WriteOption.Merge);
        (path ? root.find(path)! : root).setValue((value: unknown) => {
          seen = value;
          return value;
        });
      };
      if (batched) root.batch(calls);
      else calls();
      return { seen, value: root.value, retained: root.inactiveValues };
    };
    const sequential = run(false);
    expect(sequential).toEqual({ seen: {}, value: {}, retained: [] });
    expect(run(true)).toEqual(sequential);
  },
);
