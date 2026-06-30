import { bench, describe } from 'vitest';

import { clone } from '@winglet/common-utils/object';

import { ValidationMode, nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

/**
 * Initial render-delay regression guard.
 *
 * Purpose: detect render-delay regressions BETWEEN VERSIONS, not to freeze a
 * single measurement. Run on the baseline version, then on the new version, and
 * diff the two:
 *
 *   git checkout <recent-version> && yarn bench:baseline   # snapshot the baseline
 *   git checkout <new-version>    && yarn bench:compare     # diff against baseline
 *
 * "Render delay" here is the node-tree mount — the dominant cost of the first
 * paint (React reconciliation is over-render-free; the bottleneck is building
 * the node tree). It is measured WITHOUT JSDOM so the number is React-mount
 * independent, matching `nodeFromJsonSchema.bench.ts`.
 *
 * Two layers are tracked so a regression points at its cause:
 *   [mount] full node-tree construction (the headline render delay)
 *           - validation off: pure tree build
 *           - validation on : default mode, so the per-mount validator guards
 *             (stripSchemaExtensions → clone(schema)) are on the hot path
 *   [guard] the isolated cost of the per-mount safety clones, so their share of
 *           the mount can be read directly and watched across versions
 *
 * Sizes span the realistic range (5 → 150 terminals) so a regression that only
 * shows up on large schemas is still caught.
 */

const VALIDATION_MODE = ValidationMode.OnChange | ValidationMode.OnRequest;
const noop = () => {};

// --- small: 5 flat terminals -------------------------------------------------
const smallSchema: JsonSchema = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'A' },
    b: { type: 'number', default: 1 },
    c: { type: 'boolean', default: true },
    d: { type: 'string', default: 'D' },
    e: { type: 'number', default: 2 },
  },
};
const smallDefault = { a: 'A', b: 1, c: true, d: 'D', e: 2 };

// --- medium: nested, 25 terminals across 5 sub-objects -----------------------
const buildMediumSchema = (): { schema: JsonSchema; value: object } => {
  const properties: Record<string, JsonSchema> = {};
  const value: Record<string, any> = {};
  for (let g = 0; g < 5; g++) {
    const group: Record<string, JsonSchema> = {};
    const groupValue: Record<string, any> = {};
    for (let f = 0; f < 5; f++) {
      group[`field${f}`] = { type: 'string', default: `g${g}f${f}` };
      groupValue[`field${f}`] = `g${g}f${f}`;
    }
    properties[`group${g}`] = { type: 'object', properties: group };
    value[`group${g}`] = groupValue;
  }
  return { schema: { type: 'object', properties }, value };
};

// --- large: 150 terminals, mixed types, 2 levels deep ------------------------
const buildLargeSchema = (): { schema: JsonSchema; value: object } => {
  const properties: Record<string, JsonSchema> = {};
  const value: Record<string, any> = {};
  for (let s = 0; s < 15; s++) {
    const section: Record<string, JsonSchema> = {};
    const sectionValue: Record<string, any> = {};
    for (let f = 0; f < 10; f++) {
      const t = f % 3;
      if (t === 0) {
        section[`field${f}`] = {
          type: 'string',
          default: `s${s}f${f}`,
          minLength: 1,
        };
        sectionValue[`field${f}`] = `s${s}f${f}`;
      } else if (t === 1) {
        section[`field${f}`] = { type: 'number', default: f, minimum: 0 };
        sectionValue[`field${f}`] = f;
      } else {
        section[`field${f}`] = { type: 'boolean', default: f % 2 === 0 };
        sectionValue[`field${f}`] = f % 2 === 0;
      }
    }
    properties[`section${s}`] = { type: 'object', properties: section };
    value[`section${s}`] = sectionValue;
  }
  return { schema: { type: 'object', properties }, value };
};

const medium = buildMediumSchema();
const large = buildLargeSchema();

const cases = [
  { name: 'small (5 terminals)', schema: smallSchema, value: smallDefault },
  { name: 'medium (25 terminals)', schema: medium.schema, value: medium.value },
  { name: 'large (150 terminals)', schema: large.schema, value: large.value },
] as const;

for (const { name, schema, value } of cases) {
  describe(`render-delay: ${name}`, () => {
    // Headline render delay — node-tree mount with validation off.
    bench('[mount] nodeFromJsonSchema (validation off)', () => {
      nodeFromJsonSchema({ jsonSchema: schema, onChange: noop });
    });

    // Realistic render delay — default validationMode puts the per-mount
    // validator guards (stripSchemaExtensions clone) on the hot path.
    bench('[mount] nodeFromJsonSchema (validation on)', () => {
      nodeFromJsonSchema({
        jsonSchema: schema,
        onChange: noop,
        validationMode: VALIDATION_MODE,
      });
    });

    // Safety-clone cost #1: stripSchemaExtensions deep-clones the root schema
    // once per mount (root ValidationManager) to isolate the validator's strip.
    bench('[guard] clone(schema)', () => {
      clone(schema);
    });

    // Safety-clone cost #2: Form deep-clones the caller's defaultValue once per
    // mount so schema defaults never leak back into the caller's object.
    bench('[guard] clone(defaultValue)', () => {
      clone(value);
    });
  });
}
