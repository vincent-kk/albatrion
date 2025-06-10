import { useState } from 'react';

import { Form, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/16. RefSchemaUsecase',
};

export const SimpleRefSchema = () => {
  const jsonSchema = {
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
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const NestedRefSchema = () => {
  const jsonSchema = {
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
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const ArrayRefSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      children: {
        type: 'array',
        items: { $ref: '#' },
      },
    },
    required: ['id'],
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>();

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue} />
    </StoryLayout>
  );
};

export const TreeSchema = () => {
  const jsonSchema = {
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
          address: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                country: { type: 'string' },
              },
            },
            minItems: 3,
          },
        },
        required: ['id', 'name'],
        additionalProperties: false,
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

// 이스케이프가 필요한 ref 값 예시들

export const EscapedRefWithTildeAndSlash = () => {
  const jsonSchema = {
    title: 'Escaped Ref with Tilde and Slash Characters',
    type: 'object',
    $defs: {
      'user~profile': {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name'],
      },
      'config/settings': {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['light', 'dark'] },
          language: { type: 'string', default: 'en' },
        },
      },
    },
    properties: {
      userProfile: {
        $ref: '#/$defs/user~0profile', // ~ → ~0 이스케이프
      },
      configSettings: {
        $ref: '#/$defs/config~1settings', // / → ~1 이스케이프
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

export const EscapedRefWithDotsAndWildcards = () => {
  const jsonSchema = {
    title: 'Non-Escaped Extended Characters with RFC 6901 Standard',
    type: 'object',
    $defs: {
      'app.config': {
        type: 'object',
        properties: {
          version: { type: 'string' },
          debug: { type: 'boolean', default: false },
        },
      },
      'data*store': {
        type: 'object',
        properties: {
          host: { type: 'string' },
          port: { type: 'number', minimum: 1, maximum: 65535 },
        },
        required: ['host', 'port'],
      },
      'cache..manager': {
        type: 'object',
        properties: {
          ttl: { type: 'number', minimum: 0 },
          maxSize: { type: 'number', minimum: 1 },
        },
      },
    },
    properties: {
      appConfig: {
        $ref: '#/$defs/app.config', // 점은 이스케이프되지 않음
      },
      dataStore: {
        $ref: '#/$defs/data*store', // 별표는 이스케이프되지 않음
      },
      cacheManager: {
        $ref: '#/$defs/cache..manager', // 더블 점은 이스케이프되지 않음
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

export const EscapedRefWithComplexPaths = () => {
  const jsonSchema = {
    title: 'RFC 6901 Standard Escape Only with Mixed Characters',
    type: 'object',
    $defs: {
      'api/v1/users#endpoint': {
        type: 'object',
        $defs: {
          'user.profile*data': {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              avatar: { type: 'string', format: 'uri' },
            },
            required: ['id', 'name'],
          },
          'settings~backup..config': {
            type: 'object',
            properties: {
              autoBackup: { type: 'boolean', default: true },
              interval: { type: 'number', minimum: 1 },
            },
          },
        },
        properties: {
          endpoint: { type: 'string', format: 'uri' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        },
      },
    },
    properties: {
      apiEndpoint: {
        $ref: '#/$defs/api~1v1~1users#endpoint', // 슬래시만 이스케이프, 해시는 그대로
      },
      userProfile: {
        // 중첩된 ref 경로에서 RFC 6901 표준만 이스케이프
        $ref: '#/$defs/api~1v1~1users#endpoint/$defs/user.profile*data', // 점과 별표는 그대로
      },
      backupSettings: {
        // 틸드와 슬래시만 이스케이프, 나머지는 그대로
        $ref: '#/$defs/api~1v1~1users#endpoint/$defs/settings~0backup..config', // 틸드만 이스케이프, 더블 점은 그대로
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

// 서브스키마 직접 참조 케이스들

export const DirectSubSchemaRef = () => {
  const jsonSchema = {
    title: 'Direct SubSchema Reference',
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['name'],
          },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              notifications: { type: 'boolean', default: true },
            },
          },
        },
      },
      // 서브스키마 직접 참조
      userProfile: {
        $ref: '#/properties/user/properties/profile',
      },
      userSettings: {
        $ref: '#/properties/user/properties/settings',
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

export const DirectSubSchemaRefWithEscape = () => {
  const jsonSchema = {
    title: 'Direct SubSchema Reference with Escaped Characters',
    type: 'object',
    properties: {
      'api/config': {
        type: 'object',
        properties: {
          'database~settings': {
            type: 'object',
            properties: {
              host: { type: 'string' },
              port: { type: 'number', minimum: 1, maximum: 65535 },
              'ssl.enabled': { type: 'boolean', default: false },
            },
            required: ['host', 'port'],
          },
          'cache*options': {
            type: 'object',
            properties: {
              ttl: { type: 'number', minimum: 0 },
              'max..size': { type: 'number', minimum: 1 },
            },
          },
        },
      },
      // 이스케이프가 필요한 서브스키마 직접 참조
      databaseConfig: {
        $ref: '#/properties/api~1config/properties/database~0settings',
      },
      cacheConfig: {
        $ref: '#/properties/api~1config/properties/cache*options',
      },
      // 중첩된 프로퍼티 참조 (확장 문자는 이스케이프되지 않음)
      sslSetting: {
        $ref: '#/properties/api~1config/properties/database~0settings/properties/ssl.enabled',
      },
      maxSizeSetting: {
        $ref: '#/properties/api~1config/properties/cache*options/properties/max..size',
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

export const ArrayItemSubSchemaRef = () => {
  const jsonSchema = {
    title: 'Array Item SubSchema Reference',
    type: 'object',
    properties: {
      'products/list': {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            'price~info': {
              type: 'object',
              properties: {
                amount: { type: 'number', minimum: 0 },
                currency: { type: 'string', default: 'USD' },
                'tax.rate': { type: 'number', minimum: 0, maximum: 1 },
              },
              required: ['amount'],
            },
          },
          required: ['id', 'name'],
        },
      },
      // 배열 아이템의 서브스키마 직접 참조
      productTemplate: {
        $ref: '#/properties/products~1list/items',
      },
      // 배열 아이템 내부의 중첩된 객체 참조
      priceTemplate: {
        $ref: '#/properties/products~1list/items/properties/price~0info',
      },
      // 배열 아이템 내부의 특정 프로퍼티 참조 (확장 문자는 이스케이프되지 않음)
      taxRateTemplate: {
        $ref: '#/properties/products~1list/items/properties/price~0info/properties/tax.rate',
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

export const ConditionalSubSchemaRef = () => {
  const jsonSchema = {
    title: 'Conditional SubSchema Reference',
    type: 'object',
    properties: {
      'form/config': {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['user', 'admin'] },
        },
        allOf: [
          {
            if: { properties: { type: { const: 'user' } } },
            then: {
              properties: {
                'user~permissions': {
                  type: 'object',
                  properties: {
                    read: { type: 'boolean', default: true },
                    write: { type: 'boolean', default: false },
                    'admin.access': { type: 'boolean', default: false },
                  },
                },
              },
            },
          },
          {
            if: { properties: { type: { const: 'admin' } } },
            then: {
              properties: {
                'admin*privileges': {
                  type: 'object',
                  properties: {
                    'full..access': { type: 'boolean', default: true },
                    'system/control': { type: 'boolean', default: true },
                  },
                },
              },
            },
          },
        ],
      },
      // 조건부 스키마의 서브스키마 직접 참조
      userPermissions: {
        $ref: '#/properties/form~1config/allOf/0/then/properties/user~0permissions',
      },
      adminPrivileges: {
        $ref: '#/properties/form~1config/allOf/1/then/properties/admin*privileges',
      },
      // 조건부 스키마 내부의 특정 프로퍼티 참조
      adminAccess: {
        $ref: '#/properties/form~1config/allOf/0/then/properties/user~0permissions/properties/admin.access',
      },
      systemControl: {
        $ref: '#/properties/form~1config/allOf/1/then/properties/admin*privileges/properties/system~1control',
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
