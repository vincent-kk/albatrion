import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldInputProps } from '@/schema-form/types';

/**
 * Choose the title a built-in single control references through `aria-labelledby`.
 * @param node - The control's field node.
 * @param labelId - The field's opaque title address.
 * @returns `labelId` for an array item, whose renderer draws a hidden title and no `for` label; otherwise undefined, leaving the name to the `for` label.
 */
export const readArrayItemTitleId = (
  node: FieldInputProps['node'],
  labelId: string,
): string | undefined =>
  node.parentNode != null && isArraySchema(node.parentNode)
    ? labelId
    : undefined;
