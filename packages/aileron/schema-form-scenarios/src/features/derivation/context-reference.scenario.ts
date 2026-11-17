import type { FormScenario } from '../../types';

/** Fields whose controls and derived total read the Form context through `@`. */
const contextSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', controls: { readOnly: '@.mode === "view"' } },
    secret: { type: 'string', controls: { visible: '@.role === "admin"' } },
    amount: { type: 'number' },
    total: { type: 'number', controls: { derived: '../amount * @.rate' } },
  },
};

/** Context-driven controls; the context itself comes from contextStages because scenarios carry no Form props. */
export const contextReferenceScenario: FormScenario = {
  name: 'derivation.context-reference',
  description: 'CONTROLS-080 `@` reads the Form context; a context change is an input change that runs one settle, re-evaluates gates and state keys, and is an edge for derived; a deeply equal new context runs no settle (28C-08). Stages come from contextStages.',
  schema: contextSchema,
  initialValue: { title: 'draft', secret: 'key', amount: 5 },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/title': 'draft', '/amount': 5 } } }],
};

/** One Form context and the control states and values it produces. */
export interface ContextStage {
  /** Story button and test label for the stage. */
  readonly label: string;
  /** Value passed as the Form context prop. */
  readonly context: Readonly<Record<string, unknown>>;
  /** readOnly of /title and visible of /secret after the stage applies. */
  readonly states: Readonly<{ titleReadOnly: boolean; secretVisible: boolean }>;
  /** Values after the stage applies. */
  readonly values: Readonly<Record<string, unknown>>;
  /** Whole-form onChange calls this stage alone makes. */
  readonly changes: number;
}

/** Context values applied in order to contextReferenceScenario; the first is the mounted context. */
export const contextStages: readonly ContextStage[] = [
  { label: 'editor', context: { mode: 'edit', role: 'user', rate: 2 }, states: { titleReadOnly: false, secretVisible: false }, values: { '/total': 10 }, changes: 0 },
  { label: 'viewer admin', context: { mode: 'view', role: 'admin', rate: 3 }, states: { titleReadOnly: true, secretVisible: true }, values: { '/total': 15 }, changes: 1 },
  { label: 'equal copy', context: { mode: 'view', role: 'admin', rate: 3 }, states: { titleReadOnly: true, secretVisible: true }, values: { '/total': 15 }, changes: 0 },
];
