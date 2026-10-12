import type { FormScenario } from '../../types';

/** Four subscribed text fields under one group, so commits of the whole group subtree can be counted. */
const commitSchema = {
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'string' }, c: { type: 'string' }, d: { type: 'string' } },
};

/** One public write or one batch reaches the screen in one React commit; an unchanged write commits nothing. */
export const renderCommitsScenario: FormScenario = {
  name: 'events.render-commits',
  description: 'EVENT-002 one write from one handler reaches every subscribed input in one React commit; EVENT-004 a batch of several writes is one notification pass and one commit; EVENT-031 a write that leaves the value unchanged commits nothing and requests no validation. With OnChange validation, EVENT-046 delivers the validation result in its own wave, so a changing write adds one more commit even when the result is still empty. Commit counts come from renderCommitStages.',
  schema: commitSchema,
  initialValue: { a: '0', b: '0', c: '0', d: '0' },
  steps: [{ action: 'batch', steps: [], expect: { outputValue: { a: '0', b: '0', c: '0', d: '0' } } }],
};

/** One write performed by the consumer and the React commits it produces below the group. */
export interface RenderCommitStage {
  /** Story and test label. */
  readonly label: string;
  /** Whole-form value written; with `batch`, each key is written separately inside one batch. */
  readonly value: Readonly<Record<string, string>>;
  /** Whether the keys are written one by one inside one batch. */
  readonly batch: boolean;
  /** React commits of the group subtree with validation mode None. */
  readonly commits: number;
  /** React commits of the group subtree with OnChange validation: the write's commit plus the validation wave's (EVENT-046). */
  readonly commitsWithValidation: number;
}

/** Stages applied in order to renderCommitsScenario. */
export const renderCommitStages: readonly RenderCommitStage[] = [
  { label: 'one root write of four fields', value: { a: '1', b: '1', c: '1', d: '1' }, batch: false, commits: 1, commitsWithValidation: 2 },
  { label: 'four field writes in one batch', value: { a: '2', b: '2', c: '2', d: '2' }, batch: true, commits: 1, commitsWithValidation: 2 },
  { label: 'unchanged root write', value: { a: '2', b: '2', c: '2', d: '2' }, batch: false, commits: 0, commitsWithValidation: 0 },
];
