import React, {
  ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
} from '@canard/schema-form/src';

import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/02. FormTypeInput',
};
export const FormTypeMap = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
      },
      arrayNode: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '$.objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, { replace: true });
        };
        return (
          <div>
            <button onClick={handleClick}>object set</button>
            <button onClick={handleUnsetClick}>object unset</button>
          </div>
        );
      },
      '$.textNode': ({ onChange }: FormTypeInputProps) => {
        const handleClick = () => {
          onChange('wow');
        };
        return <button onClick={handleClick}>text set</button>;
      },
      '$.arrayNode.#': () => {
        return <div>i am array item</div>;
      },
    };
  }, []);

  const handleChange = (val: any) => {
    setValue(val);
  };
  const refHandle = useRef<FormHandle<typeof schema>>(null);
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};

export const FormTypeMapWithRegex = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      objectNode: {
        type: 'object',
        properties: {
          test1: { type: 'string' },
          _test2: { type: 'string' },
          _test3: { type: 'string' },
          test4: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
      },
      arrayNode: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '_test\\d': ({ onChange }: FormTypeInputProps<string>) => {
        const handleClick = () => {
          onChange('wow');
        };
        const handleUnsetClick = () => {
          onChange(undefined);
        };
        return (
          <div>
            <button onClick={handleClick}>text set</button>
            <button onClick={handleUnsetClick}>text unset</button>
          </div>
        );
      },
      '$.textNode': ({ onChange }: FormTypeInputProps) => {
        const handleClick = () => {
          onChange('wow');
        };
        return <button onClick={handleClick}>text set</button>;
      },
      '$.arrayNode.#': () => {
        return <div>i am array item</div>;
      },
    };
  }, []);

  const handleChange = (val: any) => {
    setValue(val);
  };
  const refHandle = useRef<FormHandle<typeof schema>>(null);
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};

export const FormTypeComponentInJsonSchema = () => {
  const CustomFormTypeStringInput = useCallback(
    ({ defaultValue, onChange }: FormTypeInputProps<string>) => {
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.value);
      };
      return (
        <div>
          <h3>CustomFormTypeStringInput</h3>
          <input
            type="text"
            defaultValue={defaultValue}
            onChange={handleChange}
          />
          <hr />
        </div>
      );
    },
    [],
  );

  const CustomFormTypeNumberInput = useCallback(
    ({ defaultValue, onChange }: FormTypeInputProps<number>) => {
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.valueAsNumber);
      };
      return (
        <div>
          <h3>CustomFormTypeNumberInput</h3>
          <input
            type="number"
            defaultValue={defaultValue}
            onChange={handleChange}
          />
          <hr />
        </div>
      );
    },
    [],
  );
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      nameCustom: {
        type: 'string',
        FormType: CustomFormTypeStringInput,
      },
      age: {
        type: 'number',
      },
      ageCustom: {
        type: 'number',
        FormType: CustomFormTypeNumberInput,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};
