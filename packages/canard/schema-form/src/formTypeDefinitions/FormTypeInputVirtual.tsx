import { Fragment } from 'react/jsx-runtime';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputVirtual = ({ childNodes }: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {childNodes && map(childNodes, (Node) => <Node key={Node.key} />)}
    </Fragment>
  );
};

export const FormTypeInputVirtualDefinition = {
  Component: FormTypeInputVirtual,
  test: { type: 'virtual' },
} satisfies FormTypeInputDefinition;
