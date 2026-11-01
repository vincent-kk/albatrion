import type { BlueprintSchema } from '../../../blueprint';
import type { gateSelectionCases } from './gateSelectionCases';

/** Gate-form-one-key histories S1–S6; root and nested oneOf use identical write sequences. */
export const gateWheelCases: (typeof gateSelectionCases)[number][] = [
  ...[100, 1000].map((count) => ({
    name: `S1 shared key, K=${count}`,
    schema: {
      type: 'object',
      properties: {
        sw: { type: 'number' },
        ...Object.fromEntries(
          Array.from({ length: count }, (_, index) => [
            `p${index}`,
            { type: 'number', controls: { active: '../sw >= 0' } },
          ]),
        ),
      },
    } as BlueprintSchema,
    input: { sw: 1 },
    writes: [{ path: '/sw', value: 2 }],
  })),
  ...[5, 20, 80].flatMap((count) =>
    [false, true].map((nested) => {
      const host: BlueprintSchema = {
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
            [`payload_${index}_c`]: {
              type: 'boolean',
              default: index % 2 === 0,
            },
          },
        })),
      };
      return {
        name: `S2 oneOf-${count}, nested=${nested}`,
        schema: nested
          ? ({ type: 'object', properties: { obj: host } } as BlueprintSchema)
          : host,
        input: nested ? { obj: { kind: 'kind_0' } } : { kind: 'kind_0' },
        writes: [
          { path: `${nested ? '/obj' : ''}/kind`, value: `kind_${count - 1}` },
          { path: `${nested ? '/obj' : ''}/kind`, value: 'kind_0' },
        ],
      };
    }),
  ),
  {
    name: 'S3 late latent key enables the earlier gate',
    schema: {
      type: 'object',
      properties: { mode: { type: 'string' } },
      allOf: [
        {
          controls: { active: './extra === "on"' },
          properties: { p: { type: 'string', default: 'P' } },
        },
        {
          controls: { active: './mode === "x"' },
          properties: { extra: { type: 'string' } },
        },
      ],
    },
    input: { mode: 'x', extra: 'on' },
    writes: [
      { path: '/extra', value: 'on' },
      { path: '/mode', value: 'y' },
      { path: '/mode', value: 'x' },
    ],
  },
  {
    name: 'S3 fixed-start positive-cycle control',
    schema: {
      type: 'object',
      properties: { mode: { type: 'string' } },
      allOf: [
        {
          controls: { active: './bkey === true || ./mode === "x"' },
          properties: { akey: { type: 'boolean', default: true } },
        },
        {
          controls: { active: './akey === true' },
          properties: { bkey: { type: 'boolean', default: true } },
        },
      ],
    },
    input: { mode: 'x' },
    writes: [{ path: '/mode', value: 'y' }],
  },
  {
    name: 'S4 two distinct dependencies on one host',
    schema: {
      type: 'object',
      properties: { k1: { type: 'string' }, k2: { type: 'string' } },
      allOf: [
        {
          controls: { active: './k1 === "on"' },
          properties: { p: { type: 'string' } },
        },
        {
          controls: { active: './k2 === "on"' },
          properties: { q: { type: 'string' } },
        },
      ],
    },
    input: { k1: 'off', k2: 'on' },
    writes: [{ path: '/k1', value: 'on' }],
  },
  {
    name: 'S5 nested dependency',
    schema: {
      type: 'object',
      properties: {
        cfg: { type: 'object', properties: { mode: { type: 'string' } } },
      },
      allOf: [
        {
          controls: { active: './cfg/mode === "x"' },
          properties: { p: { type: 'string' } },
        },
      ],
    },
    input: { cfg: { mode: 'y' } },
    writes: [{ path: '/cfg/mode', value: 'x' }],
  },
  {
    name: 'S5 overlay changes projection without changing raw',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        cfg: { type: 'string', options: { omitEmpty: false } },
      },
      allOf: [
        {
          controls: { active: './cfg === ""' },
          properties: { p: { type: 'string', default: 'P' } },
        },
        {
          controls: { active: './flag === true' },
          properties: {
            cfg: { options: { omitEmpty: true } },
          },
        },
      ],
    },
    input: { flag: false, cfg: '' },
    writes: [
      { path: '/flag', value: true },
      { path: '/flag', value: false },
    ],
  },
  {
    name: 'S6 unrelated key has no host wheel',
    schema: {
      type: 'object',
      properties: { common: { type: 'string' }, kind: { type: 'string' } },
      oneOf: [
        {
          controls: { active: './kind === "a"' },
          properties: { p: { type: 'string' } },
        },
      ],
    },
    input: { common: 'old', kind: 'a' },
    writes: [{ path: '/common', value: 'new' }],
  },
  {
    name: 'S6 validator if gate keeps its confirmation',
    schema: {
      type: 'object',
      properties: { kind: { type: 'string' } },
      if: { properties: { kind: { const: 'x' } }, required: ['kind'] },
      then: { properties: { p: { type: 'string' } } },
    },
    input: { kind: 'y', p: 'P' },
    writes: [{ path: '/kind', value: 'x' }],
  },
];
