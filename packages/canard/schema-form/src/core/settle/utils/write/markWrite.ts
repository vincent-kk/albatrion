import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { staticSpec } from './staticSpec';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Store the original write and static interpretation before gate calculation.
 * @param node - Caller target or a descendant reached by a whole replacement
 * @param input - Value owned by this node in the incoming write
 * @param context - Work list recording changed raw paths
 * @returns Nothing; only raw and extras state may change here
 */
export const markWrite = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  input: unknown,
  context: SettlementContext<Self>,
): void => {
  const interpreted = node.behavior.interpret(
    input,
    staticSpec(node.schemaType, node.nullable),
  );
  const rawChanged = !Object.is(node.raw, interpreted);
  if (rawChanged) {
    node.raw = interpreted;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
  }
  context.dirtyPaths.add(node.path);
  if (node.behavior.strategy !== 'branch' || node.structure === null) return;
  const source = interpreted !== null && typeof interpreted === 'object' &&
    !Array.isArray(interpreted) ? interpreted : undefined;
  if (rawChanged && source) {
    const extras = Object.fromEntries(Object.entries(source).filter(([name]) =>
      !node.blueprintNode.childEntries.some((entry) => entry.name === name)));
    node.extras = Object.keys(extras).length ? extras : undefined;
  } else if (rawChanged) node.extras = undefined;
  const names = Object.keys(node.structure);
  if (context.kind !== 'callerReplace' && context.kind !== 'load') return;
  for (const name of names)
    markWrite(node.structure[name], source && hasOwnProperty(source, name) ?
      Reflect.get(source, name) : undefined, context);
};
