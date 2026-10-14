# validateChildTargets

## Purpose

분석된 선언의 자식 제어 대상과 discriminator 키의 정적 일관성을 검증한다.

## Conventions

- 실제, 끌어올린 자식과 가상 자식이 모두 구성된 뒤에 검증한다.
- 선언의 게이트 활성 여부와 무관하게 정적 대상을 확인한다.

## Boundaries

### Always do

- fields 대상이 호스트의 직계 자식인지 확인한다.
- 서로 다른 discriminator 키와 없는 자식 대상을 작성 위치가 있는 오류로 보고한다.

### Ask first

- 자식 대상의 범위나 discriminator 키 충돌 판정을 바꿀 때

### Never do

- 터미널 호스트의 fields 대상을 유효한 자식으로 받지 않는다.
- 검증 중 자식을 추가하거나 게이트를 평가하지 않는다.
