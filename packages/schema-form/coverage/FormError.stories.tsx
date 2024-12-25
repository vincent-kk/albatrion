import React, { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JsonSchema,
  type JsonSchemaError,
  ShowError,
} from '@canard/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/08. FormError',
};

export const Errors = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 3, default: 'exceed max length' },
      message: { type: 'string', minLength: 3, default: '1' },
    },
  } satisfies JsonSchema;

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<JsonSchemaError[]>([
    {
      keyword: 'maxLength',
      dataPath: '.message',
      instancePath: '/message',
      schemaPath: '#/properties/message/maxLength',
      params: {
        limit: 20,
      },
      message: 'should NOT be longer than 20 characters',
    },
  ]);

  const [_errors, _setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle = useRef<FormHandle<typeof schema>>(null);

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={_errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => _setErrors(errors || [])}
        errors={errors}
        showError={true}
      />
      <button onClick={clearErrors}>clear received errors</button>
    </StoryLayout>
  );
};

export const DirtyTouched = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['Y', 'N'],
      },
      name: {
        type: 'string',
        minLength: 5,
        default: 'TEST',
      },
      email: {
        type: 'string',
        maxLength: 10,
      },
    },
  } satisfies JsonSchema;

  const Renderer = ({
    depth,
    name,
    node,
    Input,
    errorMessage,
  }: FormTypeRendererProps) => {
    const { [ShowError.Dirty]: dirty, [ShowError.Touched]: touched } =
      node.state || {};
    return depth === 0 ? (
      <Input />
    ) : (
      <div style={{ borderBottom: '1px dashed #000', marginTop: 10 }}>
        <label style={{ display: 'flex', gap: 10 }}>
          <span>{name}</span>
          <Input />
        </label>
        <pre>{JSON.stringify({ dirty, touched })}</pre>
        <pre>{JSON.stringify(node.errors || [])}</pre>
        {errorMessage}
      </div>
    );
  };

  const [showError, setShowError] = useState<ShowError | boolean>(
    ShowError.Dirty | ShowError.Touched,
  );

  const refHandle = useRef<FormHandle<typeof jsonSchema>>(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === (ShowError.Touched | ShowError.Dirty)}
            value={ShowError.Touched | ShowError.Dirty}
            onChange={() => setShowError(ShowError.Touched | ShowError.Dirty)}
          />
          Touched+Dirty
        </label>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === ShowError.Dirty}
            value={ShowError.Dirty}
            onChange={() => setShowError(ShowError.Dirty)}
          />
          Dirty
        </label>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === ShowError.Touched}
            value={ShowError.Touched}
            onChange={() => setShowError(ShowError.Touched)}
          />
          Touched
        </label>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === true}
            value={'true'}
            onChange={() => setShowError(true)}
          />
          true
        </label>
        <label>
          <input
            type="radio"
            name="showError"
            checked={showError === false}
            value={'false'}
            onChange={() => setShowError(false)}
          />
          false
        </label>
      </div>
      <hr />
      <div>
        <button onClick={() => refHandle.current?.focus('.name')}>
          focus ".name"
        </button>
        <button onClick={() => refHandle.current?.select('.name')}>
          select ".name"
        </button>
      </div>
      <hr />
      <StoryLayout jsonSchema={jsonSchema}>
        <Form
          key={`${showError}`}
          ref={refHandle}
          jsonSchema={jsonSchema}
          showError={showError}
          CustomFormTypeRenderer={Renderer}
        />
      </StoryLayout>
    </div>
  );
};
