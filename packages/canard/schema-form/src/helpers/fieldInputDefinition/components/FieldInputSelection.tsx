import { useInsertionEffect } from 'react';

import type { FieldInputBindingProps } from '../type';

/**
 * Commit before the following input subtree so even keyed layout cleanup is retired.
 * @param props - Selection token owned by the current input binding.
 * @returns No DOM; sibling order determines cleanup precedence.
 */
export const FieldInputSelection = ({
  selection,
}: {
  selection: FieldInputBindingProps['inputSelection'];
}) => {
  useInsertionEffect(() => {
    selection.active = true;
    return () => {
      selection.active = false;
    };
  }, [selection]);
  return null;
};
