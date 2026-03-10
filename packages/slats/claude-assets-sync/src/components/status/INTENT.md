# status

## Purpose

status 명령어의 ink UI 컴포넌트. 동기화된 패키지의 상태를 시각적으로 표시한다.

## Structure

- `index.ts` — barrel export
- `StatusDisplay.tsx` — 메인 상태 UI (패키지 카드 목록 + 요약 통계)
- `PackageStatusCard.tsx` — 개별 패키지 상태 카드 (버전 비교, 상태 아이콘)
- `StatusTreeNode.tsx` — 상태 트리 노드 렌더러

## Conventions

- 상태 아이콘: ✓ (최신), ⚠ (업데이트 가능), ✗ (오류)
- 색상 코딩으로 상태 구분

## Boundaries

### Always do

- primitives/ 및 shared/ 컴포넌트 재사용
- Props를 통해 데이터를 주입받아 렌더링만 수행

### Ask first

- 상태 표시 형식 또는 아이콘 체계 변경

### Never do

- 컴포넌트 내부에서 원격 API 호출
