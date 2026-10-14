# strategies

## Requirements

객체의 자식 트리 관리와 단일 값 관리를 공통 전략 계약 아래 분리합니다.

## API Contracts

- 두 전략은 value, children, subnodes와 applyValue의 같은 소비 인터페이스를 제공합니다.
- 전략 선택은 호스트 생성 시 결정하며 인스턴스 간 내부 상태를 공유하지 않습니다.

## Acceptance Criteria

### strategies-contract — 관찰 가능한 동작

- terminal 전략은 자식 목록 대신 null을 제공하고 branch 전략은 트리 기반으로 동작합니다.
- additionalProperties가 false인 스키마의 정의 외 키 처리 의미를 두 전략에서 유지합니다.

## Last Updated

2026-09-16
