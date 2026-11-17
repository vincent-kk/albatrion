import type { CompositeCase } from './types';

/** Plugin form: a kind switch gates an upload field, beside a field whose input the consumer makes throw. */
const pluginSchema = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['upload', 'none'] },
    broken: { type: 'string' },
    note: { type: 'string' },
  },
  if: { properties: { kind: { const: 'upload' } }, required: ['kind'] },
  then: { properties: { attachment: { type: 'array', items: { type: 'string' }, presentation: { inputType: 'composite.files' } } } },
};

/** Files the consumer attaches to /attachment, and the value that makes /broken's input throw. */
export const pluginFormPlan = { fileNames: ['a.pdf', 'b.pdf'], trigger: 'boom' } as const;

/** CX-06: consumer renderers, a file field inside a branch, and an isolated throwing input in one form. */
export const cx06PluginForm: CompositeCase = {
  scenario: {
    name: 'composite.cx06-plugin-form',
    description: 'C6 plugin form (G8, G6). A Form group renderer draws every field; the upload branch holds a file input whose files sit in the attached files map; GOAL-059 a mapped input that throws falls back alone and reports RENDER_FAILED once while the note still edits; switching kind away unmounts the file input and removes its entry (TEST-023).',
    schema: pluginSchema,
    initialValue: { kind: 'upload', broken: 'ok', note: '' },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/attachment': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/broken', value: 'boom' }], expect: {
        values: { '/broken': 'boom' }, onErrorCodes: ['SCHEMA_FORM_ERROR.RENDER_FAILED'],
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/note', value: 'still works' }], expect: { values: { '/note': 'still works' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'none' }], expect: { shape: { '/attachment': 'absent' } } },
    ],
  },
};
