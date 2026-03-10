# commands Specification

## Requirements

- 각 CLI 명령어를 독립 함수로 구현하여 프로그래밍 방식 호출 지원
- COMMANDS 레지스트리를 통해 명령어 메타데이터 일괄 관리
- core/ 모듈에 I/O를 위임하고 명령어 레이어는 오케스트레이션만 수행

## API Contracts

- `runSyncCommand(options): Promise<void>` — 패키지 동기화 실행
- `runAddCommand(options): Promise<void>` — 대화형 에셋 추가
- `runListCommand(options): Promise<void>` — 동기화 목록 표시
- `runRemoveCommand(options): Promise<void>` — 패키지 제거
- `runStatusCommand(options): Promise<void>` — 상태 표시
- `runMigrateCommand(options): Promise<void>` — 구조 마이그레이션
- `runUpdateCommand(options): Promise<void>` — 메타데이터 업데이트
- `registerListCommand(program): void` — list 명령어 등록
- `COMMANDS: Record<string, CommandMeta>` — 명령어 메타데이터 레지스트리

## Last Updated

2026-03-02
