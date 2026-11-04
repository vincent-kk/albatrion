import { afterEach, expect, it, vi } from 'vitest';

import { observeFixedFirstLoad } from './fixtures/observeFixedFirstLoad';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
// filid:contract fixed-first-load-work
it.each([true, false])(
  'T3 builds 500+kind once and selects only affected entries (missing=%s)',
  (missing) => {
    const properties = Object.fromEntries(
      Array.from({ length: 500 }, (_, index) => [
        'field_' + index,
        { type: 'string' },
      ]),
    );
    const fixture = {
      type: 'object',
      properties: { ...properties, kind: { type: 'string', default: 'a' } },
      if: { properties: { kind: { const: 'a' } } },
      then: { properties: { field_0: { minLength: 2 } } },
    };
    const oracle = observeFixedFirstLoad(fixture, {
      general: true,
      missing,
    });
    const actual = observeFixedFirstLoad(fixture, { missing });
    expect(actual.snapshot()).toEqual(oracle.snapshot());
    expect(actual.work.allocations).toBe(501);
    expect(actual.work.rootRounds).toBe(oracle.work.rootRounds);
    expect(
      actual.visits.filter((visit) => !visit.startsWith('select:')),
    ).toEqual(oracle.visits.filter((visit) => !visit.startsWith('select:')));
    expect(actual.root.children).toHaveLength(501);
    expect(actual.root.children?.map((child) => child.name)).toEqual(
      Object.keys(fixture.properties),
    );
    expect(actual.work.commits).toBe(1);
    expect(actual.work.assemblies).toBe(oracle.work.assemblies);
    expect(actual.work.entries).toBe(actual.work.rootRounds);
    expect(actual.prepared).toBe(true);
    expect(oracle.work.entries).toBeGreaterThanOrEqual(501);
  },
);
