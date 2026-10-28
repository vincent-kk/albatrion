import { isArray } from '@winglet/common-utils/filter';

import {
  getChildPointer,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';

/**
 * Preserve a caller-authored JSON value over the exit's default resolver.
 * @param node - Configured departing occurrence
 * @param exit - Outermost subtree leaving in this call
 * @param context - Original caller input and batch origin boundaries
 * @returns Whether the closing write explicitly supplied this value
 */
export const hasExplicitInactiveValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  exit: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (
    context.kind === 'automatic' ||
    !context.writtenInputs.has(context.target)
  )
    return false;
  const lineage: Self[] = [];
  let ancestor: Self | null = node;
  for (; ancestor && ancestor !== context.target; ancestor = ancestor.parent)
    lineage.push(ancestor);
  if (!ancestor) return false;
  let input = context.writtenInputs.get(context.target);
  for (let index = lineage.length; index >= 0; index--) {
    const current = index === lineage.length ? context.target : lineage[index];
    if (current.depth >= exit.depth) {
      const source = readCallerOrigin(context, current.path);
      if (
        source !== undefined &&
        source !== 'automatic' &&
        (current === node ||
          source !== 'callerPartial' ||
          input === null ||
          typeof input !== 'object' ||
          isArray(input))
      )
        return true;
    }
    if (index === 0) break;
    const child = lineage[index - 1];
    if (!hasDistributedChildInput(input, child.name, isArray(input)))
      return false;
    input = Reflect.get(input, child.name);
  }
  return false;
};

/**
 * Read the last caller origin covering one explicit input position.
 * @param context - Call-ordered batch origins or a single caller write
 * @param inputPath - Canonical address of this JSON position
 * @returns Origin kind, or undefined outside every marked batch scope
 */
const readCallerOrigin = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  inputPath: string,
): FieldNodeWriteKind | undefined => {
  if (!context.writeOrigins) return context.source ?? context.kind;
  for (let index = context.writeOrigins.length - 1; index >= 0; index--) {
    const origin = context.writeOrigins[index];
    const path =
      origin.fields?.find(
        (field) => inputPath === field || isDescendantPath(inputPath, field),
      ) ?? origin.path;
    if (inputPath !== path && !isDescendantPath(inputPath, path)) continue;
    if (origin.keys && inputPath !== path) {
      const child = getChildPointer(inputPath, path);
      const name =
        child === undefined ? undefined : readPointerSegment(child, -1);
      if (typeof name !== 'string' || !origin.keys.includes(name)) continue;
    }
    return origin.source;
  }
  return undefined;
};
