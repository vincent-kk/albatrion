import React, { useState, useRef } from 'react';
import type { JsonSchema } from '@winglet/json-schema';

import { Form, type FormHandle } from '@canard/schema-form';
import { registerPlugin } from '@canard/schema-form';
import { plugin } from '../src';

registerPlugin(plugin);

export default {
  title: 'MuiPlugin/NullHandling',
};

const StoryLayout = ({ children, value }: any) => (
  <div style={{ display: 'flex', gap: 10 }}>
    <fieldset style={{ flex: 1 }}>
      <legend>Form</legend>
      {children}
    </fieldset>
    <fieldset style={{ flex: 1 }}>
      <legend>Value</legend>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </fieldset>
  </div>
);

export const StringEnumWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);
  
  const jsonSchema = {
    type: 'object',
    properties: {
      selectWithNull: {
        type: 'string',
        enum: [null, 'option1', 'option2', 'option3'],
        formType: 'select',
        nullable: true,
        FormTypeInputProps: {
          placeholder: '값을 선택하세요',
          alias: {
            null: '선택 안함 (null)',
            option1: '옵션 1',
            option2: '옵션 2',
            option3: '옵션 3',
          },
        },
      },
      enumMixedTypes: {
        type: 'string',
        enum: [null, '', 'value1', 'value2'],
        formType: 'enum',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: 'null 값',
            '': '빈 문자열',
            value1: '값 1',
            value2: '값 2',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.setValue({ selectWithNull: null, enumMixedTypes: null })}>
          Set both to null
        </button>
        <button onClick={() => formRef.current?.setValue({ selectWithNull: 'option1', enumMixedTypes: 'value1' })} style={{ marginLeft: 5 }}>
          Set to values
        </button>
        <button onClick={() => console.log('Current value:', value)} style={{ marginLeft: 5 }}>
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
        enum: [null, 'inactive'],
        formType: 'switch',
        nullable: true,
        default: null,
        FormTypeInputProps: {
          alias: {
            null: '활성 (null)',
            inactive: '비활성',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.setValue({ switchWithNull: 'active', switchNullFirst: null })}>
          Toggle switches
        </button>
        <button onClick={() => formRef.current?.setValue({ switchWithNull: null, switchNullFirst: 'inactive' })} style={{ marginLeft: 5 }}>
          Reverse toggle
        </button>
        <button onClick={() => console.log('Current value:', value)} style={{ marginLeft: 5 }}>
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
        enum: [null, 'left', 'center', 'right'],
        formType: 'radio',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: '정렬 안함',
            left: '왼쪽',
            center: '가운데',
            right: '오른쪽',
          },
        },
      },
      radioDefaultNull: {
        type: 'string',
        enum: [null, 'yes', 'no'],
        formType: 'radio',
        nullable: true,
        default: null,
        FormTypeInputProps: {
          alias: {
            null: '미정 (기본값)',
            yes: '예',
            no: '아니오',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.setValue({ radioWithNull: null, radioDefaultNull: null })}>
          Set both to null
        </button>
        <button onClick={() => formRef.current?.setValue({ radioWithNull: 'center', radioDefaultNull: 'yes' })} style={{ marginLeft: 5 }}>
          Set to values
        </button>
        <button onClick={() => console.log('Current value:', value)} style={{ marginLeft: 5 }}>
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
      checkboxDefaultWithNull: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, 'a', 'b', 'c'],
          nullable: true,
        },
        default: [null],
        formType: 'checkbox',
        FormTypeInputProps: {
          alias: {
            null: 'null 포함',
            a: 'A',
            b: 'B',
            c: 'C',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.setValue({ checkboxWithNull: [null], checkboxDefaultWithNull: [null] })}>
          Select only null
        </button>
        <button onClick={() => formRef.current?.setValue({ checkboxWithNull: ['feature1', 'feature2'], checkboxDefaultWithNull: ['a', 'b'] })} style={{ marginLeft: 5 }}>
          Select non-null items
        </button>
        <button onClick={() => console.log('Current value:', value)} style={{ marginLeft: 5 }}>
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
        marks: {
          0: '0',
          25: '25',
          50: '50',
          75: '75',
          100: '100',
        },
      },
      sliderWithDefault: {
        type: 'number',
        nullable: true,
        minimum: -50,
        maximum: 50,
        default: null,
        formType: 'slider',
        marks: {
          '-50': '-50',
          0: '0 (중앙)',
          50: '50',
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.setValue({ sliderNullable: null, sliderWithDefault: null })}>
          Set both to null
        </button>
        <button onClick={() => formRef.current?.setValue({ sliderNullable: 50, sliderWithDefault: 0 })} style={{ marginLeft: 5 }}>
          Set to center values
        </button>
        <button onClick={() => console.log('Current value:', value)} style={{ marginLeft: 5 }}>
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
      multiSelectWithNull: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, 'tag1', 'tag2', 'tag3', 'tag4'],
          nullable: true,
          FormTypeInputProps: {
            alias: {
              null: '태그 없음',
              tag1: '태그 1',
              tag2: '태그 2',
              tag3: '태그 3',
              tag4: '태그 4',
            },
          },
        },
        formType: 'select',
        FormTypeInputProps: {
          placeholder: '여러 태그 선택 (null 포함 가능)',
        },
      },
      mixedValuesEnum: {
        type: 'string',
        enum: ['', null, 'empty', 'filled'],
        formType: 'enum',
        nullable: true,
        default: null,
        FormTypeInputProps: {
          alias: {
            '': '빈 문자열',
            null: 'null (기본값)',
            empty: '빈 상태',
            filled: '채워진 상태',
          },
        },
      },
      radioGroupMixed: {
        type: 'string',
        enum: [null, 'low', 'medium', 'high'],
        formType: 'radio',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: '우선순위 없음',
            low: '낮음',
            medium: '보통',
            high: '높음',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.setValue({ 
          multiSelectWithNull: [null],
          mixedValuesEnum: null,
          radioGroupMixed: null
        })}>
          Set all to null
        </button>
        <button onClick={() => formRef.current?.setValue({ 
          multiSelectWithNull: ['tag1', 'tag2'],
          mixedValuesEnum: 'filled',
          radioGroupMixed: 'high'
        })} style={{ marginLeft: 5 }}>
          Set to values
        </button>
        <button onClick={() => console.log('Current value:', value)} style={{ marginLeft: 5 }}>
          Log to console
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} defaultValue={{
          mixedValuesEnum: null
        }} />
      </StoryLayout>
    </div>
  );
};