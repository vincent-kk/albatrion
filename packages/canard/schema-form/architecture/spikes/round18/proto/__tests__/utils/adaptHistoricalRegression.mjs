/** Exact, ledger-backed changes applied only to the in-memory v7 regression copy. */
const changes = [
  {
    file: '/round9/regress/selfcheck-v5.mjs',
    ledger: 'VALUE-034',
    before: 'check(valueOf(r) === undefined && activeIds(r).length === 1,',
    after: 'check(same(valueOf(r), {}) && activeIds(r).length === 1,',
  },
  {
    file: '/round9/regress/selfcheck-v5.mjs',
    ledger: 'VALUE-034',
    before: 'check(valueOf(r) === undefined && activeIds(r).length === 0,',
    after: 'check(same(valueOf(r), {}) && activeIds(r).length === 0,',
  },
  {
    file: '/round9/regress/selfcheck-v5.mjs',
    ledger: 'FRAGMENT-050',
    before: "SWITCHES.INJECT_TO_EDGE ? undefined : { t: 'from-undefined' }",
    after: "SWITCHES.INJECT_TO_EDGE ? { t: 'from-C' } : { t: 'from-undefined' }",
  },
  {
    file: '/round9/regress/selfcheck-v5.mjs',
    ledger: 'FRAGMENT-050',
    before: 'A4b: no provisional c survives; edge mode commits empty base, level mode derives from undefined',
    after: 'A4b [FRAGMENT-050]: only c fill is retracted; edge mode retains from-C, level mode derives from undefined',
  },
  {
    file: '/round9/r9.mjs',
    ledger: 'SETTLE-004',
    before: "const expected = (conflict === 'last') === (order[0] === 'derived') ? 'I:2' : 'D:1';",
    after: "const expected = 'D:1';",
  },
  {
    file: '/round9/r9.mjs',
    ledger: 'CONTROLS-028 / WRITE-090',
    before: "eq(node(root, 'erased').raw, 'loaded', 'true held across reset has no rising edge');",
    after: "eq(node(root, 'erased').raw, undefined, '[CONTROLS-028 / WRITE-090] reset starts a lifetime and evaluates unset against loaded input');",
  },
  {
    file: '/round9/regress/edge-cases.mjs',
    ledger: 'SETTLE-004',
    before: "eq(root.find('/x').raw, order[0] === 'derived' ? undefined : 4, 'stage order includes clearValue');",
    after: "eq(root.find('/x').raw, undefined, '[SETTLE-004] unset wins independently of stage order');",
  },
  {
    file: '/round9/r9b.mjs',
    ledger: 'FRAGMENT-050',
    before: "eq(root.settle.status, 'budget-exceeded', 'contradictory fill feedback cannot stabilize');",
    after: "eq(root.settle.status, 'stable', '[FRAGMENT-050] retained injection ends fill feedback');",
  },
  {
    file: '/round9/r9b.mjs',
    ledger: 'FRAGMENT-050',
    before: "eq(root.find('/t').raw, undefined, 'base commit contains no provisional injection');",
    after: "eq(root.find('/t').raw, 'from-C', '[FRAGMENT-050] applied injection survives fragment exit');",
  },
  {
    file: '/round9/r9b.mjs',
    ledger: 'FRAGMENT-050',
    before: "eq(L.lastSettle.birthsAtCommit, [], 'budget outcome does not confirm any birth');",
    after: "eq(L.lastSettle.birthsAtCommit, ['/', '/t'], '[FRAGMENT-050] only final-shape births are confirmed');",
  },
];

/**
 * Port immutable historical assertions to the current ledger for v7 only.
 * @param {string} url Historical module URL; unrelated modules pass through.
 * @param {string} source Original module text, never written back to disk.
 * @returns {string} Source with each declared expectation replaced exactly once.
 * @throws {Error} If a historical assertion changed or became ambiguous.
 */
export function adaptHistoricalRegression(url, source) {
  for (const change of changes) {
    if (!url.endsWith(change.file)) continue;
    if (source.split(change.before).length !== 2)
      throw new Error(`${change.ledger}: expected one historical assertion in ${change.file}`);
    source = source.replace(change.before, change.after);
  }
  return source;
}
