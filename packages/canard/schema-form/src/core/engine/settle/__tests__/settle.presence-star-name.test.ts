import { afterEach, expect, it } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchContextChange } from '../../write';
import { mountPresenceTree } from './helpers/mountPresenceTree';
import { observePresenceTree } from './helpers/observePresenceTree';

afterEach(() => {
  engineModes.setMode('gateWheel', 'skip');
});

for (const name of ['plain', '*', '*x'])
  for (const key of ['active', 'visible', 'readOnly'] as const)
    for (const nested of [false, true])
      for (const mode of ['skip', 'shadow'] as const) {
        it(`${JSON.stringify(name)} ${key} nested=${nested} ${mode}`, () => {
          engineModes.setMode('gateWheel', mode);
          const reader: BlueprintSchema = {
            type: 'string',
            controls: {
              [key]: nested ? "../../side/x === 'v'" : "../side/x === 'v'",
            },
          };
          const schema: BlueprintSchema = {
            type: 'object',
            properties: {
              side: {
                type: 'object',
                properties: {
                  x: {
                    type: 'string',
                    controls: { active: '(@).on === true' },
                  },
                },
              },
              ...(nested
                ? { box: { type: 'object', properties: { [name]: reader } } }
                : { [name]: reader }),
            },
          };
          const value = nested
            ? { side: { x: 'v' }, box: { [name]: 'R' } }
            : { side: { x: 'v' }, [name]: 'R' };
          for (const start of [true, false]) {
            const root = mountPresenceTree(schema, value, { on: start });
            dispatchContextChange(root, { on: !start });
            expect(observePresenceTree(root)).toEqual(
              observePresenceTree(
                mountPresenceTree(schema, value, { on: !start }),
              ),
            );
          }
        });
      }
