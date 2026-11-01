> 이름 함정: 이 `surface`는 런타임 겉면 fractal이며, 렌더 디렉터리 `src/components/FieldProxy`나 공개 판별 합집합 형 `FieldNode` 자체가 아니다(NODE-010).

# surface — 노드 겉면 경계

## Purpose

단일 런타임 클래스, 공개 노드 형과 가드, 트리 생성과 마운트 통로를 하나로 묶는다.

## Conventions

- Boolean node properties use the is prefix; isEdited and isTouched read interaction state, and isDivergent compares output against the last committed root load.

- 클래스에는 필드, 게터, 한 문장짜리 위임만 두고, 종류별 계산은 행에 맡긴다(NODE-010).
- 공개 타입은 레코드 필드를 숨긴 `type` 판별 합집합이다(NODE-015·046).

## Boundaries

### Always do

- 멤버를 추가할 때는 DETAIL의 PR별 목록, 멤버 목록 시험, 공개 형을 함께 고친다(26C-01).
- 생성할 때 청사진의 종류와 전략으로 행을 한 번 선택한다(NODE-002·008).
- 배열 동사는 engine 진입점을 거쳐 쓰기 진입 함수에 한 문장으로 위임하며, 공통 동작 행이 배열이 아닌 호스트를 거부한다(NODE-010·014, 35C-01, 62C-01).

### Ask first

- 공개 겉면 멤버나 내부 바인딩 통로를 늘리려는 경우.

### Never do

- 클래스 본문에 정착, 탐색, 종류 분기 로직이나 노드별 할당을 넣지 않는다(NODE-010).
- 기제가 없는 겉면 멤버를 스텁이나 시험용 런타임 칸으로 미리 만들어 두지 않는다(26C-01).
