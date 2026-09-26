# 단일 원장 — 이주와 착수

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `08-design-a-to-z.md` §14(오늘과 달라지는 것)·§17(개발 단계와 PR 계획)과 `09-landing-and-test-strategy.md` §2(정착 검토)·§7(PR 계획 보정)이다. `09` §7이 `08` §17과 다르게 적으면 `09` §7이 이긴다(이 커밋에서는 `09` §7이 더하기만 하고 어긋나는 행은 없다). `05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`의 이주 목록과 개발 진입 평가는 그때의 기록이다. 거기 적힌 이주 항목이 뒤 문서에 그대로 있으면 문장 분류(RESTATES)로 뒤 항목을 가리키고, 뒤 문서가 바꾼 것은 원문 그대로 대체됨 항목으로, 뒤 문서가 바꾸지 않았는데 `08` §14에 행이 없는 것은 원문 그대로 남기되, 표의 행은 그 규칙을 든 다른 영역의 항목을 가리키는 중복 항목으로, 나눌 수 없는 목록 문장은 현행 항목으로 둔다.

상태 값의 뜻: **현행**은 지금 유효한 규칙, **현행(기록)**은 그때의 기록이며 그 내용은 뒤 문서의 행이 들거나 뒤 라운드가 바꾼 것, **중복**은 규칙이 더 높은 정본을 가진 다른 영역의 항목에 있는 것, **대체됨**은 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다. 이주 표와 PR 표는 한 행이 한 항목이며, 결정 칸에 표의 머리 두 줄을 함께 옮긴다. **라운드**는 그 문장이 마지막으로 정해진 라운드이며, 이주 행과 PR 행은 기준 커밋의 `git blame`이 가리키는 라운드 커밋(`d478a8503` 11–14라운드, `f0df9545f` 15라운드, `99765899b` 16라운드, `165ee8948` 17라운드)을 따른다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| LANDING-001 | 완전한 파괴적 변경 — 모든 패키지가 함께 메이저 버전급으로 올라감(C7) | 현행 | 소유자 답(`00-goals.md:110` C7), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) |
| LANDING-002 | 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호; 원문 재록 `09-landing-and-test-strategy.md:250,278`) |
| LANDING-003 | 릴리스 노트와 이주 프롬프트(`docs/agents`)를 낸다(C8) | 현행 | 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) |
| LANDING-004 | 이주 1 — 분기 자동 감지 대신 명시 `controls.discriminator`·분기 안 `if/then/else: false`·`controls.active` | 현행 | 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-005 | 이주 2 — `oneOfIndex`·`anyOfIndices`·분기 선택 API는 대체물 없이 사라짐 | 현행 | 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42` 읽기1) |
| LANDING-006 | 이주 3 — `&if`는 `controls.active`로 흡수 | 현행 | 편집자 결정(9라운드 이름, `07-conclusions.md:312` 조각 게이트 `&if` 은퇴), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-007 | 이주 4 — `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:14` 6) |
| LANDING-008 | 이주 5 — `&pristine`은 `controls.resetInteraction` | 현행 | 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-009 | 이주 6 — `controls.unsetValue`·`default`·`children`·`discriminator`·`unsetOnInactive` 신설 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue`→`unsetValue`), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름) |
| LANDING-010 | 이주 7 — `allOf` 항목 안의 `if/then/else`가 병합된다 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(9라운드 병합표, `07-conclusions.md:168` 4.27) |
| LANDING-011 | 이주 8 — 분기 전환 때 이미 있던 노드는 다시 채우지 않음 | 현행 | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점 A), 편집자 결정(9라운드, `07-conclusions.md:109` 4.22) |
| LANDING-012 | 이주 9 — 표준 `readOnly`와 `&readOnly`는 택일에서 OR로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`) |
| LANDING-013 | 이주 10 — `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승에서 OR로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`) |
| LANDING-014 | 이주 11 — 공개 문서의 `derived` 레벨 약속은 에지로 | 현행 | 편집자 결정(9라운드 도출, `07-conclusions.md:276` 06의 5.2 D-11′는 에지) |
| LANDING-015 | 이주 12 — 루트 키 다섯의 특수 처리와 README "Priority System"이 사라지고 전체 잠금은 Form 속성 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) |
| LANDING-016 | 이주 13 — 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김)은 OR로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`) |
| LANDING-017 | 이주 14 — 맨 키 `disabled`·`visible`·`active`는 `controls.*`로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-018 | 이주 15 — 조각이 꺼져도 원본은 기본 유지, 비움은 `unsetOnInactive` | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름) |
| LANDING-019 | 이주 16 — `virtual`의 `required` 재작성을 하지 않음 | 현행 | 편집자 결정(5라운드 ADR 0011 4차, `05-before-after.md:155` 근거 `adr/0011:67,71`) |
| LANDING-020 | 이주 17 — `find`·`findNodes`는 터미널 아래 경로에 노드를 돌려주지 않음 | 현행 | 편집자 결정(7라운드 축 수렴 D-21, `06-conclusions.md:170` 4.8) |
| LANDING-021 | 이주 18 — 10비트 `SetValueOption`은 비트 넷 | 현행 | 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행) |
| LANDING-022 | 이주 19 — 루트 `onChange` 디바운스 대신 최외곽 동기 진입당 1회 | 현행 | 소유자 답(`reviews/round-4.md:116` D-10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84) |
| LANDING-023 | 이주 20 — `normalizedValue`는 `outputValue` | 현행 | 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356`; 9라운드 판정 그대로, `07-conclusions.md:347`) |
| LANDING-024 | 이주 21 — 인터페이스 `JSONSchemaError`는 `ValidationIssue` | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:453`) |
| LANDING-025 | 이주 22 — 무한 루프·검증기 실패·바운더리·검증기 없음의 새 동작 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:454`) |
| LANDING-026 | 이주 23 — 조건부 폼 생성 시 `compileGuard` 컴파일 비용이 생김 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:455`) |
| LANDING-027 | 이주 24 — `then`·`else`의 `required`로 켜고 끄던 필드는 `then.properties`나 `controls.active`로 | 현행 | 소유자 답(`reviews/round-9-spec.md:21` 축3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-028 | 이주 25 — 조건도 판별식도 없는 `oneOf`·`anyOf`는 모든 분기가 켜짐 | 현행 | 소유자 답(`reviews/round-9-spec.md:44` 읽기1 이어서), 편집자 결정(9라운드, `07-conclusions.md:142` 4.25) |
| LANDING-029 | 이주 26 — 식의 기준점은 호스트로 바뀌지 않고 `controls.children`으로 옮길 때만 고침 | 현행 | 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준) |
| LANDING-030 | 이주 27 — `injectTo` 순환 자동 차단은 없고 예산이 잡음 | 현행 | 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환) |
| LANDING-031 | 이주 28 — 검증기 앞 제거는 키워드 위치의 그룹 객체 셋 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| LANDING-032 | 이주 29 — 꺼졌다 켜질 때 복원·`oneOf` 전환 잇기 대신 원본 유지와 노드 공유 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(노드 공유, `05-before-after.md:154` 근거 `adr/0005:103`) |
| LANDING-033 | 이주 30 — 평면 `&키` 축약은 사라지고 제어 키는 `controls` 안에만 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-034 | 이주 31 — 맨 폼 전용 키는 `options.*`·`presentation`으로, `options.trim`은 적용 자리만 바뀜 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| LANDING-035 | 이주 32 — 렌더러 키·Form 속성·prop `FormTypeRenderer`의 이름 변경 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8 렌더 계층 이름 매핑), 17라운드 스웜 수렴(편집자 결정, 사실 정정) |
| LANDING-036 | 이주 33 — Form 속성 `validatorFactory`는 `{ compile, compileGuard }` 객체 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:19`) |
| LANDING-037 | 이주 34 — 검증기 플러그인 계약에 `compileGuard(root, pointer)`와 `rejectedKey`가 더해짐 | 현행 | 편집자 결정(16라운드 정착 검토 조건 1, `09-landing-and-test-strategy.md:19`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-038 | 이주 35 — `node.jsonSchema`는 켜진 조각을 병합한 유효 스키마 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(16라운드, `08-design-a-to-z.md:467`) |
| LANDING-039 | 이주 36 — `FormHandle.reset`은 로드이며 같은 스키마면 트리를 남기고 다르면 호출 안에서 재생성 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:8` 2), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6) |
| LANDING-040 | 이주 37 — 플러그인의 `options.*` 자유 키와 맨 표현 키는 `presentation.*`로 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7) |
| LANDING-041 | 이주 38 — 로드 뒤 검증은 `OnChange` 비트일 때만 한 번 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 아홉째), 17라운드 스웜 수렴(편집자 결정, core만 쓰는 호스트의 마운트 검증), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) |
| LANDING-042 | 이주 39 — 호출자의 전체 교체 `setValue(V)`는 reset과 같은 입력 판정 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 열넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-043 | 이주 40 — 공개 `node.group`은 `node.strategy` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름) |
| LANDING-044 | 이주 41 — Form 속성 `onError` 신설, 오류·경고 코드 목록이 공개 계약 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B) |
| LANDING-045 | 이주 42 — `diagnostics`는 `'stable'`·`'degraded'`, 다음 로드까지 남고 그 동안 제출 거부 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) |
| LANDING-046 | 이주 43 — 바운더리는 가두고 대체 화면을 그린 뒤 다시 던지지 않고 보고 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) |
| LANDING-047 | 이주 44 — `trim`은 포커스 아웃 때 `finishInput` 칸이 자르고 입력 출처 쓰기로 다룸 | 대체됨(→ LANDING-145) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| LANDING-048 | 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조) |
| LANDING-049 | 이주 46 — 노드 메서드 `findAll`은 `findNodes` | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조) |
| LANDING-050 | 이주 47 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 인라인 입력)의 처리와 이주 | 대체됨(→ LANDING-149) | 편집자 결정(17라운드, 18라운드 안건 N14로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38) |
| LANDING-051 | 배포는 한 번, 개발은 우산 브랜치 안의 PR 아홉으로 나눔 | 현행 | 소유자 답(`00-goals.md:110` C7), 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-052 | 전환 방식 — 옛 코드는 레거시로 옮기고 새로 쓰며 옛 이름과의 중복은 기준이 아님 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식) |
| LANDING-053 | 새 엔진은 전환 PR 전까지 `<Form>`에 닿지 않고 점진 교체는 하지 않음 | 현행 | 편집자 결정(17라운드, `08-design-a-to-z.md:552` antigravity 검토와 같은 판단) |
| LANDING-054 | 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법 | 대체됨(→ LANDING-159) | 편집자 결정(17라운드, 18라운드 안건 §8로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49) |
| LANDING-055 | 문서가 코드보다 먼저 바뀜 — 각 PR은 새 fractal의 INTENT·DETAIL로 시작, 이름은 책임으로 | 현행 | 원리(filid 규칙, 저장소 `.claude/rules/filid_code-placement.md` §5), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름, 책임별로 나눔) |
| LANDING-056 | 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙) |
| LANDING-057 | 겉면 규칙과 behaviors 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조 스웜 정련; `reviews/round-17-owner-answers.md:25` 반영 칸) |
| LANDING-058 | 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:562`) |
| LANDING-059 | 릴리스는 `master` 병합 뒤의 배포이며 판 올림 PR 병합이 시험 관문을 거쳐 자동 배포 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2의 일곱째) |
| LANDING-060 | PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49) |
| LANDING-061 | PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화 | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49) |
| LANDING-062 | PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`) |
| LANDING-063 | PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-064 | PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일) |
| LANDING-065 | PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`) |
| LANDING-066 | PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적) |
| LANDING-067 | PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-068 | PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트 | 현행 | 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-069 | 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분 | 현행 | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수), 소유자 답(`reviews/round-16-owner-answers.md:13` 7) |
| LANDING-070 | 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자 | 현행 | 편집자 결정(16라운드 정착 검토 조건 1·6, `09-landing-and-test-strategy.md:19,24`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 17라운드 스웜 수렴(편집자 결정) |
| LANDING-071 | 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:600`) |
| LANDING-072 | PR-7을 더 쪼갤 수 없는 이유 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:601`) |
| LANDING-073 | 정착 조건 1 — 가드 계약 `compileGuard(root, pointer)`, ajv 셋의 동기 경로, 코어의 작성 루트 기준 캐시 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-074 | 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-075 | 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함) | 현행 | 17라운드 스웜 수렴(편집자 결정, 첫째·넷째), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 편집자 결정(16라운드, 다섯째) |
| LANDING-076 | 정착 조건 4 — 상태·오류·명령 사건과 검증 결과의 배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3) |
| LANDING-077 | 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-078 | 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-079 | 정착 조건 7 — 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조 수렴) |
| LANDING-080 | 정착 조건 8 — 훅·바인딩 시험과 React 18 실행 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:11` 5), 편집자 결정(16라운드 정착 검토) |
| LANDING-081 | 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/` | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-082 | 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49·18C-36) |
| LANDING-083 | 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/` | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-084 | 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, 진입 사슬은 `dispatch`가 소유) |
| LANDING-085 | 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/` | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈) |
| LANDING-086 | 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-087 | 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리) |
| LANDING-088 | `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침 | 현행 | 편집자 결정(16라운드 정착 검토), 원리(filid 규칙, 문서가 코드보다 먼저) |
| LANDING-089 | 정착 지도의 '그대로 쓰는 것'은 레거시에서 가져오는 코드의 목록 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식), 편집자 결정(17라운드, `09-landing-and-test-strategy.md:42`) |
| LANDING-090 | 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지 | 현행 | 편집자 결정(16라운드, 테스트 전략), 소유자 답(`reviews/round-16-owner-answers.md:14` 8), 소유자 답(`reviews/round-16-owner-answers.md:10` 4) |
| LANDING-091 | 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11) |
| LANDING-092 | 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙 | 현행 | 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2) |
| LANDING-093 | 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30·18C-74) |
| LANDING-094 | 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(16라운드 정착 검토) |
| LANDING-095 | 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-096 | 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-097 | 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-098 | 05의 이주 행 가운데 08 §14에 행이 없는 것 — `ENHANCED_KEY`, `minItems`·`maxItems`, `Normalize`, `null`→`{}`, 배열 Promise, `setValue(getValue())`, `useEffect` 파생 쓰기 | 분할됨(→ LANDING-115, LANDING-116, LANDING-117, LANDING-118, LANDING-119) | 편집자 결정(6라운드 대조, `05-before-after.md:5`) |
| LANDING-099 | 대체됨 — 폼이 분기를 고르던 05의 행(값 가드·선택 가드·`selection` 칸·분기 하나만 활성) | 대체됨(→ LANDING-004, LANDING-005, LANDING-006, LANDING-028) | 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42,44` 읽기1) |
| LANDING-100 | 대체됨 — `options.trim` 강제 변환은 사라지고 입력 컴포넌트가 맡음 | 대체됨(→ LANDING-047, LANDING-034) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| LANDING-101 | 대체됨 — React 컴포넌트 감지 대신 "있고 `null`이 아니다"만 봄 | 대체됨(→ LANDING-061, LANDING-082) | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1) |
| LANDING-102 | 대체됨 — 분석 단계의 정적 throw 대신 런타임 충돌 보고 | 대체됨(→ ERROR-078, LANDING-061) | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| LANDING-103 | 대체됨 — 쓰기 옵션은 옵션 객체(`{ mode: 'Merge' }`) | 대체됨(→ LANDING-021) | 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행) |
| LANDING-104 | 대체됨 — 정착 상태 `settle`과 예산 | 대체됨(→ LANDING-045) | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| LANDING-105 | 대체됨 — strict 검증기용 `&` 키 제거 유틸리티 | 대체됨(→ LANDING-031, LANDING-033) | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-106 | `refresh(path)`·`remount(path)` 공개 — C-11 확정 대기 | 대체됨(→ EVENT-063) | 편집자 결정(17라운드, 18라운드 안건 §7로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42) |
| LANDING-107 | 대체됨 — 진단 채널 후보(단일 콜백) | 대체됨(→ LANDING-044, LANDING-045) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B) |
| LANDING-108 | 대체됨 — `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption`의 이름과 거취 미결(D-23) | 대체됨(→ LANDING-023, LANDING-008) | 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356,358`), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록) |
| LANDING-109 | 06 §9의 5 이주 안내 항목(C8) — 8라운드가 새로 올린 것 | 현행 | 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)) |
| LANDING-110 | 07 §9의 6 이주 안내 항목(C8) — 9라운드가 더한 것 | 현행(기록) | 편집자 결정(9라운드, `07-conclusions.md:423`) |
| LANDING-111 | 대체됨 — `&if`를 `&active`로 옮길 때 `./x`를 `../x`로 고친다 | 대체됨(→ LANDING-029) | 소유자 답(`reviews/round-15-decisions.md:9` 1) |
| LANDING-112 | 대체됨 — 코드 착수 전에 할 일 넷(9라운드 개발 진입 평가) | 대체됨(→ LANDING-060) | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570` 착수 전 닫을 것) |
| LANDING-113 | 대체됨 — 구현 슬라이스 0–8(두 검토의 순서를 합침) | 대체됨(→ LANDING-060, LANDING-061, LANDING-062, LANDING-063, LANDING-064, LANDING-065, LANDING-066, LANDING-067, LANDING-068) | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:568-578`) |
| LANDING-114 | 대체됨 — 9라운드의 규모 추정(교차 연산을 청사진 병합으로 옮겨 재사용) | 대체됨(→ LANDING-069, LANDING-074) | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`) |
| LANDING-115 | 이주(05) — `ENHANCED_KEY` 마커 주입이 사라지고 활성 조각 기반 `schemaPath` 필터로 | 중복(→ VALIDATE-010) | 원리(`03-mental-model.md:13` P1) |
| LANDING-116 | 이주(05) — `minItems` 채움·`maxItems` 차단은 입력 컴포넌트로, `Normalize` 키 제거와 `null`→`{}`는 폐기 | 중복(→ WRITE-022) | 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16) |
| LANDING-117 | 이주(05) — 배열 연산은 Promise를 돌려주지 않는 동기 API | 중복(→ EVENT-002) | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`) |
| LANDING-118 | 이주(05) — `setValue(getValue())`는 전체 교체라 지운 키에 채움이 다시 들어감 | 대체됨(→ WRITE-090) | 소유자 답(`reviews/round-4.md:113` D-7), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) |
| LANDING-119 | 이주(05) — `useEffect`로 쓴 파생 값은 새 진입이라 키 입력당 `onChange` 2회 | 중복(→ EVENT-036) | 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`) |
| LANDING-120 | 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 들며, 경고 `VALUE_TYPE_MISMATCH`가 생김 | 분할됨(→ LANDING-125, LANDING-126, LANDING-127) | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때) |
| LANDING-121 | PR-8의 reset 문서가 적는 것 — 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기, `dirty` | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty` 현행 유지) |
| LANDING-122 | 정착 검토의 그 밖의 판단 — `extras` 정적 규칙은 조각 표 걸음에서, 유효 스키마 메모는 비트 집합 키(추정) | 현행 | 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:3`) |
| LANDING-123 | 대체됨: 작업은 `feature/schema-form-redesign` 브랜치에 모이고 그 브랜치가 우산 PR — 14라운드에 우산 브랜치는 `refactor/schema-form-internal-architecture` | 대체됨(→ LANDING-051) | 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-124 | 명령 RequestEmitChange·RequestInjection과 공개 훅의 거취 — 미확인 | 현행(기록) | 편집자 결정(18라운드, 원장 토큰 검사가 찾은 미결, `reviews/round-18-agenda.md:151`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86; 명령 둘과 훅 셋에 한정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87; 나머지 공개 표면과 타입별 빈 값) |
| LANDING-125 | 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-126 | 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH` | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`) |
| LANDING-127 | 이주(S1) — 변환 실패 기록은 검증기 유무와 무관하게 보낸다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 보내는 때) |
| LANDING-128 | 이주(18라운드) — 재귀 객체 스키마의 실패가 명시적 청사진 오류 `RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01) |
| LANDING-129 | 이주(18라운드) — 원시 타입 둘 이상의 `type` 배열이 `union` 잎과 문자열 입력으로 선다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-130 | 이주(18라운드) — `['integer','number']`는 수 노드 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-131 | 이주(18라운드) — `dependentSchemas`·`dependencies`를 쓴 스키마에 개발 모드 경고 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03) |
| LANDING-132 | 이주(18라운드) — 조건부 `required`의 필수 표시가 켜진 `then`을 따른다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-06) |
| LANDING-133 | 이주(18라운드) — 같은 값인 객체·배열 `const`끼리의 `allOf`가 통과한다(결함 수정) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08) |
| LANDING-134 | 이주(18라운드) — 여러 `pattern`의 `node.jsonSchema` 표현이 첫 패턴 + `allOf` 항목으로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08) |
| LANDING-135 | 이주(18라운드) — 식의 `*` 조각은 청사진 오류 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| LANDING-136 | 이주(18라운드) — `omitEmpty` 아래에서 `../name === ''` 같은 식은 `undefined`를 본다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| LANDING-137 | 이주(18라운드) — `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| LANDING-138 | 이주(18라운드) — `injectTo` 반환의 `undefined` 항목은 쓰지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) |
| LANDING-139 | 이주(18라운드) — 입력이나 `Merge`로 된 `null` 아래의 자식은 채움 없이 없음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| LANDING-140 | 이주(18라운드) — 입력이 넘긴 `Merge`는 자기 입력을 다시 마운트하지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| LANDING-141 | 이주(18라운드) — `Overwrite`와 `Merge`를 함께 주면 `INVALID_WRITE_OPTION` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| LANDING-142 | 이주(18라운드) — `setValue(undefined)`는 기본값을 다시 채운다 | 대체됨(→ WRITE-090) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| LANDING-143 | 이주(18라운드) — 입력의 `onChange(undefined, Overwrite)`는 기본값을 다시 채운다, 스토리 넷 고침 | 대체됨(→ WRITE-090) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| LANDING-144 | 이주(18라운드) — 로드나 부모가 준 `{}`가 호스트 `default`를 막지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18) |
| LANDING-145 | 이주 44(18라운드 판) — `trim`은 `finishInput` 칸의 자동 쓰기, 바깥 오류·dirty는 그대로, 같은 값이면 쓰지 않음, 흐림 때 다시 마운트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| LANDING-146 | 이주(18라운드) — `batch(fn)` 안의 updater는 이어지고 평범한 읽기는 직전 커밋 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20) |
| LANDING-147 | 이주(18라운드) — 가상 노드의 모양이 틀린 쓰기는 `SchemaFormError`로, 같은 길이 문자열 쪼개기는 거부로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-21) |
| LANDING-148 | 이주(18라운드) — `find`는 꺼진 `oneOf` 변형의 노드를 돌려주지 않는다(`null`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33) |
| LANDING-149 | 이주 47(18라운드 판) — 잎 `terminal: false`·가상 `terminal: true`는 청사진 오류, 가상의 인라인 입력은 `branch`로 `ChildNodeComponents`를 받음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38) |
| LANDING-150 | 착수 항목(18라운드) — parse 문서는 새 자리의 문서로 PR-2, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| LANDING-151 | 착수 항목(18라운드) — 자사 플러그인 수정 목록은 PR-7 이주 항목 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-152 | 이주(18라운드) — `globalState`의 키는 참인 노드가 없으면 내려간다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| LANDING-153 | 이주(18라운드) — `globalState`의 값은 `true` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| LANDING-154 | 이주(18라운드) — 노드의 `key`·`schemaPath`가 없어진다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43) |
| LANDING-155 | 이주(18라운드) — `defaultValue`는 로드를 따르고 배열 아이템은 구조 연산을 따라 자기 값을 지킨다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| LANDING-156 | 이주(18라운드) — `find('@')`·`findAll('@')`는 맥락 노드를 돌려주지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45) |
| LANDING-157 | 이주(18라운드) — `NodeState` → `SchemaNodeState` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| LANDING-158 | 이주(18라운드) — `NodeEventType` → `SchemaNodeEventType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| LANDING-159 | 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49) |
| LANDING-160 | 이주(18라운드) — 수 노드의 근사 같음 비교가 정확한 비교로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-161 | 이주(18라운드) — 객체 같음 비교가 키 순서를 본다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-162 | 이주(18라운드) — 내장 객체·클래스 인스턴스는 참조로 비교 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-163 | 이주(18라운드) — `derived`는 자기 의존 집합에서만 발화 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-164 | 이주(18라운드) — 배열 통째 쓰기가 아이템 키를 잇는다(상태가 위치를 따라감) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| LANDING-165 | 이주(18라운드) — 닫힌 튜플 뒤의 값이 방출된다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| LANDING-166 | 이주(18라운드) — 사용자가 일으킨 `injectTo`가 null 조상을 객체로 만들지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65) |
| LANDING-167 | 이주(18라운드) — 인라인 입력을 둔 가상 노드 아래 경로의 `find`가 참조된 노드를 돌려준다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68) |
| LANDING-168 | 이주(18라운드) — Form 속성의 잠금 동안 입력의 `onChange`는 버려진다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71) |
| LANDING-169 | 이주(18라운드) — 루트 수준 검증 오류의 `dataPath`가 `'/'`에서 `''`로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74) |
| LANDING-170 | 명령 `RequestEmitChange`·`RequestInjection`은 새 설계에 없음(이주 행 없음), 공개 훅 셋 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름·시그니처 유지, `useChildNodeErrors`는 PR-7에 새 통지로 다시 구현 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86), 소유자 답(`reviews/round-18-owner-answers.md:27` 18C 검토 5번; 제거 확인) |
| LANDING-171 | 이주(18라운드) — 빈 중첩 객체·배열 노드의 `outputValue`는 `omitEmpty` 아래에서 `undefined`(오늘 `normalizedValue`는 `{}`·`[]`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87) |
| LANDING-172 | 이주(18라운드) — `['object','string']`·`['object','array']`·`['array','string']`은 터미널 강제 `union`(안쪽 `find` 없음, `{}`·`[]` 방출은 `omitEmpty: false`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-173 | 이주(18라운드) — `type` 배열과 함께 적힌 `nullable:true`는 nullable(오늘 배열 경로가 보지 않음) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-174 | 이주(18라운드) — 형 없는 원시 `anyOf`·`oneOf`(TypeBox·pydantic·zod)는 `union`·원시 잎 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-175 | 이주(18라운드) — 형 없는 칸의 분기가 모두 null 분기이면 nullable null 노드 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-176 | 이주(18라운드) — 형 없는 `{allOf:[{type:'string'}]}`는 string 노드 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-177 | 이주(18라운드) — `['null','null']`은 `UNKNOWN_JSON_SCHEMA`(오늘 nullable null 노드) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-178 | 이주(18라운드) — nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 효과 없음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-179 | 이주(18라운드) — `{type:['string','null'], allOf:[{type:['number','null']}]}`는 nullable null 노드(오늘 `ALL_OF_TYPE_REDEFINITION`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-180 | 이주(18라운드) — `{type:'number', allOf:[{type:['number','string']}]}`는 교집합인 number 노드(오늘 `ALL_OF_TYPE_REDEFINITION`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-181 | 이주(18라운드) — `Hint.type`·`FormTypeInputProps.type`은 `node.type`(정수 노드는 `'number'`), 새 칸 `schemaType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-182 | 이주(18라운드) — `{type:['number','integer']}` 시험은 `{type:'number'}`, 정수만이면 `{schemaType:'integer'}` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-183 | 이주(18라운드) — 함수 시험의 `type === 'integer'` 절은 죽은 조건이라 지움 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-184 | 이주(18라운드) — mui 수 입력 — 빈 칸 `undefined`, 정수 판정 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-185 | 이주(18라운드) — `FormTypeTestObject`의 `type`은 `SchemaNodeType`이나 그 배열, 새 키 `schemaType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-186 | 이주(18라운드) — 시험 객체의 모르는 키는 대조에서 빼고 개발 모드 경고(오늘 `{typo: undefined}`가 우연히 맞음) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-187 | 이주(18라운드) — 코어 기본 입력 정의는 `{type:'union'}` 감싸개를 더해 열한 개 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-188 | 이주(18라운드) — 가드 `isTerminalNode`·`isBranchNode`는 `strategy`를 보고 반환 형에 `UnionNode`가 더해짐 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-189 | 이주(18라운드) — `InferValueType`의 `as const` `type` 배열은 `any`에서 정확한 합 형으로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-190 | 이주(18라운드) — 합 형에 대한 `InferJSONSchema`는 분배되지 않고 `UnionSchema`·`UnionNode` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-191 | 이주(18라운드) — `SchemaNode` 합집합과 `FormTypeRendererProps.type`에 `UnionNode`·`'union'`(망라 `switch`에 `case 'union'`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-192 | 이주(18라운드) — 값을 바꾸는 옵션을 켠 ajv 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`(가칭)를 던짐 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-193 | 이주(18라운드) — 검증기에 넘기는 스키마 사본은 깊은 사본 한 번(오늘 얕음) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-194 | 이주(18라운드) — ajv8에서 union `type`의 `strictTypes` 로그 경고가 없어짐(`allowUnionTypes`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-195 | 이주(18라운드) — 터미널 아래 경로의 검증 에러는 터미널(union) 노드가 받음(오늘 버려짐) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-196 | 이주(18라운드) — 기본 입력의 빈 칸은 `undefined`, 해석할 수 없는 초안은 흐려질 때 되돌림 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-197 | 이주(18라운드) — 터미널 object·array 값 안의 JSON 부정합에 개발 모드 경고 (가칭) `NON_JSON_WHOLE_VALUE` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-198 | union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-199 | 이주(18라운드) — 호출자의 `setValue(V)`는 하위 트리 전체가 아니라 원본이 바뀐 노드만 다시 마운트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-200 | 이주(18라운드) — 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아와도 자식 기본값을 채우지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-201 | 이주(18라운드) — 입력의 `onChange(v, Overwrite)`는 자기 입력을 다시 마운트하지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-202 | 이주(18라운드) — 배열 통째 `setValue`는 남은 아이템을 채우지 않고 뒤쪽의 새 아이템만 채운다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-203 | 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |

## 항목

### LANDING-001 완전한 파괴적 변경 — 모든 패키지가 함께 메이저 버전급으로 올라감(C7)

- 결정:
  > 완전한 파괴적 변경이며 `@canard/schema-form`과 플러그인 패키지 전부가 함께 메이저 버전급 변경으로 올라간다(C7).
- 보충:
  > 소유자(C7): ""스키마폼 관련 모든 버전은 일시에 메이저 버전급 변경을 진행한다." `@canard/schema-form`과 플러그인 패키지 전부가 함께 올라간다" (`00-goals.md:110`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:429#1`(정본), `08-design-a-to-z.md:551`, `00-goals.md:110`
- 닫은 사람: 소유자 답(`00-goals.md:110` C7), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8)
- 라운드: 2
- 까닭: `00-goals.md:110`

### LANDING-002 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0

- 결정:
  > 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0이다(16라운드 소유자 답, 09 §6.2의 열넷째).
- 보충:
  > 소유자(16라운드 추가 확인): ""(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다"" (`reviews/round-16-owner-answers.md:22`)
  > "PR-8의 changeset은 `major`이고(0.16.0 → 1.0.0), 먼저 프리릴리스 모드(`changeset pre enter beta`)로 `fixed` 무리 여덟을 1.0.0-beta.N으로 낸다. 프리릴리스는 `latest`를 건드리지 않도록 dist-tag `beta`로 올린다." (`09-landing-and-test-strategy.md:250`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:429#2`(정본), `08-design-a-to-z.md:562`, `08-design-a-to-z.md:578`, `09-landing-and-test-strategy.md:250,262,278`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호; 원문 재록 `09-landing-and-test-strategy.md:250,278`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:250`

### LANDING-003 릴리스 노트와 이주 프롬프트(`docs/agents`)를 낸다(C8)

- 결정:
  > 릴리스 노트와 이주 프롬프트(`docs/agents` 경로)를 낸다(C8).
- 보충:
  > 소유자(C8): "(1) 릴리즈 노트와 배포 문서 — 수정의 의도와 목표, 기존 사용 방법별 대체 용법. (2) **그 수정을 수행할 수 있는 프롬프트** — 에이전트가 소비자의 맥락에 맞게 고칠 수 있도록." (`00-goals.md:111`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:429#3`(정본), `08-design-a-to-z.md:578`, `06-conclusions.md:429`, `07-conclusions.md:423`, `00-goals.md:111`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8)
- 라운드: 2
- 까닭: `00-goals.md:111`

### LANDING-004 이주 1 — 분기 자동 감지 대신 명시 `controls.discriminator`·분기 안 `if/then/else: false`·`controls.active`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 1 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:433`(정본), `07-conclusions.md:423`, `07-conclusions.md:142`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:142`

### LANDING-005 이주 2 — `oneOfIndex`·`anyOfIndices`·분기 선택 API는 대체물 없이 사라짐

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 2 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:434`(정본), `07-conclusions.md:423`, `07-conclusions.md:142`, `02-target-overview.md:328`
- 닫은 사람: 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42` 읽기1)
- 라운드: 14
- 까닭: `07-conclusions.md:142`

### LANDING-006 이주 3 — `&if`는 `controls.active`로 흡수

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 3 | `&if`(분기의 조건) | `controls.active`로 흡수 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:435`(정본), `07-conclusions.md:312`, `07-conclusions.md:423`, `02-target-overview.md:336`
- 닫은 사람: 편집자 결정(9라운드 이름, `07-conclusions.md:312` 조각 게이트 `&if` 은퇴), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:312`

### LANDING-007 이주 4 — `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 4 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:436`(정본), `02-target-overview.md:335`, `reviews/round-15-decisions.md:13-14`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:14` 6)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`
- 충돌:
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5).
  > `06-conclusions.md:429`의 "`computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5).

### LANDING-008 이주 5 — `&pristine`은 `controls.resetInteraction`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 5 | `&pristine` | `controls.resetInteraction` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:437`(정본), `07-conclusions.md:316`, `07-conclusions.md:423`, `02-target-overview.md:337`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:316`

### LANDING-009 이주 6 — `controls.unsetValue`·`default`·`children`·`discriminator`·`unsetOnInactive` 신설

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 6 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:438`(정본), `02-target-overview.md:338`, `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue`→`unsetValue`), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름)
- 라운드: 14
- 까닭: `07-conclusions.md:304-318`

### LANDING-010 이주 7 — `allOf` 항목 안의 `if/then/else`가 병합된다

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 7 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:439`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(9라운드 병합표, `07-conclusions.md:168` 4.27)
- 라운드: 14
- 까닭: `07-conclusions.md:168`

### LANDING-011 이주 8 — 분기 전환 때 이미 있던 노드는 다시 채우지 않음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 8 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:440`(정본), `07-conclusions.md:109`, `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점 A), 편집자 결정(9라운드, `07-conclusions.md:109` 4.22)
- 라운드: 14
- 까닭: `07-conclusions.md:109-110`

### LANDING-012 이주 9 — 표준 `readOnly`와 `&readOnly`는 택일에서 OR로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 9 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:441`(정본), `07-conclusions.md:158`, `07-conclusions.md:423`, `07-conclusions.md:475`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-013 이주 10 — `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승에서 OR로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 10 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:442`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-014 이주 11 — 공개 문서의 `derived` 레벨 약속은 에지로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 11 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:443`(정본), `07-conclusions.md:276`, `06-conclusions.md:429`, `07-conclusions.md:423`
- 닫은 사람: 편집자 결정(9라운드 도출, `07-conclusions.md:276` 06의 5.2 D-11′는 에지)
- 라운드: 14
- 까닭: `07-conclusions.md:276`

### LANDING-015 이주 12 — 루트 키 다섯의 특수 처리와 README "Priority System"이 사라지고 전체 잠금은 Form 속성

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 12 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:444`(정본), `07-conclusions.md:423`, `07-conclusions.md:475`, `02-target-overview.md:340`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-016 이주 13 — 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김)은 OR로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 13 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:445`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-017 이주 14 — 맨 키 `disabled`·`visible`·`active`는 `controls.*`로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 14 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:446`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### LANDING-018 이주 15 — 조각이 꺼져도 원본은 기본 유지, 비움은 `unsetOnInactive`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 15 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:447`(정본), `07-conclusions.md:423`, `08-design-a-to-z.md:305`, `02-target-overview.md:355`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:305`

### LANDING-019 이주 16 — `virtual`의 `required` 재작성을 하지 않음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 16 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:448`(정본), `05-before-after.md:155`, `05-before-after.md:202`
- 닫은 사람: 편집자 결정(5라운드 ADR 0011 4차, `05-before-after.md:155` 근거 `adr/0011:67,71`)
- 라운드: 14
- 까닭: `05-before-after.md:155`

### LANDING-020 이주 17 — `find`·`findNodes`는 터미널 아래 경로에 노드를 돌려주지 않음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 17 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:449`(정본), `06-conclusions.md:170`, `06-conclusions.md:176`, `06-conclusions.md:429`
- 닫은 사람: 편집자 결정(7라운드 축 수렴 D-21, `06-conclusions.md:170` 4.8)
- 라운드: 14
- 까닭: `06-conclusions.md:170`

### LANDING-021 이주 18 — 10비트 `SetValueOption`은 비트 넷

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 18 | 10비트 `SetValueOption` | 비트 넷 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:450`(정본), `07-conclusions.md:345`, `02-target-overview.md:339,353`
- 닫은 사람: 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행)
- 라운드: 14
- 까닭: `07-conclusions.md:345`

### LANDING-022 이주 19 — 루트 `onChange` 디바운스 대신 최외곽 동기 진입당 1회

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 19 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 |
- 보충:
  > 편집자 결정(18C-84): "【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다." (`reviews/round-18-closing.md:2227`)
  > 편집자 결정(18C-84): "【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022 이주 19와 짝)." (`reviews/round-18-closing.md:2228`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:451`(정본), `05-before-after.md:158,174,201`, `reviews/round-18-closing.md:2227-2228`
- 닫은 사람: 소유자 답(`reviews/round-4.md:116` D-10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84)
- 라운드: 18
- 까닭: `reviews/round-4.md:153`, `reviews/round-18-closing.md:2231-2231`

### LANDING-023 이주 20 — `normalizedValue`는 `outputValue`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 20 | `normalizedValue` | `outputValue` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:452`(정본), `06-conclusions.md:356`, `06-conclusions.md:429`, `07-conclusions.md:347`
- 닫은 사람: 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356`; 9라운드 판정 그대로, `07-conclusions.md:347`)
- 라운드: 14
- 까닭: `06-conclusions.md:356`

### LANDING-024 이주 21 — 인터페이스 `JSONSchemaError`는 `ValidationIssue`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 21 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:453`(정본), `08-design-a-to-z.md:599`, `adr/0014-error-policy.md:321`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:453`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:599`

### LANDING-025 이주 22 — 무한 루프·검증기 실패·바운더리·검증기 없음의 새 동작

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 22 | `INFINITE_LOOP_DETECTED`는 배치 도중 throw해 커밋을 남기지 않음. 검증기 컴파일 실패는 `console.error` + 노드 오류. `Form`의 자기 바운더리가 마운트 오류를 삼킴. 검증기 없이도 조용히 동작 | 원본 B를 커밋·통지한 뒤 사슬의 끝에서 모든 환경에서 throw(R17-1 나). 전체 스키마 컴파일 실패는 검증 불가, 가드 컴파일 실패는 그 게이트의 가드 실패, 요청 시점 실패는 `validate()`의 거부. 루트 바운더리는 다시 던지지 않고 가두어 `onError`와 주인 없는 오류 싱크로 보고한다. 검증기가 없어도 폼은 서며 `if` 게이트의 조각은 꺼진 채 경고를 낸다. 검증기가 없으면 거부하지 않고 개발 모드 콘솔과 `onError`의 경고 기록으로 트리마다 한 번 알리며, 검증기는 있으나 전체 스키마 컴파일이 실패하면 검증 모드가 `None`이 아닐 때 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(소유자 통보 3 답, R17-1 나, 17라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:454`(정본), `adr/0014-error-policy.md:321`, `02-target-overview.md:332`, `05-before-after.md:159`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:454`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:14`

### LANDING-026 이주 23 — 조건부 폼 생성 시 `compileGuard` 컴파일 비용이 생김

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 23 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) |
- 보충:
  > "조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(ADR 0009)." (`adr/0004-validator-plugin-compile-guard.md:79`)
  > "AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)." (`adr/0004-validator-plugin-compile-guard.md:46`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:455`(정본), `adr/0004-validator-plugin-compile-guard.md:46,79`, `07-conclusions.md:452,474`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:455`)
- 라운드: 14
- 까닭: `07-conclusions.md:474`

### LANDING-027 이주 24 — `then`·`else`의 `required`로 켜고 끄던 필드는 `then.properties`나 `controls.active`로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 24 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:456`(정본), `07-conclusions.md:423`, `05-before-after.md:194`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:21` 축3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:423`

### LANDING-028 이주 25 — 조건도 판별식도 없는 `oneOf`·`anyOf`는 모든 분기가 켜짐

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 25 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:457`(정본), `07-conclusions.md:423`, `07-conclusions.md:472`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:44` 읽기1 이어서), 편집자 결정(9라운드, `07-conclusions.md:142` 4.25)
- 라운드: 14
- 까닭: `07-conclusions.md:142`

### LANDING-029 이주 26 — 식의 기준점은 호스트로 바뀌지 않고 `controls.children`으로 옮길 때만 고침

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 26 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 |
- 보충:
  > 15라운드 결정 1: "자식에 적던 식을 `children`으로 옮기면 `../x`를 `./x`로 고친다. 08 §14 이주 항목 26(`&if` 기준점 변경)은 사라진다" (`reviews/round-15-decisions.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:458`(정본), `reviews/round-15-decisions.md:9`, `05-before-after.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:9`

### LANDING-030 이주 27 — `injectTo` 순환 자동 차단은 없고 예산이 잡음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 27 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(ADR 0010) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:459`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환)
- 라운드: 14
- 까닭: `reviews/round-10-owner-answers.md:10`

### LANDING-031 이주 28 — 검증기 앞 제거는 키워드 위치의 그룹 객체 셋

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 28 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(§3.4). strict 검증기에는 동작 변화 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:460`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-032 이주 29 — 꺼졌다 켜질 때 복원·`oneOf` 전환 잇기 대신 원본 유지와 노드 공유

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 29 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:461`(정본), `05-before-after.md:154`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(노드 공유, `05-before-after.md:154` 근거 `adr/0005:103`)
- 라운드: 15
- 까닭: `05-before-after.md:154`

### LANDING-033 이주 30 — 평면 `&키` 축약은 사라지고 제어 키는 `controls` 안에만

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 30 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:462`(정본), `02-target-overview.md:335`, `05-before-after.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### LANDING-034 이주 31 — 맨 폼 전용 키는 `options.*`·`presentation`으로, `options.trim`은 적용 자리만 바뀜

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 31 | 맨 키 `terminal`·`virtual`·`propertyKeys`, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`, `options.trim`, `options`의 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation`의 다섯 키, 자유 칸. `options.trim`은 `options`에 그대로 두고 적용 자리만 바뀐다(§14의 44행, 17라운드 소유자 답 R17-3) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:463`(정본), `05-before-after.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-035 이주 32 — 렌더러 키·Form 속성·prop `FormTypeRenderer`의 이름 변경

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 32 | 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. Form 속성 `CustomFormTypeRenderer`는 `FormTypeGroupRenderer`가 되고 같은 이름의 Form 속성 `FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`가 새로 생긴다. `ChildNodeComponentProps`와 `FormGroupProps`의 공개 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록)도 `FormTypeGroupRenderer`로 바꾼다. `FormInputProps`·`FormRenderProps`도 `ChildNodeComponentProps`와 교차하므로 같은 이름 변경을 받는다(17라운드 스웜 수렴(편집자 결정), 사실 정정). 합성 API `Form.*`의 이름과 `…Props` 형 이름은 그대로(그 안의 prop `FormTypeRenderer`는 위대로 바뀐다) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:464`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8 렌더 계층 이름 매핑), 17라운드 스웜 수렴(편집자 결정, 사실 정정)
- 라운드: 17
- 까닭: `reviews/round-15-decisions.md:21`

### LANDING-036 이주 33 — Form 속성 `validatorFactory`는 `{ compile, compileGuard }` 객체

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 33 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(§11) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:465`(정본), `08-design-a-to-z.md:574`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:19`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-037 이주 34 — 검증기 플러그인 계약에 `compileGuard(root, pointer)`와 `rejectedKey`가 더해짐

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 34 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:466`(정본), `09-landing-and-test-strategy.md:19`, `05-before-after.md:176`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 1, `09-landing-and-test-strategy.md:19`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-038 이주 35 — `node.jsonSchema`는 켜진 조각을 병합한 유효 스키마

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 35 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(§4·§7·§9) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:467`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(16라운드, `08-design-a-to-z.md:467`)
- 라운드: 16
- 까닭: `reviews/round-9-spec.md:23`

### LANDING-039 이주 36 — `FormHandle.reset`은 로드이며 같은 스키마면 트리를 남기고 다르면 호출 안에서 재생성

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 36 | `FormHandle.reset`은 `<Form>` 안의 `RootNodeContextProvider` 아래를 다시 마운트하고(`showError`·첨부 파일 맵 인스턴스·provider는 남고 맵의 내용은 비운다) 그때 새 `jsonSchema`·`defaultValue` prop을 반영 | 로드다(09 §2.6, 16라운드 스웜 수렴(편집자 결정)). 같은 스키마(같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 함수·컴포넌트 칸이 참조로 같음)면 루트의 로드 한 번이고 트리·캐시·노드 참조가 남는다. 다르면 reset 호출 안에서 트리와 캐시를 새로 만들고(비용은 `<Form key>`의 재생성과 같다) 돌아오기 전에 핸들을 새 트리로 바꾼다. 값은 호출 시점에 커밋된 prop이며, 같은 처리기에서 prop을 바꾼 reset은 그 커밋에서 한 번 더 반영한다(끝에서 새 prop이 반영된다. 그 경로에서는 `onChange`가 두 번이고, `startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려진다). 입력은 자식 프록시를 그리지 않는 입력만 다시 마운트하고(오늘은 provider 아래 전부), 대체된 입력의 늦은 쓰기는 버린다. 어느 경로든 `showError`는 prop 값으로 돌아가고(오늘은 유지), `onStateChange`는 상태가 바뀐 때만 내며, 검증 결과는 비운 뒤 `OnChange` 비트가 켜져 있을 때만 한 번 검증한다(오늘은 모드와 무관하게 늘). `onChange`는 방출 값의 참조가 바뀐 때만 낸다(오늘은 늘 낸다). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(오늘은 reset마다 `clone`해 다시 읽는다). 노드 참조가 reset을 넘어 이어지는 것은 같은 스키마일 때뿐이다. `FormHandle.reset(option?)`은 억제 비트 둘만 받는다 |
- 보충:
  > 소유자(16라운드 답 2): ""기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요. 불필요한 캐시 리빌드를 원하진 않습니다만, 사용자가 key를 사용한 리셋보다 효율적이고 안전한 방법을 얻길 바라긴 합니다"" (`reviews/round-16-owner-answers.md:8`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:468`(정본), `09-landing-and-test-strategy.md:71`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:8` 2), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:71`

### LANDING-040 이주 37 — 플러그인의 `options.*` 자유 키와 맨 표현 키는 `presentation.*`로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 37 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:469`(정본), `08-design-a-to-z.md:599`, `09-landing-and-test-strategy.md:24`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7)
- 라운드: 17
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-041 이주 38 — 로드 뒤 검증은 `OnChange` 비트일 때만 한 번

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 38 | 마운트 때 검증 모드와 무관하게 한 번 검증한다(`Form.tsx:139`) | 로드(마운트·reset) 뒤의 검증은 `ValidationMode`의 `OnChange` 비트가 켜져 있을 때만 한 번이다. `OnRequest`만 켠 폼은 마운트 때 검증하지 않는다(09 §2.6의 아홉째, 16라운드 스웜 수렴(편집자 결정)). 마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 규칙은 "로드 뒤 `OnChange` 비트면 한 번"이다. core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다(§11.2, 17라운드 스웜 수렴(편집자 결정)) |
- 보충:
  > 편집자 결정(18C-101): "【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`reviews/round-18-closing.md:2848`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:470`(정본), `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2848`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 아홉째), 17라운드 스웜 수렴(편집자 결정, core만 쓰는 호스트의 마운트 검증), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2853-2855`

### LANDING-042 이주 39 — 호출자의 전체 교체 `setValue(V)`는 reset과 같은 입력 판정

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 39 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | reset과 같은 입력 판정이다. 자식 프록시를 그리지 않는 입력만 다시 마운트하고(값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 다시 마운트된다), 대체된 입력의 늦은 쓰기는 버린다(09 §2.6의 열넷째, 16라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:471`(정본), `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2730-2731`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 열넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2734-2736`
- 충돌:
  > `08-design-a-to-z.md:471`의 "reset과 같은 입력 판정이다"는 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).

### LANDING-043 이주 40 — 공개 `node.group`은 `node.strategy`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 40 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 |
- 보충:
  > "이름 규칙을 오늘의 공개 이름에 적용할지. 공개 index가 내보내는 `Node`로 줄인 이름(형 `ArrayNode` 등 일곱, `NodeState`, `NodeEventType`, 가드 `is…Node`)을 `SchemaNode` 접두로 바꿀지와 08 §14의 이주 행" (`reviews/round-18-agenda.md:91`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:472`(정본), `08-design-a-to-z.md:577`, `09-landing-and-test-strategy.md:261`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:22`

### LANDING-044 이주 41 — Form 속성 `onError` 신설, 오류·경고 코드 목록이 공개 계약

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 41 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(4번 안 B, §11.3, ADR 0014 §3). 오류·경고 코드 목록이 공개 계약이 된다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:473`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### LANDING-045 이주 42 — `diagnostics`는 `'stable'`·`'degraded'`, 다음 로드까지 남고 그 동안 제출 거부

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 42 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | `status`는 `'stable'` 또는 `'degraded'`, 원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋, `commit`. 다음 로드까지 남고 그 동안 폼의 제출 경로가 거부한다(R17-1 나, §12) |
- 보충:
  > 편집자 결정(18C-98): "【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다." (`reviews/round-18-closing.md:2797`)
  > 편집자 결정(18C-98): "【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다." (`reviews/round-18-closing.md:2798`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:474`(정본), `02-target-overview.md:332`, `reviews/round-18-closing.md:2797-2798`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:9`

### LANDING-046 이주 43 — 바운더리는 가두고 대체 화면을 그린 뒤 다시 던지지 않고 보고

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 43 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(§12). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:475`(정본), `08-design-a-to-z.md:599`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:34` (나))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### LANDING-047 이주 44 — `trim`은 포커스 아웃 때 `finishInput` 칸이 자르고 입력 출처 쓰기로 다룸

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 44 | `options.trim: true`이면 `StringNode`가 내부 사건 `Blurred`를 구독해 흐림 때 원본을 잘린 값으로 덮는다(`StringNode.ts:118-122`) | 포커스 아웃 때 자르는 동작은 같다. 판단은 문자열 동작 행의 `finishInput` 칸이 하고 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다. 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 현재 값과 같으면 쓰지 않는다(17라운드 소유자 답 R17-3, §3.3). 이 쓰기가 바깥 오류를 지우고 dirty를 표시하는지는 18라운드 안건이다 |
- 보충:
  > "이 쓰기가 오늘 `handleChange`처럼 바깥 오류를 지우고 dirty를 표시하는지가 남았다(오늘의 `trim`은 둘 다 하지 않는다)" (`reviews/round-18-agenda.md:45`)
- 상태: 대체됨(→ LANDING-145)
- 출처: `08-design-a-to-z.md:476`(정본), `08-design-a-to-z.md:577`, `09-landing-and-test-strategy.md:261`, `reviews/round-18-closing.md:582-597`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:11`, `reviews/round-18-closing.md:599-603`

### LANDING-048 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 45 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경) |
- 보충:
  > "이름 규칙을 오늘의 공개 이름에 적용할지. 공개 index가 내보내는 `Node`로 줄인 이름(형 `ArrayNode` 등 일곱, `NodeState`, `NodeEventType`, 가드 `is…Node`)을 `SchemaNode` 접두로 바꿀지와 08 §14의 이주 행" (`reviews/round-18-agenda.md:91`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:477`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:22`

### LANDING-049 이주 46 — 노드 메서드 `findAll`은 `findNodes`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 46 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:478`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, 노드 구조)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:478`

### LANDING-050 이주 47 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 인라인 입력)의 처리와 이주

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 47 | 잎의 `options.terminal: false`는 `'branch'`가 되어 `FormGroupRenderer`가 fieldset으로 그리고, 가상의 `options.terminal: true`와 인라인 `FormTypeInput`은 `'terminal'`이 되어 자식 구성 요소를 비운다 | `BEHAVIORS[type][strategy]`에 행이 없는 조합이다. 처리와 이주는 18라운드 안건이다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-149)
- 출처: `08-design-a-to-z.md:479`(정본), `reviews/round-18-agenda.md:78`, `reviews/round-18-closing.md:1029-1038`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 N14로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:78`, `reviews/round-18-closing.md:1040-1047`

### LANDING-051 배포는 한 번, 개발은 우산 브랜치 안의 PR 아홉으로 나눔

- 결정:
  > - **배포는 한 번, 개발은 나눈다.** 모든 패키지가 함께 메이저 버전급으로 올라가고(C7) 호환 계층을 두지 않으므로(00-goals 비목표), `master`로의 병합은 우산 브랜치(`refactor/schema-form-internal-architecture`) 하나가 한 번에 한다. 그 안에서는 PR 아홉으로 나누며, 각 PR은 새 코드와 그 테스트만으로 독립 검증된다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:551`(정본), `00-goals.md:128#4`
- 닫은 사람: 소유자 답(`00-goals.md:110` C7), 편집자 결정(14라운드, `08-design-a-to-z.md:551`)
- 라운드: 16
- 까닭: `08-design-a-to-z.md:551`
- 충돌:
  > `00-goals.md:128`의 "작업은 `feature/schema-form-redesign` 브랜치에 모이고, 이 브랜치가 여러 작업을 병합받는 우산 PR이 된다."는 정본과 다르다(브랜치 이름). 정본이 이긴다(`08-design-a-to-z.md:551`, 뒤 라운드가 앞 라운드를 이긴다).

### LANDING-052 전환 방식 — 옛 코드는 레거시로 옮기고 새로 쓰며 옛 이름과의 중복은 기준이 아님

- 결정:
  > **옛 코드는 레거시로 옮기고 새로 쓴다(17라운드 소유자 답).** PR마다 대상 영역의 옛 코드를 레거시 디렉토리로 옮기고 새 코드를 쓴다. 쓸 만한 코드와 함수는 가져오고 나머지는 버린다. 옛 이름과의 중복은 기준이 아니다(소유자: "그러니 이름 중복은 걱정하지 않아도 됩니다").
- 보충:
  > 소유자(17라운드 전환 방식): ""1. 전환은, 대상 영역 코드를 레거시 디렉토리로 옮기고, 작성을 하려고 합니다. 쓸만한 코드와 함수는 가져오고, 버릴건 버리면서요. 그러니 이름 중복은 걱정하지 않아도 됩니다."" (`reviews/round-17-owner-answers.md:52`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:552`(정본, 첫째–넷째 문장), `09-landing-and-test-strategy.md:42`, `reviews/round-18-agenda.md:96`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:52`

### LANDING-053 새 엔진은 전환 PR 전까지 `<Form>`에 닿지 않고 점진 교체는 하지 않음

- 결정:
  > 새 엔진은 전환 PR 전까지 `<Form>`과 `nodeFromJSONSchema`에 닿지 않으며, 옛 코드와 새 코드는 상태 소유 방식이 달라 한 트리 안에서 공존할 수 없으므로(antigravity 검토와 같은 판단) 점진 교체는 하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:552#5`(정본), `08-design-a-to-z.md:600-601`
- 닫은 사람: 편집자 결정(17라운드, `08-design-a-to-z.md:552` antigravity 검토와 같은 판단)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:601`

### LANDING-054 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법

- 결정:
  > 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법은 18라운드 안건이다(§15).
- 보충:
  > "레거시 디렉토리의 이름과 자리(패키지 안의 어디에, 어떤 이름으로, 빌드와 공개 진입점에서 어떻게 빼는가)" (`reviews/round-18-agenda.md:100`)
  > "옮기는 동안 기존 시험과 스토리북을 돌리는 방법(옛 시험이 레거시 디렉토리를 따라가는가, 09 §4.3의 234파일 처분과 §5.4의 옛 스토리 처분과 어떻게 맞추는가)" (`reviews/round-18-agenda.md:101`)
- 상태: 대체됨(→ LANDING-159)
- 출처: `08-design-a-to-z.md:552#6`(정본), `09-landing-and-test-strategy.md:42`, `reviews/round-18-agenda.md:100-101`, `reviews/round-18-closing.md:1330-1363`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 §8로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:52`, `reviews/round-18-closing.md:1365-1368`

### LANDING-055 문서가 코드보다 먼저 바뀜 — 각 PR은 새 fractal의 INTENT·DETAIL로 시작, 이름은 책임으로

- 결정:
  > **문서가 코드보다 먼저 바뀐다**(filid 규칙). 각 PR은 새 fractal의 `INTENT.md`·`DETAIL.md`로 시작한다. 이름은 책임을 말하는 것으로 짓는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:553`(정본, 첫째–셋째 문장), `09-landing-and-test-strategy.md:40`
- 닫은 사람: 원리(filid 규칙, 저장소 `.claude/rules/filid_code-placement.md` §5), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름, 책임별로 나눔)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:26`

### LANDING-056 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸

- 결정:
  > 새 core의 자리와 이름은 17라운드에 정했다(소유자 확정, 구조와 규칙은 09 §3).
  > - `src/core/blueprint/`(PR-1): 청사진.
  > - `src/core/record/`: 레코드. `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형.
  > - `src/core/behaviors/`: 표 `BEHAVIORS`(`BEHAVIORS[type][strategy]`)와 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`. `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`를 둔다.
  > - `src/core/navigation/`: `find`·`findNodes`와 트리 걷기.
  > - `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`.
  > - `src/core/SchemaNode/`: 공개 겉면, 클래스 `SchemaNode`.
  > - 행의 칸은 `interpret`(입력 해석), `assemble`(합성), `project`(투영), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려준다. 생성은 `settle`이 런타임의 `nodeFactory`로 한다. 행은 계산만 한다), `type`, `strategy`이고, 종류별 데이터 칸은 `structure`다. 노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리키고, 모듈 수준 생성 함수는 `schemaNodeFactory`다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:553-560`(정본, 553은 넷째 문장), `09-landing-and-test-strategy.md:32-38`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:38`
- 충돌:
  > `08-design-a-to-z.md:556`의 "`stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`"는 18라운드 결정과 다르다: 종류 모듈 목록에 (가칭) `unionBehavior/`가 더해진다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:80`).

### LANDING-057 겉면 규칙과 behaviors 규칙

- 결정:
  > - 겉면 규칙: 클래스는 필드·게터·문장 하나짜리 위임만 두며 분기·반복·종류 비교를 두지 않고 노드마다 할당하지 않는다. 멤버 목록은 시험으로 고정하고, 여러 단계의 조율은 `dispatch`의 동사별 진입이 맡는다. behaviors 규칙: 종류마다 fractal, 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 두고, 행은 칸을 모두 같은 순서로 갖는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:561`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, 노드 구조 스웜 정련; `reviews/round-17-owner-answers.md:25` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:25`

### LANDING-058 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐

- 결정:
  > **원샷이어야 하는 것은 둘뿐이다.** 전환 PR(PR-7)과 `master` 병합(릴리스). 나머지는 독립이다. 전체를 원샷으로 진행할 필요는 없다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:562`(정본, 첫째–넷째 문장), `08-design-a-to-z.md:593`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:562`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:601`

### LANDING-059 릴리스는 `master` 병합 뒤의 배포이며 판 올림 PR 병합이 시험 관문을 거쳐 자동 배포

- 결정:
  > 릴리스는 `master` 병합 뒤의 배포이며, 판 올림 PR을 병합하면 배포 작업 흐름이 시험 관문을 거쳐 자동으로 배포한다(09 §6.2의 일곱째, 16라운드 스웜 수렴(편집자 결정)).
- 보충:
  > 소유자(16라운드 답 9): ""정해지지 않았습니다. changeSet 을 사용한 표준 방법으로 바꾸고자 합니다. 릴리즈 테스트도 다시 작성해야 합니다. 지금 구조는 github actions를 보세요"" (`reviews/round-16-owner-answers.md:15`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:562#5`(정본), `08-design-a-to-z.md:593`, `09-landing-and-test-strategy.md:225`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2의 일곱째)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-060 PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-0 문서 | 이 문서, 14라운드 기록, ADR 최종 상태, HANDOFF. 프로토타입 v7(게이트 입력의 `extras` 정적 규칙, 같은 순위 동점·정착 단위 순위, 나감 에지, 전이 라운드 상한, 재계산 목록만 순회). 시나리오 패키지 `@aileron/schema-form-scenarios`의 뼈대, vitest `test.projects` 셋, addon-vitest(09 §7) | 없음 | 소유자의 O-1 – O-11 답, 이 문서의 절 단위 통과, 18라운드 정련(`reviews/round-18-agenda.md`) |
- 보충:
  > 편집자 결정(18C-49): "【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다." (`reviews/round-18-closing.md:1359`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:570`(정본), `09-landing-and-test-strategy.md:256`, `reviews/round-18-closing.md:1359`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:570`, `reviews/round-18-closing.md:1365-1368`

### LANDING-061 PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-1 청사진 | 순수 함수 `blueprint`: 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(§9 병합표는 새로 쓴다. 렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자(배열 교체, 원자 판정, 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사. 인자가 없으면 오늘 동작, changeset `minor`)로 쓴다(17라운드 스웜 수렴(편집자 결정)). 오늘의 교차 연산은 먼저 승·얕은 덮어쓰기·무조건 throw라 §9와 다르므로 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`intersectPattern`·`validateRange`를 청사진 밖의 새 fractal로 옮겨(청사진 안에 두면 그것을 가져가는 옛 `helpers/jsonSchema`와 서로 가져오는 고리가 될 수 있다. 이름은 PR-1이 정한다) 이름으로 내보내되, `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. throw는 청사진이 정적 연언을 교차할 때만 한다(§9). 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다(레거시로 옮긴 옛 코드가 PR-7까지 도는 방법은 18라운드 안건 '전환 방식의 세부'이며 이 문장은 그 안건의 한 안이다, §15)), 검증기 앞 제거 규칙 하나, `controls`의 식 컴파일(오늘의 컴파일러 `createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형은 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고(filid 배치 규칙 §1), `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행(`eval`, `new Function`)을 금한다. PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고친다. 16라운드 편집자 결정, 답 10으로 확정)과 역의존 표, 청사진 오류·경고(선언 사이 `options.terminal`·렌더 계층 판정·`controls.discriminator` 불일치, `controls`·`options`의 모르는 키. 터미널 전략은 `options.terminal` → 렌더 계층이 인자로 넘긴 판정 함수 → `type`의 순서로 정하며 청사진은 `presentation`을 읽지 않는다, 17라운드 스웜 수렴(편집자 결정)), `controls.watch` 의존의 합집합, `options`의 닫힌 목록(`trim` 포함), 정적 `controls.injectTo` 대상 없음의 청사진 오류(R17-1 나), 청사진 오류·경고의 데이터화(수집기 인자로 코드·`schemaPath`·세부·판별 칸을 모으며 소비자가 없으면 모으지 않는다. 캐시 청사진의 늦은 경고 수집은 작성 루트마다 한 번, 17라운드 스웜 수렴(편집자 결정)). 테이블 테스트 | 없음 | 18라운드 안건 A(`$ref` 재귀, 다중 `type`, `dependentSchemas`·`patternProperties` 등)와 B(식 언어 명세), 전환 방식의 세부(레거시 디렉토리의 이름과 자리), 노드 구조 N14(행이 없는 조합, 청사진의 전략 결정)(§15) |
- 보충:
  > 편집자 결정(18C-02): "【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다)." (`reviews/round-18-closing.md:78`)
  > 편집자 결정(18C-49): "【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다." (`reviews/round-18-closing.md:1338`)
  > 편집자 결정(18C-49): "【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)." (`reviews/round-18-closing.md:1339`)
  > 편집자 결정(18C-49): "【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다." (`reviews/round-18-closing.md:1352`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:571`(정본), `09-landing-and-test-strategy.md:20,32,257`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-closing.md:78,193,196,1338-1339,1352`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`, `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:203-207`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:571`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`).
  > `08-design-a-to-z.md:571`의 "`intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`intersectPattern`·`validateRange`를 청사진 밖의 새 fractal로 옮겨"는 18라운드 결정과 다르다: `intersectPattern`은 새 fractal로 옮기지 않는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:193`).

### LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-2 노드 트리와 정착 | 노드: 상속 없는 단일 클래스 `SchemaNode`(`src/core/SchemaNode/`)와 `BEHAVIORS[type][strategy]`의 동작 행(잎 넷·객체·터미널 객체·가상. 터미널 배열은 PR-5), `src/core/record/`·`src/core/behaviors/`·`src/core/navigation/`, 공개 `type`·`strategy` 게터와 `active` 게터(노드 게이트), 겉면 규칙의 기계 검사(파일 한정 린트, 멤버 목록 시험, 행 칸 순서 시험). `raw`·`extras`, 표시·계산(호스트 바퀴, 노드 게이트, 투영)·전이(채움, 나감 비움 네 층과 하위 트리·잠복 자손으로 내려가는 정책, R17-2 ㄴ)·커밋, 예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기이며 중간 라운드 채움의 철회보다 먼저 적용한다), `diagnostics`(`'stable'` 또는 `'degraded'`, `cause`, `commit`, R17-1 나), `SetValueOption`, 게이트는 술어 인터페이스 뒤의 스텁. 정착 루프 테스트(프로토타입 회귀 이식) | PR-1 | 18라운드 안건 B·C·D(`controls.active` 식의 다른 호스트 읽기 순서, 비객체 V의 `Merge`, 되먹임 거부 표면, 프로토타입 v7)와 노드 구조(N2, N5, N6, N14, 공개 표면의 크기, `ContextNode`의 자리)(§15) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:572`(정본), `09-landing-and-test-strategy.md:23,33,258`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:23`
- 충돌:
  > `08-design-a-to-z.md:572`의 "잎 넷·객체·터미널 객체·가상"는 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).

### LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-3 파생 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록 | PR-2 | 에지의 값 동등 판정, `controls.derived` 의존 집합, 조각 `controls` 식의 나감 발화 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:573`(정본), `09-landing-and-test-strategy.md:34`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `08-design-a-to-z.md:573`

### LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-4 통지와 검증 | 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, `onError` 로깅 채널의 core 쪽(기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭), core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제, 정착 경고 판정의 소비자 조건, `ValidateFunction` 문서 주석 "판정은 돌려주고 던지지 않는다". `ValidationIssue` 개명이 `onError`의 공개보다 먼저 선다, 17라운드 스웜 수렴(편집자 결정)), 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김, `SchemaFormError`의 집계 오류(`details.errors`), 주인 없는 오류 싱크, 검증 실행 실패와 검증 불가의 드러남, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일(어느 환경이든 실패는 그 게이트의 가드 실패)(ADR 0014, 17라운드 스웜 수렴(편집자 결정)), `UpdateDiagnostics`, 커밋 번호 스탬프 검증과 실행 합치기, 검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현, 에러 라우팅, 오류 클래스(`ValidationIssue`), 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기), 같은 `$id` 루트의 중복 등록 처리, 상태·오류·명령 사건과 검증 결과의 배달 경로(09 §2.4, 16라운드 답 3), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(09 §2.6의 여덟째, 16라운드 스웜 수렴(편집자 결정)) | PR-2 (PR-3과 병렬) | `compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import의 분리(검증기 주입 경로, §15) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:574`(정본), `09-landing-and-test-strategy.md:19,22,35,259`, `adr/0014-error-policy.md:178-184`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-5 배열 | 배열·터미널 배열 행(`arrayBehavior/`의 `branch/`·`terminal/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, `push`·`remove`·`update`, 통째 교체의 identity, 아이템 채움 | PR-2 (PR-3·4와 병렬) | 배열 아이템의 생김과 채움, `contains` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:575`(정본), `09-landing-and-test-strategy.md:36,260`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:575`

### LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-6 상태 키와 제어 | `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`) | PR-3 | `controls.children` 세부. 조각에 따라 터미널 전략이 바뀌는 경로는 17라운드 스웜 수렴(편집자 결정)으로 닫혔다(선언 사이 정적, §9) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:576`(정본), `09-landing-and-test-strategy.md:37`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:576`

### LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-7 전환 | `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`), 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(§11.3), 루트·필드 바운더리의 가두고 보고하기(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째), `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로)와 검증 불가의 거부(R17-1 나), 터미널 전략과 병합의 원자(렌더 계층의 터미널 판정 함수와 원자 판정 함수를 청사진에 넘김, §9·§12), 명령, 레거시로 옮긴 옛 `core/nodes`·`parsers`·매니저·전처리 삭제, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로, `node.group` → `node.strategy`의 소비자 이주(§14의 40행), 렌더 시나리오 438건의 처분(09 §4.3. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7), UI 플러그인 넷의 타입과 등록 키 대응, UI 플러그인 27파일의 `presentation.*` 이주, `SchemaNodeInput`의 흐림 처리에서 `Blurred` 발행을 입력 마침 신호 `finishInput`으로 바꿈(`options.trim`은 문자열 행의 `finishInput` 칸이 판단, R17-3), `ChildNodeComponentProps`·`FormGroupProps`의 prop `FormTypeRenderer` → `FormTypeGroupRenderer`, `SchemaNodeInput.handleChange`의 세 진입(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로 묶기, 입력 출처 표식(Refresh 판정과 폐기된 노드의 늦은 입력 쓰기 판별용 내부 통로), 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번 전달하는 계약과 마운트 로드의 검증 요청을 준비 시점에 내는 것(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 첫째), `onError`의 렌더 계층(바깥 감싸개와 인스턴스 보고기 문맥, 로드 기록의 준비 이펙트 전달과 대체 화면 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부를 `onError`와 싱크로), `@winglet/react-utils` ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자(소유자 허용. 그 모듈의 `DETAIL.md`를 먼저 갱신한다, 17라운드 스웜 수렴(편집자 결정)), React 18 실행 시험(16라운드 답 5), `useFormTypeInput`의 메모 의존에 유효 스키마 참조 추가와 `SchemaNodeProxy`의 유효 스키마 변경 비트 구독, 배달 경로의 렌더 계층 구독(09 §2.4), `Form`의 스키마 `clone`(`preprocessSchema(clone(inputJSONSchema))`) 제거(작성 루트 객체를 가드 캐시의 키로 지킨다. `defaultValue`의 `clone`은 이 항목이 아니다), `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 입력 판정과 노드가 드는 Refresh 번호, 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함, §14의 38행), `setValue(V)`의 같은 입력 판정(§14의 39행)(09 §2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`), 벤치 비교 | PR-1 – PR-6 전부 | 성능 예산 수치(18라운드 안건 E, 소유자 정책), 브라우저 IME 확인, 노드 `resetSubtree`의 존치와 입력 판정의 구현 확인(§15), `trim` 쓰기의 부수 효과(18라운드 안건), `@winglet/react-utils` 선택 인자의 모양, 네이티브 submit 경로의 검증 실패(`ValidationError`) 처리(오늘은 미처리 거부, `Form.tsx:127-133`, `getTrackableHandler.ts:429-431`) |
- 보충:
  > 편집자 결정(18C-49): "【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다." (`reviews/round-18-closing.md:1342`)
  > 편집자 결정(18C-49): "【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다." (`reviews/round-18-closing.md:1343`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:577`(정본), `09-landing-and-test-strategy.md:21,24,26,38,261`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-closing.md:1342-1343`, `reviews/round-18-closing.md:2730-2731`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:600-601`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:577`의 "`setValue(V)`의 같은 입력 판정(§14의 39행)"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).

### LANDING-068 PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-8 릴리스 | README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, 09 §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(09 §6.2, 16라운드 스웜 수렴(편집자 결정)), README·docs의 reset 규칙(09 §2.6의 열여섯째), README·docs의 `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙 | PR-7 | 릴리스 전환 PR(09 §6.2, 저장소 전체)의 병합 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:578`(정본), `09-landing-and-test-strategy.md:262`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-069 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분

- 결정:
  > - **교체 규모.** `src/core` 178파일 9,884줄 가운데 `AbstractNode`(71파일 3,991줄, 계산 속성·검증 매니저·이벤트 캐스케이드)와 `ObjectNode`의 `BranchStrategy`(39파일 2,185줄), `ArrayNode` 전략(15파일 930줄), 오늘의 `schemaNodeFactory`(노드마다 넘기는 공장)가 교체 대상이다. 새 모듈 수준 생성 함수도 이름이 `schemaNodeFactory`이며 공장은 트리마다 하나다(옛 이름과의 중복은 기준이 아니다, §17.1). `helpers` 134파일 6,087줄 가운데 `jsonPointer`와 가상화는 그대로 쓰고, 교차 연산은 잎 함수만 옮겨 쓰며(§17.2의 PR-1 행), 식 컴파일러는 청사진으로 통째로 옮긴다(§17.2의 PR-1 행). 테스트 234파일의 처분은 09 §4.3을 따른다(17파일은 단언을 살린다, 16라운드 답 7)(`renderForm` 하니스는 재사용).
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:598`(정본), `09-landing-and-test-strategy.md:20`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수), 소유자 답(`reviews/round-16-owner-answers.md:13` 7)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-070 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자

- 결정:
  > - **형제 패키지.** ajv 플러그인 셋은 `ValidatorPlugin`·`ValidateFunction`·`JSONSchema`·`JSONSchemaError`·`SchemaFormPlugin` 타입을 가져오며(`JSONSchemaError`는 §14의 21행에 따라 `ValidationIssue`로 바뀐다) 모두 `$async: true`로 컴파일하므로, PR-4에서 동기 `compileGuard(root, pointer)` 경로를 세 플러그인에 구현해야 한다(캐시는 코어가 든다)(타입만 맞추면 되는 것이 아니다. 16라운드 정착 검토). UI 플러그인 넷은 `FormTypeRendererProps`뿐 아니라 `FormTypeInputDefinition`(11–19회)·`FormTypeInputPropsWithSchema`(8–15회)·스키마 타입을 가져오고, 27파일이 `jsonSchema.options.*`와 맨 키(`formType`·`radioLabels`·`switchLabels`·`switchSize`·`lazy`·`ampm`·`minRows`·`maxRows`)를 읽으며(mui 7/19, antd5 9/22, antd6 9/22, antd-mobile 2/14), 노드 표면 `push`·`remove`·`maxItems`·`length`도 쓴다. 그래서 PR-7의 UI 플러그인 이주는 타입과 등록 키 넷에 더해 스키마 읽기 27파일을 `presentation.*`로 옮기는 작업을 포함한다(§14의 31·32·37행). `@winglet/react-utils`의 ErrorBoundary와 감싸개 둘에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다(주지 않으면 오늘 동작, 소유자 허용, 17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째).
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:599`(정본), `09-landing-and-test-strategy.md:19,24`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 1·6, `09-landing-and-test-strategy.md:19,24`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:24`

### LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트

- 결정:
  > - **위험이 모이는 곳은 PR-7이다.** PR-1 – PR-6은 `<Form>`에 닿지 않으므로 사용자 관점의 동작은 PR-7에서 처음 검증된다. 완화: PR-2부터 엔진 수준의 통합 시나리오(02 §9의 상황 목록)를 각 PR에 넣고, PR-4 뒤에 차등 테스트(독립 검증기와의 판정 동치)를 돌린다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:600`(정본)
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:600`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:600`

### LANDING-072 PR-7을 더 쪼갤 수 없는 이유

- 결정:
  > - **PR-7을 더 쪼갤 수 없는 이유.** 옛 엔진과 새 엔진은 값의 소유(다중 사본 대 `raw` 하나), 통지(마이크로태스크 배치 대 동기 1회), 분기(자동 감지 대 게이트)가 다르다. `<Form>`이 둘을 동시에 섬길 수 없고, 렌더 시나리오의 기대값도 한 계약에만 맞는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:601`(정본), `08-design-a-to-z.md:552`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:601`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:601`

### LANDING-073 정착 조건 1 — 가드 계약 `compileGuard(root, pointer)`, ajv 셋의 동기 경로, 코어의 작성 루트 기준 캐시

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 1 가드 계약을 (루트, 위치)로 고치고 ajv 셋에 동기 가드 경로를 두며 작성 루트 기준 캐시를 둔다 | **08·ADR 0004에 반영.** 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하고(ajv 8 실행 확인), 세 플러그인이 모두 `$async: true`이며, 같은 `$id` 루트의 재컴파일은 throw한다. `compileGuard(root, pointer)`. 캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트 객체, { 사본, 가드 표 }>로 든다. 플러그인의 `compileGuard`는 가드 캐시를 들지 않는다. 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다, 16라운드 실행 확인). `Form`의 스키마 `clone`은 없앤다. 가드 캐시와 등록의 소유는 편집자 결정이며 16라운드 답 10으로 확정했다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:19`(정본), `08-design-a-to-z.md:466,574,599`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-074 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 2 "재사용" 두 문장을 사실대로 | **08 §17에 반영.** 교차 연산은 잎 함수만 재사용하고 병합표는 새로 쓴다(오늘은 먼저 승·얕은 덮어쓰기·무조건 throw). 식 컴파일러는 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진(`src/core/blueprint/`)으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고, `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행을 금하기 때문이다(편집자 결정, 16라운드 답 10으로 확정). 잎 함수 `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 18라운드 안건 '전환 방식의 세부') |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:20`(정본), `08-design-a-to-z.md:571,598`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-075 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함)

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 3 바인딩 계약 넷 | **§2.3에서 정함(첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘: 마운트 동안 `onError`는 커밋 뒤로 미루고 바운더리는 다시 던지지 않고 가두고 보고한다. 다섯째 '유효 스키마를 따라간다'는 편집자가 더함).** 08 §17 PR-7에 반영 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:21`(정본), `09-landing-and-test-strategy.md:44`, `08-design-a-to-z.md:577`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, 첫째·넷째), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 편집자 결정(16라운드, 다섯째)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:44`

### LANDING-076 정착 조건 4 — 상태·오류·명령 사건과 검증 결과의 배달 경로

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 4 상태·오류·명령 사건과 검증 결과의 배달 경로 | **§2.4에서 정함(16라운드 답 3으로 확정).** |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:22`(정본), `09-landing-and-test-strategy.md:56`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:56`

### LANDING-077 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 5 되돌림 기록에 `extras`와 배열 구조 | **08 §17 PR-2에 반영** |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:23`(정본), `08-design-a-to-z.md:572`, `09-landing-and-test-strategy.md:258`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:23`

### LANDING-078 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 6 UI 플러그인 규모와 `options` 닫힌 목록의 충돌 | **08 §17.3·§14에 반영.** 27파일이 `options.*`·맨 키를 읽으므로 PR-7이 `presentation.*`로 옮긴다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:24`(정본), `08-design-a-to-z.md:469,599`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:24`

### LANDING-079 정착 조건 7 — 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 7 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | **§3에서 정함(17라운드 소유자 확정과 노드 구조 수렴, 이름도 확정). 설계 빈틈 넷과 공개 표면의 크기는 18라운드 안건** |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:25`(정본), `09-landing-and-test-strategy.md:100`, `reviews/round-18-agenda.md:70-91`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조 수렴)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:100`

### LANDING-080 정착 조건 8 — 훅·바인딩 시험과 React 18 실행

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 8 훅·바인딩 시험과 React 18 실행 | **§4.4에 넣음.** 08 §17 PR-4·PR-7에 반영(React 18 실행은 16라운드 답 5로 확정) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:26`(정본), `08-design-a-to-z.md:574,577`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:11` 5), 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:164`

### LANDING-081 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/`

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-1 청사진 | `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`(정적 평탄화, `if/then/else` 무시), `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀(키 목록만 그룹 셋으로), 잎 교차 함수, `jsonPointer`, 옮긴 식 컴파일러 | `src/core/blueprint/`(옮긴 식 컴파일러 포함) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:32`(정본), `08-design-a-to-z.md:571`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-082 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-2 트리·정착 | `AbstractNode`의 `onChange` 전파·`__scoped__`·`__reset__`·루트 매크로태스크 디바운스, `ObjectNode` 전략 선택, `getNodeGroup`의 `isReactComponent`(원리 다섯째 'core는 렌더러를 모른다' 위반), `core/parsers/*`(ADR 0013 충돌), `BranchStrategy.ts` | `getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`, `omitEmptyObject`(`behaviors/objectBehavior/utils/`로), `findNode`·`traversal`(`navigation/`으로 옮기며 고친다. 기대는 멤버의 존폐는 18라운드 안건 N2), `shallowPatch`(`record/`로) | `src/core/record/`, `src/core/behaviors/`(잎 넷, `objectBehavior/`의 `branch/`·`terminal/`, `virtualBehavior/`. 터미널 배열은 PR-5), `src/core/navigation/`, `src/core/SchemaNode/`, `src/core/settle/` |
- 보충:
  > "확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다." (`reviews/round-18-owner-answers.md:8`)
  > "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다" (`reviews/round-18-owner-answers.md:7`)
  > 편집자 결정(18C-49): "【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다." (`reviews/round-18-closing.md:1334`)
  > 편집자 결정(18C-36): "【추론】 S1 parse 함수는 `src/core/behaviors/utils/parse/`에 둔다." (`reviews/round-18-closing.md:988`)
  > 편집자 결정(18C-36): "【추론】 PR-2는 이 자리에 S1 변환(`reviews/round-18-owner-answers.md:9`의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다." (`reviews/round-18-closing.md:993`)
  > 편집자 결정(18C-36): "【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(18C-49)." (`reviews/round-18-closing.md:994`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:33`(정본), `08-design-a-to-z.md:572`, `reviews/round-18-owner-answers.md:7-8`, `09-landing-and-test-strategy.md:9`, `reviews/round-18-closing.md:988,993-994,1334`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49·18C-36)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:100`, `reviews/round-18-closing.md:1365-1368`, `reviews/round-18-closing.md:997-999`
- 충돌:
  > `09-landing-and-test-strategy.md:33`의 "`core/parsers/*`(ADR 0013 충돌)"는 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052).
  > `09-landing-and-test-strategy.md:9`의 "옛 엔진의 내부(분기 자동 감지, 마이크로태스크 배칭, 파서 변환, 전역 상속)"는 파서 변환을 교체 대상에 넣은 점에서 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052).
  > `09-landing-and-test-strategy.md:33`의 "`src/core/behaviors/`(잎 넷"은 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다 (BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).

### LANDING-083 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/`

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-3 파생 | 의존 경로의 이벤트 구독, `InjectionGuardManager`, `getDerivedValueFactory` | `createDynamicFunction`의 의존 주입 형태 | `src/core/settle/derive/` |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:34`(정본), `08-design-a-to-z.md:573`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:34`

### LANDING-084 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-4 통지·검증 | `EventCascadeManager`(노드별 마이크로태스크, 100회 throw), `ValidationManager`(실패 삼킴), `compile` 하나뿐인 계약 | 비트별 배달 원장 개념, 세대 번호, `transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정. 진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고, 검증 결과 배달은 `dispatch`가 넘긴 콜백이다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:35`(정본), `08-design-a-to-z.md:574`, `05-before-after.md:159`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, 진입 사슬은 `dispatch`가 소유)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:35`

### LANDING-085 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/`

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-5 배열 | `ArrayNode` 전략 둘, 비동기 `push` | `resolveArrayLimits`(`blueprint/`로 옮김), `omitTrailingArray`·`omitEmptyArray`(`behaviors/arrayBehavior/utils/`로). `resolveArrayValueFilter`는 투영 칸의 비트 분기로 다시 쓴다 | `src/core/behaviors/arrayBehavior/`(`branch/`·`terminal/`·`utils/`) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:36`(정본), `08-design-a-to-z.md:575`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:36`

### LANDING-086 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-6 상태 키·제어 | 루트 스키마 전역 상속, `checkComputedOptionFactory`, `mergeShowConditions` | 없음 | `settle/`의 계산 끝 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:37`(정본), `08-design-a-to-z.md:576`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:37`

### LANDING-087 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-7 전환 | `RootNodeContextProvider`, `Form`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager`의 렌더 키트, `types/jsonSchema`의 맨 키, UI 플러그인 27파일 | 가상화(WeakSet identity), `renderForm`, `providers` 대부분, `useSchemaNodeTracker`·`useSchemaNodeSubscribe` | 기존 자리. `core/index.ts`의 수출만 새 fractal로 돌려 import 경로를 지킨다(`core/index.ts`는 `SchemaNode/`의 진입점을 가리키고 바인딩 전용 내부 통로를 이름으로 다시 내보낸다). `core/types`의 event·state·value는 남고 node·constructor는 지운다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:38`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:38`

### LANDING-088 `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침

- 결정:
  > `core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"는 PR-1에서 먼저 고친다(문서가 코드보다 먼저 바뀐다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:40`(정본), `09-landing-and-test-strategy.md:257`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 원리(filid 규칙, 문서가 코드보다 먼저)
- 라운드: 16
- 까닭: `08-design-a-to-z.md:553`

### LANDING-089 정착 지도의 '그대로 쓰는 것'은 레거시에서 가져오는 코드의 목록

- 결정:
  > 위 표의 '그대로 쓰는 것'은 가져오는 코드의 목록이다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:42#5`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식), 편집자 결정(17라운드, `09-landing-and-test-strategy.md:42`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:52`

### LANDING-090 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-0 | 시나리오 데이터 모듈의 형(`FormScenario`)과 코어 러너·화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함), vitest `test.projects` 셋, addon-vitest 설치, 옛 스토리의 처분 목록, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(신규 시나리오의 자리와 파일당 상한을 §4.2·§5.2에 맞춘다), 비공개 패키지 `@aileron/schema-form-scenarios`의 생성(§5.2), 릴리스 전환 PR 뒤라면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계(§6.2의 다섯째) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:256`(정본), `08-design-a-to-z.md:570`
- 닫은 사람: 편집자 결정(16라운드, 테스트 전략), 소유자 답(`reviews/round-16-owner-answers.md:14` 8), 소유자 답(`reviews/round-16-owner-answers.md:10` 4)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:130`

### LANDING-091 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-1 | 식 컴파일러(`createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형)를 `src/core/blueprint/`로 통째로 옮김(PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고침), 잎 교차 함수를 새 fractal로 옮김(옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 18라운드 안건 '전환 방식의 세부')), `core/INTENT.md` 개정, `@winglet/common-utils`의 `merge` 선택 인자와 그 changeset(`minor`, §6.2의 열한째) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:257`(정본), `08-design-a-to-z.md:571`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-092 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-2 | 되돌림 기록 항목 확정(§2.1의 조건 5), 노드 구조(§3: `record/`·`behaviors/`·`navigation/`·`SchemaNode/`, 행은 잎 넷·객체 둘(터미널 객체까지)·가상. 터미널 배열은 PR-5), `active` 게터, 나감 비움의 하위 트리 규칙(R17-2 ㄴ) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:258`(정본), `08-design-a-to-z.md:572`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:23`

### LANDING-093 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-4 | ajv6·7·8의 동기 `compileGuard(root, pointer)` 구현과 코어의 사본·가드 캐시, 훅 수준 바인딩 시험, 같은 `$id` 재등록, 배달 경로(§2.4), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(새 루트를 등록할 때 옛 트리가 아직 살아 있으므로 살아 있는 두 트리의 충돌로 다루고 reset의 원자성을 지킨다, §2.6의 일곱째·여덟째, 16라운드 스웜 수렴(편집자 결정)), `onError`의 core 쪽(보고기 인자, 기록 형과 코드 형, 사슬 끝의 기록마다 전달, 핸들러 예외 규칙, 전달 중 쓰기 거부, ADR 0014 §3) |
- 보충:
  > 편집자 결정(18C-30): "【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`)." (`reviews/round-18-closing.md:876`)
  > 편집자 결정(18C-30): "【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다." (`reviews/round-18-closing.md:877`)
  > 편집자 결정(18C-30): "【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다." (`reviews/round-18-closing.md:878`)
  > 편집자 결정(18C-74): "【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다." (`reviews/round-18-closing.md:2056`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:259`(정본), `08-design-a-to-z.md:574`, `reviews/round-18-closing.md:876-878,2056`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30·18C-74)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`, `reviews/round-18-closing.md:881-884`, `reviews/round-18-closing.md:2059-2062`

### LANDING-094 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-5 | 배열·터미널 배열 행(`behaviors/arrayBehavior/`의 `branch/`·`terminal/`), `resolveArrayLimits`의 청사진 이동 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:260`(정본), `08-design-a-to-z.md:575`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(16라운드 정착 검토)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:36`

### LANDING-095 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-7 | 바인딩 계약 다섯(§2.3. 첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘. 드러남과 제출 거부는 모든 환경에서 같다, R17-1 나), Form 속성 `onError`와 바깥 감싸개·인스턴스 보고기, 입력 마침 신호 `finishInput`(trim), `node.group` → `node.strategy`의 소비자 이주, UI 플러그인 27파일의 `presentation.*` 이주, `renderForm` 다섯(§4.5), 부류별 e2e 실행기, React 18 실행, 배달 경로의 렌더 계층 구독(§2.4), 시나리오 스토리와 `playScenario`, 옛 스토리 49파일 전체 정리, `architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3), `Form`의 스키마 `clone` 제거, `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함), `setValue(V)`의 같은 입력 판정(§2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`, §6.2의 열한째) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:261`(정본), `08-design-a-to-z.md:577`, `reviews/round-18-closing.md:2730-2731`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:44`, `reviews/round-18-closing.md:2734-2736`
- 충돌:
  > `09-landing-and-test-strategy.md:261`의 "`setValue(V)`의 같은 입력 판정"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).

### LANDING-096 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-8 | 릴리스 전 벤치 재실행, changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(§6.2, 16라운드 스웜 수렴(편집자 결정)), README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째), 스토리북 문서 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:262`(정본), `08-design-a-to-z.md:578`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-097 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | 릴리스 전환(별도 PR) | changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(§6.2, 16라운드 스웜 수렴(편집자 결정)). 저장소 전체의 일이라 재설계와 독립이며 PR-8 전에 병합한다. PR-0과는 순서가 없다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:263`(정본), `08-design-a-to-z.md:578`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-098 05의 이주 행 가운데 08 §14에 행이 없는 것 — `ENHANCED_KEY`, `minItems`·`maxItems`, `Normalize`, `null`→`{}`, 배열 Promise, `setValue(getValue())`, `useEffect` 파생 쓰기

- 결정:
  > | `ENHANCED_KEY` 마커 주입 | `processOneOfSchema.ts:14-24`, `app/constants/internal.ts:3` | 검증기 입력 불변(P1) | 활성 조각 기반 `schemaPath` 필터(`adr/0001:40`) |
  > | `minItems` 채움 · `maxItems` 차단 | `adr/0013:78`이 지목 | 같음 | 입력 컴포넌트 + 유효 스키마 노출 |
  > | `Normalize`의 미선언 키 제거 | `core/types/value.ts:26-66` | P1′ — 폼은 값을 지우지 않는다 | `extras` 칸 보존·방출(E16) |
  > | `null` → `{}` 변환, 비객체 값 버리기 | `adr/0013:79`가 지목 | 같음 | 보존·방출하고 type 에러(F27) |
  > | 배열 연산의 Promise 반환 | `01-current-structure.md:81` | `await` 뒤가 "구독자가 봤다"는 뜻이 되지 않았다 | 동기 API(T-7) |
  > | `setValue(getValue())`로 값 유지 | 전체 교체이므로 로드 계약이 다시 돌고 지운 키에 `default`가 재주입된다. 막으려면 호출 단위 억제 옵션 |
  > | `useEffect`로 파생 값 쓰기 | 새 진입이 되어 키 입력당 `onChange`가 2회다. 권장 경로는 `&derived`·`injectTo`·리스너 |
- 보충:
  > "`setValue(getValue())`도 전체 교체" (`08-design-a-to-z.md:266`)
  > "`setValue(getValue())`의 재채움(로드는 새 수명)" (`08-design-a-to-z.md:524`)
- 상태: 분할됨(→ LANDING-115, LANDING-116, LANDING-117, LANDING-118, LANDING-119)
- 출처: `05-before-after.md:149,151-153,162,196-197`(정본), `02-target-overview.md:354`, `09-landing-and-test-strategy.md:36`, `08-design-a-to-z.md:266,524`
- 닫은 사람: 편집자 결정(6라운드 대조, `05-before-after.md:5`)
- 라운드: 6
- 까닭: `05-before-after.md:149`

### LANDING-099 대체됨 — 폼이 분기를 고르던 05의 행(값 가드·선택 가드·`selection` 칸·분기 하나만 활성)

- 결정:
  > | `&if` 분기 판별 | `extractConditionInfo.ts:44-45` | 표준 composition 위에 얹은 FE 키가 검증을 깨뜨린다 | 값 가드·선택 가드(`adr/0002:34-40`) |
  > | `anyOf` 다중 활성 | `BranchStrategy.ts:424` | 형상의 결정성 | 분기 하나만 활성(`adr/0002:54`) |
  > | 선택 가드와 `selection` 칸 | `adr/0002:38-40` | 판별식이 없는 union을 사용자가 고른다 |
  > | `&if`로 `oneOf` 분기 고르기 | 분기에 `const`/`enum` 판별식을 넣거나, 판별식 없이 두고 선택 가드로 고른다. `&if`만으로 분기를 구분한 스키마는 **폼에서도 invalid**가 된다 |
  > | `node.oneOfIndex` 읽기 | 대응물이 **미확인**이다 |
  > | 두 분기에 동시에 맞는 값을 `anyOf`에 로드 | 분기 하나만 켜지므로 다른 분기의 키가 방출에서 빠진다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-004, LANDING-005, LANDING-006, LANDING-028)
- 출처: `05-before-after.md:148,163,178,193,198,203`(정본, 옛 기록), `07-conclusions.md:142`
- 닫은 사람: 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42,44` 읽기1)
- 라운드: 9
- 까닭: `07-conclusions.md:142`

### LANDING-100 대체됨 — `options.trim` 강제 변환은 사라지고 입력 컴포넌트가 맡음

- 결정:
  > | `options.trim` 강제 변환 | `types/jsonSchema.ts:139` | core는 받은 값을 고치지 않는다(P2) | 입력 컴포넌트(`adr/0013:77`) |
- 보충: 없음
- 상태: 대체됨(→ LANDING-047, LANDING-034)
- 출처: `05-before-after.md:150`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### LANDING-101 대체됨 — React 컴포넌트 감지 대신 "있고 `null`이 아니다"만 봄

- 결정:
  > | React 컴포넌트 감지 | `adr/0011:53`이 지목 | 컴포넌트를 감지하는 것은 렌더러를 아는 것(P5) | "있고 `null`이 아니다"만 본다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-061, LANDING-082)
- 출처: `05-before-after.md:156`(정본, 옛 기록), `08-design-a-to-z.md:571`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:12`

### LANDING-102 대체됨 — 분석 단계의 정적 throw 대신 런타임 충돌 보고

- 결정:
  > | 분석 단계의 정적 throw | `getCompositionNodeMapList.ts:95-105` | 돌려 보고 개발 단계에 알린다 (확인 대기) | 런타임 충돌 보고(`adr/0005:7,99`) |
- 보충: 없음
- 상태: 대체됨(→ ERROR-078, LANDING-061)
- 출처: `05-before-after.md:157`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-14-owner-answers.md:16`

### LANDING-103 대체됨 — 쓰기 옵션은 옵션 객체(`{ mode: 'Merge' }`)

- 결정:
  > | `SetValueOption`의 `Batch`·`Isolate`·`EmitChange`·`Propagate`·`PublishUpdateEvent` | `core/types/value.ts:26-66` | 전파와 통지가 옵션이 아니라 구조다 | 옵션 객체(`adr/0013:46`) |
  > | 쓰기 옵션 객체 | `adr/0013:46` | 비트 워드를 대신하고 `reset`·마운트에도 같은 모양으로 있다 |
  > | `SetValueOption.Merge` 비트 | `setValue(v, { mode: 'Merge' })` |
- 보충: 없음
- 상태: 대체됨(→ LANDING-021)
- 출처: `05-before-after.md:160,181,195`(정본, 옛 기록), `07-conclusions.md:345`
- 닫은 사람: 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행)
- 라운드: 9
- 까닭: `07-conclusions.md:345`

### LANDING-104 대체됨 — 정착 상태 `settle`과 예산

- 결정:
  > | 정착 상태 `settle`과 예산 | `03-mental-model.md:28`, `adr/0007:30-36` | 형상 계산의 수렴 결과가 프로덕션에서도 관측 가능한 칸이 된다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-045)
- 출처: `05-before-after.md:171`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### LANDING-105 대체됨 — strict 검증기용 `&` 키 제거 유틸리티

- 결정:
  > | `&` 키 제거 유틸리티 | `adr/0012:19`·`open-questions.md:66` | strict 검증기를 쓰는 소비자용 선택 사항 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-031, LANDING-033)
- 출처: `05-before-after.md:180`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-106 `refresh(path)`·`remount(path)` 공개 — C-11 확정 대기

- 결정:
  > | `refresh(path)`·`remount(path)` 공개 | `adr/0008:121` | 후보. C-11 확정 대기 |
- 보충: 없음
- 상태: 대체됨(→ EVENT-063)
- 출처: `05-before-after.md:183`(정본, 옛 기록), `reviews/round-18-agenda.md:87`, `reviews/round-18-closing.md:1182-1191`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 §7로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:87`, `reviews/round-18-closing.md:1193-1196`

### LANDING-107 대체됨 — 진단 채널 후보(단일 콜백)

- 결정:
  > | 진단 채널 | 6라운드 D-22 | 후보. 예산 초과·리스너 throw·검증 pending을 실어 나를 단일 콜백 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-044, LANDING-045)
- 출처: `05-before-after.md:184`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### LANDING-108 대체됨 — `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption`의 이름과 거취 미결(D-23)

- 결정:
  > | `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption` | 이름과 거취가 **미결(D-23)**이거나 문서에 없다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-023, LANDING-008)
- 출처: `05-before-after.md:204`(정본, 옛 기록), `06-conclusions.md:356,358`, `07-conclusions.md:316`
- 닫은 사람: 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356,358`), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록)
- 라운드: 9
- 까닭: `06-conclusions.md:358`

### LANDING-109 06 §9의 5 이주 안내 항목(C8) — 8라운드가 새로 올린 것

- 결정:
  > 이 문서가 새로 올린 것: `find`의 터미널 별칭 제거(4.8), 배열 `Merge`의 통째 교체(4.7), 이력에 기대어 안정되던 스키마가 예산 초과가 되는 것(4.15), 비수렴 시 `default`가 모두 빠지는 것(4.11), 파생 필드의 문서와 코드 어긋남(5.2), `injectTo`의 로드 동작(5.1), 조건부 조각의 `default`가 동작하기 시작하는 것(5.3에서 (C)일 때), `normalizedValue` → `outputValue`(N3), `computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5), `push`의 `unlimited` 제거(N6), README 1483행.
- 보충:
  > "주석 키워드(`title`, `description`, `format`, `default`·`controls.default`, `writeOnly`, `$comment`, `examples`) | 뒤가 앞을 덮는다. 켜진 조각이 본체를, 전순서에서 나중 조각이 앞 조각을 덮는다" (`08-design-a-to-z.md:325`)
- 상태: 현행
- 출처: `06-conclusions.md:429#2`(정본, 옛 기록), `08-design-a-to-z.md:254,265,325`, `03-mental-model.md:81`, `06-conclusions.md:231`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C))
- 라운드: 10
- 까닭: `06-conclusions.md:429`
- 충돌:
  > `06-conclusions.md:429`의 "`computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436,462`, 15라운드 결정 5).

### LANDING-110 07 §9의 6 이주 안내 항목(C8) — 9라운드가 더한 것

- 결정:
  > `const`/`enum` 자동 감지 제거와 `oneOfIndex`·`anyOfIndices` 제거(4.25), `&if`→`&active`(6.1), `computed`→`control`(별칭이므로 기계적), `DisableSchemaDefaults`→`DisableAutomaticWrites`(06 문서상의 이름이라 코드 이주는 없음), `&unsetValue` 신설, `allOf` 안의 `if/then/else`가 병합되기 시작하는 것(4.27), 분기 전환 때 공유 노드를 다시 채우지 않는 것(4.22), 같은 노드의 표준 `readOnly`와 `&readOnly`가 택일(오늘은 표준 키가 이김)에서 OR로 바뀌는 것(4.26), `allOf` 항목끼리 겹친 표준 `readOnly`가 먼저-승에서 OR로 바뀌는 것(4.26·4.27), 공개 문서의 `derived` 레벨 약속을 에지로 고치는 것(5.2 아래 문단).
- 보충: 없음
- 상태: 현행(기록)
- 출처: `07-conclusions.md:423#3`(정본, 옛 기록)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:423`)
- 라운드: 9
- 까닭: `07-conclusions.md:423`
- 충돌:
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5).
  > `07-conclusions.md:423`의 "`&if`→`&active`(6.1)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:435`, 15라운드 결정 5).

### LANDING-111 대체됨 — `&if`를 `&active`로 옮길 때 `./x`를 `../x`로 고친다

- 결정:
  > `&if`를 `&active`로 옮길 때 기준점이 호스트에서 호스트의 직계 자식 자리로 바뀌므로 `./x`를 `../x`로 고친다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-029)
- 출처: `07-conclusions.md:423#9`(정본, 옛 기록), `reviews/round-15-decisions.md:9`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:9` 1)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:9`

### LANDING-112 대체됨 — 코드 착수 전에 할 일 넷(9라운드 개발 진입 평가)

- 결정:
  > - **코드 착수 전에 할 일 넷.**
  > 1. 소유자가 이 문서의 3절과 4절을 통과시킨다. 특히 4.22(채움), 4.24(노드 게이트), 4.25(분기를 고르지 않음)다. 4.25가 반려되면 상태 모델이 바뀌므로 그 뒤의 모든 것이 다시 열린다.
  > 2. 원리 원장 `03-mental-model.md`와 ADR 5차 본문(0002·0003·0005·0006·0007·0008·0013)을 써서 구현 명세를 하나로 모은다. 지금 ADR 본문은 4차라 이 문서와 곳곳에서 충돌한다(`selection` 칸, "`default` 주입이 유일한 자동 쓰기", 판별식 식별). 구현자가 두 문서를 대조하며 짜게 두면 안 된다.
  > 3. 생성기가 만든 스키마 14종(`spikes/guard-cost/redteam3/corpus.mjs`: pydantic, OpenAPI 3.0·3.1, zod, TypeBox 등)을 v5 모델로 돌려, "폼은 분기를 고르지 않는다" 아래에서 무엇이 보이는지 표로 만든다(위험 1). **했음(11라운드, `spikes/round11-corpus/REPORT.txt`).** 순수 모드는 14/14 빌드되고 분기는 전부 켜진다(재귀 스키마도 지연 `$ref` 해석으로 유한 트리). `&discriminator`는 12/14에 적용 가능(공통 `const`·`enum` 태그 키가 없는 둘은 불가), `if` 변환도 12/14. 다만 분기가 하나만 켜지는지는 v5가 게이트 입력에 `extras`를 넣지 않아 측정하지 못했다. 설계는 `extras` 경로로 답한다(원장 §5의 게이트 입력 행). 슬라이스 2 전의 프로토타입 v7 항목이다.
  > 4. `adr/0009` §1의 성능 기준선을 실제로 잰다. **확인됨(2026-09-23).** 기준선 기록이 있고(`bench/.results/baseline.json`, `benchmark-form/results/baseline.json`) 재실행 수치가 기록과 정합해 회귀가 없다. 남은 것은 예산 수치 자체이며 소유자 정책이다(ADR 0009 미결). 컴파일 가드 비용(가드 200개에 22.4 ms, `adr/0004:69`)의 허용 여부는 그 수치가 정해져야 판정할 수 있다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-060)
- 출처: `07-conclusions.md:448-452`(정본, 옛 기록), `08-design-a-to-z.md:570`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570` 착수 전 닫을 것)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:570`

### LANDING-113 대체됨 — 구현 슬라이스 0–8(두 검토의 순서를 합침)

- 결정:
  > | 순서 | 슬라이스 | 필요한 결정 |
  > | --- | --- | --- |
  > | 0 | 문서 통합(원리 원장, ADR 5차), 기준선 벤치, corpus 재실행 | 3절·4절 통과, 5.1의 22 |
  > | 1 | 청사진 분석(순수 함수): 조각 표, 노드 공유, 검증 키워드 교차. 주석 병합은 교체할 수 있는 표 | 4.25, 4.27의 교차 |
  > | 2 | 객체 노드 트리와 정착 루프: 표시·계산·전이·커밋, 술어 인터페이스 뒤의 가드 스텁, 노드 게이트, 투영, 노드 생성 채움 | 4.22, 4.24(10), D-1·D-2·D-4, 표현식 의존 범위(11.2), 5.2의 2(`Merge`의 `undefined`) |
  > | 3 | 파생 단계: `&derived`·`&injectTo`·`&unsetValue`, 같은 대상 해소, `DisableAutomaticWrites`. 순위와 로드 에지는 스위치 | 5.3의 6, 5.4의 8·9·21 |
  > | 4 | 통지(ADR 0008), 커밋 번호 스탬프 검증, ajv8 `compileGuard` 플러그인, 에러 라우팅 | `compileGuard` 계약, Q12 |
  > | 5 | 배열 아이템 호스트, `push`, 통째 쓰기의 identity와 채움 | R13, `push`가 로드인가, Q13 |
  > | 6 | 상태 키와 제어: 결합 규칙, `&children`, 조각 범위 제어, `control` 별칭 | 5.3의 7, 5.1의 12, 5.4의 13·16·18, 5.3의 14·17, 5.2의 15 |
  > | 7 | React 바인딩(ADR 0011), 렌더 테스트 이주, UI 플러그인 | S11, 렌더 결과 검토 |
  > | 8 | ADR 0010, 이주 안내, 릴리스 노트 | 5.4의 5 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-060, LANDING-061, LANDING-062, LANDING-063, LANDING-064, LANDING-065, LANDING-066, LANDING-067, LANDING-068)
- 출처: `07-conclusions.md:480-490`(정본, 옛 기록), `08-design-a-to-z.md:568-578`, `02-target-overview.md:394-406`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:568-578`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:551`

### LANDING-114 대체됨 — 9라운드의 규모 추정(교차 연산을 청사진 병합으로 옮겨 재사용)

- 결정:
  > **규모.** 로컬 검토의 추정으로 `src/core` 비테스트 코드 약 9,900행 가운데 절반 이상이 교체 대상이다(`BranchStrategy` 둘, `EventCascadeManager`, `getComputedPropertiesManager`의 상태 기계, `ValidationManager`, `schemaNodeFactory`, `VirtualNode`). `helpers/jsonSchema`의 교차 연산은 청사진 병합으로 옮겨 재사용하고, `findNode`·`traversal`·`jsonPointer`·표현식 컴파일러·가상화는 유지한다. core 테스트 136파일과 시나리오 44파일은 동작이 달라져 다시 쓴다. 이 추정은 줄 수와 ADR 서술로만 했다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-069, LANDING-074)
- 출처: `07-conclusions.md:492`(정본, 옛 기록), `08-design-a-to-z.md:598`, `09-landing-and-test-strategy.md:20`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-115 이주(05) — `ENHANCED_KEY` 마커 주입이 사라지고 활성 조각 기반 `schemaPath` 필터로

- 결정:
  > | `ENHANCED_KEY` 마커 주입 | `processOneOfSchema.ts:14-24`, `app/constants/internal.ts:3` | 검증기 입력 불변(P1) | 활성 조각 기반 `schemaPath` 필터(`adr/0001:40`) |
- 보충: 없음
- 상태: 중복(→ VALIDATE-010)
- 출처: `05-before-after.md:149`(정본, 옛 기록), `adr/0001-validator-input-invariant.md:43-44`, `02-target-overview.md:354`
- 닫은 사람: 원리(`03-mental-model.md:13` P1)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:43`

### LANDING-116 이주(05) — `minItems` 채움·`maxItems` 차단은 입력 컴포넌트로, `Normalize` 키 제거와 `null`→`{}`는 폐기

- 결정:
  > | `minItems` 채움 · `maxItems` 차단 | `adr/0013:78`이 지목 | 같음 | 입력 컴포넌트 + 유효 스키마 노출 |
  > | `Normalize`의 미선언 키 제거 | `core/types/value.ts:26-66` | P1′ — 폼은 값을 지우지 않는다 | `extras` 칸 보존·방출(E16) |
  > | `null` → `{}` 변환, 비객체 값 버리기 | `adr/0013:79`가 지목 | 같음 | 보존·방출하고 type 에러(F27) |
- 보충:
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
- 상태: 중복(→ WRITE-022)
- 출처: `05-before-after.md:151-153`(정본, 옛 기록), `05-before-after.md:199`, `adr/0013-core-does-not-rewrite-values.md:90-92`
- 닫은 사람: 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16)
- 라운드: 5
- 까닭: `reviews/round-2.md:119`

### LANDING-117 이주(05) — 배열 연산은 Promise를 돌려주지 않는 동기 API

- 결정:
  > | 배열 연산의 Promise 반환 | `01-current-structure.md:81` | `await` 뒤가 "구독자가 봤다"는 뜻이 되지 않았다 | 동기 API(T-7) |
- 보충: 없음
- 상태: 중복(→ EVENT-002)
- 출처: `05-before-after.md:162`(정본, 옛 기록), `05-before-after.md:200`, `adr/0008-event-system.md:40,195`, `adr/0007-settle-cycle.md:138`
- 닫은 사람: 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:40`

### LANDING-118 이주(05) — `setValue(getValue())`는 전체 교체라 지운 키에 채움이 다시 들어감

- 결정:
  > | `setValue(getValue())`로 값 유지 | 전체 교체이므로 로드 계약이 다시 돌고 지운 키에 `default`가 재주입된다. 막으려면 호출 단위 억제 옵션 |
- 보충:
  > "`setValue(getValue())`도 전체 교체" (`08-design-a-to-z.md:266`)
  > "`setValue(getValue())`의 재채움(로드는 새 수명)" (`08-design-a-to-z.md:524`)
  > "필요하면 호출 단위 억제 비트 `DisableAutomaticWrites`로 끈다" (`adr/0007-settle-cycle.md:102`)
- 상태: 대체됨(→ WRITE-090)
- 출처: `05-before-after.md:196`(정본, 옛 기록), `adr/0013-core-does-not-rewrite-values.md:70`, `adr/0007-settle-cycle.md:102`, `08-design-a-to-z.md:266,524`, `reviews/round-18-closing.md:2887`
- 닫은 사람: 소유자 답(`reviews/round-4.md:113` D-7), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103)
- 라운드: 18
- 까닭: `reviews/round-4.md:113`, `reviews/round-18-closing.md:2891-2893`

### LANDING-119 이주(05) — `useEffect`로 쓴 파생 값은 새 진입이라 키 입력당 `onChange` 2회

- 결정:
  > | `useEffect`로 파생 값 쓰기 | 새 진입이 되어 키 입력당 `onChange`가 2회다. 권장 경로는 `&derived`·`injectTo`·리스너 |
- 보충: 없음
- 상태: 중복(→ EVENT-036)
- 출처: `05-before-after.md:197`(정본, 옛 기록), `adr/0008-event-system.md:134,136`
- 닫은 사람: 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`)
- 라운드: 5
- 까닭: `adr/0008-event-system.md:136`

### LANDING-120 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 들며, 경고 `VALUE_TYPE_MISMATCH`가 생김

- 결정:
  > 확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다.
  > 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7).
  > `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처). 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충:
  > 소유자(S1 이어서): "변경하지 못하는 값을 입력했을때, 이전에는 NaN 같은 값을 넣었는데요" (`reviews/round-18-owner-answers.md:8`)
  > "(2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다. 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다." (`reviews/round-18-agenda.md:80`)
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
- 상태: 분할됨(→ LANDING-125, LANDING-126, LANDING-127)
- 출처: `reviews/round-18-owner-answers.md:8-9`(정본), `reviews/round-18-agenda.md:80`, 같은 규칙의 원장 항목 WRITE-052·WRITE-054·WRITE-055·ERROR-182
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`

### LANDING-121 PR-8의 reset 문서가 적는 것 — 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기, `dirty`

- 결정:
  > **문서와 시험.** PR-8의 문서 재작성(README, `docs/QUICK_REFERENCE.md`, `docs/agents`의 `validation-and-state.md`)이 적는 것: 같은 스키마의 판정(첫째), prop을 읽는 때와 재대조(둘째), 노드 참조가 이어지는 조건(로드 경로뿐), 제자리 변경 비반영, `key`가 버리는 것, 포커스, 입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`), reset 직후 다시 마운트된 입력이 흉내 언마운트 때 같은 값을 흘려보내 `dirty`를 세울 수 있다는 것(`dirty`는 C6대로 현행 유지라 값이 같아도 선다. 개발 모드 StrictMode에서만 관측될 수 있음, 실행 확인 전).
- 보충:
  > "README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째)" (`09-landing-and-test-strategy.md:262`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:96#1-3`(정본), `09-landing-and-test-strategy.md:262`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty` 현행 유지)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:79`

### LANDING-122 정착 검토의 그 밖의 판단 — `extras` 정적 규칙은 조각 표 걸음에서, 유효 스키마 메모는 비트 집합 키(추정)

- 결정:
  > - `extras` 정적 규칙은 스캐너의 `keyword`·`variant`·`dataPath`로 구현 가능하다. 조각 표를 만드는 걸음에서 함께 뽑고, `$ref` 순환은 스캐너가 `referenceSkipped: 'cycle'`로 알린다.
  > - 유효 스키마 메모는 노드 위치마다 덧씌움 후보를 전순서로 매기고 활성 부분집합을 비트 집합으로 키한다. 후보에 `controls.children` 항목과 조각의 `controls`까지 넣어야 "같은 집합이면 같은 참조"가 참이 된다(추정, 비용은 재지 않았다).
- 보충:
  > "**메모.** 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다. 같은 집합이면 같은 참조를 돌려준다." (`adr/0005-blueprint-analysis-and-node-sharing.md:109`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:68-69`(정본), `reviews/raw-round16-landing-review.md:28-29`
- 닫은 사람: 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:3`)
- 라운드: 16
- 까닭: `reviews/raw-round16-landing-review.md:28-29`

### LANDING-123 대체됨: 작업은 `feature/schema-form-redesign` 브랜치에 모이고 그 브랜치가 우산 PR — 14라운드에 우산 브랜치는 `refactor/schema-form-internal-architecture`

- 결정:
  > 작업은 `feature/schema-form-redesign` 브랜치에 모이고, 이 브랜치가 여러 작업을 병합받는 우산 PR이 된다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-051)
- 출처: `00-goals.md:128#4`(정본)
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:551`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:551`

### LANDING-124 명령 RequestEmitChange·RequestInjection과 공개 훅의 거취 — 미확인

- 결정:
  > | 명령 어휘 | `RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount`·`RequestEmitChange`·`RequestInjection` | 앞의 넷은 유지. 뒤의 둘은 **미확인** | 유지 + 미확인 | 동일 / `adr/0008:24-28` |
  > | 공개 훅 5종 | `useSchemaNodeTracker`·`useSchemaNodeSubscribe`·`useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit` | 언급 없음. `useSchemaNodeTracker`의 `useSyncExternalStore` 방식은 유지한다고만 적혀 있다 | **미확인** | `src/index.ts:78-84` / `adr/0008:26` |
  > **문서가 말하지 않는 것(미확인).** `Form` props 14개, `FormHandle` 8개, `NodeEventType` 17종의 개별 생사, `RequestEmitChange`/`RequestInjection`, `ValidationMode`, 공개 훅 5종, `oneOfIndex`/`anyOfIndices`의 대응물, `FormTypeInputProps.alias`, `placeholder`, `errorMessages`, `type: 'virtual'` 노드, `&` 계열의 root 폴백 우선순위, `default` 없는 키에 타입별 빈 값을 만들던 경로의 명시적 폐기.
- 보충: 없음
- 상태: 현행(기록)
- 출처: `05-before-after.md:124,140,214`(정본), `reviews/round-18-closing.md:2256-2265`
- 닫은 사람: 편집자 결정(18라운드, 원장 토큰 검사가 찾은 미결, `reviews/round-18-agenda.md:151`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86; 명령 둘과 훅 셋에 한정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87; 나머지 공개 표면과 타입별 빈 값)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:151`, `reviews/round-18-closing.md:2267-2268`, `reviews/round-18-closing.md:2290-2296`

### LANDING-125 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다

- 결정:
  > 확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다.
  > 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7).
- 보충:
  > 소유자(S1 이어서): "변경하지 못하는 값을 입력했을때, 이전에는 NaN 같은 값을 넣었는데요" (`reviews/round-18-owner-answers.md:8`)
  > "(2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다. 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다." (`reviews/round-18-agenda.md:80`)
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
  > 편집자 결정(18C-40): "【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다." (`reviews/round-18-closing.md:1123`)
  > 편집자 결정(18C-40): "【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다." (`reviews/round-18-closing.md:1124`)
  > 편집자 결정(18C-40): "【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다." (`reviews/round-18-closing.md:1125`)
  > 편집자 결정(18C-40): "【추론】 해법은 스키마에 nullable을 적는 것이다." (`reviews/round-18-closing.md:1126`)
  > 편집자 결정(18C-40): "【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다." (`reviews/round-18-closing.md:1127`)
  > 편집자 결정(18C-93): "이주(LANDING-125, 그대로): 단일 노드 파서(`parseNumber`는 숫자가 아닌 문자를 지우고 `Math.trunc`로 자름 `src/core/parsers/parseNumber.ts:31-39`, `parseBoolean`은 참 거짓 판정 `parseBoolean.ts:34-41`, `parseString(true)`는 `''` `parseString.ts:34-38`)는 공통 이주를 따른다(WRITE-075의 변환 목록, 실패는 값 보존과 경고등)." (`reviews/round-18-closing.md:2662`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:8-9`(정본. LANDING-120에서 분할), `reviews/round-18-agenda.md:80`, 같은 규칙의 원장 항목 WRITE-052·WRITE-054·WRITE-055, `reviews/round-18-closing.md:1123-1127`, `reviews/round-18-closing.md:2662`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`, `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2711-2715`

### LANDING-126 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH`

- 결정:
  > `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처).
- 보충:
  > 열린 부분(level `warning`만. 가칭 코드와 보내는 때는 같은 문장이라 함께 둔다): "변환하지 못한 입력의 `onError` 기록 level을 편집자가 `'warning'`으로 정해도 되는가, `'error'`인가." (`reviews/round-18-agenda.md:165`)
  > 소유자(12-7 답): "형변환 실패로 문제가 생기는 경우에 대한 대응은 FormType 이 하기로 했잖아. 그래서 개발단계에서는 중요한데, 리얼부터는 어쩔 수 없다고 생각하긴 해. warning 이면 되지않을까?" (`reviews/round-18-owner-answers.md:17`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), `reviews/round-18-owner-answers.md:17`, 같은 규칙의 원장 항목 ERROR-186
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:17`, `reviews/round-18-owner-answers.md:8-9`

### LANDING-127 이주(S1) — 변환 실패 기록은 검증기 유무와 무관하게 보낸다

- 결정:
  > 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), 같은 규칙의 원장 항목 ERROR-187
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 보내는 때)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`

### LANDING-128 이주(18라운드) — 재귀 객체 스키마의 실패가 명시적 청사진 오류 `RECURSIVE_SHAPE_UNBOUNDED`(가칭)로

- 결정:
  > 이주(LANDING-128): 재귀 객체 스키마의 실패 모양이 오늘의 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침에서 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 바뀐다(서지 않는 것은 같고, 명시적 코드가 생긴다).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:33`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:35-41`

### LANDING-129 이주(18라운드) — 원시 타입 둘 이상의 `type` 배열이 `union` 잎과 문자열 입력으로 선다

- 결정:
  > 이주(LANDING-129): 원시 타입 둘 이상의 `type` 배열(예 `['number','string']`, `['string','number','null']`)은 오늘 `UNKNOWN_JSON_SCHEMA`로 폼이 서지 않고, 새 설계에서는 `union` 잎과 문자열 입력으로 선다(사용자에게 보이는 변화).
- 보충:
  > 편집자 결정(18C-93): "이주(LANDING-129, 보충): `['string','number']`처럼 null 없는 두 형과 원소가 셋 이상인 `type` 배열은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:25,28-29` → `src/core/nodes/schemaNodeFactory.ts:116`), 새 설계에서는 union 잎(+nullable)이며 기본 입력은 `{type:'union'}` 감싸개다(18C-92)." (`reviews/round-18-closing.md:2636`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:81`(정본), `reviews/round-18-closing.md:2636`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:2711-2715`

### LANDING-130 이주(18라운드) — `['integer','number']`는 수 노드

- 결정:
  > 이주(LANDING-130): `['integer','number']`는 오늘 `UNKNOWN_JSON_SCHEMA`이고, 새 설계에서는 수 노드다.
- 보충:
  > 편집자 결정(18C-93): "이주(LANDING-130): `['integer','number']`는 오늘 같은 오류이고(`extractSchemaInfo.ts:28-29`), 새 설계에서는 number 노드이며 `schemaType`은 `'number'`다." (`reviews/round-18-closing.md:2637`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:82`(정본), `reviews/round-18-closing.md:2637`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:2711-2715`

### LANDING-131 이주(18라운드) — `dependentSchemas`·`dependencies`를 쓴 스키마에 개발 모드 경고

- 결정:
  > 이주(LANDING-131): `dependentSchemas`나 `dependencies`를 쓴 스키마에 개발 모드 경고가 새로 난다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:104`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:106-110`

### LANDING-132 이주(18라운드) — 조건부 `required`의 필수 표시가 켜진 `then`을 따른다

- 결정:
  > 이주(LANDING-132): 조건부 `required`가 있는 필드의 필수 표시는 오늘 늘 켜지고, 새 설계에서는 켜진 `then`에 따라 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:159`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-06)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:161-164`

### LANDING-133 이주(18라운드) — 같은 값인 객체·배열 `const`끼리의 `allOf`가 통과한다(결함 수정)

- 결정:
  > 이주(LANDING-133): 같은 값인 객체·배열 `const`끼리의 `allOf`는 오늘 `JSONSchemaError`를 던지고, 새 설계와 레거시 모두에서 통과한다(결함 수정).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:200`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:203-207`

### LANDING-134 이주(18라운드) — 여러 `pattern`의 `node.jsonSchema` 표현이 첫 패턴 + `allOf` 항목으로

- 결정:
  > 이주(LANDING-134): 여러 `pattern`의 `node.jsonSchema` 표현이 오늘의 `(?=a)(?=b)` 합성 문자열에서 첫 패턴과 `allOf`의 `{pattern}` 항목으로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:201`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:203-207`

### LANDING-135 이주(18라운드) — 식의 `*` 조각은 청사진 오류

- 결정:
  > 이주(LANDING-135): 식에 쓴 `*` 조각이 청사진 오류가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:366`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`

### LANDING-136 이주(18라운드) — `omitEmpty` 아래에서 `../name === ''` 같은 식은 `undefined`를 본다

- 결정:
  > 이주(LANDING-136): `omitEmpty`(기본 켜짐) 아래에서 `../name === ''` 같은 식은 `undefined`를 보게 되므로 `!../name`으로 고치거나 `omitEmpty`를 끈다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:367`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`

### LANDING-137 이주(18라운드) — `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로

- 결정:
  > 이주(LANDING-137): `controls.watch`의 `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 받는다(입력 구성 요소가 보는 변화).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:368`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`

### LANDING-138 이주(18라운드) — `injectTo` 반환의 `undefined` 항목은 쓰지 않는다

- 결정:
  > 이주(LANDING-138): `injectTo` 반환의 값이 `undefined`인 항목은 오늘 `undefined`로 덮어쓰고, 새 설계에서는 쓰지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:414`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:416-423`

### LANDING-139 이주(18라운드) — 입력이나 `Merge`로 된 `null` 아래의 자식은 채움 없이 없음

- 결정:
  > 이주(LANDING-139): 입력이나 `Merge`로 된 `null` 아래의 자식은 오늘 기본값 상태를 보이고(S4, `ObjectNode/DETAIL.md:19`), 새 설계에서는 채움 없이 없음이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:498`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### LANDING-140 이주(18라운드) — 입력이 넘긴 `Merge`는 자기 입력을 다시 마운트하지 않는다

- 결정:
  > 이주(LANDING-140): 입력이 넘긴 `Merge`는 오늘 `Refresh` 비트로 자기 입력을 다시 마운트하고(`value.ts:63`), 새 설계에서는 다시 마운트하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:499`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### LANDING-141 이주(18라운드) — `Overwrite`와 `Merge`를 함께 주면 `INVALID_WRITE_OPTION`

- 결정:
  > 이주(LANDING-141): `Overwrite | Merge`는 오늘 `Overwrite`로 동작하고(`value.ts:65`), 새 설계에서는 `INVALID_WRITE_OPTION`으로 던진다(`adr/0014-error-policy.md:276` 행의 이주 쪽).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:500`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### LANDING-142 이주(18라운드) — `setValue(undefined)`는 기본값을 다시 채운다

- 결정:
  > 이주(LANDING-142): `setValue(undefined)`(기본 `Overwrite`)는 오늘 채움 없이 비우고(`ObjectNode/DETAIL.md:21`), 새 설계에서는 `default`가 있는 자리에 기본값이 다시 들어간다.
  > 채움 없이 비우려면 `Merge`나 `DisableAutomaticWrites`를 쓴다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `reviews/round-18-closing.md:535-536`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:542-548`

### LANDING-143 이주(18라운드) — 입력의 `onChange(undefined, Overwrite)`는 기본값을 다시 채운다, 스토리 넷 고침

- 결정:
  > 이주(LANDING-143): 입력의 `onChange(undefined, SetValueOption.Overwrite)`는 새 설계에서 로드라 기본값이 다시 채워진다.
  > 값을 빼는 입력은 `Overwrite`를 뺀다.
  > 저장소에서 고칠 곳은 `stories/03.FormTypeInput.stories.tsx:138`(`removeClick`), `:213`, `stories/08.VirtualSchema.stories.tsx:441`, `:531`이다.
  > 입력 작성자에게는 이주 안내 항목(C8)으로 알린다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `reviews/round-18-closing.md:537-540`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:542-548`

### LANDING-144 이주(18라운드) — 로드나 부모가 준 `{}`가 호스트 `default`를 막지 않는다

- 결정:
  > 이주(LANDING-144): 로드한 값이나 부모가 그 자리에 준 `{}`는 오늘 호스트 `default`를 막고(`AbstractNode.ts:1197-1199`), 새 설계에서는 `{}`여도 호스트가 `default`를 받는다(사용자에게 보이는 변화).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:569`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:571-576`

### LANDING-145 이주 44(18라운드 판) — `trim`은 `finishInput` 칸의 자동 쓰기, 바깥 오류·dirty는 그대로, 같은 값이면 쓰지 않음, 흐림 때 다시 마운트

- 결정:
  > 이주(LANDING-145, 이주 44를 대신함): 오늘은 흐림 때 원본을 잘린 값으로 덮고 `RequestRefresh`는 없다(`StringNode.ts:118-121`, `:43`, `value.ts:51`).
  > 새 설계에서는 `finishInput` 칸이 자르고, 쓰기는 자동 쓰기다.
  > 바깥 오류와 dirty는 건드리지 않고(오늘과 같음), 같은 값이면 쓰지 않는다.
  > 자동 쓰기이므로 비제어 입력이 흐림 때 다시 마운트된다(오늘과 다름).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:594-597`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:599-603`

### LANDING-146 이주(18라운드) — `batch(fn)` 안의 updater는 이어지고 평범한 읽기는 직전 커밋

- 결정:
  > 이주(LANDING-146): 오늘은 `batch`가 없고, `setValue`는 부른 자리에서 적용되며 updater도 그 자리의 `value`로 곧바로 계산된다(`AbstractNode.ts:355-364`).
  > 새 설계에서 쓰기를 `batch(fn)`로 묶으면 updater는 오늘처럼 이어진다(+1 두 번이면 +2).
  > 그러나 `fn` 안의 `value`·`outputValue`·`inactiveValues`·`getValue()`는 직전 커밋을 돌려준다.
  > 쓰기 직후 `value`를 읽어 다음 쓰기에 쓰던 코드를 `batch`로 옮기면 updater로 바꾼다.
  > 이주 안내 항목(C8)으로 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:636-640`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:642-648`

### LANDING-147 이주(18라운드) — 가상 노드의 모양이 틀린 쓰기는 `SchemaFormError`로, 같은 길이 문자열 쪼개기는 거부로

- 결정:
  > 이주(LANDING-147): 가상 노드에 모양이 틀린 쓰기의 오류 클래스가 `JSONSchemaError`에서 `SchemaFormError`로 바뀌고, 길이가 같은 문자열을 글자로 쪼개던 동작은 거부로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:673`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-21)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:675-680`

### LANDING-148 이주(18라운드) — `find`는 꺼진 `oneOf` 변형의 노드를 돌려주지 않는다(`null`)

- 결정:
  > 이주(LANDING-148): 오늘 `find`는 꺼진 `oneOf` 변형의 노드를 돌려줄 수 있지만(`findNode.ts:69-85`, 첫 후보로 물러남), 새 설계는 `null`이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:932`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:934-937`

### LANDING-149 이주 47(18라운드 판) — 잎 `terminal: false`·가상 `terminal: true`는 청사진 오류, 가상의 인라인 입력은 `branch`로 `ChildNodeComponents`를 받음

- 결정:
  > 이주(LANDING-149, 08 §14 47행의 새 설계 칸): 잎의 `options.terminal: false`와 가상의 `options.terminal: true`는 청사진 오류(가칭 `TERMINAL_OPTION_UNSUPPORTED`)이니 지운다.
  > 가상의 인라인 `FormTypeInput`은 그대로 그려지며 `ChildNodeComponents`를 받고(오늘은 비워짐), `node.strategy`는 `'branch'`이고 `isTerminalNode(가상)`은 참에서 거짓으로 바뀐다(오늘 `group`은 `'terminal'`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1037-1038`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1040-1047`

### LANDING-150 착수 항목(18라운드) — parse 문서는 새 자리의 문서로 PR-2, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7

- 결정:
  > 【추론】 parse의 문서(오늘 `src/core/parsers/INTENT.md`가 맡던 것)는 새 자리(`src/core/behaviors/utils/parse/`, 18C-36)의 문서로 PR-2의 착수 항목이고, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7의 착수 항목이다(LANDING-150).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1132`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`

### LANDING-151 착수 항목(18라운드) — 자사 플러그인 수정 목록은 PR-7 이주 항목

- 결정:
  > 자사 플러그인 수정 목록은 PR-7 이주 항목이다: antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151).
- 보충:
  > 편집자 결정(18C-93): "【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다." (`reviews/round-18-closing.md:2665`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1115`(정본), `reviews/round-18-closing.md:2665`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2711-2715`

### LANDING-152 이주(18라운드) — `globalState`의 키는 참인 노드가 없으면 내려간다

- 결정:
  > 이주(LANDING-152): `globalState`의 키는 오늘 루트에서만 비워지고, 새 설계에서는 참인 노드가 없으면 내려간다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1170`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1173-1176`

### LANDING-153 이주(18라운드) — `globalState`의 값은 `true`

- 결정:
  > 이주(LANDING-153): `globalState`는 오늘 마지막으로 쓴 참인 값을 그대로 들고, 새 설계에서는 비불리언 상태 값도 `true`가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1171`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1173-1176`

### LANDING-154 이주(18라운드) — 노드의 `key`·`schemaPath`가 없어진다

- 결정:
  > 이주(LANDING-154): 오늘의 `node.key`·`node.schemaPath`는 새 설계에 없다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1210`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1212-1214`

### LANDING-155 이주(18라운드) — `defaultValue`는 로드를 따르고 배열 아이템은 구조 연산을 따라 자기 값을 지킨다

- 결정:
  > 이주(LANDING-155): `defaultValue`는 그 경로에 닿는 로드마다 새 로드 값이 되고, 배열 아이템은 구조 연산을 따라 자기 값을 지킨다.
  > 오늘 `defaultValue`는 노드가 생긴 뒤 바뀌지 않는다(`AbstractNode.ts:290-296`).
- 보충:
  > 반영 칸(18C 검토 4번, 로드 스냅숏): "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 18C-44의 규칙은 그대로다)." (`reviews/round-18-owner-answers.md:26`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1237-1238`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1240-1247`

### LANDING-156 이주(18라운드) — `find('@')`·`findAll('@')`는 맥락 노드를 돌려주지 않는다

- 결정:
  > 이주(LANDING-156): `find('@')`·`findAll('@')`는 오늘 맥락 노드를 돌려주고, 새 설계에서는 `null`·빈 배열을 돌려준다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1262`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1264-1268`

### LANDING-157 이주(18라운드) — `NodeState` → `SchemaNodeState`

- 결정:
  > 이주(LANDING-157): 공개 형 `NodeState`의 이름이 `SchemaNodeState`로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1300`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1303-1306`

### LANDING-158 이주(18라운드) — `NodeEventType` → `SchemaNodeEventType`

- 결정:
  > 이주(LANDING-158): 공개 이벤트 형 `NodeEventType`의 이름이 `SchemaNodeEventType`으로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1301`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1303-1306`

### LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치

- 결정:
  > 【추론】 레거시 디렉토리는 `src/__legacy__/`다.
  > 【추론】 옮기는 파일은 원래의 `src/` 아래 상대 경로를 그대로 둔다(`src/core/nodes/` → `src/__legacy__/core/nodes/`).
  > 【추론】 import는 별칭 접두만 바꾼다(`@/schema-form/core/nodes` → `@/schema-form/__legacy__/core/nodes`).
  > 【추론】 PR마다 그 PR이 새로 쓰는 영역의 옛 파일만 옮긴다.
  > 【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다.
  > 【추론】 이것으로 새 `src/core/__tests__/scenarios/` 자리가 빈다.
  > 【추론】 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse(18C-36)를 가져오지 않으므로, 아래 규칙 2의 허용 목록은 바뀌지 않는다.
  > 【추론】 규칙 1: 새 fractal(PR-1부터 새로 쓴 것)은 `__legacy__`를 가져오지 않는다.
  > 【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다.
  > 【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다).
  > 【추론】 규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다.
  > 【추론】 새 엔진은 PR-7 전까지 `<Form>`에 닿지 않는다.
  > 【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다.
  > 【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다.
  > 【추론】 빌드와 공개 진입점에서 따로 뺄 설정은 두지 않는다.
  > 【추론】 rolldown은 `src/index.ts`가 닿는 것만 묶는다.
  > 【추론】 그 사이의 산출물은 옛 엔진이고, 우산 브랜치는 PR-8 전에 배포하지 않으며, PR-7이 디렉토리를 지운다.
  > 【추론】 이름을 `__legacy__`로 하는 것은 filid 분류 규칙 (3)으로 organ이 확정되어 설계의 fractal로 읽히지 않기 때문이다.
  > 【추론】 저장소의 `__tests__` 관례와 모양이 같다.
  > 【추론】 `src` 안에 두면 tsc·eslint·Storybook의 포함 규칙과 `@/schema-form` 별칭이 설정 변경 없이 따라간다.
  > 【추론】 저장소 filid 설정(`.filid/config.json`)은 `max-depth`를 severity `error`, `maxDepth: 14`로 건다.
  > 【추론】 가장 깊은 `src` 디렉토리가 저장소 뿌리에서 13단이므로 `__legacy__`를 끼우면 14단이다.
  > 【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다.
  > 【추론】 옛 코드와 함께 사는 `__tests__`는 코드와 함께 옮겨지고, PR-7까지 그대로 돈다.
  > 【추론】 `<Form>`이 쓰는 옛 엔진을 지키는 것이다.
  > 【추론】 09 §4.3의 처분은 파일마다 한다.
  > 【추론】 "그대로 산다"는 단위가 새 자리로 옮겨 가는 PR에서 함께 새 자리로 간다(레거시가 아님).
  > 【추론】 "버리고 새로 쓴다"는 레거시로 옮겨 돌다가, 그 상황 목록이 대체 PR의 데이터 모듈로 옮겨진 뒤 PR-7에서 디렉토리와 함께 지운다.
  > 【추론】 "표면만 고친다" 렌더 시나리오 17파일과 `src/__tests__`의 나머지는 `<Form>`을 시험하므로 자리를 지키다가 PR-7에서 처분한다.
  > 【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다.
  > 【추론】 옛 스토리(`stories/`)는 `../src`의 진입점으로 옛 엔진을 그리므로 PR-7까지 그대로 돈다.
  > 【추론】 새 문법의 시나리오 스토리는 `<Form>`이 새 엔진을 쓰는 PR-7부터 그릴 수 있다.
  > 【추론】 PR-7이 09 §5.4대로 옛 스토리를 정리한다(16라운드 답 4 "전체 정리 허용").
  > 【추론】 옛 엔진의 마지막 벤치 기준선(`bench:baseline`)은 PR-2가 `core/nodes`를 옮기기 전에 잰다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1330-1363`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1365-1368`

### LANDING-160 이주(18라운드) — 수 노드의 근사 같음 비교가 정확한 비교로

- 결정:
  > 이주(LANDING-160): 오늘 `NumberNode.__equals__`의 근사 비교(`src/core/nodes/NumberNode/NumberNode.ts:28-38`, `isClose`)는 정확한 비교가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1400`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-161 이주(18라운드) — 객체 같음 비교가 키 순서를 본다

- 결정:
  > 이주(LANDING-161): `ObjectNode`의 키 순서를 무시하는 `equals`(`ObjectNode.ts:46-52`)는 키 순서를 보게 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1401`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-162 이주(18라운드) — 내장 객체·클래스 인스턴스는 참조로 비교

- 결정:
  > 이주(LANDING-162): 오늘 `ObjectNode.__equals__`가 쓰는 `@winglet/common-utils/object`의 `equals`(`packages/winglet/common-utils/src/utils/object/equals/equals.ts`)는 내장 객체(`Date` 등)를 내부 상태로, 클래스 인스턴스를 구조로 비교하며, 새 규칙 (가)는 이들을 참조로 본다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1402`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-163 이주(18라운드) — `derived`는 자기 의존 집합에서만 발화

- 결정:
  > 이주(LANDING-163): 오늘은 노드의 모든 계산 속성이 한 의존 배열을 나눠(`ComputedPropertiesManager.ts:264-268`, `AbstractNode.ts:516-555`) `active`만 읽는 경로가 바뀌어도 `derived`를 다시 세고, 새 설계에서는 `derived`가 자기 의존 집합에서만 발화한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1403`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-164 이주(18라운드) — 배열 통째 쓰기가 아이템 키를 잇는다(상태가 위치를 따라감)

- 결정:
  > 이주(LANDING-164): 통째 쓰기가 아이템 키를 새로 만들지 않아 `dirty`·`touched`·바깥 오류·가상화 기록·컨테이너 입력의 비값 상태·소비자가 든 노드 참조가 위치를 따라가며, 오늘은 `clear` 뒤 전량 `push`라 모두 새로 시작한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1683`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### LANDING-165 이주(18라운드) — 닫힌 튜플 뒤의 값이 방출된다

- 결정:
  > 이주(LANDING-165): 닫힌 튜플 뒤의 값이 버려지지 않고 방출된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1684`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### LANDING-166 이주(18라운드) — 사용자가 일으킨 `injectTo`가 null 조상을 객체로 만들지 않는다

- 결정:
  > 이주(LANDING-166): 사용자 쓰기가 일으킨 `injectTo`가 null 조상을 객체로 만들던 동작(`ObjectNode/DETAIL.md:14,16`)이 사라져, 값은 null 조상 아래에 그려지지만 방출되지 않는다.
  > 이주 안내 항목(C8)으로 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1847-1848`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1850-1855`

### LANDING-167 이주(18라운드) — 인라인 입력을 둔 가상 노드 아래 경로의 `find`가 참조된 노드를 돌려준다

- 결정:
  > 이주(LANDING-167): 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로의 `find`는 오늘 그 가상 노드를 돌려주고(오늘 가상의 인라인 입력은 `'terminal'`이고 `findNode`는 터미널에 닿으면 남은 경로를 무시한다), 새 설계에서는 참조된 노드를 돌려준다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1909`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1911-1914`

### LANDING-168 이주(18라운드) — Form 속성의 잠금 동안 입력의 `onChange`는 버려진다

- 결정:
  > 이주(LANDING-168): Form 속성의 잠금(`readOnly`·`disabled`)이 켜진 동안 입력의 `onChange`는 버려지며, 오늘은 노드 자신의 잠금만 버리고(`SchemaNodeInput.tsx:51`) Form 속성의 잠금은 입력 prop으로만 넘긴다(`:111-112`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2004`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2006-2008`

### LANDING-169 이주(18라운드) — 루트 수준 검증 오류의 `dataPath`가 `'/'`에서 `''`로

- 결정:
  > 이주(LANDING-169): 루트 수준 검증 오류의 공개 `dataPath`가 `'/'`에서 `''`로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2057`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2059-2062`

### LANDING-170 명령 `RequestEmitChange`·`RequestInjection`은 새 설계에 없음(이주 행 없음), 공개 훅 셋 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름·시그니처 유지, `useChildNodeErrors`는 PR-7에 새 통지로 다시 구현

- 결정:
  > 【추론】 (1) `RequestEmitChange`·`RequestInjection`은 새 설계에 없다.
  > 【추론】 둘 다 오늘의 이벤트 사슬 전파가 쓰던 내부 비트다(`BranchStrategy.ts:145`, `AbstractNode.ts:974-977`).
  > 【추론】 새 설계에서는 방출과 `controls.injectTo`가 정착 루프의 구조(작업 루프의 커밋과 파생 단계)이며, "전파와 통지가 옵션이 아니라 구조"다(GOAL-075).
  > 【추론】 오늘 공개 `NodeEventType`(=`PublicNodeEventType` 여섯, `src/core/types/event.ts:85-92`, `src/index.ts:44`)에 없고 소비자가 publish할 수도 없으므로(`reviews/round-5-derivations.md:22` C-11) 이주 행은 두지 않는다.
  > 【추론】 (2) 05 §3이 든 공개 훅 가운데 REACT-006이 다루지 않은 셋, `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름과 시그니처를 유지한다(`src/index.ts:82-84`).
  > 【추론】 `useChildNodeComponentMap`은 `ChildNodeComponents`의 `field`만 쓰는 렌더 계층 도우미라 그대로 둔다.
  > 【추론】 `useChildNodeErrors`는 PR-7에서 새 통지(`UpdateChildren`에 대응하는 형상 변경, `UpdateState`, 18C-83의 `UpdatePath`)로 다시 구현하며, 반환형의 `JSONSchemaError`는 `ValidationIssue`로 바뀐다(§14의 21행, LANDING-070).
  > 【추론】 `useFormSubmit`은 `FormHandle.submit`의 `subscribe`·`pending` 위에 서 있고, `degraded` 동안 제출 거부 경로로 이미 새 설계에 쓰였으므로(`adr/0014-error-policy.md:237`) 유지한다.
  > 【추론】 이 결정은 명령 둘과 훅 셋에 한정한다.
  > 【추론】 같은 원문의 나머지 미확인(`Form` props 14, `FormHandle` 8, `NodeEventType` 17종의 개별 생사, `ValidationMode`, `oneOfIndex`/`anyOfIndices`, `type: 'virtual'`, root 폴백, 빈 값 경로)은 이 행의 범위가 아니며, `alias`·`placeholder`·`errorMessages`는 18C-72가 닫는다.
- 보충:
  > 소유자(18C 검토 5번): "브레이킹 체인지를 할거라 제거되는 명령은 없애버려도 됩니다." (`reviews/round-18-owner-answers.md:27`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2256-2265`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86), 소유자 답(`reviews/round-18-owner-answers.md:27` 18C 검토 5번; 제거 확인)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2267-2268`

### LANDING-171 이주(18라운드) — 빈 중첩 객체·배열 노드의 `outputValue`는 `omitEmpty` 아래에서 `undefined`(오늘 `normalizedValue`는 `{}`·`[]`)

- 결정:
  > 이주(LANDING-171): 빈 중첩 객체·배열 노드의 `normalizedValue`는 오늘 `{}`·`[]`이고(`src/helpers/defaultValue/getEmptyValue/getEmptyValue.ts:8-14`, `src/core/nodes/AbstractNode/AbstractNode.ts:397-399`), 새 설계의 `outputValue`는 `omitEmpty`(기본 켜짐) 아래에서 `undefined`다(18C-88).
  > `node.value`(투영 전)는 오늘처럼 `{}`·`[]`이고, 부모의 값과 `FormHandle.getValue()`에는 오늘처럼 그 키가 없다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2287-2288`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2290-2296`

### LANDING-172 이주(18라운드) — `['object','string']`·`['object','array']`·`['array','string']`은 터미널 강제 `union`(안쪽 `find` 없음, `{}`·`[]` 방출은 `omitEmpty: false`)

- 결정:
  > 이주(LANDING-172): `['object','string']`·`['object','array']`·`['array','string']`은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116`), 새 설계에서는 터미널 강제 union이며 안쪽 `find`는 없고 `{}`·`[]`를 방출하려면 `omitEmpty: false`를 적는다(`reviews/round-18-owner-answers.md:29`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2638`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-173 이주(18라운드) — `type` 배열과 함께 적힌 `nullable:true`는 nullable(오늘 배열 경로가 보지 않음)

- 결정:
  > 이주(LANDING-173): `type`이 배열이고 `nullable:true`가 함께 있으면(`{type:['string'], nullable:true}` 같은 비 union 포함) 오늘은 배열 경로가 `nullable`을 보지 않고(`extractSchemaInfo.ts:24-34`), 새 설계에서는 `nullable: true`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2639`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-174 이주(18라운드) — 형 없는 원시 `anyOf`·`oneOf`(TypeBox·pydantic·zod)는 `union`·원시 잎

- 결정:
  > 이주(LANDING-174): 형 없는 원시 `anyOf`·`oneOf`(TypeBox, pydantic, zod)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 union·원시 잎(+nullable)이다(`reviews/round-18-owner-answers.md:30`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2640`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-175 이주(18라운드) — 형 없는 칸의 분기가 모두 null 분기이면 nullable null 노드

- 결정:
  > 이주(LANDING-175): 형 없는 칸의 분기가 모두 null 분기인 것(`{anyOf:[{type:'null'}]}`)은 오늘 같은 오류이고(`extractSchemaInfo.ts:23`), 새 설계에서는 nullable null 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2641`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-176 이주(18라운드) — 형 없는 `{allOf:[{type:'string'}]}`는 string 노드

- 결정:
  > 이주(LANDING-176): 형 없는 `{allOf:[{type:'string'}]}`는 오늘 병합 처리기가 없어 오류이고(`src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:31-32`), 새 설계에서는 string 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2642`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-177 이주(18라운드) — `['null','null']`은 `UNKNOWN_JSON_SCHEMA`(오늘 nullable null 노드)

- 결정:
  > 이주(LANDING-177): `['null','null']`은 오늘 nullable null 노드이고(`extractSchemaInfo.ts:28,30`), 새 설계에서는 `UNKNOWN_JSON_SCHEMA`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2643`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-178 이주(18라운드) — nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 효과 없음

- 결정:
  > 이주(LANDING-178): nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 오늘 null을 빼고(`src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts:57,65-67`), 새 설계에서는 효과가 없다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2644`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-179 이주(18라운드) — `{type:['string','null'], allOf:[{type:['number','null']}]}`는 nullable null 노드(오늘 `ALL_OF_TYPE_REDEFINITION`)

- 결정:
  > 이주(LANDING-179): `{type:['string','null'], allOf:[{type:['number','null']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`winglet/json-schema/src/filters/isCompatibleSchemaType.ts:62-68`), 새 설계에서는 nullable null 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2645`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-180 이주(18라운드) — `{type:'number', allOf:[{type:['number','string']}]}`는 교집합인 number 노드(오늘 `ALL_OF_TYPE_REDEFINITION`)

- 결정:
  > 이주(LANDING-180): `{type:'number', allOf:[{type:['number','string']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`processAllOfSchema.ts:45-50` ← `validateCompatibility.ts:21-25` ← `isCompatibleSchemaType.ts:77-83`), 새 설계에서는 교집합인 number 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2646`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-181 이주(18라운드) — `Hint.type`·`FormTypeInputProps.type`은 `node.type`(정수 노드는 `'number'`), 새 칸 `schemaType`

- 결정:
  > 이주(LANDING-181): `Hint.type`·`FormTypeInputProps.type`은 오늘 `node.schemaType`이고(`src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:70`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:124`), 새 설계에서는 `node.type`이며 정수 노드는 `'integer'`에서 `'number'`로 바뀌고 새 칸 `schemaType`이 생긴다(`reviews/round-18-owner-answers.md:36`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2647`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-182 이주(18라운드) — `{type:['number','integer']}` 시험은 `{type:'number'}`, 정수만이면 `{schemaType:'integer'}`

- 결정:
  > 이주(LANDING-182): `{type:['number','integer']}` 시험(코어 `src/formTypeDefinitions/FormTypeInputNumber.tsx:44`, antd5·antd6 Number `:62`·Slider `:53`, antd-mobile Number `:51`, mui Number `:120`)은 새 설계에서 `{type:'number'}`이고, 정수만이면 `{schemaType:'integer'}`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2648`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-183 이주(18라운드) — 함수 시험의 `type === 'integer'` 절은 죽은 조건이라 지움

- 결정:
  > 이주(LANDING-183): 함수 시험의 `type === 'integer'` 절(antd5·antd6 RadioGroup `:86`, antd-mobile RadioGroup `:91`·Slider `:59`, mui RadioGroup `:125`·Slider `:114`)은 죽은 조건이므로 지운다(TS2367로 드러남).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2649`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-184 이주(18라운드) — mui 수 입력 — 빈 칸 `undefined`, 정수 판정 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안

- 결정:
  > 이주(LANDING-184): mui 수 입력은 오늘 빈 칸이 `null`이고(`schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:74-76`), 정수를 `type === 'integer'`로 판정해 `parseInt`로 자르며(`:81`), `step`을 쓴다(`:109`). 새 설계에서는 빈 칸이 `undefined`, 판정은 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안이다(REACT-027, WRITE-075).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2650`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-185 이주(18라운드) — `FormTypeTestObject`의 `type`은 `SchemaNodeType`이나 그 배열, 새 키 `schemaType`

- 결정:
  > 이주(LANDING-185): `FormTypeTestObject` 형 선언은 오늘 `type: JSONSchemaType | JSONSchemaType[]`이고(`src/types/formTypeInput.ts:163`), 새 설계에서는 `type: SchemaNodeType | SchemaNodeType[]`와 새 키 `schemaType`이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2651`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-186 이주(18라운드) — 시험 객체의 모르는 키는 대조에서 빼고 개발 모드 경고(오늘 `{typo: undefined}`가 우연히 맞음)

- 결정:
  > 이주(LANDING-186): 시험 객체의 모르는 키는 오늘 모든 키를 비교해 `{typo: undefined}`가 우연히 맞고(`src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`), 새 설계에서는 대조에서 빼고 개발 모드 경고를 낸다(18C-92).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2652`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-187 이주(18라운드) — 코어 기본 입력 정의는 `{type:'union'}` 감싸개를 더해 열한 개

- 결정:
  > 이주(LANDING-187): 코어 기본 입력 정의는 오늘 열 개이고(`src/formTypeDefinitions/index.tsx:14-25`), 새 설계에서는 `{type:'union'}` 감싸개를 더해 열한 개다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2653`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-188 이주(18라운드) — 가드 `isTerminalNode`·`isBranchNode`는 `strategy`를 보고 반환 형에 `UnionNode`가 더해짐

- 결정:
  > 이주(LANDING-188): 가드 `isTerminalNode`·`isBranchNode`는 오늘 `node.group`을 보고(`src/core/nodes/filter.ts:77,198`) `isTerminalNode`의 반환 형은 `BooleanNode | NumberNode | StringNode | NullNode`이며(`:197`), 새 설계에서는 `strategy`를 보고 반환 형에 `UnionNode`가 더해지며 좁힌 뒤 `switch (node.type)`에 `case 'union'`이 필요하다(18C-89).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2654`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-189 이주(18라운드) — `InferValueType`의 `as const` `type` 배열은 `any`에서 정확한 합 형으로

- 결정:
  > 이주(LANDING-189): `InferValueType`의 `as const` `type` 배열은 오늘 `any`이고(`src/types/value.ts:10-15`), 새 설계에서는 정확한 합 형이며 새 형 오류가 날 수 있다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2655`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-190 이주(18라운드) — 합 형에 대한 `InferJSONSchema`는 분배되지 않고 `UnionSchema`·`UnionNode`

- 결정:
  > 이주(LANDING-190): `InferJSONSchema<A|B>`는 오늘 분배되어 `StringNode | NumberNode`이고(`src/types/jsonSchema.ts:40-88`), 새 설계에서는 `UnionSchema`와 `UnionNode`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2656`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-191 이주(18라운드) — `SchemaNode` 합집합과 `FormTypeRendererProps.type`에 `UnionNode`·`'union'`(망라 `switch`에 `case 'union'`)

- 결정:
  > 이주(LANDING-191): `SchemaNode` 합집합과 `FormTypeRendererProps.type`에는 오늘 `UnionNode`와 `'union'`이 없고(`src/types/formTypeRenderer.ts:21`), 새 설계에서는 망라 `switch`에 `case 'union'`을 더한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2657`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-192 이주(18라운드) — 값을 바꾸는 옵션을 켠 ajv 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`(가칭)를 던짐

- 결정:
  > 이주(LANDING-192): `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 ajv 인스턴스의 `bind`는 오늘 받아들이고 살아 있는 폼 값이 제자리에서 바뀌며(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:46`, `src/core/nodes/AbstractNode/AbstractNode.ts:718`, `schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`), 새 설계에서는 `bind`가 `VALIDATOR_BIND_REFUSED`를 던지므로 폼에는 값을 바꾸지 않는 인스턴스를 따로 만들어 넘긴다(`reviews/round-18-owner-answers.md:34`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2658`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-193 이주(18라운드) — 검증기에 넘기는 스키마 사본은 깊은 사본 한 번(오늘 얕음)

- 결정:
  > 이주(LANDING-193): 검증기에 넘기는 스키마 사본은 오늘 얕고(`createValidatorFactory.ts:19-22`, `src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:32-36`), 새 설계에서는 깊은 사본을 한 번 만든다(`reviews/round-18-owner-answers.md:34`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2659`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-194 이주(18라운드) — ajv8에서 union `type`의 `strictTypes` 로그 경고가 없어짐(`allowUnionTypes`)

- 결정:
  > 이주(LANDING-194): ajv8에서 union `type`은 오늘 `strictTypes` 로그 경고를 내고(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`에 `strict` 없음, `node_modules/ajv/lib/core.ts:250`의 기본 `"log"`), 새 설계에서는 경고가 없다(`allowUnionTypes`, 18C-90).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2660`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-195 이주(18라운드) — 터미널 아래 경로의 검증 에러는 터미널(union) 노드가 받음(오늘 버려짐)

- 결정:
  > 이주(LANDING-195): 터미널 아래 경로의 검증 에러는 오늘 버려지고(`src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:150`), 새 설계에서는 터미널(union) 노드가 받는다(18C-91).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2661`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-196 이주(18라운드) — 기본 입력의 빈 칸은 `undefined`, 해석할 수 없는 초안은 흐려질 때 되돌림

- 결정:
  > 이주(LANDING-196): 기본 입력의 빈 칸과 초안은 오늘 문자열 입력이 글을 그대로 보내고(`src/formTypeDefinitions/FormTypeInputString.tsx:27-29`) 수 입력이 `valueAsNumber`를 보내며(`src/formTypeDefinitions/FormTypeInputNumber.tsx:22-24`), 새 설계에서는 REACT-027을 따라 빈 칸은 `undefined`이고 해석할 수 없는 초안은 흐려질 때 되돌린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2663`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-197 이주(18라운드) — 터미널 object·array 값 안의 JSON 부정합에 개발 모드 경고 (가칭) `NON_JSON_WHOLE_VALUE`

- 결정:
  > 이주(LANDING-197): 터미널 object·array 값 안의 JSON 부정합은 오늘 검사가 없고, 새 설계에서는 개발 모드 경고 `NON_JSON_WHOLE_VALUE`를 낸다(18C-91).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2664`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조

- 결정:
  > 【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다.
  > 【추론】 바뀌지 않는 것: `['object','null']`은 nullable object이고, `['null']`은 null 노드다.
  > 【추론】 바뀌지 않는 것: `[]`와 `['string','string']`은 오류다.
  > 【추론】 바뀌지 않는 것: `{type:'number', allOf:[{type:'integer'}]}`와 `{type:'integer', allOf:[{type:'number'}]}`의 `schemaType`은 `'integer'`다(`processSchemaType.ts:73`, `isCompatibleSchemaType.ts:90-93`).
  > 【추론】 바뀌지 않는 것: `{type:'string', allOf:[{type:['string','null']}]}`는 nullable이 아닌 string이다.
  > 【추론】 바뀌지 않는 것: 서로소인 정적 선언(`{type:'string', allOf:[{type:'number'}]}`)은 `ALL_OF_TYPE_REDEFINITION`이다.
  > 【추론】 바뀌지 않는 것: union이 아닌 모든 노드의 `schemaType` 값.
  > PR: PR-7(이주 점검), 시험은 각 줄의 PR(청사진 PR-1, 행 PR-2, 검증기 PR-4, 렌더 PR-7)
  > 무엇: 이주 행마다 오늘 동작과 새 동작을 시험으로 대조하고, 자사 플러그인(antd5·antd6·antd-mobile·mui·ajv6·7·8)의 수정 목록을 LANDING-151과 대조한다.
  > 통과: 오늘과 다른 곳마다 이주 행이 있고, 시험 목록의 모든 줄이 통과한다.
  > 실패: 빠진 이주 행을 더하고, 시험이 규칙과 어긋나면 해당 블록(18C-89–18C-92)을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2665-2671,2717-2720`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-199 이주(18라운드) — 호출자의 `setValue(V)`는 하위 트리 전체가 아니라 원본이 바뀐 노드만 다시 마운트

- 결정:
  > 이주(LANDING-199): 호출자의 `setValue(V)`(`Overwrite`)는 오늘 브랜치에도 Refresh를 내어 하위 트리 전체를 다시 마운트하고(`08-design-a-to-z.md:471`의 오늘 칸), 새 설계에서는 원본이 실제로 바뀐 노드만 다시 마운트한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2732`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2734-2736`

### LANDING-200 이주(18라운드) — 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아와도 자식 기본값을 채우지 않는다

- 결정:
  > 이주(LANDING-200): 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아오면 오늘은 null인 동안 자식이 든 기본값이 나타나고(`src/core/nodes/ObjectNode/DETAIL.md:19-20`), 새 설계에서는 채우지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2814`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-201 이주(18라운드) — 입력의 `onChange(v, Overwrite)`는 자기 입력을 다시 마운트하지 않는다

- 결정:
  > 이주(LANDING-201): 입력의 `onChange(v, SetValueOption.Overwrite)`는 오늘 `Overwrite`에 든 `Refresh` 비트로 자기 입력을 다시 마운트하고(`src/core/types/value.ts:63,65`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:50-53,121`, `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:37`), 새 설계에서는 다시 마운트하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2815`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-202 이주(18라운드) — 배열 통째 `setValue`는 남은 아이템을 채우지 않고 뒤쪽의 새 아이템만 채운다

- 결정:
  > 이주(LANDING-202): 배열을 통째로 쓰는 `setValue`는 오늘 아이템을 다시 만들어 모두 채우고(탐침 P8, `reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`), 새 설계에서는 위치로 이어 남은 아이템은 채우지 않고 뒤쪽에 새로 생긴 아이템만 채운다(NODE-051, WRITE-090).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2816`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-203 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다

- 결정:
  > PR: PR-7(이주 점검)·PR-5(배열)
  > 무엇: 세 장면을 오늘 코드와 새 구현에서 돌린다.
  > 통과: 오늘 결과가 T1-B의 탐침과 같고 새 결과가 이주 행대로다.
  > 실패: 다르면 이주 행을 고친다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2822-2825`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`
