import { Fragment, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputObject = ({
  ChildNodeComponents,
}: FormTypeInputProps<object>) => {
  const children = useMemo(() => {
    return ChildNodeComponents
      ? map(ChildNodeComponents, (ChildNodeComponent, index) => (
          <ChildNodeComponent key={ChildNodeComponent.key || index} />
        ))
      : null;
  }, [ChildNodeComponents]);

  return <Fragment>{children}</Fragment>;
};

export const FormTypeInputObjectDefinition = {
  Component: FormTypeInputObject,
  test: { type: 'object' },
} satisfies FormTypeInputDefinition;
