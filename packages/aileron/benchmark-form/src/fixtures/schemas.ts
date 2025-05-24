import type { JsonSchema } from '@canard/schema-form';

export const sampleSchemas = [
  // 간단한 폼
  {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        default: 'John Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        default: 'john.doe@example.com',
      },
    },
    required: ['name', 'email'],
  },

  // 중간 크기 폼
  {
    type: 'object',
    properties: {
      personalInfo: {
        type: 'object',
        properties: {
          firstName: { type: 'string', default: 'John' },
          lastName: { type: 'string', default: 'Doe' },
          age: { type: 'number', default: 30 },
          email: {
            type: 'string',
            format: 'email',
            default: 'john.doe@example.com',
          },
        },
        required: ['firstName', 'lastName', 'email'],
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', default: '123 Main St' },
          city: { type: 'string', default: 'Anytown' },
          country: { type: 'string', default: 'USA' },
        },
        required: ['street', 'city'],
      },
    },
    required: ['personalInfo'],
  },

  // 복잡한 폼
  {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', default: '1234567890' },
            name: { type: 'string', default: 'John Doe' },
            roles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['admin', 'user', 'guest'],
                default: 'user',
              },
            },
            settings: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark'],
                  default: 'light',
                },
                notifications: { type: 'boolean', default: true },
                language: { type: 'string', default: 'en' },
              },
            },
          },
          required: ['id', 'name', 'roles'],
        },
      },
      metadata: {
        type: 'object',
        properties: {
          created: {
            type: 'string',
            format: 'date-time',
            default: '2021-01-01',
          },
          modified: {
            type: 'string',
            format: 'date-time',
            default: '2021-01-01',
          },
          tags: {
            type: 'array',
            items: { type: 'string', default: 'tag1' },
          },
        },
      },
    },
    required: ['users'],
  },

  // 매우 복잡한 폼
  {
    title: 'Application Data Schema',
    description:
      '사용자 정보, 메타데이터, 페이징 및 링크를 포함한 복합 도메인 스키마',
    type: 'object',
    additionalProperties: false,
    required: ['users', 'metadata'],
    properties: {
      users: {
        type: 'array',
        description: '시스템에 등록된 사용자 목록',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          description: '개별 사용자 정보',
          additionalProperties: false,
          required: ['id', 'username', 'email', 'roles'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              default: '123e4567-e89b-12d3-a456-426614174000',
            },
            username: {
              type: 'string',
              pattern: '^[A-Za-z0-9_]{3,30}$',
              description: '3~30자의 영문, 숫자, 언더스코어',
              default: 'john_doe',
            },
            email: {
              type: 'string',
              format: 'email',
              default: 'john.doe@example.com',
            },
            roles: {
              type: 'array',
              description: '사용자 권한',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
                enum: ['admin', 'user', 'guest', 'moderator'],
                default: 'user',
              },
            },
            settings: {
              type: 'object',
              description: 'UI 및 알림 설정',
              additionalProperties: false,
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark', 'system'],
                  default: 'light',
                },
                notifications: {
                  type: 'object',
                  description: '알림 채널별 허용 여부',
                  additionalProperties: false,
                  properties: {
                    email: { type: 'boolean', default: true },
                    sms: { type: 'boolean', default: true },
                    push: { type: 'boolean', default: true },
                  },
                },
                language: {
                  type: 'string',
                  pattern: '^[a-z]{2}(-[A-Z]{2})?$',
                  description: 'ISO 언어 코드 (예: en, ko-KR)',
                  default: 'en',
                },
              },
            },
            profile: {
              type: 'object',
              description: '프로필 정보',
              additionalProperties: false,
              required: ['firstName', 'lastName'],
              properties: {
                firstName: { type: 'string', minLength: 1, default: 'John' },
                lastName: { type: 'string', minLength: 1, default: 'Doe' },
                birthDate: {
                  type: 'string',
                  format: 'date',
                  default: '1990-01-01',
                },
                gender: {
                  type: 'string',
                  enum: ['male', 'female', 'other'],
                  default: 'male',
                },
              },
            },
            addresses: {
              type: 'array',
              description: '주소 목록',
              minItems: 0,
              items: {
                type: 'object',
                description: '주소 정보',
                additionalProperties: false,
                required: ['type', 'line1', 'city', 'country'],
                properties: {
                  type: {
                    type: 'string',
                    enum: ['home', 'work', 'other'],
                    default: 'home',
                  },
                  line1: { type: 'string', default: '123 Main St' },
                  line2: { type: 'string', default: 'Apt 1' },
                  city: { type: 'string', default: 'Anytown' },
                  state: { type: 'string', default: 'CA' },
                  postalCode: {
                    type: 'string',
                    pattern: '^[0-9A-Za-z \\-]+$',
                    default: '12345',
                  },
                  country: {
                    type: 'string',
                    default: 'USA',
                    description: 'ISO 국가 코드',
                  },
                },
              },
            },
            friends: {
              type: 'array',
              description: '친구 사용자 ID 목록',
              uniqueItems: true,
              items: {
                type: 'string',
                format: 'uuid',
                default: '123e4567-e89b-12d3-a456-426614174000',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              default: '2021-01-01',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              default: '2021-01-01',
            },
            preferences: {
              type: 'object',
              description: '사용자 선호 설정',
              additionalProperties: false,
              properties: {
                newsletter: { type: 'boolean', default: true },
                targetedAds: { type: 'boolean', default: true },
              },
            },
          },
        },
      },
      metadata: {
        type: 'object',
        description: '전체 데이터 생성 및 수정 정보',
        additionalProperties: false,
        required: ['created', 'modified'],
        properties: {
          created: {
            type: 'string',
            format: 'date-time',
            default: '2021-01-01',
          },
          modified: {
            type: 'string',
            format: 'date-time',
            default: '2021-01-01',
          },
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
            default: '1.0.0',
          },
          tags: {
            type: 'array',
            items: { type: 'string', default: 'tag1' },
            uniqueItems: true,
          },
        },
      },
      pagination: {
        type: 'object',
        description: '페이징 정보',
        additionalProperties: false,
        required: ['page', 'pageSize', 'totalItems', 'totalPages'],
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, default: 10 },
          totalItems: { type: 'integer', minimum: 0, default: 100 },
          totalPages: { type: 'integer', minimum: 1, default: 10 },
        },
      },
      links: {
        type: 'object',
        description: '관련 리소스 링크',
        additionalProperties: false,
        properties: {
          self: {
            type: 'string',
            format: 'uri',
            default: 'https://example.com/self',
          },
          next: {
            type: 'string',
            format: 'uri',
            default: 'https://example.com/next',
          },
          prev: {
            type: 'string',
            format: 'uri',
            default: 'https://example.com/prev',
          },
        },
      },
    },
  },
] as JsonSchema[];

export const referenceSchemas = [
  {
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
  },
  {
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
  },
  {
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
  // 트리 구조 폼
  {
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
  },
] as JsonSchema[];
