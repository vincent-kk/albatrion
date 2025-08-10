import { useEffect, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputProps,
  type JsonSchema,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/24. ControlledUsecase',
};

export const Common = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
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

// Trim on blur - Uncontrolled input
export const TrimOnBlur_Uncontrolled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        options: { trim: true },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={UncontrolledInput} />
        </div>
        {/* Focusing here will trigger blur on the field above */}
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Trim on blur - Controlled input
export const TrimOnBlur_Controlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        options: { trim: true },
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={ControlledInput} />
        </div>
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// No trim - Uncontrolled input
export const NoTrimOnBlur_Uncontrolled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        // options.trim is undefined -> no trimming on blur
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={UncontrolledInput} />
        </div>
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// No trim - Controlled input
export const NoTrimOnBlur_Controlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        // options.trim is undefined -> no trimming on blur
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={ControlledInput} />
        </div>
        <input placeholder="focus here to blur above input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Focus / Select - Single controlled input
export const FocusAndSelect_SingleControlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      text: { type: 'string' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/text')}>
          focus /text
        </button>
        <button onClick={() => formRef.current?.select('/text')}>
          select /text
        </button>
        <input placeholder="외부 포커스용 input" />
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/text" />
          <Form.Input path="/text" FormTypeInput={ControlledInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Focus / Select - Multiple inputs within a single FormTypeInput (Controlled)
export const FocusAndSelect_MultiInputControlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      phone: {
        type: 'string',
        description: '형식: 000-0000',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/phone')}>
          focus /phone
        </button>
        <button onClick={() => formRef.current?.select('/phone')}>
          select /phone
        </button>
        <input placeholder="외부 포커스용 input" />
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/phone" />
          <Form.Input path="/phone" FormTypeInput={PhoneControlledInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Caret preservation while formatting (Controlled with formatter)
export const CaretPreservation_WithFormatter = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      card: {
        type: 'string',
        description: '신용카드 번호 ####-####-####-####',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/card')}>
          focus /card
        </button>
        <button onClick={() => formRef.current?.select('/card')}>
          select /card
        </button>
        <input placeholder="외부 포커스용 input" />
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/card" />
          <Form.Input path="/card" FormTypeInput={CardFormatterInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Multiple inputs inside one FormTypeInput - caret stability when switching
export const MultiInput_CaretStability_Switching = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      range: { type: 'string', description: 'start~end (두 입력으로 구성)' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <Form jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/range" />
          <Form.Input path="/range" FormTypeInput={RangeTwoInputsControlled} />
        </div>
        <input placeholder="외부 포커스용 input" />
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Focus / Select - Button only FormTypeInput (focus should work, select is attempted)
export const FocusAndSelect_ButtonOnlyControlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      action: { type: 'string', description: 'button 요소만 존재' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/action')}>
          focus /action (button)
        </button>
        <button onClick={() => formRef.current?.select('/action')}>
          select /action (button)
        </button>
        <input placeholder="외부 포커스용 input" />
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/action" />
          <Form.Input path="/action" FormTypeInput={ButtonOnlyInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Focus / Select - Mixed (input + button in one FormTypeInput)
export const FocusAndSelect_MixedControlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      mixed: { type: 'string', description: 'input + button 혼합' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/mixed')}>
          focus /mixed
        </button>
        <button onClick={() => formRef.current?.select('/mixed')}>
          select /mixed
        </button>
        <input placeholder="외부 포커스용 input" />
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/mixed" />
          <Form.Input path="/mixed" FormTypeInput={InputAndButtonFormType} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Complex input: DateTime segmented (YYYY-MM-DD HH:mm)
export const ComplexInput_DateTimeSegments = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      datetime: { type: 'string', description: 'YYYY-MM-DD HH:mm' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/datetime')}>
          focus /datetime
        </button>
        <button onClick={() => formRef.current?.select('/datetime')}>
          select /datetime
        </button>
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/datetime" />
          <Form.Input path="/datetime" FormTypeInput={DateTimeSegmentedInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Complex input: Currency with thousand separators
export const ComplexInput_Currency = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      amount: { type: 'string', description: '통화 입력: 12,345' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/amount')}>
          focus /amount
        </button>
        <button onClick={() => formRef.current?.select('/amount')}>
          select /amount
        </button>
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/amount" />
          <Form.Input path="/amount" FormTypeInput={CurrencyFormatterInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Textarea - Basic controlled
export const Textarea_Basic_Controlled = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      memo: {
        type: 'string',
        description: '긴 메모 입력 (textarea, controlled)',
      },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/memo')}>
          focus /memo
        </button>
        <button onClick={() => formRef.current?.select('/memo')}>
          select /memo
        </button>
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/memo" />
          <Form.Input path="/memo" FormTypeInput={ControlledTextareaInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

// Textarea - Caret preservation with formatter (space/tab normalization)
export const Textarea_CaretPreservation_WithFormatter = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      memo: { type: 'string', description: '공백/탭/빈줄 정규화 포매터 적용' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Record<string, unknown>>({});
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  return (
    <StoryLayout jsonSchema={jsonSchema} value={value}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => formRef.current?.focus('/memo')}>
          focus /memo
        </button>
        <button onClick={() => formRef.current?.select('/memo')}>
          select /memo
        </button>
      </div>
      <Form ref={formRef} jsonSchema={jsonSchema} onChange={setValue}>
        <div>
          <Form.Label path="/memo" />
          <Form.Input path="/memo" FormTypeInput={TextareaFormatterInput} />
        </div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </Form>
    </StoryLayout>
  );
};

const ControlledInput = ({ value, onChange }: FormTypeInputProps<string>) => {
  useEffect(() => {
    console.log('ControlledInput 마운트됨');
    return () => console.log('ControlledInput 언마운트됨');
  }, []);
  console.log('ControlledInput 렌더링됨', { value });
  return (
    <input
      type="text"
      placeholder="type with spaces then blur"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const UncontrolledInput = ({
  defaultValue,
  onChange,
}: FormTypeInputProps<string>) => {
  useEffect(() => {
    console.log('ControlledInput 마운트됨');
    return () => console.log('ControlledInput 언마운트됨');
  }, []);
  console.log('UncontrolledInput 렌더링됨', { defaultValue });
  return (
    <input
      type="text"
      placeholder="type with spaces then blur"
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// ----- Custom FormTypeInput Inputs for stories -----

const PhoneControlledInput = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const digits = (value ?? '').replace(/[^0-9]/g, '');
  const area = digits.slice(0, 3);
  const line = digits.slice(3, 7);

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    onChange(`${next}-${line}`.replace(/-$/, ''));
  };
  const handleLineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    onChange(`${area}-${next}`.replace(/-$/, ''));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="text"
        inputMode="numeric"
        value={area}
        onChange={handleAreaChange}
        placeholder="000"
        style={{ width: 56 }}
      />
      <span>-</span>
      <input
        type="text"
        inputMode="numeric"
        value={line}
        onChange={handleLineChange}
        placeholder="0000"
        style={{ width: 72 }}
      />
    </div>
  );
};

const CardFormatterInput = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const format = (raw: string) =>
    raw
      .replace(/[^0-9]/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1-');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = format(e.target.value);
    onChange(next);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="####-####-####-####"
      value={typeof value === 'string' ? value : ''}
      onChange={handleChange}
    />
  );
};

const RangeTwoInputsControlled = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const [start, end] = (value ?? '').split('~', 2);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${e.target.value}~${end ?? ''}`.replace(/~$/, ''));
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${start ?? ''}~${e.target.value}`.replace(/^~/, ''));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="text"
        value={start ?? ''}
        onChange={handleStartChange}
        placeholder="start"
      />
      <span>~</span>
      <input
        type="text"
        value={end ?? ''}
        onChange={handleEndChange}
        placeholder="end"
      />
    </div>
  );
};

const ButtonOnlyInput = ({ value, onChange }: FormTypeInputProps<string>) => {
  const handleClick = () => {
    const count = Number((value ?? '').toString().match(/\d+$/)?.[0] || 0) + 1;
    onChange(`clicked-${count}`);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button type="button" onClick={handleClick}>
        Action Button
      </button>
      <code>{String(value ?? '')}</code>
    </div>
  );
};

const InputAndButtonFormType = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="type here"
      />
      <button
        type="button"
        ref={buttonRef}
        onClick={() => onChange('button-clicked')}
      >
        Click
      </button>
      <button type="button" onClick={() => buttonRef.current?.focus()}>
        focus inner button
      </button>
    </div>
  );
};

const DateTimeSegmentedInput = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const raw = (value ?? '').replace(/[^0-9]/g, '');
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const hh = raw.slice(8, 10);
  const mm = raw.slice(10, 12);

  const setNext = (
    ny: string,
    nm: string,
    nd: string,
    nh: string,
    nmm: string,
  ) => {
    const compact = `${ny}${nm}${nd}${nh}${nmm}`.slice(0, 12);
    const formatted =
      [compact.slice(0, 4), compact.slice(4, 6), compact.slice(6, 8)]
        .filter(Boolean)
        .join('-') +
      (compact.length > 8
        ? ` ${compact.slice(8, 10)}:${compact.slice(10, 12)}`
        : '');
    onChange(formatted.trim());
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="text"
        inputMode="numeric"
        value={y}
        onChange={(e) =>
          setNext(
            e.target.value.replace(/[^0-9]/g, '').slice(0, 4),
            m,
            d,
            hh,
            mm,
          )
        }
        placeholder="YYYY"
        style={{ width: 68 }}
      />
      <span>-</span>
      <input
        type="text"
        inputMode="numeric"
        value={m}
        onChange={(e) =>
          setNext(
            y,
            e.target.value.replace(/[^0-9]/g, '').slice(0, 2),
            d,
            hh,
            mm,
          )
        }
        placeholder="MM"
        style={{ width: 40 }}
      />
      <span>-</span>
      <input
        type="text"
        inputMode="numeric"
        value={d}
        onChange={(e) =>
          setNext(
            y,
            m,
            e.target.value.replace(/[^0-9]/g, '').slice(0, 2),
            hh,
            mm,
          )
        }
        placeholder="DD"
        style={{ width: 40 }}
      />
      <span> </span>
      <input
        type="text"
        inputMode="numeric"
        value={hh}
        onChange={(e) =>
          setNext(
            y,
            m,
            d,
            e.target.value.replace(/[^0-9]/g, '').slice(0, 2),
            mm,
          )
        }
        placeholder="HH"
        style={{ width: 40 }}
      />
      <span>:</span>
      <input
        type="text"
        inputMode="numeric"
        value={mm}
        onChange={(e) =>
          setNext(
            y,
            m,
            d,
            hh,
            e.target.value.replace(/[^0-9]/g, '').slice(0, 2),
          )
        }
        placeholder="mm"
        style={{ width: 40 }}
      />
    </div>
  );
};

const CurrencyFormatterInput = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const format = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(format(e.target.value));
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      value={typeof value === 'string' ? value : ''}
      onChange={handleChange}
      placeholder="12,345"
    />
  );
};

const ControlledTextareaInput = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  return (
    <textarea
      rows={6}
      placeholder={'type multiple lines, move caret, keep stable'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', fontFamily: 'monospace' }}
    />
  );
};

const TextareaFormatterInput = ({
  value,
  onChange,
}: FormTypeInputProps<string>) => {
  const normalize = (raw: string): string => {
    const squashBlankLines = raw.replace(/\n{3,}/g, '\n\n');
    return squashBlankLines;
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(normalize(e.target.value));
  };
  return (
    <textarea
      rows={6}
      placeholder={
        'paste text, add tabs/blank lines, caret should be preserved'
      }
      value={value ?? ''}
      onChange={handleChange}
      style={{ width: '100%', fontFamily: 'monospace' }}
    />
  );
};
