import type { ReactElement } from 'react';
import { Fragment } from 'react';

import { map } from '@winglet/common-utils/array';

import type { FieldInputProps } from '@/schema-form/types';

/** Render a virtual node's referenced child fields in order. */
export const FieldInputVirtual = ({
  ChildFields,
}: FieldInputProps<object>): ReactElement => {
  return (
    <Fragment>
      {ChildFields &&
        map(
          ChildFields,
          (ChildField): ReactElement => <ChildField key={ChildField.key} />,
        )}
    </Fragment>
  );
};
