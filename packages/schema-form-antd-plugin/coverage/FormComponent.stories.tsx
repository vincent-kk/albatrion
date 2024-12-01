import React from 'react';

import { Form, FormProvider, type JsonSchema } from '@lumy-pack/schema-form';

import { FormError } from '../src/components/FormError';
import { FormInput } from '../src/components/FormInput';
import { FormLabel } from '../src/components/FormLabel';

export default {
  title: 'FormComponent',
};
const jsonSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 5,
      default: 'TEST',
    },
  },
} satisfies JsonSchema;

export const FormErrorComponent = () => {
  return (
    <FormProvider FormErrorRenderer={FormError}>
      <Form jsonSchema={jsonSchema} showError>
        <Form.Error path="username" />
      </Form>
    </FormProvider>
  );
};

export const FormInputComponent = () => {
  return (
    <FormProvider FormInputRenderer={FormInput}>
      <Form jsonSchema={jsonSchema} showError>
        <Form.Input path="username" />
      </Form>
    </FormProvider>
  );
};

export const FormLabelComponent = () => {
  return (
    <FormProvider FormLabelRenderer={FormLabel}>
      <Form jsonSchema={jsonSchema} showError>
        <Form.Label path="username" />
      </Form>
    </FormProvider>
  );
};
