import {
  type FieldNode,
  readFieldNodeValidationEpoch,
} from '@/schema-form/core';

import type { RootLoad } from '../type';
import { reportLoadValidationFailure } from './reportLoadValidationFailure';

/** Start the load verdict without recapturing an engine-reported failure.
 * @param root - Current committed root.
 * @param load - Load captured by the slot; retirement, root replacement or a mode transition suppresses its late host report.
 * @returns Nothing; ordinary supersession and same-root reset retain reporting on the same root and epoch. */
export const validateLoadRoot = (root: FieldNode, load: RootLoad): void => {
  const epoch = readFieldNodeValidationEpoch(root);
  void root.validate().catch((failure: unknown) => {
    if (
      !load.retired &&
      load.root === root &&
      readFieldNodeValidationEpoch(root) === epoch
    )
      reportLoadValidationFailure(failure);
  });
};
