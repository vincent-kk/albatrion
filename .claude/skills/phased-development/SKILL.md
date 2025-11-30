# Phased Development Skill

## 역할

당신은 @canard/schema-form 플러그인의 단계별 개발 프로세스 전문가입니다.

## 핵심 책임

1. **5단계 개발 절차**: 설계 → 인프라 → 핵심 → 고급 → 최적화
2. **우선순위 결정**: 컴포넌트 구현 순서 제시
3. **체크리스트 제공**: 각 단계별 완료 조건
4. **마일스톤 관리**: 개발 진행 상황 추적
5. **품질 검증**: 각 단계별 검증 기준

## 작동 방식

### 1. 개발 단계 가이드

**knowledge/development-phases.md**를 통해:

- Phase 1-5 상세 절차
- 각 단계 완료 조건
- 다음 단계 전환 기준

### 2. 우선순위 관리

**knowledge/priority-guide.md**로:

- P1-P4 우선순위 기준
- 컴포넌트 구현 순서
- MVP vs Full Feature 구분

### 3. 최적화 검증

**knowledge/optimization-checklist.md**로:

- 성능 최적화 체크리스트
- 코드 품질 검증
- 배포 전 최종 점검

## 제공하는 정보

### 5단계 개발 프로세스

#### Phase 1: 설계 및 검증 (1-2일)

**목표**: 호환성 분석 및 설계 완료

**작업**:

1. UI 라이브러리 컴포넌트 매핑 분석
2. Context 타입 및 인터페이스 설계
3. 구현 우선순위 결정
4. package.json 초안 작성

**완료 조건**:

- [ ] 호환성 매트릭스 작성 완료
- [ ] Context 타입 정의 완료
- [ ] 우선순위 결정 완료

#### Phase 2: 기본 인프라 (2-3일)

**목표**: 프로젝트 기본 구조 구축

**작업**:

1. 프로젝트 설정 및 의존성 설치
2. 타입 정의 (`src/type.ts`)
3. 기본 렌더러 구현 (FormGroup, FormLabel, FormInput, FormError, formatError)
4. 빌드 및 테스트 환경 구성

**완료 조건**:

- [ ] 빌드 성공 (`yarn build`)
- [ ] 타입 체크 통과 (`yarn type-check`)
- [ ] 기본 렌더러 5개 구현 완료

#### Phase 3: 핵심 컴포넌트 (3-5일)

**목표**: 필수 FormTypeInput 구현

**우선순위 순서**:

1. **Priority 1: 기본 Input** (1-2일)
   - FormTypeInputString
   - FormTypeInputNumber
   - FormTypeInputBoolean
   - **formTypeInputDefinitions 배열 마지막에 배치**

2. **Priority 2: 특수 Format/FormType** (1-2일)
   - FormTypeInputTextarea (format: textarea)
   - FormTypeInputPassword (format: password)
   - FormTypeInputDate (format: date)
   - FormTypeInputTime (format: time)
   - FormTypeInputSlider (formType: slider)
   - **formTypeInputDefinitions 배열 앞쪽에 배치**

3. **Priority 3: Enum 및 구조** (1-2일)
   - FormTypeInputStringEnum (함수 조건)
   - FormTypeInputArray (ChildNodeComponents)

**완료 조건**:

- [ ] P1 컴포넌트 모두 구현
- [ ] P2 컴포넌트 선택 구현
- [ ] formTypeInputDefinitions 우선순위 순서 정렬
- [ ] 단위 테스트 작성

#### Phase 4: 고급 기능 및 문서화 (2-3일)

**목표**: 추가 컴포넌트 및 문서

**작업**:

1. 선택적 컴포넌트 (Radio, Slider, 등)
2. README.md 및 README-ko_kr.md 작성
3. Storybook stories 작성
4. package.json 의존성 최종 확인

**완료 조건**:

- [ ] README 작성 완료
- [ ] Storybook stories 작성
- [ ] 예제 코드 작성

#### Phase 5: 최적화 및 검증 (1-2일)

**목표**: 성능 최적화 및 배포 준비

**작업**:

1. 성능 최적화 체크리스트 적용
2. 접근성 검증 (axe-core)
3. canard-form 통합 테스트
4. 빌드 및 타입 체크

**완료 조건**:

- [ ] 성능 최적화 체크리스트 100% 완료
- [ ] 접근성 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 빌드 크기 확인

## 우선순위 가이드

### Priority 1 (P1) - MVP 필수

**기준**: 기본 폼 동작에 필수

**컴포넌트**:

- String, Number, Boolean 입력
- 기본 렌더러 5개

**목표**: 2-3일 내 구현

### Priority 2 (P2) - 초기 버전 포함

**기준**: 일반적으로 자주 사용

**컴포넌트**:

- Textarea, Password, Email
- Date, Time (UI 라이브러리 지원 시)
- Enum/Select

**목표**: Phase 3-4에서 구현

### Priority 3 (P3) - 추가 기능

**기준**: 특수한 경우 사용

**컴포넌트**:

- Radio Group, Slider
- Color Picker
- 커스텀 Format

**목표**: Phase 4 또는 2차 버전

### Priority 4 (P4) - 선택적

**기준**: 외부 라이브러리 필요 또는 비표준

**컴포넌트**:

- Rich Text Editor
- File Upload (고급)

**목표**: 3차 버전 또는 별도 패키지

## 체크리스트 템플릿

### Phase 완료 체크리스트

```markdown
## Phase {N}: {Phase Name}

**시작일**: YYYY-MM-DD
**목표 완료일**: YYYY-MM-DD
**실제 완료일**:

### 작업 목록

- [ ] 작업 1
- [ ] 작업 2
- [ ] 작업 3

### 완료 조건

- [ ] 조건 1
- [ ] 조건 2

### 이슈 및 결정사항

- [날짜] 이슈 또는 결정

### 다음 단계

- Phase {N+1} 준비사항
```

## 마일스톤

### M1: MVP (Phase 1-3)

- 기본 렌더러 5개
- P1 컴포넌트 (String, Number, Boolean)
- 빌드 및 테스트 환경

**목표**: 1주일

### M2: 초기 버전 (Phase 4)

- P2 컴포넌트 추가
- 문서화 완료
- Storybook stories

**목표**: 2주일

### M3: 정식 버전 (Phase 5)

- 성능 최적화
- 접근성 검증
- 통합 테스트

**목표**: 3주일

## 제약 조건

- Phase 순서는 지키되, 일정은 유연하게
- P1 완료 전 P2 시작 금지
- 각 Phase 완료 조건 충족 필수
- 코드 리뷰는 Phase 단위로

## 출력 형식

### 개발 계획 제공

```markdown
## {UI Library} 플러그인 개발 계획

### 일정 요약

- Phase 1: {날짜}
- Phase 2: {날짜}
- Phase 3: {날짜}
- Phase 4: {날짜}
- Phase 5: {날짜}

### Phase 1: 설계 및 검증

[상세 내용]

### Phase 2: 기본 인프라

[상세 내용]

...
```

## 사용 시나리오

### 시나리오 1: MUI 플러그인 Phase 1 - 설계 및 검증

**상황**: 새로운 MUI (Material-UI) v6 플러그인 개발 시작, Phase 1 설계 단계

**단계**:

#### Step 1: 호환성 매트릭스 작성

```markdown
## MUI v6 호환성 분석

### 기본 컴포넌트 매핑

| FormTypeInput | MUI Component               | 우선순위 | 난이도 | 비고                  |
| ------------- | --------------------------- | -------- | ------ | --------------------- |
| String        | TextField                   | P1       | 쉬움   | 기본                  |
| Number        | TextField (type="number")   | P1       | 쉬움   | 기본                  |
| Boolean       | Checkbox / Switch           | P1       | 쉬움   | 기본                  |
| Textarea      | TextField (multiline)       | P2       | 쉬움   | format: textarea      |
| Password      | TextField (type="password") | P2       | 쉬움   | format: password      |
| Email         | TextField (type="email")    | P2       | 쉬움   | format: email         |
| Date          | DatePicker (@mui/x)         | P2       | 중간   | 별도 패키지, ISO 변환 |
| Time          | TimePicker (@mui/x)         | P2       | 중간   | 별도 패키지, ISO 변환 |
| StringEnum    | Select / RadioGroup         | P2       | 중간   | 개수 기반 선택        |
| NumberEnum    | Select                      | P2       | 중간   | -                     |
| Slider        | Slider                      | P3       | 중간   | formType: slider      |
| Array         | Box + Button                | P2       | 어려움 | ChildNodeComponents   |
| Object        | Box                         | P2       | 쉬움   | ChildNodeComponents   |

### 특수 고려사항

**DatePicker/TimePicker**:

- ✅ 장점: @mui/x-date-pickers 공식 지원
- ⚠️ 주의: 별도 패키지 필요, date-fns 어댑터 설치
- 🔧 구현: ISO 8601 ↔ Date 객체 변환 필수
- 📦 의존성: `@mui/x-date-pickers`, `date-fns`

**Slider**:

- ✅ 장점: MUI Slider 컴포넌트 기본 제공
- 🔧 구현: formType: 'slider' 조건 추가
- 📋 Schema 예시: `{ type: 'number', formType: 'slider', minimum: 0, maximum: 100 }`

**Array/Object**:

- ✅ 장점: Box, Paper 컴포넌트로 깔끔한 레이아웃 가능
- 🔧 구현: ChildNodeComponents 활용, IconButton으로 삭제
- 🎨 스타일: Paper + sx prop으로 depth 표현
```

#### Step 2: Context 타입 설계

```typescript
// src/type.ts - 초안
/**
 * MUI 플러그인 Context 타입
 * SchemaForm의 context prop으로 전달되는 설정
 */
export interface MuiFormContext {
  /**
   * 전역 컴포넌트 크기
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";

  /**
   * 전역 TextField variant
   * @default 'outlined'
   */
  variant?: "standard" | "outlined" | "filled";

  /**
   * 전역 색상 테마
   * @default 'primary'
   */
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";

  /**
   * 파일 업로드 콜백 (Phase 4 또는 2차 버전)
   * @param file - 업로드할 파일
   * @returns 업로드된 파일 URL
   */
  onFileAttach?: (file: File) => Promise<string>;

  /**
   * 날짜 포맷 로케일 (Phase 3)
   * @default 'ko' (한국어)
   */
  dateLocale?: string;
}

/**
 * SchemaForm 사용 예시:
 *
 * <SchemaForm
 *   schema={schema}
 *   plugin={muiPlugin}
 *   context={{
 *     size: 'medium',
 *     variant: 'outlined',
 *     color: 'primary',
 *     dateLocale: 'en-US',
 *   }}
 * />
 */
```

#### Step 3: 우선순위 결정 및 일정 계획

```markdown
## 구현 우선순위 및 일정

### Phase 1: 설계 및 검증 (2일)

**날짜**: 2025-01-20 ~ 2025-01-21

- [x] 호환성 매트릭스 작성
- [x] Context 타입 설계
- [ ] 우선순위 결정
- [ ] package.json 초안

**결정사항**:

- DatePicker는 Phase 3에 구현 (date-fns 학습 필요)
- Slider는 Phase 4로 미룸 (P3 우선순위)
- Array/Object는 Phase 3에 포함 (MVP에 필요)

### Phase 2: 기본 인프라 (3일)

**예상 날짜**: 2025-01-22 ~ 2025-01-24

**Priority 1: 프로젝트 설정**

- [ ] yarn create 및 패키지 초기화
- [ ] tsconfig.json, rollup.config.js 설정
- [ ] @canard/schema-form peerDependencies 설정
- [ ] MUI 의존성 설치

**Priority 2: 타입 및 렌더러**

- [ ] src/type.ts 완성
- [ ] FormGroup, FormLabel, FormInput, FormError 구현
- [ ] formatError 헬퍼 함수

### Phase 3: 핵심 컴포넌트 (5일)

**예상 날짜**: 2025-01-25 ~ 2025-01-29

**Day 1-2: P1 기본 Input**

- [ ] FormTypeInputString
- [ ] FormTypeInputNumber
- [ ] FormTypeInputBoolean (Checkbox)

**Day 3-4: P2 특수 Format**

- [ ] FormTypeInputTextarea
- [ ] FormTypeInputPassword
- [ ] FormTypeInputEmail

**Day 5: Enum 및 구조**

- [ ] FormTypeInputStringEnum (Select 또는 RadioGroup)
- [ ] FormTypeInputArray (간단 버전)
- [ ] formTypeInputDefinitions 우선순위 정렬

### Phase 4: 고급 기능 (3일)

**예상 날짜**: 2025-01-30 ~ 2025-02-01

- [ ] FormTypeInputDate (DatePicker)
- [ ] FormTypeInputTime (TimePicker)
- [ ] README.md 작성
- [ ] Storybook stories 3-5개

### Phase 5: 최적화 (2일)

**예상 날짜**: 2025-02-02 ~ 2025-02-03

- [ ] 성능 최적화 체크리스트
- [ ] 접근성 테스트 (axe-core)
- [ ] 통합 테스트
- [ ] 빌드 및 배포

**총 예상 기간**: 15일 (3주)
```

#### Step 4: package.json 초안

```json
{
  "name": "@canard/schema-form-mui-plugin",
  "version": "0.1.0",
  "description": "Material-UI (MUI) v6 plugin for @canard/schema-form",
  "keywords": ["canard", "schema-form", "mui", "material-ui", "react", "form"],
  "author": "Your Name",
  "license": "MIT",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "rollup -c",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "@canard/schema-form": "*",
    "@mui/material": "^6.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@winglet/react-utils": "*"
  },
  "devDependencies": {
    "@canard/schema-form": "*",
    "@mui/material": "^6.0.0",
    "@types/react": "^18.0.0",
    "react": "^18.0.0",
    "rollup": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Phase 1 완료 조건**:

- ✅ 호환성 매트릭스 완성
- ✅ Context 타입 설계 완료
- ✅ 우선순위 및 일정 결정
- ✅ package.json 초안 작성

**다음 단계**: Phase 2로 진행, 프로젝트 설정 시작

---

### 시나리오 2: Ant Design 플러그인 Phase 2 - 기본 인프라 구축

**상황**: Ant Design v5 플러그인, Phase 1 완료 후 Phase 2 진행

**단계**:

#### Step 1: 프로젝트 초기화

```bash
# 1. 패키지 디렉토리 생성
mkdir packages/canard-schema-form-antd-plugin
cd packages/canard-schema-form-antd-plugin

# 2. package.json 생성 (Phase 1 초안 기반)
yarn init -y

# 3. TypeScript 및 빌드 도구 설치
yarn add -D typescript rollup @rollup/plugin-typescript rollup-plugin-dts

# 4. Ant Design 및 canard-form 설치 (dev)
yarn add -D @canard/schema-form antd react react-dom @types/react

# 5. winglet utils 의존성 추가
yarn add @winglet/react-utils

# 6. tsconfig.json 생성
```

#### Step 2: tsconfig.json 설정

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

#### Step 3: src/type.ts 구현

```typescript
// src/type.ts
/**
 * Ant Design 플러그인 Context 타입
 */
export interface AntdFormContext {
  /**
   * 전역 컴포넌트 크기
   * @default 'middle'
   */
  size?: "small" | "middle" | "large";

  /**
   * 전역 Input variant (Ant Design은 variant 없음, bordered로 제어)
   * @default true
   */
  bordered?: boolean;

  /**
   * ConfigProvider의 componentSize 연동
   */
  componentSize?: "small" | "middle" | "large";

  /**
   * 파일 업로드 콜백 (Phase 4)
   */
  onFileAttach?: (file: File) => Promise<string>;

  /**
   * 날짜 포맷 로케일
   * @default 'ko_KR'
   */
  locale?: string;
}

/**
 * 재사용 타입
 */
export type { FormTypeInputPropsWithSchema } from "@canard/schema-form";
```

#### Step 4: 기본 렌더러 구현 (FormGroup)

```typescript
// src/components/FormGroup.tsx
import type { FormTypeRendererProps } from '@canard/schema-form';
import { Box } from 'antd'; // ⚠️ Ant Design에는 Box가 없음, div 사용

/**
 * FormGroup: 폼 그룹 렌더러
 * depth에 따라 들여쓰기 적용
 */
export const FormGroup = ({ depth, children }: FormTypeRendererProps) => {
  return (
    <div
      style={{
        paddingLeft: depth * 16,
        borderLeft: depth > 0 ? '2px solid #f0f0f0' : undefined,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
};
```

#### Step 5: FormLabel 구현

```typescript
// src/components/FormLabel.tsx
import type { FormTypeRendererProps } from '@canard/schema-form';

/**
 * FormLabel: 폼 라벨 렌더러
 * Ant Design은 Form.Item이 라벨을 처리하므로 여기서는 간단히 구현
 */
export const FormLabel = ({ children, htmlFor, required }: FormTypeRendererProps) => {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        marginBottom: 4,
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
      {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
    </label>
  );
};
```

#### Step 6: FormInput, FormError, formatError 구현

```typescript
// src/components/FormInput.tsx
import type { FormTypeRendererProps } from '@canard/schema-form';

/**
 * FormInput: 입력 필드 래퍼
 * Ant Design은 Form.Item을 사용하지 않으므로 단순 wrapper
 */
export const FormInput = ({ children }: FormTypeRendererProps) => {
  return <div style={{ marginBottom: 8 }}>{children}</div>;
};

// src/components/FormError.tsx
import type { FormTypeRendererProps } from '@canard/schema-form';

/**
 * FormError: 에러 메시지 렌더러
 */
export const FormError = ({ children }: FormTypeRendererProps) => {
  if (!children) return null;

  return (
    <div
      style={{
        color: '#ff4d4f',
        fontSize: 12,
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
};

// src/components/formatError.ts
import type { FormTypeError } from '@canard/schema-form';

/**
 * formatError: 에러 객체를 문자열로 변환
 */
export const formatError = (error: FormTypeError): string => {
  // JSON Schema validation 에러
  if (error.keyword) {
    const keywordMessages: Record<string, string> = {
      required: '필수 입력 항목입니다',
      minLength: `최소 ${error.params?.limit}자 이상 입력해야 합니다`,
      maxLength: `최대 ${error.params?.limit}자까지 입력 가능합니다`,
      minimum: `최소값은 ${error.params?.limit}입니다`,
      maximum: `최대값은 ${error.params?.limit}입니다`,
      pattern: '형식이 올바르지 않습니다',
      format: '형식이 올바르지 않습니다',
      enum: '허용되지 않는 값입니다',
      type: '타입이 올바르지 않습니다',
    };

    return keywordMessages[error.keyword] || error.message || '유효하지 않은 값입니다';
  }

  // 일반 에러
  return error.message || '유효하지 않은 값입니다';
};
```

#### Step 7: src/index.ts 구현

```typescript
// src/index.ts
import type { SchemaFormPlugin } from "@canard/schema-form";

import { FormError } from "./components/FormError";
import { FormGroup } from "./components/FormGroup";
import { FormInput } from "./components/FormInput";
import { FormLabel } from "./components/FormLabel";
import { formatError } from "./components/formatError";

/**
 * Ant Design v5 플러그인
 * Phase 2: 기본 인프라만 구현, formTypeInputDefinitions는 Phase 3에서 추가
 */
export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions: [], // ⚠️ Phase 3에서 구현
} satisfies SchemaFormPlugin;

export type * from "./type";
```

#### Step 8: rollup.config.js 설정

```javascript
// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  // ESM 및 CJS 빌드
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
    external: [
      "react",
      "react-dom",
      "antd",
      "@canard/schema-form",
      "@winglet/react-utils",
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // dts 플러그인이 처리
      }),
    ],
  },
  // 타입 선언 파일 번들
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    external: [/\.css$/],
    plugins: [dts()],
  },
];
```

#### Step 9: 빌드 및 검증

```bash
# 1. TypeScript 타입 체크
yarn typecheck
# ✅ 에러 없이 통과해야 함

# 2. 빌드
yarn build
# ✅ dist/index.esm.js, dist/index.cjs.js, dist/index.d.ts 생성 확인

# 3. 생성된 파일 확인
ls -la dist/
# 출력:
# index.esm.js
# index.esm.js.map
# index.cjs.js
# index.cjs.js.map
# index.d.ts
```

**Phase 2 완료 조건**:

- ✅ 빌드 성공 (`yarn build`)
- ✅ 타입 체크 통과 (`yarn typecheck`)
- ✅ 기본 렌더러 5개 구현 완료 (FormGroup, FormLabel, FormInput, FormError, formatError)
- ✅ plugin 객체 export 성공

**다음 단계**: Phase 3로 진행, FormTypeInput 컴포넌트 구현 시작

---

### 시나리오 3: Chakra UI 플러그인 Phase 3 - 핵심 컴포넌트 구현

**상황**: Chakra UI v2 플러그인, Phase 2 완료 후 Phase 3 핵심 컴포넌트 구현

**단계**:

#### Day 1-2: Priority 1 기본 Input 구현

```typescript
// src/formTypeInputs/FormTypeInputString.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema, FormTypeInputDefinition } from '@canard/schema-form';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import type { ChakraFormContext } from '../type';

interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<string, never, ChakraFormContext>,
          ChakraFormContext {}

const FormTypeInputString = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
}: FormTypeInputStringProps) => {
  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'md',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  // ✅ Chakra UI는 FormControl로 감싸야 자동 접근성 처리
  return (
    <FormControl isRequired={required} isInvalid={hasError} isDisabled={disabled || readOnly}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Input
        id={path}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        size={size}
        placeholder={jsonSchema.placeholder}
      />
      {hasError && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
      {!hasError && jsonSchema.description && (
        <FormHelperText>{jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
};

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;
```

```typescript
// src/formTypeInputs/FormTypeInputNumber.tsx
const FormTypeInputNumber = ({ /* ...props */ }: FormTypeInputNumberProps) => {
  // FormTypeInputString과 유사, Input에 type="number" 추가
  return (
    <FormControl isRequired={required} isInvalid={hasError}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Input
        id={path}
        name={name}
        type="number"  // ✅ 차이점
        defaultValue={defaultValue ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        size={size}
      />
      {/* ... */}
    </FormControl>
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: (params) => {
    return params.type === 'number' || params.type === 'integer';
  },
} satisfies FormTypeInputDefinition;
```

```typescript
// src/formTypeInputs/FormTypeInputBoolean.tsx
import { Checkbox } from '@chakra-ui/react';

const FormTypeInputBoolean = ({ /* ...props */ }: FormTypeInputBooleanProps) => {
  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  });

  return (
    <FormControl isDisabled={disabled || readOnly}>
      <Checkbox
        id={path}
        name={name}
        defaultChecked={defaultValue ?? false}
        onChange={handleChange}
        size={size}
      >
        {label}
      </Checkbox>
      {jsonSchema.description && (
        <FormHelperText>{jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
};

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: { type: 'boolean' },
} satisfies FormTypeInputDefinition;
```

**Day 1-2 완료**:

- ✅ FormTypeInputString
- ✅ FormTypeInputNumber
- ✅ FormTypeInputBoolean

#### Day 3-4: Priority 2 특수 Format 구현

```typescript
// src/formTypeInputs/FormTypeInputTextarea.tsx
import { Textarea } from '@chakra-ui/react';

const FormTypeInputTextarea = ({ /* ...props */ }: FormTypeInputTextareaProps) => {
  return (
    <FormControl isRequired={required} isInvalid={hasError}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Textarea
        id={path}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        size={size}
        placeholder={jsonSchema.placeholder}
        rows={4}  // 기본 4줄
      />
      {/* ... */}
    </FormControl>
  );
};

export const FormTypeInputTextareaDefinition = {
  Component: FormTypeInputTextarea,
  test: { type: 'string', format: 'textarea' },  // ✅ format 조건
} satisfies FormTypeInputDefinition;
```

```typescript
// src/formTypeInputs/FormTypeInputPassword.tsx
const FormTypeInputPassword = ({ /* ...props */ }: FormTypeInputPasswordProps) => {
  return (
    <FormControl isRequired={required} isInvalid={hasError}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Input
        id={path}
        name={name}
        type="password"  // ✅ type="password"
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        size={size}
      />
      {/* ... */}
    </FormControl>
  );
};

export const FormTypeInputPasswordDefinition = {
  Component: FormTypeInputPassword,
  test: { type: 'string', format: 'password' },  // ✅ format 조건
} satisfies FormTypeInputDefinition;
```

**Day 3-4 완료**:

- ✅ FormTypeInputTextarea
- ✅ FormTypeInputPassword
- ✅ FormTypeInputEmail (Input type="email")

#### Day 5: Enum 및 Array 구현

```typescript
// src/formTypeInputs/FormTypeInputStringEnum.tsx
import { Select } from '@chakra-ui/react';

const FormTypeInputStringEnum = ({ /* ...props */ }: FormTypeInputStringEnumProps) => {
  const enumValues = useMemo(() => {
    return jsonSchema.enum as string[] ?? [];
  }, [jsonSchema.enum]);

  const enumLabels = useMemo(() => {
    return (jsonSchema.enumLabels as string[]) ?? enumValues;
  }, [jsonSchema.enumLabels, enumValues]);

  const handleChange = useHandle((event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  });

  return (
    <FormControl isRequired={required} isInvalid={hasError}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Select
        id={path}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        size={size}
        placeholder="선택하세요"
      >
        {enumValues.map((value, index) => (
          <option key={value} value={value}>
            {enumLabels[index] ?? value}
          </option>
        ))}
      </Select>
      {/* ... */}
    </FormControl>
  );
};

// ✅ 함수 형태 test 조건
export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ jsonSchema }) => {
    return (
      .type === 'string' &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 0
    );
  },
} satisfies FormTypeInputDefinition;
```

```typescript
// src/formTypeInputs/FormTypeInputArray.tsx
import { Box, Button, IconButton, VStack } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const FormTypeInputArray = ({
  jsonSchema,
  node,
  ChildNodeComponents,
  onChange,
  /* ...props */
}: FormTypeInputArrayProps) => {
  const handleAdd = useHandle(() => {
    const currentValue = node.value ?? [];
    onChange([...currentValue, undefined]);
  });

  const handleRemove = useHandle((index: number) => {
    const currentValue = node.value ?? [];
    onChange(currentValue.filter((_, i) => i !== index));
  });

  return (
    <Box>
      <FormLabel>{label}</FormLabel>
      <VStack spacing={4} align="stretch">
        {ChildNodeComponents?.map((ChildComponent, index) => (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" position="relative">
            <ChildComponent />
            <IconButton
              aria-label="delete"
              icon={<DeleteIcon />}
              size="sm"
              position="absolute"
              top={2}
              right={2}
              onClick={() => handleRemove(index)}
            />
          </Box>
        ))}
      </VStack>
      <Button leftIcon={<AddIcon />} onClick={handleAdd} size={size} mt={2}>
        추가
      </Button>
    </Box>
  );
};

export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: { type: 'array' },
} satisfies FormTypeInputDefinition;
```

#### formTypeInputDefinitions 우선순위 정렬

```typescript
// src/formTypeInputs/index.ts
import type { FormTypeInputDefinition } from "@canard/schema-form";

// ⚠️ 순서가 매우 중요! 구체적 조건이 앞에 와야 함

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Phase 1: 가장 구체적 (format + type) ===
  FormTypeInputPasswordDefinition, // type: string, format: password
  FormTypeInputTextareaDefinition, // type: string, format: textarea
  FormTypeInputEmailDefinition, // type: string, format: email

  // === Phase 2: Enum 조건 (함수 형태) ===
  FormTypeInputStringEnumDefinition, // type: string, enum exists

  // === Phase 3: 구조 타입 ===
  FormTypeInputArrayDefinition, // type: array

  // === Phase 4: 일반 타입 (마지막!) ===
  FormTypeInputNumberDefinition, // type: number | integer
  FormTypeInputBooleanDefinition, // type: boolean
  FormTypeInputStringDefinition, // type: string (가장 일반적 - 마지막!)
];

// ✅ 모든 Definition export
export * from "./FormTypeInputString";
export * from "./FormTypeInputNumber";
export * from "./FormTypeInputBoolean";
export * from "./FormTypeInputTextarea";
export * from "./FormTypeInputPassword";
export * from "./FormTypeInputEmail";
export * from "./FormTypeInputStringEnum";
export * from "./FormTypeInputArray";
```

**Phase 3 완료 조건**:

- ✅ P1 컴포넌트 모두 구현 (String, Number, Boolean)
- ✅ P2 컴포넌트 선택 구현 (Textarea, Password, Email)
- ✅ Enum 및 Array 구현
- ✅ formTypeInputDefinitions 우선순위 정렬
- ✅ src/index.ts 업데이트

```typescript
// src/index.ts 최종
import type { SchemaFormPlugin } from "@canard/schema-form";
import { formTypeInputDefinitions } from "./formTypeInputs";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
} from "./components";

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions, // ✅ Phase 3에서 추가됨
} satisfies SchemaFormPlugin;

export type * from "./type";
export * from "./formTypeInputs"; // 개별 Definition export
```

**다음 단계**: Phase 4로 진행, DatePicker 추가 및 문서화

---

### 시나리오 4: Phase 4 - 고급 기능 및 문서화

**상황**: Phase 3 완료, DatePicker 추가 및 README 작성

**단계**:

#### Step 1: README.md 작성

````markdown
# @canard/schema-form-chakra-ui-plugin

Chakra UI v2 plugin for [@canard/schema-form](https://github.com/your-org/canard-schema-form).

## Installation

```bash
npm install @canard/schema-form-chakra-ui-plugin
# or
yarn add @canard/schema-form-chakra-ui-plugin
```
````

**Peer Dependencies** (required):

```bash
npm install @canard/schema-form @chakra-ui/react react react-dom
```

## Quick Start

```tsx
import { SchemaForm } from "@canard/schema-form";
import { plugin as chakraPlugin } from "@canard/schema-form-chakra-ui-plugin";
import { ChakraProvider } from "@chakra-ui/react";

const schema = {
  type: "object",
  properties: {
    name: { type: "string", label: "Name" },
    age: { type: "number", label: "Age" },
    subscribe: { type: "boolean", label: "Subscribe to newsletter" },
  },
};

function App() {
  return (
    <ChakraProvider>
      <SchemaForm
        schema={schema}
        plugin={chakraPlugin}
        context={{
          size: "md",
        }}
      />
    </ChakraProvider>
  );
}
```

## Features

- ✅ **All basic types**: string, number, boolean, array, object
- ✅ **Special formats**: textarea, password, email
- ✅ **Enum support**: Select component
- ✅ **Full TypeScript support**
- ✅ **Automatic accessibility**: ARIA attributes via FormControl
- ✅ **Dark mode ready**: Chakra UI theming

## Context API

Configure global settings via `context` prop:

```tsx
<SchemaForm
  schema={schema}
  plugin={chakraPlugin}
  context={{
    size: "sm" | "md" | "lg", // Global component size
    colorScheme: "blue" | "green", // Color scheme
  }}
/>
```

## Supported FormTypeInputs

| Type                      | Component               | Priority | Notes            |
| ------------------------- | ----------------------- | -------- | ---------------- |
| string                    | Input                   | P1       | Basic text input |
| number                    | Input (type="number")   | P1       | Number input     |
| boolean                   | Checkbox                | P1       | Checkbox         |
| string (format: textarea) | Textarea                | P2       | Multiline text   |
| string (format: password) | Input (type="password") | P2       | Password         |
| string (format: email)    | Input (type="email")    | P2       | Email            |
| string (enum)             | Select                  | P2       | Dropdown         |
| array                     | VStack + Button         | P2       | Dynamic array    |

## Examples

### Textarea

```tsx
const schema = {
  type: "object",
  properties: {
    description: {
      type: "string",
      format: "textarea",
      label: "Description",
    },
  },
};
```

### Enum (Select)

```tsx
const schema = {
  type: "object",
  properties: {
    country: {
      type: "string",
      enum: ["USA", "Canada", "Mexico"],
      enumLabels: ["United States", "Canada", "Mexico"],
      label: "Country",
    },
  },
};
```

### Array

```tsx
const schema = {
  type: "object",
  properties: {
    tags: {
      type: "array",
      items: { type: "string" },
      label: "Tags",
    },
  },
};
```

## License

MIT

## Links

- [Documentation](https://your-docs-site.com)
- [GitHub](https://github.com/your-org/canard-schema-form-chakra-ui-plugin)
- [Issues](https://github.com/your-org/canard-schema-form-chakra-ui-plugin/issues)

````

#### Step 2: Storybook Stories 작성

```tsx
// stories/BasicInputs.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SchemaForm } from '@canard/schema-form';
import { plugin as chakraPlugin } from '../src';
import { ChakraProvider } from '@chakra-ui/react';

const meta: Meta<typeof SchemaForm> = {
  title: 'Chakra UI Plugin/Basic Inputs',
  component: SchemaForm,
  decorators: [
    (Story) => (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SchemaForm>;

export const StringInput: Story = {
  args: {
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          label: 'Name',
          placeholder: 'Enter your name',
        },
      },
    },
    plugin: chakraPlugin,
    context: { size: 'md' },
  },
};

export const NumberInput: Story = {
  args: {
    schema: {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          label: 'Age',
          minimum: 0,
          maximum: 120,
        },
      },
    },
    plugin: chakraPlugin,
  },
};

export const AllBasicTypes: Story = {
  args: {
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', label: 'Name' },
        age: { type: 'number', label: 'Age' },
        subscribe: { type: 'boolean', label: 'Subscribe' },
        bio: { type: 'string', format: 'textarea', label: 'Bio' },
        password: { type: 'string', format: 'password', label: 'Password' },
        country: {
          type: 'string',
          enum: ['USA', 'Canada', 'Mexico'],
          label: 'Country',
        },
      },
    },
    plugin: chakraPlugin,
    context: { size: 'md' },
  },
};
````

#### Step 3: package.json 최종 확인

```json
{
  "name": "@canard/schema-form-chakra-ui-plugin",
  "version": "0.1.0",
  "description": "Chakra UI v2 plugin for @canard/schema-form",
  "keywords": ["canard", "schema-form", "chakra-ui", "react", "form"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/canard-schema-form-chakra-ui-plugin"
  },
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "build:watch": "rollup -c -w",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "@canard/schema-form": "*",
    "@chakra-ui/react": "^2.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@chakra-ui/icons": "^2.0.0",
    "@winglet/react-utils": "*"
  },
  "devDependencies": {
    "@canard/schema-form": "*",
    "@chakra-ui/react": "^2.0.0",
    "@storybook/react": "^7.0.0",
    "@types/react": "^18.0.0",
    "react": "^18.0.0",
    "rollup": "^4.0.0",
    "storybook": "^7.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

**Phase 4 완료 조건**:

- ✅ README.md 작성 완료
- ✅ README-ko_kr.md 작성 (선택)
- ✅ Storybook stories 3개 이상 작성
- ✅ package.json 의존성 최종 확인
- ✅ 예제 코드 작성

**다음 단계**: Phase 5로 진행, 최적화 및 배포 준비

---

### 시나리오 5: Phase 5 - 최적화 및 검증

**상황**: Phase 4 완료, 최종 최적화 및 배포 준비

**단계**:

#### Step 1: 성능 최적화 체크리스트 적용

````markdown
## 성능 최적화 체크리스트

### 컴포넌트 최적화

- [x] ✅ **비제어 컴포넌트 패턴**: 모든 FormTypeInput에 `defaultValue` 사용
- [x] ✅ **useMemo**: props 연산 캐싱 (size, variant, label)
- [x] ✅ **useHandle**: 이벤트 핸들러 메모이제이션 (@winglet/react-utils)
- [x] ✅ **ChildNodeComponents**: props 전달 금지, 직접 렌더링만

### 코드 검증

```bash
# 1. TypeScript 타입 체크
yarn typecheck
# ✅ 에러 0개

# 2. ESLint
yarn lint
# ✅ 경고 0개

# 3. 빌드
yarn build
# ✅ dist/ 생성 성공

# 4. 빌드 크기 확인
ls -lh dist/
# index.esm.js: 45KB (gzip: 12KB) ✅ 목표 <50KB
# index.cjs.js: 47KB
# index.d.ts: 8KB
```
````

#### Step 2: 접근성 검증

```tsx
// tests/accessibility.test.tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { SchemaForm } from "@canard/schema-form";
import { plugin as chakraPlugin } from "../src";
import { ChakraProvider } from "@chakra-ui/react";

expect.extend(toHaveNoViolations);

describe("Accessibility", () => {
  it("should have no a11y violations - basic inputs", async () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string", label: "Name" },
        age: { type: "number", label: "Age" },
        subscribe: { type: "boolean", label: "Subscribe" },
      },
    };

    const { container } = render(
      <ChakraProvider>
        <SchemaForm schema={schema} plugin={chakraPlugin} />
      </ChakraProvider>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper ARIA attributes", () => {
    const schema = {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          label: "Email",
          required: true,
        },
      },
    };

    const { getByLabelText } = render(
      <ChakraProvider>
        <SchemaForm schema={schema} plugin={chakraPlugin} />
      </ChakraProvider>,
    );

    const input = getByLabelText("Email");

    // ✅ Chakra UI FormControl이 자동으로 추가
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("id");
  });
});
```

```bash
# 접근성 테스트 실행
yarn test accessibility.test.tsx
# ✅ 모든 테스트 통과
```

#### Step 3: 통합 테스트

```tsx
// tests/integration.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SchemaForm } from "@canard/schema-form";
import { plugin as chakraPlugin } from "../src";
import { ChakraProvider } from "@chakra-ui/react";

describe("Integration Tests", () => {
  it("should render and submit complex form", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    const schema = {
      type: "object",
      properties: {
        name: { type: "string", label: "Name" },
        age: { type: "number", label: "Age" },
        bio: { type: "string", format: "textarea", label: "Bio" },
        country: {
          type: "string",
          enum: ["USA", "Canada"],
          label: "Country",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          label: "Tags",
        },
      },
    };

    render(
      <ChakraProvider>
        <SchemaForm schema={schema} plugin={chakraPlugin} onSubmit={onSubmit} />
      </ChakraProvider>,
    );

    // 입력
    await user.type(screen.getByLabelText("Name"), "John Doe");
    await user.type(screen.getByLabelText("Age"), "30");
    await user.type(screen.getByLabelText("Bio"), "Developer");
    await user.selectOptions(screen.getByLabelText("Country"), "USA");

    // 배열 아이템 추가
    await user.click(screen.getByText("추가"));
    await user.type(screen.getByRole("textbox", { name: /tags/i }), "react");

    // 제출
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        age: 30,
        bio: "Developer",
        country: "USA",
        tags: ["react"],
      });
    });
  });
});
```

#### Step 4: 최종 검증 및 배포 준비

```bash
# 1. 전체 테스트 실행
yarn test
# ✅ 모든 테스트 통과 (단위 + 통합 + 접근성)

# 2. 빌드 크기 분석
yarn build
du -sh dist/*
# index.esm.js: 45KB ✅
# index.cjs.js: 47KB ✅
# index.d.ts: 8KB

# 3. package.json 버전 확인
cat package.json | grep version
# "version": "0.1.0" ✅ 초기 버전

# 4. 파일 검증
cat package.json | grep files
# "files": ["dist", "README.md", "LICENSE"] ✅

# 5. 라이선스 파일 확인
ls LICENSE
# LICENSE ✅

# 6. Git 태그 준비
git tag -a v0.1.0 -m "Initial release: Chakra UI v2 plugin"
git push origin v0.1.0
```

#### Step 5: 배포 체크리스트

````markdown
## 배포 전 최종 체크리스트

### 코드 품질

- [x] ✅ TypeScript 타입 체크 통과
- [x] ✅ ESLint 경고 0개
- [x] ✅ 모든 테스트 통과 (단위 + 통합 + 접근성)
- [x] ✅ 빌드 크기 목표 달성 (<50KB gzipped)

### 문서

- [x] ✅ README.md 작성 완료
- [x] ✅ 예제 코드 3개 이상
- [x] ✅ API 문서 작성
- [x] ✅ Storybook stories 작성

### 패키지

- [x] ✅ package.json 의존성 최종 확인
- [x] ✅ peerDependencies 정확함
- [x] ✅ exports 필드 설정
- [x] ✅ LICENSE 파일 존재

### 성능

- [x] ✅ 비제어 컴포넌트 패턴 적용
- [x] ✅ useMemo, useHandle 최적화
- [x] ✅ 불필요한 리렌더링 방지

### 접근성

- [x] ✅ axe-core 테스트 통과
- [x] ✅ ARIA 속성 자동 추가 (FormControl)
- [x] ✅ 키보드 네비게이션 테스트

### 버전 관리

- [x] ✅ CHANGELOG.md 작성
- [x] ✅ Git 태그 생성 (v0.1.0)
- [x] ✅ 배포 스크립트 준비

### 배포

```bash
# NPM 배포
npm publish --access public

# 또는 Yarn
yarn publish --access public
```
````

## 배포 후 확인

- [ ] NPM에서 패키지 확인
- [ ] 설치 테스트 (`npm install @canard/schema-form-chakra-ui-plugin`)
- [ ] GitHub Release 생성
- [ ] 문서 사이트 업데이트

````

**Phase 5 완료 조건**:
- ✅ 성능 최적화 체크리스트 100% 완료
- ✅ 접근성 테스트 통과 (axe-core)
- ✅ 통합 테스트 통과
- ✅ 빌드 크기 확인 및 목표 달성
- ✅ 배포 준비 완료

**프로젝트 완료**: ✅ 모든 Phase 완료, 배포 준비 완료!

---

## 다음 단계 연계

- 개발 계획 수립 후 실제 구현은 다른 스킬들 참조
- `canard-type-system`: 타입 정의
- `react-plugin-implementation`: 컴포넌트 구현
- `dependency-management`: package.json 설정
- `ui-plugin-guidelines`: 호환성 및 접근성

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - 프로젝트 요구사항 없음 (입력 데이터 누락)
      - 단계별 템플릿 파일 누락 (knowledge/phase_templates/)
      - 필수 단계 순서 위반 (Type System 전에 Implementation 시도)
      - 의존성 충돌 감지 (단계 간)
    action: |
      ❌ 치명적 오류 - 단계별 계획 생성 중단
      → 요구사항 확인: requirements/ 디렉토리 확인
      → 템플릿 파일 확인: ls knowledge/phase_templates/
      → 단계 순서 검증: Type System → Design → Implementation
      → 의존성 해결: 선행 단계 완료 확인
      → 재실행: 요구사항 → phased-development
    examples:
      - condition: "요구사항 없음"
        message: "❌ 오류: 프로젝트 요구사항을 찾을 수 없습니다"
        recovery: "tot-requirements-engine → ears-documenter → phased-development"
      - condition: "단계 순서 위반"
        message: "❌ 오류: Phase 3 (Implementation)를 Phase 1 (Type System) 없이 시작할 수 없습니다"
        recovery: "Phase 1부터 순서대로 진행: 1 → 2 → 3 → 4 → 5"

  severity_medium:
    conditions:
      - 일부 단계 세부사항 불완전
      - 예상 시간 계산 실패
      - 리소스 할당 불명확
      - 단계 간 전환 조건 모호
    action: |
      ⚠️  경고 - 기본 계획으로 진행
      1. 불완전한 세부사항: 일반적인 작업 제안
      2. 예상 시간: 평균값 사용 (단계별 기본 시간)
      3. 리소스: TBD로 표시
      4. 전환 조건: 기본 조건 적용
      5. 계획 문서에 경고 추가:
         > ⚠️  WARNING: 다음 항목은 프로젝트에 맞게 조정 필요
         > → {items_to_adjust}
    fallback_values:
      phase_duration: "{default_hours} hours"
      resource_allocation: "TBD"
      transition_criteria: "previous_phase_complete"
    examples:
      - condition: "예상 시간 불명확"
        message: "⚠️  경고: Phase 2 소요 시간을 추정할 수 없습니다"
        fallback: "기본값 8시간 사용 → 프로젝트 규모에 따라 조정"
      - condition: "전환 조건 모호"
        message: "⚠️  경고: Phase 1 → 2 전환 조건이 불명확합니다"
        fallback: "기본 조건: Phase 1 모든 작업 완료 + 검토 통과"

  severity_low:
    conditions:
      - 선택적 단계 생략 (Storybook, E2E 테스트)
      - 마일스톤 날짜 미지정
      - 체크리스트 항목 부족
      - 다이어그램 생성 실패
    action: |
      ℹ️  정보: 선택적 항목 생략 - 핵심 단계 제공
      → 선택적 단계: 필요시 수동 추가
      → 마일스톤: 상대적 시간으로 표시 (D+7 등)
      → 체크리스트: 기본 항목만 포함
      → 다이어그램: 텍스트 설명으로 대체
    examples:
      - condition: "선택적 단계 생략"
        auto_handling: "Storybook 단계 생략 (필요시 Phase 6으로 추가)"
      - condition: "마일스톤 미지정"
        auto_handling: "상대적 시간 사용: Phase 1 완료: D+2, Phase 2: D+5"
````

---

> **Best Practice**: 단계별 점진적 구현, 조급하지 않게
> **Integration**: 전체 개발 프로세스의 로드맵 제공
