# Albatrion

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![JavaScript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Utility](https://img.shields.io/badge/utility-✔-green.svg)]()

---

## 개요

**Albatrion**은 **TypeScript/JavaScript** 기반 유틸리티와 React 컴포넌트 패키지들을 한 곳에 모은 모노레포입니다.
높은 성능과 안정성을 제공하며, 프로덕션 환경에서 신뢰할 수 있는 다양한 유틸리티와 최적화된 코드로 구성되어 있습니다.

---

## 모노레포 구조

이 저장소는 독립적인 버전 관리와 배포 기능을 가진 여러 패키지로 구성되어 있습니다.
각 패키지는 자세한 사용법, 의존성 정보, 예제 코드가 포함된 개별 `README.md` 문서를 제공합니다.

### `canard`

- **[`@canard/schema-form`](./packages/canard/schema-form/README.md)** - JSON Schema 기반 폼 유틸리티
- **[`@canard/schema-form-ajv6-plugin`](./packages/canard/schema-form-ajv6-plugin/README.md)** - `canard/schema-form`용 AJV 6.x 검증 플러그인
- **[`@canard/schema-form-ajv7-plugin`](./packages/canard/schema-form-ajv7-plugin/README.md)** - `canard/schema-form`용 AJV 7.x 검증 플러그인
- **[`@canard/schema-form-ajv8-plugin`](./packages/canard/schema-form-ajv8-plugin/README.md)** - `canard/schema-form`용 AJV 8.x 검증 플러그인
- **[`@canard/schema-form-antd-plugin`](./packages/canard/schema-form-antd-plugin/README.md)** - `canard/schema-form`에 적용할 수 있는 Ant Design 플러그인
- **[`@canard/schema-form-antd-mobile-plugin`](./packages/canard/schema-form-antd-mobile-plugin/README.md)** - `canard/schema-form`에 적용할 수 있는 Ant Design Mobile 플러그인
- **[`@canard/schema-form-mui-plugin`](./packages/canard/schema-form-mui-plugin/README.md)** - `canard/schema-form`에 적용할 수 있는 MUI 플러그인

### `lerx`

- **[`@lerx/promise-modal`](./packages/lerx/promise-modal/README.md)** - Promise 기반 모달 유틸리티

### `winglet`

- **[`@winglet/common-utils`](./packages/winglet/common-utils/README.md)** - JavaScript 유틸리티
- **[`@winglet/data-loader`](./packages/winglet/data-loader/README.md)** - 데이터 로더 유틸리티
- **[`@winglet/json`](./packages/winglet/json/README.md)** - JSON 유틸리티
- **[`@winglet/json-schema`](./packages/winglet/json-schema/README.md)** - JSON Schema 유틸리티
- **[`@winglet/react-utils`](./packages/winglet/react-utils/README.md)** - React 유틸리티
- **[`@winglet/style-utils`](./packages/winglet/style-utils/README.md)** - CSS 및 스타일 관리 유틸리티

---

## 개발 환경 설정

```bash
# 저장소 클론
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# 의존성 설치
nvm use && yarn install && yarn run:all build

# yarn workspaces 사용
yarn workspace <package-name> <command>

# 테스트 실행
yarn workspace <package-name> test

# 빌드
yarn workspace <package-name> build
```

---

## 호환성

이 패키지는 ECMAScript 2020 (ES2020) 문법으로 작성되었습니다.

ES2020를 지원하지 않는 JavaScript 환경에서 사용하는 경우, 트랜스파일 과정에 이 패키지를 포함해야 합니다.

(일부 패키지는 ECMAScript 2022 (ES2022) 문법으로 작성되었습니다.)

**지원 환경:**

- Node.js 14.0.0 이상
- 모던 브라우저 (ES2020 지원)

**레거시 환경 지원이 필요한 경우:**
Babel과 같은 트랜스파일러를 사용하여 타겟 환경에 맞게 코드를 변환해주세요.

---

## 라이선스

이 저장소는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 질문이나 제안이 있으시면 이슈를 생성해 주세요.

## 📦 패키지

이 모노레포는 다음 패키지들을 포함합니다:

### Canard (Schema Form)

- `@canard/schema-form` - 핵심 스키마 폼 라이브러리
- `@canard/schema-form-ajv6-plugin` - AJV 6.x 검증 플러그인
- `@canard/schema-form-ajv8-plugin` - AJV 8.x 검증 플러그인
- `@canard/schema-form-antd-plugin` - Ant Design 플러그인
- `@canard/schema-form-antd-mobile-plugin` - Ant Design Mobile 플러그인
- `@canard/schema-form-mui-plugin` - Material-UI 플러그인

### Lerx (Promise Modal)

- `@lerx/promise-modal` - Promise 기반 모달 유틸리티

### Winglet (Utilities)

- `@winglet/common-utils` - 공통 유틸리티 함수
- `@winglet/data-loader` - 데이터 로딩 유틸리티
- `@winglet/json` - JSON 조작 유틸리티
- `@winglet/json-schema` - JSON Schema 유틸리티
- `@winglet/react-utils` - React 유틸리티 컴포넌트 및 훅
- `@winglet/style-utils` - CSS 및 스타일 관리 유틸리티

## 🚀 개발

### 사전 요구사항

- Node.js 18+
- Yarn 4.9.1+

### 설치

```bash
yarn install
```

### 빌드

```bash
# 모든 패키지 빌드
yarn build:all

# 특정 패키지 빌드
yarn workspace @canard/schema-form build
```

## 📋 버전 관리

이 프로젝트는 버전 관리와 퍼블리싱을 위해 [Changesets](https://github.com/changesets/changesets)을 사용합니다.

### Changeset 생성

패키지에 변경사항을 만들 때, changeset을 생성하여 변경사항을 문서화하세요:

```bash
yarn changeset
```

이 명령은 다음을 수행합니다:

1. 어떤 패키지가 변경되었는지 확인
2. 변경 유형 확인 (major/minor/patch)
3. 변경사항 요약 작성 (영어로 작성)
4. changeset 파일 생성

### 릴리즈

다음 명령을 사용하여 수동으로 릴리즈할 수 있습니다:

```bash
# changeset을 기반으로 패키지 버전 업데이트
yarn changeset:version

# npm에 패키지 퍼블리시
yarn changeset:publish
```

### Changeset 가이드라인

- **patch**: 버그 수정, 문서 업데이트, 내부 리팩토링
- **minor**: 새로운 기능, 새로운 export, 비호환성 없는 변경
- **major**: 호환성이 깨지는 변경, export 제거, API 변경

## 🔧 스크립트

### 빌드 및 퍼블리싱

- `yarn build:all` - 모든 패키지 빌드
- `yarn changeset` - 새로운 changeset 생성
- `yarn changeset:version` - changeset을 기반으로 버전 업데이트
- `yarn changeset:publish` - npm에 패키지 퍼블리시

### 패키지 태깅

- `yarn tag:packages <commit>` - 특정 커밋의 모든 패키지 버전을 기반으로 Git 태그 생성
- `yarn tag:packages <commit> --push` - 태그 생성 후 자동으로 리모트에 푸시
- `yarn tag:packages <commit> -p` - 태그 생성 후 자동으로 리모트에 푸시 (축약 플래그)

#### 태깅 예제

```bash
# 현재 커밋의 패키지들에 대한 태그 생성
yarn tag:packages HEAD

# 특정 커밋에 대한 태그 생성 후 리모트에 푸시
yarn tag:packages f20ca74baa16456ba9de006c709c61d29a1d1708 --push

# 이전 커밋의 패키지들에 대한 태그 생성 (축약 플래그)
yarn tag:packages dcd9a7826f95ec694bbc7cfc4a79f10af93444ad -p
```

태깅 스크립트는 자동으로:

- 모노레포의 모든 패키지 발견
- `@scope/package@version` 형식으로 태그 생성
- private 패키지는 태깅에서 제외
- 중복 방지를 위해 기존 태그 확인
- 태그 생성 전 인터랙티브 확인 제공

## 📄 라이선스

MIT 라이선스 - 개별 패키지의 구체적인 라이선스 정보는 각 패키지를 참조하세요.
