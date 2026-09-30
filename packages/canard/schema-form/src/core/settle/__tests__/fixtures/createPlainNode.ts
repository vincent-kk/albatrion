import { mergeEffectiveSchema } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import { BEHAVIORS } from '../../../behaviors';
import type { Behavior, SchemaNodeRecord, SchemaNodeRuntime } from '../../../record';

/** Plain record used by settlement tests, without the later SchemaNode class. */
export interface PlainNode extends SchemaNodeRecord<PlainNode> {}

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
  runtime: SchemaNodeRuntime<PlainNode>,
  visits: string[] = [],
): PlainNode => {
  const template = 'node' in entry ? entry.node : entry;
  const name = 'node' in entry ? entry.name : '';
  const escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  if (!row) throw new Error(`Missing behavior for ${template.kind}/${template.strategy}`);
  const behavior: Behavior<PlainNode> = {
    interpret: row.interpret,
    assemble: (node, children) => {
      visits.push(node.path);
      return Reflect.apply(row.assemble, undefined, [node, children]);
    },
    project: (node, local) => Reflect.apply(row.project, undefined, [node, local]),
    finishInput: (node) => Reflect.apply(row.finishInput, undefined, [node]),
    declareChildren: (node) => {
      const entries: readonly BlueprintChildEntry[] = Reflect.apply(
        row.declareChildren, undefined, [node]);
      for (const child of entries) visits.push(`select:${node.path}/${child.name}`);
      return entries;
    },
    type: row.type,
    strategy: row.strategy,
  };
  return {
    behavior, runtime, blueprintNode: template, parent,
    get rootNode() { return parent?.rootNode ?? this; },
    name, escapedName,
    path: parent ? `${parent.path}/${escapedName}` : '',
    depth: parent ? parent.depth + 1 : 0,
    required: false, nullable: template.nullable, schemaType: template.schemaType,
    structure: template.strategy === 'branch' ? {} : null,
    children: template.strategy === 'branch' ? [] : null,
    raw: undefined, extras: undefined, active: true,
    local: undefined, emit: undefined,
    schema: mergeEffectiveSchema(template, [], { mode: 'runtime' }),
    state: {}, revision: 0, detached: false,
  };
};
