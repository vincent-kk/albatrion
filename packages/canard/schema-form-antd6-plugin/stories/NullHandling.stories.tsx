import React, { useRef, useState } from 'react';

import type { JsonSchema } from '@winglet/json-schema';

import { Form, type FormHandle } from '@canard/schema-form';
import { registerPlugin } from '@canard/schema-form';

import { plugin } from '../src';

registerPlugin(plugin);

export default {
  title: 'AntdPlugin/NullHandling',
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

export const NumberInputWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      nullableNumber: {
        type: 'number',
        nullable: true,
        FormTypeInputProps: {
          placeholder: 'null 값 허용 (빈 입력 시 null)',
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
      radioMixedTypes: {
        type: 'string',
        enum: [null, 'zero', 'one', 'text'],
        formType: 'radio',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: 'null 값',
            zero: '숫자 0',
            one: '숫자 1',
            text: '텍스트',
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
              radioMixedTypes: null,
            })
          }
        >
          Set both to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              radioWithNull: 'option1',
              radioMixedTypes: 'text',
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
          enum: [null, 'item1', 'item2', 'item3'],
          nullable: true,
          FormTypeInputProps: {
            alias: {
              null: '없음',
              item1: '항목 1',
              item2: '항목 2',
              item3: '항목 3',
            },
          },
        },
        formType: 'checkbox',
      },
      checkboxMixed: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, '', 'filled', 'num123'],
          nullable: true,
          FormTypeInputProps: {
            alias: {
              null: 'null 값',
              '': '빈 문자열',
              filled: '채워진 값',
              num123: '숫자 123',
            },
          },
        },
        formType: 'checkbox',
        default: [null],
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
              checkboxWithNull: [null, 'item1'],
              checkboxMixed: ['', 'filled'],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Mixed selection
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

export const StringEnumWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      selectWithNull: {
        type: 'string',
        enum: [null, 'value1', 'value2', 'value3'],
        formType: 'select',
        nullable: true,
        FormTypeInputProps: {
          placeholder: '값을 선택하세요',
          alias: {
            null: '선택 안함 (null)',
            value1: '값 1',
            value2: '값 2',
            value3: '값 3',
          },
        },
      },
      selectMultipleWithNull: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, 'a', 'b', 'c'],
          nullable: true,
          FormTypeInputProps: {
            alias: {
              null: 'null 포함',
              a: 'A',
              b: 'B',
              c: 'C',
            },
          },
        },
        formType: 'select',
        FormTypeInputProps: {
          placeholder: '여러 개 선택 (null 포함 가능)',
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
              selectWithNull: null,
              selectMultipleWithNull: [null],
            })
          }
        >
          Set to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              selectWithNull: 'value1',
              selectMultipleWithNull: ['a', 'b'],
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

export const StringSwitchWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      switchNullOff: {
        type: 'string',
        enum: ['on', null],
        formType: 'switch',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            on: '켜짐',
            null: '꺼짐 (null)',
          },
        },
      },
      switchNullOn: {
        type: 'string',
        enum: [null, 'off'],
        formType: 'switch',
        nullable: true,
        default: null,
        FormTypeInputProps: {
          alias: {
            null: '켜짐 (null)',
            off: '꺼짐',
          },
        },
      },
      switchBothNull: {
        type: 'string',
        enum: [null, null],
        formType: 'switch',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: 'null 상태',
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
              switchNullOff: 'on',
              switchNullOn: null,
              switchBothNull: null,
            })
          }
        >
          Toggle switches
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              switchNullOff: null,
              switchNullOn: 'off',
              switchBothNull: null,
            })
          }
          style={{ marginLeft: 5 }}
        >
          Reverse toggle
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
      mixedEnum: {
        type: 'string',
        enum: ['', null, 'value', 'zero', 'false'],
        formType: 'select',
        nullable: true,
        FormTypeInputProps: {
          placeholder: '다양한 값들',
          alias: {
            '': '빈 문자열',
            null: 'null',
            value: '일반 값',
            zero: '숫자 0',
            false: 'false 문자열',
          },
        },
      },
      radioGroupDefault: {
        type: 'string',
        enum: [null, 'yes', 'no', 'maybe'],
        default: null,
        formType: 'radio',
        nullable: true,
        FormTypeInputProps: {
          alias: {
            null: '미정 (기본값)',
            yes: '예',
            no: '아니오',
            maybe: '아마도',
          },
        },
      },
      checkboxArrayDefaults: {
        type: 'array',
        items: {
          type: 'string',
          enum: [null, 'red', 'green', 'blue'],
          nullable: true,
        },
        default: [null, 'red'],
        formType: 'checkbox',
        FormTypeInputProps: {
          alias: {
            null: '무색 (null)',
            red: '빨강',
            green: '초록',
            blue: '파랑',
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
              mixedEnum: null,
              radioGroupDefault: null,
              checkboxArrayDefaults: [null],
            })
          }
        >
          Set all to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              mixedEnum: '',
              radioGroupDefault: 'yes',
              checkboxArrayDefaults: ['red', 'green', 'blue'],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set mixed values
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
            checkboxArrayDefaults: [null, 'red'],
          }}
        />
      </StoryLayout>
    </div>
  );
};
