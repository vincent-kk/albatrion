import { type ReactNode, useState } from 'react';

import {
  Form,
  type FormTypeRendererProps,
  type JSONSchema,
  type JSONSchemaError,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

export default {
  title: 'Form/33. FormTypeRendererProps With ReactNode',
};

/**
 * NOTE: Storybook Key Warning - Root Cause Analysis
 *
 * Some stories may show a React key warning in the console:
 * "Each child in a list should have a unique 'key' prop. Check the render method of `hookified`."
 *
 * ## Root Cause (Verified through black-box testing)
 *
 * The warning occurs when ALL of these conditions are met:
 * 1. CustomFormTypeRenderer is used
 * 2. Flat schema structure (fields directly at root level)
 * 3. ReactNode contains NESTED child elements (e.g., <span><a>...</a></span>)
 *
 * ## Pattern Analysis (Hypothesis Testing Results)
 *
 * | Pattern | helperText | description | Warning |
 * |---------|------------|-------------|---------|
 * | HypothesisC | `<span>text</span>` (단일) | `<strong>text</strong>` (단일) | ❌ None |
 * | HypothesisD | `<span>📧 text</span>` (단일) | `<strong>text</strong>` (단일) | ❌ None |
 * | HypothesisE | `<span>text <a>link</a></span>` (중첩) | `<strong>text</strong>` (단일) | ⚠️ Warning |
 * | HypothesisF | `<span>text <span>nested</span></span>` (중첩) | `<strong>text</strong>` (단일) | ⚠️ Warning |
 * | HypothesisG | `<span>text</span>` (단일) | `<span>text <strong>nested</strong></span>` (중첩) | ⚠️ Warning |
 * | HypothesisI | `<span key="...">text <a key="...">link</a></span>` (중첩+key) | `<strong key="...">text</strong>` | ❌ None |
 * | NestedObjectWithReactNode | 중첩 (nested schema 내부) | 중첩 (nested schema 내부) | ❌ None |
 *
 * ## Root Cause Explained
 * React의 `warnForMissingKey` 함수가 Storybook의 `hookified` wrapper에서 children을 리스트로 처리할 때,
 * 중첩된 ReactNode (예: `<span>text <a>link</a></span>`)의 children이 배열 `['text ', <a>link</a>]`로 변환됩니다.
 * 이 배열의 요소들에 key가 없으면 React가 경고를 발생시킵니다.
 *
 * ## Conclusion
 * - ReactNode에 중첩 자식 요소가 포함되면, helperText든 description이든 상관없이 key 경고 발생
 * - 중첩 스키마 구조에서는 중첩 ReactNode를 사용해도 경고 없음
 * - **해결책: 중첩된 모든 요소에 고유한 key prop 추가**
 *
 * ## Workarounds (권장 순서)
 * 1. **Add key props**: 중첩 ReactNode의 모든 요소에 고유한 key 추가 (HypothesisI 참조)
 * 2. Use single-level ReactNode without nested child elements
 * 3. Use nested schema structure (wrap fields in an object)
 * 4. Use default FormGroupRenderer (no CustomFormTypeRenderer)
 *
 * ## Important
 * - This is a Storybook-specific behavior, NOT a Form library bug
 * - Form functionality works correctly (validation, data binding, rendering)
 * - The warning is related to how Storybook's `hookified` wrapper handles ReactNode props
 */

/**
 * Custom FormTypeRenderer that renders helperText and description as ReactNode
 * Reference: FormGroupRenderer.tsx
 */
const CustomFormTypeRenderer = ({
  node,
  depth,
  path,
  name,
  required,
  Input,
  errorMessage,
  style,
  className,
  helperText,
  description,
}: FormTypeRendererProps & {
  helperText?: ReactNode;
  description?: ReactNode;
}) => {
  if (depth === 0) return <Input />;

  if (node.group === 'branch') {
    return (
      <fieldset
        style={{
          marginBottom: 10,
          marginLeft: 5 * depth,
          border: '1px solid #ddd',
          padding: 10,
          borderRadius: 4,
          ...style,
        }}
        className={className}
      >
        <legend style={{ fontWeight: 'bold' }}>{name}</legend>
        {description && (
          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: 8 }}>
            {description}
          </div>
        )}
        <Input />
        {helperText && (
          <div style={{ fontSize: '0.85em', color: '#888', marginTop: 4 }}>
            {helperText}
          </div>
        )}
        {errorMessage && (
          <em style={{ fontSize: '0.85em', color: 'red', display: 'block' }}>
            {errorMessage}
          </em>
        )}
      </fieldset>
    );
  }

  return (
    <div
      style={{
        marginBottom: 10,
        marginLeft: 5 * depth,
        ...style,
      }}
      className={className}
    >
      <label htmlFor={path} style={{ marginRight: 5, fontWeight: 'bold' }}>
        {name} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {description && (
        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: 4 }}>
          {description}
        </div>
      )}
      <Input />
      {helperText && (
        <div style={{ fontSize: '0.85em', color: '#888', marginTop: 4 }}>
          {helperText}
        </div>
      )}
      {errorMessage && (
        <em
          style={{
            fontSize: '0.85em',
            color: 'red',
            display: 'block',
            marginTop: 2,
          }}
        >
          {errorMessage}
        </em>
      )}
    </div>
  );
};

// ============================================================================
// Story 1: Basic Text Helper/Description
// Tests string-based helperText and description
// ============================================================================
export const BasicTextHelperDescription = () => {
  const schema = {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        FormTypeRendererProps: {
          helperText: '3자 이상 입력하세요',
          description: '사용자 이름을 입력합니다',
        },
      },
      password: {
        type: 'string',
        minLength: 8,
        FormTypeRendererProps: {
          helperText: '8자 이상의 비밀번호를 입력하세요',
          description: '보안을 위해 복잡한 비밀번호를 사용하세요',
        },
      },
    },
    required: ['username', 'password'],
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JSONSchemaError[]>();

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        CustomFormTypeRenderer={CustomFormTypeRenderer}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

// ============================================================================
// Story 2: ReactNode Helper/Description (Core Test)
// Tests JSX Element rendering with icons, links, styled elements
// This is the KEY test for verifying stripSchemaExtensions works correctly
// ============================================================================
export const ReactNodeHelperDescription = () => {
  const schema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        FormTypeRendererProps: {
          helperText: <span>📧 유효한 이메일 형식으로 입력하세요</span>,
          description: <strong>이메일 주소</strong>,
        },
      },
      website: {
        type: 'string',
        format: 'uri',
        FormTypeRendererProps: {
          helperText: (
            <span>
              예시:{' '}
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff' }}
              >
                https://example.com
              </a>
            </span>
          ),
          description: <em>웹사이트 URL (선택사항)</em>,
        },
      },
      phone: {
        type: 'string',
        FormTypeRendererProps: {
          helperText: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              📞 <span style={{ color: '#666' }}>하이픈(-) 없이 입력</span>
            </span>
          ),
          description: (
            <span>
              <strong>연락처</strong> - 숫자만 입력
            </span>
          ),
        },
      },
    },
    required: ['email'],
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JSONSchemaError[]>();

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        CustomFormTypeRenderer={CustomFormTypeRenderer}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

// ============================================================================
// Story 3: With Required Validation
// Tests that validation works correctly with ReactNode props
// Ensures no circular reference errors occur during validation
// ============================================================================
export const WithRequiredValidation = () => {
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 20,
        FormTypeRendererProps: {
          helperText: (
            <span style={{ color: '#0066cc' }}>ℹ️ 2~20자 사이로 입력</span>
          ),
          description: <strong>필수 입력 항목</strong>,
        },
        errorMessages: {
          minLength: '이름은 최소 {limit}자 이상이어야 합니다',
          maxLength: '이름은 최대 {limit}자까지 가능합니다',
          required: '이름은 필수입니다',
        },
      },
      age: {
        type: 'number',
        minimum: 0,
        maximum: 150,
        FormTypeRendererProps: {
          helperText: <span>🔢 0~150 범위의 숫자</span>,
          description: (
            <span>
              <em>나이</em> (필수)
            </span>
          ),
        },
        errorMessages: {
          minimum: '나이는 {limit} 이상이어야 합니다',
          maximum: '나이는 {limit} 이하여야 합니다',
          required: '나이는 필수입니다',
        },
      },
      email: {
        type: 'string',
        format: 'email',
        FormTypeRendererProps: {
          helperText: (
            <span>
              ✉️ 예:{' '}
              <code style={{ background: '#f5f5f5' }}>user@domain.com</code>
            </span>
          ),
        },
        errorMessages: {
          format: '올바른 이메일 형식이 아닙니다',
          required: '이메일은 필수입니다',
        },
      },
    },
    required: ['name', 'age', 'email'],
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JSONSchemaError[]>();

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        CustomFormTypeRenderer={CustomFormTypeRenderer}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

// ============================================================================
// Story 4: Nested Object with ReactNode
// Tests that ReactNode props work correctly in nested object schemas
// ============================================================================
export const NestedObjectWithReactNode = () => {
  const schema = {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        FormTypeRendererProps: {
          description: (
            <h4 style={{ margin: 0, color: '#333' }}>👤 프로필 정보</h4>
          ),
        },
        properties: {
          nickname: {
            type: 'string',
            minLength: 2,
            maxLength: 15,
            FormTypeRendererProps: {
              helperText: <span>🎭 2~15자 닉네임</span>,
              description: <strong>표시될 이름</strong>,
            },
          },
          bio: {
            type: 'string',
            maxLength: 200,
            FormTypeRendererProps: {
              helperText: (
                <span style={{ color: '#888' }}>📝 자기소개 (최대 200자)</span>
              ),
              description: <em>선택 사항</em>,
            },
          },
        },
        required: ['nickname'],
      },
      settings: {
        type: 'object',
        FormTypeRendererProps: {
          description: <h4 style={{ margin: 0, color: '#333' }}>⚙️ 설정</h4>,
        },
        properties: {
          theme: {
            type: 'string',
            enum: ['light', 'dark', 'auto'],
            default: 'auto',
            FormTypeRendererProps: {
              helperText: (
                <span>
                  🎨 테마 선택:{' '}
                  <code style={{ background: '#f0f0f0', padding: '2px 4px' }}>
                    light | dark | auto
                  </code>
                </span>
              ),
            },
          },
          notifications: {
            type: 'boolean',
            default: true,
            FormTypeRendererProps: {
              helperText: <span>🔔 알림 수신 여부</span>,
              description: (
                <span>
                  <strong>알림</strong> - 이메일 및 푸시 알림
                </span>
              ),
            },
          },
        },
      },
    },
  } satisfies JSONSchema;

  const [value, setValue] = useState<Record<string, unknown>>();
  const [errors, setErrors] = useState<JSONSchemaError[]>();

  return (
    <StoryLayout jsonSchema={schema} value={value} errors={errors}>
      <Form
        jsonSchema={schema}
        CustomFormTypeRenderer={CustomFormTypeRenderer}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};
