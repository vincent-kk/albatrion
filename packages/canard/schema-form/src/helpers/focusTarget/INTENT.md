# Focus target

## Purpose

커밋된 입력 위치의 포커스 대상 해석을 소유합니다.

## Conventions

- 폼이 위치 맵을 소유하고 실제 대상의 수명은 입력 ref가 소유합니다.

## Boundaries

### Always do

- 명령, 마운트 판정과 배열 행에서 같은 대상 해석을 사용합니다.

### Ask first

- 대상 범위·자격·순서를 바꿀 때.

### Never do

- 해석한 대상을 캐시하거나 위젯 내부 DOM 모양에 의존하지 않습니다.
