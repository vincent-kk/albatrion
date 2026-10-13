import type { FormScenario } from '../../types';
import { batchSyncScenario } from './batch-sync.scenario';
import { renderCommitsScenario } from './render-commits.scenario';
import { subscriptionKindsScenario } from './subscription-kinds.scenario';
import { warningOnceScenario } from './warning-once.scenario';

export { renderCommitStages } from './render-commits.scenario';
export type { RenderCommitStage } from './render-commits.scenario';
export { subscriptionStages } from './subscription-kinds.scenario';
export type { SubscriptionStage } from './subscription-kinds.scenario';

/** Event and notification feature cases; subscriptions and commit counts run in the consumer. */
export const eventsFeatureScenarios: readonly FormScenario[] = [
  batchSyncScenario, warningOnceScenario, subscriptionKindsScenario, renderCommitsScenario,
];
