---
name: schema-form-testing-guide
description: "@canard/schema-form 테스트 작성 전문가. Vitest, React Testing Library를 사용한 단위/컴포넌트/통합 테스트를 안내합니다."
user-invocable: false
---

# Testing Guide Skill

@canard/schema-form 테스트 작성에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: testing-guide
- **용도**: 단위 테스트, 컴포넌트 테스트, 통합 테스트 작성 가이드
- **트리거**: 테스트, test, 단위 테스트, 컴포넌트 테스트, 통합 테스트 관련 질문

---

## 개요 (Overview)

Schema Form은 Vitest와 React Testing Library를 사용하여 테스트합니다. 이 가이드는 폼 로직, 노드 동작, 컴포넌트 렌더링 테스트 방법을 다룹니다.

---

## 테스트 환경 설정

### 필수 패키지

```bash
yarn add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Vitest 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
});
```

### 설정 파일

```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 테스트 전에 플러그인 등록
registerPlugin(ajvValidatorPlugin);
```

---

## 노드 단위 테스트

### 기본 노드 테스트

```typescript
import { describe, it, expect } from 'vitest';
import { nodeFromJsonSchema } from '@canard/schema-form';

// 비동기 대기 유틸리티
const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe('StringNode', () => {
  it('should initialize with default value', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'defaultName' },
        },
      },
    });

    await delay(); // 초기화 완료 대기

    expect(node.value).toEqual({ name: 'defaultName' });
  });

  it('should update value correctly', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    });

    await delay();

    node.setValue({ name: 'Alice' });
    await delay();

    expect(node.value).toEqual({ name: 'Alice' });
  });
});
```

### Computed Properties 테스트

```typescript
describe('Computed Properties', () => {
  it('should update active state based on dependency', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          toggle: { type: 'boolean', default: false },
          dependent: {
            type: 'string',
            computed: {
              active: '../toggle === true',
            },
          },
        },
      },
    });

    await delay();

    const dependentNode = node.find('./dependent');
    expect(dependentNode?.active).toBe(false);

    const toggleNode = node.find('./toggle');
    toggleNode?.setValue(true);
    await delay();

    expect(dependentNode?.active).toBe(true);
  });

  it('should calculate derived value', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          price: { type: 'number', default: 100 },
          quantity: { type: 'number', default: 2 },
          total: {
            type: 'number',
            '&derived': '../price * ../quantity',
          },
        },
      },
    });

    await delay();

    const totalNode = node.find('./total');
    expect(totalNode?.value).toBe(200);
  });
});
```

### 배열 조작 테스트

```typescript
import { ArrayNode } from '@canard/schema-form';

describe('ArrayNode', () => {
  it('should push items correctly', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    await delay();

    const arrayNode = node.find('./items') as ArrayNode;
    await arrayNode.push('item1');
    await arrayNode.push('item2');

    expect(arrayNode.length).toBe(2);
    expect(arrayNode.value).toEqual(['item1', 'item2']);
  });

  it('should respect maxItems constraint', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 2,
          },
        },
      },
    });

    await delay();

    const arrayNode = node.find('./items') as ArrayNode;
    await arrayNode.push('item1');
    await arrayNode.push('item2');
    await arrayNode.push('item3'); // 무시됨

    expect(arrayNode.length).toBe(2);
  });
});
```

### 조건부 스키마 테스트

```typescript
describe('Conditional Schema', () => {
  it('should filter values based on oneOf condition', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['A', 'B'], default: 'A' },
        },
        oneOf: [
          {
            '&if': "./type === 'A'",
            properties: { fieldA: { type: 'string' } },
          },
          {
            '&if': "./type === 'B'",
            properties: { fieldB: { type: 'string' } },
          },
        ],
      },
    });

    await delay();

    // type = 'A' 일 때 fieldA만 존재
    node.setValue({ type: 'A', fieldA: 'valueA', fieldB: 'valueB' });
    await delay();

    expect(node.value).toEqual({ type: 'A', fieldA: 'valueA' });
    // fieldB는 조건에 맞지 않아 제거됨
  });
});
```

---

## 컴포넌트 테스트

### Form 컴포넌트 테스트

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from '@canard/schema-form';

describe('Form Component', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      email: { type: 'string', format: 'email', title: 'Email' },
    },
  } as const;

  it('should render form fields', () => {
    render(<Form jsonSchema={schema} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should call onChange when value changes', async () => {
    const handleChange = vi.fn();

    render(<Form jsonSchema={schema} onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(input, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
```

### FormHandle 테스트

```typescript
import { useRef } from 'react';
import { Form, FormHandle } from '@canard/schema-form';

describe('FormHandle', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
  } as const;

  it('should get and set values programmatically', async () => {
    let formHandle: FormHandle<typeof schema> | null = null;

    const TestComponent = () => {
      const ref = useRef<FormHandle<typeof schema>>(null);
      formHandle = ref.current;

      return <Form ref={ref} jsonSchema={schema} />;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formHandle).not.toBeNull();
    });

    formHandle?.setValue({ name: 'Test' });

    await waitFor(() => {
      expect(formHandle?.getValue()).toEqual({ name: 'Test' });
    });
  });

  it('should validate and return errors', async () => {
    const schemaWithValidation = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    } as const;

    let formHandle: FormHandle<typeof schemaWithValidation> | null = null;

    const TestComponent = () => {
      const ref = useRef<FormHandle<typeof schemaWithValidation>>(null);
      formHandle = ref.current;

      return <Form ref={ref} jsonSchema={schemaWithValidation} />;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formHandle).not.toBeNull();
    });

    const errors = await formHandle?.validate();

    expect(errors?.length).toBeGreaterThan(0);
    expect(errors?.[0].keyword).toBe('required');
  });
});
```

### 커스텀 FormTypeInput 테스트

```typescript
import { FormTypeInputProps } from '@canard/schema-form';

describe('Custom FormTypeInput', () => {
  const CustomInput: FC<FormTypeInputProps<string>> = ({
    value,
    onChange,
    errors,
    errorVisible,
  }) => (
    <div>
      <input
        data-testid="custom-input"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {errorVisible && errors.length > 0 && (
        <span data-testid="error">{errors[0].message}</span>
      )}
    </div>
  );

  it('should render custom input and handle changes', async () => {
    const handleChange = vi.fn();

    render(
      <Form
        jsonSchema={{
          type: 'object',
          properties: {
            custom: { type: 'string', FormTypeInput: CustomInput },
          },
        }}
        onChange={handleChange}
      />
    );

    const input = screen.getByTestId('custom-input');
    fireEvent.change(input, { target: { value: 'test value' } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({ custom: 'test value' })
      );
    });
  });
});
```

---

## 이벤트 테스트

### 이벤트 구독 테스트

```typescript
import { NodeEventType } from '@canard/schema-form';

describe('Event System', () => {
  it('should fire UpdateValue event when value changes', async () => {
    const events: NodeEventType[] = [];

    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    });

    await delay();

    node.subscribe((event) => {
      events.push(event.type);
    });

    node.setValue({ name: 'test' });
    await delay();

    expect(events).toContain(NodeEventType.UpdateValue);
  });

  it('should unsubscribe correctly', async () => {
    let eventCount = 0;

    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    });

    await delay();

    const unsubscribe = node.subscribe(() => {
      eventCount++;
    });

    node.setValue({ name: 'first' });
    await delay();

    unsubscribe();

    node.setValue({ name: 'second' });
    await delay();

    // 구독 해제 후에는 이벤트 카운트 증가 안 함
    expect(eventCount).toBe(1);
  });
});
```

---

## 검증 테스트

### 필드 레벨 검증

```typescript
describe('Validation', () => {
  it('should validate required fields', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    });

    await delay();

    const errors = await node.validate();

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.keyword === 'required')).toBe(true);
  });

  it('should validate format constraints', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    });

    await delay();

    node.setValue({ email: 'invalid-email' });
    await delay();

    const errors = await node.validate();

    expect(errors.some((e) => e.keyword === 'format')).toBe(true);
  });
});
```

### 커스텀 에러 메시지 테스트

```typescript
describe('Custom Error Messages', () => {
  it('should use custom error messages', async () => {
    const node = nodeFromJsonSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            errorMessages: {
              minLength: '이름은 최소 {limit}자 이상이어야 합니다',
            },
          },
        },
      },
    });

    await delay();

    node.setValue({ name: 'ab' });
    await delay();

    const errors = await node.validate();
    const nameNode = node.find('./name');

    // 에러 메시지 확인은 formatError 함수 적용 후
    expect(nameNode?.errors.length).toBeGreaterThan(0);
  });
});
```

---

## 통합 테스트

### 폼 제출 플로우

```typescript
describe('Form Submission Flow', () => {
  it('should validate before submit', async () => {
    const handleSubmit = vi.fn();
    let formHandle: FormHandle | null = null;

    const TestComponent = () => {
      const ref = useRef<FormHandle>(null);
      formHandle = ref.current;

      return (
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
            },
            required: ['email'],
          }}
          onSubmit={handleSubmit}
        />
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formHandle).not.toBeNull();
    });

    // 빈 값으로 제출 시도
    formHandle?.submit();

    await waitFor(() => {
      // 검증 실패로 onSubmit 호출되지 않음
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  it('should submit valid form', async () => {
    const handleSubmit = vi.fn();
    let formHandle: FormHandle | null = null;

    const TestComponent = () => {
      const ref = useRef<FormHandle>(null);
      formHandle = ref.current;

      return (
        <Form
          ref={ref}
          jsonSchema={{
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
            },
            required: ['email'],
          }}
          defaultValue={{ email: 'test@example.com' }}
          onSubmit={handleSubmit}
        />
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(formHandle).not.toBeNull();
    });

    formHandle?.submit();

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });
});
```

---

## 테스트 유틸리티

### delay 함수

```typescript
// test/utils.ts
export const delay = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

### 테스트용 스키마 빌더

```typescript
// test/schemaBuilder.ts
export const createTestSchema = (properties: Record<string, any>) => ({
  type: 'object' as const,
  properties,
});

export const stringField = (options = {}) => ({
  type: 'string' as const,
  ...options,
});

export const numberField = (options = {}) => ({
  type: 'number' as const,
  ...options,
});

// 사용
const schema = createTestSchema({
  name: stringField({ minLength: 3 }),
  age: numberField({ minimum: 0 }),
});
```

### FormHandle 래퍼

```typescript
// test/formTestWrapper.tsx
import { useRef, useEffect } from 'react';
import { Form, FormHandle } from '@canard/schema-form';

export const createFormTestHarness = <T extends object>(
  schema: any,
  defaultValue?: T
) => {
  let handle: FormHandle | null = null;

  const TestComponent = () => {
    const ref = useRef<FormHandle>(null);

    useEffect(() => {
      handle = ref.current;
    }, []);

    return (
      <Form
        ref={ref}
        jsonSchema={schema}
        defaultValue={defaultValue}
      />
    );
  };

  return {
    Component: TestComponent,
    getHandle: () => handle,
  };
};
```

---

## 테스트 모범 사례

### 1. 비동기 처리

```typescript
// ✅ 항상 초기화/이벤트 완료를 기다림
await delay();
node.setValue(value);
await delay();
expect(node.value).toEqual(value);

// ❌ 동기적 검증 (실패할 수 있음)
node.setValue(value);
expect(node.value).toEqual(value); // 아직 반영 안 됨
```

### 2. 격리된 테스트

```typescript
// ✅ 각 테스트에서 새 노드 생성
it('test 1', async () => {
  const node = nodeFromJsonSchema({ jsonSchema: schema });
  // ...
});

it('test 2', async () => {
  const node = nodeFromJsonSchema({ jsonSchema: schema });
  // ...
});

// ❌ 테스트 간 노드 공유
let node;
beforeAll(() => {
  node = nodeFromJsonSchema({ jsonSchema: schema });
});
```

### 3. 의미 있는 어서션

```typescript
// ✅ 구체적인 검증
expect(errors.some((e) => e.keyword === 'required' && e.path === '/name')).toBe(true);

// ❌ 모호한 검증
expect(errors.length).toBeGreaterThan(0);
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 테스트 코드: `src/core/__tests__/*.test.ts`
- 스토리: `stories/*.stories.tsx`
