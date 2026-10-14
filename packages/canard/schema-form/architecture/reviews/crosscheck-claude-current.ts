// @ts-nocheck — D-2·D-3 교차검증 (claude). 현재 구현(src/core)에서 같은 스키마가 어떻게 동작하는가.
// 경우마다 새 프로세스:
//   cd packages/canard/schema-form
//   node /Users/Vincent/Workspace/albatrion/node_modules/.bin/vite-node \
//     --config architecture/spikes/work-loop/vite.spike.config.mjs \
//     architecture/reviews/crosscheck-claude-current.ts <case>
import Ajv from 'ajv';

import { ValidationMode, nodeFromJSONSchema } from '@/schema-form/core';

import { createValidatorFactory } from '../../../schema-form-ajv8-plugin/src/validator/createValidatorFactory';

const ajv = new Ajv({ allErrors: true, strictSchema: false, validateFormats: false });
const validatorFactory = createValidatorFactory(ajv);

const ban = (then: any) => ({
  type: 'object',
  properties: { mode: { type: 'string' }, x: { type: 'string' } },
  if: { properties: { mode: { const: 'ban' } }, required: ['mode'] },
  then,
});

const cases: Record<string, { schema: any; value: any; write?: [string, any] }> = {
  // D-2 — 표준 문법의 자기 부정
  'selfneg-undeclared': {
    schema: { type: 'object', if: { not: { required: ['x'] } }, then: { properties: { x: { type: 'number', default: 1 } } } },
    value: {},
  },
  'selfneg-declared': {
    schema: {
      type: 'object',
      properties: { x: { type: 'number' } },
      if: { not: { required: ['x'] } },
      then: { properties: { x: { type: 'number', default: 1 } }, required: ['x'] },
    },
    value: {},
  },
  // D-2 — 현재 문법(computed.active)으로 쓴 자기 부정: x는 자기가 없을 때만 활성, default 1
  'selfneg-active': {
    schema: {
      type: 'object',
      properties: { x: { type: 'number', default: 1, computed: { active: '../x === undefined' } } },
    },
    value: {},
  },
  // D-2 — R7: 서로를 부정하는 두 필드
  'mutual-active': {
    schema: {
      type: 'object',
      properties: {
        a: { type: 'string', default: 'A', computed: { active: '../b === undefined' } },
        b: { type: 'string', default: 'B', computed: { active: '../a === undefined' } },
      },
    },
    value: {},
  },
  // D-2 — derived 순환(현재 INFINITE_LOOP_DETECTED가 나는 것으로 기록된 경우)
  'derived-cycle': {
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number', default: 0, computed: { derived: '../b + 1' } },
        b: { type: 'number', default: 0, computed: { derived: '../a + 1' } },
      },
    },
    value: {},
  },
  // D-3 — 금지 조각
  'false-property': { schema: { type: 'object', properties: { x: false } }, value: { x: 'secret' } },
  'false-property-declared-elsewhere': {
    schema: { type: 'object', properties: { x: { type: 'string' } }, allOf: [{ properties: { x: false } }] },
    value: { x: 'secret' },
  },
  'not-required': {
    schema: { type: 'object', properties: { x: { type: 'string' } }, not: { required: ['x'] } },
    value: { x: 'secret' },
  },
  'ban-false': { schema: ban({ properties: { x: false } }), value: { mode: 'ban', x: 'secret' } },
  'ban-not-required': { schema: ban({ not: { required: ['x'] } }), value: { mode: 'ban', x: 'secret' } },
  // 수렴 라운드 D-3 — x가 then 안에서만 false로 선언되고 본체에는 없다(x는 extra)
  'ban-false-undeclared-load': {
    schema: {
      type: 'object',
      properties: { mode: { type: 'string' } },
      if: { properties: { mode: { const: 'ban' } }, required: ['mode'] },
      then: { properties: { x: false } },
    },
    value: { mode: 'ban', x: 'secret' },
  },
  'ban-false-undeclared-switch': {
    schema: {
      type: 'object',
      properties: { mode: { type: 'string' } },
      if: { properties: { mode: { const: 'ban' } }, required: ['mode'] },
      then: { properties: { x: false } },
    },
    value: { mode: 'ok', x: 'secret' },
    write: ['/mode', 'ban'],
  },
  // 현재 문법의 조건부 필드와 비교: then.required에 오른 필드만 조건부로 활성
  'ban-then-required': {
    schema: ban({ required: ['x'] }),
    value: { mode: 'ok', x: 'secret' },
  },
};

const name = process.argv[2];
const c = cases[name];
if (!c) throw new Error(`unknown case ${name}; cases: ${Object.keys(cases).join(' ')}`);

const t0 = Date.now();
let caught: any = null;
process.on('uncaughtException', (e: any) => {
  console.log(JSON.stringify({ name, stage: 'uncaught(async)', ms: Date.now() - t0, code: e?.code ?? e?.name, message: String(e?.message).split('\n')[0], details: e?.details }));
  process.exit(0);
});
process.on('unhandledRejection', (e: any) => {
  console.log(JSON.stringify({ name, stage: 'unhandledRejection', ms: Date.now() - t0, code: e?.code ?? e?.name, message: String(e?.message).split('\n')[0] }));
  process.exit(0);
});

let changes = 0;
let root: any;
try {
  root = nodeFromJSONSchema({
    jsonSchema: c.schema,
    defaultValue: c.value,
    validationMode: ValidationMode.OnChange,
    validatorFactory,
    onChange: () => changes++,
  });
} catch (e: any) {
  caught = e;
  const at = String(e?.stack)
    .split('\n')
    .filter((l) => l.includes('/src/'))
    .slice(0, 3)
    .map((l) => l.trim().replace(/.*\/src\//, 'src/').replace(/\)$/, ''));
  console.log(JSON.stringify({ name, stage: 'sync-construct', code: e?.code ?? e?.name, message: String(e?.message).split('\n')[0], at }));
}
if (root) {
  await new Promise((r) => setTimeout(r, 50));
  await root.validate?.();
  await new Promise((r) => setTimeout(r, 20));
  if (c.write) {
    const before = { value: root.value, globalErrors: root.globalErrors?.map((e: any) => `${e.dataPath} ${e.keyword}`) };
    console.log(JSON.stringify({ name, stage: 'before-write', ...before }));
    root.find(c.write[0])?.setValue(c.write[1]);
    await new Promise((r) => setTimeout(r, 50));
    await root.validate?.();
    await new Promise((r) => setTimeout(r, 20));
  }
  const describe = (p: string) => {
    const n = root.find(p);
    return n ? { exists: true, type: n.type, active: n.active, visible: n.visible, value: n.value, errors: n.errors?.map((e: any) => `${e.keyword}:${e.message}`) } : { exists: false };
  };
  const children = (root.children ?? []).map((ch: any) => ch.node?.name ?? ch.name);
  console.log(
    JSON.stringify({
      name,
      stage: 'settled',
      ms: Date.now() - t0,
      value: root.value,
      children,
      x: describe('/x'),
      a: name === 'mutual-active' || name === 'derived-cycle' ? describe('/a') : undefined,
      b: name === 'mutual-active' || name === 'derived-cycle' ? describe('/b') : undefined,
      rootErrors: root.errors?.map((e: any) => `${e.dataPath} ${e.keyword}:${e.message}`),
      globalErrors: root.globalErrors?.map((e: any) => `${e.dataPath} ${e.keyword}:${e.message}`),
      onChangeCalls: changes,
    }),
  );
}
