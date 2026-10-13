import type { FormScenario } from '../../types';

/** Three nested oneOf hosts, each gated by its own sibling selector. */
const tierSchema = {
  type: 'object', properties: { tier: { type: 'string' } },
  oneOf: [
    { controls: { active: './tier === "basic"' }, properties: { note: { type: 'string' } } },
    { controls: { active: './tier === "pro"' }, properties: { plan: {
      type: 'object', properties: { mode: { type: 'string' } },
      oneOf: [
        { controls: { active: './mode === "solo"' }, properties: { seat: { type: 'string', default: '1' } } },
        { controls: { active: './mode === "team"' }, properties: { team: {
          type: 'object', properties: { size: { type: 'string' } },
          oneOf: [
            { controls: { active: './size === "small"' }, properties: { lead: { type: 'string' } } },
            { controls: { active: './size === "large"' }, properties: { manager: { type: 'string' }, budget: { type: 'string', default: '100' } } },
          ],
        } } },
      ],
    } } },
  ],
};

/** Inner switches leave outer branches alone; outer round trips restore every inner raw value. */
export const nestedThreeLevelsScenario: FormScenario = {
  name: 'composition.nested-oneof-three-levels',
  description: 'FRAGMENT-021 nesting is recursive; LANDING-018 deactivation removes output only; LANDING-032 raw values survive outer and inner round trips; LANDING-011 defaults are not refilled.',
  schema: tierSchema,
  initialValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'small' } } },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/note': 'absent', '/plan': 'present', '/plan/seat': 'absent', '/plan/team': 'present', '/plan/team/lead': 'present', '/plan/team/manager': 'absent' },
      outputValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'small' } } },
    } },
    { action: 'setValue', path: '/plan/team/lead', value: 'Kim', expect: { values: { '/plan/team/lead': 'Kim' } } },
    { action: 'setValue', path: '/plan/team/size', value: 'large', expect: {
      shape: { '/plan/team/lead': 'absent', '/plan/team/manager': 'present', '/plan/team/budget': 'present' },
      values: { '/plan/mode': 'team', '/tier': 'pro' },
      outputValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'large', budget: '100' } } },
    } },
    { action: 'setValue', path: '/plan/team/budget', value: '250', expect: {
      outputValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'large', budget: '250' } } },
    } },
    { action: 'setValue', path: '/plan/mode', value: 'solo', expect: {
      shape: { '/plan/team': 'absent', '/plan/seat': 'present' },
      outputValue: { tier: 'pro', plan: { mode: 'solo', seat: '1' } },
    } },
    { action: 'setValue', path: '/plan/mode', value: 'team', expect: {
      shape: { '/plan/seat': 'absent', '/plan/team/manager': 'present', '/plan/team/lead': 'absent' },
      values: { '/plan/team/size': 'large', '/plan/team/budget': '250' },
      outputValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'large', budget: '250' } } },
    } },
    { action: 'setValue', path: '/plan/team/size', value: 'small', expect: {
      shape: { '/plan/team/lead': 'present', '/plan/team/manager': 'absent' },
      values: { '/plan/team/lead': 'Kim' },
      outputValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'small', lead: 'Kim' } } },
    } },
    { action: 'setValue', path: '/tier', value: 'basic', expect: {
      shape: { '/plan': 'absent', '/note': 'present' }, outputValue: { tier: 'basic' },
    } },
    { action: 'setValue', path: '/tier', value: 'pro', expect: {
      shape: { '/note': 'absent', '/plan/team/lead': 'present' },
      values: { '/plan/mode': 'team', '/plan/team/size': 'small', '/plan/team/lead': 'Kim' },
      outputValue: { tier: 'pro', plan: { mode: 'team', team: { size: 'small', lead: 'Kim' } } },
    } },
  ],
};
