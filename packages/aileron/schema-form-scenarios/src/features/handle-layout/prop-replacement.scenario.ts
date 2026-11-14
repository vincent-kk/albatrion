import type { FormScenario } from '../../types';

/** A one-field schema whose replacements are staged by the consumer. */
export const replacementSchema = { type: 'object', properties: { name: { type: 'string' } } };

/** New jsonSchema and defaultValue props apply at reset; an equal schema keeps the tree, a different one rebuilds it. */
export const propReplacementScenario: FormScenario = {
  name: 'handle-layout.prop-replacement',
  description: 'WRITE-044 reset loads the committed jsonSchema and defaultValue props, and a prop change alone does not reload; WRITE-043 an equal schema (deeply equal JSON, key order included) loads into the same tree and keeps node identity, while a different schema rebuilds the tree. Stages come from propReplacementStages.',
  schema: replacementSchema,
  initialValue: { name: 'A' },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/name': 'A' } } }],
};

/** One prop change, optionally followed by reset, and the result. */
export interface PropReplacementStage {
  /** Story button and test label. */
  readonly label: string;
  /** jsonSchema prop for this stage; absent keeps the previous one. */
  readonly schema?: unknown;
  /** defaultValue prop for this stage; absent keeps the previous one. */
  readonly defaultValue?: unknown;
  /** Whether the consumer calls reset after the props commit. */
  readonly reset: boolean;
  /** Whole-form output afterwards. */
  readonly outputValue: unknown;
  /** Whether the /name node is the same object as before the stage. */
  readonly nodeKept: boolean;
}

/** Stages applied in order to propReplacementScenario; the first is the mounted props. */
export const propReplacementStages: readonly PropReplacementStage[] = [
  { label: 'mounted', reset: false, outputValue: { name: 'A' }, nodeKept: true },
  { label: 'new defaultValue without reset', defaultValue: { name: 'B' }, reset: false, outputValue: { name: 'A' }, nodeKept: true },
  { label: 'reset loads it', reset: true, outputValue: { name: 'B' }, nodeKept: true },
  { label: 'equal schema copy', schema: { type: 'object', properties: { name: { type: 'string' } } }, reset: true, outputValue: { name: 'B' }, nodeKept: true },
  { label: 'different schema', schema: { type: 'object', properties: { name: { type: 'string' }, extra: { type: 'string', default: 'x' } } }, reset: true, outputValue: { name: 'B', extra: 'x' }, nodeKept: false },
];
