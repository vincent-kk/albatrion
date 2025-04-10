import { useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputObject = ({ childNodes }: FormTypeInputProps<object>) => {
  const children = useMemo(() => {
    return childNodes
      ? map(childNodes, (Node, index) => {
          return <Node key={Node.key || index} />;
        })
      : null;
  }, [childNodes]);

  return <Fragment>{children}</Fragment>;
};

export const FormTypeInputObjectDefinition = {
  Component: FormTypeInputObject,
  test: { type: 'object' },
} satisfies FormTypeInputDefinition;
