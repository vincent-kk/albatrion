/**
 * U15: same-run legacy/new mount and delivery comparisons.
 * Each mount uses a fresh schema per engine; legacy timing includes onChange
 * completion. Run serially under Node/V8 and Bun/JSC with Welch's test.
 */
import { performance } from 'node:perf_hooks';

import Ajv from 'ajv';
import type { AnySchema } from 'ajv';

// This bench is a dev script outside the package build, so it imports plugin source directly.
import { ajvValidatorPlugin } from '../../schema-form-ajv8-plugin/src/default/validatorPlugin';

import { blueprint } from '../src/core/blueprint';
import { nodeFromJSONSchema } from '../src/core/nodeFromJSONSchema';
import { schemaNodeFactory, SetValueOption } from '../src/core/SchemaNode';
import { SchemaNode } from '../src/core/SchemaNode/SchemaNode';
import { dispatchMount } from '../src/core/dispatch';
import { createTestValidator } from '../src/core/__tests__/fixtures/createTestValidator';
import { ValidationMode } from '../src/core/types/state';
import type { Validator } from '../src/core/validation';
import type { JSONSchema } from '../src/types';

const noop = () => {};
const mountSamples = 31;
const guardSamples = 21;
const waveSamples = 31;
const waveWidth = 1_000;
let sink = 0;

type MountSample = { ms: number; formMs: number; validatorMs: number;
  compileMs: number; guardMs: number; guardCalls: number };
type Pair = { legacy: number[]; new: number[] };

// The same two-tailed Welch calculation as benchmark-form's guard:check.
function logGamma(input: number): number {
  const coefficients = [0.99999999999980993, 676.5203681218851,
    -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7];
  if (input < 0.5)
    return Math.log(Math.PI / Math.sin(Math.PI * input)) - logGamma(1 - input);
  const value = input - 1;
  let sum = coefficients[0];
  for (let index = 1; index < coefficients.length; index++)
    sum += coefficients[index] / (value + index);
  const shifted = value + 7.5;
  return 0.5 * Math.log(2 * Math.PI) +
    (value + 0.5) * Math.log(shifted) - shifted + Math.log(sum);
}

function betaFraction(x: number, a: number, b: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-300) d = 1e-300;
  d = 1 / d;
  let result = d * c;
  for (let index = 1; index <= 200; index++) {
    const twice = 2 * index;
    let term = index * (b - index) * x / ((qam + twice) * (a + twice));
    d = 1 + term * d;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + term / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    result *= d * c;
    term = -(a + index) * (qab + index) * x /
      ((a + twice) * (qap + twice));
    d = 1 + term * d;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + term / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const delta = d * c;
    result *= delta;
    if (Math.abs(delta - 1) < 3e-12) break;
  }
  return result;
}

function betaRegularized(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const logBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - logBeta);
  if (x < (a + 1) / (a + b + 2))
    return front / a * betaFraction(x, a, b);
  return 1 - front / b * betaFraction(1 - x, b, a);
}

function welchPValue(legacy: number[], current: number[]): number {
  const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const a = mean(legacy);
  const b = mean(current);
  const variance = (values: number[], average: number) =>
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
      (values.length - 1);
  const va = variance(legacy, a) / legacy.length;
  const vb = variance(current, b) / current.length;
  const combined = va + vb;
  if (combined === 0) return 1;
  const t = (a - b) / Math.sqrt(combined);
  const df = combined ** 2 /
    (va ** 2 / (legacy.length - 1) + vb ** 2 / (current.length - 1));
  return betaRegularized(df / (df + t * t), df / 2, 0.5);
}

function conditionalSchema(count: number): JSONSchema {
  const properties: Record<string, JSONSchema> = {};
  for (let index = 0; index < count; index++)
    properties[`group_${index}`] = { type: 'object',
      properties: { enabled: { type: 'boolean' }, field: { type: 'number' } },
      if: { properties: { enabled: { const: true } }, required: ['enabled'] },
      then: { required: ['field'] },
    };
  return { type: 'object', properties };
}

function conditionalValue(count: number) {
  const value: Record<string, { enabled: boolean; field: number }> = {};
  for (let index = 0; index < count; index++)
    value[`group_${index}`] = { enabled: index === 0, field: index };
  return value;
}

function newMount(schema: JSONSchema, value: ReturnType<typeof conditionalValue>, guards: number,
  base: Validator = createTestValidator()): MountSample {
  let compileMs = 0;
  let guardMs = 0;
  let guardCalls = 0;
  const validator: Validator = {
    compile(copy) {
      const start = performance.now();
      try { return base.compile(copy); }
      finally { compileMs += performance.now() - start; }
    },
    compileGuard(root, pointer) {
      const start = performance.now();
      try { return base.compileGuard(root, pointer); }
      finally { guardMs += performance.now() - start; guardCalls++; }
    },
  };
  const start = performance.now();
  const root: unknown = schemaNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' }, validationMode: ValidationMode.OnChange,
    loadSnapshot: undefined, latentRaw: new Map(),
    typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  }, validator);
  if (!(root instanceof SchemaNode)) throw new Error('New mount did not create a runtime node');
  dispatchMount(root, value, SetValueOption.Overwrite);
  const ms = performance.now() - start;
  if (!root.find('/group_0/field') || guardCalls !== guards)
    throw new Error(`New conditional fixture: field or guards missing (${guardCalls})`);
  sink += Number(Boolean(root.value));
  const validatorMs = compileMs + guardMs;
  return { ms, formMs: ms - validatorMs, validatorMs, compileMs, guardMs, guardCalls };
}

async function legacyMount(schema: JSONSchema, value: ReturnType<typeof conditionalValue>, _guards: number): Promise<MountSample> {
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  let compileMs = 0;
  const validatorFactory = (copy: JSONSchema) => {
    const start = performance.now();
    let validate: ReturnType<Ajv['compile']>;
    try { validate = ajv.compile(copy as AnySchema); }
    finally { compileMs += performance.now() - start; }
    return (value: unknown) => {
      if (!validate(value)) throw new Error('Legacy mount supplied an invalid value');
      return null;
    };
  };
  let finishMount: () => void = noop;
  const completed = new Promise<void>((resolve) => { finishMount = resolve; });
  const start = performance.now();
  const root = nodeFromJSONSchema({ jsonSchema: schema,
    defaultValue: value, onChange: finishMount,
    validationMode: ValidationMode.OnChange, validatorFactory });
  await completed;
  const ms = performance.now() - start;
  if (!root.find('/group_0/field')) throw new Error('Legacy conditional field missing');
  sink += Number(Boolean(root.value));
  return { ms, formMs: ms - compileMs, validatorMs: compileMs,
    compileMs, guardMs: 0, guardCalls: 0 };
}

function summarize(pair: Pair) {
  const legacyHz = pair.legacy.map((ms) => 1000 / ms);
  const newHz = pair.new.map((ms) => 1000 / ms);
  const legacyMeanHz = legacyHz.reduce((sum, value) => sum + value, 0) / legacyHz.length;
  const newMeanHz = newHz.reduce((sum, value) => sum + value, 0) / newHz.length;
  const pValue = welchPValue(legacyHz, newHz);
  const ratio = newMeanHz / legacyMeanHz;
  return { legacyMeanMs: pair.legacy.reduce((a, b) => a + b, 0) / pair.legacy.length,
    newMeanMs: pair.new.reduce((a, b) => a + b, 0) / pair.new.length,
    legacyMeanHz, newMeanHz, throughputRatio: ratio, pValue,
    verdict: ratio < 0.85 && pValue < 0.05 ? 'FAIL' : 'PASS',
    samples: pair.legacy.length };
}

async function mountRow(guards: number, samples: number, mount = newMount) {
  const value = conditionalValue(guards);
  const pairs: Pair = { legacy: [], new: [] };
  const parts = { legacyForm: 0, legacyValidator: 0, newForm: 0,
    newValidator: 0, newCompile: 0, newGuard: 0 };
  const warmups = guards === 200 ? 3 : 6;
  for (let index = 0; index < warmups + samples; index++) {
    const legacySchema = conditionalSchema(guards);
    const newSchema = conditionalSchema(guards);
    let old: MountSample;
    let current: MountSample;
    if (index % 2) {
      current = mount(newSchema, value, guards);
      old = await legacyMount(legacySchema, value, guards);
    } else {
      old = await legacyMount(legacySchema, value, guards);
      current = mount(newSchema, value, guards);
    }
    if (index < warmups) continue;
    pairs.legacy.push(old.ms);
    pairs.new.push(current.ms);
    parts.legacyForm += old.formMs;
    parts.legacyValidator += old.validatorMs;
    parts.newForm += current.formMs;
    parts.newValidator += current.validatorMs;
    parts.newCompile += current.compileMs;
    parts.newGuard += current.guardMs;
  }
  return { guards, method: 'fresh schema per engine/sample outside timer; legacy onChange completion included',
    ...summarize(pairs), partsMeanMs: {
    legacyForm: parts.legacyForm / samples,
    legacyValidator: parts.legacyValidator / samples,
    newForm: parts.newForm / samples,
    newValidator: parts.newValidator / samples,
    newCompile: parts.newCompile / samples,
    newGuard: parts.newGuard / samples,
  } };
}

async function pluginMountRow(guards: number, samples: number, directGuardCompile: boolean) {
  ajvValidatorPlugin.bind(new Ajv({ allErrors: true, strictSchema: false,
    validateFormats: false, allowUnionTypes: true }));
  ajvValidatorPlugin.configure({ directGuardCompile });
  let compiledRoot: JSONSchema | undefined;
  const validator: Validator = {
    compile(copy: JSONSchema) {
      compiledRoot = copy;
      return ajvValidatorPlugin.compile(copy);
    },
    compileGuard: ajvValidatorPlugin.compileGuard,
    release: ajvValidatorPlugin.release,
    dialect: ajvValidatorPlugin.dialect,
  };
  try {
    return await mountRow(guards, samples, (schema, value, count) => {
      try { return newMount(schema, value, count, validator); }
      finally {
        // Bare core mounts have no disposal; release the compiled copy outside the timer.
        if (compiledRoot !== undefined) ajvValidatorPlugin.release(compiledRoot);
        compiledRoot = undefined;
      }
    });
  } finally {
    ajvValidatorPlugin.configure({ directGuardCompile: true });
  }
}

function flatSchema() {
  const properties: Record<string, { type: 'number' }> = {};
  for (let index = 0; index < waveWidth; index++)
    properties[`field_${index}`] = { type: 'number' };
  return { type: 'object' as const, properties };
}

function waveValue(value: number) {
  const result: Record<string, number> = {};
  for (let index = 0; index < waveWidth; index++) result[`field_${index}`] = value;
  return result;
}

async function waveRow() {
  const schema = flatSchema();
  const oldRoot = nodeFromJSONSchema({ jsonSchema: schema, onChange: noop,
    defaultValue: waveValue(0) });
  const newRoot: unknown = schemaNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' }, loadSnapshot: undefined,
    latentRaw: new Map(), typeMismatchPaths: new Set(), inactiveValuesMemo: new Map(),
  });
  if (!(newRoot instanceof SchemaNode)) throw new Error('New wave did not create a runtime node');
  dispatchMount(newRoot, waveValue(0));
  const oldChildren = oldRoot.children?.map((child) => child.node);
  const newChildren = newRoot.children;
  if (oldChildren?.length !== waveWidth || newChildren?.length !== waveWidth)
    throw new Error('Wave fixture did not create 1,000 child nodes');
  let oldDeliveries = 0;
  let newDeliveries = 0;
  for (const child of oldChildren) child.subscribe(() => { oldDeliveries++; });
  for (const child of newChildren) child.subscribe(() => { newDeliveries++; });
  const pairs: Pair = { legacy: [], new: [] };
  const warmups = 5;
  for (let index = 0; index < warmups + waveSamples; index++) {
    const next = (index + 1) % 2;
    const value = waveValue(next);
    const oldBefore = oldDeliveries;
    const newBefore = newDeliveries;
    const runLegacy = async () => {
      const start = performance.now();
      oldRoot.setValue(value);
      for (let k = 0; k < 8; k++) await Promise.resolve();
      return performance.now() - start;
    };
    const runNew = () => {
      const start = performance.now();
      newRoot.setValue(value);
      return performance.now() - start;
    };
    let oldMs: number;
    let newMs: number;
    if (index % 2) { newMs = runNew(); oldMs = await runLegacy(); }
    else { oldMs = await runLegacy(); newMs = runNew(); }
    if (oldDeliveries - oldBefore < waveWidth ||
      newDeliveries - newBefore !== waveWidth)
      throw new Error(`Wave delivered ${oldDeliveries - oldBefore}/${newDeliveries - newBefore} nodes`);
    sink += oldDeliveries + newDeliveries;
    if (index >= warmups) { pairs.legacy.push(oldMs); pairs.new.push(newMs); }
  }
  return { nodes: waveWidth, ...summarize(pairs),
    legacyCallbacksPerWrite: oldDeliveries / (warmups + waveSamples),
    newCallbacksPerWrite: newDeliveries / (warmups + waveSamples),
    completion: 'all 1,000 subscribed children reached after eight legacy microtasks' };
}

async function main() {
  const rows = {
    'TEST-076-mount': await mountRow(8, mountSamples),
    'TEST-076-guards200': await mountRow(200, guardSamples),
    'EVENT-004-wave': await waveRow(),
    'TEST-076-mount-ajv8': await pluginMountRow(8, mountSamples, true),
    'TEST-076-guards200-ajv8': await pluginMountRow(200, guardSamples, true),
    'TEST-076-mount-ajv8-rootpointer': await pluginMountRow(8, mountSamples, false),
    'TEST-076-guards200-ajv8-rootpointer': await pluginMountRow(200, guardSamples, false),
  };
  console.log(JSON.stringify({ runtime: Reflect.get(globalThis, 'Bun') ? 'bun' : 'node',
    version: Reflect.get(globalThis, 'Bun') ? process.versions.bun : process.version,
    rows, sink }, null, 2));
}

await main();
