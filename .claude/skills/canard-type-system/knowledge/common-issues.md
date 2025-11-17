# Common Type Issues

@canard/schema-form 타입 시스템 사용 시 자주 발생하는 문제와 해결 방법

## 1. Value가 undefined일 때

### 문제

```typescript
function ProblematicInput(props: FormTypeInputProps<string>) {
  const { value } = props;

  // ❌ 런타임 에러: value가 undefined일 수 있음
  const length = value.length;  // Cannot read property 'length' of undefined
}
```

### 해결 방법

```typescript
function FixedInput(props: FormTypeInputProps<string>) {
  const { value, defaultValue } = props;

  // ✅ 방법 1: Nullish coalescing 사용
  const safeValue = value ?? defaultValue ?? '';
  const length = safeValue.length;

  // ✅ 방법 2: Optional chaining 사용
  const optionalLength = value?.length ?? 0;

  // ✅ 방법 3: 조건부 렌더링
  return (
    <div>
      {value && <span>Length: {value.length}</span>}
      {!value && <span>No value</span>}
    </div>
  );
}
```

## 2. onChange 타입 불일치

### 문제

```typescript
function TypeMismatchInput(props: FormTypeInputProps<number>) {
  const { value, onChange } = props;

  // ❌ 타입 에러: string을 number onChange에 전달
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);  // TypeScript 에러
  };
}
```

### 해결 방법

```typescript
function CorrectTypeInput(props: FormTypeInputProps<number>) {
  const { value, onChange } = props;

  // ✅ 문자열을 숫자로 변환
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = Number(e.target.value);
    onChange(numValue);
  };

  // ✅ 또는 parseFloat/parseInt 사용
  const handleChangeInt = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={handleChange}
    />
  );
}
```

## 3. Context 타입 접근 오류

### 문제

```typescript
interface MuiContext {
  size?: 'small' | 'medium' | 'large';
}

function ContextIssueInput(props: FormTypeInputProps<string>) {
  const { context } = props;

  // ❌ 타입 에러: context가 object 타입으로 추론됨
  const size = context.size;  // Property 'size' does not exist on type 'object'
}
```

### 해결 방법

```typescript
// ✅ 방법 1: Props 타입에 Context 명시
function CorrectContextInput(props: FormTypeInputProps<string, MuiContext>) {
  const { context } = props;
  const size = context?.size;  // 타입 안전하게 접근
}

// ✅ 방법 2: 타입 단언 사용 (권장하지 않음)
function TypeAssertionInput(props: FormTypeInputProps<string>) {
  const { context } = props;
  const muiContext = context as MuiContext;
  const size = muiContext.size;
}

// ✅ 방법 3: Props 인터페이스 확장
interface MuiInputProps extends FormTypeInputProps<string, MuiContext> {
  // 추가 props
}

function ExtendedPropsInput(props: MuiInputProps) {
  const { context } = props;
  const size = context?.size;  // ✅ 타입 안전
}
```

## 4. WatchValues 타입 추론 실패

### 문제

```typescript
function WatchIssueInput(props: FormTypeInputProps<string>) {
  const { watchValues } = props;

  // ❌ watchValues의 타입이 any[]로 추론됨
  const [dependency1, dependency2] = watchValues;
  // dependency1, dependency2의 타입: any
}
```

### 해결 방법

```typescript
// ✅ WatchValues 타입 파라미터 명시
function CorrectWatchInput(
  props: FormTypeInputProps<string, object, [string, number]>
) {
  const { watchValues } = props;
  const [stringDep, numberDep] = watchValues;
  // stringDep: string, numberDep: number (타입 안전)
}

// ✅ 또는 구조 분해 시 타입 명시
function ManualTypeInput(props: FormTypeInputProps<string>) {
  const { watchValues } = props;
  const [stringDep, numberDep] = watchValues as [string, number];
}
```

## 5. ChildNodeComponents 렌더링 오류

### 문제

```typescript
function ChildrenIssueInput(props: FormTypeInputProps<object>) {
  const { ChildNodeComponents } = props;

  // ❌ Key warning 발생
  return (
    <div>
      {ChildNodeComponents.map((ChildComponent) => (
        <ChildComponent />  // Warning: Each child should have a unique "key" prop
      ))}
    </div>
  );
}
```

### 해결 방법

```typescript
function CorrectChildrenInput(props: FormTypeInputProps<object>) {
  const { ChildNodeComponents } = props;

  // ✅ index를 key로 사용
  return (
    <div>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <ChildComponent key={index} />
      ))}
    </div>
  );
}

// ✅ 또는 node path를 key로 사용 (더 안정적)
function StableKeyInput(props: FormTypeInputProps<object>) {
  const { ChildNodeComponents, node } = props;

  return (
    <div>
      {ChildNodeComponents.map((ChildComponent, index) => {
        const childNode = node.children?.[index]?.node;
        return <ChildComponent key={childNode?.path ?? index} />;
      })}
    </div>
  );
}
```

## 6. Node 타입 캐스팅 오류

### 문제

```typescript
function NodeCastingIssue(props: FormTypeInputProps<any[]>) {
  const { node } = props;

  // ❌ 타입 가드 없이 캐스팅
  const arrayNode = node as ArrayNode;
  arrayNode.push();  // 런타임에 node가 ArrayNode가 아닐 수 있음
}
```

### 해결 방법

```typescript
import { isArrayNode, type ArrayNode } from '@canard/schema-form';

function SafeNodeCasting(props: FormTypeInputProps<any[]>) {
  const { node } = props;

  // ✅ 타입 가드로 안전하게 체크
  if (isArrayNode(node)) {
    node.push();  // 타입 안전
  } else {
    console.error('Node is not an ArrayNode');
  }
}

// ✅ 또는 방어적 프로그래밍
function DefensiveCasting(props: FormTypeInputProps<any[]>) {
  const { node } = props;

  const arrayNode = node as ArrayNode;

  if (typeof arrayNode.push === 'function') {
    arrayNode.push();
  }
}
```

## 7. FormTypeTestObject 정의 오류

### 문제

```typescript
// ❌ 잘못된 test 객체 구조
export const WrongDefinition = {
  Component: MyInput,
  test: {
    type: 'string',
    jsonSchema: { /* ... */ }  // ❌ test 객체에 jsonSchema 필드 없음
  }
} satisfies FormTypeInputDefinition;
```

### 해결 방법

```typescript
// ✅ 올바른 test 객체 필드만 사용
export const CorrectObjectDefinition = {
  Component: MyInput,
  test: {
    type: 'string',
    format: 'email',
    formType: 'custom'
    // path도 사용 가능
  }
} satisfies FormTypeInputDefinition;

// ✅ 복잡한 조건은 함수 사용
import type { FormTypeTestFn } from '@canard/schema-form';

const complexTest: FormTypeTestFn = ({ type, format, jsonSchema }) => {
  // jsonSchema는 함수 파라미터로 접근
  return (
    type === 'string' &&
    format === 'email' &&
    jsonSchema.maxLength !== undefined
  );
};

export const FunctionDefinition = {
  Component: MyInput,
  test: complexTest
} satisfies FormTypeInputDefinition;
```

## 8. Errors 배열 처리 오류

### 문제

```typescript
function ErrorsIssueInput(props: FormTypeInputProps<string>) {
  const { errors } = props;

  // ❌ 배열 체크 없이 첫 번째 에러 접근
  const errorMessage = errors[0].message;  // 에러 배열이 비어있을 수 있음
}
```

### 해결 방법

```typescript
function SafeErrorsInput(props: FormTypeInputProps<string>) {
  const { errors } = props;

  // ✅ Optional chaining 사용
  const errorMessage = errors[0]?.message;

  // ✅ 조건부 렌더링
  return (
    <div>
      <input />
      {errors.length > 0 && (
        <span className="error">{errors[0].message}</span>
      )}
    </div>
  );
}

// ✅ 모든 에러 표시
function AllErrorsInput(props: FormTypeInputProps<string>) {
  const { errors } = props;

  return (
    <div>
      <input />
      {errors.length > 0 && (
        <ul className="errors">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 9. defaultValue와 value 혼동

### 문제

```typescript
function DefaultValueIssue(props: FormTypeInputProps<string>) {
  const { defaultValue } = props;

  // ❌ defaultValue를 value처럼 사용
  return (
    <input value={defaultValue} />
    // defaultValue는 초기값이며, 사용자 입력으로 변경되지 않음
  );
}
```

### 해결 방법

```typescript
function CorrectDefaultValue(props: FormTypeInputProps<string>) {
  const { value, defaultValue, onChange } = props;

  // ✅ value를 사용하되, undefined일 때 defaultValue로 fallback
  return (
    <input
      value={value ?? defaultValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ✅ uncontrolled component로 사용
function UncontrolledInput(props: FormTypeInputProps<string>) {
  const { defaultValue, onChange } = props;

  return (
    <input
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

## 10. onFileAttach 미사용

### 문제

```typescript
function MissingFileAttachInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;

  // ❌ 파일 업로드 시 onFileAttach 미사용
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file.name);  // 파일명만 저장, 파일 객체는 손실
    }
  };
}
```

### 해결 방법

```typescript
function CorrectFileAttachInput(props: FormTypeInputProps<string>) {
  const { value, onChange, onFileAttach } = props;

  // ✅ onFileAttach로 파일 객체 저장
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // 파일 객체를 폼에 첨부
    onFileAttach(file);

    // 파일명을 value로 저장
    if (file) {
      onChange(file.name);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {value && <span>Selected: {value}</span>}
    </div>
  );
}

// ✅ 다중 파일 업로드
function MultiFileInput(props: FormTypeInputProps<string[]>) {
  const { value, onChange, onFileAttach } = props;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // 다중 파일 첨부
    onFileAttach(files);

    // 파일명 배열 저장
    onChange(files.map(f => f.name));
  };

  return <input type="file" multiple onChange={handleFilesChange} />;
}
```

## 11. jsonSchema 제약 조건 무시

### 문제

```typescript
function IgnoredSchemaInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;

  // ❌ jsonSchema의 maxLength, pattern 등 무시
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

### 해결 방법

```typescript
function SchemaAwareInput(props: FormTypeInputProps<string>) {
  const { value, onChange, jsonSchema } = props;

  // ✅ jsonSchema 제약 조건 적용
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      maxLength={jsonSchema.maxLength}
      minLength={jsonSchema.minLength}
      pattern={jsonSchema.pattern}
    />
  );
}

// ✅ format에 따라 다른 input type 사용
function FormatAwareInput(props: FormTypeInputProps<string>) {
  const { value, onChange, jsonSchema } = props;

  const inputType = jsonSchema.format === 'email' ? 'email'
    : jsonSchema.format === 'uri' ? 'url'
    : jsonSchema.format === 'date' ? 'date'
    : 'text';

  return (
    <input
      type={inputType}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

## 12. 성능 문제: 불필요한 리렌더링

### 문제

```typescript
function PerformanceIssueInput(props: FormTypeInputProps<string>) {
  const { value, onChange, jsonSchema } = props;

  // ❌ 매 렌더링마다 정규식 생성
  const regex = new RegExp(jsonSchema.pattern ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return <input value={value ?? ''} onChange={handleChange} />;
}
```

### 해결 방법

```typescript
import { memo, useMemo, useCallback } from 'react';

const OptimizedInput = memo((props: FormTypeInputProps<string>) => {
  const { value, onChange, jsonSchema } = props;

  // ✅ 정규식 메모이제이션
  const regex = useMemo(() => {
    return jsonSchema.pattern ? new RegExp(jsonSchema.pattern) : null;
  }, [jsonSchema.pattern]);

  // ✅ 핸들러 메모이제이션
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return <input value={value ?? ''} onChange={handleChange} />;
});
```

---

이 가이드는 @canard/schema-form 사용 시 자주 발생하는 타입 관련 문제와 해결 방법을 정리했습니다.
