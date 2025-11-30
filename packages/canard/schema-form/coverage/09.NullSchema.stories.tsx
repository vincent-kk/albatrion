import { useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type JsonSchema,
  type JsonSchemaError,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/09. NullSchema',
};

export const NullSchema = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      string: {
        type: 'string',
      },
      null: {
        type: 'null',
        nullable: true,
        FormTypeInput: ({ value, onChange }) => {
          return (
            <div>
              this is {JSON.stringify(value, null, 2)}
              <div>
                <button onClick={() => onChange(undefined)}>unset</button>
                <button onClick={() => onChange(null)}>set null</button>
              </div>
            </div>
          );
        },
      },
      defaultNull: {
        type: 'null',
        nullable: true,
        default: null,
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <StoryLayout jsonSchema={jsonSchema} errors={errors} value={value}>
      <Form
        jsonSchema={jsonSchema}
        defaultValue={{ null: null }}
        onChange={setValue}
        onValidate={setErrors}
      />
    </StoryLayout>
  );
};

export const StringEnumWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      enumWithNull: {
        type: ['string', 'null'],
        enum: [null, 'option1', 'option2', 'option3'],
        formType: 'enum',
        options: {
          alias: {
            null: '선택 안함',
            option1: '옵션 1',
            option2: '옵션 2',
            option3: '옵션 3',
          },
        },
      },
      radioWithNull: {
        type: ['string', 'null'],
        enum: [null, 'yes', 'no'],
        formType: 'radio',
        options: {
          alias: {
            null: '미정',
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
        <button
          onClick={() =>
            formRef.current?.setValue({
              enumWithNull: null,
              radioWithNull: null,
            })
          }
        >
          Set both to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              enumWithNull: 'option1',
              radioWithNull: 'yes',
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set to values
        </button>
        <button
          onClick={() => formRef.current?.setValue({})}
          style={{ marginLeft: 5 }}
        >
          Clear all
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
          type: ['string', 'null'],
          enum: [null, 'item1', 'item2', 'item3'],
          options: {
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
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({ checkboxWithNull: [null] })
          }
        >
          Select only null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              checkboxWithNull: [null, 'item1', 'item2'],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Select null + items
        </button>
        <button
          onClick={() => formRef.current?.setValue({ checkboxWithNull: [] })}
          style={{ marginLeft: 5 }}
        >
          Clear selection
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const NumberWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      nullableNumber: {
        type: 'number',
        nullable: true,
        placeholder: 'null 값 허용',
      },
      nullableSlider: {
        type: 'number',
        nullable: true,
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
              nullableNumber: null,
              nullableSlider: null,
            })
          }
        >
          Set to null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              nullableNumber: 42,
              nullableSlider: 50,
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set to numbers
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({ nullableNumber: 0, nullableSlider: 0 })
          }
          style={{ marginLeft: 5 }}
        >
          Set to zero
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
        type: ['string', 'null'],
        enum: ['on', null],
        formType: 'switch',
        options: {
          alias: {
            on: '켜짐',
            null: '꺼짐',
          },
        },
      },
      switchBothNull: {
        type: ['string', 'null'],
        enum: [null, null],
        formType: 'switch',
        options: {
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
              switchWithNull: 'on',
              switchBothNull: null,
            })
          }
        >
          Set first ON
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              switchWithNull: null,
              switchBothNull: null,
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set both null
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const MixedNullScenarios = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      selectWithEmptyAndNull: {
        type: ['string', 'null'],
        enum: ['', null, 'value1', 'value2'],
        formType: 'enum',
        options: {
          alias: {
            '': '빈 문자열',
            null: 'null 값',
            value1: '값 1',
            value2: '값 2',
          },
        },
      },
      radioGroupMixed: {
        type: ['string', 'null'],
        enum: [null, 'zero', 'one', 'text'],
        formType: 'radio',
        options: {
          alias: {
            null: 'null',
            zero: '숫자 0',
            one: '숫자 1',
            text: '텍스트',
          },
        },
      },
      checkboxArrayMixed: {
        type: 'array',
        items: {
          type: ['string', 'null'],
          enum: [null, '', 'filled', 'num123'],
          options: {
            alias: {
              null: 'null 값',
              '': '빈 문자열',
              filled: '채워진 값',
              num123: '숫자 123',
            },
          },
        },
        formType: 'checkbox',
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() =>
            formRef.current?.setValue({
              selectWithEmptyAndNull: null,
              radioGroupMixed: null,
              checkboxArrayMixed: [null, ''],
            })
          }
        >
          Set null and empty
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              selectWithEmptyAndNull: '',
              radioGroupMixed: 'zero',
              checkboxArrayMixed: ['filled', 'num123'],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set various values
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

export const DefaultValuesWithNull = () => {
  const [value, setValue] = useState<any>({});
  const formRef = useRef<FormHandle>(null);

  const jsonSchema = {
    type: 'object',
    properties: {
      enumDefaultNull: {
        type: ['string', 'null'],
        enum: [null, 'a', 'b', 'c'],
        default: null,
        formType: 'enum',
        options: {
          alias: {
            null: '기본값 (null)',
            a: 'A 옵션',
            b: 'B 옵션',
            c: 'C 옵션',
          },
        },
      },
      radioDefaultNull: {
        type: ['string', 'null'],
        enum: [null, 'left', 'right'],
        default: null,
        formType: 'radio',
        options: {
          alias: {
            null: '중립',
            left: '왼쪽',
            right: '오른쪽',
          },
        },
      },
      checkboxDefaultWithNull: {
        type: 'array',
        items: {
          type: ['string', 'null'],
          enum: [null, 'x', 'y', 'z'],
        },
        default: [null, 'x'],
        formType: 'checkbox',
        options: {
          alias: {
            null: 'null 포함',
            x: 'X',
            y: 'Y',
            z: 'Z',
          },
        },
      },
    },
  } satisfies JsonSchema;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => formRef.current?.reset()}>
          Reset to defaults
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              enumDefaultNull: 'a',
              radioDefaultNull: 'left',
              checkboxDefaultWithNull: ['x', 'y', 'z'],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set all non-null
        </button>
        <button
          onClick={() =>
            formRef.current?.setValue({
              enumDefaultNull: null,
              radioDefaultNull: null,
              checkboxDefaultWithNull: [null],
            })
          }
          style={{ marginLeft: 5 }}
        >
          Set all to null
        </button>
      </div>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form
          ref={formRef}
          jsonSchema={jsonSchema}
          onChange={setValue}
          defaultValue={{
            enumDefaultNull: null,
            radioDefaultNull: null,
            checkboxDefaultWithNull: [null, 'x'],
          }}
        />
      </StoryLayout>
    </div>
  );
};
