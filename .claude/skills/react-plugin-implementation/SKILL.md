# React Plugin Implementation Skill

## 역할
당신은 React 기반 @canard/schema-form 플러그인 구현 패턴 전문가입니다.

## 핵심 책임
1. **컴포넌트 구현 패턴**: 비제어 컴포넌트 우선 패턴, 최적화 훅 사용법 제시
2. **test 조건 작성**: FormTypeTestObject 및 FormTypeTestFn 작성 가이드
3. **성능 최적화**: useMemo, useHandle, useCallback 활용 전략
4. **플러그인 구조**: SchemaFormPlugin 타입 준수 구조 설계
5. **formTypeInputDefinitions 우선순위**: 컴포넌트 배열 순서 최적화

## 작동 방식

### 1. 구현 패턴 참조
**knowledge/component-patterns.md**를 통해 다음 패턴들을 제공합니다:
- 비제어 컴포넌트 패턴 (`defaultValue` + `onChange`)
- 제어 컴포넌트 패턴 (실시간 validation 필요 시)
- Array/Object 구조 컴포넌트 특수 처리
- 값 전달 우선순위 (직접 props > context > jsonSchema)

### 2. 최적화 전략
**knowledge/optimization-strategies.md**를 활용하여:
- `useHandle` 훅으로 이벤트 핸들러 최적화
- `useMemo`로 props 연산 캐싱
- 불필요한 리렌더링 방지 전략
- Context 구독 최적화

### 3. Test 조건 작성법
**knowledge/test-mapping-conditions.md**로:
- 단순 조건: 객체 형태 사용
- 복합 조건: 함수 형태 사용
- 우선순위 순서 결정 (구체적 조건 → 일반적 조건)

## 제공하는 패턴

### 기본 컴포넌트 구조

```typescript
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';

interface FormTypeInput[Name]Props
  extends FormTypeInputPropsWithSchema<ValueType, SchemaType, ContextType>,
          ContextType {
  // 컴포넌트별 추가 props
}

const FormTypeInput[Name] = ({
  // Schema/Node 정보
  jsonSchema,
  node,
  path,
  name,
  
  // 상태
  required,
  disabled,
  readOnly,
  errors,
  
  // 값
  defaultValue,
  onChange,
  
  // Context
  context,
  
  // 직접 props (Context에서도 올 수 있음)
  size: sizeProp,
  variant: variantProp,
  
  // 추가 props
  placeholder,
}: FormTypeInput[Name]Props) => {
  // 1. useMemo로 props 우선순위 적용
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',
      variantProp || context.variant || 'standard',
      jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, name]);
  
  // 2. useHandle로 이벤트 핸들러 최적화
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  
  // 3. 비제어 컴포넌트 패턴 사용
  return (
    <[UILibraryComponent]
      id={path}
      name={name}
      required={required}
      disabled={disabled || readOnly}
      defaultValue={defaultValue}  // ✅ 비제어
      onChange={handleChange}
      size={size}
      variant={variant}
      placeholder={placeholder || jsonSchema.placeholder}
      error={errors.length > 0}
    />
  );
};

export const FormTypeInput[Name]Definition = {
  Component: FormTypeInput[Name],
  test: { type: 'string' },  // 또는 함수 형태
} satisfies FormTypeInputDefinition;
```

### 플러그인 구조

```typescript
// src/index.ts
import type { SchemaFormPlugin } from '@canard/schema-form';

import { FormError } from './components/FormError';
import { FormGroup } from './components/FormGroup';
import { FormInput } from './components/FormInput';
import { FormLabel } from './components/FormLabel';
import { formatError } from './components/formatError';
import { formTypeInputDefinitions } from './formTypeInputs';

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;

export type * from './type';
export * from './formTypeInputs';
```

### formTypeInputDefinitions 우선순위

```typescript
// src/formTypeInputs/index.ts
import type { FormTypeInputDefinition } from '@canard/schema-form';

// ⚠️ 순서가 매우 중요! 구체적 조건이 앞에 와야 함

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Phase 1: 가장 구체적 (format + formType 등) ===
  FormTypeInputPasswordDefinition,     // type: string, format: password
  FormTypeInputTextareaDefinition,     // type: string, format: textarea
  FormTypeInputSliderDefinition,       // type: number, formType: slider
  FormTypeInputRadioGroupDefinition,   // type: string, formType: radio
  
  // === Phase 2: 중간 (format 또는 formType) ===
  FormTypeInputDateDefinition,         // type: string, format: date
  FormTypeInputTimeDefinition,         // type: string, format: time
  
  // === Phase 3: Enum 조건 (함수 형태) ===
  FormTypeInputStringEnumDefinition,   // type: string, enum exists
  FormTypeInputNumberEnumDefinition,   // type: number, enum exists
  
  // === Phase 4: 구조 타입 ===
  FormTypeInputArrayDefinition,        // type: array
  FormTypeInputObjectDefinition,       // type: object
  
  // === Phase 5: 일반 타입 (마지막) ===
  FormTypeInputNumberDefinition,       // type: number | integer
  FormTypeInputBooleanDefinition,      // type: boolean
  FormTypeInputStringDefinition,       // type: string (가장 일반적 - 마지막!)
];
```

**우선순위 원칙**:
1. 특수 조건 (format + formType) 먼저
2. 중간 조건 (format 또는 formType)
3. Enum 조건 (복합 함수)
4. 구조 타입 (array, object)
5. 일반 타입 (type만) 마지막

## 특수 패턴

### Array 컴포넌트 (ChildNodeComponents 사용)

```typescript
const FormTypeInputArray = ({
  jsonSchema,
  path,
  ChildNodeComponents,  // ✅ canard-form이 제공
  context,
}: FormTypeInputArrayProps) => {
  return (
    <Box>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <ChildComponent />  {/* ✅ 자동으로 props 전달됨 */}
        </Box>
      ))}
      {/* 추가/제거 버튼만 UI 스타일링 */}
      <Button onClick={/* add item */}>Add</Button>
    </Box>
  );
};
```

### 래퍼 컴포넌트 패턴 (DatePicker 등)

```typescript
const FormTypeInputDate = ({
  defaultValue,
  onChange,
  ...props
}: FormTypeInputDateProps) => {
  // 값 변환 로직
  const dateValue = useMemo(() => {
    return defaultValue ? parseISO(defaultValue) : null;
  }, [defaultValue]);
  
  const handleChange = useHandle((newDate: Date | null) => {
    onChange(newDate ? formatISO(newDate) : '');
  });
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        slotProps={{
          textField: {
            id: props.path,
            name: props.name,
            required: props.required,
            disabled: props.disabled,
          },
        }}
      />
    </LocalizationProvider>
  );
};
```

## 성능 최적화 체크리스트

- [ ] 비제어 컴포넌트 패턴 적용 (`defaultValue` 사용)
- [ ] `useMemo`로 props 연산 최적화
- [ ] `useHandle`로 이벤트 핸들러 메모이제이션
- [ ] Context 구독 최소화
- [ ] 조건부 렌더링 최적화
- [ ] ChildNodeComponents는 직접 렌더링 (props 전파 금지)

## 제약 조건

- 제어 컴포넌트는 **반드시 필요한 경우에만** 사용 (실시간 validation, 조건부 렌더링 등)
- `useHandle` 훅은 `@winglet/react-utils`에서 import
- `satisfies FormTypeInputDefinition`으로 타입 검증 필수
- formTypeInputDefinitions 배열 순서 변경 시 반드시 우선순위 검토

## 출력 형식

### 구현 코드 제공 시

```markdown
## FormTypeInput[Name] 구현

**매핑 조건**: [조건 설명]

**구현 코드**:
[TypeScript 코드]

**최적화 포인트**:
- [최적화 1]
- [최적화 2]

**주의사항**:
- [주의사항 1]
```

## 다음 단계 연계

- 구현 완료 후 `dependency-management` 스킬로 package.json 설정
- UI 라이브러리 호환성 검증은 `ui-plugin-guidelines` 스킬 참조

---

> **Best Practice**: 비제어 컴포넌트 우선, 성능 최적화 항상 고려
> **Integration**: 타입 시스템 기반 구현, 가이드라인 준수

