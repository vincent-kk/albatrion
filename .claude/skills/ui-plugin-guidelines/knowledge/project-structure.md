# 프로젝트 구조 가이드

@canard/schema-form 플러그인의 권장 디렉토리 구조입니다.

## 표준 프로젝트 구조

```
@canard/schema-form-{ui-library}-plugin/
├── src/
│   ├── index.ts                    # 메인 export
│   ├── type.ts                     # Context 타입 정의
│   ├── renderers/                  # 기본 렌더러 (필수 5개)
│   │   ├── FormGroup.tsx
│   │   ├── FormLabel.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormError.tsx
│   │   └── formatError.ts
│   ├── formTypeInputs/             # FormTypeInput 구현체
│   │   ├── index.ts                # formTypeInputDefinitions 통합
│   │   ├── FormTypeInputString.tsx
│   │   ├── FormTypeInputNumber.tsx
│   │   ├── FormTypeInputBoolean.tsx
│   │   ├── FormTypeInputArray.tsx
│   │   ├── FormTypeInputStringEnum.tsx
│   │   ├── FormTypeInputPassword.tsx
│   │   ├── FormTypeInputTextarea.tsx
│   │   ├── FormTypeInputDate.tsx   # 선택적
│   │   └── ...
│   └── utils/                      # 공통 유틸리티 (선택적)
│       └── valueConversion.ts
├── coverage/                       # Storybook stories & E2E
│   ├── FormTypeInputString.stories.tsx
│   ├── FormTypeInputString.tsx     # 테스트 래퍼
│   └── ...
├── dist/                           # 빌드 결과물 (gitignore)
├── node_modules/                   # 의존성 (gitignore)
├── package.json
├── tsconfig.json
├── tsconfig.declarations.json
├── rollup.config.mjs
├── vite.config.ts
├── eslint.config.js
├── README.md
├── README-ko_kr.md
└── LICENSE
```

## 파일별 역할

### src/index.ts

**역할**: 메인 export, plugin 객체 정의

```typescript
import type { SchemaFormPlugin } from '@canard/schema-form';

import { FormError } from './renderers/FormError';
import { FormGroup } from './renderers/FormGroup';
import { FormInput } from './renderers/FormInput';
import { FormLabel } from './renderers/FormLabel';
import { formatError } from './renderers/formatError';
import { formTypeInputDefinitions } from './formTypeInputs';

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;

// Type exports
export type * from './type';
// Component exports (선택적)
export * from './formTypeInputs';
```

### src/type.ts

**역할**: UI 라이브러리별 Context 타입 정의

```typescript
export interface MuiContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}
```

### src/renderers/

**필수 5개 파일**:
1. `FormGroup.tsx` - 필드 그룹 래퍼
2. `FormLabel.tsx` - 라벨 렌더링
3. `FormInput.tsx` - Input 래퍼 (패스스루)
4. `FormError.tsx` - 에러 메시지 표시
5. `formatError.ts` - 에러 포맷 함수

### src/formTypeInputs/index.ts

**역할**: formTypeInputDefinitions 배열 통합

```typescript
import type { FormTypeInputDefinition } from '@canard/schema-form';

import { FormTypeInputPasswordDefinition } from './FormTypeInputPassword';
import { FormTypeInputStringEnumDefinition } from './FormTypeInputStringEnum';
// ... imports

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // 구체적 조건 → 일반 조건 순서
  FormTypeInputPasswordDefinition,
  FormTypeInputStringEnumDefinition,
  // ...
  FormTypeInputStringDefinition,  // 마지막
];

// 개별 export (선택적, 재사용 위해)
export * from './FormTypeInputString';
export * from './FormTypeInputNumber';
// ...
```

### src/formTypeInputs/FormTypeInput*.tsx

**역할**: 각 타입별 입력 컴포넌트

**명명 규칙**:
- PascalCase
- `FormTypeInput` + `{Type}` 형식
- 예: `FormTypeInputString`, `FormTypeInputNumber`

### coverage/

**역할**: Storybook stories 및 E2E 테스트

**파일 명명**:
- `*.stories.tsx` - Storybook story
- `*.tsx` - 테스트 래퍼 컴포넌트 (선택적)

## 명명 규칙

### 디렉토리
- **소문자 + hyphen**: `form-type-inputs/` (❌)
- **camelCase**: `formTypeInputs/` (✅)

### 파일
- **컴포넌트**: PascalCase (`.tsx`)
  - `FormTypeInputString.tsx`
  - `FormGroup.tsx`
- **유틸리티**: camelCase (`.ts`)
  - `valueConversion.ts`
  - `formatError.ts`
- **타입**: camelCase (`.ts`)
  - `type.ts`
- **설정**: kebab-case (`.mjs`, `.json`)
  - `rollup.config.mjs`
  - `tsconfig.json`

### Export
- **Named export 우선**:
  ```typescript
  export const FormTypeInputString = ...
  export const FormTypeInputStringDefinition = ...
  ```
- **Default export 지양**: 명확성을 위해

## Import 패턴

### 절대 경로 (내부 패키지)
```typescript
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputProps } from '@canard/schema-form';
```

### 상대 경로 (동일 패키지)
```typescript
import { FormGroup } from './renderers/FormGroup';
import type { MuiContext } from './type';
```

## README 구조

### README.md (영문)

```markdown
# @canard/schema-form-{ui-library}-plugin

{UI Library} plugin for @canard/schema-form

## Installation

...

## Usage

...

## Components

...

## License

MIT
```

### README-ko_kr.md (한글)

```markdown
# @canard/schema-form-{ui-library}-plugin

@canard/schema-form의 {UI Library} 플러그인입니다.

## 설치

...

## 사용법

...
```

---

**핵심 원칙**:
1. 표준 구조 준수
2. 명명 규칙 일관성
3. Named export 우선
4. 절대/상대 경로 구분
5. README 다국어 지원

