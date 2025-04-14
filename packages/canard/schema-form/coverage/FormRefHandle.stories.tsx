import React, { useMemo, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  SetStateOption,
} from '../src';
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
          onChange({}, SetStateOption.Replace);
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
            SetStateOption.Propagate,
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
          }, SetStateOption.Propagate)
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
          formHandle.current?.reset({ name: 'hermione', number: 12 });
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
            SetStateOption.Propagate,
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
            SetStateOption.Propagate,
          )
        }
      >
        set category to game
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue(
            { category: 'game', title: 'wow' },
            SetStateOption.Propagate,
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
          formHandle.current?.reset({
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
          }, SetStateOption.Propagate)
        }
      >
        set value with function
      </button>
      <button
        onClick={() => {
          formHandle.current?.node.findNode('users').setValue([
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
          formHandle.current?.node.findNode('users').update(0, {
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
          formHandle.current?.node.findNode('users').push({
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
    setValue(formHandle.current?.getValue());
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
          }, SetStateOption.Propagate)
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
          formHandle.current?.reset({ name: 'hermione', number: 12 });
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
