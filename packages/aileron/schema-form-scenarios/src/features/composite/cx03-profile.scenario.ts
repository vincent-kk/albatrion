import type { CompositeCase } from './types';

/** Profile: a nullable address whose country gates a postcode or a zip. */
const profileSchema = {
  type: 'object',
  properties: {
    address: {
      type: ['object', 'null'],
      properties: { country: { type: 'string', enum: ['KR', 'US'] }, street: { type: 'string', default: 'main' } },
      if: { properties: { country: { const: 'KR' } }, required: ['country'] },
      then: { properties: { postcode: { type: 'string', minLength: 5 } }, required: ['postcode'] },
      else: { properties: { zip: { type: 'string' } } },
    },
  },
};

/** CX-03: a null address is promoted by a child write, its branch keeps raw values, and errors layer and hide. */
export const cx03Profile: CompositeCase = {
  scenario: {
    name: 'composite.cx03-profile',
    description: 'C3 profile (G3, G5). VALUE-015 a null address keeps its children in the shape while the output stays null; a write of an object promotes it without filling sibling defaults; the country guard switches postcode and zip and keeps the postcode raw value (LANDING-018). The tail layers an external error before validator issues (VALIDATE-043), hides untouched messages under the Edited policy, and clears the subtree errors when the address returns to null.',
    schema: profileSchema,
    initialValue: { address: null },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/address/country': 'present' }, outputValue: { address: null } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/address', value: { country: 'KR' } }], expect: {
        shape: { '/address/country': 'present', '/address/postcode': 'present', '/address/zip': 'absent' },
        outputValue: { address: { country: 'KR' } },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/address/postcode', value: '12345' }], expect: { values: { '/address/postcode': '12345' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/address/country', value: 'US' }], expect: {
        shape: { '/address/postcode': 'absent', '/address/zip': 'present' }, outputValue: { address: { country: 'US' } },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/address/country', value: 'KR' }], expect: {
        shape: { '/address/postcode': 'present' }, values: { '/address/postcode': '12345' },
        outputValue: { address: { country: 'KR', postcode: '12345' } },
      } },
    ],
  },
  tailStart: { address: { country: 'KR', postcode: '12345' } },
  tail: [
    { act: 'props', stage: { errors: [{ dataPath: '/address/postcode', keyword: 'server', message: 'postcode is taken' }] } },
    { act: 'write', path: '/address/postcode', value: '1' },
    { act: 'errors', errors: { '/address/postcode': ['server', 'minLength'] } },
    { act: 'props', stage: { showError: 'Edited' } },
    { act: 'shown', shown: { '/address/postcode': false } },
    { act: 'write', path: '/address', value: null },
    { act: 'errors', errors: { '/address/postcode': [] } },
  ],
};
