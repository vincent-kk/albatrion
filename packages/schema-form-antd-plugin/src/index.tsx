import { Form } from '@lumy-pack/schema-form';

const Root = ({ schema }: { schema: any }) => {
  return (
    <Form
      schema={{
        type: 'object',
        properties: schema.properties,
      }}
    />
  );
};

export default Root;
