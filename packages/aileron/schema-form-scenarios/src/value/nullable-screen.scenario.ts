import type { FormScenario } from '../types';

/** TEST-005 preserves nullable observations; LANDING-196 defines empty drafts. */
export const nullableScreenScenarios = [
  {
    name: 'TEST-005 nullable-contact-fields',
    schema: { type: 'object', properties: { email: { type: ['string', 'null'] }, phone: { type: ['string', 'null'] } } },
    initialValue: { email: null, phone: null },
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: { email: null, phone: null }, shape: { '/email': 'present', '/phone': 'present' } } },
      { action: 'setValue', path: '/email', value: 'a@example.test', expect: { outputValue: { email: 'a@example.test', phone: null } } },
    ],
  },
  {
    name: 'TEST-005 nullable-price-limits',
    schema: { type: 'object', properties: { price: { type: ['number', 'null'], minimum: 0, maximum: 100 } } },
    initialValue: { price: null },
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/price': null } } },
      { action: 'setValue', path: '/price', value: 50, expect: { outputValue: { price: 50 }, errors: { '/price': [] } } },
      { action: 'setValue', path: '', value: { price: null }, expect: { outputValue: { price: null }, errors: { '/price': [] } } },
    ],
  },
  {
    name: 'TEST-005 nullable-boolean-null-false',
    schema: { type: 'object', properties: { consent: { type: ['boolean', 'null'] } } },
    initialValue: { consent: null },
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/consent': null } } },
      { action: 'setValue', path: '', value: { consent: false }, expect: { outputValue: { consent: false }, values: { '/consent': false } } },
      { action: 'setValue', path: '/consent', value: true, expect: { outputValue: { consent: true } } },
    ],
  },
  {
    name: 'TEST-005 nullable-nested-address',
    schema: { type: 'object', properties: { address: { type: ['object', 'null'], properties: { city: { type: ['string', 'null'] } } } } },
    initialValue: { address: null },
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: { address: null } } },
      { action: 'setValue', path: '', value: { address: { city: null } }, expect: { outputValue: { address: { city: null } }, shape: { '/address/city': 'present' } } },
      { action: 'setValue', path: '/address/city', value: 'Seoul', expect: { outputValue: { address: { city: 'Seoul' } } } },
    ],
  },
  {
    name: 'TEST-005 nullable-array-items',
    schema: { type: 'array', items: { type: ['string', 'null'] } }, initialValue: [null, 'kept'],
    steps: [{ action: 'setValue', path: '/1', value: 'edited', expect: { outputValue: [null, 'edited'], shape: { '/0': 'present', '/1': 'present' } } }],
  },
  {
    name: 'TEST-005 nullable-array-container',
    schema: { type: ['array', 'null'], items: { type: 'string' } }, initialValue: null,
    steps: [
      { action: 'batch', steps: [], expect: { outputValue: null } },
      { action: 'setValue', path: '', value: ['one'], expect: { outputValue: ['one'], shape: { '/0': 'present' } } },
      { action: 'setValue', path: '', value: null, expect: { outputValue: null, shape: { '/0': 'absent' } } },
    ],
  },
  {
    name: 'TEST-005 nullable-required-mix',
    schema: { type: 'object', required: ['name', 'note'], properties: { name: { type: 'string' }, note: { type: ['string', 'null'] } } },
    initialValue: { name: 'Applicant', note: null },
    steps: [{ action: 'batch', steps: [], expect: { outputValue: { name: 'Applicant', note: null }, errors: { '': [], '/note': [] } } }],
  },
  {
    name: 'TEST-005 nullable-deep-structure',
    schema: { type: 'object', properties: { teams: { type: ['array', 'null'], items: { type: ['object', 'null'], properties: { label: { type: ['string', 'null'] } } } } } },
    initialValue: { teams: [null, { label: null }] },
    steps: [{ action: 'setValue', path: '/teams/1/label', value: 'team', expect: { outputValue: { teams: [null, { label: 'team' }] } } }],
  },
  {
    name: 'TEST-005 nullable-job-application',
    schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, years: { type: ['number', 'null'] }, employer: { type: ['string', 'null'] }, links: { type: ['array', 'null'], items: { type: 'string' } } } },
    initialValue: { name: 'Applicant', years: null, employer: null, links: null },
    steps: [{ action: 'setValue', path: '/years', value: 3, expect: { outputValue: { name: 'Applicant', years: 3, employer: null, links: null }, errors: { '': [] } } }],
  },
  {
    name: 'TEST-005 pure-null-field',
    schema: { type: 'object', properties: { nothing: { type: 'null' } } }, initialValue: { nothing: null },
    steps: [{ action: 'reset', expect: { outputValue: { nothing: null }, values: { '/nothing': null } } }],
  },
] satisfies readonly FormScenario[];
