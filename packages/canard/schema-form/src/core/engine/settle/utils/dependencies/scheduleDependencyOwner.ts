import type { Optional } from '@aileron/declare';

import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';

/**
 * Schedule whoever composes a dependency owner whose read changed.
 * An array item whose changed reads are its own non-membership decisions composes its own
 * schema, so it recomposes alone; every other owner is selected by its parent, whose shape
 * becomes dirty. The registry answers from the item's frame-bound decisions, so a positional
 * owner found by the blueprint index never wheels the array for an item-local decision.
 * @param path - Concrete owner path emitted by a dependency index
 * @param context - Current registration, receiving the dirty shape or own-schema path
 * @param changedAncestors - Strict ancestors of the written paths; undefined without gates
 * @returns Nothing; extends `ownSchemaPaths` or `shapeDirtyPaths`
 */
export const scheduleDependencyOwner = <Self extends FieldNodeRecord<Self>>(
  path: string,
  context: SettlementContext<Self>,
  changedAncestors: Optional<ReadonlySet<string>>,
): void => {
  if (changedAncestors && path) {
    const registry = getGateRegistry(context.root.runtime);
    if (
      registry.mayChangeOwnDeclarationAt(
        path,
        context.changedSource,
        changedAncestors,
      ) &&
      registry.mayChangeOwnSchemaOnlyAt(
        path,
        context.changedSource,
        changedAncestors,
      )
    ) {
      (context.ownSchemaPaths ??= new Set()).add(path);
      return;
    }
  }
  context.shapeDirtyPaths.add(resolvePointer(path, $.Parent));
};
