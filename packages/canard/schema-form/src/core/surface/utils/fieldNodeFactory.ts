import type { Nullable, PartialBy } from '@aileron/declare';

import {
  JSONPointer as $,
  appendFormattedSegment,
  formatSegment,
} from '@/schema-form/helpers/jsonPointer';

import { FormWarningCode } from '../../../errors';
import type {
  Behavior,
  Blueprint,
  BlueprintChildEntry,
  BlueprintNode,
  BlueprintSchema,
  FieldNodeRuntime,
  Validator,
} from '../../engine';
import {
  BEHAVIORS,
  PathKeyedSet,
  collectBlueprintWarnings,
  compileEntryGuards,
  createFormErrorRecord,
  mergeEffectiveSchema,
  readValidationEntry,
} from '../../engine';
import { FieldNode as RuntimeFieldNode } from '../runtime/FieldNode';
import type {
  ArrayNode,
  FieldNode,
  InferFieldNode,
  NodeSurface,
} from '../type';

/** Empty active-declaration list: only ungated contributions apply. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = Object.freeze([]);

/**
 * Kind-independent public node shape the runtime class is checked against at compile time.
 * One class serves every kind, so the kind union and the members returning nodes are checked by `surface.test.ts` instead.
 */
type RuntimeNodeSurface = Omit<
  NodeSurface<FieldNode['type'], FieldNode['strategy'], unknown, unknown, null>,
  'rootNode' | 'parentNode' | 'children' | 'find' | 'findNodes' | 'visitSubtree'
>;

/** Array verbs every runtime node carries; non-array kinds reject them at call time. */
type RuntimeArrayVerbs = Pick<
  ArrayNode,
  'push' | 'pop' | 'update' | 'remove' | 'insert' | 'clear'
>;

/** Runtime fields the factory fills when the seed omits them: path-indexed stores and an empty context. */
type SeededRuntimeFields = 'misfitPaths' | 'context';

/** Tree inputs before the factory attaches its analysis and real creator. */
export type FieldNodeRuntimeSeed = PartialBy<
  Omit<
    FieldNodeRuntime<unknown>,
    | 'blueprint'
    | 'nodeFactory'
    | 'settlementScratch'
    | 'slotDirtyHosts'
    | 'chainRoot'
    | 'batchWrites'
    | 'visitBatchEntry'
    | 'validationTargets'
    | 'validationChangedNodes'
    | 'globalStateCounts'
    | 'globalState'
    | 'deliveries'
    | 'revisionNodes'
    | 'queuedNonSettleEvents'
    | 'validationPendingTargets'
    | 'revealBaselineNodes'
    | 'revealPolicyBaseline'
    | 'revealBaselineGeneration'
    | 'revealDropOwed'
    | 'revealDropTask'
    | 'validator'
  >,
  SeededRuntimeFields
>;

/** Create one record from a bound child or the root template. */
const createFieldNode = (
  entry: BlueprintChildEntry | BlueprintNode,
  parent: Nullable<RuntimeFieldNode>,
  runtime: FieldNodeRuntime<RuntimeFieldNode>,
  source?: RuntimeFieldNode,
): RuntimeFieldNode => {
  const template = 'node' in entry ? entry.node : entry;
  const name = 'node' in entry ? entry.name : '';
  const escapedName = formatSegment(name);
  const path = parent
    ? appendFormattedSegment(parent.path, escapedName)
    : $.Root;
  const depth = parent ? parent.depth + 1 : 0;
  const row = source?.behavior ?? BEHAVIORS[template.kind]?.[template.strategy];
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
    source?.schema ??
      mergeEffectiveSchema(template, NO_ACTIVE_DECLARATION_IDS, {
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
): RuntimeNodeSurface {
  const runtime: FieldNodeRuntime<RuntimeFieldNode> = {
    ...runtimeSeed,
    misfitPaths: runtimeSeed.misfitPaths ?? new PathKeyedSet(),
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
      FormWarningCode.DialectMismatch,
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
    typeof analysis.schema === 'object' &&
    analysis.nodes.some(
      (node) =>
        node.declarations.some((declaration) =>
          declaration.gates.some((gate) => gate.kind === 'if'),
        ) ||
        node.childEntries.some((child) =>
          child.declarations.some((declaration) =>
            declaration.gates.some((gate) => gate.kind === 'if'),
          ),
        ),
    )
  )
    compileEntryGuards(
      readValidationEntry(validator, analysis.schema),
      validator,
      analysis,
    );
  return createFieldNode(
    analysis.root,
    null,
    runtime,
  ) satisfies RuntimeArrayVerbs;
}
