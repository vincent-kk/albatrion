# Type Validation Guide

@canard/schema-form 타입 안전성 검증 가이드

## 1. 타입 안전성 체크리스트

### 1.1 FormTypeInputProps 타입 파라미터 검증

```typescript
// ✅ 올바른 타입 파라미터 사용
function StringInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;
  // value의 타입: string | undefined
  // onChange의 타입: (value: string | ((prev: string) => string), options?: ...) => void
}

// ❌ 잘못된 타입 파라미터
function WrongInput(props: FormTypeInputProps<any>) {
  // any 사용은 타입 안전성을 해침
}

// ✅ 복잡한 타입도 명시적으로 정의
interface UserData {
  name: string;
  age: number;
}

function UserInput(props: FormTypeInputProps<UserData>) {
  const { value, onChange } = props;
  // value의 타입: UserData | undefined
}
```

### 1.2 Context 타입 검증

```typescript
// ✅ Context 타입 명시
interface MuiContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
}

function MuiInput(props: FormTypeInputProps<string, MuiContext>) {
  const { context } = props;
  // context의 타입: MuiContext
  // context.size의 타입: 'small' | 'medium' | 'large' | undefined
}

// ❌ Context 타입 누락
function NoContextInput(props: FormTypeInputProps<string>) {
  const { context } = props;
  // context의 타입: object (타입 정보 손실)
}
```

### 1.3 WatchValues 타입 검증

```typescript
// ✅ WatchValues 타입 명시
function DependentInput(props: FormTypeInputProps<string, object, [string, number]>) {
  const { watchValues } = props;
  const [watchedString, watchedNumber] = watchValues;
  // watchedString: string
  // watchedNumber: number
}

// ❌ WatchValues 타입 누락
function NoWatchTypesInput(props: FormTypeInputProps<string>) {
  const { watchValues } = props;
  const [value1, value2] = watchValues;
  // value1, value2: any (타입 정보 손실)
}
```

## 2. onChange 타입 안전성

### 2.1 값 타입 체크

```typescript
function TypeSafeInput(props: FormTypeInputProps<number>) {
  const { value, onChange } = props;

  // ✅ 올바른 타입 전달
  const handleIncrement = () => {
    onChange((prev) => (prev ?? 0) + 1);
  };

  // ❌ 타입 에러 - string을 number 타입 onChange에 전달
  const handleWrong = () => {
    // @ts-expect-error
    onChange('not a number');  // TypeScript 에러 발생
  };

  return (
    <button onClick={handleIncrement}>
      Count: {value ?? 0}
    </button>
  );
}
```

### 2.2 함수형 업데이트 타입 체크

```typescript
function FunctionalUpdateInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;

  // ✅ 이전 값의 타입이 올바르게 추론됨
  const handleUpdate = () => {
    onChange((prev) => {
      // prev의 타입: string | undefined
      return prev ? prev.toUpperCase() : 'DEFAULT';
    });
  };

  // ❌ 잘못된 반환 타입
  const handleWrongUpdate = () => {
    onChange((prev) => {
      // @ts-expect-error
      return 123;  // TypeScript 에러 - number 반환 불가
    });
  };
}
```

## 3. 제네릭 타입 추론 검증

### 3.1 Value 타입 추론

```typescript
// ✅ 타입 추론이 올바르게 작동
function InferredInput<T extends string | number>(
  props: FormTypeInputProps<T>
) {
  const { value, onChange } = props;
  // value의 타입: T | undefined
  // onChange의 타입이 T를 기반으로 추론됨
}

// ✅ 사용 시 타입 자동 추론
const stringInput = <InferredInput<string> />;  // T = string
const numberInput = <InferredInput<number> />;  // T = number
```

### 3.2 Schema 타입 추론

```typescript
import type { InferJsonSchema } from '@canard/schema-form';

// ✅ Schema 타입 자동 추론
function SchemaInferredInput<
  Value extends string | number,
  Schema extends InferJsonSchema<Value> = InferJsonSchema<Value>
>(props: FormTypeInputProps<Value, object, any[], Schema>) {
  const { jsonSchema } = props;
  // jsonSchema의 타입이 Value를 기반으로 추론됨
}
```

## 4. FormTypeTestObject 타입 검증

### 4.1 Test 객체 타입 체크

```typescript
import type { FormTypeInputDefinition } from '@canard/schema-form';

// ✅ 올바른 test 객체 정의
export const StringEmailDefinition = {
  Component: EmailInput,
  test: {
    type: 'string',
    format: 'email'  // OptionalString
  }
} satisfies FormTypeInputDefinition;

// ✅ 배열 형태도 가능
export const MultiTypeDefinition = {
  Component: FlexibleInput,
  test: {
    type: ['string', 'number'],  // JsonSchemaType[]
    format: ['email', 'uri']     // OptionalString[]
  }
} satisfies FormTypeInputDefinition;

// ❌ 잘못된 test 객체
export const WrongDefinition = {
  Component: SomeInput,
  test: {
    type: 'string',
    // @ts-expect-error
    invalidField: 'value'  // FormTypeTestObject에 없는 필드
  }
};
```

### 4.2 Test 함수 타입 체크

```typescript
import type { FormTypeTestFn, Hint } from '@canard/schema-form';

// ✅ 올바른 test 함수 정의
const testFn: FormTypeTestFn = (hint: Hint) => {
  // hint의 타입:
  // {
  //   type: JsonSchemaType;
  //   path: string;
  //   jsonSchema: JsonSchemaWithVirtual;
  //   format?: string;
  //   formType?: string;
  // }

  return hint.type === 'string' && hint.format === 'email';
};

export const FunctionTestDefinition = {
  Component: EmailInput,
  test: testFn
} satisfies FormTypeInputDefinition<string>;

// ❌ 잘못된 test 함수 시그니처
const wrongTestFn = (wrongParam: any) => {
  // @ts-expect-error
  return wrongParam === 'test';
};
```

## 5. Node 타입 검증

### 5.1 Node 타입 가드 사용

```typescript
import { isArrayNode, isObjectNode } from '@canard/schema-form';
import type { ArrayNode, ObjectNode } from '@canard/schema-form';

function NodeTypeGuardInput(props: FormTypeInputProps<any>) {
  const { node } = props;

  // ✅ 타입 가드로 안전하게 타입 체크
  if (isArrayNode(node)) {
    // node의 타입: ArrayNode
    node.push();  // ArrayNode 메서드 사용 가능
  }

  if (isObjectNode(node)) {
    // node의 타입: ObjectNode
    const childNode = node.find('./childPath');  // ObjectNode 메서드 사용 가능
  }
}
```

### 5.2 타입 캐스팅 검증

```typescript
import type { ArrayNode, SchemaNode } from '@canard/schema-form';

function TypeCastingInput(props: FormTypeInputProps<any[]>) {
  const { node } = props;

  // ✅ 타입 가드 후 안전한 캐스팅
  if (isArrayNode(node)) {
    const arrayNode = node as ArrayNode;
    arrayNode.push();  // 안전하게 사용
  }

  // ❌ 타입 가드 없이 직접 캐스팅 (위험)
  const unsafeArrayNode = node as ArrayNode;
  // 런타임에 node가 ArrayNode가 아닐 수 있음
}
```

## 6. 공통 타입 오류와 해결 방법

### 6.1 undefined 처리

```typescript
function UndefinedSafeInput(props: FormTypeInputProps<string>) {
  const { value, defaultValue } = props;

  // ✅ undefined 안전 처리
  const displayValue = value ?? defaultValue ?? '';

  // ❌ undefined 미처리 (런타임 에러 가능)
  const unsafeLength = value.length;  // value가 undefined일 수 있음

  return <input value={displayValue} />;
}
```

### 6.2 any 타입 사용 제한

```typescript
// ❌ any 사용 지양
function AnyInput(props: FormTypeInputProps<any>) {
  const { value } = props;
  // value의 타입: any (타입 안전성 상실)
}

// ✅ unknown 또는 구체적 타입 사용
function UnknownInput(props: FormTypeInputProps<unknown>) {
  const { value } = props;
  // value의 타입: unknown | undefined
  // 사용 전 타입 검증 필요
}

// ✅ 가장 권장: 구체적 타입 사용
function ConcreteInput(props: FormTypeInputProps<string | number>) {
  const { value } = props;
  // value의 타입: string | number | undefined
}
```

### 6.3 [alt: string]: any 속성 안전하게 사용

```typescript
function AdditionalPropsInput(props: FormTypeInputProps<string>) {
  // ✅ 타입 단언으로 안전하게 추가 props 접근
  const customProp = (props as any).customProp as string | undefined;

  // ✅ 또는 인터페이스 확장
  interface ExtendedProps extends FormTypeInputProps<string> {
    customProp?: string;
  }

  const extendedProps = props as ExtendedProps;
  const safeCustomProp = extendedProps.customProp;
}
```

## 7. TypeScript 설정 검증

### 7.1 tsconfig.json 권장 설정

```json
{
  "compilerOptions": {
    "strict": true,                    // 엄격한 타입 체크 활성화
    "noImplicitAny": true,             // 암시적 any 금지
    "strictNullChecks": true,          // null/undefined 엄격 체크
    "strictFunctionTypes": true,       // 함수 타입 엄격 체크
    "strictPropertyInitialization": true,
    "noUncheckedIndexedAccess": true,  // 인덱스 접근 시 undefined 체크
    "skipLibCheck": false              // 타입 정의 파일도 체크
  }
}
```

### 7.2 컴파일 시 타입 체크

```bash
# 타입 체크만 실행
yarn typecheck

# 또는 tsc 직접 실행
npx tsc --noEmit

# 특정 파일만 체크
npx tsc --noEmit src/components/MyInput.tsx
```

## 8. 타입 정의 최신성 검증

### 8.1 소스 코드와 동기화 확인

```typescript
// ✅ 최신 소스 코드 기준 타입 사용
// @canard/schema-form/src/types/formTypeInput.ts 참조

// FormTypeInputProps 필드 체크리스트:
interface TypeCheckList {
  jsonSchema: '✅ 존재';
  readOnly: '✅ 존재';
  disabled: '✅ 존재';
  required: '✅ 존재';
  node: '✅ 존재';
  name: '✅ 존재';
  path: '✅ 존재';
  errors: '✅ 존재';
  watchValues: '✅ 존재';
  defaultValue: '✅ 존재';
  value: '✅ 존재';
  onChange: '✅ 존재';
  onFileAttach: '✅ 존재 (최신 버전)';  // 최근 추가됨
  ChildNodeComponents: '✅ 존재';
  style: '✅ 존재';
  context: '✅ 존재';
}
```

### 8.2 레거시 타입 검출

```typescript
// ❌ 레거시 타입 (구버전)
interface LegacyFormTypeInputProps {
  // onFileAttach 필드 누락
  // 최신 버전에는 onFileAttach가 포함됨
}

// ✅ 최신 타입 import 확인
import type {
  FormTypeInputProps,
  FormTypeInputDefinition,
  FormTypeTestObject,
  FormTypeTestFn,
  Hint
} from '@canard/schema-form';

// @canard/schema-form 패키지 버전 확인
// package.json에서 최신 버전 사용 중인지 체크
```

## 9. 런타임 타입 검증

### 9.1 개발 모드 검증

```typescript
function DevModeValidationInput(props: FormTypeInputProps<string>) {
  const { value, onChange, jsonSchema } = props;

  // ✅ 개발 모드에서만 타입 검증
  if (process.env.NODE_ENV === 'development') {
    if (typeof value !== 'string' && value !== undefined) {
      console.error(`Expected string, got ${typeof value}`);
    }

    if (jsonSchema.type !== 'string') {
      console.warn('jsonSchema.type mismatch with Value type parameter');
    }
  }

  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
}
```

### 9.2 PropTypes (선택적)

```typescript
import PropTypes from 'prop-types';

function PropTypesInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;
  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
}

// ✅ 런타임 타입 체크 추가 (선택적)
PropTypesInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool.isRequired
};
```

## 10. 타입 안전성 테스트

### 10.1 타입 테스트 작성

```typescript
// type-tests.ts
import type { FormTypeInputProps } from '@canard/schema-form';

// ✅ 컴파일 시 타입 체크
type AssertString = FormTypeInputProps<string>['value'];
// @ts-expect-error
type AssertError = AssertString extends number ? true : false;  // 에러 발생 (string !== number)

type AssertStringOrUndefined = AssertString extends string | undefined ? true : false;
const _test: AssertStringOrUndefined = true;  // 통과

// onChange 시그니처 테스트
type OnChangeType = FormTypeInputProps<number>['onChange'];
type AssertOnChange = OnChangeType extends (value: number | ((prev: number) => number), options?: any) => void
  ? true
  : false;
const _onChangeTest: AssertOnChange = true;  // 통과
```

### 10.2 단위 테스트에서 타입 검증

```typescript
import { describe, it, expect } from 'vitest';
import type { FormTypeInputProps } from '@canard/schema-form';

describe('FormTypeInput Type Safety', () => {
  it('should enforce correct value type', () => {
    const mockProps: FormTypeInputProps<string> = {
      value: 'test',
      onChange: (value) => {
        // value의 타입이 string | ((prev: string) => string) 인지 확인
        expect(typeof value === 'string' || typeof value === 'function').toBe(true);
      },
      // ... 기타 필수 props
    } as any;

    // 컴파일 타임 체크
    const value: string | undefined = mockProps.value;
    expect(value).toBe('test');
  });
});
```

---

이 가이드는 @canard/schema-form의 타입 안전성을 보장하기 위한 검증 방법을 제시합니다.
모든 플러그인 개발 시 이 체크리스트를 참고하여 타입 안전성을 확보하세요.
