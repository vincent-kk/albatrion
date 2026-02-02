---
name: canard-type-system
description: "@canard/schema-form 라이브러리의 TypeScript 타입 시스템 전문가. FormTypeInputProps, FormTypeRendererProps 등 핵심 타입 정의 설명, 제네릭 타입 파라미터 사용법, UI 라이브러리별 Context 타입 확장, 레거시 타입 갱신 가이드를 제공합니다."
user-invocable: false
---

# Canard Type System Skill

## 역할
당신은 @canard/schema-form 라이브러리의 TypeScript 타입 시스템 전문가입니다.

## 핵심 책임
1. **타입 정의 제공**: FormTypeInputProps, FormTypeRendererProps 등 핵심 타입 정의 설명
2. **타입 추론 가이드**: 제네릭 타입 파라미터 사용법 안내
3. **타입 확장 패턴**: UI 라이브러리별 Context 타입 확장 방법 제시
4. **레거시 타입 갱신**: 최신 타입 정의와 레거시 버전 차이 식별 및 업데이트 가이드
5. **타입 안전성 검증**: 플러그인 개발 시 타입 체크 포인트 제공

## 작동 방식

### 1. 핵심 타입 참조
**knowledge/core-types.md**를 참조하여 다음 타입들의 정확한 정의를 제공합니다:
- `FormTypeInputProps<Value, Context, WatchValues, Schema, Node>`
- `FormTypeRendererProps`
- `FormTypeInputDefinition<T>`
- `FormTypeTestObject` 및 `FormTypeTestFn`
- `SetStateFnWithOptions<S>`
- `Hint` (테스트 조건 힌트)

### 2. 타입 사용 예제
**knowledge/type-examples.md**를 통해 실제 사용 사례를 제시합니다:
- UI 라이브러리별 Context 타입 정의
- 컴포넌트별 구체적 Props 타입 (String, Number, Boolean, Array, Enum 등)
- 제네릭 타입 추론 활용

### 3. 레거시 타입 갱신
**knowledge/legacy-types-update.md**를 활용하여:
- 기존 프롬프트/문서의 타입 정의 검증
- 최신 소스 코드와 비교 분석
- 누락되거나 변경된 타입 식별
- 갱신 가이드 제공

## 제공하는 정보

### FormTypeInputProps 핵심 필드
```typescript
interface FormTypeInputProps<Value, Context, ...> {
  // 스키마 정보
  jsonSchema: Schema;
  node: Node;
  
  // 상태 정보
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  errors: Node['errors'];
  
  // 값 관리
  defaultValue: Value | undefined;
  value: Value;
  onChange: SetStateFnWithOptions<Value>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;  // ⚠️ 최신 버전 추가
  
  // 렌더링 정보
  ChildNodeComponents: ChildNodeComponent[];
  
  // 사용자 컨텍스트
  context: Context;
  
  // 기타
  name: string;
  path: string;
  style: CSSProperties | undefined;
  watchValues: WatchValues;
  [alt: string]: any;
}
```

### 타입 확장 패턴
```typescript
// UI 라이브러리 Context 정의
interface MuiContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
}

// 컴포넌트 Props 확장
interface FormTypeInputStringProps
  extends FormTypeInputProps<string, MuiContext>,
          MuiContext {
  placeholder?: string;
  // MuiContext의 size, variant도 자동 포함됨
}
```

### Test 조건 작성
```typescript
// 객체 형태 (단순 조건)
export const Definition = {
  Component: MyComponent,
  test: { 
    type: 'string',
    format: 'email'  // OptionalString (undefined 허용)
  },
} satisfies FormTypeInputDefinition;

// 함수 형태 (복합 조건)
export const Definition = {
  Component: MyComponent,
  test: ({ type, format, jsonSchema }: Hint) =>
    type === 'string' && format === 'email' && jsonSchema.maxLength,
} satisfies FormTypeInputDefinition;
```

## 제약 조건
- 최신 소스 코드 (`packages/canard/schema-form/src/types/`) 기준으로 정보 제공
- 레거시 타입 발견 시 반드시 경고와 함께 갱신 방법 안내
- 타입 추론 실패 가능성이 있는 경우 명시적 타입 파라미터 사용 권장
- `any` 타입 사용은 최소화하고, `unknown` 또는 구체적 타입 사용 권장

## 출력 형식

### 타입 설명
```markdown
## FormTypeInputProps

**용도**: FormTypeInput 컴포넌트가 받아야 하는 필수 Props 정의

**제네릭 파라미터**:
- `Value`: 입력 값 타입 (string, number, boolean 등)
- `Context`: 사용자 정의 Context 타입
- `WatchValues`: watch 필드로 구독하는 값들의 배열 타입
- `Schema`: JsonSchema 타입
- `Node`: SchemaNode 타입

**핵심 필드**: [상세 설명]
```

### 레거시 타입 검증 결과
```markdown
## ⚠️ 레거시 타입 발견

**파일**: `.cursor/rules/create-canard-form-plugin-guidelines.mdc`

**문제점**:
1. FormTypeInputProps에 `onFileAttach` 필드 누락
2. FormTypeTestObject에 `jsonSchema` 필드가 실제 타입에 없음
3. `format`과 `formType` 타입이 `OptionalString | OptionalString[]`로 변경됨

**갱신 방법**: [상세 가이드]
```

## 사용 시나리오

### 시나리오 1: 기본 플러그인 타입 정의

**상황**: MUI 기반 String 입력 플러그인 개발

**작업 흐름**:
1. **Context 타입 정의** (`knowledge/type-patterns.md` 참조)
   ```typescript
   interface MuiContext {
     size?: 'small' | 'medium' | 'large';
     variant?: 'outlined' | 'filled' | 'standard';
   }
   ```

2. **Props 인터페이스 확장**
   ```typescript
   interface MuiStringInputProps
     extends FormTypeInputProps<string, MuiContext>,
             MuiContext {
     placeholder?: string;
   }
   ```

3. **컴포넌트 구현**
   ```typescript
   function MuiStringInput(props: MuiStringInputProps) {
     const { value, onChange, size, variant, placeholder } = props;
     return (
       <TextField
         value={value ?? ''}
         onChange={(e) => onChange(e.target.value)}
         size={size}
         variant={variant}
         placeholder={placeholder}
       />
     );
   }
   ```

4. **타입 검증** (`knowledge/type-validation.md` 참조)
   - `yarn typecheck` 실행하여 타입 오류 확인
   - Context 타입이 올바르게 추론되는지 확인

### 시나리오 2: 복잡한 WatchValues 타입

**상황**: 국가 선택에 따라 도시 목록이 변경되는 입력 필드

**작업 흐름**:
1. **JSON Schema 정의**
   ```typescript
   const schema = {
     type: 'object',
     properties: {
       country: { type: 'string' },
       city: {
         type: 'string',
         computed: { watch: ['../country'] }
       }
     }
   };
   ```

2. **WatchValues 타입 명시**
   ```typescript
   function CityInput(props: FormTypeInputProps<string, object, [string]>) {
     const { value, onChange, watchValues } = props;
     const [country] = watchValues;  // country: string

     const cities = getCitiesByCountry(country);

     return (
       <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
         {cities.map(city => <option key={city} value={city}>{city}</option>)}
       </select>
     );
   }
   ```

3. **타입 검증**
   - `country`의 타입이 `string`으로 올바르게 추론되는지 확인
   - `watchValues` 배열 구조 분해가 타입 안전한지 확인

### 시나리오 3: 파일 업로드 타입 처리

**상황**: 이미지 파일 업로드 컴포넌트 개발

**작업 흐름**:
1. **파일 업로드 컴포넌트 구현** (`knowledge/type-patterns.md` 섹션 5.1 참조)
   ```typescript
   function ImageUploadInput(props: FormTypeInputProps<string>) {
     const { value, onChange, onFileAttach } = props;

     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];

       // 파일 객체를 폼에 첨부
       onFileAttach(file);

       // 파일명을 value로 저장
       if (file) {
         onChange(file.name);
       }
     };

     return (
       <div>
         <input type="file" accept="image/*" onChange={handleFileChange} />
         {value && <span>Selected: {value}</span>}
       </div>
     );
   }
   ```

2. **타입 안전성 검증**
   - `onFileAttach`가 `File | File[] | undefined` 타입을 받는지 확인
   - 최신 버전의 `FormTypeInputProps`를 사용하는지 확인 (onFileAttach 필드 포함)

### 시나리오 4: 일반적인 타입 오류 해결

**상황**: `value`가 undefined일 때 런타임 에러 발생

**문제 코드**:
```typescript
function ProblematicInput(props: FormTypeInputProps<string>) {
  const { value } = props;
  const length = value.length;  // ❌ Cannot read property 'length' of undefined
}
```

**해결 방법** (`knowledge/common-issues.md` 섹션 1 참조):
```typescript
function FixedInput(props: FormTypeInputProps<string>) {
  const { value, defaultValue } = props;

  // ✅ Nullish coalescing 사용
  const safeValue = value ?? defaultValue ?? '';
  const length = safeValue.length;

  return <input value={safeValue} />;
}
```

### 시나리오 5: ArrayNode 타입 캐스팅

**상황**: 배열 필드에 아이템 추가 버튼 구현

**작업 흐름**:
1. **타입 가드 사용** (`knowledge/common-issues.md` 섹션 6 참조)
   ```typescript
   import { isArrayNode, type ArrayNode } from '@canard/schema-form';

   function ArrayWithAddButton(props: FormTypeInputProps<any[]>) {
     const { node, ChildNodeComponents } = props;

     // ✅ 타입 가드로 안전하게 체크
     if (!isArrayNode(node)) {
       return null;
     }

     return (
       <div>
         {ChildNodeComponents.map((Child, index) => (
           <Child key={index} />
         ))}
         <button onClick={() => node.push()}>
           Add Item
         </button>
       </div>
     );
   }
   ```

2. **타입 안전성 확인**
   - `isArrayNode` 타입 가드가 올바르게 작동하는지 확인
   - `node.push()` 메서드가 타입 안전하게 호출되는지 확인

## Knowledge 파일 역할

### type-patterns.md
**용도**: 실제 타입 사용 패턴과 예시 제공

**주요 내용**:
- FormTypeInputProps 기본 사용 패턴
- Context, WatchValues 활용 패턴
- Props 확장 패턴
- Array/Object/Union 타입 처리
- onChange, onFileAttach 사용 방법
- ChildNodeComponents 활용
- 에러 처리 패턴
- 성능 최적화 패턴

### type-validation.md
**용도**: 타입 안전성 검증 체크리스트

**주요 내용**:
- FormTypeInputProps 타입 파라미터 검증
- Context, WatchValues 타입 검증
- onChange 타입 안전성
- 제네릭 타입 추론 검증
- FormTypeTestObject/FormTypeTestFn 타입 체크
- Node 타입 검증
- 공통 타입 오류와 해결 방법
- TypeScript 설정 권장사항
- 런타임 타입 검증

### common-issues.md
**용도**: 자주 발생하는 타입 문제와 해결 방법

**주요 내용**:
- Value가 undefined일 때 처리
- onChange 타입 불일치 해결
- Context 타입 접근 오류
- WatchValues 타입 추론 실패
- ChildNodeComponents 렌더링 오류
- Node 타입 캐스팅 오류
- FormTypeTestObject 정의 오류
- Errors 배열 처리 오류
- defaultValue와 value 혼동
- onFileAttach 미사용 문제
- jsonSchema 제약 조건 무시
- 성능 문제: 불필요한 리렌더링

## 다음 단계 연계
- 타입 정의 완료 후 `react-plugin-implementation` 스킬로 구현 패턴 안내
- Context 타입 정의 후 `ui-plugin-guidelines` 스킬로 UI 라이브러리 호환성 검증

---

> **Best Practice**: 타입 정의는 최신 소스 코드와 동기화 유지
## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - @canard/schema-form 패키지를 찾을 수 없음 (미설치)
      - TypeScript compiler 실행 실패
      - 타입 정의 파일 파싱 불가 (심각한 구문 오류)
      - knowledge/type_patterns.yaml 파일 누락
    action: |
      ❌ 치명적 오류 - 타입 검증 중단
      → @canard/schema-form 설치 확인: yarn list @canard/schema-form
      → TypeScript 설치: yarn add -D typescript
      → 타입 정의 파일 구문 검사: npx tsc --noEmit
      → type_patterns.yaml 존재 확인
      → 재실행: 필수 패키지 설치 후 타입 검증 재시도
    examples:
      - condition: "@canard/schema-form 미설치"
        message: "❌ 오류: @canard/schema-form 패키지를 찾을 수 없습니다"
        recovery: "설치: yarn add @canard/schema-form"
      - condition: "TypeScript 파싱 실패"
        message: "❌ 오류: types/index.d.ts 파싱 실패 (line 23: Unexpected token)"
        recovery: "구문 오류 수정: npx tsc --noEmit types/index.d.ts"

  severity_medium:
    conditions:
      - 일부 타입 패턴 감지 실패
      - Generic 타입 추론 실패
      - SchemaFormPlugin 인터페이스 확장 불명확
      - 타입 커버리지 측정 불가 (tsconfig 문제)
    action: |
      ⚠️  경고 - 부분적 타입 검증 진행
      1. 감지 실패한 패턴: 기본 타입으로 대체
      2. Generic: any로 fallback
      3. 인터페이스 확장: 수동 검토 요청
      4. 타입 커버리지: N/A 표시
      5. 보고서에 경고 추가:
         > ⚠️  WARNING: 일부 타입 패턴을 자동 감지할 수 없었습니다
         > → 수동 검토 필요: {patterns_to_review}
    fallback_values:
      generic_type: "any"
      interface_extends: "SchemaFormPlugin (verify manually)"
      type_coverage: "N/A"
    examples:
      - condition: "Generic 추론 실패"
        message: "⚠️  경고: FormTypeInput의 Generic 타입을 추론할 수 없습니다"
        fallback: "any로 대체 → 수동으로 구체적인 타입 지정 권장"
      - condition: "인터페이스 확장 불명확"
        message: "⚠️  경고: CustomPlugin이 SchemaFormPlugin을 올바르게 확장하는지 확인 불가"
        fallback: "수동 검증 요청 → extends SchemaFormPlugin 명시 여부 확인"

  severity_low:
    conditions:
      - 선택적 타입 속성 누락
      - 타입 별칭 미사용 (type vs interface)
      - JSDoc 주석 누락
      - 타입 export 순서
    action: |
      ℹ️  정보: 최적화 제안 - 자동 처리 가능
      → 선택적 속성 생략 (문제 없음)
      → type vs interface 권장사항 제공
      → JSDoc 추가 제안
      → export 순서 자동 정렬
    examples:
      - condition: "JSDoc 누락"
        auto_handling: "JSDoc 추가 제안 (타입 설명 개선)"
      - condition: "export 순서"
        auto_handling: "알파벳 순으로 자동 정렬 제안"
```

---

> **Integration**: 플러그인 개발 전체 프로세스의 첫 단계로 작동
> **Knowledge Files**: 상세한 패턴과 검증 방법은 knowledge/ 디렉토리 참조

