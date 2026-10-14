import type { FormScenario } from '../../types';

/** A oneOf plan whose paid branch hosts an anyOf of add-ons sharing one field. */
const planSchema = {
  type: 'object', properties: { plan: { type: 'string' } },
  oneOf: [
    { controls: { active: './plan === "free"' }, properties: { ads: { type: 'boolean', default: true } } },
    { controls: { active: './plan === "paid"' }, properties: { addons: {
      type: 'object', properties: { storage: { type: 'boolean' }, support: { type: 'boolean' } },
      anyOf: [
        { controls: { active: './storage' }, properties: { quota: { type: 'string', default: '10GB' }, region: { type: 'string' } } },
        { controls: { active: './support' }, properties: { channel: { type: 'string', default: 'email' }, region: { type: 'string' } } },
      ],
    } } },
  ],
};

/** The shared anyOf field lives while either add-on is on and returns after the outer branch round trip. */
export const oneOfAnyOfScenario: FormScenario = {
  name: 'composition.oneof-with-anyof-addons',
  description: 'LANDING-032 active anyOf fragments share one node for a field they both declare; LANDING-018 and LANDING-032 raw values survive the outer oneOf round trip; FRAGMENT-021 nesting is recursive.',
  schema: planSchema,
  initialValue: { plan: 'paid', addons: { storage: true, support: false } },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/ads': 'absent', '/addons/quota': 'present', '/addons/region': 'present', '/addons/channel': 'absent' },
      outputValue: { plan: 'paid', addons: { storage: true, support: false, quota: '10GB' } },
    } },
    { action: 'setValue', path: '/addons/region', value: 'kr', expect: {
      outputValue: { plan: 'paid', addons: { storage: true, support: false, quota: '10GB', region: 'kr' } },
    } },
    { action: 'setValue', path: '/addons/support', value: true, expect: {
      shape: { '/addons/quota': 'present', '/addons/channel': 'present' }, identity: { '/addons/region': '/addons/region' },
      outputValue: { plan: 'paid', addons: { storage: true, support: true, quota: '10GB', region: 'kr', channel: 'email' } },
    } },
    { action: 'setValue', path: '/addons/storage', value: false, expect: {
      shape: { '/addons/quota': 'absent', '/addons/region': 'present' }, identity: { '/addons/region': '/addons/region' },
      outputValue: { plan: 'paid', addons: { storage: false, support: true, region: 'kr', channel: 'email' } },
    } },
    { action: 'setValue', path: '/addons/support', value: false, expect: {
      shape: { '/addons/region': 'absent', '/addons/channel': 'absent' },
      outputValue: { plan: 'paid', addons: { storage: false, support: false } },
    } },
    { action: 'setValue', path: '/plan', value: 'free', expect: {
      shape: { '/addons': 'absent', '/ads': 'present' }, outputValue: { plan: 'free', ads: true },
    } },
    { action: 'setValue', path: '/plan', value: 'paid', expect: {
      shape: { '/ads': 'absent', '/addons': 'present', '/addons/quota': 'absent' }, values: { '/addons/storage': false },
      outputValue: { plan: 'paid', addons: { storage: false, support: false } },
    } },
    { action: 'setValue', path: '/addons/storage', value: true, expect: {
      shape: { '/addons/quota': 'present', '/addons/region': 'present' },
      values: { '/addons/quota': '10GB', '/addons/region': 'kr' },
      outputValue: { plan: 'paid', addons: { storage: true, support: false, quota: '10GB', region: 'kr' } },
    } },
  ],
};
