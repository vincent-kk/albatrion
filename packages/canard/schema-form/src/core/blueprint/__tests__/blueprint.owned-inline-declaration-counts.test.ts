import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';
import type { BlueprintSchema, PropertyDeclaration } from '../type';
import fixtures from './fixtures/ownedInlineMounts.json';

/** Mock only the external collection boundary; recursive analysis remains real. */
const counts = vi.hoisted(() => ({
  calls: 0,
  arrays: 0,
  declarations: 0,
}));

vi.mock('../utils/analyze/collectDeclarations', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('../utils/analyze/collectDeclarations')
  >();
  return {
    collectDeclarations: (...args: unknown[]) => {
      const sink = args[5] as PropertyDeclaration[] | undefined;
      const previous = sink?.length ?? 0;
      const result = Reflect.apply(original.collectDeclarations, undefined, args);
      counts.calls++;
      counts.arrays += result === sink ? 0 : 1;
      counts.declarations += result.length - previous;
      return result;
    },
  };
});

afterEach(() => {
  counts.calls = 0;
  counts.arrays = 0;
  counts.declarations = 0;
});

it('counts collection boundaries and temporary result arrays per fixture node', () => {
  for (const fixture of fixtures) {
    counts.calls = 0;
    counts.arrays = 0;
    counts.declarations = 0;
    const result = blueprint(structuredClone(fixture.schema) as BlueprintSchema);
    const declarations = result.nodes.reduce(
      (total, node) => total + node.declarations.length,
      0,
    );
    expect(counts.calls).toBe(result.nodes.length);
    expect(counts.declarations).toBe(declarations);
    expect([0, counts.calls]).toContain(counts.arrays);
    if (process.env.REQUIRE_DECLARATION_SINK === '1')
      expect(counts.arrays, `${fixture.name}: intermediate arrays`).toBe(0);
  }
});
