import { Form, type FormProps, ObjectSchema } from '@lumy-pack/schema-form';

const Root = ({
  jsonSchema,
  defaultValue,
}: FormProps<ObjectSchema, { [key: string]: any }>) => {
  const value = defaultValue;
  return <Form jsonSchema={jsonSchema} />;
};

export default Root;
