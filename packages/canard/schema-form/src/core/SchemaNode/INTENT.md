> 이름 함정: 이 `SchemaNode`는 런타임 겉면 fractal이며 렌더 디렉터리 `src/components/SchemaNode`나 공개 판별 합집합 형 `SchemaNode` 자체가 아닙니다(NODE-010).

# SchemaNode — 노드 겉면 경계

## Purpose

단일 런타임 클래스, 공개 노드 형·가드와 트리 생성 함수를 조합합니다.

## Conventions

- 클래스는 필드·게터·문장 하나짜리 위임만 갖고 종류별 계산을 행에 맡깁니다(NODE-010).
- 공개 타입은 레코드 필드를 숨긴 `type` 판별 합집합입니다(NODE-015·046).

## Boundaries

### Always do

- 멤버를 더할 때 DETAIL의 PR별 목록·멤버 목록 시험·공개 형을 함께 고칩니다(26C-01).
- 생성 시 청사진의 종류·전략으로 행을 한 번 선택합니다(NODE-002·008).
- Delegate each array verb in one statement to its dispatch entry; the shared behavior slot rejects non-array hosts (NODE-010·014, 35C-01, 62C-01).

### Ask first

- 공개 겉면 멤버나 내부 바인딩 통로를 늘릴 때

### Never do

- 클래스 본문에 정착·탐색·종류 분기 로직 또는 노드별 할당을 넣지 않습니다(NODE-010).
- 기제가 없는 겉면 멤버를 스텁이나 시험용 런타임 칸으로 미리 두지 않습니다(26C-01).
