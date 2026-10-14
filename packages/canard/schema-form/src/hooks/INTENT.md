# hooks

## Purpose

`@canard/schema-form`의 공개 React 훅과, 컴포넌트가 노드를 구독할 때 쓰는 내부 훅을 소유하는 fractal. 노드 변경 추적·구독·자식 필드 조회·자식 오류 조회·폼 제출 상태를 훅 계약으로 제공한다.

## Conventions

- 훅 구현은 역할 칸 hooks에 한 파일 한 훅으로 둔다. 진입점 index는 이름 목록으로만 재수출한다.
- 형제 fractal(`core`·`providers`·`components/FieldProxy`·`components/Form`·`types`)은 각 관문 index로 가져오고, `src`의 organ(`constants`)은 위로 열림으로 직접 가져온다.
- 시험은 시험 칸에 두고 훅 구현 파일을 직접 가져온다.

## Boundaries

### Always do

- 루트 `src/index.ts`가 재수출하는 훅은 이 fractal의 index를 거친다.
- 훅의 구독은 언마운트 때 해제한다.

### Ask first

- 공개 훅의 이름·인자·반환 모양 변경(패키지 공개 계약)
- 새 훅을 index에 추가(소비자가 이 fractal 밖에 있어야 한다)

### Never do

- 형제 fractal의 내부 파일을 경로로 가져오기
- 노드 상태를 훅 안에서 직접 바꾸기(쓰기는 노드의 공개 명령으로만)
