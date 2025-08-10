import React, { useRef, useState } from 'react';

import { Form, type FormTypeInputProps, type JsonSchema } from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/25. PreferredInputUsecase',
};

// 공용 커스텀 입력 컴포넌트들 (함수형/클래스형)
// 지원하는 추가 prop 예시: placeholder, maxLength, trimOnBlur, prefix
const FunctionalStringInput = ({
  value,
  onChange,
  onBlur,
  path,
  readOnly,
  disabled,
  required,
  placeholder,
  maxLength,
  trimOnBlur,
  prefix,
  errors,
}: FormTypeInputProps<string> & {
  placeholder?: string;
  maxLength?: number;
  trimOnBlur?: boolean;
  prefix?: string;
}) => {
  const rendersRef = React.useRef(0);
  rendersRef.current += 1;
  const stringValue = value ?? '';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {prefix ? <span aria-label={`prefix-${path}`}>{prefix}</span> : null}
      <input
        type="text"
        value={stringValue}
        onChange={(e) => {
          const next = e.target.value;
          if (typeof maxLength === 'number' && next.length > maxLength) return;
          onChange(next);
        }}
        onBlur={(e) => {
          if (trimOnBlur) {
            const trimmed = e.target.value.trim();
            if (trimmed !== e.target.value) onChange(trimmed);
          }
          onBlur?.(e);
        }}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        maxLength={typeof maxLength === 'number' ? maxLength : undefined}
        aria-label={`functional-input-${path}`}
        style={{ padding: '4px 6px', border: '1px solid #1677ff' }}
      />
      <span style={{ fontSize: 12, color: '#888' }}>
        {String(stringValue).length}
        {typeof maxLength === 'number' ? `/${maxLength}` : ''}
      </span>
      <span
        style={{ fontSize: 12, color: '#1677ff' }}
        aria-label={`renders-fn-${path}`}
      >
        r:{rendersRef.current}
      </span>
      {errors?.length ? (
        <span style={{ color: '#ff4d4f', fontSize: 12 }}>
          {errors[0]?.message || 'error'}
        </span>
      ) : null}
    </div>
  );
};

class ClassStringInput extends React.Component<
  FormTypeInputProps<string> & {
    placeholder?: string;
    maxLength?: number;
    trimOnBlur?: boolean;
    prefix?: string;
  }
> {
  private rendersCount = 0;
  render() {
    const {
      value,
      onChange,
      onBlur,
      path,
      readOnly,
      disabled,
      required,
      placeholder,
      maxLength,
      trimOnBlur,
      prefix,
      errors,
    } = this.props;
    this.rendersCount += 1;
    const stringValue = value ?? '';
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {prefix ? <span aria-label={`prefix-${path}`}>{prefix}</span> : null}
        <input
          type="text"
          value={stringValue}
          onChange={(e) => {
            const next = e.target.value;
            if (typeof maxLength === 'number' && next.length > maxLength)
              return;
            onChange(next);
          }}
          onBlur={(e) => {
            if (trimOnBlur) {
              const trimmed = e.target.value.trim();
              if (trimmed !== e.target.value) onChange(trimmed);
            }
            onBlur?.(e);
          }}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          maxLength={typeof maxLength === 'number' ? maxLength : undefined}
          aria-label={`class-input-${path}`}
          style={{ padding: '4px 6px', border: '1px solid #fa541c' }}
        />
        <span style={{ fontSize: 12, color: '#888' }}>
          {String(stringValue).length}
          {typeof maxLength === 'number' ? `/${maxLength}` : ''}
        </span>
        <span
          style={{ fontSize: 12, color: '#fa541c' }}
          aria-label={`renders-class-${path}`}
        >
          r:{this.rendersCount}
        </span>
        {errors?.length ? (
          <span style={{ color: '#ff4d4f', fontSize: 12 }}>
            {errors[0]?.message || 'error'}
          </span>
        ) : null}
      </div>
    );
  }
}

// 1) jsonSchema.FormType에 함수형/클래스 컴포넌트를 직접 지정
export const JsonSchema_FormType_FunctionAndClass = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      funcField: {
        type: 'string',
        // memo 케이스: 이미 memo 된 컴포넌트를 넣었을 때 재래핑 여부는 내부 훅에서 분기 처리됨
        FormType: React.memo(FunctionalStringInput),
        FormTypeInputProps: {
          placeholder: '함수형 입력 (jsonSchema)',
          maxLength: 20,
          trimOnBlur: true,
          prefix: 'fn',
        },
      },
      classField: {
        type: 'string',
        // 일반 클래스 컴포넌트 (memo 아님)
        FormType: ClassStringInput,
        FormTypeInputProps: {
          placeholder: '클래스 입력 (jsonSchema)',
          maxLength: 16,
          trimOnBlur: true,
          prefix: 'class',
        },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Form.Group path="/funcField" />
          <Form.Group path="/classField" />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// 2) <Form.Input/>에 FormTypeInput으로 함수형/클래스 컴포넌트를 직접 지정
export const FormInputProp_FunctionAndClass = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      funcField: { type: 'string' },
      classField: { type: 'string' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <Form.Label path="/funcField" />
            <Form.Input
              path="/funcField"
              // memo 컴포넌트를 직접 넘기는 경우
              FormTypeInput={React.memo(FunctionalStringInput)}
              placeholder="함수형 입력 (Input prop)"
              maxLength={24}
              trimOnBlur
              prefix="fn"
              required
            />
          </div>
          <div>
            <Form.Label path="/classField" />
            <Form.Input
              path="/classField"
              FormTypeInput={ClassStringInput}
              placeholder="클래스 입력 (Input prop)"
              maxLength={18}
              trimOnBlur
              prefix="class"
            />
          </div>
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// 3) <Form.Group/>에 FormTypeInput으로 함수형/클래스 컴포넌트를 직접 지정
export const FormGroupProp_FunctionAndClass = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      funcField: { type: 'string' },
      classField: { type: 'string' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const fnRenders = useRef(0);
  const classRenders = useRef(0);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Form.Group
            path="/funcField"
            // memo 컴포넌트를 넘긴 케이스
            FormTypeInput={React.memo(FunctionalStringInput)}
            placeholder="함수형 입력 (Group prop)"
            maxLength={12}
            prefix="fn"
          />
          <Form.Group
            path="/classField"
            FormTypeInput={ClassStringInput}
            placeholder="클래스 입력 (Group prop)"
            maxLength={14}
            prefix="class"
            trimOnBlur
          />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12 }}>
          <RenderCounter label="fn(Group)" counterRef={fnRenders} />
          <RenderCounter label="class(Group)" counterRef={classRenders} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// 4) <Form.Render/>에 FormTypeInput을 지정하고, render 함수에서 <Input/>을 사용
export const FormRenderProp_FunctionAndClass = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      funcField: { type: 'string' },
      classField: { type: 'string' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const fnRenders = useRef(0);
  const classRenders = useRef(0);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Form.Render
            path="/funcField"
            // memo 컴포넌트를 넘긴 케이스
            FormTypeInput={React.memo(FunctionalStringInput)}
            placeholder="함수형 입력 (Render prop)"
            maxLength={22}
            trimOnBlur
            prefix="fn"
          >
            {({ Input, path }) => (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>render:fn:{path}</span>
                <Input />
              </div>
            )}
          </Form.Render>
          <Form.Render
            path="/classField"
            FormTypeInput={ClassStringInput}
            placeholder="클래스 입력 (Render prop)"
            maxLength={10}
            prefix="class"
          >
            {({ Input, path }) => (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>render:class:{path}</span>
                <Input />
              </div>
            )}
          </Form.Render>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12 }}>
          <RenderCounter label="fn(Render)" counterRef={fnRenders} />
          <RenderCounter label="class(Render)" counterRef={classRenders} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// 5) Component props로 화살표 함수를 직접 지정하여 사용
export const FormInputProp_InlineArrowComponent = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      arrowField: { type: 'string' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <Form.Label path="/arrowField" />
            <Form.Input
              path="/arrowField"
              // 화살표 함수 컴포넌트를 직접 넘기는 케이스
              FormTypeInput={(props: FormTypeInputProps<string>) => {
                const {
                  value: inputValue,
                  onChange,
                  onBlur,
                  path,
                  readOnly,
                  disabled,
                  required,
                  errors,
                } = props;
                const rendersRef = React.useRef(0);
                rendersRef.current += 1;
                const stringValue = inputValue ?? '';
                return (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <input
                      type="text"
                      value={stringValue}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={onBlur}
                      readOnly={readOnly}
                      disabled={disabled}
                      required={required}
                      aria-label={`inline-input-${path}`}
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #52c41a',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#888' }}>
                      {String(stringValue).length}
                    </span>
                    <span
                      style={{ fontSize: 12, color: '#52c41a' }}
                      aria-label={`renders-inline-${path}`}
                    >
                      r:{rendersRef.current}
                    </span>
                    {errors?.length ? (
                      <span style={{ color: '#ff4d4f', fontSize: 12 }}>
                        {errors[0]?.message || 'error'}
                      </span>
                    ) : null}
                  </div>
                );
              }}
            />
          </div>
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// memo wrapping/identity를 관찰하기 위한 유틸 컴포넌트
const RenderCounter = ({
  label,
  counterRef,
}: {
  label: string;
  counterRef: React.MutableRefObject<number>;
}) => {
  counterRef.current += 1;
  return (
    <span aria-label={`renders-${label}`}>
      {label}: {counterRef.current}
    </span>
  );
};
