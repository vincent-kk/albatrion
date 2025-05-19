import { useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputObject = ({ ChildNodes }: FormTypeInputProps<object>) => {
  const children = useMemo(() => {
    return ChildNodes
      ? map(ChildNodes, (Node, index) => {
          return <Node key={Node.key || index} />;
        })
      : null;
  }, [ChildNodes]);

  return <Fragment>{children}</Fragment>;
};

export const FormTypeInputObjectDefinition = {
  Component: FormTypeInputObject,
  test: { type: 'object' },
} satisfies FormTypeInputDefinition;
