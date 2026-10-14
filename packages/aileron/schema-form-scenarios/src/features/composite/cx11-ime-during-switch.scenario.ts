import type { CompositeCase } from './types';

/** A text field in branch a and a number in branch b, switched by kind. */
const imeSchema = {
  type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
  oneOf: [
    { properties: { kind: { const: 'a' }, text: { type: 'string' } } },
    { properties: { kind: { const: 'b' }, count: { type: 'number' } } },
  ],
};

/** Text composed in the story with CDP: the committed raw value before composition and the composing syllable. */
export const imeSwitchPlan = { committed: '한', composing: '가' } as const;

/** CX-11: a composition interrupted by a branch switch writes nothing to the closed branch. */
export const cx11ImeDuringSwitch: CompositeCase = {
  scenario: {
    name: 'composite.cx11-ime-during-switch',
    description: 'Browser composition is in the story only: while "가" is composing in branch a, a handle write switches to b and unmounts the input; the composition end writes nothing into the closed branch, and switching back restores the raw value the node held at the switch (LANDING-018, REACT-027). The shared steps check the branch round trip that the story builds on.',
    schema: imeSchema,
    initialValue: { kind: 'a', text: '한' },
    steps: [
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'b' }], expect: { shape: { '/text': 'absent', '/count': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'a' }], expect: { shape: { '/text': 'present' }, values: { '/text': '한' } } },
    ],
  },
};
