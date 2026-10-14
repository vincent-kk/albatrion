import type { FormScenario } from '../../types';

/** A name with a derived slug; a clear flag resets the name's interaction state without touching values. */
const profileSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', controls: { resetInteraction: '../clear' } },
    slug: { type: 'string', controls: { derived: '../name' } },
    clear: { type: 'boolean' },
  },
};

/** The value side of resetInteraction: edits and derived values survive the clear edge; state is read by the consumer. */
export const resetInteractionScenario: FormScenario = {
  name: 'derivation.reset-interaction',
  description: 'CONTROLS-029 resetInteraction (formerly pristine) resets dirty and touched on a rising edge and never touches values; SETTLE-006 it runs at commit beside derived, so the derived slug keeps following the name. Interaction stages come from resetInteractionStages.',
  schema: profileSchema,
  initialValue: { name: 'kim', clear: false },
  steps: [
    { action: 'batch', steps: [], expect: { values: { '/name': 'kim', '/slug': 'kim' } } },
  ],
};

/** One consumer interaction and the interaction state of /name afterwards. */
export interface ResetInteractionStage {
  /** Type into /name and leave it, set /clear, or unset /clear. */
  readonly act: 'editName' | 'setClear' | 'unsetClear';
  /** Text typed into /name for editName, appended to the current value. */
  readonly text?: string;
  /** dirty and touched of /name afterwards; a missing key is false. */
  readonly nameState: Readonly<Partial<Record<'dirty' | 'touched', true>>>;
  /** Values after the interaction; resetInteraction never changes them. */
  readonly values: Readonly<Record<string, unknown>>;
}

/** Interactions applied in order to resetInteractionScenario; only rising edges of /clear reset the state, so an edit while /clear stays true and the falling edge keep it. */
export const resetInteractionStages: readonly ResetInteractionStage[] = [
  { act: 'editName', text: 'a', nameState: { dirty: true, touched: true }, values: { '/name': 'kima', '/slug': 'kima' } },
  { act: 'setClear', nameState: {}, values: { '/name': 'kima', '/slug': 'kima', '/clear': true } },
  { act: 'editName', text: 'b', nameState: { dirty: true, touched: true }, values: { '/name': 'kimab', '/slug': 'kimab', '/clear': true } },
  { act: 'unsetClear', nameState: { dirty: true, touched: true }, values: { '/name': 'kimab', '/clear': false } },
  { act: 'setClear', nameState: {}, values: { '/name': 'kimab', '/clear': true } },
];
