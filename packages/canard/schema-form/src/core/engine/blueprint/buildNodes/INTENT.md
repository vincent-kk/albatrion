# buildNodes

## Purpose

작성된 스키마의 선언과 조각을 수집하고 유한한 청사진 노드와 자식 연결을 구성한다.

## Conventions

- 선언 ID, DFS 전순서와 작성 위치를 유지한다.
- 노드 구성과 허용 형 분석은 renderer predicate를 주입받으며 작성 값을 평가하지 않는다.

## Boundaries

### Always do

- 연언과 선언 문맥, 호스트별 상속 overlay와 자식 소속 배열의 소유를 보존한다.
- 재귀 참조는 구성 중인 템플릿에 다시 연결해 분석을 유한하게 유지한다.

### Ask first

- 선언 확장 순서, 형 추론이나 discriminator의 정적 해석을 바꿀 때

### Never do

- 명시적인 discriminator 없이 const나 enum으로 분기를 선택하지 않는다.
- 작성 스키마를 변경하거나 런타임 노드를 할당하지 않는다.
