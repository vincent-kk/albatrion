# markerBlock

## Purpose

Read and write this tool's own comment-delimited blocks inside an `AGENTS.md` that other tools also append to. A rule file becomes one block, so a block's body hash is comparable to the manifest hash for that file and the copy/skip/diverged verdict stays identical to the file-copy path.

## Conventions

- Marker shape is `<!-- AGENTS-ASSETS-SYNC:START:<packageName>:<relPath> -->`, mirroring the `FILID:` / `SEIRI:` markers the same file already carries.
- `createBlockPattern` returns a new regex per call; a shared global regex carries `lastIndex` and would skip matches.

## Boundaries

### Always do

- 도구 소유 블록 밖의 바이트는 그대로 보존합니다. 다른 도구의 블록과 사용자가 쓴 본문은 수정하지 않습니다.
- 같은 ID의 블록을 중복 추가하지 않고 기존 위치에서 교체합니다.
- 패키지 이름의 정규식 메타문자가 패턴을 바꾸지 않도록 캡처한 ID를 값으로 비교합니다.

### Ask first

- MARKER_PREFIX 또는 마커 형식 변경 — 기존 문서의 블록 식별이 달라집니다.
- 한 블록에 여러 원본 파일을 넣는 변경

### Never do

- 파일시스템 읽기·쓰기 — 이 모듈은 문자열 변환만 소유합니다.
- 목적지·계획·적용·명령·UI 계층에 역으로 의존
