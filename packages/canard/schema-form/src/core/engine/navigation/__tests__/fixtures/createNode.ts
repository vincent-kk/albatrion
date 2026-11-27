import { blueprint } from '@/schema-form/core/engine/blueprint';
import type {
  FieldNodeRecord,
  FieldNodeRuntime,
} from '@/schema-form/core/engine/record';
import { EMPTY_REVISION_LEDGER } from '@/schema-form/core/engine/record';
import { PathKeyedSet } from '@/schema-form/core/engine/utils/pathIndex/PathKeyedSet';

/** Plain node used to exercise navigation without the later engine class. */
export interface TestNode extends FieldNodeRecord<TestNode> {}

/** Immutable analysis template shared by navigation-only records. */
const analysis = blueprint({ type: 'object' });
/** Root template owned by the fixture's real analysis. */
const template = analysis.root;

/** Create a directly linked current-shape record for navigation tests. */
export const createNode = (
  name: string,
  parent: TestNode | null = null,
  strategy: 'branch' | 'terminal' = 'branch',
  suppliedRuntime?: FieldNodeRuntime<TestNode>,
): TestNode => {
  const runtime: FieldNodeRuntime<TestNode> = suppliedRuntime ??
    parent?.runtime ?? {
      blueprint: analysis,
      diagnostics: { status: 'stable' },
      context: {},
      nodeFactory: (entry, owner, treeRuntime) =>
        createNode(
          'name' in entry ? entry.name : '',
          owner,
          'branch',
          treeRuntime,
        ),
      globalStateCounts: new Map(),
      globalState: {},
      loadSnapshot: undefined,

      misfitPaths: new PathKeyedSet(),
    };
  const escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  const node: TestNode = {
    behavior: {
      interpret: (input) => input,
      assemble: (_record, children) => children,
      project: (_record, value) => value,
      finishInput: () => undefined,
      declareChildren: (record) => record.blueprintNode.childEntries,
      arrange: () => ({ kind: 'noop' }),
      type: 'object',
      strategy,
    },
    runtime,
    blueprintNode: template,
    __parent__: parent,
    get rootNode() {
      return parent?.rootNode ?? this;
    },
    name,
    escapedName,
    path: parent === null ? '' : `${parent.path}/${escapedName}`,
    depth: parent === null ? 0 : parent.depth + 1,
    isRequired: false,
    isNullable: false,
    schemaType: template.schemaType,
    __childrenByName__: strategy === 'branch' ? {} : null,
    children: strategy === 'branch' ? [] : null,
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
    __schema__: { schema: {}, hasTypeConflict: false },
    __state__: {},
    __revisionLedger__: EMPTY_REVISION_LEDGER,
    __isDeliveryInitialized__: false,
    __deliveryChanges__: 0,
    __pendingRevisionMask__: 0,
    isDetached: false,
    isDisposed: false,
    __interactionEpoch__: 0,
  };
  if (parent?.__childrenByName__ !== null && parent !== null) {
    parent.__childrenByName__[name] = node;
    parent.children = [...(parent.children ?? []), node];
  }
  return node;
};
