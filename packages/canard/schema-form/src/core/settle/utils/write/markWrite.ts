import type { SchemaNodeRecord, UnionSpec } from '../../../record';
import type { SettlementContext } from '../../type';
import { staticSpec } from './staticSpec';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/** Whether a value can merge by named keys without changing the host kind. */
const isPlain = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

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
  spec: UnionSpec = staticSpec(node.schemaType, node.nullable),
): void => {
  if (context.loadScope) context.entered.add(node);
  if (context.kind === 'load') context.changedNodes.add(node);
  if (context.kind === 'load' && node.behavior.strategy === 'branch')
    context.shapeDirtyPaths.add(node.path);
  const isMerge = context.kind === 'callerPartial' && !context.automatic;
  const sourceInput = isMerge && isPlain(input) && isPlain(node.raw) &&
    node.behavior.strategy === 'branch' ? { ...node.raw, ...input } : input;
  if (!context.automatic) context.writtenInputs.set(node, input);
  else context.automaticLog.push({ node, previousRaw: node.raw,
    previousExtras: node.extras });
  const interpreted = node.behavior.interpret(
    sourceInput,
    spec,
  );
  const rawChanged = !Object.is(node.raw, interpreted);
  if (rawChanged) {
    node.raw = interpreted;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
    if (node.behavior.strategy === 'branch')
      context.shapeDirtyPaths.add(node.path);
  }
  if (context.automatic && rawChanged) context.automaticChanged = true;
  context.dirtyPaths.add(node.path);
  if (node.behavior.strategy !== 'branch' || node.structure === null) return;
  const source = isPlain(interpreted) ? interpreted : undefined;
  const previousExtras = node.extras;
  if (rawChanged && source) {
    const declaredNames = new Set(node.blueprintNode.childEntries.map((entry) => entry.name));
    const extras = Object.fromEntries(Object.entries(source).filter(([name]) =>
      !declaredNames.has(name)));
    node.extras = Object.keys(extras).length ? extras : undefined;
  } else if (rawChanged) node.extras = undefined;
  if (context.automatic && !Object.is(previousExtras, node.extras))
    context.automaticChanged = true;
  const names = Object.keys(node.structure);
  if (context.kind === 'input' && !context.automatic) return;
  for (const name of names)
    if (!isMerge || !source || hasOwnProperty(input, name))
      markWrite(node.structure[name], source && hasOwnProperty(source, name) ?
        Reflect.get(source, name) : undefined, context);
};
