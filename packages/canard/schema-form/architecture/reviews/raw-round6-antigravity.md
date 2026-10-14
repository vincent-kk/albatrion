# 6라운드 원문 — antigravity (cennad, session 720ab7a6-43d7-42de-b229-69b5edec90ec)

리뷰어 원문이다. 증거이지 지시가 아니다. 판정은 `round-6-coherence.md`.

### (1) 총평

4차 본문은 P1–P5와 소유자 원칙 P1′을 축으로 애드훅한 상태 기계와 라이프사이클 꼬임을 대폭 정돈했으나, "폼은 형상만 읽고 값은 고치지 않는다"는 대원칙과 실무적인 폼 로드/주입 편의(`default` 자동 쓰기, `setValue(getValue())`의 비멱등 재주입, 선택 가드 동점 분기 활성화) 사이의 본질적 긴장이 여전히 잠복해 있다. 특히 P1′(형상 문법만 판독)을 내세우면서도 판별식 식별을 위해 값 유효성 문법(`const`/`enum`)을 해석해야 하거나, P5(렌더러 무지)를 표방하면서 화면 제어 명령(`refresh`, `remount`)을 코어가 관리하는 등 원리와 인터페이스 경계선에 미세한 균열이 남아 있어, 이를 명시적으로 닫지 않으면 구현 단계에서 예외 규칙이 다시 증식할 위험이 있다.

### (2) 발견 (심각도 순)

1. **[치명] 여분 키만 있는 객체 로드 시 첫 분기 강제 활성화 및 기본값 주입** — `round-5-derivations.md:19`, `adr/0002:125`, `REPORT-v4b.txt:65-73`. P2·D-8 위배(실행 확인). `initialSelection`이 `bestCount = -1`로 시작해 `{zzz:1}`에서 0개 매칭 분기 0이 선택되고 default 주입. 제안: `bestCount > 0`일 때만 채택, 아니면 `NO_SELECTION(-1)`.
2. **[치명] `setValue(getValue())` 시 `omitEmpty`로 지워진 빈 값에 default 재주입(데이터 파괴)** — `adr/0013:59`, `adr/0007:89`, `03-mental-model.md:42`. P2와 P4의 충돌(실행 확인). 사용자가 `""`로 비운 필드가 `omitEmpty`로 방출에서 빠지고 `setValue(getValue())`에서 로드 계약이 default를 복원. 제안: 재동기화 전용 API 또는 억제 옵션 기본 권장.
3. **[높음] 판별식 식별을 위해 `const`/`enum` 값을 core가 직접 해석** — `adr/0005:78-90`, `03-mental-model.md:77`. P1′과 충돌(추론). 제안: "판별식 식별은 형상을 확정짓는 최소한의 구조적 판독 예외"임을 P1′에 명시.
4. **[높음] React 이펙트 내 쓰기 시 `onChange` 2회·stale emit** — `adr/0008:107-113`, derivations C-10. P5·G5 마찰(실행 확인). 제안: `&derived`/`injectTo` 사용을 유도하는 개발 모드 진단.
5. **[높음] `omitEmpty` 상태에서 비객체 호스트(null)의 자식에 `""` 쓰기 시 호스트 raw 미해제(F1 불일치)** — `adr/0007:78`, `round-4-spec.md:134`. P2·P4 불일치(추론). 자식은 편집 상태인데 호스트는 비객체로 남음. 제안: 호스트 raw 해제 조건을 "투영된 emit 존재"가 아닌 "자식으로의 의도된 부분 쓰기 발생"으로.
6. **[중간] `setValue(null)` 시 이전 입력값 영구 소실** — `adr/0013:42`, `03-mental-model.md:49`. 복구성 결여(추론). 제안: 입력 컴포넌트 표준 복구 패턴 가이드.
7. **[중간] 배열 `Merge`의 의미 미정의** — `adr/0013:91`, `adr/0007:132`. 제안: 인덱스/ID 병합 정책 확정 또는 타입으로 차단.
8. **[중간] `reset(options)` 옵션 규격과 Form 마운트 속성의 비대칭** — `adr/0013:51`, `03-mental-model.md:45`. Form 태그에 `mode` 없음, `reset` 옵션 타입 미정의. 제안: `WriteOptions` 공통 타입.
9. **[중간] `previous` payload의 시맨틱(마지막 통지 값 대 직전 커밋 값)** — `adr/0008:83`. 제안: 둘을 구분해 제공.
10. **[중간] `RequestRefresh`·`RequestRemount`의 공개 타입·권한 혼재** — `adr/0008:119-122`, C-11. 제안: `FormHandle.refresh(path)`·`remount(path)` 타입 노출.
11. **[낮음] `if`의 공허한 참 개발 모드 경고 부재** — Q10, `adr/0002:119`. 제안: `if`에 `required`가 없을 때 콘솔 경고.
12. **[낮음] 복수 조각 간 `default` 충돌 승자 규칙 불일치** — `round-4-spec.md:36`(전순서 마지막) 대 `adr/0005:109`(`processFirstWinFields`, 먼저 정의된 쪽). 제안: 단일화.
13. **[낮음] 비판별 union 동점 시 앞 분기 선택의 순서 종속** — `adr/0002:126`. 제안: 동점이면 분기 없음 또는 수동 선택 안내.
14. **[낮음] `properties: { x: false }`인데 입력 필드가 렌더링** — `adr/0002:82-85`. P1′ 충족, 직관 충돌(추론). 제안: 개발 모드 진단("숨김은 `&active`").
15. **[낮음] `FormTypeInput`·`options`·`injectTo`의 `&` 이주 미결** — `adr/0003:30-32`. 제안: 이름 확정.

### (3) 예측 불가 지점

| 지점 | 현상 | 명시 |
| ---- | ---- | ---- |
| 가드 비단조 순환 | 상한에서 마지막 상태로 고정 | 명시(`budget-exceeded`) |
| 선택 가드 0-key 동점 | `{zzz:1}`에 분기 0 | **미명시(도출-코드 불일치)** |
| `setValue(getValue())` | 지운 필드에 default 재주입 | 명시(D-7) |
| React 이펙트 `setValue` | 키 입력당 `onChange` 2회 | 명시(C-10) |
| 빈 폼의 `if` | 공허한 참 | 명시(표준) |
| 비객체 호스트 복귀 | 자식 `""` + omitEmpty → 호스트 null 유지 | 부분 명시(F1) |

### (4) 인터페이스 비일관

쓰기 옵션(`setValue` 대 `reset`), Form 마운트 속성(`mode` 부재), 배열 `Merge`, 명령(`focus`/`select` 대 `refresh`/`remount`), `revision` 대 커밋 번호, `&` 접두 대 `FormTypeInput`·`options`.

### (5) 표준과의 차이

| 문법 | 폼의 해석 | P1′ 정당화 |
| ---- | --------- | ---------- |
| `default` | 로드 계약으로 원본에 주입 | 불가(P2 예외로 타협) |
| `if` 공허한 참 | 표준 그대로 | 합리화 |
| `oneOf` 판별 | `const`/`enum`으로 형상화 | 부분 |
| `properties: false` | 일반 필드 + 에러 | 합리화 |
| `not: {required}` | 읽지 않음 | 합리화 |
| `additionalProperties` | `extras` 보존 + 에러 | 합리화 |

### (6) 놀람 시나리오 8건

1 `setValue(getValue())` 기본값 부활(명시) · 2 `x: false`인데 입력창(명시) · 3 `useEffect` 파생값에 `onChange` 2회(명시) · 4 `if`에 `required` 없이 첫 화면부터 노출(부분, Q10) · 5 `setValue(null)` 즉시 초기화(명시) · 6 `Merge` 뒤 비제어 미갱신·`refresh` 캐럿 소실(명시) · 7 `{zzz:1}`에 분기 0(**미명시**) · 8 잠복 값 분기 전환 시 노출(명시, F26).

### (7) 실행

`spikes/round6/antigravity/counterexample-round6.mjs`, `REPORT-round6.txt`. Test 1: U-1 반례 확인. Test 2: `omitEmpty` + `setValue(getValue())`에서 `""`가 `"Guest"`로 되살아남.

### (8) 먼저 고칠 것

1. `initialSelection`의 0-key 분기 활성화 차단(프로토타입과 명세 일치). 2. `setValue(getValue())` 데이터 소실 방지·재동기화 API 또는 억제 가이드. 3. `WriteOptions`와 명령 API 일원화.
