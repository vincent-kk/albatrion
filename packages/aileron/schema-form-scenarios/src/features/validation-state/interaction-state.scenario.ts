import type { FormScenario } from '../../types';
import type { InteractionStateNames } from './types';

/** Two plain fields; interaction state is driven from the screen by the consumer. */
const draftSchema = {
  type: 'object',
  properties: { title: { type: 'string' }, done: { type: 'boolean' } },
};

/** A loaded draft whose interaction state starts empty. */
export const interactionStateScenario: FormScenario = {
  name: 'validation-state.interaction-state',
  description: 'VALUE-022 edited and touched; EVENT-062, LANDING-152 and LANDING-153 globalState keys are true and drop when no node holds them, and the globalState object is replaced only when a key crosses zero; GOAL-061 touched waits for blur; EVENT-067 onStateChange fires once per entry that changes any node state, even when the global keys do not cross zero, so focus leaving /done notifies although globalState is unchanged. Stages come from interactionStateStages.',
  schema: draftSchema,
  initialValue: { title: 'draft', done: false },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/title': 'draft', '/done': false } } }],
};

/** One consumer interaction and the global state and notification count it produces. */
export interface InteractionStateStage {
  /** What the consumer does: type into /title, tab away to /done, click back into /title and type, or call a handle method. */
  readonly act: 'load' | 'type' | 'blur' | 'returnAndType' | 'clearState' | 'setState';
  /** Text typed for type and returnAndType. */
  readonly text?: string;
  /** Global state after the interaction, by flag name. */
  readonly state: InteractionStateNames;
  /** onStateChange calls made by this interaction alone. */
  readonly notifications: number;
}

/** Interactions applied in order to interactionStateScenario. */
export const interactionStateStages: readonly InteractionStateStage[] = [
  { act: 'load', state: {}, notifications: 0 },
  { act: 'type', text: ' v2', state: { edited: true }, notifications: 1 },
  { act: 'blur', state: { edited: true, touched: true }, notifications: 1 },
  { act: 'returnAndType', text: '!', state: { edited: true, touched: true }, notifications: 1 },
  { act: 'clearState', state: {}, notifications: 1 },
  { act: 'setState', state: { touched: true }, notifications: 1 },
];
