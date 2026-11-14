import { expect, it } from 'vitest';

import { DEFAULT_KEYWORD_MAP } from '../../keywordMap/defaultKeywordMap';
import type { SchemaEntry } from '../../type';
import { ScanEngine } from '../ScanEngine';
import type { ScanConfig } from '../type';
import { appendChildren } from '../utils/children/appendChildren';

/** No observable callback means boolean frames have no work to perform. */
const config: ScanConfig = {
  maxDepth: undefined,
  context: undefined,

  keywordMap: DEFAULT_KEYWORD_MAP,
  operations: [],
};

it('allocates no frame for an unobserved boolean root', () => {
  const engine = new ScanEngine(false, config, false);
  expect(Reflect.get(engine, 'entries')).toEqual([]);
  expect(engine.run()).toBeUndefined();
});

it('elides boolean child entries while retaining every object occurrence', () => {
  const entries: SchemaEntry[] = [];
  const parent: SchemaEntry = {
    schema: {
      allOf: [true, {}, false],
      items: false,
      properties: { bool: true, object: {} },
    },
    path: '#',
    dataPath: '',
    depth: 0,
  };
  appendChildren(
    entries,
    parent,
    DEFAULT_KEYWORD_MAP,
    Array.from(DEFAULT_KEYWORD_MAP.values()),
    [],
    16,
    false,
  );
  expect(entries.map((e) => e.path)).toEqual([
    '#/allOf/1',
    '#/properties/object',
  ]);
});
