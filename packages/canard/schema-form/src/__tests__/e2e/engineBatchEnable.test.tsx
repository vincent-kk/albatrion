import { expect, it } from 'vitest';

import { SetValueOption } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

it.each(['derived', 'inject'] as const)(
  'a mixed enable does not activate a suppressed sibling %s',
  (kind) => {
    const run = (batch: boolean) => {
      const root = mountEngineForm({
        jsonSchema: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: {
              type: 'number',
              controls:
                kind === 'inject'
                  ? { injectTo: (value: unknown) => ({ '../copy': value }) }
                  : undefined,
            },
            da: { type: 'number', controls: { derived: '../a * 2' } },
            db: { type: 'number', controls: { derived: '../b * 2' } },
            copy: { type: 'number' },
          },
        },
        defaultValue: { a: 1, b: 1, copy: 99 },
        disableAutomaticWrites: true,
      });
      const calls = () => {
        root.find('/a')!.setValue(5, SetValueOption.EnableAutomaticWrites);
        root.find('/b')!.setValue(7);
      };
      if (batch) root.batch(calls);
      else calls();
      return root.value;
    };
    expect(run(true)).toEqual(run(false));
  },
);
