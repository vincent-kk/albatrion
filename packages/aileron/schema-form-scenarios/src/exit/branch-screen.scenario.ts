import type { FormScenario } from '../types';

/** LANDING-032 keeps branch raw values; LANDING-148 hides inactive variants. */
export const branchExitScenario = {
  name: 'LANDING-032 branch roundtrip preserves user input and excludes inactive output',
  schema: { type: 'object', properties: { kind: { type: 'string' } }, oneOf: [
    { controls: { active: "./kind === 'a'" }, properties: { a: { type: 'string', default: 'seed-a' } } },
    { controls: { active: "./kind === 'b'" }, properties: { b: { type: 'string', default: 'seed-b' } } },
  ] },
  initialValue: { kind: 'a' },
  steps: [
    { action: 'setValue', path: '/a', value: 'edited', expect: { outputValue: { kind: 'a', a: 'edited' } } },
    { action: 'setValue', path: '/kind', value: 'b', expect: { outputValue: { kind: 'b', b: 'seed-b' }, shape: { '/a': 'absent', '/b': 'present' } } },
    { action: 'setValue', path: '/kind', value: 'a', expect: { outputValue: { kind: 'a', a: 'edited' }, shape: { '/a': 'present', '/b': 'absent' } } },
  ],
} satisfies FormScenario;
