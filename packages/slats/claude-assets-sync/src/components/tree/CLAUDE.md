# tree

## Purpose

대화형 트리 선택 UI 컴포넌트. 파일/디렉토리 구조를 탐색하고 선택할 수 있는 범용 트리 위젯.

## Structure

- `index.ts` — barrel export
- `TreeSelect.tsx` — 메인 트리 선택 컴포넌트 (키보드 탐색, 선택, 확장/축소)
- `AssetTreeNode.tsx` — 단일 트리 노드 렌더러 (체크박스, 아이콘)

## Conventions

- 키보드: ↑↓=탐색, Space=선택, →←=확장/축소, a=전체선택, n=전체해제, Enter=확인, q=취소
- Props를 통한 콜백 패턴으로 상위 컴포넌트와 통신

## Boundaries

### Always do

- primitives/ 모듈의 Box, Text 컴포넌트 사용
- Props 타입을 컴포넌트와 함께 export

### Ask first

- 키보드 단축키 변경 또는 추가

### Never do

- 트리 데이터 로딩 로직을 컴포넌트 내부에 포함
