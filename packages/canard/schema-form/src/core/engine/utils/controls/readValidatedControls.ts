import type { Optional } from '@aileron/declare';

import type { SchemaControls } from '../../types/controls';

/** Load validation also accepts a scalar watch path, independently of the authored array type. */
export type ValidatedControls = Omit<SchemaControls<unknown>, 'watch'> & {
  watch?: string | readonly string[];
};

/**
 * Read controls after declaration validation, without copying or rechecking their shape.
 * @param schema - A validated declaration or its effective projection; boolean schemas have no controls.
 * @returns Its existing control envelope, or undefined when absent.
 */
export const readValidatedControls = (
  schema: { readonly controls?: ValidatedControls } | boolean,
): Optional<ValidatedControls> =>
  typeof schema === 'object' ? schema.controls : undefined;
