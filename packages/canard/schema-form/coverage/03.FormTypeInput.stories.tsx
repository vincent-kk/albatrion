import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputDefinition,
  type FormTypeInputMap,
  type FormTypeInputProps,
  type JsonSchema,
  SetValueOption,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/03. FormTypeInput',
};

export const FormTypeInputDefinitions = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
        formType: 'text-node',
      },
      arrayNode: {
        type: 'array',
        items: {
          type: 'string',
          formType: 'array-item',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeInputDefinitions = useMemo<FormTypeInputDefinition[]>(() => {
    return [
      {
        test: (hint) => {
          return hint.path === '$.objectNode';
        },
        Component: ({ onChange }: FormTypeInputProps<{ test?: string }>) => {
          const handleClick = () => {
            onChange({ test: 'wow' });
          };
          return (
            <div>
              <button style={{ color: 'green' }} onClick={handleClick}>
                object set
              </button>
            </div>
          );
        },
      },
      {
        test: (hint) => {
          return hint.formType === 'text-node';
        },
        Component: ({ onChange }: FormTypeInputProps) => {
          return (
            <button style={{ color: 'blue' }} onClick={() => onChange('wow')}>
              text set
            </button>
          );
        },
      },
      {
        test: { formType: 'array-item' },
        Component: () => {
          return <div style={{ color: 'red' }}>i am array item</div>;
        },
      },
    ];
  }, []);

  const handleChange = (val: any) => {
    setValue(val);
  };
  const refHandle = useRef<FormHandle<typeof schema>>(null);
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        formTypeInputDefinitions={formTypeInputDefinitions}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};
export const FormTypeMap = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      objectNode: {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
      },
      arrayNode: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '#/objectNode': ({
        onChange,
      }: FormTypeInputProps<{ test?: string } | undefined>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, SetValueOption.Overwrite);
        };
        const removeClick = () => {
          onChange(undefined, SetValueOption.Overwrite);
        };
        return (
          <div>
            <button onClick={handleClick}>object set</button>
            <button onClick={handleUnsetClick}>object unset</button>
            <button onClick={removeClick}>object remove</button>
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

  const handleChange = (val: any) => {
    setValue(val);
  };
  const refHandle = useRef<FormHandle<typeof schema>>(null);
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};

export const FormTypeMapWithEscapedPath = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      'object/Node': {
        type: 'object',
        properties: {
          test: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
      },
      'array~Node': {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '/object~1Node': ({
        onChange,
      }: FormTypeInputProps<{ test?: string } | undefined>) => {
        const handleClick = () => {
          onChange({ test: 'wow' });
        };
        const handleUnsetClick = () => {
          onChange({}, SetValueOption.Overwrite);
        };
        const removeClick = () => {
          onChange(undefined, SetValueOption.Overwrite);
        };
        return (
          <div>
            <button onClick={handleClick}>object set</button>
            <button onClick={handleUnsetClick}>object unset</button>
            <button onClick={removeClick}>object remove</button>
          </div>
        );
      },
      '/textNode': ({ onChange }: FormTypeInputProps) => {
        const handleClick = () => {
          onChange('wow');
        };
        return <button onClick={handleClick}>text set</button>;
      },
      '#/array~0Node/*': () => {
        return <div>i am array item</div>;
      },
    };
  }, []);

  const handleChange = (val: any) => {
    setValue(val);
  };
  const refHandle = useRef<FormHandle<typeof schema>>(null);
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};

export const FormTypeMapWithRegex = () => {
  const [value, setValue] = useState({});
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      objectNode: {
        type: 'object',
        properties: {
          test1: { type: 'string' },
          _test2: { type: 'string' },
          _test3: { type: 'string' },
          test4: { type: 'string' },
        },
      },
      textNode: {
        type: 'string',
      },
      arrayNode: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 5,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      '_test\\d': ({ onChange }: FormTypeInputProps<string | undefined>) => {
        const handleClick = () => {
          onChange('wow');
        };
        const handleUnsetClick = () => {
          onChange(undefined);
        };
        return (
          <div>
            <button onClick={handleClick}>text set</button>
            <button onClick={handleUnsetClick}>text unset</button>
          </div>
        );
      },
      '#/textNode': ({ onChange }: FormTypeInputProps) => {
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

  const handleChange = (val: any) => {
    setValue(val);
  };
  const refHandle = useRef<FormHandle<typeof schema>>(null);
  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form
        ref={refHandle}
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};

export const FormTypeComponentInJsonSchema = () => {
  const CustomFormTypeStringInput = useCallback(
    ({ defaultValue, onChange }: FormTypeInputProps<string>) => {
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.value);
      };
      return (
        <div>
          <h3>CustomFormTypeStringInput</h3>
          <input
            type="text"
            defaultValue={defaultValue}
            onChange={handleChange}
          />
          <hr />
        </div>
      );
    },
    [],
  );

  const CustomFormTypeNumberInput = useCallback(
    ({ defaultValue, onChange }: FormTypeInputProps<number>) => {
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.valueAsNumber);
      };
      return (
        <div>
          <h3>CustomFormTypeNumberInput</h3>
          <input
            type="number"
            defaultValue={defaultValue}
            onChange={handleChange}
          />
          <hr />
        </div>
      );
    },
    [],
  );
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      nameCustom: {
        type: 'string',
        FormTypeInput: CustomFormTypeStringInput,
      },
      age: {
        type: 'number',
      },
      ageCustom: {
        type: 'number',
        FormTypeInput: CustomFormTypeNumberInput,
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

/**
 * 와일드카드(*)가 모든 필드를 매칭하는 확장 기능 데모
 *
 * - 배열 인덱스뿐만 아니라 문자열 키도 매칭
 * - additionalProperties가 있는 객체에서 동적 키 처리에 유용
 * - 다양한 이름의 필드에 동일한 컴포넌트 적용 가능
 */
export const FormTypeMapWithWildcardForAllFields = () => {
  const [value, setValue] = useState({});

  // additionalProperties를 사용하는 스키마 - 동적 키를 가진 객체
  const schema = {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        description: '동적 키를 가진 메타데이터 객체',
        properties: {
          author: { type: 'string' },
          version: { type: 'string' },
          environment: { type: 'string' },
        },
      },
      config: {
        type: 'object',
        description: '중첩된 설정 객체',
        properties: {
          theme: {
            type: 'object',
            properties: {
              primary: { type: 'string' },
              secondary: { type: 'string' },
              accent: { type: 'string' },
            },
            additionalProperties: false,
          },
          features: {
            type: 'object',
            properties: {
              darkMode: { type: 'boolean' },
              notifications: { type: 'boolean' },
              analytics: { type: 'boolean' },
            },
          },
        },
      },
      users: {
        type: 'array',
        description: '사용자 배열',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
          },
        },
        minItems: 2,
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      // 와일드카드로 metadata의 모든 동적 키 매칭
      '/metadata/*': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const keyName = path.split('/').pop() || '';
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px solid #4CAF50',
              borderRadius: '4px',
              backgroundColor: '#E8F5E9',
            }}
          >
            <label style={{ fontWeight: 'bold', color: '#2E7D32' }}>
              📝 Metadata: {keyName}
            </label>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                border: '1px solid #4CAF50',
                borderRadius: '4px',
              }}
              placeholder={`Enter ${keyName}`}
            />
          </div>
        );
      },

      // 중첩 와일드카드로 config/theme의 모든 설정 매칭
      '/config/theme/*': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const keyName = path.split('/').pop() || '';
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px solid #2196F3',
              borderRadius: '4px',
              backgroundColor: '#E3F2FD',
            }}
          >
            <label style={{ fontWeight: 'bold', color: '#1565C0' }}>
              🎨 Theme: {keyName}
            </label>
            <input
              type="color"
              value={value ?? '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginLeft: '8px' }}
            />
            <span style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
              {value}
            </span>
          </div>
        );
      },

      // config/features의 모든 boolean 설정 매칭
      '/config/features/*': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<boolean>) => {
        const keyName = path.split('/').pop() || '';
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px solid #FF9800',
              borderRadius: '4px',
              backgroundColor: '#FFF3E0',
            }}
          >
            <label style={{ fontWeight: 'bold', color: '#E65100' }}>
              ⚙️ Feature: {keyName}
            </label>
            <input
              type="checkbox"
              checked={value ?? false}
              onChange={(e) => onChange(e.target.checked)}
              style={{ marginLeft: '8px', width: '20px', height: '20px' }}
            />
            <span style={{ marginLeft: '8px' }}>
              {value ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        );
      },

      // 배열 인덱스에도 와일드카드 적용 (기존 기능)
      '/users/*/name': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const index = path.split('/')[2];
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px solid #9C27B0',
              borderRadius: '4px',
              backgroundColor: '#F3E5F5',
            }}
          >
            <label style={{ fontWeight: 'bold', color: '#6A1B9A' }}>
              👤 User #{index} Name
            </label>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                border: '1px solid #9C27B0',
                borderRadius: '4px',
              }}
              placeholder="Enter name"
            />
          </div>
        );
      },

      '/users/*/role': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const index = path.split('/')[2];
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px solid #E91E63',
              borderRadius: '4px',
              backgroundColor: '#FCE4EC',
            }}
          >
            <label style={{ fontWeight: 'bold', color: '#AD1457' }}>
              🎭 User #{index} Role
            </label>
            <select
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                border: '1px solid #E91E63',
                borderRadius: '4px',
              }}
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        );
      },
    };
  }, []);

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <div style={{ marginBottom: '16px' }}>
        <h3>와일드카드(*) 확장 기능 데모</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          와일드카드(*)는 이제 배열 인덱스뿐만 아니라{' '}
          <strong>모든 필드명</strong>을 매칭합니다. 이 기능은
          additionalProperties가 있는 스키마에서 동적 키를 처리하는 데
          유용합니다.
        </p>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginTop: '12px',
          }}
        >
          <strong>매칭 패턴:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>
              <code>/metadata/*</code> → 📝 메타데이터의 모든 동적 키
            </li>
            <li>
              <code>/config/theme/*</code> → 🎨 테마 설정의 모든 키
            </li>
            <li>
              <code>/config/features/*</code> → ⚙️ 기능 토글의 모든 키
            </li>
            <li>
              <code>/users/*/name</code> → 👤 모든 사용자의 이름 필드
            </li>
            <li>
              <code>/users/*/role</code> → 🎭 모든 사용자의 역할 필드
            </li>
          </ul>
        </div>
      </div>
      <Form
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
        defaultValue={{
          metadata: {
            author: 'Vincent',
            version: '1.0.0',
            environment: 'development',
          },
          config: {
            theme: {
              primary: '#1976D2',
              secondary: '#424242',
              accent: '#82B1FF',
            },
            features: {
              darkMode: true,
              notifications: false,
              analytics: true,
            },
          },
          users: [
            { name: 'Alice', role: 'admin' },
            { name: 'Bob', role: 'user' },
          ],
        }}
      />
    </StoryLayout>
  );
};

/**
 * 와일드카드 vs 정규식 비교 데모
 *
 * 동일한 목적을 달성하기 위한 두 가지 접근 방식:
 * - 와일드카드(*): 세그먼트 단위 매칭, 간단하고 직관적
 * - 정규식: 더 복잡한 패턴 매칭 가능
 */
export const WildcardVsRegexComparison = () => {
  const [value, setValue] = useState({});

  const schema = {
    type: 'object',
    properties: {
      wildcardSection: {
        type: 'object',
        description: '와일드카드 패턴으로 매칭되는 섹션',
        properties: {
          fieldA: { type: 'string' },
          fieldB: { type: 'string' },
          fieldC: { type: 'string' },
        },
      },
      regexSection: {
        type: 'object',
        description: '정규식 패턴으로 매칭되는 섹션',
        properties: {
          input1: { type: 'string' },
          input2: { type: 'string' },
          input3: { type: 'string' },
        },
      },
      mixedSection: {
        type: 'object',
        description: '혼합 패턴 섹션',
        properties: {
          prefix_alpha: { type: 'string' },
          prefix_beta: { type: 'string' },
          other: { type: 'string' },
        },
      },
    },
  } satisfies JsonSchema;

  const formTypeMap = useMemo<FormTypeInputMap>(() => {
    return {
      // 와일드카드: 모든 필드 매칭
      '/wildcardSection/*': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const keyName = path.split('/').pop() || '';
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px dashed #4CAF50',
              borderRadius: '4px',
            }}
          >
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
              [Wildcard *] {keyName}:
            </span>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginLeft: '8px', padding: '4px' }}
            />
          </div>
        );
      },

      // 정규식: input으로 시작하는 필드만 매칭
      '/regexSection/input\\d+': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const keyName = path.split('/').pop() || '';
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px solid #2196F3',
              borderRadius: '4px',
            }}
          >
            <span style={{ color: '#2196F3', fontWeight: 'bold' }}>
              [Regex input\d+] {keyName}:
            </span>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginLeft: '8px', padding: '4px' }}
            />
          </div>
        );
      },

      // 정규식: prefix_로 시작하는 필드만 매칭
      '/mixedSection/prefix_.*': ({
        value,
        onChange,
        path,
      }: FormTypeInputProps<string>) => {
        const keyName = path.split('/').pop() || '';
        return (
          <div
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '2px dotted #FF9800',
              borderRadius: '4px',
            }}
          >
            <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
              [Regex prefix_.*] {keyName}:
            </span>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginLeft: '8px', padding: '4px' }}
            />
          </div>
        );
      },
    };
  }, []);

  const handleChange = (val: any) => {
    setValue(val);
  };

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <div style={{ marginBottom: '16px' }}>
        <h3>와일드카드(*) vs 정규식 비교</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '12px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>패턴</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                매칭 대상
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>
                사용 시기
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  color: '#4CAF50',
                }}
              >
                <code>/wildcardSection/*</code>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                모든 필드 (fieldA, fieldB, fieldC)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                특정 세그먼트의 모든 값 매칭
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  color: '#2196F3',
                }}
              >
                <code>/regexSection/input\d+</code>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                input1, input2, input3만
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                특정 패턴의 필드만 매칭
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  color: '#FF9800',
                }}
              >
                <code>/mixedSection/prefix_.*</code>
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                prefix_alpha, prefix_beta만 (other는 제외)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                접두사 기반 필터링
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Form
        jsonSchema={schema}
        formTypeInputMap={formTypeMap}
        onChange={handleChange}
      />
    </StoryLayout>
  );
};
