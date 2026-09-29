# TerminalStrategy

## Requirements

객체 값을 자식 노드 없이 파싱하고 변경 옵션에 맞춰 전달합니다.

## API Contracts

- children과 subnodes는 항상 null입니다. 입력은 파싱 후 스키마 프로퍼티 순서로 정렬합니다.
- additionalProperties가 false이면 정의 외 키를 제거하며 nullable인 경우 null을 보존합니다.

## Acceptance Criteria

### terminal-strategy-contract — 관찰 가능한 동작

- 입력을 적용해도 자식 노드 트리를 생성하지 않습니다.
- 기본값을 호스트에 등록하고, 원래 입력 객체를 직접 변경하지 않습니다.

## Last Updated

2026-09-16
