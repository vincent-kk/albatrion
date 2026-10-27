import type { FieldNodeRuntime } from '../../../record';

/**
 * Select one form's source representation from its fixed template facts.
 * @param runtime - Tree-local mode and finite root blueprint chosen at construction
 * @returns Whether the form uses slots; literal-star forms retain latent semantics
 */
export const isSlotEligible = (
  runtime: Pick<FieldNodeRuntime<never>, 'slots' | 'blueprint'>,
): boolean =>
  runtime.slots !== 'off' &&
  runtime.blueprint.root.containsLiteralStar !== true;
