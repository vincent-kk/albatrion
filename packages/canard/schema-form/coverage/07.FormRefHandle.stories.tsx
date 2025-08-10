import { useMemo, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
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
      '#/objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, SetValueOption.Overwrite);
        };
        return (
          <div>
            <button onClick={handleClick}>object set</button>
            <button onClick={handleUnsetClick}>object unset</button>
          </div>
        );
      },
      '/textNode': ({ onChange }: FormTypeInputProps) => {
        const handleClick = () => {
          onChange('wow');
        };
        return <button onClick={handleClick}>text set</button>;
      },
      '#/arrayNode/*': () => {
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

export const FormTypeInputArrayTerminalRef = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormTypeInput: ({ node, onChange, value }: FormTypeInputProps<string[]>) => {
          return (
            <div>
              i am array item: {node.group}
              <div>{value?.join(',')}</div>
              <div>
                <button
                  onClick={() => onChange((prev) => [...prev, 'NEW ITEM'])}
                >
                  onChange
                </button>
                <button onClick={() => node.push()}>add</button>
                <button onClick={() => node.update(1, 'WOW2')}>update</button>
                <button onClick={() => node.remove(0)}>remove</button>
                <button onClick={() => node.clear()}>clear</button>
                <button onClick={() => node.setValue(undefined)}>
                  remove all
                </button>
              </div>
            </div>
          );
        },
        items: {
          type: 'string',
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('arr');
          if (node?.type === 'array') {
            node.setValue([1, 2, 3]);
          }
        }}
      >
        set value
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('arr');
          if (node?.type === 'array') {
            node.setValue((prev) => [...(prev || []), 'NEW ITEM']);
          }
        }}
      >
        push value
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('arr');
          if (node?.type === 'array') {
            node.setValue([]);
          }
        }}
      >
        clear
      </button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const FormTypeInputObjectTerminalRef = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        FormTypeInput: ({
          node,
          onChange,
          value,
          defaultValue,
        }: FormTypeInputProps<{
          url: string;
          format: string;
          size: {
            width: number;
            height: number;
          };
        }>) => {
          return (
            <div>
              i am object item: {node.group}
              <div>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
              <div>
                <pre>{JSON.stringify(defaultValue, null, 2)}</pre>
              </div>
              <div>
                <button
                  onClick={() =>
                    onChange({
                      url: 'http://example.com/poster11.jpg',
                      format: 'jpg',
                      size: { width: 100, height: 100 },
                    })
                  }
                >
                  set
                </button>
                <button onClick={() => node.setValue(undefined)}>clear</button>
              </div>
            </div>
          );
        },
        properties: {
          url: {
            type: 'string',
          },
          format: {
            type: 'string',
          },
          size: {
            type: 'object',
            properties: {
              width: {
                type: 'number',
              },
              height: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  } satisfies JsonSchema;
  const formHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <div>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('poster');
          if (node?.type === 'object') {
            node.setValue({
              url: 'http://example.com/poster1.jpg',
              format: 'jpg',
              size: { width: 100, height: 100 },
            });
          }
        }}
      >
        set value
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('poster');
          if (node?.type === 'object') {
            node.setValue((prev) => ({
              ...prev,
              url: 'http://example.com/poster2.jpg',
            }));
          }
        }}
      >
        merge value
      </button>
      <button
        onClick={() =>
          formHandle.current?.node?.find('poster')?.setValue(undefined)
        }
      >
        clear
      </button>
      <hr />
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={formHandle} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const FormRefHandleWithIfThenElse = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',

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
        computed: {
          visible: '../title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        computed: {
          visible: '../title === "wow"',
        },
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
      },
    },
    if: {
      properties: {
        category: {
          enum: ['movie'],
        },
      },
    },
    then: {
      required: ['title', 'openingDate', 'price'],
    },
    else: {
      if: {
        properties: {
          category: {
            enum: ['game'],
          },
        },
      },
      then: {
        required: ['title', 'releaseDate', 'numOfPlayers'],
      },
      else: {
        required: ['title'],
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

export const FormRefHandleWithIfThenElse2 = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['active', 'inactive'] },
      age: { type: 'number' },
    },
    if: {
      properties: {
        status: { enum: ['active'] },
      },
    },
    then: {
      required: ['age'],
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
          formHandle.current?.setValue({ status: 'active', age: 10 })
        }
      >
        set {JSON.stringify({ status: 'active', age: 10 })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ status: 'active', age: 20 })
        }
      >
        set {JSON.stringify({ status: 'active', age: 20 })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ status: 'inactive', age: 10 })
        }
      >
        set {JSON.stringify({ status: 'inactive', age: 10 })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ status: 'inactive', age: 20 })
        }
      >
        set {JSON.stringify({ status: 'inactive', age: 20 })}
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

export const FormRefHandleWithOneOf = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        computed: {
          if: "#/category==='game'",
        },
        properties: {
          price: { type: 'number' },
        },
      },
    ],
    properties: {
      category: {
        type: 'string',
        enum: ['game', 'movie'],
        default: 'game',
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <div>
      <button
        onClick={() =>
          formHandle.current?.setValue({ category: 'game', price: 100 })
        }
      >
        set {JSON.stringify({ category: 'game', price: 100 })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ category: 'game', price: 200 })
        }
      >
        set {JSON.stringify({ category: 'game', price: 200 })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ category: 'movie', price: 300 })
        }
      >
        set {JSON.stringify({ category: 'movie', price: 300 })}
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ category: 'movie', price: 400 })
        }
      >
        set {JSON.stringify({ category: 'movie', price: 400 })}
      </button>
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          jsonSchema={schema}
          onChange={setValue}
          onValidate={setErrors}
          ref={formHandle}
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
            id: { type: 'number', default: 0 },
            name: { type: 'string', default: 'anonymous' },
            email: { type: 'string', default: 'anonymous@example.com' },
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
          const node = formHandle.current?.node?.find('users');
          if (node?.type === 'array') {
            node.setValue([
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
          }
        }}
      >
        set user for array node
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('users');
          if (node?.type === 'array') {
            node.update(0, {
              id: 4,
              name: 'rin',
              email: 'rin@example.com',
            });
          }
        }}
      >
        update user[0]
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('users');
          if (node?.type === 'array') {
            node.push({
              id: ~~(Math.random() * 100),
              name: 'random',
              email: 'random@example.com',
            });
          }
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
          onClick={() => {
            const node = formHandle.current?.node?.find('/startDate');
            if (node?.type === 'string') {
              node.setValue('2025-04-01');
            }
          }}
        >
          startDate "2025-04-01"
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('/startDate');
            if (node?.type === 'string') {
              node.setValue('2025-04-05');
            }
          }}
        >
          startDate "2025-04-05"
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('/endDate');
            if (node?.type === 'string') {
              node.setValue('2025-04-25');
            }
          }}
        >
          endDate '2025-04-25'
        </button>
        <button
          onClick={() => {
            const node = formHandle.current?.node?.find('/endDate');
            if (node?.type === 'string') {
              node.setValue('2025-04-30');
            }
          }}
        >
          endDate '2025-04-30'
        </button>
      </div>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('/period');
          if (node?.type === 'virtual') {
            node.setValue(['2025-03-13', '2025-04-26']);
          }
        }}
      >
        period ['2025-03-13','2025-04-26']
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('/period');
          if (node?.type === 'virtual') {
            node.setValue(['2025-03-01', '2025-04-01']);
          }
        }}
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
      '#/objectNode': ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
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
      '/textNode': ({ onChange }: FormTypeInputProps) => {
        const handleClick = () => {
          onChange('wow');
        };
        return <button onClick={handleClick}>text set</button>;
      },
      '#/arrayNode/*': () => {
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
