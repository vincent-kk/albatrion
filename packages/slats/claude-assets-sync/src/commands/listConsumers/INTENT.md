# listConsumers

## Purpose

`claude-sync list` 의 핸들러. `discover()` 로 찾은 컨슈머를 열거해서
기본 표(table) 혹은 `--json` 으로 원시 JSON 을 출력한다. JSON 형태가
스크립트 연동용 표면이다.

## Structure

- `index.ts` — 배럴 export (`listConsumers`, `ListOptions`)
- `listConsumers.ts` — 메인 핸들러
- `utils/stripAnsi.ts` — 컬럼 폭 계산용 ANSI SGR 제거기
- `utils/padRight.ts` — 평범한 오른쪽 패딩
- `utils/padWithAnsi.ts` — 가시 폭을 고려한 오른쪽 패딩

## Boundaries

### Always do

- JSON 페이로드는 trailing newline 을 포함해서 쓰기 (다운스트림 파싱 안정)
- 리스팅은 stdout 전용; 여기서 error/dim 메시지는 stderr 방출 금지

### Ask first

- NAME / VERSION / ASSET PATH / HASHES 이외의 컬럼 추가
- 인터랙티브 리스트 모드 추가 (프롬프트는 `prompts/` 소관)

### Never do

- `core/` 에서 import — 리스팅은 inject 와 무관
- 해시 상태를 꾸미지 않기; `discover()` 결과를 그대로 반영
