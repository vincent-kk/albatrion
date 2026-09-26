/** Reproducible harness port; source assertions remain unchanged unless listed below. */
import { readFileSync, writeFileSync } from 'node:fs';
const read = file => readFileSync(new URL('../../round8/' + file, import.meta.url), 'utf8');
const save = (file, text) => writeFileSync(new URL(file, import.meta.url), text);
let self = read('proto/selfcheck-v4e.mjs');
self = self.replace("from './loop-v4e.mjs'", "from '../proto/loop-v5.mjs'")
  .replace("from './build-v4e.mjs'", "from '../proto/build-v5.mjs'")
  .replace('  select,\n', '').replaceAll('selfcheck-v4e.mjs', 'selfcheck-v5.mjs')
  .replaceAll('disableDefaultInjection', 'disableAutomaticWrites');
self = self.replaceAll('select: 0, ', '').replaceAll('select: 1, ', '');
self = self.replace('    select(r, 1);', '    setValue(r, { a: 1, b: 2 });');
self = self.replace(`first === '{"a":1}' && second === '{"b":2}' && same(rawTree(r), { a: 1, b: 2 })`,
  `first === '{"a":1,"b":2}' && second === first && same(rawTree(r), { a: 1, b: 2 })`);
self = self.replace('A3-1-select: same raw, selection slot picks the branch (initial selection: tie -> first)',
  'A3-1-unconditional: both pure branches stay on; full replacement preserves both values');
self = self.replace("r.settle.status === 'budget-exceeded' && keys === ROUND_CAP",
  "r.settle.status === 'budget-exceeded' && keys === (SWITCHES.COMMIT_ON_BUDGET === 'base' ? 1 : ROUND_CAP)");
self = self.replace("same(valueOf(r), { t: 'from-C' })",
  "same(valueOf(r), SWITCHES.INJECT_TO_EDGE ? undefined : { t: 'from-undefined' }) && r.index.get('c').raw === undefined");
self = self.replace("valueOf(r).host === 17 && bRaw === 'BD' && lastSettle.rounds === 2",
  "(SWITCHES.INJECT_TO_EDGE ? same(valueOf(r).host, { a: 'A2', b: 'BD' }) && lastSettle.rounds === 1 : valueOf(r).host === 17 && lastSettle.rounds === 2) && bRaw === 'BD'");
self = self.replace("valueOf(r).n === rawTree(r).n && lastSettle.rounds === ROUND_CAP",
  "valueOf(r).n === rawTree(r).n && lastSettle.rounds === (SWITCHES.INJECT_TO_EDGE ? 1 : ROUND_CAP)");
self = self.replace('A3-2 default-driven chain of 30 hits ROUND_CAP (each link costs a transition round) -> spec defect',
  'A3-2 default-driven chain hits cap; base commits seed only, lastRound commits completed links');
self = self.replace('A4b: the user cannot remove t — injectTo re-derives it from the inactive c (E7: declared behaviour)',
  'A4b: no provisional c survives; edge mode commits empty base, level mode derives from undefined');
self = self.replace('A4c: injectTo 17 = full replacement of the host (a erased, b default injected under 17); a partial write un-17s the host but derive re-injects 17 in round 2 (E7 declared) — the round-3 "partial or full?" is now defined',
  'A4c: an unchanged source preserves the partial host edit in edge mode; historical level mode replaces it');
self = self.replace('A4-cap: non-cyclic 30-step injectTo stops at the cap; emit == raw == writes of 24 executed rounds (round 25 is computed, its write is not)',
  'A4-cap: same-value write costs one round in edge mode, historical level mode reaches the cap');
save('./selfcheck-v5.mjs', self);
let port = read('regress/r7-port.mjs').replace("from '../proto/loop-v4e.mjs'", "from '../proto/loop-v5.mjs'")
  .replaceAll('select: 0, ', '').replaceAll('select: 1, ', '')
  .replaceAll("SELECT_RULE: 'v4c'", '').replaceAll("SELECT_RULE: 'score', TIE_MODE: 'first'", '')
  .replaceAll("SELECT_RULE: 'score', TIE_MODE: 'none'", '');
save('./r7-port.mjs', port);
let r8 = read('r8.mjs').replace("from './proto/loop-v4e.mjs'", "from '../proto/loop-v5.mjs'")
  .replace("new URL('./r8-output.txt'", "new URL('./r8port-output.txt'");
save('./r8-port.mjs', r8);
console.log('regression harnesses ported');
