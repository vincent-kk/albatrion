import { Flex } from 'antd';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormInput = ({ Input, errorMessage }: FormTypeRendererProps) => {
  return (
    <Flex vertical>
      <Input />
      {errorMessage}
    </Flex>
  );
};
