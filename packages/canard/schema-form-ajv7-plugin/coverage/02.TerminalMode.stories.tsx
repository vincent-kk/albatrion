import { useState } from 'react';

import {
  Form,
  type FormTypeInputProps,
  type JsonSchema,
  registerPlugin,
} from '@canard/schema-form';

import { plugin } from '../src';
import StoryLayout from './components/StoryLayout';

registerPlugin(plugin);

export default {
  title: 'Form/02. TerminalMode',
};

export const FormTypeInputArrayTerminal = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormType: ({ node, onChange, value }: FormTypeInputProps<string[]>) => {
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

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayNotTerminal = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        terminal: false,
        FormType: ({ node, onChange, value }: FormTypeInputProps<string[]>) => {
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

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayTerminalWithDefaultValue = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormType: ({
          node,
          onChange,
          value,
          defaultValue,
        }: FormTypeInputProps<string[]>) => {
          return (
            <div>
              i am array item: {node.group}
              <div>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
              <div>
                <pre>{JSON.stringify(defaultValue, null, 2)}</pre>
              </div>
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
          default: 'ARRAY ITEM',
        },
        default: ['AAA', 'BBB'],
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayTerminalWithDefaultObjectValue = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormType: ({
          node,
          onChange,
          value,
          defaultValue,
        }: FormTypeInputProps<{ name: string; age: number }[]>) => {
          return (
            <div>
              i am array item: {node.group}
              <div>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
              <div>
                <pre>{JSON.stringify(defaultValue, null, 2)}</pre>
              </div>
              <div>
                <button
                  onClick={() =>
                    onChange((prev) => [...prev, { name: 'Jinny', age: 24 }])
                  }
                >
                  onChange
                </button>
                <button onClick={() => node.push()}>add</button>
                <button
                  onClick={() => node.update(1, { name: 'Jenny', age: 27 })}
                >
                  update
                </button>
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
          type: 'object',
          properties: {
            name: {
              type: 'string',
              default: 'John Doe',
            },
            age: {
              type: 'number',
              default: 20,
            },
          },
        },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputArrayTerminalWithMixedDefaultObjectValue = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        FormType: ({
          node,
          onChange,
          value,
          defaultValue,
        }: FormTypeInputProps<{ name: string; age: number }[]>) => {
          return (
            <div>
              i am array item: {node.group}
              <div>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
              <div>
                <pre>{JSON.stringify(defaultValue, null, 2)}</pre>
              </div>
              <div>
                <button
                  onClick={() =>
                    onChange((prev) => [...prev, { name: 'Jinny', age: 24 }])
                  }
                >
                  onChange
                </button>
                <button onClick={() => node.push()}>add</button>
                <button
                  onClick={() => node.update(1, { name: 'Jenny', age: 27 })}
                >
                  update
                </button>
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
          type: 'object',
          properties: {
            name: {
              type: 'string',
              default: 'John Doe',
            },
            age: {
              type: 'number',
            },
            email: {
              type: 'string',
              default: 'john.doe@example.com',
            },
          },
          default: {
            age: 24,
            email: 'john.doe.24@example.com',
          },
        },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputObjectTerminal = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        FormType: ({
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

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputObjectNotTerminal = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        terminal: false,
        FormType: ({
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

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputObjectTerminalWithDefaultValue = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        FormType: ({
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
                      url: 'test',
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
        default: {
          url: 'http://example.com/poster.jpg',
          format: 'webp',
          size: {
            width: 50,
            height: 50,
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputObjectTerminalWithSubSchemaDefaultValue = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        FormType: ({
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
                      url: 'test',
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
            default: 'http://example.com/poster.jpg',
          },
          format: {
            type: 'string',
            default: 'webp',
          },
          size: {
            type: 'object',
            properties: {
              width: {
                type: 'number',
                default: 50,
              },
              height: {
                type: 'number',
                default: 50,
              },
            },
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputObjectTerminalWithMixedDefaultValue = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        FormType: ({
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
                      url: 'test',
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
            default: 'webp',
          },
          size: {
            type: 'object',
            properties: {
              width: {
                type: 'number',
                default: 50,
              },
              height: {
                type: 'number',
                default: 50,
              },
            },
          },
        },
        default: {
          url: 'http://example-cdn.com/poster.jpg',
          size: {
            width: 300,
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

export const FormTypeInputObjectTerminalWithPropertyKeys = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      poster: {
        type: 'object',
        FormType: ({
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
        propertyKeys: ['format'],
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

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};
