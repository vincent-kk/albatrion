import type { ReactElement } from 'react';
import { Fragment, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';

import type { FieldInputProps } from '@/schema-form/types';

/** Render an object node's child fields in order. */
export const FieldInputObject = ({
  ChildFields,
}: FieldInputProps<object>): ReactElement => {
  const children = useMemo(() => {
    return ChildFields
      ? map(
          ChildFields,
          (ChildField): ReactElement => <ChildField key={ChildField.key} />,
        )
      : null;
  }, [ChildFields]);

  return <Fragment>{children}</Fragment>;
};
