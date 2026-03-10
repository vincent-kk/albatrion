# list

## Purpose

list 명령어의 ink UI 컴포넌트. 동기화된 패키지를 트리 뷰로 탐색하고 편집한다.

## Structure

- `index.ts` — barrel export
- `ListCommand.tsx` — 메인 list UI (view/edit 모드)
- `SyncedPackageTree.tsx` — 패키지 계층 트리 렌더러
- `EditableTreeItem.tsx` — 편집 가능한 트리 아이템
- `types.ts` — ListPhase, SelectItem, PackageDetailInfo 타입

## Conventions

- view 모드: 탐색 (e=편집, r=새로고침, q=종료)
- edit 모드: 수정 (d=삭제, a=추가, Esc=취소)

## Boundaries

### Always do

- 타입 정의는 types.ts에 집중
- shared/ 컴포넌트 재사용

### Ask first

- ListPhase 상태 머신 변경

### Never do

- 직접 파일시스템 조작 (commands/list.ts에 위임)
