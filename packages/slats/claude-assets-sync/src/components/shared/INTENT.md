# shared

## Purpose

여러 명령어 UI에서 공통으로 사용하는 재사용 가능한 ink 컴포넌트 모음.

## Structure

- `index.ts` — barrel export
- `Confirm.tsx` — 확인/취소 대화상자
- `MenuItem.tsx` — 메뉴 항목 렌더러
- `ProgressBar.tsx` — 진행률 표시 바
- `StepRunner.tsx` — 단계별 작업 실행기
- `Table.tsx` — 테이블 렌더러

## Conventions

- 각 컴포넌트는 독립적이며 외부 상태에 의존하지 않음
- Props 타입은 컴포넌트와 동일 파일에서 export

## Boundaries

### Always do

- primitives/ 모듈 위에 구축
- 컴포넌트 간 의존성 없이 독립적으로 유지

### Ask first

- 새로운 공유 컴포넌트 추가

### Never do

- 특정 명령어에 종속적인 로직 포함
