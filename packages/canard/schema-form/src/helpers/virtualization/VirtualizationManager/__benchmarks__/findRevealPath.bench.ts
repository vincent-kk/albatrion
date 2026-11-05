// @vitest-environment jsdom
// Loaded by vitest.bench.config.ts; schema and DOM preparation are outside every sample.
import { afterAll, bench, describe } from 'vitest';

import type { JSONSchema } from '@/schema-form/types';

import { nodeFromJSONSchema } from '../../../../__tests__/fixtures/nodeFromJSONSchema';
import type { DeferredGate } from '../types/deferredGate';
import { findRevealPath } from '../utils/findRevealPath';

if (typeof document === 'undefined')
  throw new Error('findRevealPath requires a DOM');

/** Stable no-op reveal callback; the benchmark only searches. */
const reveal = () => {};
/** Six physical edges and one virtual reference group on the path. */
let schema: JSONSchema = { type: 'string' };
for (let depth = 0; depth < 6; depth++)
  schema = {
    type: 'object',
    properties: { next: schema },
    ...(depth === 3
      ? { options: { virtual: { group: { fields: ['next'] } } } }
      : {}),
  };
/** Complete source tree so benchmark behavior matches the implementation under test. */
const root = nodeFromJSONSchema({ jsonSchema: schema });
/** Target at depth six below the root gate. */
const target = root.find('/next/next/next/next/next/next')!;
/** Non-path identity represents unrelated placeholders. */
const unrelated = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
/** No gates are already opening in these search-only samples. */
const revealing = new Map<Element, DeferredGate>();
afterAll(() => document.body.replaceChildren());

describe('findRevealPath', () => {
  for (const count of [1000, 10000, 100000]) {
    const container = document.body.appendChild(document.createElement('div'));
    const registry = new Map<Element, DeferredGate>();
    const gate = { node: unrelated, reveal };
    for (let index = 0; index < count; index++) {
      const element = container.appendChild(document.createElement('div'));
      registry.set(
        element,
        index === count - 1 ? { node: root, reveal } : gate,
      );
    }
    const result = findRevealPath(target, registry, revealing);
    if (!result || result.renderPath.length !== 8)
      throw new Error('expected depth six and one virtual group');
    bench(`${count} placeholders`, () => {
      findRevealPath(target, registry, revealing);
    });
  }
});
