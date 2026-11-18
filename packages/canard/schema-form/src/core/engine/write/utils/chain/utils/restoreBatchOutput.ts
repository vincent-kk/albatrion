import type { FieldNodeRecord } from '../../../../record';
import { sameValue } from '../../../../utils/compute/sameValue';

/** Restore emitted references after equality has established the whole subtree's content. */
const restore = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
): void => {
  node.storedOutputValue = value;
  if (value === null || typeof value !== 'object') return;
  for (const child of node.children ?? [])
    if (Object.prototype.hasOwnProperty.call(value, child.name))
      restore(child, Reflect.get(value, child.name));
};

/**
 * Preserve the pre-batch output when structural operations return to equal content.
 * @param root - Current root after the outer batch has settled every marked write.
 * @param initial - Output retained by the enclosing delivery chain.
 * @returns Nothing; item identities and interaction state remain sequential.
 */
export const restoreBatchOutput = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  initial: unknown,
): void => {
  if (sameValue(root.storedOutputValue, initial)) restore(root, initial);
};
