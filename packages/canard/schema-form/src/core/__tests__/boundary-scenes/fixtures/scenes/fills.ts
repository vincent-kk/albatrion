import type { BoundaryScene } from '../types';

/** Fills: a default chosen by a gate whose input the same settlement fills or changes. */
export const fillScenes: readonly BoundaryScene[] = [
  {
    id: 'fills/default-chosen-by-a-filled-default',
    origin:
      'acceptance line "fill": f takes its default from a fragment that a later-filled g selects',
    schema: {
      type: 'object',
      properties: {
        sw: { type: 'boolean' },
        f: { type: 'string' },
        g: {
          type: 'string',
          default: 'on',
          controls: { active: '../sw === true' },
        },
      },
      allOf: [
        {
          controls: { active: './g === undefined' },
          properties: { f: { default: 'A' } },
        },
        {
          controls: { active: './g === "on"' },
          properties: { f: { default: 'B' } },
        },
      ],
    },
    load: { sw: true },
    steps: [],
    probes: ['value /f', 'value /g'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /f': 'B', 'value /g': 'on' },
    defect:
      'f takes the default chosen before g is filled and is not decided again after the fill',
    known: {
      sequential: { 'value /f': 'A', 'value /g': 'on' },
      fresh: { 'value /f': 'A', 'value /g': 'on' },
    },
  },
  {
    id: 'fills/chain-of-gated-defaults',
    origin:
      'settlement evaluation E13: three defaults, each chosen by the one before it',
    schema: {
      type: 'object',
      properties: {
        g: { type: 'string' },
        f: { type: 'string' },
        o: {
          type: 'object',
          properties: { h: { type: 'string', default: 'x' } },
        },
      },
      allOf: [
        {
          controls: { active: './o/h === undefined' },
          properties: { g: { default: 'g1' } },
        },
        {
          controls: { active: "./o/h === 'x'" },
          properties: { g: { default: 'g2' } },
        },
        {
          controls: { active: './g === undefined' },
          properties: { f: { default: 'F0' } },
        },
        {
          controls: { active: "./g === 'g1'" },
          properties: { f: { default: 'F1' } },
        },
        {
          controls: { active: "./g === 'g2'" },
          properties: { f: { default: 'F2' } },
        },
      ],
    },
    load: {},
    steps: [],
    probes: ['value /o/h', 'value /g', 'value /f'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /o/h': 'x', 'value /g': 'g2', 'value /f': 'F2' },
    defect:
      'each default is chosen before the fill it depends on, so the chain keeps its first choices',
    known: {
      sequential: { 'value /o/h': 'x', 'value /g': 'g1', 'value /f': 'F0' },
      fresh: { 'value /o/h': 'x', 'value /g': 'g1', 'value /f': 'F0' },
    },
  },
  {
    id: 'fills/default-chosen-by-its-own-value',
    origin:
      'critique C2 (also r8-port N9): the stable selection gives a default that turns itself off',
    schema: {
      type: 'object',
      properties: {
        g: { type: 'string', default: 'on' },
        f: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './g === undefined' },
          properties: { f: { default: 'TRANSIENT' } },
        },
        {
          controls: { active: "./g === 'on' && ./f !== 'B'" },
          properties: { f: { default: 'B' } },
        },
        {
          controls: { active: "./g === 'on' && ./f === 'B'" },
          properties: { f: { default: 'C' } },
        },
      ],
    },
    load: {},
    steps: [],
    probes: ['value /f', 'thrown', 'status'],
    modes: ['sequential'],
    state: 'open',
    reason:
      'design N7 has no fixed point for a default that deselects itself; whether it is a budget error is undecided',
    pinned: {
      sequential: { 'value /f': 'TRANSIENT', thrown: [], status: 'stable' },
    },
  },
];
