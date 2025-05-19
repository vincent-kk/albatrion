import { Fragment } from 'react/jsx-runtime';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputVirtual = ({ ChildNodes }: FormTypeInputProps<object>) => {
  return (
    <Fragment>
      {ChildNodes && map(ChildNodes, (Node) => <Node key={Node.key} />)}
    </Fragment>
  );
};

export const FormTypeInputVirtualDefinition = {
  Component: FormTypeInputVirtual,
  test: { type: 'virtual' },
} satisfies FormTypeInputDefinition;
