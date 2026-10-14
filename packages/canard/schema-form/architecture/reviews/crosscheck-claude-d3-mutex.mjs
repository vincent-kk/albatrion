// D-3 교차검증 (claude). 금지 조각 (i)의 대칭 배타 스키마 — 3차안 프로토타입(loop-v3.mjs)의 A3-5 구현 그대로.
//   node architecture/reviews/crosscheck-claude-d3-mutex.mjs
// 스키마: a와 b는 서로 배타(흔한 "둘 중 하나만" 관용구를 금지 조각으로 쓴 모양).
//   allOf: [ {if: {required:[a]}, then: {properties: {b: false}}},
//            {if: {required:[b]}, then: {properties: {a: false}}} ]
// (i)  금지 = 비활성화: 투영에서 뺀다(loop-v3 `prohibits`). 가드는 투영 전 L을 본다(E5 (2)).
// (ii)/(iii) 금지를 투영에 쓰지 않는다: emit = raw 그대로, 판정은 검증기.
import { createRequire } from 'node:module';

import {
  attach,
  declareFragments,
  flush,
  leaf,
  localValueOf,
  object,
  prime,
  setValue,
  valueOf,
  write,
} from '../spikes/work-loop/proto/loop-v3.mjs';

const require = createRequire(
  new URL('../../../schema-form-ajv8-plugin/package.json', import.meta.url),
);
const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true, strictSchema: false, validateFormats: false });

const schema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' } },
  allOf: [
    { if: { required: ['a'] }, then: { properties: { b: false } } },
    { if: { required: ['b'] }, then: { properties: { a: false } } },
  ],
};
const validate = ajv.compile(schema);
const judge = (v) => {
  const valid = validate(v ?? {});
  return { valid, errors: (validate.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.keyword}`) };
};
const reqA = ajv.compile({ type: 'object', required: ['a'] });
const reqB = ajv.compile({ type: 'object', required: ['b'] });

const build = (prohibit) => {
  const root = object('root');
  const a = attach(root, leaf('a'));
  const b = attach(root, leaf('b'));
  declareFragments(root, [
    { guard: (L) => reqA(L), prohibits: prohibit ? ['b'] : [] },
    { guard: (L) => reqB(L), prohibits: prohibit ? ['a'] : [] },
  ]);
  prime(root);
  return { root, a, b };
};

const scenario = (label, prohibit, steps) => {
  const t = build(prohibit);
  const rows = [];
  for (const [what, fn] of steps) {
    fn(t);
    flush(t.root);
    const emit = valueOf(t.root);
    rows.push({ step: what, raw: { a: t.a.raw, b: t.b.raw }, local: localValueOf(t.root), emit: emit ?? {}, ajvOnEmit: judge(emit) });
  }
  console.log(JSON.stringify({ label, rows }, null, 0));
};

const load = (v) => (t) => setValue(t.root, v);

// 1. 서버 레코드가 둘 다 가진 채 온다(스키마상 무효).
scenario('(i) load {a,b}', true, [['load {a:"A",b:"B"}', load({ a: 'A', b: 'B' })]]);
scenario('(ii)/(iii) load {a,b}', false, [['load {a:"A",b:"B"}', load({ a: 'A', b: 'B' })]]);

// 2. 사용자가 a를 채운 뒤 b를 채운다.
scenario('(i) type a then b', true, [
  ['type a', (t) => write(t.a, 'A')],
  ['type b', (t) => write(t.b, 'B')],
  ['clear a', (t) => write(t.a, undefined)],
]);
scenario('(ii)/(iii) type a then b', false, [
  ['type a', (t) => write(t.a, 'A')],
  ['type b', (t) => write(t.b, 'B')],
  ['clear a', (t) => write(t.a, undefined)],
]);
