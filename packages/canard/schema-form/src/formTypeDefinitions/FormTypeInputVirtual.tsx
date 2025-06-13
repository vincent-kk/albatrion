import { Fragment } from 'react';

import { map } from '@winglet/common-utils/array';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputVirtual = ({
  ChildNodeComponents,
}: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {ChildNodeComponents &&
        map(ChildNodeComponents, (ChildNodeComponent) => (
          <ChildNodeComponent key={ChildNodeComponent.key} />
        ))}
    </Fragment>
  );
};

export const FormTypeInputVirtualDefinition = {
  Component: FormTypeInputVirtual,
  test: { type: 'virtual' },
} satisfies FormTypeInputDefinition;
