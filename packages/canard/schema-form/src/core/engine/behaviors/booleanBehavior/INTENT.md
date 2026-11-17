# booleanBehavior — 불리언 계산 경계

## Purpose

불리언의 제한된 입력 해석과 원본 투영을 소유합니다.

## Boundaries

### Always do

- 공유 변환 표 밖의 입력을 그대로 보존합니다. 해석 실패를 false와 혼동하지 않습니다.

### Ask first

- 불리언 변환의 허용 표현을 바꿀 때

### Never do

- truthy/falsy 강제 변환이나 빈 값 대체를 하지 않습니다. 입력의 뜻과 원본 오류를 잃습니다.
