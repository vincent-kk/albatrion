import React, { useRef, useState } from 'react';

import type { JsonSchema } from '@winglet/json-schema';

import { Form, type FormHandle } from '@canard/schema-form';
import { registerPlugin } from '@canard/schema-form';

import { plugin } from '../src';

registerPlugin(plugin);

export default {
  title: 'AntdMobilePlugin/NullHandling',
};

const StoryLayout = ({ children, value }: any) => (
  <div style={{ display: 'flex', gap: 10 }}>
    <fieldset style={{ flex: 1, minWidth: 300 }}>
      <legend>Mobile Form</legend>
      {children}
    </fieldset>
    <fieldset style={{ flex: 1 }}>
      <legend>Value</legend>
      <pre style={{ fontSize: '12px' }}>{JSON.stringify(value, null, 2)}</pre>
    </fieldset>
  </div>
);

export const NumberWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      nullableNumber: {
        type: 'number',
        nullable: true,
        FormTypeInputProps: {
          placeholder: 'null 값 허용 (Stepper)',
        },
      },
      numberWithDefault: {
        type: 'number',
        nullable: true,
        default: null,
        FormTypeInputProps: {
          placeholder: '기본값이 null인 숫자',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              nullableNumber: null,
              numberWithDefault: null,
            })
          }
        >
          Set all to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              nullableNumber: 42,
              numberWithDefault: 10,
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set to numbers
        </button>
        <button
          onClick={() => console.log('Current value:', value)}
          style={{ marginLeft: 5 }}
        >
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const RadioGroupWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      radioWithNull: {
        type: 'string',
        enum: [null, 'option1', 'option2', 'option3'],
        formType: 'radio',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: '선택 안함',
            option1: '옵션 1',
            option2: '옵션 2',
            option3: '옵션 3',
          },
        },
      },
      numberRadio: {
        type: 'number',
        enum: [null, 1, 2, 3],
        formType: 'radiogroup',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: '미정',
            '1': '하나',
            '2': '둘',
            '3': '셋',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              radioWithNull: null,
              numberRadio: null,
            })
          }
        >
          Set both to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              radioWithNull: 'option1',
              numberRadio: 2,
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set to values
        </button>
        <button
          onClick={() => console.log('Current value:', value)}
          style={{ marginLeft: 5 }}
        >
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const StringCheckboxWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      checkboxWithNull: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, 'feature1', 'feature2', 'feature3'],
          nullable: true,
          FormTypeInputProps: {
            alias: {
              null: '기본 기능',
              feature1: '기능 1',
              feature2: '기능 2',
              feature3: '기능 3',
            },
          },
        },
        formType: 'checkbox',
      },
      checkboxMixed: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, '', 'filled', 'special'],
          nullable: true,
        },
        formType: 'checkbox',
        default: [null],
        FormTypeInputProps: {
          alias: {
            null: 'null 값',
            '': '빈 문자열',
            filled: '채워진 값',
            special: '특별한 값',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              checkboxWithNull: [null],
              checkboxMixed: [null],
            })
          }
        >
          Select only null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              checkboxWithNull: ['feature1', 'feature2'],
              checkboxMixed: ['filled', 'special'],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Select features
        </button>
        <button
          onClick={() => console.log('Current value:', value)}
          style={{ marginLeft: 5 }}
        >
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const StringSwitchWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      switchWithNull: {
        type: 'string',
        enum: ['active', null],
        formType: 'switch',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            active: '활성',
            null: '비활성 (null)',
          },
        },
      },
      switchNullFirst: {
        type: 'string',
        enum: [null, 'disabled'],
        formType: 'switch',
        nullable: true,
        default: null,
        FormTypeInputProps: {
          alias: {
            null: '켜짐 (null)',
            disabled: '꺼짐',
          },
        },
      },
      booleanSwitch: {
        type: 'boolean',
        formType: 'switch',
        nullable: false,
        FormTypeInputProps: {
          alias: {
            true: '참',
            false: '거짓',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              switchWithNull: 'active',
              switchNullFirst: null,
              booleanSwitch: true,
            })
          }
        >
          Toggle ON
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              switchWithNull: null,
              switchNullFirst: 'disabled',
              booleanSwitch: false,
            })
          }
          style={{ marginLeft: 5 }}
        >
          Toggle OFF
        </button>
        <button
          onClick={() => console.log('Current value:', value)}
          style={{ marginLeft: 5 }}
        >
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const SliderWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      sliderNullable: {
        type: 'number',
        nullable: true,
        minimum: 0,
        maximum: 100,
        formType: 'slider',
      },
      sliderWithDefault: {
        type: 'number',
        nullable: true,
        minimum: -50,
        maximum: 50,
        default: null,
        formType: 'slider',
      },
      rangeSlider: {
        type: 'array',
        items: {
          type: 'number',
          nullable: true,
        },
        minimum: 0,
        maximum: 100,
        formType: 'slider',
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              sliderNullable: null,
              sliderWithDefault: null,
              rangeSlider: [null, null],
            })
          }
        >
          Set all to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              sliderNullable: 50,
              sliderWithDefault: 0,
              rangeSlider: [20, 80],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set values
        </button>
        <button
          onClick={() => console.log('Current value:', value)}
          style={{ marginLeft: 5 }}
        >
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const ComplexNullScenarios = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      mixedTypes: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, '', 'value1', 'value2'],
          nullable: true,
        },
        formType: 'checkbox',
        FormTypeInputProps: {
          alias: {
            null: 'null 값',
            '': '빈 문자열',
            value1: '값 1',
            value2: '값 2',
          },
        },
      },
      radioGroupDefault: {
        type: 'string',
        enum: [null, 'low', 'medium', 'high'],
        default: null,
        formType: 'radiogroup',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: '우선순위 없음 (기본)',
            low: '낮음',
            medium: '보통',
            high: '높음',
          },
        },
      },
      dynamicArray: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              nullable: true,
            },
            priority: {
              type: 'string',
              enum: [null, 'low', 'high'],
              nullable: true,
              formType: 'switch',
              FormTypeInputProps: {
                alias: {
                  null: '보통',
                  low: '낮음',
                  high: '높음',
                },
              },
            },
          },
        },
        formType: 'array',
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              mixedTypes: [null, ''],
              radioGroupDefault: null,
              dynamicArray: [{ name: null, priority: null }],
            })
          }
        >
          Set mixed nulls
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              mixedTypes: ['value1', 'value2'],
              radioGroupDefault: 'high',
              dynamicArray: [{ name: 'Task 1', priority: 'high' }],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set values
        </button>
        <button
          onClick={() => console.log('Current value:', value)}
          style={{ marginLeft: 5 }}
        >
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form
          ref={formRef}
          jsonSchema={jsonSchema}
          onChange={setValue}
          defaultValue={{
            radioGroupDefault: null,
            dynamicArray: [],
          }}
        />
      </StoryLayout>
    </div>
  );
};
