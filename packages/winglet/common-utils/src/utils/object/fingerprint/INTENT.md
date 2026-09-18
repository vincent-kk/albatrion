# fingerprint

## Purpose

빠른 객체 비교 키 생성 경계를 소유합니다. 저장·복원용 graph codec은 소유하지 않습니다.

## Conventions

객체 키 생성과 저장·복원은 별개 계약입니다. 일반 속성을 직접 읽고, 확정된 키 생성 API만 공개합니다. benchmark 후보는 내부 비교 자료입니다.

## Boundaries

### Always do

- 최초 계산과 캐시 적중을 분리해 성능을 비교합니다.
- 지원 범위·동등성·캐시 정책이 다른 실험은 별도 표시합니다.
- 최종 키 생성 구현은 graph wire 생성이나 parser를 의존하지 않습니다.

### Ask first

- 비교 동등성 또는 충돌 허용 정책을 변경합니다.

### Never do

- 기준 구현보다 느린 후보를 목표 달성으로 보고합니다.
- benchmark 전용 후보를 package public API로 노출합니다.
