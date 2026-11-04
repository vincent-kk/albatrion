# getComputedPropertiesManager

## Purpose

노드가 사용할 `ComputedProperties` 구현체를 결정하는 팩토리. computed surface 가 있으면 실제 `ComputedPropertiesManager`, 없으면 frozen `sharedComputedSentinel` 을 반환하여, 호출자(`AbstractNode`)가 매니저·게이트·sentinel 을 직접 알 필요 없이 캡슐화한다.

## Conventions

- 반환 타입은 항상 `ComputedProperties` 인터페이스 (매니저/sentinel 공통 계약)
- 게이트는 PRESENCE 기준, 의심 시 real manager 로 fallthrough
- 호출자는 이 팩토리만 import (매니저/게이트/sentinel 직접 import 금지)

## Boundaries

### Always do

- `AbstractNode` 는 `getComputedPropertiesManager()` 로만 `__computeManager__` 생성
- 반환 객체는 `ComputedProperties` 로만 소비 (구체 타입 의존 금지)

### Ask first

- 게이트 조건(5절) 추가·삭제 — sentinel 안전성 직결
- sentinel 기본값 변경

### Never do

- 게이트 우회하고 `new ComputedPropertiesManager` 직접 호출
- sentinel 을 mutable 로 노출하거나 노드별 상태 저장
