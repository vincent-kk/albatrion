# handle

## Purpose

Promise 기반 모달 API 함수(alert, confirm, prompt)를 제공하는 모듈. 각 핸들러가 ModalManager를 통해 모달을 생성하고 Promise를 반환.

## Structure

- `alert.ts` — alertHandler 구현
- `confirm.ts` — confirmHandler 구현
- `prompt.ts` — promptHandler 구현
- `static.ts` — 공개 API (alert, confirm, prompt 함수)
- `type.ts` — AlertProps, ConfirmProps, PromptProps 타입 정의
- `index.ts` — 핸들러, 정적 API, 타입 재export

## Conventions

- 각 핸들러는 `{Handler}` 패턴으로 내부 로직 처리 후 `{ promiseHandler }` 반환
- static.ts에서 핸들러를 래핑하여 `.promiseHandler`만 노출
- 제네릭 타입: `BackgroundValue`(배경 데이터), `InputValue`(prompt 입력값)

## Boundaries

### Always do

- 새 핸들러 추가 시 동일한 패턴(handler → static wrapper) 준수
- Props 타입은 `type.ts`에 정의
- JSDoc 주석에 사용 예제 포함

### Ask first

- 핸들러의 반환 구조 변경 (promiseHandler 패턴)
- Props 타입의 필수/선택 필드 변경

### Never do

- static.ts에서 핸들러 내부 구현 세부사항 노출
- 핸들러에서 React 컴포넌트 직접 import
