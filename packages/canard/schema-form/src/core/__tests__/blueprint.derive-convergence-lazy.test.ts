import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';
import type { BlueprintCacheEntry } from '../blueprint';
import { mountSchemaNode, schemaNodeFactory } from '../SchemaNode';
import * as convergence from '../blueprint/utils/analyze/collectDeriveConvergenceTargets';

afterEach(() => vi.restoreAllMocks());

it.each([false, true])('memoizes the first derive-write proof, including fallback=%s, across forms', (fallback) => {
  const collect = vi.spyOn(convergence, 'collectDeriveConvergenceTargets');
  const schema = { type: 'object' as const, properties: {
    source: { type: 'number' as const },
    target: { type: 'number' as const, controls: { derived: '../source * 2' } },
    other: { type: 'string' as const, controls: { visible: fallback ? '@.enabled' : 'true' } },
  } };
  const cache = new WeakMap<object, BlueprintCacheEntry[]>();
  const create = () => {
    const analysis = blueprint(schema, { cache });
    const root = schemaNodeFactory(analysis, {
      diagnostics: { status: 'stable' }, loadSnapshot: { source: 0, target: 0 }, validationMode: 0,
    });
    mountSchemaNode(root);
    return { root, analysis };
  };
  const { root, analysis } = create();
  expect(collect).not.toHaveBeenCalled();
  root.find('/source')!.setValue(1);
  expect(root.find('/target')!.value).toBe(2);
  expect(collect).toHaveBeenCalledTimes(1);
  root.find('/source')!.setValue(2);
  expect(root.find('/target')!.value).toBe(4);
  expect(collect).toHaveBeenCalledTimes(1);
  const { root: second, analysis: secondAnalysis } = create();
  expect(secondAnalysis).toBe(analysis);
  second.find('/source')!.setValue(3);
  expect(second.find('/target')!.value).toBe(6);
  expect(collect).toHaveBeenCalledTimes(1);
});
