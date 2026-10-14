import type { PartialBy } from '@aileron/declare';

import { DIALECT_MISMATCH } from '../../../errors';
import { BEHAVIORS } from '../../engine';
import { collectBlueprintWarnings, mergeEffectiveSchema } from '../../engine';
import type {
  Blueprint,
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintSchema,
} from '../../engine';
import { createFormErrorRecord } from '../../engine';
import type { Behavior, FieldNodeRuntime } from '../../engine';
import { PathKeyedMap } from '../../engine';
import { PathKeyedSet } from '../../engine';
import { compileEntryGuards, readValidationEntry } from '../../engine';
import type { Validator } from '../../engine';
import { FieldNode as RuntimeFieldNode } from '../FieldNode';
import type { FieldNode, InferFieldNode } from '../type';

/** Path-indexed stores the factory creates when the seed omits them. */
type SeededPathStores =
  | 'latentRaw'
  | 'typeMismatchPaths'
  | 'inactiveValuesMemo';

/** Tree inputs before the factory attaches its analysis and real creator. */
export type FieldNodeRuntimeSeed = PartialBy<
  Omit<
    FieldNodeRuntime<unknown>,
    | 'blueprint'
    | 'nodeFactory'
    | 'settlementScratch'
    | 'chainRoot'
    | 'batchWrites'
    | 'validationTargets'
    | 'validationChangedNodes'
    | 'globalStateCounts'
    | 'globalState'
    | 'deliveries'
    | 'revisionNodes'
    | 'queuedNonSettleEvents'
    | 'validationPendingTargets'
    | 'validator'
  >,
  SeededPathStores
>;

/** Create one record from a bound child or the root template. */
const createFieldNode = (
  entry: BlueprintChildEntry | BlueprintNode,
  parent: RuntimeFieldNode | null,
  runtime: FieldNodeRuntime<RuntimeFieldNode>,
): RuntimeFieldNode => {
  const template = 'node' in entry ? entry.node : entry;
  const name = 'node' in entry ? entry.name : '';
  const escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  const path = parent ? `${parent.path}/${escapedName}` : '';
  const depth = parent ? parent.depth + 1 : 0;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  if (!row)
    throw new Error(
      `Missing behavior for ${template.kind}/${template.strategy}`,
    );
  const behavior: Behavior<RuntimeFieldNode> = row;
  return new RuntimeFieldNode(
    behavior,
    runtime,
    template,
    parent,
    name,
    escapedName,
    path,
    depth,
    template.strategy === 'branch' ? {} : null,
    template.strategy === 'branch' ? [] : null,
    mergeEffectiveSchema(template, [], {
      mode: 'runtime',
      isAtomic: runtime.blueprint?.isAtomic,
    }),
    {},
  );
};

/** Bind the one per-tree runtime creator and instantiate its root record. */
export function fieldNodeFactory<Schema extends BlueprintSchema>(
  analysis: Blueprint & { readonly schema: Schema },
  runtimeSeed: FieldNodeRuntimeSeed,
  validator?: Validator,
): InferFieldNode<Schema>;
export function fieldNodeFactory(
  analysis: Blueprint,
  runtimeSeed: FieldNodeRuntimeSeed,
  validator?: Validator,
): FieldNode;
export function fieldNodeFactory(
  analysis: Blueprint,
  runtimeSeed: FieldNodeRuntimeSeed,
  validator?: Validator,
): unknown {
  const runtime: FieldNodeRuntime<RuntimeFieldNode> = {
    ...runtimeSeed,
    latentRaw: runtimeSeed.latentRaw ?? new PathKeyedMap('pair'),
    typeMismatchPaths: runtimeSeed.typeMismatchPaths ?? new PathKeyedSet(),
    inactiveValuesMemo:
      runtimeSeed.inactiveValuesMemo ?? new PathKeyedMap('path'),
    globalStateCounts: new Map(),
    globalState: {},
    validator,
    context: runtimeSeed.context ?? {},
    blueprint: analysis,
    nodeFactory: createFieldNode,
    settlementScratch: undefined,
    entryDepth: 0,
    feedbackBudget: 0,
    onChangeBudget: 0,
    batchDepth: 0,
  };
  if (runtime.errorReporter?.hasConsumer())
    collectBlueprintWarnings(analysis, (diagnostic) => {
      const record = createFormErrorRecord(true, diagnostic);
      if (record)
        (runtime.pendingWarningRecords ??= new Map()).set(
          JSON.stringify([
            record.code,
            diagnostic.schemaPath,
            diagnostic.details.keyword ?? diagnostic.details.propertyName ?? '',
          ]),
          record,
        );
    });
  const authoredSchema = analysis.schema;
  if (
    process.env.NODE_ENV !== 'production' &&
    validator?.dialect &&
    authoredSchema !== null &&
    typeof authoredSchema === 'object' &&
    typeof authoredSchema.$schema === 'string' &&
    validator.dialect !== authoredSchema.$schema
  ) {
    const record = createFormErrorRecord(
      true,
      `SCHEMA_FORM_WARNING.${DIALECT_MISMATCH}`,
      'warning',
      () =>
        `Validator dialect ${validator.dialect} differs from schema ${authoredSchema.$schema}`,
      {
        schemaPath: '#/$schema',
        details: {
          dialect: validator.dialect,
          $schema: authoredSchema.$schema,
        },
      },
    );
    if (record) {
      if (runtime.errorReporter?.hasConsumer())
        runtime.errorReporter.report(record);
      else console.warn(record.code, record.message, record.details);
    }
  }
  if (
    validator &&
    process.env.NODE_ENV !== 'production' &&
    analysis.schema !== null &&
    typeof analysis.schema === 'object'
  )
    compileEntryGuards(
      readValidationEntry(validator, analysis.schema),
      validator,
      analysis,
    );
  return createFieldNode(analysis.root, null, runtime);
}
