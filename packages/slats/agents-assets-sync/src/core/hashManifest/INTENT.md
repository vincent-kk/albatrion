# hashManifest

## Purpose

inject 시 source 쪽 해시를 공급한다. `dist/agents-hashes.json`(스키마 v1)을 읽거나, 호출자가 지정한 asset 디렉터리를 그 자리에서 훑어 같은 모양의 매니페스트를 만든다. orphan 탐지를 위한 네임스페이스 prefix 집합도 여기서 계산한다.

## Conventions

- 원본 해시의 출처를 읽기 전용 매니페스트 또는 호출자가 지정한 자산 디렉터리로 구분합니다.
- 디렉터리에서 계산한 해시도 빌드 시 생성한 매니페스트와 같은 필터·POSIX 키·정렬 계약을 따릅니다.
- generatedAt은 호출자가 주입하며, 계산 과정에서 현재 시각이나 환경을 읽지 않습니다.

## Boundaries

### Always do

- 지원하지 않는 schemaVersion은 명시적인 Error로 거부합니다.
- 런타임 매니페스트는 불변 읽기 전용 표면으로 취급합니다.
- generatedAt을 인자로 받고 현재 시각·환경을 읽지 않습니다.
- 계산 경로의 잡음 필터·POSIX 키·키 정렬은 빌드 해시 생성기와 맞춥니다. 어느 한쪽을 바꾸면 동등성 검사도 실행합니다.

### Ask first

- 현재 스키마 버전 1에서 다른 버전으로 계약을 변경
- skills의 개별 이름 단위 밖으로 namespace prefix 범위를 확장 — 모든 소비자의 orphan 판정이 달라집니다.

### Never do

- 이 모듈에서 매니페스트를 디스크에 기록 — 파일 생성은 빌드 해시 생성기가 소유합니다.
- 적용·계획·명령 계층에 역으로 의존
