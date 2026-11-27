import type { ReactElement } from 'react';

import { useConstant, useReference } from '@winglet/react-utils/hook';

import { FieldProxy } from '@/schema-form/components/FieldProxy';
import type { OverridableFieldInputProps } from '@/schema-form/types';

/** Layout components that are fixed for the lifetime of one Form child. */
type Layout = Pick<Parameters<typeof FieldProxy>[0], 'FieldInput' | 'FieldRenderer' | 'Wrapper'>;

/**
 * Render the shared field binding for a declarative Form layout child.
 * @param path - Current lookup path passed to the binding.
 * @param overrides - Live presentation overrides read on every render.
 * @param layout - Components captured on mount to preserve the field's identity.
 * @returns The bound field proxy using the current path and overrides.
 */
export const useLayoutFieldProxy = (
  path: string | undefined,
  overrides: OverridableFieldInputProps,
  layout: Layout,
): ReactElement => {
  const overridePropsRef = useReference(overrides);
  const components = useConstant(layout);
  return <FieldProxy path={path} overridePropsRef={overridePropsRef} {...components} />;
};
