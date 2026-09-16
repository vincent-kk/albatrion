# formatErrorMessage

## Requirements

내부 실패와 개발 경고의 맥락을 사람이 읽을 수 있는 진단 문자열로 제공합니다.

## API Contracts

- 포맷터는 전달된 정보를 박스 형식 문자열로 만들고 양끝 공백을 정리합니다.
- 포맷터 자체는 오류를 던지거나 노드·스키마 상태를 변경하지 않습니다.

## Acceptance Criteria

### format-error-message-contract — 관찰 가능한 동작

- 같은 진단 입력은 같은 형식의 문자열로 표현됩니다.
- 문자열 작성만으로 오류 처리나 로깅을 직접 실행하지 않습니다.

## Last Updated

2026-09-16
