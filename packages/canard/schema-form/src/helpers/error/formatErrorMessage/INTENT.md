# formatErrorMessage

## Purpose
schema-form 런타임에서 발생하는 내부 에러(순환 참조, 동적 함수 생성 실패, 스키마 충돌 등)를 개발자가 진단할 수 있는 구조화된 ASCII 박스 형식 메시지로 변환한다.

## Structure
- `format*.ts` — 에러 종류별 포맷터 (15개): 동적함수, 순환참조, 배열스키마, 조합스키마, 교차스키마, 가상필드, 플러그인 등
- `utils/` — 공통 포맷 유틸
  - `constants.ts` — 공통 상수
  - `createDivider.ts` — ASCII 구분선 생성
  - `formatArrayPreview.ts`, `formatBulletList.ts`, `formatIndexedList.ts` — 목록 포맷
  - `formatJsonPreview.ts`, `formatValuePreview.ts` — 값 미리보기
  - `formatLines.ts`, `formatMultiLine.ts`, `formatPrefixItemsPreview.ts` — 코드/줄 포맷
  - `formatPropertyKeysPreview.ts`, `formatType.ts` — 타입/키 포맷
  - `getErrorMessage.ts`, `getValueType.ts` — 에러 추출 유틸
- `index.ts` — 포맷터 함수들만 named export (utils는 비공개)

## Conventions
- 출력 형식: `╭─ ... ╰─` ASCII 박스, `.trim()` 으로 양쪽 공백 제거
- 모든 포맷터는 `string` 반환, 에러를 throw하지 않음
- `utils/` 내 유틸은 이 디렉토리 내부에서만 사용 (외부 export 금지)

## Boundaries

### Always do
- 새 포맷터는 `format<ErrorType>.ts` 명명 규칙을 따르고 `index.ts`에 export 추가
- 모든 포맷터는 pure string 반환 (side effect 없음)

### Ask first
- `utils/` 내 상수 또는 구분선 스타일 변경 (전체 포맷터 출력에 영향)

### Never do
- `utils/` 함수를 `index.ts` 를 통해 외부에 export
- 포맷터 내에서 에러를 throw하거나 외부 상태 접근

## Dependencies
- `utils/` 내부 포맷 유틸 (모듈 내부 전용)
