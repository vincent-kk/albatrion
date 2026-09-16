# warning

## Requirements

스키마 작성자가 조치할 개발 진단을 중복 없이 전달합니다.

## API Contracts

- 경고는 코드·포맷된 메시지·상세 정보로 구성하며 같은 코드와 메시지는 세션에서 한 번만 출력합니다.
- 프로덕션에서는 경고를 출력하지 않고 오류 인스턴스를 만들지 않습니다.

## Acceptance Criteria

### warning-contract — 관찰 가능한 동작

- 여러 노드에서 같은 경고가 발생해도 콘솔 메시지가 반복 누적되지 않습니다.
- 진단 details에 실제 폼 입력값을 포함하지 않습니다.

## Last Updated

2026-09-16
