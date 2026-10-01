import { mergeEffectiveSchema } from '../../blueprint';
import type { Blueprint, BlueprintChildEntry, BlueprintNode,
  BlueprintSchema } from '../../blueprint';
import { BEHAVIORS } from '../../behaviors';
import type { Behavior, SchemaNodeRuntime } from '../../record';
import { SchemaNode as RuntimeSchemaNode } from '../SchemaNode';
import type { InferSchemaNode, SchemaNode } from '../type';
import { compileEntryGuards, readValidationEntry } from '../../validation';
import type { Validator } from '../../validation';

/** Tree inputs before the factory attaches its analysis and real creator. */
export type SchemaNodeRuntimeSeed = Omit<SchemaNodeRuntime<unknown>,
  'blueprint' | 'nodeFactory' | 'settlementScratch' | 'chainRoot' |
  'batchWrites' | 'validationTargets' | 'requestValidation' | 'validator'>;

/** Create one record from a bound child or the root template. */
const createSchemaNode = (
  entry: BlueprintChildEntry | BlueprintNode,
  parent: RuntimeSchemaNode | null,
  runtime: SchemaNodeRuntime<RuntimeSchemaNode>,
): RuntimeSchemaNode => {
  const template = 'node' in entry ? entry.node : entry;
  const name = 'node' in entry ? entry.name : '';
  const escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  const path = parent ? `${parent.path}/${escapedName}` : '';
  const depth = parent ? parent.depth + 1 : 0;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  if (!row) throw new Error(`Missing behavior for ${template.kind}/${template.strategy}`);
  const behavior: Behavior<RuntimeSchemaNode> = row;
  return new RuntimeSchemaNode(
    behavior, runtime, template, parent, name, escapedName, path, depth,
    template.strategy === 'branch' ? {} : null,
    template.strategy === 'branch' ? [] : null,
    mergeEffectiveSchema(template, [], { mode: 'runtime' }), {},
  );
};

/** Bind the one per-tree runtime creator and instantiate its root record. */
export function schemaNodeFactory<Schema extends BlueprintSchema>(
  analysis: Blueprint & { readonly schema: Schema },
  runtimeSeed: SchemaNodeRuntimeSeed,
  validator?: Validator,
): InferSchemaNode<Schema>;
export function schemaNodeFactory(
  analysis: Blueprint, runtimeSeed: SchemaNodeRuntimeSeed, validator?: Validator,
): SchemaNode;
export function schemaNodeFactory(
  analysis: Blueprint, runtimeSeed: SchemaNodeRuntimeSeed, validator?: Validator,
): unknown {
  const runtime: SchemaNodeRuntime<RuntimeSchemaNode> = {
    ...runtimeSeed,
    validator,
    context: runtimeSeed.context ?? {},
    blueprint: analysis,
    nodeFactory: createSchemaNode,
    settlementScratch: undefined,
    entryDepth: 0,
    feedbackBudget: 0,
    onChangeBudget: 0,
    batchDepth: 0,
  };
  if (validator && process.env.NODE_ENV !== 'production' &&
    analysis.schema !== null && typeof analysis.schema === 'object')
    compileEntryGuards(readValidationEntry(validator, analysis.schema),
      validator, analysis);
  return createSchemaNode(analysis.root, null, runtime);
}
