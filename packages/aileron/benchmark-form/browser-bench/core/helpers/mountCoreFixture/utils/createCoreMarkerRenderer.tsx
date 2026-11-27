import type { ReactNode } from 'react';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Build the input-only renderer that adds one error marker at the measured path.
 * Both engines receive it: the current one as `FieldRenderer`, 0.16.1 as `CustomFormTypeRenderer`;
 * both pass `Input`, `errorMessage` and `node.path` under those names.
 * @param measuredPath - Public path whose field renders `<i data-core-marker data-core-error>`; null renders no marker.
 * @returns A renderer that matches the input-only benchmark DOM everywhere else.
 */
export function createCoreMarkerRenderer(
  measuredPath: string | null,
): (props: FieldRendererProps) => ReactNode {
  return function CoreMarkerRenderer({ Input, errorMessage, node }) {
    if (measuredPath === null || node.path !== measuredPath) return <Input />;
    return (
      <>
        <Input />
        <i data-core-marker="" data-core-error={errorMessage ? '1' : '0'} />
      </>
    );
  };
}
