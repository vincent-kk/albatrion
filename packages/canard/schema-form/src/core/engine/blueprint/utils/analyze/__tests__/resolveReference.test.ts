import { afterEach, expect, it, vi } from 'vitest';

import { BlueprintErrorCode } from '../../diagnostics/constant';
import * as guards from '../../types/isBlueprintSchema';
import { resolveReference } from '../resolveReference';
import type { AnalysisContext } from '../type';

afterEach(() => vi.restoreAllMocks());

/** Build a bare analysis context; every context slot is initialized here once. */
const createContext = (
  options: AnalysisContext['options'],
): AnalysisContext => ({
  staticFirstLoad: true,
  capabilities: {
    branchless: true,
    hasExpressions: false,
    hasDerive: false,
    hasWatch: false,
    hasState: false,
    hasDependencies: false,
  },
  schema: {},
  options,
  nodes: [],
  fragments: [],
  declarationId: 0,
  declarationOwners: undefined,
  templates: new Map(),
  constructing: new Map(),
  declarationInputs: new Map(),
  dependencies: undefined,
});

it('guards each resolved value once with the existing schema acceptance and diagnostics', () => {
  const calls = vi.spyOn(guards, 'isBlueprintSchema');
  const collect = vi.fn();
  const context = createContext({ collect });
  for (const target of [true, false, {}, [], new Date(0)]) {
    context.schema = { target };
    calls.mockClear();
    expect(resolveReference(context, '#/target', '#/allOf/0')).toEqual({
      schema: target,
      schemaPath: '#/target',
    });
    expect(calls).toHaveBeenCalledExactlyOnceWith(target);
  }
  for (const target of [undefined, null, 0, 'string', () => {}]) {
    context.schema = { target };
    calls.mockClear();
    collect.mockClear();
    expect(() => resolveReference(context, '#/target', '#/allOf/0')).toThrow(
      expect.objectContaining({
        specific: BlueprintErrorCode.UnknownJsonSchema,
      }),
    );
    expect(calls).toHaveBeenCalledExactlyOnceWith(target);
    expect(collect).toHaveBeenCalledExactlyOnceWith({
      code: BlueprintErrorCode.UnknownJsonSchema,
      level: 'error',
      schemaPath: '#/allOf/0',
      details: {
        reference: '#/target',
        guidance: 'The reference must identify a schema.',
      },
    });
  }
});

it('keeps pointer failures before the result guard', () => {
  const calls = vi.spyOn(guards, 'isBlueprintSchema');
  const context = createContext({});
  expect(() => resolveReference(context, '#/%', '#')).toThrow(
    expect.objectContaining({ specific: BlueprintErrorCode.UnknownJsonSchema }),
  );
  expect(calls).not.toHaveBeenCalled();
});
