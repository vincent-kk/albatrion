import { afterEach, expect, it, vi } from 'vitest';

import { runDeriveConvergenceCase } from './fixtures/runDeriveConvergenceCase';
import { createTestTree } from './fixtures/createTestTree';
import { DeriveConvergenceTargets } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';

afterEach(() => vi.unstubAllEnvs());

it('preserves values, shape, errors, deliveries, write rounds and iterations for terminal writes', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' },
    target: { type: 'number', controls: { derived: '../source * 2' } },
  } }, { source: 1 }, [{ path: '/source', value: 3 }, { path: '/source', value: 4 }]);
  expect(result.root.emit).toEqual({ source: 4, target: 8 });
  expect(result.contexts.map(context => context.deriveRounds)).toEqual([1, 1, 1]);
  expect(result.contexts.map(context => context.iterations)).toEqual([undefined, undefined, undefined]);
  expect(result.decisions).toEqual([{ writes: 1, failures: 0 }, { writes: 0, failures: 0 },
    { writes: 1, failures: 0 }, { writes: 0, failures: 0 },
    { writes: 1, failures: 0 }, { writes: 0, failures: 0 }]);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof?.has('/target')).toBe(true);
});

it('keeps ancestor injectTo edges when derived writes a descendant', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, sink: { type: 'string' },
    group: { type: 'object', controls: { injectTo: (value: unknown) =>
      ({ '/sink': JSON.stringify(value) }) }, properties: {
      value: { type: 'number', controls: { derived: '../../source' } },
    } },
  } }, { source: 1, group: { value: 0 } }, [{ path: '/source', value: 3 }]);
  expect(result.root.emit).toEqual({ source: 3, sink: '{"value":3}', group: { value: 3 } });
  expect(result.contexts[1].deriveRounds).toBe(2);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof?.has('/group/value')).toBe(false);
});

it('includes disabled gates and the rules they can introduce', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source' } },
  }, allOf: [{ controls: { active: './target > 1' }, properties: {
    extra: { type: 'number', controls: { derived: '#/source + 10' } },
  } }] }, { source: 0 }, [{ path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, target: 2, extra: 12 });
  expect(result.contexts[1].deriveRounds).toBe(2);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof?.has('/target')).toBe(false);
});

it('retains the watch-only edge after a user override', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, first: { type: 'number', controls: { derived: '../source' } },
    watched: { type: 'number', controls: { derived: '9', watch: ['../first'] } },
  } }, { source: 1 }, [{ path: '/watched', value: 7 }, { path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, first: 2, watched: 9 });
  expect(result.contexts[2].deriveRounds).toBe(2);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof?.has('/first')).toBe(false);
});

it('runs every writing round of a dependency chain', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, a: { type: 'number', controls: { derived: '../source + 1' } },
    b: { type: 'number', controls: { derived: '../a + 1' } },
    c: { type: 'number', controls: { derived: '../b + 1' } },
  } }, { source: 1, a: 0, b: 0, c: 0 }, [{ path: '/source', value: 5 }]);
  expect(result.root.emit).toEqual({ source: 5, a: 6, b: 7, c: 8 });
  expect(result.contexts[1].deriveRounds).toBe(3);
});

it('consumes losing edges and preserves rank across subsequent caller writes', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number', controls: { injectTo: () => ({ '/target': 99 }) } },
    target: { type: 'number', controls: { derived: '../source', unsetValue: '../source > 0' } },
  } }, { source: 1, target: 5 }, [{ path: '/target', value: 7 }, { path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, target: 2 });
  const mount = JSON.parse(result.snapshots[0]);
  expect(mount.trace.rounds[0].filter((entry: { result: string }) => entry.result === 'lost'))
    .toHaveLength(2);
  expect(JSON.parse(result.snapshots[1]).nodes.find((node: { path: string }) => node.path === '/target').raw)
    .toBe(7);
});

it('re-enters derive after transition fills even when an earlier round was terminal', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, enabled: { type: 'boolean' },
    target: { type: 'number', controls: { derived: '../source + 1' } },
  }, allOf: [{ controls: { active: './enabled' }, properties: {
    fresh: { type: 'number', default: 4 },
    out: { type: 'number', controls: { derived: '../fresh * 2' } },
  } }] }, { source: 1, enabled: false },
  [{ path: '', value: { source: 2, enabled: true } }]);
  expect(result.root.emit).toEqual({ source: 2, enabled: true, target: 3, fresh: 4, out: 8 });
  expect(result.contexts[1].deriveRounds).toBe(2);
});

it('falls back for context expressions anywhere in the blueprint', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source' } },
    other: { type: 'string', controls: { visible: '@.enabled' } },
  } }, { source: 1 }, [{ path: '/source', value: 2 }]);
  expect(result.root.structure!.target.raw).toBe(2);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof).toBeUndefined();
});

it('falls back for whole host expressions anywhere in the blueprint', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source' } },
    other: { type: 'string', controls: { visible: '(#).source > 0' } },
  } }, { source: 1 }, [{ path: '/source', value: 2 }]);
  expect(result.root.structure!.target.raw).toBe(2);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof).toBeUndefined();
});

it('falls back for reads not proven complete rather than guessing from an empty dependency list', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source' } },
    other: { type: 'number', controls: { derived: '(() => 9)()' } },
  } }, { source: 1 }, [{ path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, target: 2, other: 9 });
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof).toBeUndefined();
});

it('falls back for recursive templates with per-occurrence paths', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source' } },
    rows: { type: 'array', items: { $ref: '#' } },
  } }, { source: 1, rows: [] }, [{ path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, target: 2 });
  expect(result.root.structure!.rows.itemCount).toBe(0);
  if (process.env.ROUND99_SKIP === 'on') expect(result.proof).toBeUndefined();
});

it('preserves deferred errors and committed values', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source' } },
    broken: { type: 'number', controls: { derived: '(() => { throw new Error("bad"); })()' } },
  } }, { source: 1, broken: 7 }, [{ path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, target: 2, broken: 7 });
  expect(result.root.runtime.diagnostics).toMatchObject({ status: 'degraded', cause: 'expression' });
});

it('preserves derive budget rollback and iterations exactly', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    a: { type: 'number', controls: { derived: '../b + 1' } },
    b: { type: 'number', controls: { derived: '../a + 1' } },
  } }, { a: 0, b: 0 });
  expect(result.root.emit).toEqual({ a: 0, b: 0 });
  expect(result.root.runtime.diagnostics).toMatchObject({ status: 'degraded', iterations: 25 });
  expect(result.contexts[0].deriveRounds).toBe(25);
});

it('skips the confirmation evaluation in development while preserving its empty trace slot', () => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('ROUND99_SKIP', 'on');
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { derived: '../source * 2' } },
  } }, { source: 1 }, [{ path: '/source', value: 3 }]);
  expect(result.decisions).toEqual([{ writes: 1, failures: 0 }, { writes: 1, failures: 0 }]);
  expect(result.root.runtime.settlementTrace?.rounds).toHaveLength(2);
  expect(result.contexts[1].deriveRounds).toBe(1);
});

it('actually runs shadow and rejects a false proof with nonzero confirmation candidates', () => {
  const { root, blueprint } = createTestTree({ type: 'object', properties: {
    source: { type: 'number' }, a: { type: 'number', controls: { derived: '../source + 1' } },
    b: { type: 'number', controls: { derived: '../a + 1' } },
  } });
  loadSchemaNodeAtMount(root, { source: 1 }, SetValueOption.Overwrite);
  DeriveConvergenceTargets.set(blueprint, new Set(['/a', '/b']));
  expect(() => writeSchemaNode(root.structure!.source, 3, 'input', SetValueOption.Overwrite))
    .toThrow('Derive convergence proof failed: confirmation was not empty');
});
