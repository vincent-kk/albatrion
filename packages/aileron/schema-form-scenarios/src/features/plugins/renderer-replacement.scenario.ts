import type { FormScenario } from '../../types';

/** A bounded text field and a number, drawn by consumer renderers. */
const rendererSchema = {
  type: 'object',
  properties: { title: { type: 'string', minLength: 2 }, count: { type: 'number' } },
};

/** Form renderer props replace the plugin's renderers; a FormProvider group renderer applies when the Form sets none. */
export const rendererReplacementScenario: FormScenario = {
  name: 'plugins.renderer-replacement',
  description: 'SURFACE-002 and LANDING-035 the four renderers FieldRenderer, FormLabelRenderer, FormInputRenderer and FormErrorRenderer are Form props with the plugin key names; a Form renderer replaces the plugin one for that slot, and a FormProvider group renderer applies when the Form sets none; SURFACE-003 Form.Label and Form.Error call the label and error renderers, while the default group draws its own label and message, so those two slots show only in a composition layout. Renderer cases come from rendererCases; each consumer renderer marks itself with data-renderer="<source>-<slot>".',
  schema: rendererSchema,
  initialValue: { title: 'a', count: 1 },
  steps: [{ action: 'setValue', path: '/count', value: 2, expect: { values: { '/count': 2 }, errors: { '/title': [{ keyword: 'minLength' }] } } }],
};

/** Renderer slots a case sets on the Form or the FormProvider. */
export type RendererSlot = 'group' | 'label' | 'error';

/** One placement of consumer renderers and the markers drawn in the form. */
export interface RendererCase {
  /** Story and test label. */
  readonly label: string;
  /** Slots set as Form props, drawn with the marker prefix "form". */
  readonly form: readonly RendererSlot[];
  /** Slots set on the FormProvider, drawn with the marker prefix "provider". */
  readonly provider: readonly RendererSlot[];
  /** Whether /title is drawn by a children layout of Form.Label, Form.Input and Form.Error instead of Form.Group. */
  readonly composed: boolean;
  /** Markers drawn in the form once errors show. */
  readonly markers: readonly string[];
  /** Markers that must not appear anywhere. */
  readonly absent: readonly string[];
}

/** Placements compared on rendererReplacementScenario with showError on. */
export const rendererCases: readonly RendererCase[] = [
  { label: 'form label and error', form: ['label', 'error'], provider: [], composed: true, markers: ['form-label', 'form-error'], absent: [] },
  { label: 'provider group', form: [], provider: ['group'], composed: false, markers: ['provider-group'], absent: [] },
  { label: 'form group over provider group', form: ['group'], provider: ['group'], composed: false, markers: ['form-group'], absent: ['provider-group'] },
];
