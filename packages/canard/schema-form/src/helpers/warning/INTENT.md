# warning

## Purpose

개발 환경 전용 진단 경고를 일원화하는 헬퍼. 에러 시스템과 동일한 `code + formatted message + details` 구조를 사용하되 Error 인스턴스를 생성하지 않고 `printWarning`으로 방출한다. 프로덕션(`NODE_ENV === 'production'`)에서는 완전 무음.

## Structure

- `warnDevelopmentIssue.ts` — 구조화된 diagnostic을 받아 dev 전용 경고 출력 (중복 제거 + 패키지 프리픽스)
- `index.ts` — barrel export

## Conventions

- 패키지 내 모든 dev 전용 경고는 반드시 이 모듈을 경유 (개별 `console.warn` 직접 호출 금지)
- 경고도 에러와 동일한 `code + formatted message + details` 구조 사용
- 메시지는 `formatAllOfIgnoredKeywordWarning` 같은 전용 포매터로 생성
- `code + message` 단위로 세션당 1회만 출력 (per-node 파이프라인의 콘솔 폭주 방지)
- 스키마 작성자가 조치할 수 있는 내용만 경고 (내부 디버깅 로그 금지)

## Boundaries

### Always do

- 새 dev 진단 추가 시 `warnDevelopmentIssue` + 전용 warning 포매터 사용

### Ask first

- 특정 경고를 throw(에러)로 승격하는 정책 변경
- 중복 제거 단위 변경 (code+message → 다른 키)

### Never do

- 프로덕션 환경에서 출력되는 로그 추가
- 사용자 데이터(폼 값)를 details에 포함

## Dependencies

- `@winglet/common-utils/console` — `printWarning`
- `@winglet/common-utils/error` — `ErrorDetails`
- `@winglet/common-utils/filter` — `isEmptyObject`
