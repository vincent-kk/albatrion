import { type ComponentType, useMemo, useRef, useState } from 'react';

import type {
  JsonSchemaError} from '@canard/schema-form';
import {
  Form,
  FormProvider,
  type FormTypeInputDefinition,
  type FormTypeRendererProps,
  type JsonSchema,
  NodeState,
  ValidationMode,
  registerPlugin,
} from '@canard/schema-form';
import Ajv from 'ajv';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

const ajv = new Ajv({
  allErrors: true,
  strictSchema: false,
  validateFormats: false,
});
ajv.addKeyword({
  keyword: 'isEven',
  type: 'number',
  errors: false, // 오류 메시지를 직접 정의하지 않음
  validate: function (schema: boolean, data: number): boolean {
    if (schema === false) return true;
    return data % 2 === 0;
  },
});

plugin.validator.bind(ajv);

registerPlugin(plugin);

export default {
  title: 'Form/14. ExternalProvider',
};

export const ExternalFormContext = () => {
  const externalInputs = useMemo<FormTypeInputDefinition[]>(() => {
    return [
      {
        test: {
          formType: 'external-input1',
        },
        Component: () => {
          return <div>external input 1</div>;
        },
      },
      {
        test: {
          formType: 'external-input2',
        },
        Component: () => {
          return <div>external input 2</div>;
        },
      },
    ];
  }, []);

  const externalFormTypeRenderer = useMemo<
    ComponentType<FormTypeRendererProps>
  >(() => {
    return ({ name, Input, errorMessage }: FormTypeRendererProps) => (
      <div style={{ border: '1px solid red', padding: 5 }}>
        {name}
        <Input />
        <em>{errorMessage}</em>
      </div>
    );
  }, []);

  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      number: {
        type: 'number',
        formType: 'external-input1',
      },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
        formType: 'external-input2',
      },
    },
  } satisfies JsonSchema;
  const defaultValue = useRef({
    name: 'ron',
    number: 10,
  });

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <FormProvider
      formTypeInputDefinitions={externalInputs}
      FormGroupRenderer={externalFormTypeRenderer}
    >
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={handleChange}
        />
      </StoryLayout>
    </FormProvider>
  );
};

export const ExternalFormContextWithUserDefinedContext = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      number: {
        type: 'number',
        formType: 'external-input1',
      },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
        formType: 'external-input2',
      },
    },
  } satisfies JsonSchema;
  const defaultValue = useRef({
    name: 'ron',
    number: 10,
  });

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <FormProvider
      context={{
        theme: 'dark',
      }}
    >
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={handleChange}
          context={{
            theme: 'light',
          }}
        />
      </StoryLayout>
    </FormProvider>
  );
};

export const ExternalFormContextConfig = () => {
  const externalFormTypeRenderer = useMemo<
    ComponentType<FormTypeRendererProps>
  >(() => {
    return ({ name, node, Input, errorMessage }: FormTypeRendererProps) => (
      <div style={{ border: '1px solid red', padding: 5 }}>
        {name}
        <Input />
        <button
          onClick={() => {
            node?.validate();
            node?.setState({ [NodeState.ShowError]: true });
          }}
        >
          validate
        </button>
        <em>{errorMessage}</em>
      </div>
    );
  }, []);

  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 5 },
      number: {
        type: 'number',
        maximum: 5,
      },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      },
    },
  } satisfies JsonSchema;
  const defaultValue = useRef({
    name: 'ron wizzly',
    number: 10,
  });

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <FormProvider
      FormGroupRenderer={externalFormTypeRenderer}
      showError={false}
      validationMode={ValidationMode.OnRequest}
    >
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={handleChange}
          onValidate={setErrors}
        />
      </StoryLayout>
    </FormProvider>
  );
};

export const ExternalFormContextAjv = () => {
  const externalFormTypeRenderer = useMemo<
    ComponentType<FormTypeRendererProps>
  >(() => {
    return ({ name, node, Input, errorMessage }: FormTypeRendererProps) => (
      <div style={{ border: '1px solid red', padding: 5 }}>
        {name}
        <Input />
        <button
          onClick={() => {
            node?.validate();
            node?.setState({ [NodeState.ShowError]: true });
          }}
        >
          validate
        </button>
        <em>{errorMessage}</em>
      </div>
    );
  }, []);

  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 1 },
      number: { type: 'number', isEven: true, maximum: 5 },
    },
  } satisfies JsonSchema;
  const defaultValue = useRef({
    name: 'ron',
    number: 10,
  });

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <FormProvider
      FormGroupRenderer={externalFormTypeRenderer}
      showError={false}
      validationMode={ValidationMode.OnRequest}
    >
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={handleChange}
          onValidate={setErrors}
        />
      </StoryLayout>
    </FormProvider>
  );
};
