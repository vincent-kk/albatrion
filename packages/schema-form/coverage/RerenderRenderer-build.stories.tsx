import React from 'react';

import { Form, FormProvider, type JsonSchema } from '@lumy-pack/schema-form';

import {
  FormErrorRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '../src/components/FallbackComponents';

export default {
  title: 'Bug Report Build/01. RerenderRenderer',
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

export const ShowFormLabelOnly = () => {
  return (
    <FormProvider FormLabelRenderer={FormLabelRenderer}>
      <Form jsonSchema={jsonSchema}>
        <Form.Label path="$.username" />
      </Form>
    </FormProvider>
  );
};

export const ShowFormErrorOnly = () => {
  return (
    <FormProvider FormErrorRenderer={FormErrorRenderer}>
      <Form jsonSchema={jsonSchema} showError={true}>
        <Form.Error path="username" />
      </Form>
    </FormProvider>
  );
};

export const ShowFormInputOnly = () => {
  return (
    <FormProvider FormInputRenderer={FormInputRenderer}>
      <Form jsonSchema={jsonSchema} showError={true}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Form.Input path="username" />
          <Form.Error path="username" />
        </div>
      </Form>
    </FormProvider>
  );
};
