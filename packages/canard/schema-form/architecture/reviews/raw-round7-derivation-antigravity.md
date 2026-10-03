# 원문 — 7라운드 도출 검토 (cennad antigravity)

세션 `142866ea-753a-491c-8754-da6b518f52b2`, 2026-09-23. 실행 없음. 리뷰어의 글은 증거이지 지시가 아니다. 응답의 `file://` 링크는 `path:line` 표기로 바꿨고 그 밖의 문장은 그대로다.

---

# 라운드 7 독립 도출 검토 보고서: @canard/schema-form 재설계 (D-11 ~ D-23)

- **문맥 루트**: `ARCH=/Users/Vincent/Workspace/albatrion/packages/canard/schema-form/architecture`
- **기준 축(The Axis, 유일한 권위)**:
  - 원리 P1–P5 및 P1′ (`03-mental-model.md:5-20`) 및 도출표 (`03-mental-model.md:68-95`)
  - 수락된 결정 (`HANDOFF.md:18-28`), 소유자 확인 결정 D-7~D-10 및 도출 대기 D-1~D-6 (`HANDOFF.md:34-45`)
  - 목표 G1–G8 (`00-goals.md:15-95`) 및 채택 후보 C2·C4·C6·C7·C8 (`00-goals.md:96-116`)
- **검토 성격**: 소유자의 요청("순수한 정책 판단이 아니라면 우리의 축에서 수렴시킬 것")에 따른 13개 소유자 의제(D-11 ~ D-23)의 독립적 연역 검토. 리뷰어 텍스트는 증거로만 취급하며, ADR 4차 본문은 현행 기술 텍스트(증거)로 검토합니다.

---

## 1. 13개 의제 독립 도출 판정 (D-11 ~ D-23)

### D-11. `&derived`가 원본을 쓰는가

#### (1) 분류
**`DERIVED` (축에서 도출됨)**
축과 양립 가능한 선택지는 (a)뿐이며, (b)는 복수의 축 조항과 정면 모순됩니다.

#### (2) 도출 체인 및 기각 옵션 모순 문장
- **채택 옵션 (a)**: 작성자 선언 쓰기 — 현재 코드와 같고 P2 주체 목록에 추가되며, 사용자 직접 입력은 `readOnly` 등으로 잠김.
- **기각 옵션 (b)**: 원본 없는 투영 — emit에만 나타남.
- **도출 체인**:
  1. `00-goals.md:58` (G4)는 `"값은 한 곳에만 있다."`라고 규정합니다. 리프 노드가 `raw`를 갖지 않고 오직 `emit`만 갖게 된다면, 상태가 분열되어 단일 값 소유 원칙이 파괴됩니다.
  2. `03-mental-model.md:22`의 상태 정의는 `"raw 원본. 리프와 터미널 노드만 값을 든다."`라고 못박습니다.
  3. `03-mental-model.md:66`은 `"계산은 원본을 쓰지 않는다. 원본을 쓰는 것은 파생과 전이뿐이고, 그것은 표시로 돌아가 다시 계산된다."`라고 규정합니다.
  4. `03-mental-model.md:59`도 `"파생: &derived·injectTo를 완성된 트리에서 평가. 쓰기가 나오면 표시로. 라운드 상한"`이라 규율합니다.
  5. `00-goals.md:38` (G2)는 `"표현 층은 값을 바꿀 수는 있어도(&active, &derived) 판정에는 닿지 못한다."`라고 명시합니다.
  6. `HANDOFF.md:49`의 수락된 결론도 `"파생은 derived/injectTo/리스너로"` 일원화를 규정합니다.
- **기각 근거**: 옵션 (b)는 위 `03-mental-model.md:66`, `00-goals.md:58`, `00-goals.md:38`와 정면 모순됩니다.

#### (3) 충돌 검사
- 수락된 결정과의 충돌: 없음. P2 주체 목록(`03-mental-model.md:10`)에 `&derived` 누락은 같은 문서 자체 불일치.
- ADR 4차 텍스트 충돌: `adr/0007-settle-cycle.md:32` `"&derived(읽기 전용)"`, `adr/0013-core-does-not-rewrite-values.md:41` `"&derived는 원본을 쓰지 않는다"` — **ADR text must change**.

#### (4) 확신도: 98%. 반증 조건: 소유자가 G4·상태 정의를 개정해 "raw 없는 emit 전용 슬롯"을 신설하는 경우.

#### (5) 6라운드 권고: (a) 작성자 선언 쓰기 — 완전 일치.

---

### D-12. 전이 주입의 기준 (P6)

#### (1) 분류
**`DERIVED`** — (a) 최종 활성 집합 기준 유일 양립, (b) 정면 모순.

#### (2) 도출 체인
1. `03-mental-model.md:11` (P3) `"형상은 상태의 순수 함수다... 이력을 읽지 않는다. 계산은 원본을 읽기만 한다."`
2. `00-goals.md:65` (G5) `"같은 스키마와 같은 쓰기 순서는 타이밍과 무관하게 같은 상태를 낸다."`
3. `03-mental-model.md:10` (P2) `"core가 스스로 원본을 '고치는' 일은 없다"`.
4. 반례 E1(`spikes/round6/claude/REPORT.txt:13-16`, `raw-round6-verification.md:14`): 옵션 (b)는 가드 순회 중 잠깐 켜졌다 최종적으로 꺼진 `then`의 `default`를 원본에 커밋해 버려, 최종 형상이 `else`인데 값에는 `then`의 default가 잔존.
- **기각 근거**: 옵션 (b)는 P3 `"이력을 읽지 않는다"`, G5 `"타이밍과 무관하게 같은 상태"`와 모순.

#### (3) ADR 텍스트 충돌: `adr/0007-settle-cycle.md:33`, `round-4-spec.md:36` — **ADR text must change**.

#### (4) 확신도: 100%. 반증 조건: P3·G5를 폐기하지 않는 한 없음.

#### (5) 6라운드 권고: (a) — 완전 일치.

---

### D-13. 에지 발화의 기준점

#### (1) 분류
**`DERIVED`** — (a) 정착 시작 상태 대비 유일, (b) 배치 동치성 파괴로 모순.

#### (2) 도출 체인
1. `00-goals.md:65` (G5) `"같은 쓰기 순서는 타이밍과 무관하게 같은 상태를 낸다."`
2. `00-goals.md:86` (G7) `"배치는... '쓰기 묶음 → 정착 1회 → 통지 1회'로 강해진다."`
3. 반례 E2, E3(`spikes/round6/claude/REPORT.txt:17-19`, `raw-round6-verification.md:17, 28`): "직전 커밋" 기준이면 순차 호출과 `batch()` 호출의 최종 값이 달라짐.
- **기각 근거**: 옵션 (b)는 G5·G7과 모순.

#### (3) ADR 텍스트 충돌: `adr/0007-settle-cycle.md:79`, `adr/0013:41`, `round-4-spec.md:144` (F11) — **ADR text must change**.

#### (4) 확신도: 99%. 반증 조건: G5에서 배치를 공식 예외로 두는 경우.

#### (5) 6라운드 권고: (a) — 완전 일치.

---

### D-14. 초기 선택에서 `required`를 읽는가

#### (1) 분류
**`DERIVED`** — (a) 읽지 않음 유일, (b) P1′ 정면 모순.

#### (2) 도출 체인
1. `03-mental-model.md:15` (P1′) `"값의 유효성을 정하는 문법(required, false, not, additionalProperties, 범위·패턴 …)은 검증기의 것이고, 폼은 그 판정을 보여 줄 뿐 값을 고치지 않는다."`
2. `03-mental-model.md:75`, `HANDOFF.md:38` (D-3)도 동일 취지.
3. `adr/0002-guard-fragment-model.md:127`의 규칙 3(`required`/`dependentRequired`를 읽어 분기 가중)은 P1′ 위반(`reviews/round-6-coherence.md:75`, 묶음 #9).
4. `const`/`enum` 읽기(`adr/0005-blueprint-analysis-and-node-sharing.md:90`, `03-mental-model.md:77`)는 승인된 최소 읽기이나 `required`는 그 보호를 받지 못함.
- **기각 근거**: (b)는 P1′ 문장과 정면 모순.

#### (3) ADR 텍스트 충돌: `adr/0002-guard-fragment-model.md:127` 규칙 3 삭제 필요 — **ADR text must change**.

#### (4) 확신도: 98%. 반증 조건: 소유자가 P1′에 명시적 예외를 신설하는 경우.

#### (5) 6라운드 권고: (a) — 완전 일치.

---

### D-15. 순환 스키마의 신호

#### (1) 분류
**`POLICY`** — 비신호 은폐(b)는 축이 기각하지만, 런타임 신호(a)와 스펙 경계 규정(c) 사이는 정책 판단.

#### (2) 도출 체인
1. `00-goals.md:103` (C2, 수락) `"각종 에러들의 출력을 적당하게 제공해야 한다... 그걸 확장하자."`
2. `00-goals.md:18` (G1).
3. 반례 E8(`spikes/round6/claude/REPORT.txt:27-28`, `raw-round6-verification.md:13, 104`): 부정 없는 순환에서 로드된 값이 방출에서 빠지는데 `stable`로 끝나고 에러도 없음.
4. (b)는 신호 없이 데이터 유실을 방치해 C2 위반. (a)/(c)는 각각 런타임 신호와 스펙 경계 선언으로 코어 복잡도-비용 트레이드오프의 정책 선택.
- **기각 근거**: (b)는 C2 `"그걸 확장하자"`와 모순.

#### (3) ADR 텍스트 충돌: `adr/0013:63`, `adr/0007:57`이 E8과 충돌 — **ADR text must change**.

#### (4) 확신도: 90%. 반증 조건: 코어 비용 최소화 방침이면 (c), 무손실 원칙이면 (a).

#### (5) 6라운드 권고: (a) — 부분 일치 ((c)도 유효한 대안임을 규명).

---

### D-16. 예산 초과 시 `onChange`

#### (1) 분류
**`DERIVED`** — dev·prod 동일 디스패치 유일, dev 생략은 D-10·G5 모순.

#### (2) 도출 체인
1. `HANDOFF.md:45` (D-10 확정) `"최외곽 동기 진입당 1회, 마이크로태스크 없음"`.
2. `adr/0008-event-system.md:89` `"dev React와 prod React의 라이프사이클이 어긋나는 문제가 있었다."`
3. `00-goals.md:65` (G5).
4. 반례 E5(`spikes/round6/claude/REPORT.txt:22-23`, `raw-round6-verification.md:23`): dev에서 throw로 `onChange` 0회, prod 1회 — D-10이 없앤 어긋남 부활.
- **기각 근거**: dev 생략은 `adr/0008-event-system.md:89`, G5와 모순.

#### (3) ADR 텍스트 충돌: `adr/0007-settle-cycle.md:52` — **ADR text must change**.

#### (4) 확신도: 100%. 반증 조건: D-10 근거 자체를 소유자가 폐기하는 경우.

#### (5) 6라운드 권고: 채택 — 완전 일치.

---

### D-17. 리스너 쓰기 거부의 범위

#### (1) 분류
**`DERIVED`** — 사용자 입력·외부 쓰기 불거부, 리스너 되먹임 한정 거부만 유일 양립.

#### (2) 도출 체인
1. `adr/0013-core-does-not-rewrite-values.md:24` (결정 1) `"입력을 막지 않는다."`
2. `03-mental-model.md:10` (P2) `"원본은 호출자와 작성자만 쓴다."`
3. `adr/0007-settle-cycle.md:9`.
4. 무차별 상한 적용 시 리스너 패턴이 예산을 소모해(`raw-round6-verification.md:20`, 묶음 #8) 13번째 사용자 입력부터 조용히 무시됨(`reviews/round-6-coherence.md:120`, M1) — P2 위반.
5. (b) 미루기는 `round-4-spec.md:148` (F15) `"미루지 않는다"`와 모순. (c) 상한만 상향은 원리 위반 구조 유지.
- **기각 근거**: 사용자 입력 거부는 `adr/0013:24`, P2와 모순.

#### (3) ADR 텍스트 충돌: `adr/0008-event-system.md:62`, `round-4-spec.md:148` — **ADR text must change**.

#### (4) 확신도: 98%. 반증 조건: 소유자가 ADR 0013 대전제를 공식 폐기하는 경우.

#### (5) 6라운드 권고: (a) — 완전 일치.

---

### D-18. 옵션 이름

#### (1) 분류
**`POLICY`** — `disable...` 방향 내 세부 식별자·표기법 선택은 명명 정책.

#### (2) 도출 체인
1. `HANDOFF.md:40` (D-5 확정) `"방향 확정: 뜻은 '초기값 조작 비활성화', 이름은 disable… 형태."`
2. `03-mental-model.md:111`.
3. `injectDefaults` 3상태 안은 D-5와 어긋나 기각. 남은 후보(`disableDefaultInjection` vs `disableLoadDefaults`, `mode` vs `write`)는 인체공학 판단.
- **기각 근거**: `injectDefaults`는 `HANDOFF.md:40`과 모순.

#### (3) ADR 텍스트 충돌: `adr/0013:46` PascalCase 리터럴 정리 필요 — **ADR text must change**.

#### (4) 확신도: 100%(Policy). 반증 조건: 소유자의 최종 식별자 지정.

#### (5) 6라운드 권고: `disable...` 존중 — 완전 일치.

---

### D-19. 배열 `Merge`의 뜻

#### (1) 분류
**`POLICY`** — 축이 스스로 미결로 선언, 다수 정합 옵션 존재.

#### (2) 도출 체인
1. `03-mental-model.md:99` `"원리가 아직 답하지 않은 것: ... 배열 Merge의 뜻"`.
2. `adr/0013-core-does-not-rewrite-values.md:91` `"3.1판은 Overwrite와 같게 두고 미결로 표시했다."`
3. 인덱스 병합은 요소 재배열 시 식별자 붕괴 유발(R13, `adr/0011:89`).
- **기각 근거 없음**: 축 자체가 미결 의제로 선언.

#### (3) ADR 텍스트 충돌: `03-mental-model.md:41`, `adr/0013:55` `"Merge는 로드가 아니다"` 절대 문장이 배열 아이템 생성 경로에서 반증됨(`reviews/round-6-coherence.md:50`, #28) — **ADR text must change**.

#### (4) 확신도: 100%(Policy). 반증 조건: 소유자의 정책 확정.

#### (5) 6라운드 권고: 통째 교체 — 완전 일치.

---

### D-20. `select` 이름

#### (1) 분류
**`POLICY`** — 이름 분리 필요성은 도출되나 최종 식별자는 명명 정책.

#### (2) 도출 체인
1. `00-goals.md:115` (C3.3) `"명령 어휘(RequestFocus/RequestSelect/RequestRefresh)는 core에 남는다."`
2. `adr/0008-event-system.md:121`의 HTML 텍스트 선택 `select`와 `adr/0008-event-system.md:91`의 분기 선택 `select`가 이름 충돌.
- **기각 근거**: 이름 유지는 C3.3 보존 대상과 신규 쓰기 API 사이 모순 유발.

#### (3) ADR 텍스트 충돌: `adr/0008-event-system.md:91` 수정 필요 — **ADR text must change**.

#### (4) 확신도: 100%(Policy). 반증 조건: 소유자의 이름 확정.

#### (5) 6라운드 권고: `selectBranch` — 완전 일치.

---

### D-21. `find`의 터미널 별칭

#### (1) 분류
**`DERIVED`** — 하위 경로 `undefined` 반환 유일, 별칭은 P2·G4 모순.

#### (2) 도출 체인
1. `03-mental-model.md:10` (P2).
2. `00-goals.md:54` (G4) `"읽는 사람이 예측할 수 있어야 한다... 값은 한 곳에만 있다."`
3. `adr/0011-branch-node-composition.md:27` 터미널 노드 정의.
4. `adr/0011-branch-node-composition.md:88` (S11): 별칭 시 `setValue(42)`가 복합 객체 전체를 파괴.
- **기각 근거**: 별칭은 P2·G4와 모순.

#### (3) ADR 텍스트 충돌: `adr/0011:88` `"처방이 없다"` 확정 기술 필요 — **ADR text must change**.

#### (4) 확신도: 99%. 반증 조건: 프록시 노드 신설 등 대규모 예외 승인.

#### (5) 6라운드 권고: `undefined` — 완전 일치.

---

### D-22. 관측 채널

#### (1) 분류
**`POLICY`** — `onChange` 오염(c)·무채널(b)은 기각되나, Form 진단 표면의 형상은 인체공학 정책.

#### (2) 도출 체인
1. `00-goals.md:103` (C2).
2. `adr/0008-event-system.md:91` `"emit 참조가 바뀌지 않은 쓰기는 onChange도 검증 요청도 내지 않는다."` — M3(`raw-round6-verification.md:102`)에서 `budget-exceeded`만 발생 시 `onChange` 미호출, (c)는 신호 유실.
- **기각 근거**: (c)는 `adr/0008:91`과 모순, (b) 단독은 C2와 모순.

#### (3) ADR 텍스트 충돌: `03-mental-model.md:28` `"루트 통지로 관측"` 구체화 필요 — **ADR text must change**.

#### (4) 확신도: 92%. 반증 조건: React `<Form>` 프로퍼티 명칭 확정.

#### (5) 6라운드 권고: 단일 진단 콜백 — 완전 일치(코어 레벨 구독 병행 보충).

---

### D-23. 상태 칸의 공개 이름 (P9)

#### (1) 분류
**`POLICY`** — 1:1 대응 구조는 도출되나 식별자 부여는 명명 정책.

#### (2) 도출 체인
1. `03-mental-model.md:21-34`, `adr/0006-single-value-ownership.md:26-38`: `raw`/`local`/`emit` 3칸.
2. `00-goals.md:58` (G4) `"하나의 개념에는 하나의 장치."`
3. `enhancedValue`는 4차 본문에서 완전히 사라짐(`reviews/round-6-coherence.md:95`) — 유지는 G4 위반.
- **기각 근거**: `enhancedValue` 유지는 G4와 모순.

#### (3) ADR 텍스트 충돌: `adr/0006:48` vs `open-questions.md:25` 불일치(#33) 해소 필요 — **ADR text must change**.

#### (4) 확신도: 100%(Policy). 반증 조건: 소유자의 3개 명칭 확정.

#### (5) 6라운드 권고: `enhancedValue` 폐기 — 완전 일치.

---

## 2. 27개 단조 수정 목록의 추가 의존성 분석 (§7)

`reviews/round-6-coherence.md:192-224`에서 §7이 "D-nn 확정 뒤"로 명시한 것은 4개(라인 202→D-11, 204→D-12, 221→D-16·D-22, 223→D-19)뿐입니다. 나머지 23개 중 아래 **4개가 §7이 명시하지 않은 추가 의존성**을 가집니다:

1. `reviews/round-6-coherence.md:201` (`adr/0006:34` `settle.status` 값 집합) — **D-15·D-22 확정 뒤**: D-15에서 (a) 채택 시 신규 상태 리터럴이 유니온에 추가되어야 타입이 닫힘.
2. `reviews/round-6-coherence.md:216` (`adr/0008:91` "emit 참조 불변" 비교 기준 부재) — **D-10 시맨틱 정밀화에 종속**: §7 자신이 "참조 기준 명시" 대 "dirty 경로 값 비교"(#62) 두 대안을 병기하며, 이는 관측 시맨틱을 바꾸는 결정.
3. `reviews/round-6-coherence.md:208` (`adr/0003:30-32` `&` 이주 목록 공백) — **D-18 확정 뒤**: 비접두 키 이주 거취가 D-18의 옵션 표기법 체계와 직결.
4. `reviews/round-6-coherence.md:219` (배열 API 어휘 불일치) — **D-19 확정 뒤**: `update`가 내부적으로 `Merge`인지 `Overwrite`인지가 D-19 의미론과 직결.

## 3. 제안된 원리 P6–P9의 성격

| 원리 | 요지 | 분류 | 근거 |
|---|---|---|---|
| **P6** | 자동 쓰기도 최종 형상의 함수, 이력은 방아쇠로만 | **재진술 — 즉시 사용 가능** | P3(`03-mental-model.md:11`), G5(`00-goals.md:65`), G7(`00-goals.md:86`)의 필연적 연역. |
| **P7** | `settle.status`가 5개 예산을 통합 태그로 소유 | **신규 내용 — 소유자 결정 필요** | 축은 `'stable'\|'budget-exceeded'`(`03-mental-model.md:28`, `adr/0006:34`)만 규정. C2 정신 구현이나 인터페이스는 신설. |
| **P8** | core 공개 어휘는 렌더러 중립 의미로 정의 | **재진술 — 즉시 사용 가능** | P5(`03-mental-model.md:13`), C3(`00-goals.md:111-115`)의 능동적 재진술. |
| **P9** | 상태 칸 하나에 공개 이름 하나 | **재진술+명명 정책 혼합** | 구조는 G4(`00-goals.md:58`)의 재진술이나, 최종 3개 식별자는 정책. |

## 4. 종합 요약표

| 의제 | 최종 분류 | 양립 가능 옵션 | ADR 수정 요부 | 6라운드 일치도 |
|:---:|:---|:---:|:---|:---:|
| D-11 | DERIVED | (a) 작성자 선언 쓰기 (유일) | 필요 (0007:32, 0013:41) | 완전 일치 |
| D-12 | DERIVED | (a) 최종 활성 집합 기준 (유일) | 필요 (0007:33, R4S:36) | 완전 일치 |
| D-13 | DERIVED | (a) 정착 시작 상태 대비 (유일) | 필요 (0007:79, 0013:41) | 완전 일치 |
| D-14 | DERIVED | (a) 읽지 않음 (유일) | 필요 (0002:127 규칙3 삭제) | 완전 일치 |
| D-15 | POLICY | (a) 런타임 신호 / (c) 스펙 경계 | 필요 (0013:63, 0007:57) | 부분 일치 |
| D-16 | DERIVED | dev·prod 동일 호출 (유일) | 필요 (0007:52) | 완전 일치 |
| D-17 | DERIVED | (a) 되먹임 한정 거부 (유일) | 필요 (0008:62, R4S:148) | 완전 일치 |
| D-18 | POLICY | Option 1/2/3 | 필요 (0013:46) | 완전 일치 |
| D-19 | POLICY | 통째 교체 / 타입 차단 | 필요 (03:41, 0013:55) | 완전 일치 |
| D-20 | POLICY | selectBranch / setSelection | 필요 (0008:91) | 완전 일치 |
| D-21 | DERIVED | undefined 반환 (유일) | 필요 (0011:88) | 완전 일치 |
| D-22 | POLICY | 단일 콜백 / 분리 콜백 | 필요 (03:28, 0008:81) | 완전 일치 |
| D-23 | POLICY | Option 1/2/3 | 필요 (0006:48, Q:25) | 완전 일치 |

비고(courier): 원문 응답은 위 내용을 각 항목당 더 풍부한 인용문과 함께 한국어 존댓말 전체 서술로 제공했습니다. 위는 그 내용을 축약 없이 구조적으로 재구성한 것이며, 세부 문구가 필요하면 session_id로 원문 재조회 가능합니다.
