import { useMemo, useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { ObjectNode } from '@/schema-form/core/nodes/ObjectNode';

import {
  Form,
  type FormHandle,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  SetValueOption,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

const meta: Meta = {
  title: 'Form/07. FormRefHandle',
};
export default meta;

type Story = StoryObj;

const FormRefHandleComponent = () => {
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

export const FormRefHandle: Story = {
  render: () => <FormRefHandleComponent />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('초기 렌더링 - 기본값 확인', async () => {
      await waitFor(() => {
        expect(canvas.getByText(/"name": "ron"/)).toBeInTheDocument();
        expect(canvas.getByText(/"number": 10/)).toBeInTheDocument();
      });
    });

    await step('set name 버튼 클릭 → name이 harry로 변경', async () => {
      const setNameButton = canvas.getByRole('button', { name: 'set name' });
      await userEvent.click(setNameButton);

      await waitFor(() => {
        expect(canvas.getByText(/"name": "harry"/)).toBeInTheDocument();
      });
    });

    await step('increase number 버튼 클릭 → number가 11로 증가', async () => {
      const increaseButton = canvas.getByRole('button', {
        name: 'increase number',
      });
      await userEvent.click(increaseButton);

      await waitFor(() => {
        expect(canvas.getByText(/"number": 11/)).toBeInTheDocument();
      });
    });

    await step('reset 버튼 클릭 → 기본값으로 복원', async () => {
      const resetButton = canvas.getByRole('button', { name: 'reset' });
      await userEvent.click(resetButton);

      await waitFor(() => {
        expect(canvas.getByText(/"name": "ron"/)).toBeInTheDocument();
        expect(canvas.getByText(/"number": 10/)).toBeInTheDocument();
      });
    });

    await step('overwrite number 버튼 클릭 → number가 100으로 덮어쓰기', async () => {
      const overwriteButton = canvas.getByRole('button', {
        name: 'overwrite number',
      });
      await userEvent.click(overwriteButton);

      await waitFor(() => {
        expect(canvas.getByText(/"number": 100/)).toBeInTheDocument();
      });
    });
  },
};

const FormTypeInputArrayTerminalRefComponent = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormTypeInput: ({
          node,
          onChange,
          value,
        }: FormTypeInputProps<string[]>) => {
          return (
            <div>
              i am array item: {node.group}
              <div>{value?.join(',')}</div>
              <div>
                <button
                  onClick={() =>
                    onChange((prev) => [...(prev || []), 'NEW ITEM'])
                  }
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

export const FormTypeInputArrayTerminalRef: Story = {
  render: () => <FormTypeInputArrayTerminalRefComponent />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('set value 버튼 → 배열에 [1,2,3] 설정', async () => {
      const setValueButton = canvas.getByRole('button', { name: 'set value' });
      await userEvent.click(setValueButton);

      await waitFor(() => {
        expect(canvas.getByText(/"arr":/)).toBeInTheDocument();
        expect(canvas.getByText(/1/)).toBeInTheDocument();
        expect(canvas.getByText(/2/)).toBeInTheDocument();
        expect(canvas.getByText(/3/)).toBeInTheDocument();
      });
    });

    await step('push value 버튼 → 배열에 NEW ITEM 추가', async () => {
      const pushButton = canvas.getByRole('button', { name: 'push value' });
      await userEvent.click(pushButton);

      await waitFor(() => {
        expect(canvas.getByText(/NEW ITEM/)).toBeInTheDocument();
      });
    });

    await step('clear 버튼 → 배열 비우기', async () => {
      const clearButton = canvas.getByRole('button', { name: 'clear' });
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(canvas.getByText(/"arr": \[\]/)).toBeInTheDocument();
      });
    });
  },
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

const FormRefHandleWithIfThenElseComponent = () => {
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
          active: '../title === "wow"',
        },
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        computed: {
          active: '../title === "wow"',
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
      required: ['openingDate', 'price'],
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
        required: ['releaseDate', 'numOfPlayers'],
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

export const FormRefHandleWithIfThenElse: Story = {
  render: () => <FormRefHandleWithIfThenElseComponent />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('초기 렌더링 - category 기본값 game 확인', async () => {
      await waitFor(() => {
        expect(canvas.getByText(/"category": "game"/)).toBeInTheDocument();
      });
    });

    await step('set category to movie 버튼 클릭 → category가 movie로 변경', async () => {
      const movieButton = canvas.getByRole('button', {
        name: 'set category to movie',
      });
      await userEvent.click(movieButton);

      await waitFor(() => {
        expect(canvas.getByText(/"category": "movie"/)).toBeInTheDocument();
      });
    });

    await step('set category to game 버튼 클릭 → category가 game으로 변경', async () => {
      const gameButton = canvas.getByRole('button', {
        name: 'set category to game',
      });
      await userEvent.click(gameButton);

      await waitFor(() => {
        expect(canvas.getByText(/"category": "game"/)).toBeInTheDocument();
      });
    });

    await step('set new member 버튼 클릭 → 여러 필드 동시 설정', async () => {
      const setNewMemberButton = canvas.getByRole('button', {
        name: 'set new member',
      });
      await userEvent.click(setNewMemberButton);

      await waitFor(() => {
        expect(canvas.getByText(/"category": "movie"/)).toBeInTheDocument();
        expect(canvas.getByText(/"title": "wow"/)).toBeInTheDocument();
        expect(canvas.getByText(/"openingDate": "2025-01-01"/)).toBeInTheDocument();
        expect(canvas.getByText(/"price": 100/)).toBeInTheDocument();
      });
    });

    await step('reset 버튼 클릭 → 초기 상태로 복원', async () => {
      const resetButton = canvas.getByRole('button', { name: 'reset' });
      await userEvent.click(resetButton);

      await waitFor(() => {
        expect(canvas.getByText(/"category": "game"/)).toBeInTheDocument();
      });
    });
  },
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
          if: "#/category === 'game'",
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
            node.setValue([undefined, '2025-04-26']);
          }
        }}
      >
        period [undefined,'2025-04-26']
      </button>
      <button
        onClick={() => {
          const node = formHandle.current?.node?.find('/endDate');
          if (node?.type === 'string') {
            node.setValue(undefined);
          }
        }}
      >
        remove endDate
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

export const FormRefHandleWithBigSchema = () => {
  const jsonSchema = {
    title: 'E-commerce Platform Data Schema',
    description: '전자상거래 플랫폼의 종합적인 데이터 구조 - 6레벨 깊이',
    type: 'object',
    additionalProperties: false,
    required: ['marketplace', 'analytics', 'system'],
    properties: {
      // 레벨 1: 마켓플레이스 데이터
      marketplace: {
        type: 'object',
        description: '마켓플레이스 전체 정보',
        additionalProperties: false,
        required: ['stores', 'categories', 'campaigns'],
        properties: {
          // 레벨 2: 스토어들
          stores: {
            type: 'array',
            description: '플랫폼 내 스토어 목록',
            minItems: 1,
            items: {
              type: 'object',
              description: '개별 스토어 정보',
              additionalProperties: false,
              required: ['storeId', 'storeName', 'owner', 'products'],
              properties: {
                storeId: {
                  type: 'string',
                  format: 'uuid',
                  default: '550e8400-e29b-41d4-a716-446655440000',
                },
                storeName: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 100,
                  default: 'Amazing Electronics Store',
                },
                owner: {
                  type: 'object',
                  description: '스토어 소유자 정보',
                  additionalProperties: false,
                  required: ['ownerId', 'contactInfo'],
                  properties: {
                    ownerId: {
                      type: 'string',
                      format: 'uuid',
                      default: '660e8400-e29b-41d4-a716-446655440000',
                    },
                    contactInfo: {
                      type: 'object',
                      description: '연락처 정보',
                      additionalProperties: false,
                      required: ['email', 'phones'],
                      properties: {
                        email: {
                          type: 'string',
                          format: 'email',
                          default: 'owner@store.com',
                        },
                        phones: {
                          type: 'array',
                          description: '전화번호 목록',
                          minItems: 1,
                          items: {
                            type: 'object',
                            description: '전화번호 정보',
                            additionalProperties: false,
                            required: ['type', 'number'],
                            properties: {
                              type: {
                                type: 'string',
                                enum: ['mobile', 'office', 'fax'],
                                default: 'mobile',
                              },
                              number: {
                                type: 'string',
                                pattern: '^\\+?[1-9]\\d{1,14}$',
                                default: '+1234567890',
                              },
                              // 레벨 6: 전화번호 검증 기록
                              verification: {
                                type: 'object',
                                description: '번호 검증 상태',
                                additionalProperties: false,
                                properties: {
                                  isVerified: {
                                    type: 'boolean',
                                    default: true,
                                  },
                                  verifiedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    default: '2024-01-01T00:00:00Z',
                                  },
                                  verificationMethod: {
                                    type: 'string',
                                    enum: ['sms', 'call', 'manual'],
                                    default: 'sms',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                // 레벨 3: 제품들
                products: {
                  type: 'array',
                  description: '스토어 제품 목록',
                  minItems: 1,
                  items: {
                    type: 'object',
                    description: '개별 제품 정보',
                    additionalProperties: false,
                    required: ['productId', 'name', 'pricing', 'inventory'],
                    properties: {
                      productId: {
                        type: 'string',
                        format: 'uuid',
                        default: '770e8400-e29b-41d4-a716-446655440000',
                      },
                      name: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 200,
                        default: 'Premium Wireless Headphones',
                      },
                      // 레벨 4: 가격 정보
                      pricing: {
                        type: 'object',
                        description: '제품 가격 정보',
                        additionalProperties: false,
                        required: ['basePrice', 'currency'],
                        properties: {
                          basePrice: {
                            type: 'number',
                            minimum: 0,
                            multipleOf: 0.01,
                            default: 299.99,
                          },
                          currency: {
                            type: 'string',
                            pattern: '^[A-Z]{3}$',
                            default: 'USD',
                          },
                          // 레벨 5: 할인 정보
                          discounts: {
                            type: 'array',
                            minItems: 1,
                            description: '적용 가능한 할인들',
                            items: {
                              type: 'object',
                              description: '개별 할인 정보',
                              additionalProperties: false,
                              required: ['discountId', 'type', 'value'],
                              properties: {
                                discountId: {
                                  type: 'string',
                                  format: 'uuid',
                                  default:
                                    '880e8400-e29b-41d4-a716-446655440000',
                                },
                                type: {
                                  type: 'string',
                                  enum: ['percentage', 'fixed', 'bogo'],
                                  default: 'percentage',
                                },
                                value: {
                                  type: 'number',
                                  minimum: 0,
                                  default: 15,
                                },
                                // 레벨 6: 할인 조건
                                conditions: {
                                  type: 'object',
                                  description: '할인 적용 조건',
                                  additionalProperties: false,
                                  properties: {
                                    minimumQuantity: {
                                      type: 'integer',
                                      minimum: 1,
                                      default: 2,
                                    },
                                    minimumAmount: {
                                      type: 'number',
                                      minimum: 0,
                                      default: 100,
                                    },
                                    validUntil: {
                                      type: 'string',
                                      format: 'date-time',
                                      default: '2024-12-31T23:59:59Z',
                                    },
                                    applicableRegions: {
                                      type: 'array',
                                      items: {
                                        type: 'string',
                                        pattern: '^[A-Z]{2}$',
                                        default: 'US',
                                      },
                                      uniqueItems: true,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      // 레벨 4: 재고 정보
                      inventory: {
                        type: 'object',
                        description: '재고 관리 정보',
                        additionalProperties: false,
                        required: ['warehouses'],
                        properties: {
                          // 레벨 5: 창고별 재고
                          warehouses: {
                            type: 'array',
                            description: '창고별 재고 현황',
                            minItems: 1,
                            items: {
                              type: 'object',
                              description: '개별 창고 재고 정보',
                              additionalProperties: false,
                              required: ['warehouseId', 'location', 'stock'],
                              properties: {
                                warehouseId: {
                                  type: 'string',
                                  format: 'uuid',
                                  default:
                                    '990e8400-e29b-41d4-a716-446655440000',
                                },
                                location: {
                                  type: 'object',
                                  description: '창고 위치 정보',
                                  additionalProperties: false,
                                  required: ['address', 'coordinates'],
                                  properties: {
                                    address: {
                                      type: 'string',
                                      default: '123 Warehouse St, City, State',
                                    },
                                    coordinates: {
                                      type: 'object',
                                      description: 'GPS 좌표',
                                      additionalProperties: false,
                                      required: ['latitude', 'longitude'],
                                      properties: {
                                        latitude: {
                                          type: 'number',
                                          minimum: -90,
                                          maximum: 90,
                                          default: 37.7749,
                                        },
                                        longitude: {
                                          type: 'number',
                                          minimum: -180,
                                          maximum: 180,
                                          default: -122.4194,
                                        },
                                        // 레벨 6: 위치 정확도 정보
                                        accuracy: {
                                          type: 'object',
                                          description: '좌표 정확도 정보',
                                          additionalProperties: false,
                                          properties: {
                                            radiusMeters: {
                                              type: 'number',
                                              minimum: 0,
                                              default: 5,
                                            },
                                            lastUpdated: {
                                              type: 'string',
                                              format: 'date-time',
                                              default: '2024-01-01T00:00:00Z',
                                            },
                                            source: {
                                              type: 'string',
                                              enum: [
                                                'gps',
                                                'manual',
                                                'geocoding',
                                              ],
                                              default: 'gps',
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                                stock: {
                                  type: 'object',
                                  description: '재고 수량 정보',
                                  additionalProperties: false,
                                  required: ['available', 'reserved'],
                                  properties: {
                                    available: {
                                      type: 'integer',
                                      minimum: 0,
                                      default: 100,
                                    },
                                    reserved: {
                                      type: 'integer',
                                      minimum: 0,
                                      default: 5,
                                    },
                                    // 레벨 6: 재고 히스토리
                                    history: {
                                      type: 'array',
                                      minItems: 1,
                                      description: '재고 변동 기록',
                                      items: {
                                        type: 'object',
                                        description: '재고 변동 항목',
                                        additionalProperties: false,
                                        required: [
                                          'timestamp',
                                          'type',
                                          'quantity',
                                        ],
                                        properties: {
                                          timestamp: {
                                            type: 'string',
                                            format: 'date-time',
                                            default: '2024-01-01T00:00:00Z',
                                          },
                                          type: {
                                            type: 'string',
                                            enum: [
                                              'inbound',
                                              'outbound',
                                              'adjustment',
                                              'damaged',
                                            ],
                                            default: 'inbound',
                                          },
                                          quantity: {
                                            type: 'integer',
                                            default: 10,
                                          },
                                          reason: {
                                            type: 'string',
                                            default: 'Regular restocking',
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          // 레벨 2: 카테고리 분류
          categories: {
            type: 'array',
            description: '제품 카테고리 계층구조',
            items: {
              type: 'object',
              description: '카테고리 정보',
              additionalProperties: false,
              required: ['categoryId', 'name'],
              properties: {
                categoryId: {
                  type: 'string',
                  format: 'uuid',
                  default: 'aa0e8400-e29b-41d4-a716-446655440000',
                },
                name: {
                  type: 'string',
                  default: 'Electronics',
                },
                subcategories: {
                  type: 'array',
                  description: '하위 카테고리',
                  items: {
                    type: 'object',
                    description: '하위 카테고리 정보',
                    additionalProperties: false,
                    properties: {
                      subcategoryId: {
                        type: 'string',
                        format: 'uuid',
                        default: 'bb0e8400-e29b-41d4-a716-446655440000',
                      },
                      name: {
                        type: 'string',
                        default: 'Audio Equipment',
                      },
                    },
                  },
                },
              },
            },
          },
          // 레벨 2: 마케팅 캠페인
          campaigns: {
            type: 'array',
            description: '진행중인 마케팅 캠페인',
            items: {
              type: 'object',
              description: '캠페인 정보',
              additionalProperties: false,
              required: ['campaignId', 'name', 'targets'],
              properties: {
                campaignId: {
                  type: 'string',
                  format: 'uuid',
                  default: 'cc0e8400-e29b-41d4-a716-446655440000',
                },
                name: {
                  type: 'string',
                  default: 'Holiday Sale 2024',
                },
                // 레벨 3: 타겟 설정
                targets: {
                  type: 'object',
                  description: '캠페인 타겟 설정',
                  additionalProperties: false,
                  required: ['demographics'],
                  properties: {
                    // 레벨 4: 인구통계학적 타겟
                    demographics: {
                      type: 'object',
                      description: '타겟 인구통계',
                      additionalProperties: false,
                      properties: {
                        ageRange: {
                          type: 'object',
                          description: '연령대',
                          additionalProperties: false,
                          properties: {
                            min: { type: 'integer', minimum: 0, default: 18 },
                            max: { type: 'integer', maximum: 120, default: 65 },
                          },
                        },
                        // 레벨 5: 관심사 기반 세분화
                        interests: {
                          type: 'array',
                          description: '관심사 카테고리',
                          items: {
                            type: 'object',
                            description: '관심사 정보',
                            additionalProperties: false,
                            required: ['category', 'weight'],
                            properties: {
                              category: {
                                type: 'string',
                                enum: [
                                  'technology',
                                  'fashion',
                                  'sports',
                                  'books',
                                ],
                                default: 'technology',
                              },
                              weight: {
                                type: 'number',
                                minimum: 0,
                                maximum: 1,
                                default: 0.8,
                              },
                              // 레벨 6: 관심사 세부 키워드
                              keywords: {
                                type: 'array',
                                description: '관련 키워드 목록',
                                items: {
                                  type: 'object',
                                  description: '키워드 정보',
                                  additionalProperties: false,
                                  required: ['term', 'relevanceScore'],
                                  properties: {
                                    term: {
                                      type: 'string',
                                      default: 'wireless headphones',
                                    },
                                    relevanceScore: {
                                      type: 'number',
                                      minimum: 0,
                                      maximum: 1,
                                      default: 0.95,
                                    },
                                    trending: {
                                      type: 'boolean',
                                      default: true,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // 레벨 1: 분석 데이터
      analytics: {
        type: 'object',
        description: '플랫폼 분석 정보',
        additionalProperties: false,
        required: ['metrics', 'reports'],
        properties: {
          // 레벨 2: 메트릭스
          metrics: {
            type: 'object',
            description: '주요 성과 지표',
            additionalProperties: false,
            properties: {
              sales: {
                type: 'object',
                description: '매출 관련 메트릭',
                additionalProperties: false,
                properties: {
                  total: { type: 'number', minimum: 0, default: 1000000 },
                  currency: {
                    type: 'string',
                    pattern: '^[A-Z]{3}$',
                    default: 'USD',
                  },
                },
              },
            },
          },
          // 레벨 2: 리포트
          reports: {
            type: 'array',
            description: '생성된 분석 리포트',
            items: {
              type: 'object',
              description: '개별 리포트',
              additionalProperties: false,
              required: ['reportId', 'type'],
              properties: {
                reportId: {
                  type: 'string',
                  format: 'uuid',
                  default: 'dd0e8400-e29b-41d4-a716-446655440000',
                },
                type: {
                  type: 'string',
                  enum: ['daily', 'weekly', 'monthly', 'quarterly'],
                  default: 'daily',
                },
              },
            },
          },
        },
      },
      // 레벨 1: 시스템 정보
      system: {
        type: 'object',
        description: '시스템 메타데이터',
        additionalProperties: false,
        required: ['version', 'timestamp'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
            default: '2.1.0',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            default: '2024-01-01T00:00:00Z',
          },
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  const formHandle = useRef<FormHandle<typeof jsonSchema>>(null);
  return (
    <div>
      <button onClick={() => formHandle.current?.reset()}>reset</button>
      <button onClick={() => formHandle.current?.setValue({})}>clear</button>
      <button
        onClick={() =>
          (
            formHandle.current?.node?.find(
              '/marketplace/stores/0/products/0/inventory',
            ) as ObjectNode
          )?.setValue({
            warehouses: [
              {
                warehouseId: '12345',
                location: {
                  address: 'asd',
                  coordinates: {
                    latitude: 123,
                    longitude: 456,
                    accuracy: {
                      radiusMeters: 1123,
                      lastUpdated: '2022-01-01T00:00:00Z',
                      source: 'gps',
                    },
                  },
                },
              },
            ],
          })
        }
      >
        set value
      </button>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formHandle} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};
