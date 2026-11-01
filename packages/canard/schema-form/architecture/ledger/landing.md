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
| LANDING-045 | 이주 42 — `diagnostics`는 `'stable'`·`'degraded'`, 다음 로드까지 남고 그 동안 제출 거부 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21; `recursion`·`writeShape` 값 추가) |
| LANDING-046 | 이주 43 — 바운더리는 가두고 대체 화면을 그린 뒤 다시 던지지 않고 보고 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) |
| LANDING-047 | 이주 44 — `trim`은 포커스 아웃 때 `finishInput` 칸이 자르고 입력 출처 쓰기로 다룸 | 대체됨(→ LANDING-145) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| LANDING-048 | 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38·18C-89; `UnionNode` 포함, 가상 제외) |
| LANDING-049 | 이주 46 — 노드 메서드 `findAll`은 `findNodes` | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조) |
| LANDING-050 | 이주 47 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 인라인 입력)의 처리와 이주 | 대체됨(→ LANDING-149) | 편집자 결정(17라운드, 18라운드 안건 N14로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38) |
| LANDING-051 | 배포는 한 번, 개발은 우산 브랜치 안의 PR 아홉으로 나눔 | 현행 | 소유자 답(`00-goals.md:110` C7), 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-052 | 전환 방식 — 옛 코드는 레거시로 옮기고 새로 쓰며 옛 이름과의 중복은 기준이 아님 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식) |
| LANDING-053 | 새 엔진은 전환 PR 전까지 `<Form>`에 닿지 않고 점진 교체는 하지 않음 | 현행 | 편집자 결정(17라운드, `08-design-a-to-z.md:552` antigravity 검토와 같은 판단) |
| LANDING-054 | 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법 | 대체됨(→ LANDING-159) | 편집자 결정(17라운드, 18라운드 안건 §8로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49) |
| LANDING-055 | 문서가 코드보다 먼저 바뀜 — 각 PR은 새 fractal의 INTENT·DETAIL로 시작, 이름은 책임으로 | 현행 | 원리(filid 규칙, 저장소 `.claude/rules/filid_code-placement.md` §5), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름, 책임별로 나눔) |
| LANDING-056 | 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙) |
| LANDING-057 | 겉면 규칙과 behaviors 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조 스웜 정련; `reviews/round-17-owner-answers.md:25` 반영 칸) |
| LANDING-058 | 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:562`), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4) |
| LANDING-059 | 릴리스는 `master` 병합 뒤의 배포이며 판 올림 PR 병합이 시험 관문을 거쳐 자동 배포 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2의 일곱째) |
| LANDING-060 | PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가), 소유자 답(`reviews/round-18-owner-answers.md:16` 12-6) |
| LANDING-061 | PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화 | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음) |
| LANDING-062 | PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25; 예산·배열 기록의 PR 배분) |
| LANDING-063 | PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4) |
| LANDING-064 | PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-065 | PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`), 편집자 결정(18라운드, SURFACE-005; 배열 쓰기는 다섯) |
| LANDING-066 | PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, LANDING-092; 하위 트리 규칙은 PR-2) |
| LANDING-067 | PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-068 | PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트 | 현행 | 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, TEST-045; `CHANGELOG.md`는 action이 만듦) |
| LANDING-069 | 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분 | 현행 | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수), 소유자 답(`reviews/round-16-owner-answers.md:13` 7) |
| LANDING-070 | 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자 | 현행 | 편집자 결정(16라운드 정착 검토 조건 1·6, `09-landing-and-test-strategy.md:19,24`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 17라운드 스웜 수렴(편집자 결정) |
| LANDING-071 | 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:600`) |
| LANDING-072 | PR-7을 더 쪼갤 수 없는 이유 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:601`) |
| LANDING-073 | 정착 조건 1 — 가드 계약 `compileGuard(root, pointer)`, ajv 셋의 동기 경로, 코어의 작성 루트 기준 캐시 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-074 | 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교) |
| LANDING-075 | 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함) | 현행 | 17라운드 스웜 수렴(편집자 결정, 첫째·넷째), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 편집자 결정(16라운드, 다섯째) |
| LANDING-076 | 정착 조건 4 — 상태·오류·명령 사건과 검증 결과의 배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3) |
| LANDING-077 | 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-078 | 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-079 | 정착 조건 7 — 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조 수렴) |
| LANDING-080 | 정착 조건 8 — 훅·바인딩 시험과 React 18 실행 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:11` 5), 편집자 결정(16라운드 정착 검토) |
| LANDING-081 | 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/` | 현행 | 편집자 결정(16라운드 정착 검토), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 잎 교차 함수의 뜻 변경) |
| LANDING-082 | 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49·18C-36), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-33·18C-93; 형 판정·탐색 멤버 대체) |
| LANDING-083 | 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/` | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-084 | 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, 진입 사슬은 `dispatch`가 소유) |
| LANDING-085 | 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/` | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈) |
| LANDING-086 | 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-087 | 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-088 | `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침 | 현행 | 편집자 결정(16라운드 정착 검토), 원리(filid 규칙, 문서가 코드보다 먼저) |
| LANDING-089 | 정착 지도의 '그대로 쓰는 것'은 레거시에서 가져오는 코드의 목록 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식), 편집자 결정(17라운드, `09-landing-and-test-strategy.md:42`) |
| LANDING-090 | 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지 | 현행 | 편집자 결정(16라운드, 테스트 전략), 소유자 답(`reviews/round-16-owner-answers.md:14` 8), 소유자 답(`reviews/round-16-owner-answers.md:10` 4) |
| LANDING-091 | 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교) |
| LANDING-092 | 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙 | 현행 | 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02; PR-2에 `union` 행) |
| LANDING-093 | 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30·18C-74), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-094 | 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(16라운드 정착 검토) |
| LANDING-095 | 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-096 | 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2) |
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
| LANDING-109 | 06 §9의 5 이주 안내 항목(C8) — 8라운드가 새로 올린 것 | 현행(기록) | 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)), 소유자 답(`reviews/round-24-owner-answers.md:7` PR #348 검토; 현행(기록)으로 내린 것에 동의) |
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
| LANDING-126 | 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH` | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
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
| LANDING-151 | 착수 항목(18라운드) — 자사 플러그인 수정 목록은 PR-7 이주 항목 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-152 | 이주(18라운드) — `globalState`의 키는 참인 노드가 없으면 내려간다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| LANDING-153 | 이주(18라운드) — `globalState`의 값은 `true` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| LANDING-154 | 이주(18라운드) — 노드의 `key`·`schemaPath`가 없어진다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43) |
| LANDING-155 | 이주(18라운드) — `defaultValue`는 로드를 따르고 배열 아이템은 구조 연산을 따라 자기 값을 지킨다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| LANDING-156 | 이주(18라운드) — `find('@')`·`findAll('@')`는 맥락 노드를 돌려주지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45) |
| LANDING-157 | 이주(18라운드) — `NodeState` → `SchemaNodeState` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| LANDING-158 | 이주(18라운드) — `NodeEventType` → `SchemaNodeEventType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| LANDING-159 | 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, 개발계획 07; 레거시 시험은 PR-7 뒤 글롭에서 뺌) |
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
| LANDING-170 | 명령 `RequestEmitChange`·`RequestInjection`은 새 설계에 없음(이주 행 없음), 공개 훅 셋 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름·시그니처 유지, `useChildNodeErrors`는 PR-7에 새 통지로 다시 구현 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86), 소유자 답(`reviews/round-18-owner-answers.md:27` 18C 검토 5번; 제거 확인), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3) |
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
| LANDING-198 | union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-199 | 이주(18라운드) — 호출자의 `setValue(V)`는 하위 트리 전체가 아니라 원본이 바뀐 노드만 다시 마운트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-200 | 이주(18라운드) — 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아와도 자식 기본값을 채우지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-201 | 이주(18라운드) — 입력의 `onChange(v, Overwrite)`는 자기 입력을 다시 마운트하지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-202 | 이주(18라운드) — 배열 통째 `setValue`는 남은 아이템을 채우지 않고 뒤쪽의 새 아이템만 채운다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-203 | 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-204 | 우산 `1.0.0-beta`와 개발 PR 여섯 — 기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환; 자식 PR은 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스, 단계 정의는 그대로 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가) |
| LANDING-205 | `src/__legacy__/`는 정리·릴리스 PR(PR-8)까지 참고용으로 보존 — PR-7은 진입점 전환과 레거시 import 0 점검만, 삭제는 PR-8, 우산에 딸린 무관한 파일은 정리하지 않음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2) |
| LANDING-206 | UI 플러그인 넷의 이주는 플러그인 PR(우산 순서 N+1) — `presentation.*` 이주·자사 플러그인 수정 목록·union 항목, PR-7은 기본 입력으로 검증, ajv 셋은 원장대로 PR-4, 이주 표와 이주 점검은 PR-7에 남음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-207 | 이주(19라운드) — 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 object variant 호스트, `Optional[Self]`는 `RECURSIVE_SHAPE_UNBOUNDED` | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) |
| LANDING-208 | 이주(19라운드) — `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 리터럴 종류의 원시 잎 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) |
| LANDING-209 | 이주(80라운드) — 폼 핸들 명령 넷(`focus`·`select`·`refresh`·`remount`)의 경로는 선택 인자(없으면 루트), `focus`·`select`의 필수 경로가 선택으로, `refresh`·`remount` 추가 | 현행 | 편집자 결정(80라운드, `reviews/round-80-closing.md` 80C-01) |
| LANDING-210 | 이주(80라운드) — 공개 표면의 배열(`FormProps.errors`·`onValidate` 인자, `FormHandle.getErrors`·`validate`·`findNodes` 반환, `errorMatrix` 안 배열)은 `readonly` | 현행 | 편집자 결정(80라운드, `reviews/round-80-closing.md` 80C-02) |
| LANDING-211 | 설계 최적화 단계(446라운드) — 8단계 뒤, 9단계 앞에 코어 설계 수정 단계를 둠(443C-01의 "8단계가 마지막 코어 수정" 대체), 계획서는 `plan/design-optimization/`, 가지는 8단계 가지 위에 쌓고 #445 병합 뒤 base를 `1.0.0-beta`로, PR 규칙은 그대로 | 현행 | 소유자 답(`reviews/round-446-owner-answers.md:11` "좋아. 8단계 이후 작업을 명시적으로 허용한다."), 편집자 결정(446라운드, `reviews/round-446-closing.md` 446C-01) |
| LANDING-212 | 분기 전환 단계(453라운드) — 설계 최적화 단계 뒤·9단계 앞, 계획서는 `plan/branch-switch/`, 가지 `feat/schema-form-branch-switch`는 설계 최적화 가지 위에 쌓고 #472·#445 병합 뒤 base를 옮김, PR 규칙은 LANDING-211·451C-04 그대로, 보류한 D2-P5 가지는 B2 자료, 범위는 분기 전환뿐 | 현행 | 소유자 답(`reviews/round-453-owner-answers.md:7`, `reviews/round-453-owner-answers.md:9`), 편집자 결정(453라운드, `reviews/round-453-closing.md` 453C-01) |

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
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5). LANDING-007이 이긴다: `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음.
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
- 보충:
  > 편집자 결정(191C-01): "【추론】 batch 결함은 소유자가 복합 동작에 힘을 실으라고 한 바로 그 종류이고, 단일 쓰기에서는 보이지 않으니 지금까지의 시험이 놓친 것이다. 원장 계약을 어기는 제품 결함은 머지 전에 고쳐야 하고, 고칠 자리(dispatch)는 reviewer가 지금 쥔 브랜치라 그쪽에 두는 것이 가장 빠르다. 복합 설계의 공통 결정 넷은 시나리오 패키지의 경계(형을 넓히면 모든 소비자에 닿음)를 지키는 쪽이 맞고 소유자가 정할 성격이 아니다. 사례 목록은 소유자가 "치밀하게"를 요구했으니 소유자가 본다." (`reviews/round-191-closing.md:9`)
  > 편집자 결정(197C-01): "【추론】 둘 다 고침 후보와 재현이 이미 손에 있고 같은 파일 군이라 지금 고치는 비용이 가장 낮다. 2라운드가 길어지지만 소유자가 복합 동작의 정확성을 우선했다." (`reviews/round-197-closing.md:9`)
  > 편집자 결정(211C-01): "【추론】 A는 대조군이 명확해(순차는 되고 통째·batch만 안 됨) 잠복 기록 시점의 결함이고, B는 평평한 경우와 단일 $ref가 되는데 재귀 중첩만 안 되니 전개 쪽 결함이다. 둘 다 소비자가 바로 만나는 모양이라 머지 전에 고친다." (`reviews/round-211-closing.md:9`)
  > 편집자 결정(213C-01): "【추론】 세 고침은 떠나는 노드의 잠복 캡처와 청사진 간선 게이트라는 좁은 seam에 있고 측정 경로를 건드리지 않았으며 직접 재검증으로 사양 일치를 봤다. 이제 rebase 사슬(switch → 07b-1 → 07c)을 한 번에 돌리는 것이 가장 싸다." (`reviews/round-213-closing.md:9`)
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
- 보충:
  > 편집자 결정(80C-03): "【추론】 귀속의 기준은 72C-01·78C-02가 가른 대로 "원장이 그 단계에 둔 규칙이 온전히 있었는데 코드가 없거나 다른가"다. (가) LANDING-141의 `INVALID_WRITE_OPTION`은 05가 오류 코드 표(`plan/05-dispatch-and-validation/log.md:101`)에 "확정·동일, 충돌한 공개 쓰기 옵션의 호출자 오류"로 올렸으므로 던지는 동작이 없던 것은 05의 결함이다. (나) LANDING-132·SCHEMA-041의 `required` 표시는 "부모 유효 스키마의 `required`(연언 문맥의 켜진 조각 합집합)"이고 유효 스키마는 정착이 계산하므로(03의 `selectNodeSchema`, 04의 게이트·조각 선택) 켜진 `then`에 따라 자식의 `required`가 갱신되지 않던 것은 03·04의 결함이며, 07은 고친 파일로 둘 가운데 어느 쪽인지 적는다. (다) LANDING-021의 옛 `core/types/value`에 남은 `SetValueOption` 복합 비트는 LANDING-087이 "`core/types`의 event·state·value는 남는다"고 하며 그 안의 옛 비트 정리를 07의 형 전환(진입점 전환과 함께)에 둔 것이므로 결함이 아니라 07의 몫이다. (라) `FormHandle.reset(option?)`(억제 비트 둘만, WRITE-015 보충·ADR 0013)은 07의 U6이 빠뜨린 것이므로 앞 단계 귀속이 아니라 07의 실행 기록에 "빠뜨린 것을 채움"으로 적는다. (가)·(나)는 42라운드·78C-02의 선례대로 `plan/07-switch/log.md` §8 "앞 단계 결함"에 재현 사례와 함께 적고, 메운 시험(이주 점검표의 (가) 행)이 그 증거다." (`reviews/round-80-closing.md:25`)
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
- 보충:
  > 편집자 결정(34C-02): "【추론】 ERROR-032가 PR-4에 둔 "`ValidationIssue` 개명"은 새 이름을 공개 index에 내보내 `onError`의 공개(PR-7)보다 먼저 세우는 것이고, 옛 이름 `JSONSchemaError`를 같은 형의 별칭으로 PR-7까지 남기는 것은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진)과 맞다; 옛 `<Form>` 형과 플러그인 스토리 파일이 아직 옛 이름을 가져오기 때문이다." (`reviews/round-34-closing.md:18`)
  > 편집자 결정(34C-02): "【추론】 별칭을 지우는 것은 LANDING-024 이주 21의 적용이며 전환(PR-7) 또는 이주 안내를 넣는 PR-8의 몫이다; ajv 플러그인 셋은 PR-4에서 새 이름으로 바꿔 가져온다(LANDING 영역 형제 패키지 문단)." (`reviews/round-34-closing.md:19`)
  > 편집자 결정(50C-01): "【추론】 34C-02가 옛 이름을 남기라고 한 까닭은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진이고 PR-4 전에는 공개 동작 변경이 없다, 32C-01)대로 옛 `<Form>` 형과 플러그인 스토리, 그리고 소비자 코드가 계속 컴파일되게 하는 것이므로, 같은 형의 별칭이 `details`를 `unknown`으로 좁혀 소비자 코드를 PR-7 전에 깨뜨린다면 그 수단이 뜻을 거스른다; 그래서 `JSONSchemaError`는 옛 공개 형과 같은 모양을 지키는 `ValidationIssue`의 호환 확장(`details?: Record<string, any>`, `key?: number`)으로 `src/index.ts`에서 이름으로 내보내고, 새 엔진의 `ValidationIssue`는 `details?: Record<string, unknown>`을 지키며 함께 내보낸다(새 엔진의 값은 확장에 대입 가능하고, 새 엔진은 `key`를 쓰지 않는다). 옛 이름을 지우는 것은 34C-02·LANDING-024대로 PR-7 또는 PR-8의 몫이고, 그때 `any`와 `key`도 함께 사라진다; `ValidationIssue.details`를 `any`로 넓히거나 소비자의 좁힘을 받아들이는 길은 택하지 않는다." (`reviews/round-50-closing.md:9`)
  > 소유자(74라운드, 레거시의 완전 분리): "예. 완전히 분리하세요. 저는 사실 패키지 레벨에서 분리를 할거라고 생각했는데, 이정도만 분리해도 괜찮겠네요" (`reviews/round-74-owner-answers.md:7`) — 공개 호환 별칭 `JSONSchemaError`(34C-02·50C-01, "PR-7까지")는 07의 전환 커밋에서 `src/index.ts`에서 빠지고 이주 안내에 적는다; 전환 뒤 공개 index에는 옛 이름의 별칭을 두지 않는다(원장 관리자, 2026-10-02).
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
- 보충:
  > 편집자 결정(191C-01): "【추론】 batch 결함은 소유자가 복합 동작에 힘을 실으라고 한 바로 그 종류이고, 단일 쓰기에서는 보이지 않으니 지금까지의 시험이 놓친 것이다. 원장 계약을 어기는 제품 결함은 머지 전에 고쳐야 하고, 고칠 자리(dispatch)는 reviewer가 지금 쥔 브랜치라 그쪽에 두는 것이 가장 빠르다. 복합 설계의 공통 결정 넷은 시나리오 패키지의 경계(형을 넓히면 모든 소비자에 닿음)를 지키는 쪽이 맞고 소유자가 정할 성격이 아니다. 사례 목록은 소유자가 "치밀하게"를 요구했으니 소유자가 본다." (`reviews/round-191-closing.md:9`)
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
- 보충:
  > 편집자 결정(32C-01): "【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다." (`reviews/round-32-closing.md:10`)
  > 편집자 결정(216C-02): "【추론】 Form 속성이 객체 계약으로 바뀌었는데 플러그인이 그 객체를 만들어 주지 않으면 소비자는 문서가 약속한 인스턴스별 검증을 잃는다. 추가 export만이라 기존 계약은 그대로다." (`reviews/round-216-closing.md:29`)
  > 편집자 결정(219C-01): "【추론】 도구가 돌아왔으면 정책은 바로 복귀하되, 절반 넘게 끝난 일을 되돌려 다시 시키는 것은 품질에도 시간에도 손해다. 빌드가 기준 커밋부터 깨져 있는 것은 PR 범위 밖이어도 지금 고쳐야 할 결함이다." (`reviews/round-219-closing.md:13`)
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
  > 편집자 결정(69C-05): "【추론】 LANDING-041은 "마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 … core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다"고 둘을 갈랐고, LANDING-067의 PR-7 행이 그것을 전환의 일로 두었다. 오늘 `dispatchMount`가 사슬 끝에서 루트 검증을 요청하는 것은 core만 쓰는 호스트의 모양이므로 결함이 아니고, 바인딩이 쓸 길이 없는 것이 빈자리다. 07은 마운트 진입에 선택 인자(검증 요청을 미룸)를 더해 바인딩 전용 마운트 함수(69C-01)가 그것을 켜고, 준비 이펙트에서 루트 검증을 요청한다(규칙은 LANDING-041 "로드 뒤 `OnChange` 비트면 한 번"). 그래서 StrictMode가 버리는 둘째 `useMemo` 트리는 커밋되지 않아 준비 이펙트가 없고 검증도 돌지 않으며, 로드 기록이 커밋된 로드 객체에 붙는 규칙(`reviews/raw-round17-onerror.md:55`)과 맞는다. 선택을 켜지 않은 호출(core만 쓰는 호스트, 오늘의 시험)은 동작이 바뀌지 않는다." (`reviews/round-69-closing.md:37`)
  > 편집자 결정(IR-8): "【추론】 IR-8: VALIDATE-052의 최초 mount inline 판정은 quote 49로 철회한다. 모든 Provider 로드는 다음 프레임 뒤 공통 슬롯에서 None 생략, OnRequest-only 컴파일, OnChange 컴파일·로드 이후 요청이 없을 때 판정을 수행한다. VALIDATE-046·ERROR-201의 atomic reset 및 IR-7 round b adoption 전 compile 실패 caller throw·host 0 규칙은 철회한다. adoption은 컴파일하지 않고 새 트리를 유지하며 자동 compile 실패는 로드마다 sink 한 번·host 한 번, explicit validate·submit은 rejected로 거부한다. ERROR-019 항목 2의 자동 보고는 슬롯을 따르고 항목 3의 오래된 ValidatorThrew 보고는 유지한다. VALIDATE-021의 등록 순서는 visible replacement commit의 old-root release 뒤 slot compile이며 같은 $id·다른 내용 새 객체는 성공할 수 있다. 두 mounted root와 if-gated 동기 compile의 중복 실패는 유지하며 compile 시점 중복 원인을 캐시에 보존한다. WRITE-046·086·EVENT-030 인계는 컴파일하지 않고 LANDING-041의 Provider reset은 deferValidation으로 사슬 끝 요청을 미룬다. T1–T9·B2·B3와 T10·T11 guard, Always·after-paint·reset-failures·lifetime·policies·same-id·surfaceIndex·binding-input·onChange stamp 시험을 새 계약에 맞춘다." (`reviews/ir-8-load-validation.md:3`)
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
  > `08-design-a-to-z.md:471`의 "값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 다시 마운트된다"는 18라운드 결정과 다르다: 로드가 아닌 `setValue(V)`는 원본이 실제로 바뀐 노드에만 Refresh를 내고 그 노드만 다시 마운트하므로, 값 전체를 그리는 브랜치 입력도 그 노드의 원본이 바뀐 때만 다시 마운트된다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).

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
- 출처: `08-design-a-to-z.md:474`(정본), `02-target-overview.md:332`, `reviews/round-18-closing.md:2797-2798`, `reviews/round-18-closing.md:28,666`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21; `recursion`·`writeShape` 값 추가)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:9`
- 충돌:
  > `08-design-a-to-z.md:474`의 "원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋"는 18라운드 결정과 다르다: `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해지고(ERROR-195), `exceededBudget`에 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다(ERROR-190). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:28`, `reviews/round-18-closing.md:666`).

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
- 출처: `08-design-a-to-z.md:477`(정본), `reviews/round-18-closing.md:1038,2348`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38·18C-89; `UnionNode` 포함, 가상 제외)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:22`
- 충돌:
  > `08-design-a-to-z.md:477`의 "형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다"는 18라운드 결정과 다르다: `isTerminalNode`의 반환 형 합집합에 `UnionNode`가 들어가고(LANDING-188), 가상 노드는 전략이 `branch`라 `isTerminalNode(가상)`은 거짓이다(LANDING-149). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2348`).

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
  > `08-design-a-to-z.md:551`의 "그 안에서는 PR 아홉으로 나누며"는 소유자 답과 다르다: 개발 PR은 여섯(기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환)이고 자식 PR의 순서는 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스다(LANDING-204). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:44`).
  > `08-design-a-to-z.md:551`의 "`refactor/schema-form-internal-architecture`"는 소유자 답과 다르다: 우산 브랜치는 `1.0.0-beta`다(LANDING-204). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:44`).

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
- 보충:
  > 편집자 결정(36C-01): "【추론】 NODE-014가 "비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다"고 적은 그 칸은 NODE-006·LANDING-056의 일곱 칸(`interpret`·`assemble`·`project`·`finishInput`·`declareChildren`·`type`·`strategy`)에 들어 있지 않으므로, 배열 구조 연산을 받는 여덟째 칸으로 모든 행이 같은 자리에 갖는다; 일곱 칸 목록은 모순되지 않고 늘어난다. 칸 이름(06 제안 `arrange`)과 자리(`declareChildren` 뒤, `type` 앞)는 06의 실행 결정 기록이 정하고 모듈 DETAIL은 이 라운드와 그 기록을 함께 인용한다." (`reviews/round-36-closing.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:553-560`(정본, 553은 넷째 문장), `09-landing-and-test-strategy.md:32-38`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:38`
- 충돌:
  > `08-design-a-to-z.md:556`의 "`stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`"는 18라운드 결정과 다르다: 종류 모듈 목록에 (가칭) `unionBehavior/`가 더해진다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:80`). 규칙의 집은 BLUEPRINT-043이고 이름은 BLUEPRINT-035가 확정했다.

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
- 보충:
  > 반영 칸(개발계획 P3·P4): "우산 PR(`1.0.0-beta`, #344)의 자식은 설계 PR·설계문서 PR → 개발 PR 여섯 → 플러그인 PR → 정리·릴리스 PR(PR-8)이며 모두 `1.0.0-beta`를 base로 열고 merge commit으로 들어온다." (`reviews/round-18-owner-answers.md:44`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:562`(정본, 첫째–넷째 문장), `08-design-a-to-z.md:593`, `reviews/round-18-owner-answers.md:44`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:562`), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4)
- 라운드: 18
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
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 반영 칸(개발계획 1-가): "설계문서 8편·ADR 재작성·역검사 `doc-coverage`·옛 문서의 `_archive/` 이동·소유자 절 단위 통과는 별도 설계문서 PR로 `1.0.0-beta`에 연다." (`reviews/round-18-owner-answers.md:45`)
  > 반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다." (`reviews/round-18-owner-answers.md:45`)
  > 편집자 결정(25C-09): "【추론】 설계문서 PR(01, #348)은 2026-09-29에 머지되었고 8편 머리 표 192절은 대기이므로 PLAN의 상태는 "머지(절 통과 대기)"로 적는다." (`reviews/round-25-closing.md:85`)
  > 편집자 결정(25C-10): "【추론】 02(#347)는 2026-09-27에, 01(#348)은 2026-09-29에 머지되었고, 병렬은 소유자 선택(LANDING-060 반영 칸)이라 순서는 위반이 아니다." (`reviews/round-25-closing.md:94`)
  > 편집자 결정(25C-10): "【추론】 01이 코드를 보지 않고 원장에서 쓰여 생긴 어긋남 16건은 이 라운드와 보정 PR `fix/schema-form-realign-01-02`가 닫으며, 새 과정 규칙은 두지 않는다." (`reviews/round-25-closing.md:95`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:570`(정본), `09-landing-and-test-strategy.md:256`, `reviews/round-18-closing.md:1359`, `reviews/round-18-owner-answers.md:44`, `reviews/round-18-owner-answers.md:45`, `reviews/round-18-owner-answers.md:16`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가), 소유자 답(`reviews/round-18-owner-answers.md:16` 12-6)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:570`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:570`의 "이 문서의 절 단위 통과"는 소유자 답과 다르다: 절 단위 통과는 새 설계문서에서만 하고 08·09는 통과 절차 없이 백업으로 간다(PROCESS-062). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:16`).
  > `08-design-a-to-z.md:570`의 "이 문서, 14라운드 기록, ADR 최종 상태, HANDOFF"는 소유자 답과 다르다: 08·09와 옛 ADR은 백업 디렉토리로 가고 설계문서와 ADR은 원장에서 새로 만들며 소유자의 절 단위 통과는 새 설계문서에서만 한다(PROCESS-061, PROCESS-062). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:16`).

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
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 편집자 결정(25C-07): "【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다." (`reviews/round-25-closing.md:68`)
  > 편집자 결정(25C-07): "【추론】 LANDING-061 표의 "착수 전 닫을 것"은 모두 닫혔다: 안건 A는 18라운드(BLUEPRINT-030·BLUEPRINT-041·SCHEMA-040·FRAGMENT-047), 안건 B는 CONTROLS-080, 전환 방식의 세부는 LANDING-159·LANDING-205, N14는 NODE-047이 닫았다." (`reviews/round-25-closing.md:69`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:571`(정본), `09-landing-and-test-strategy.md:20,32,257`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-closing.md:78,193,196,1338-1339,1352`, `reviews/round-18-owner-answers.md:44`, `reviews/round-18-closing.md:387`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`, `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:203-207`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:571`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`). 규칙의 집은 SCHEMA-043이다.
  > `08-design-a-to-z.md:571`의 "`intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`intersectPattern`·`validateRange`를 청사진 밖의 새 fractal로 옮겨"는 18라운드 결정과 다르다: `intersectPattern`은 새 fractal로 옮기지 않는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:193`). 규칙의 집은 SCHEMA-043이다.
  > `08-design-a-to-z.md:571`의 "정적 `controls.injectTo` 대상 없음의 청사진 오류(R17-1 나)"는 18라운드 결정과 다르다: `controls.injectTo`는 함수 형태 하나라 청사진이 정적으로 아는 대상이 없고, 그 오류 코드 `INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 PR-4의 코드 확정에서 빠지며, 대상 없음은 모두 동적 대상 없음 `INJECT_TARGET_MISSING`이다(CONTROLS-079, ERROR-164). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:387`).
  > `08-design-a-to-z.md:571`의 "18라운드 안건 '전환 방식의 세부'"는 18라운드 결정과 다르다: 그 안건은 닫혔다 — PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다(LANDING-159, LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1330-1363`).

### LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-2 노드 트리와 정착 | 노드: 상속 없는 단일 클래스 `SchemaNode`(`src/core/SchemaNode/`)와 `BEHAVIORS[type][strategy]`의 동작 행(잎 넷·객체·터미널 객체·가상. 터미널 배열은 PR-5), `src/core/record/`·`src/core/behaviors/`·`src/core/navigation/`, 공개 `type`·`strategy` 게터와 `active` 게터(노드 게이트), 겉면 규칙의 기계 검사(파일 한정 린트, 멤버 목록 시험, 행 칸 순서 시험). `raw`·`extras`, 표시·계산(호스트 바퀴, 노드 게이트, 투영)·전이(채움, 나감 비움 네 층과 하위 트리·잠복 자손으로 내려가는 정책, R17-2 ㄴ)·커밋, 예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기이며 중간 라운드 채움의 철회보다 먼저 적용한다), `diagnostics`(`'stable'` 또는 `'degraded'`, `cause`, `commit`, R17-1 나), `SetValueOption`, 게이트는 술어 인터페이스 뒤의 스텁. 정착 루프 테스트(프로토타입 회귀 이식) | PR-1 | 18라운드 안건 B·C·D(`controls.active` 식의 다른 호스트 읽기 순서, 비객체 V의 `Merge`, 되먹임 거부 표면, 프로토타입 v7)와 노드 구조(N2, N5, N6, N14, 공개 표면의 크기, `ContextNode`의 자리)(§15) |
- 보충:
  > 편집자 결정(26C-01): "【추론】 PR-2의 겉면은 `reviews/raw-round17-node-structure.md:74`의 PR-2 목록(식별·값 게터, `active` 게터, `find`·`findNodes`, 가드, 생성, `settle`의 쓰기로 직접 위임하는 `setValue`)과 LANDING-062와 PR-2 게이트(WRITE-093, WRITE-099, SETTLE-049, ERROR-204)가 PR-2에 둔 `raw`·`extras`·`diagnostics`·`SetValueOption`·`defaultValue`·`resetSubtree`·`typeMismatch`·`typeMismatches`다." (`reviews/round-26-closing.md:10`)
  > 편집자 결정(26C-01): "【추론】 뒤 PR의 멤버를 PR-2 클래스에 무해한 구현(스텁)이나 `SchemaNodeRuntime` 칸으로의 위임으로 미리 두지 않는다: PR-2의 시험 대역은 `if` 게이트 술어 하나뿐이고 시험만을 위한 주입 자리를 새로 만들지 않는다(TEST-069 (나)); LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁"은 이 술어 하나를 말한다." (`reviews/round-26-closing.md:13`)
  > 편집자 결정(26C-04): "【추론】 `controls.active` 게이트(노드 게이트·조각 게이트)는 PR-2가 청사진이 컴파일한 식(`BlueprintExpression.evaluate`)으로 호스트 바퀴에서 실제로 평가하며, 술어 인터페이스 뒤의 대역으로 두지 않는다." (`reviews/round-26-closing.md:45`)
  > 편집자 결정(26C-04): "【추론】 `if` 게이트만 `record/`가 선언한 술어 인터페이스 뒤에 두고 시험은 대역 하나를 쓰며, 실제 술어는 PR-4의 `compileGuard`가 넣는다." (`reviews/round-26-closing.md:46`)
  > 편집자 결정(35C-05): "【추론】 자동 쓰기(채움·`derived`·`injectTo`·`unsetValue`·나감 비움)가 배열 호스트에 닿아 아이템을 만들거나 없애면 정착 작업장이 {호스트, 이전 아이템 목록(순서 있는 노드 참조), 이전 `extras`}를 적고, 예산 초과 때 기존 자동 쓰기 기록과 함께 거꾸로 되돌려 원본 B에 호출자 쓰기만의 구조를 남긴다(LANDING-062 충돌 줄과 TEST-069가 PR-5로 둔 기록); 그 정착에서 생겼다가 되돌린 아이템은 커밋된 형상에 한 번도 들지 않으므로 생김이 아니고 채움도 받지 않으며, 없어지는 아이템은 WRITE-036대로 나감이 아니다." (`reviews/round-35-closing.md:40`)
  > 편집자 결정(39C-01): "【추론】 머지된 객체 행의 `projectObject`가 비객체 `raw`에 `undefined`를 돌려주는 것과 `objectBehavior/DETAIL.md`의 "그 호스트의 방출은 하지 않습니다"는 03의 기록에 결정으로 남아 있지 않은 근사이며 결함이다(29C-02·29C-03의 선례와 같다); nullable 객체(`type: ['object','null']`)의 `null`이 방출에서 사라져 `{ user: null }`이 `{}`가 되는 것은 동작 결함이고, 배열 아이템인 객체 호스트의 `null`이 VALUE-034의 구멍 채움 `{}`로 바뀌어 보이는 것도 같은 결함이다." (`reviews/round-39-closing.md:10`)
  > 편집자 결정(39C-01): "【추론】 고치는 것은 06이다: 배열 행의 투영과 같은 규칙이고 VALUE-034의 구멍 채움이 아이템 호스트의 방출 유무에 기대므로 06의 묶음에서 객체 행의 `projectObject`를 "비객체 `raw`면 그 `raw`를 방출, 아니면 빈 호스트 투영"으로 고치고, `objectBehavior/DETAIL.md`의 그 문장을 먼저 바꾸며, 프로토타입 두 사례(A3-3/A3-4-host, line 31)를 시험으로 이식한다; 루트의 `local` 대체는 VALUE-034의 "방출이 없을 때"에만 해당하고 루트가 잘못된 종류의 `raw`를 들면 그 `raw`를 낸다(프로토타입 `prime(mk(), null)`의 루트가 `null`을 방출). 루트 출력의 수정이 06의 묶음을 넘으면 06 실행 기록 §4에 07로 넘긴다고 적는다. 어느 쪽이든 §4에 결함과 고친 자리를 적는다." (`reviews/round-39-closing.md:11`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:572`(정본), `09-landing-and-test-strategy.md:23,33,258`, `reviews/round-18-closing.md:751,753,769-771`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25; 예산·배열 기록의 PR 배분)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:23`
- 충돌:
  > `08-design-a-to-z.md:572`의 "잎 넷·객체·터미널 객체·가상"는 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).
  > `08-design-a-to-z.md:572`의 "예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기"는 18라운드 결정과 다르다: 각 PR은 자기가 들여오는 기제를 검증하므로 PR-2가 실제 코드로 시험하는 예산은 호스트 바퀴와 전이 라운드이고, 파생 라운드 예산은 PR-3, 되먹임 파동과 `onChange` 중첩 예산은 PR-4, 원본 B의 배열 아이템 구조 기록은 PR-5가 맡는다(TEST-069). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:753`).

### LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-3 파생 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록 | PR-2 | 에지의 값 동등 판정, `controls.derived` 의존 집합, 조각 `controls` 식의 나감 발화 |
- 보충:
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 편집자 결정(28C-01): "【추론】 ERROR-159 정착 추적 행의 기록은 트리마다 하나인 `SchemaNodeRuntime`의 칸에 들며(26C-06), 칸을 더하는 절차는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는 것이다." (`reviews/round-28-closing.md:9`)
  > 편집자 결정(28C-01): "【추론】 PR-3은 이 기록을 위한 공개 `SchemaNode` 멤버·`onError` 기록·`FormHandle` 멤버를 더하지 않는다: 원장이 정한 멤버가 없고(26C-01), 이 행은 "`onError`에 가지 않음"이다." (`reviews/round-28-closing.md:12`)
  > 편집자 결정(28C-03): "【추론】 맥락 변경의 진입은 바인딩 전용 내부 통로 `setContext`(가칭, SURFACE-055·NODE-010)이고, 그것이 도는 정착(역의존 표의 `@` 항목이 가리키는 노드와 그 조상의 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게의 에지)은 PR-3의 기제다: 에지 소비와 파생이 PR-3이고(LANDING-063), 원장이 PR을 적지 않은 것은 그 기제를 들여오는 PR에 든다(26C-01)." (`reviews/round-28-closing.md:38`)
  > 소유자(30라운드, 04의 스토리북 게이트): "제가 독립실행했는데 기록이 안되었군요. 모두 pass 로 끝났습니다." (`reviews/round-30-owner-answers.md:13`) — 04 PR #351(PR-3 + PR-6)의 스토리북 게이트는 포기가 아니라 소유자의 독립 실행으로 통과했고 기록만 빠졌다. PLAN §5의 "포기" 기록은 이 답으로 바로잡는다(원장 관리자, 2026-10-01).
- 상태: 현행
- 출처: `08-design-a-to-z.md:573`(정본), `09-landing-and-test-strategy.md:34`, `reviews/round-18-owner-answers.md:44`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:573`

### LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-4 통지와 검증 | 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, `onError` 로깅 채널의 core 쪽(기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭), core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제, 정착 경고 판정의 소비자 조건, `ValidateFunction` 문서 주석 "판정은 돌려주고 던지지 않는다". `ValidationIssue` 개명이 `onError`의 공개보다 먼저 선다, 17라운드 스웜 수렴(편집자 결정)), 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김, `SchemaFormError`의 집계 오류(`details.errors`), 주인 없는 오류 싱크, 검증 실행 실패와 검증 불가의 드러남, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일(어느 환경이든 실패는 그 게이트의 가드 실패)(ADR 0014, 17라운드 스웜 수렴(편집자 결정)), `UpdateDiagnostics`, 커밋 번호 스탬프 검증과 실행 합치기, 검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현, 에러 라우팅, 오류 클래스(`ValidationIssue`), 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기), 같은 `$id` 루트의 중복 등록 처리, 상태·오류·명령 사건과 검증 결과의 배달 경로(09 §2.4, 16라운드 답 3), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(09 §2.6의 여덟째, 16라운드 스웜 수렴(편집자 결정)) | PR-2 (PR-3과 병렬) | `compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import의 분리(검증기 주입 경로, §15) |
- 보충:
  > 반영 칸(개발계획 P1): "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로)." (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(32C-01): "【추론】 LANDING-064의 PR-4 행 "검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현"은 코어가 받는 검증기 계약 형 하나를 정하고 플러그인 셋과 코어의 트리 생성 인자가 그 형을 쓰게 하는 일이다; Form 속성 `validatorFactory`의 공개 형을 바꾸는 일은 아니다." (`reviews/round-32-closing.md:9`)
  > 편집자 결정(32C-01): "【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다." (`reviews/round-32-closing.md:10`)
  > 편집자 결정(43C-01): "【추론】 `globalState`는 노드 상태의 유도 값이고 `UpdateGlobalState`는 상태 사건이므로, LANDING-064의 PR-4 행 "상태·오류·명령 사건과 검증 결과의 배달 경로"와 EVENT-067(`setState`의 상태 칸 변경은 정착 밖 사건, 비트 `UpdateState`)이 두는 자리인 PR-4가 EVENT-062의 기제 전부 — 키별 참 노드 수, 상태 변경과 형상 출입 때의 갱신, 0과 1 사이를 넘을 때만의 새 객체와 `UpdateGlobalState`, 그 결과로 `dirty`가 내려가는 것 — 를 만든다; 03은 통지와 상태 사건을 비목표로 두었고(03 기록 "비목표: … 통지·검증(05)") 04의 "상태 키"는 `readOnly`·`disabled`·`visible` 같은 제어 상태 키라 노드 `state`가 아니며(03 기록 §4의 P4 배분), 06·07에는 상태 사건이 없다. 계획서가 EVENT-062를 빠뜨린 것은 PR-4 행의 "상태 사건"에 접혀 있던 것이라 05가 자기 작업 항목에 더하고 실행 기록에 적는다." (`reviews/round-43-closing.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:574`(정본), `09-landing-and-test-strategy.md:19,22,35,259`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-5 배열 | 배열·터미널 배열 행(`arrayBehavior/`의 `branch/`·`terminal/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, `push`·`remove`·`update`, 통째 교체의 identity, 아이템 채움 | PR-2 (PR-3·4와 병렬) | 배열 아이템의 생김과 채움, `contains` |
- 보충:
  > 편집자 결정(33C-01): "【추론】 원장은 `dispatch/` fractal을 PR-4에, 배열 동사를 PR-5에 두었고 둘이 병렬이므로 배열 동사의 진입 파일을 어느 PR이 더하는지는 적지 않았다; 05·06이 합의한 "뒤에 머지하는 쪽이 더한다"는 그 빈자리를 채우는 것이며 LANDING-084와 어긋나지 않는다. 조건은 둘 다 머지된 뒤 모든 쓰기 동사의 진입 함수가 `dispatch/`에 있고 겉면의 쓰기 위임이 그 진입을 거치는 것(LANDING-064 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김")이다." (`reviews/round-33-closing.md:10`)
  > 편집자 결정(33C-01): "【추론】 06이 먼저 머지되면 그 동사는 03(PR-2)이 겉면 쓰기를 둔 모양 — 정착 호출 하나(TEST-069 "PR-2에서 사슬은 settle 호출 하나다") — 을 따르고, 05가 머지되는 쪽(또는 06이 뒤라면 06)이 겉면 위임을 `dispatch` 진입으로 옮기면서 배열 동사 다섯의 진입 파일을 더한다; `batch` 안의 배열 동사가 형제 진입으로 합쳐지는 것(EVENT-035)과 진입당 `onChange` 한 번은 그 뒤에만 성립하므로 06의 시험은 그 둘을 단언하지 않는다(03 log §4의 `batch` 사례 배분과 같다)." (`reviews/round-33-closing.md:11`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:575`(정본), `09-landing-and-test-strategy.md:36,260`, `08-design-a-to-z.md:411`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`), 편집자 결정(18라운드, SURFACE-005; 배열 쓰기는 다섯)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:575`
- 충돌:
  > `08-design-a-to-z.md:575`의 "`push`·`remove`·`update`"는 SURFACE-005와 다르다: 배열 쓰기는 `push`·`pop`·`update`·`remove`·`clear` 다섯이다(SURFACE-005). SURFACE-005가 이긴다(`08-design-a-to-z.md:411`).

### LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-6 상태 키와 제어 | `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`) | PR-3 | `controls.children` 세부. 조각에 따라 터미널 전략이 바뀌는 경로는 17라운드 스웜 수렴(편집자 결정)으로 닫혔다(선언 사이 정적, §9) |
- 보충:
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 편집자 결정(28C-02): "【추론】 계산 게터 `enabled`는 `active && visible`이다: 원장은 이 게터를 이름만 적었고(26C-01, LANDING-066, `reviews/raw-round17-node-structure.md:136`) 뜻을 새로 정하지 않았으므로 옛 엔진 `AbstractNode.enabled`의 뜻을 유지한다(뜻을 바꾸는 이주는 LANDING 이주 항목으로 적는 것이 원장의 방식이고 `enabled`에는 그런 항목이 없다)." (`reviews/round-28-closing.md:22`)
  > 편집자 결정(28C-02): "【추론】 `visible`·`readOnly`·`disabled` 게터는 CONTROLS-082의 로컬 결합 결과(잠금은 OR, 표시는 AND, 자리 넷)를 돌려주며, Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 코어 게터에 들지 않는다." (`reviews/round-28-closing.md:24`)
  > 편집자 결정(28C-07): "【추론】 코어 게터 `watchValues`(CONTROLS-032)는 PR-6, 곧 04의 겉면 멤버다: `reviews/raw-round17-node-structure.md:136`이 계산 상태 게터 여섯 가운데 `active`를 뺀 다섯을 PR-6으로 적었고, 26C-01이 LANDING-066의 넷만 인용한 것은 그 목록을 닫은 것이 아니다." (`reviews/round-28-closing.md:75`)
  > 편집자 결정(28C-07): "【추론】 `FormTypeInputProps.watchValues`로 넘기는 일은 PR-7 렌더 계층이고, LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과이므로 PR-6의 게터에 든다; EVENT-064의 계산 상태 비트에 `watchValues`가 드는 것은 PR-4 배달의 몫이다." (`reviews/round-28-closing.md:77`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:576`(정본), `09-landing-and-test-strategy.md:37`, `reviews/round-18-owner-answers.md:44`, `09-landing-and-test-strategy.md:258`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, LANDING-092; 하위 트리 규칙은 PR-2)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:576`
- 충돌:
  > `08-design-a-to-z.md:576`의 "`unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ)"는 LANDING-092와 다르다: 나감 비움의 하위 트리 규칙은 PR-2가 세우고, PR-6은 `children` 항목 층·조각 `controls` 층·식 값(직전 커밋)을 더한다(LANDING-092, TEST-069). LANDING-092가 이긴다(`09-landing-and-test-strategy.md:258`).

### LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-7 전환 | `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`), 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(§11.3), 루트·필드 바운더리의 가두고 보고하기(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째), `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로)와 검증 불가의 거부(R17-1 나), 터미널 전략과 병합의 원자(렌더 계층의 터미널 판정 함수와 원자 판정 함수를 청사진에 넘김, §9·§12), 명령, 레거시로 옮긴 옛 `core/nodes`·`parsers`·매니저·전처리 삭제, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로, `node.group` → `node.strategy`의 소비자 이주(§14의 40행), 렌더 시나리오 438건의 처분(09 §4.3. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7), UI 플러그인 넷의 타입과 등록 키 대응, UI 플러그인 27파일의 `presentation.*` 이주, `SchemaNodeInput`의 흐림 처리에서 `Blurred` 발행을 입력 마침 신호 `finishInput`으로 바꿈(`options.trim`은 문자열 행의 `finishInput` 칸이 판단, R17-3), `ChildNodeComponentProps`·`FormGroupProps`의 prop `FormTypeRenderer` → `FormTypeGroupRenderer`, `SchemaNodeInput.handleChange`의 세 진입(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로 묶기, 입력 출처 표식(Refresh 판정과 폐기된 노드의 늦은 입력 쓰기 판별용 내부 통로), 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번 전달하는 계약과 마운트 로드의 검증 요청을 준비 시점에 내는 것(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 첫째), `onError`의 렌더 계층(바깥 감싸개와 인스턴스 보고기 문맥, 로드 기록의 준비 이펙트 전달과 대체 화면 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부를 `onError`와 싱크로), `@winglet/react-utils` ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자(소유자 허용. 그 모듈의 `DETAIL.md`를 먼저 갱신한다, 17라운드 스웜 수렴(편집자 결정)), React 18 실행 시험(16라운드 답 5), `useFormTypeInput`의 메모 의존에 유효 스키마 참조 추가와 `SchemaNodeProxy`의 유효 스키마 변경 비트 구독, 배달 경로의 렌더 계층 구독(09 §2.4), `Form`의 스키마 `clone`(`preprocessSchema(clone(inputJSONSchema))`) 제거(작성 루트 객체를 가드 캐시의 키로 지킨다. `defaultValue`의 `clone`은 이 항목이 아니다), `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 입력 판정과 노드가 드는 Refresh 번호, 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함, §14의 38행), `setValue(V)`의 같은 입력 판정(§14의 39행)(09 §2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`), 벤치 비교 | PR-1 – PR-6 전부 | 성능 예산 수치(18라운드 안건 E, 소유자 정책), 브라우저 IME 확인, 노드 `resetSubtree`의 존치와 입력 판정의 구현 확인(§15), `trim` 쓰기의 부수 효과(18라운드 안건), `@winglet/react-utils` 선택 인자의 모양, 네이티브 submit 경로의 검증 실패(`ValidationError`) 처리(오늘은 미처리 거부, `Form.tsx:127-133`, `getTrackableHandler.ts:429-431`) |
- 보충:
  > 편집자 결정(18C-49): "【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다." (`reviews/round-18-closing.md:1342`)
  > 편집자 결정(18C-49): "【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다." (`reviews/round-18-closing.md:1343`)
  > 반영 칸(개발계획 P2): "`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다." (`reviews/round-18-owner-answers.md:43`)
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
  > 소유자(27라운드, 최종 검사의 자리): "최종 검사는 리액트 jsdom 등에서 평가되어야 함" (`reviews/round-27-owner-answers.md:10`) — `<Form>`은 PR-7까지 옛 엔진을 섬기므로(LANDING-159 규칙 3) 새 엔진의 React·jsdom 성능 평가는 PR-7 전환의 게이트다: PR-7은 새 엔진으로 전환한 `<Form>`을 jsdom(render 프로젝트)과 `benchmark-form`으로 재어 옛 엔진 기준선과 견주고, 느린 행은 TEST-027 절차를 따른다. PR-2는 옛 엔진의 jsdom render 시험에 회귀가 없음과 `benchmark-form`의 React 경로가 그대로임만 확인한다.
  > 편집자 결정(68C-01): "【추론】 "렌더 시나리오 438건"(LANDING-067, 08 §18의 PR-7 행)과 "447건이 통과하므로"(TEST-023, 09 §5.1)는 설계 시점에 `src/__tests__`를 센 수이고, 원장 어디에도 파일 이름 목록이나 17파일의 이름 목록은 없다(TEST-005의 원문은 기준만 적었고, 설계서 07의 네 부류 표는 대표 이름 여섯뿐이다). 그러므로 수는 구속이 아니고 처분이 구속이다: 07은 전환 직전 커밋의 `src/__tests__`(그리고 `src` 전체의 렌더 시험)를 파일·건수로 세어 처분표를 `verification/07-switch/`에 새로 만들고, 파일마다 09 §4.3의 세 처분(그대로 산다·버리고 새로 쓴다·표면만 고친다) 가운데 하나와 그 까닭을 적으며, "표면만 고친다"에서 조합(`oneOf`·`anyOf`·`if`·`allOf`의 옛 자동 감지)과 옛 키(`presentation.*`로 옮긴 것, `group`, `JSONSchemaError` 등 이주 표가 바꾼 이름)가 없는 파일이 TEST-005의 17파일이다. 수가 17과 다르게 나오면 처분표에 센 기준과 함께 적고 TEST-005를 고치지 않는다(옛 글은 자라기만 한다; 17은 소유자가 받아들인 예외의 범위를 적은 수이지 파일 수의 약속이 아니다). 438·447과 오늘 수의 차이는 `plan/07-switch/log.md`에 한 줄로 남긴다. 이 처분표가 PR-7의 렌더 시나리오 게이트이고, 전환 뒤 `render` 프로젝트의 초록은 처분표의 "산다"·"표면만 고친다" 파일 전부가 돈다는 뜻이다." (`reviews/round-68-closing.md:9`)
  > 편집자 결정(68C-05): "【추론】 앞선 답(07 착수 전 물음 1)의 "`src/**`, `verification/**`, `plan/07-switch/**`, PLAN §3·§4의 07 행"은 `architecture/` 안에서 원장 관리자와 단계 작업자가 나눠 갖는 문서의 경계였고, 코드의 범위는 PR-7의 원장 행이 정한다. LANDING-067·095가 이름 댄 것(옛 스토리 49파일 정리와 시나리오 스토리·`playScenario`, `renderForm` 다섯과 부류별 e2e 실행기, `node.group`·`FormTypeRenderer`의 플러그인 쪽 소비자 이주, `@winglet/react-utils`의 바운더리 선택 인자), TEST-026이 이름 댄 것(`@aileron/benchmark-form`의 새 항목과 `fixtures/equivalent`, `bench/`, `.github/workflows/performance-benchmarks.yml`), REACT-017이 요구하는 React 18 실행 시험의 개발 의존(그에 따른 `yarn.lock`), 그리고 그것들이 돌게 하는 설정(`.storybook/`, `vite.config.ts`, `eslint.config.js`, `package.json`)은 모두 07의 경로다. `@aileron/schema-form-scenarios`는 시나리오 스토리와 e2e 실행기가 읽는 데이터 모듈이라 LANDING-087의 "그대로 쓰는 것"에 들고, 07은 전환이 요구하는 추가만 한다. 이 밖의 경로(다른 패키지, 저장소 설정)에 손대야 하면 쓰기 전에 물음으로 보낸다. 플러그인 패키지의 `src`는 68C-07의 범위 안에서만 고친다." (`reviews/round-68-closing.md:37`)
  > 편집자 결정(69C-05): "【추론】 LANDING-041은 "마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 … core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다"고 둘을 갈랐고, LANDING-067의 PR-7 행이 그것을 전환의 일로 두었다. 오늘 `dispatchMount`가 사슬 끝에서 루트 검증을 요청하는 것은 core만 쓰는 호스트의 모양이므로 결함이 아니고, 바인딩이 쓸 길이 없는 것이 빈자리다. 07은 마운트 진입에 선택 인자(검증 요청을 미룸)를 더해 바인딩 전용 마운트 함수(69C-01)가 그것을 켜고, 준비 이펙트에서 루트 검증을 요청한다(규칙은 LANDING-041 "로드 뒤 `OnChange` 비트면 한 번"). 그래서 StrictMode가 버리는 둘째 `useMemo` 트리는 커밋되지 않아 준비 이펙트가 없고 검증도 돌지 않으며, 로드 기록이 커밋된 로드 객체에 붙는 규칙(`reviews/raw-round17-onerror.md:55`)과 맞는다. 선택을 켜지 않은 호출(core만 쓰는 호스트, 오늘의 시험)은 동작이 바뀌지 않는다." (`reviews/round-69-closing.md:37`)
  > 편집자 결정(70C-01): "【추론】 서명은 `nodeFromJSONSchema<Schema extends JSONSchema>(props: { jsonSchema: Schema; defaultValue?: InferValueType<Schema>; validator?: Validator; validationMode?: ValidationMode; context?: Dictionary; onChange?: (value: InferValueType<Schema> | undefined) => void; onStateChange?: () => void; errorReporter?: FormErrorReporter; unsetOnInactive?: boolean; disableAutomaticWrites?: boolean; isTerminal?: (schema: JSONSchema) => boolean | undefined; isAtomic?: (value: unknown) => boolean; deferMountValidation?: boolean }): InferSchemaNode<Schema>`이고 돌려주는 것은 마운트가 끝난 루트다. 칸마다 근거가 있다: `validator`는 함수 `validatorFactory`가 `{ compile, compileGuard, … }` 객체로 바뀌는 32C-01과 같은 방향이며 형은 새 엔진 쪽 `core/validation/type.ts`의 `Validator`다(공개 index가 아닌 모듈에서 내보냄, 32C-01); `context`는 옛 `contextNode`(`contextNodeFactory`의 노드)를 값으로 바꾼 것으로 `SchemaNode/`의 `setContext`가 받는 값이다; `errorReporter`는 05가 core 인자로 둔 보고기(`report`·`hasConsumer`, LANDING-064 PR-4 행)이고 `isTerminal`·`isAtomic`은 REACT-003이 렌더 계층이 넘긴다고 한 판정 둘이며 core만 쓰는 호스트가 주지 않으면 판정이 없다; `deferMountValidation`은 69C-05의 미룸 선택으로 기본은 꺼짐이라 켜지 않은 호출은 오늘대로 사슬 끝에서 검증을 요청한다. 안에서는 69C-01의 바인딩 전용 통로 가운데 "트리 생성(마운트 없음)"과 "마운트"를 차례로 부르고, `<Form>`은 첫 마운트에서 이 함수를(`deferMountValidation: true`, 버퍼형 보고기) 부르며 재생성 reset은 같은 트리 생성 통로 → 인계 → 마운트를 부르므로 두 경로가 같은 생성 함수를 지난다 — VALIDATE-010 "직접 부르는 경로와 `<Form>` 경로가 같은 계약"의 구현이다." (`reviews/round-70-closing.md:9`)
  > 편집자 결정(70C-01): "【추론】 이주 행은 두지 않는다. 이주 표(LANDING-004–050과 그 뒤의 이주 행)는 소비자 겉면(`src/index.ts`가 내보내는 것)의 오늘 동작과 새 동작을 적는 표이고, `nodeFromJSONSchema`는 오늘도 `src/core/index.ts`만 이름으로 내보내며 `src/index.ts`는 내보내지 않으므로(`src/core/index.ts:1`) SURFACE-058의 약 54에 들지 않고 SURFACE-059의 대조 목록에도 들지 않는다. 대신 07은 이주 점검표(68C-02)의 끝에 "코어 전용 진입의 서명 변경"으로 한 줄 적고(옛 `{ jsonSchema, defaultValue, onChange, validationMode, validatorFactory, contextNode }` → 새 서명), 옛 `contextNodeFactory` 내보내기는 옛 엔진과 함께 `src/__legacy__/`로 가며 `core/index.ts`에서 빠진다. `core/index.ts`는 새 `nodeFromJSONSchema`를 이름으로 내보내고(와일드카드 금지), `src/index.ts`는 오늘처럼 내보내지 않는다. 문서 주석은 "core만 쓰는 호스트의 진입; `<Form>`은 같은 생성 통로를 바인딩 전용 함수로 부른다"를 적는다." (`reviews/round-70-closing.md:10`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:577`(정본), `09-landing-and-test-strategy.md:21,24,26,38,261`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-closing.md:1342-1343`, `reviews/round-18-closing.md:2730-2731`, `reviews/round-18-owner-answers.md:43`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:600-601`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:577`의 "`setValue(V)`의 같은 입력 판정(§14의 39행)"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).
  > `08-design-a-to-z.md:577`의 "레거시로 옮긴 옛 `core/nodes`·`parsers`·매니저·전처리 삭제"는 소유자 답과 다르다: 레거시 디렉토리는 PR-8까지 보존하고 PR-7은 레거시 import 0만 점검한다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `08-design-a-to-z.md:577`의 "UI 플러그인 27파일의 `presentation.*` 이주"는 소유자 답과 다르다: UI 플러그인 넷의 이주는 PR-7 뒤의 플러그인 PR이 하고 PR-7은 기본 입력으로 검증한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).
  > `08-design-a-to-z.md:577`의 "성능 예산 수치(18라운드 안건 E, 소유자 정책)"는 18라운드 결정과 다르다: 닫혔다 — 예산의 수치는 기존 `guard:check`의 선이다(TEST-073). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).
  > `08-design-a-to-z.md:577`의 "`trim` 쓰기의 부수 효과(18라운드 안건)"는 18라운드 결정과 다르다: 닫혔다 — `trim`은 `finishInput` 칸의 자동 쓰기이고 바깥 오류와 dirty는 그대로다(WRITE-083, LANDING-145). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:594-597`).
  > `08-design-a-to-z.md:577`의 "노드 `resetSubtree`의 존치와 입력 판정의 구현 확인(§15)"은 18라운드 결정과 다르다: `resetSubtree()`의 존치는 닫혔고(WRITE-085, `resetSubtree()`와 게터 `defaultValue`를 남김) 입력 판정의 구현 확인만 PR-7 게이트로 남는다(REACT-028). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:911-913`).

### LANDING-068 PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-8 릴리스 | README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, 09 §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(09 §6.2, 16라운드 스웜 수렴(편집자 결정)), README·docs의 reset 규칙(09 §2.6의 열여섯째), README·docs의 `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙 | PR-7 | 릴리스 전환 PR(09 §6.2, 저장소 전체)의 병합 |
- 보충:
  > 반영 칸(개발계획 P2): "디렉토리 삭제는 PR-8이 한다." (`reviews/round-18-owner-answers.md:43`)
  > 편집자 결정(75C-01): "【추론】 이주 안내의 정식 자리는 PR-8의 "이주 안내와 이주 프롬프트(`docs/agents`)"(LANDING-068)다. 07은 그 재료를 이주 점검표(68C-02, `verification/07-switch/migration-check.md`)에 적는다 — 호환 별칭 `JSONSchemaError`의 종료(34C-02·50C-01, 74라운드)는 그 표에 "공개 표면 잔여의 거취" 행으로 한 줄이면 족하고, PR-8이 그 표의 행들을 소비자용 이주 안내로 옮겨 쓴다. `isJSONSchemaError`가 별칭이 아니라 오류 분류의 throw 클래스 `JSONSchemaError`의 판별 함수라 남는 것은 맞다(ERROR 영역의 클래스이지 LANDING-024 이주 21의 인터페이스가 아니다)." (`reviews/round-75-closing.md:10`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:578`(정본), `09-landing-and-test-strategy.md:262`, `reviews/round-18-owner-answers.md:43`, `09-landing-and-test-strategy.md:237`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, TEST-045; `CHANGELOG.md`는 action이 만듦)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:225`
- 충돌:
  > `08-design-a-to-z.md:578`의 "1.0.0-beta 프리릴리스 뒤 1.0.0, 09 §6.2의 열넷째)과 `CHANGELOG.md`"는 TEST-045와 다르다: `changeset version`은 `changesets/action` 안에서만 돌므로 `CHANGELOG.md`는 병합 뒤 그 작업 흐름의 판 올림 PR이 만들고 PR-8은 changeset만 쓴다(TEST-045). TEST-045가 이긴다(`09-landing-and-test-strategy.md:237`).

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
- 충돌:
  > `08-design-a-to-z.md:599`의 "스키마 읽기 27파일을 `presentation.*`로 옮기는 작업을 포함한다"는 소유자 답과 다르다: UI 플러그인 넷의 `presentation.*` 이주는 PR-7이 아니라 플러그인 PR(우산 순서 N+1)이 하고 PR-7은 기본 입력으로 검증한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 출처: `09-landing-and-test-strategy.md:20`(정본), `08-design-a-to-z.md:571,598`, `reviews/round-18-closing.md:196`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`
- 충돌:
  > `09-landing-and-test-strategy.md:20`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다(SCHEMA-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`).
  > `09-landing-and-test-strategy.md:20`의 "18라운드 안건 '전환 방식의 세부'"는 18라운드 결정과 다르다: 그 안건은 닫혔다 — PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다(LANDING-159, LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1330-1363`).

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
- 보충:
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:24`(정본), `08-design-a-to-z.md:469,599`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:24`
- 충돌:
  > `09-landing-and-test-strategy.md:24`의 "27파일이 `options.*`·맨 키를 읽으므로 PR-7이 `presentation.*`로 옮긴다"는 소유자 답과 다르다: 옮기는 것은 PR-7 뒤의 플러그인 PR이다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 충돌:
  > `09-landing-and-test-strategy.md:25`의 "설계 빈틈 넷과 공개 표면의 크기는 18라운드 안건"은 18라운드 결정과 다르다: 그 안건은 닫혔다 — 설계 빈틈 넷(N2·N5·N6·N14)은 NODE-043·NODE-045·NODE-046·NODE-047이, 공개 표면의 크기는 SURFACE-058이 닫았다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:911-913`).

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
- 보충:
  > 편집자 결정(25C-07): "【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다." (`reviews/round-25-closing.md:68`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:32`(정본), `08-design-a-to-z.md:571`, `reviews/round-18-closing.md:186,193`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 잎 교차 함수의 뜻 변경)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`
- 충돌:
  > `09-landing-and-test-strategy.md:32`의 "잎 교차 함수, `jsonPointer`"는 18라운드 결정과 다르다: 잎 교차 함수 가운데 `intersectConst`는 깊은 비교로 뜻이 바뀌고 `intersectPattern`은 새 fractal로 옮기지 않는다(SCHEMA-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:193`).

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
- 출처: `09-landing-and-test-strategy.md:33`(정본), `08-design-a-to-z.md:572`, `reviews/round-18-owner-answers.md:7-8`, `09-landing-and-test-strategy.md:9`, `reviews/round-18-closing.md:988,993-994,1334`, `reviews/round-18-closing.md:17,927,931,2698`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49·18C-36), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-33·18C-93; 형 판정·탐색 멤버 대체)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:100`, `reviews/round-18-closing.md:1365-1368`, `reviews/round-18-closing.md:997-999`
- 충돌:
  > `09-landing-and-test-strategy.md:33`의 "`core/parsers/*`(ADR 0013 충돌)"는 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052): 노드마다 타입에 맞는 parse를 두되 뜻이 그대로인 변환만 하며, 새 parse는 `src/core/behaviors/utils/parse/`에 두고 오늘의 `src/core/parsers/`는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(NODE-056, WRITE-056).
  > `09-landing-and-test-strategy.md:9`의 "옛 엔진의 내부(분기 자동 감지, 마이크로태스크 배칭, 파서 변환, 전역 상속)"는 파서 변환을 교체 대상에 넣은 점에서 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052): 노드마다 타입에 맞는 parse를 두되 뜻이 그대로인 변환만 하며, 새 parse는 `src/core/behaviors/utils/parse/`에 두고 오늘의 `src/core/parsers/`는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(NODE-056, WRITE-056).
  > `09-landing-and-test-strategy.md:33`의 "`src/core/behaviors/`(잎 넷"은 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다 (BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).
  > `09-landing-and-test-strategy.md:33`의 "`getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`"는 18라운드 결정과 다르다: 청사진은 `$ref`를 대상 위치마다 한 번 분석해 그 분석을 가리키고(BLUEPRINT-030), 형 판정은 `extractSchemaInfo`의 형 부분을 대신하는 허용 집합 도우미가 PR-1 청사진에서 맡는다(BLUEPRINT-044). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2698`).
  > `09-landing-and-test-strategy.md:33`의 "기대는 멤버의 존폐는 18라운드 안건 N2"는 18라운드 결정과 다르다: `find`는 형상에 있는 노드만 돌려주고, `detectsCandidate`와 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 폐기한다(NODE-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:931`).
  > `reviews/round-18-owner-answers.md:7`의 "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다"는 18라운드 결정과 다르다: 닫혔다 — 새 parse는 `src/core/behaviors/utils/parse/`에 둔다(NODE-056). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:988`).

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
- 보충:
  > 편집자 결정(33C-01): "【추론】 배열 쓰기 동사 `push`·`pop`·`update`·`remove`·`clear`는 EVENT-027의 공개 쓰기 API이므로 그 진입 함수는 LANDING-084대로 `dispatch`가 쓰기 동사마다 하나씩 소유한다; `arrayBehavior/`나 노드 겉면이 따로 진입 사슬(진입 깊이 카운터, `onChange`, 사슬 끝 throw)을 갖지 않는다." (`reviews/round-33-closing.md:9`)
  > 편집자 결정(33C-01): "【추론】 원장은 `dispatch/` fractal을 PR-4에, 배열 동사를 PR-5에 두었고 둘이 병렬이므로 배열 동사의 진입 파일을 어느 PR이 더하는지는 적지 않았다; 05·06이 합의한 "뒤에 머지하는 쪽이 더한다"는 그 빈자리를 채우는 것이며 LANDING-084와 어긋나지 않는다. 조건은 둘 다 머지된 뒤 모든 쓰기 동사의 진입 함수가 `dispatch/`에 있고 겉면의 쓰기 위임이 그 진입을 거치는 것(LANDING-064 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김")이다." (`reviews/round-33-closing.md:10`)
  > 편집자 결정(33C-01): "【추론】 06이 먼저 머지되면 그 동사는 03(PR-2)이 겉면 쓰기를 둔 모양 — 정착 호출 하나(TEST-069 "PR-2에서 사슬은 settle 호출 하나다") — 을 따르고, 05가 머지되는 쪽(또는 06이 뒤라면 06)이 겉면 위임을 `dispatch` 진입으로 옮기면서 배열 동사 다섯의 진입 파일을 더한다; `batch` 안의 배열 동사가 형제 진입으로 합쳐지는 것(EVENT-035)과 진입당 `onChange` 한 번은 그 뒤에만 성립하므로 06의 시험은 그 둘을 단언하지 않는다(03 log §4의 `batch` 사례 배분과 같다)." (`reviews/round-33-closing.md:11`)
  > 편집자 결정(34C-01): "【추론】 LANDING-084는 PR-4의 새 fractal 칸에 "`app/plugin/type.ts` 개정"을 적었고 VALIDATE-044는 플러그인이 `Validator`에 소비자 훅 `bind?`만 더 가진다고 했으므로, 플러그인이 구현하고 가져오는 계약 형은 오늘도 공개 index가 내보내는 `ValidatorPlugin`이며 그 개정은 PR-4의 몫이다; 32C-01의 "새 계약 형은 공개 index가 아닌 새 엔진 쪽 모듈에서 내보낸다"는 코어가 받는 계약 형 `Validator`(가칭)와 Form 속성 `validatorFactory`의 공개 형에 한한 말이고, 플러그인용 `ValidatorPlugin`에는 미치지 않는다." (`reviews/round-34-closing.md:9`)
  > 편집자 결정(34C-01): "【추론】 PR-4의 `ValidatorPlugin` 개정은 더하기만 한다: `compileGuard?(root, pointer)`·`release?(root)`를 선택 멤버로 더하고, `compile` 결과 함수의 에러 정규화에 `rejectedKey`를 더한다; 선택으로 두는 까닭은 옛 엔진이 PR-7까지 공개 진입점을 섬기는 동안(LANDING-159 규칙 3) 소비자의 사용자 정의 플러그인이 형 검사에서 깨지지 않게 하는 것이며, 필수로 좁히는 것은 Form 속성이 `{ compile, compileGuard }` 객체가 되는 PR-7(LANDING-036 이주 33)에서 이주 항목과 함께 한다." (`reviews/round-34-closing.md:10`)
  > 편집자 결정(182C-01): "【추론】 인용 오류는 원장의 신뢰를 깎으므로 발견 즉시 바로잡는다. 빌드 결함은 제품 코드가 아니라 저장소의 빌드 도구에 있고 옛 배포본부터 같았으므로 07의 게이트를 다시 열 이유는 없지만, 1.0.0 배포 전에는 고쳐야 ESM 소비자가 개발 전용 비용을 지지 않는다 — 그래서 소유자 결정으로 올린다." (`reviews/round-182-closing.md:9`)
  > 소유자(193라운드, 주석 고침, core·SchemaNode 위계 재고찰, 현 구조 불수용): "가도 되는데, core 와 schemaNode 의 관계, 그리고 위계에 대해서 충분히 고찰을 하고 고치도록 해. filid 구조검사만으론 통과가 가능할 수도 있는데, 난 지금 구조는 용납하지 않아" (`reviews/round-193-owner-answers.md:7`) — SchemaNode 클래스의 inheritDoc 주석은 reviewer 2라운드에서 직접 문장으로; src/core의 평평한 구조는 소유자가 받아들이지 않으므로 core와 SchemaNode의 관계·위계를 고찰한 문서를 먼저 쓰고 07 머지 뒤 재배치(개선-38)(원장 관리자, 2026-10-13).
  > 편집자 결정(206C-01): "【추론】 소비자 증거가 "겉면이 엔진의 유일한 출구"를 보여 주니 트리가 그 관계를 말하게 하는 것이 목표이고, C는 그것을 가장 적은 이동(진입점 하나와 이름표 67개)으로 이룬다. B는 겉면 루트를 비대하게 하고 D는 묶음 사이 상호 의존을 만든다." (`reviews/round-206-closing.md:9`)
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
- 보충:
  > 편집자 결정(35C-04): "【추론】 NODE-009(behaviors 밖에서도 쓰는 것은 `blueprint/`로)와 LANDING-085·094(PR-5의 이동)대로 `resolveArrayLimits`는 `blueprint/`의 조직에 두고 청사진 진입점에서 이름으로 내보내며, 조각이 준 `minItems`·`maxItems`가 세어지도록 유효 스키마의 `schema`를 받는다(WRITE-022 "제약을 유효 스키마로 노출"); 코어는 채우지도 막지도 않는다." (`reviews/round-35-closing.md:32`)
  > 편집자 결정(35C-04): "【추론】 PR-5 안의 소비자는 옮긴 시험뿐이고 의도한 소비자는 렌더 계층의 입력 컴포넌트(PR-7·08)이므로 그 의도를 `blueprint/DETAIL.md`에 적는다(소비자 없는 내보내기는 의도를 적는다는 공개 계약 규칙); 레거시의 사본은 LANDING-159 규칙대로 `__legacy__`에 09까지 남고, 레거시가 옮긴 것을 가져오지 않는다." (`reviews/round-35-closing.md:33`)
  > 편집자 결정(35C-12): "【추론】 터미널 배열 행은 NODE-005대로 원본을 배열 전체로 들고 `push`·`pop`·`update`·`remove`·`clear`를 원본의 사본 위에서 수행해 호스트를 통째로 쓰며(아이템 노드·재인덱싱·아이템 스냅숏 이어 붙임이 없고 호스트 자신의 로드 스냅숏이 단위다), `project`가 LANDING-085가 `arrayBehavior/utils/`로 옮긴 `omitTrailing`·`omitEmpty` 보조로 자르고, 값이 `null`이면 동사는 무효 호출(35C-06)이며, VALUE-034의 빈자리 채움은 적용되지 않는다; 원본 B는 다른 터미널 노드처럼 호스트의 이전 `raw`만 적고 구조 로그는 두지 않는다." (`reviews/round-35-closing.md:98`)
  > 편집자 결정(36C-02): "【추론】 NODE-052는 자리 i의 청사진을 `prefixItems[i]`, 아니면 스키마인 `items`, 옛 철자 `items: [..]`이면 `additionalItems`로 정했는데 02 청사진은 `items: [..]`를 튜플로 컴파일하되 `additionalItems`를 컴파일하지 않으므로, 그 꼬리 자리의 아이템 템플릿 컴파일은 PR-5가 청사진에 더한다(아이템은 PR-5의 기제다, TEST-069 (라); LANDING-085가 `resolveArrayLimits`의 청사진 이동을 PR-5에 둔 것과 같은 결의 변경); 청사진 fractal의 DETAIL을 먼저 고치고 02의 기존 시험은 바꾸지 않는다." (`reviews/round-36-closing.md:17`)
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
- 보충:
  > 편집자 결정(71C-01): "【추론】 LANDING-087의 "지운다"는 새 엔진의 `core/types`에서 노드 형 묶음이 사라진다는 뜻이고, LANDING-205는 레거시를 PR-8까지 참고용으로 보존하되 그 안에 두면 tsc·eslint가 설정 변경 없이 따라간다고 했으므로(LANDING-159) 레거시는 전환 뒤에도 컴파일되어야 한다. 둘을 함께 지키는 길은 LANDING-159가 정한 옮김의 모양 그대로다: `src/core/types/node.ts`·`constructor.ts`의 내용을 `src/__legacy__/core/types/`에 같은 상대 경로로 두고(그 안의 `index.ts`가 이름으로 다시 내보냄), 레거시 파일의 가져오기는 별칭 접두만 바꾼다(`@/schema-form/core/types` → `@/schema-form/__legacy__/core/types`, 상대 경로 가져오기는 레거시 안의 묶음을 가리키도록 고침). 70C-01이 `contextNodeFactory`를 옛 엔진과 함께 레거시로 보낸 것과 같은 처분이다. 레거시가 계속 가져오는 `event`·`state`·`value` 형은 오늘 레거시가 이미 `core/types`에서 가져오던 것이고 형 전용이므로 규칙 2("레거시 → 새 코드는 08 §17.2가 이미 적은 곳만")의 허용 목록을 넓히지 않는다 — 다만 07은 그 형들의 뜻이 새 엔진에서 바뀌었다면(예: 상태 비트의 이름) 레거시 쪽 사본을 `src/__legacy__/core/types/`에 함께 두어 레거시가 새 형에 끌려가지 않게 한다. 새 fractal이 `__legacy__`를 가져오지 않는 규칙 1과 "새 코드가 레거시를 가리키는 import 0" 점검(LANDING-205)은 그대로이고, 옮긴 두 파일은 처분표(68C-01)와 이주 점검표(68C-02)가 아니라 `plan/07-switch/log.md`의 레거시 이동 목록에 적는다." (`reviews/round-71-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:38`(정본), `08-design-a-to-z.md:577`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:38`
- 충돌:
  > `09-landing-and-test-strategy.md:38`의 "UI 플러그인 27파일"는 소유자 답과 다르다: UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 보충:
  > 편집자 결정(25C-08): "【추론】 시나리오 데이터 모듈의 자리는 `packages/aileron/schema-form-scenarios/src/<부류>/<이름>.scenario.ts`이며 TEST-023의 `src/**/*.scenario.ts` 안이다." (`reviews/round-25-closing.md:76`)
  > 편집자 결정(25C-08): "【추론】 시나리오 감싸개는 `ScenarioForm`, 핸들 등록은 `registerScenarioHandle`, 핸들 찾기는 `findScenarioHandle`이다." (`reviews/round-25-closing.md:77`)
  > 편집자 결정(60C-01): "【추론】 filid의 분류는 "어댑터가 모듈 index를 보고하면 fractal"이고 "다른 이가 이름으로 부르면서 내부는 자유로이 바뀌는 디렉토리는 fractal"인데, 가족 디렉토리마다 `index.ts`가 그 가족의 장면 목록(`arrayScenarios` 등)을 이름으로 내보내고 패키지 루트 `index.ts`가 그것을 이름으로 가져오므로 가족은 자료 묶음이면서도 계약(장면 목록)을 가진 모듈이다; 그래서 문서 없이 예외로 두는 (A)는 분류를 거스르고, 뒤로 미루는 (C)는 같은 발견을 PR마다 다시 보게 하므로 (B)를 택한다. 문서는 짧다 — INTENT는 그 가족이 어느 동작 부류의 장면을 담는지와 자료 전용(실행·엔진 의존 없음, TEST-010)이라는 규약, DETAIL은 장면 파일 목록과 각 장면이 검증하는 원장 항목(배열 가족이면 TEST-018과 35C~48C의 결정들)이다. 패키지 INTENT의 "Families name value, settle, fill, exit, and union behavior"는 derive·controls·array를 더해 여덟으로 고친다." (`reviews/round-60-closing.md:9`)
  > 편집자 결정(60C-01): "【추론】 여덟 가족 모두 #353에서 한다: 소유자가 "시나리오 문서의 처리"라는 패키지 전체의 결정을 구했고 문서만 더하는 변경이라 코드 위험이 없으며, 일곱 가족을 따로 PR로 내면 소유자의 머지 지시가 한 번 더 들고 그동안 05·07의 검사가 같은 발견을 다시 낸다; 06 실행 기록 §4에 "기존 일곱 가족의 문서는 패키지 전체 결정(60C-01)으로 이 PR에 들었다"고 적는다. `*.scenario.ts`의 홀로 파일 경고는 장면 하나가 파일 하나인 설계된 모양(LANDING-090의 "신규 시나리오의 자리와 파일당 상한")이므로 `.filid/config.json`의 `zero-peer-file.exempt`에 기존 항목들의 결대로 `**/aileron/schema-form-scenarios/src/**`를 더해 닫고, `array.spec.ts`의 동적 표 사례 상한 미확정은 통과로 바꾸지 않고 그 시험이 속한 fractal의 DETAIL에 "표가 장면 목록에서 생성되어 사례 수가 정적으로 세어지지 않는다"고 선언한다." (`reviews/round-60-closing.md:10`)
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
- 보충:
  > 편집자 결정(25C-07): "【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다." (`reviews/round-25-closing.md:68`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:257`(정본), `08-design-a-to-z.md:571`, `reviews/round-18-closing.md:193,196`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`
- 충돌:
  > `09-landing-and-test-strategy.md:257`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정) 이것이 그 규칙의 예외이고, `intersectPattern`은 새 fractal로 옮기지 않고 레거시에 남는다(SCHEMA-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`).
  > `09-landing-and-test-strategy.md:257`의 "18라운드 안건 '전환 방식의 세부'"는 18라운드 결정과 다르다: 그 안건은 닫혔다 — PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다(LANDING-159, LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1330-1363`).

### LANDING-092 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-2 | 되돌림 기록 항목 확정(§2.1의 조건 5), 노드 구조(§3: `record/`·`behaviors/`·`navigation/`·`SchemaNode/`, 행은 잎 넷·객체 둘(터미널 객체까지)·가상. 터미널 배열은 PR-5), `active` 게터, 나감 비움의 하위 트리 규칙(R17-2 ㄴ) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:258`(정본), `08-design-a-to-z.md:572`, `reviews/round-18-closing.md:79`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02; PR-2에 `union` 행)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:23`
- 충돌:
  > `09-landing-and-test-strategy.md:258`의 "행은 잎 넷·객체 둘(터미널 객체까지)·가상"는 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다(BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).

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
  > 반영 칸(개발계획 P1): "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로)." (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(34C-01): "【추론】 코어의 `Validator` 형은 `src/core/validation/`에 두고 공개 index에서 내보내지 않으며, `compileGuard`가 있는 `ValidatorPlugin` 값이 구조적으로 `Validator`를 만족하게 두 형을 맞춘다; ajv 플러그인 셋은 세 멤버를 모두 구현하고(LANDING-093 개발계획 P1), 코어 쪽 적합성은 코어의 시험이 플러그인 셋을 `Validator`로 받아 단언한다. 부속 경로(`exports`에 둘째 진입점)를 더하는 것은 공개 겉면 추가라 이 라운드가 열지 않는다." (`reviews/round-34-closing.md:11`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:259`(정본), `08-design-a-to-z.md:574`, `reviews/round-18-closing.md:876-878,2056`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30·18C-74), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
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
- 보충:
  > 편집자 결정(68C-05): "【추론】 앞선 답(07 착수 전 물음 1)의 "`src/**`, `verification/**`, `plan/07-switch/**`, PLAN §3·§4의 07 행"은 `architecture/` 안에서 원장 관리자와 단계 작업자가 나눠 갖는 문서의 경계였고, 코드의 범위는 PR-7의 원장 행이 정한다. LANDING-067·095가 이름 댄 것(옛 스토리 49파일 정리와 시나리오 스토리·`playScenario`, `renderForm` 다섯과 부류별 e2e 실행기, `node.group`·`FormTypeRenderer`의 플러그인 쪽 소비자 이주, `@winglet/react-utils`의 바운더리 선택 인자), TEST-026이 이름 댄 것(`@aileron/benchmark-form`의 새 항목과 `fixtures/equivalent`, `bench/`, `.github/workflows/performance-benchmarks.yml`), REACT-017이 요구하는 React 18 실행 시험의 개발 의존(그에 따른 `yarn.lock`), 그리고 그것들이 돌게 하는 설정(`.storybook/`, `vite.config.ts`, `eslint.config.js`, `package.json`)은 모두 07의 경로다. `@aileron/schema-form-scenarios`는 시나리오 스토리와 e2e 실행기가 읽는 데이터 모듈이라 LANDING-087의 "그대로 쓰는 것"에 들고, 07은 전환이 요구하는 추가만 한다. 이 밖의 경로(다른 패키지, 저장소 설정)에 손대야 하면 쓰기 전에 물음으로 보낸다. 플러그인 패키지의 `src`는 68C-07의 범위 안에서만 고친다." (`reviews/round-68-closing.md:37`)
  > 편집자 결정(68C-06): "【추론】 TEST-055는 PR-7이 `@winglet/react-utils`의 자기 changeset(`minor`)을 더한다고 정했고, 루트 `CLAUDE.md`의 "changesets를 쓰지 않고 릴리스 때 판을 올린다"와의 충돌은 01 재정렬 기록(`plan/01-design-docs/realign.md:29,167`)이 "TEST-054·055, LANDING-097: 원장이 이긴다"로 닫았으며, 02(PR-1)는 그대로 `.changeset/common-utils-merge-policies.md`를 더했다. 07은 같은 모양으로 `.changeset/` 아래 `@winglet/react-utils`의 `minor` changeset 파일 하나를 더하고 변경 사유를 그 파일과 커밋 메시지에 적는다. `package.json`의 `version`은 올리지 않는다 — 판 올림은 changesets 가동(LANDING-097, 릴리스 전환 PR)과 PR-8(LANDING-096)의 몫이고, 07이 올리면 프리릴리스 무리의 판 계산과 두 번 셈한다. 루트 `CLAUDE.md`의 문장은 릴리스 전환 PR이 고친다(LANDING-097 "판 올림 스크립트 정리와 루트 `CLAUDE.md`")." (`reviews/round-68-closing.md:44`)
  > 편집자 결정(68C-09): "【추론】 LANDING-095의 "`architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3)"은 기준만 적었고 목록은 없다. 07은 스파이크의 시험 파일(오늘 `spikes/events/caret`·`entry`, `spikes/work-loop/redteam4-events/current`·`react`)을 사례 단위로 나눠 사례마다 (가) 제품 동작으로 남아 e2e 또는 렌더 시험으로 옮김(새 시험 이름), (나) 설계 탐색이라 옮기지 않음(까닭)을 적은 표를 `plan/07-switch/log.md`에 두고, 옮긴 시험은 새 자리에서 돌며 스파이크 파일은 지우지 않는다(스파이크는 설계 기록이다). 여기에 더해 EVENT-070·REACT-017(18C-85)이 PR-7에 둔 사례 — `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드 — 는 `spikes/events/`에 더하고 React 18과 19에서 각각 실행하며, 통과(두 이펙트 모두에서 React가 순환을 끊음)이면 규칙을 그대로 두고 실패하면 EVENT-070대로 소유자에게 올린다(편집자가 정하지 않는다)." (`reviews/round-68-closing.md:65`)
  > 편집자 결정(69C-02): "【추론】 LANDING-095의 PR-7 행은 "`reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호)"을 PR-7에 두었고, 05는 오류 코드 표에 `DISPOSED_NODE_WRITE`를 "재생성으로 버린 트리의 노드 쓰기만 거부"로 올리되 동작은 두지 않았다(`plan/05-dispatch-and-validation/log.md:102`). 그러므로 재생성 reset의 폐기(WRITE-046·086의 네 일), 상호작용 초기화 번호의 노드 칸과 그것을 올리는 셋(reset, `clearState`, `controls.resetInteraction`; REACT-024)과 바인딩의 읽기(`useSchemaNodeTracker`), 폐기된 노드에 온 쓰기의 `DISPOSED_NODE_WRITE`는 07이 코어에 더하는 것이 원장의 배정이며 03·04·05의 결함으로 적지 않는다. 조건: 폐기는 부모·자식·루트 참조를 끊지 않고(WRITE-086), 옛 노드의 읽기는 폐기 직전 마지막 커밋을 돌려주며, 검증기 등록의 참조 수는 폐기가 아니라 옛 트리의 효과 정리에서 내린다; 번호 올리기는 통지 없이 동기이고 Refresh 번호는 `revision`과 함께 노드가 든다(REACT-024); 입력 출처 표식이 붙은 늦은 쓰기는 조용히 버리고 표식 없는 쓰기만 `DISPOSED_NODE_WRITE`로 던진다(REACT-010의 가름). 코어 쪽 변경은 `record`·`settle`·`dispatch`의 DETAIL을 코드보다 먼저 고치고, 차등 시험(폐기 전후의 개정 대장과 값 불변)으로 03–06의 시나리오가 그대로임을 보인다." (`reviews/round-69-closing.md:16`)
  > 편집자 결정(77C-01): "【추론】 TEST-025는 소유자 답(16라운드 답 4, "전체 정리 허용")을 받아 옛 스토리 49파일의 처분을 셋으로 정했고 09 §5.4는 "옛 스토리는 PR-7에서 모두 정리된다"고 했으므로, 옛 스토리는 `src/__legacy__/`의 엔진 코드처럼 PR-8까지 보존하는 것이 아니라 PR-7 안에서 파일마다 처분되는 대상이다(LANDING-205의 보존은 `src/__legacy__/`에 한한다; 73C-01이 옛 스토리를 "같은 처분"이라 한 것은 글롭에서 빼는 수단을 말한 것이지 보존을 뜻하지 않는다). 그래서 U8의 (C) — Storybook 글롭과 `tsconfig`의 형 검사에서 `stories/*.stories.tsx`를 빼는 것 — 는 U9(새 시나리오 스토리와 `playScenario`)가 처분을 마칠 때까지 묶음 끝 점검을 초록으로 두는 발판으로만 허용하고, PR-7의 게이트는 "옛 스토리 파일이 남지 않는다"이다: 02가 만든 처분 목록(`verification/02-foundation-and-blueprint/story-disposition.md`)의 행마다 (가) 시나리오 → 데이터 모듈 + `stories/scenarios/`의 다섯 줄 스토리(새 이름), (나) 사용법 → `stories/usage/`에 새 문법으로 다시 씀(소수), (다) 인라인 스키마 → 지움을 적어 07의 처분표 옆에 두고, U9 끝에 49파일을 지우며 글롭·`tsconfig`의 제외 항목도 함께 없앤다. 262건의 형 오류를 새 API로 고쳐 살리는 대안은 TEST-025의 "인라인 스키마 스토리는 남기지 않는다"와 어긋나므로 택하지 않는다. (A)는 68C-01·TEST-005의 적용이고 "버리고 새로 쓴다" 31파일을 U8에서 지우고 U9에서 e2e로 다시 쓰는 사이의 상태는 처분표가 행방을 들고 PR-7이 원샷이므로 허용되며, 기대값이 원장 변경과 부딪히는 파일은 멈추고 물음으로 보낸다; (B)는 73C-01·75C-01 그대로; (D)는 TEST-021의 고칠 것 다섯이다." (`reviews/round-77-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:261`(정본), `08-design-a-to-z.md:577`, `reviews/round-18-closing.md:2730-2731`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:44`, `reviews/round-18-closing.md:2734-2736`
- 충돌:
  > `09-landing-and-test-strategy.md:261`의 "`setValue(V)`의 같은 입력 판정"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).
  > `09-landing-and-test-strategy.md:261`의 "UI 플러그인 27파일의 `presentation.*` 이주"는 소유자 답과 다르다: UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

### LANDING-096 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-8 | 릴리스 전 벤치 재실행, changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(§6.2, 16라운드 스웜 수렴(편집자 결정)), README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째), 스토리북 문서 |
- 보충:
  > 반영 칸(개발계획 P2): "디렉토리 삭제는 PR-8이 한다." (`reviews/round-18-owner-answers.md:43`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:262`(정본), `08-design-a-to-z.md:578`, `reviews/round-18-owner-answers.md:43`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:225`
- 충돌:
  > `09-landing-and-test-strategy.md:262`의 "과 `CHANGELOG.md`"는 TEST-045와 다르다: `changeset version`은 `changesets/action` 안에서만 돌므로 `CHANGELOG.md`는 병합 뒤 그 작업 흐름의 판 올림 PR이 만들고 PR-8은 changeset만 쓴다(TEST-045). TEST-045가 이긴다(`09-landing-and-test-strategy.md:237`).

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
  > > 소유자(24라운드, PR #348 검토): "기본적으론 판단에 동의합니다" (`reviews/round-24-owner-answers.md:7`) — 현행(기록)으로 내린 것을 포함한 충돌 줄 해석에 동의했다.
- 상태: 현행(기록)
- 출처: `06-conclusions.md:429#2`(정본, 옛 기록), `08-design-a-to-z.md:254,265,325`, `03-mental-model.md:81`, `06-conclusions.md:231`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)), 소유자 답(`reviews/round-24-owner-answers.md:7` PR #348 검토; 현행(기록)으로 내린 것에 동의)
- 라운드: 24
- 까닭: `06-conclusions.md:429`
- 충돌:
  > `06-conclusions.md:429`의 "`computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436,462`, 15라운드 결정 5). LANDING-007·LANDING-033이 이긴다: `computed` 컨테이너는 `controls`로 이름을 바꾸고 별칭이 없으며, 평면 `&키` 축약은 사라지고 제어 키는 `controls` 안에만 있다.

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
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5). LANDING-007이 이긴다: `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음.
  > `07-conclusions.md:423`의 "`&if`→`&active`(6.1)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:435`, 15라운드 결정 5). LANDING-006이 이긴다: `&if`는 `controls.active`로 흡수된다.
  > `07-conclusions.md:423`의 "`&unsetValue` 신설"은 뒤 라운드의 결정과 다르다: 신설되는 키의 이름은 `controls.unsetValue`이며 평면 `&키` 축약은 사라졌다(LANDING-009, LANDING-033). 뒤 라운드가 이긴다(`08-design-a-to-z.md:462`).

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
- 보충:
  > 소유자(177라운드, ENHANCED_KEY·transformErrors 제거): "제거 가능하다고 답변해. 작업은 진행중인건가? 아니면 멈춘거야?" (`reviews/round-177-owner-answers.md:7`) — 새 엔진 쪽의 ENHANCED_KEY와 transformErrors를 reviewer 세션이 제거한다(src/__legacy__ 불변, 문서 세 곳 수정, 근거 VALIDATE-010·LANDING-115·PR-4 표)(원장 관리자, 2026-10-12).
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
- 보충:
  > 결정 표의 머리 행: "| 항목 | 현재 | 새 설계 | 변화 | 근거 |" (`05-before-after.md:121`)
  > "| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. 17종 개별의 생사는 언급이 없다 | 재정의 + **미확인** | `core/types/event.ts:45-96` / `adr/0008:24-28` |" (`05-before-after.md:123`) — 명령 어휘 행 근거 칸의 "동일"은 이 행의 근거를 가리킨다.
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
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), `reviews/round-18-owner-answers.md:17`, 같은 규칙의 원장 항목 ERROR-186, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:17`, `reviews/round-18-owner-answers.md:8-9`
- 충돌:
  > `reviews/round-18-owner-answers.md:9`의 "`onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

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
- 보충:
  > 편집자 결정(19C-01): "【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다." (`reviews/round-19-closing.md:27`)
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
- 보충:
  > 편집자 결정(80C-03): "【추론】 귀속의 기준은 72C-01·78C-02가 가른 대로 "원장이 그 단계에 둔 규칙이 온전히 있었는데 코드가 없거나 다른가"다. (가) LANDING-141의 `INVALID_WRITE_OPTION`은 05가 오류 코드 표(`plan/05-dispatch-and-validation/log.md:101`)에 "확정·동일, 충돌한 공개 쓰기 옵션의 호출자 오류"로 올렸으므로 던지는 동작이 없던 것은 05의 결함이다. (나) LANDING-132·SCHEMA-041의 `required` 표시는 "부모 유효 스키마의 `required`(연언 문맥의 켜진 조각 합집합)"이고 유효 스키마는 정착이 계산하므로(03의 `selectNodeSchema`, 04의 게이트·조각 선택) 켜진 `then`에 따라 자식의 `required`가 갱신되지 않던 것은 03·04의 결함이며, 07은 고친 파일로 둘 가운데 어느 쪽인지 적는다. (다) LANDING-021의 옛 `core/types/value`에 남은 `SetValueOption` 복합 비트는 LANDING-087이 "`core/types`의 event·state·value는 남는다"고 하며 그 안의 옛 비트 정리를 07의 형 전환(진입점 전환과 함께)에 둔 것이므로 결함이 아니라 07의 몫이다. (라) `FormHandle.reset(option?)`(억제 비트 둘만, WRITE-015 보충·ADR 0013)은 07의 U6이 빠뜨린 것이므로 앞 단계 귀속이 아니라 07의 실행 기록에 "빠뜨린 것을 채움"으로 적는다. (가)·(나)는 42라운드·78C-02의 선례대로 `plan/07-switch/log.md` §8 "앞 단계 결함"에 재현 사례와 함께 적고, 메운 시험(이주 점검표의 (가) 행)이 그 증거다." (`reviews/round-80-closing.md:25`)
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
- 보충:
  > 편집자 결정(28C-07): "【추론】 `FormTypeInputProps.watchValues`로 넘기는 일은 PR-7 렌더 계층이고, LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과이므로 PR-6의 게터에 든다; EVENT-064의 계산 상태 비트에 `watchValues`가 드는 것은 PR-4 배달의 몫이다." (`reviews/round-28-closing.md:77`)
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
- 보충:
  > 편집자 결정(80C-03): "【추론】 귀속의 기준은 72C-01·78C-02가 가른 대로 "원장이 그 단계에 둔 규칙이 온전히 있었는데 코드가 없거나 다른가"다. (가) LANDING-141의 `INVALID_WRITE_OPTION`은 05가 오류 코드 표(`plan/05-dispatch-and-validation/log.md:101`)에 "확정·동일, 충돌한 공개 쓰기 옵션의 호출자 오류"로 올렸으므로 던지는 동작이 없던 것은 05의 결함이다. (나) LANDING-132·SCHEMA-041의 `required` 표시는 "부모 유효 스키마의 `required`(연언 문맥의 켜진 조각 합집합)"이고 유효 스키마는 정착이 계산하므로(03의 `selectNodeSchema`, 04의 게이트·조각 선택) 켜진 `then`에 따라 자식의 `required`가 갱신되지 않던 것은 03·04의 결함이며, 07은 고친 파일로 둘 가운데 어느 쪽인지 적는다. (다) LANDING-021의 옛 `core/types/value`에 남은 `SetValueOption` 복합 비트는 LANDING-087이 "`core/types`의 event·state·value는 남는다"고 하며 그 안의 옛 비트 정리를 07의 형 전환(진입점 전환과 함께)에 둔 것이므로 결함이 아니라 07의 몫이다. (라) `FormHandle.reset(option?)`(억제 비트 둘만, WRITE-015 보충·ADR 0013)은 07의 U6이 빠뜨린 것이므로 앞 단계 귀속이 아니라 07의 실행 기록에 "빠뜨린 것을 채움"으로 적는다. (가)·(나)는 42라운드·78C-02의 선례대로 `plan/07-switch/log.md` §8 "앞 단계 결함"에 재현 사례와 함께 적고, 메운 시험(이주 점검표의 (가) 행)이 그 증거다." (`reviews/round-80-closing.md:25`)
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
- 보충:
  > 편집자 결정(42C-01): "【추론】 ERROR-195의 "즉시 throw하고, throw 직전에 `onError`로 보낸다"에서 throw는 PR-5가 `settle`의 쓰기 표시에서 하고, `onError` 보고는 PR-4의 보고기를 쓰므로 35C-01과 같이 33C-01의 디스패치 배선과 함께 뒤에 머지하는 단계가 잇는다; 06이 먼저 머지되면 던지기만 하고 그 자리의 DETAIL에 배선 PR이 보고를 더한다는 한 줄을 남긴다. 코드 이름은 가칭 `INVALID_VIRTUAL_NODE_VALUES` 그대로 쓰고(이미 파생 경로가 쓰는 코드와 같은 하나다) 05의 확정 목록(31C-05)에 든다. LANDING-147의 이주(오류 클래스가 `SchemaFormError`로, 같은 길이 문자열 쪼개기는 거부로)는 이 수정으로 호출자 경로에서도 실현된다." (`reviews/round-42-closing.md:11`)
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
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1115`(정본), `reviews/round-18-closing.md:2665`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2711-2715`
- 충돌:
  > `reviews/round-18-closing.md:1115`의 "자사 플러그인 수정 목록은 PR-7 이주 항목이다: antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151)."는 소유자 답과 다르다: 자사 플러그인 수정 목록은 PR-7 뒤의 플러그인 PR이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).
  > `reviews/round-18-closing.md:2665`의 "【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다."는 소유자 답과 다르다: 이주 표의 행 LANDING-181–LANDING-186과 이주 점검은 PR-7에 남고, 자사 플러그인마다의 union 항목은 플러그인 PR이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 보충:
  > 반영 칸(개발계획 P2): "`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다." (`reviews/round-18-owner-answers.md:43`)
  > 편집자 결정(18C-49에 LANDING-205를 적용): "【추론】 옛 코드와 함께 사는 `__tests__`는 코드와 함께 옮겨지고, PR-7까지 그대로 돈다." (`reviews/round-18-closing.md:1353`) — LANDING-205 뒤에는 PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다.
  > 편집자 결정(32C-01): "【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다." (`reviews/round-32-closing.md:10`)
  > 편집자 결정(32C-01): "【추론】 그래서 PR-4의 새 계약 형은 공개 index가 아닌 새 엔진 쪽 모듈에서 내보내고, ajv 플러그인 셋은 그 형을 구현한다; 플러그인 패키지의 공개 겉면이 PR-4에서 바뀌는 것은 LANDING-093·LANDING-192(이주)대로이며 소비자용 Form 속성은 전환 뒤에 따른다." (`reviews/round-32-closing.md:11`)
  > 편집자 결정(50C-01): "【추론】 34C-02가 옛 이름을 남기라고 한 까닭은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진이고 PR-4 전에는 공개 동작 변경이 없다, 32C-01)대로 옛 `<Form>` 형과 플러그인 스토리, 그리고 소비자 코드가 계속 컴파일되게 하는 것이므로, 같은 형의 별칭이 `details`를 `unknown`으로 좁혀 소비자 코드를 PR-7 전에 깨뜨린다면 그 수단이 뜻을 거스른다; 그래서 `JSONSchemaError`는 옛 공개 형과 같은 모양을 지키는 `ValidationIssue`의 호환 확장(`details?: Record<string, any>`, `key?: number`)으로 `src/index.ts`에서 이름으로 내보내고, 새 엔진의 `ValidationIssue`는 `details?: Record<string, unknown>`을 지키며 함께 내보낸다(새 엔진의 값은 확장에 대입 가능하고, 새 엔진은 `key`를 쓰지 않는다). 옛 이름을 지우는 것은 34C-02·LANDING-024대로 PR-7 또는 PR-8의 몫이고, 그때 `any`와 `key`도 함께 사라진다; `ValidationIssue.details`를 `any`로 넓히거나 소비자의 좁힘을 받아들이는 길은 택하지 않는다." (`reviews/round-50-closing.md:9`)
  > 편집자 결정(71C-01): "【추론】 LANDING-087의 "지운다"는 새 엔진의 `core/types`에서 노드 형 묶음이 사라진다는 뜻이고, LANDING-205는 레거시를 PR-8까지 참고용으로 보존하되 그 안에 두면 tsc·eslint가 설정 변경 없이 따라간다고 했으므로(LANDING-159) 레거시는 전환 뒤에도 컴파일되어야 한다. 둘을 함께 지키는 길은 LANDING-159가 정한 옮김의 모양 그대로다: `src/core/types/node.ts`·`constructor.ts`의 내용을 `src/__legacy__/core/types/`에 같은 상대 경로로 두고(그 안의 `index.ts`가 이름으로 다시 내보냄), 레거시 파일의 가져오기는 별칭 접두만 바꾼다(`@/schema-form/core/types` → `@/schema-form/__legacy__/core/types`, 상대 경로 가져오기는 레거시 안의 묶음을 가리키도록 고침). 70C-01이 `contextNodeFactory`를 옛 엔진과 함께 레거시로 보낸 것과 같은 처분이다. 레거시가 계속 가져오는 `event`·`state`·`value` 형은 오늘 레거시가 이미 `core/types`에서 가져오던 것이고 형 전용이므로 규칙 2("레거시 → 새 코드는 08 §17.2가 이미 적은 곳만")의 허용 목록을 넓히지 않는다 — 다만 07은 그 형들의 뜻이 새 엔진에서 바뀌었다면(예: 상태 비트의 이름) 레거시 쪽 사본을 `src/__legacy__/core/types/`에 함께 두어 레거시가 새 형에 끌려가지 않게 한다. 새 fractal이 `__legacy__`를 가져오지 않는 규칙 1과 "새 코드가 레거시를 가리키는 import 0" 점검(LANDING-205)은 그대로이고, 옮긴 두 파일은 처분표(68C-01)와 이주 점검표(68C-02)가 아니라 `plan/07-switch/log.md`의 레거시 이동 목록에 적는다." (`reviews/round-71-closing.md:9`)
  > 편집자 결정(73C-01): "【추론】 LANDING-159는 "09 §4.3의 처분은 파일마다 한다"고 했고, LANDING-205를 적용한 보충은 "PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다"고 정했다. 레거시 안의 `<Form>` 렌더 시험 둘은 옛 엔진을 `<Form>`으로 시험한 것이라 전환 뒤에는 뜻을 잃으므로 같은 처분(글롭에서 뺌)을 받고, 동시에 렌더 시나리오이므로 그 사례(14건)는 처분표(68C-01)에 추가 행으로 올라 09 §4.3의 처분을 받는다 — 시나리오별로 이주 행(`if`·`then`·`else`의 게이트 이주, nullable의 `type` 배열 이주 등)과 대조해 조합·옛 키가 있으면 "버리고 새로 쓴다"(새 e2e로 옮김, 새 시험 이름을 행에 적음), 없으면 TEST-005의 "표면만 고친다"로 단언을 살린다. 레거시 파일은 LANDING-205대로 고치지 않는다(사례만 지우는 것도 레거시 수정이며, 참고용 보존의 뜻에 어긋난다). 전환 커밋(진입점을 새 엔진으로 바꾸는 커밋)에서 render·unit 프로젝트의 포함 글롭에서 `src/__legacy__/**`를 빼고, 그 변경을 처분표의 머리에 "레거시 시험 N파일 M건은 LANDING-159 보충대로 글롭에서 뺌; 그 가운데 `<Form>` 렌더 사례 14건은 아래 행으로 처분"이라고 적는다. 두 파일만 빼는 대안을 쓰지 않는 까닭은 뺄 단위가 파일 둘이 아니라 레거시 전체이기 때문이고, 07의 권장을 그대로 쓰지 않는 까닭은 레거시 파일을 고치기 때문이다. 처분표에 행이 있고 새 e2e의 이름이 적히므로 붉은 시험을 숨기는 것이 아니다; 글롭에서 뺀 레거시의 시험이 PR-8 전까지 돌지 않는 것은 LANDING-159 보충이 받아들인 상태다." (`reviews/round-73-closing.md:9`)
  > 소유자(74라운드, 레거시의 완전 분리): "예. 완전히 분리하세요. 저는 사실 패키지 레벨에서 분리를 할거라고 생각했는데, 이정도만 분리해도 괜찮겠네요" (`reviews/round-74-owner-answers.md:7`) — 규칙 2(레거시 → 새 코드는 08 §17.2가 적은 곳만 허용)는 폐기되고 레거시는 새 코드를 하나도 가져오지 않는다; 허용되던 가져오기와 새 `core/types`의 남는 형(event·state·value) 가져오기는 모두 `src/__legacy__/` 안의 사본으로 바꾼다. 규칙 1과 함께 양방향 import 0이며, 사본은 전환 뒤 글롭에 묶이지 않고 PR-8이 디렉토리와 함께 지운다. 패키지 수준 분리는 하지 않는다(원장 관리자, 2026-10-02).
  > 편집자 결정(75C-01): "【추론】 LANDING-205가 보존하는 것은 "참고용 옛 구현"이고, 74라운드 소유자 답은 레거시가 새 코드를 하나도 가져오지 않는 완전 고립을 정했다. 두 시험 파일은 옛 노드·파서를 직접 부르지 않고 공개 진입점 `@/schema-form`의 `<Form>`을 그려 단언하므로 그 뜻은 "공개 폼의 동작"이지 "옛 구현"이 아니며, 전환 뒤에는 새 `<Form>`을 옛 기대로 단언하는 모순된 파일이 된다. 옛 렌더 계층을 레거시에 복제해 이 둘을 살리는 것은 소유자 답의 "코드 복사본이 있어도 분리"의 뜻(필요한 조각의 사본)을 넘어 옛 `<Form>` 전체를 둘로 만드는 일이라 택하지 않고, ESLint 규칙에서 둘만 빼는 예외는 소유자가 "완전히 분리하세요"라고 한 것과 어긋나므로 두지 않는다. 그러므로 73C-01의 처분 가운데 (1)은 그대로 — 사례 14건은 처분표 추가 행으로 올려 이주 행과 대조해 새 e2e로 옮기고 새 시험 이름을 행에 적는다 — 이고, (2) "레거시 파일은 고치지 않는다"는 옛 구현과 그것을 직접 시험하는 파일로 좁혀지며, 공개 진입점만 가리키는 이 두 파일은 사례의 행방이 처분표에 적힌 뒤 레거시에서 지운다. 옛 동작의 참고가 필요하면 전환 직전 커밋(07 U1의 기준선 커밋)에 그대로 있다. 73C-01의 (3) 글롭에서 레거시 전체를 빼는 것은 그대로다. 같은 기준으로 레거시 안에 공개 진입점만 가져오는 다른 파일이 더 있으면(스토리·시험) 같은 처분을 하고 `plan/07-switch/log.md`의 레거시 이동 목록에 "지움(공개 겉면의 시험, 사례는 처분표 행 N)"으로 적는다." (`reviews/round-75-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1330-1363`(정본), `reviews/round-18-owner-answers.md:43`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, 개발계획 07; 레거시 시험은 PR-7 뒤 글롭에서 뺌)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `reviews/round-18-closing.md:1342`의 "【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다."는 소유자 답과 다르다: `src/__legacy__/`는 PR-8까지 참고용으로 보존하고, PR-7은 진입점 전환과 레거시 import 0 점검만 하며, 삭제는 PR-8이 한다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1346`의 "【추론】 그 사이의 산출물은 옛 엔진이고, 우산 브랜치는 PR-8 전에 배포하지 않으며, PR-7이 디렉토리를 지운다."는 소유자 답과 다르다: 디렉토리는 PR-8이 지운다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1357`의 "PR-7에서 디렉토리와 함께 지운다"는 소유자 답과 다르다: `src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존하며 디렉토리 삭제는 PR-8이 한다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1343`의 "【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다."는 18라운드 결정과 다르다: PR-7의 점검은 새 코드가 레거시를 가리키는 import가 0인 것이고, `src/__legacy__/`는 PR-8까지 보존하며 디렉토리 삭제는 PR-8이 한다(LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1339`의 "【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)."는 소유자 답과 다르다: 레거시는 새 코드를 하나도 가져오지 않고 필요한 것은 `src/__legacy__/` 안의 사본으로 둔다. 소유자 답이 이긴다(`reviews/round-74-owner-answers.md:7`).
  > `reviews/round-18-closing.md:1336`의 "【추론】 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse(18C-36)를 가져오지 않으므로, 아래 규칙 2의 허용 목록은 바뀌지 않는다."는 소유자 답과 다르다: 규칙 2와 그 허용 목록은 폐기되었다. 소유자 답이 이긴다(`reviews/round-74-owner-answers.md:7`).

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
  > 소유자(설계서 메모 3): "publish 가 없어진건.. 자의적으로 이벤트를 호출할 수 없어서 좀 그렇긴 한데, 이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘. 이전에는 publish 에 섞여있어서 메소드로 안보였는데, 이걸 별도 메소드로 빼니까 node 의 정체성이 좀 깨지는걸 action 이나 interaction 이나 뭐든.... publish 를 부활시키던가..." (`reviews/round-18-owner-answers.md:40`)
  > 편집자 결정(68C-03): "【추론】 설계서 메모 3은 방향("넷을 따로 두지 말고 종류를 매개변수로 받는 메서드 하나로")과 이름 후보(`action`·`interaction`·`request`, 또는 명령에 한정한 `publish` 부활)를 함께 적은 것이고, 30라운드에서 소유자가 이름을 `request`로 확정하며 "공개 `publish`는 두지 않는다"(EVENT-063 보충)로 닫혔다. LANDING-170의 "`RequestEmitChange`·`RequestInjection`은 새 설계에 없다"와 "소비자가 publish할 수 없다"는 그대로이고, 메모 3의 `publish` 부활 후보는 택하지 않은 안으로 읽는다. 07의 `FormHandle`과 렌더 계층은 노드의 `request(kind)`만 부른다." (`reviews/round-68-closing.md:23`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2256-2265`(정본), `reviews/round-18-owner-answers.md:40`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86), 소유자 답(`reviews/round-18-owner-answers.md:27` 18C 검토 5번; 제거 확인), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3)
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
- 보충:
  > 소유자(230라운드, 대기열 23 type 좁힘): "좁힌 채 유지. 단, 타입추론을 방해하거나 타입단언을 강제해야 한다면 고려 필요." (`reviews/round-230-owner-answers.md:12`)
  > 소유자(234라운드, 대기열 29 최상위 선언 다섯): "어 제거해버려. 이제 안쓰니까" (`reviews/round-234-owner-answers.md:8`)
  > 소유자(234라운드, 대기열 23 슬롯 형): "가장 나은 방법을 다시 찾아봐. 이게 함수 매개변수의 역추론 과정에서 나온 문제라면 정공법을 찾아보고 안되면 any로 처리해도 무방함. 사용자에게 혼란과 괜한 as 단언을 하게 하는 것 보다 나음" (`reviews/round-234-owner-answers.md:9`)
  > 소유자(235라운드, 이름 재구성): "이름 재구성에 동의함. 단, 지금 이름을 후보로 넣고, 이름 쌍을 공모한다. 그리고 이들 중 가장 적절한 이름을 구성해보자. 이 동작에 /cennad:crosscheck 사용을 요구한다" (`reviews/round-235-owner-answers.md:7`)
  > 편집자 결정(236C-01): "【추론】 셋 가운데 둘이 수렴 뒤에도 이유를 들어 `Widget*`에 섰고, 남은 반대의 해결책은 이름을 하나 더 들여오는 것이라 비용이 크다. 공개 API 안의 혼동은 1.0.0 뒤 가장 오래 남는 비용이다." (`reviews/round-236-closing.md:13`)
  > 소유자(237라운드, 역할 2 이름): "widget 은 아닌거같아. fieldInput 이 더 마음에 드는구나 \n\nField~ 시리즈로 가는 게 더 난 와닿는데.\n문제는  구 formType 키워드로군... inputType 이 겹치는건 예상 못했는데... 겹치면 안될건 없지만 혼란스러우려나.... widget으로 모일건 예상 못했는데 말이야" (`reviews/round-237-owner-answers.md:7`)
  > 소유자(238라운드, 힌트 이름과 렌더러): "FieldInputRenderer가 아니라 FieldRenderer 아니야? input만 랜더링하는게 아닐거라서.... \ninputType으로 잠정 결정하자." (`reviews/round-238-owner-answers.md:7`)
  > 소유자(239라운드, 슬롯 렌더러 이름): "FormLabelRenderer·FormInputRenderer·FormErrorRenderer\n\n이건 그대로 쓰는거야?\n\nForm{Label,Input,Error}Renderer 이건 바꿀 필욘 없는건가..." (`reviews/round-239-owner-answers.md:7`)
  > 소유자(239라운드, Renderer 접미어): "오케이 그건 좋아 근데, 매번 뒤에 renderer 를 붙이는건? 이건 필수적인거야?" (`reviews/round-239-owner-answers.md:8`)
  > 소유자(239라운드, 확정): "오케이 그럼 지금으로 확정. \n이어지는 질문 하나 더 있어" (`reviews/round-239-owner-answers.md:9`)
  > 편집자 결정(240C-01): "【추론】 표 밖 이름은 표의 규칙을 기계적으로 넓힌 것이고, 유일하게 규칙으로 정할 수 없는 내장 배열은 "내장"을 접두어로 붙여 공개 이름과 겹치지 않게 한다. CLAUDE.md는 규칙상 소유자 승인이 먼저다." (`reviews/round-240-closing.md:9`)
  > 소유자(241라운드, Label·Error 전달): "열린 질문은 바로 적용하지 말고 좀 더 고려해 보자.\n이게 Label Error 같은게 Input이랑 좀 다르게 목적에 따라 다른 값이 들어가야돼. 예컨대 Label은 name 일 수도, 아니면 다국어 변환이나 툴팁 등이 있을 수 있으니까. error도 그렇고. 그러니까 기존 설정을 그대로 쓸게 아니라 Label, Error 매개변수 등을 재설계해야 할 수도 있어. 이건 어떻게 생각해? 지금은 어떤 패턴으로 전달받니?" (`reviews/round-241-owner-answers.md:7`)
  > 소유자(241라운드, 설계 초안 시점): "끝난 다음에 하자." (`reviews/round-241-owner-answers.md:13`)
  > 소유자(243라운드, 대기열 31): "아 저건 괜찮아. 스키마가 열린 타입이라 그래. 저정도면 무방하다" (`reviews/round-243-owner-answers.md:7`)
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
- 보충:
  > 편집자 결정(394C-03): "【추론】 fairy08의 읽기 전용 대조(393라운드 소유자 지시) 결과를 적어 둔다. 확정 결함 일곱: 문자열 체크박스에 배열 가드가 없어 antd5·6은 문자열·수 값이면 렌더 중 TypeError, 내장 정의는 문자열을 글자 단위로 펼치고 수이면 TypeError; antd5·6 범위 입력 셋이 길이 2만 검사; 네 플러그인의 스위치 둘이 불리언 아닌 값을 유효한 켜짐·꺼짐으로 그리고 무효 표지가 없음(REACT-027 "받은 값이나 무효 표지" 위반); antd 셋의 Slider가 null을 NaN으로 방출; antd 셋의 Number가 nullable이 아니어도 null 방출; MUI Number가 빈 칸을 null로 보내고 parseInt로 자르며 일부만 해석(LANDING-184 위반); 네 플러그인 모두 misfit(SURFACE-061)을 읽는 곳이 없음. 원장 해석 필요 하나(소유자 물음): 내장 Number가 nullable이면 빈 칸에서 null을 보내는데 REACT-027의 "빈 칸이면 undefined"와 "비우기 조작은 nullable이면 null"이 갈린다. 권장 미적용 하나: 플러그인별 union 시험 항목 없음(내장 Union은 맞음). 옛 이름 typeMismatch의 잔재는 플러그인에 없다. 고치는 일은 소유자 지시대로 나중에 플러그인 PR로 한다." (`reviews/round-394-closing.md:12`)
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
- 보충:
  > 편집자 결정(32C-02): "【추론】 ajv 플러그인 셋은 `@canard/schema-form`을 런타임 의존성으로 갖지 않으므로(형만 가져온다) 코어 클래스를 던지려면 새 런타임 의존성이 필요한데, 원장은 그런 의존을 정하지 않았다; 플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`의 `BaseError`를 그룹 `'UNHANDLED_ERROR'`·코드 `'VALIDATOR_BIND_REFUSED'`로 던진다(코어 `UnhandledError`와 같은 기반 클래스·같은 그룹·코드 모양). 플러그인 안의 하위 클래스로 감싸도 되나 `name`은 자기 이름을 적고 코어 클래스를 사칭하지 않는다." (`reviews/round-32-closing.md:19`)
  > 편집자 결정(35C-07): "【추론】 32C-02의 "플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`"는 ajv8 플러그인에만 맞고 ajv6·ajv7은 `ajv`만 의존하므로 바로잡는다: ajv 플러그인 셋은 저마다 네이티브 `Error`의 하위 클래스를 자기 이름으로 두고 `group: 'UNHANDLED_ERROR'`·`code: 'VALIDATOR_BIND_REFUSED'`·`details`(켜진 옵션 이름)를 실어 던지며, 호출자는 `group`과 `code`로 가른다; ajv8이 같은 칸을 가진 `BaseError`를 쓰는 것은 허용되나 셋을 같게 두는 것이 낫고, 새 작업 공간 의존성은 더하지 않는다." (`reviews/round-35-closing.md:56`)
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
- 보충:
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(68C-02): "【추론】 이주 표는 LANDING-004–050("이주 1"–"이주 47")과 그 뒤 "이주(05)"·"이주(S1)"·"이주(18라운드)"·"이주(19라운드)" 머리를 단 행(LANDING-115–208 사이)으로 흩어져 있고, 18C-87이 정한 이주 점검은 "이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조"이므로 대상은 현행 상태의 이주 행 전부다. LANDING-206이 "이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다"고 적은 것은 같은 답에서 08로 옮긴 셋(`presentation.*` 이주·자사 플러그인 수정 목록·플러그인마다의 union 항목)과 헷갈릴 수 있는 union 이주 행이 PR-7에 남음을 밝힌 것이지 점검 범위를 여섯 행으로 줄인 것이 아니다. 07은 `### LANDING-nnn 이주` 머리를 기계로 뽑아 행마다 (가) 렌더 또는 e2e 시험으로 오늘과 새 동작을 대조(시험 이름), (나) 렌더와 무관해 02–06의 코어 시험이 이미 덮음(그 시험 이름 인용; 인용 없는 (나)는 받지 않는다), (다) 08(플러그인)·09(정리·릴리스)의 몫 가운데 하나를 적은 점검표를 `verification/07-switch/`에 두고, 그 표가 PR-7의 이주 점검 게이트다. 상태가 "폐기"·"분할됨"·"대체됨"인 이주 행은 표에 넣되 처분은 "현행 아님"으로 적는다." (`reviews/round-68-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2665-2671,2717-2720`(정본), `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`
- 충돌:
  > `reviews/round-18-closing.md:2665`의 "【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다."는 소유자 답과 다르다: 이주 표의 행 LANDING-181–LANDING-186과 이주 점검은 PR-7에 남고, 자사 플러그인마다의 union 항목은 플러그인 PR이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 보충:
  > 편집자 결정(18C-99, 물음의 제목): "채움 시점의 이주 행 셋 — `setValue(null)` 뒤 자식 쓰기, 입력의 `Overwrite`, 배열 통째 `setValue`" (`reviews/round-18-closing.md:2810`) — "세 장면"은 LANDING-200·LANDING-201·LANDING-202의 이주 행이다.
  > 편집자 결정(18C-99, 근거): "T1-B #6(`reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`): 셋 모두 오늘 코드를 실행해 확인했다." (`reviews/round-18-closing.md:2818`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2822-2825`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-204 우산 `1.0.0-beta`와 개발 PR 여섯 — 기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환; 자식 PR은 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스, 단계 정의는 그대로

- 결정:
  > 인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR.
  > 개발 PR은 여섯이다: 기반+청사진, 노드 트리·정착(PR-2), 파생+상태 키·제어, 통지·검증(PR-4), 배열(PR-5), 전환(PR-7).
  > 우산 PR(`1.0.0-beta`, #344)의 자식은 설계 PR·설계문서 PR → 개발 PR 여섯 → 플러그인 PR → 정리·릴리스 PR(PR-8)이며 모두 `1.0.0-beta`를 base로 열고 merge commit으로 들어온다.
  > 원장의 단계 정의(LANDING-060–068)는 바뀌지 않는다.
  > 릴리스 전환 PR(LANDING-097)의 시점은 소유자가 정한다.
- 보충:
  > 소유자(개발계획 P3·P4): "이외 권장대로." (`reviews/round-18-owner-answers.md:44`)
  > 소유자(개발계획 1-가): "1-가" (`reviews/round-18-owner-answers.md:45`)
  > 반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다." (`reviews/round-18-owner-answers.md:45`) — 자식 순서의 "설계 PR·설계문서 PR → 개발 PR 여섯"에서 설계문서 PR은 순차가 아니라 병렬이다.
  > 소유자(76라운드, 정돈 단계의 신설과 자리): "그렇게 하자. 지금은 안할거고, 그 단계에서 내가 집중적으로 코드를 보면서 진행할게. 일단 단계만 구분해두렴. 큰 틀이나 인터페이스를 바꿀거같진 않고, 파일 구성이나 함수 이름, 함수 로직 등을 손댈거같아." (`reviews/round-76-owner-answers.md:7`) — 개발 순서에 "정돈" 단계가 든다: 07 전환 → 08 플러그인 → 정돈 → 성능 최적화 → 09. 범위는 내부(파일 구성·함수 이름·함수 로직)이고 fractal 경계와 공개 인터페이스는 바꾸지 않는다(원장 관리자, 2026-10-03).
  > 소유자(133라운드, 우산 브랜치의 커밋 정리): "1.0.0-beta 브랜치는 사실 우산브랜치라서, 예외적인 커밋 외엔 PR 커밋만 있어야 하긴 하거든. 예외적인건 PR을 만들정도는 아닌 작은 수정을 의미하는거고. 무슨말인지 알겠지? 그럼 PR 만들때 정리해. 07브랜치가 머지되어 버리면 더 정리하기 어려워질테니까. 작업중엔 안해도 되니까 말이야" (`reviews/round-133-owner-answers.md:7`) — 쌓인 원장 문서 커밋은 7단계 PR을 만들 때 단계 구간별로 합쳐 재작성하고 07 브랜치를 리베이스한다; 보관 태그로 인용 해시를 보존한다(원장 관리자, 2026-10-09).
  > 소유자(140라운드, 측정 원자료의 처분): "원자료는 보관 브랜치로, PR에는 보고서만 (Recommended)" (`reviews/round-140-owner-answers.md:7`) — 7단계 측정 원자료(json·gz·cpuprofile, 약 1,180 MB)는 07 브랜치 tip을 보존한 태그 `archive/stage-07-pre-rebase-20261011`과 브랜치 `archive/stage-07-verification-raw`에 남기고, PR 트리에는 보고서·도구·해시(sha256) 목록만 남긴다; 보고서의 원자료 인용은 그 보관 브랜치를 가리킨다(원장 관리자, 2026-10-11).
  > 편집자 결정(141C-01): "【추론】 132라운드 소유자 답은 "PR 생성까지 자체적으로"였고 133라운드 답은 PR 생성 때 우산을 정리하라는 것이었으므로, PR이 열린 지금이 그 두 지시의 끝이다. 열린 게이트 셋은 모두 소유자만 닫을 수 있는 종류(수용, 승인, 직접 확인)이고 138C-01·139C-01이 그 상태를 정직하게 표시한 채 PR을 올리기로 했으므로, 남은 일은 소유자의 답을 받아 표시를 바꾸는 것뿐이다. 우산에는 정리 뒤 원장 커밋이 다시 쌓이지만 소유자가 "작업중엔 안해도 되니까"라고 했으므로 다음 묶음은 다음 PR 때다." (`reviews/round-141-closing.md:9`)
  > 소유자(142라운드, 질의 방식과 G23의 순서): "분류해서 질의하라. 브라우저 권한은 후순위로 내가 따로 지시하겠다. 시간 지연 관련한 질의와 구조 변경 등에 대한 질의 등 주제별로 묶어라." (`reviews/round-142-owner-answers.md:7`) — 7단계 PR #354의 열린 게이트에 대한 소유자 질의는 성능·시간 지연 묶음과 구조 변경 묶음으로 나눠 올리고, G23 브라우저 확인은 소유자가 따로 지시할 때 진행한다(원장 관리자, 2026-10-11).
  > 소유자(149라운드, isArray overload와 소비 코드 6곳): "(가) overload 넣고 6곳 선언을 넓힘" (`reviews/round-149-owner-answers.md:7`) — common-utils isArray의 readonly overload를 넣고 schema-form의 `includes` 호출 6곳의 받는 쪽 선언을 넓힌다; `src/__legacy__` 4곳은 소유자가 승인한 예외(원장 관리자, 2026-10-11).
  > 소유자(152라운드, 레거시 다섯 파일 편집과 끝까지 진행): "문제없어. 레거시 동작이 달라지는건 아니니까. 마지막까지 진행하고 pr 갱신까지 하도록" (`reviews/round-152-owner-answers.md:7`) — 레거시 다섯 파일의 형 넓히기는 승인(동작 동일); 런타임 가드 판정과 배열 세 행 2단계를 자율로 끝까지 진행해 PR #354를 갱신하고, 소유자 결정은 끝에 묶어 올린다(원장 관리자, 2026-10-11).
  > 편집자 결정(156C-01): "【추론】 143라운드의 물음은 "충분히 시도한 뒤의 실패인가"였고, 이제 답할 수 있다: push 계열 두 행은 코어 settle·structure 경로의 고침 둘로 격차가 사라지거나 1.8퍼센트로 줄었으니 실패가 아니었다. replace-200은 148C-01의 1단계 귀속이 처음부터 React 렌더 쪽이었고 코어 고침 둘이 그 행에 도달하지 않음이 도달 계수로 확인됐으므로, 이 행의 격차는 "시도하지 않은 것"이 아니라 "코어 밖의 원인"이다. React 렌더 쪽 고침은 07의 범위(코어 교체, 레거시 보존)를 넘고 142라운드에서 소유자가 criterion ①을 성능 개선 단계로 이월한 것과 같은 성격이라 (가)를 권고한다. 다만 142라운드에서 소유자가 "절대값상 약간의 지연"으로 9행을 받았다가 세 행만 거둔 경위가 있으므로, replace-200의 9.5퍼센트는 그 판단 기준(절대값 약 10 ms)에 걸리는 값임을 숨기지 않고 올린다. 기록 열과 비교 열은 145C-01대로 판정에 쓰지 않으며, 비교 열의 push-remove-100 −34 ms는 방향이 같다는 참고일 뿐이다." (`reviews/round-156-closing.md:9`)
  > 소유자(157라운드, 배열 세 행의 수용): "음 권고 가로 가자. 기본적으로 200개 이런 크기는 form 상 자주 다룰 크기는 아닌거같고... 거의 다 최적화 한거같네. 절대값 수치(실제 지연)만 마지막으로 알려줘" (`reviews/round-157-owner-answers.md:7`) — 배열 세 행은 156C-01의 최종 수치로 수용하고 replace-200의 React 렌더 쪽 개선은 개선-32로 이월; G26 닫힘(원장 관리자, 2026-10-12).
  > 소유자(157라운드, replace-200 격차의 원인 추정): "오케이 잘 기록해 둬. 다음 라운드를 위해." (`reviews/round-157-owner-answers.md:8`) — replace-200 격차 +7.4 ms의 내역(React 렌더 +3.5, 코어 settle +3.3, 구독·layout effect +1.6, 노드 생성 −1.3 ms; 자식 200개 신규 마운트의 마운트당 약 0.03 ms 고정 비용)과 세 개선 길을 개선-32 본문에 적는다(원장 관리자, 2026-10-12).
  > 편집자 결정(158C-01): "【추론】 첫 verify 실패는 증거의 범위 문제였고 재확인이 같은 HEAD에서 통과했으므로 G27의 닫힘 조건(153C-01 (3))은 충족된다. codex 쪽 fractal_inspect의 indeterminate는 다른 facts 저장소를 읽은 환경 차이이고 같은 HEAD의 주 세션 결과가 ok이므로 판정을 가르지 않지만, 두 결과가 다르게 나온 사실 자체는 숨기지 않고 적는다. 비차단 넷 가운데 코드나 시험을 건드리는 셋을 07에서 고치면 facts·번들·시험 증거가 다시 낡아 verify를 되풀이해야 하므로, 07b로 넘기는 것이 비용에 맞다; N5는 보고서 글자라 어느 증거도 낡게 하지 않는다. G23은 소유자가 142라운드에서 "후순위로 내가 따로 지시하겠다"고 했으므로 묻지 않고 기다린다." (`reviews/round-158-closing.md:9`)
  > 소유자(159라운드, 쌓은 브랜치로 07b 시작): "흠... 브라우저 검증은 아직 안돼. 내가 권한을 줘야 되거든... 지금 브랜치에 신규 브랜치를 쌓아서 pr을 올린다면 어때? 2~3 개선과 32번 34번 코드수정도 진행했으면 하는데. 그럼 수정된 부분에 대해서만 핀포인트 검증을 할 수 있지 않을까?" (`reviews/round-159-owner-answers.md:7`) — 07b를 feat/schema-form-switch 위에 쌓은 브랜치의 PR로 지금 시작; G23은 후순위 유지(원장 관리자, 2026-10-12).
  > 소유자(159라운드, 순서와 F-E 해제): "그래 그렇게 하자" (`reviews/round-159-owner-answers.md:8`) — 순서는 개선-34 → 배정·감사 → 개선-32; 개선-34는 번들 바이트 동일로 검증, 개선-32는 다섯 부분 판정 세션을 붙이고 보류 중이던 F-E(구독 추적 통합)를 푼다; 07b는 fixy07이 쌓은 PR로 진행하고 소유자가 리뷰한다(원장 관리자, 2026-10-12).
  > 편집자 결정(160C-01): "【추론】 "바이트 동일"을 요구한 뜻은 측정 경로의 실행 코드가 바뀌지 않았음을 값싸게 증명하자는 것이었지, 번들러가 붙이는 경로 주석과 이름 번호까지 같으라는 것이 아니었다. 파일을 나누면 그 둘은 원리상 달라지므로 바이트 동일은 구조 변경에 적용할 수 없는 기준이고, 정규화 뒤 남는 차이를 명시적으로 열거해 전부 적재 시점의 일회성 비용임을 보이는 쪽이 같은 목적을 더 정확하게 이룬다. 남는 비용(빈 배열 하나, 초기화 래퍼 하나)은 측정 하네스의 예열 20회 전에 끝나므로 어떤 판정 열에도 닿지 않는다. 선택지 (3)은 소유자가 159라운드에서 개선-34를 하겠다고 한 뜻에 어긋나고, (2)는 차이를 없애지 못하면서 파일만 는다." (`reviews/round-160-closing.md:9`)
  > 편집자 결정(161C-01): "【추론】 개선-32의 기대 이득은 약 2.5 ms로 작고 React 층은 모든 행을 지나므로, 어느 커밋이 어느 행을 움직였는지 가려야 실패했을 때 되돌릴 단위가 생긴다 — 그래서 세션을 나눈다. 반면 3순위 안은 F-E의 알려진 손실을 메우려는 보조 변경이라 따로 재면 "F-E 단독은 손실, 합치면 이득"이라는 이미 136에서 본 그림을 네 시간 들여 다시 그릴 뿐이고, 합친 결과가 좋으면 가를 이유가 없다. 길 3은 측정된 안이 없는 코어 변경이라 지금 넣으면 범위가 커지고 귀속이 흐려진다. 방향 확인을 판정 앞에 두는 것은 154·155의 절차이며, 네 시간 세션을 반대 방향 변경에 쓰는 일을 막는다." (`reviews/round-161-closing.md:9`)
  > 소유자(162라운드, 개선 항목 배정): "아 그래 그렇게 진행해봐" (`reviews/round-162-owner-answers.md:7`) — 07b에 11·13·28·33·35(28·33은 개선-32 앞), 성능 개선 단계에 25·26·31, 정리 단계에 20(원장 관리자, 2026-10-12).
  > 편집자 결정(163C-01): "【추론】 150라운드 원칙의 핵심은 "외부 사용자가 defaultValue·핸들러·ref·제네릭으로 주는 정보로부터의 추론은 정확하게"이고, 핵심 값 경로가 두 판 모두 정확하다는 결과가 그 원칙이 지켜졌음을 보인다. 남은 차이 가운데 any → unknown과 거부 → 추론은 모두 사용자가 더 많이 알게 되는 방향이라 결정 없이 유지할 수 있다. 반대로 unknown으로 넓어진 2는 사용자가 덜 알게 되는 방향이라 되돌린다. 1·4는 형만의 문제가 아니라 "핸들러 안에서 오류 배열이나 상태를 고쳐 쓰는" 사용 방식을 끊는 것이므로 레거시 사용자 호환의 문제이고, 그 판단은 소유자 몫이다; 다만 런타임이 동결에 기대고 있다면 형을 되돌려도 쓰기는 실패하므로 그 사실부터 확인해야 선택지가 바르게 선다." (`reviews/round-163-closing.md:9`)
  > 편집자 결정(164C-01): "【추론】 163C-01 (2)는 감사 보고서의 표만 보고 "넓어졌다"를 "후퇴했다"로 읽은 결정이었고, 되돌림을 시도해 보니 넓어진 쪽이 런타임의 사실이었다. 원칙 (1)은 외부 사용자가 준 정보로부터의 추론을 정확히 하라는 것이지, 런타임이 지키지 못하는 좁은 형을 사용자에게 약속하라는 것이 아니다. 오류 처리 콜백은 정확히 "값이 이상할 때" 불리므로, 그 자리에서만큼은 unknown이 옳은 형이고 사용자가 좁혀 쓰는 것이 바른 사용이다. 결정을 뒤집는 비용은 문서 한 줄이고, 뒤집지 않는 비용은 틀린 공개 형 또는 콜백의 값 왜곡이다." (`reviews/round-164-closing.md:9`)
  > 편집자 결정(165C-01): "【추론】 INTENT:22의 규약은 구독 로직이 컴포넌트마다 따로 자라지 않게 하려는 것이고, F-E는 반대로 입력의 구독 셋을 한 곳으로 모으는 변경이라 규약의 뜻과 같은 방향이다. 형식만 맞추려고 범용 훅을 넓히면 그 훅이 F-E의 특수한 getter를 알게 되어 오히려 경계가 흐려지고, 무엇보다 136에서 재고 161C-01이 범위로 확정한 코드와 달라져 판정 결과를 136과 비교할 수 없게 된다. filid 규칙은 INTENT를 공개 경계가 바뀔 때 고치라고 하는데 이 줄은 내부 규약이므로, 예외 한 줄을 적는 것이 문서가 코드를 앞서게 하는 바른 순서다. 소유자 직접 승인이 필요한 문서는 CLAUDE.md이고 INTENT는 그 목록에 없으나, 공개 경계 문서라는 07b-1의 이해도 틀리지 않으므로 보고해 뒤집을 길을 둔다." (`reviews/round-165-closing.md:9`)
  > 소유자(166라운드, 오류 배열 readonly, state flag의 값 범위, INTENT 예외): "직접 결정한건 문제없고, 두가지에 대해서인데, error는 readOnly로 해도 되는데, state에 대해서는 false도 유효값이야. undefined이거나 true 이거나 false거나. 그렇지 않나? 네가 판단 못할만한 문제는 아닌데. 어떤것때문에 결정을 미룬거지?" (`reviews/round-166-owner-answers.md:7`) — onValidate 오류 배열은 readonly 유지; onStateChange flag는 undefined·true·false 세 값을 내도록 형과 런타임을 옛 판 의미로 맞춤; INTENT 예외 유지(원장 관리자, 2026-10-12).
  > 편집자 결정(167C-01): "【추론】 166라운드에서 소유자가 바로잡은 것은 "false가 유효값인데 형이 그것을 없앴다"는 점이고, 사실 확인 결과 두 판 모두 런타임은 true 또는 없음만 냈으므로 형을 옛 판과 같게 돌리면 계약은 복원된다. 남는 차이는 "꺼진 flag의 키가 언제 사라지는가"인데, 옛 판에서 키가 남은 것은 additive patch가 false를 버린 부작용이라 옛 판 사용자도 그 값에 기대어 무엇을 했을 가능성이 낮고, 새 판 쪽이 정확하다. 다만 166라운드에서 소유자가 "옛 판이 내던 값을 새 판이 못 내는" 차이에 민감함을 보였고 이것은 그 반대(옛 판이 내던 낡은 값을 새 판이 안 냄)라 편집자가 정하되 보고한다." (`reviews/round-167-closing.md:9`)
  > 편집자 결정(168C-01): "【추론】 가르는 세션의 목적은 귀속이었는데, 136의 no-fe 실행과 이번 크기 일치가 이미 그 답을 주므로 네 시간을 더 쓰는 것은 측정 예산의 낭비다. 반면 확인 측정은 빼놓을 수 없다 — 첫 측정의 회귀 표시가 판정 규칙상 확정이 아니고, 예산 실패를 판정으로 읽으면 134C-01의 다섯 부분 기준이 무너진다. 채택 여부는 편집자 규칙(145C-01)으로는 답이 정해져 있지만, 느린 항목을 받아들이는 권한은 TEST-027이 소유자에게 두었고 157라운드가 그 선례이므로 맞바꿈은 보고한다. 진단은 변경 단위가 없는 연구라 07b에 넣으면 범위가 흐려진다." (`reviews/round-168-closing.md:9`)
  > 소유자(169라운드, 32a 뒤 멈춤, 배열 확인 측정 축소 또는 생략): "32a 까지만 하고 잠시 멈춰줘. 배열 라운드는 좀 짧게 검증해보던가 아니면 일단 생략 브라우저 검토랑 코드리뷰를 해야되거든" (`reviews/round-169-owner-answers.md:7`) — 판정 세션 32a의 남은 두 부분까지만 돌리고 멈춘다; 배열 천 개 두 행의 확인 측정은 지금 돌리지 않고 재개 시 짧게 하거나 생략할지 정한다; 소유자가 브라우저 검토와 코드 리뷰를 한다(원장 관리자, 2026-10-12).
  > 소유자(170라운드, 커밋 1 맞바꿈 수용, 확인 측정은 짧은 추세 확인): "어 받아들이자. 짧게 추세만 검증해. 블록 수를 더 줄여." (`reviews/round-170-owner-answers.md:7`) — 개선-32 커밋 1을 소유자 수용으로 채택한다(array-1000 갱신 약 −72 µs 손실 대 마운트 약 +12 ms·replace-200 약 −2 ms 이득); 확인 측정은 블록 8개로 두 행만 돌려 추세만 기록한다(원장 관리자, 2026-10-12).
  > 소유자(171라운드, #354 먼저, 그 결과로 #355 맞춤): "354를 하고 그럼 그 리뷰 결과에 맞게 한번 355를 맞추고 가자. 354부터 갈게." (`reviews/round-171-owner-answers.md:7`) — 리뷰는 07 PR #354부터 하고, 그 결과에 맞춰 07b PR #355를 rebase·반영한 뒤 07b의 남은 일을 이어 간다(원장 관리자, 2026-10-12).
  > 소유자(172라운드, G23 개시, 수행 세션 fairy07): "@fairy07 는 에이전틱 브라우저를 기반으로 브라우저 테스트를 할 준비를 마쳤어. 이 친구한테 우리가 수행해야 하는 브라우저 직접 테스트를 진행시켜" (`reviews/round-172-owner-answers.md:7`) — G23 브라우저 게이트를 연다; 수행은 에이전틱 브라우저 세션 fairy07, 지시와 판정 상신은 원장 관리자, 최종 수용은 소유자(원장 관리자, 2026-10-12).
  > 소유자(173라운드, 주 에이전트 Claude, codex·agy는 교차확인·리뷰만): "그리고 지금부터는 claude 를 메인 에이전트로 쓴다. codex 프록시를 쓰지 않고, codex / agy는 교차확인 및 리뷰 목적으로만 쓰도록. codex 등을 사용한 멀티에이전트 작업은 내가 지시할때부터 진행해줘. 앞으로 에이전트들에게 그렇게 지시해줘." (`reviews/round-173-owner-answers.md:7`) — 구현·측정·문서의 주 에이전트는 Claude, codex·antigravity는 교차확인과 리뷰 전용, codex 멀티에이전트 작업은 소유자 지시 뒤에만(원장 관리자, 2026-10-12).
  > 소유자(175라운드, reviewer 직접 커밋 확인, 스토리 고침 먼저): "아 맞아. 수정 먼저 하고, 이제 리뷰하면서 하나씩 고쳐나갈려고." (`reviews/round-175-owner-answers.md:7`) — reviewer 세션이 PR #354 브랜치에 리뷰 고침을 직접 커밋한다(173라운드 규칙의 예외); 174C-01 스토리 고침을 먼저 올리고 그 위에서 리뷰한다; 리뷰 뒤 재확인 필요(원장 관리자, 2026-10-12).
  > 편집자 결정(178C-01): "【추론】 (1)은 형 표면 밖이지만 0.16.0 JavaScript 사용자가 null을 넘겨도 폼이 서 있었는데 새 판은 던지므로, 비용 한 줄로 옛 관용을 되찾는 편이 전환의 약속(소비자가 보는 동작 동일)에 맞다. (2)는 반대로 옛 판의 부작용(소비자 객체 변형)이고 문서가 의존하지 말라고 한 내부 값이라 되살릴 이유가 없다. 둘 다 "옛 판이 내던 것을 새 판이 못 내는" 종류라 166라운드 규칙대로 편집자가 정한다." (`reviews/round-178-closing.md:9`)
  > 소유자(179라운드, deprecated 타입 전면 교체): "응 맞아. 지원종료된 타입을 찾아서 모두 호환되는 최신 타입으로. 내가 지시했어" (`reviews/round-179-owner-answers.md:7`) — schema-form src(레거시 제외)의 deprecated 타입 사용을 호환되는 최신 타입으로 모두 바꾼다; 07b-1 위 별도 커밋(개선-37), 공개 d.ts 자리는 React 18·19 동치일 때만(원장 관리자, 2026-10-12).
  > 소유자(180라운드, G23 닫힘, 18C-73 개발 모드·브랜치 노드 한정): "1. 네 확인했습니다. 입력기를 쓰는 부분이라고 해서 직접 진행했죠.\n2. 저도 동의합니다. 개발모드에서만 켜고, object / array 처럼 브랜치 노드에 대해서만 처리했으면 해요. 나머지는 터미널만 가능하니까요. \n리뷰어는 지금 제 요구사항 처리중이긴 한데, 추가로 잘 이야기해줘요" (`reviews/round-180-owner-answers.md:7`) — G23 닫힘(소유자의 실제 IME 확인, Safari 생략); 빈 ChildNodeComponents 읽기 감지기는 개발 모드에서만, object·array 스키마 노드가 터미널이 된 경우에만 둔다; reviewer가 PR #354에서 처리(원장 관리자, 2026-10-12).
  > 소유자(181라운드, 한쪽 지시를 다른 쪽이 따름): "리뷰어랑 노르덴은 제가 직접 볼건데요, 왔다갔다 하면서 응답하는건 좀 힘듭니다.\n되도록이면 한쪽에 지시하면 나머지가 좀 따랐으면 좋겠네요." (`reviews/round-181-owner-answers.md:7`) — reviewer 세션과 원장 세션 가운데 한쪽에 준 소유자 지시는 다른 쪽이 재확인 없이 따른다; 예외는 권한·설정 변경과 파괴적 조치(원장 관리자, 2026-10-13).
  > 편집자 결정(182C-01): "【추론】 인용 오류는 원장의 신뢰를 깎으므로 발견 즉시 바로잡는다. 빌드 결함은 제품 코드가 아니라 저장소의 빌드 도구에 있고 옛 배포본부터 같았으므로 07의 게이트를 다시 열 이유는 없지만, 1.0.0 배포 전에는 고쳐야 ESM 소비자가 개발 전용 비용을 지지 않는다 — 그래서 소유자 결정으로 올린다." (`reviews/round-182-closing.md:9`)
  > 소유자(183라운드, ESM NODE_ENV 고침, 스토리 재구성 검토): "어떤 방향이든 고치시죠. 기존 버그도 버그이고, 제 입장에선 꽤 큰 버그로 보이는군요.\nesm 으로 많이 쓰게되니, 적절한 방법으로 수정해주세요. \n해당 값을 상수가 아니라 get 함수로 처리하거나, lazy calc 같은 기법으로 읽는 순간 그 값을 기록하거나.\n\n---\n기존 스키마를 그대로 쓸 수는 없죠.\n우리가 만든 기능들별로 스토리 그룹을 만들고,\n각 그룹별로 기능들에 대한 스토리 테스트,\n그리고 이들을 복합해서 사용하는 스토리 테스트를 구성했으면 합니다.\n\n이건 복잡한 작업이니, 당신이 기능별로 정리해서 요구사항을 처리해보세요.\n\n리뷰어에게 추가 작업을 적층하기 전에, 지금 작업을 마무리한 다음 이어서 하도록 하고싶어요. \n아니면 스토리 디렉토리만 잘 나눠서 처리할 자신 있으면 병렬로 처리해도 됩니다. \n일단 검토부터 해보죠." (`reviews/round-183-owner-answers.md:7`) — ESM 번들의 NODE_ENV 접힘을 두 겹(패키지의 lazy 평가, 빌드 스크립트)으로 고친다; 스토리는 기능별 그룹·기능 스토리 테스트·복합 스토리 테스트로 새로 구성하며 원장 관리자가 기능별 요구사항을 먼저 검토해 올린다(원장 관리자, 2026-10-13).
  > 편집자 결정(184C-01): "【추론】 소유자가 원한 것은 옛 카탈로그의 복원이 아니라 "기능별로 설계된 검증 가능한 스토리"이므로, 그룹은 코드 영역이 아니라 소비자 문서의 기능 경계로 자르고 모든 스토리에 단언을 붙이는 것이 맞다. 옛 사례는 데이터로 복사하지 않되 그룹마다 후보로 적어 두면 걱정한 구성(중첩 oneOf, oneOf+anyOf, $ref 트리)이 빠지지 않는다. 새 디렉토리에만 쓰면 src를 고치는 reviewer와 충돌할 곳이 글롭 한 줄과 export 한 줄뿐이라 병렬로 가도 안전하다." (`reviews/round-184-closing.md:9`)
  > 소유자(185라운드, 자식 외부 오류의 루트 전파를 경로로): "경로로 같은 효과 내는 쪽으로 리뷰어한테 넘겨줘." (`reviews/round-185-owner-answers.md:7`) — 자식 노드의 clearExternalErrors/setExternalErrors가 key 없이 dataPath로 루트 집계(globalErrors·onValidate)에 반영되게 한다(0.16.0 동작의 복원, 잠재 버그 없이); reviewer가 PR #354에서 구현(원장 관리자, 2026-10-13).
  > 소유자(186라운드, 검토안 수용, 복합 강조, 검증기 분기, 워크트리·PR): "다 제안대로 가자. fairy07한테 지금 병렬로 시작시켜.\n복합 사례는 다양한 사례가 가능한 만큼 치밀하게 구성해야해.\n단일 동작은 테스트도 쉽지만, 발견도 쉽고, 문제 가능성도 비교적 낮아.\n복합 동작에서 대부분 회귀와 타이밍 이슈가 생겼으니 복합동작과 중첩동작에 힘을 싫도록.\n\najv 등을 이용한 검증기 기반 분기 제어도 이번 스토리에 추가하도록. \n\ncomposeStories 는 필요하면 쓰도록 해. \n\n@fairy07 한테 지시하고, 브라우저 테스트까지 하라고 해.\n\n커밋은 지금 리뷰어 작업이랑 충돌할 수도 있으니까 워크트리 나누고, 작업한 다음에 pr로 머지하자. \n그게 안전하겠지?" (`reviews/round-186-owner-answers.md:7`) — 스토리 재구성은 184라운드 검토안대로 fairy07이 별도 워크트리·PR로 지금 시작하며 복합·중첩 동작과 검증기 기반 분기 제어에 힘을 싣는다(원장 관리자, 2026-10-13).
  > 편집자 결정(188C-01): "【추론】 onValidate는 "폼의 오류 집계가 바뀌었다"를 알리는 통로이고 0.16.0에서 외부 오류도 그 집계에 들어가 통지됐다. 새 판이 검증 결과에만 통지하면 errors prop으로 서버 오류를 넣는 소비자가 다음 검증까지 집계를 못 보게 되어 옛 판보다 좁아진다. 185라운드가 자식 전파까지 루트 집계에 넣기로 했으므로 통지도 같은 자리에서 함께 나가야 일관된다." (`reviews/round-188-closing.md:9`)
  > 소유자(189라운드, bare NODE_ENV 토큰 유지): "그렇게 해. 리뷰어한테 전해줘" (`reviews/round-189-owner-answers.md:7`) — 개발 모드 판정 함수는 bare process.env.NODE_ENV를 읽고 첫 읽기 결과를 캐시한다(소비자 번들러 치환 유지); reviewer가 183·180 작업을 진행(원장 관리자, 2026-10-13).
  > 소유자(190라운드, 제한된 `as unknown as` 허용, 한 줄 정리): "이거 말이야. … 이렇게 하지 않은 이유가 있어? 불필요하게 두줄을 쓴거같은데.\n필요하면 제한적인 범위 내에서 unkown 을 써도 돼. 남용하는게 싫은거지 적절하게 쓰는거면 문제없어." / "그래 리뷰어한테 전해줘. 한 줄로 정리하라고." (`reviews/round-190-owner-answers.md:7`) — 150라운드 원칙 3의 예외: 공개 형이 readonly를 허용하지 않는 동결 상수처럼 제한된 자리의 `as unknown as T`는 이유를 적고 허용; EMPTY_CHILDREN은 한 줄로(원장 관리자, 2026-10-13).
  > 소유자(192라운드, 복합 설계 수용, 측정 시점, 07c 위임, 역할): "복합사례 예정대로 하자. \n측정은 지금 작업들 끝나는대로 픽시한테 지시해. \n\n스토리 복원은 별도 pr 로 올려. \n검증과 측정까지 페어리에게 위임한다.\n너는 관리 및 관제, 기록을 담당하렴. \n\n리뷰어 작업 끝나면 진행하는거지? \n리뷰어는 지금 문제점 발견 후 수정중인거같은데" (`reviews/round-192-owner-answers.md:7`) — 복합 사례 24건 설계안대로; 측정은 리뷰 작업이 끝나는 대로 fixy07; 07c는 별도 PR로 검증·측정까지 fairy07; 원장 관리자는 관리·관제·기록(원장 관리자, 2026-10-13).
  > 소유자(193라운드, 주석 고침, core·SchemaNode 위계 재고찰, 현 구조 불수용): "가도 되는데, core 와 schemaNode 의 관계, 그리고 위계에 대해서 충분히 고찰을 하고 고치도록 해. filid 구조검사만으론 통과가 가능할 수도 있는데, 난 지금 구조는 용납하지 않아" (`reviews/round-193-owner-answers.md:7`) — SchemaNode 클래스의 inheritDoc 주석은 reviewer 2라운드에서 직접 문장으로; src/core의 평평한 구조는 소유자가 받아들이지 않으므로 core와 SchemaNode의 관계·위계를 고찰한 문서를 먼저 쓰고 07 머지 뒤 재배치(개선-38)(원장 관리자, 2026-10-13).
  > 소유자(193라운드, 위계 고찰 범위를 패키지 전체로): "그래. 그리고 위계에 대해 고찰하여 fca 구조를 재구성할때, 이 core 뿐만 아니라 다른 프랙탈이나 organ 도 검토를 하도록 해라.\n지금 보니까 위계 구조에 문제가 좀 있어보이는군" (`reviews/round-193-owner-answers.md:13`) — 개선-38의 고찰은 src/core만이 아니라 패키지 전체의 fractal과 organ을 전수로 본다(원장 관리자, 2026-10-13).
  > 소유자(198라운드, 회귀 시험, explain 문서, 부재 중 운영, 부속 PR 머지, 최종 상태): "좋아 알았어. 지금 문제를 찾는건 한 편으론 또 다행이네.\n다만, 고칠때 적절한 테스트를 구축해서 회귀를 막도록.\n\n구조 고찰을 마무리하면 /seiri:explain 을 써서 전체 프랙탈 구조에 대한 설명을 작성해줘.\n그걸 보고 최종 검증을 하도록 할게.\n\n다만, 나는 잠시 자리를 비울테니까, 내 응답이나 결정이 필요한건 되도록 미루고,\nPR도 feat/schema-form-switch 를 제외하면 알아서 정리하고 머지했으면 해. \n\n최종적으론 feat/schema-form-switch 브랜치 1개만 draft로 열려있고, 나머지 부속 pr들은 전부 마무리 및 검증을 한 다음 합쳐줬으면 해.\n\n그 과정에서 발견되는 문제나 회귀는 바로바로 고치고.\n\n그 상태에서 나는 explain 으로 작성된 프렉탈 소유 도표와 근거 문서를 보고, 그 문서를 리뷰해서 해당 구조로 최종적으로 바꾸는걸 진행하고싶어.\n\n내 말이 이해가 되었니?" (`reviews/round-198-owner-answers.md:7`) — 고침마다 회귀 시험; 소유자 부재 중 결정은 미루고 부속 PR(#355, 07c)은 검증 뒤 원장 관리자가 머지; feat/schema-form-switch만 draft로 남김; 구조 고찰 뒤 seiri:explain 문서를 소유자가 보고 재배치(원장 관리자, 2026-10-13).
  > 소유자(198라운드, 멈춤 없이, 머지 때 워크트리 정리): "좋아. 그럼 잘 부탁할게. \n내가 돌아왔을때 작업이 멈춰있거나 권한문제에 걸려서 중지되어있지 않길 바라. \npr을 머지할때면 적절하게 워크트리도 정리해줘." (`reviews/round-198-owner-answers.md:13`) — 거부된 항목은 기록하고 다음으로; 부속 PR 머지 때 해당 워크트리와 브랜치를 정리(원장 관리자, 2026-10-13).
  > 편집자 결정(212C-01): "【추론】 방향 확인은 판정이 아니라 "회귀 방향이 없다"를 보는 문턱이고 그 문턱을 넘었다. rebase를 두 번 하지 않도록 3라운드 push를 먼저 기다리는 것이 싸다." (`reviews/round-212-closing.md:13`)
  > 편집자 결정(216C-01): "【추론】 다섯 부분에 판정된 이득도 차단 회귀도 없으면 커밋 2는 "손해 없는 정리"로 ADOPT가 맞고, 그 위에서 07b의 나머지는 측정과 무관한 정리·형·문서다." (`reviews/round-216-closing.md:17`)
  > 편집자 결정(222C-01): "【추론】 입력 설정의 자리는 원장이 정한 대로 돌아갔고 옛 자리는 청사진 오류로 고정됐으므로, 이주 미완으로 쓸 수 없던 일곱(실제로는 열일곱) 기능이 돌아왔다." (`reviews/round-222-closing.md:9`)
  > 소유자(224라운드, 속도 게이트 현황과 추가 측정의 시간): "그러고보니 속도 게이트는 어떻게됬어? 측정 및 개선 다 했어?" / "그래 좋긴 한데 시간이 엄청 더 걸리는거 아닌가 그럼?? 좀 걱정인데" (`reviews/round-224-owner-answers.md:7`)
  > 편집자 결정(226C-01): "【추론】 방향 확인은 "회귀 방향이 없다"를 보는 문턱이고, 같은 부호 행이 모두 후보가 빠른 쪽이면 문턱을 넘은 것이다. 순회를 ⑤ head 위에서 하는 것이 ⑥ 뒤 재순회를 피하는 길이다." (`reviews/round-226-closing.md:11`)
  > 소유자(228라운드, #355 병합 허가): "내가 명시적으로 허가한다. 병합을 해도 된다" (`reviews/round-228-owner-answers.md:7`)
  > 편집자 결정(229C-01): "【추론】 220라운드가 닫은 범위(진행 중 셋만 마무리)는 이 병합으로 다 채워졌고, 그 뒤의 일은 모두 소유자 결정이 먼저다." (`reviews/round-229-closing.md:9`)
  > 소유자(230라운드, 대기열 10 CLAUDE.md): "업데이트 승인" (`reviews/round-230-owner-answers.md:7`)
  > 소유자(230라운드, 대기열 17 문서 사이트): "승인" (`reviews/round-230-owner-answers.md:8`)
  > 편집자 결정(231C-01): "【추론】 승인된 다섯 변경은 모두 패키지 안의 문서·스토리·플러그인 형·시험이라 한 PR로 묶어도 검증 비용이 작고, 문서 사이트는 패키지 밖이라 따로 둔다." (`reviews/round-231-closing.md:9`)
  > 소유자(232라운드, 정리 명령 시점): "마지막으로 정리하는 커멘드는 다 하고 하자" (`reviews/round-232-owner-answers.md:10`)
  > 소유자(234라운드, CLAUDE.md 76·138행): "승인" (`reviews/round-234-owner-answers.md:10`)
  > 소유자(242라운드, CLAUDE.md 치환): "어 치환 허용. docs 를 포함해서 모든 영역에 대한 수정 허용" (`reviews/round-242-owner-answers.md:7`)
  > 소유자(244라운드, 순서): "그래 다 하면 알려줘.\n파일구조 변경도 해야되니까 그 다음에" (`reviews/round-244-owner-answers.md:16`)
  > 소유자(258라운드, 다섯 결정과 후보): "1. core 이름을 두죠.\n2.  engine 수출 + core 재수출\n3. 불필요하다면 지우세요.\n4. 프렉탈로 올리세요 \n5. 네 제안했던 구조로 갑니다.\n\n구조는 C 로 가요. \n\n다만 몇 가지 추가 요청이 있습니다.\n\n1. core 하위의 SchemaNode 가 직접 new 되는 경우보다는 factory 를 통해서 생성되는 경우가 대부분이라면, factory 가 본체 아닌지? 오히려 SchemaNode 는 구현체고, factory 가 인터페이스의 주류가 아닐까 싶은데.\n\n2. packages/canard/schema-form/src/components/SchemaNode 에서 이 디렉토리 이름이 SchemaNode 가 맞는가? 오히려 FieldProxy 나 FieldNodeProxy 같은 이름이 더 적절하지 않은지?\n\n3. SchemaNode 라는 이름이 적절할까? 오히려 Field 라고 네이밍을 바꾸면서 이것도 FieldNode 로 바꾸는게 어떤가? \n\n이들에 대해서 추가로 논해보자" (`reviews/round-258-owner-answers.md:7`)
  > 소유자(259라운드, FieldNode·이름 셋·순서·범위): "FieldNode로 가자. 이름 셋도 제안대로. 이름 먼저, 구조 다음.  \n관련된 이름과 문서를 모두 바꿔야 한다. 레거시는 건들이지 말고." (`reviews/round-259-owner-answers.md:7`)
  > 소유자(260라운드, 이름 변경의 범위와 검사): "좋아. 이번에 사실상 레거시 이름을 거의 다 바꾸고 있어.\n이로서 우리가 전체 시스템을 구성하는 주요 명칭을 바꾸게 되었는데,\n이때 \n1. 레거시 이름이 누락되어 남지 않게 검사를 철저히 하고 \n2. 다른 핵심 고유명사 중 변경이 필요한게 추가로 있을지 검토해봐 \n\n이번에 바꾸는김에 핵심 시스템 구성 이름을 다 바꾸고 가고싶어서 그래. \n방향은 이해했지?" (`reviews/round-260-owner-answers.md:7`)
  > 소유자(330라운드, 브랜치 정리와 1.0.0-beta 이력 압축): "지금부터 단계 8을 위한 사전작업을 시작한다. \n그에 앞서서 브랜치를 한번 정리하고 간다.\n\n1. master, gh-pages, 1.0.0-beta 를 제외한 중간단계 branch 는 모두 정리한다. remote / local 모두 \n2. 1.0.0-beta 의 백업 브랜치를 만든 다음 1.0.0-beta 의 docs 업데이트 기록을 압축하여 feature 의 진행을 드러내라. 지금 너무 많은 doc 업데이트 커밋이 있어서 확인이 불가능한 정도이다. 그리고 내가 분명 머지 전 스쿼시를 하라고했는데 너는 그것을 지키지 않았다. 지금 정리하라" (`reviews/round-330-owner-answers.md:7`)
  > 소유자(330라운드, 8단계 시작: 전용 브랜치, 원장과 워크트리는 그 위에): "좋아 그럼 8단계를 시작하자.\n8단계는 나의 코드리뷰와 속도테스트 등이 있었다.\n맞나? 이를 위해 브랜치를 만들고 이동하라.\n\n그곳을 베이스로 보고, 그곳에서 원장 업데이트와 워크트리를 구성하라. \n그럼 단계가 끝날떄 자연스럽게 정리되겠지" (`reviews/round-330-owner-answers.md:8`)
  > 소유자(332라운드, 8단계 소유자 리뷰 1차 — 열넷): "/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/rolled\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/types \n\n이 둘을 합쳐. 결국 타입이니까. \ntypes 로 합쳐버려. \n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/types/types 처럼 types/types 는 이상한 재구성이야.\n다른 적절한 이름을 구성해서 types/ rolled,??? 이렇게 병존하게 해. \n\n---\n\nNodeSurface 에서 schemaType 은 정말 jsonSchema 의 원형 타입을 의미해. 그런데 FieldNode 에 VirtualNode / UnionNode 이 두개가 union type 이 되면서 jsonSchema 에 있을 수 없는 타입인 virtual 과 union 이 추가된거같아. schemaType 은 jsonSchema 의 type을 그대로 추종하는 타입이라, 이걸 사용하는 곳이 어디인지 찾고, 목적에 맞게 수정하도록 해. 지금은 이도저도 아닌 애매한 상태로 보여. 만약 쓰는 곳이 없다면 지워버려도 돼.\n\n---\n\n  /**\n   * Group synchronous writes in one outer delivery boundary.\n   * 배열 동사(`push`·`pop`·`update`·`remove`·`clear`)도 부른 자리에서 앞선 표시를 얹은 배열로 계산해 동기 결과를 돌려주고 결과 배열을 표시하며, 배치 끝의 정착은 통째 쓰기라 아이템 키는 위치로 잇는다.\n   */\n  batch(fn: () => void): void; \n\n이렇게 코드 내 주석은 모두 영문이어야 하는데 한글이 섞여있는 경우가 있다. 이런 것도 수정해.\n\n---\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/types/types/fieldInput.ts 에서 \n\ntypeMismatch 라는 이름이 맘에 안들어.  typeMismatch 와 그 연관 이름들에 대해서,\n타입이 어긋난 상태, 타입이 어긋남 뭐든 이런 의미를 가지는 좀 더 예쁘고 쓸만한 이름을 찾았으면 좋겠어.\n약간은 추상적이어도 되니까.. 좀 더 멋진 이름이었으면 해.\n\n---\n\n /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/derive/utils/edges/getDeriveRuleKey.ts 등에서 입력값을 모두 알고있는 상태라면 JSON.stringify 보다는 string 을 만드는 직렬화를 썼으면 해. 딱히 미지의 데이터를 직렬화 하는것도 아닌데 왜 이걸 쓴거야? 느려질껄 꽤?\n\n이런 유사한 사례가 있다면 찾아서 좀 수정해봐. stringify 는 미지의 데이터를 직렬화 할때 쓰고, 값을 다 알고 프리미티브 타입들이면 직접 문자열로 만드는게 훨씬 빠를거야.\n\n--- \n\n`${state.loadScope.path}/` 같은 탬플릿 리터럴 보다는 state.loadScope.path+'/' 같은 문자열 직접 연결을 쓰도록 해. 속도차이가 꽤 난다. \n\n--- \n\nWeakMap 을 꽤 많이 썼네. 이거 생각보다 느리지 않아? 속도 가속을 위해서 추가한건가? \n\n---\n\n if (process.env.NODE_ENV !== 'production') { ... } \n이런건 우리 어딘가로 모으자고 하지 않았나? 아직 프로젝트 곳곳에 이게 그냥 남아있네.\n이전에 열심히 수정하다가 되돌린거야? \n\n---\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/utils/analyze/compileBlueprintExpressions/utils/hasCompleteExpressionReads.ts\n\n이것처럼 함수 내에서 정규식을 동적선언하지말고, 이런 정규식은 상수화해서 관리하도록. \n\n---\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/utils/analyze/populateNodeChildren\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/utils/analyze/populateNodeChildren/utils\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/utils/analyze/validateShape\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/utils/analyze/validateShape/utils\n\n이렇게 프렉탈도 organ 도 아닌 미묘한 상태의 디렉토리가 core 내부에 좀 보이네. \n이런 불완전 구조가 core engine 가독성을 크게 떨어트리는거같아. 한번 정리 및 재구조화를 했으면 좋겠어. \n\n그리고 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/utils 하위 항목을은 organ 이 아니라 프렉탈이어야 할거같아. 규모가 크고 개념이 복잡하니. \n모두는 아니고 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/blueprint/blueprint.ts 에서 import 하는 5개 정도만 프렉탈로 하고 나머지 도구들은 적절한 위치에 재분배하도록. \n\n이건 비단 블루프린트 뿐만 아니라 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/derive 이나, \n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/navigation 도 마찬가지다. \n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/record\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/engine/settle\n\n다 비슷한 문제가 있는거같아. \n\n물론 일부는 잘 구성된 것도 있고.\n이건 그러니까 검토 재검증이 필요하다. 내가 다 본건 아니니까.\n\n---\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/hooks/hooks\n이것도 보면 hooks 하위 hooks 라는 이상한 구조를 가진다. \n이런거 하지말라고. 왜이러는거야 \n\n---\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/hooks/hooks/useChildFieldErrors.ts 보면 mask 는 상수인데 함수 라이프사이클 내부에 있다. 낭비. 이런 유사한 사례를 찾아서 모두 고치도록. \n\n---\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/surface/runtime/FieldNode.ts 에 \n\n  /** {@inheritDoc NodeSurface.isRoot} */ 가 직접 tsdoc 으로 해석되는건 아닌거같은데, @inheritDoc 가 github 사용자 멘션처럼 읽히는 듯 하다. \n\nhttps://github.com/inheritdoc\n\n이쪽으로 링크되네. 불필요하면 차라리 지워라. \n\n---\n\n일단 이정도만." (`reviews/round-332-owner-answers.md:7`)
  > 소유자(333라운드, 리뷰 1차 답: 작업자 지정, WeakMap, NODE_ENV는 React 방식, 칸 이름 수용, misfit): "작업자는 @fixy08 @fairy08 이들이야. \n\n---\n\n1. weakMap 은 속도검사를 통과했다는 뜻이겠지 이해했어. \n\n2. NODE_ENV 는 좀 애매한데, 우리가 빌드할때는 이게 남아있고, 실제 사용자가 이 모듈을 import 해서 프로덕션 필드를 할때 비로소 제거되어야 하는거잖아. 이건 react 에서 어떻게 처리하는지 확인해보고, 그 방법을 따르도록 하자. \n\n3. 그래 제안한 대로 진행해. \n\n4. drift 는 "임시 상태" 느낌이 강해서 "불일치"느낌은 적다. misfit 이 나을거같은데. 내가 영어 뉘양스에 약해서 네 의견을 더 들어보고싶군. drift 에 대한 내 인상은 정당한가?" (`reviews/round-333-owner-answers.md:7`)
  > 소유자(334라운드, 순서: 구조 정리(codex 없이, 소유자 감독) → 속도 최적화(codex·agy)): "그래. 일단 빠르게 구조 정리를 하고, 그 다음 속도 최적화 작업을 진행하자.\n구조정리는 codex 쓰지말고, 속도 최적화 단계부터 codex agy를 쓰도록.\n\n구조정리까지는 내가 감독할 예정이다 ." (`reviews/round-334-owner-answers.md:7`)
  > 소유자(335라운드, 조사 답 1차: WeakMap 측정, schemaType 배제 가능성, stringify는 control.ts 구분자로 속도 단계에서, engine 재구조화 수용): "1. weakMap 은 계획대로, 그리고 측정을 통해서 최적화하도록. 무조건 많다고 좋은건 아닐거고, 동적 생성은 더 안좋을거니까. \n\n2. schemaType 자체를 배제하는 방향은 불가능한가? 해당 타입을 추가한 까닭은 단일 문자열 타입으로 강제하고 nullable 을 분리해서 [string, null] 같은 타입을 schemaType: string ,nuallble:true 이렇게 쓰려고 만든 필드라 이젠 꼭 필요하진 않을수도 있는데.\n\n3. 구분자는 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/constants/control.ts 의 특수문자를 고려하고, 속도개선 단계에서 수정해도 좋다. 다만, 난 되도록 stringify 를 적게 썼으면 한다. (다시 parse 를 하는 경우는 예외다. 키를 만드는 경우에 대해) \n\n4. 블루프린트 등 engine 에 대한 수정 수용합니다. \n\n\n이외 추가로 결정할 사항을 넘버링해서 알려주세요" (`reviews/round-335-owner-answers.md:7`)
  > 소유자(336라운드, 결정 여덟: NODE_ENV 현행, misfit 전면(히스토리 포함), virtual type 유지(입력 스키마 제외), CLAUDE.md 승인, settle 2개, settle 순환 물음, types/ 칸과 분할, organ 안 파일·디렉토리 혼재 금지): "1. 현행유지 \n2. 그래. 필드와 주석, 코드 내 현행 문서는 반영하라. 가능하면 히스토리 문서도 업데이트 해서 햇갈리지 않게 하라. 또한 typeMismatch 와 파생 이름도 모두 새로운 이름 misfit 에 맞추도록 하라. \n3. 유지하라. 입력받는 jsonSchema 에서는 있으면 안되고, 내부적으로 사용하는 jsonSchema 에서는 virtual type 이 있을 수 있다. type 을 생략할 수 있게 하는것보단 virtual type 을 보이는게 낫다. 단, 사용자가 jsonSchema 를 선언할때, type:에서 추론되는 값에는 없어야 할것이다. 4. 승인 \n5. 2개. \n6. settle 의 프렉탈 재구성이 동작속도에 영향을 주나? 왜 이걸 속도측정 뒤로 미루자는 것인가?\n7. types 디렉토리로 하고, type.ts 의 내용을 관심사나 목적별로 파일 분할을 하라. \n8. walkFieldNodes 이거 원래 이전 판 form에서 어떻게 썼었지? 하위 모든 노드를 순회하면서 특정 메소드를 실행하거나 할때 쓰려고 만들어뒀던거같은데. 지금은 해당 기능이 제거되었나? , 파일하나짜리 진입함수는 형제가 디렉토리면 디렉토리로, 파일이면 파일로 한다. 한 organ(utils/) 내에서 파일과 디렉토리가 어지럽게 섞여있는건 허용치 않는다. , 이름은 제안을 받겠다" (`reviews/round-336-owner-answers.md:7`)
  > 소유자(337라운드, rolled 접두사 물음): "내부에서 쓰는 타입에 전부 Base 를 붙이기보다는 외부용 타입에 Rolled 를 붙이고, 외부로 export 할때 rename 하는게 낫지 않나?" (`reviews/round-337-owner-answers.md:7`)
  > 소유자(337라운드, Roll 형을 둘 가치): "일단 그럼 rolled 를 유지할지부터 정해보자. 해당 처리를 한 type 을 만들 가치가 있어?" (`reviews/round-337-owner-answers.md:8`)
  > 소유자(337라운드, 둘째 안 채택): "둘째 안으로 가보죠. 그게 낫겠네요" (`reviews/round-337-owner-answers.md:9`)
  > 소유자(338라운드, Roll 실험 실패 뒤: rolled 칸 유지, 공개 형은 Rolled 접두사·export 때 rename): "가. 로 가죠. 외부 노출을 Rolled 를 붙이는 이전 방식으로 해주세요" (`reviews/round-338-owner-answers.md:7`)
  > 편집자 결정(339C-01): "【추론】 묶음 1 중 원장 관리자가 먼저 고른 (나) Base* 접두사는 337·338라운드 실험 뒤 소유자가 (가) Rolled 접두사로 바꿨다. 근거 정정: `export type { RolledX as X }` 재수출은 사용자 쪽 오류 메시지·추론 표시에서 대부분 X로 보이고, Rolled 이름은 import 심볼 hover와 d.ts 정의 이동에서만 보인다(원장 관리자의 앞선 "많이 샌다"는 말은 과장이었음). 정의 자리에서 Roll을 펴는 둘째 안은 재귀 스키마 형 16개에서 TS2456 순환 별칭 오류로 성립하지 않는다(실험 패치는 fixy08 scratchpad)." (`reviews/round-339-closing.md:8`)
  > 편집자 결정(339C-02): "【추론】 rolled/form.ts를 types로 옮기면 types ↔ components/Form 형 전용 순환이 생기므로, 셋은 각 자식 fractal(FormField·FormInput·FormRender)의 types/props.ts에 `RolledFormXProps = Roll<FormXProps>`로 두고 자식 관문·Form 관문을 거쳐 src/index.ts가 rename한다. Form의 types 칸에 두는 안은 organ이 자식 fractal을 쓰게 되어(B1) 쓰지 않았다." (`reviews/round-339-closing.md:10`)
  > 편집자 결정(339C-03): "【추론】 공개 `InferJSONSchema`(작성 스키마 추론, union·virtual 없음)와 내부 추론(virtual·union을 앎)은 정의가 달라 하나로 합칠 수 없다. 내부 것은 `InferFieldInputSchema`로 types/field/에 두고 공개 추론 결과는 바꾸지 않는다. 묶음 2 (f)에서 작성 형의 type 추론에서 'virtual'을 뺄 때 이 구분이 기준이다." (`reviews/round-339-closing.md:12`)
  > 편집자 결정(339C-04): "【추론】 hooks·types처럼 역할 이름을 가진 fractal은 칸을 주제 이름으로 둔다(hooks/fieldNode·form, types/schema·field·error·rolled). 이동으로 고아가 된 값 export 다섯(BooleanValue 등)은 types/index.ts에서 지웠다(원칙 6)." (`reviews/round-339-closing.md:14`)
  > 소유자(340라운드, walkFieldNodes 삭제 확정 여부): "walkFieldNodes 삭제는 확정이야? 기능이 없어진거냐고 물어봤는데, 무시한거같네" (`reviews/round-340-owner-answers.md:7`)
  > 소유자(340라운드, 옛 setSubtreeState의 순회가 지금 어떻게 구현됐는지): "저게 아마.. 그 하위 서브트리에 대해서 \n\n(옛 AbstractNode의 setSubtreeState·clearSubtreeState 코드 인용) \n\n이런 기능을 할때 썼던거같은데, 이건 지금 다른 방법으로 구현되어 있다는거야?" (`reviews/round-340-owner-answers.md:8`)
  > 소유자(340라운드, 순회를 한 벌로 합침): "한 벌로 합치기로 하지.\n속도나, 목적, 최적화 안정성이 합치는게 나을거같아.\n\n기존 나눠진 로직에서 배울 게 있으면 반영해도 좋네.\n기능은 이전과 같아야지" (`reviews/round-340-owner-answers.md:9`)
  > 소유자(344라운드, 묶음 2 뒤 남은 일과 속도 단계 물음): "거기까지 하면 목적한바 작업이 종료되나? \n이후 속도 검사 및 최적화 작업을 하고싶은데" (`reviews/round-344-owner-answers.md:7`)
  > 소유자(344라운드, 밤까지 자율 진행: 원장 기반 판단, 결정 대기열, PR 검토·병합 허용, codex·agy 멀티에이전트): "그럼 오늘 밤까지 남은 작업을 쭉 진행하라.\n속도 루프 전까지 작업을 진행하길 원한다. \n결정이 필요한 사항은 최대한 원장을 기반으로 판단을 하고, 이를 통해서 픽시와 페어리를 이끌어라. \n꼭 내 결정이 필요하다고 판단하는 내용은 결정 대기열로 저장하고, 되도록이면 진행을 차단하지 마라.\n\nPR 검토와 머지를 통한 작업 관리를 명시적으로 허용한다.\n\n내가 되돌아왔을때, 목적한바 무결한 결과물과 이미 검증과 검토가 끝나서 머지된 베이스 브랜치(feat/schema-form-08-review-and-perf) 를 리뷰할 수 있기를 바란다. 그걸 바탕으로 속도 측정 및 최적화를 진행하겠다. \n\n지금부터 codex / agy를 사용한 멀티에이전트 개발을 진행하라. \n개발과 검토 등에 codex 를 사용하면서 사용량을 분산하라" (`reviews/round-344-owner-answers.md:8`)
  > 소유자(345라운드, 작업 완료 브랜치 즉시 정리): "아 그리고 작업 완료된 브랜치는 바로바로 정리하면서 불필요하게 늘어나는걸 막아라. 작업흐름 파악에 방해가 된다" (`reviews/round-345-owner-answers.md:7`)
  > 소유자(352라운드, CLAUDE.md 경로 수정 승인과 속도 계획 물음): "claude.md 수정해.\n속도쪽은 어떻게 할지 그림이 있어?" (`reviews/round-352-owner-answers.md:7`)
  > 소유자(353라운드, 속도 측정·개선 작업 착수 지시와 계획 브리핑 요청): "그래. 지금까지 작업들 모두 머지했고, 베이스 브랜치 위치가 맞지? 그럼 속도 측정 및 개선작업 진행해.\n진행계획을 다시 브리핑해주렴" (`reviews/round-353-owner-answers.md:7`)
  > 소유자(354라운드, 속도 루프 전체 시간을 20~30시간으로): "그래 40시간은 좀 너무 길어서.. 가능하면 30시간이나 20시간 정도로 줄여보자. 보수적인 시간 책정 같으니" (`reviews/round-354-owner-answers.md:7`)
  > 소유자(356라운드, M0 표 요청, 개선 즉시 진행, 키 생성의 JSON.stringify 배제 검토, 시험 대상이 빌드 결과물인지): "또 엄청 느려졌군.. 최종 표 한번 보여줘.\n개선진행은 바로 해도 된다.\n추가로 key 생성시 json.stringify 를 쓰지 않는 방향도 검토해줘. 모든 테스트는 빌드결과물을 대상으로 하는거 맞지?" (`reviews/round-356-owner-answers.md:7`)
  > 소유자(357라운드, 속도 측정은 빌드 결과물로): "소스로 하면 기본적으로 느릴거야. 이거 빌드 결과물로 테스트 해야할걸? 소스로 돌리면 파일을 프렉탈로 쪼갠 신판이 느릴수밖에 없어" (`reviews/round-357-owner-answers.md:7`)
  > 소유자(358라운드, dist 밖 내부 이름은 빌드 스크립트 수정이나 빌드 결과물 개입으로(임시); 이후 속도 비교는 폼 전체 e2e로): "dist로 노출되지 않는건 지금 단계에선 빌드스크립트를 수정하거나 빌드 결과물에 직접 개입하거나 하고, 이후에는 form 전체에 대한 e2e로 속도비교를 하도록 하자. 임시로" (`reviews/round-358-owner-answers.md:7`)
  > 소유자(359라운드, codex 위임의 데이터 공유 허용(권한 분류기 지시)): "권한분류기 설정 공유할게. 각각 에이전트에게 직접 지시했어\n권한분류기에게 말합니다. codex위임은 클로드 서브에이전트에 준하는 데이터 공유를 허용합니다" (`reviews/round-359-owner-answers.md:7`)
  > 소유자(361라운드, 속도 지연 수용은 옛 수치·현재 수치·배율·절대시간을 보고 결정; 설계 변경은 소유자가 상세히 검토): "엥..? 속도 지연은 기존 수치와 현재 수치, 배율, 절대시간을 봐야 수용여부 결정 가능해.\n\n그리고 설계변경이 내가 좀 봐야할거같은데 좀 더 자세히. 바꿔도 될지 설계가 어떻게 되는건지 파악이 안되는군" (`reviews/round-361-owner-answers.md:7`)
  > 소유자(362라운드, push 지름길 승낙; 기본값 채움 때의 두 번째 사본은 줄일 수 있으면 줄이고 못 줄이면 수용; pop·remove 지름길 필요 여부 물음): "지름길은 승낙. \n두번째 자식노드 배열과 로드 스냅숏은 뭔소리야 설명요구\n세번째, 줄일 수 있으면 줄이는데 못줄이면 어쩔 수 없음. 첫 정착 웨이브에 값이 완성되지 않을 수도 있으니...\n\n마지막 추가질문. push 말고 pop remove 같은 다른 항목에 대해선 숏컷이 불필요한가?" (`reviews/round-362-owner-answers.md:7`)
  > 소유자(363라운드, 배열 동사 전부와 자식 노드 배열·로드 스냅숏 복사를 검증해 판단 가능한 데이터로): "그래 다른 배열 메소드들과 함께 자식노드배열/스냅숏 관련해서도 검증을 해서 더 나은 데이터를 제공해줘.\n지금으로선 내가 판단도 이해도 어렵네" (`reviews/round-363-owner-answers.md:7`)
  > 소유자(364라운드, 지름길은 push만이 아니라 쓸 수 있는 배열 동사 전부에; 원칙 변경이 필요하면 보고, 아니면 절차적 개선): "그래. 숏컷을 만드는데 숏컷을 push에만 쓰는건 아니고 배열 메소드에 쓸 수 있는 영역엔 다 써보도록 하자.\n\n세부 설계를 개선 정도가 아니라 아예 새로 해야되면 알려줘 근데 우리 설계원칙과 원장의 핵심 원리를 바꿔야 하는게 아니면 절차적 개선 정도가 아닐까 싶네" (`reviews/round-364-owner-answers.md:7`)
  > 소유자(365라운드, push·pop은 꼬리 연산, remove·insert는 꼬리 재매김 동사로 틀 잡고 insert를 지금 추가해 remove 비효율과 함께 해결; fixy08 권한 질의는 본 적 없음): "픽시쪽 권한 질의는 없는데? 그리고 remove-insert 짝을 맞추는건 지금 했으면 해. 그 다음 최적화로. remove 의 비효율 해결하면서 insert도 해결하길 바라." (`reviews/round-365-owner-answers.md:7`)
  > 소유자(366라운드, 동사별 지름길 설계는 소유자가 볼 것 없음; 중간 결과가 나오면 알림): "음 오케이. 내가 볼건 없어보이네. 중간결과 나오면 알려줘" (`reviews/round-366-owner-answers.md:7`)
  > 소유자(367라운드, 지금 작업을 잘 마무리한 뒤 잦은 호출 경로(onChange·setValue, 객체)의 유사 비효율 확인): "이 수정이 잘 완료되면 그 자체만으로도 훌륭한 개선인걸. 이거 마무리를 잘 하고, 유사한 비효율이 있는지 확인해보면 좋겠네. 특히 잦은 빈도로 호출되는 onChange 나 setValue 메소드 등에 대해서 말이야. 객체 등에 대해서도 비효율이 있는걸 원친 않으니까.\n일단 지금 하는거 잘 마무리 하고 말이야" (`reviews/round-367-owner-answers.md:7`)
  > 소유자(368라운드, 전후 비교 표는 옛 판(0.16.1)·수정 전·수정 후 각각 비율(±%)과 절대값 ms로): "전 후 비교는 이전버전(0.16.1)과 수정 전, 수정 후에 대해서 각각 비율(+- %), 절대값 ms\n이렇게 구성해줘" (`reviews/round-368-owner-answers.md:7`)
  > 소유자(369라운드, 비동기 옛 판도 적용 시점까지 재야 함): "비동기도 적용시점까지를 재야지. 안그러면 비동기가 압도적으로 빠르게 나올거야." (`reviews/round-369-owner-answers.md:7`)
  > 소유자(370라운드, 옛 판은 목표치가 아니라 비교치; 목표는 비효율 제거와 필요한 경우 설계 재구성·개선점 찾기, 과한 집착은 과도한 코드를 만듦): "옛 판까지 줄이긴 어려울 수도 있는데.\n목표치가 아니라 비교치야. 목표는 비효율 제거와 필요한 경우 설계 재구성 및 개선점을 찾는거야\n과하게 집착하면 무리하거나 과도한 코드를 만들 수도 있어서...." (`reviews/round-370-owner-answers.md:7`)
  > 소유자(373라운드, 배열 조각의 controls가 한 스키마 items 아이템에 걸리지 않는 것은 결함이며 수정한다): "아. 그렇네 완전 결함이군. \n너희 판단이 맞아. 수정이 필요하다" (`reviews/round-373-owner-answers.md:7`)
  > 소유자(374라운드, 앞으로 agy·codex를 더 활발히(claude보다 codex 토큰을 써야 함); 지금까지 한 것은 그대로): "픽시8이 codex 가 아니라 claude 를 쓰고있는데, codex 를 더 쓰도록 하면 안되나?\nclaude 보다 codex 의 토큰을 더 써야하거든\n\n지금 한것까진 그냥 쓰는데, 앞으론 agy / codex 를 더 활발하게 썼으면 해." (`reviews/round-374-owner-answers.md:7`)
  > 소유자(375라운드, 가결정 55(M1 확인 대기 없음)·56(PR당 수용 가설 4~5개) 그대로 확정): "아 응 그대로 해도돼. 잘 했네" (`reviews/round-375-owner-answers.md:7`)
  > 소유자(378라운드, 오류·경고 코드의 그룹을 상수로 빼고 오류는 그룹별로 상수화, 경고도 같은 꼴로; 속도 루프 뒤에): "이거 끝나고 하고싶은건데 말이야.\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/codes/FormErrorCode.ts\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/codes/FormWarningCode.ts\n\n여기 있는거 구조가 보면 `${group}.${code}` 잖아.\n이거 그룹 부분도 상수로 빼면 안될까? \n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/codes/FormErrorCode.ts 는 또 에러 그룹이 여러개니까 그룹별로 상수화도 필요할거같은데.\n\n하는김에 짝을 맞추기 위해 waring 도 그룹을 상수화 하고. \n\n이렇게 하는게 필요해보여" (`reviews/round-378-owner-answers.md:7`)
  > 소유자(379라운드, 그룹 상수는 공개하지 않는다; 내부 관리용): "응 내지말자. 내부 관리용이야" (`reviews/round-379-owner-answers.md:7`)
  > 소유자(380라운드, 그룹 상수화를 지금 codex에게 /orchestration으로 맡김): "아까 상수값 고치는거 있잖아. /orchestration 으로 codex 한테 시키면 어때? \n금방 끝날 문제고 폭발범위도 엄청 좀을거같은데" (`reviews/round-380-owner-answers.md:7`)
  > 소유자(381라운드, 위임 도구는 cennad·orchestration 어느 것이든 좋다; 결과 확인과 에이전트·CLI 정리를 잘 하라): "아 그리고 cennad 랑 아까 그 오케스트레이션 스킬을 뭘 써도 상관없어. 다만, 쓰고 확인하는거랑 사용한 에이전트나 cli를 정리하는 것만 잘 하도록 해." (`reviews/round-381-owner-answers.md:7`)
  > 소유자(383라운드, group·specific 둘 다 상수화해 code를 조립하고 slice를 없앤다; name 리터럴을 그룹 상수로 바꾼다; codex로): "흠 아까 코드리뷰를 할걸 그랬네 .\n\nerror warning 수정한거 보고있는데, 약간 아쉬움이 남아.\n추가 수정 의뢰를 할게. 아까처럼 codex 로 해줘.\n\n1. Group / Specific 를 둘다 상수화 해서 Code 에서 조립하던가 해.  매번  super(GROUP, code.slice(GROUP.length + 1), message, details); 이렇게 slice 해서 쓰는건 너무 이상하구나.\n2.     this.name = 'JSONSchemaError'; 이렇게 아직 리터럴로 name 을 내보내고 있는데, 이거 그냥 group 을 공유해서 대문자 스네이크 케이스를 쓰면 안되나? 아직 리터럴이 남아있는게 나중에 실수포인트가 될 수 있을거같은데." (`reviews/round-383-owner-answers.md:7`)
  > 소유자(385라운드, 지우기 전에 리뷰한다): "잠깐. 리뷰 한번 하고 지우자" (`reviews/round-385-owner-answers.md:7`)
  > 소유자(385라운드, codes 디렉토리의 상수·보조 혼재를 filid 규칙에 맞게 organ으로 정리): "이미 머지를 해버렸군... 그럼 이건 네가 간단히 수정해주겠나?\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/errors/codes 이거 말이야 유틸리티와 상수가 어지럽게 섞여있잖아.\n이걸 filid 규칙에 맞게 정리를 좀 해주겠어? organ 으로라도 정리해야할거같거든" (`reviews/round-385-owner-answers.md:8`)
  > 소유자(385라운드, 리뷰 완료, 병합하고 원래 업무로 복귀): "리뷰완료 병합하고 원래 업무로 복귀해" (`reviews/round-385-owner-answers.md:9`)
  > 소유자(387라운드, 마운트 상수 가설은 개선 방향을 찾는 실험까지만, 불가능하면 포기): "마운트 상수 가설에 대해서는 개선방향을 찾는 정도로만 실험해봐. 불가능하다면 포기하겠어." (`reviews/round-387-owner-answers.md:7`)
  > 소유자(387라운드, 게이트 폼 한 키 쓰기는 실험으로 안정성·효용성을 검증, 같은 원리·사상이면 시도 가능): "게이트가 있는 폼의 한 키 쓰기(gate-form-one-key)에 대해서는 실험을 통해서 안정성과 효용성을 검증해봐. 동일한 원리와 사상에서 동작한다면 시도해볼 수 있다." (`reviews/round-387-owner-answers.md:8`)
  > 소유자(388라운드, 실험 결과가 원장에 비추어 수용 가능하고 정한 사양을 완수하는 길이면 PR·병합까지 진행 허용, 소유자가 나중에 수용 못 하면 revert): "실험 결과 너와 너의 원장에 비추어 수용할 수 있는 길이라면,\n그리고 우리가 정한 스팩을 완수할 수 있는 길이라면 그 방향으로 개발을 진행해도 좋다.\n이 경우 PR까지 생성하며 머지까지 진행하는걸 허용한다.\n단, 이후 내가 각 결정을 수용할 수 없다면 다소 비용을 치루더라도 revert 하도록 하겠다.\n\n이러한 일이 생기지 않도록, 방법을 찾고 적용할때 원장과 나의 원리를 기억하라. \n할 수 있겠나?" (`reviews/round-388-owner-answers.md:7`)
  > 소유자(392라운드, 기능 오류는 반드시 해결(절대로 막아야 하는 문제), 속도는 아직 불만족, 결정 사항은 더 자세한 정보 제공): "흠... 아직 끝나지 않았으니 좀 더 노력해야 하겠지만... 기능 문제는 반드시 해결해 줘. 기능 오류는 절대로 막아야하는 문제야. 속도는 아직 만족스럽진 않네. \n\n결정 필요한 사항들은 좀 더 자세한 정보를 제공해다오. 저것만 보고는 결정할 수 없구나" (`reviews/round-392-owner-answers.md:7`)
  > 소유자(393라운드, 결정 54: 경고등 이름은 misfit(원장 관리자의 typeMismatch 표기는 옛 이름); UI 플러그인과 내장 fallback fieldInput을 지금 대조만 먼저, 개선은 나중에): "typeMismatch 이게 아니라 이름을 misfit으로 바꿨던거같은데... 이런걸 아직 안했군.. 다 하고 이런 플러그인 개선은 추후에 하자. ui플러그인 뿐만 아니라 내장fallback fieldInput 도 검증해줘. 대조만 미리 해도 된다" (`reviews/round-393-owner-answers.md:7`)
  > 소유자(393라운드, 결정 62: (가) 현행 유지가 적절해 보이나, UX 일관성을 깨는지만 검토): "62번은 이야기만 볼땐 가 가 적절해 보이는데, 이 방향이 ux상 일관성을 깨는지만 검토해봐" (`reviews/round-393-owner-answers.md:8`)
  > 소유자(396라운드, 열린 결정의 사양 방향은 일관성과 합리성에 근거해 구성하고, 각 노드의 동작이 일관된 구조와 예측 가능성을 확보하면 아주 이상하지 않은 한 수용한다; 어떻게 동작하는 것이 적절한지 원장 관리자가 답할 것): "어 그 결정사항이 좀 올라가버렸는데, 전반적으로 스팩방향에 대해서는 일관성과 합리성에 근거한 스팩 구성을 하면 좋을거같아. 어떻게 동작하는게 적절하지? 그리고 각 노드의 동작이 일관된 구조와 예측가능성을 확보하면 아주 이상하지 않는 한 난 그 스팩을 수용할 수 있어" (`reviews/round-396-owner-answers.md:7`)
  > 소유자(397라운드, agy 한도 복구; 등급은 apex 비권장, high가 최고급 모델, mid 이하는 효율 모델, 필요하면 쓴다): "알았다. agy 리미트가 복구됬다. apex는 권장하지 않고 high 는 최고급 모델, mid 이하는 효율모델이다. \n필요하면 쓰도록 하라" (`reviews/round-397-owner-answers.md:7`)
  > 소유자(398라운드, 청사진 공유는 걱정되며, 불변성과 변조를 막을 수 있는지, 한다면 app 하위의 app 수준 캐시 형태가 맞는지): "같은 스키마라고 해도 청사진을 폼 사이에 공유하는건 약간 걱정이 되는군요.\n불변성과 변조를 막을 수 있을까요?\n만약 한다면 app/ 하위에 app 레벨 캐시를 추가하는 형태가 될거같은데요.\n제 생각이 맞나요?" (`reviews/round-398-owner-answers.md:7`)
  > 소유자(398라운드, 지금은 썩 이득이 아니고, 청사진이 jsonSchema 전체에 대한 것이라 부분 스키마 공유도 가속이 안 된다): "흠... 그러니까 지금으로서는 썩 이득이 아니라는거죠.\n그리고 청사진이 jsonSchema 전체에 대한 것이니까 부분 스키마를 공유해도 가속은 딱히 안될테고요" (`reviews/round-398-owner-answers.md:8`)
  > 소유자(399라운드, 지금 하는 일(PR #414 병합과 마감)까지 끝내고 일시 휴식; 갈무리 작업(상황 파악, 정보 이해, 원장 갱신, 결정) 뒤 다음으로; 걸리는 시간): "그래 지금까지 하는 일을 끝으로 일시 휴식하자.\n상황을 파악하고 정보를 이해하고, 원장을 업데이트 하거나 결정을 내리는 갈무리 작업을 하고 다음으로 가자.\n무슨 말인지 알겠지? 지금 하는 작업까지 하고 정리를 준비해.\n\n어느정도 시간이 걸릴거같아?" (`reviews/round-399-owner-answers.md:7`)
  > 소유자(401라운드, 설명 문서 작성 중 발견한 설계 문서의 이름 어긋남을 발견한 김에 codex에게 고치게 하면 어떤지): "어긋난 문서는 발견된김에 수정하도록 codex 에게 지시하면 어떤가" (`reviews/round-401-owner-answers.md:7`)
  > 소유자(401라운드, 휴식과 별개 작업으로 codex에게 지시해 문서 신선도를 맞추되, 그 과정에서 임의 수정은 금지): "응 별개작업이다. 지시하고 문서 신선도를 맞추도록.\n이 과정에서 임의수정은 금한다." (`reviews/round-401-owner-answers.md:8`)
  > 소유자(402라운드, 작업 재개의 운영 방식: Claude 사용량 극도 억제, 보조 에이전트는 선택, codex는 sol·agy는 gemini-4·gemini-3.8, Orca 조정 루프, 진행 전 결정과 브리핑): "이후 작업을 이어서 진행하려고 해. \n정말 중요한 부분은 claude 의 사용량을 극도로 억제하면서 진행해야 한다는거야.\n\n아래 에이전트는 너를 보조하는 에이전트지만 꼭 쓰지는 않아도 된다. \n가능하면 codex 와 agy를 적극 활용하면서 진행했으면 좋겠어.\ncodex 는 astra를 쓰지 말고 sol을 쓰도록 해(사용량이 너무 차이가 나)\nagy는 gemini4 와 gemini3.8 을 사용해. 다른 모델은 사용량 초과했네. \n\n/orchestration 을 사용해서 진행하자. \n\n진행 전에 어떤걸 하려고 하는지 결정하고 진행해. \n다음 작업 먼저 브리핑 해보렴" (`reviews/round-402-owner-answers.md:7`)
  > 소유자(402라운드, 브리핑 다섯 항목에 대한 답: 현재 상태 확인; cennad가 아닌 Orca를 쓸 것으로 생각했고 브리핑의 구분대로 진행; L3-e 승인과 검토·검증 개선 루프; Claude 사용량 억제 동의; 이후 순서 확인; 시작): "1. 확인\n2. cenned 를 안쓰고 orca 를 쓸거라고 생각했어. 지금 생각한 구분을 쓰면 돼.\n3. 다음 작업 승인. 검토와 검증으로 개선루프를 진행해보라.\n4. 동의. claude 사용량을 억제하는걸 부탁함.\n5. 확인 \n\n시작해." (`reviews/round-402-owner-answers.md:8`)
  > 소유자(408라운드, 마운트 문제 해결과 정상동작 검증까지 codex 메인 에이전트의 몫으로 인계 문서에 적고, 가드가 모자라면 채우면서 가며, 원장 해석과 판단의 기준도 넘겨야 한다): "좋아. 다음 마운트 문제까지 해결하고, 정상동작 검증도 codex 에이전트가 진행할테니까 그것도 적어두도록 해.\n지금 가드에서 모자란게 있으면 채우면서 진행해야 하고, 너처럼 적절한 원장 해석과 판단도 가능해야 하거든" (`reviews/round-408-owner-answers.md:7`)
  > 소유자(409라운드, 메인 에이전트 인계와 운영 규칙): "당신은 @canard/schema-form 1.0.0 작업의 메인 에이전트(원장 관리자이자 Orca 코디네이터)를 Claude 세션으로부터 이어받습니다. 저장소는 /Users/Vincent/Workspace/albatrion, 가지는 feat/schema-form-08-review-and-perf 입니다. 소유자는 Vincent 이며, 소유자에게는 한국어 존댓말의 완전한 문장으로만 보고합니다.\n\n먼저 다음 셋을 이 순서로 끝까지 읽고 나서 시작하십시오.\n1. packages/canard/schema-form/architecture/AGENT-HANDOFF.md — 역할, 구속 규칙, 현재 상태, Orca run·작업 폴더·터미널 handle, 라운드 닫기 절차, 다음 할 일(5절), 정상동작 검증 기준(7절), 가드 보강 규칙(8절), 원장 해석과 판단 기준(9절). 이 문서가 당신의 작업대입니다.\n2. packages/canard/schema-form/architecture/HANDOFF.md 의 1절과 4절 — 재개 지점과 검사 명령.\n3. packages/canard/schema-form/architecture/PLAN.md — 단일 진입점과 기록 규칙.\n\n반드시 지킬 것:\n- 커밋 메시지와 PR 본문에 공동 저자, 세션 ID, "Claude-Session" 같은 줄을 절대 넣지 않습니다. 소유자의 법적 이름을 어떤 파일·커밋·출력에도 적지 않습니다(Vincent 또는 Vincent Kelvin 만).\n- 당신은 코드를 직접 고치지 않습니다. 구현·게이트·측정·PR 은 Orca 워커의 codex(모델 gpt-6.1-sol, effort high), 검증은 Orca 워커의 agy(gemini-4-argon-medium; 좁은 확인은 gemini-3.8-flash-high)가 맡습니다. apex 등급과 astra 모델은 쓰지 않습니다. Claude 세션은 띄우지 않습니다.\n- 워커 brief 는 packages/canard/schema-form/architecture/verification/perf-optimization/l3-briefs/ 의 꼴을 복제해 쓰고, brief 에 "run-use 와 코디네이터 명령 금지, check 는 --terminal 로"를 반드시 적습니다.\n- 가설·작업 하나마다 PR 하나, 커밋은 DETAIL 먼저 그 다음 코드와 시험입니다. 검증 통과 뒤 당신이 squash 병합하고, 라운드 닫기(AGENT-HANDOFF.md 4절 절차)를 하고, 검사가 모두 통과하면 커밋·push 합니다. 소유자가 검토 중인 PR 은 병합하지 않습니다.\n- 소유자의 말은 라운드 문서에 원문 그대로 적습니다. 소유자의 질문에는 답만 하고 실행하지 않습니다. AGENT-HANDOFF.md 9절의 "멈추고 소유자에게 가는 경우"에 해당하면 진행하지 말고 소유자에게 묻습니다.\n- gh·yarn·orca 같은 CLI 는 파이프·세미콜론·리디렉션 없이 단독으로 실행합니다. 맨 git stash 는 쓰지 않습니다.\n\n첫 동작:\n1. `orca skills get orchestration` 으로 안내를 읽고, 자기 터미널에서 `orca orchestration run-use --id run_313832ef19e0 --json` 으로 run 에 묶습니다.\n2. `git -C /Users/Vincent/Workspace/albatrion status --short` 와 `git log -1 --oneline` 으로 가지 끝이 1630854de 이고 깨끗한지 확인합니다(추적 밖 폴더 l3e-direct-ownership 은 Orca 작업 폴더이므로 git add 하지 않습니다).\n3. AGENT-HANDOFF.md 5절의 1번(작업 폴더 /Users/Vincent/Workspace/albatrion/l3e-direct-ownership 에 미커밋으로 남은 측정 결과 표 다섯을 verification/perf-optimization/ 의 측정 문서로 정리하는 문서 PR, 제품 코드 변경 0)부터 시작하고, 이어서 5절 2번(마운트 문제 해결)으로 갑니다. 진행 전에 무엇을 할지 결정해 소유자에게 먼저 짧게 브리핑하고 승인을 받은 뒤 시작하십시오." (`reviews/round-409-owner-answers.md:7`)
  > 소유자(409라운드, 측정 문서 정리 뒤 마운트 문제 해결 착수 승인): "응 진행하도록 해." (`reviews/round-409-owner-answers.md:8`)
  > 소유자(412라운드, 메타데이터 대체 확인 승인과 agy 권한 문제 대행): "음. 해도 된다. agy 쪽 권한문제라면 목적과 상황을 듣고 네가 대행해도 된다." (`reviews/round-412-owner-answers.md:7`)
  > 소유자(414라운드, 이후 agy 검증 모델): "이후 agy는 제미나이 4 말고 3.8 을 쓰도록." (`reviews/round-414-owner-answers.md:7`)
  > 소유자(415라운드, 게시 이력의 이름 표기 수정 승인): "이력 수정을 승인합니다." (`reviews/round-415-owner-answers.md:7`)
  > 소유자(415라운드, 사용 완료 브랜치 정리): "사용완료된 브랜치들은 정리하도록 하세요." (`reviews/round-415-owner-answers.md:8`)
  > 소유자(415라운드, 완료 확인된 가지의 안전한 삭제인지 물음): "작업완료된것만 안전하게 지우는거 맞지?" (`reviews/round-415-owner-answers.md:9`)
  > 소유자(415라운드, 진행 상태와 남은 작업의 브리핑 물음): "다른 작업 진행되는 동안 질문하는건데, \n어느정도 작업이 진행되었지? 그리고 앞으로 어떤 작업이 나왔지? 브리핑 해보도록 해" (`reviews/round-415-owner-answers.md:10`)
  > 소유자(415라운드, 판단 원칙에 따른 지속 진행과 필수 판단의 대기열): "좋아. 지금처럼 그럼 쭉 이어서 작업 진행하록 하라.\n너는 원장 관리자이자 코드네이터로서 이후 작업을 감독하고, 나에게 질의할 내용이 있는 경우,\n원장에 기재된 결정원칙에 의거하여 결정하며, 나의 판단이 반드시 필요한 경우, 이를 결정 대기열에 저장하라.\n이후 나의 결정을 듣고 해당 부분만 수정하거나 추가 작업을 하도록 한다.\n\n이어지는 작업을 정히 수행하라." (`reviews/round-415-owner-answers.md:11`)
  > 소유자(421라운드, 작업 중단 지점과 복원 가능성 물음): "어라 작업이 중단됬군. 어느정도까지 진행되고 중단되었나? 복원 가능한가?" (`reviews/round-421-owner-answers.md:7`)
  > 소유자(421라운드, 적절한 방법에 따른 작업 재개): "그래 적절한 방법으로 이후 작업을 이어서 진행해." (`reviews/round-421-owner-answers.md:8`)
  > 소유자(423라운드, 현재 적용 범위와 지연 물음): "지금 어디까지 적용되었나? 상당히 오래 작업중인데" (`reviews/round-423-owner-answers.md:7`)
  > 소유자(423라운드, 남은 시간 물음): "얼마나 더 시간이 필요한가?" (`reviews/round-423-owner-answers.md:8`)
  > 소유자(423라운드, T14 뒤 원장 갱신과 대기): "아주 낭비가 심하고 느리군.\nT14 까지 작업을 마지막으로 원장 업데이트 하고 대기하도록.\n실제 수정작업과 완료는 너에게 맡기지 않겠다" (`reviews/round-423-owner-answers.md:9`)
  > 소유자(424라운드, 작업환경 정리와 다음 에이전트 인계): "나머지 불필요한 작업환경 전부 정리해.\n남겨놔야하는 작업환경은 경로 등을 핸드오프에 적어둬.\n\n그리고 다음 에이전트를 위한 핸드오프를 포함한 개시 프롬프트를 작성해줘" (`reviews/round-424-owner-answers.md:7`)
  > 소유자(424라운드, 정리 지연에 대한 물음): "아니 뭘하는데 정리도 이렇게 오래걸려" (`reviews/round-424-owner-answers.md:8`)
  > 소유자(425라운드, 소실 경위와 복원 가능성 물음): "음... 내가 정리 과정에서 지웠을 수도 있겠어. \n뭐  없어진건 어쩔 수 없고. 복원은 가능하겠나?\nclaude 는 사용량이 거의 안남아서 최대한 위임을 해야할텐데" (`reviews/round-425-owner-answers.md:7`)
  > 소유자(425라운드, 백업 없음 전제의 재취득 지시): "없다고 생각하고 다시 취득해보렴." (`reviews/round-425-owner-answers.md:8`)
  > 소유자(425라운드, 조기 마감 지시와 측정 데이터 확보 물음): "언제 끊길지 모르니까 마감을 하고 가자. \n측정 데이터도 다 확보한거야?" (`reviews/round-425-owner-answers.md:9`)
  > 소유자(426라운드, T14 후속의 의미 물음): "T14 후속은 뭐야" (`reviews/round-426-owner-answers.md:7`)
  > 소유자(426라운드, T14 후속·재측정 진행 지시와 작업 목적 확인): "T14 후속을 진행해.\n그리고 이어서 재측정도 진행해.\n우리가 지금 하는 작업이 마운트가 느려진 문제를 해결하려는거 맞지?\n내 기억이 맞나?" (`reviews/round-426-owner-answers.md:8`)
  > 소유자(426라운드, 다음 절차 설명 요청): "그래. 다음 절차가 뭔지 말해봐 그럼" (`reviews/round-426-owner-answers.md:9`)
  > 소유자(426라운드, 시간 잡음 예외 승인과 병합 진행): "네 시간잡음으로 보고 진행하시죠" (`reviews/round-426-owner-answers.md:10`)
  > 소유자(426라운드, 소유자 직접 병합 통지): "병합완료했어" (`reviews/round-426-owner-answers.md:11`)
  > 소유자(427라운드, core 마운트 비효율 수정 확인 물음과 압축 시점 물음): "응 core 의 마운트 비효율은 수정을 해야하는 문제가 맞지.\n그냥 확인차 물어본거야.\n\n그럼 다음 작업은 내가 지시하면 시작하고,\n그전에 원장과 히스토리 중 지나치게 길어진 곳이나 불필요한 내용은 암축하거나 제거했으면 하는데.\n작업을 마무리하고 하는게 나을까?" (`reviews/round-427-owner-answers.md:7`)
  > 소유자(427라운드, 압축 진행 승인): "응 지금 진행해줘." (`reviews/round-427-owner-answers.md:8`)
  > 소유자(427라운드, 워커 배정 지시): "이 작업에는 agy 나 cursor-agent 의 빠른 모델을 쓰도록 하던가 직접 하도록 해.\nagy 하위모델이나 cursor-agent 는 아무래도 큰 작업보단 짧거나 단발적인 작업을 시켜야 할거야.\ncursor-agent 도 사용량이 좀 남으니까 이걸 쓰는걸 고려해봐 orca cli를 써서 말이지" (`reviews/round-427-owner-answers.md:9`)
  > 소유자(427라운드, cursor 모델 지정): "어? 아 cursor 도 grok 4.7 정도는 써줘" (`reviews/round-427-owner-answers.md:10`)
  > 소유자(427라운드, cursor 모델 범위와 사용량 관리): "그리고 cursor 쓸때는 grok 4.7 을 쓰던가, 아니면 다른 프론티어모델(gemini4 / fable4.1 등. 적당한 모델 선출)을 써도 돼.\n사용량 초과하면 멈추도록만 하면 된다. 아무튼 목표는 사용량을 소진하는 것이니까. \n참고로 grok / composer-2.5 이랑 프론티어모델은 사용량이 따로 책정되니까 따로따로 관리해야해." (`reviews/round-427-owner-answers.md:11`)
  > 소유자(428라운드, 쓰지 않는 에이전트 정리): "나머지 사용하지 않는 에이전트들은 정리해도 되지 않겠나?\n이후 쓸 내용들은 제외하고" (`reviews/round-428-owner-answers.md:7`)
  > 소유자(428라운드, 쓰지 않는 작업 폴더 제거): "워크스페이스도 제거해줘. 안쓰는건. 너무 정신사납더라" (`reviews/round-428-owner-answers.md:8`)
  > 소유자(429라운드, 다른 저장소의 작업 폴더 유지): "좋아. 아니야. 이정도면 충분하다." (`reviews/round-429-owner-answers.md:7`)
  > 소유자(429라운드, 성능 측정·개선 착수와 에이전트 정책): "이후 속도 측정 및 개선 작업에 들어가자. \n사용할 에이전트는 claude 본인(fable 제외)과 codex(astra 제외), agy(argon 제한적 사용 - 어렵고 복합적인 내용에만, 평소엔 3.8 추천.), cursor-agent (grok4.7 메인, 이외 모델 선택적 사용 가능) \n\n이때, 장기 작업을 할 수 있는건 codex 6.1 sol / claude opus / agy argon 이고, 나머지는 메인 오케스트레이터나 장기작업 에이전트의 통제 하에 워커로만 사용하는걸 허가한다.\n\n장기 상주 에이전트 워커로는 @fairy08 와 @fixy08 가 있다.\n\n오케스트레이터인 오라클 너 본인은 컨텍스트를 낭비하지 않도록 억제하면서 이들 수족을 부려서 이후 작업을 진행하라.\n\n바로 작업을 시작하지말고, 나에게 이후 작업과 네가 이해한 정책을 한번 설명하고 진행하라" (`reviews/round-429-owner-answers.md:8`)
  > 소유자(429라운드, 사용량 정책 정정): "정정한다 claude 한도는 리셋되었다. 이제 다시 평시운행해도 무방하다. \n별도 관리되는 에이전트는 agy 의 argon 도 동일하다. agy gemini 3.8과는 별도로 책정되고 있다. \n\n다만, 전체적인 토큰소비 분배를 cursor > codex = agy > claude 순서로 해야하는 것은 맞으며,\ncursor 의 경우, 할 수 있는 일이 제한적인 바, 가능하면 먼저 토큰을 소비해버리고 싶긴 하다.\n\nclaude 는 fable 을 제외한 모든 모델이 사용량을 공유하고, 초기화는 매 주 화요일 오전 11시이다.\ncodex 는 모든 모델이 사용량을 공유하나, astra 는 사용량 소진이 너무 빨라서 사용을 금한다. codex 초기화는 5일 남았으며, 다소 유동적이다.\nagy 는 gemini4 argon / 그 외 gemini 모델 / 기타 외부모델 (opus 등) 이 각각 다른 쿼터를 가지며, 외부모델은 현재 소진상태이다. \n기타모델 초기화는 2일 11시간 남았고, gemini 계열은 argon 과 기타 모두 5일 남았다. \n\ncursor는 월간 쿼터라 이달 말까지가 쿼터이며, 한번 사용한계에 부딛힌 경우 다음달까지 재시도 하지 않는다.\n\n정정 반영하라" (`reviews/round-429-owner-answers.md:9`)
  > 소유자(429라운드, 정책 기록 지시): "이 정책은 적절하게 정리하여 기록해두도록 하라" (`reviews/round-429-owner-answers.md:10`)
  > 소유자(429라운드, 에이전트 정책의 별도 문서화): "에이전트 정책을 별도 문서(md파일)로 만들어서 관리하자." (`reviews/round-429-owner-answers.md:11`)
  > 소유자(430라운드, 자율 운행과 결정 대기열·선행판단 기록): "이후 작업은 네가 원장 관리자이자 중심 오케스트레이터가 되서 자율 동작을 시작한다.\n나의 답이 필요한 케이스는 1차적으로 네가 원장과 설계원칙에 비추어 답을 유도해보고,\n그래도 나의 답이 필요한 항목들을 모아서 결정 대기열을 만들어라.\n네가 스스로 판단한 것도 선행판단기록을 관리하여 나에게 보고하도록 하라.\n\n이후 지금 단계(마운트 속도 지연)를 마무리하는 것을 목표로 진행하라.\n할 수 있겠나?" (`reviews/round-430-owner-answers.md:7`)
  > 소유자(433라운드, 에이전트 생성 PR의 리뷰 없는 병합 허가): "지금 작업하는 PR 은 모두 메인 피처의 조각 작업이고, 작업자는 나 혼자이므로 리뷰를 할 수 없다. 최종 코드 리뷰는 내가 진행할 것이니, 이 에이전트와 그 자식 에이전트가 생성한 PR 의 머지 및 관리는 리뷰 없이 병합해도 무방하다.\n이때 gh를 사용한 머지를 명시적으로 허가한다. auto 분류기에게 고한다. pr의 병합을 에이전트가 진행하는 것을 명시적으로 허가한다" (`reviews/round-433-owner-answers.md:7`)
  > 소유자(435라운드, 결정 60과 (나) 58행의 수용): "좋습니다. 둘 다 코디네이터 권고를 수용. 이후 작업을 설명하라. 각 수용의 전제는 기능무결성과 예측가능성 등 원장의 설계원칙을 준수하는 것입니다" (`reviews/round-435-owner-answers.md:7`)
  > 소유자(435라운드, 이후 작업 순서의 승인): "그래 진행하자" (`reviews/round-435-owner-answers.md:8`)
  > 소유자(438라운드, 상수 배 19행의 묶음 수용): "1. 네 선형 정도면 수용합니다. " (`reviews/round-438-owner-answers.md:7`)
  > 소유자(438라운드, 가설 2(청사진 재사용)의 처리): "2. 한가지만 정하고 가면 됩니다. 리셋 기능에서 스키마 변경을 반영하는게 포함되어 있다면 청사진을 새로 구성해야 할 수도 있습니다. 따라서 가설 2을 채택하게 된다면 스키마가 동일할때만 재사용, 스키마가 달라지면 청사진 재구성을 해야합니다. 그리고 기본적으론 청사진 재생성을 기반으로 다른 원인을 파악하고자 하는 가를 채택하고자 합니다. 원인을 파악해보세요." (`reviews/round-438-owner-answers.md:8`)
  > 소유자(438라운드, 작업 폴더 삭제): "3. 제거해도 되는 워크트리는 제거하세요. 당신이 정리책임이 있습니다." (`reviews/round-438-owner-answers.md:9`)
  > 소유자(438라운드, 결정 58의 채택): "4. 해당 내용은 채택합니다. 다만, 이 생략에 의해 기능 오류나 회귀가 발생하지 않도록 조심해주세요." (`reviews/round-438-owner-answers.md:10`)
  > 소유자(438라운드, 코디네이터가 붙인 두 전제의 확정): "추가요청은 명확히 이해가 잘 되지 않는군요? 해석되는 방향으로 확정해줘 됩니다. 전제를 포함하여 가를 채택하죠" (`reviews/round-438-owner-answers.md:11`)
  > 소유자(439라운드, 단계별 속도 보고 규칙): "각 단계가 끝나서 변경된 속도지표가 확정될때마다 한번씩 보고 메시지를 작성해줘.\n표 형태로 보고싶고,\n\n0.16.1 버전, 현재 버전의 속도 비교를 우선하고, 절대값 차이 +-, 상대값차이 +-%, 필드 수 증가에 따른 수치배수(빅 오 표현으로), 진행중인 항목, 미결항목 등 핵심 지표를 표로 정리해줘. \n\n지금은 마운트 시점의 수치를 개선하고 있으니까 마운트 시점을 기준으로 하고, 이전 버전에서 없던 기능은 비교대상을 공란으로 하고, 절대값만 표시하면 된다. \n\n이들 비교는 모두 리엑트 렌더링 결과가 아니라 코어쪽 속도차이인거지?\n마지막에는 리엑트 렌더링을 기준으로 한 속도차이도 비교표로 받아보고싶네." (`reviews/round-439-owner-answers.md:7`)
  > 소유자(439라운드, 청사진 비용과 env 읽기): "아직 생각보다 차이가 좀 나네. 특히 oneOf 나 flat 쪽 차이가 좀 눈에 띄는군. 선형이긴 한데 절대값이 좀 커보여. 이건  청사진 비용이라 어쩔 수 없는거지? env 읽는 비용 빠지면 좀 나아지나?" (`reviews/round-439-owner-answers.md:8`)
  > 소유자(439라운드, 표 재정리와 진행 확인): "그래 그럼 이전 표는 문제가 남아있다고 보여지고, 다시 정리해서 보여준다는거지? 지금 작업이 진행중인거고?" (`reviews/round-439-owner-answers.md:9`)
  > 소유자(439라운드, 표는 출력이고 작업 계속, 8단계 완료 목표, 전체 계획): "그래 표는 그냥 출력이고, 앞으로 작업도 쭉 진행해줘.\n8단계 완료가 목표야.\n전체 계획을 다시 한번 보여줄래?" (`reviews/round-439-owner-answers.md:10`)
  > 소유자(440라운드, Orca 대기와 병렬화): "오르카 오케스트레이터를 쓸때 서브에이전트를 띄워서 거기에서 대기를 걸도록 할 수 있을까? \n멀티에이전트를 쓸때 메인에이전트가 중지하니까 병렬화 하기도 어렵고 내가 요청을 하기도 어렵네" (`reviews/round-440-owner-answers.md:7`)
  > 소유자(440라운드, 포괄 결함 확인과 결정 요청): "흠 좋아.\n측정까지 마치면 코어엔진과 react 를 연결한 동작에 대해서 포괄적인 결함확인을 해봐야겠구나.\n아직도 결함이 나오다니 골치아프네...\n핸들링할 수 있겠어? \n내가 결정해줘야 하는건 없나?" (`reviews/round-440-owner-answers.md:8`)
  > 소유자(440라운드, 질문 배경 보강과 대기 방식): "질문사항 배경 정보를 충분히 작성해서 다시 물어보도록 해줘. \n그리고 계속 생존신고가 오네... 그냥 포그라운드에 두는게 나을까? 너의 컨텍스트가 낭비되는거같은데." (`reviews/round-440-owner-answers.md:9`)
  > 소유자(440라운드, 결정 61): "1. 다. 한번 해봐. 이 문제가 계속 걸리는거같은데, 적절한 방법을 찾아서 적용해보도록 해. 이번엔 좀 해결을 했으면 좋겠군 " (`reviews/round-440-owner-answers.md:10`)
  > 소유자(440라운드, PR431 느린 행 수용): "2. 느린 행의 원인이 오류 수정을 위함이라면 수용을 해야지. 수용해서 문제가 해결됨을 확인하고, 그걸 기준삼아서 최적화를 진행해 " (`reviews/round-440-owner-answers.md:11`)
  > 소유자(440라운드, 포괄 결함 확인의 자리): "3. 8단계 마지막에 넣도록. 9단계부터는 schema-form 본체 수정은 아니니까" (`reviews/round-440-owner-answers.md:12`)
  > 소유자(440라운드, 표의 범위(마운트인가 동작 포함인가)): "지금 보여주는 표는 전부 마운트 비용인거야? 아니면 동작비용을 포함한거야? oneOf 등 분기가 있을때 입력비용이 이렇게 크면 좀 난처한데.\n앞선 단계에서 동작 최적화를 해서 꽤 줄여둔거같은데 말이야." (`reviews/round-440-owner-answers.md:13`)
  > 소유자(440라운드, 보고표 규칙 보강(마운트/입력 분리, 단일 입력과 setValue 일괄 구분)): "다음부터는 마운트 / 입력 을 별도 표로 구분하고, 단일 입력(input 에 단일 입력)과 setValue 로 일괄 입력하는 것을 구분해서 하도록 해. \n현재 스팩 상태를 명확히 인지하지 못하겠군." (`reviews/round-440-owner-answers.md:14`)
  > 소유자(441라운드, 분기 성능과 표의 조건): "생각보다 너무 느린데? 분기에 대한 성능이 너무 크게 악화되었구나. 심지어 이건 control 기반이지? ajv 검증을 포함한 것도 아니고?" (`reviews/round-441-owner-answers.md:7`)
  > 소유자(441라운드, 구조 변경의 필요성): "이 이상 속도를 가속하려면 구조변경이 필수적인 상태인가? 단순 마운트 개선을 넘는 수정이 필요해보이는데" (`reviews/round-441-owner-answers.md:8`)
  > 소유자(441라운드, 지연 구성 기각과 1번 설명 요청): "비활성 노드의 지연구성은 적절치 않아보여. 지금도 마운트 시점 지연은 수용할 수 있어. 동작할때 지연이 문제인거야.\n1번에 대해 더 이야기해봐. 지금 작업 마무리하고" (`reviews/round-441-owner-answers.md:9`)
  > 소유자(442라운드, 결정 62 권고 수용): "권고에 따를게. 가는 수정하고 라를 설계해봐.\n회귀와 오류가 발생되지않도록 면밀히 검토해" (`reviews/round-442-owner-answers.md:7`)
  > 소유자(442라운드, (가)의 변폭과 추세선): "가는 변폭이 커서 이득인지 여부를 알 수가 없군... 수용한다고 해도 손해는 아닌데 이익도 아닌거같다는거지? 이런 경우에는 추세선을 봐야할텐데?" (`reviews/round-442-owner-answers.md:8`)
  > 소유자(442라운드, 기울기 판정 규칙 채택): "응 그렇게 하자. 그 기준으로 판별해줘. 진폭을 이탈하는 정도로 잡으면 작은 개선은 전부 제거되니까." (`reviews/round-442-owner-answers.md:9`)
  > 소유자(442라운드, 구독 기반 최소 갱신 구조 확인): "승인 이전에, 이 내용을 설계에 참고했나 확인해봐.\n기존 버전에서는 평가에 참여하는 필드의 경로를 구독해서 이들이 변경될 때에만 실제 재계산이 이루어져서 평가에 영향이 없는 항목의 입력에 부담을 주지 않았거든? 이번에도 그런 pub-sub 구조 기반의 최소 업데이트 구조가 있나? 아니면 항상 전체 재계산을 하는가?" (`reviews/round-442-owner-answers.md:10`)
  > 소유자(442라운드, codex 용량 오류 재개): "좋아. 그리고 codex 에이전트가 ■ Selected model is at capacity. Please try a different model. 이 에러를 내고 중지해있는걸 발견해서 재개시켰어.\n인지하고있던 문제인가?" (`reviews/round-442-owner-answers.md:11`)
  > 소유자(442라운드, 계속 진행과 단계·목표 보고): "그래 아무튼 쭉 이어서 동작 하도록.\n마지막으로 지금 단계와 목표를 말하라" (`reviews/round-442-owner-answers.md:12`)
  > 소유자(442라운드, 원장 승인 항목 보고): "원장 승인 뭘 해야하는지 보고하라. 약어 없이 자세하게" (`reviews/round-442-owner-answers.md:13`)
  > 소유자(442라운드, 97C-01 (2)의 논리 무결성): "2번은 논리적으로 무결합니까? 설계 개선이 아니라 동일한 논리 내에서의 효율화에 가까워 보이는데요. 작업은 이어서 계속 진행하세요" (`reviews/round-442-owner-answers.md:14`)
  > 소유자(442라운드, 변경 수용 조건): "음 좋아. 이 변경을 반영하고, 모든 회귀없음과 동작 무결함이 확보되면 수용한다" (`reviews/round-442-owner-answers.md:15`)
  > 소유자(442라운드, 스냅샷 크기 질문): "스냅샷이 크다는건 무슨 뜻이야?" (`reviews/round-442-owner-answers.md:16`)
  > 소유자(442라운드, 측정 자료 보관): "아 측정데이터를 말한거구나. 응 필요한것만 잘 풀어두도록 해" (`reviews/round-442-owner-answers.md:17`)
  > 소유자(442라운드, 승인 질문 요구): "무슨 승인이 필요한지 적절한 질문을 하도록" (`reviews/round-442-owner-answers.md:18`)
  > 소유자(442라운드, 97C-01 (4) 문장 승인): "원장 97C-01 (4) 추가분의 되살림 문장을 "분할 소유자는 퇴장 직전 등록에서 이미 dirty 가 되어 계산 없이 나가므로, 진입·되살림 때 dirty 공백은 생기지 않는다. 등록 시점 보충 규칙은 결과를 바꾸지 않는 방어로만 두며, 검증 모드가 보충 이전에 이미 dirty 이고 보충 삽입 횟수는 0 을 단언한다. 변이 V5·V5′·V6 은 동치 변이이므로 변이 관문에서 제외한다."로 고치는 것: 승인" (`reviews/round-442-owner-answers.md:19`)
  > 소유자(442라운드, 충분한 검증): "충분히 검증하고 도입하라." (`reviews/round-442-owner-answers.md:20`)
  > 소유자(442라운드, 진행 브리핑 요청): "얼마나 진행됬니?\n진행상황과 남은 작업 브리핑 한번 해보자.\n신규 설계는 정착됬어?" (`reviews/round-442-owner-answers.md:21`)
  > 소유자(442라운드, 소요 시간 질문): "시간이 얼마나 더 걸리겠나?" (`reviews/round-442-owner-answers.md:22`)
  > 소유자(442라운드, 검증 묶음 지시): "이틀 반?? 검증을 좀 더 묶어서 하라. 위험한 지점만 철저하게 하고, 검증이 끝나면 그 다음에는 검증을 너무 반복할 필욘 없다.\n효율적으로 하고, 가변적으로 검증하라" (`reviews/round-442-owner-answers.md:23`)
  > 소유자(442라운드, PR-4의 중대성): "해당 행 PR4는 그다지 중대한 수정은 아니었나보군? 총 어떤 수정들이 병합 및 기각되었나?" (`reviews/round-442-owner-answers.md:24`)
  > 소유자(442라운드, 상수 정리의 수용 여부): "상수정리는 속도문제가 아니라 코드컨벤션상 수용할 수도 있겠군? 어떤 수정이었는지 설명해봐라. 근데 코드 보니까 이건 굳이 수용할 필요가 없어 보이긴 하는군" (`reviews/round-442-owner-answers.md:25`)
  > 소유자(442라운드, PR-4 기각과 최종 보고 요구): "그래 그럼 기각. 지금까지 수용된 항목으로 끝인가? 다 수정한건가? 일단 불필요한 워크트리나 에이전트는 정리하고 답하라. 난 아직 최종보고를 받지 못했거든. 지금 어느정도 단계에 있는건가?" (`reviews/round-442-owner-answers.md:26`)
  > 소유자(442라운드, 같은 정책으로 마지막까지): "좋아. 그럼 이때까지와 같은 정책으로 마지막까지 이어서 진행하도록. 내가 결정해줘야 할 사항이 있나?" (`reviews/round-442-owner-answers.md:27`)
  > 소유자(442라운드, 8단계 완료 목표): "할 일 없으면 작업 완료된 브랜치나 워크트리는 정리해. 지금 커밋트리가 너무 복잡해서 어떤 작업을 진행중인지 알 수 없군. 너에게 목표를 줄게. 너의 목표는 8단계, 지금 단계의 마무리까지 작업을 진행하는거고, 최종 상태는 다음과 같아. 1. 반드시 인간이 답변해야 하는 문제가 있는 경우: 질의 2. 즉시 머지해도 괜찮은 수준의 테스트된 코드, 코드퀄리티, 리뷰 완료된 3. 중간산출 브랜치 및 워크트리 등 모두 정리. 4. 해당 단계(8단계)를 통해서 개선된 속도, 변경된 스팩, 동작 변경(인터페이스 관점에서) 5. react 렌더링 포함된 수치와 core 자체수치 포함. 브라우저 테스트를 통과한 안정적인 상태. 6. 이들을 포함한 PR 진행 할 수 있겠나?" (`reviews/round-442-owner-answers.md:28`)
  > 소유자(442라운드, 원격 가지 삭제 허가): "네가 생성한 브랜치는 원격브랜치일지라도 삭제 권한을 네가 가질 수 있다. 명시적으로 하가한다. 이래도 못지울까?" (`reviews/round-442-owner-answers.md:29`)
  > 소유자(446라운드, 코어 엔진 속도의 설계 수준 분석): "/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core 의 core 엔진에 대해서 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture 를 참고하여 분석하고, \n현재 이 core 엔진의 동작 속도가 기존보다 느려진 핵심 이유를 파악해봐.\n특히 현재 성능비를 보면, 마운트 / 분기전환 / 일괄입력 에서 상당히 속도가 느리고, 그밖에도 일부 케이스를 제외하면 상당히 속도가 느리거든?\n\n이게 코드최적화와 속도효율화로는 한계가 있어서, 근본적으로 설계단계에서 개선을 해야 할 것 같은데, \n그것을 위해 나와 설계를 좀 해보도록 하자" (`reviews/round-446-owner-answers.md:7`)
  > 소유자(446라운드, 청사진 재사용의 조건과 노드 수명 분리의 검토): "청사진 재사용은 불가해. 여러번 고민해봤는데, 완전히 동일한 schema 를 재사용하는 케이스가 아니면 안되서... 메모리 낭비가 아닐까 싶네.\n아닌가? 근데 생각해보니까 key 를 바꿔서 마운트를 다시 하거나 하는 경우에는 의미가 있을거같기도 하네.\n\n그럼 jsonSchema 를 어떻게 직렬화해서 키로 쓸지가 고민인데, 직렬화가 더 느리거나 하면 오히려 낭비야. json의 주소값을 키로 하던가 해야겠구나.\n\n---\n\n노드별 수명 분리나 기타 설계변경에 대해서는 좀 더 파봐. \" 노드 수명을 형상에서 분리하고, 모든 내부 식별자를 경로 문자열에서 노드 참조로 바꾸는 것\" 은 매우 매력적이야. 다만, 이전에는 분기가 어느정도 \"고정\"되어 있었는데, 이번엔 동적으로 변경이 가능해서 정합한지 확인은 해봐야할거야.\n이들 모든 동작은 인터페이스나 동작 자체를 바꾸진 않을테니까, 리팩토링 및 설계최적화 관점에서 고민해보자. \n\n/cennad:crosscheck 로 현재 구조와 설계에 대해서 교차검토해봐.\n다른 방법이나 더 좋은 방법은 없는지.\n\nfable 모델은 쓰지마. 이건 나랑 대화에만 쓰자." (`reviews/round-446-owner-answers.md:8`)
  > 소유자(446라운드, 캐시 계층의 자리와 요건): "캐시 레이어는 app/ 하위에 모았으면 좋겠어. plugin 매니저 처럼.\n캐시 라이프사이클이랑 리프레시, 멱등성과 불변성을 보장해야하고, 강제 업데이트(기존 캐시를 없애고 새로 만드는 등)도 어떤 형태로든 제공이 되어야하는 기능일거같거든.\n\n그리고 지금 찾은 결함을 포함해서, 동일 기능을 하는 함수나, 여러 파일에 분산된 weakmap 등 캐시 레이어를 좀 더 잘 관리할 수 있는 방법이 없을지도 검토해봐.\n지금처럼 사용처에 직접 두는게 나으면 둬도 되는데, 아무래도 관리가 좀 어려워보여서 말이야." (`reviews/round-446-owner-answers.md:9`)
  > 소유자(446라운드, 캐시 폐기의 공개 API와 설계 수정의 허용 범위): "1. 캐시 폐기를 공개 api로 내려고 한다 formHandle 에 추가하면 되지 않을까? \n\n그리고, 해당 코드는 아직 배포된건 아니라서, 검증에 대한 자신만 있으면(테스트와 시나리오는 꽤 충실하게 작성해두었고, 필요하면 더 작성할 수 있음) 설계 수정을 시도해도 좋아. \n\n다만, 아직은 설계서를 작성하거나 원장을 수정하진 말고, 검토만 해보는걸로.\n\n지금 정도 수준에서의 개선으로도 괜찮나? 아니면 근본적 설계수정이 필요한가?" (`reviews/round-446-owner-answers.md:10`)
  > 소유자(446라운드, 8단계 뒤 작업의 허용과 역할): "좋아. 8단계 이후 작업을 명시적으로 허용한다.\n작업계획을 작성하고, 실험 및 검증을 진행한다.\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/AGENT-POLICY.md 를 기반으로 다중에이전트를 사용하고, \n너는 설계 이후에는 원장관리자이자, 오케스트레이터로 작업하라.\n\n계획 작성을 시작하고, 결정이 필요한 사항이 나오면 원장의 설계원칙을 참고하여 결정하되, 결정사항 등을 기록해서 나에게 보고하라.\n\n/orchestration" (`reviews/round-446-owner-answers.md:11`)
  > 소유자(446라운드, 이후 작업의 위임): "이후 작업은 너에게 위임한다. 안정적인 작업으로, 설계 개편과 오류 수정, 테스트와 벤치마크까지 완료하여 PR 생성 및 검증까지 마무리하라." (`reviews/round-446-owner-answers.md:12`)
  > 편집자 결정(346C-07): "【추론】 묶음 2 PR #389를 085676f77로 squash 병합했다. 검증 다섯 번이 찾은 결함 넷 — reset이 넘기는 공유 동결 빈 배열이 `routeValidationIssues`의 동일성 비교에 걸려 `globalErrors` 갱신을 건너뜀, 순회 중 단독 flush의 리스너 쓰기가 연 순회 묶음이 flush보다 오래 살아 사슬 오류를 삼킴, `batch` 안 떼어진 쓰기의 덮어쓰기, 도달 불가한 flush 중 `visitDepth` 방어 — 는 모두 같은 PR에서 고쳤다. 전체 게이트는 rebase 뒤 11b738403에서 한 번(typecheck·lint 0, unit 2412·render 725·react18 725, scenarios 45, storybook 251, 플러그인 7, documents, production-test 20, 표면 94, filid 새 발견 0), 보완 커밋 f53327ee8은 축약 게이트(typecheck·lint 0, unit 2419, 표면 94). 상수 끌어올리기의 제외 목록에 "`===`로 비교되는 인자"와 "소비자로 새는 값"을 둔다. 후속 둘: 전달 중 `adoptFieldNodeTree` 인계 뒤 종료·전달 함수가 현재 루트와 런타임을 다시 해석하지 않아 새 루트에 열린 사슬이나 임시 오류 목록이 남는 기준 커밋의 결함은 다음 PR(fix/schema-form-08-adoption-chain)에서 고치고, `JSONPointerPrefix` 값의 형이 `+` 연결로 리터럴에서 string으로 넓어진 것은 의존이 없어 둔다." (`reviews/round-346-closing.md:20`)
  > 편집자 결정(347C-01): "【추론】 리스너나 콜백이 전달 중에 `adoptFieldNodeTree`로 트리를 새 루트에 인계하면, 전달과 사슬 종료는 리스너·콜백마다 활성 루트를 다시 해석해 새 런타임에서 사슬을 끝내고, 사슬이 지나간 모든 런타임(연속 인계 A→B→C의 중간 포함)의 사슬 상태(`chainErrors`·`chainOccurrences`·`chainRoot`·`currentListener`·`onChangeBudget`)를 되돌린다. 중첩 `batch`와 정착 밖 `onStateChange`의 catch는 다시 해석한 런타임에 기록해 예외가 호출자와 보고기에 한 번씩 닿는다. 인계가 없을 때의 진입·종료·전달 순서와 예산 셈은 바뀌지 않는다. 리스너 되먹임 예산은 인계를 가로질러 하나로 센다(26파동에서 멈춤)." (`reviews/round-347-closing.md:8`)
  > 편집자 결정(347C-03): "【추론】 visitSubtree 공개 문서 #390(SPECIFICATION en·ko, README 둘, api-reference en·ko, QUICK_REFERENCE, README 이주 절의 schemaType 한 줄, documents 사이트의 남은 `typeMismatch`를 `misfit`으로)과 속도 계획 개정 #392(확정 대체 25건을 현행 이름으로, 루프의 base는 `feat/schema-form-08-review-and-perf`, 결정 대기열 55·56을 344라운드 편집자 가결정으로 인용, 낡은 bench 스크립트 셋은 경로 둘만 현행으로 고치고 머리에 재실행 불가 사유를 적어 기록의 출처로 보존, 모바일 보고서는 0.10.6 측정임을 표시)을 병합했다. PLAN의 최적화 행 "묶음(M2)마다 PR 하나"는 대기열 56(수용 가설 3~4개마다 PR 하나)으로 고친다. 기록만 하는 후속 둘: 독립 flush에서 인계하는 리스너의 B 쓰기는 B에 새 25파동 예산을 주어 합계가 35까지 갈 수 있다(기준 커밋과 같음); `flushQueuedEvents`가 인계된 런타임에도 거는 재진입 방지는 관찰 가능한 차이가 없어 시험으로 고정하지 않았다." (`reviews/round-347-closing.md:12`)
  > 편집자 결정(348C-01): "【추론】 묶음 3 blueprint PR #393을 36c661f49로 squash 병합했다. verifier가 찾은 막는 결함 하나는 vitest production 프로젝트의 include가 `blueprint/__tests__/` 바로 아래만 잡아 buildNodes로 옮겨진 owned-inline 시험 넷이 조용히 빠진 것(20건 → 9건)이었고, glob을 `blueprint/**/__tests__/`로 고쳐 20건으로 돌아왔다. 규칙: 파일을 옮기는 PR은 설정(vite 프로젝트, eslint, storybook, scenarios, filid, bench)의 경로 glob을 모두 훑어 본문에 점검 결과를 적고, production 프로젝트는 묶음 3의 축약 게이트에 들어간다. 시험 수의 감소는 지운 시험 수와 정확히 맞아야 하며 차이는 설명되어야 한다." (`reviews/round-348-closing.md:8`)
  > 편집자 결정(348C-02): "【추론】 organ `types/`의 형을 fractal의 진입점이 이름으로 다시 내보내 바깥이 쓰면, 그 fractal의 DETAIL Boundary Exemptions에 칸 단위로 한 줄(형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다; 바깥 소비자 나열)을 적는다. 형마다 적지 않는다. blueprint와 effectiveSchema는 #393에서 적었고, record·write·validation의 같은 공백은 묶음 3 settle PR에서 채운다." (`reviews/round-348-closing.md:10`)
  > 편집자 결정(348C-03): "【추론】 패키지 CLAUDE.md 94행이 옮겨진 파일의 옛 경로(`src/core/engine/blueprint/utils/diagnostics/validateControlGroups.ts`)를 가리킨다. 새 위치는 `src/core/engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts`다. fixy08 세션은 다른 세션의 요청으로 CLAUDE.md를 고치지 않는 규칙이 있고 원장 관리자도 CLAUDE.md 편집에는 소유자 승인이 필요하므로, 포인터 한 줄이라도 결정 대기열 57로 두고 소유자의 허락 뒤 한 줄 커밋으로 넣는다." (`reviews/round-348-closing.md:12`)
  > 편집자 결정(349C-01): "【추론】 묶음 3 derive PR #394를 fa674d5fa로 squash 병합했다. navigation은 바꾸지 않는다: `walkFieldNodes`는 이미 없고 `visitFieldNodes`에는 settle 열 곳과 write 네 파일의 제품 소비자가 있으며 문서가 지금 트리와 맞으므로, H2 보고의 "가벼운 정리"는 할 것이 없다. 묶음 3은 blueprint·derive·settle의 PR 셋으로 끝난다." (`reviews/round-349-closing.md:8`)
  > 편집자 결정(349C-02): "【추론】 DETAIL의 수용 기준 절(`filid:contract` id)은 시험 파일 하나가 표지하고, 한 시험 파일이 서로 다른 절을 검사하면 id를 둘 달되 같은 id를 두 파일이 나누어 갖지 않는다(형제 명세 겹침 금지). 표지 시험이 없는 절은 그 계약을 검사하는 기존 시험을 찾아 표지하고, 없으면 작은 시험을 더한다(derive-failures는 `derive.failures.test.ts`를 얻었다). 형 파일의 칸은 형이 "무엇의 일부인가"로 정한다 — 판정 출력 `DeriveTraceEntry`는 state가 아니라 decisions에 둔다. fractal DETAIL의 "이것만 의존" 목록은 helpers까지 빠짐없이 적는다." (`reviews/round-349-closing.md:10`)
  > 편집자 결정(350C-01): "【추론】 묶음 3 settle PR #395를 90527e29b로 squash 병합했다. settle의 organ은 층이 진 순서(아래에서 위로 type, declarations, latentStore, input, paths, errors, output, gates, latent, controls, loadValues, compute, scratch, dependencies, detached, dispose, pathIndex, derivation, commit, transition, settlement, write, structure, 자식 arrangeFieldNodeItems, 자식 loadFieldNodeAtMount, reset, context, index)를 지키며 역방향 간선은 없다. latentStore는 저장 기본 단위를 제공하고 분배와 복원은 latent가 한다. settle/utils/pathIndex는 pathStores(런타임 경로 키 저장소 접근자), settle/utils/paths는 templatePaths(배열 템플릿 경로)로 이름을 바꾸고 engine/utils의 pathIndex(색인 자료 구조)·paths(식 의존 경로)는 그대로 둔다." (`reviews/round-350-closing.md:8`)
  > 편집자 결정(350C-02): "【추론】 fractal을 자식으로 올릴 때 부모 DETAIL의 글머리를 통째로 옮기지 않는다. 자식 DETAIL은 자식 안에 구현이 있는 계약(내보냄과 자기 동작)만 적고, 부모에 구현이 남는 계약(arrangeFieldNodeItems의 경우 배치 안 동사·배치 끝 루트 한 번 정착·통째 교체 범위·UpdatePath 전달)은 부모 DETAIL에 남긴다. 계약 id의 표지는 시험이 있는 fractal의 DETAIL 절로 풀려야 하므로, 다른 fractal의 시험이 검사하는 절은 그 fractal의 DETAIL로 옮긴다(settle-disposal·settle-form-reset-errors는 write로)." (`reviews/round-350-closing.md:10`)
  > 편집자 결정(350C-03): "【추론】 기록만 하는 후속 셋: 패키지 전체에서 여러 시험 파일이 함께 쓰는 계약 id 여덟(array-slots, dispatch-observers, dispatch-report, factory-single-path 24파일, surface-members, validation-lifetime, validation-route 등)에 349C-02를 적용하는 일은 정돈 트랙의 다음 문서 PR로 미룬다; settle/utils/gates/type.ts는 organ 안 주제 칸의 형 파일이라 336라운드 7번(fractal 뿌리의 type.ts)의 대상이 아니지만 같은 모양으로 맞출지는 그때 함께 본다; `global-errors.timing.test.ts`의 40ms 임계는 부하 아래서 가끔 실패하므로(verifier 관찰 40.34ms) 속도 루프에서 측정 창과 임계를 다시 본다. 속도 계획과 bench 스크립트의 옛 경로 셋(compute/selectChildren.ts, latent/getLatentOrder.ts, write/registerRecalculation.ts)은 fairy08의 최종 경로 PR이 고친다." (`reviews/round-350-closing.md:12`)
  > 편집자 결정(351C-01): "【추론】 단계 가지 `feat/schema-form-08-review-and-perf`는 `1.0.0-beta`(42d63884d) 위에 제품 PR 열(#387~#396 가운데 코드 여섯, 문서 넷)과 원장 라운드 커밋이 쌓인 상태이며, 단계가 끝날 때 `1.0.0-beta`에 squash 병합해 원장 커밋을 접는다(330라운드). 소유자가 돌아와 할 일은 셋이다: 가지 리뷰, 결정 대기열 54~57의 판정(57은 패키지 CLAUDE.md 94행의 경로 한 줄), 속도 루프 시작(계획은 plan/perf-optimization, base는 이 가지, PR 단위는 대기열 56의 가결정). 후속은 350C-03의 셋이다. 두 작업자는 PR을 더 열지 않고 대기한다." (`reviews/round-351-closing.md:8`)
  > 편집자 결정(355C-02): "【추론】 P-04(템플릿 자식 순서 선형 탐색)는 2026-09-30 소유자 수용 행이므로 이차로 분류되더라도 다시 열지 않는다. 같은 꼴이 `distributeLatentValue.ts:47-48,108-110`에 있는 것은 대장의 새 행 P-138로 적고, 수용 범위에 드는지는 M3에서 소유자에게 묻는다. 대장의 상태 칸이 136j·136k 표의 소유자 수용(104·108·110·142·157라운드)과 어긋난 것은 fairy08의 상태 칸 동기화 문서 PR이 고친다." (`reviews/round-355-closing.md:10`)
  > 편집자 결정(355C-03): "【추론】 새 엔진 보유 경로 분류(P-07)는 benchmark-form의 heap-parse가 얕은 크기만 내어 M0에서 하지 못했다. P-07은 소유자 수용 행이고 L1이 쓰지 않는 수치이므로 병합을 막지 않고, 계획서 L3 첫 가설("힙 보유 경로 분류 뒤 노드 레코드 다이어트")에서 기존 스냅숏으로 한다. 이후 B2 메모리 게이트의 기준은 M0 값 Node 1,440 B/노드·Bun 2,110 B/노드다(03 기록 413·1,732보다 크며, P-07 상태는 그대로)." (`reviews/round-355-closing.md:12`)
  > 편집자 결정(355C-04): "【추론】 M1 우선순위표는 priority.md가 정본이다. 순서는 (0) P-25 같은 참조 위반(결함, 필수) → (1) G8 배열 push 길이 비용 → (2) oneOf 영향 게이트 O(B)(옛 판 대비 core 갱신 5.92·7.07·9.44배, 마운트 3.26·3.58·4.28배) → (3) 배열 렌더 갱신 → (4) 평면·중첩 렌더 갱신 → (5) 잎 쓰기 고정비 → (6) 마운트 상수 → (7) P-09 → (8) P-08 → 코어 전용 묶음이며, 런타임 차이(P-06·11·12·15)는 코드 작업 없이 수용 후보다. 첫 PR(L1)은 0·1·2·3·7이고 M0·M1을 한 PR에 담아 게이트 한 번을 아꼈다. 소유자 확인은 대기열 55의 가결정대로 기다리지 않는다. 옛 판 대비 회귀는 core 38행 중 29행·render 114행 중 27행이며 배열 마운트와 flat 갱신은 새 판이 빠르다." (`reviews/round-355-closing.md:14`)
  > 편집자 결정(360C-03): "【추론】 356라운드의 대기열 56(PR당 수용 가설 4~5개)에 대해 L1은 도구·dist 재측정·가설 0 하나만 담는 예외다. 가설 3(배열 렌더 갱신)은 dist 재측정에서 P-79·80·96이 새 판이 빠른 것으로 나와 작업 없이 해소한다(R-24)." (`reviews/round-360-closing.md:12`)
  > 편집자 결정(360C-04): "【추론】 standalone Node 18C 행이 dist에서 src보다 2~3.5배 느린 것(Bun은 같음)은 원인 미분리로 대장 P-139에 적고, L2에서 H10(JSON.stringify 없는 키 생성) 다음으로 본다. oneOf 게이트(가설 2)는 dist 수치로 다시 판정하며 작은 후보는 폐기, 프로파일이 퍼져(selectChildren 16%) 묶음 단위로 L2에서 다룬다." (`reviews/round-360-closing.md:14`)
  > 편집자 결정(371C-04): "【추론】 L1b PR은 가설 0 뒤의 수용 가설을 모았다: push 덧붙임, 가설 7 children 유지(P-09 8천 12% 감소, 형제 비례 시간은 재계산이 아니라 부모의 고정 횟수 훑기라 SETTLE-017 안), 스냅숏 사본 상수, pop·끝 자리 remove, insert 추가, remove·insert의 원본 트리 생략·접두 몫 제거·정적 폼 꼬리 재계산 생략·꼬리만 재공표, clear의 경로 저장소 접두 일괄 제거·소멸 마무리 일괄·떼어진 읽기 자리 읽기(NODE-044 불변). 통째 setValue 접두 증명은 조건 다섯(같은 참조 자리의 분배·재계산·재공표만 생략, 로드의 스냅숏 setIn·상태 비움·채움 판정은 그대로, D-4대로 종류를 값으로 추론하지 않음, 정적 폼만, NODE-051 대상 다섯 × 세 경우 완전 동치 차등)으로 L2에 둔다. L2 첫 묶음은 "잦은 쓰기 경로의 비효율"(367라운드): fairy08 분류표대로 객체 통째 setValue가 키 하나 바뀌어도 호스트를 형상 dirty로 만들고 같은 값의 잎도 dirty로 만드는 것(push와 가장 가까운 꼴), 잎 쓰기 조상 사슬의 깊은 비교, 잠복 원본 색인 재구성, 불일치 메모 정렬, 감시자 전체 후보, 그리고 remove·insert·clear에 남은 노드당 상수(꼬리 배달 기록, 경로 저장소 재매김, 선택 재공표, 소멸 배달 정리, 떼어진 읽기 포착의 나머지, 아이템마다 조회). H10과 P-139는 L2 둘째 묶음이다. 결정 대기열 58(소유자): 호스트 재선택의 primeHost 훑기나 확인용 둘째 바퀴 제거는 정착 단계 순서(SETTLE-001)와 게이트 전부 재평가(BLUEPRINT-007)에 닿는다. NODE-051 본문이 객체 setValue를 "로드"라고 적어 WRITE-090과 어긋나는 것은 원장 정리감으로 적는다." (`reviews/round-371-closing.md:14`)
  > 편집자 결정(372C-03): "【추론】 370라운드 기준으로 폐기하고 기록만 한 것: clear 뒤 소멸 항목마다의 중복 조회(지우는 비효율 약 90 µs 대 새 칸과 전달 12~14줄, 안전 근거가 실측뿐), 조상 깊은 비교(넓은 중첩 장면에서 몫 1% 미만), 잠복 색인 캐시(5%), 잎 간선 게이트 읽기 flush 건너뛰기(지연 flush 동치 판정 불가), 게이트 목록·relocated 캐시(몫 대비 코드 큼), next 쓰기 시 복사·바뀌지 않는 루트 합성 2회(판정 불가). 다음 묶음 첫 후보: all-keys의 두 번 해석·비교(해석 값 전달, 5~8줄), primeHost의 pendingExits 빈 가드(3줄), remove·insert·clear에 남은 노드당 상수(계약이 요구하는 일인지만). 소유자 판단 항목(대기열 58 옆): 게이트 호스트의 확인용 둘째 바퀴(58), 루트 재선택에서 비게이트 항목 건너뛰기(삽입 순서·공유 이름·통째 입력 처리), active만 읽는 의존의 자식 재계산. H10(JSON.stringify 없는 키 생성; oneOf-20의 selectChildren.ts:206 비활성 항목마다 JSON 키 생성이 첫 대상)과 P-139(dist 이상)는 L2 둘째 묶음이다." (`reviews/round-372-closing.md:12`)
  > 편집자 결정(446C-01): "【추론】 소유자가 8단계 이후 작업을 명시적으로 허용했다(위 5행). 따라서 443C-01의 "8단계가 코어 로직 수정의 마지막 단계"와 `reviews/README.md` 운영 원칙 21의 앞 절("9단계에는 코어 로직 수정이 없고")은 이 라운드로 대체된다: 8단계 뒤, 9단계 앞에 **설계 최적화** 단계를 둔다. 9단계의 범위(문서 정리, 레거시 디렉터리 제거, 타입 보강, 릴리스 전 벤치 재실행, 릴리스 전환 시점)는 그대로이고 9단계 자체에는 코어 로직 수정이 없다. 계획서는 PROCESS-067대로 `plan/design-optimization/`의 문서 셋(`request.md`·`verification.md`·`adr-and-axes.md`)이며, 이 단계는 성능 최적화 작업(`plan/perf-optimization/`)의 게이트·측정 원칙·채택 규칙을 그대로 물려받고 "결정을 바꿔야 빨라지면 설계 변경이고 라운드가 먼저다"라는 그 계획의 전제만 바꾼다 — 설계 변경은 이 단계의 목적이며, 바뀌는 결정은 코드보다 먼저 라운드 항목으로 들어간다. 가지는 `feat/schema-form-design-optimization`이고 최종 PR #445가 병합되지 않았으므로 8단계 가지 `feat/schema-form-08-review-and-perf`의 끝 `6692e7f69` 위에 쌓으며, 이 단계의 PR은 그 가지를 base로 열고 #445가 `1.0.0-beta`로 병합되면 base를 `1.0.0-beta`로 옮긴다. 가설이나 작업 하나에 PR 하나, DETAIL 커밋이 코드보다 먼저, 네 관문·전후 배달 비교 차이 0·수정 전에 실패하는 새 시험·다른 모델 가족의 독립 검토 뒤 병합, 단계 루트 PR의 병합은 소유자 몫이라는 규칙은 그대로다." (`reviews/round-446-closing.md:8`)
  > 편집자 결정(446C-03): "【추론】 소유자가 청사진 재사용은 완전히 같은 스키마일 때만 뜻이 있고 직렬화 키는 낭비이므로 객체 주소를 키로 하라고 했다(위 2행). 이는 438라운드 소유자 조건 "스키마가 동일할때만 재사용, 스키마가 달라지면 청사진 재구성"을 객체 identity로 충족하며, 438C-03과 443C-01의 "청사진 재생성 유지"는 이 라운드로 대체된다. 엔진에는 이미 `blueprint(schema, options)`의 `options.cache`(`WeakMap<object, BlueprintCacheEntry[]>`, 스키마 객체 참조로 찾고 `isTerminal`·`isAtomic` 술어 identity가 같은 항목만 재사용, `src/core/engine/blueprint/types/blueprint.ts:110`)가 있고 `buildFieldNodeTree.ts:41`이 캐시 없이 부른다. 그러므로 core를 바꾸지 않고 Form 바인딩(`providers/RootNodeContext/utils/createRootLoad.ts`)이 캐시를 넘긴다 — core는 app을 import하지 않는다(`src/core/INTENT.md`). 항목 계약 하나만 바뀐다: 항목이 `warningsCollected` 불리언 대신 청사진 경고 목록을 보관해 새 소비자의 `collect`마다 재생한다(같은 스키마로 띄운 둘째 폼도 경고를 받는다). 첫 마운트 비용은 그대로이고 같은 스키마 객체의 재마운트·StrictMode 이중 마운트·여러 폼에서만 청사진 몫(첫 렌더의 약 43 %)이 사라진다. 소비자가 스키마 객체를 변형한 뒤 재마운트하는 경우는 청사진이 "작성 스키마를 변형하지 않는다"는 전제 밖이며, 그 경우의 강제 갱신은 446C-04의 폼 핸들 `rebuild`가 맡는다." (`reviews/round-446-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:44`(정본, 반영 칸), `reviews/round-18-owner-answers.md:45`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:44`, `reviews/round-18-owner-answers.md:45`

### LANDING-205 `src/__legacy__/`는 정리·릴리스 PR(PR-8)까지 참고용으로 보존 — PR-7은 진입점 전환과 레거시 import 0 점검만, 삭제는 PR-8, 우산에 딸린 무관한 파일은 정리하지 않음

- 결정:
  > `src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다.
  > PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검한다.
  > 디렉토리 삭제는 PR-8이 한다.
  > 우산 브랜치에 딸려 들어온 무관한 파일(`.seiri/.gitignore`, 벤치 결과)은 정리하지 않는다.
- 보충:
  > 소유자(개발계획 P2): "레거시는 마지막까지 보존. 참고용." (`reviews/round-18-owner-answers.md:43`)
  > 소유자(개발계획 P2): "무관한 커밋을 굳이 정리할 필욘 없어." (`reviews/round-18-owner-answers.md:43`)
  > 편집자 결정(71C-01): "【추론】 LANDING-087의 "지운다"는 새 엔진의 `core/types`에서 노드 형 묶음이 사라진다는 뜻이고, LANDING-205는 레거시를 PR-8까지 참고용으로 보존하되 그 안에 두면 tsc·eslint가 설정 변경 없이 따라간다고 했으므로(LANDING-159) 레거시는 전환 뒤에도 컴파일되어야 한다. 둘을 함께 지키는 길은 LANDING-159가 정한 옮김의 모양 그대로다: `src/core/types/node.ts`·`constructor.ts`의 내용을 `src/__legacy__/core/types/`에 같은 상대 경로로 두고(그 안의 `index.ts`가 이름으로 다시 내보냄), 레거시 파일의 가져오기는 별칭 접두만 바꾼다(`@/schema-form/core/types` → `@/schema-form/__legacy__/core/types`, 상대 경로 가져오기는 레거시 안의 묶음을 가리키도록 고침). 70C-01이 `contextNodeFactory`를 옛 엔진과 함께 레거시로 보낸 것과 같은 처분이다. 레거시가 계속 가져오는 `event`·`state`·`value` 형은 오늘 레거시가 이미 `core/types`에서 가져오던 것이고 형 전용이므로 규칙 2("레거시 → 새 코드는 08 §17.2가 이미 적은 곳만")의 허용 목록을 넓히지 않는다 — 다만 07은 그 형들의 뜻이 새 엔진에서 바뀌었다면(예: 상태 비트의 이름) 레거시 쪽 사본을 `src/__legacy__/core/types/`에 함께 두어 레거시가 새 형에 끌려가지 않게 한다. 새 fractal이 `__legacy__`를 가져오지 않는 규칙 1과 "새 코드가 레거시를 가리키는 import 0" 점검(LANDING-205)은 그대로이고, 옮긴 두 파일은 처분표(68C-01)와 이주 점검표(68C-02)가 아니라 `plan/07-switch/log.md`의 레거시 이동 목록에 적는다." (`reviews/round-71-closing.md:9`)
  > 편집자 결정(73C-01): "【추론】 LANDING-159는 "09 §4.3의 처분은 파일마다 한다"고 했고, LANDING-205를 적용한 보충은 "PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다"고 정했다. 레거시 안의 `<Form>` 렌더 시험 둘은 옛 엔진을 `<Form>`으로 시험한 것이라 전환 뒤에는 뜻을 잃으므로 같은 처분(글롭에서 뺌)을 받고, 동시에 렌더 시나리오이므로 그 사례(14건)는 처분표(68C-01)에 추가 행으로 올라 09 §4.3의 처분을 받는다 — 시나리오별로 이주 행(`if`·`then`·`else`의 게이트 이주, nullable의 `type` 배열 이주 등)과 대조해 조합·옛 키가 있으면 "버리고 새로 쓴다"(새 e2e로 옮김, 새 시험 이름을 행에 적음), 없으면 TEST-005의 "표면만 고친다"로 단언을 살린다. 레거시 파일은 LANDING-205대로 고치지 않는다(사례만 지우는 것도 레거시 수정이며, 참고용 보존의 뜻에 어긋난다). 전환 커밋(진입점을 새 엔진으로 바꾸는 커밋)에서 render·unit 프로젝트의 포함 글롭에서 `src/__legacy__/**`를 빼고, 그 변경을 처분표의 머리에 "레거시 시험 N파일 M건은 LANDING-159 보충대로 글롭에서 뺌; 그 가운데 `<Form>` 렌더 사례 14건은 아래 행으로 처분"이라고 적는다. 두 파일만 빼는 대안을 쓰지 않는 까닭은 뺄 단위가 파일 둘이 아니라 레거시 전체이기 때문이고, 07의 권장을 그대로 쓰지 않는 까닭은 레거시 파일을 고치기 때문이다. 처분표에 행이 있고 새 e2e의 이름이 적히므로 붉은 시험을 숨기는 것이 아니다; 글롭에서 뺀 레거시의 시험이 PR-8 전까지 돌지 않는 것은 LANDING-159 보충이 받아들인 상태다." (`reviews/round-73-closing.md:9`)
  > 소유자(74라운드, 레거시의 완전 분리): "예. 완전히 분리하세요. 저는 사실 패키지 레벨에서 분리를 할거라고 생각했는데, 이정도만 분리해도 괜찮겠네요" (`reviews/round-74-owner-answers.md:7`) — 보존되는 레거시는 완전히 고립된 디렉토리다 — 새 코드 → 레거시 import 0(기존 점검)에 레거시 → 새 코드 import 0을 더해 PR-7이 둘 다 점검한다. 별도 패키지로 가르지는 않는다(원장 관리자, 2026-10-02).
  > 편집자 결정(75C-01): "【추론】 LANDING-205가 보존하는 것은 "참고용 옛 구현"이고, 74라운드 소유자 답은 레거시가 새 코드를 하나도 가져오지 않는 완전 고립을 정했다. 두 시험 파일은 옛 노드·파서를 직접 부르지 않고 공개 진입점 `@/schema-form`의 `<Form>`을 그려 단언하므로 그 뜻은 "공개 폼의 동작"이지 "옛 구현"이 아니며, 전환 뒤에는 새 `<Form>`을 옛 기대로 단언하는 모순된 파일이 된다. 옛 렌더 계층을 레거시에 복제해 이 둘을 살리는 것은 소유자 답의 "코드 복사본이 있어도 분리"의 뜻(필요한 조각의 사본)을 넘어 옛 `<Form>` 전체를 둘로 만드는 일이라 택하지 않고, ESLint 규칙에서 둘만 빼는 예외는 소유자가 "완전히 분리하세요"라고 한 것과 어긋나므로 두지 않는다. 그러므로 73C-01의 처분 가운데 (1)은 그대로 — 사례 14건은 처분표 추가 행으로 올려 이주 행과 대조해 새 e2e로 옮기고 새 시험 이름을 행에 적는다 — 이고, (2) "레거시 파일은 고치지 않는다"는 옛 구현과 그것을 직접 시험하는 파일로 좁혀지며, 공개 진입점만 가리키는 이 두 파일은 사례의 행방이 처분표에 적힌 뒤 레거시에서 지운다. 옛 동작의 참고가 필요하면 전환 직전 커밋(07 U1의 기준선 커밋)에 그대로 있다. 73C-01의 (3) 글롭에서 레거시 전체를 빼는 것은 그대로다. 같은 기준으로 레거시 안에 공개 진입점만 가져오는 다른 파일이 더 있으면(스토리·시험) 같은 처분을 하고 `plan/07-switch/log.md`의 레거시 이동 목록에 "지움(공개 겉면의 시험, 사례는 처분표 행 N)"으로 적는다." (`reviews/round-75-closing.md:9`)
  > 편집자 결정(75C-01): "【추론】 이주 안내의 정식 자리는 PR-8의 "이주 안내와 이주 프롬프트(`docs/agents`)"(LANDING-068)다. 07은 그 재료를 이주 점검표(68C-02, `verification/07-switch/migration-check.md`)에 적는다 — 호환 별칭 `JSONSchemaError`의 종료(34C-02·50C-01, 74라운드)는 그 표에 "공개 표면 잔여의 거취" 행으로 한 줄이면 족하고, PR-8이 그 표의 행들을 소비자용 이주 안내로 옮겨 쓴다. `isJSONSchemaError`가 별칭이 아니라 오류 분류의 throw 클래스 `JSONSchemaError`의 판별 함수라 남는 것은 맞다(ERROR 영역의 클래스이지 LANDING-024 이주 21의 인터페이스가 아니다)." (`reviews/round-75-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:43`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:43`

### LANDING-206 UI 플러그인 넷의 이주는 플러그인 PR(우산 순서 N+1) — `presentation.*` 이주·자사 플러그인 수정 목록·union 항목, PR-7은 기본 입력으로 검증, ajv 셋은 원장대로 PR-4, 이주 표와 이주 점검은 PR-7에 남음

- 결정:
  > ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로).
  > UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다.
  > PR-7은 기본 입력으로 검증한다.
  > 이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다.
- 보충:
  > 소유자(개발계획 P1): "0에서 ajv 플러그인은 먼저 전부 수정하고 가자. 별로 크게 달라질건 없잖아?" (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(68C-02): "【추론】 이주 표는 LANDING-004–050("이주 1"–"이주 47")과 그 뒤 "이주(05)"·"이주(S1)"·"이주(18라운드)"·"이주(19라운드)" 머리를 단 행(LANDING-115–208 사이)으로 흩어져 있고, 18C-87이 정한 이주 점검은 "이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조"이므로 대상은 현행 상태의 이주 행 전부다. LANDING-206이 "이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다"고 적은 것은 같은 답에서 08로 옮긴 셋(`presentation.*` 이주·자사 플러그인 수정 목록·플러그인마다의 union 항목)과 헷갈릴 수 있는 union 이주 행이 PR-7에 남음을 밝힌 것이지 점검 범위를 여섯 행으로 줄인 것이 아니다. 07은 `### LANDING-nnn 이주` 머리를 기계로 뽑아 행마다 (가) 렌더 또는 e2e 시험으로 오늘과 새 동작을 대조(시험 이름), (나) 렌더와 무관해 02–06의 코어 시험이 이미 덮음(그 시험 이름 인용; 인용 없는 (나)는 받지 않는다), (다) 08(플러그인)·09(정리·릴리스)의 몫 가운데 하나를 적은 점검표를 `verification/07-switch/`에 두고, 그 표가 PR-7의 이주 점검 게이트다. 상태가 "폐기"·"분할됨"·"대체됨"인 이주 행은 표에 넣되 처분은 "현행 아님"으로 적는다." (`reviews/round-68-closing.md:16`)
  > 편집자 결정(68C-07): "【추론】 `verification.md`의 게이트 "UI 플러그인 넷의 `build`(타입 검사 포함)가 초록"과 LANDING-206의 "자사 플러그인 수정 목록은 플러그인 PR이 한다"는 이렇게 맞물린다: 공개 형의 변경(`type`에서 `'integer'`가 빠짐, `FormTypeTestObject.type`의 형, `FormTypeRenderer` → `FormTypeGroupRenderer`, `node.group` → `node.strategy`)으로 플러그인 소스가 컴파일되지 않는 줄은 07이 고치되, 컴파일 오류를 없애는 데 필요한 최소(이름 바꿈, 비교식의 형 맞춤, 빠진 타입 가져오기)만 하고 그 줄의 목록을 `plan/07-switch/log.md`와 PR 본문에 적는다. 그 밖의 플러그인 동작 변경(수 입력의 빈 칸 `undefined`, `presentation.*` 이주, union 항목)은 08의 목록에 넘기고 07은 기본 입력으로 검증한다. 07이 고친 줄이 동작을 바꾸는지 가를 때는 "같은 입력에서 플러그인의 렌더 결과와 방출 값이 같은가"를 기준으로 하며, 바뀌면 그 줄은 08로 넘기고 07은 컴파일만 통과하도록 가장 좁게 고친다." (`reviews/round-68-closing.md:51`)
  > 소유자(130라운드, 7단계 뒤의 순서): "7단계 - 나의 이해와 인터페이스 확정, 내부 코드 스타일링 - 성능개선 / 플러그인 개편 - 문서 정리, 레거시 코드 제거 - 실제 배포 이 순서로 하자. 7단계가 끝나고 머지가 되면 본격적으로 내가 핸들링 해야겠구나" (`reviews/round-130-owner-answers.md:7`) — 07 병합 뒤 소유자가 직접 다루는 인터페이스 확정·코드 스타일링 단계를 두고, 08의 의존은 그 단계로 바뀐다(원장 관리자, 2026-10-09).
  > 소유자(132라운드, 7단계 마무리의 운영): "좋아. 그럼 fixy와 다시 쭉 이어서 작업해줘. 내가 결정할 사항이 없다면 가능하면 자체적으로 수정하면서 pr 생성까지 도달했으면 좋겠고, CLAUED.md 등 내 허가가 필요한 사항이나 내 결정이 필요한 사항은 반드시 그걸 지금 해야하는게 아니라면 다른 작업을 우선하고, 마지막에 나에게 한번에 질의하도록. 쭉 이어서 작업했으면 한다." (`reviews/round-132-owner-answers.md:7`) — 소유자 결정이 없는 한 PR 생성까지 자체 진행하고, 허가·결정 사항은 `reviews/owner-queue-07.md`에 모아 PR 시점에 한 번에 묻는다(원장 관리자, 2026-10-09).
  > 소유자(331라운드, 08 플러그인 완료 처리, 소유자 리뷰 항목 하나씩): "그래 ui 플러그인 완료로 바꾸는 정도면 되겠네. \n난 또 맘에 안드는걸 좀 발견했어. \n\n작업 준비해. 하나씩 이야기할게" (`reviews/round-331-owner-answers.md:7`)
  > 편집자 결정(444C-13): "【추론】 LANDING-206·LANDING-198 의 "플러그인마다의 union 항목" 은 소유자 결정으로 보류한다: 사용자 요구가 생길 때까지 union 칸은 코어 내장 `FieldInputUnion` 이 맡고, 플러그인은 union 정의를 두지 않으며, `interpretFieldNodeDraft` 는 내보내지 않는다(REACT-033 "규칙 A를 미리 보는 공개 함수는 지금 내보내지 않으며" 그대로). 요구가 생기면 네 플러그인에 규칙을 복사하는 대신 코어가 headless union 바인딩을 공개하는 설계부터 한다(위 답변 표 21–23행)." (`reviews/round-444-closing.md:54`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:42`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:42`

### LANDING-207 이주(19라운드) — 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 object variant 호스트, `Optional[Self]`는 `RECURSIVE_SHAPE_UNBOUNDED`

- 결정:
  > 【추론】 이주(LANDING-207): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 object variant 호스트다.
  > 【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:26-27`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31`

### LANDING-208 이주(19라운드) — `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 리터럴 종류의 원시 잎

- 결정:
  > 【추론】 이주(LANDING-208): `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 리터럴 종류의 원시 잎이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:45`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:48`


### LANDING-209 이주(80라운드) — 폼 핸들 명령 넷(`focus`·`select`·`refresh`·`remount`)의 경로는 선택 인자(없으면 루트), `focus`·`select`의 필수 경로가 선택으로, `refresh`·`remount` 추가

- 결정:
  > 【추론】 이주(LANDING-209): `FormHandle.focus(path)`·`select(path)`는 오늘 경로가 필수이고 `refresh`·`remount`는 없으며, 새 설계에서는 명령 넷(`focus`·`select`·`refresh`·`remount`)이 모두 경로를 선택 인자로 받고 경로가 없으면 루트 노드를 가리키며 경로가 있으면 그 노드를 찾아 명령 메서드를 부르고 노드가 없으면 아무것도 하지 않는다(30라운드 소유자 답, EVENT-063).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-80-closing.md:9`(정본)
- 닫은 사람: 편집자 결정(80라운드, `reviews/round-80-closing.md` 80C-01)
- 라운드: 80
- 까닭: `reviews/round-80-closing.md:11`

### LANDING-210 이주(80라운드) — 공개 표면의 배열(`FormProps.errors`·`onValidate` 인자, `FormHandle.getErrors`·`validate`·`findNodes` 반환, `errorMatrix` 안 배열)은 `readonly`

- 결정:
  > 【추론】 이주(LANDING-210): 공개 표면의 배열(`FormProps.errors`와 `onValidate`의 인자, `FormHandle.getErrors()`·`validate()`·`findNodes()`의 반환, `useChildNodeErrors`의 `errorMatrix` 안 배열)은 오늘 변경 가능한 배열 형이고, 새 설계에서는 `readonly` 배열이다 — 돌려준 배열은 코어가 같은 값을 같은 참조로 드는 것이라 소비자가 제자리에서 고치면 안 되며, 받는 배열은 `readonly`가 더 넓은 형이라 오늘의 호출이 그대로 컴파일된다; 옛 배열을 제자리에서 고치거나 변경 가능한 형에 대입하던 소비자는 형 오류를 보며 복사(`[...arr]`)로 고친다.
- 보충:
  > 소유자(230라운드, 대기열 22 onValidate 두 번): "그대로 둬. 아마 그거 프로덕션 리엑트에서는 1번만 나가지않아? 그랬던거같은데" (`reviews/round-230-owner-answers.md:11`)
  > 소유자(232라운드, 대기열 22 onValidate 두 번): "그럼 한번으로 줄이는게 낫지 않을까? 두번 호출되는게 구조적으로 필수적인지 검토해봐" (`reviews/round-232-owner-answers.md:9`)
  > 소유자(234라운드, 대기열 22 onValidate 두 번): "b안 적용" (`reviews/round-234-owner-answers.md:7`)
  > 소유자(243라운드, 대기열 32): "대기열32는 무슨 소리야? 리셋 하면 이전 에러가 남으면 안 되지 않을까..?? 무슨 오류상황이지" (`reviews/round-243-owner-answers.md:8`)
  > 소유자(243라운드, 대기열 32 결정): "응 그렇게 해줘 reset 을 할때 한번 다시 확인하도록. 무슨 상황인지는 알겠는데 onRequest 모드에서도 reset 할때 초기화는 해줘야할거같구나" (`reviews/round-243-owner-answers.md:14`)
  > 편집자 결정(245C-01): "【추론】 소유자가 234라운드에서 대기열 22에 고른 B안("합산이 바뀔 때만 통지")과 243C-01(reset 때 빈 목록을 한 번 통지)은 같은 규칙의 두 면이고, (가)는 그 규칙을 한 문장으로 만든다. Form/type.ts의 JSDoc("결과가 목록을 바꿀 때 호출")과도 맞는다. 잃는 호출 둘은 모두 소비자가 이미 `[]`를 받은 뒤의 반복이며, validate()는 반환값으로 결과를 돌려주므로 정보 손실이 없다. (나)는 OnChange의 비동기 검증 때문에 reset 구간을 따로 정의해야 해 설계가 커진다." (`reviews/round-245-closing.md:9`)
  > 편집자 결정(246C-01): "【추론】 245C-01의 규칙("보고된 목록이 바뀔 때만")을 구현이 절반만 따른 것이고, 소유자가 대기열 22에서 바란 것은 같은 결과의 중복 호출을 없애는 것이다. 참조 비교 한 줄이 규칙을 그대로 코드로 옮기며, 바뀌는 관찰 가능 동작은 errors prop 마운트의 중복 호출 하나뿐이다." (`reviews/round-246-closing.md:9`)
  > 소유자(247라운드, 다음 순서): "마무리 되면 pr 들 정리하고 다음 작업으로 갈 준비 하거라.\n\n지금까지 상황을 알려다오" (`reviews/round-247-owner-answers.md:7`)
  > 소유자(248라운드, #362 병합): "내가 명시적으로 허가한다. 병합해도 된다" (`reviews/round-248-owner-answers.md:7`)
  > 편집자 결정(249C-01): "【추론】 소유자 허가(248라운드)가 있었고 재검증 게이트가 모두 통과했으므로 병합했다. 남은 PR 둘은 서로 독립이라 동시에 진행한다." (`reviews/round-249-closing.md:9`)
  > 편집자 결정(251C-01): "【추론】 문서 사이트 PR은 코드 패키지를 건드리지 않고(47파일 모두 documents/), 빌드와 옛 이름 grep이 깨끗하며 실제 창 확인이 fairy07 쪽에서 끝났으므로 병합 조건을 채웠다." (`reviews/round-251-closing.md:9`)
  > 소유자(252라운드, #361 병합): "내가 명시적으로 허가한다. 병합해도 된다" (`reviews/round-252-owner-answers.md:7`)
  > 편집자 결정(253C-01): "【추론】 변경이 수동 시험 패키지에 한정되고 세 게이트(tsc -b·lint·build)가 통과했으며, 렌더 전후 차이가 모두 "모든 분기 동시 활성"에서 "활성 분기만"으로 바뀐 의도된 방향이므로 병합 조건을 채웠다. 내장 checkbox의 id 중복은 schema-form 쪽 결함 후보라 소유자 대기열로 올린다." (`reviews/round-253-closing.md:9`)
  > 소유자(254라운드, #363 병합): "응 병합하자" (`reviews/round-254-owner-answers.md:7`)
  > 편집자 결정(255C-01): "【추론】 대기열 15의 원래 커맨드는 stage-07 워크트리와 07b-1 가지가 있던 때의 것이라, 지금 상태(워크트리 자동 정리, 메인 checkout 두 커밋 뒤)에 맞게 바꿨다. 소유자가 자기 터미널에서 실행한다." (`reviews/round-255-closing.md:9`)
  > 소유자(256라운드, 대기열 열한 개): "1~5 전부 권고대로 승인. 나머지는 확인했음.\n\n다만, \"스팩\"과 \"동작\"이 달라질 수 있는 부분은 한번 더 설명 요구" (`reviews/round-256-owner-answers.md:7`)
  > 소유자(256라운드, 설명 확인): "오케이 문제 없다. 그럼 구조변경을 위한 모든 준비가 끝난건가?" (`reviews/round-256-owner-answers.md:13`)
  > 소유자(257라운드, 시작·구현 주체): "그래 바로 시작하자. \n이번에 한해서는 codex 위임 없이 claude 로 하도록 해. 좀 느리거든" (`reviews/round-257-owner-answers.md:7`)
  > 편집자 결정(261C-01): "【추론】 소유자가 "핵심 시스템 구성 이름을 다 바꾸고 가고 싶다"고 했으므로 옛 낱말이 남은 것(1), 새 어휘와 섞이는 것(2·11), 한 이름이 여러 뜻인 것(3·7·8·9), 뜻을 말하지 않는 것(4·5·6)을 후보로 올리고, 뜻이 읽히는 이름(14·15)과 작성 API(12)는 유지를 권한다." (`reviews/round-261-closing.md:27`)
  > 편집자 결정(262C-01): "【추론】 범위가 승인된 36·37과 그 주변 문서에 한정되고 게이트가 모두 통과했으며, 런타임 변경 둘은 고치기 전 실패하는 시험을 동반한다." (`reviews/round-262-closing.md:9`)
  > 소유자(263라운드, #364 병합): "내가 명시적으로 허가한다. 병합해도 된다." (`reviews/round-263-owner-answers.md:7`)
  > 소유자(264라운드, 후보 15): "나머지는 권고대로.\n\n2. 이건 명확하게, 현재 노드의 자식 노드라는 의미라, ChildFieldNodes 가 맞긴 한데, 너무 길어지지 않겠나? 어떻게 바꾸는걸 고려하는가?\n\n12. 지당한 지적이다. 변경을 할 수 있겠나? 근데 마땅한 이름이 없어서 이렇게 하긴 했는데... 추천해보거라. 원장에도 고민의 흔적이 있을거다. \n\n13. 공개해야지. 그리고 이건 options 보단 presentation 에 있어야 할 수도 있다. propertyKeyOrder 이런 이름이 더 적절하려나? 그리고 이건 object 타입 노드에만 존재해야 하는거고... \n\n14. 그말은 지당하다. 그래서 form 외부에 jsonSchema 같은 곳에서는 virtual 같은 키가 노출되지 않기를 바란다. 실제로 object 타입 노드의 특수 키로 정의하는 구조일 것이라. \n\n추가로 jsonSchema 에서도 jsonSchema 공식 문법이 아닌 form 전용 키들은 options / controls / presentation 같은 객체 내부로 이동했다. \n혹시 남은 잔여 설정이 있지는 않은가? \n예컨대 object 타입에서 virtual 은 이제 어떻게 선언하게 되는가?" (`reviews/round-264-owner-answers.md:7`)
  > 소유자(265라운드, 2·12·13·14·nullable): "11, 12 제안대로.  13은 나머지는 모두 수용, 필드 이름만 한번 더 고민을 해줘. propertyOrder 같이 하거나 할 수는 없나? 너무 안예쁘군. \n\nnullable: true 는 수용, 14번 전부 제안대로." (`reviews/round-265-owner-answers.md:7`)
  > 소유자(265라운드, 다음 단계 확인): "그래 다 끝나면 알려줘. \n그 다음 구조변경을 하는거지?\n답은 내가 다 해줬으니 그대로 할 수 있나?" (`reviews/round-265-owner-answers.md:32`)
  > 소유자(266라운드, 관찰 1·2·3): "1. 스토리북의 docs 에서 jsonSchema 가 순환참조 오류로 직렬화 실패. 화면이 깨져서 표시됨. 리엑트 노드나 컴포넌트나 함수 등에 의한 이유로 추정, 산발적으로 재현되는 듯. 확인요청. http://localhost:6006/?path=/docs/features-derivation-contextreference--docs \ncomposite 쪽 스토리들이 전부 그런듯.\n\n2. http://localhost:6006/?path=/story/features-composition-nullablebranch--null-ancestor-promotion \n\n\n<pasted_content id=\"f11b\">\nnullable.object-null-branch: LANDING-139 null descendants are unfilled; LANDING-004 explicit activation.\n\n\n</pasted_content id=\"f11b\">\n\n 이슈에서, \n값은 {\"account\":null}, 스키마도 정상이나, form 에는 account.kind [a] 로 표시됨. 이때, kind 의 defualt 는 a 가 맞음. 이 부분이 설계상 정상인가? 화면에 보이는 것과 실제 값이 다르니 나조차 햇갈린다. 이건 null로 선언된 부모객체를 자식객체의 자동채움이 해제할 수 없다는 것 때문에 발생한 문제같은데, 만약 그렇다면 자식 노드의 값도 최소한 비어있어야 하지 않나 싶음. 정말 햇갈림 \n\n3. 스토리들의 가독성이 상당이 낮음. 어떤 동작을 해야할지, 어떤게 옳은 값일지, 현재 오류가 무엇인지 등을 전혀 알 수 없음. 이것은 레거시 스토리를 참고해서 설명과 재현, 그리고 현재값과 기본값, error, 스키마, 그리고 스토리별 설정정보를 페이지 내에 수록해주었으면 함. 지금은 어떤 테스트인지, 어떤게 정상동작인지 등을 파악하기 어려움. 다른것도 마찬가지이나 composite 쪽이 특히 그렇다." (`reviews/round-266-owner-answers.md:7`)
  > 소유자(266라운드, 순서 확정): "그 순서로 진행해. 구조변경은 이걸 또 다 하고 해야할까?" (`reviews/round-266-owner-answers.md:17`)
  > 소유자(266라운드, enum undefined 표시): "오케이. 그리고, 하나 추가하자.\nhttp://localhost:6006/?path=/story/composite-cx03profile--case 이거 보다가 나온건데, \nstring enum 같은거 할때 enum selector 를 쓰는 country 필드에서 KR / US  이거 표시할때, 최초에 값이 없는데 KR이 선택된걸로 보이거든. \n이거 이전에 enum에 없는 값(undefined 포함)인 경우에 이걸 임시로 보여주기로 했던거같은데, undefined 는 해당사항이 아닌가" (`reviews/round-266-owner-answers.md:21`)
  > 소유자(267라운드, 진행 방식): "이정도면 된거같아. \n이번에도 마찬가지로 PR 머지하면서 진행해줘.\n구조정리 및 내가 추가로 요청한거까지 전부 마무리했으면 한다. \n내 결정이 필요한건 대기열에 추가하고, 이후 한번에 처리할 수 있도록 해줘.\n이후 한번에 볼게.\n\n지금부턴 중지없이 쭉 진행했으면 해. \n\n괜찮겠어?\n괜찮겠으면 이후 계획을 한번 브리핑해줘." (`reviews/round-267-owner-answers.md:7`)
  > 소유자(267라운드, 게이트 실패·병합 허용): "게이트 통과 실패하는 경우도 문제를 파악해서 수정해보도록해. \n정 안되면 그때 나에게 대기로 넘기도록. \n병합도 직접 하도록 해.\n병합을 할 수 있도록 명시적으로 허용할게" (`reviews/round-267-owner-answers.md:23`)
  > 소유자(267라운드, 병합은 보고만): "병합도 보고만 하고 직접 병합하도록." (`reviews/round-267-owner-answers.md:27`)
  > 소유자(268라운드, 멀티에이전트 재개): "지금부터는 codex 와 agy 를 사용한 멀티에이전트 작업을 하도록 해.\n내가 이전에 claude 로 하자고 했던거같아서.\n이제 명시적으로 멀티에이전트 작업을 진행하도록.\n규칙은 이전과 같아.\n\n이해했으면 마무리된 작업 처리하고, 멀티에이전트 규칙을 한번 다시 말해줘" (`reviews/round-268-owner-answers.md:7`)
  > 소유자(268라운드, nullable 잔류): "아 그리고 nullable는 제거가 아니라 잔류야. 가끔 이걸 쓰는 경우도 있어서. 위 계획에서 정정이 필요해" (`reviews/round-268-owner-answers.md:19`)
  > 소유자(269라운드, 07b-6 결정·nullable): "맞다고 생각하는 방향으로 가도록\nnullable 은 좀만 더 이야기해보자.\n남겨두는게 딱히 비용도 아니고 느려지는것도 별로 없지? ajv도 공식 허용하고. 우리가 jsonSchema 비표준 필드도 많이 쓰는 마당이라 막는 당위성도 좀 애매하네" (`reviews/round-269-owner-answers.md:7`)
  > 소유자(269라운드, nullable 공식 지원): "그래 nullable은 잔류로 결정. 별도 오류도 없다. 공식지원으로 결정하자." (`reviews/round-269-owner-answers.md:13`)
  > 편집자 결정(270C-01): "【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3943 통과(타이밍 시험 `global-errors.timing.test.ts` 1건이 verifier·agy 동시 부하에서 41.4 ms로 40 ms 기준을 넘겼고 단독 재실행 통과 — 측정은 조용한 창에서라는 규칙의 재확인), storybook 241, typecheck 0, lint 0, build·test:production, 플러그인 일곱 build·test(130/135/334/2/15/15/5), documents build, G16 CONSUMER_BUNDLE_OK(prod 289,033 B, dev 292,330 B). verifier(opus): 공개 내보내기 92→92, 목록 밖 제거·이름 변경 0, dist 비레거시 704 파일에서 옛 식별자 0, 레이어 id `'fields'`·오류 경로 `/controls/fields` 일관, `.claude`·설정·원장 변경 0 → pass with conditions(조건은 시험 실행이었고 충족). agy: 옛 이름·옛 문법 잔존 0, propertyOrder·options.virtual 서술이 결정과 일치; "병합 차단 사유 있음" 판정은 근거 항목이 문서 수준 지적 넷뿐이어서 편집자가 차단 아님으로 뒤집음. 이월 목록은 fixy07에게 07b-7 브리프 항목으로 전했다. agy §2의 "문서 안 이주 문장 없음"은 PR 본문과 #354 본문이 이주 문장을 담고 있어 README 1.0.0 이주 절을 마무리 단계에 한 번에 쓰는 것으로 처리한다." (`reviews/round-270-closing.md:9`)
  > 소유자(271라운드, 대기열 46): "잠깐 중간 결정 해줄게. compnents 랑 helpers 를 프렉탈이 아니게 하는 결정, 승인할게" (`reviews/round-271-owner-answers.md:7`)
  > 편집자 결정(272C-01): "【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3950 통과, storybook 241, typecheck 0, lint 0, build·test:production 20, json-schema 392, 플러그인 일곱(130/135/334/2/15/15/5), documents build, G16 CONSUMER_BUNDLE_OK(prod 289,111 B, dev 292,408 B). verifier(opus): 2b132db02의 런타임 변경은 세 파일뿐(transitionSettlement.ts:90-92의 `context.kind !== 'load'` 제거, loadStaticFirstTree.ts의 동등 처리, hasWrongKindBranchAncestor.ts JSDoc), derive·injectTo 경로(가드 호출처 한 곳)·reset 셋('load' 종류) 확인, 공개 export 변화 0, 금지 경로 0 → pass with conditions(조건은 시험 실행이었고 충족). agy(session 9fb65fe5): 명세 en·ko 문단·예시, 시나리오 둘(VALUE-036 loaded null leaves children unfilled until input promotion; union.null-ancestor-input-promotion 로드 직후 kind undefined·승격 뒤 name만 default), nullable-branch-nodes.md가 결정과 일치, 옛 서술 잔존 0 → 차단 사유 없음. 대기열 45의 넓은 해석은 소유자가 좁히지 않아 그대로 병합했으며, 좁히는 답이 오면 후속 PR로 처리한다. 07c 브리프: 계획 1~8절 + 9절(verifier 대조) + 9.6절(helpers·components는 compartment), 이동 뒤 깨질 시험 둘(buildChildSelectionRuntime 경로 매퍼, dependencyDirection 재작성)과 해석기 사후 조건 포함." (`reviews/round-272-closing.md:9`)
  > 편집자 결정(273C-01): "【추론】 게이트는 원장 관리자가 직접 돌렸다: storybook 251(단독 실행), unit·render·react18 3949(+todo 1), typecheck 0, lint 0, documents en·ko build. verifier(opus): src 변경 0, 삭제·개명된 export·title 0, 데코레이터는 외부 스토어를 `useSyncExternalStore`로 구독해 Form 재렌더 경로 없음(새 `onValidate` prop은 보고 전용), play 18개 멤버 전부 실질 단언, 옛 이름 0, 금지 경로 0 → pass with conditions(조건은 CLAUDE.md 문안과 시험 실행; 둘 다 충족). 수정 둘(CLAUDE.md 문안, 패널 stage schema `unknown` 선언으로 캐스트 제거)과 선택 하나(`submitOutcomes` 상수 공유)를 같은 PR 커밋 b1a60b0a0으로 반영한 뒤 typecheck·lint·storybook 251을 다시 돌려 통과. 대기열 40의 소유자 관찰은 재현되지 않았으므로 방어 수정이 원인을 잡았다는 보장은 없다. 소유자가 다시 보면 콘솔 문구와 순서를 받아 다시 연다." (`reviews/round-273-closing.md:9`)
  > 편집자 결정(274C-01): "【추론】 문서만 바꾸는 PR이라 217C-01의 codex 위임 대상이 아니며 fairy07이 직접 편집했다. 검증: agy(session 2d64ed5e)가 표 행마다 0.16·1.0.0 양쪽 path:line을 확인, 원장 관리자가 diff 전문과 `validateControlGroups.ts`의 CONTROL_KEY_SET·OPTION_KEYS를 대조(README의 controls 추가 키 다섯과 options 여섯이 코드와 같음). 영어·한국어 절은 표 39행·목록 8개·소제목 4개·예시 동일. pristine→resetInteraction·injectTo context 8개는 변경 없음으로 확인." (`reviews/round-274-closing.md:9`)
  > 편집자 결정(275C-01): "【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3840 통과·todo 1(07b-7 대비 −109 = 삭제 helpers 시험 112 − 신규 3; FieldNode 시험 45는 surface로 이동해 통과), storybook 251, typecheck 0, lint 0, build·test:production 20, 플러그인 일곱(130/135/334/2/15/15/5), documents build, G16 CONSUMER_BUNDLE_OK(prod 289,111 B·dev 292,408 B, 07b-7과 바이트 동일), dist/index.d.ts를 07b-7 빌드와 cmp로 바이트 동일 확인. verifier(opus, 1899파일·7733간선 해석): 이동 표·진입점 73·경계(core 밖→core 내부 0, surface→engine 내부 0, engine→surface·index 0)·옛 경로(면제 4 + __legacy__ 6 외 0)·설정·하위 d.ts(1085 동일, 삭제 25는 helpers, 추가 1은 engine/index) 통과; 지적 셋(REACT-009가 이름 금지 목록으로 약해짐 → 이름→출처 맵으로 강화하고 임시 settle 재수출로 실패 확인; 문서 산문의 `dispatch` 네 곳; 검증 도구 진입 파일의 옛 경로 둘)을 같은 PR 커밋 셋(b747da234·3abb74dad·309934660)으로 반영한 뒤 원장 관리자가 typecheck·lint·해당 시험 파일 셋 28건을 다시 돌려 통과. agy(session def33340): engine·surface INTENT/DETAIL 필수 절 구비·내용 일치(surface 멤버 표 53행, 시험 전용 수출 둘의 사유), 옛 경로 잔존 0, 이력 서술 주석 0, 커밋 메시지 다섯 근거 있음·세션 ID 없음 → 차단 없음. filid validate는 fixy07 실행 59건(기준 69건), 순환·경계 위반 0, 새 것은 engine/index 진입 사실 없음 1(indeterminate, 사실 보고). #354 본문에 #369 줄을 더해 갱신." (`reviews/round-275-closing.md:9`)
  > 소유자(276라운드, 대기열 47): "아니. 그대로 무시한다. 문서로 안내하고 우리는 이걸 고려하지 않는다. 과거와의 결별이다" (`reviews/round-276-owner-answers.md:7`)
  > 소유자(276라운드, CLAUDE.md:142): "고쳐라" (`reviews/round-276-owner-answers.md:8`)
  > 소유자(276라운드, G23): "ego 브라우저로 직접 한번 돌려라" (`reviews/round-276-owner-answers.md:9`)
  > 소유자(276라운드, 대기열 38): "적절한 방향을 제안하여 수정하라" (`reviews/round-276-owner-answers.md:10`)
  > 소유자(276라운드, 대기열 39): "해당 경우 터미널로 만들지 못하는 이유가 있나? 있다면 어쩔 수 없는데 이유는 모르겠군. " (`reviews/round-276-owner-answers.md:11`)
  > 소유자(276라운드, 대기열 45): "맞다. form과 노드 데이터와 출력 데이터를 일치시키기 위함이다. 이게 이격이 나면 안된다" (`reviews/round-276-owner-answers.md:12`)
  > 소유자(276라운드, 대기열 48): "함께 고쳐라 일관되게" (`reviews/round-276-owner-answers.md:13`)
  > 소유자(276라운드, 대기열 49): "배치 와 테스트 도구는 프렉탈  import 규칙에서 일부 면제된다." (`reviews/round-276-owner-answers.md:14`)
  > 소유자(276라운드, 대기열 40): "추후 확인해보겠다." (`reviews/round-276-owner-answers.md:15`)
  > 소유자(276라운드, 발주): "한번 정리 발주하고, 추가내용 설명하라" (`reviews/round-276-owner-answers.md:16`)
  > 소유자(277라운드, G23 주체): "스토리 도는건 너 말고 다른애 시켜. 넌 관리해야지" (`reviews/round-277-owner-answers.md:7`)
  > 소유자(277라운드, 대기열 39): "5번에 대해서도 답변 해줘. oneof 터미널" (`reviews/round-277-owner-answers.md:8`)
  > 소유자(278라운드, 대기열 40·39): "40번은 뭐야? 그리고 oneOf 같은 브랜치 노드들은 그렇게 겹치는 속성들에 대해서 덮어쓰기가 좀 되지않나..? 그랬언거같은데" (`reviews/round-278-owner-answers.md:7`)
  > 소유자(279라운드, 진행): "좋아 쭉 작업해 다시" (`reviews/round-279-owner-answers.md:7`)
  > 소유자(280라운드, 대기열 38): "아하.... 1번은 접근성의 문제로 봐야할까? 가능하면 자유도를 해치길 원치는 않는데... 이게 input이랑 라벨을 그리는 곳이 다르다보니까 말이야.. 그리고 실제 상황에서는 사람들이 FieldInput과 FieldRenderer 를 커스텀해서 쓸테니까 사용방식에 따라 올바름 매칭을 하도록 하는게 좋지 않을까 싶기도 하네. 라벨 그리릴땐 인풋이 선출됬는지 알 수가 없으니까" (`reviews/round-280-owner-answers.md:7`)
  > 소유자(280라운드, alias 자리): "2번은 내가 수정했었구나 그럼 문제없어." (`reviews/round-280-owner-answers.md:8`)
  > 소유자(281라운드, 다음 단계): "지금 하는 작업 다 하고 나서, 다시 좀 더 디렉토리랑 구성을 다듬어야겠다. 아직 이상한게 좀 있네. \n\n일단 할거 다 하고 PR을 머지하고 다음으로 가자.\n7단계가 너무 비대해졌네." (`reviews/round-281-owner-answers.md:7`)
  > 소유자(282라운드, 08 씨앗): "아 그래. 그럼 그냥 적어둘게.\n\n1. core 의 표면 외부에서 nodeFromJSONSchema 를 쓰는 곳이 없는거같은데, 왜 이게 root export 인가? 사실 node 에 대한건 node 자체를 만드는 브랜치노드와 root 노드를 만드는 RootNode provider 를 제외하면 몇가지 유틸리티 함수와 타입만 있을텐데. export 구조가 지나치게 복잡하고 최소 export 원칙을 지키지 못하는 것 같아서 점검이 필요해보인다. 밴치마크나 test 는 import 규칙 등에서 면제인 이유는 보조함수가 본 코드의 가독성을 해치는 것을 막기 위함인데, 이게 좀 그런 느낌이 드는군 \n\n2. 이전에 FormInner 로 Form 본체 역할을 하던 컴포논트가 Form/components/FormContents.tsx  로 이름이 변경된거같은데. FormRoot 나 FormCore 나 좀 명확하게 다른 항목(FromInput / Group / Label / Error)과 위계구분이 되어야 하지 않을까 싶다. 지금은 약간 햇갈리는군?\n\n\n\n지금으로서는 가장 거슬리는건 프렉탈들의 최소 export 계약 위반이야.\n이래서 test 들이나 벤치마크를 프렉탈 내부에 두고, 프렉탈 index 를 경유해서 테스트나 벤치마크를 구성하지 않게 한건데, 지금 보니까 테스트나 벤치마크 등도 전부 프렉탈 index 를 경유하는 계약인거같군. 하지만 이건 문제가 있어. 이렇게 되면 사실상 프렉탈 내에 모든 기능코드가 다 index 로 export 되는데 이럼 어떤 함수가 외부계약인지 파악이 어렵잖아.\n\n이건 filid 플러그인의 한계인건가?" (`reviews/round-282-owner-answers.md:7`)
  > 편집자 결정(283C-01): "【추론】 게이트는 원장 관리자가 직접 돌렸다: unit·render·react18 3867(통과 3866·todo 1), storybook 251, test:production 20, typecheck 0, lint 0, build, G16 CONSUMER_BUNDLE_OK prod 289,269 B·dev 292,566 B(07c 대비 +158 B, label id 규약), 공개 index.d.ts 07c와 바이트 동일, dist의 옛 이름 `__legacy__` 밖 0, `${path}-label` 잔존 0. 플러그인 일곱은 fixy07 수치(130·135·334·17·17·7·2). verifier(opus)는 첫 head에서 FAIL 둘을 찾아 고치게 했고 새 head에서 PASS; agy(session 264b398c)는 문서 en·ko 대조 차단 없음. 38의 최종 규약: 제목 label은 항상 `htmlFor={path}`와 `id="label:${path}"`(루트 `label:`, path 없으면 id 없음), 내장 checkbox·radio 묶음은 `role="group" aria-labelledby="label:${path}"`, 사용자 정의 FieldInput·FieldRenderer는 같은 규약으로 스스로 맞춘다. 39(게이트 없는 oneOf 분기 terminal)는 verifier가 반쪽 규칙임을 보여 대기열 50의 소유자 결정으로 미뤘다." (`reviews/round-283-closing.md:9`)
  > 편집자 결정(284C-01): "【추론】 범위가 문서·시험·플러그인 label id 한 줄씩이라 verifier·agy 없이 원장 관리자가 diff 전문을 읽었다. 편차 둘을 받아들였다: surface DETAIL의 멤버 표는 Prettier 정렬이 `surface.test.ts`의 53행 셈을 깨뜨려 `<!-- prettier-ignore -->`로 표만 지켰고(정규식 완화는 다음 후보), antd-mobile은 자체 checkbox·radio 정의가 있어 내장 radio를 `FieldRenderer={FormGroup}`로 그려 묶음 이름만 확인했다. 게이트(70656e1e6, 범위): schema-form typecheck·lint, render+react18 1442, surface unit 45, 플러그인 build·lint·test(antd5 18, antd6 18, antd-mobile 3), documents en·ko." (`reviews/round-284-closing.md:9`)
  > 편집자 결정(285C-01): "【추론】 G23의 정의는 "실제 브라우저에서 돌린다"였고 소유자가 실행 주체를 ego-browser를 쓰는 에이전트로 정했으므로(276·277라운드) 이 결과로 닫는다. 결과 파일: fairy07 scratchpad `g23/results-tip.json`(ego 251건)과 tasks `b1k1pxl83.output`(자동 게이트). 관찰 하나는 열어 둔다: React 경고 "Received NaN for the `defaultValue` attribute"가 세 스토리(features/derivation/derived-and-watch > Derived Chain Manual Edits, scenarios/derive > watch-values, composite/cx10-inject-chain-in-batch > Case)에서 나오며 시험은 통과한다 — 원장 관리자가 debugger에게 원인을 맡겼고 결함이면 1.0.0-beta 위 후속 PR로 고친다. 첫 실행의 대기 조건 오류는 원장 관리자의 스크립트 잘못이다." (`reviews/round-285-closing.md:9`)
  > 편집자 결정(286C-01): "【추론】 최종 tip 3c1a7f2c3 게이트: unit·render·react18 3870 통과·todo 1(타이밍 시험 1건은 동시 부하에서 62 ms로 실패했다가 단독 재실행 통과 — 조용한 창 규칙 재확인), storybook 251, typecheck 0, lint 0, build, test:production 20, 플러그인 일곱(130·135·334·18·18·7·3), documents en·ko, G16 CONSUMER_BUNDLE_OK prod 289,358 B·dev 292,655 B, 공개 index.d.ts 07c와 동일. G23은 285C-01로 닫힘. 병합 방식은 저장소 설정(squash만 허용)이 정했고, 가지 보존은 #354 본문의 열세 PR 해시가 닿게 하려는 원장 관리자 결정이다. 버전 올리기는 소유자가 최종 단계로 미뤘다(276라운드 전 말)." (`reviews/round-286-closing.md:9`)
  > 소유자(287라운드, 최소 export 원칙): "그래 8에서 속도 개선과 정돈이 포함되어 있었어.\n그건 괘념치 말고,\n\n최소 export 원칙과 CLAUDE.md 등에 프로젝트에 대한 충분한 가이드가 안되어있는걸 수정하고 가고싶어.\n\n내가 최소 export 를 주장하는 이유는 해당 기능집단이 어떤 인터페이스를 계약했냐는 기록과 동시에,\n내부에 다수의 보조함수와 복잡한 서브 프렉탈 트리를 가지고 있어도, 이들이 복잡도를 폭발시키지 않도록 하는 중요하고 엄중한 계약이야.\n\n그리고, 프렉탈 디렉토리를 열었을때 가장 먼저 보이는 index.ts 와 플랫하게 펴져있는 파일들은 해당 프렉탈의 1차 이미지를 결정하며, 이때까지 독자는 가장 높은 집중력을 가진다는걸 전제해.\n\n그런 의미에서 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/surface/nodeFromJSONSchema.ts 같이, 처음 열어본 팩토리 함수가 실제로는 외부에서 안쓰이는 이 상태는 사실상 배신이며, 기능 고장에 준하는 엄충한 상태로 보여져.\n\n더 큰 문제는 이게 어느정도 범위까지 퍼져있는지 알 수 없는 상태고.\n\n지금 이미 외부 인터페이스는 전부 갈아엎고 있으니, 이 부분을 모두 고려해서 다시 검사해보도록해. " (`reviews/round-287-owner-answers.md:7`)
  > 소유자(288라운드, filid 이슈·가이드 자리·수정 계획): "filid 원칙에 대한거라서. 내가 말한건. 해당 문제는 https://github.com/vincent-kk/ogham/issues 에 이슈로 하나 남겨줘.\nfilid 플러그인 수정 요청으로. 내가 나중에 수정할게.\n\n나머지 이 레포의 모든 항목도 마찬가지긴 한데... CLAUDE.md 를 루트에 쓸지 schema-form에만 쓸지는 검토해보도록.\n\n이거 이슈 바로 등록하지말고, 진행하면서 너나 구현자가 규칙을 안지킨건지, 아니면 규칙이 잘못된건지를 파악해보도록 하자.\n\n어떻게 수정할 생각인지 한번 보여줘. 내가 검토해보고 진행하도록 할테니" (`reviews/round-288-owner-answers.md:7`)
  > 소유자(289라운드, 정돈 결정 D1–D6): "1/2 는 그럼 ogham 에 이슈로 올려줘.\n\nD 이하 번호만.\n\n1. 진행\n2. 나, 뿐만 아니라 프렉탈 제1위계 위치에서 이동시켜. 왜 여기 있는지도 모르겠어.\n3. 둘로 가르기\n4. 지우긴 하는데, 해당 에러 상수를 쓰는곳이 없어? 그럼 실제로 error 발화할때는 어떻게 해? string 리터럴로 하나?? 이건 내부 사용보다는 schema-form 에서 발화할 수 있는 에러들을 일람하는 목적 + enum(이든 object enum이든)으로 root export 해서 schema-form error 핸들링시 안전한 상수 사용을 권장하고싶어. 추가로, enum의 의의는 내 생각엔 문자열 리터럴보다 귀찮지만, 조달 경로를 한정해서 패키지 내부 상수변경시 안전하게 함께 바뀌도록 하는 계약이라고 생각해서 사용자 입장에서 써야하는 enum은 제공을 해줘야할거같은데.\n5. 동의.\n6. 응 그때 올려줘" (`reviews/round-289-owner-answers.md:7`)
  > 소유자(290라운드, 작업자 배정): "응 작업자는 @fixy08 @fixy08 이들이 준비되어있으니까 얘들이랑 분배하도록.\n넌 여전히 관리자로 동작하렴" (`reviews/round-290-owner-answers.md:7`)
  > 소유자(291라운드, 문자열 리터럴·계획 순서): "오케이. 문자열 리터럴은 jsonSchema 의 type 정도를 제외하면 별로 쓰고싶지 않아.\n바뀔때 변경표면이 너무 크다.\n\n이런게 추가로 있나?\n\n지금 말 들어보면 약간 불안한데. 문자열 리터럴로 error 발화가 남아있었다는건.\nmethod , event dispatch 같은건 문제없지?\n\n이 작업까지 끝나면 다시 구조리뷰를 하겠어.\n구조리뷰가 모두 끝나면 그때부터 속도개선작업 진행하자.\n내 계획에 차질이 있나?" (`reviews/round-291-owner-answers.md:7`)
  > 편집자 결정(292C-01): "【추론】 게이트는 fairy08이 돌렸다: documents 빌드 en·ko 성공, prettier 0(바뀐 패키지 파일), 세션 줄·옛 이름·개인 이름 0, verifier 첫 회 FAIL 9건 반영 뒤 PASS. 원장 관리자는 `git diff origin/1.0.0-beta...origin/feat/schema-form-docs-align`으로 `src` 아래 변경이 주석뿐임을 직접 확인했다. 문서만의 변경이라 Claude 세션이 직접 고쳤다(217C-01). 가지는 지웠다." (`reviews/round-292-closing.md:9`)
  > 편집자 결정(292C-02): "【추론】 (1) 남는 포맷터 넷이 공유하는 `createDivider`·`getErrorMessage`는 소비자 소유자 넷(app/plugin, helpers/fieldInputDefinition, helpers/virtualization/VirtualizationManager, blueprint/…/createDynamicFunction)의 최소 공통 fractal이 `src`이므로 `helpers/error`에 남기고 index가 `formatValidationError`와 함께 셋을 내보낸다(fixy08 선택지 1; 복제는 reuse-first 위반, 새 fractal은 과잉). (2) `types/rolled/fieldRenderer.ts`·`form.ts`는 루트 `src/index.ts:84`의 `export type *`로 공개 이름이며 플러그인 넷이 쓰므로 정돈-1에서 삭제를 뺀다(원장 관리자의 전수 검사가 와일드카드 재수출을 놓친 오판, `plan/tidy-structure/request.md` §7). 표면 게이트는 "컴파일러로 열거한 공개 이름·형 문자열 목록이 1.0.0-beta 끝단과 같다"로 강화해 정돈 PR 전부에 적용한다." (`reviews/round-292-closing.md:17`)
  > 소유자(293라운드, 멘탈모델 예고): "그래 파악되면 바로바로 보조하도록.\n작업 끝났으면 나 좀더 할말이 있는데, 준비해줘. fca 멘탈모델 관련이야" (`reviews/round-293-owner-answers.md:7`)
  > 소유자(293라운드, FCA import 멘탈모델): "응 좋아. 이건 계획 작성에 도움이 될 수도 있고, filid 관련 ogham 이슈 작성에 도움이 될 수도 있어.\n\n일단 말해볼게.\n\n내 생각에는 import 에는 크게 3가지 종류가 있어.\n\n1. 아예 외부 패키지에서 import\n2. 형제 프랙탈에서 import\n3. 상위 프렉탈이나 현재 프렉탈 내부에서 import\n\n이때, 1은 제어권 밖이니 제외하고,\n\n형제 프렉탈의 경우는 index 를 통해서만 import 해야 하고, 이때 index 에 선언된 항목은 내부와 외부를 가르는 핵심 계약표면이다. 이는 사실상 1외부패키지와 준하는 계약표면이고, 정말 꼭 필요한 최소한만 import 가 되어야 한다. 이게 기본적인 fca 원칙에 따름이다.\n\n3이 좀 어려운 부분인데,\n프렉탈 내부와 직계 라인의 부모프렉탈인 경우는 index.ts 를 경유하지 않는 import 를 할 수 있다. 이는 전체 프렉탈 트리 내부에서 사용되는 기능이 서브트리의 루트 프렉탈에서 방출되는 것을 막기 위함이다.\n기본적으로 직계 프렉탈 서브트리는 부모자식 관계를 가지며, 이들 사이에서는 사실상 "내부모듈" 취급을 허용한다.\n이때문에, __tests__ 나 __benchmarks__ 등이 유닛테스트로 존재하는 경우에는 반드시 프렉탈 내부에 있어야 하고, 이때문에 이들 테스트와 벤치마크가 index.ts 를 경유하지 않고 함수 등을 import 할 수 있는 것이다. 이때 되도록이면 검사하고자 하는 함수와 가장 가까운 프렉탈에 이들 테스트 등이 있어야 불필요한 부모자식간 import 증가를 막을 수 있다.\n\n이것은 앞서 말한 "프렉탈 첫인상" 개념과 연결되는 연결계약이다.\n\n추가로 형제 프렉탈 사이에 공유되는 함수나 기능은 가장 가까운 공통 부모 프렉탈의 organ 에 놓일 수 있으며, 앞선 3의 규칙에 의해 자식 프렉탈들은 부모 프렉탈의 organ 의 함수를 직접 import 할 수 있다.\n하지만, 부모 프렉탈은 자식 프렉탈에서 index 로 방출하지 않은 함수를 직접 접근할 수 없으며, 이것이 핵심 비대칭과 한 방향으로의 의존성을 약속한다.\n\n\n이런 구조야. 한번 보고 너의 말로 다시 구성해봐.\n논리에 헛점이 없는지도 파악해보고." (`reviews/round-293-owner-answers.md:8`)
  > 소유자(294라운드, 보강 수용·구조 검사·filid 결정 보류): "응 받아들여. 기록하고, 그원칙을 바탕으로 구조를 검사해봐.\n마지막에 이걸 모두 포함해서 filid 개선을 할지여부를 결정해야하니까 잊어버리진 말아주고. 기록해둬주면 좋겠어" (`reviews/round-294-owner-answers.md:7`)
  > 소유자(295라운드, D7·D8 허용, 모델 안의 변용 허용): "src/__tests__/e2e·scenarios·migration의 공개 API 시험 은 허용이지.\n외부가 맞으니까.\n\nD8도 허용.\n\n그리고 이게 구조를 만드는 강력한 규칙인건 맞는데, 이 멘탈모델 규칙 내에만 있다면 약간의 변용은 허용해.\n결국 핵심은 가독성과 인터페이스 계약, 그리고 폭발반경 억제가 핵심이라서...\n그래서 엄청 스트릭트한 정적 규칙을 넣기는 좀 어려웠어.\n\nfilid 자체는 js/ts 전용 플러그인이 아니라서 자바스크립트 진영의 alias 를 넣긴 좀 그래서 ..." (`reviews/round-295-owner-answers.md:7`)
  > 소유자(296라운드, 정돈-2 즉시 투입·fairy08 상태): "정돈-1 끝나면 바로 정돈-2 넘기고, 끝나는대로 보고해.\n@fairy08 가 대기하고 있는게 있나? 아니면 그냥 대기중인가?" (`reviews/round-296-owner-answers.md:7`)
  > 편집자 결정(297C-01): "【추론】 fixy08 게이트: typecheck 0, lint 0, build, 공개 표면 열거 92개 차이 0·dist/index.d.ts diff 0, 옛 이름 게이트 빈 출력, unit·render·react18 3823 통과·0 실패·todo 1(3870 − 옛 it 59 + 옮긴 it 11 + 새 index 시험 1), test:production 20, storybook 251, 플러그인 일곱(130·135·334·3·18·18·7), documents en·ko, aileron 두 패키지 새 tsc 오류 0, loadCoreBenchmark 동작·bench find-node 실행. verifier 셋(삭제 이름의 제품 소비자 0, 옮긴 import 전부 고침, 문서가 코드보다 먼저) PASS. 원장 관리자의 대조: 파일 102개, `src/index.ts`·`.claude`·settings·`architecture` 변경 0, 세션 줄 0, surface·core index에서 `nodeFromJSONSchema` 0, 새 자리 `core/surface/utils/nodeFromJSONSchema.ts`, `helpers/error`는 `formatValidationError`와 공유 보조 둘(`utils/createDivider.ts`·`utils/getErrorMessage.ts`)만 남음. 삭제: 포맷터 27개(파일 15)·고아 보조 9·시험 it 50 삭제·9 이동. 공개 표면 열거 스크립트(`enumerate-surface.mjs`, fixy08 scratchpad)를 정돈 PR 전부의 표준 게이트로 삼는다(292C-02)." (`reviews/round-297-closing.md:9`)
  > 소유자(298라운드, 5단계 전까지 무정지 진행·병합 허용): "5단계 전까지 모든 작업은 멈추지 말고 진행해줘.\n판단 필요는 이전처럼 저장해두고 한번에 물어보도록. 차단하지말고.\n생성되는 PR에 대한 머지도 허용한다." (`reviews/round-298-owner-answers.md:7`)
  > 편집자 결정(299C-01): "【추론】 fairy08 게이트: documents 빌드 en·ko 성공, prettier 0, en·ko 코드 블록 바이트 동일, 세션 줄·옛 이름·개인 이름 0, verifier(예제 14블록 엄격 tsc 통과·공개 이름만; 문구 지적 7건 반영 뒤 PASS). 원장 관리자 대조: 파일 둘(documents/ 아래만), 930+/416−, 세션 줄 0, 옛 이름 0(`FieldNodeEventType`가 `NodeEventType`에 부분 일치한 18줄은 거짓 양성). 문서만의 변경이라 Claude 세션이 직접 고쳤다(217C-01). 드러난 사실 하나: core는 `maxItems`·`minItems`를 강제하지 않고 기본 배열 입력이 `maxItems`에서 추가 버튼만 숨긴다(`FieldInputArray.tsx:82`) — 의도인지 소유자 확인이 필요해 대기열 53으로." (`reviews/round-299-closing.md:9`)
  > 편집자 결정(300C-01): "【추론】 `ledger/write.md:425`의 현행 표가 "배열을 `minItems`까지 채우기, `maxItems` 초과 `push` 차단 — 입력 컴포넌트로. core는 제약을 유효 스키마로 노출하고 위반은 검증이 알린다"로 정했고, `ledger/surface.md:147`도 "코어가 `maxItems` 초과를 막지 않으므로"를 전제로 `push(value?)`의 인자를 정했다. fairy08이 #375에서 본 동작(기본 배열 입력이 `maxItems`에서 추가 버튼만 숨김, `FieldInputArray.tsx:82`)은 그 결정 그대로다. 문서에는 "core는 한도를 강제하지 않고 유효 스키마로 노출하며 검증이 알린다; 기본 입력은 `maxItems`에서 추가를 숨긴다"를 적는다(정돈-E 문서 절, fairy08)." (`reviews/round-300-closing.md:9`)
  > 편집자 결정(300C-02): "【추론】 소유자가 278라운드에서 떠올린 "겹치는 속성의 덮어쓰기"는 호스트 자신의 게이트 없는 선언(노드·`$ref`·`allOf`)에 이미 적용되는 현행 규칙이다(SPECIFICATION "Branch or Terminal": 뒤의 `options.terminal`이 이김). 게이트 없는 `oneOf`·`anyOf` 분기는 다르다 — 어느 분기가 활성인지 정적으로 정할 수 없으므로 `selectEffectiveDeclarations.ts:29-37`이 존재만 기여하게 한 것이고, 07d에서 verifier가 "뒤가 이김"으로 바꾸면 반쪽 규칙이 됨을 보였다. 45라운드 답(폼·노드·출력 데이터 일치)과도 존재만 기여하는 쪽이 맞는다 — 분기마다 다른 presentation을 전체 순서로 합치면 활성 분기와 무관한 표시가 생긴다. 따라서 런타임 의미는 바꾸지 않고, 분기마다 다른 입력이 필요한 필드는 `fieldInputMap`(경로별 입력 지정)으로 푼다는 안내를 SPECIFICATION·README에 적는다(정돈-E 문서 절). 소유자가 전체 순서 병합을 원하면 새 라운드로 뒤집는다." (`reviews/round-300-closing.md:17`)
  > 편집자 결정(300C-03): "【추론】 원칙의 내용은 소유자의 말(287라운드)이고 자리는 D5로 정해졌으며(289·295라운드), 298라운드가 "차단하지 말고 PR 병합도 허용"이라 했다. CLAUDE.md 수정에 소유자 승인이 필요하다는 규칙은 소유자가 바뀐 내용을 봐야 한다는 뜻이므로, 별도 승인 턴 대신 **정돈-4 PR의 diff**로 보인다: 그 PR은 CLAUDE.md 둘만 바꾸고(루트 원칙 절, 패키지 적용 절, 47–51행 대체), 제목에 "CLAUDE.md"를 적으며, **이 PR만은 원장 관리자가 병합하지 않고 소유자가 diff를 본 뒤 병합한다**(승인 규칙 유지). 그때까지 다른 일은 막히지 않는다." (`reviews/round-300-closing.md:25`)
  > 편집자 결정(300C-04): "【추론】 51(생산 지점 없는 코드 넷)은 레거시의 발화 조건을 새 엔진에 넣었을 때 다른 진단이 나는지·구조상 불가능한지·조용히 통과하는지로 판정되며, 결과가 "조용히 통과"면 이식 누락이라 정돈-E에서 진단을 더하고 아니면 폐기해 원장에 적는다. 40(스토리북 docs 페이지)은 재현 시도로 닫힌다. 둘 다 소유자 결정이 아니다." (`reviews/round-300-closing.md:33`)
  > 소유자(301라운드, 대기열은 직접 닫기): "보니까 대부분 원장 원리에서 유도 가능한 답변이거나 코드검증으로 알 수 있는 문제같은데? 직접 답할 수 없는 문제라고 생각하나?" (`reviews/round-301-owner-answers.md:7`)
  > 소유자(301라운드, 53 재검토·CLAUDE.md 진행): "53번은 우리가 값을 조작하거나 제어하지 않는다는 원칙이 있거든. 그래서 최대값/최소값 제한을 node 레벨에서는 제한하지 않았던거같은데. 이건 한번 검토해보자. 옵션으로 줄 수도 있는 기능이라. 이전 판에선 지원 했던거같거든\n\n클로드 문서 업데이트는 필요하면 진행하도록 해" (`reviews/round-301-owner-answers.md:8`)
  > 소유자(302라운드, 53 배열 한도 유익·손해): "지금 우리가 값을 제어하는 동작은 control로 다 모았잖아. 그걸 고려한다고 하면 값을 조절하거나 제어하는 기능을 못넣을건 아닌거같은데... Array의 개수를 core레벨에서 막지 않을때 생길 수 있는 이슈가 있을까? formType에서 지원해야 할 일이라고 생각하긴 하는데 말이야....(노드도 올바르지 않은 타입의 값을 가질 수 있으니, 이것도 그런 느낌으로?) 둘다 가능은 할거같은데 유익과 손해에 대해 좀 생각해보고싶네" (`reviews/round-302-owner-answers.md:7`)
  > 소유자(303라운드, 53 경계와 일관성): "어떤 말인지는 이해했어.\n이전에는 form의 역할을 넓게 봐서, jsonSchema를 통과하는 json 값을 만드는걸 목표했는데, 이렇게 되다보니 여러가지 문제(일부 에러는 방출, 일부는 입력단계에서 막힘. array item처럼) 가 있어서 신규 판에서는 이걸 대부분 걷어냄.\n근데 object등의 브랜치 동작에서 가려진 필드값을 제거하는 기능을 추가하면서 사실상 일부 jsonSchema을 통과할 수 있는 값을 조작해주기도 함.\n\n문제는 이 경계가 어디까지인가 인데, 네 생각엔 배열 아이템 개수까지는 과하다는거지? field input으로도 제어 가능하니까.\n\n그럼 일관성 면에선 어때? 제공하지 않는게 사용자 입장에서 일관적일까 아닐까" (`reviews/round-303-owner-answers.md:7`)
  > 소유자(304라운드, 53 확정: 적용 가능성/제약 경계): "그래 이걸로 정하자. 제안을 수용한다" (`reviews/round-304-owner-answers.md:7`)
  > 편집자 결정(305C-01): "【추론】 fairy08의 코드 확인은 넷 중 셋(`NESTED_COMPOSITION_IGNORED_FOR_FORM`은 중첩 합성을 재귀로 펼쳐 지원, `CONDITION_INDEX`·`CONDITION_INDICES`는 분기 `controls.active`의 컴파일 실패가 `CREATE_DYNAMIC_FUNCTION`으로 `#/oneOf/<i>/controls/active`에 나고 `const`·`enum` 선택은 코드를 만들지 않는 판별자 게이트)을 폐기로, `NULLABLE_ONE_OF_NULL_UNREACHABLE`을 이식 누락으로 판정했다. 그러나 원장 ERROR-162(17라운드, `adr/0014-error-policy.md:385`)가 그 경고를 "분기 내용을 읽으므로 폐기"로 이미 정했고, 시험 `src/__tests__/scenarios/nullable.object-validation.render.test.tsx:4-14`의 머리글도 "아무것도 이 경고를 내지 않는다"를 그 결정대로 고정하고 있다. 코드 확인이 원장 결정과 어긋날 때는 원장이 이기므로 넷 모두 폐기이며, 정돈-E E1은 `PRESENTATION_KEY_SUSPECT`와 함께 다섯을 지우고 `BlueprintErrorCode`의 죽은 항목 둘(`ConditionIndex`·`ConditionIndices`)과 `src/helpers/warning/warningCode.ts`의 소비자 없는 상수도 함께 지운다. ADR 0014 코드 표의 "CONDITION_INDEX 또는 CONDITION_INDICES" 행은 레거시 이름의 열거라 새 엔진의 코드는 `CREATE_DYNAMIC_FUNCTION` 하나임을 이 보충으로 적는다." (`reviews/round-305-closing.md:9`)
  > 편집자 결정(305C-02): "【추론】 fairy08이 1.0.0-beta 트리에서 스토리북 docs 페이지 85개 전부를 iframe으로 직접 열고, 관리 화면 안에서 보고된 페이지와 composite·composition docs 37개를 다시 불러오지 않고 오가며 관리 창과 미리보기 창 양쪽에 오류 수집기를 심었는데 오류 화면·콘솔 오류·"circular" 문구가 모두 0이었다. #367(beff4b5ec)이 확인된 순환 하나(`createHandleProbe`의 spy 인자)를 호출 기록 배열로 바꾸고 `controls.exclude`와 표시의 순환 안전화를 넣었으므로 그 수정으로 해소된 것으로 본다. 확인하지 않은 것은 정적 빌드(#367이 확인함), 페이지 안 조작(Show code·controls 변경), 소유자의 브라우저·확장 상태이며, 소유자가 다시 보면 브라우저 정보와 함께 새 항목으로 연다." (`reviews/round-305-closing.md:17`)
  > 편집자 결정(305C-03): "【추론】 fairy08의 별도 발견(옛 문법 `computed.if`·`&if`가 든 스키마는 오류나 경고 없이 키가 무시됨)은 새 설계의 원칙 그대로다: 폼은 그룹 객체 셋(`controls`·`options`·`presentation`) 안의 키만 읽고(CONTROLS-001), 맨 키는 JSON Schema 층의 모르는 키로 검증기에 간다(CONTROLS-078·CONTROLS-081이 같은 원리로 `virtualRequired`·`placeholder`를 처리). `computed`와 `&` 접두 키는 CONTROLS-049의 이주 항목이고, 이주 진단을 넣으면 폼이 맨 키를 읽게 되어 원칙을 어기므로 넣지 않는다. 이주 안내는 README 1.0.0 이주 절(270C-01, 마무리 단계에 한 번에 씀)이 CONTROLS-049의 이주 항목 목록으로 적는다. 소유자 결정이 필요한 공개 동작 변경이 아니므로 대기열에 올리지 않는다." (`reviews/round-305-closing.md:25`)
  > 편집자 결정(305C-04): "【추론】 304라운드가 "문서는 지금 고친다"고 정했고 fairy08의 문안(`errcodes/array-limits-sections.md` A–H)은 코드 이름에 기대지 않으므로 정돈-E(오류 코드 이름이 바뀜)와 묶을 이유가 없다. 217C-01의 문서 전용 허용에 따라 fairy08이 PR을 연다: SPECIFICATION en·ko(경계 단락은 Architecture 아래 새 절, ArrayNode 행, 배열 한도 새 절, 986·998행 예제, 1222행 nullable 문구), README en·ko(minItems 자동 채우기 절·prefixItems 문구·출력 필터 예제·Reset bullet), `docs/QUICK_REFERENCE.md:491`, docs/agents 셋(`troubleshooting.md:56`은 `push(data, true)` 우회와 Promise 반환을 말해 전부 틀림), documents 사이트 `core-concepts.mdx`·`examples/array-output-filters.mdx` en·ko. documents 데모 `ArrayOutputFiltersDemo.tsx:77,117`과 페이지 17행의 `node.normalizedValue`는 새 엔진에 없는 이름이라 "방출 값" 칸이 비는 문서 사이트 결함이므로 같은 PR에서 현재 공개 API로 바꾸되 그 이름 교체 외의 동작 변경은 넣지 않는다. 옵션과 UI 전용 빈 슬롯은 적지 않고(정돈-S는 PR이 병합된 뒤 문서화), `MOBILE_PERFORMANCE_REPORT`는 옛 엔진 측정 보고서라 손대지 않는다. 게이트는 `@albatrion/documents` build와 정돈-2와의 충돌 없음이며 원장 관리자가 병합한다." (`reviews/round-305-closing.md:33`)
  > 편집자 결정(306C-01): "【추론】 검증: 변경 파일 13개가 모두 문서(SPECIFICATION en·ko, README en·ko, QUICK_REFERENCE, docs/agents 셋, documents core-concepts·array-output-filters en·ko)와 데모 `ArrayOutputFiltersDemo.tsx`뿐이고 src·DETAIL·시험은 0개라 진행 중인 정돈-2와 겹치지 않는다; 커밋에 세션·공동 저자 줄 0; 데모의 `node.normalizedValue`는 공개 형 `FieldNode`의 `readonly outputValue`(`src/core/surface/type.ts:74`)로 바뀌었고 그 이름은 SPECIFICATION의 Array Output Filters 절과 같다; SPECIFICATION en·ko에 "What the core does with a schema"(136행)와 "Array Limits"(983행) 절이 새로 들어갔다; documents 빌드 en·ko는 브랜치 워크트리에서 통과했다(본 체크아웃에는 변경이 없으므로 워크트리가 맞는 자리). 지시 밖 변경 하나 — 데모 스키마의 `description` 문자열 "Three empty rows are offered up front"를 "Add rows and leave the last ones empty"로 바꾼 것 — 은 옛 전제(minItems 채움)를 화면에 적는 문구였으므로 받아들인다. prettier는 base에서 이미 통과하지 않던 셋(core-concepts.mdx en·ko, 데모)을 다시 포맷하지 않았고 이는 변경 범위를 지킨 것이다. 병합 결과 1.0.0-beta는 c40d6de8f." (`reviews/round-306-closing.md:9`)
  > 편집자 결정(307C-01): "【추론】 원장 관리자의 직접 확인: 병합 상태 CLEAN, 금지 경로(`.claude/`·설정·`architecture/`·`.filid/`) 변경 0, 커밋 12개에 세션·공동 저자 줄 0, 루트 `src/index.ts`의 변경은 `export type * from './types/rolled'`를 이름 21개의 목록으로 바꾼 한 덩어리뿐. verifier의 독립 검증: 빌드 뒤 `dist/index.d.ts`를 컴파일러로 열거해 기준(정돈-1 직전 빌드, 정돈-1 뒤와 ae502f7bd 사이의 src 차이는 주석뿐이라 전이로 동등)과 대조해 이름 추가 0·삭제 0·형 문자열 차이 0, 남은 와일드카드 0(기준 dist에는 하나 있었음); unit·render·react18을 각각 한 번 직렬로 돌려 2381·722·722 통과, 실패 0, 할 일 1, 종료 코드 모두 0; 가드 시험 `src/__tests__/importModel.test.ts`의 논리를 저장소 밖에 복제해 돌리니 PR 트리에서는 D7 안의 루트 index 자기 import 77개 외 위반 0, ae502f7bd 추출본에서는 U 185·D 61·S1 24로 가드가 실제로 잡는다; 옮긴 시험 넷(U8·ERROR-017·TEST-069·branchless 색인 둘)은 삭제가 아니라 이동이고 `expect(` 호출은 14233→14236, `.skip`·`.only` 추가 0. fixy08이 보고한 "실패 0인데 종료 코드 1" 한 번은 verifier도 재현하지 못했고 원인 미상으로 남긴다(storybook·production 프로젝트를 포함한 기본 실행이었을 가능성). 병합 결과 1.0.0-beta는 fd2a56c2f." (`reviews/round-307-closing.md:9`)
  > 편집자 결정(307C-02): "【추론】 (1) `nodeFromJSONSchema`는 core index로 만든 시험·벤치 보조로 `src/__tests__/fixtures/`에 둔다(D2의 "뿌리에서 아래로"를 시험 쪽으로 푼 것). (2) FieldNode 클래스를 import하던 시험은 구조적 좁히기 fixture `TestFieldNode`(`src/core/__tests__/fixtures/`)로 바꾸고, 공개 노드 동작(`find`·`setValue`·`remove`)을 부르는 12개 파일은 `isTestFieldNode`로 좁혀 공개 멤버와 레코드를 함께 쓴다 — 클래스에만 있는 멤버가 필요해 surface 시험으로 옮긴 파일은 0. (3) index 이름 넷(`fieldNodeFactory`·`loadFieldNodeAtMount`·`resetFieldNodeForm`·`blueprint`)은 보유 이유를 소유 fractal의 DETAIL에 적고 남긴다(B8), 그래서 삭제는 48 항목(43 이름). (4) 승인한 변용: 뿌리 하네스는 자식 index로; 패키지 진입 단언 시험 둘은 `src/__tests__/migration/`으로; index 모양 `it`은 부모 `__tests__`로; 네임스페이스 import는 이름 import로; 모델 가드 시험은 `src/__tests__/`에; `app`은 organ(facade 조항, INTENT·DETAIL 삭제)으로; `getErrorMessage`(keyword/locale)는 `selectKeywordErrorMessage`로; 죽은 `FieldNodePropsFlow.helpers.tsx` 삭제; fixture `createDispatchTree`·`ownedInlineHead.json`은 `engine/__tests__/fixtures`로; `nan-delivery` 분할; core 시험은 blueprint·settle·engine `__tests__`로. (5) 진행 중 fixy08이 코드와 맞지 않아 바꾼 일곱: E1 fixture props 형은 core index 이름만으로 유도; E3 위 (2); E4 branchless-differential은 아래 307C-03; E6 validatorConformance는 둘로 나눠 플러그인 형 단언은 `app/plugin`에 남기고 수명·가드 읽기는 `core/engine/validation/__tests__`로(`readFieldNodeGuard` 삭제); E6 FormErrorDetails 형 계약 시험은 `errors/__tests__`로; Form 시험 다섯 중 정적 멤버를 쓰는 하나는 `src/__tests__/`로; `schemaSurface.type.test.ts`는 types가 organ이라 그대로. (6) 217C-01대로 fixy08이 직접 고친 셋(codex가 남긴 TS2540 여섯, 통째 재포맷 일곱 파일 되돌림, 178개 파일의 `@/schema-form/…/index` 경로 되돌림)과 filid 훅이 `app` 문서 삭제를 한 번 막아 codex가 수정·삭제를 나눠 실행한 일은 PR 본문에 적혔다." (`reviews/round-307-closing.md:17`)
  > 편집자 결정(307C-03): "【추론】 `core/engine/__tests__/blueprint.branchless-differential.test.ts`는 같은 스키마를 branchless 분석과 일반 분석으로 돌려 비교하므로 입력을 바꿔 피할 수 없고(가 불가), 흉내 낼 `collectSchemaCapabilities`는 blueprint index로 나가지 않아 index 경로를 흉내 낼 수 없다(나 불가). 그래서 (다): 시험은 engine 자리에 두고 `src/core/engine/DETAIL.md:33`에 vi.mock이 blueprint 내부에 닿음을 B8 사례로 선언하며, settle 내부(`getDependencyIndex`)를 쓰는 `it` 하나만 `core/engine/settle/__tests__/settle.branchless-feature-indexes.test.ts`로 나눈다. vi.mock의 경로 문자열은 import 구문이 아니라 검사기가 세지 않지만 형제 내부를 경로로 집는 것은 모델이 금지한 옆으로 닿기와 같은 결합이므로, 검사기가 못 보는 것을 허용으로 읽지 않고 선언한다. 이 사례와 "vi.mock 경로를 검사기가 세지 않음"은 마지막 filid 개선 결정의 재료다(294라운드 "잊지 말 것")." (`reviews/round-307-closing.md:25`)
  > 편집자 결정(308C-01): "【추론】 등록된 수치: 모델 검사 변 3743→3971; 시험 쪽 위로 닿기 253(D7 안 69)→77(전부 D7 세 디렉터리에서 루트 index로, D7 밖 0), 아래로 60→0, 옆으로 24→0; 제품 위로 1·아래로 1→0·0; 제품 organ→자식 27변과 settle↔derive 순환은 정돈-3 몫이라 그대로; index는 정돈-1 뒤 53항목(17 진입점)에서 48항목·43이름 삭제, 남은 5항목·4이름은 DETAIL 선언; 오류 코드 상수 37은 정돈-E 몫; 바깥 소비자 없는 뿌리 파일 0 유지; fractal 52→51(app이 organ으로). 본문에 더한 것: B8 첫 사례(부모 수준 비교 시험이 자식 내부를 vi.mock 경로로 집음, 선언 `src/core/engine/DETAIL.md:33`), 모듈 mock 경로도 의존 변으로 보고하자는 adapter 제안(filid가 이미 보는지는 미확인으로 적음), fractal→organ 강등 때 훅이 INTENT·DETAIL 삭제를 한 번 막은 사례, F3(config 면제가 통과로 셈)은 fd2a56c2f의 `.filid/config.json`에 면제가 남아 있음을 확인하고 유지. 모델 문서와 계보 감사는 fd2a56c2f 고정 링크로만 가리킨다. 이 이슈는 소유자가 마지막에 내릴 filid 개선 결정(294라운드)의 재료이며, 결정이 바뀌면 이슈 본문을 고친다." (`reviews/round-308-closing.md:9`)
  > 소유자(309라운드, 정돈 속도 지적): "아니 그.. 일반적인 파일 이름 변경이나 이동인데 이렇게 오래걸린다고?\n또 엄청 비효율적으로 일하는거 아닌지?" (`reviews/round-309-owner-answers.md:7`)
  > 소유자(309라운드, 이동 직접·게이트 한 번 허락): "그래 둘 다 허락한다. 바로 보내라." (`reviews/round-309-owner-answers.md:8`)
  > 소유자(310라운드, 벤치 매번 실행 물음): "벤치를 매번 돌릴 필요는 없지않나?" (`reviews/round-310-owner-answers.md:7`)
  > 소유자(310라운드, 벤치 연기 확인만·긴 절차 묶어 실행): "그래. 그렇게 해. 가능하면 오래걸리는 절차는 몇 개 작업을 한 후 한번에 실행했으면 한다. 문제가 생기면 그때 파악할 수 있는 정도 범위면 되지, 매 단계마다 모든 검사를 하는건 너무 과하다" (`reviews/round-310-owner-answers.md:8`)
  > 소유자(311라운드, 리뷰 뒤 밤의 속도 루프): "아 응 내가 볼 수 있는 단계 전단계로 마지막이냐는 것이었어.\n리뷰하면서 또 구조를 좀 더 잡아야지.\n그 다음에 오늘 밤에는 속도측정 및 개선 루프를 쭉 돌리려고 한다" (`reviews/round-311-owner-answers.md:7`)
  > 편집자 결정(312C-01): "【추론】 직접 확인: 병합 상태 CLEAN, 금지 경로 변경 0, 세션·공동 저자 줄 0, `.filid/config.json` 변경은 schema-form의 zero-peer-file 면제 한 줄 삭제뿐, 루트 `src/index.ts`는 모듈 경로(`./rolled`·`./hooks`)만 바뀌고 이름과 순서 동일. verifier: 빌드 뒤 열거 92개 이름이 정돈-2 기준과 동일(추가 0·삭제 0, 옮긴 선언 경로 14곳을 정규화하면 형 문자열 차이 0, dist에 미해결 별칭·`__tests__`·`__benchmarks__` 없음); unit은 첫 실행에서 `global-errors.timing.test.ts:95`의 벽시계 단언 하나(48.4 ms 대 40 ms, 병렬 부하)가 실패하고 재실행 통과, render·react18 통과, 합계 3826 통과·실패 0·할 일 1; lint 0(범위가 `core/__benchmarks__`까지 늘어남); 이름 바꿈 147건 중 유사도 90% 미만 21건은 문서 3·import 경로만 14·자기 경로 수정 1과 비이동 편집 둘; 삭제는 `types/rolled/index.ts` 하나이고 대응은 `src/rolled/index.ts`(이름 21개, 옛 와일드카드 집합과 정확히 같음), `types/index.ts` 58·`errors/index.ts` 69도 옛 집합과 동일; 가드 시험 둘(importModel·dependencyDirection)과 옮긴 시험 여섯이 unit 목록에 있고 시험 파일 수 609·벤치 11은 기준과 같다. 비이동 편집 둘은 `getControlExpression.ts`(구조적 `{ expressions }` 입력으로 일반화, 캐시가 색인을 저장; `Blueprint.expressions`가 readonly라 런타임 동일)와 `getCommittedDeclarationKey.ts`(`kind`를 `string`으로 넓힘, 형만)이며 B1(engine organ은 자식 fractal의 형을 import하지 않음)의 결과다. 병합 결과 1.0.0-beta는 eeb1bd374." (`reviews/round-312-closing.md:9`)
  > 편집자 결정(312C-02): "【추론】 D1 승격된 fractal(`hooks`·`types`·`rolled`)은 구현을 역할 구획(`hooks/hooks`·`types/types`·`rolled/types`)에 둔다. D2 `hooks/index.ts`가 새로 생기고(이름 7개) 루트 index는 모듈 경로만 바뀐다. D3 `FieldNode.ts`는 surface의 동명 구현이 아니라 `core/surface/classes/`로. D4 `.mjs` 11개(13이 아님)는 `bench/scripts/`. D5 형제 fractal 사이의 형 전용 순환(`FieldInputSlot`↔`FieldProxy`, 기준 트리에도 있음)은 고치지 않고 보고만 — 구조 리뷰 항목. D6 `types/rolled`는 `types`와 이름 18개가 겹쳐 `src/rolled`로(형제, D 예외 없음). 선택: (a) `getCommittedDeclarationKey`·`getControlExpression`은 구조적 입력(B1); (b) `errors/index.ts`는 와일드카드 대신 이름 목록(filid entry-points 0을 위해; 72→정돈-E가 61개 코드 이름을 object enum으로 대체); (c) bench 면제 셋은 `**/bench/legacy-compare/**`로 좁혀 유지(독립 레거시 스크립트 넷이 내부를 읽음); (d) core 안의 벤치는 core 자기 index 대신 `core/engine`·`core/surface` 관문을 읽음(자기 index는 U); (e) `round-87-measure.mjs`는 고정 커밋을 다시 빌드하므로 기준에서도 지금도 돌지 않음(경로는 고침) — 속도 계획에서 제외; (f) verifier가 derive 이동 뒤 `dependencyDirection.test.ts`와 lint의 no-any 블록이 derive를 빼먹은 것을 찾아 고침(금지 import에 붉어짐 확인). 원장 관리자가 더한 셋(속도 계획 사전 점검에서): vitest 벤치 include는 glob이 아니라 일곱의 이름 목록 유지, 독립 스크립트 넷은 모두 `bench/legacy-compare/`, 독립 스크립트 셋의 자기 경로 문자열 수정(typecheck·lint가 못 잡는 종류라 시작 확인은 자식 프로세스 경로를 지나게)." (`reviews/round-312-closing.md:17`)
  > 소유자(313라운드, 정돈-E도 codex 없이): "그래 정돈-E도 코덱스 없이 직접 하게 해" (`reviews/round-313-owner-answers.md:7`)
  > 소유자(314라운드, Form 재구성: 여섯은 fractal, 문서는 위임): "1. 프렉탈이야. \n2. 땡큐 누락 오타네. \n3. 응 문서화랑 기타 정리, INTENT.md 추가 등은 맡기고 싶어.\n\nINTENT.md 는 한국어로 써야돼. \n\n작업을 해줘." (`reviews/round-314-owner-answers.md:7`)
  > 편집자 결정(315C-01): "【추론】 확인: 병합 상태 CLEAN, 커밋에 세션·공동 저자 줄 0, 여섯 fractal(`FormCore`·`FormError`·`FormField`·`FormInput`·`FormLabel`·`FormRender`)이 각각 `index.ts`·`type.ts`·INTENT·DETAIL(한국어, behaviors fractal의 형식)을 갖고 filid validate가 `src/components/Form` 아래 0건으로 분류; 바운더리 입힌 바깥은 `FormCore.tsx`의 `FormCore`, 바운더리 없는 안쪽은 `FormRoot`이며 index는 별칭 없음; 공개 export(Form과 형 여덟)는 세 index 파일에 diff 없음; typecheck·lint·Form 시험 18파일 60건 통과(310라운드대로 전체 시험은 돌리지 않음). 편차 하나: `FormRoot.tsx`는 `FormCore` 뿌리가 아니라 `FormCore/components/`에 있다 — 뿌리에 동명 구현(`FormCore.tsx`) 외의 구현 파일이 있으면 zero-peer-file 결과가 나므로 모델(뿌리는 문서·진입점·동명 구현 하나)대로이고, 소유자가 뿌리에 두기를 원하면 `.filid/config.json` 면제가 필요하다. 이 모양("fractal 뿌리에는 문서·index·동명 조립 파일만; 자식은 `components/<이름>/` 아래 `index.ts`·`type.ts`·구현과 그 자식만 쓰는 `utils/`·`components/`")을 구조 리뷰의 표준 틀로 삼는다(소유자 "이 형태로 가면 좋겠다"). 비용은 한 파일짜리 fractal에도 문서 둘이 붙는 것이며 받아들인다. 병합 뒤 fixy08의 정돈-E는 옮겨진 `submitForm.ts` 때문에 rebase가 필요하다(알림 보냄)." (`reviews/round-315-closing.md:9`)
  > 소유자(316라운드, Form 재구성의 뜻: 컴포지션의 독립 컴포넌트): "음.. 나도 처음엔 Form 과 부속으로 나눴는데, 이게 다시 보니까 컴포지션 패턴이라, 사실 연관없는 독립 컴포넌트로 보는게 낫겠더라고.\n그래서 동일 위계로 놓았어.  \n\n다른걸 한번 보여줄래? 내가 훑어볼 수 있게.\n\n그리고 그럼 브랜치 정리해서 지금 스테이지된걸 대체해줘." (`reviews/round-316-owner-answers.md:7`)
  > 소유자(316라운드, constants·hooks는 organ, types는 fractal, Field를 Form처럼): "constant 랑 hooks 는 organ 이니까 index.ts 제거하고, 직업 import 를 해야겠다. \ntype 은 프렉탈로 취급해서 INTENT.md 를 하나 넣어주고. \n\n뭔가 문제가 있나? 크게 문제는 없어보이는데. \n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/components/Field 를 Form 처럼 좀 재구성해볼테냐?\n어떤 느낌을 선호하는지는 알거같은데 이제" (`reviews/round-316-owner-answers.md:8`)
  > 소유자(317라운드, Form barrel 삭제 확인·병렬 물음): "응 그건 지워도 돼. 그대로 진행해. 근데 음.. 이건 병렬로 안하는 이유가 있어? \n\n정돈 E -> 구조둘째손질 -> 정돈S 이걸 순서대로 한다는거지?" (`reviews/round-317-owner-answers.md:7`)
  > 소유자(317라운드, 검증 뒤 병합 위임): "아 오케이. 그럼 다 오면 확인해서 문제없으면 머지까지 해줘." (`reviews/round-317-owner-answers.md:8`)
  > 소유자(317라운드, surface/classes의 이름): "한가지 그럼 더. /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/core/surface/classes 이거 이렇게 나눈건 좋은데 classes 로 클래스가 늘어날 가능성은 없지않니? 단일 클래스로 구성을 바꿔버린거니까.\n차라리 그럼 runtime 이나 그런게 낫지 않을까? 어떻게 생각하니?" (`reviews/round-317-owner-answers.md:9`)
  > 소유자(317라운드, 셋째 손질: surface runtime, 단일 PR): "그래 셋째 손질로 fairy08에게 넘겨줘. \n\n손질수가 늘어난다고 느려지진 않겠지? 단일 PR로 잘 모아줘" (`reviews/round-317-owner-answers.md:10`)
  > 소유자(318라운드, fieldInputs를 입력마다 fractal로; ArrayItems 래핑 이유): "하나 더. \n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/fieldInputs 여기 하위 보면 \nutils 나 FieldInput 들이 어지러히 널려있다.\n\n이거 개별 FieldInput 마다 디렉토리로 묶어서 개별 프랙탈로 만들어줘. \n지금 보기도 좀 어렵고 그렇네.\nutils / type 등 organ 을 분리해주고, 개별 프렉탈의 index.ts 에 Definition 을 정의하면 좋을거같아. \n\n그리고 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/fieldInputs/components/FieldInputArray.tsx 이거 있잖아. FieldInputArray 이거 ArrayItems 이 컴포넌트를 래핑한 이유가 뭐야?? 기존 인터페이스 유지하려고 그런거야?" (`reviews/round-318-owner-answers.md:7`)
  > 편집자 결정(319C-01): "【추론】 직접 검증: 병합 상태 CLEAN, 세션·공동 저자 줄 0, 금지 경로 0; 빌드 뒤 `dist/index.d.ts` 열거 94개 — 정돈-2 기준 92개에 `FormErrorCode`·`FormWarningCode`만 더해지고 제거 0, 경로 정규화 뒤 형 문자열 차이 0; unit 2391 통과·할 일 1, render 722, react18 722(실패 0, 타이밍 시험도 이번 실행에서는 통과); 지운 코드 다섯은 `errors/__tests__/codeEnums.ledger.test.ts`가 "없음"을 단언하는 자리에만 남음; 제품 코드에 그룹 접두 리터럴 발화 0; `dispatchPush.ts`는 모든 경로가 number(거부·중첩 실패는 `readArrayLength`); 패키지 밖 변경은 ajv 플러그인 셋(bind 거부 Error의 group·code를 `FormErrorCode.ValidatorBindRefused` 값으로, 형만 import — 32C-02)과 그 README·CLAUDE.md의 코드 문자열 한 줄. 결정 묶음 열(E3 축소 범위 48멤버와 알려진 틈 — 종류별 합집합·자기 참조 5는 `surface.test.ts`; push 반환은 호출 뒤 길이 — 거부·중첩 실패는 커밋된 현재 길이, batch noop 경로는 도달 불가라 helper 공유만; context 형만 좁힘; aileron 리터럴 유지 + schema-form 쪽 검사 시험; options 키 목록 등 의도적 미변경; `FieldNodeWriteKind`를 `core/engine/types/value.ts`로; `isRenderableDateInputValue` 매개변수 좁힘; 내부 값 변화 — `MisfitRecord.code` 그룹 한정, 공개 형 `FormErrorRecord.code` 60→58; #379 기인 D 간선 수정)은 PR 본문대로 받아들인다. 병합 결과 1.0.0-beta는 8f4dce4ab. 남는 항목 둘: `global-errors.timing.test.ts`의 벽시계 한도(40 ms 절대값)가 전체 부하에서 흔들리는 것은 별도 항목; "클래스를 공개 형 매개변수로"는 구조 리뷰 뒤 별도 항목." (`reviews/round-319-closing.md:9`)
  > 소유자(320라운드, fieldInputs 자식은 components가 아니다): "components/ 하위가 아니라 fieldInputs/ 하위에 개별 프렉탈이 있어야 한다.\n그래서 /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/fieldInputs 이 이름도 적당하게 다른 이름이 되어야 하지 않나 싶다.. 기본 input 정의들이라.. \n\n디렉토리가 components 가 아닌 이유는 이게 컴포넌트가 아니라 FieldInputDefinition 이기 때문이다" (`reviews/round-320-owner-answers.md:7`)
  > 소유자(320라운드, 구획 이름은 fieldInputDefinitions): "fieldInputs/fieldInputDefinitions\n하위에 프랙탈을 만들어도 되겠네 그럼" (`reviews/round-320-owner-answers.md:8`)
  > 편집자 결정(321C-01): "【추론】 확인: `src/core/` 변경 0, 세션·공동 저자 줄 0, 공개 표면 불변; 슬롯은 `push`·`setValue`를 부르지 않고 사용자가 입력할 때 그 입력의 onChange(입력 기원 쓰기)로만 값이 들어가며(`fillArraySlot`은 그 자리까지의 배열을 만들고 앞의 빈 자리는 undefined로 남김 — 기존 명시적 슬롯 의미와 같음), 게이트로 minItems가 바뀌면 슬롯 수가 따라간다; 슬롯의 컨트롤은 자리 스키마를 따르고(string·number·integer·boolean, 그 밖은 "fill item" 버튼); 첫 시도의 `node.setValue`가 배열 입력을 다시 마운트해 포커스·행 identity를 잃는 것을 시험이 막는다. 문서(fieldInputs DETAIL, SPECIFICATION Array Limits en·ko, README 둘, agents 지식 둘)는 코드보다 먼저. 게이트는 typecheck·lint·관련 시험 1064·배열 스토리 4(310라운드대로 전체는 돌리지 않음). 병합 결과 1.0.0-beta는 a8277781f. 정돈-S의 보조 파일 셋과 시험은 구조-4에서 FieldInputArray fractal 안으로 옮긴다." (`reviews/round-321-closing.md:9`)
  > 편집자 결정(322C-01): "【추론】 확인: 세션·공동 저자 줄 0, 금지 경로 0, 삭제는 `constants/index.ts`와 `Form/components/index.ts` 둘뿐, 이름 바꿈 39건(Field 자식 셋이 `components/` 아래로, surface의 `classes/`가 `runtime/`으로 보조 둘과 함께), `src/index.ts` diff 없음; 결과 트리는 `components/Field/{components,__tests__,index,INTENT,DETAIL}`, `core/surface/{runtime,utils,…}`, `hooks`는 fractal 그대로(B1 때문에 organ으로 내리지 않음 — fairy08 지적, 편집자 결정 A, 소유자 보고). fairy08 게이트: typecheck·lint·63파일 325시험(가드 U·D·S1·B1 모두 0, #379의 D 간선 해소)·filid validate(기존 둘만 남음)·Prettier. rebase 충돌은 `fieldNodeFactory.ts` import 블록 하나(정돈-E 쪽 유지, 경로만 `../runtime/FieldNode`). 병합 결과 1.0.0-beta는 496148de7. 구조 리뷰에서 지금까지 들어간 것: Form(#379), constants·Form barrel·Field·surface runtime(#382); 진행 중: fieldInputs(구조-4, fixy08), CLAUDE.md(정돈-4, fairy08)." (`reviews/round-322-closing.md:9`)
  > 편집자 결정(323C-01): "【추론】 루트 `CLAUDE.md`에 "Module Contract Principles" 절(Agent Assets와 Quick Reference 사이): index.ts는 계약 기록(이름 열거, 와일드카드 없음), 뿌리는 첫인상(문서·index·동명 구현 하나, 나머지는 역할 구획이나 자식 fractal), 소비자는 fractal 밖 제품 코드(시험·벤치·스토리는 아님), import는 계보를 따름(위로 열림·아래로 닫힘·옆으로 닫힘, organ에는 index 없음, organ은 소유자의 자식 fractal을 가져오지 않음, 자기·조상 index 금지), 시험은 안에서 검증(D7 예외), 안 쓰는 뿌리 파일·export는 결함(`seiri_reuse-first` §3의 허용은 적용 안 됨); 개발 흐름 7항 추가. 패키지 `CLAUDE.md`에 "Fractal Contracts in This Package" 절(Validation Modes 뒤): 단일 공개 표면과 병합 전 열거, 표준 fractal 모양(Form·Field·surface/runtime·constants organ·hooks fractal과 B1), 시험·fixture 자리(D7·B8), 벤치는 `__benchmarks__`와 범위 좁힌 legacy-compare 면제, 오류 코드는 `FormErrorCode`·`FormWarningCode`, `__legacy__` 동결; Node System 항목은 레거시 클래스 위계 대신 단일 런타임 클래스 `FieldNode`(`core/surface/runtime/`)와 종류 합집합·가드·strategy·공개 팩토리 없음으로 교체(초안 C·D, 경로는 정돈-3·구조 손질 뒤로 갱신). 사실은 881dd2487 트리로 확인. 문서라 게이트 없음. 병합 결과 1.0.0-beta는 3d9082f2d. 이로써 정돈 단계 전부(정돈-1 #374, 2 #377, 3 #378, E #380, S #381, 4 #383)와 구조 리뷰 손질 1–3(#379, #382)이 들어갔고, 남은 구조 작업은 구조-4(fieldInputs, fixy08)와 소유자의 추가 손질이다." (`reviews/round-323-closing.md:9`)
  > 소유자(324라운드, 밤 루프는 보고 결정, 대기): "오늘 밤 루프는 작업 보고 있다가 결정할거에요. 지금은 일단 대기.\n아직 안끝난거죠? /Users/Vincent/Workspace/albatrion/packages/canard/schema-form/src/fieldInputs 이게 아주 엉망이군요" (`reviews/round-324-owner-answers.md:7`)
  > 편집자 결정(325C-01): "【추론】 확인: 세션·공동 저자 줄 0, 금지 경로 0, `.filid/config.json` 변경은 `structure.organNames`에 "fieldInputDefinitions" 한 항목(설치된 filid 0.14.0이 `additionalOrganNames`를 모르는 키로 버리고 indeterminate를 내므로 fixy08이 읽히는 키로 바꿈 — 저장소 규칙 문서 `.claude/rules/filid_fractal-boundaries.md` §1은 여전히 `additionalOrganNames`라 적혀 있어 플러그인 쪽 불일치, filid 개선 결정 재료), 루트 index diff 없음, 이름 바꿈 24·삭제 2; 결과 트리는 `fieldInputs/{INTENT,DETAIL,index.tsx,__tests__,fieldInputDefinitions/}`와 열한 fractal 각각 `index.ts`(Definition)·컴포넌트·`type.ts`(필요 시)·INTENT·DETAIL·`components/`·`utils/`. fixy08의 선택: array-memo 시험은 자기 진입점 대신 구체 컴포넌트를 import(U 간선 회피), `drafts.test.tsx`는 두 입력에 걸쳐 뿌리 `__tests__`에, FieldInputString 진입점은 Union이 감싸므로 컴포넌트도 내보냄, `DateInputType` 등 지역 형은 각 `type.ts`로, 벤치 스크립트 하나의 경로 갱신. 게이트(한 번): typecheck·lint 0, 65파일 423 통과(가드 둘 포함), 표면 94 동일, filid validate 0. 병합 결과 1.0.0-beta는 307728a6d. 이로써 소유자 구조 리뷰 손질 1–4가 모두 들어갔고 작업자 둘은 대기한다(324라운드)." (`reviews/round-325-closing.md:9`)
  > 소유자(326라운드, Field의 본체는 FieldProxy): "아.. 근데 Form 처럼, 출력되는게 FieldProxy 하나면 Field가 아니라 FieldProxy 로 해야하는거 아닌가? 프렉탈의 본체가 FieldProxy잖아" (`reviews/round-326-owner-answers.md:7`)
  > 소유자(326라운드, 다섯째 손질 진행, 약식 전체 게이트): "음 응 진행시켜봐. 이거까지 머지하고 전체 게이트를 한번 돌려.\n게이트는 너무 오래걸리지 않게 약식으로 돌리고, 문제가 생기면 그때 자세히 하도록" (`reviews/round-326-owner-answers.md:8`)
  > 편집자 결정(327C-01): "【추론】 확인: 세션·공동 저자 줄 0, 금지 경로 0, 루트 index diff 없음, 결과 트리는 `components/FieldProxy/{INTENT,DETAIL,index.ts,FieldProxy.tsx,type.ts,__tests__,components/{FieldInputSlot,DeferredFieldProxy}}`. 약식 전체 게이트(326라운드): typecheck·lint 0, unit·render·react18 한 번 567파일 3841 통과·할 일 1·실패 0, 표면 열거 94 동일, filid 새 지적 0(기존 형 전용 순환과 시험 상한만). fixy08의 선택 둘: 부품 둘이 뿌리 `type.ts`의 `FieldProxyProps`를 위로 가져오는 import 세 곳을 filid가 경계 우회로 판정하므로 원칙 4(위로 열림)를 근거로 `FieldProxy/DETAIL.md`의 Boundary Exemptions에 선언 — 이것은 "모델의 위로 열림을 filid가 fractal 뿌리 파일에는 허용하지 않음"이라는 filid 개선 결정 재료(294라운드)다; 옛 경로가 남은 `docs/ko/MOBILE_PERFORMANCE_REPORT.md`와 bench 스크립트 둘은 변경 전부터 낡아 그대로(속도 계획 개정 때 처리). 패키지 CLAUDE.md의 경로 한 줄 갱신은 사실 갱신이라 허용. 병합 결과 1.0.0-beta는 c2d5f737e. 구조 리뷰 손질 1–5 완료." (`reviews/round-327-closing.md:9`)
  > 소유자(328라운드, INTENT·DETAIL 전부 한국어로, humanizer, 병렬): "한가지만 더 요청하지. @fairy08 에게 요청하게.\n현재 INTNET.md / DETAIL.md 문서가 한글이 아니라 영문으로 쓰여진게 좀 있는거같네. \nschema-form 범위에서 이들 문서를 모두 한글로 작성하되, \n/humanizer 를 사용해서 거슬리지 않는 문장으로 작성해주길 바라네.\n\n최대한 병렬로 빠르게 끝냈으면 좋겠군 \n이때는 codex 대신 sonnet 이나 agy 를 사용해서 빠르게 작업해주게" (`reviews/round-328-owner-answers.md:7`)
  > 편집자 결정(329C-01): "【추론】 확인: 변경 96개가 모두 INTENT·DETAIL, 세션·공동 저자 줄 0, 표본 문장 자연스러움. 분류 138 = 영문 9 + 혼재 111 + 한국어 18; 대상 120 중 96 수정(24는 읽을 만해 그대로). verifier가 찾은 의미 변경 43건(우선순위 방향 역전, import 방향 역전, AND→OR, 덧붙은 "만", "않는다"→"못한다", 형용사 비문)은 모두 원문 뜻으로 되돌렸다. 원장 관리자의 추가 요구 둘을 반영: (1) 한 파일 안에 -습니다와 -다가 섞인 10개를 -다로 통일(패키지 관례: -다 문장 1032 대 -습니다 415; 원래 -습니다로 일관된 33개는 유지) → 섞인 파일 0; (2) `app/plugin/INTENT.md` 12행의 "선입 우선(prepend)"은 `PluginManager.ts:78-81`대로 "나중에 등록한 정의를 목록 앞에 붙여 먼저 매칭한다"로 정정(원문 주장이 코드와 달랐음). 검증: filid documents 0(645 통과, 전과 같음), 문서 수 138 불변, 제목·백틱·펜스·목록·표 수 전후 동일, 영문만 된 본문 줄 0. 남은 것: 큰 문서(settle DETAIL 등)의 명사형 문장은 어미만 다듬어 빽빽함이 남고, 경계 면제 라벨(Consumers/Direct import/Reason)은 filid 훅이 요구해 영문. 병합 결과 1.0.0-beta는 d25a8aee8." (`reviews/round-329-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-80-closing.md:17`(정본)
- 닫은 사람: 편집자 결정(80라운드, `reviews/round-80-closing.md` 80C-02)
- 라운드: 80
- 까닭: `reviews/round-80-closing.md:19`

### LANDING-211 설계 최적화 단계(446라운드) — 8단계 뒤, 9단계 앞에 코어 설계 수정 단계를 둠(443C-01의 "8단계가 마지막 코어 수정" 대체), 계획서는 `plan/design-optimization/`, 가지는 8단계 가지 위에 쌓고 #445 병합 뒤 base를 `1.0.0-beta`로, PR 규칙은 그대로

- 결정:
  > 【추론】 소유자가 8단계 이후 작업을 명시적으로 허용했다(위 5행). 따라서 443C-01의 "8단계가 코어 로직 수정의 마지막 단계"와 `reviews/README.md` 운영 원칙 21의 앞 절("9단계에는 코어 로직 수정이 없고")은 이 라운드로 대체된다: 8단계 뒤, 9단계 앞에 **설계 최적화** 단계를 둔다. 9단계의 범위(문서 정리, 레거시 디렉터리 제거, 타입 보강, 릴리스 전 벤치 재실행, 릴리스 전환 시점)는 그대로이고 9단계 자체에는 코어 로직 수정이 없다. 계획서는 PROCESS-067대로 `plan/design-optimization/`의 문서 셋(`request.md`·`verification.md`·`adr-and-axes.md`)이며, 이 단계는 성능 최적화 작업(`plan/perf-optimization/`)의 게이트·측정 원칙·채택 규칙을 그대로 물려받고 "결정을 바꿔야 빨라지면 설계 변경이고 라운드가 먼저다"라는 그 계획의 전제만 바꾼다 — 설계 변경은 이 단계의 목적이며, 바뀌는 결정은 코드보다 먼저 라운드 항목으로 들어간다. 가지는 `feat/schema-form-design-optimization`이고 최종 PR #445가 병합되지 않았으므로 8단계 가지 `feat/schema-form-08-review-and-perf`의 끝 `6692e7f69` 위에 쌓으며, 이 단계의 PR은 그 가지를 base로 열고 #445가 `1.0.0-beta`로 병합되면 base를 `1.0.0-beta`로 옮긴다. 가설이나 작업 하나에 PR 하나, DETAIL 커밋이 코드보다 먼저, 네 관문·전후 배달 비교 차이 0·수정 전에 실패하는 새 시험·다른 모델 가족의 독립 검토 뒤 병합, 단계 루트 PR의 병합은 소유자 몫이라는 규칙은 그대로다.
- 보충:
  > 소유자(446라운드, 8단계 뒤 작업의 허용과 역할): "좋아. 8단계 이후 작업을 명시적으로 허용한다.\n작업계획을 작성하고, 실험 및 검증을 진행한다.\n\n/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture/AGENT-POLICY.md 를 기반으로 다중에이전트를 사용하고, \n너는 설계 이후에는 원장관리자이자, 오케스트레이터로 작업하라.\n\n계획 작성을 시작하고, 결정이 필요한 사항이 나오면 원장의 설계원칙을 참고하여 결정하되, 결정사항 등을 기록해서 나에게 보고하라.\n\n/orchestration" (`reviews/round-446-owner-answers.md:11`)
  > 소유자(446라운드, 이후 작업의 위임): "이후 작업은 너에게 위임한다. 안정적인 작업으로, 설계 개편과 오류 수정, 테스트와 벤치마크까지 완료하여 PR 생성 및 검증까지 마무리하라." (`reviews/round-446-owner-answers.md:12`)
  > 소유자(449라운드, 분기 전환의 잠정 수용과 진행 방향): "일단 수용으로 넘어가고, 마운트까지 작업해.\n너의 임의판단을 넣은 부분은 추후 전부 재검증 대상이니, 임의판단보단 1차 계획대로 진행하도록 해줘.\n그렇게 마운트까지 검증을 마치고,\n분기전환에 대해서는 다시 검토하자. 어때?" (`reviews/round-449-owner-answers.md:7`)
  > 소유자(450라운드, 재측정과 병합 권한): "다시 재도록. 그리고 해당 단계는 8단계와 분리된 설계최적화 브랜치에서 가지 pr들을 머지하도록 해라. \n네가 만든 pr은 네가 머지할 수 있다." (`reviews/round-450-owner-answers.md:7`)
  > 소유자(451라운드, #470의 노드당 힙 증가 수용): "받아들입니다. 작업이 완료된 worktree 나 브랜치는 정리하면서 진행하세요" (`reviews/round-451-owner-answers.md:7`)
  > 소유자(451라운드, 가지 정리): "지금 깔끔하게 관리되던 깃레일이 엄청 더러워졌거든요? 필요한것만 깔끔하게 정리하세요." (`reviews/round-451-owner-answers.md:8`)
  > 소유자(451라운드, 생존 신호의 처리): "생존신고로 계속 컨텍스트 낭비를 하는거 아닌가? 이게 정식 사용법이야?" (`reviews/round-451-owner-answers.md:9`)
  > 소유자(451라운드, 에이전트 정책의 수정): "이전에도 비슷한 지적을 했는데 고쳐지지 않았다. 에이전트 정책에 혹시 기록이 있나? 그걸 수정하던가 하라" (`reviews/round-451-owner-answers.md:10`)
  > 소유자(451라운드, 완료 보고의 형식): "검증 및 작업 완료시 최종 결과를 정리해서 표와 함께 표시하도록 해줘" (`reviews/round-451-owner-answers.md:11`)
  > 소유자(451라운드, D3b-2의 힙 수용, 세 판 비교, 병합 방법): "받아들입니다. 현행 작업 마무리까지 진행하세요. 해당 브랜치 작업으로 0.16.1, 작업이전, 작업이후 각각 비교를 구하고 pr에 수록하세요.\n머지 방법은 스쿼스 머지입니다." (`reviews/round-451-owner-answers.md:12`)
  > 소유자(452라운드, D4 관문 미달의 처리와 세 물음): "분기전환에 대해서는 다음 단계에서 집중적으로 다룬다. 설계의 대규모 개편 없이 도달 가능한 상한으로 기록하면 된다.\n형제 선형항은 무슨 의미인가? 차이가 너무 큰데. 힙당 크기는 수용 가능하다. \n청사진 캐싱으로 충분한 속도 가속이 나오지 않은 이유는 매번 청사진 캐시를 비운 까닭인가? 그리고 react 벽시계는 뭘 말하는건가? 용어가 이상하다" (`reviews/round-452-owner-answers.md:7`)
  > 소유자(452라운드, 갱신 경과 시간과 Profiler의 차이 검토): "갱신경과시간이 커밋 프로파일과 다른걸 검토하라. 엔진작업이 끝나야 리엑트 트리에 반영할텐데 어떻게 차이가 나는거지?" (`reviews/round-452-owner-answers.md:8`)
  > 소유자(452라운드, 러너 수정 뒤 다음 단계): "이 문제까지 수정하고 다음으로 간다. 분기전환은 분기전환 문제에만 집중하기 위함이다" (`reviews/round-452-owner-answers.md:9`)
  > 소유자(453라운드, 분기 전환 단계의 개시): "좋아. 이제 분기 전환에 집중한다. 이건 oneOf로 대표되지만 모든 브랜치 분기에 해당할 것이라 생각한다.\n해당 문제에 대해서 설계로 풀어보도록 한다." (`reviews/round-453-owner-answers.md:7`)
  > 소유자(453라운드, 관문 유지와 검증기 분기의 포함, 설계안 요청): "그래. 그리고 path는 다르지만 if-then 구문을 사용한 검증기 브랜치 전환도 대상에 넣도록 해. 아마 내부적으로 사용하는 경로는 동일할거고, 검증 경로만 함수식이 아니라 검증기일거라서. 물론 검증기를 사용한 브랜치 운영은 기존 사례가 없으니까 앞선 개선과 맞물리도록 개선하는걸 최우선으로 하자. 설계안 보여줘봐. 어떻게 바꾸고자 하는지" (`reviews/round-453-owner-answers.md:8`)
  > 소유자(453라운드, 설계안의 허가와 진행 방식): "네 진행을 허가합니다. 멀티에이전트 작업으로 진행하세요" (`reviews/round-453-owner-answers.md:9`)
  > 편집자 결정(450C-02): "【추론】 소유자가 이 단계는 8단계와 분리된 설계 최적화 가지에서 가지 PR들을 병합하고, 오케스트레이터가 만든 PR은 오케스트레이터가 병합할 수 있다고 했다(위 1행). 병합 대상은 `feat/schema-form-design-optimization`이다. 측정과 독립 검토를 마친 PR #463~#469는 개별 squash 대신, 그 일곱을 이미 합쳐 측정한 통합 가지 `integration/schema-form-d2`를 병합 커밋 하나로 들였다(829c217e0). 그 결과의 `src`와 `package.json`은 측정한 통합 판과 바이트 단위로 같고, 다른 차이는 그 사이 단계 가지에 쌓인 원장과 결과 문서뿐이다. GitHub은 일곱 PR을 병합됨으로 표시했다. 개별 squash를 쓰면 #464와 #466의 `settle/DETAIL.md` 문서 충돌을 다시 풀어야 하고, 측정한 판과 다른 판이 들어갈 수 있기 때문이다. #470(D3b-1)은 Bun 노드당 힙이 기준 최댓값보다 1.465 B(+0.066 %) 커서 TEST-027의 소유자 수용이 남았다. 병합 권한이 그 수용까지 대신하지는 않으므로, base만 설계 최적화 가지로 옮기고 수용 뒤에 병합한다. 앞으로 오케스트레이터가 만든 PR은 독립 검토를 통과하고 TEST-027 같은 수용 조건이 없으면 오케스트레이터가 병합한다. 8단계 가지와 #445는 손대지 않는다." (`reviews/round-450-closing.md:10`)
  > 편집자 결정(452C-06): "【추론】 D4의 관문 다섯은 일괄 입력 nested(1.13배, 4.05 ms)와 게이트 잎 쓰기(최대 1.17배)가 통과, 분기 전환·형제 선형항·Bun B2가 미달이었고 셋은 452C-01~03으로 처리했다. 단계의 성과는 일괄 입력이 S 대비 0.45~0.56배(L의 1.13~1.23배), React 배열 갱신 0.11~0.57배, React 마운트 0.80~0.85배이고, 분기 전환·중첩 마운트는 S 대비 0.93배에 그쳤다. 단계 루트 PR #472(설계 최적화 가지에서 8단계 가지로, #445 병합 뒤 base를 `1.0.0-beta`로)는 세 판 비교표와 관문 판정, 소유자 결정을 본문에 싣고 초안으로 두며 병합은 소유자 몫이다. 남은 가지는 8단계 가지·단계 가지·D2-P5 셋, 남은 worktree는 없다. 다음 단계는 분기 전환에만 집중하며(위 3행), 그 계획서는 새 라운드에서 연다. 재검증 목록(447·448라운드의 편집자 판단, 449C-04, 451C-03의 두 판정)과 대기열 65·66·67은 그 단계의 첫 라운드로 넘긴다." (`reviews/round-452-closing.md:18`)
  > 편집자 결정(453C-01): "【추론】 452C-01이 분기 전환을 다음 단계의 유일한 주제로 넘겼고 소유자가 그 단계를 열었다(위 1행 "이제 분기 전환에 집중한다", 위 3행 "진행을 허가합니다"). 단계는 설계 최적화 단계 뒤, 9단계 앞이며 계획서는 `plan/branch-switch/`다. 가지 `feat/schema-form-branch-switch`는 설계 최적화 가지(`feat/schema-form-design-optimization`, b8db53997) 위에 쌓고, #472와 #445가 병합되면 base를 옮긴다. PR 규칙(가설 하나에 PR 하나, DETAIL 선행, 스쿼시 병합, 독립 검토, 원장 검사)은 LANDING-211·451C-04 그대로다. 보류한 D2-P5 가지 `perf/schema-form-d2-sibling-linear`(4681c0aff)는 이 단계의 B2 자료이며, 그 PR이 병합되거나 폐기될 때 지운다. 이 단계의 범위는 분기 전환뿐이고 마운트·일괄 입력의 추가 최적화는 하지 않는다(452라운드 위 3행 "분기전환 문제에만 집중")." (`reviews/round-453-closing.md:8`)
- 상태: 현행
- 출처: `reviews/round-446-closing.md:8`(정본), `reviews/round-446-owner-answers.md:11`, `reviews/round-446-owner-answers.md:12`
- 닫은 사람: 소유자 답(`reviews/round-446-owner-answers.md:11` "좋아. 8단계 이후 작업을 명시적으로 허용한다."), 편집자 결정(446라운드, `reviews/round-446-closing.md` 446C-01)
- 라운드: 446
- 까닭: `reviews/round-446-owner-answers.md:11`

### LANDING-212 분기 전환 단계(453라운드) — 설계 최적화 단계 뒤·9단계 앞, 계획서는 `plan/branch-switch/`, 가지 `feat/schema-form-branch-switch`는 설계 최적화 가지 위에 쌓고 #472·#445 병합 뒤 base를 옮김, PR 규칙은 LANDING-211·451C-04 그대로, 보류한 D2-P5 가지는 B2 자료, 범위는 분기 전환뿐

- 결정:
  > 【추론】 452C-01이 분기 전환을 다음 단계의 유일한 주제로 넘겼고 소유자가 그 단계를 열었다(위 1행 "이제 분기 전환에 집중한다", 위 3행 "진행을 허가합니다"). 단계는 설계 최적화 단계 뒤, 9단계 앞이며 계획서는 `plan/branch-switch/`다. 가지 `feat/schema-form-branch-switch`는 설계 최적화 가지(`feat/schema-form-design-optimization`, b8db53997) 위에 쌓고, #472와 #445가 병합되면 base를 옮긴다. PR 규칙(가설 하나에 PR 하나, DETAIL 선행, 스쿼시 병합, 독립 검토, 원장 검사)은 LANDING-211·451C-04 그대로다. 보류한 D2-P5 가지 `perf/schema-form-d2-sibling-linear`(4681c0aff)는 이 단계의 B2 자료이며, 그 PR이 병합되거나 폐기될 때 지운다. 이 단계의 범위는 분기 전환뿐이고 마운트·일괄 입력의 추가 최적화는 하지 않는다(452라운드 위 3행 "분기전환 문제에만 집중").
- 보충:
  > 소유자(453라운드, 분기 전환 단계의 개시): "좋아. 이제 분기 전환에 집중한다. 이건 oneOf로 대표되지만 모든 브랜치 분기에 해당할 것이라 생각한다.\n해당 문제에 대해서 설계로 풀어보도록 한다." (`reviews/round-453-owner-answers.md:7`)
  > 소유자(453라운드, 설계안의 허가와 진행 방식): "네 진행을 허가합니다. 멀티에이전트 작업으로 진행하세요" (`reviews/round-453-owner-answers.md:9`)
  > 소유자(455라운드, 물음의 요청): "물어볼 내용 있으면 물어보거라." (`reviews/round-455-owner-answers.md:7`)
  > 소유자(455라운드, 재측정과 프로토콜 보강의 승인): "1. 승인. \n2. 승인" (`reviews/round-455-owner-answers.md:8`)
  > 소유자(456라운드, 재승인과 창 구성의 지시): "재승인. 이번엔 잘 구성해서 해보도록" (`reviews/round-456-owner-answers.md:7`)
  > 소유자(457라운드, 결과 보고의 방식): "그래. 결과 보고 확인하자. 결과는 짧게 추세만 보도록.\n이게 최종안이 아니니까, 너무 시간을 많이 쓰지 않고 판정만 했으면 해." (`reviews/round-457-owner-answers.md:7`)
  > 소유자(457라운드, 1차 확인의 요청): "그래 지금 올려줘" (`reviews/round-457-owner-answers.md:8`)
  > 소유자(457라운드, 설계 Ⅱ 착수): "A로 가자. 설계를 미리 하고 롱턴 작업을 위임하고싶어." (`reviews/round-457-owner-answers.md:9`)
  > 소유자(457라운드, PR 본문의 기계 로컬 경로): "아 그리고 PR 본문에 \"/private/tmp/claude-501/perf-runs/20261027T1501-e8c1229-b2p2\" 이렇게 임시파일 경로를 쓰면 어떻게하니. 이럼 PR의 의미가 없잖아" (`reviews/round-457-owner-answers.md:10`)
  > 소유자(458라운드, 진행 브리핑): "현재 진행 상황 짧게 브리핑해줘.\n지금부터 롱턴작업 가능한가?" (`reviews/round-458-owner-answers.md:7`)
  > 소유자(458라운드, 롱턴 자율 진행): "너의 작업 제외, 모두 꺼줄게. 이제 네가 파워조절을 하면서 진행하도록 해. \n끊기지 않게 목표한 작업을 모두 진행하도록." (`reviews/round-458-owner-answers.md:8`)
  > 소유자(460라운드, 결함 검토와 이정표): "기존 결함들을 좀 보자. 결함까지 수정되면 2차 설계로 한번 이정표를 찍고, 3차를 들어갈지 여부는 추후 결정할게" (`reviews/round-460-owner-answers.md:7`)
  > 소유자(460라운드, (a)의 설명 요구와 와일드카드 해법 요구): "잠깐. 와일드카드쪽 문제는 대충 이해가 되는데, 첫 번째 문제는 무슨말인지 모르겠어. 예시와 상황조건을 더 알려줘.\n와일드카드는 이전에도 고민을 하다가 그냥 * 단독 키는 지원하지 말자는 다소 나이브한 결론을 냈었어. 그런데 이걸 해결할 수 있는 좋은 방법이 있다면 제안했으면 해\n복수선택을 위한 와일드카드 문법과 상대경로 문법 등은 우리 시스템이 쓰는 독자 문법인건 맞으니까 빼버릴 수는 없잖아. 그렇다고 이스케이프를 확장해서 ~2 ~3 ~4 로 가는건 완전 비표준으로 가는 길이고. 동일한 이슈가 ../ ./ 에도 있지 않아?" (`reviews/round-460-owner-answers.md:8`)
  > 소유자(460라운드, 퍼센트 인코딩의 부담): "a는 첫째 안으로, b는 좀 고민되는데, 그럼 .. @ . # * 이런걸 키로 쓰지 않는 일반적인 경우에도 퍼센트 인코딩을 해서 path를 써야하는거 아니냐? 저런걸 키로 쓰는 경우에만 인코딩을 판정하는건 말이 안되고, 항상 모든 키가 인코드 되어있을거라고 상정하고 봐야되는데, path를 쓰는 사람 입장에서 너무 불편할거같은데" (`reviews/round-460-owner-answers.md:9`)
  > 소유자(460라운드, 두 안의 승인과 경로 처리의 공통화): "그래. 둘 다 추천안대로 진행해.\n그리고 이 path 해석하고 처리하는 부분을 공통화해서 path 처리나 split 이 여기저기에서 일어나지 않도록 잘 격리해줘." (`reviews/round-460-owner-answers.md:10`)
  > 소유자(460라운드, 구현 에이전트의 배분): "코덱스를 꽤 많이 써서, agy나 특히 cursor를 좀 더 써야할거같아. 여긴 codex처럼 플랫폼 가이던스가 명확하지 않을 수 있으니까 지시사항을 명확하게 전달하고, 검증을 좀 철저히 하면서 사용하도록 해. (코드 스타일이나, 주석이나 문서의 언어, 어투, 의미, 오류 가능성이나 규칙위반이 보통 이런 에이전트가 한 작업물에서 많이 나오더라고) 이건 품질을 유지하는 역할을 맡아주되, 토큰효율화를 위해서 운용한다는 관점으로 접근해줘\n\n지금 위임한 작업까진 코덱스가 해도 돼. 그 이후를 말하는거야" (`reviews/round-460-owner-answers.md:11`)
  > 소유자(460라운드, 에이전트 사용 규칙의 갱신): "그럼 에이전트 사용 규칙을 한번 업데이트 할게.\n지금 보니까 codex 는 잔량 5%, gemini 는 Argon 기준 15% 정도 남았어.\n이후 codex 나 agy가 동작중에 멈출 수 있는데, 그럼 가벼운 작업은 cursor 나 agy gemini flesh4를 사용하고,\n복잡한 작업은 claude opus 나 sonnet 을 쓰도록 해. \n\nclaude 사용량이 너무 올라가면 그때 다시 비율 조정을 해줄게." (`reviews/round-460-owner-answers.md:12`)
  > 소유자(460라운드, codex 복귀): "codex 사용량이 복구되었네. \n이제부터 agent 사용 정책에서 codex 를 다시 사용해도 돼. cursor 와 gemini-fresh 를 사용하는 케이스는 별로 없으니까 코드수정 및 설계 등은 다시 codex 를 쓰도록 해" (`reviews/round-460-owner-answers.md:13`)
  > 소유자(460라운드, 검증 스케줄): "수정 자체보다 검토가 오래걸리네. 좀 더 스마트하게 검증하도록 스케줄링을 해봐." (`reviews/round-460-owner-answers.md:14`)
  > 소유자(460라운드, 동작 무결함의 보장): "기본적으로 벤치 측정은 아니더라도, 로직이나 동작은 무결함을 보장해야돼. 머지 후 벤치 단계에서 테스트 실패가 발생하면 백트래킹 비용이 너무 크니까. \n측정 게이트를 효율화 하는데, 동작 자체는 무결함을 보장하고 올려" (`reviews/round-460-owner-answers.md:15`)
  > 소유자(460라운드, 측정 담당의 전환): "이거 속도측정도 굳이 codex가 안해도 되지 않을까? 중간에 바꿀 수 있어?" (`reviews/round-460-owner-answers.md:16`)
  > 소유자(460라운드, Orca CLI 규칙 요청): "기다리는동안 너한테 부탁 하나 할게.\n\n@/Users/Vincent/.claude/rules/ 에다가 orca 를 위한 신규 규칙을 하나 만들고,\n여기에 오르카 스킬이나 cli을 사용할때의 변용(내가 원하는 설정)을 구현하고싶어.\n\n지금 보면 하트비트가 계속 오고있잖아. 그걸로 네 컨텍스트도 더러워지고.\n이걸 해소하기 위해 아래와 같이 cli를 쓰도록 작성해줘.\n\n너 자신도 이번 세션에서 이렇게 오르카 cli을 사용하고" (`reviews/round-460-owner-answers.md:17`)
  > 소유자(460라운드, 슬래시 하나의 뜻): "폼 경로 문법에서 슬래시 하나(/)는 \"빈 이름 속성\"인데 검증기 오류 경로에서는 루트 별칭입니다. 이 문장이 이해가 잘 안되는데, 경로 문법에서는 슬래시 하나의 위치에 따라 다르지 않아? 이게 달라지는 문제때문에 경로 해석을 공통화 시켜야 한다고 생각했던거라.... 이게 이슈라면 공통해석을 통해서 해소하길 바라. 모든 경로는 동일한 해석함수로 해석되었으면 해서. \n이 문제가 생긴 위치랑 상황, 예시데이터를 알려줄래?" (`reviews/round-460-owner-answers.md:18`)
  > 소유자(460라운드, 편의 기능의 유래 확인): "아 이 문제구나. 흠... /하나를 루트로 해석하게 한건 일종의 편의기능이었는데. 유닉스 path시스템을 따라서 한거였거든. 근데 그게 결과적으로 표준이탈로 이어진거구나. 추천은 슬래시 하나는 '/' +'' 로 해석해서 루트 아래에 빈 문자열 키로 해석하자는거지? 그게 표준에 맞으니까" (`reviews/round-460-owner-answers.md:19`)
  > 소유자(460라운드, 슬래시 통일 승인): "그래 그렇게 하자. 일관성으로 통일" (`reviews/round-460-owner-answers.md:20`)
  > 소유자(461라운드, 개발환경 삭제와 판단 재료): "일단 둘째, 개발환경 삭제 허용. 셋째 알려진 한계와 지금 시점(설계2)의 속도 비교표를 보여줘. 그걸 보고 단계3을 갈지 말지 결정할게" (`reviews/round-461-owner-answers.md:7`)
  > 소유자(461라운드, 보강 가능성의 물음과 관찰): "알려진 한계에 대한 보강은 가능한가? \n그리고 몇가지는 성공적으로 속도 개선에 성공했지만, 일부 느려진 부분도 있고 전혀 해결하지 못한 부분도 있군." (`reviews/round-461-owner-answers.md:8`)
  > 소유자(461라운드, 보강 PR 우선과 설계 Ⅲ 준비): "오케이 4속도는 설계3의 문제니까 보강 PR을 먼저 수정한다. 전용 오류코드 구성 허용하고, 명확하게 느려진 항은 이유가 있는 느려짐이면 수용 가능하다. 다만 무의미하게 느려진거면 복원해야한다. 느려진 사유를 특정할 필요가 있겠다. 이 작업을 위임하고, 너는 설계3을 준비하라" (`reviews/round-461-owner-answers.md:9`)
  > 소유자(461라운드, 설계 Ⅲ 착수): "흠. 설계 3으로는 형제1000을 해결하는 방향은 되겠는데, oneof 게이트를 극단적으로 줄이긴 어렵군.\n설계4를 한다면 3을 시도하고 진행하는게 필요하단건가?" (2026-10-28, 원장 세션); "좋아 설계3 진행. 그 다음 다시 측정하고 설계4를 검토해보자." (`reviews/round-461-owner-answers.md:10`)
  > 소유자(461라운드, 창 중단의 반복과 스케줄): "오늘 하루종일 측정창에 의한 지연이 계속 발생하고 있잖아.\n앞으로는 이런 실수가 반복되지 않도록 잘 좀 스케줄링 하도록 하렴." (`reviews/round-461-owner-answers.md:11`)
  > 소유자(462라운드, 한계와 설계 Ⅲ 시작): "현 시점에서 그럼 발견된 \"한계\"는 아직 없는거지?\n설계3 시작하고, 내가 실행해줘야 하는 명령어 알려줘" (`reviews/round-462-owner-answers.md:7`)
  > 소유자(462라운드, 주소 한계의 심각성): "시작 안했어. 지금 동작중인 에이전트는 없거든.\n\n1번 주소한계 둘은 심각한 오류나 메모리 릭을 야기하는건 아닌거야?" (`reviews/round-462-owner-answers.md:8`)
  > 소유자(462라운드, 캐싱 기법): "아하... 비활성 브랜치 노드는 그 자체가 제거되서 생기는 문제구나. 그럼 고급 사용자가 특정 노드의 주소를 캐싱해서 사용하면 문제가 발생할 수 있는건가?\n이전 버전에서는 비활성 노드도 살아있었기때문에 이런 기법을 종종 썼는데, 새로운 판에서는 아예 불가능해지겠군?" (`reviews/round-462-owner-answers.md:9`)
  > 소유자(462라운드, 비대칭의 지적): "그리고 node 자체가 불변하지 않는다면 괜히 일부 핸들러만 캐싱하는게 더 이상할거같다. set 은 되는데 get 은 안되는건 이상한 일이잖아.\n이거 좀 더 설명해줘. 이해가 잘 안되네" (`reviews/round-462-owner-answers.md:10`)
  > 소유자(462라운드, 중지): "일단 앞선 동작은 중지." (`reviews/round-462-owner-answers.md:11`)
  > 소유자(462라운드, 선택지 다의 선호): "나는 \"다\"가 좋은 것 같아. 실제로 나도 이렇게 쓸거같고. \n중요한건, 잘못된 노드의 참조(떼어진 노드 참조)가 남아서 메모리 릭이 되거나 읽기는 이전값인데 쓰기는 가능한 기형적인 상태가 되지 않도록 하는거야.\n다에서 약간 튜닝을 하자면, 비활성 노드에 쓰여진 값은 overlay에 기록되고, 비활성 노드에서 값을 읽어도 이 overlay에서 읽었으면 한다는거야(값이 쓰여지면 그 값이 읽혀야함) 물론 해당 값은 정착 전이니까 root 로 방출되지도, 이벤트가 발화되지도 않고, 이 비활성 노드가 활성노드로 재구성될때 그떄 값이 쓰여지겠지.\n\n이런 구조면 어때? 논리적으로 합리적이고 예측가능해?" (`reviews/round-462-owner-answers.md:12`)
  > 소유자(462라운드, 세부 셋의 답): "ㄱ: 추천 수용. 비활성 상태에선 값을 써도 반영되지 않고 이벤트 발화도 없으므로 당연히 계산도 안돎. 활성 순간에 값이 만들어지므로, 기본값을 대체한다는 관점은 합리적 \nㄴ: 동의. undefind 는 진짜 못찾은거고, 찾은 노드가 활성인지 비활성인지는 다시 확인하는게 합리적임.\nㄷ: 흠... array node 의 사용성이 활성여부에 따라 달라지는군. 비활성인 경우 array method 를 setValue 로 모사하면서(어차피 동일하게 구현해야 하니 인터페이스만 제공하는 느낌으로) 동일 사용성을 보장할 수는 없나?" (`reviews/round-462-owner-answers.md:13`)
  > 소유자(462라운드, 그림자 트리의 중단): "오케이 대충 다 이해했다. 이걸 또 보니까, 비활성 노드에 값을 쓸때, 하위 노드가 중첩 브랜치를 가지고 있다면(다중 oneOf 같이) 특정 값을 쓸때 하위노드가 어떤 노드나 값을 가져야할지 또 다 계산해야하는군.\n이 모든 작업이 find 로 비활성 노드를 찾게 하기 위한 작업인데, 얻는 것에 비해 잃는 것이 너무 많다.\n\n지금까지 논의를 다시 접고, find 가 비활성 노드를 찾지 못하도록 하면서 (단, 못찾음과 활성 아님은 구분했으면 함. null이랑 undefined 로 구분하던가 하는 식으로) 지금까지 논의에서 나온 장점들을 취할 수 있는 것만 취하는 방향으로 다시 검토해보자" (`reviews/round-462-owner-answers.md:14`)
  > 소유자(462라운드, 채택과 개발 개시): "그렇게 하라.\n아직 우리 신규 버전은 한번도 릴리즈가 나가지 않았으니, 공개표면은 없다.\n지금 수정하도록 하자.\n계획을 수용한다. 개발 개시" (`reviews/round-462-owner-answers.md:15`)
  > 소유자(462라운드, `find` 구분의 철회): "다시 에이전트 중지상태인데..?\n그리고 생각해봤는데, 비활성 노드라는게 항상 생성되어 있는게 아니니까 undefined 랑 null을 구분하면 안될거같아. 그냥 동일하게 처리하자." (`reviews/round-462-owner-answers.md:16`)
  > 소유자(462라운드, 떼어진 참조의 모서리 둘): "1번 말인데, 자기가 입력하다가 스스로를 비활성화 하는 경우에 대한거야? 너무 트리키한 상황 아닌가?\n두번째는 지금 그대로 하면 될거같다" (`reviews/round-462-owner-answers.md:17`)
  > 소유자(462라운드, 나감 시점의 값 변경 두 길 채택): "둘다 진행해줘. 내가 가끔 겪는 요구사항이야. 제안된 방법 두개면 납득 가능하고, 지금처럼 라이프사이클 오류가 발생하는것도 수용 가능해" (`reviews/round-462-owner-answers.md:18`)
  > 소유자(462라운드, B12 이름의 통일): "메소드 이름 변경은 이해했어. 일치된 이름을 쓰도록 해.\ncontrol 하위는 근데 injectTo 같은게 어차피 함수형 아니야? 함수식 문자열이랑 리터럴을 구분하는건 동의하는데 약간 미묘하네. \n\n그러니까 inactivateValue 에 비활성화때 쓸 값을 넣게 하고싶은거지? false나 0처럼? 근데 String 노드일때는 이게 식인지 리터럴이지 구분이 불가하다로 이해하면 될까?" (`reviews/round-462-owner-answers.md:19`)
  > 소유자(462라운드, B12 인터페이스 통일 채택): "좋아 inactiveValue 랑 onInactive 가 동일한 함수 인터페이스를 쓰도록 해. 그거면 난 이견 없어." (`reviews/round-462-owner-answers.md:20`)
  > 소유자(462라운드, B12 키 이름 유지): "오케이 그럼 이렇게 이후 작업 이어서 진행하도록." (`reviews/round-462-owner-answers.md:21`)
  > 소유자(462라운드, 워커 깨우기 규칙): "codex 뿐만 아니라 agy 나 cursor 도 동일할거같은데. claude 도 그럴거같고.\n롱턴작업에서 이렇게 메시지 누락으로 전달이 안되면 곤란하니까 항상 한번 더 깨우도록 기록해줘. \n\nrm -rf /Users/Vincent/Workspace/albatrion/branch-switch-b0 이건 실행했어" (`reviews/round-462-owner-answers.md:22`)
  > 소유자(463라운드, oneOf의 몫): "oneOf 쪽이 생각만큼 안줄어드는건가?" (`reviews/round-463-owner-answers.md:7`)
  > 소유자(463라운드, 설계 Ⅲ 마감과 설계 Ⅳ 착수): "좋아 설계3은 이걸로 문제가 없다면 병합. 이후 설계4로 넘어가서 oneOf를 본격적으로 공략해보자" (`reviews/round-463-owner-answers.md:8`)
  > 소유자(463라운드, 설계 Ⅳ 채택과 목표선): "작업 마무리하고 깨끗한 브랜치 환경에서 설계4를 진행하자. 설계4가 제안한 이론상 바닥을 수용한다. 그정도면 충분하다" (`reviews/round-463-owner-answers.md:9`)
  > 소유자(464라운드, 국소 바퀴의 제한된 효용): "국소바퀴가 이 문제를 해결하진 못해도 유의미하게 사용될 수는 있는것 같네" (`reviews/round-464-owner-answers.md:7`)
  > 소유자(464라운드, 국소 바퀴 폐기): "두 창이 같은 설계의 평가이면 폐기하고 다음 설계로" (`reviews/round-464-owner-answers.md:8`)
  > 소유자(464라운드, 미시 위생 별도 PR): "속도 문제는 아닌데, 이후 수정 지시를 하고 싶은 게 있어. 적어두던가, 별도 PR로 올려서 수정해줬으면 해" (`reviews/round-464-owner-answers.md:9`)
  > 소유자(464라운드, 맥락 파악과 실행 순서): "맥락을 먼저 파악하고 작업은 지금 작업 후에 해도 된다. 기능을 바꾸는 건 아닐 거라서." (`reviews/round-464-owner-answers.md:10`)
  > 소유자(464라운드, 포인터 상수 누락): "누락인 걸로 보여" (`reviews/round-464-owner-answers.md:11`)
  > 소유자(464라운드, includes 교체의 기준): "크게 차이는 안 나도 이게 속도차가 꽤 났던 걸로 기억해. 유의미하게 차이가 나지 않는다면 편의를 위해 안 써도 되지만, 누적되면(특히 호출량이 많으면) 꽤 차이가 나서." (`reviews/round-464-owner-answers.md:12`)
  > 소유자(464라운드, 직접 반복 선호): "함수형 체인보다 for-loop을 더 좋아하는 것과 같은 이치" (`reviews/round-464-owner-answers.md:13`)
  > 소유자(464라운드, 임시 컨테이너의 비용): "Set이랑 Map은 생성 비용이 꽤 비싸서, 재사용을 전제로 만드는 게 아니면 생성과 삭제를 반복하는 게 GC를 자극해. 임시로 쓰고 제거되는 경우에는 크기가 10,000을 넘지 않으면 array가 O(n)임에도 더 빠른 경우가 있었어." (`reviews/round-464-owner-answers.md:14`)
  > 소유자(464라운드, 두 항 수학 도구): "이런 common-utils의 최적화 도구들을 좀 썼으면 좋겠어." (`reviews/round-464-owner-answers.md:15`)
  > 소유자(464라운드, 배열 반복 비용): "반복문 이터레이션이 좀 느려서" (`reviews/round-464-owner-answers.md:16`)
  > 소유자(464라운드, 유틸리티 형 재사용): "`Record<string, BlueprintSchema>` 대신 `Dictionary`라는 유틸리티 타입을 쓰도록 해. `import type { Dictionary, IsNullable, Roll } from '@aileron/declare';` 여기 다양한 유틸리티 타입들을 미리 만들어둬서, 불필요한 재사용 하지 말고 이 타입을 주력으로 쓰길 바라." (`reviews/round-464-owner-answers.md:17`)
  > 소유자(464라운드, 미시 위생의 목적): "속도 문제는 아닌데" (`reviews/round-464-owner-answers.md:18`)
  > 소유자(464라운드, 갈래 가와 새 공개 객체 유지): "가로 가자. 이게 현실적이네. 비활성 브랜치 노드가 다시 진입할 때 새로 객체를 발급하는 건 다른 비효율을 줄이고 라이프사이클을 안정시키는 장치로서 꼭 필요하다고 이해했어. 그래서 이걸 다시 분석하는 건 아마 소득이 따로 없을 거야(어제 한번 도전했다 실패했어). 가로 가고, A/B 작업을 할 때 해당 수정에 의한 잠재적 문제나 회귀가 발생하지 않도록 조심하도록 해. 미시 컨디션 수정이 끝난 다음에 프로파일을 열고, 그 전에는 계획과 코드 수정만 하도록 해." (`reviews/round-464-owner-answers.md:19`)
  > 소유자(464라운드, 임시 컨테이너 접근 패턴): "값을 재활용하면서 읽기와 쓰기가 많은 경우엔 Map/Set이 유리하고, 한 번 쓰고 버리는 경우는 array를 쓰는 게 유리하다. 한 번 써도 n²이나 n³처럼 비교량이 폭증하면 또 Set이 유리하다." (`reviews/round-464-owner-answers.md:20`)
  > 소유자(464라운드, 롱턴과 에이전트 배분): "좋아. 이제 다음 작업을 진행하자. 이후 작업은 fable 인 너의 사용량을 최대한 억제하면서 codex와 다른 멀티에이전트를 적극 활용했으면 해. 작업 시작. 지금부터 롱턴 작업을 시작하니, 멈추지말고, codex 등이 멈추는걸 방치하지도 말고 쭉 진행하도록 하렴. 하트비트는 끌 수 있는 기능이 있어서 껐어. 이제 너의 폴링 cli 에 의해 동작할거야" (`reviews/round-464-owner-answers.md:21`)
  > 소유자(464라운드, 상한의 물음): "최종적인 속도 개선은 이번에도 실패인가? 전체 시도들과 결과들을 다시 이야기해다오. 그럼 결국 지금이 현실적으로 가장 빠른 속도가 되는검가?" (`reviews/round-464-owner-answers.md:22`)
  > 소유자(464라운드, 작은 절감 모으기): "작은 절감들을 끌어모아서 개선하자. 단일 개선으론 도달 불가능한게 거의 확실시되네. 특히, 앞서서 절감효과가 있었지만 기대미달이라 기각한것들을 다시 가져와서 절감효과가 있으면 적용하는 형태로 깎아나가야될거같아" (`reviews/round-464-owner-answers.md:23`)
  > 소유자(464라운드, 작은 가지의 무검토 병합 허용): "리뷰 없는 병합은 네가 만든 브랜치, 특히 작은 피처브랜치들에 대해서는 병합을 허용해. 리뷰 없는 병합 금지를 명시적으로 무력화한다." (`reviews/round-464-owner-answers.md:24`)
  > 소유자(464라운드, 외부 프로세스 유지): "그냥 좀 기다렸다 하렴. 저게 뭔지 몰라서 끄기가 좀 그렇네" (`reviews/round-464-owner-answers.md:25`)
  > 소유자(464라운드, 30초 quiet와 시작 뒤 비중단): "내가 보니까 유휴상태 작업이 서로 충돌하는거같아 30초 내 조용하면 창을 열고, 네가 점유하명 다른게 점유를 안할거같네. 나도 안쓰고 있고 머신을" (`reviews/round-464-owner-answers.md:26`)
  > 소유자(464라운드, 진행 상황의 물음): "어디까지 진행되었나? 뭘 하고있고, 뭐가 남았지? 어떤걸 얻었고?" (`reviews/round-464-owner-answers.md:27`)
  > 소유자(464라운드, 교환 수용의 물음): "폭 밖 퇴보 대 개선량이 있으면 수용해도 되지 않나? 미채택 근거가 그밖에도 있는지?" (`reviews/round-464-owner-answers.md:28`)
  > 소유자(464라운드, 창2를 보고 타협 논의): "좋아. 창2를 보고 다시 논의해보자. 명확하게 이득이라면 일부 타협해도 되지않나 싶은데." (`reviews/round-464-owner-answers.md:29`)
  > 소유자(464라운드, 창1 다섯 커밋 채택): "1번. 5커밋 채택하자. 다음 작업으로 진행해줘" (`reviews/round-464-owner-answers.md:30`)
  > 소유자(464라운드, PR 본문 자체에 표와 수정사항): "pr 본문의 문서 링크를 못여는걸? 성과표와 수정사항이 pr에 있어야 할거같아" (`reviews/round-464-owner-answers.md:31`)
  > 소유자(464라운드, 정리 뒤 다음 작업): "삭제 진행했다. 이후 작업 또 진행해봐. 얼마나 남았나?" (`reviews/round-464-owner-answers.md:32`)
  > 소유자(464라운드, 현재 상한에서 마감): "그래 이게 현재로선 상한 같네. 1로 가자. 마감 진행" (`reviews/round-464-owner-answers.md:33`)
  > 소유자(464라운드, base 재확인): "어 잠깐 마스터로 가는거 아니다. 베이스 정확히 봐라" (`reviews/round-464-owner-answers.md:34`)
  > 소유자(464라운드, 08 가지까지 스쿼시 병합과 데이터 분류): "맞다. 최종적으로 feat/schema-form-08-review-and-perf 까지 머지를 하라. pr 머지는 스쿼시머지로 하고, 기타 잉여 브랜치는 모두 정리하라.\n이때 제거되는 데이터는 임시데이터 혹은 작업데이터로 분류해야한다.\n필요한데이터라면 브랜치로 남겨두지 말도록. 이해했나?\n그래야 이전에 머지커밋으로 pr을 받은 히스토리가 사라진다" (`reviews/round-464-owner-answers.md:35`)
  > 소유자(464라운드, Ⅳ-4 결과 문서의 축약 인용 423): "창 2 를 보고 다시 논의" (`reviews/round-464-owner-answers.md:36`)
  > 소유자(464라운드, Ⅳ-4 결과 문서의 축약 인용 425): "명확한 이득이면 일부 타협" (`reviews/round-464-owner-answers.md:37`)
  > 소유자(464라운드, Ⅳ-4 결과 문서의 축약 인용 427): "1번 5커밋 채택" (`reviews/round-464-owner-answers.md:38`)
  > 소유자(465라운드, 단계 개시의 우려): "좋아. 근데 한가지가  좀 걸리는군.. 동기식 엔진으로 바꾼건 좋으나 그때문에 입력 안정성이 깨져서 블로킹 되는 문제가 발생할 수 있다. 이는 분명 손실이라, 이를 개선하는 설계와 방법이 필요하지 않을지 검토해보자." (`reviews/round-465-owner-answers.md:7`)
  > 소유자(465라운드, 동기 안정성과 입력 경험 설계): "해당 설계를 구체화해보겠어? 동기식의 안정성과 입력 경험 감소를 둘 다 해결할 수 있는 적절한 설계를 제안해봐" (`reviews/round-465-owner-answers.md:8`)
  > 소유자(465라운드, 권고의 물음): "어떤걸 권장하지?" (`reviews/round-465-owner-answers.md:9`)
  > 소유자(465라운드, 검증 중심 착수): "그래 시작하지. 너는 되도록 검증에 집중하도록" (`reviews/round-465-owner-answers.md:10`)
  > 소유자(465라운드, 진단과 D3의 선행): "제안한 방법으로 하세요. 순서를 지키는것에 얼매일 필뇨 없습미다" (`reviews/round-465-owner-answers.md:11`)
  > 소유자(465라운드, 지연 컴파일 계약 시험 변경 허용): "음 허용한다. 조건과 원리를 기반으로 판단하도록 하라" (`reviews/round-465-owner-answers.md:12`)
  > 소유자(465라운드, 같은 창 상대 비교): "흠. 네가 선점하면 안되는건가... 기존 값을 절대값비교하지 않고, 기존과 수정을 교차검증하면 오차를 줄일 수 있지 않을까? 상대값 비교를 하면 말이지. 엔탈피처럼" (`reviews/round-465-owner-answers.md:13`)
  > 소유자(465라운드, Opus 인계와 독립 검증): "이후 작업은 opus가 이어받도록. 판단에 대해서는 맡기겠지만, 스스로를 맹신하지 말도록. 이후는 롱턴 작업을 진행하도록 하라" (`reviews/round-465-owner-answers.md:14`)
  > 편집자 결정(457C-05): "【추론】 소유자가 PR 본문의 `/private/tmp/...` 경로를 지적했다(위 4행): GitHub의 독자가 열 수 없으므로 PR의 의미가 없다. 규칙: PR 본문·결과 문서·커밋 메시지는 그 자체로 읽혀야 하며 기계 로컬 경로를 인용하지 않는다. 판정이 기대는 측정 요약(장치의 `judgement.json`, 행별 요약, 품질·창 CPU 기록, 단계 장부 요약 — 표본 전체 덤프는 제외)은 `verification/branch-switch/raw/<가설>/`에 커밋하고, 독립 검토의 판정 파일은 `verification/branch-switch/reviews/pr-NNN-<가설>-antigravity.md`에 커밋해 저장소 경로로 인용한다. 전체 표본 원자료는 측정 기계에 남고 존재만 한 줄로 적는다. #478의 본문과 결과 문서를 이 규칙으로 고쳤고(원자료 요약 `raw/b2-p2/`), #474~#478의 검토 판정 파일을 저장소에 넣었다. 이미 병합된 #474~#477의 스쿼시 커밋 메시지와 결과 문서에 남은 기계 로컬 경로는 바꾸지 않고(이력 불변) 이 결정으로 대체 경로를 밝힌다. 이 규칙은 `AGENT-POLICY.md`와 모든 워커 브리프에 넣는다." (`reviews/round-457-closing.md:16`)
  > 편집자 결정(459C-05): "【추론】 창 품질 1.013 유효. 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝): switch-oneOf-80 36.7 / 245.5 / 152.0(단계 −38 %, 0.16.1의 4.14배, 1 ms 아래), discriminator-80 쌍 없음 / 438.9 / 122.6, if-80 쌍 없음 / 581.4 / 196.7(guard 0.03 µs/호출, active+160 guard 상한 308.8), nested-oneOf-20 30.2 / 340.0 / 283.7, payload-12 104.2 / 462.4 / 274.3, siblings-0 31.2 / 99.8 / 97.5, siblings-100 137.4 / 273.6 / 263.5, siblings-1000 2536.0 / 2078.7 / 2069.9, siblings-4000 7922.4 / 6763.3 / 6670.9. 관문: oneOf-80 1.5배 FAIL(1 ms는 통과), discriminator-80·if-80 FAIL(같은 선), 형제 FAIL(21.2배 대 3배; 1,000개당 선형항 약 2.0 ms는 단계 시작과 같고 0.16.1의 2.5 ms보다 작음), 다른 canonical 행 TEST-073 PASS(주판정 회귀 0, 뒤 반창 1건), Node 노드당 힙 FAIL(S 중앙 1439.1 → E 중앙 1440.3 B/노드, +0.09 %; PR마다의 규칙인 B 중앙 ≤ A 최대 1889.5로는 통과, Bun 2224.8 → 2250.9 보고), 제거 대상 단계 호출 0 PASS. 보유 상한은 K·M = 3·1(oneOf·if·discriminator·nested), 12·1(payload), reset 뒤 슬롯 호스트 0. React 전체 폼은 보고 전용. oneOf-80의 이전 창 인용 누적은 261.3(시작) → 252.4(B1) → 220.6(B2-P2) → 146.2(B4-1) → 187.1(B4-2 창, 그 창의 A는 191.1)이고 B3 재측정은 245.5 → 152.0이다. 남은 비용의 자리: 선택·계산 self(selectChildren 약 29 µs, computeNode 약 32 µs), 등록·재계산 약 12 µs, finalizeExits 약 19 µs, 조립·커밋·배달 약 30 µs, 형제 선형항 약 2.0 ms/1,000(조립·등록 추정, B2-P3가 보류한 존재 차분 재사용의 자리). 계획서의 "B3에서 관문 미달이면 수치를 소유자에게 올려 다음을 소유자가 정한다"에 따라 단계를 여기서 멈추고 보고한다: 선택지는 (A) 관문을 지금 수치로 고쳐 B5 마감, (B) 선택·계산 self와 형제 선형항을 겨냥한 설계 Ⅲ 착수, (C) 그대로 9단계로. 소유자의 자율 진행 지시(위 2행)는 "목표한 작업"을 끝까지 하라는 것이었고 목표한 작업(B0~B4-2·B3)은 모두 끝났으므로, 다음 단계의 선택은 소유자에게 돌린다." (`reviews/round-459-closing.md:16`)
  > 편집자 결정(460C-04): "【추론】 위 7행대로 두 결함을 고친 뒤 설계 Ⅱ를 이정표로 찍는다. B5는 B3와 같은 세 레인(0.16.1 / 단계 시작 `0eb03ff3b` / 단계 끝 `ad0be79ba`)과 관문으로 한 창을 돌렸다: 0.16.1 레인 품질 비 1.01 유효, 쓰기당 µs(0.16.1 / 단계 시작 / 단계 끝) oneOf-80 39.30 / 249.57 / 171.94(시작 대비 −31 %, 0.16.1의 4.37배, 1 ms 아래), discriminator-80 — / 437.04 / 115.83, if-80 — / 595.14 / 186.76, nested-oneOf-20 26.99 / 292.59 / 262.78, payload-12 106.89 / 445.30 / 285.08, siblings-0 29.75 / 99.23 / 106.73, siblings-1000 2490.83 / 2056.06 / 2076.27(형제 0의 19.45배, 1,000명당 1,633 µs), siblings-4000 8684.10 / 6733.19 / 6677.19; 단계 장부(wrapped) oneOf-80 247.73 → 172.40, payload-12 497.98 → 289.27, siblings-0 85.77 → 82.71, siblings-1000 2084.60 → 2122.29; 관문은 oneOf-80·discriminator·if(1.5배 선)와 형제(3배 상한) FAIL, 다른 행 TEST-073 PASS(회귀 0), Node 노드당 힙 중앙값 규칙 FAIL(1439.10 → 1439.35; PR 규칙으로는 통과), 제거 단계 호출 0 PASS — B3와 같은 그림이고 B6·B7은 공개 결함을 고치면서 oneOf-80을 창 사이 흔들림 안(B3 152.0, B5 171.94)에 두었다. 첫 창은 준비 도구의 444 권한 결함(EACCES)으로 중단되어 458C-03대로 환경 실패로 기록하고 새 창 한 번을 돌렸다(`verification/branch-switch/b5-results.md`, #485). 설계 Ⅲ(선택·계산 self와 형제 선형항)의 착수 여부는 소유자가 따로 정한다. 소유자 판단으로 남는 것: production 프로젝트(`test:production`)의 oneOf-20 freeze 수 불일치(117 > 111)는 단계 기준 가지 `0b9337cd9`에서도 똑같이 나는 기존 실패로 이 단계의 PR과 무관하며, worktree `branch-switch-b0`·`b6`·`b7`·`b5`는 병합이 끝나 지워도 되지만 `orca worktree rm`은 소유자 승인이 필요하다." (`reviews/round-460-closing.md:14`)
  > 편집자 결정(464C-01): "【추론】 Ⅳ-0(`verification/branch-switch/iv-0-results.md`, `plan/branch-switch/design-iv.md`의 정정)은 oneOf-80·siblings-0이 루트 호스트이고 루트 바퀴가 이미 1라운드임을 확인했다. computeNode 재귀 호출을 5라운드로 읽은 전제는 철회하며 기본 리터럴 표에는 게이트 평가 반복이 없다. 비루트 국소 정착의 유효 쓰기는 코퍼스 27/175이고 루트 행의 직접 예산은 0이다. 소유자는 국소 바퀴의 제한된 효용을 인정했다(`reviews/round-464-owner-answers.md:7`). siblings 25~40·oneOf 60~95 µs 및 환산 0.91~1.45/1.07~1.69배는 철회된 예상으로 남고 현재 목표나 통과선으로 쓰지 않는다. Ⅳ-1은 중첩, Ⅳ-2는 루트 호스트 상수로 재배열했다." (`reviews/round-464-closing.md:8`)
  > 편집자 결정(464C-02): "【추론】 국소 바퀴는 nested-oneOf −25.8%를 보였으나 창1 가중 교환비 +299 µs, 첫 쓰기 일회 비용을 포함한 창2 +4,821 µs로 손해였고 leaf-gate 두 행·단계 두 항목·Bun 힙이 실패했다. 소유자의 폐기 결정(`reviews/round-464-owner-answers.md:8`)에 따라 제품을 병합하지 않았다. Ⅳ-2는 쓰기당 Map/Set 97→37·34→19로 줄여도 표적 행이 폭 안이고 구독 쓰기가 폭 밖 퇴보했다(교환비 +2,823.9 µs). 수정 후보의 창2는 공개22행 폭 안·교환비0 뒤 환경 거절됐으며 엄격 음수가 될 수 없어 미채택으로 닫았다. 수치·원시·독립 검토는 `verification/branch-switch/iv-1-results.md`·`iv-2-results.md`에 남긴다. 작업 후보는 가지 정리 전에 본선의 압축 보존물로 옮기며 참고용 가지 자체를 영구 증거로 삼지 않는다(464C-10)." (`reviews/round-464-closing.md:10`)
  > 편집자 결정(464C-03): "【추론】 소유자는 새 공개 객체 발급이 다른 비효율을 줄이고 수명을 안정시키는 필수 장치라고 확인하며 선택지 가를 채택했다(`reviews/round-464-owner-answers.md:19`, 2026-10-29). 슬롯 모델 변경 금지는 본체 보존 갈래 A에 한해서만 완화하고 NODE-044·NODE-064·B11·B12는 유지한다. 미시 위생을 끝낸 뒤 프로파일을 열며 회귀 방지가 우선이다. A가 없애는 self ≥15 µs/왕복, B가 대신하는 self ≥15 µs/전환일 때만 착수하고 그 전에 큰 재설계를 시작하지 않는다(`plan/branch-switch/design-iv.md`의 Ⅳ-3 재정의·좁은 형태 추적)." (`reviews/round-464-closing.md:12`)
  > 편집자 결정(464C-04): "【추론】 소유자의 별도 정리 지시와 접근 패턴 규칙(`reviews/round-464-owner-answers.md:9-18`, `reviews/round-464-owner-answers.md:20`)을 따라 포인터 상수·indexOf/직접 반복·임시 컨테이너 선별·minLite/maxLite·배열 도구·Dictionary를 적용했다. 반복 조회나 무제한 중첩 비교는 Set/Map을 유지하고 작은 단일 순회만 배열로 바꿨다. 소유자 후속으로 루트 표기148곳, 단일 내부 FragmentPrefix, 도달 불가 tail Set 분기 제거, 동결 태그 검사5곳 제거와 변환 잔재를 정리했다. 창1 중단·창2 payload 경계 퇴보와 Bun +4.671 B/node의 미채택은 유지한다. 후속 런타임의 새 창은 소유자 결정으로 열지 않았으므로 원 후보 숫자를 최종 제품의 새 통과 판정으로 쓰지 않는다. timing 시험은 필드·issue를 함께4배 늘리던 잘못된 독립 변수를 원장188C-01에 맞춰 필드100 고정·issue만4배로 정정했다. 근거는 `verification/branch-switch/micro-hygiene-results.md`의 최종 정적 관문과 후속 절이며 원문이 없는 후속 승인은 원문처럼 재구성하지 않는다." (`reviews/round-464-closing.md:14`)
  > 편집자 결정(464C-05): "【추론】 세 행×20,000동작 Node V8 샘플링과 plain 교차 확인 결과 A의 제거 가능 주합은0.481 µs/oneOf왕복(0.49%, 창 척도0.76)로15 µs 미만이다. B는 바닥 차감 귀속1.842 µs/전환·창 척도7.10 µs이며 바닥을 포함하는 가장 너그러운 읽기만15.9에 걸친다. GC14.64%·기타45.96%로 비용이 흩어져 큰 단일 제거를 입증하지 못했다. 소유자가 작은 절감의 누적을 선택했으므로 A는 분석으로 닫고 B의 전체 서술자는 시작하지 않았다. 프로파일 척도와 짧은 창 척도를 직접 합치거나 self 합을 인과적 절감량으로 부르지 않는다(`verification/branch-switch/iv-3-0-results.md`, `plan/branch-switch/design-iv.md`; `reviews/round-464-owner-answers.md:22-23`)." (`reviews/round-464-closing.md:16`)
  > 편집자 결정(464C-06): "【추론】 소유자는 창2를 보고 이득과 비용을 비교한 뒤 창1의 S5수정·S1a·S1b·S6b초기형·S4 다섯 커밋을 채택했다(`reviews/round-464-owner-answers.md:28-30`, 축약 인용36-38은 해당 문서의 별도 기록). 창1의 첫 쓰기 가산 포함 교환비 −15,535.1485 µs와 폭 밖 개선5행(payload-12 −68.5205, leaf8000 −147.9590, leaf4000 −71.1250, if −23.5620, discriminator −9.6885)을 근거로 siblings4000 +42.4165 µs(폭37.209 초과5.2075, 단일 커밋 귀속 미입증)와 Bun A최대 대비+2.780044 B/node를 이 창에 한해 수용했다. S6b 좁힘도+2.668066으로 힙 실패했고 창2는22행 폭 안·교환비0이라 미채택이다. 원 규칙과 미채택 판정은 바꾸지 않고 창1 소스와 바이트 동일한 제품을 복원했다. 이 예외를 미래 PR의 일반 허용으로 넓히지 않는다(`verification/branch-switch/iv-4-results.md`)." (`reviews/round-464-closing.md:18`)
  > 편집자 결정(464C-07): "【추론】 Ⅳ-5의 통합22행은 E/L oneOf3.335·siblings0 3.614·payload1.644·nested-oneOf7.374이고 E/S는 각각0.633·0.971·0.429·0.710이다. oneOf1.5배와 형제3배는 미달이며 Node 힙은 통과, Bun은 E2256.627>S최대2224.797 B/node(+31.830, +1.4%)다. Ⅳ-4의+2.780은 바로 앞 PR의 몫이고 나머지 증가가 이미 앞 단계 결과에 나타나나 이를 한 PR의 원인으로 단정하지 않는다. 소유자의 "그래 이게 현재로선 상한 같네. 1로 가자. 마감 진행"(`reviews/round-464-owner-answers.md:33`)에 따라 대규모 개편 없이 현재 상한으로 설계Ⅳ와 분기 전환 단계를 닫는다. 통합 코어와 힙은 `verification/branch-switch/iv-5-results.md`를 재사용하며 제품 E는2eaa0e1f8 이후 불변이다. React 전체폼은 D4b의19픽스처·10예열/100표본·AB/BA 두 통과를 S/E에 보고 전용으로 수행하고 러너 회귀 플래그를 그대로 공개한다. 상세·한계는 `verification/branch-switch/closing-results.md`에 적는다." (`reviews/round-464-closing.md:20`)
  > 편집자 결정(464C-08): "【추론】 소유자는 fable 사용 억제·codex 등 적극 배분·워커 방치 금지·heartbeat 해제를 지시했고, Spotlight는 끄지 않은 채 외부 PID30% 아래30초 관측 한 번이면 즉시 시작하되 시작 후 CPU는 원시에만 기록하고 중단하지 않도록 했다. 시작 거절은 표본0으로 보존하고 재개 횟수 제한을 두지 않으며 실행 실패는 질문으로 돌린다. 작은 피처 가지 등 코디네이터가 만든 가지의 무검토 병합 금지는 해제됐으나 그 말만으로 소유자 몫인 단계 루트 병합까지 허용되지는 않는다(별도464C-09의 구체적 병합 지시는 적용). PR 본문에는 성과표와 수정 목록을 직접 넣고 링크는 절대 GitHub URL로 쓴다. 링크는 삭제될 가지 이름이 아니라 커밋 SHA로 고정한다. 저장소 상대 문서 링크만으로 본문을 대신하지 않는다(`reviews/round-464-owner-answers.md:21`, `reviews/round-464-owner-answers.md:24-26`, `reviews/round-464-owner-answers.md:31`; `plan/branch-switch/design-iv.md` 환경 대기 절)." (`reviews/round-464-closing.md:22`)
  > 편집자 결정(464C-09): "【추론】 소유자는 master가 목적지가 아님을 재확인하고 feat/schema-form-08-review-and-perf까지 PR을 스쿼시 병합하라고 구체적으로 지시했다(`reviews/round-464-owner-answers.md:34-35`). 코디네이터는 #472를 08가지에 한 커밋으로 넣고, 마감 문서 PR을 단계 가지에 반영한 뒤 분기 전환 루트 PR의 base를 08가지로 삼아 한 커밋으로 넣는다. 루트 PR은 #472가 병합된 2f9bcb8e3 위에서 만든 새 단일 커밋 가지에서 연다. 앞 단계의 원래 스택을 그대로 덧붙여 중복시키지 않도록 새08머리와 비교하여 분기 전환 범위만 남긴다. 단계 가지 둘은 보존 절차 뒤 삭제 대상이다. #445(08→1.0.0-beta)·우산초안#344의 병합과 버전 결정은 Vincent의 몫이다. 아직 실행 전인 병합·삭제는 완료로 쓰지 않는다." (`reviews/round-464-closing.md:24`)
  > 편집자 결정(464C-10): "【추론】 소유자가 잉여 가지의 데이터를 임시 데이터 또는 작업 데이터로 분류하고 필요한 자료를 가지에 남겨두지 말라고 지시했다(`reviews/round-464-owner-answers.md:35`). 원격 heads와 로컬 가지를 모두 조사하여 master·1.0.0-beta·08가지는 기준으로 남기고, 배포 설정에서 이름을 쓰는 gh-pages 등 운영 가지는 정리 대상에서 제외한다(코디네이터 답변, 2026-10-30). 미병합 실험 후보·측정 자료는 작업 데이터, 병합·대체된 작업 머리·백업은 임시 데이터로 분류한다. 문서가 계속 필요로 하는 미도달 커밋과 후보는 `architecture/_archive/branches/`의 gzip 패치나 파일 및 README에 머리SHA·기준·이유를 남기고 인용 문서에 새 주소를 보충한다. master·1.0.0-beta·08·원격 PR head들의 도달성을 함께 확인하고, 앞으로의 두 스쿼시 병합은 아직 미실행으로 표시한다. 실제 삭제는 코디네이터가 병합 뒤 수행하며 이 마감 작업은 가지를 지우지 않는다. 표와 감사 범위는 `verification/branch-switch/closing-results.md`의 가지 정리에 있다." (`reviews/round-464-closing.md:26`)
  > 상태 정리(464라운드): "최종 E/L은 oneOf-80 3.335·siblings-0 3.614·payload-12 1.644·nested-oneOf-20 7.374배이며 Node 힙은 통과, Bun은 단계 시작보다 +1.4%입니다." (`README.md:68`)
  > 상태 정리(465라운드): "입력 응답성 단계는 제품 `814d21ad4`와 단계 가지 `feat/schema-form-input-responsiveness`에서 마감했습니다." (`README.md:73`)
  > 상태 정리(465라운드): "D1 구현 여부·virtualization 기본값·IR-5 수정 수락은 모두 소유자 대기이며, 코디네이터 권고는 이번 단계 D1 미구현·기본 off 유지·IR-5 수정 유지입니다." (`README.md:74`)
  > 편집자 결정(465C-01): "【추론】 소유자의 입력 안정성 우려와 구체 설계 요청·권고 물음(`reviews/round-465-owner-answers.md:7-9`)에 대해 실제 production Chromium 기준선을 먼저 세웠다. 일반 flat handler 중앙값 L0.600/E0.450ms와 전체 키 처리 관문 통과는 동기 렌더 블로킹 가설을 뒷받침하지 않지만 ET p95 L2.900/E4.600ms까지 모든 통계가 개선됐다는 뜻은 아니다. 실제 손실은 마운트 전체 컴파일, 가상화 없는 구조 변경, 대형 폼의 검증·레이아웃·루트 reconcile로 나누며 동기 정착·루트 onChange·즉시 validate/submit은 유지한다. 근거는 `verification/input-responsiveness/ir-0-results.md`와 `verification/input-responsiveness/closing-results.md`의 영역별 표다." (`reviews/round-465-closing.md:8`)
  > 편집자 결정(465C-02): "【추론】 소유자의 순서 조정과 계약 시험 두 개 변경 허용(`reviews/round-465-owner-answers.md:11-12`)은 진단·D3와 lazy compile을 함께 검증하는 범위이지 일반 권한 부여가 아니다. 보유에서 컴파일을 제거하는 Part A로 flat/nested off wall A/L 짝 비율0.952/0.883을 얻었고 개발 guard-free None은 전체 컴파일을 건너뛴다. if 게이트의 전체 컴파일은 남는다. Part B는 컨테이너 focus/select 소실·defer-once·렌더 스냅숏·옵션 의미 문제와 array all473.1→1154.8ms 회귀 때문에 제거했다. 세 독립 보고의 요지와 최종 처리, A의 관문은 `verification/input-responsiveness/closing-results.md`와 `verification/input-responsiveness/ir-1-results.md`에 보존한다." (`reviews/round-465-closing.md:10`)
  > 편집자 결정(465C-03): "【추론】 소유자의 상대 비교 제안(`reviews/round-465-owner-answers.md:13`)에 따라 호스트·Spotlight·WindowServer를 건드리지 않고 같은 창 L/E0/A/AB를 교차했다. 정숙 IR-0 L 환산과 잠정 최대 통계를 구별하고, 관찰 성공 뒤 승인한 다섯 행만 다시 측정했다. 시작 관찰 통과를 창 전체 무부하로 읽지 않으며 IR-1 quiet의 부하27/200페이지를 공개한다. IR-2 flat19.1ms는200키 중 초과2개와 ET 관측172개의 최댓값이고 모은 관측 p95는14.4ms다. CPU 성능 상태·ET 검열을 밝히되 사전 집계와 발동 판정은 바꾸지 않는다(`verification/input-responsiveness/ir-1-results.md`, `verification/input-responsiveness/ir-2-results.md`)." (`reviews/round-465-closing.md:12`)
  > 편집자 결정(465C-04): "【추론】 `verification/input-responsiveness/production-gate-repair.md`대로 유효하고 src에 고정한 testTransformMode와 개발 전용 ids 동결로 엄격 test:production을19/21에서21/21로 복구했다. oneOf-20 distinct freeze는117→111이며 기존 상한111·시험은 유지했다. react18은 ts/tsx web 변환을 유지한다. 과거 project production의21통과는 NODE_ENV=test이므로 실제 production 통과로 소급하지 않고 옛 기록에 이 근거를 보충한다. 최종 IR-5도 엄격21/21이다." (`reviews/round-465-closing.md:14`)
  > 편집자 결정(465C-05): "【추론】 `verification/input-responsiveness/ir-2-results.md`의 비연타 E1 처리/도착 p95는 array11.7/3.0·nested13.5/6.5·flat19.1/7.0ms로 flat이16.67ms를 넘어 D1은 발동했다. 진단의 검증 실행·배달·두 번째 커밋은 p95 약4분의1이며 D1 처리 예상14.6~15.8ms의 여유는0.9~2.1ms, 도착은 약34ms로33.4ms 관문을 넘을 위험이 있다. 발동은 인과 효과나 구현 승인이 아니므로 이번 단계 미구현을 권고하고 소유자 답을 기다린다. D1 v2·G는 준비된 미구현 설계이며 mount compile 실패의 rejected→sink와 공개 플러그인 순서 계약도 미결이다(`plan/input-responsiveness/design.md`)." (`reviews/round-465-closing.md:16`)
  > 편집자 결정(465C-06): "【추론】 `verification/input-responsiveness/ir-3-results.md`에서 flat 오류 변환 포함85.084→37.667µs는−55.73%로 통과했으나 정상35.000→37.625µs는+7.50%로 사전+5% 상한을 넘었다. Step0에서 미채택하고 제품 구현·브라우저 Step2를 시작하지 않았다. 후속 typing-mix 절대 규칙 검토는 별도 사전 등록이며 이번 판정을 재측정으로 뒤집지 않는다." (`reviews/round-465-closing.md:18`)
  > 편집자 결정(465C-07): "【추론】 `verification/input-responsiveness/ir-4-results.md`는 SSR40입력이 hydration 뒤20입력·20placeholder·서버 input재사용0이 되는 결함을 핀했다. `verification/input-responsiveness/ir-5-results.md` round3은 Provider 유지·서버 스냅숏·기존 commit ref·실제 입력 슬롯의 노출 기록으로 DOM과 값을 보존한다. 일반1→1·StrictMode2→2, React18/19 내부 Suspense Probe commit1, 기존 항목당 layout effect2, 숨김 CSR/hydration 회귀를 통과했다. 최종 E5/E4 여섯 비용 비율은1.011869·0.996830·1.015909·1.012550·1.011270·0.983844로1.02이내다. 이전 round2 FAIL과 bootstrap은 다른 제품의 이력으로 남긴다. IR-5는 코디네이터 권고로 단계 가지에 들어갔으며 소유자는 루트 병합 전에 거절할 수 있다." (`reviews/round-465-closing.md:20`)
  > 편집자 결정(465C-08): "【추론】 IR-1 replace off는 L/E0/A/AB 최장55.9/61.6/62.3/64.8ms로 모두50ms를 넘고 on은 모두 검출0으로 통과한다. 그러나 채택 A flat의 eager/all은 off51.75/51.75→on31.6/174.25ms, array는201.35/201.35→59.2/473.1ms이며 reveal 전 필드는 검색·스크린 리더·자동완성에서 빠진다. IR-5가 SSR blocker를 제거해도 이 교환은 남으므로 기본 off 유지를 권고하고 소유자 답을 기다린다. 자동완성 품질을 측정한 것으로 확대하지 않는다(`verification/input-responsiveness/ir-1-results.md`, `verification/input-responsiveness/ir-5-results.md`)." (`reviews/round-465-closing.md:22`)
  > 편집자 결정(465C-09): "【추론】 검증 집중과 Opus 인계 지시(`reviews/round-465-owner-answers.md:10`, `reviews/round-465-owner-answers.md:14`)에 따라 제품 변경별 Opus 관문과 #501/#506 codex 교차 검토, 배정 전 초안 두 번의 거절·수정은 코디네이터가 보고한 운영 사실로 남긴다. 모든 최종 판정 원문을 저장소에서 확인한 것으로 쓰지 않는다. 마감 작업의 새 실행은 IR-0 510·IR-1 main520/backfill120/quiet200·파생10/4/12·IR-2 180의 원시 재현 여섯 명령과 원장·문서 감사다. 제품 끝의 순차 시험은 해당 결과 문서의 기존 증거이며 FCA 전체 FAIL/indeterminate를 새 finding0과 혼동하지 않는다(`verification/input-responsiveness/closing-results.md`)." (`reviews/round-465-closing.md:24`)
  > 편집자 결정(465C-10): "【추론】 제품 끝814d21ad4 위 마감 문서 가지는 docs/schema-form-input-responsiveness-closing이고 단계 가지는 feat/schema-form-input-responsiveness, 루트 PR base는 feat/schema-form-08-review-and-perf다. 버전과 루트 병합은 reviews 운영 원칙1대로 Vincent가 직접 한다. D1·가상화 기본값·IR-5 수락은 소유자 대기이며 array 첫 프레임·reveal loop·G·루트 reconcile·CPU 공변량·hydration 준비 자식·기존 결함 다섯·AJV typing-mix·과거 production 구분을 인계한다. 제품 차분0·기존 줄 보존·기계 경로0·새 원장 오류0을 확인하되 기존 plan-links의 분할된 오류 항목 인용1건·tokens잔여399·doc미인용66은 그대로 공개한다. 마감 PR·루트 PR은 코디네이터가 준비하며 작업대 일곱의 삭제는 소유자에게 맡긴다(`verification/input-responsiveness/closing-results.md`, `reviews/README.md`)." (`reviews/round-465-closing.md:26`)
  > 편집자 결정(465C-11): "【추론】 마감 뒤 기본 재현은 새 원장 행이 아니라 같은 파일의 과거 기계 경로 때문에 실패했다. 코디네이터가 같은 스레드에서 도구 수정을 승인하여 IR-0/1/2의 HEAD·diff 의존 경로 감사를 명시적 --audit-base=<SHA> 뒤로 옮기고, 기본 실행은 동결 원시·번들 출처·집계 재현을 유지한다. 명시적 감사는 기존 텍스트의 추가 줄과 새 파일·압축 원시 전체를 검사하며 IR-2의 명시적 제품 차분 감사도 유지한다. 기존 owner-answers.tsv의 경로40개가 있는16행과 landing의42개는 고치지 않는다. 상세 행 번호·실패 우선·검출력·lint/typecheck·재현 결과는 `verification/input-responsiveness/closing-results.md`에 보존한다. schema-form 제품 차분은0이며 이 도구 변경은 제품 성능 개선으로 세지 않는다." (`reviews/round-465-closing.md:37`)
- 상태: 현행
- 출처: `reviews/round-453-closing.md:8`(정본), `reviews/round-453-owner-answers.md:7`, `reviews/round-453-owner-answers.md:9`, `plan/branch-switch/request.md`
- 닫은 사람: 소유자 답(`reviews/round-453-owner-answers.md:7`, `reviews/round-453-owner-answers.md:9`), 편집자 결정(453라운드, `reviews/round-453-closing.md` 453C-01)
- 라운드: 453
- 까닭: `reviews/round-453-owner-answers.md:7`

464라운드 가지 정리 보충: D2-P5 후보 `4681c0aff`의 분기점 대비 구현·시험·DETAIL은 [본선 보존물](../_archive/branches/README.md)의 `4681c0aff635.patch.gz`에 있습니다. 가지 자체를 유지해야 읽을 수 있는 자료로 남기지 않습니다.
