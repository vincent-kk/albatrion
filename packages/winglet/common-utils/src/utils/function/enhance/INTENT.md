# enhance — getTrackableHandler 소유 fractal

## Purpose

비동기 핸들러의 상태 추적·구독·동시 실행 제어 API를 집계하는 재수출 경계입니다. 실제 구현과 상태의 소유자는 자식 getTrackableHandler 프랙탈이며, 이 모듈은 공개 이름과 관련 타입을 그대로 연결합니다.

## Conventions

- 구현 자식의 공개 진입점에서 함수와 관련 타입을 이름 지정으로 재수출합니다.
- 이 중간 경계는 별도의 상태나 실행 정책을 추가하지 않습니다.

## Boundaries

### Always do

- `getTrackableHandler` 관련 새 공개 심벌은 하위 fractal의 진입점에서 이름으로 재수출한다
- 하위 fractal의 계약이 바뀌면 이 재수출 목록도 같은 커밋에서 맞춘다

### Ask first

- 이 fractal root에 `getTrackableHandler` 이외의 구현을 직접 추가하는 변경
- 재수출 표면을 좁히거나 이름을 바꾸는 변경 — 소비자의 import 경로가 깨진다

### Never do

- 하위 fractal의 내부 파일을 그 진입점을 건너뛰고 여기서 직접 import
- 이름을 밝히지 않는 와일드카드로 하위 fractal을 재수출
