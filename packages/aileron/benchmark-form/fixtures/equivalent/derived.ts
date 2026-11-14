import type { EquivalentFixture } from './types';

export const derivedFixture: EquivalentFixture = {
  name: 'computed-visible-derived',
  legacy: {
    type: 'object',
    properties: {
      trigger: { type: 'string', default: 'on' },
      source: { type: 'number', default: 1 },
      target: { type: 'number', computed: { derived: '../source * 2' } },
      detail: { type: 'string', computed: { visible: '../trigger === "on"' } },
    },
  },
  workspace: {
    type: 'object',
    properties: {
      trigger: { type: 'string', default: 'on' },
      source: { type: 'number', default: 1 },
      target: { type: 'number', controls: { derived: '../source * 2' } },
      detail: { type: 'string', controls: { visible: '../trigger === "on"' } },
    },
  },
  interactions: [
    { kind: 'set', path: '/source', value: 3 },
    { kind: 'set', path: '/trigger', value: 'off' },
    { kind: 'set', path: '/trigger', value: 'on' },
  ],
};
