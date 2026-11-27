import type { CompositeCase } from './types';

/** Setup wizard: anyOf channels that may hold together, and a host-port tuple with open extra items. */
const wizardSchema = {
  type: 'object',
  properties: {
    email: { type: 'boolean' }, sms: { type: 'boolean' }, push: { type: 'boolean' },
    endpoint: { type: 'array', prefixItems: [{ type: 'string' }, { type: 'integer' }], items: { type: 'string' } },
  },
  anyOf: [
    { if: { properties: { email: { const: true } }, required: ['email'] }, then: { properties: { address: { type: 'string' }, sender: { type: 'string', default: 'noreply' } } } },
    { if: { properties: { sms: { const: true } }, required: ['sms'] }, then: { properties: { phone: { type: 'string' }, sender: { type: 'string', default: 'noreply' } } } },
    { if: { properties: { push: { const: true } }, required: ['push'] }, then: { properties: { token: { type: 'string' } } } },
  ],
};

/** CX-07: several anyOf channels share a field, a tuple grows past its prefix, and reset returns to the load. */
export const cx07SetupWizard: CompositeCase = {
  scenario: {
    name: 'composite.cx07-setup-wizard',
    description: 'C7 setup wizard (G3, G2, G7). FRAGMENT-009 each anyOf entry gates its own fields, and a field two entries declare stays while either is on; prefixItems keep the tuple head typed and extra items land in the open tail; WRITE-044 reset reloads the first value and branch.',
    schema: wizardSchema,
    initialValue: { email: true, push: true, endpoint: ['localhost', 8080] },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/address': 'present', '/token': 'present', '/phone': 'absent', '/sender': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/sender', value: 'ops' }], expect: { values: { '/sender': 'ops' } } },
      { action: 'push', path: '/endpoint', value: 'tls', expect: { values: { '/endpoint/2': 'tls', '/endpoint/1': 8080 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/sms', value: true }, { action: 'setValue', path: '/email', value: false }], expect: {
        shape: { '/address': 'absent', '/phone': 'present', '/sender': 'present' }, values: { '/sender': 'ops' },
      } },
      { action: 'reset', expect: {
        shape: { '/address': 'present', '/phone': 'absent' }, values: { '/endpoint': ['localhost', 8080], '/sms': undefined },
      } },
    ],
  },
};
