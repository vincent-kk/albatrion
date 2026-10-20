// Regression record for rule-owner observation identity; no product ID allocation occurs here.
import { describe, expect, it } from 'vitest';

import {
  assertRuleIndexes,
  createRuleTargetIdentity,
} from '../ruleTargetIdentity';

const node = (path = '/target', detached = false) => ({
  path,
  detached,
  blueprintNode: { kind: 'number' },
});
const key = (id: number, path = '/target') =>
  JSON.stringify([
    '',
    'object',
    7,
    '/derived',
    'target',
    path,
    'number:terminal',
    id,
  ]);
function context() {
  const old = node('/target', true),
    current = node(),
    other = node('/other');
  const nodes = new WeakMap<object, number>([
    [old, 1],
    [current, 2],
    [other, 3],
  ]);
  const ids = new WeakMap<object, number>([
    [old, 41],
    [current, 42],
    [other, 43],
  ]);
  const known = [old, current, other];
  const normalize = createRuleTargetIdentity(
    () => known,
    (n) => ids.get(n),
    nodes,
  );
  return { old, current, other, nodes, ids, known, normalize };
}
const stores = (k: string) => ({
  rules: new Map([[k, 9]]),
  sources: new Map([['', new Set([k])]]),
  targets: new Map([['/target', new Set([k])]]),
});
describe('rule-owner identity regression record', () => {
  it('accepts global number shifts for the same canonical object edge', () => {
    const a = context(),
      b = context();
    b.ids.set(b.current, 142);
    expect(a.normalize(key(42))).toBe(b.normalize(key(142)));
    expect(JSON.parse(a.normalize(key(42))).slice(0, 7)).toEqual(
      JSON.parse(key(42)).slice(0, 7),
    );
  });
  it('preserves actual targets at different paths', () => {
    const c = context();
    expect(c.normalize(key(43, '/other'))).not.toBe(c.normalize(key(42)));
  });
  it('distinguishes a first-seen retired stale occurrence', () => {
    const c = context();
    expect(c.normalize(key(41))).not.toBe(c.normalize(key(42)));
  });
  it('distinguishes a retained non-live occurrence at the same path and kind', () => {
    const c = context();
    c.old.detached = false;
    expect(c.normalize(key(41))).not.toBe(c.normalize(key(42)));
  });
  it('rejects a nonexistent or foreign-module owner ID', () => {
    const c = context();
    expect(() => c.normalize(key(900000000))).toThrow(/owner/);
    expect(() =>
      createRuleTargetIdentity(
        () => c.known,
        () => undefined,
        c.nodes,
      )(key(42)),
    ).toThrow(/owner/);
  });
  it('rejects conflicting target reverse-index paths', () => {
    const s = stores(key(42));
    s.targets = new Map([['/other', new Set([key(42)])]]);
    expect(() => assertRuleIndexes(s.rules, s.sources, s.targets)).toThrow(
      /target/,
    );
  });
  it('rejects conflicting source forward-index paths', () => {
    const s = stores(key(42));
    s.sources = new Map([['/other', new Set([key(42)])]]);
    expect(() => assertRuleIndexes(s.rules, s.sources, s.targets)).toThrow(
      /source/,
    );
  });
  it('requires both directions of committed membership', () => {
    const s = stores(key(42));
    s.sources.get('')!.clear();
    expect(() => assertRuleIndexes(s.rules, s.sources, s.targets)).toThrow(
      /source/,
    );
    const orphan = stores(key(42));
    orphan.rules.clear();
    expect(() =>
      assertRuleIndexes(orphan.rules, orphan.sources, orphan.targets),
    ).toThrow(/Orphan/);
  });
  it('rejects ambiguous candidates and unreachable codec references', () => {
    const c = context();
    c.known.push(c.current);
    expect(() => c.normalize(key(42))).toThrow(/ambiguous/);
    expect(() =>
      createRuleTargetIdentity(
        () => [c.current],
        (n) => c.ids.get(n),
        new WeakMap(),
      )(key(42)),
    ).toThrow(/codec/);
  });
  it('preserves seeded old references after a same-path replacement', () => {
    const c = context(),
      before = c.normalize(key(41));
    expect(c.normalize(key(42))).not.toBe(before);
    expect(c.normalize(key(41))).toBe(before);
  });
  it('rejects conflicting object paths and kinds without allocating IDs', () => {
    const c = context();
    expect(() => c.normalize(key(42, '/other'))).toThrow(/path/);
    c.current.blueprintNode.kind = 'string';
    expect(() => c.normalize(key(42))).toThrow(/kind/);
    expect(c.ids.get(c.current)).toBe(42);
  });
  it('preserves five-part policy keys without an invented target index', () => {
    const c = context(),
      policy = JSON.stringify([
        '',
        'object:branch',
        7,
        '/unsetOnInactive',
        null,
      ]);
    expect(c.normalize(policy)).toBe(policy);
    expect(() =>
      assertRuleIndexes(
        new Map([[policy, true]]),
        new Map([['', new Set([policy])]]),
        new Map(),
      ),
    ).not.toThrow();
  });
});
