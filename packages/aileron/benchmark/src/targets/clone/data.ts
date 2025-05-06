export const data = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          maxLength: 50,
          default: 'Anonymous',
        },
        email: {
          type: 'string',
          format: 'email',
        },
        profile: {
          type: 'object',
          oneOf: [
            {
              properties: { type: { enum: ['adult', 'child'] } },
              required: ['age', 'gender', 'preferences'],
            },
            {
              properties: { type: { enum: ['none'] } },
              required: [],
            },
          ],
          properties: {
            type: {
              type: 'string',
              enum: ['adult', 'child', 'none'],
              default: 'adult',
            },
            age: {
              type: 'integer',
              minimum: 0,
              default: 18,
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              computed: {
                visible: '@.age >= 18',
              },
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark'],
                  default: 'light',
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'boolean',
                      default: true,
                    },
                    sms: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  required: ['email', 'sms'],
                },
              },
              required: ['theme', 'notifications'],
            },
          },
          required: ['type'],
        },
      },
      required: ['name'],
    },
    settings: {
      type: 'object',
      properties: {
        privacy: {
          type: 'string',
          oneOf: [
            { const: 'public', title: 'Public' },
            { const: 'private', title: 'Private' },
            { const: 'custom', title: 'Custom' },
          ],
          default: 'public',
        },
        language: {
          type: 'string',
          enum: ['en', 'kr', 'jp'],
          default: 'en',
        },
        security: {
          type: 'object',
          properties: {
            '2FA': {
              type: 'boolean',
              default: true,
            },
            backupCodes: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[A-Z0-9]{8}$',
              },
              minItems: 5,
              maxItems: 10,
            },
          },
          required: ['2FA'],
        },
      },
      required: ['privacy', 'language'],
    },
  },
  required: ['user', 'settings'],
};

export const getArrayData = (size: number): unknown[] => {
  const result: unknown[] = [];

  for (let i = 0; i < size; i++) {
    // 대부분은 숫자 또는 문자열
    if (i % 100 === 0) {
      // 특이한 타입 삽입
      switch (i % 700) {
        case 0:
          result.push(null);
          break;
        case 100:
          result.push(undefined);
          break;
        case 200:
          result.push({ id: i });
          break;
        case 300:
          result.push(() => i);
          break;
        case 400:
          result.push(Symbol(`id-${i}`));
          break;
        case 500:
          result.push(true);
          break;
        case 600:
          result.push(new Date());
          break;
        default:
          result.push(NaN);
          break;
      }
    } else {
      // 일반적인 타입
      result.push(i % 2 === 0 ? i : `str-${i}`);
    }
  }

  return result;
};

export const mixedData = {
  // 기본 배열
  numbers: Array.from({ length: 1000 }, (_, i) => i),
  strings: Array.from({ length: 1000 }, (_, i) => `string-${i}`),

  // TypedArray
  int8Array: new Int8Array(1000),
  uint8Array: new Uint8Array(1000),
  int16Array: new Int16Array(1000),
  uint16Array: new Uint16Array(1000),
  int32Array: new Int32Array(1000),
  uint32Array: new Uint32Array(1000),
  float32Array: new Float32Array(1000),
  float64Array: new Float64Array(1000),

  // Date 객체
  dates: Array.from(
    { length: 100 },
    (_, i) => new Date(Date.now() + i * 86400000),
  ),

  // RegExp
  regexps: [
    /^[a-zA-Z0-9]+$/,
    /^\d{3}-\d{3,4}-\d{4}$/,
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ],

  // Map
  userMap: new Map(
    Array.from({ length: 1000 }, (_, i) => [
      `user-${i}`,
      { id: i, name: `User ${i}` },
    ]),
  ),

  // Set
  uniqueIds: new Set(Array.from({ length: 1000 }, (_, i) => `id-${i}`)),

  // Buffer
  buffer: Buffer.from('Hello, World!'.repeat(100)),

  // ArrayBuffer
  arrayBuffer: new ArrayBuffer(1000),

  // File/Blob
  blob: new Blob(['Hello, World!'.repeat(100)], { type: 'text/plain' }),

  // Error 객체들
  errors: [
    new Error('Standard Error'),
    new TypeError('Type Error'),
    new RangeError('Range Error'),
    new ReferenceError('Reference Error'),
    new SyntaxError('Syntax Error'),
  ],

  // 중첩된 객체
  nested: {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              value: 'deep nested value',
              array: Array.from({ length: 100 }, (_, i) => ({
                id: i,
                data: `nested-${i}`,
                date: new Date(),
                map: new Map([['key', 'value']]),
                set: new Set(['value']),
              })),
            },
          },
        },
      },
    },
  },

  // 순환 참조
  circular: (() => {
    const circular = {
      self: null as any,
      nested: {
        parent: null as any,
      },
    };
    circular.self = circular;
    circular.nested.parent = circular;
    return circular;
  })(),
};
