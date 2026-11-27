import type { FormScenario } from '../types';

/** TEST-025: public-entry primitive renderers follow whole writes and reset. */
export const packageEntryRenderScenario = {
  name: 'value.package-entry-render',
  description: 'TEST-025: package-entry regression renders the shared primitive schema.',
  schema: { type: 'object', properties: { title: { type: 'string' }, count: { type: 'number' }, enabled: { type: 'boolean' } } },
  initialValue: { title: 'loaded', count: 1, enabled: false },
  steps: [
    { action: 'setValue', path: '', value: { title: 'updated', count: 2, enabled: true }, expect: { shape: { '/title': 'present', '/count': 'present', '/enabled': 'present' }, outputValue: { title: 'updated', count: 2, enabled: true } } },
    { action: 'reset', expect: { outputValue: { title: 'loaded', count: 1, enabled: false } } },
  ],
} satisfies FormScenario;
