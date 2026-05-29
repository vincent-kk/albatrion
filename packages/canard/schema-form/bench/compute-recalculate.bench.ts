import { bench, describe } from 'vitest';

import { ComputedPropertiesManager } from '@/schema-form/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager';
import type {
  JsonSchemaType,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

/**
 * Pure ComputedPropertiesManager.recalculate cost.
 *
 * Each bench builds a manager with N dependencies and calls recalculate()
 * after pre-loading dependency values. Isolates the cost of the compiled
 * dynamic functions (active/visible/derived/oneOfIndex) from any
 * subscribe/publish overhead.
 */

function makeManager(
  type: JsonSchemaType,
  schema: JsonSchemaWithVirtual,
  values: unknown[],
): ComputedPropertiesManager {
  const root: JsonSchemaWithVirtual = { type: 'object', properties: {} };
  const m = new ComputedPropertiesManager(type, schema, root);
  for (let i = 0; i < values.length && i < m.dependencies.length; i++)
    m.dependencies[i] = values[i];
  return m;
}

const visibleOnly = makeManager(
  'string',
  { type: 'string', computed: { visible: '/a === "yes"' } },
  ['yes'],
);

const visibleAndActive = makeManager(
  'string',
  {
    type: 'string',
    computed: { visible: '/a === "yes"', active: '/b !== "no"' },
  },
  ['yes', 'maybe'],
);

const derivedSimple = makeManager(
  'number',
  { type: 'number', computed: { derived: '/a + /b' } },
  [3, 5],
);

const derivedHeavy = makeManager(
  'number',
  {
    type: 'number',
    computed: {
      derived: '/a + /b * /c - /d / (/e + 1) + /f * /g',
    },
  },
  [1, 2, 3, 4, 5, 6, 7],
);

const watchMany = makeManager(
  'string',
  {
    type: 'string',
    computed: { watch: ['/a', '/b', '/c', '/d', '/e'] },
  },
  ['1', '2', '3', '4', '5'],
);

const oneOfIndexSimple = makeManager(
  'object',
  {
    type: 'object',
    oneOf: [
      { '&if': '/t === "a"' },
      { '&if': '/t === "b"' },
      { '&if': '/t === "c"' },
    ],
  } as JsonSchemaWithVirtual,
  ['b'],
);

describe('ComputedPropertiesManager.recalculate', () => {
  bench('visible only (1 dep)', () => {
    visibleOnly.recalculate();
  });

  bench('visible + active (2 deps)', () => {
    visibleAndActive.recalculate();
  });

  bench('derived simple (2 deps)', () => {
    derivedSimple.recalculate();
  });

  bench('derived heavy (7 deps)', () => {
    derivedHeavy.recalculate();
  });

  bench('watch 5 deps', () => {
    watchMany.recalculate();
  });

  bench('oneOfIndex 3 branches', () => {
    oneOfIndexSimple.recalculate();
  });
});
