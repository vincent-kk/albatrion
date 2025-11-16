# 레거시 타입 갱신 가이드

프롬프트나 문서에 포함된 타입 정의가 최신 소스 코드와 일치하는지 검증하고 갱신하는 방법입니다.

## 검증 프로세스

### 1단계: 소스 파일 읽기

**검증 대상 파일**:
- `packages/canard/schema-form/src/types/formTypeInput.ts`
- `packages/canard/schema-form/src/types/formTypeRenderer.ts`

**검증 대상 프롬프트/문서**:
- `.cursor/rules/create-canard-form-plugin-guidelines.mdc`
- 기타 플러그인 개발 가이드 문서

### 2단계: 타입 비교

다음 체크리스트를 따라 차이점을 식별합니다:

#### FormTypeInputProps 체크리스트

- [ ] `jsonSchema: Schema` 존재
- [ ] `readOnly: boolean` 존재
- [ ] `disabled: boolean` 존재
- [ ] `required: boolean` 존재
- [ ] `node: Node` 존재
- [ ] `name: Node['name']` 존재
- [ ] `path: Node['path']` 존재
- [ ] `errors: Node['errors']` 존재
- [ ] `watchValues: WatchValues` 존재
- [ ] `defaultValue: Value | undefined` 존재
- [ ] `value: Value` 존재
- [ ] `onChange: SetStateFnWithOptions<Value>` 존재
- [ ] **`onFileAttach: Fn<[file: File | File[] | undefined]>`** 존재 ⚠️ 최신 추가
- [ ] `ChildNodeComponents: ChildNodeComponent[]` 존재
- [ ] `style: CSSProperties | undefined` 존재
- [ ] `context: Context` 존재
- [ ] `[alt: string]: any` 존재

#### FormTypeTestObject 체크리스트

- [ ] `type: JsonSchemaType | JsonSchemaType[]` 존재
- [ ] `path: string | string[]` 존재
- [ ] **`jsonSchema: JsonSchemaWithVirtual`** 존재하지 **않음** ⚠️ 레거시에 잘못 포함됨
- [ ] `format: OptionalString | OptionalString[]` 타입 확인 ⚠️ undefined 허용
- [ ] `formType: OptionalString | OptionalString[]` 타입 확인 ⚠️ undefined 허용

#### 누락된 타입 확인

다음 타입들이 소스 코드에는 있지만 문서에 누락될 수 있습니다:

- [ ] `UnknownFormTypeInputProps`
- [ ] `ChildNodeComponentProps`
- [ ] `FormTypeInputPropsWithNode`
- [ ] `InferFormTypeInputProps`
- [ ] `OverridableFormTypeInputProps`

### 3단계: 갱신 적용

#### 공통 갱신 1: onFileAttach 추가

**위치**: FormTypeInputProps 인터페이스

**Before**:
```typescript
export interface FormTypeInputProps<...> {
  // ...
  onChange: SetStateFnWithOptions<Value>;
  ChildNodeComponents: ChildNodeComponent[];
  // ...
}
```

**After**:
```typescript
export interface FormTypeInputProps<...> {
  // ...
  onChange: SetStateFnWithOptions<Value>;
  /** onFileAttach handler of FormTypeInput Component */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent[];
  // ...
}
```

#### 공통 갱신 2: FormTypeTestObject 수정

**위치**: FormTypeTestObject 타입 정의

**Before**:
```typescript
export type FormTypeTestObject = Partial<{
  type: JsonSchemaType | JsonSchemaType[];
  path: string | string[];
  jsonSchema: JsonSchemaWithVirtual;  // ❌ 제거 필요
  format: string | string[];  // ❌ 타입 변경 필요
  formType: string | string[];  // ❌ 타입 변경 필요
}>;
```

**After**:
```typescript
type OptionalString = string | undefined;

export type FormTypeTestObject = Partial<{
  type: JsonSchemaType | JsonSchemaType[];
  path: string | string[];
  // jsonSchema 필드 제거됨
  format: OptionalString | OptionalString[];  // ✅ undefined 허용
  formType: OptionalString | OptionalString[];  // ✅ undefined 허용
}>;
```

**이유**: 
- `format`과 `formType`은 JsonSchema에서 선택적(optional) 필드이므로 `undefined`를 명시적으로 허용해야 합니다.
- `jsonSchema` 필드는 실제 타입에 존재하지 않으며, `Hint` 타입에서만 제공됩니다.

#### 공통 갱신 3: 누락된 타입 추가 (선택적)

문서의 완성도를 높이려면 다음 타입들도 추가합니다:

```typescript
/** FormTypeInputProps to use when type inference is not needed */
export interface UnknownFormTypeInputProps {
  jsonSchema: any;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: any;
  name: string;
  path: string;
  errors: any[];
  watchValues: any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFnWithOptions<any>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent<any>[];
  style: CSSProperties | undefined;
  context: any;
  [alt: string]: any;
}

export interface ChildNodeComponentProps<Value extends AllowedValue = any>
  extends OverridableFormTypeInputProps {
  defaultValue?: Value;
  value?: Value;
  onChange?: SetStateFnWithOptions<Value>;
  onFileAttach?: Fn<[file: File | File[] | undefined]>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  context?: Dictionary;
  [alt: string]: any;
}
```

## 자동 검증 스크립트 (예시)

```typescript
// validate-types.ts
import * as fs from 'fs';

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  incorrect: string[];
}

function validateFormTypeInputProps(content: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missing: [],
    incorrect: [],
  };
  
  // onFileAttach 존재 확인
  if (!content.includes('onFileAttach')) {
    result.isValid = false;
    result.missing.push('onFileAttach: Fn<[file: File | File[] | undefined]>');
  }
  
  return result;
}

function validateFormTypeTestObject(content: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missing: [],
    incorrect: [],
  };
  
  // jsonSchema 필드 있으면 안 됨
  const testObjectMatch = content.match(/FormTypeTestObject[\s\S]*?}>};/);
  if (testObjectMatch && testObjectMatch[0].includes('jsonSchema:')) {
    result.isValid = false;
    result.incorrect.push('jsonSchema field should not exist in FormTypeTestObject');
  }
  
  // OptionalString 사용 확인
  if (testObjectMatch && !testObjectMatch[0].includes('OptionalString')) {
    result.isValid = false;
    result.incorrect.push('format and formType should use OptionalString type');
  }
  
  return result;
}

// 실행
const guidelineContent = fs.readFileSync(
  '.cursor/rules/create-canard-form-plugin-guidelines.mdc',
  'utf-8'
);

const inputPropsResult = validateFormTypeInputProps(guidelineContent);
const testObjectResult = validateFormTypeTestObject(guidelineContent);

console.log('FormTypeInputProps:', inputPropsResult);
console.log('FormTypeTestObject:', testObjectResult);
```

## 히스토리: 주요 타입 변경 사항

### v1.0 → v1.1 (2024년 중반)

**추가**:
- `onFileAttach` 필드 추가 (파일 업로드 기능 지원)

**변경**:
- `FormTypeTestObject`에서 `jsonSchema` 필드 제거
- `format`과 `formType` 타입을 `OptionalString | OptionalString[]`로 변경

### v0.9 → v1.0 (2024년 초)

**추가**:
- `watchValues` 필드 추가 (계산 필드 지원)
- `UnknownFormTypeInputProps` 타입 추가

**변경**:
- `onChange` 타입을 `SetStateFnWithOptions`로 변경 (옵션 지원)

---

## 검증 체크리스트 (요약)

레거시 문서를 검증할 때 다음 항목들을 중점적으로 확인하세요:

1. ✅ `FormTypeInputProps`에 `onFileAttach` 있는가?
2. ✅ `FormTypeTestObject`에 `jsonSchema` 필드가 **없는가**?
3. ✅ `format`과 `formType`이 `OptionalString` 타입인가?
4. ✅ 소스 코드의 JSDoc 주석과 문서 설명이 일치하는가?
5. ✅ 제네릭 타입 파라미터 개수와 순서가 일치하는가?

**마지막 확인**: `packages/canard/schema-form/src/types/` 디렉토리의 소스 코드가 항상 최종 진실의 원천(Single Source of Truth)입니다.

