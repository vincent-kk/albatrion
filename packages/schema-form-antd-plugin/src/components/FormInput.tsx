import { Flex } from 'antd';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

export const FormInput = ({ Input, errorMessage }: FormTypeRendererProps) => {
  return (
    <Flex vertical>
      <Input />
      {errorMessage}
    </Flex>
  );
};
