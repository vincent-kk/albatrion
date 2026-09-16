# formatErrorMessage

## Purpose

schema-form 런타임에서 발생하는 내부 에러(동적 함수 생성 실패, 순환 참조, 배열/조합 스키마 충돌, 가상 필드 오류 등) 및 개발용 경고를 개발자가 진단할 수 있는 ASCII 박스 형식 문자열로 변환한다.

## Conventions

- 출력 형식: `╭─ ... ╰─` ASCII 박스, 반드시 `.trim()` 으로 양쪽 공백 제거 후 반환
- 모든 포맷터는 `string` 반환, 절대 throw하지 않음
- 새 포맷터 파일명은 반드시 `format<ErrorType>.ts` 패턴을 따르고 `index.ts`에 export 추가
- `utils/` 내 유틸은 이 디렉토리 내부에서만 사용하며 `index.ts`를 통해 외부에 노출하지 않음

## Boundaries

### Always do

- 포맷터 추가 시 `format<ErrorType>.ts` 명명 규칙 준수 및 `index.ts` export 등록
- 모든 포맷터는 순수 `string` 반환 (side effect, throw 금지)

### Ask first

- `utils/constants.ts` 상수 또는 `createDivider` 구분선 스타일 변경 (모든 포맷터 출력에 영향)
- `utils/` 내 유틸 함수의 시그니처 변경

### Never do

- `utils/` 함수를 `index.ts`를 통해 외부에 export
- 포맷터 내에서 에러를 throw하거나 외부 상태(`node`, `schema`) 직접 접근
