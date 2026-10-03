# 16라운드 원자료 — 오늘의 릴리스 구조 (scout, 2026-09-24)

소유자 답 9("changeSet을 사용한 표준 방법으로 바꾸고자 합니다… 지금 구조는 github actions를 보세요")를 위한 조사다. 경로는 저장소 루트 기준.

## 1. 워크플로

- `.github/workflows/performance-benchmarks.yml`: `push`·`pull_request`(master, schema-form·benchmark-form·json-schema 경로), 매일 03:30 UTC, 수동. Node 20.19.5, `yarn install --immutable`, 의존 빌드 뒤 `yarn workspace @canard/schema-form bench`(`--expose-gc`), `benchmark-form` 스윕, 프레임워크 비교와 과다 렌더 단언(`--assert`, 실패하면 작업 실패, `:115-124`), 회귀 검사(경고만, `:126-128`), 결과 JSON 아티팩트(30일). 시크릿 없음.
- `.github/workflows/publish-npm-packages.yml`: 수동 실행만(`dry_run` 입력). `contents: write`, `id-token: write`(npm OIDC, 저장 시크릿 없음), Node 22, `npm@latest`(OIDC에 11.5.1 이상), `yarn build:all`(rolldown 경고를 릴리스 블로커로), `./scripts/publish-packages.sh`, 성공 시 `./scripts/tag-packages.sh HEAD --push --yes`. GitHub Release는 만들지 않는다.
- `yarn test`·`lint`·`typecheck`·스토리북 빌드를 돌리는 워크플로는 없다.

## 2. 오늘의 릴리스

- 판: 손으로 올린다. 패키지의 `version:major|minor|patch`(`yarn version`), 루트 `major:all`·`minor:all`·`patch:all`(`package.json:33-34,38`). 루트 `CLAUDE.md`가 "changesets나 CHANGELOG를 쓰지 않는다"고 적는다.
- 배포: `scripts/publish-packages.sh`가 `yarn pack`으로 `workspace:^`를 실제 범위로 바꾸고(`:6-7`) 레지스트리에 있는 판은 `npm view`로 건너뛴다(`:85-97`). 로컬은 `yarn publish:changed`(`package.json:41`). `scripts/PUBLISHING.md`가 지속 통합의 OIDC와 로컬의 이중 인증을 설명한다.
- 태그: `scripts/tag-packages.sh`가 비공개가 아닌 패키지마다 태그를 만든다. GitHub Release 객체는 없다.
- 릴리스 노트: `.claude/skills/release-note-generator`(수동·에이전트 보조, 지속 통합 밖).

## 3. 릴리스 전 점검

- 없다. `@aileron/production-testbed`(`packages/aileron/production-test`, Vite + React 19, `@canard/schema-form`·`@lerx/promise-modal`을 `workspace:^`로, 스크립트는 `build`·`dev`·`lint`·`preview`)와 `scripts/test-package-import.sh`·`scripts/test-winglet-import.sh`(루트 `import-test`·`import-test:winglet`)는 어느 워크플로도 부르지 않는다.

## 4. changesets 준비

- `@changesets/cli` 2.29.6, `@changesets/changelog-github` 0.5.1이 설치되어 있고(`package.json:117-118`) 루트 스크립트 `changeset`·`changeset:version`·`changeset:publish`가 있다(`:20-22`). `.changeset/`은 없다(가동한 적 없음).
- 비공개 패키지: `@aileron/benchmark`, `@aileron/development-helper`, `@aileron/production-testbed`, `@aileron/benchmark-form`.
- 의존은 `workspace:` 프로토콜. `@canard/schema-form` 계열 여덟(본체, ajv6·ajv7·ajv8, antd5·antd6, antd-mobile, mui)은 모두 0.16.0으로 같이 움직인다.
- Yarn 4.12.0(`packageManager`), `nodeLinker: node-modules`, `enableImmutableInstalls: true`.

## 5. changesets와 부딪히는 것

1. 루트 `CLAUDE.md`의 "changesets를 쓰지 않는다" 문장.
2. 계열 여덟의 같은 판 — `fixed` 설정이 필요하다.
3. 오늘의 배포 스크립트와 태그 스크립트(OIDC, 범위 치환) — `changeset publish`의 `npm publish`는 `workspace:` 범위를 바꾸지 않으므로 역할을 나눠야 한다.
4. 설치는 되어 있으나 가동하지 않은 상태.
5. GitHub Release가 없고, 릴리스 노트 스킬과 `CHANGELOG.md`의 역할이 겹친다.
6. 지속 통합에 시험 작업이 없어 릴리스 테스트를 걸 자리가 없다.
