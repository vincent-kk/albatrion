import type { FormScenario } from '../types';

/** TEST-025: submission uses the settled valid output and reset reloads defaults. */
export const submitScenario: FormScenario<object, { title: string }> = {
  name: 'validation.submit',
  description: 'TEST-025: shared submit step exercises the public Form handle.',
  schema: { type: 'object', required: ['title'], properties: { title: { type: 'string', minLength: 1 } } },
  initialValue: { title: 'loaded' },
  steps: [
    { action: 'setValue', path: '/title', value: 'submitted', expect: { outputValue: { title: 'submitted' }, errors: { '/title': [] } } },
    { action: 'submit', expect: { outputValue: { title: 'submitted' }, errors: { '': [] } } },
    { action: 'reset', expect: { outputValue: { title: 'loaded' } } },
  ],
};
