import type { CompositeCase } from './types';

/** A nullable contact object whose channel picks phone or email, with a default in each branch. */
const contactSchema = {
  type: 'object',
  properties: {
    contact: {
      type: ['object', 'null'], controls: { discriminator: 'channel' },
      properties: { label: { type: 'string', default: 'home' } },
      oneOf: [
        { properties: { channel: { const: 'phone' }, phone: { type: 'string' } } },
        { properties: { channel: { const: 'email' }, email: { type: 'string' } } },
      ],
    },
  },
};

/** CX-23: a null branch object promoted by a child write switches channel without filling siblings. */
export const cx23NullableBranchObject: CompositeCase = {
  scenario: {
    name: 'composite.cx23-nullable-branch-object',
    description: 'A null contact turns no channel branch on, so phone is absent while the output stays null (VALUE-015 keeps only fixed children); an object write promotes it without filling the sibling label default; a channel switch inside the promoted object swaps phone for email and keeps the phone raw value (LANDING-018); writing null drops every child again.',
    schema: contactSchema,
    initialValue: { contact: null },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/contact/phone': 'absent' }, outputValue: { contact: null } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/contact', value: { channel: 'phone', phone: '010' } }], expect: {
        shape: { '/contact/phone': 'present' }, outputValue: { contact: { channel: 'phone', phone: '010' } },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/contact/channel', value: 'email' }], expect: {
        shape: { '/contact/phone': 'absent', '/contact/email': 'present' }, outputValue: { contact: { channel: 'email' } },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/contact/channel', value: 'phone' }], expect: { values: { '/contact/phone': '010' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/contact', value: null }], expect: { shape: { '/contact/phone': 'absent' }, outputValue: { contact: null } } },
    ],
  },
};
