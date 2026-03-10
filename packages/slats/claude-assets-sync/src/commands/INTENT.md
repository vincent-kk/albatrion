# commands

## Purpose

CLI 명령어 구현 모듈. sync, add, list, remove, status, migrate, update 명령을 제공한다.

## Structure

- `index.ts` — barrel export 및 COMMANDS 메타데이터 레지스트리
- `sync.ts` — 패키지 동기화 명령
- `add.ts` — 대화형 에셋 추가
- `list.ts` — 동기화된 패키지 목록 및 트리 UI
- `remove.ts` — 패키지 제거
- `status.ts` — 동기화 상태 표시
- `migrate.ts` — 레거시→flat 구조 마이그레이션
- `update.ts` — 패키지 메타데이터 업데이트
- `types.ts` — 명령어 공통 타입

## Conventions

- 각 명령어는 `run<Name>Command` 패턴의 함수로 export
- COMMANDS 객체에 명령어 메타데이터(name, description, options) 등록

## Boundaries

### Always do

- 새 명령어 추가 시 index.ts의 COMMANDS에 메타데이터 등록
- core/ 모듈의 로직을 활용하여 구현

### Ask first

- 기존 명령어의 옵션 시그니처 변경

### Never do

- 명령어 파일에서 직접 파일시스템/네트워크 I/O 수행 (core/에 위임)
