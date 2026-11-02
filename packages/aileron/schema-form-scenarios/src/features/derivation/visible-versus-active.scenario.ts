import type { FormScenario } from '../../types';

/** One toggle drives a hidden note and an inactive note side by side. */
const noteSchema = {
  type: 'object',
  properties: {
    open: { type: 'boolean' },
    hiddenNote: { type: 'string', controls: { visible: '../open' } },
    inactiveNote: { type: 'string', controls: { active: '../open' } },
  },
};

/** visible only hides a field, while active removes the node and its output and restores the raw value on return. */
export const visibleVersusActiveScenario: FormScenario = {
  name: 'derivation.visible-versus-active',
  description: 'CONTROLS-022 visible false only hides and the output keeps the value; CONTROLS-021 active false removes the node and its output, keeps the raw value, and recreates the node with it when active returns (LANDING-011).',
  schema: noteSchema,
  initialValue: { open: true, hiddenNote: 'kept', inactiveNote: 'parked' },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/hiddenNote': 'present', '/inactiveNote': 'present' },
      states: { '/hiddenNote': { isVisible: true }, '/inactiveNote': { isVisible: true } },
      outputValue: { open: true, hiddenNote: 'kept', inactiveNote: 'parked' },
    } },
    { action: 'setValue', path: '/open', value: false, expect: {
      shape: { '/inactiveNote': 'absent' }, states: { '/hiddenNote': { isVisible: false } },
      values: { '/hiddenNote': 'kept' }, outputValue: { open: false, hiddenNote: 'kept' },
    } },
    { action: 'setValue', path: '/hiddenNote', value: 'edited while hidden', expect: {
      outputValue: { open: false, hiddenNote: 'edited while hidden' },
    } },
    { action: 'setValue', path: '/open', value: true, expect: {
      shape: { '/inactiveNote': 'present' }, states: { '/hiddenNote': { isVisible: true } },
      values: { '/inactiveNote': 'parked' }, outputValue: { open: true, hiddenNote: 'edited while hidden', inactiveNote: 'parked' },
    } },
  ],
};
