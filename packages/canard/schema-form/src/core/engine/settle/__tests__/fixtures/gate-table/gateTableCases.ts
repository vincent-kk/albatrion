import type { BlueprintSchema } from '../../../../blueprint';
import type { gateSelectionCases } from '../gateSelectionCases';

/** Authored histories use the same structural contract as the existing gate corpus. */
type GateTableCase = (typeof gateSelectionCases)[number];

/**
 * Reproduce the measurement fixture's two baseline fields and three fields per branch.
 * @param count - Number of authored oneOf branches
 * @returns The benchmark schema without runtime or measurement instrumentation
 */
const oneOfSchema = (count: number): BlueprintSchema => ({
  type: 'object',
  properties: {
    common: { type: 'string', default: 'shared' },
    kind: { type: 'string', default: 'kind_0' },
  },
  oneOf: Array.from({ length: count }, (_, index) => ({
    controls: { active: `./kind === 'kind_${index}'` },
    properties: {
      [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
      [`payload_${index}_b`]: { type: 'number', default: index },
      [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
    },
  })),
});

/** PR-1-specific boundaries supplement both existing gate corpora. */
export const gateTableCases: GateTableCase[] = [
  ...[5, 80].map((count) => ({
    name: `root measurement oneOf-${count}, first write, unknown, same value and bulk payload`,
    schema: oneOfSchema(count),
    input: { kind: 'kind_0' },
    writes: [
      { path: '/kind', value: `kind_${count - 1}` },
      { path: '/kind', value: `kind_${count - 1}` },
      { path: '/kind', value: 'unknown' },
      {
        value: {
          kind: 'kind_1',
          payload_1_a: 'active payload',
          payload_0_a: 'inactive payload',
        },
      },
      { path: '/kind', value: 'kind_0' },
    ],
  })),
  {
    name: 'nested oneOf under /a',
    schema: { type: 'object', properties: { a: oneOfSchema(5) } },
    input: { a: { kind: 'kind_0' } },
    writes: [
      { path: '/a/kind', value: 'kind_4' },
      { path: '/a/kind', value: 'kind_0' },
    ],
  },
  {
    name: 'array-item oneOf with independent occurrences and replacement',
    schema: { type: 'array', items: oneOfSchema(5) },
    input: [{ kind: 'kind_0' }, { kind: 'kind_1' }],
    writes: [
      { path: '/0/kind', value: 'kind_4' },
      { value: [{ kind: 'kind_1' }, { kind: 'kind_0' }] },
    ],
  },
  {
    name: 'ancestor A table h and non-table g bulk switch with defaults',
    schema: {
      type: 'object',
      properties: {
        A: {
          type: 'object',
          properties: {
            h: oneOfSchema(5),
            g: {
              type: 'object',
              properties: { kind: { type: 'string' } },
              oneOf: ['a', 'b'].map((kind) => ({
                controls: { active: `['${kind}'].includes(./kind)` },
                properties: { [kind]: { type: 'string', default: kind } },
              })),
            },
          },
        },
      },
    },
    input: { A: { h: { kind: 'kind_0' }, g: { kind: 'a' } } },
    writes: [{ value: { A: { h: { kind: 'kind_4' }, g: { kind: 'b' } } } }],
  },
  {
    name: 'shared literal activates both branches beside a non-table gate',
    schema: {
      type: 'object',
      properties: { kind: { type: 'string' } },
      anyOf: [
        {
          controls: { active: "./kind === 'both'" },
          properties: { a: { type: 'string', default: 'A' } },
        },
        {
          controls: { active: "./kind === 'both' || ./kind === 'b'" },
          properties: { b: { type: 'string', default: 'B' } },
        },
        {
          controls: { active: "['both', 'c'].includes(./kind)" },
          properties: { c: { type: 'string', default: 'C' } },
        },
      ],
    },
    input: { kind: 'both' },
    writes: [
      { path: '/kind', value: 'b' },
      { path: '/kind', value: 'c' },
      { path: '/kind', value: 'both' },
    ],
  },
  {
    name: 'revival p inside one settlement after derived registration',
    schema: {
      type: 'object',
      properties: {
        src: { type: 'string', default: 'x' },
        kind: {
          type: 'string',
          controls: {
            derived: "../src === 'go' ? (../p === 'P' ? 'a' : 'b') : 'a'",
          },
        },
      },
      oneOf: [
        {
          controls: { active: "./kind === 'a'" },
          properties: { q: { type: 'string', default: 'Q' } },
        },
        {
          controls: { active: "./kind === 'b'" },
          properties: { p: { type: 'string', default: 'P' } },
        },
      ],
    },
    input: {},
    writes: [{ path: '/src', value: 'go' }],
  },
  {
    name: 'budget overflow restores source B and reports the final failure',
    schema: {
      type: 'object',
      properties: {
        kind: { type: 'boolean' },
        a: {
          type: 'boolean',
          controls: {
            derived: '!../kind',
            injectTo: (value: unknown) => ({ '/kind': value }),
          },
        },
      },
      anyOf: [
        {
          controls: { active: './kind === true' },
          properties: { yes: { type: 'string', default: 'Y' } },
        },
        {
          controls: { active: './kind === false' },
          properties: { no: { type: 'string', default: 'N' } },
        },
      ],
    },
    input: { kind: false },
    writes: [{ path: '/kind', value: true }],
  },
  {
    name: 'verified anchor with dormant h and derived g under /A',
    schema: {
      type: 'object',
      properties: {
        A: {
          type: 'object',
          properties: {
            h: {
              type: 'object',
              properties: { kind: { type: 'string', default: 'none' } },
              oneOf: [
                {
                  controls: { active: "./kind === 'a'" },
                  properties: { ha: { type: 'string', default: 'HA' } },
                },
                {
                  controls: { active: "./kind === 'b'" },
                  properties: { hb: { type: 'string', default: 'HB' } },
                },
              ],
            },
            g: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  controls: {
                    derived: "../../h/kind === 'b' ? 'y' : 'x'",
                  },
                },
              },
              oneOf: [
                {
                  controls: { active: "['x'].includes(./type)" },
                  properties: { gx: { type: 'string', default: 'GX' } },
                },
                {
                  controls: { active: "['y'].includes(./type)" },
                  properties: { gy: { type: 'string', default: 'GY' } },
                },
              ],
            },
          },
        },
      },
    },
    input: { A: { h: { kind: 'none' } } },
    writes: [{ path: '/A/h/kind', value: 'b' }],
  },
  {
    name: 'converging revival preserves pb identity and retained value',
    schema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          default: 'b',
          controls: { derived: '../kind === "a" ? "b" : undefined' },
        },
      },
      oneOf: [
        {
          controls: { active: "./kind === 'a'" },
          properties: { pa: { type: 'string', default: 'A' } },
        },
        {
          controls: { active: "./kind === 'b'" },
          properties: { pb: { type: 'string', default: 'B' } },
        },
      ],
    },
    input: {},
    writes: [
      { path: '/pb', value: 'kept' },
      { path: '/kind', value: 'a' },
    ],
  },
  {
    name: 'verified anchor (derived includes)',
    schema: {
      type: 'object',
      properties: {
        h: {
          type: 'object',
          properties: { kind: { type: 'string', default: 'none' } },
          oneOf: [
            {
              controls: { active: "./kind === 'a'" },
              properties: { ha: { type: 'string', default: 'HA' } },
            },
            {
              controls: { active: "./kind === 'b'" },
              properties: { hb: { type: 'string', default: 'HB' } },
            },
          ],
        },
        g: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              controls: { derived: "../../h/kind === 'b' ? 'y' : 'x'" },
            },
          },
          oneOf: [
            {
              controls: { active: "['x'].includes(./type)" },
              properties: { gx: { type: 'string', default: 'GX' } },
            },
            {
              controls: { active: "['y'].includes(./type)" },
              properties: { gy: { type: 'string', default: 'GY' } },
            },
          ],
        },
      },
    },
    input: { h: { kind: 'none' } },
    writes: [{ path: '/h/kind', value: 'b' }],
  },
];
