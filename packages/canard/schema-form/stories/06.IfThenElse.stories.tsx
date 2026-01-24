import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin } from './components/validator';

registerPlugin(plugin);

export default {
  title: 'Form/06. IfThenElse',
};

export const IfThenElse = () => {
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
        default: '2025-01-01',
      },
      numOfPlayers: { type: 'number' },
      price: {
        type: 'number',
        minimum: 50,
        default: 100,
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

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const IfThenElseConst = () => {
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
        '&active': '../title === "wow"',
      },
      releaseDate: {
        type: 'string',
        format: 'date',
        '&active': '../title === "wow"',
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
          const: 'movie',
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
            const: 'game',
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

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const AdditionalProperties = () => {
  const schema = {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          FormTypeInput: ({ onChange }) => {
            return (
              <div>
                <button
                  onClick={() =>
                    onChange({
                      name: 'test',
                      email: 'test@test.com',
                      extra: 'extra',
                    })
                  }
                >
                  Set Value
                </button>
              </div>
            );
          },
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
          additionalProperties: false,
        },
        minItems: 3,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form jsonSchema={schema} onChange={setValue} onValidate={setErrors} />
    </StoryLayout>
  );
};

export const IfThenElseComplex1 = () => {
  const schema = {
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
            if: {
              properties: {
                type: { enum: ['adult', 'child'] },
              },
            },
            then: {
              required: ['age', 'gender', 'preferences'],
            },
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
                default: 'male',
                computed: {
                  active: '../age >= 18',
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
  } satisfies JsonSchema;

  const [value, setValue] = useState({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  const refHandle = useRef<FormHandle<typeof schema>>(null);

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        onChange={setValue}
        onValidate={(errors) => setErrors(errors || [])}
      />
    </StoryLayout>
  );
};

export const IfThenElseComplex2 = () => {
  const schema = {
    type: 'object',
    if: {
      properties: {
        type: { enum: ['adult', 'child'] },
      },
    },
    then: {
      required: ['age', 'gender', 'preferences'],
    },
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
        default: 'male',
        computed: {
          active: '../age >= 18',
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
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} ref={formHandle} />
    </StoryLayout>
  );
};

export const IfThenElseMultipleConditions = () => {
  const schema = {
    type: 'object',
    properties: {
      participantType: {
        type: 'string',
        enum: ['adult', 'minor'],
        default: 'adult',
      },
      participantRegion: {
        type: 'string',
        enum: ['domestic', 'international'],
        default: 'domestic',
      },
      name: {
        type: 'string',
      },
      passportNumber: {
        type: 'string',
        pattern: '^[A-Z0-9]{9}$',
      },
      visaInformation: {
        type: 'string',
      },
      nationalIdNumber: {
        type: 'string',
        pattern: '^[0-9]{6}-[0-9]{7}$',
      },
      guardianConsent: {
        type: 'string',
      },
      guardianContact: {
        type: 'string',
        pattern: '^[0-9]{3}-[0-9]{4}-[0-9]{4}$',
      },
    },
    if: {
      properties: {
        participantType: { const: 'adult' },
        participantRegion: { const: 'international' },
      },
    },
    then: {
      required: ['name', 'passportNumber', 'visaInformation'],
    },
    else: {
      if: {
        properties: {
          participantType: { const: 'adult' },
          participantRegion: { const: 'domestic' },
        },
      },
      then: {
        required: ['name', 'nationalIdNumber'],
      },
      else: {
        if: {
          properties: {
            participantType: { const: 'minor' },
          },
        },
        then: {
          required: ['name', 'guardianConsent', 'guardianContact'],
        },
        else: {
          required: ['name'],
        },
      },
    },
    required: ['participantType', 'participantRegion'],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>복합 조건 - 이벤트 참가 신청서</h3>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 1:</strong> participantType = "adult" AND
          participantRegion = "international"
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: name, passportNumber, visaInformation
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 2:</strong> participantType = "adult" AND
          participantRegion = "domestic"
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: name, nationalIdNumber
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 3:</strong> participantType = "minor"
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: name, guardianConsent, guardianContact
        </p>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export const IfThenElseComplexLogic = () => {
  const schema = {
    type: 'object',
    properties: {
      accountType: {
        type: 'string',
        enum: ['personal', 'business'],
        default: 'personal',
      },
      subscriptionPlan: {
        type: 'string',
        enum: ['free', 'premium', 'enterprise'],
        default: 'free',
      },
      paymentMethod: {
        type: 'string',
        enum: ['card', 'invoice'],
        default: 'card',
      },
      email: {
        type: 'string',
        format: 'email',
      },
      companyName: {
        type: 'string',
      },
      businessNumber: {
        type: 'string',
        pattern: '^[0-9]{10}$',
      },
      billingAddress: {
        type: 'string',
      },
      purchaseOrder: {
        type: 'string',
      },
      taxDocument: {
        type: 'string',
      },
    },
    if: {
      properties: {
        accountType: { const: 'business' },
        paymentMethod: { const: 'invoice' },
      },
    },
    then: {
      required: [
        'email',
        'companyName',
        'businessNumber',
        'billingAddress',
        'purchaseOrder',
        'taxDocument',
      ],
    },
    else: {
      if: {
        properties: {
          accountType: { const: 'business' },
          paymentMethod: { const: 'card' },
        },
      },
      then: {
        required: ['email', 'companyName', 'businessNumber', 'billingAddress'],
      },
      else: {
        if: {
          properties: {
            accountType: { const: 'personal' },
            subscriptionPlan: { enum: ['premium', 'enterprise'] },
          },
        },
        then: {
          required: ['email', 'billingAddress'],
        },
        else: {
          required: ['email'],
        },
      },
    },
    required: ['accountType', 'subscriptionPlan', 'paymentMethod'],
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);
  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <div
        style={{
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          복잡한 로직 - 계정 가입 및 결제 정보 폼
        </h3>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 1:</strong> accountType = "business" AND paymentMethod =
          "invoice"
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: email, companyName, businessNumber, billingAddress,
          purchaseOrder, taxDocument
        </p>
        <p
          style={{
            margin: '8px 0',
            fontSize: '13px',
            color: '#666',
            paddingLeft: '16px',
          }}
        >
          (기업 계정 + 세금계산서 결제 시 모든 회계 서류 필요)
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 2:</strong> accountType = "business" AND paymentMethod =
          "card"
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: email, companyName, businessNumber, billingAddress
        </p>
        <p
          style={{
            margin: '8px 0',
            fontSize: '13px',
            color: '#666',
            paddingLeft: '16px',
          }}
        >
          (기업 계정 + 카드 결제 시 기본 회사 정보만 필요)
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 3:</strong> accountType = "personal" AND subscriptionPlan
          = "premium" or "enterprise"
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: email, billingAddress
        </p>
        <p
          style={{
            margin: '8px 0',
            fontSize: '13px',
            color: '#666',
            paddingLeft: '16px',
          }}
        >
          (개인 계정 + 유료 플랜은 청구지 주소 필요)
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>조건 4:</strong> 그 외 모든 경우 (개인 계정 + 무료 플랜)
        </p>
        <p style={{ margin: '8px 0', paddingLeft: '16px' }}>
          → 필수 입력: email
        </p>
        <p
          style={{
            margin: '8px 0',
            fontSize: '13px',
            color: '#666',
            paddingLeft: '16px',
          }}
        >
          (무료 플랜은 이메일만 필요)
        </p>
      </div>
      <Form
        jsonSchema={schema}
        onChange={setValue}
        onValidate={setErrors}
        ref={formHandle}
      />
    </StoryLayout>
  );
};
