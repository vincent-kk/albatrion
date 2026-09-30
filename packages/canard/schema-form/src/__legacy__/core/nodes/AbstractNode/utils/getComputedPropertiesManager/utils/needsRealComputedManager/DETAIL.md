# needsRealComputedManager

## Requirements

공유 sentinel이 계산이 필요한 노드를 대신하지 않도록 보수적으로 판정합니다.

## API Contracts

- computed 설정·별칭·노드 상태·루트 상속·객체 조합 조건의 존재를 검사합니다.
- undefined 여부로 판단하며 표현식 문자열의 내용을 추측해 계산 필요성을 제거하지 않습니다.

## Acceptance Criteria

### needs-real-computed-manager-contract — 관찰 가능한 동작

- false나 빈 문자열이 정의된 계산 필드도 실제 매니저를 요구합니다.
- 루트에서 상속한 상태나 객체 조합 조건이 있으면 계산 없는 노드로 판정하지 않습니다.

## Last Updated

2026-09-16
