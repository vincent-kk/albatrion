import { afterEach, describe, expect, it, vi } from 'vitest';

// @ts-expect-error The original JavaScript corpus has no TypeScript declaration.
import { corpus } from '../../../../../architecture/spikes/guard-cost/redteam3/corpus.mjs';
import { blueprint } from '../../blueprint';
import type { BlueprintSchema } from '../../blueprint';
import type { DeriveRuleTable } from '../types/rules';
import { getDeriveRuleTable } from '../utils/rules/getDeriveRuleTable';

/** Switch between the shared owner rule and the three prefixes it replaced. */
const owners = vi.hoisted(() => ({
  legacy: false,
  /** Owner paths under the replaced `/properties/`, `/items/`, `/prefixItems/` test. */
  legacyPaths: (schemaPath: string): readonly string[] => {
    const found: string[] = [];
    for (const marker of ['/properties/', '/items/', '/prefixItems/'])
      for (
        let start = schemaPath.indexOf(marker);
        start !== -1;
        start = schemaPath.indexOf(marker, start + 1)
      )
        found.push(schemaPath.slice(0, start));
    return found;
  },
}));

vi.mock(
  '../../utils/controls/getFragmentOwnerPaths',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../../utils/controls/getFragmentOwnerPaths')
      >();
    return {
      getFragmentOwnerPaths: (schemaPath: string) =>
        owners.legacy
          ? owners.legacyPaths(schemaPath)
          : actual.getFragmentOwnerPaths(schemaPath),
    };
  },
);

/**
 * Serialize a rule table with compiled functions reduced to a marker.
 * @param table - Rule table of one fresh analysis
 * @returns Comparable rules and the rule positions listed per declaration
 */
const snapshot = (table: DeriveRuleTable) =>
  JSON.stringify(
    {
      rules: table.rules,
      byDeclaration: [...table.byDeclaration].map(([id, rules]) => [
        id,
        rules.map((rule) => table.rules.indexOf(rule)),
      ]),
    },
    (_key, value: unknown) =>
      typeof value === 'function' ? '[function]' : value,
  );

/**
 * Build the rule table of a fresh analysis under one owner rule.
 * @param schema - Authored root schema
 * @param legacy - Whether the replaced three-prefix rule decides ownership
 * @returns Serialized rule table
 */
const tableOf = (schema: BlueprintSchema, legacy: boolean) => {
  owners.legacy = legacy;
  return snapshot(getDeriveRuleTable(blueprint(schema)));
};

/** Fragment controls that produce one rule of every derive kind. */
const RULES = {
  derived: '../source',
  unsetValue: '../source === "x"',
  resetInteraction: '../source',
};

/** Edge schemas around the owner markers and nested fragments. */
const EDGE_SCHEMAS: readonly [string, BlueprintSchema][] = [
  [
    'properties named after array keywords',
    {
      type: 'object',
      properties: { source: { type: 'string' } },
      allOf: [
        {
          controls: RULES,
          properties: {
            items: { type: 'string' },
            additionalItems: { type: 'string' },
            prefixItems: { type: 'string' },
            properties: { type: 'string' },
          },
        },
      ],
    },
  ],
  [
    'nested fragments and branches',
    {
      type: 'object',
      properties: { source: { type: 'string' } },
      allOf: [
        {
          controls: RULES,
          properties: {
            inner: {
              type: 'object',
              properties: { a: { type: 'string' } },
              allOf: [
                {
                  controls: { derived: '../../source' },
                  properties: { b: { type: 'string' } },
                },
              ],
            },
          },
          allOf: [{ controls: RULES, properties: { c: { type: 'string' } } }],
        },
      ],
      oneOf: [
        { controls: RULES, properties: { d: { type: 'string' } } },
        { controls: RULES, properties: { e: { type: 'number' } } },
      ],
    },
  ],
  [
    'array fragments with items, additionalItems and prefixItems',
    {
      type: 'object',
      properties: {
        source: { type: 'string' },
        list: {
          type: 'array',
          items: { type: 'string' },
          allOf: [
            { controls: { derived: '../source' }, items: { type: 'string' } },
          ],
        },
        tail: {
          type: 'array',
          items: [{ type: 'string' }],
          additionalItems: { type: 'string' },
          allOf: [
            {
              controls: { unsetValue: '../source === "x"' },
              items: [{ type: 'string' }],
              additionalItems: { type: 'string' },
            },
          ],
        },
        tuple: {
          type: 'array',
          prefixItems: [{ type: 'string' }],
          allOf: [
            {
              controls: { resetInteraction: '../source' },
              prefixItems: [{ type: 'string' }],
            },
          ],
        },
      },
    },
  ],
];

/** Existing generator corpus samples, labelled by their own IDs. */
const CORPUS_SCHEMAS: readonly [string, BlueprintSchema][] = corpus.map(
  (sample: { id: string; root: BlueprintSchema }) => [sample.id, sample.root],
);

// filid:contract derive-fragment-owner-differential
describe('derive rule table under the shared owner rule', () => {
  afterEach(() => {
    owners.legacy = false;
  });

  it('keeps object edge-schema tables equal and includes every declared array target', () => {
    for (const [label, schema] of EDGE_SCHEMAS.slice(0, 2))
      expect(tableOf(schema, false), label).toBe(tableOf(schema, true));
    expect(
      JSON.parse(tableOf(EDGE_SCHEMAS[0][1], false)).rules.filter(
        (rule: { layer: string }) => rule.layer === 'fragment',
      ),
    ).toHaveLength(12);
    expect(
      JSON.parse(tableOf(EDGE_SCHEMAS[2][1], false)).rules.map(
        (rule: { kind: string; targetName?: string; targetItems?: boolean }) => [
          rule.kind,
          rule.targetName,
          rule.targetItems,
        ],
      ),
    ).toEqual([
      ['derived', undefined, true],
      ['unsetValue', '0', undefined],
      ['unsetValue', undefined, true],
      ['resetInteraction', '0', undefined],
    ]);
    expect(JSON.parse(tableOf(EDGE_SCHEMAS[2][1], true)).rules).toHaveLength(2);
  });

  it('keeps every corpus rule table element-wise equal', () => {
    expect(CORPUS_SCHEMAS).toHaveLength(14);
    for (const [label, schema] of CORPUS_SCHEMAS)
      expect(tableOf(schema, false), label).toBe(tableOf(schema, true));
  });
});
