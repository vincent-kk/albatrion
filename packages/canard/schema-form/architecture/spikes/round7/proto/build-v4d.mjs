/**
 * Tree builders for the v4 measurement scenarios, plus the AJV guard factory.
 * Same shapes as build-v3.mjs, built on loop-v4. `ajv` is resolved from the
 * monorepo's ajv8 plugin — nothing is installed.
 */
import { createRequire } from 'node:module';

import { array, attach, declareFragments, leaf, object, prime } from './loop-v4d.mjs';

const require = createRequire(
  '/Users/Vincent/Workspace/albatrion/packages/canard/schema-form-ajv8-plugin/package.json',
);
const Ajv2020 = require('ajv/dist/2020').default ?? require('ajv/dist/2020');

/** One AJV instance per process, matching the round-1 measurement setup. */
export const ajv = new Ajv2020({ allErrors: false, strict: false });

/** JSON Schema for one narrow discriminator guard: `d{i} === 'on'`. */
export const guardSchema = (i) => ({
  type: 'object',
  properties: { [`d${i}`]: { const: 'on' } },
  required: [`d${i}`],
});

/**
 * Compile `count` narrow guards eagerly.
 * @returns {{predicates: Function[], ms: number}} compile wall time included
 */
export function compileGuards(count) {
  const t0 = process.hrtime.bigint();
  const predicates = new Array(count);
  for (let i = 0; i < count; i++) predicates[i] = ajv.compile(guardSchema(i));
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { predicates, ms };
}

/**
 * S1 shape: a flat object of `n` string leaves named `f0..f{n-1}`, loaded
 * with `v{i}` values.
 */
export function buildFlat(n, seed = true) {
  const root = object('');
  const value = {};
  for (let i = 0; i < n; i++) {
    attach(root, leaf(`f${i}`));
    if (seed) value[`f${i}`] = `v${i}`;
  }
  prime(root, value);
  return root;
}

/** Item host of the S2 shape: `{f0..f{fields-1}}`. */
function itemHost(fields) {
  return (i) => {
    const item = object(i);
    for (let f = 0; f < fields; f++) attach(item, leaf(`f${f}`));
    return item;
  };
}

/** S2 shape: `{ items: [ {f0..f4} x n ] }`. */
export function buildItems(n, fields = 5) {
  const root = object('');
  const items = array('items', itemHost(fields));
  attach(root, items);
  prime(root, itemsValue(n, fields, 'v'));
  return root;
}

/**
 * S3 shape: the S1 flat object plus `fragCount` root-hosted fragments. Each
 * fragment guards on its own unconditional discriminator `d{i}` (loaded
 * 'off') and declares three fields `c{i}_0..2` with defaults.
 */
export function buildConditional(n, fragCount, predicates) {
  const root = object('');
  const value = {};
  for (let i = 0; i < n; i++) {
    attach(root, leaf(`f${i}`));
    value[`f${i}`] = `v${i}`;
  }
  for (let i = 0; i < fragCount; i++) {
    attach(root, leaf(`d${i}`));
    value[`d${i}`] = 'off';
  }
  const fragments = new Array(fragCount);
  for (let i = 0; i < fragCount; i++) {
    const declares = [`c${i}_0`, `c${i}_1`, `c${i}_2`];
    for (let j = 0; j < declares.length; j++) attach(root, leaf(declares[j], `d${i}_${j}`));
    fragments[i] = { guard: predicates[i], declares };
  }
  declareFragments(root, fragments);
  prime(root, value);
  return root;
}

/** Plain JSON value for the S1 shape, used as a whole-root bulk write. */
export function flatValue(n, salt) {
  const out = {};
  for (let i = 0; i < n; i++) out[`f${i}`] = `b${salt}_${i}`;
  return out;
}

/** Plain JSON value for the S2 shape, used as a whole-root bulk write. */
export function itemsValue(n, fields, salt) {
  const items = new Array(n);
  for (let i = 0; i < n; i++) {
    const item = {};
    for (let f = 0; f < fields; f++) item[`f${f}`] = `b${salt}_${i}_${f}`;
    items[i] = item;
  }
  return { items };
}
