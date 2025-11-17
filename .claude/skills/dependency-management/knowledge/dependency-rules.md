# 의존성 관리 규칙

@canard/schema-form 플러그인 개발 시 의존성 설정 규칙입니다.

## dependencies vs peerDependencies

### dependencies (런타임 의존성)

**정의**: 플러그인이 직접 사용하고, 번들에 포함될 수 있는 의존성

**포함 대상**:

- UI 라이브러리 메인 패키지
- UI 라이브러리 서브 패키지 (DatePicker 등)
- Emotion, styled-components 등 스타일링 라이브러리
- 내부 패키지 (@winglet/react-utils, @canard/schema-form)

**버전 형식**: `^{MAJOR}.0.0` (caret)

**예제**:

```json
{
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/x-date-pickers": "^6.19.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  }
}
```

### peerDependencies (호스트 프로젝트 의존성)

**정의**: 호스트 프로젝트가 제공해야 하는 의존성 (중복 방지)

**포함 대상**:

- React (필수)
- UI 라이브러리 메인 패키지
- UI 라이브러리 서브 패키지
- Emotion, styled-components 등

**제외 대상**:

- @winglet 패키지 (내부 패키지는 dependencies만)
- @canard 패키지 (내부 패키지는 dependencies만)

**버전 형식**: `">={MAJOR}.0.0"` 또는 범위

**예제**:

```json
{
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "@mui/material": ">=5.0.0",
    "@mui/x-date-pickers": ">=6.0.0",
    "@emotion/react": "*",
    "@emotion/styled": "*"
  }
}
```

## 버전 명시 규칙

### Caret (^) - dependencies

**형식**: `^{MAJOR}.{MINOR}.{PATCH}`

**의미**:

- MINOR와 PATCH 업데이트 허용
- MAJOR 업데이트 불허용

**예제**:

- `^5.15.0` → 5.15.0 ~ 5.x.x 허용, 6.0.0 불허용
- `^6.19.0` → 6.19.0 ~ 6.x.x 허용, 7.0.0 불허용

**사용 이유**: 안정적인 호환성 유지하면서 버그 수정 자동 적용

### Greater Than or Equal (>=) - peerDependencies

**형식**: `">={MAJOR}.0.0"` 또는 `">={MAJOR}.0.0 <{NEXT_MAJOR}.0.0"`

**의미**:

- 최소 버전만 명시
- 호스트가 실제 버전 결정

**예제**:

- `">=5.0.0"` → 5.0.0 이상 모든 버전
- `">=18.0.0 <19.0.0"` → 18.x.x만 허용

**사용 이유**: 호스트 프로젝트의 유연성 보장

### Wildcard (\*) - 내부 패키지

**형식**: `"*"`

**의미**: 워크스페이스 내 버전 사용

**예제**:

```json
{
  "dependencies": {
    "@winglet/react-utils": "*",
    "@canard/schema-form": "*"
  }
}
```

**사용 이유**: Monorepo 워크스페이스에서 버전 일치 보장

## UI 라이브러리별 의존성 패턴

### MUI (Material-UI)

```json
{
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/x-date-pickers": "^6.19.0",
    "@mui/lab": "^5.0.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "date-fns": "^3.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0",
    "@mui/material": ">=5.0.0",
    "@mui/x-date-pickers": ">=6.0.0",
    "@emotion/react": "*",
    "@emotion/styled": "*"
  }
}
```

**주의사항**:

- `@emotion/*` 패키지는 MUI 5+에서 필수
- `date-fns`는 DatePicker 사용 시 필요
- `@mui/lab`은 실험적 컴포넌트 사용 시만

### Ant Design

```json
{
  "dependencies": {
    "antd": "^5.12.0",
    "dayjs": "^1.11.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0",
    "antd": ">=5.0.0"
  }
}
```

**주의사항**:

- Ant Design 5+는 자체 스타일링 시스템 사용 (emotion 불필요)
- `dayjs`는 DatePicker 등에서 사용

### Ant Design Mobile

```json
{
  "dependencies": {
    "antd-mobile": "^5.34.0",
    "dayjs": "^1.11.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0",
    "antd-mobile": ">=5.0.0"
  }
}
```

### Chakra UI

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.8.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0",
    "@chakra-ui/react": ">=2.0.0",
    "@emotion/react": "*",
    "@emotion/styled": "*",
    "framer-motion": "*"
  }
}
```

**주의사항**:

- `framer-motion`은 애니메이션에 필수
- Chakra UI 2.x는 emotion 기반

## React 버전 규칙

**고정값**: `">=18.0.0 <19.0.0"`

**이유**:

1. @canard/schema-form이 React 18 기반
2. React 19는 Breaking Changes 가능성
3. 호환성 보장을 위한 명시적 제한

```json
{
  "peerDependencies": {
    "react": ">=18.0.0 <19.0.0",
    "react-dom": ">=18.0.0 <19.0.0"
  }
}
```

## 내부 패키지 참조

### @winglet 패키지

**패키지**:

- `@winglet/react-utils` - useHandle 등 React 유틸리티

**설정**:

```json
{
  "dependencies": {
    "@winglet/react-utils": "*"
  }
}
```

**peerDependencies 제외**: 내부 패키지는 dependencies만 명시

### @canard 패키지

**패키지**:

- `@canard/schema-form` - 메인 폼 라이브러리

**설정**:

```json
{
  "dependencies": {
    "@canard/schema-form": "*"
  }
}
```

## devDependencies (개발 도구)

```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "rollup": "^4.9.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-commonjs": "^25.0.0",
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

**포함 대상**:

- TypeScript 타입 정의
- 빌드 도구 (Rollup)
- 테스트 도구 (Vitest)
- Linter (ESLint)

**제외 대상**:

- 런타임에 필요한 라이브러리
- UI 컴포넌트

## 버전 업데이트 전략

### 주기적 업데이트

```bash
# dependencies 업데이트 확인
yarn outdated

# 안전한 업데이트 (patch, minor)
yarn upgrade --latest

# 메이저 업데이트는 수동 검토 후
yarn upgrade @mui/material@^6.0.0
```

### 호환성 테스트

메이저 버전 업데이트 시:

1. 로컬 환경에서 빌드 테스트
2. 단위 테스트 실행
3. 예제 프로젝트에서 통합 테스트
4. Breaking Changes 문서 확인

## 의존성 최소화 원칙

**불필요한 의존성 추가 금지**:

- 번들 크기 증가
- 보안 취약점 위험
- 유지보수 복잡도 증가

**추가 전 확인사항**:

1. UI 라이브러리 내장 기능으로 해결 가능한가?
2. 네이티브 Web API로 대체 가능한가?
3. 다른 의존성에 이미 포함되어 있는가?

---

**핵심 원칙**:

1. dependencies: `^` (caret) 사용
2. peerDependencies: `>=` (gte) 사용
3. 내부 패키지: `*` (wildcard)
4. React: `>=18.0.0 <19.0.0` 고정
5. 의존성 최소화
