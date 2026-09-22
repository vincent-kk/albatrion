// D-2·D-3 교차검증 (claude). ajv 8.17.1, 플러그인 기본 설정과 같은 옵션.
//   node architecture/reviews/crosscheck-claude-ajv.mjs
// dataPath는 플러그인의 transformErrors(schema-form-ajv8-plugin/src/validator/utils/transformErrors.ts)와 같은 규칙으로 계산한다:
//   required 에러는 instancePath + '/' + missingProperty, 그 밖은 instancePath, 빈 경로는 '/'.
import { createRequire } from 'node:module';

const require = createRequire(
  new URL('../../../schema-form-ajv8-plugin/package.json', import.meta.url),
);
const { version } = require('ajv/package.json');
if (version !== '8.17.1') throw new Error(`ajv ${version}`);
const Ajv = require('ajv').default;
const Ajv2020 = require('ajv/dist/2020').default;

// schema-form-ajv8-plugin/src/default/validatorPlugin.ts 의 defaultSettings
const settings = { allErrors: true, strictSchema: false, validateFormats: false };
const ajv = new Ajv(settings);
const ajv2020 = new Ajv2020(settings);

const dataPath = (e) => {
  const miss = e.keyword === 'required' && e.params?.missingProperty;
  if (e.instancePath) return miss ? `${e.instancePath}/${miss}` : e.instancePath;
  return miss ? `/${miss}` : '/';
};

const run = (group, name, schema, inputs, engine = ajv) => {
  const validate = engine.compile(schema);
  for (const input of inputs) {
    const valid = validate(structuredClone(input));
    const errors = (validate.errors ?? []).map(
      (e) => `${dataPath(e)} ${e.keyword} "${e.message}"`,
    );
    console.log(JSON.stringify({ group, name, input, valid, errors }));
  }
};

console.log(`ajv ${version}`, JSON.stringify(settings));

// ─── D-3 금지 조각 ───────────────────────────────────────────
const X = [{ x: 'secret' }, {}, { x: '' }, { x: null }];
run('D-3', 'properties.x=false', { type: 'object', properties: { x: false } }, X);
run(
  'D-3',
  'not.required[x]',
  { type: 'object', properties: { x: { type: 'string' } }, not: { required: ['x'] } },
  X,
);
const banSchema = (then) => ({
  type: 'object',
  properties: { mode: { type: 'string' }, x: { type: 'string' } },
  if: { properties: { mode: { const: 'ban' } }, required: ['mode'] },
  then,
});
const BAN = [{ mode: 'ban', x: 'secret' }, { mode: 'ban' }, { mode: 'ok', x: 'secret' }];
run('D-3', 'if mode=ban then properties.x=false', banSchema({ properties: { x: false } }), BAN);
run('D-3', 'if mode=ban then not.required[x]', banSchema({ not: { required: ['x'] } }), BAN);
// 2라운드 S5의 스키마 — 가드가 금지 대상 자신을 읽는다
run(
  'D-3',
  'S5: if required[a] then properties.a=false',
  {
    type: 'object',
    properties: { a: { type: 'string' } },
    if: { required: ['a'] },
    then: { properties: { a: false } },
  },
  [{ a: 'typed' }, {}, { a: '' }],
);
// 금지 조각이 "비활성화와 같다"(i)일 때 방출이 바뀌는지: 금지된 x가 빠진 방출과 원래 레코드의 판정
run(
  'D-3',
  '(i) 방출 비교: 로드 {x} vs 방출 {}',
  { type: 'object', properties: { x: false } },
  [{ x: 'secret' }, {}],
);

// 수렴 라운드: then 안에서만 false로 선언된 x(본체에 없음 → extra)와, 같은 부류인 additionalProperties:false의 extra
run(
  'D-3',
  'then-only false (x undeclared)',
  {
    type: 'object',
    properties: { mode: { type: 'string' } },
    if: { properties: { mode: { const: 'ban' } }, required: ['mode'] },
    then: { properties: { x: false } },
  },
  [{ mode: 'ok', x: 'secret' }, { mode: 'ban', x: 'secret' }, { mode: 'ban' }],
);
run(
  'D-3',
  'additionalProperties:false extra',
  { type: 'object', properties: { mode: { type: 'string' } }, additionalProperties: false },
  [{ mode: 'ok', x: 'secret' }],
);

// ─── D-2 부정 가드 ───────────────────────────────────────────
// 자기 부정: 옵션 B에 고정점이 없다. then에 required가 없으면 {}·{x:1} 모두 유효
run(
  'D-2',
  'self-negating (no required)',
  {
    type: 'object',
    if: { not: { required: ['x'] } },
    then: { properties: { x: { type: 'number', default: 1 } } },
  },
  [{}, { x: 1 }],
);
// codex3 §3 마지막 행: then에 required가 있으면 {} invalid, {x:1} valid
run(
  'D-2',
  'self-negating (then.required x)',
  {
    type: 'object',
    if: { not: { required: ['x'] } },
    then: { properties: { x: { default: 1 } }, required: ['x'] },
  },
  [{}, { x: 1 }],
);
// codex3 §2 옵션 A 반례: 부정 가드 + 다른 조각의 활성
const negThen = {
  type: 'object',
  properties: { seed: {} },
  allOf: [
    { if: { not: { required: ['x'] } }, then: { properties: { a: { default: 'A' } } } },
    { if: { required: ['seed'] }, then: { properties: { x: { default: 1 } } } },
  ],
};
const AB = [
  { seed: true, a: 'A', x: 1 }, // 옵션 A의 방출
  { seed: true, x: 1 }, // 옵션 B의 방출
];
run('D-2', 'neg-guard + other fragment', negThen, AB);
run('D-2', 'neg-guard + other fragment + unevaluatedProperties:false', { ...negThen, unevaluatedProperties: false }, AB, ajv2020);
// 부정 가드의 then/else 동시 활성: then과 else가 같은 키를 서로 다른 제약으로 선언
const thenElse = {
  type: 'object',
  properties: { seed: {} },
  allOf: [
    {
      if: { not: { required: ['x'] } },
      then: { properties: { kind: { const: 'draft' } }, required: ['kind'] },
      else: { properties: { kind: { const: 'final' } }, required: ['kind'] },
    },
    { if: { required: ['seed'] }, then: { properties: { x: { default: 1 } } } },
  ],
};
run('D-2', 'then/else both on (kind const)', thenElse, [
  { seed: true, x: 1, kind: 'draft' }, // 옵션 A: then이 첫 바퀴에 켜져 kind default/선택이 draft로 남은 경우
  { seed: true, x: 1, kind: 'final' }, // 옵션 B: 최종 값에 대해 else
]);
