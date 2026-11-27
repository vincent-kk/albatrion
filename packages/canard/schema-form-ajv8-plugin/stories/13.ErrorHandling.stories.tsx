import { useRef, useState } from 'react';

import {
  ErrorVisibility,
  FieldNodeState,
  type FieldRendererProps,
  Form,
  type FormHandle,
  type JSONSchema,
  type ValidationIssue,
  ValidationMode,
  registerPlugin,
} from '@canard/schema-form';

import { plugin } from '../src/default';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

export default {
  title: 'Form/13. ErrorHandling',
};

export const LiveErrorVisibility = () => {
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
  } satisfies JSONSchema;

  const Renderer = ({
    depth,
    name,
    node,
    Input,
    errorMessage,
  }: FieldRendererProps) => {
    const {
      [FieldNodeState.Edited]: edited,
      [FieldNodeState.Touched]: touched,
      [FieldNodeState.ErrorVisibility]: errorVisibility,
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
              errorVisibility !== true
                ? node.setState({ [FieldNodeState.ErrorVisibility]: true })
                : node.setState({ [FieldNodeState.ErrorVisibility]: undefined })
            }
          >
            Show Error
          </button>
          <button
            onClick={() =>
              errorVisibility !== false
                ? node.setState({ [FieldNodeState.ErrorVisibility]: false })
                : node.setState({ [FieldNodeState.ErrorVisibility]: undefined })
            }
          >
            Hide Error
          </button>
        </label>
        <pre>{JSON.stringify({ edited, touched, errorVisibility })}</pre>
        <pre>{JSON.stringify(node.errors)}</pre>
        {errorMessage}
      </div>
    );
  };

  const [errorVisibility, setErrorVisibility] = useState<ErrorVisibility>(
    ErrorVisibility.AfterEditAndTouch,
  );

  const refHandle = useRef<FormHandle<typeof jsonSchema>>(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        {Object.values(ErrorVisibility).map((policy) => (
          <label key={policy}>
            <input
              type="radio"
              name="errorVisibility"
              checked={errorVisibility === policy}
              value={policy}
              onChange={() => setErrorVisibility(policy)}
            />
            {policy}
          </label>
        ))}
      </div>
      <hr />
      <div>
        <button onClick={() => refHandle.current?.focus('#/name')}>
          focus "#/name"
        </button>
        <button onClick={() => refHandle.current?.select('#/name')}>
          select "#/name"
        </button>
      </div>
      <hr />
      <StoryLayout jsonSchema={jsonSchema}>
        <Form
          ref={refHandle}
          jsonSchema={jsonSchema}
          errorVisibility={errorVisibility}
          FieldRenderer={Renderer}
        />
      </StoryLayout>
    </div>
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
  } satisfies JSONSchema;

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);

  const refHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => setErrors(errors || [])}
        errorVisibility={ErrorVisibility.Always}
        validationMode={ValidationMode.None}
      />
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
  } satisfies JSONSchema;

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);

  const refHandle = useRef<FormHandle<typeof schema>>(null);

  const handleValidate = async () => {
    const errors = await refHandle.current?.validate();
    console.log('handleValidate', errors);
  };

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => setErrors(errors || [])}
        errorVisibility={ErrorVisibility.Always}
        validationMode={ValidationMode.OnRequest}
      />
      <button onClick={handleValidate}>Request Validate</button>
    </StoryLayout>
  );
};

export const ExternalErrors = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 3, default: 'exceed max length' },
      message: { type: 'string', minLength: 3, default: '1' },
    },
  } satisfies JSONSchema;

  const handleChange = (val: any) => {
    setValue(val);
  };

  const [errors, setErrors] = useState<readonly ValidationIssue[]>([
    {
      keyword: 'maxLength',
      dataPath: '/message',
      details: {
        limit: 20,
      },
      message: 'should NOT be longer than 20 characters',
    },
  ]);

  const [_errors, _setErrors] = useState<readonly ValidationIssue[]>([]);
  const refHandle = useRef<FormHandle<typeof schema>>(null);

  const clearErrors = () => {
    setErrors([]);
  };

  const setExternalErrors = () => {
    setErrors([
      {
        keyword: 'wrongInput',
        dataPath: '/name',
        details: {},
        message: 'wrong input',
      },
      {
        keyword: 'unique',
        dataPath: '/message',
        details: {},
        message: 'should be unique',
      },
    ]);
  };

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={_errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={handleChange}
        onValidate={(errors) => _setErrors(errors || [])}
        errors={errors}
        errorVisibility={ErrorVisibility.Always}
      />
      <button onClick={clearErrors}>clear external errors</button>
      <button onClick={setExternalErrors}>set external errors</button>
    </StoryLayout>
  );
};

export const ErrorBoundary = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    },
  } satisfies JSONSchema;

  const defaultValue = useRef<Record<string, any>>({
    allowed: false,
  });

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={defaultValue.current}
        onChange={setValue}
      >
        <div>
          <Form.Field
            path="#/name"
            FieldInput={() => {
              throw new Error('Error accord from Input');
              // eslint-disable-next-line no-unreachable
              return <div>Input</div>;
            }}
          />
        </div>
        <div>
          <Form.Render path="#/age">
            {({ Input, node }) => {
              throw new Error('Error accord from Renderer');
              // eslint-disable-next-line no-unreachable
              return (
                <div>
                  {node.name}
                  <Input />
                </div>
              );
            }}
          </Form.Render>
        </div>
      </Form>
    </StoryLayout>
  );
};
