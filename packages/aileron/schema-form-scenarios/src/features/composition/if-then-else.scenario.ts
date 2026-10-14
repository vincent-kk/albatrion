import type { FormScenario } from '../../types';

/** The registered validator judges a numeric bound; the form never reads the if keyword. */
const ageSchema = {
  type: 'object', properties: { age: { type: 'number' } },
  if: { properties: { age: { minimum: 18 } }, required: ['age'] },
  then: { properties: { license: { type: 'string' } }, required: ['license'] },
  else: { properties: { guardian: { type: 'string', default: 'parent' } } },
};

/** Independent guards in allOf entries read a nested object value. */
const countrySchema = {
  type: 'object',
  properties: { address: { type: 'object', properties: { country: { type: 'string', enum: ['KR', 'US', 'JP'] } } } },
  allOf: [
    { if: { properties: { address: { properties: { country: { enum: ['US'] } }, required: ['country'] } }, required: ['address'] },
      then: { properties: { ssn: { type: 'string' } } } },
    { if: { properties: { address: { properties: { country: { enum: ['KR', 'JP'] } }, required: ['country'] } }, required: ['address'] },
      then: { properties: { residentId: { type: 'string' } } } },
  ],
};

/** A boolean guard with an else branch, toggled from the screen several times. */
export const companySchema = {
  type: 'object', properties: { company: { type: 'boolean' } },
  if: { properties: { company: { const: true } }, required: ['company'] },
  then: { properties: { vat: { type: 'string', default: 'VAT-0' } } },
  else: { properties: { personalId: { type: 'string' } } },
};

/** if/then/else gates evaluated through the validator's compileGuard. */
export const ifThenElseScenarios: readonly FormScenario[] = [
  {
    name: 'composition.if-then-else-guard',
    description: 'FRAGMENT-009 if gates use compileGuard; FRAGMENT-003 then and else are gated declarations; GOAL-034 the form does not interpret if; LANDING-018 retains inactive raw values.',
    schema: ageSchema,
    initialValue: { age: 20 },
    steps: [
      { action: 'batch', steps: [], expect: {
        shape: { '/license': 'present', '/guardian': 'absent' }, outputValue: { age: 20 },
        errors: { '/license': [{ keyword: 'required' }] },
      } },
      { action: 'setValue', path: '/license', value: 'B2', expect: { outputValue: { age: 20, license: 'B2' }, errors: { '/license': [] } } },
      { action: 'setValue', path: '/age', value: 15, expect: {
        shape: { '/license': 'absent', '/guardian': 'present' }, outputValue: { age: 15, guardian: 'parent' },
      } },
      { action: 'setValue', path: '/age', value: 18, expect: {
        shape: { '/license': 'present', '/guardian': 'absent' }, values: { '/license': 'B2' },
        outputValue: { age: 18, license: 'B2' },
      } },
      { action: 'clear', path: '/age', expect: {
        shape: { '/license': 'absent', '/guardian': 'present' }, values: { '/age': undefined },
        outputValue: { guardian: 'parent' },
      } },
    ],
  },
  {
    name: 'composition.if-nested-guard',
    description: 'FRAGMENT-021 allOf entries carry independent if/then pairs; FRAGMENT-009 the guard reads the nested host value; LANDING-018 retains inactive raw values.',
    schema: countrySchema,
    initialValue: { address: { country: 'KR' } },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/residentId': 'present', '/ssn': 'absent' }, outputValue: { address: { country: 'KR' } } } },
      { action: 'setValue', path: '/residentId', value: '900101', expect: { outputValue: { address: { country: 'KR' }, residentId: '900101' } } },
      { action: 'setValue', path: '/address/country', value: 'US', expect: {
        shape: { '/residentId': 'absent', '/ssn': 'present' }, outputValue: { address: { country: 'US' } },
      } },
      { action: 'setValue', path: '/ssn', value: '123-45', expect: { outputValue: { address: { country: 'US' }, ssn: '123-45' } } },
      { action: 'setValue', path: '/address/country', value: 'JP', expect: {
        shape: { '/residentId': 'present', '/ssn': 'absent' }, values: { '/residentId': '900101' },
        outputValue: { address: { country: 'JP' }, residentId: '900101' },
      } },
    ],
  },
  {
    name: 'composition.if-else-screen-rapid-toggle',
    description: 'FRAGMENT-009 boolean guard with else; LANDING-011 then defaults fill once; LANDING-018 both sides keep raw values across four screen toggles and a single-write batch. The multi-write batch case is composition.batched-toggle-keeps-edit.',
    schema: companySchema,
    initialValue: { company: false, personalId: 'P1' },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/personalId': 'present', '/vat': 'absent' }, outputValue: { company: false, personalId: 'P1' } } },
      { action: 'setValue', path: '/company', value: true, expect: {
        shape: { '/personalId': 'absent', '/vat': 'present' }, outputValue: { company: true, vat: 'VAT-0' },
      } },
      { action: 'setValue', path: '/vat', value: 'VAT-9', expect: { outputValue: { company: true, vat: 'VAT-9' } } },
      { action: 'setValue', path: '/company', value: false, expect: {
        shape: { '/personalId': 'present', '/vat': 'absent' }, outputValue: { company: false, personalId: 'P1' },
      } },
      { action: 'setValue', path: '/company', value: true, expect: { shape: { '/vat': 'present' }, outputValue: { company: true, vat: 'VAT-9' } } },
      { action: 'setValue', path: '/company', value: false, expect: { shape: { '/personalId': 'present' }, outputValue: { company: false, personalId: 'P1' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/company', value: true }], expect: {
        shape: { '/vat': 'present', '/personalId': 'absent' }, outputValue: { company: true, vat: 'VAT-9' },
      } },
    ],
  },
];
