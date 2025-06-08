import React, { useEffect, useMemo, useState } from 'react';

import {
  Form,
  type FormTypeInputDefinition,
  type FormTypeInputProps,
  type JsonSchema,
  registerPlugin,
} from '@canard/schema-form';
import { useHandle } from '@winglet/react-utils/hook';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

export default {
  title: 'Form/05. WatchValues',
};

export const Watch = () => {
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'harry' },
          age: { type: 'number', default: 10 },
        },
      },
      greeting: {
        type: 'string',
        formType: 'greeting',
        computed: {
          watch: ['$.profile.name', '$.profile.age', '$.profile'],
        },
      },
    },
  } satisfies JsonSchema;
  const formTypes = useMemo<FormTypeInputDefinition[]>(
    () => [
      {
        test: {
          type: 'string',
          formType: 'greeting',
        },
        Component: ({ watchValues }: FormTypeInputProps) => {
          return (
            <>
              <strong>
                hello '{watchValues[0]}', {watchValues[1]} years old
              </strong>
              <pre>{JSON.stringify(watchValues, null, 2)}</pre>
            </>
          );
        },
      },
    ],
    [],
  );
  const [value, setValue] = useState({});
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        jsonSchema={schema}
        formTypeInputDefinitions={formTypes}
        onChange={setValue}
      />
    </StoryLayout>
  );
};

export const WatchWithBranchNode = () => {
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        FormType: ({
          defaultValue,
          onChange,
        }: FormTypeInputProps<{
          name?: string;
          age?: number;
        }>) => {
          console.log('defaultValue', defaultValue);
          const [name, setName] = useState(() => defaultValue?.name);
          const [age, setAge] = useState(() => defaultValue?.age);
          const handleChange = useHandle(onChange);
          useEffect(() => {
            handleChange({
              name,
              age,
            });
          }, [name, age, handleChange]);
          return (
            <div>
              <div>
                <label>
                  Name:
                  <input
                    type="text"
                    defaultValue={defaultValue?.name}
                    onChange={(e) => {
                      console.log('text onChange', e.target.value);
                      setName(
                        e.target.value.length > 0 ? e.target.value : undefined,
                      );
                    }}
                  />
                </label>
              </div>
              <div>
                <label>
                  Age:
                  <input
                    type="number"
                    defaultValue={defaultValue?.age}
                    onChange={(e) => {
                      console.log('number onChange', e.target.value);
                      setAge(
                        e.target.value.length > 0
                          ? Number(e.target.value)
                          : undefined,
                      );
                    }}
                  />
                </label>
              </div>
            </div>
          );
        },
        properties: {
          name: { type: 'string', default: 'harry' },
          age: { type: 'number', default: 10 },
        },
      },
      greeting: {
        type: 'string',
        formType: 'greeting',
        computed: {
          watch: ['$.profile'],
        },
      },
    },
  } satisfies JsonSchema;
  const formTypes = useMemo<FormTypeInputDefinition[]>(
    () => [
      {
        test: {
          type: 'string',
          formType: 'greeting',
        },
        Component: ({ watchValues }: FormTypeInputProps) => {
          return (
            <>
              <strong>
                hello '{watchValues[0].name}', {watchValues[0].age} years old
              </strong>
              <pre>{JSON.stringify(watchValues[0], null, 2)}</pre>
            </>
          );
        },
      },
    ],
    [],
  );
  const [value, setValue] = useState({});
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        jsonSchema={schema}
        formTypeInputDefinitions={formTypes}
        onChange={setValue}
      />
    </StoryLayout>
  );
};
