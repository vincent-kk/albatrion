import { expect, it } from 'vitest';

import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';
import { createRoutingTree } from './fixtures/createRoutingTree';

it.each(['#/items/oneOf/0/properties/value/minLength', '#/unknown/minLength'])(
  'analyzes the ownership of %s once without caching occurrence activity',
  (schemaPath) => {
    const root = createRoutingTree({
      jsonSchema: {
        type: 'array',
        items: {
          type: 'object',
          controls: { discriminator: 'kind' },
          properties: { kind: { type: 'string' }, value: { type: 'string' } },
          oneOf: [
            { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
            { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
          ],
        },
      },
      defaultValue: Array.from({ length: 100 }, (_, index) => ({
        kind: index % 2 ? 'y' : 'x',
        value: 'a',
      })),
    });
    const blueprint = root.runtime.blueprint;
    let reads = 0;
    root.runtime.blueprint = {
      ...blueprint,
      get fragments() {
        reads++;
        return blueprint.fragments;
      },
    };
    const issues = Array.from({ length: 100 }, (_, index) => ({
      dataPath: `/${index}/value`,
      schemaPath,
    }));
    routeValidationIssues([root], issues.slice(0, 1));
    const once = reads;
    expect(once).toBeGreaterThan(0);
    reads = 0;
    routeValidationIssues([root], issues);
    expect(reads).toBe(once);
    for (let index = 0; index < issues.length; index++) {
      const shown = readFieldNodeErrors(
        root.childrenByName![index].childrenByName!.value,
      );
      expect(shown).toEqual(
        schemaPath.includes('/unknown/') || index % 2 === 0
          ? [issues[index]]
          : [],
      );
    }
    expect(root.runtime.globalErrors).toBe(issues);
  },
);
