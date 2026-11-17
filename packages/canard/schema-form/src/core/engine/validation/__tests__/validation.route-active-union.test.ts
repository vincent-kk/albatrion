import { expect, it } from 'vitest';

import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';
import { createRoutingTree } from './fixtures/createRoutingTree';

it.each(['oneOf', 'anyOf'] as const)(
  'filters explicit active %s array branches',
  (keyword) => {
    const root = createRoutingTree({
      jsonSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: { kind: { type: 'string' }, value: { type: 'string' } },
          [keyword]: [
            {
              controls: { active: './kind === "x"' },
              properties: { value: { minLength: 3 } },
            },
            {
              controls: { active: './kind === "y"' },
              properties: { value: { minLength: 5 } },
            },
          ],
        },
      },
      defaultValue: [
        { kind: 'x', value: 'a' },
        { kind: 'y', value: 'a' },
      ],
    });
    const issues = [0, 1].flatMap((row) =>
      [0, 1].map((branch) => ({
        dataPath: `/${row}/value`,
        schemaPath: `#/items/${keyword}/${branch}/properties/value/minLength`,
      })),
    );
    routeValidationIssues([root], issues);
    expect(root.runtime.globalErrors).toBe(issues);
    expect(
      readFieldNodeErrors(root.childrenByName!['0'].childrenByName!.value),
    ).toEqual([issues[0]]);
    expect(
      readFieldNodeErrors(root.childrenByName!['1'].childrenByName!.value),
    ).toEqual([issues[3]]);
  },
);
