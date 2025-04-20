import type { JsonSchema } from '@canard/schema-form';

export const sampleSchemas = [
  // 간단한 폼
  {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
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
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          age: { type: 'number' },
          email: { type: 'string', format: 'email' },
        },
        required: ['firstName', 'lastName', 'email'],
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
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
            id: { type: 'string' },
            name: { type: 'string' },
            roles: {
              type: 'array',
              items: { type: 'string', enum: ['admin', 'user', 'guest'] },
            },
            settings: {
              type: 'object',
              properties: {
                theme: { type: 'string', enum: ['light', 'dark'] },
                notifications: { type: 'boolean' },
                language: { type: 'string' },
              },
            },
          },
          required: ['id', 'name', 'roles'],
        },
      },
      metadata: {
        type: 'object',
        properties: {
          created: { type: 'string', format: 'date-time' },
          modified: { type: 'string', format: 'date-time' },
          tags: { type: 'array', items: { type: 'string' } },
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
            },
            username: {
              type: 'string',
              pattern: '^[A-Za-z0-9_]{3,30}$',
              description: '3~30자의 영문, 숫자, 언더스코어',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            roles: {
              type: 'array',
              description: '사용자 권한',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
                enum: ['admin', 'user', 'guest', 'moderator'],
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
                },
                notifications: {
                  type: 'object',
                  description: '알림 채널별 허용 여부',
                  additionalProperties: false,
                  properties: {
                    email: { type: 'boolean' },
                    sms: { type: 'boolean' },
                    push: { type: 'boolean' },
                  },
                },
                language: {
                  type: 'string',
                  pattern: '^[a-z]{2}(-[A-Z]{2})?$',
                  description: 'ISO 언어 코드 (예: en, ko-KR)',
                },
              },
            },
            profile: {
              type: 'object',
              description: '프로필 정보',
              additionalProperties: false,
              required: ['firstName', 'lastName'],
              properties: {
                firstName: { type: 'string', minLength: 1 },
                lastName: { type: 'string', minLength: 1 },
                birthDate: { type: 'string', format: 'date' },
                gender: {
                  type: 'string',
                  enum: ['male', 'female', 'other'],
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
                  },
                  line1: { type: 'string' },
                  line2: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  postalCode: {
                    type: 'string',
                    pattern: '^[0-9A-Za-z \\-]+$',
                  },
                  country: {
                    type: 'string',
                    default: 'KR',
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
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            preferences: {
              type: 'object',
              description: '사용자 선호 설정',
              additionalProperties: false,
              properties: {
                newsletter: { type: 'boolean' },
                targetedAds: { type: 'boolean' },
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
          created: { type: 'string', format: 'date-time' },
          modified: { type: 'string', format: 'date-time' },
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
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
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1 },
          totalItems: { type: 'integer', minimum: 0 },
          totalPages: { type: 'integer', minimum: 1 },
        },
      },
      links: {
        type: 'object',
        description: '관련 리소스 링크',
        additionalProperties: false,
        properties: {
          self: { type: 'string', format: 'uri' },
          next: { type: 'string', format: 'uri' },
          prev: { type: 'string', format: 'uri' },
        },
      },
    },
  },
] as JsonSchema[];
