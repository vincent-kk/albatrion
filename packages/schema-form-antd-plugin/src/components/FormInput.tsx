import { Flex } from 'antd';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

import { FormError } from './FormError';

export const FormInput = (props: FormTypeRendererProps) => {
  const { Input } = props;

  return (
    <Flex vertical>
      <Input />
      <FormError {...props} />
    </Flex>
  );
};
