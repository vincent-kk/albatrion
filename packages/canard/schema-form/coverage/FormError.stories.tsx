import React, { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeRendererProps,
  type JsonSchema,
  type JsonSchemaError,
  NodeState,
  ShowError,
  ValidationMode,
} from '../src';
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

export const ValidateOnRequest = () => {
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

  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const refHandle = useRef<FormHandle<typeof schema>>(null);

  const handleValidate = () => {
    refHandle.current?.validate();
  };

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => setErrors(errors || [])}
        showError={true}
        validationMode={ValidationMode.OnRequest}
      />
      <button onClick={handleValidate}>Request Validate</button>
    </StoryLayout>
  );
};

export const NoValidate = () => {
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

  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const refHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => setErrors(errors || [])}
        showError={true}
        validationMode={ValidationMode.None}
      />
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
    const {
      [NodeState.Dirty]: dirty,
      [NodeState.Touched]: touched,
      [NodeState.ShowError]: showError,
    } = node.state || {};
    return depth === 0 ? (
      <Input />
    ) : (
      <div style={{ borderBottom: '1px dashed #000', marginTop: 10 }}>
        <label style={{ display: 'flex', gap: 10 }}>
          <span>{name}</span>
          <Input />
          <button
            onClick={() =>
              showError !== true
                ? node.setState({ [NodeState.ShowError]: true })
                : node.setState({ [NodeState.ShowError]: undefined })
            }
          >
            Show Error
          </button>
          <button
            onClick={() =>
              showError !== false
                ? node.setState({ [NodeState.ShowError]: false })
                : node.setState({ [NodeState.ShowError]: undefined })
            }
          >
            Hide Error
          </button>
        </label>
        <pre>{JSON.stringify({ dirty, touched, showError })}</pre>
        <pre>{JSON.stringify(node.errors)}</pre>
        {errorMessage}
      </div>
    );
  };

  const [showError, setShowError] = useState<ShowError | boolean>(
    ShowError.DirtyTouched,
  );

  const refHandle = useRef<FormHandle<typeof jsonSchema>>(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(
                typeof showError === 'number' &&
                showError & ShowError.DirtyTouched
              )
            }
            value={ShowError.DirtyTouched}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.DirtyTouched;
                return e.target.checked
                  ? prev | ShowError.DirtyTouched
                  : prev & ~ShowError.DirtyTouched;
              });
            }}
          />
          DirtyTouched
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Dirty)
            }
            value={ShowError.Dirty}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Dirty;
                return e.target.checked
                  ? prev | ShowError.Dirty
                  : prev & ~ShowError.Dirty;
              });
            }}
          />
          Dirty
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Touched)
            }
            value={ShowError.Touched}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Touched;
                return e.target.checked
                  ? prev | ShowError.Touched
                  : prev & ~ShowError.Touched;
              });
            }}
          />
          Touched
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Always)
            }
            value={ShowError.Always}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Always;
                return e.target.checked
                  ? prev | ShowError.Always
                  : prev & ~ShowError.Always;
              });
            }}
          />
          Always
        </label>
        <label>
          <input
            type="checkbox"
            name="showError"
            checked={
              !!(typeof showError === 'number' && showError & ShowError.Never)
            }
            value={ShowError.Never}
            onChange={(e) => {
              setShowError((prev) => {
                if (typeof prev === 'boolean') return ShowError.Never;
                return e.target.checked
                  ? prev | ShowError.Never
                  : prev & ~ShowError.Never;
              });
            }}
          />
          Never
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
