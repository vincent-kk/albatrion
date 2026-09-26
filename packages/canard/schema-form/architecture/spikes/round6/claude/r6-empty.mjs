// Round 6 (claude) — empty-value probes. Run: node r6-empty.mjs
import { leaf, object, attach, declareFragments, prime, write, valueOf, activeIds, rawTree } from '../../work-loop/proto/loop-v4c.mjs';
import { writeFileSync } from 'node:fs';

const J = (v) => JSON.stringify(v === undefined ? '<undefined>' : v);
const out = [];
const log = (...a) => {
  const s = a.join(' ');
  out.push(s);
  console.log(s);
};

// E12 select-guard union, extra key only (ADR 0002 규칙 1 "여분 키만 있는 값도 분기 키 없음")
{
  const root = object('root');
  attach(root, leaf('a'));
  attach(root, leaf('b'));
  declareFragments(root, [
    { id: 'A', select: 0, declares: ['a'], defaults: { a: 'A' } },
    { id: 'B', select: 1, declares: ['b'], defaults: { b: 'B' } },
  ]);
  prime(root, { zzz: 1 });
  log('E12 select-guard, load {zzz:1} -> active', J(activeIds(root)), 'emit', J(valueOf(root)));
}

// E13 all fields cleared: root emit (omitEmpty projection, ADR 0006 §6-7)
{
  const root = object('root');
  const a = attach(root, leaf('a'));
  prime(root, { a: 'x' });
  write(a, '');
  log('E13 root {a}, user clears a to "" -> getValue()', J(valueOf(root)), 'raw', J(rawTree(root)));
}

// E14 discriminated union, user clears the discriminator (D-8 + projection of "")
{
  const root = object('root');
  const kind = attach(root, leaf('kind'));
  attach(root, leaf('meow'));
  declareFragments(root, [{ id: 'cat', guard: (G) => G.kind === 'cat', declares: ['meow'] }]);
  prime(root, { kind: 'cat', meow: 'loud' });
  write(kind, '');
  log('E14 {kind:cat, meow:loud}, user clears kind -> emit', J(valueOf(root)), 'raw', J(rawTree(root)));
}

writeFileSync(new URL('./r6-empty-output.txt', import.meta.url), `${out.join('\n')}\n`);
