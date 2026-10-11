import { expect, it } from 'vitest';

import { runDeriveConvergenceCase } from './fixtures/runDeriveConvergenceCase';

it('includes expression reads and watches of a disabled fragment', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    enabled: { type: 'boolean' }, source: { type: 'number' },
    target: { type: 'number', controls: { derived: '../source' } },
  }, allOf: [{ controls: { active: './enabled' }, properties: {
    dormant: { type: 'number', controls: { derived: '../target', watch: ['../target'] } },
  } }] }, { enabled: false, source: 1 }, [{ path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ enabled: false, source: 2, target: 2 });
  expect(result.root.structure?.dormant).toBeUndefined();
  expect(result.proof?.has('/target')).toBe(false);
});

it('rejects ancestor targets intersecting a descendant gate read', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number', controls: { injectTo: (value: unknown) =>
      ({ '/group': { flag: value } }) } },
    group: { type: 'object', properties: { flag: { type: 'number' } }, allOf: [{
      controls: { active: './flag > 1' }, properties: { fresh: { type: 'number', default: 8 } },
    }] },
  } }, { source: 0, group: { flag: 0 } }, [{ path: '/source', value: 2 }]);
  expect(result.root.emit).toEqual({ source: 2, group: { flag: 2, fresh: 8 } });
  expect(result.proof?.has('/group')).toBe(false);
});

it('binds parent-scoped rules and target watches without treating a path prefix as ancestry', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, target: { type: 'number', controls: { watch: ['../source'] } },
    targetLong: { type: 'number', controls: { derived: '../source' } },
    sink: { type: 'number', controls: { derived: '../target' } },
  }, controls: { children: [{ targets: ['target'], controls: { derived: './source + 1' } }] } },
  { source: 1 }, [{ path: '/source', value: 3 }]);
  expect(result.root.emit).toEqual({ source: 3, target: 4, targetLong: 3, sink: 4 });
  expect(result.proof?.has('/target')).toBe(false);
  expect(result.proof?.has('/targetLong')).toBe(true);
});

it('does not skip a virtual write whose actual targets are sibling paths', () => {
  const result = runDeriveConvergenceCase({ type: 'object', properties: {
    source: { type: 'number' }, a: { type: 'number' }, b: { type: 'number' },
    sink: { type: 'number', controls: { derived: '../a + 1' } },
  }, options: { virtual: { tuple: { fields: ['a', 'b'],
    controls: { derived: '[(../source), (../source)]' } } } } },
  { source: 1 }, [{ path: '/source', value: 3 }]);
  expect(result.root.structure!.a.raw).toBe(3);
  expect(result.root.structure!.sink.raw).toBe(4);
  expect(result.proof).toBeUndefined();
});
