import type { gateSelectionCases } from '../gateSelectionCases';
import { createLoadUnionSchema } from './createLoadUnionSchema';

/** Load lifetimes include both mounting and replacement of an already-live tree. */
export const gateTableLoadingCases: (typeof gateSelectionCases)[number][] = [
  {
    name: 'load discriminator matching no branch',
    schema: createLoadUnionSchema(),
    input: { kind: 'missing' },
    writes: [],
  },
  {
    name: 'load wrong-kind root input',
    schema: createLoadUnionSchema(),
    input: 'wrong-kind',
    writes: [],
  },
  {
    name: 'load inactive defaults without input',
    schema: createLoadUnionSchema(),
    input: undefined,
    writes: [],
  },
  {
    name: 'load explicit inactive payload remains latent',
    schema: createLoadUnionSchema(),
    input: { kind: 'a', pa: 11, pb: 22 },
    writes: [],
  },
  {
    name: 'load root bulk input preserves initial deliveries',
    schema: createLoadUnionSchema(),
    input: { common: 'caller', kind: 'b', pa: 11, pb: 22 },
    writes: [],
  },
  {
    name: 'load initial output and default propagation',
    schema: createLoadUnionSchema(),
    input: { kind: 'a' },
    writes: [],
  },
  {
    name: 'load nested host first settlement',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'object', properties: { h: createLoadUnionSchema() } },
      },
    },
    input: { a: { h: { kind: 'b' } } },
    writes: [],
  },
  {
    name: 'load union host under another union host',
    schema: {
      type: 'object',
      properties: { outer: { type: 'string' } },
      oneOf: [
        {
          controls: { active: "./outer === 'a'" },
          properties: { inner: createLoadUnionSchema() },
        },
        {
          controls: { active: "./outer === 'b'" },
          properties: { other: { type: 'string' } },
        },
      ],
    },
    input: { outer: 'a', inner: { kind: 'b' } },
    writes: [],
  },
  {
    name: 'load tuple-position host',
    schema: { type: 'array', prefixItems: [createLoadUnionSchema()] },
    input: [{ kind: 'a', pa: 11, pb: 22 }],
    writes: [],
  },
  {
    name: 'load independent array-item hosts',
    schema: { type: 'array', items: createLoadUnionSchema() },
    input: [{ kind: 'a' }, { kind: 'b' }],
    writes: [],
  },
  {
    name: 'load mixed table and ancestor-reading gates',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'number', default: 1 },
        host: {
          type: 'object',
          properties: { kind: { type: 'string', default: 'a' } },
          anyOf: [
            {
              controls: { active: "./kind === 'a'" },
              properties: { pa: { type: 'number', default: 1 } },
            },
            {
              controls: { active: '../flag === 1' },
              properties: { pb: { type: 'number', default: 2 } },
            },
          ],
        },
      },
    },
    input: { host: { kind: 'a' } },
    writes: [],
  },
  {
    name: 'load form reset preserves inactive explicit input',
    schema: createLoadUnionSchema(),
    input: { kind: 'a', pa: 1 },
    writes: [{ value: { kind: 'b', pa: 1, pb: 2 }, reset: 'form' }],
  },
  {
    name: 'load discriminator subtree reset retains its mount source',
    schema: createLoadUnionSchema(),
    input: { kind: 'a', pa: 1 },
    writes: [
      { path: '/kind', value: 'b' },
      { path: '/kind', value: undefined, reset: 'subtree' },
    ],
  },
  {
    name: 'load reset default changes discriminator during transition',
    schema: createLoadUnionSchema('b'),
    input: { kind: 'a', pa: 1 },
    writes: [{ value: { pa: 1, pb: 2 }, reset: 'form' }],
  },
];
