# InputControlContext

## Purpose

폼 전체 UI 잠금 설정을 공급하고 노드별 결합은 소비자에게 맡깁니다.

## Conventions

- 세부 선택·수명과 소유자 연결은 [DETAIL](DETAIL.md)에 둡니다.

## Boundaries

### Always do

- 설정 참조를 안정화하고 전체 잠금이 노드별 false로 풀리지 않는 소비자 계약을 유지합니다.

### Ask first

- 전역 입력 제어를 추가하거나 Provider 부재 기본값을 바꿀 때

### Never do

- 노드별 잠금을 계산하거나 core 명령형 쓰기를 막지 않습니다.
