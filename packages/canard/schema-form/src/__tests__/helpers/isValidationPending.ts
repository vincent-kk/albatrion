import type { FieldNode } from '../../core';
import { readFieldNodeRuntime } from './readFieldNodeRuntime';

/** Read write-validation state for consumer verification only.
 * @param node - Current or retired public occurrence.
 * @returns Whether its root owes a write verdict. */
export const isValidationPending = (node: FieldNode): boolean =>
  !!readFieldNodeRuntime(node).validationPending;
