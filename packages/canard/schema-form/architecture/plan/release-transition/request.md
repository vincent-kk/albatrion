# 별도 — 릴리스 전환 PR — 개발요청서

> 원장 정본: LANDING-097, LANDING-090(기반 PR과의 순서), 릴리스 항목 TEST-045–057. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산이 아니라 `master`에 직접 연다. 저장소 전체의 일이라 재설계와 독립이다. 의존 없음. 09 전에 병합한다(LANDING-097). 시점은 소유자가 정한다(LANDING-204).

## 목적

저장소의 릴리스 장치를 정리한다: changesets 가동, CI 시험 작업 흐름, 포장·릴리스 테스트 스크립트, 판 올림 절차와 문서.

## 범위 — 원장이 정한 내용

- changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(LANDING-097). changeset 존재 검사와 `changedFilePatterns`(TEST-053), 무리 밖 패키지의 자기 changeset(TEST-055).
- **changesets 설정**(TEST-045): "`.changeset/config.json`: `changelog: ["@changesets/changelog-github", { "repo": "vincent-kk/albatrion" }]`(repo 옵션이 없으면 생성기가 던진다), `fixed: [["@canard/schema-form", "@canard/schema-form-*-plugin"]]`(여덟), `privatePackages: { version: false, tag: false }`(기본값은 비공개 패키지의 판을 올린다), `baseBranch: "master"`, `updateInternalDependencies: "patch"`(기본값)".
- **배포와 태그**(TEST-046): "`changeset publish`는 pnpm이 아니면 `npm publish`를 불러 `workspace:` 범위를 바꾸지 않고 설정 기본값 `access: restricted`로 올리므로 쓰지 않는다." "루트 스크립트 `"release": "./scripts/publish-packages.sh && changeset tag"`를 두고 `changesets/action`의 `publish: yarn release`로 부른다(액션 입력에 `&&`를 직접 쓰지 않는다)."
- **작업 흐름**(TEST-047): "작업 흐름은 `publish-npm-packages.yml` 한 파일." "실행 조건은 `push: master`와 `workflow_dispatch`(`dry_run` 유지)."
- **토큰**(TEST-048): "토큰은 기본 `GITHUB_TOKEN`." "소유자의 손 작업 하나: 저장소 설정 'Allow GitHub Actions to create and approve pull requests'를 켠다(이름과 동작은 첫 가동 때 확인)."
- **시험 작업 흐름**(TEST-049): "전환 PR이 루트에 `yarn workspaces foreach --all --topological-dev run <이름>` 형태로 더한다." "PR 실행에는 아홉째의 `changeset status`를 더한다."
- **릴리스 테스트**(TEST-050): "릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사한다." "(1) 포장: 판 가드 없이 공개 패키지 전부를 `yarn pack`하는 `scripts/pack-packages.sh`를 `publish-packages.sh`에서 떼어 내고 둘이 함께 쓴다".
- **배포 시점과 복구**(TEST-051·052): "배포 시점: 판 올림 PR을 병합하면 자동으로 배포한다." "판 변경이 어떤 길로든 `master`에 들어오면(직접 푸시 포함) 배포된다는 것을 `scripts/PUBLISHING.md`에 적는다." "판 올림 PR 병합 뒤 `test`가 실패하면 고치는 커밋에 patch changeset을 더해 다음 판으로 낸다."
- **액션과 Release**(TEST-056·057): "제3자 액션은 커밋 해시로 고정한다." "GitHub Release는 changesets의 기본대로 패키지 태그마다 하나다."
- **저장소 정리**(TEST-054): "루트 `CLAUDE.md`의 개발 흐름 6번(판을 손으로 올리고 changesets와 CHANGELOG를 쓰지 않는다)을 'changeset을 쓴다'는 규칙으로 바꾸고, 명령 목록을 다섯째의 루트 스크립트와 맞추며, 스킬 표의 `release-note-generator` 설명을 고친다." "`scripts/PUBLISHING.md`의 평상시 절차와 트리거를 새 흐름으로 다시 쓴다." "로컬 폴백(`yarn publish:changed`, 소유자가 둔 이중 인증 경로)은 남기되, 판 올림은 판 올림 PR로만 하고 로컬 폴백은 병합된 판의 올리기만 대신한다고 적는다." "태그는 `yarn changeset tag && git push --tags`." "판을 changeset 없이 정하는 둘째 길인 루트 `major:all`·`minor:all`·`patch:all`, 패키지들의 `version:*`, `tag:packages`와 `scripts/tag-packages.sh`, 망가진 `changeset:publish`는 지운다(근거는 예측가능성: 판을 정하는 길은 하나다)." "`.claude/skills/release-note-generator`는 남기되 '`.changeset/*.md` 본문 쓰기와 다듬기'(특히 PR-8의 파괴적 변경 changeset과 이주 안내)로 역할을 좁힌다".
- 이것이 먼저 들어오면 02가 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계를 더한다(LANDING-090).

## 착수 전 확인

- 오늘의 발행 절차(루트 `CLAUDE.md`: 판은 `package.json`에서 직접 올리고 changeset·CHANGELOG는 쓰지 않음)와의 차이를 `scripts/PUBLISHING.md`에 적고 소유자가 확인한다.

## 산출물과 완료 기준

- [ ] changesets와 CI 작업 흐름(`test.yml`)
- [ ] 포장·릴리스 테스트 스크립트
- [ ] 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정
- [ ] 제3자 액션의 커밋 해시 고정(TEST-056), 판을 changeset 없이 정하는 스크립트 삭제(TEST-054)

## 절차 (seiri·filid)

- 저장소 설정과 스크립트의 변경이다. 스크립트는 한 파일에 한 책임(seiri structure), 작업 흐름 파일 머리에 무엇이 그것을 부르는지 한 줄(agent-legible §1).

## 원장 항목 색인

- LANDING-097 릴리스 전환(별도 PR)
- LANDING-090 보정 PR-0 — `test.yml`의 vitest 세 프로젝트와 playwright chromium 단계
- TEST-053 릴리스 9 — changeset 존재 검사와 changedFilePatterns
- TEST-054 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합
- TEST-055 릴리스 11 — 무리 밖 패키지의 자기 changeset
