import { Fragment } from 'react/jsx-runtime';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

import { FormError } from './FormError';

export const FormInput = (props: FormTypeRendererProps) => {
  const { Input } = props;

  return (
    <Fragment>
      <div>
        <Input />
      </div>
      <div>
        <FormError {...props} />
      </div>
    </Fragment>
  );
};
