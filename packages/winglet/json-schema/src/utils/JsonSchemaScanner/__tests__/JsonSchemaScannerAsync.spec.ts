import { getValue } from '@winglet/json/pointer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JsonSchemaScannerAsync } from '../async/JsonSchemaScannerAsync';

describe('JsonSchemaScannerAsync 실제 데이터 테스트', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('schema1에 대한 데이터 처리', async () => {
    const jsonSchema = schema1;
    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      ['#/$defs/Name', { type: 'string', minLength: 1 }],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      type: 'object',
      $defs: {
        Name: {
          type: 'string',
          minLength: 1,
        },
      },
      properties: {
        name: {
          type: 'string',
          minLength: 1,
        },
      },
      required: ['name'],
    });
  });

  it('schema2에 대한 데이터 처리', async () => {
    const jsonSchema = schema2;
    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/Person/$defs/Name',
        {
          minLength: 1,
          type: 'string',
        },
      ],
      [
        '#/$defs/Person',
        {
          $defs: {
            Name: {
              minLength: 1,
              type: 'string',
            },
          },
          properties: {
            firstName: {
              $ref: '#/$defs/Person/$defs/Name',
            },
            lastName: {
              $ref: '#/$defs/Person/$defs/Name',
            },
          },
          type: 'object',
        },
      ],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      type: 'object',
      $defs: {
        Person: {
          type: 'object',
          $defs: {
            Name: {
              type: 'string',
              minLength: 1,
            },
          },
          properties: {
            firstName: { $ref: '#/$defs/Person/$defs/Name' },
            lastName: { $ref: '#/$defs/Person/$defs/Name' },
          },
        },
      },
      properties: {
        person: {
          type: 'object',
          $defs: {
            Name: {
              type: 'string',
              minLength: 1,
            },
          },
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
            },
            lastName: {
              type: 'string',
              minLength: 1,
            },
          },
        },
      },
    });
  });

  it('schema3에 대한 데이터 처리', async () => {
    const jsonSchema = schema3;
    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#',
        {
          properties: {
            children: {
              items: {
                $ref: '#',
              },
              type: 'array',
            },
            id: {
              type: 'string',
            },
          },
          required: ['id'],
          type: 'object',
        },
      ],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      type: 'object',
      properties: {
        id: { type: 'string' },
        children: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              children: {
                type: 'array',
                items: { $ref: '#' },
              },
            },
            required: ['id'],
          },
        },
      },
      required: ['id'],
    });
  });

  it('schema4에 대한 데이터 처리', async () => {
    const jsonSchema = schema4;
    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/Cat',
        {
          properties: {
            meowVolume: {
              type: 'integer',
            },
            type: {
              const: 'cat',
            },
          },
          required: ['type', 'meowVolume'],
          type: 'object',
        },
      ],
      [
        '#/$defs/Dog',
        {
          properties: {
            barkVolume: {
              type: 'integer',
            },
            type: {
              const: 'dog',
            },
          },
          required: ['type', 'barkVolume'],
          type: 'object',
        },
      ],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      $defs: {
        Cat: {
          properties: {
            meowVolume: {
              type: 'integer',
            },
            type: {
              const: 'cat',
            },
          },
          required: ['type', 'meowVolume'],
          type: 'object',
        },
        Dog: {
          properties: {
            barkVolume: {
              type: 'integer',
            },
            type: {
              const: 'dog',
            },
          },
          required: ['type', 'barkVolume'],
          type: 'object',
        },
      },
      properties: {
        pet: {
          oneOf: [
            {
              properties: {
                meowVolume: {
                  type: 'integer',
                },
                type: {
                  const: 'cat',
                },
              },
              required: ['type', 'meowVolume'],
              type: 'object',
            },
            {
              properties: {
                barkVolume: {
                  type: 'integer',
                },
                type: {
                  const: 'dog',
                },
              },
              required: ['type', 'barkVolume'],
              type: 'object',
            },
          ],
        },
      },
      required: ['pet'],
      type: 'object',
    });
  });

  it('objectSchema에 대한 데이터 처리', async () => {
    const jsonSchema = objectSchema;
    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#',
        {
          properties: {
            children: {
              items: {
                $ref: '#',
              },
              type: 'array',
            },
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
          required: ['id', 'name'],
          title: 'TreeNode',
          type: 'object',
        },
      ],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
          maxDepth: 2,
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      properties: {
        children: {
          items: {
            properties: {
              children: {
                items: {
                  $ref: '#',
                },
                type: 'array',
              },
              id: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
            },
            required: ['id', 'name'],
            title: 'TreeNode',
            type: 'object',
          },
          type: 'array',
        },
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      required: ['id', 'name'],
      title: 'TreeNode',
      type: 'object',
    });
  });

  it('arraySchema에 대한 데이터 처리', async () => {
    const jsonSchema = arraySchema;

    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#',
        {
          items: {
            anyOf: [
              {
                type: 'string',
              },
              {
                $ref: '#',
              },
            ],
          },
          title: 'RecursiveArray',
          type: 'array',
        },
      ],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
          maxDepth: 2,
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      items: {
        anyOf: [
          {
            type: 'string',
          },
          {
            items: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  $ref: '#',
                },
              ],
            },
            title: 'RecursiveArray',
            type: 'array',
          },
        ],
      },
      title: 'RecursiveArray',
      type: 'array',
    });
  });

  it('treeObjectSchema 대한 데이터 처리', async () => {
    const jsonSchema = treeObjectSchema;

    const defs = new Map<string, UnknownSchema>();
    const scanner = new JsonSchemaScannerAsync({
      visitor: {
        exit: ({ schema, hasReference }) => {
          if (hasReference && typeof schema.$ref === 'string')
            defs.set(schema.$ref, getValue(jsonSchema, schema.$ref));
        },
      },
    });
    await scanner.scan(jsonSchema);

    expect(Array.from(defs.entries())).toEqual([
      [
        '#/$defs/TreeNode',
        {
          additionalProperties: false,
          properties: {
            children: {
              items: {
                $ref: '#/$defs/TreeNode',
              },
              type: 'array',
            },
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
          required: ['id', 'name'],
          type: 'object',
        },
      ],
    ]);

    const finalSchema = (
      await new JsonSchemaScannerAsync({
        options: {
          resolveReference: (path) => defs.get(path),
          maxDepth: 2,
        },
      }).scan(jsonSchema)
    ).getValue();

    expect(finalSchema).toEqual({
      $defs: {
        TreeNode: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/$defs/TreeNode',
              },
            },
          },
          required: ['id', 'name'],
          additionalProperties: false,
        },
      },
      properties: {
        root: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/$defs/TreeNode',
              },
            },
          },
          required: ['id', 'name'],
          additionalProperties: false,
        },
      },
      required: ['root'],
      title: 'Tree Schema with $defs',
      type: 'object',
    });
  });
});

const schema1 = {
  type: 'object',
  $defs: {
    Name: {
      type: 'string',
      minLength: 1,
    },
  },
  properties: {
    name: {
      $ref: '#/$defs/Name',
    },
  },
  required: ['name'],
};

const schema2 = {
  type: 'object',
  $defs: {
    Person: {
      type: 'object',
      $defs: {
        Name: {
          type: 'string',
          minLength: 1,
        },
      },
      properties: {
        firstName: { $ref: '#/$defs/Person/$defs/Name' },
        lastName: { $ref: '#/$defs/Person/$defs/Name' },
      },
    },
  },
  properties: {
    person: { $ref: '#/$defs/Person' },
  },
};

const schema3 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    children: {
      type: 'array',
      items: { $ref: '#' },
    },
  },
  required: ['id'],
};

const schema4 = {
  type: 'object',
  $defs: {
    Cat: {
      type: 'object',
      properties: {
        type: { const: 'cat' },
        meowVolume: { type: 'integer' },
      },
      required: ['type', 'meowVolume'],
    },
    Dog: {
      type: 'object',
      properties: {
        type: { const: 'dog' },
        barkVolume: { type: 'integer' },
      },
      required: ['type', 'barkVolume'],
    },
  },
  properties: {
    pet: {
      oneOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }],
    },
  },
  required: ['pet'],
};

const objectSchema = {
  title: 'TreeNode',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    children: {
      type: 'array',
      items: {
        $ref: '#',
      },
    },
  },
  required: ['id', 'name'],
};

const arraySchema = {
  title: 'RecursiveArray',
  type: 'array',
  items: {
    anyOf: [{ type: 'string' }, { $ref: '#' }],
  },
};

const treeObjectSchema = {
  title: 'Tree Schema with $defs',
  type: 'object',
  properties: {
    root: {
      $ref: '#/$defs/TreeNode',
    },
  },
  required: ['root'],
  $defs: {
    TreeNode: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/$defs/TreeNode',
          },
        },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    },
  },
};
