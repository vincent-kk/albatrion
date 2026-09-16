# scope

## Purpose

Resolve a `user | project` scope token into one absolute project root. `user` is the home directory; `project` walks up from `cwd` and reuses the first ancestor that owns any project anchor. The root is agent-neutral on purpose — every selected agent derives its own asset locations from the same root, so `claude` and `codex` never disagree about which project they are in.

## Conventions

- An anchor is any of `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git`. Existence alone marks the root, with no directory check: a file and a directory count alike, because `AGENTS.md` is a file and `.git` is a file rather than a directory inside a worktree.
- Order within the list does not affect the verdict; the first match wins.

## Dependencies

- None. This is the deepest leaf `agentTarget/` builds on.

## Boundaries

### Always do

- cwd와 다른 상위 프로젝트를 선택했으면 autoLocated를 보고해 렌더러가 실제 기록 위치를 설명할 수 있게 합니다.
- 동기적이고 결정적인 판별로 유지합니다.

### Ask first

- user와 project 외의 스코프를 추가하는 변경
- 모든 에이전트의 기록 위치를 결정하는 anchor 기준을 바꾸는 변경

### Never do

- 에이전트별 목적지 계산을 이곳에 추가 — 그 책임은 agentTarget에 있습니다.
- 목적지·계획·적용·명령·UI 계층에 역으로 의존
- 네트워크 또는 비동기 IO 사용
