# app

## Requirements

전역 플러그인 상태와 상수의 의미를 유지하며, 노드별 상태를 전역 저장소에 섞지 않습니다.

## API Contracts

- 플러그인 상태 변경은 PluginManager의 등록·초기화 경로로 수행합니다. 동일 콘텐츠의 플러그인은 중복 등록하지 않습니다.
- registerPlugin에 null을 전달하면 등록 상태와 기본 설정을 복원합니다.

## Acceptance Criteria

### app-contract — 관찰 가능한 동작

- 동일 플러그인을 반복 등록해도 입력 정의와 렌더 설정이 중복 누적되지 않습니다.
- 초기화 후에는 이전 플러그인의 설정이 다음 폼에 남지 않습니다.

## Last Updated

2026-09-16
