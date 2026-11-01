import { BEHAVIORS } from '@/schema-form/core/engine/behaviors';
import { mergeEffectiveSchema } from '@/schema-form/core/engine/blueprint';
import type {
  BlueprintChildEntry,
  BlueprintNode,
} from '@/schema-form/core/engine/blueprint';
import { EMPTY_REVISION_LEDGER } from '@/schema-form/core/engine/record';
import type {
  Behavior,
  FieldNodeRecord,
  FieldNodeRuntime,
} from '@/schema-form/core/engine/record';

/** Plain record used by settlement tests, without the later FieldNode class. */
export interface PlainNode extends FieldNodeRecord<PlainNode> {}

/**
 * Create one record through the same row selection the later factory uses.
 * @param entry - Blueprint template or bound child occurrence
 * @param parent - Structural owner of the new record
 * @param runtime - Single tree runtime supplied to every child
 * @param visits - Optional assertion log for bounded traversal checks
 * @returns Unattached plain record; settlement owns the live shape
 */
export const createPlainNode = (
  entry: BlueprintChildEntry | BlueprintNode,
  parent: PlainNode | null,
  runtime: FieldNodeRuntime<PlainNode>,
  visits: string[] = [],
): PlainNode => {
  const template = 'node' in entry ? entry.node : entry;
  const name = 'node' in entry ? entry.name : '';
  const escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  if (!row)
    throw new Error(
      `Missing behavior for ${template.kind}/${template.strategy}`,
    );
  const behavior: Behavior<PlainNode> = {
    interpret: row.interpret,
    assemble: (node, children) => {
      visits.push(node.path);
      return Reflect.apply(row.assemble, undefined, [node, children]);
    },
    project: (node, local) =>
      Reflect.apply(row.project, undefined, [node, local]),
    finishInput: (node) => Reflect.apply(row.finishInput, undefined, [node]),
    declareChildren: (node) => {
      const entries: readonly BlueprintChildEntry[] = Reflect.apply(
        row.declareChildren,
        undefined,
        [node],
      );
      for (const child of entries)
        visits.push(`select:${node.path}/${child.name}`);
      return entries;
    },
    arrange: row.arrange,
    type: row.type,
    strategy: row.strategy,
  };
  return {
    behavior,
    runtime,
    blueprintNode: template,
    parent,
    get rootNode() {
      return parent?.rootNode ?? this;
    },
    name,
    escapedName,
    path: parent ? `${parent.path}/${escapedName}` : '',
    depth: parent ? parent.depth + 1 : 0,
    isRequired: false,
    nullable: template.nullable,
    schemaType: template.schemaType,
    structure: template.strategy === 'branch' ? {} : null,
    children: template.strategy === 'branch' ? [] : null,
    itemKey: null,
    itemCount: 0,
    nextItemKey: 0,
    raw: undefined,
    undeclaredValues: undefined,
    isActive: true,
    isVisible: true,
    isReadOnly: false,
    isDisabled: false,
    local: undefined,
    emit: undefined,
    divergenceCurrent: undefined,
    divergenceBase: undefined,
    divergenceResult: false,
    schema: mergeEffectiveSchema(template, [], { mode: 'runtime' }),
    interactionState: {},
    revisionLedger: EMPTY_REVISION_LEDGER,
    deliveryInitialized: false,
    deliveryChanges: 0,
    pendingDelivery: undefined,
    pendingRevision: 0,
    pendingNonSettleDelivery: undefined,
    detached: false,
    disposed: false,
    interactionReset: 0,
  };
};
