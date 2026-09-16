# core

## Purpose

에이전트 자산 주입에 필요한 UI 비의존 기본 연산을 소유합니다. 프로젝트 위치·에이전트 목적지·해시 비교·적용 계획·실제 적용을 조합할 수 있게 제공하며, 전체 실행을 조율하는 함수는 이 모듈에 두지 않습니다. 대화형·일반 텍스트·JSON 렌더러가 이 연산을 조합합니다.

## Structure

파일 순회와 POSIX 경로 정규화는 해시 계산과 계획 생성이 함께 사용하므로 공통 소유자인 core의 내부 유틸리티로 둡니다.

## Conventions

- 공용 유틸리티 organ은 독립 배럴을 갖지 않으며, 소유 모듈 안의 하위 프랙탈은 그 구체 파일을 직접 참조합니다. 여러 하위 모듈이 사용하는 기능만 이 위치에 둡니다.
- 해시와 프로젝트 스코프 판별은 상위 계획·실행 계층에 의존하지 않는 말단으로 유지합니다.
- 목적지 결정, 계획 생성, 적용으로 향하는 의존 방향을 지키고 역방향 참조와 순환을 만들지 않습니다. 형제 프랙탈 간 참조는 각 공개 진입점을 사용합니다.

## Boundaries

### Always do

- Each sub-fractal is reachable only through its `index.ts` barrel
- Propagate exit code through `InjectReport.exitCode` (0 / 1 / 2)

### Ask first

- Adding a sub-fractal, or an agent to `AgentType`
- Expanding the public API beyond what `commands/` and `ui/` consume

### Never do

- Import from `commands/` or `ui/` anywhere in this tree
- Perform TTY prompts — prompting is a renderer concern
- Touch content in a shared document outside this tool's own markers
