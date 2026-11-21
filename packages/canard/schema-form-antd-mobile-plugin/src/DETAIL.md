# UI 입력 연결 계약

## Requirements

입력은 폼의 값과 상태를 라이브러리의 공개 prop으로 전달합니다. 입력의 유효성은 폼의 스키마 검증이 판단합니다.

## API Contracts

라이브러리가 지원하는 식별자 prop에 코어의 inputId와 labelId를 전달합니다. 보조 요소의 주소는 getInputId(key)에서 받습니다.

## Acceptance Criteria

### control-bindings — 폼 상태 전달

- 저장된 값과 사용자 변경을 라이브러리의 공개 prop과 콜백으로 연결합니다.

## Last Updated

입력 바인딩이나 부품의 소유 경계가 바뀔 때 갱신합니다.
