import { describe, expect, it } from 'vitest';

import { resolveReference } from '../resolveReference';

describe('JsonSchemaScanner 실제 데이터 테스트', () => {
  it('legacyDefinitionsSchema 대한 데이터 처리', async () => {
    const jsonSchema = legacyDefinitionsSchema;

    const resolved = resolveReference(jsonSchema);

    expect(resolved).toEqual({
      definitions: {
        email: {
          description: '이메일 형식의 문자열',
          format: 'email',
          type: 'string',
        },
        positiveInteger: {
          description: '0 이상인 정수',
          minimum: 0,
          type: 'integer',
        },
      },
      properties: {
        age: {
          description: '0 이상인 정수',
          minimum: 0,
          type: 'integer',
        },
        email: {
          description: '이메일 형식의 문자열',
          format: 'email',
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
      required: ['name', 'age'],
      title: 'User',
      type: 'object',
    });

    const cyclicSchema = legacyDefinitionsSchema2;

    const resolvedCyclicSchema = resolveReference(cyclicSchema);

    expect(resolvedCyclicSchema).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        node: {
          properties: {
            children: {
              items: {
                $ref: '#/definitions/node',
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
      },
      properties: {
        children: {
          items: {
            properties: {
              children: {
                items: {
                  $ref: '#/definitions/node',
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
          type: 'array',
        },
        id: {
          type: 'string',
        },
      },
      required: ['id'],
      title: 'Node',
      type: 'object',
    });
  });
});

const legacyDefinitionsSchema = {
  title: 'User',
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    age: {
      $ref: '#/definitions/positiveInteger',
    },
    email: {
      $ref: '#/definitions/email',
    },
  },
  required: ['name', 'age'],
  definitions: {
    positiveInteger: {
      type: 'integer',
      minimum: 0,
      description: '0 이상인 정수',
    },
    email: {
      type: 'string',
      format: 'email',
      description: '이메일 형식의 문자열',
    },
  },
};

const legacyDefinitionsSchema2 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Node',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    children: {
      type: 'array',
      items: {
        $ref: '#/definitions/node',
      },
    },
  },
  required: ['id'],
  definitions: {
    node: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        children: {
          type: 'array',
          items: {
            $ref: '#/definitions/node',
          },
        },
      },
      required: ['id'],
    },
  },
};
