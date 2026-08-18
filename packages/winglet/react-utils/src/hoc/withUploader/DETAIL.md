# withUploader contract

## Requirements

- `withUploader(Component)`로 감싼 컴포넌트는 클릭 시 숨겨진 `input[type=file]`을 통해 네이티브 파일 선택 다이얼로그를 연다.
- 단일 파일 선택만 지원한다 — 선택된 FileList의 첫 번째 파일만 사용한다.
- change 이벤트가 발생할 때마다 input 값을 초기화해 동일 파일의 재선택을 허용한다.
- 원본 onClick 핸들러는 파일 다이얼로그를 열기 전에 먼저 호출되고, 원본 컴포넌트에는 래핑된 클릭 핸들러가 전달된다.
- 반환 컴포넌트는 `React.memo`로 메모이즈된다.

## API Contracts

- `withUploader(Component)` → `Component`의 props에 `acceptFormat?: string[]`과 `onChange?: (file: File) => void`를 더한 컴포넌트를 반환한다.
  - `acceptFormat`은 쉼표로 결합되어 숨겨진 input의 `accept` 속성에 전달된다.
  - 파일이 선택되면 `onChange`가 선택된 `File` 객체와 함께 호출된다. 파일이 없으면 호출되지 않는다.
  - `onClick`이 함수이면 파일 다이얼로그를 열기 전에 먼저 호출된다.

## Acceptance Criteria

### hidden-input-render — 숨김 파일 input 렌더

- 감싼 컴포넌트는 `display: none` 스타일의 `input[type=file]`과 함께 렌더된다.

### file-selection-onchange — 파일 선택 시 onChange 호출

- input의 change 이벤트로 파일이 선택되면 `onChange`가 선택된 파일 객체와 함께 호출된다.

### click-handler-passthrough — 클릭 핸들러 전달

- 감싼 컴포넌트가 클릭되면 원본 `onClick` 핸들러가 호출된다.

### accept-format-join — accept 포맷 결합

- `acceptFormat` 배열이 쉼표로 결합되어 input의 `accept` 속성 값이 된다.

## Last Updated

2026-08-18 — 최초 계약 작성
