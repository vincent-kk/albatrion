import type { FormScenario } from '../../types';

/** A bounded text field and a string array whose node subscriptions the consumer records. */
const subscribedSchema = {
  type: 'object',
  properties: { name: { type: 'string', minLength: 2 }, tags: { type: 'array', items: { type: 'string' } } },
};

/** node.subscribe receives one event kind per kind of change, and a state write or command is not a value write. */
export const subscriptionKindsScenario: FormScenario = {
  name: 'events.subscription-kinds',
  description: 'EVENT-001 node.subscribe delivers notifications only; a value write brings UpdateValue, an array verb brings UpdateChildren, a validation whose result changes brings UpdateError and an explicit validation with the same result brings none (EVENT-046), focus and refresh bring their Request commands; EVENT-012 a state write and a command are not value writes, so they bring no UpdateValue and no onChange; an unsubscribed listener receives nothing. Stages come from subscriptionStages.',
  schema: subscribedSchema,
  initialValue: { name: 'Kim', tags: [] },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/name': 'Kim', '/tags': [] } } }],
};

/** One action on a subscribed node and the event kinds it must and must not bring. */
export interface SubscriptionStage {
  /** Action the consumer performs. */
  readonly act: 'setValue' | 'setState' | 'validate' | 'focus' | 'refresh' | 'push';
  /** Node subscribed for this stage and addressed by the action. */
  readonly path: string;
  /** Value for setValue or push. */
  readonly value?: unknown;
  /** FieldNodeEventType member names that must appear among the received events. */
  readonly includes: readonly string[];
  /** FieldNodeEventType member names that must not appear. */
  readonly excludes: readonly string[];
  /** onChange calls this stage adds. */
  readonly changes: number;
  /** Whether the listener is unsubscribed before the action; then nothing may arrive. */
  readonly unsubscribed?: boolean;
}

/** Stages applied in order to subscriptionKindsScenario. */
export const subscriptionStages: readonly SubscriptionStage[] = [
  { act: 'setValue', path: '/name', value: 'a', includes: ['UpdateValue', 'UpdateError'], excludes: ['UpdateChildren'], changes: 1 },
  { act: 'setState', path: '/name', includes: ['UpdateState'], excludes: ['UpdateValue'], changes: 0 },
  { act: 'validate', path: '/name', includes: [], excludes: ['UpdateValue', 'UpdateError'], changes: 0 },
  { act: 'focus', path: '/name', includes: ['RequestFocus'], excludes: ['UpdateValue', 'UpdateState'], changes: 0 },
  { act: 'refresh', path: '/name', includes: ['RequestRefresh'], excludes: ['UpdateValue'], changes: 0 },
  { act: 'push', path: '/tags', value: 'x', includes: ['UpdateValue', 'UpdateChildren'], excludes: [], changes: 1 },
  { act: 'setValue', path: '/name', value: 'late', includes: [], excludes: ['UpdateValue'], changes: 1, unsubscribed: true },
];
