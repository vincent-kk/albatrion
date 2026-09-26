/**
 * Tree builders for the v3 measurement scenarios, plus the AJV guard factory.
 * Same shapes as build.mjs, built on loop-v3. `ajv` is resolved from the
 * monorepo's ajv8 plugin — nothing is installed.
 */
import { createRequire } from 'node:module';

import { array, attach, declareFragments, leaf, object, prime } from './loop-v3.mjs';

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
 * S1 shape: a flat object of `n` string leaves named `f0..f{n-1}`.
 * @param {number} n field count
 * @param {boolean} [seed] give every field a non-empty value
 */
export function buildFlat(n, seed = true) {
  const root = object('');
  for (let i = 0; i < n; i++) {
    const node = leaf(`f${i}`);
    if (seed) node.raw = `v${i}`;
    attach(root, node);
  }
  prime(root);
  return root;
}

/**
 * S2 shape: `{ items: [ {f0..f4} x n ] }`.
 * @param {number} n item count
 * @param {number} [fields] string fields per item
 */
export function buildItems(n, fields = 5) {
  const root = object('');
  const items = array('items');
  attach(root, items);
  for (let i = 0; i < n; i++) {
    const item = object(i);
    for (let f = 0; f < fields; f++) {
      const node = leaf(`f${f}`);
      node.raw = `v${i}_${f}`;
      attach(item, node);
    }
    attach(items, item);
  }
  prime(root);
  return root;
}

/**
 * S3 shape: the S1 flat object plus `fragCount` root-hosted fragments. Each
 * fragment guards on its own unconditional discriminator `d{i}` and declares
 * three fields `c{i}_0..2` with defaults.
 * @param {number} n base field count
 * @param {number} fragCount fragment count
 * @param {Function[]} predicates one compiled guard per fragment
 * @param {boolean} [withIndex] register the key each guard reads so flush
 *   with `{index: true}` can reuse the previous result
 */
export function buildConditional(n, fragCount, predicates, withIndex = false) {
  const root = object('');
  for (let i = 0; i < n; i++) {
    const node = leaf(`f${i}`);
    node.raw = `v${i}`;
    attach(root, node);
  }
  for (let i = 0; i < fragCount; i++) {
    const d = leaf(`d${i}`);
    d.raw = 'off';
    attach(root, d);
  }
  const fragments = new Array(fragCount);
  for (let i = 0; i < fragCount; i++) {
    const declares = [`c${i}_0`, `c${i}_1`, `c${i}_2`];
    for (let j = 0; j < declares.length; j++) {
      attach(root, leaf(declares[j], `d${i}_${j}`));
    }
    fragments[i] = {
      guard: predicates[i],
      declares,
      keys: withIndex ? [`d${i}`] : undefined,
    };
  }
  declareFragments(root, fragments);
  prime(root, { index: withIndex });
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
