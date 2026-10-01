import { blueprint } from '../../../blueprint';
import type { SchemaNodeRecord, SchemaNodeRuntime } from '../../../record';

/** Plain node used to exercise navigation without the later engine class. */
export interface TestNode extends SchemaNodeRecord<TestNode> {}

/** Immutable analysis template shared by navigation-only records. */
const analysis = blueprint({ type: 'object' });
/** Root template owned by the fixture's real analysis. */
const template = analysis.root;

/** Create a directly linked current-shape record for navigation tests. */
export const createNode = (
  name: string,
  parent: TestNode | null = null,
  strategy: 'branch' | 'terminal' = 'branch',
  suppliedRuntime?: SchemaNodeRuntime<TestNode>,
): TestNode => {
  const runtime: SchemaNodeRuntime<TestNode> = suppliedRuntime ??
    parent?.runtime ?? {
      blueprint: analysis,
      ifPredicates: new Map(),
      diagnostics: { status: 'stable' },
      nodeFactory: (entry, owner, treeRuntime) =>
        createNode('name' in entry ? entry.name : '', owner, 'branch', treeRuntime),
      loadSnapshot: undefined,
      latentRaw: new Map(),
      typeMismatchPaths: new Set(),
      inactiveValuesMemo: new Map(),
    };
  const escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  const node: TestNode = {
    behavior: {
      interpret: (input) => input,
      assemble: (_record, children) => children,
      project: (_record, local) => local,
      finishInput: () => undefined,
      declareChildren: (record) => record.blueprintNode.childEntries,
      type: 'object',
      strategy,
    },
    runtime,
    blueprintNode: template,
    parent,
    get rootNode() { return parent?.rootNode ?? this; },
    name,
    escapedName,
    path: parent === null ? '' : `${parent.path}/${escapedName}`,
    depth: parent === null ? 0 : parent.depth + 1,
    required: false,
    nullable: false,
    schemaType: template.schemaType,
    structure: strategy === 'branch' ? {} : null,
    children: strategy === 'branch' ? [] : null,
    raw: undefined,
    extras: undefined,
    active: true,
    visible: true,
    readOnly: false,
    disabled: false,
    local: undefined,
    emit: undefined,
    schema: { schema: {}, typeConflict: false },
    state: {},
    revision: 0,
    detached: false,
  };
  if (parent?.structure !== null && parent !== null) {
    parent.structure[name] = node;
    parent.children = [...(parent.children ?? []), node];
  }
  return node;
};
