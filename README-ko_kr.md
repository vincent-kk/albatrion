# Albatrion

[![TypeScript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![JavaScript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Utility](https://img.shields.io/badge/utility-✔-green.svg)]()

---

## 개요

**Albatrion**은 **TypeScript/JavaScript** 기반 유틸리티와 React 컴포넌트 패키지들을 한 곳에 모은 모노레포입니다.
고성능과 안정성을 제공하며, 프로덕션 환경에서 신뢰할 수 있는 다양한 유틸리티와 최적화된 코드로 구성되어 있습니다.

---

## 모노레포 구조

이 저장소는 독립적인 버전 관리와 배포가 가능한 여러 패키지로 구성되어 있습니다.
각 패키지는 상세한 사용 방법, 의존성 정보, 예제 코드가 담긴 개별 `README.md` 문서를 제공합니다.

### `canard`

- **[`@canard/schema-form`](./packages/canard/schema-form/README-ko_kr.md)** - JSON Schema 기반 폼 유틸리티
- **[`@canard/schema-form-ajv6-plugin`](./packages/canard/schema-form-ajv6-plugin/README-ko_kr.md)** - `canard/schema-form`용 AJV 6.x 검증 플러그인
- **[`@canard/schema-form-ajv7-plugin`](./packages/canard/schema-form-ajv7-plugin/README-ko_kr.md)** - `canard/schema-form`용 AJV 7.x 검증 플러그인
- **[`@canard/schema-form-ajv8-plugin`](./packages/canard/schema-form-ajv8-plugin/README-ko_kr.md)** - `canard/schema-form`용 AJV 8.x 검증 플러그인
- **[`@canard/schema-form-antd-plugin`](./packages/canard/schema-form-antd-plugin/README-ko_kr.md)** - `canard/schema-form`에 적용할 수 있는 Ant Design 플러그인
- **[`@canard/schema-form-antd-mobile-plugin`](./packages/canard/schema-form-antd-mobile-plugin/README-ko_kr.md)** - `canard/schema-form`에 적용할 수 있는 Ant Design Mobile 플러그인
- **[`@canard/schema-form-mui-plugin`](./packages/canard/schema-form-mui-plugin/README-ko_kr.md)** - `canard/schema-form`에 적용할 수 있는 MUI 플러그인

### `lerx`

- **[`@lerx/promise-modal`](./packages/lerx/promise-modal/README-ko_kr.md)** - Promise 기반 모달 유틸리티

### `winglet`

- **[`@winglet/common-utils`](./packages/winglet/common-utils/README-ko_kr.md)** - JavaScript 유틸리티
- **[`@winglet/data-loader`](./packages/winglet/data-loader/README-ko_kr.md)** - 데이터 로더 유틸리티
- **[`@winglet/json`](./packages/winglet/json/README-ko_kr.md)** - JSON 유틸리티
- **[`@winglet/json-schema`](./packages/winglet/json-schema/README-ko_kr.md)** - JSON Schema 유틸리티
- **[`@winglet/react-utils`](./packages/winglet/react-utils/README-ko_kr.md)** - React 유틸리티

---

## 개발 환경 설정

```bash
# 저장소 클론
dir=your-albatrion && git clone https://github.com/vincent-kk/albatrion.git "$dir" && cd "$dir"

# 의존성 설치
nvm use && yarn install && yarn run:all build

# yarn 워크스페이스 사용
yarn workspace <package-name> <command>

# 테스트 실행
yarn workspace <package-name> test

# 빌드
yarn workspace <package-name> build
```

---

## 호환성 안내

이 패키지는 ECMAScript 2022 (ES2022) 문법으로 작성되었습니다. ES2022보다 낮은 버전의 JavaScript 환경에서 사용하시는 경우, 별도의 트랜스파일 과정이 필요합니다.

**지원 환경:**

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

---

## 라이선스

이 저장소는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안 사항이 있으시면 이슈를 생성해 주세요.
