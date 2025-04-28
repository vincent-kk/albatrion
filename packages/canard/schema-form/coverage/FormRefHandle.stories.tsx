import React, { useMemo, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
} from '../src';
import type { ArrayNode } from '../src/core/nodes/ArrayNode/ArrayNode';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/07. FormRefHandle',
};

export const FormRefHandle = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      number: {
        type: 'number',
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
    name: 'ron',
    number: 10,
  });

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '$.objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, SetValueOption.Replace);
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

  const formHandle = useRef<
    FormHandle<
      typeof schema,
      {
        name?: string;
        number?: number;
        objectNode?: {
          test?: string;
        };
      }
    >
  >(null);

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <div>
      <button
        onClick={() =>
          formHandle.current?.setValue(
            {
              name: 'harry',
            },
            SetValueOption.Merge,
          )
        }
      >
        set name
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue((prev) => {
            return {
              number: (prev?.number || 0) + 1,
            };
          }, SetValueOption.Merge)
        }
      >
        increase number
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            number: 100,
          })
        }
      >
        overwrite number
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            name: 'new one',
            number: 50,
            objectNode: {
              test: 'new wow',
            },
          })
        }
      >
        set new member
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <button
        onClick={() => {
          formHandle.current?.setValue({ name: 'hermione', number: 12 });
        }}
      >
        change defaultValue
      </button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          formTypeInputMap={formTypeMap}
          onChange={handleChange}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefHandleWithOneOf = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    oneOf: [
      {
        properties: { category: { enum: ['movie'] } },
        required: ['title', 'openingDate', 'price'],
      },
      {
        properties: { category: { enum: ['game'] } },
        required: ['title', 'releaseDate', 'numOfPlayers'],
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
      title: { type: 'string' },
      openingDate: {
        type: 'string',
        format: 'date',
        renderOptions: {
          visible: '@.title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        renderOptions: {
          visible: '@.title === "wow"',
        },
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
      },
    },
  } satisfies JsonSchema;

  const defaultValue = useRef({});

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <div>
      <button
        onClick={() =>
          formHandle.current?.setValue(
            {
              category: 'movie',
            },
            SetValueOption.Merge,
          )
        }
      >
        set category to movie
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue(
            {
              category: 'game',
            },
            SetValueOption.Merge,
          )
        }
      >
        set category to game
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue(
            { category: 'game', title: 'wow' },
            SetValueOption.Merge,
          )
        }
      >
        set {JSON.stringify({ category: 'game', title: 'wow' })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            category: 'movie',
            title: 'wow',
            openingDate: '2025-01-01',
            price: 100,
          })
        }
      >
        set new member
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <button
        onClick={() => {
          formHandle.current?.setValue({
            category: 'game',
            title: 'wow',
          });
        }}
      >
        change defaultValue
      </button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={handleChange}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefHandleWithArray = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  } satisfies JsonSchema;
  const defaultValue = useRef({
    users: [
      {
        id: 1,
        name: 'ron',
        email: 'ron@example.com',
      },
    ],
  });

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <div>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            users: [
              {
                id: 2,
                name: 'harry',
                email: 'harry@example.com',
              },
            ],
          })
        }
      >
        set new user
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue((prev) => {
            return {
              users: [
                ...(prev?.users || []),
                {
                  id: 3,
                  name: 'hermione',
                  email: 'hermione@example.com',
                },
              ],
            };
          }, SetValueOption.Merge)
        }
      >
        set value with function
      </button>
      <button
        onClick={() => {
          (formHandle.current?.node?.find('users') as ArrayNode)?.setValue([
            {
              id: 66,
              name: 'rin',
              email: 'rin@example.com',
            },
            {
              id: 77,
              name: 'momo',
              email: 'momo@example.com',
            },
          ]);
        }}
      >
        set user for array node
      </button>
      <button
        onClick={() => {
          (formHandle.current?.node?.find('users') as ArrayNode)?.update(0, {
            id: 4,
            name: 'rin',
            email: 'rin@example.com',
          });
        }}
      >
        update user[0]
      </button>
      <button
        onClick={() => {
          (formHandle.current?.node?.find('users') as ArrayNode)?.push({
            id: ~~(Math.random() * 100),
            name: 'random',
            email: 'random@example.com',
          });
        }}
      >
        push new user
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          onChange={handleChange}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefHandleWithVirtualSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        format: 'date',
      },
      endDate: {
        type: 'string',
        format: 'date',
      },
    },
    virtual: {
      period: {
        fields: ['startDate', 'endDate'],
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <div>
      <div>
        <button
          onClick={() =>
            formHandle.current?.node.find('.startDate').setValue('2025-04-01')
          }
        >
          startDate "2025-04-01"
        </button>
        <button
          onClick={() =>
            formHandle.current?.node.find('.startDate').setValue('2025-04-05')
          }
        >
          startDate "2025-04-05"
        </button>
        <button
          onClick={() =>
            formHandle.current?.node.find('.endDate').setValue('2025-04-25')
          }
        >
          endDate '2025-04-25'
        </button>
        <button
          onClick={() =>
            formHandle.current?.node.find('.endDate').setValue('2025-04-30')
          }
        >
          endDate '2025-04-30'
        </button>
      </div>
      <button
        onClick={() =>
          formHandle.current?.node
            .find('.period')
            .setValue(['2025-03-13', '2025-04-26'])
        }
      >
        period ['2025-03-13','2025-04-26']
      </button>
      <button
        onClick={() =>
          formHandle.current?.node
            .find('.period')
            .setValue(['2025-03-01', '2025-04-01'])
        }
      >
        period ['2025-03-01','2025-04-01']
      </button>

      <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </StoryLayout>
    </div>
  );
};

export const FormRefHandleWithGetData = () => {
  const [value, setValue] = useState();
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      number: {
        type: 'number',
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
    name: 'ron',
    number: 10,
  });

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '$.objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({});
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

  const formHandle = useRef<
    FormHandle<
      typeof schema,
      {
        name?: string;
        number?: number;
      }
    >
  >(null);

  const handleChange = () => {
    setValue(formHandle.current?.getValue() as any);
  };

  return (
    <div>
      <button onClick={handleChange}>getValue</button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            name: 'harry',
          })
        }
      >
        set name
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue((prev) => {
            return {
              number: (prev?.number || 0) + 1,
            };
          }, SetValueOption.Merge)
        }
      >
        increase number
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            number: 100,
          })
        }
      >
        overwrite number
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <button
        onClick={() => {
          formHandle.current?.setValue({ name: 'hermione', number: 12 });
        }}
      >
        change defaultValue
      </button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          defaultValue={defaultValue.current}
          formTypeInputMap={formTypeMap}
        />
      </StoryLayout>
    </div>
  );
};

export const SetComplexValueWithSetValue = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      number: {
        type: 'number',
      },
      boolean: {
        type: 'boolean',
      },
      array: {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
      },
      object: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      },
      objectArray: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
        minItems: 3,
      },
      null: {
        type: 'null',
        nullable: true,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);
  return (
    <div>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            string: 'default value',
            number: 10,
            boolean: true,
            array: [0, 0],
            object: { name: 'adult', age: 19 },
            objectArray: [
              { name: 'anonymous', age: 0 },
              { name: 'anonymous', age: 0 },
              { name: 'anonymous', age: 0 },
            ],
            null: null,
          })
        }
      >
        set Value
      </button>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
        <Form
          ref={formHandle}
          jsonSchema={jsonSchema}
          onChange={setValue}
          onValidate={setErrors}
        />
      </StoryLayout>
    </div>
  );
};
