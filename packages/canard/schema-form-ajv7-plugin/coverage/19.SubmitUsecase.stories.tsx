import { useCallback, useRef, useState } from 'react';

import type {
  FormHandle,
  JsonSchemaError} from '@canard/schema-form';
import {
  Form,
  type JsonSchema,
  ValidationMode,
  isValidationError,
  registerPlugin,
  useFormSubmit,
} from '@canard/schema-form';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

export default {
  title: 'Form/19. SubmitUsecase',
};

export const UseSubmitHandler = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
      },
      age: {
        type: 'number',
      },
    },
    required: ['email', 'password'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  const handleSubmit = useCallback((value?: Record<string, unknown>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('submit', value);
        resolve(void 0);
      }, 1000);
    });
  }, []);

  const refHandle = useRef<FormHandle<typeof jsonSchema, any>>(null);

  const { submit, pending } = useFormSubmit(refHandle);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
        onSubmit={handleSubmit}
      />
      <button
        onClick={async () => {
          try {
            await submit();
          } catch (e) {
            if (isValidationError(e))
              console.log('Error', e.message, e.details);
            refHandle.current?.showError(true);
          }
        }}
        disabled={pending}
      >
        Submit
      </button>
      {pending && <div>Loading...</div>}
    </StoryLayout>
  );
};

export const SubmitOnEnterKey = () => {
  const jsonSchema = {
    type: 'string',
  } satisfies JsonSchema;

  const [value, setValue] = useState<string>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form
        jsonSchema={jsonSchema}
        onChange={setValue}
        onSubmit={(value) => {
          console.log('submit', value);
        }}
      />
    </StoryLayout>
  );
};

export const UseSubmitHandlerWithNoValidation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
      },
      age: {
        type: 'number',
      },
    },
    required: ['email', 'password'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  const handleSubmit = useCallback((value?: Record<string, unknown>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('submit', value);
        resolve(void 0);
      }, 1000);
    });
  }, []);

  const refHandle = useRef<FormHandle<typeof jsonSchema, any>>(null);

  const { submit, pending } = useFormSubmit(refHandle);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
        onSubmit={handleSubmit}
        validationMode={ValidationMode.None}
      />
      <button
        onClick={async () => {
          try {
            await submit();
          } catch (e) {
            if (isValidationError(e))
              console.log('Error', e.message, e.details);
            refHandle.current?.showError(true);
          }
        }}
        disabled={pending}
      >
        Submit
      </button>
      {pending && <div>Loading...</div>}
    </StoryLayout>
  );
};

export const UseSubmitHandlerWithOnRequestValidation = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
      password: {
        type: 'string',
        format: 'password',
        minLength: 8,
        maxLength: 16,
      },
      age: {
        type: 'number',
      },
    },
    required: ['email', 'password'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>();

  const handleSubmit = useCallback((value?: Record<string, unknown>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('submit', value);
        resolve(void 0);
      }, 1000);
    });
  }, []);

  const refHandle = useRef<FormHandle<typeof jsonSchema, any>>(null);

  const { submit, pending } = useFormSubmit(refHandle);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={jsonSchema}
        onChange={setValue}
        onValidate={setErrors}
        onSubmit={handleSubmit}
        validationMode={ValidationMode.OnRequest}
      />
      <button
        onClick={async () => {
          try {
            await submit();
          } catch (e) {
            if (isValidationError(e))
              console.log('Error', e.message, e.details);
            refHandle.current?.showError(true);
          }
        }}
        disabled={pending}
      >
        Submit
      </button>
      {pending && <div>Loading...</div>}
    </StoryLayout>
  );
};
