import type { FormScenario } from '../../types';

/** Fields whose control states read the merged context. */
const layeredSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', controls: { readOnly: '@.mode === "form"' } },
    secret: { type: 'string', controls: { visible: '@.role === "admin"' } },
    code: { type: 'string', maxLength: 2 },
  },
};

/** FormProvider settings apply under the Form, and a Form prop overrides the same provider setting. */
export const providerLayersScenario: FormScenario = {
  name: 'handle-layout.provider-layers',
  description: 'CONTROLS-080 `@` is the FormProvider context shallow-merged with the Form context prop, the Form winning per key; provider settings such as showError apply when the Form does not set them. Layers come from providerLayers.',
  schema: layeredSchema,
  initialValue: { title: 'T', secret: 'S', code: 'abc' },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/title': 'T' }, errors: { '/code': [{ keyword: 'maxLength' }] } } }],
};

/** Provider and Form props and the control states and message display they produce. */
export const providerLayers = {
  /** FormProvider context and showError. */
  provider: { context: { mode: 'provider', role: 'admin' }, showError: true },
  /** Form context; it overrides the provider's mode and keeps its role. */
  form: { context: { mode: 'form' } },
  /** States after the merge: mode is "form", role is "admin", and the provider's showError draws the message. */
  expected: { titleReadOnly: true, secretVisible: true, codeMessageShown: true },
} as const;
