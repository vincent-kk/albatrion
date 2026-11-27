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
 * Create one record with a per-record wrapper of its kind and strategy row. The wrapper breaks
 * row identity, so a plain record never carries an item leaf row; public trees cover that row.
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
    project: (node, value) =>
      Reflect.apply(row.project, undefined, [node, value]),
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
    __parent__: parent,
    get rootNode() {
      return parent?.rootNode ?? this;
    },
    name,
    escapedName,
    path: parent ? `${parent.path}/${escapedName}` : '',
    depth: parent ? parent.depth + 1 : 0,
    isRequired: false,
    isNullable: template.isNullable,
    schemaType: template.schemaType,
    __childrenByName__: template.strategy === 'branch' ? {} : null,
    children: template.strategy === 'branch' ? [] : null,
    __itemKey__: null,
    __itemCount__: 0,
    __nextItemKey__: 0,
    source: undefined,
    extras: undefined,
    isActive: true,
    isVisible: true,
    isReadOnly: false,
    isDisabled: false,
    __value__: undefined,
    __outputValue__: undefined,
    __divergenceCurrent__: undefined,
    __divergencePath__: undefined,
    __divergenceSegments__: undefined,
    __divergenceBase__: undefined,
    __isDivergent__: false,
    __schema__: mergeEffectiveSchema(template, [], { mode: 'runtime' }),
    __state__: {},
    __revisionLedger__: EMPTY_REVISION_LEDGER,
    __isDeliveryInitialized__: false,
    __deliveryChanges__: 0,
    __pendingDelivery__: undefined,
    __pendingRevisionMask__: 0,
    __pendingNonSettleDelivery__: undefined,
    isDetached: false,
    isDisposed: false,
    __interactionEpoch__: 0,
  };
};
