import type { FormScenario } from '../types';

/** TEST-025: root-local refs retain nested values and escaped JSON Pointers. */
export const referenceSchemaScenario = {
  name: 'value.reference-schema',
  description: 'TEST-025: $defs references render and reset through the public Form.',
  schema: {
    type: 'object',
    $defs: { text: { type: 'string' }, address: { type: 'object', properties: { city: { $ref: '#/$defs/text' } } } },
    properties: { address: { $ref: '#/$defs/address' }, 'a/b~c': { $ref: '#/$defs/text' } },
  },
  initialValue: { address: { city: 'Seoul' }, 'a/b~c': 'loaded' },
  steps: [
    { action: 'setValue', path: '/address/city', value: 'Busan', expect: { shape: { '/address/city': 'present' }, outputValue: { address: { city: 'Busan' }, 'a/b~c': 'loaded' } } },
    { action: 'setValue', path: '/a~1b~0c', value: 'edited', expect: { values: { '/a~1b~0c': 'edited' } } },
    { action: 'reset', expect: { outputValue: { address: { city: 'Seoul' }, 'a/b~c': 'loaded' } } },
  ],
} satisfies FormScenario;
