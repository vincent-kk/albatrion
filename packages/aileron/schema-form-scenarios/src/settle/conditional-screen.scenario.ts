import type { FormScenario } from '../types';

/** LANDING-010 merges allOf conditions; LANDING-018 keeps inactive raw values. */
export const conditionalScreenScenarios = [
  {
    name: 'LANDING-010 if-then-adult-roundtrip',
    schema: { type: 'object', properties: { adult: { type: 'boolean' } }, allOf: [
      { if: { properties: { adult: { const: true } }, required: ['adult'] }, then: { properties: { job: { type: ['string', 'null'] } }, required: ['job'] } },
    ] },
    initialValue: { adult: true, job: null },
    steps: [
      { action: 'setValue', path: '/job', value: 'writer', expect: { outputValue: { adult: true, job: 'writer' }, errors: { '/job': [] } } },
      { action: 'setValue', path: '/adult', value: false, expect: { outputValue: { adult: false }, shape: { '/job': 'absent' } } },
      { action: 'setValue', path: '/adult', value: true, expect: { outputValue: { adult: true, job: 'writer' }, shape: { '/job': 'present' } } },
    ],
  },
  {
    name: 'LANDING-010 if-then-rapid-toggle',
    schema: { type: 'object', properties: { adult: { type: 'boolean' } }, allOf: [
      { if: { properties: { adult: { const: true } }, required: ['adult'] }, then: { properties: { job: { type: ['string', 'null'] } } } },
    ] },
    initialValue: { adult: true, job: null },
    steps: [{ action: 'batch', steps: [
      { action: 'setValue', path: '/adult', value: false },
      { action: 'setValue', path: '/adult', value: true },
      { action: 'setValue', path: '/adult', value: false },
      { action: 'setValue', path: '/adult', value: true },
    ], expect: { outputValue: { adult: true, job: null }, shape: { '/job': 'present' } } }],
  },
] satisfies readonly FormScenario[];
